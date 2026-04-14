export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type LeaveType = 'ANNUAL' | 'SICK' | 'PERSONAL' | 'MATERNITY' | 'PATERNITY' | 'UNPAID'
export type LeaveRole = 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN'

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  type: LeaveType
  startDate: string
  endDate: string
  durationDays: number
  motif: string
  status: LeaveStatus
  managerId: string | null
  currentValidatorId: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  rejectionReason: string | null
  calendarSynced: boolean
  createdAt: string
}

export interface CreateLeaveDto {
  employeeId: string
  employeeName: string
  type: LeaveType
  startDate: string
  endDate: string
  motif?: string
  managerId?: string
}

export interface ReviewLeaveDto {
  status: 'APPROVED' | 'REJECTED'
  reviewedBy: string
  rejectionReason?: string
}
