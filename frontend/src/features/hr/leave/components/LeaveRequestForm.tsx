import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palmtree, Activity, User, Baby, Wallet,
  Calendar, Clock, AlertCircle, CheckCircle2, ChevronRight
} from 'lucide-react';
import type { LeaveType } from '../types/leave.types';
import { LEAVE_TYPE_LABELS } from '../constants/leave.constants';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Label } from '../../../../components/ui/label';

const leaveSchema = z.object({
  type: z.enum(['ANNUAL', 'UNPAID', 'SICK', 'MATERNITY', 'PATERNITY', 'PERSONAL'] as const),
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().min(1, 'La date de fin est requise'),
  motif: z.string().max(500, 'Le motif ne doit pas dépasser 500 caractères').optional(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'La date de fin doit être postérieure à la date de début',
  path: ['endDate'],
});

type LeaveFormData = z.infer<typeof leaveSchema>;

interface LeaveRequestFormProps {
  employeeId: string;
  employeeName: string;
  onSubmit: (data: LeaveFormData) => void;
  isSubmitting: boolean;
}

const TYPE_ICONS: Record<LeaveType, React.ReactNode> = {
  ANNUAL: <Palmtree className="w-5 h-5" />,
  SICK: <Activity className="w-5 h-5" />,
  PERSONAL: <User className="w-5 h-5" />,
  MATERNITY: <Baby className="w-5 h-5" />,
  PATERNITY: <Baby className="w-5 h-5" />,
  UNPAID: <Wallet className="w-5 h-5" />,
};

export const LeaveRequestForm = ({ onSubmit, isSubmitting }: LeaveRequestFormProps) => {
  const [motifLength, setMotifLength] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      type: 'ANNUAL',
      startDate: new Date().toISOString().split('T')[0],
    }
  });

  const selectedType = watch('type');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;

    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const duration = calculateDuration();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Category Selection Grid */}
      <div className="space-y-3">
        <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">
          Type de congé
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(LEAVE_TYPE_LABELS) as LeaveType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setValue('type', type)}
              className={`relative flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all duration-300 ${selectedType === type
                  ? 'border-pink-600 bg-pink-50/50 text-pink-700 shadow-md ring-2 ring-pink-50'
                  : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                }`}
            >
              <div className={`p-2 rounded-lg ${selectedType === type ? 'bg-pink-600 text-white shadow-sm' : 'bg-slate-50 text-slate-400'}`}>
                {TYPE_ICONS[type]}
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">
                {LEAVE_TYPE_LABELS[type]}
              </span>
              {selectedType === type && (
                <motion.div layoutId="activeType" className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-pink-600 flex items-center justify-center text-white shadow-lg border-2 border-white">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Date Selection */}
      <div className="grid grid-cols-2 gap-4 p-4 rounded-3xl bg-slate-50/50 border border-slate-100">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Calendar className="w-3 h-3" /> Début
          </Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate')}
            className="h-10 rounded-xl border-slate-200 bg-white shadow-sm focus:ring-pink-500 font-bold text-xs"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Calendar className="w-3 h-3" /> Fin
          </Label>
          <Input
            id="endDate"
            type="date"
            {...register('endDate')}
            className={`h-10 rounded-xl border-slate-200 bg-white shadow-sm focus:ring-pink-500 font-bold text-xs ${errors.endDate ? 'border-rose-400 bg-rose-50' : ''}`}
          />
        </div>
      </div>

      {/* Duration Summary Badge */}
      <AnimatePresence>
        {duration > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 py-3 px-6 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 border-dashed"
          >
            <Clock className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">
              {duration} {duration > 1 ? 'jours ouvrés' : 'jour ouvré'} estimé
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Motif Area */}
      <div className="space-y-2">
        <Label htmlFor="motif" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">
          Motif (Optionnel)
        </Label>
        <div className="relative">
          <Textarea
            id="motif"
            {...register('motif')}
            onChange={(e) => setMotifLength(e.target.value.length)}
            placeholder="Pourquoi cette demande ?"
            className="min-h-[80px] rounded-2xl border-slate-200 bg-white shadow-sm resize-none p-4 focus:ring-pink-500 font-medium text-xs"
            maxLength={500}
          />
          <div className="absolute bottom-3 right-4 text-[8px] font-black text-slate-300 uppercase">
            {motifLength} / 500
          </div>
        </div>
      </div>

      {/* Errors Display */}
      {errors.endDate && (
        <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-100">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs font-bold">{errors.endDate.message}</span>
        </div>
      )}

      {/* Final Summary Card & Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting || (!!endDate && duration <= 0)}
          className="w-full h-12 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-pink-100 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 group"
        >
          {isSubmitting ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
              <Clock className="w-4 h-4" />
            </motion.div>
          ) : (
            <>
              Soumettre
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
