import apiClient from './api-client';

export interface ChatMessage {
    id: string;
    projectId: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    mentions?: string[];
    likes?: string[];
    isPinned?: boolean;
    isDeleted?: boolean;
    isEdited?: boolean;
    replyTo?: {
        id: string;
        authorName: string;
        content: string;
    };
    createdAt: string;
}

export interface ActivityLog {
    id: string;
    projectId: string;
    action: string;
    entityType: string;
    entityId: string;
    userId: string;
    userName: string;
    metadata?: any;
    createdAt: string;
}

export const communicationApi = {
    // Chat
    getProjectMessages: async (projectId: string): Promise<ChatMessage[]> => {
        const response = await apiClient.get(`/communication/chat/${projectId}`);
        return response.data;
    },

    sendMessage: async (data: any): Promise<ChatMessage> => {
        const response = await apiClient.post('/communication/chat', data);
        return response.data;
    },

    // Audit Logs
    getProjectActivity: async (projectId: string): Promise<ActivityLog[]> => {
        const response = await apiClient.get(`/communication/activity/${projectId}`);
        return response.data;
    },

    logActivity: async (data: any): Promise<ActivityLog> => {
        const response = await apiClient.post('/communication/activity', data);
        return response.data;
    }
};
