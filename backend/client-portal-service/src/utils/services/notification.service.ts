import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationService {
  constructor(private readonly configService: ConfigService) {}

  async notifyTeam(event: string, data: any) {
    const webhookUrl = this.configService.get('NOTIFICATION_WEBHOOK_URL');
    
    if (!webhookUrl) {
      console.log(`Notification team: ${event}`, data);
      return;
    }

    const payload = {
      event,
      data,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error('Erreur lors de l\'envoi de la notification team:', response.statusText);
      } else {
        console.log('Notification team envoyée avec succès:', event);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification team:', error);
    }
  }

  async sendEmailNotification(to: string, subject: string, message: string, data?: any) {
    const webhookUrl = this.configService.get('NOTIFICATION_WEBHOOK_URL');
    
    if (!webhookUrl) {
      console.log(`Email notification: ${subject} - ${to}`);
      return;
    }

    const payload = {
      type: 'email',
      to,
      subject,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error('Erreur lors de l\'envoi de la notification email:', response.statusText);
      } else {
        console.log('Notification email envoyée avec succès:', subject);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification email:', error);
    }
  }

  async sendSmsNotification(to: string, message: string, data?: any) {
    const webhookUrl = this.configService.get('NOTIFICATION_WEBHOOK_URL');
    
    if (!webhookUrl) {
      console.log(`SMS notification: ${to} - ${message}`);
      return;
    }

    const payload = {
      type: 'sms',
      to,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error('Erreur lors de l\'envoi de la notification SMS:', response.statusText);
      } else {
        console.log('Notification SMS envoyée avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification SMS:', error);
    }
  }

  async sendPushNotification(to: string, title: string, message: string, data?: any) {
    const webhookUrl = this.configService.get('NOTIFICATION_WEBHOOK_URL');
    
    if (!webhookUrl) {
      console.log(`Push notification: ${title} - ${to}`);
      return;
    }

    const payload = {
      type: 'push',
      to,
      title,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error('Erreur lors de l\'envoi de la notification push:', response.statusText);
      } else {
        console.log('Notification push envoyée avec succès:', title);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification push:', error);
    }
  }
}
