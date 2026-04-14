import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartPulse, LayoutDashboard, ClipboardList, Plus,
  Clock, CheckCircle, XCircle, Users, Mail, Phone, MapPin, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { adminApi } from '../api/admin.api';
import type { User as AuthUser } from '../types/auth.types';
import { useLeaveRequests } from '../features/hr/leave/hooks/useLeaveRequests';
import { useLeaveActions } from '../features/hr/leave/hooks/useLeaveActions';
import { LeaveCard } from '../features/hr/leave/components/LeaveCard';
import { LeaveRequestForm } from '../features/hr/leave/components/LeaveRequestForm';
import { ReviewModal } from '../features/hr/leave/components/ReviewModal';
import { LeaveCalendarView } from '../features/hr/leave/components/LeaveCalendarView';
import { EmptyLeaveState } from '../features/hr/leave/components/EmptyLeaveState';
import { Skeleton } from '../components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '../components/ui/dialog';
import type { LeaveRequest, LeaveRole } from '../features/hr/leave/types/leave.types';
import { LeaveTable } from '../features/hr/leave/components/LeaveTable';

// ─── Tab IDs ─────────────────────────────────────────────────────────────
type TabId = 'dashboard' | 'leaves' | 'validation' | 'annuaire';

// ─── Mini stat card ───────────────────────────────────────────────────────
const StatCard = ({
  label, value, icon, colorClass, borderClass
}: { label: string; value: number | string; icon: React.ReactNode; colorClass: string; borderClass: string }) => (
  <div className={`relative overflow-hidden flex items-center gap-4 rounded-2xl bg-white border ${borderClass} px-5 py-4 transition-all hover:scale-[1.02] shadow-sm hover:shadow-md`}>
    <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${colorClass}`}>
      {icon}
    </div>
    <div className="z-10">
      <p className="text-3xl font-black text-slate-800">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-0.5">{label}</p>
    </div>
  </div>
);

// ─── Dashboard tab ────────────────────────────────────────────────────────
const DashboardTab = ({ leaves, isLoading }: { leaves: LeaveRequest[]; isLoading: boolean }) => {
  const pending = leaves.filter(l => l.status === 'PENDING').length;
  const approved = leaves.filter(l => l.status === 'APPROVED').length;
  const rejected = leaves.filter(l => l.status === 'REJECTED').length;
  const total = leaves.length;

  const recent = [...leaves]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-white shadow-sm" />
          ))
        ) : (
          <>
            <StatCard label="Total" value={total} colorClass="bg-indigo-50 text-indigo-600" borderClass="border-slate-100"
              icon={<ClipboardList className="h-6 w-6" />} />
            <StatCard label="Attente" value={pending} colorClass="bg-amber-50 text-amber-600" borderClass="border-slate-100"
              icon={<Clock className="h-6 w-6" />} />
            <StatCard label="Approuvés" value={approved} colorClass="bg-emerald-50 text-emerald-600" borderClass="border-slate-100"
              icon={<CheckCircle className="h-6 w-6" />} />
            <StatCard label="Rejetés" value={rejected} colorClass="bg-rose-50 text-rose-600" borderClass="border-slate-100"
              icon={<XCircle className="h-6 w-6" />} />
          </>
        )}
      </div>

      {/* Calendar & Activity */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 blur-3xl rounded-full" />
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" /> Calendrier
          </p>
          {isLoading ? (
            <Skeleton className="h-64 rounded-xl bg-slate-50" />
          ) : (
            <div className="relative z-10"><LeaveCalendarView leaves={leaves} /></div>
          )}
        </div>

        <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
          <p className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Activité récente
          </p>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl bg-slate-50" />)}
            </div>
          ) : recent.length === 0 ? (
            <div className="h-32 flex items-center justify-center border border-dashed border-slate-200 rounded-2xl">
              <span className="text-sm italic text-slate-400">Aucune activité pour le moment.</span>
            </div>
          ) : (
            <div className="space-y-3 relative z-10">
              {recent.map(l => (
                <div key={l.id} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-4 hover:bg-slate-100 transition-colors">
                  <div className={`h-3 w-3 rounded-full flex-shrink-0 ${
                    l.status === 'APPROVED' ? 'bg-emerald-500 shadow-sm shadow-emerald-200'
                    : l.status === 'REJECTED' ? 'bg-rose-500 shadow-sm shadow-rose-200'
                    : 'bg-amber-500 shadow-sm shadow-amber-200'
                  }`} />
                  <div className="flex-1">
                    <span className="block text-sm font-bold text-slate-800 tracking-wide">{l.employeeName}</span>
                    <span className="text-xs text-slate-500">{new Date(l.createdAt).toLocaleDateString('fr-FR')} • {l.durationDays} jour(s)</span>
                  </div>
                  <span className={`block rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                    l.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : l.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}>
                    {l.status === 'APPROVED' ? 'Approuvé' : l.status === 'REJECTED' ? 'Rejeté' : 'En attente'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Leaves tab ───────────────────────────────────────────────────────────
type LeaveFilter = 'all' | 'PENDING' | 'APPROVED' | 'REJECTED';

const LeavesTab = ({
  leaves, isLoading, refetch, employeeId, employeeName, role,
}: {
  leaves: LeaveRequest[];
  isLoading: boolean;
  refetch: () => void;
  employeeId: string;
  employeeName: string;
  role: LeaveRole;
}) => {
  const [filter, setFilter] = useState<LeaveFilter>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [reviewId, setReviewId] = useState<string | null>(null);
  const { submitLeave, isSubmitting, approveLeave, rejectLeave, isReviewing } = useLeaveActions();

  const filtered = filter === 'all' ? leaves : leaves.filter(l => l.status === filter);
  const leaveToReview = leaves.find(l => l.id === reviewId) ?? null;

  const handleSubmit = useCallback(async (data: any) => {
    await submitLeave({ ...data, employeeId, employeeName });
    setIsFormOpen(false);
    refetch();
  }, [submitLeave, employeeId, employeeName, refetch]);

  const handleApprove = useCallback(async (id: string) => {
    await approveLeave(id, employeeId);
    setReviewId(null);
    refetch();
  }, [approveLeave, employeeId, refetch]);

  const handleReject = useCallback(async (id: string, reason: string) => {
    await rejectLeave(id, employeeId, reason);
    setReviewId(null);
    refetch();
  }, [rejectLeave, employeeId, refetch]);

  const FILTERS: { id: LeaveFilter; label: string }[] = [
    { id: 'all', label: 'Toutes' },
    { id: 'PENDING', label: 'En attente' },
    { id: 'APPROVED', label: 'Approuvées' },
    { id: 'REJECTED', label: 'Rejetées' },
  ];

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Filter pills */}
          <div className="flex gap-1 p-1 bg-slate-50/50 rounded-xl border border-slate-100">
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-lg px-4 py-1.5 text-[9px] uppercase tracking-widest font-black transition-all duration-300 ${
                  filter === f.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'text-slate-400 hover:bg-white hover:text-indigo-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          
          {/* View switcher */}
          <div className="hidden sm:flex gap-1 p-1 bg-slate-50/50 rounded-xl border border-slate-100 ml-2">
             <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-lg ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                <ClipboardList className="w-4 h-4" />
             </button>
             <button onClick={() => setViewMode('cards')} className={`p-1.5 rounded-lg ${viewMode === 'cards' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                <LayoutDashboard className="w-4 h-4" />
             </button>
          </div>
        </div>

        {/* New request button */}
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white hover:shadow-lg hover:shadow-indigo-100 transition-all"
        >
          <Plus className="h-4 w-4" />
          Nouvelle demande
        </button>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-md border-slate-200 bg-white shadow-2xl p-0 overflow-hidden rounded-[2rem]">
            <DialogHeader className="px-8 pt-8 pb-4 border-b border-slate-100 bg-slate-50/50">
              <DialogTitle className="text-xl font-black text-slate-800 tracking-tight">
                Nouvelle demande de congé
              </DialogTitle>
            </DialogHeader>
            <div className="p-8">
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

      {/* List / Table */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-3xl bg-white shadow-sm border border-slate-100" />
            ))}
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmptyLeaveState role="EMPLOYEE" onRequestLeave={() => setIsFormOpen(true)} />
          </motion.div>
        ) : viewMode === 'table' ? (
          <motion.div key="table" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
            <LeaveTable leaves={filtered} role={role} onReview={setReviewId} />
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4">
            {filtered.map(leave => (
              <LeaveCard key={leave.id} leave={leave} role={role === 'EMPLOYEE' ? 'EMPLOYEE' : 'MANAGER'} onReview={setReviewId} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review modal */}
      <ReviewModal
        leave={leaveToReview}
        open={!!reviewId}
        onClose={() => setReviewId(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        isReviewing={isReviewing}
      />
    </div>
  );
};

import { EmployeeDirectory } from '../features/hr/directory/components/EmployeeDirectory';

// ─── Annuaire Tab ───────────────────────────────────────────────────────────
const AnnuaireTab = () => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await adminApi.getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="space-y-8">
      <header className="mb-10">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Annuaire Collaborateurs</h2>
        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-[0.2em] flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-indigo-500" /> {users.length} talents dans l'équipe
        </p>
      </header>

      <EmployeeDirectory users={users} isLoading={isLoading} />
    </div>
  );
};


// ─── Validation Tab (For Managers/HR) ───────────────────────────────────
const ValidationTab = ({ 
  role, employeeId 
}: { 
  role: LeaveRole;
  employeeId: string;
}) => {
  const { data: pendingLeaves, isLoading, refetch } = useLeaveRequests(undefined, 'MANAGER');
  const [reviewId, setReviewId] = useState<string | null>(null);
  const { approveLeave, rejectLeave, isReviewing } = useLeaveActions();
  
  const leaveToReview = pendingLeaves.find(l => l.id === reviewId) ?? null;

  const handleApprove = useCallback(async (id: string) => {
    await approveLeave(id, employeeId);
    setReviewId(null);
    refetch();
  }, [approveLeave, employeeId, refetch]);

  const handleReject = useCallback(async (id: string, reason: string) => {
    await rejectLeave(id, employeeId, reason);
    setReviewId(null);
    refetch();
  }, [rejectLeave, employeeId, refetch]);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-xl font-black text-slate-800 tracking-tight">Validations en attente</h2>
        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Gérez les demandes de votre équipe</p>
      </header>

      {isLoading ? (
         <div className="space-y-4">
           {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl bg-white" />)}
         </div>
      ) : pendingLeaves.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
           <div className="h-20 w-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10" />
           </div>
           <p className="text-slate-800 font-black tracking-tight text-lg">Tout est à jour !</p>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Aucune demande en attente de validation.</p>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <LeaveTable leaves={pendingLeaves} role={role} onReview={setReviewId} />
        </div>
      )}

      <ReviewModal
        leave={leaveToReview}
        open={!!reviewId}
        onClose={() => setReviewId(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        isReviewing={isReviewing}
      />
    </div>
  );
};


// ─── Main HRPage ──────────────────────────────────────────────────────────
const TABS: { id: TabId; label: string; icon: React.ReactNode; roles?: string[] }[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'leaves', label: 'Mes Congés', icon: <ClipboardList className="h-4 w-4" /> },
  { id: 'validation', label: 'Validations', icon: <ShieldCheck className="h-4 w-4" />, roles: ['SUPER_ADMIN', 'ADMIN', 'HR_ADMIN', 'PROJECT_MANAGER', 'MANAGER'] },
  { id: 'annuaire', label: 'Annuaire', icon: <Users className="h-4 w-4" /> },
];

export const HRPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  const employeeId = user?.id ?? 'unknown';
  const employeeName = user?.fullName ?? user?.email ?? 'Utilisateur';

  const { data: leaves, isLoading, refetch } = useLeaveRequests(employeeId);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 text-slate-800">
      {/* Immersive Header Light - Fixed Height */}
      <div className="flex-shrink-0 pt-10 pb-6 px-8 border-b border-indigo-100 bg-white relative overflow-hidden shadow-sm">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/30" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-100/50 rounded-full blur-[100px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 shadow-xl shadow-indigo-200">
              <HeartPulse className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Ressources Humaines</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Espace de gestion centralisé
              </p>
            </div>
          </div>

          {/* Premium Tabs Light */}
          <div className="flex gap-1.5 rounded-xl bg-slate-50/50 border border-slate-200 p-1 shadow-inner">
            {TABS.filter(tab => !tab.roles || (user?.role && tab.roles.includes(user.role))).map(tab => (
              <button
                key={tab.id}
                id={`hr-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 p-8 overflow-y-auto relative scroll-smooth">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'dashboard' && <DashboardTab leaves={leaves} isLoading={isLoading} />}
            {activeTab === 'leaves' && (
              <LeavesTab
                leaves={leaves}
                isLoading={isLoading}
                refetch={refetch}
                employeeId={employeeId}
                employeeName={employeeName}
                role={
                  user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'HR_ADMIN' 
                    ? 'HR_ADMIN' : user?.role === 'PROJECT_MANAGER' || user?.role === 'MANAGER' 
                    ? 'MANAGER' : 'EMPLOYEE'
                }
              />
            )}
            {activeTab === 'validation' && (
              <ValidationTab 
                role={
                  user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'HR_ADMIN' 
                    ? 'HR_ADMIN' : user?.role === 'PROJECT_MANAGER' || user?.role === 'MANAGER' 
                    ? 'MANAGER' : 'EMPLOYEE'
                }
                employeeId={employeeId}
              />
            )}
            {activeTab === 'annuaire' && <AnnuaireTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
