import api from './api-client';

export interface Ticket {
    id: string;
    title: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_ON_CLIENT' | 'RESOLVED' | 'CLOSED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    clientId?: string;
    clientEmail?: string;
    requesterName: string;
    requesterEmail?: string;
    createdBy?: string;
    reporterEmail?: string;
    authorEmail?: string;
    projectId?: string;
    projectName?: string;
    assigneeId?: string;
    assigneeName?: string;
    createdAt: string;
    updatedAt: string;
    messages: any[];
}

export const ticketsService = {
    async getAll(filters?: any, currentUserEmail?: string): Promise<Ticket[]> {
        const response = await api.get('/client-portal/tickets', { params: filters });
        // response.data might be { tickets: [], pagination: {} }
        const tickets = response.data.tickets || response.data;
        return tickets.map((t: any) => this.mapTicket(t, currentUserEmail));
    },

    async getById(id: string, currentUserEmail?: string): Promise<Ticket> {
        const response = await api.get(`/client-portal/tickets/${id}`);
        return this.mapTicket(response.data, currentUserEmail);
    },

    async create(data: any, currentUserEmail?: string): Promise<Ticket> {
        const response = await api.post('/client-portal/tickets', data);
        return this.mapTicket(response.data, currentUserEmail);
    },

    async update(id: string, data: any): Promise<Ticket> {
        const response = await api.patch(`/client-portal/tickets/${id}`, data);
        return this.mapTicket(response.data);
    },

    async addComment(id: string, comment: string, attachments: any[] = [], currentUserEmail?: string): Promise<Ticket> {
        try {
            const response = await api.post(`/client-portal/tickets/${id}/comments`, { 
                comment: comment.trim() || " ", // Ensure at least one character for backend validation
                attachments,
                isInternal: false 
            });
            return this.mapTicket(response.data, currentUserEmail);
        } catch (error: any) {
            console.error('Add comment API error:', error.response?.data || error.message);
            throw error;
        }
    },

    mapTicket(ticket: any, currentUserEmail?: string): Ticket {
        const timelineEmails = (ticket.timeline || []).map((entry: any) => entry.user).filter(Boolean);
        const clientEmail = ticket.client?.email || ticket.project?.client?.email || ticket.requesterEmail || ticket.clientEmail ||
            (currentUserEmail && timelineEmails.includes(currentUserEmail) ? currentUserEmail : undefined);
        const projectName = ticket.project?.name || ticket.projectName;
        const projectId = ticket.project?.id || ticket.projectId;

        return {
            ...ticket,
            clientEmail,
            requesterEmail: ticket.requesterEmail || clientEmail,
            createdBy: ticket.createdBy || clientEmail,
            reporterEmail: ticket.reporterEmail || clientEmail,
            projectId,
            projectName,
            assigneeId: ticket.assignedTo || ticket.assigneeId,
            assigneeName: ticket.assigneeName,
            messages: (ticket.timeline || [])
                .filter((item: any) => item.action === 'comment' || item.action === 'created' || item.action === 'internal_comment')
                .map((item: any, index: number) => ({
                    id: `msg-${index}`,
                    authorId: item.user,
                    authorName: item.user?.split('@')[0] || 'Système',
                    content: item.description,
                    attachments: item.attachments || [],
                    createdAt: item.timestamp,
                    isClient: item.user === currentUserEmail
                }))
        };
    }
};
