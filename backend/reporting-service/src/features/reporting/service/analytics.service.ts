import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { ReportingService } from './reporting.service';

@Injectable()
export class AnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);
    private readonly projectServiceUrl: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly reportingService: ReportingService,
    ) {
        // Use PROJECTS_SERVICE_URL from env (defaults to 127.0.0.1:3002)
        const rawUrl = this.configService.get<string>('PROJECTS_SERVICE_URL') || 'http://127.0.0.1:3002';
        // Normalize: replace 'localhost' with '127.0.0.1' for reliability on Windows
        this.projectServiceUrl = rawUrl.replace('localhost', '127.0.0.1');
        this.logger.log(`Project Service URL: ${this.projectServiceUrl}`);
    }

    async getGlobalAnalytics(userId?: string, role?: string, authHeader?: string) {
        this.logger.log(`Fetching global analytics from ${this.projectServiceUrl} for user: ${userId}`);

        const headers: Record<string, string> = {};
        if (userId) headers['x-user-id'] = userId;
        if (role) headers['x-user-role'] = role;
        if (authHeader) headers['authorization'] = authHeader;

        const authServiceUrl = this.configService.get<string>('USERS_SERVICE_URL') || 'http://127.0.0.1:3001';
        const normalizedAuthUrl = authServiceUrl.replace('localhost', '127.0.0.1');

        // Fetch projects securely (service will filter them based on role and userId automatically)
        const [projects, allTasks, assignments, invoiceStats, ticketStats, allUsers] = await Promise.all([
            this.safeGet<any[]>(`${this.projectServiceUrl}/projects`, [], headers),
            this.safeGet<any[]>(`${this.projectServiceUrl}/tasks`, [], headers),
            this.safeGet<any[]>(`${this.projectServiceUrl}/role-assignments/all`, [], headers),
            this.reportingService.getInvoiceStatistics({}).catch(() => ({
                totalInvoices: 0, totalAmount: 0, paidAmount: 0,
                overdueAmount: 0, paidInvoices: 0, overdueInvoices: 0, byProject: {},
            })),
            this.reportingService.getTicketStatistics({}).catch(() => ({
                totalTickets: 0, openTickets: 0, inProgressTickets: 0,
                resolvedTickets: 0, closedTickets: 0,
            })),
            this.safeGet<any[]>(`${normalizedAuthUrl}/users`, [], headers),
        ]);

        this.logger.log(`Backend Data: ${projects.length} projects, ${allTasks.length} brute tasks, ${assignments.length} assignments, ${allUsers.length} users.`);

        const usersMap = new Map<string, any>();
        allUsers.forEach((u: any) => {
            const uid = String(u.id).trim().toLowerCase();
            usersMap.set(uid, u);
        });

        const hasRealUsers = allUsers.length > 0;

        // 1. Build Project ID Set for secure filtering
        const projectIds = new Set(projects.map((p: any) => String(p.id || p.projectId || p._id)));
        
        // 2. Filter tasks (Include all if admin or if project is in the user's visible projects)
        const tasks = allTasks.filter((t: any) => {
            const pid = String(t.projectId || t.project_id || t.project?.id || '');
            if (!pid) return true; // Debug: keep orphan tasks
            return projectIds.has(pid) || role === 'ADMIN' || !userId;
        });

        // 3. Stats Calculation (Summary)
        const totalBudget = projects.reduce((acc: number, p: any) => acc + (Number(p.budget) || 0), 0);
        const tasksByStatus = {
            TODO: tasks.filter((t: any) => String(t.status).toUpperCase() === 'TODO').length,
            IN_PROGRESS: tasks.filter((t: any) => ['IN_PROGRESS', 'PROGRESS'].includes(String(t.status).toUpperCase())).length,
            IN_TEST: tasks.filter((t: any) => ['IN_TEST', 'TESTING', 'REVIEW'].includes(String(t.status).toUpperCase())).length,
            DONE: tasks.filter((t: any) => ['DONE', 'COMPLETED', 'FINISHED'].includes(String(t.status).toUpperCase())).length,
        };

        const totalTasks = tasks.length;
        const completionRate = totalTasks > 0 
            ? Math.round(((tasksByStatus.DONE + tasksByStatus.IN_TEST * 0.9 + tasksByStatus.IN_PROGRESS * 0.5) / totalTasks) * 100) 
            : 0;

        const now = new Date();
        const delayedTasksCount = tasks.filter((t: any) =>
            String(t.status).toUpperCase() !== 'DONE' && t.dueDate && new Date(t.dueDate) < now
        ).length;

        const criticalTasksCount = tasks.filter((t: any) =>
            String(t.status).toUpperCase() !== 'DONE' && (t.priority === 'HIGH' || t.priority === 'CRITICAL')
        ).length;

        // 4. Resource Workload
        const resourceMap = new Map<string, any>();
        const STANDARD_CAPACITY = 20;

        // Initialize from assignments (to have names/roles)
        (assignments as any[]).forEach((a: any) => {
            const rawUid = a.user?.id || a.userId;
            if (!rawUid) return;
            const uid = String(rawUid).trim().toLowerCase();
            const realUser = usersMap.get(uid);

            if (hasRealUsers && !realUser) return; // filter out if we have user list and user isn't in it

            if (!resourceMap.has(uid)) {
                resourceMap.set(uid, {
                    id: uid,
                    name: realUser?.fullName || a.user?.fullName || a.userFullName || 'Utilisateur',
                    role: realUser?.role || a.role || 'Membre',
                    avatar: realUser?.profilePhoto || a.user?.profilePhoto || null,
                    tasksCount: 0,
                    assignedPoints: 0,
                    completedPoints: 0,
                    projects: new Set<string>(),
                });
            }
            if (a.project?.name) resourceMap.get(uid).projects.add(a.project.name);
            else if (a.projectName) resourceMap.get(uid).projects.add(a.projectName);
        });

        // Map tasks to resources
        tasks.forEach((task: any) => {
            const assigneeId = task.assigneeId || task.assignee_id || task.userId || task.assignee?.id || task.memberId;
            if (!assigneeId) return;
            const aid = String(assigneeId).trim().toLowerCase();
            const realUser = usersMap.get(aid);

            if (hasRealUsers && !realUser) return; // filter out if we have user list and user isn't in it

            if (!resourceMap.has(aid)) {
                resourceMap.set(aid, {
                    id: aid,
                    name: realUser?.fullName || task.assigneeName || task.userName || task.assignee?.fullName || `Ressource (${aid.substring(0, 5)})`,
                    role: realUser?.role || 'Assigné (Auto)',
                    avatar: realUser?.profilePhoto || null,
                    tasksCount: 0,
                    assignedPoints: 0,
                    completedPoints: 0,
                    projects: new Set<string>(),
                });
            }

            const res = resourceMap.get(aid);
            const effort = Number(task.storyPoints || task.points || 0) || (task.estimatedHours ? Number(task.estimatedHours) / 8 : 1);
            
            res.tasksCount++;
            res.assignedPoints += effort;

            const status = String(task.status || '').toUpperCase();
            if (['DONE', 'COMPLETED', 'FINISHED'].includes(status)) res.completedPoints += effort;
            else if (['IN_TEST', 'TESTING', 'REVIEW'].includes(status)) res.completedPoints += effort * 0.9;
            else if (['IN_PROGRESS', 'PROGRESS'].includes(status)) res.completedPoints += effort * 0.5;
        });

        const resources = Array.from(resourceMap.values())
            .filter(r => r.tasksCount > 0 || r.projects.size > 0)
            .map((r: any) => ({
                ...r,
                load: Math.min(150, Math.round((r.assignedPoints / STANDARD_CAPACITY) * 100)),
                projects: Array.from(r.projects as Set<string>),
            }));

        // 5. Per-project analytics
        const projectsAnalytics = projects.map((p: any) => {
            const projectTasks = tasks.filter((t: any) => String(t.projectId || t.project_id) === String(p.id));
            const doneCount = projectTasks.filter((t: any) => ['DONE', 'COMPLETED'].includes(String(t.status).toUpperCase())).length;
            
            const completedEffort = projectTasks.reduce((acc, t) => {
                const s = String(t.status).toUpperCase();
                if (['DONE', 'COMPLETED'].includes(s)) return acc + 1;
                if (['IN_TEST'].includes(s)) return acc + 0.9;
                if (['IN_PROGRESS'].includes(s)) return acc + 0.5;
                return acc;
            }, 0);

            const progress = projectTasks.length > 0
                ? Math.round((completedEffort / projectTasks.length) * 100)
                : (Number(p.progress) || 0);

            return {
                id: p.id,
                name: p.name,
                type: p.type || 'OTHER',
                status: p.status,
                budget: Number(p.budget) || 0,
                progress,
                totalTasks: projectTasks.length,
                doneTasks: doneCount,
                overdueTasks: projectTasks.filter(t => String(t.status).toUpperCase() !== 'DONE' && t.dueDate && new Date(t.dueDate) < now).length,
                spentAmount: (invoiceStats as any).byProject?.[p.id] || 0,
            };
        });

        return {
            summary: {
                totalProjects: projects.length,
                totalBudget,
                totalTasks,
                completionRate,
                delayedTasksCount,
                criticalTasksCount,
                tasksByStatus,
                invoices: invoiceStats,
                tickets: ticketStats,
            },
            resources,
            projects: projectsAnalytics,
        };
    }

    private async safeGet<T>(url: string, fallback: T, headers?: Record<string, string>): Promise<T> {
        try {
            const response = await axios.get(url, { headers: headers || {}, timeout: 8000 });
            return response.data as T;
        } catch (err: any) {
            this.logger.warn(`[safeGet] Failed to fetch ${url}: ${err.message}`);
            return fallback;
        }
    }
}
