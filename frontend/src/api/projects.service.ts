import api from './api-client';

export interface ProjectDashboard {
    projectId: string;
    name: string;
    status: string;
    budget: number;
    totalPlannedCost: number;
    totalActualCost: number;
    membersCount: number;
}

export const projectsService = {
    async getAll(): Promise<any[]> {
        const response = await api.get('/projects');
        return response.data;
    },

    async create(data: any): Promise<any> {
        const response = await api.post('/projects', data);
        return response.data;
    },

    async update(id: string, data: any): Promise<any> {
        const response = await api.patch(`/projects/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/projects/${id}`);
    },

    async deleteAll(): Promise<void> {
        await api.delete('/projects');
    },

    async getDashboardForCurrentManager(): Promise<ProjectDashboard[]> {
        const response = await api.get<ProjectDashboard[]>('/projects/dashboard/me');
        return response.data;
    },
};

