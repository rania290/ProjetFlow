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

    // Tasks CRUD
    async getAllTasks(projectId?: string): Promise<any[]> {
        const url = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
        const response = await api.get(url);
        return response.data;
    },

    async createTask(data: any): Promise<any> {
        const response = await api.post('/tasks', data);
        return response.data;
    },

    async updateTask(id: string, data: any): Promise<any> {
        const response = await api.patch(`/tasks/${id}`, data);
        return response.data;
    },

    async deleteTask(id: string): Promise<void> {
        await api.delete(`/tasks/${id}`);
    },

    // Sprints CRUD
    async createSprint(data: any): Promise<any> {
        const response = await api.post('/sprints', data);
        return response.data;
    },

    async updateSprint(id: string, data: any): Promise<any> {
        const response = await api.patch(`/sprints/${id}`, data);
        return response.data;
    },

    async getAllSprints(): Promise<any[]> {
        const response = await api.get('/sprints');
        return response.data;
    },
};


