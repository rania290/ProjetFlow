export enum ProjectStatus {
  PLANNED = 'PLANNED',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DELIVERED = 'DELIVERED',
  SUSPENDED = 'SUSPENDED',
}

export enum ProjectViewMode {
  BOARD = 'BOARD',
  LIST = 'LIST',
  CALENDAR = 'CALENDAR',
  GANTT = 'GANTT',
}

export const PROJECT_STATUSES = Object.values(ProjectStatus);
export const PROJECT_VIEW_MODES = Object.values(ProjectViewMode);

