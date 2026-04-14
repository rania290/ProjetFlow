import { LeaveStatus } from "../features/hr/constants/leave.constants";
import type { LeaveRequest } from "../features/hr/model/leave-request.model";

export function calculateWorkingDays(start: Date, end: Date): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  if (endDate < startDate) return 0;

  let count = 0;
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    const day = cursor.getDay(); // 0 Sun - 6 Sat
    const isWeekend = day === 0 || day === 6;
    if (!isWeekend) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

export function sendLeaveRequestNotification(leave: Pick<LeaveRequest, "employeeName">): void {
  // Simulated email notification
  // eslint-disable-next-line no-console
  console.log(`📧 Notification envoyée : demande de congé soumise par ${leave.employeeName}`);
}

export function sendReviewNotification(leave: Pick<LeaveRequest, "employeeName" | "status">): void {
  // Simulated email notification
  // eslint-disable-next-line no-console
  console.log(`📧 Notification envoyée : demande ${leave.status as LeaveStatus} pour ${leave.employeeName}`);
}

