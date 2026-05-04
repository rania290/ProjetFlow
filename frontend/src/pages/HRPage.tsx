import { useState, useCallback } from 'react';
import {
  Calendar, CheckCircle, Clock, Search, Filter,
  FileText, Download, User, Briefcase, Plus,
  ChevronRight, ArrowUpRight, ArrowDownRight,
  TrendingUp, Users, LayoutGrid, List, Eye,
  ShieldCheck, MoreHorizontal, X, Menu
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLeaveRequests } from '../features/hr/leave/hooks/useLeaveRequests';
import { useLeaveActions } from '../features/hr/leave/hooks/useLeaveActions';
import { LeaveTable } from '../features/hr/leave/components/LeaveTable';
import { LeaveDetailsModal } from '../features/hr/leave/components/LeaveDetailsModal';
import { EmptyLeaveState } from '../features/hr/leave/components/EmptyLeaveState';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { AppLayout } from '../components/layout/AppLayout';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '../components/ui/card';

export const HRPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'validations' | 'leaves'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewId, setViewId] = useState<string | null>(null);

  const employeeId = user?.id ?? 'unknown';
  const userRole = (user?.role || '').toUpperCase();
  const role = (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'ROOT' || userRole === 'RH' || userRole === 'HR_ADMIN')
    ? 'HR_ADMIN' : (userRole === 'PROJECT_MANAGER' || userRole === 'MANAGER' || userRole === 'CHEF' || userRole === 'CHEF DE PROJET')
      ? 'MANAGER' : 'EMPLOYEE';

  const { data: allLeaves, isLoading: isAllLoading, refetch: refetchAll } = useLeaveRequests();
  const { data: pendingLeaves, isLoading: isPendingLoading, refetch: refetchPending } = useLeaveRequests(role === 'HR_ADMIN' ? undefined : employeeId, 'MANAGER');

  const { approveLeave, rejectLeave, isReviewing } = useLeaveActions();

  const leaveToView = (activeTab === 'validations' ? pendingLeaves : allLeaves).find(l => l.id === viewId) ?? null;

  const handleApprove = useCallback(async (id: string) => {
    await approveLeave(id, employeeId);
    setViewId(null);
    refetchPending();
    refetchAll();
  }, [approveLeave, employeeId, refetchPending, refetchAll]);

  const handleReject = useCallback(async (id: string, reason: string) => {
    await rejectLeave(id, employeeId, reason);
    setViewId(null);
    refetchPending();
    refetchAll();
  }, [rejectLeave, employeeId, refetchPending, refetchAll]);

  const stats = [
    {
      label: 'En attente',
      value: pendingLeaves.length,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      change: 'À traiter',
      trend: 'up'
    },
    {
      label: 'Effectif présent',
      value: '94%',
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      change: 'Présence active',
      trend: 'up'
    },
    {
      label: 'Congés approuvés',
      value: allLeaves.filter(l => l.status === 'FULLY_APPROVED').length,
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: 'Ce mois-ci',
      trend: 'up'
    }
  ];

  return (
    <AppLayout title="Portail RH" subtitle="Gestion globale des ressources humaines">
      <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex gap-1.5 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-100">
            {[
              { id: 'overview', label: 'Vue d\'ensemble' },
              { id: 'validations', label: 'Validations' },
              { id: 'leaves', label: 'Toutes les demandes' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`rounded-xl px-4 py-2 text-[10px] uppercase tracking-widest font-black transition-all duration-300 ${activeTab === tab.id
                  ? 'bg-amber-800 text-white shadow-lg shadow-amber-100'
                  : 'text-slate-400 hover:bg-white hover:text-amber-800'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-800 transition-colors" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-6 py-2.5 bg-slate-100 border-0 rounded-2xl text-xs font-bold w-64 focus:ring-2 focus:ring-amber-200 transition-all"
              />
            </div>
            <button className="p-2.5 rounded-2xl bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-800 transition-all">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bgColor} opacity-20 rounded-bl-full transition-transform duration-500 group-hover:scale-110`} />
                  <div className="relative z-10 space-y-4">
                    <div className={`w-12 h-12 rounded-2xl ${stat.bgColor} ${stat.color} flex items-center justify-center shadow-lg`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                      <h3 className="text-3xl font-black text-slate-800 tracking-tighter mt-1">{stat.value}</h3>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <span className={`text-[9px] font-bold px-2 py-1 rounded-lg ${stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} flex items-center gap-1`}>
                        {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 flex-[2]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Dernières validations</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Action immédiate recommandée</p>
                  </div>
                  <button onClick={() => setActiveTab('validations')} className="text-[10px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-2 hover:translate-x-2 transition-transform">
                    Voir tout <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <LeaveTable
                  leaves={pendingLeaves.slice(0, 5)}
                  role={role}
                  onView={setViewId}
                  isLoading={isPendingLoading}
                />
              </div>

              {/* Recent Activity - Hidden for regular employees */}
              {role !== 'EMPLOYEE' && (
                <Card className="p-8 rounded-[3rem] border-slate-100 shadow-sm flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Activité récente</h2>
                    <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-100 uppercase text-[9px]">Temps réel</Badge>
                  </div>
                  <div className="space-y-4">
                    {pendingLeaves.slice(0, 4).map((l, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 font-bold text-xs shadow-sm">
                          {l.employeeName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800">{l.employeeName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{l.type} - {l.durationDays}j</p>
                        </div>
                        <div className="ml-auto text-[9px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-tighter">
                          À traiter
                        </div>
                      </div>
                    ))}
                    {pendingLeaves.length === 0 && (
                      <div className="text-center py-10 opacity-50">
                        <Clock className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Aucune activité</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'validations' && (
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 min-h-[500px]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Validations en attente</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Action requise pour {pendingLeaves.length} demande(s)
                </p>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {pendingLeaves.length === 0 && !isPendingLoading ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-20 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <div className="h-20 w-20 rounded-3xl bg-emerald-100/50 text-emerald-600 flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Tout est à jour !</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Aucune demande en attente de traitement.</p>
                </motion.div>
              ) : (
                <LeaveTable
                  leaves={pendingLeaves}
                  role={role}
                  onView={setViewId}
                  isLoading={isPendingLoading}
                />
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'leaves' && (
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 min-h-[500px]">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Toutes les demandes</h2>
              <Badge variant="outline" className="rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-slate-50 border-slate-200">
                {allLeaves.length} demandes au total
              </Badge>
            </div>
            <LeaveTable
              leaves={allLeaves}
              role={role}
              onView={setViewId}
              isLoading={isAllLoading}
            />
          </div>
        )}

        <LeaveDetailsModal
          isOpen={!!viewId}
          onClose={() => setViewId(null)}
          leave={leaveToView}
          onApprove={handleApprove}
          onReject={handleReject}
          isReviewing={isReviewing}
          role={role as any}
        />
      </div>
    </AppLayout>
  );
};
