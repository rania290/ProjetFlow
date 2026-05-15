import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ClipboardList, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLeaveRequests } from '../../features/hr/leave/hooks/useLeaveRequests';
import { useLeaveActions } from '../../features/hr/leave/hooks/useLeaveActions';
import { LeaveCard } from '../../features/hr/leave/components/LeaveCard';
import { LeaveRequestForm } from '../../features/hr/leave/components/LeaveRequestForm';
import { LeaveDetailsModal } from '../../features/hr/leave/components/LeaveDetailsModal';
import { EmptyLeaveState } from '../../features/hr/leave/components/EmptyLeaveState';
import { Skeleton } from '../../components/ui/skeleton';
import { LeaveTable } from '../../features/hr/leave/components/LeaveTable';
import { AppLayout } from '../../components/layout/AppLayout';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '../../components/ui/dialog';
import { AnimatePresence, motion } from 'framer-motion';

type LeaveFilter = 'all' | 'PENDING' | 'APPROVED' | 'REJECTED';

export const HRMyLeavesPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const employeeId = user?.id ?? 'unknown';
  const employeeName = user?.fullName ?? user?.email ?? t('admin.roles.TEAM_MEMBER');

  const { data: leaves, isLoading, refetch } = useLeaveRequests(employeeId);
  const [filter, setFilter] = useState<LeaveFilter>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [viewId, setViewId] = useState<string | null>(null);

  const { submitLeave, isSubmitting, approveLeave, rejectLeave, isReviewing, deleteLeave, isDeleting } = useLeaveActions();

  const filtered = filter === 'all' ? leaves : leaves.filter(l => l.status === filter);
  const leaveToView = leaves.find(l => l.id === viewId) ?? null;

  const handleSubmit = useCallback(async (data: any) => {
    const profileManagerIds = (user as any)?.managerIds || [];
    const fallbackManagerId = user?.managerId;
    const allManagerIds = Array.from(new Set([...profileManagerIds, fallbackManagerId].filter(Boolean)));

    await submitLeave({
      ...data,
      employeeId,
      employeeName,
      managerId: allManagerIds[0] || null,
      managerIds: allManagerIds,
    });
    setIsFormOpen(false);
    refetch();
  }, [submitLeave, employeeId, employeeName, user?.managerId, (user as any)?.managerIds, refetch]);

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

  const handleCancelLeave = useCallback(async (id: string) => {
    await deleteLeave(id);
    setViewId(null);
    refetch();
  }, [deleteLeave, refetch]);

  const FILTERS: { id: LeaveFilter; label: string }[] = [
    { id: 'all', label: t('hr.all_requests_short') },
    { id: 'PENDING', label: t('hr.pending') },
    { id: 'APPROVED', label: t('hr.approved') },
    { id: 'REJECTED', label: t('hr.rejected') },
  ];

  const userRole = (user?.role || '').toUpperCase();
  const role = (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'ROOT' || userRole === 'RH' || userRole === 'HR_ADMIN')
    ? 'HR_ADMIN' : (userRole === 'PROJECT_MANAGER' || userRole === 'MANAGER' || userRole === 'CHEF' || userRole === 'CHEF DE PROJET')
      ? 'MANAGER' : 'EMPLOYEE';

  return (
    <AppLayout title={t('hr.my_leaves')} subtitle={t('hr.manage_absences')}>
      <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-6">
            {/* Filter pills */}
            <div className="flex gap-1.5 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-100">
              {FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`rounded-xl px-4 py-2 text-[10px] uppercase tracking-widest font-black transition-all duration-300 ${filter === f.id
                    ? 'bg-amber-800 text-white shadow-lg shadow-amber-100'
                    : 'text-slate-400 hover:bg-white hover:text-amber-800'
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* View switcher */}
            <div className="hidden sm:flex gap-1.5 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-100">
              <button onClick={() => setViewMode('table')} className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                <ClipboardList className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('cards')} className={`p-2 rounded-xl transition-all ${viewMode === 'cards' ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                <LayoutDashboard className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsFormOpen(true)}
            className="group flex items-center gap-3 rounded-2xl bg-amber-800 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-stone-900 transition-all shadow-xl shadow-amber-100"
          >
            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
            {t('hr.new_request')}
          </button>

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-md border-0 bg-white shadow-[0_0_100px_rgba(0,0,0,0.15)] p-0 overflow-hidden rounded-[3rem]">
              <DialogHeader className="px-10 pt-10 pb-6 border-b border-slate-100 bg-slate-50/50">
                <DialogTitle className="text-2xl font-black text-slate-800 tracking-tighter uppercase">
                  {t('hr.new_request')}
                </DialogTitle>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('hr.request_details')}</p>
              </DialogHeader>
              <div className="p-10">
                <LeaveRequestForm
                  employeeId={employeeId}
                  employeeName={employeeName}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Content Area */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-[2rem] bg-white border border-slate-100 shadow-sm" />
                ))}
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <EmptyLeaveState role="EMPLOYEE" onRequestLeave={() => setIsFormOpen(true)} />
              </motion.div>
            ) : viewMode === 'table' ? (
              <motion.div key="table" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <LeaveTable leaves={filtered} role={role} onView={setViewId} />
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((leave, idx) => (
                  <LeaveCard key={leave.id} leave={leave} role={role === 'EMPLOYEE' ? 'EMPLOYEE' : 'MANAGER'} onView={setViewId} index={idx} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <LeaveDetailsModal
          isOpen={!!viewId}
          onClose={() => setViewId(null)}
          leave={leaveToView}
          onCancel={role === 'EMPLOYEE' ? handleCancelLeave : undefined}
          isDeleting={isDeleting}
          onApprove={handleApprove}
          onReject={handleReject}
          isReviewing={isReviewing}
          role={role as any}
        />
      </div>
    </AppLayout>
  );
};
