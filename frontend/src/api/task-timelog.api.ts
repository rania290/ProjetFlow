import api from './api-client';

export interface TaskTimelog {
  id: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime: string | null;
  durationMinutes: number;
  note: string | null;
  createdAt: string;
}

export interface TaskTimelogSummary {
  totalMinutes: number;
  sessions: TaskTimelog[];
}

export const taskTimelogApi = {
  async start(dto: {
    taskId: string;
    taskTitle: string;
    projectId: string;
    userId: string;
    userName: string;
  }): Promise<TaskTimelog> {
    const response = await api.post<TaskTimelog>('/task-timelogs/start', dto);
    return response.data;
  },

  async stop(dto: { timelogId: string; note?: string }): Promise<TaskTimelog> {
    const response = await api.post<TaskTimelog>('/task-timelogs/stop', dto);
    return response.data;
  },

  async getActive(userId: string): Promise<TaskTimelog | null> {
    const response = await api.get<TaskTimelog | null>(
      `/task-timelogs/active/${userId}`,
    );
    return response.data;
  },

  async getByTask(taskId: string): Promise<TaskTimelog[]> {
    const response = await api.get<TaskTimelog[]>(
      `/task-timelogs/task/${taskId}`,
    );
    return response.data;
  },

  async getSummaryByTask(taskId: string): Promise<TaskTimelogSummary> {
    const response = await api.get<TaskTimelogSummary>(
      `/task-timelogs/task/${taskId}/summary`,
    );
    return response.data;
  },

  async getByUser(userId: string): Promise<TaskTimelog[]> {
    const response = await api.get<TaskTimelog[]>(
      `/task-timelogs/user/${userId}`,
    );
    return response.data;
  },

  async getByProject(projectId: string): Promise<TaskTimelog[]> {
    const response = await api.get<TaskTimelog[]>(
      `/task-timelogs/project/${projectId}`,
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/task-timelogs/${id}`);
  },
};
