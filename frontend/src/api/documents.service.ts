import api from './api-client';

export interface DocumentInfo {
    id: string;
    name: string;
    type: string;
    size: string;
    uploadedAt: string;
    author: string;
    category: string;
    projectId?: string;
    projectName?: string;
    source: 'invoice' | 'ticket' | 'project' | 'hr';
}

export const documentsService = {
    async getAllDocuments(): Promise<DocumentInfo[]> {
        const [invoicesResponse, ticketsResponse, generalDocsResponse] = await Promise.allSettled([
            api.get('/client-portal/invoices'),
            api.get('/client-portal/tickets'),
            api.get('/client-portal/documents')
        ]);

        const allDocuments: DocumentInfo[] = [];

        // Process Invoices
        if (invoicesResponse.status === 'fulfilled') {
            const invoicesData = invoicesResponse.value.data;
            const invoices = Array.isArray(invoicesData) ? invoicesData : (invoicesData.invoices || []);

            invoices.forEach((invoice: any) => {
                if (invoice.attachments && Array.isArray(invoice.attachments)) {
                    invoice.attachments.forEach((att: any) => {
                        allDocuments.push({
                            id: `${invoice.id}-${att.name}`,
                            name: att.name,
                            type: this.getFileType(att.name),
                            size: this.formatBytes(att.size || 0),
                            uploadedAt: att.uploadedAt || invoice.createdAt,
                            author: invoice.client?.contact || 'Système',
                            category: 'Administratif',
                            projectName: invoice.projectName || 'Sans projet',
                            source: 'invoice'
                        });
                    });
                }

                if (invoice.status === 'SENT' || invoice.status === 'PAID') {
                    allDocuments.push({
                        id: invoice.id,
                        name: `Facture ${invoice.invoiceNumber}.pdf`,
                        type: 'pdf',
                        size: '---',
                        uploadedAt: invoice.sentAt || invoice.createdAt,
                        author: 'DSI VAERDIA',
                        category: 'Livrables Client',
                        projectName: invoice.projectName || 'Sans projet',
                        source: 'invoice'
                    });
                }
            });
        }

        // Process Tickets
        if (ticketsResponse.status === 'fulfilled') {
            const ticketsData = ticketsResponse.value.data;
            const tickets = Array.isArray(ticketsData) ? ticketsData : (ticketsData.tickets || []);

            tickets.forEach((ticket: any) => {
                if (ticket.attachments && Array.isArray(ticket.attachments)) {
                    ticket.attachments.forEach((att: any) => {
                        allDocuments.push({
                            id: `${ticket.id}-${att.name}`,
                            name: att.name,
                            type: this.getFileType(att.name),
                            size: this.formatBytes(att.size || 0),
                            uploadedAt: att.uploadedAt || ticket.createdAt,
                            author: ticket.requesterName || 'Client',
                            category: 'Support',
                            projectName: ticket.project?.name || 'Sans projet',
                            source: 'ticket'
                        });
                    });
                }
            });
        }

        // Process General Documents
        if (generalDocsResponse.status === 'fulfilled') {
            const docs = generalDocsResponse.value.data;
            if (Array.isArray(docs)) {
                docs.forEach((doc: any) => {
                    allDocuments.push({
                        ...doc,
                        source: 'project'
                    });
                });
            }
        }

        return allDocuments;
    },

    async uploadDocument(file: File, uploadData: { projectId?: string; projectName?: string; category?: string }): Promise<DocumentInfo> {
        const formData = new FormData();
        formData.append('file', file);
        if (uploadData.projectId) formData.append('projectId', uploadData.projectId);
        if (uploadData.projectName) formData.append('projectName', uploadData.projectName);
        if (uploadData.category) formData.append('category', uploadData.category);

        const response = await api.post('/client-portal/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    async downloadDocument(id: string, filename: string): Promise<void> {
        // Find if it's an invoice PDF or a regular file
        if (id.length > 36) { // Aggregated ID from invoice/ticket
            // For now, handle basic file download if we have a direct URL
            // but usually we want to call the download endpoint
        }

        const response = await api.get(`/client-portal/documents/${id}/download`, {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    async deleteDocument(id: string): Promise<void> {
        await api.delete(`/client-portal/documents/${id}`);
    },

    getFileType(filename: string): string {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return 'image';
        if (ext === 'pdf') return 'pdf';
        if (['zip', 'rar', '7z'].includes(ext || '')) return 'zip';
        if (['ts', 'tsx', 'js', 'jsx', 'py', 'java', 'html', 'css', 'md'].includes(ext || '')) return 'code';
        return 'file';
    },

    formatBytes(bytes: number, decimals = 2): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
};
