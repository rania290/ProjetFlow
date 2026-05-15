import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Calendar, Clock, AlertCircle,
  CheckCircle2, Trash2, User, Info,
  Palmtree, Activity, Baby, Wallet,
  XCircle, Loader2
} from 'lucide-react';
import type { LeaveRequest, LeaveType } from '../types/leave.types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { LEAVE_TYPE_LABELS } from '../constants/leave.constants';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';

interface LeaveDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  leave: LeaveRequest | null;
  onCancel?: (id: string) => void;
  isDeleting?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  isReviewing?: boolean;
  role?: 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN';
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
  PENDING: { label: 'Attente Chef', color: 'text-amber-700', bg: 'bg-amber-50', icon: <Clock className="w-4 h-4 animate-pulse" /> },
  CHEF_APPROVED: { label: 'Validé par Chef', color: 'text-blue-700', bg: 'bg-blue-50', icon: <CheckCircle2 className="w-4 h-4 animate-pulse" /> },
  FULLY_APPROVED: { label: 'Approuvé', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: <CheckCircle2 className="w-4 h-4" /> },
  APPROVED: { label: 'Approuvé (Old)', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: <CheckCircle2 className="w-4 h-4" /> },
  REJECTED: { label: 'Rejeté', color: 'text-rose-700', bg: 'bg-rose-50', icon: <Trash2 className="w-4 h-4" /> },
};

export const LeaveDetailsModal: React.FC<LeaveDetailsModalProps> = ({
  isOpen,
  onClose,
  leave,
  onCancel,
  isDeleting,
  onApprove,
  onReject,
  isReviewing,
  role = 'EMPLOYEE'
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  if (!leave) return null;

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const handleClose = () => {
    setShowRejectionForm(false);
    setRejectionReason('');
    onClose();
  };

  const handleApprove = () => {
    if (onApprove) onApprove(leave.id);
  };

  const handleReject = () => {
    if (onReject && rejectionReason.trim()) {
      onReject(leave.id, rejectionReason);
      setShowRejectionForm(false);
      setRejectionReason('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-md border-0 bg-white shadow-[0_0_100px_rgba(0,0,0,0.15)] p-0 overflow-hidden rounded-[2.5rem]">
        {/* Header with Brown Theme Gradient */}
        <div className="h-24 bg-gradient-to-r from-amber-700 to-amber-900 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute -bottom-6 left-8 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-amber-800 border-4 border-white">
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
                <Calendar className="w-3.5 h-3.5 text-amber-700" /> Date de début
              </span>
              <p className="text-sm font-black text-slate-700">{formatDate(leave.startDate)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm transition-all hover:bg-white hover:shadow-md">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-700" /> Date de fin
              </span>
              <p className="text-sm font-black text-slate-700">{formatDate(leave.endDate)}</p>
            </div>
          </div>

          {/* Duration Banner */}
          <div className="py-3 px-6 rounded-2xl bg-amber-50 text-amber-800 border border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">Durée de l'absence</span>
            </div>
            <span className="text-lg font-black">{leave.durationDays} Jours</span>
          </div>

          {/* Motif (Always show for all) */}
          <div className="space-y-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Motif de la demande</span>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 italic text-sm text-slate-600 leading-relaxed font-medium">
              {leave.motif || "Aucun motif précisé."}
            </div>
          </div>

          {/* Rejection Details (HIDDEN for members) */}
          {leave.status === 'REJECTED' && role !== 'EMPLOYEE' && leave.rejectionReason && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700">
               <span className="text-[9px] font-black uppercase tracking-widest block mb-2 text-rose-600">Raison du rejet</span>
               <p className="text-xs font-bold leading-tight">{leave.rejectionReason}</p>
               <p className="text-[9px] mt-4 opacity-60 uppercase font-black italic">Refusé par {leave.reviewedBy}</p>
            </div>
          )}

          {/* Approval Details (HIDDEN for members) */}
          {leave.status === 'FULLY_APPROVED' && role !== 'EMPLOYEE' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700">
               <span className="text-[10px] font-black uppercase tracking-widest block mb-1">Validation effectuée</span>
               <p className="text-[9px] opacity-60 uppercase font-black italic">Approuvé par {leave.reviewedBy}</p>
            </div>
          )}

          {/* Action Footer */}
          <AnimatePresence mode="wait">
            {!showRejectionForm ? (
              <motion.div key="actions" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-2 space-y-3">
                <div className="flex gap-2">
                  {role !== 'EMPLOYEE' && (leave.status === 'PENDING' || leave.status === 'CHEF_APPROVED') && (
                    <Button
                      onClick={handleApprove}
                      disabled={isReviewing}
                      className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white border-0 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/30"
                    >
                      {isReviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                      {role === 'HR_ADMIN' ? 'Approuver (Admin)' : (leave.status === 'PENDING' ? 'Valider Chef' : 'Validation Finale')}
                    </Button>
                  )}

                  {role !== 'EMPLOYEE' && (leave.status === 'PENDING' || leave.status === 'CHEF_APPROVED') && (
                    <Button
                      onClick={() => setShowRejectionForm(true)}
                      disabled={isReviewing}
                      className="flex-1 h-12 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 border-0 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-rose-100/50"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Rejeter
                    </Button>
                  )}


                </div>

                {leave.status === 'PENDING' && onCancel && (
                  <Button
                    onClick={() => onCancel(leave.id)}
                    disabled={isDeleting}
                    className="w-full h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 border-0 font-bold text-[9px] uppercase tracking-widest transition-all"
                  >
                    {isDeleting ? 'Traitement...' : 'Annuler ma demande'}
                  </Button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="rejection-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pt-2"
              >
                <Label htmlFor="rejectionReason" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Raison du rejet (obligatoire)
                </Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Veuillez expliquer la raison du rejet..."
                  className="min-h-[100px] rounded-2xl border-slate-200 focus:border-rose-300 focus:ring-rose-200"
                  maxLength={500}
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleReject}
                    disabled={!rejectionReason.trim() || isReviewing}
                    className="flex-1 h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-600/30"
                  >
                    {isReviewing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                    Confirmer le rejet
                  </Button>
                  <Button
                    onClick={() => {
                      setShowRejectionForm(false)
                      setRejectionReason('')
                    }}
                    variant="outline"
                    disabled={isReviewing}
                    className="flex-1 h-12 rounded-2xl border-slate-200 font-black text-[10px] uppercase tracking-widest text-slate-500"
                  >
                    Annuler
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};
