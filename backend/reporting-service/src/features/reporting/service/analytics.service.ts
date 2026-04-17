import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { ReportingService } from './reporting.service';

@Injectable()
export class AnalyticsService {
    private readonly projectServiceUrl: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly reportingService: ReportingService,
    ) {
        this.projectServiceUrl = this.configService.get('PROJECTS_SERVICE_URL') || 'http://localhost:3002';
    }

    async getGlobalAnalytics() {
        try {
            // Fetch all data from project-service and local repositories
            const [projectsRes, tasksRes, invoiceStats, ticketStats] = await Promise.all([
                axios.get(`${this.projectServiceUrl}/projects`),
                axios.get(`${this.projectServiceUrl}/tasks`),
                this.reportingService.getInvoiceStatistics({}),
                this.reportingService.getTicketStatistics({}),
            ]);

            const projects = projectsRes.data;
            const tasks = tasksRes.data;

            // 1. Project Stats
            const totalBudget = projects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0);
            
            // 2. Task Stats
            const tasksByStatus = {
                TODO: tasks.filter(t => t.status === 'TODO').length,
                IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
                IN_TEST: tasks.filter(t => t.status === 'IN_TEST').length,
                DONE: tasks.filter(t => t.status === 'DONE').length,
            };

            const totalTasks = tasks.length;
            const completionRate = totalTasks > 0 ? Math.round((tasksByStatus.DONE / totalTasks) * 100) : 0;

            // 3. Resource Workload calculation
            const resourceMap = new Map<string, any>();

            // Initialize from project members
            projects.forEach(p => {
                if (p.members) {
                    p.members.forEach(m => {
                        if (!resourceMap.has(m.id)) {
                            resourceMap.set(m.id, {
                                id: m.id,
                                name: m.fullName,
                                role: m.role,
                                avatar: m.avatar,
                                tasksCount: 0,
                                assignedPoints: 0,
                                completedPoints: 0,
                                projects: new Set(),
                            });
                        }
                        resourceMap.get(m.id).projects.add(p.name);
                    });
                }
            });

            // Map tasks to resources
            tasks.forEach(task => {
                if (task.assigneeId && resourceMap.has(task.assigneeId)) {
                    const res = resourceMap.get(task.assigneeId);
                    const effort = task.storyPoints || (task.estimatedHours ? task.estimatedHours / 8 : 1);
                    
                    res.tasksCount++;
                    res.assignedPoints += effort;
                    
                    if (task.status === 'DONE') {
                        res.completedPoints += effort;
                    } else if (task.status === 'IN_TEST') {
                        res.completedPoints += effort * 0.9;
                    } else if (task.status === 'IN_PROGRESS') {
                        res.completedPoints += effort * 0.5;
                    }
                }
            });

            const resources = Array.from(resourceMap.values()).map(r => {
                const load = Math.min(100, Math.round((r.assignedPoints / 20) * 100)); // Capacity: 20 points/period
                return {
                    ...r,
                    load,
                    projects: Array.from(r.projects),
                };
            });

            return {
                summary: {
                    totalProjects: projects.length,
                    totalBudget,
                    totalTasks,
                    completionRate,
                    tasksByStatus,
                    invoices: invoiceStats,
                    tickets: ticketStats,
                },
                resources,
                projects: projects.map(p => ({
                    id: p.id,
                    name: p.name,
                    progress: p.progress || 0,
                    status: p.status,
                    budget: p.budget,
                })),
            };
        } catch (error) {
            console.error('Failed to fetch analytics data:', error.message);
            throw new Error('Analytics aggregation failed');
        }
    }
}
