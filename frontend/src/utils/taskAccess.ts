/** Roles that can see every task in "My tasks" (not only assigned ones). */
export function canViewAllTasks(role?: string | null): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export function filterTasksForCurrentUser<T extends { assigneeId?: string }>(
  tasks: T[],
  userId?: string | null,
  role?: string | null,
): T[] {
  if (canViewAllTasks(role)) return tasks;
  if (!userId) return [];
  return tasks.filter(
    (t) => t.assigneeId != null && String(t.assigneeId) === String(userId),
  );
}
