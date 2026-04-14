import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendEmail(to: string, subject: string, content: string): Promise<void> {
    // Implementation would use a real email service like SendGrid, Nodemailer, etc.
    console.log(`Sending email to ${to}: ${subject}`);
    // Mock implementation
    return Promise.resolve();
  }

  async sendWelcomeEmail(email: string, clientName: string): Promise<void> {
    const subject = 'Bienvenue sur notre plateforme';
    const content = `Bonjour ${clientName},\n\nBienvenue sur notre plateforme de gestion de projet.\n\nCordialement,\nL'équipe`;
    await this.sendEmail(email, subject, content);
  }

  async sendProjectUpdateEmail(email: string, projectName: string, update: string): Promise<void> {
    const subject = `Mise à jour du projet: ${projectName}`;
    const content = `Bonjour,\n\nUne mise à jour a été effectuée sur le projet ${projectName}:\n\n${update}\n\nCordialement,\nL'équipe`;
    await this.sendEmail(email, subject, content);
  }

  async sendInvoiceEmail(email: string, invoiceNumber: string, amount: number): Promise<void> {
    const subject = `Nouvelle facture: ${invoiceNumber}`;
    const content = `Bonjour,\n\nUne nouvelle facture (${invoiceNumber}) d'un montant de ${amount} € a été émise.\n\nCordialement,\nL'équipe`;
    await this.sendEmail(email, subject, content);
  }

  async sendProjectNotification(project: any, action: string): Promise<void> {
    const subject = `Notification de projet: ${action}`;
    const content = `Bonjour,\n\nUne action "${action}" a été effectuée sur le projet ${project.name}.\n\nCordialement,\nL'équipe`;
    await this.sendEmail(project.client?.email || 'admin@example.com', subject, content);
  }

  async sendTicketNotification(ticket: any, action: string): Promise<void> {
    const subject = `Notification de ticket: ${action}`;
    const content = `Bonjour,\n\nUne action "${action}" a été effectuée sur le ticket ${ticket.title}.\n\nCordialement,\nL'équipe`;
    await this.sendEmail(ticket.client?.email || 'admin@example.com', subject, content);
  }
}
