import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');

@Injectable()
export class PdfService {
  generateInvoicePdf(invoice: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50,
          },
        });

        // Ajouter le contenu du PDF
        this.addInvoiceContent(doc, invoice);

        // Finaliser le PDF
        const chunks: any[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          resolve(pdfBuffer);
        });

        doc.on('error', (error) => {
          reject(error);
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  generateTicketPdf(ticket: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50,
          },
        });

        // Ajouter le contenu du PDF
        this.addTicketContent(doc, ticket);

        // Finaliser le PDF
        const chunks: any[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          resolve(pdfBuffer);
        });

        doc.on('error', (error) => {
          reject(error);
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private addInvoiceContent(doc: any, invoice: any) {
    // En-tête
    doc.fontSize(20).text('FACTURE', 50, 50, { align: 'center' });
    doc.fontSize(12).text(`Facture #${invoice.invoiceNumber}`, 50, 80, { align: 'center' });
    doc.fontSize(10).text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}`, 50, 100, { align: 'center' });

    // Informations client
    doc.fontSize(14).text('Facturé à:', 50, 140);
    doc.fontSize(12).text(invoice.billingAddress?.company || invoice.client?.companyName, 50, 160);
    doc.fontSize(12).text(invoice.billingAddress?.address || '', 50, 175);
    doc.fontSize(12).text(`${invoice.billingAddress?.postalCode || ''} ${invoice.billingAddress?.city || ''}`, 50, 190);

    // Tableau des articles
    let yPosition = 250;
    doc.fontSize(14).text('Détails de la facture:', 50, yPosition);
    yPosition += 30;

    // En-têtes du tableau
    const headers = ['Description', 'Quantité', 'Prix unitaire', 'Total'];
    const headerX = [50, 300, 400, 500];
    const headerWidths = [250, 100, 100, 100];

    doc.fontSize(10);
    headers.forEach((header, index) => {
      doc.text(header, headerX[index], yPosition);
    });

    yPosition += 20;

    // Ligne de séparation
    doc.moveTo(50, yPosition).lineTo(600, yPosition).stroke();
    yPosition += 10;

    // Articles
    invoice.items.forEach((item: any) => {
      doc.text(item.description, 50, yPosition);
      doc.text(item.quantity.toString(), 300, yPosition);
      doc.text(`${item.unitPrice} €`, 400, yPosition);
      doc.text(`${item.total} €`, 500, yPosition);
      yPosition += 20;
    });

    // Ligne de séparation
    doc.moveTo(50, yPosition).lineTo(600, yPosition).stroke();
    yPosition += 20;

    // Totaux
    doc.fontSize(12).text(`Sous-total: ${invoice.subtotal} €`, 400, yPosition);
    yPosition += 20;
    doc.fontSize(12).text(`TVA (${invoice.taxRate}%): ${invoice.taxAmount} €`, 400, yPosition);
    yPosition += 20;
    doc.fontSize(14).font('Helvetica-Bold').text(`Total: ${invoice.total} €`, 400, yPosition);

    // Conditions de paiement
    if (invoice.terms) {
      yPosition += 40;
      doc.fontSize(12).text('Conditions de paiement:', 50, yPosition);
      yPosition += 20;
      doc.fontSize(10).text(invoice.terms, 50, yPosition);
    }
  }

  private addTicketContent(doc: any, ticket: any) {
    // En-tête
    doc.fontSize(20).text('TICKET', 50, 50, { align: 'center' });
    doc.fontSize(12).text(`Ticket #${ticket.id}`, 50, 80, { align: 'center' });
    doc.fontSize(10).text(`Créé le: ${new Date(ticket.createdAt).toLocaleDateString('fr-FR')}`, 50, 100, { align: 'center' });

    // Informations du ticket
    let yPosition = 140;
    doc.fontSize(14).text('Informations du ticket:', 50, yPosition);
    yPosition += 30;

    doc.fontSize(12).text(`Titre: ${ticket.title}`, 50, yPosition);
    yPosition += 20;
    doc.fontSize(12).text(`Type: ${ticket.type}`, 50, yPosition);
    yPosition += 20;
    doc.fontSize(12).text(`Priorité: ${ticket.priority}`, 50, yPosition);
    yPosition += 20;
    doc.fontSize(12).text(`Statut: ${ticket.status}`, 50, yPosition);
    yPosition += 30;

    // Description
    doc.fontSize(14).text('Description:', 50, yPosition);
    yPosition += 20;

    // Texte de la description avec retour à la ligne automatique
    const descriptionLines = doc.font('Helvetica').fontSize(10).widthOfString(ticket.description, { width: 500 });
    const lines = this.wrapText(ticket.description, 500);

    lines.forEach((line: string) => {
      doc.text(line, 50, yPosition);
      yPosition += 15;
    });

    // Timeline si disponible
    if (ticket.timeline && ticket.timeline.length > 0) {
      yPosition += 30;
      doc.fontSize(14).text('Timeline:', 50, yPosition);
      yPosition += 20;

      ticket.timeline.forEach((entry: any) => {
        doc.fontSize(10).text(`${new Date(entry.timestamp).toLocaleString('fr-FR')} - ${entry.user}:`, 50, yPosition);
        yPosition += 15;
        doc.fontSize(10).text(`${entry.action}: ${entry.description}`, 70, yPosition);
        yPosition += 25;
      });
    }

    // Résolution si disponible
    if (ticket.resolution) {
      yPosition += 30;
      doc.fontSize(14).text('Résolution:', 50, yPosition);
      yPosition += 20;

      const resolutionLines = this.wrapText(ticket.resolution, 500);
      resolutionLines.forEach((line: string) => {
        doc.text(line, 50, yPosition);
        yPosition += 15;
      });
    }
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = 500; // Approximation de la largeur du texte
      if (testWidth > maxWidth) {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }
}
