import api from '../../../../api/api-client';
import type { LeaveRequest, CreateLeaveDto, ReviewLeaveDto } from '../types/leave.types';

export const leaveApi = {
  async getLeaves(): Promise<LeaveRequest[]> {
    const response = await api.get<LeaveRequest[]>('/hr/leaves');
    return response.data;
  },

  async getMyLeaves(employeeId: string): Promise<LeaveRequest[]> {
    const response = await api.get<LeaveRequest[]>(`/hr/leaves/employee/${employeeId}`);
    return response.data;
  },

  async getPendingLeaves(validatorId?: string): Promise<LeaveRequest[]> {
    const response = await api.get<LeaveRequest[]>('/hr/leaves/pending', {
      params: { validatorId }
    });
    return response.data;
  },

  async createLeave(dto: CreateLeaveDto): Promise<LeaveRequest> {
    const response = await api.post<LeaveRequest>('/hr/leaves', dto);
    return response.data;
  },

  async reviewLeave(id: string, dto: ReviewLeaveDto): Promise<LeaveRequest> {
    const response = await api.patch<LeaveRequest>(`/hr/leaves/${id}/review`, dto);
    return response.data;
  },

  async deleteLeave(id: string): Promise<void> {
    await api.delete(`/hr/leaves/${id}`);
  },
};
