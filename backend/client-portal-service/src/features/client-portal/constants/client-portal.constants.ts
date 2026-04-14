export const CLIENT_PORTAL_CONSTANTS = {
  // Status des projets
  PROJECT_STATUS: {
    PLANNED: 'PLANNED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    ON_HOLD: 'ON_HOLD',
    CANCELLED: 'CANCELLED',
  },

  // Priorités des tickets
  TICKET_PRIORITY: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
  },

  // Status des tickets
  TICKET_STATUS: {
    OPEN: 'OPEN',
    IN_PROGRESS: 'IN_PROGRESS',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED',
    REOPENED: 'REOPENED',
  },

  // Types de tickets
  TICKET_TYPE: {
    BUG: 'BUG',
    FEATURE_REQUEST: 'FEATURE_REQUEST',
    SUPPORT: 'SUPPORT',
    QUESTION: 'QUESTION',
    IMPROVEMENT: 'IMPROVEMENT',
  },

  // Status des factures
  INVOICE_STATUS: {
    DRAFT: 'DRAFT',
    SENT: 'SENT',
    PAID: 'PAID',
    OVERDUE: 'OVERDUE',
    CANCELLED: 'CANCELLED',
  },

  // Types de factures
  INVOICE_TYPE: {
    STANDARD: 'STANDARD',
    RECURRING: 'RECURRING',
    CREDIT_NOTE: 'CREDIT_NOTE',
    DEPOSIT: 'DEPOSIT',
  },

  // Messages d'erreur
  ERROR_MESSAGES: {
    CLIENT_NOT_FOUND: 'Client non trouvé',
    PROJECT_NOT_FOUND: 'Projet non trouvé',
    TICKET_NOT_FOUND: 'Ticket non trouvé',
    INVOICE_NOT_FOUND: 'Facture non trouvée',
    UNAUTHORIZED_ACCESS: 'Accès non autorisé',
    INVALID_STATUS: 'Statut invalide',
    INVALID_PRIORITY: 'Priorité invalide',
    FILE_TOO_LARGE: 'Fichier trop volumineux',
    INVALID_FILE_TYPE: 'Type de fichier invalide',
    EMAIL_ALREADY_EXISTS: 'Un client avec cet email existe déjà',
  },

  // Limites
  LIMITS: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_TICKETS_PER_CLIENT: 100,
    MAX_PROJECTS_PER_CLIENT: 50,
    MAX_INVOICES_PER_MONTH: 20,
  },

  // Templates d'email
  EMAIL_TEMPLATES: {
    TICKET_CREATED: 'ticket-created',
    TICKET_UPDATED: 'ticket-updated',
    TICKET_RESOLVED: 'ticket-resolved',
    INVOICE_SENT: 'invoice-sent',
    INVOICE_OVERDUE: 'invoice-overdue',
    PROJECT_STARTED: 'project-started',
    PROJECT_COMPLETED: 'project-completed',
  },

  // Permissions
  PERMISSIONS: {
    VIEW_PROJECTS: 'view_projects',
    EDIT_PROJECTS: 'edit_projects',
    CREATE_TICKETS: 'create_tickets',
    VIEW_TICKETS: 'view_tickets',
    EDIT_TICKETS: 'edit_tickets',
    VIEW_INVOICES: 'view_invoices',
    DOWNLOAD_INVOICES: 'download_invoices',
  },
};
