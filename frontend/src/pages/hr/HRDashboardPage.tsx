import { LayoutDashboard, ClipboardList, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLeaveRequests } from '../../features/hr/leave/hooks/useLeaveRequests';
import { LeaveCalendarView } from '../../features/hr/leave/components/LeaveCalendarView';
import { Skeleton } from '../../components/ui/skeleton';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../hooks/useAuth';

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

export const HRDashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userRole = (user?.role || '').toUpperCase();
  const role = (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'ROOT' || userRole === 'RH' || userRole === 'HR_ADMIN')
    ? 'HR_ADMIN' : (userRole === 'PROJECT_MANAGER' || userRole === 'MANAGER' || userRole === 'CHEF' || userRole === 'CHEF DE PROJET')
      ? 'MANAGER' : 'EMPLOYEE';

  const { data: leaves, isLoading } = useLeaveRequests(
    role === 'HR_ADMIN' ? undefined : user?.id,
    role === 'HR_ADMIN' ? 'ALL' : 'OWNER'
  );

  const pending = leaves.filter(l => l.status === 'PENDING').length;
  const approved = leaves.filter(l => l.status === 'FULLY_APPROVED').length;
  const rejected = leaves.filter(l => l.status === 'REJECTED').length;
  const total = leaves.length;

  const recent = [...leaves]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Role already calculated above

  return (
    <AppLayout title={t('hr.hr_dashboard')} subtitle={t('hr.hr_summary')}>
      <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl bg-white shadow-sm border border-slate-100" />
            ))
          ) : (
            <>
              <StatCard label={t('common.all')} value={total} colorClass="bg-amber-50 text-amber-800" borderClass="border-slate-100"
                icon={<ClipboardList className="h-6 w-6" />} />
              <StatCard label={t('hr.pending')} value={pending} colorClass="bg-amber-50 text-amber-600" borderClass="border-slate-100"
                icon={<Clock className="h-6 w-6" />} />
              <StatCard label={t('hr.approved')} value={approved} colorClass="bg-emerald-50 text-emerald-600" borderClass="border-slate-100"
                icon={<CheckCircle className="h-6 w-6" />} />
              <StatCard label={t('hr.rejected')} value={rejected} colorClass="bg-rose-50 text-rose-600" borderClass="border-slate-100"
                icon={<XCircle className="h-6 w-6" />} />
            </>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-1 rounded-[2.5rem] bg-white p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 blur-3xl rounded-full group-hover:scale-125 transition-transform duration-700" />
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-amber-700" /> {t('hr.absence_calendar')}
            </h2>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full rounded-2xl bg-slate-50" />
            ) : (
              <div className="relative z-10"><LeaveCalendarView leaves={leaves} /></div>
            )}
          </div>

          {/* Recent Activity - Hidden for regular employees */}
          {role !== 'EMPLOYEE' && (
            <div className="lg:col-span-2 rounded-[2.5rem] bg-white p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700" /> {t('hr.recent_activity')}
              </h2>

              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl bg-slate-50" />)}
                </div>
              ) : recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-slate-100 rounded-[2rem]">
                  <ClipboardList className="w-12 h-12 text-slate-200 mb-3" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t('hr.no_activity_yet')}</p>
                </div>
              ) : (
                <div className="space-y-4 relative z-10">
                  {recent.map(l => (
                    <div key={l.id} className="flex items-center gap-5 rounded-[1.5rem] border border-slate-100 bg-slate-50/30 p-5 hover:bg-white hover:border-amber-100 hover:shadow-xl hover:shadow-amber-50/20 transition-all duration-300">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg ${l.status === 'FULLY_APPROVED' ? 'bg-emerald-50 text-emerald-600 shadow-emerald-100'
                          : l.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 shadow-rose-100'
                            : 'bg-amber-50 text-amber-600 shadow-amber-100'
                        }`}>
                        {l.status === 'FULLY_APPROVED' ? <CheckCircle className="w-6 h-6" /> : l.status === 'REJECTED' ? <XCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                      </div>
                      <div className="flex-1">
                        <span className="block text-sm font-black text-slate-800 tracking-tight">{l.employeeName}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {new Date(l.createdAt).toLocaleDateString()} • {t('hr.days_count', { count: l.durationDays })}
                        </span>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${l.status === 'FULLY_APPROVED' ? 'bg-emerald-500 text-white'
                          : l.status === 'REJECTED' ? 'bg-rose-500 text-white'
                            : 'bg-amber-500 text-white'
                        }`}>
                        {l.status === 'FULLY_APPROVED' ? t('hr.approved') : l.status === 'REJECTED' ? t('hr.rejected') : t('hr.pending')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
