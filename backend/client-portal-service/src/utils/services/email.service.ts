import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  async sendWelcomeEmail(client: any) {
    const transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });

    const mailOptions = {
      from: this.configService.get('EMAIL_FROM'),
      to: client.email,
      subject: 'Bienvenue sur ProjetFlow',
      html: this.generateWelcomeEmailTemplate(client),
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email de bienvenue envoyé à:', client.email);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
      throw error;
    }
  }

  async sendInvoiceEmail(invoice: any, clientEmail: string) {
    const transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });

    const mailOptions = {
      from: this.configService.get('EMAIL_FROM'),
      to: clientEmail,
      subject: `Facture ${invoice.invoiceNumber}`,
      html: this.generateInvoiceEmailTemplate(invoice),
      attachments: invoice.pdfUrl ? [
        {
          filename: `facture-${invoice.invoiceNumber}.pdf`,
          path: invoice.pdfUrl,
        },
      ] : [],
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Facture envoyée à:', clientEmail);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la facture:', error);
      throw error;
    }
  }

  async sendTicketNotification(ticket: any, action: string) {
    const transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });

    const mailOptions = {
      from: this.configService.get('EMAIL_FROM'),
      to: ticket.client.email,
      subject: `Ticket #${ticket.id} - ${action}`,
      html: this.generateTicketEmailTemplate(ticket, action),
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Notification de ticket envoyée pour: ${ticket.id}`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification de ticket:', error);
      throw error;
    }
  }

  async sendProjectNotification(project: any, action: string) {
    const transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });

    const mailOptions = {
      from: this.configService.get('EMAIL_FROM'),
      to: project.client?.email || 'client@example.com',
      subject: `Projet #${project.name} - ${action}`,
      html: this.generateProjectEmailTemplate(project, action),
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Notification de projet envoyée pour: ${project.name}`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification de projet:', error);
      throw error;
    }
  }

  private generateWelcomeEmailTemplate(client: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Bienvenue sur ProjetFlow!</h1>
          <p style="margin: 20px 0; font-size: 18px;">Bonjour ${client.contactPerson || client.companyName},</p>
          <p style="margin: 20px 0; font-size: 16px;">Nous sommes ravis de vous accueillir parmi nos clients.</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <h2 style="color: #333; margin-top: 0;">Vos informations</h2>
          <div style="margin: 20px 0;">
            <p><strong>Email:</strong> ${client.email}</p>
            <p><strong>Entreprise:</strong> ${client.companyName}</p>
            ${client.phone ? `<p><strong>Téléphone:</strong> ${client.phone}</p>` : ''}
            ${client.address ? `<p><strong>Adresse:</strong> ${client.address}</p>` : ''}
          </div>
          
          <div style="background: #e9ecef; padding: 20px; border-radius: 5px; margin-top: 20px;">
            <h3 style="color: #495057; margin-top: 0;">Prochaines étapes</h3>
            <ol style="color: #6c757d; line-height: 1.6;">
              <li>Connectez-vous à votre portail client</li>
              <li>Explorez vos projets et tickets</li>
              <li>Contactez-nous pour toute question</li>
            </ol>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px;">
          <p>Cordialement,<br>L'équipe ProjetFlow</p>
        </div>
      </div>
    `;
  }

  private generateInvoiceEmailTemplate(invoice: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #dc3545; color: white; padding: 20px; border-radius: 10px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Facture ${invoice.invoiceNumber}</h1>
          <p style="margin: 10px 0; opacity: 0.9;">Date: ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <h3 style="color: #333; margin-top: 0;">Facturé à:</h3>
              <p style="color: #6c757d; margin: 5px 0;">${invoice.billingAddress?.company || invoice.client?.companyName}</p>
            </div>
            <div style="text-align: right;">
              <h3 style="color: #333; margin-top: 0;">Total dû:</h3>
              <p style="font-size: 24px; color: #dc3545; font-weight: bold;">${invoice.total} €</p>
            </div>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #17a2b8;">
            <h4 style="color: #333; margin-top: 0;">Détails de la facture</h4>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <thead>
                <tr style="background: #f1f3f4;">
                  <th style="padding: 12px; text-align: left; color: white;">Description</th>
                  <th style="padding: 12px; text-align: right; color: white;">Quantité</th>
                  <th style="padding: 12px; text-align: right; color: white;">Prix unitaire</th>
                  <th style="padding: 12px; text-align: right; color: white;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map((item: any) => `
                  <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 12px;">${item.description}</td>
                    <td style="padding: 12px; text-align: right;">${item.quantity}</td>
                    <td style="padding: 12px; text-align: right;">${item.unitPrice} €</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold;">${item.total} €</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div style="margin-top: 20px; text-align: right;">
              <p><strong>Sous-total:</strong> ${invoice.subtotal} €</p>
              <p><strong>TVA (${invoice.taxRate}%):</strong> ${invoice.taxAmount} €</p>
              <p style="font-size: 18px; color: #dc3545;"><strong>Total:</strong> ${invoice.total} €</p>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px;">
          <p>Merci de votre confiance!<br>L'équipe ProjetFlow</p>
        </div>
      </div>
    `;
  }

  private generateProjectEmailTemplate(project: any, action: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Projet Mis à Jour!</h1>
          <p style="margin: 20px 0; font-size: 18px;">Bonjour,</p>
          <p style="margin: 20px 0; font-size: 16px;">Votre projet "${project.name}" a été ${action}.</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <h3 style="color: #333; margin-top: 0;">Détails du projet</h3>
          <div style="margin: 20px 0;">
            <p><strong>Nom:</strong> ${project.name}</p>
            <p><strong>Type:</strong> ${project.type}</p>
            <p><strong>Statut:</strong> ${project.status}</p>
            ${project.description ? `<p><strong>Description:</strong> ${project.description}</p>` : ''}
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px;">
          <p>Cordialement,<br>L'équipe ProjetFlow</p>
        </div>
      </div>
    `;
  }

  private generateTicketEmailTemplate(ticket: any, action: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #17a2b8; color: white; padding: 20px; border-radius: 10px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Ticket #${ticket.id}</h1>
          <p style="margin: 10px 0; opacity: 0.9;">${action}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <h3 style="color: #333; margin-top: 0;">Détails du ticket</h3>
          <div style="margin: 20px 0;">
            <p><strong>Titre:</strong> ${ticket.title}</p>
            <p><strong>Type:</strong> ${ticket.type}</p>
            <p><strong>Priorité:</strong> ${ticket.priority}</p>
            <p><strong>Statut:</strong> ${ticket.status}</p>
            <p><strong>Description:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #17a2b8;">
              ${ticket.description}
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px;">
          <p>Cordialement,<br>L'équipe ProjetFlow</p>
        </div>
      </div>
    `;
  }
}
