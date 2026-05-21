import api from './api-client';
import axios from 'axios';

// Instance directe pour tester le contournement du Gateway
const auraDirectApi = axios.create({
  baseURL: 'http://127.0.0.1:3007',
  headers: { 'Content-Type': 'application/json' }
});

export interface AuraChatRequest {
  message: string;
  project_id: string;
  conversation_id?: string;
}

export interface AuraChatResponse {
  response: string;
  conversation_id: string;
}

export interface AuraAlert {
  id: string;
  project_id: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  target_id: string;
  is_read: boolean;
  created_at: string;
}

export const auraService = {
  chat: async (data: AuraChatRequest): Promise<AuraChatResponse> => {
    const response = await auraDirectApi.post<AuraChatResponse>('/aura/chat', { ...data, user_id: 'system' });
    return response.data;
  },

  getConversations: async (projectId: string): Promise<any[]> => {
    const response = await auraDirectApi.get<any[]>(`/aura/conversations/${projectId}`);
    return response.data;
  },

  getConversationMessages: async (conversationId: string): Promise<any[]> => {
    const response = await auraDirectApi.get<any[]>(`/aura/conversations/${conversationId}/messages`);
    return response.data;
  },

  deleteConversation: async (conversationId: string): Promise<void> => {
    await auraDirectApi.delete(`/aura/conversations/${conversationId}`);
  },

  getAlerts: async (projectId: string): Promise<AuraAlert[]> => {
    const response = await auraDirectApi.get<AuraAlert[]>(`/aura/alerts/${projectId}`);
    return response.data;
  },

  getAnalysis: async (projectId: string): Promise<any> => {
    const response = await auraDirectApi.get<any>(`/aura/analysis/${projectId}`);
    return response.data;
  },

  getReport: async (projectId: string): Promise<any> => {
    const response = await auraDirectApi.get<any>(`/aura/report/${projectId}`);
    return response.data;
  },

  getReportsList: async (projectId: string): Promise<any[]> => {
    const response = await auraDirectApi.get<any[]>(`/aura/reports/${projectId}`);
    return response.data;
  },

  getReportDetail: async (reportId: string): Promise<any> => {
    const response = await auraDirectApi.get<any>(`/aura/reports/detail/${reportId}`);
    return response.data;
  },

  getInsights: async (projectId: string): Promise<string[]> => {
    const response = await auraDirectApi.get<string[]>(`/aura/insights/${projectId}`);
    return response.data;
  },

  dismissAlert: async (alertId: string): Promise<void> => {
    await auraDirectApi.post(`/aura/alerts/dismiss/${alertId}`);
  },

  suggestTasks: async (title: string, description: string): Promise<string[]> => {
    const response = await auraDirectApi.post<{ tasks: string[] }>('/aura/suggest-tasks', { title, description });
    return response.data.tasks;
  },

  recommendAssignee: async (projectId: string, title: string, description: string): Promise<{
    recommended_id: string;
    recommended_name: string;
    justification: string;
    error?: string;
  }> => {
    const response = await auraDirectApi.post<any>('/aura/recommend-assignee', { project_id: projectId, title, description });
    return response.data;
  }
};
