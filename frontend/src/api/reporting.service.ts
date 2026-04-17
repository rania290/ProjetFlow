import api from './api-client';

export interface AnalyticsSummary {
    totalProjects: number;
    totalBudget: number;
    totalTasks: number;
    completionRate: number;
    tasksByStatus: {
        TODO: number;
        IN_PROGRESS: number;
        IN_TEST: number;
        DONE: number;
    };
}

export interface ResourceAnalytics {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    tasksCount: number;
    assignedPoints: number;
    completedPoints: number;
    load: number;
    projects: string[];
}

export interface ProjectAnalytics {
    id: string;
    name: string;
    progress: number;
    status: string;
    budget: number;
}

export interface GlobalAnalytics {
    summary: AnalyticsSummary;
    resources: ResourceAnalytics[];
    projects: ProjectAnalytics[];
}

export const reportingService = {
    async getGlobalAnalytics(): Promise<GlobalAnalytics> {
        const response = await api.get('/reporting/analytics/global');
        return response.data;
    },

    async getInvoices(): Promise<any[]> {
        const response = await api.get('/reporting/reports/statistics/invoices');
        return response.data;
    },

    async getTicketsStats(): Promise<any> {
        const response = await api.get('/reporting/reports/statistics/tickets');
        return response.data;
    }
};
