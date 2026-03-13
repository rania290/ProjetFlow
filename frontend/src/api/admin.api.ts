import type { User } from '../types/auth.types';
import api from './api-client';

// Note: the Axios instance in api-client already appends `/api` to the base URL,
// so we don't need to manually prefix paths here.
export const adminApi = {
    // Users Management
    getAllUsers: async (): Promise<User[]> => {
        const response = await api.get(`/users`);
        return response.data;
    },

    getUserById: async (id: string): Promise<User> => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    createUser: async (data: Partial<User> & { password?: string }): Promise<User> => {
        const response = await api.post(`/users`, data);
        return response.data;
    },

    updateUser: async (id: string, data: Partial<User> & { password?: string }): Promise<User> => {
        const response = await api.patch(`/users/${id}`, data);
        return response.data;
    },

    deleteUser: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },

    // System Operations - Désactivés pour éviter les erreurs 404
    getSettings: async () => {
        // Données mock pour éviter les erreurs API
        return {
            siteName: 'VAERDIA ProjectFlow',
            maintenance: false,
            version: '1.0.0',
            maxUsers: 100,
            currentUsers: 4
        };
    },

    updateSettings: async (newSettings: any) => {
        // Mock update – in a real implementation this would POST/PATCH to the server
        console.log('Updating settings on server:', newSettings);
        // merge and return updated settings for demo purposes
        return { ...newSettings };
    },

    getLogs: async () => {
        // Données mock pour éviter les erreurs API
        return [
            { id: 1, level: 'INFO', message: 'System started', timestamp: new Date().toISOString() },
            { id: 2, level: 'INFO', message: 'User logged in', timestamp: new Date().toISOString() },
            { id: 3, level: 'WARNING', message: 'High memory usage', timestamp: new Date().toISOString() }
        ];
    },

    exportData: async () => {
        const response = await api.post(`/system/export`, {});
        return response.data;
    },
};
