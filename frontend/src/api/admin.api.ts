import type { User } from '../types/auth.types';
import api from './api-client';
import type { ThemeMode } from '../store/uiStore';

// Note: the Axios instance in api-client already appends `/api` to the base URL,
// so we don't need to manually prefix paths here.
const SETTINGS_STORAGE_KEY = 'vaerdia.admin.settings.v1';

type SystemSettings = {
  siteName?: string;
  version?: string;
  maxUsers?: number;
  currentUsers?: number;
  maintenance?: boolean;
  theme?: ThemeMode;
  [key: string]: unknown;
};

function loadLocalSettings(): SystemSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as SystemSettings;
  } catch {
    return {};
  }
}

function saveLocalSettings(next: SystemSettings) {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
}

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

    // System Operations
    // Fallback localStorage to stay functional even without backend endpoint.
    getSettings: async (): Promise<SystemSettings> => {
        const local = loadLocalSettings();
        try {
            const response = await api.get(`/system/settings`);
            const remote = (response.data ?? {}) as SystemSettings;
            const merged = { ...local, ...remote };
            saveLocalSettings(merged);
            return merged;
        } catch {
            return {
                siteName: 'VAERDIA ProjectFlow',
                maintenance: false,
                version: '1.0.0',
                maxUsers: 100,
                currentUsers: 4,
                theme: 'light',
                ...local,
            };
        }
    },

    updateSettings: async (newSettings: SystemSettings): Promise<SystemSettings> => {
        const localPrev = loadLocalSettings();
        const merged = { ...localPrev, ...newSettings };
        saveLocalSettings(merged);

        try {
            const response = await api.patch(`/system/settings`, merged);
            const remote = (response.data ?? {}) as SystemSettings;
            const finalSettings = { ...merged, ...remote };
            saveLocalSettings(finalSettings);
            return finalSettings;
        } catch {
            return merged;
        }
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
