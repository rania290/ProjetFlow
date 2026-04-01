import { Injectable } from '@nestjs/common';

@Injectable()
export class DateService {
  formatDate(date: Date | string, format: string = 'yyyy-MM-dd'): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return format
      .replace('yyyy', year.toString())
      .replace('MM', month)
      .replace('dd', day);
  }

  formatDateTime(date: Date | string, format: string = 'yyyy-MM-dd HH:mm:ss'): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('yyyy', year.toString())
      .replace('MM', month)
      .replace('dd', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  formatFrenchDate(date: Date | string): string {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    return d.toLocaleDateString('fr-FR', options);
  }

  formatFrenchDateTime(date: Date | string): string {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return d.toLocaleString('fr-FR', options);
  }

  addDays(date: Date | string, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  addMonths(date: Date | string, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }

  addYears(date: Date | string, years: number): Date {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d;
  }

  getDaysBetween(startDate: Date | string, endDate: Date | string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getWorkingDaysBetween(startDate: Date | string, endDate: Date | string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingDays = 0;
    let currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      
      // Compter uniquement les jours de semaine (lundi-vendredi)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Dimanche, 6 = Samedi
        workingDays++;
      }
      
      currentDate = this.addDays(currentDate, 1);
    }

    return workingDays;
  }

  isWeekend(date: Date | string): boolean {
    const d = new Date(date);
    const dayOfWeek = d.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Dimanche ou Samedi
  }

  isToday(date: Date | string): boolean {
    const d = new Date(date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }

  isPast(date: Date | string): boolean {
    const d = new Date(date);
    const today = new Date();
    return d < today;
  }

  isFuture(date: Date | string): boolean {
    const d = new Date(date);
    const today = new Date();
    return d > today;
  }

  getAge(birthDate: Date | string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  getStartOfWeek(date: Date | string): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  getEndOfWeek(date: Date | string): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() + (6 - day);
    return new Date(d.setDate(diff));
  }

  getStartOfMonth(date: Date | string): Date {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  getEndOfMonth(date: Date | string): Date {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  }

  getQuarter(date: Date | string): number {
    const d = new Date(date);
    return Math.floor((d.getMonth() + 3) / 3);
  }

  getWeekNumber(date: Date | string): number {
    const d = new Date(date);
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const diff = d.getTime() - startOfYear.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24 * 7));
  }

  getTimeAgo(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "à l'instant";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `il y a ${days} jour${days > 1 ? 's' : ''}`;
    } else {
      const months = Math.floor(diffInSeconds / 2592000);
      return `il y a ${months} mois${months > 1 ? 's' : ''}`;
    }
  }
}
