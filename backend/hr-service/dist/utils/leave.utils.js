"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateWorkingDays = calculateWorkingDays;
exports.sendLeaveRequestNotification = sendLeaveRequestNotification;
exports.sendReviewNotification = sendReviewNotification;
function calculateWorkingDays(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    if (endDate < startDate)
        return 0;
    let count = 0;
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
        const day = cursor.getDay();
        const isWeekend = day === 0 || day === 6;
        if (!isWeekend)
            count++;
        cursor.setDate(cursor.getDate() + 1);
    }
    return count;
}
function sendLeaveRequestNotification(leave) {
    console.log(`📧 Notification envoyée : demande de congé soumise par ${leave.employeeName}`);
}
function sendReviewNotification(leave) {
    console.log(`📧 Notification envoyée : demande ${leave.status} pour ${leave.employeeName}`);
}
//# sourceMappingURL=leave.utils.js.map