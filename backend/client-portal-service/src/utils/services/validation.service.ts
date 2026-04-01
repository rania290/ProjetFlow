import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ValidationService {
  constructor(private readonly configService: ConfigService) {}

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const minLength = 8;
    const maxLength = 128;

    if (password.length < minLength) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }

    if (password.length > maxLength) {
      errors.push('Le mot de passe ne doit pas dépasser 128 caractères');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }

    if (!/\d/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"|,.<>\/?]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }

    // Vérifier les mots de passe courants
    const commonPasswords = [
      'password', '123456', 'qwerty', 'abc123', 'password123',
      'admin', 'letmein', 'welcome', 'monkey', 'dragon'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Le mot de passe ne doit pas être un mot de passe courant');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateName(name: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!name || name.trim().length === 0) {
      return { isValid: false, error: 'Le nom est requis' };
    }

    if (name.length < 2) {
      return { isValid: false, error: 'Le nom doit contenir au moins 2 caractères' };
    }

    if (name.length > 100) {
      return { isValid: false, error: 'Le nom ne doit pas dépasser 100 caractères' };
    }

    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return { isValid: false, error: 'Le nom ne doit contenir que des lettres, des espaces et des tirets' };
    }

    return { isValid: true };
  }

  validateCompanyName(companyName: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!companyName || companyName.trim().length === 0) {
      return { isValid: false, error: 'Le nom de l\'entreprise est requis' };
    }

    if (companyName.length < 2) {
      return { isValid: false, error: 'Le nom de l\'entreprise doit contenir au moins 2 caractères' };
    }

    if (companyName.length > 100) {
      return { isValid: false, error: 'Le nom de l\'entreprise ne doit pas dépasser 100 caractères' };
    }

    if (!/^[a-zA-Z0-9\s&\-',.]+$/.test(companyName)) {
      return { isValid: false, error: 'Le nom de l\'entreprise contient des caractères invalides' };
    }

    return { isValid: true };
  }

  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  validatePostalCode(postalCode: string): boolean {
    const postalCodeRegex = /^\d{5}$/;
    return postalCodeRegex.test(postalCode);
  }

  validateVatNumber(vatNumber: string): boolean {
    // Format TVA français : FR XX 123456789
    const vatRegex = /^(FR|IT|DE|ES|GB|BE)[0-9A-Z]{2,13}$/;
    return vatRegex.test(vatNumber);
  }

  validateBudget(budget: number): boolean {
    return budget > 0 && budget <= 999999999.99;
  }

  validatePercentage(percentage: number): boolean {
    return percentage >= 0 && percentage <= 100;
  }

  sanitizeHtml(html: string): string {
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }

  validateFileSize(size: number, maxSize?: number): boolean {
    const maxFileSize = maxSize || parseInt(this.configService.get('MAX_FILE_SIZE') || '10485760'); // 10MB par défaut
    return size <= maxFileSize;
  }

  validateFileType(filename: string, allowedTypes?: string[]): boolean {
    const fileExtension = filename.split('.').pop()?.toLowerCase();
    const types = allowedTypes || (this.configService.get('ALLOWED_FILE_TYPES') || 'jpg,jpeg,png,pdf,doc,docx,xls,xlsx').split(',');
    return types.includes(fileExtension || '');
  }

  validateProjectStatus(status: string): boolean {
    const validStatuses = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'];
    return validStatuses.includes(status);
  }

  validateTicketPriority(priority: string): boolean {
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    return validPriorities.includes(priority);
  }

  validateTicketStatus(status: string): boolean {
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED'];
    return validStatuses.includes(status);
  }

  validateTicketType(type: string): boolean {
    const validTypes = ['BUG', 'FEATURE_REQUEST', 'SUPPORT', 'QUESTION', 'IMPROVEMENT'];
    return validTypes.includes(type);
  }

  validateInvoiceStatus(status: string): boolean {
    const validStatuses = ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'];
    return validStatuses.includes(status);
  }

  validateInvoiceType(type: string): boolean {
    const validTypes = ['STANDARD', 'RECURRING', 'CREDIT_NOTE', 'DEPOSIT'];
    return validTypes.includes(type);
  }

  validateRole(role: string): boolean {
    const validRoles = ['ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'OBSERVER'];
    return validRoles.includes(role);
  }
}
