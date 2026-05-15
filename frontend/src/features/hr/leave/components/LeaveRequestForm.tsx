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
import { leaveApi } from '../api/leave.api';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Label } from '../../../../components/ui/label';
import { DatePicker } from '../../../../components/ui/date-picker';

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

export const LeaveRequestForm = ({ employeeId, employeeName, onSubmit, isSubmitting }: LeaveRequestFormProps) => {
  const [step, setStep] = useState(1);
  const [motifLength, setMotifLength] = useState(0);
  const [overlappingUsers, setOverlappingUsers] = useState<string[]>([]);
  const [isCheckingOverlaps, setIsCheckingOverlaps] = useState(false);

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

  useEffect(() => {
    const checkOverlaps = async () => {
      if (startDate && endDate && duration > 0) {
        setIsCheckingOverlaps(true);
        try {
          const result = await leaveApi.checkOverlaps(startDate, endDate, employeeId);
          setOverlappingUsers(result.overlappingEmployees);
        } catch (error) {
          console.error('Failed to check overlaps', error);
        } finally {
          setIsCheckingOverlaps(false);
        }
      } else {
        setOverlappingUsers([]);
      }
    };

    const timer = setTimeout(checkOverlaps, 500);
    return () => clearTimeout(timer);
  }, [startDate, endDate, duration, employeeId]);

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center gap-2 px-1">
        <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-amber-800' : 'bg-slate-100'}`} />
        <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-amber-800' : 'bg-slate-100'}`} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="min-h-[380px] flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6 flex-1"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Type de congé
                  </Label>
                  <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full uppercase">Étape 1/2</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(LEAVE_TYPE_LABELS) as LeaveType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setValue('type', type)}
                      className={`relative flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all duration-300 text-left ${selectedType === type
                          ? 'border-amber-800 bg-amber-50/30 text-amber-900 shadow-md ring-4 ring-amber-50/50'
                          : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${selectedType === type ? 'bg-amber-800 text-white shadow-sm' : 'bg-slate-50 text-slate-400'}`}>
                        {TYPE_ICONS[type]}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest leading-tight">
                        {LEAVE_TYPE_LABELS[type]}
                      </span>
                      {selectedType === type && (
                        <div className="ml-auto">
                          <CheckCircle2 className="w-4 h-4 text-amber-800" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2 group"
                >
                  Continuer
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 flex-1"
            >
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Dates & Détails
                </Label>
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="text-[9px] font-bold text-slate-400 hover:text-amber-800 uppercase tracking-widest transition-colors"
                >
                  ← Retour
                </button>
              </div>

              {/* Date Selection */}
              <div className="grid grid-cols-2 gap-4 p-5 rounded-[2rem] bg-slate-50/50 border border-slate-100">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Début
                  </Label>
                  <DatePicker 
                    date={startDate ? new Date(startDate) : undefined}
                    setDate={(d) => setValue('startDate', d ? d.toISOString().split('T')[0] : '', { shouldValidate: true })}
                    className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:ring-amber-700 font-bold text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Fin
                  </Label>
                  <DatePicker 
                    date={endDate ? new Date(endDate) : undefined}
                    setDate={(d) => setValue('endDate', d ? d.toISOString().split('T')[0] : '', { shouldValidate: true })}
                    className={`h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:ring-amber-700 font-bold text-xs ${errors.endDate ? 'border-rose-400 bg-rose-50' : ''}`}
                  />
                </div>
              </div>

              {/* Duration Summary */}
              <AnimatePresence>
                {duration > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between py-3 px-5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100/50"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Durée estimée</span>
                    </div>
                    <span className="text-xs font-black">{duration} {duration > 1 ? 'jours' : 'jour'}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Motif Area */}
              <div className="space-y-2">
                <Label htmlFor="motif" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Motif (Optionnel)
                </Label>
                <div className="relative">
                  <Textarea
                    id="motif"
                    {...register('motif')}
                    onChange={(e) => setMotifLength(e.target.value.length)}
                    placeholder="Pourquoi cette demande ?"
                    className="min-h-[100px] rounded-2xl border-slate-200 bg-white shadow-sm resize-none p-4 focus:ring-amber-700 font-medium text-xs"
                    maxLength={500}
                  />
                  <div className="absolute bottom-3 right-4 text-[8px] font-black text-slate-300 uppercase">
                    {motifLength} / 500
                  </div>
                </div>
              </div>

              {/* Overlap Warning */}
              <AnimatePresence>
                {overlappingUsers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-2 p-4 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/50"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Alerte Disponibilité</span>
                    </div>
                    <p className="text-[11px] leading-relaxed font-medium">
                      Attention, d'autres collaborateurs ont déjà des congés approuvés sur cette période : 
                      <span className="font-bold ml-1">{overlappingUsers.join(', ')}</span>.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Errors Display */}
              {errors.endDate && (
                <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">{errors.endDate.message}</span>
                </div>
              )}

              {/* Submit */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || (!!endDate && duration <= 0)}
                  className="w-full h-12 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-amber-100 transition-all flex items-center justify-center gap-2 group"
                >
                  {isSubmitting ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                      <Clock className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <>
                      Confirmer la demande
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};
