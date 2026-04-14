import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Calendar, Clock, AlertCircle,
  CheckCircle2, Trash2, User, Info,
  Palmtree, Activity, Baby, Wallet
} from 'lucide-react';
import type { LeaveRequest, LeaveType } from '../types/leave.types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { LEAVE_TYPE_LABELS } from '../constants/leave.constants';

interface LeaveDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  leave: LeaveRequest | null;
  onCancel?: (id: string) => void;
  isDeleting?: boolean;
}

const TYPE_ICONS: Record<LeaveType, React.ReactNode> = {
  ANNUAL: <Palmtree className="w-5 h-5" />,
  SICK: <Activity className="w-5 h-5" />,
  PERSONAL: <User className="w-5 h-5" />,
  MATERNITY: <Baby className="w-5 h-5" />,
  PATERNITY: <Baby className="w-5 h-5" />,
  UNPAID: <Wallet className="w-5 h-5" />,
};

const STATUS_CONFIG = {
  PENDING: { label: 'En attente', color: 'text-amber-700', bg: 'bg-amber-50', icon: <Clock className="w-4 h-4 animate-pulse" /> },
  APPROVED: { label: 'Approuvé', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: <CheckCircle2 className="w-4 h-4" /> },
  REJECTED: { label: 'Rejeté', color: 'text-rose-700', bg: 'bg-rose-50', icon: <Trash2 className="w-4 h-4" /> },
};

export const LeaveDetailsModal: React.FC<LeaveDetailsModalProps> = ({
  isOpen,
  onClose,
  leave,
  onCancel,
  isDeleting
}) => {
  if (!leave) return null;

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-md border-0 bg-white shadow-[0_0_100px_rgba(0,0,0,0.15)] p-0 overflow-hidden rounded-[2.5rem]">
        {/* Header with Pink Theme Gradient */}
        <div className="h-24 bg-gradient-to-r from-pink-500 to-rose-600 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute -bottom-6 left-8 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-pink-600 border-4 border-white">
            {TYPE_ICONS[leave.type] || <Info className="w-8 h-8" />}
          </div>
        </div>

        <div className="pt-10 px-8 pb-8 space-y-6">
          {/* Title & Status */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                {LEAVE_TYPE_LABELS[leave.type]}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Demande transmise le {formatDate(leave.createdAt)}
              </p>
            </div>
            <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 border border-current/10 ${STATUS_CONFIG[leave.status].bg} ${STATUS_CONFIG[leave.status].color}`}>
              {STATUS_CONFIG[leave.status].icon}
              <span className="text-[10px] font-black uppercase tracking-widest">
                {STATUS_CONFIG[leave.status].label}
              </span>
            </div>
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm transition-all hover:bg-white hover:shadow-md">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-pink-500" /> Date de début
              </span>
              <p className="text-sm font-black text-slate-700">{formatDate(leave.startDate)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm transition-all hover:bg-white hover:shadow-md">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-pink-500" /> Date de fin
              </span>
              <p className="text-sm font-black text-slate-700">{formatDate(leave.endDate)}</p>
            </div>
          </div>

          {/* Duration Banner */}
          <div className="py-3 px-6 rounded-2xl bg-pink-50 text-pink-700 border border-pink-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">Durée de l'absence</span>
            </div>
            <span className="text-lg font-black">{leave.durationDays} Jours</span>
          </div>

          {/* Motif */}
          <div className="space-y-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Motif de la demande</span>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 italic text-sm text-slate-600 leading-relaxed font-medium">
              {leave.motif || "Aucun motif précisé pour cette demande."}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl border-slate-200 font-black text-[10px] uppercase tracking-widest text-slate-500"
            >
              Fermer
            </Button>

            {leave.status === 'PENDING' && onCancel && (
              <Button
                onClick={() => onCancel(leave.id)}
                disabled={isDeleting}
                className="flex-1 h-12 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 border-0 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-rose-100/50"
              >
                {isDeleting ? 'Traitement...' : 'Annuler la demande'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
