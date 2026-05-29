/** Rôles autorisés à créer / gérer des tickets support (portail client). */
const TICKET_CREATOR_ROLES = new Set([
  'CLIENT',
  'PROJECT_MANAGER',
  'MANAGER',
  'ADMIN',
  'SUPER_ADMIN',
  'ROOT',
  'RH',
  'HR_ADMIN',
  'DEVELOPER',
  'DESIGNER',
  'TESTER',
  'TEAM_MEMBER',
]);

export function canCreateSupportTicket(role?: string | null): boolean {
  if (!role) return false;
  return TICKET_CREATOR_ROLES.has(role.toUpperCase());
}

export function isClientRole(role?: string | null): boolean {
  return (role || '').toUpperCase() === 'CLIENT';
}
