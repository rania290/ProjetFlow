import api from '../../../../api/api-client';

export type TrackingStatus = 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';

export interface TimeTrackingSession {
  id: string;
  employeeId: string;
  employeeName: string;
  projectId: string | null;
  projectName: string | null;
  date: string;
  startTime: string;
  endTime: string | null;
  status: TrackingStatus;
  pauseStartTime: string | null;
  totalPauseMinutes: number;
  durationMinutes: number;
  activity: string;
  isAnomaly: boolean;
  anomalyReason: string | null;
  createdAt: string;
}

export const timeTrackingApi = {
  async start(dto: { employeeId: string; employeeName: string; activity?: string; projectId?: string; projectName?: string }): Promise<TimeTrackingSession> {
    const response = await api.post<TimeTrackingSession>('/hr/time-tracking/start', dto);
    return response.data;
  },

  async pause(sessionId: string): Promise<TimeTrackingSession> {
    const response = await api.post<TimeTrackingSession>('/hr/time-tracking/pause', { sessionId });
    return response.data;
  },

  async resume(sessionId: string): Promise<TimeTrackingSession> {
    const response = await api.post<TimeTrackingSession>('/hr/time-tracking/resume', { sessionId });
    return response.data;
  },

  async stop(sessionId: string): Promise<TimeTrackingSession> {
    const response = await api.post<TimeTrackingSession>('/hr/time-tracking/stop', { sessionId });
    return response.data;
  },

  async getActive(employeeId: string): Promise<TimeTrackingSession | null> {
    const response = await api.get<TimeTrackingSession | null>(`/hr/time-tracking/active/${employeeId}`);
    return response.data;
  },

  async getHistory(employeeId: string): Promise<TimeTrackingSession[]> {
    const response = await api.get<TimeTrackingSession[]>(`/hr/time-tracking/history/${employeeId}`);
    return response.data;
  },

  async getTeam(): Promise<TimeTrackingSession[]> {
    const response = await api.get<TimeTrackingSession[]>('/hr/time-tracking/team');
    return response.data;
  },

  async getTeamActive(): Promise<TimeTrackingSession[]> {
    const response = await api.get<TimeTrackingSession[]>('/hr/time-tracking/team/active');
    return response.data;
  },

  async manualCorrection(dto: { sessionId: string; startTime?: string; endTime?: string; totalPauseMinutes?: number; isAnomaly?: boolean }): Promise<TimeTrackingSession> {
    const response = await api.post<TimeTrackingSession>('/hr/time-tracking/manual-correction', dto);
    return response.data;
  },

  async exportCsv(): Promise<Blob> {
    const response = await api.get('/hr/time-tracking/export/csv', {
      responseType: 'blob'
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/hr/time-tracking/${id}`);
  }
};
