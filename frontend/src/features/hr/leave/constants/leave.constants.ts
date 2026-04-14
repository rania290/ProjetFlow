import type { LeaveType, LeaveStatus } from '../types/leave.types'

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  ANNUAL: 'Congé payé',
  UNPAID: 'Congé sans solde',
  SICK: 'Maladie',
  MATERNITY: 'Maternité',
  PATERNITY: 'Paternité',
  PERSONAL: 'Personnel / Autre',
}

export const LEAVE_TYPE_COLORS: Record<LeaveType, string> = {
  ANNUAL: 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm',
  UNPAID: 'bg-slate-50 text-slate-700 border border-slate-200 shadow-sm',
  SICK: 'bg-orange-50 text-orange-700 border border-orange-200 shadow-sm',
  MATERNITY: 'bg-pink-50 text-pink-700 border border-pink-200 shadow-sm',
  PATERNITY: 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm',
  PERSONAL: 'bg-violet-50 text-violet-700 border border-violet-200 shadow-sm',
}

export const STATUS_CONFIG: Record<LeaveStatus, { label: string; badgeClass: string; dotClass: string }> = {
  PENDING: {
    label: 'En attente',
    badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm',
    dotClass: 'bg-amber-500 animate-pulse',
  },
  APPROVED: {
    label: 'Approuvé',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm',
    dotClass: 'bg-emerald-500',
  },
  REJECTED: {
    label: 'Rejeté',
    badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm',
    dotClass: 'bg-rose-500',
  },
}
