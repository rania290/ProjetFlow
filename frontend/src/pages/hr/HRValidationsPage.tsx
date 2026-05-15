import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLeaveRequests } from '../../features/hr/leave/hooks/useLeaveRequests';
import { useLeaveActions } from '../../features/hr/leave/hooks/useLeaveActions';
import { LeaveTable } from '../../features/hr/leave/components/LeaveTable';
import { LeaveDetailsModal } from '../../features/hr/leave/components/LeaveDetailsModal';
import { Skeleton } from '../../components/ui/skeleton';
import { AppLayout } from '../../components/layout/AppLayout';
import { AnimatePresence, motion } from 'framer-motion';

export const HRValidationsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const employeeId = user?.id ?? 'unknown';
  const userRole = (user?.role || '').toUpperCase();
  const role = (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'ROOT' || userRole === 'RH' || userRole === 'HR_ADMIN')
    ? 'HR_ADMIN' : (userRole === 'PROJECT_MANAGER' || userRole === 'MANAGER' || userRole === 'CHEF' || userRole === 'CHEF DE PROJET')
      ? 'MANAGER' : 'EMPLOYEE';

  // Si HR_ADMIN, on ne filtre pas par validatorId pour voir toutes les demandes en attente
  const validatorId = role === 'HR_ADMIN' ? undefined : employeeId;
  const { data: pendingLeaves, isLoading, refetch } = useLeaveRequests(validatorId, 'MANAGER');
  const [viewId, setViewId] = useState<string | null>(null);
  const { approveLeave, rejectLeave, isReviewing } = useLeaveActions();

  const leaveToReview = pendingLeaves.find(l => l.id === viewId) ?? null;

  const handleApprove = useCallback(async (id: string) => {
    await approveLeave(id, employeeId);
    setViewId(null);
    refetch();
  }, [approveLeave, employeeId, refetch]);

  const handleReject = useCallback(async (id: string, reason: string) => {
    await rejectLeave(id, employeeId, reason);
    setViewId(null);
    refetch();
  }, [rejectLeave, employeeId, refetch]);

  return (
    <AppLayout title={t('hr.hr_validations')} subtitle={t('hr.validate_subtitle')}>
      <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">{t('hr.pending_requests')}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> {t('hr.action_required', { count: pendingLeaves.length })}
            </p>
          </div>
        </header>

        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-[2rem] bg-white border border-slate-100 shadow-sm" />
                ))}
              </motion.div>
            ) : pendingLeaves.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center p-20 bg-white/40 rounded-[3rem] border-2 border-dashed border-slate-200"
              >
                <div className="h-24 w-24 rounded-3xl bg-emerald-100/50 text-emerald-600 flex items-center justify-center mb-6 shadow-xl shadow-emerald-100/20">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">{t('hr.all_caught_up')}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{t('hr.no_pending_requests')}</p>
              </motion.div>
            ) : (
              <motion.div key="table" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden border-t-4 border-t-amber-800">
                <LeaveTable leaves={pendingLeaves} role={role} onView={setViewId} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <LeaveDetailsModal
          leave={leaveToReview}
          isOpen={!!viewId}
          onClose={() => setViewId(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          isReviewing={isReviewing}
          role={role as any}
        />
      </div>
    </AppLayout>
  );
};
