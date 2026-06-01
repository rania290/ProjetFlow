import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    TrendingUp,
    CheckCircle2, Target, Printer,
    ArrowRight, MessageSquare, FileText, Plus,
    ArrowUpRight, Ticket, HeadphonesIcon, Send, Clock, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/projectStore';
import { useAuth } from '../../hooks/useAuth';
import { useAuraStore } from '../../store/auraStore';
import { Link } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { jsPDF } from 'jspdf';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateTicketModal } from '../../components/client/CreateTicketModal';
import { ticketsService } from '../../api/tickets.service';

// ─── Client-only Welcome Portal ────────────────────────────────────────────
const ClientWelcomePortal: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { state, dispatch } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    React.useEffect(() => {
        const loadTickets = async () => {
            try {
                const data = await ticketsService.getAll({}, user?.email);
                dispatch({ type: 'SET_TICKETS', tickets: data as any });
            } catch (error) {
                console.error('Failed to load tickets:', error);
            }
        };
        loadTickets();
    }, [dispatch, user?.email]);

    const isClientRole = user?.role?.toUpperCase() === 'CLIENT';
    const ownTickets = isClientRole
        ? state.tickets.filter(tk =>
            tk.clientEmail === user?.email ||
            tk.requesterEmail === user?.email ||
            tk.createdBy === user?.email ||
            tk.reporterEmail === user?.email ||
            (tk as any).authorEmail === user?.email
          )
        : state.tickets;
    const openTicketsCount = ownTickets.filter(tk => tk.status !== 'CLOSED' && tk.status !== 'RESOLVED').length;
    const urgentTicketsCount = ownTickets.filter(tk => tk.priority === 'URGENT').length;
    const inProgressTicketsCount = ownTickets.filter(tk => tk.status === 'IN_PROGRESS').length;
    const resolvedTicketsCount = ownTickets.filter(tk => tk.status === 'RESOLVED').length;

    return (
        <AppLayout title={t('client.client_space')} subtitle={t('client.interactive_dashboard')}>
            <div className="min-h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">

                {/* Hero Welcome Section */}
                <div className="flex-1 flex items-center justify-center px-6 py-12">
                    <div className="max-w-4xl w-full">
                        {/* Animated greeting card */}
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="text-center mb-10"
                        >
                            {/* Avatar / Logo zone */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.15, duration: 0.4 }}
                                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/25"
                            >
                                <HeadphonesIcon className="w-10 h-10 text-white" />
                            </motion.div>

                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                                {t('client.welcome')}{' '}
                                <span className="text-emerald-600">{user?.fullName || 'Client'}</span> 👋
                            </h1>
                            <p className="text-base text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                                {t('client.welcome_subtitle')}
                            </p>
                        </motion.div>

                        {/* Professional KPI Overview */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.45 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
                        >
                            {[
                                { id: 'open', label: t('client.kpi_open_tickets'), value: openTicketsCount, tone: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
                                { id: 'progress', label: t('client.kpi_in_progress'), value: inProgressTicketsCount, tone: 'text-amber-700 bg-amber-50 border-amber-100' },
                                { id: 'urgent', label: t('client.kpi_urgent'), value: urgentTicketsCount, tone: 'text-rose-700 bg-rose-50 border-rose-100' },
                                { id: 'resolved', label: t('client.kpi_resolved'), value: resolvedTicketsCount, tone: 'text-slate-700 bg-slate-50 border-slate-200' },
                            ].map((item) => (
                                <div key={item.id} className={`rounded-2xl border p-4 ${item.tone}`}>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider opacity-80">{item.label}</p>
                                    <p className="text-2xl font-extrabold mt-1">{item.value}</p>
                                </div>
                            ))}
                        </motion.div>

                        {/* Main CTA Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.45 }}
                            className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-900/5 p-8 mb-6"
                        >
                            <div className="flex flex-col md:flex-row md:items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                                    <Ticket className="w-7 h-7 text-emerald-600" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-lg font-bold text-slate-900 mb-1">
                                        {t('client.create_ticket_title')}
                                    </h2>
                                    <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                                        {t('client.create_ticket_desc')}
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button
                                        onClick={() => setIsModalOpen(true)}
                                        className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-500/25 transition-all flex items-center gap-2.5"
                                    >
                                        <Plus className="w-4 h-4" />
                                        {t('client.new_ticket')}
                                    </Button>
                                    <Link to="/client-portal/tickets">
                                        <Button variant="outline" className="h-11 px-6 rounded-xl font-bold text-sm">
                                            {t('client.my_tickets')}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>



                        {/* Recent tickets summary */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, duration: 0.4 }}
                        >
                            {ownTickets.length > 0 ? (
                                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-slate-800">
                                            {t('client.recent_tickets')} ({openTicketsCount} {t('client.open')})
                                        </h3>
                                        <Link to="/client-portal/tickets">
                                            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                                {t('client.see_all')} <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </Link>
                                    </div>
                                    <div className="space-y-2">
                                        {ownTickets.slice(0, 3).map(ticket => (
                                            <Link key={ticket.id} to="/client-portal/tickets">
                                                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                                        ticket.status === 'OPEN' ? 'bg-emerald-500' :
                                                        ticket.status === 'IN_PROGRESS' ? 'bg-amber-500' :
                                                        ticket.status === 'RESOLVED' ? 'bg-slate-400' : 'bg-slate-300'
                                                    }`} />
                                                    <span className="text-sm font-semibold text-slate-700 flex-1 truncate">{ticket.title}</span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                                        ticket.priority === 'URGENT' ? 'bg-rose-50 text-rose-600' :
                                                        ticket.priority === 'HIGH' ? 'bg-amber-50 text-amber-600' :
                                                        'bg-slate-100 text-slate-500'
                                                    }`}>{ticket.priority}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-8 text-center">
                                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        {t('client.no_tickets_yet')}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>

            <CreateTicketModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </AppLayout>
    );
};

// ─── Full Admin/PM Client Dashboard ─────────────────────────────────────────
export const ClientDashboard: React.FC = () => {
    const { t } = useTranslation();
    const { state } = useStore();
    const { user } = useAuth();

    // Pure CLIENT role → show simplified welcome portal
    if (user?.role === 'CLIENT') {
        return <ClientWelcomePortal />;
    }

    const [notification, setNotification] = useState<string | null>(null);

    const showNotification = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleExportReport = () => {
        try {
            const doc = new jsPDF();
            const now = new Date();

            doc.setFillColor(16, 185, 129); // Emerald-500
            doc.rect(0, 0, 210, 40, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.text(t('client.report_title'), 20, 25);

            doc.setFontSize(10);
            doc.text(`${t('client.generated_on')} ${now.toLocaleString()}`, 150, 25);

            doc.setTextColor(30, 41, 59);
            doc.setFontSize(14);
            doc.text(`${t('client.client_label')} ${user?.fullName || 'Client'}`, 20, 55);
            doc.line(20, 58, 190, 58);

            doc.setFontSize(12);
            doc.text(t('client.summary_indicators'), 20, 70);

            const avgProgress = Math.round(state.projects.reduce((acc, p) => acc + p.progress, 0) / Math.max(state.projects.length, 1));
            const openTickets = state.tickets.filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length;

            doc.setFontSize(10);
            doc.text(`- ${t('client.active_projects_label')} ${state.projects.length}`, 25, 80);
            doc.text(`- ${t('client.avg_progress_label')} ${avgProgress}%`, 25, 87);
            doc.text(`- ${t('client.open_tickets_label')} ${openTickets}`, 25, 94);

            doc.setFontSize(12);
            doc.text(t('client.detailed_state'), 20, 110);
            doc.line(20, 112, 190, 112);

            let y = 125;
            state.projects.forEach((p, i) => {
                if (y > 250) { doc.addPage(); y = 20; }
                doc.setFontSize(11);
                doc.setTextColor(15, 23, 42);
                doc.text(`${p.name} - ${p.status}`, 20, y);

                doc.setFontSize(11);
                doc.setTextColor(100, 116, 139);
                doc.text(`${t('client.progress_label')} ${p.progress}%`, 25, y + 6);

                doc.setFillColor(241, 245, 249);
                doc.rect(25, y + 10, 100, 2, 'F');
                doc.setFillColor(16, 185, 129);
                doc.rect(25, y + 10, p.progress, 2, 'F');

                y += 25;
            });

            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(t('client.footer_confidential'), 20, 285);

            doc.save(`Report_Project_${user?.fullName?.replace(/\s+/g, '_')}_${now.toISOString().split('T')[0]}.pdf`);
            showNotification(t('client.export_success'));
        } catch (error) {
            console.error('Export error:', error);
            showNotification(t('client.export_error'));
        }
    };

    const isAdminOrRh = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'HR_ADMIN' || user?.role === 'RH';

    const clientProjects = state.projects.filter(p => {
        if (isAdminOrRh || user?.role === 'CLIENT') return true;
        const isManager = p.managerId === user?.id;
        const isMember = p.members?.some(m => m.id === user?.id);
        return isManager || isMember;
    });

    const clientTickets = state.tickets.filter(tk => {
        if (isAdminOrRh || user?.role === 'CLIENT') return true;
        const projectIds = new Set(clientProjects.map(p => p.id));
        return projectIds.has(tk.projectId);
    });

    const avgProgress = Math.round(clientProjects.reduce((acc, p) => acc + p.progress, 0) / Math.max(clientProjects.length, 1));
    const openTickets = clientTickets.filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length;

    const stats = [
        { label: t('client.active_projects'), value: clientProjects.length, icon: <Target className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' },
        { label: t('client.average_progress'), value: `${avgProgress}%`, icon: <TrendingUp className="w-5 h-5" />, color: 'bg-teal-50 text-teal-600 border border-teal-100/50' },
        { label: t('client.support_tickets'), value: openTickets, icon: <MessageSquare className="w-5 h-5" />, color: 'bg-indigo-50 text-indigo-600 border border-indigo-100/50' },
        { label: t('client.shared_documents'), value: '12', icon: <FileText className="w-5 h-5" />, color: 'bg-sky-50 text-sky-600 border border-sky-100/50' },
    ];

    return (
        <AppLayout title={t('client.client_space')} subtitle={t('client.interactive_dashboard')}>
            {/* Notification - shadcn style */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 20, x: '-50%' }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-4 left-1/2 z-[100] px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md"
                    >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold uppercase tracking-wider">{notification}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="p-6 space-y-8 max-w-7xl mx-auto">
                {/* Page Header & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                        {t('client.welcome')} <span className="text-emerald-600">{user?.fullName || 'Client'}</span>
                    </h1>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={handleExportReport}
                            className="h-10 px-5 rounded-xl font-bold text-xs bg-white border-slate-200 hover:bg-slate-50 text-slate-600 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <Printer className="w-4 h-4" /> 
                            {t('client.export_pdf')}
                        </Button>
                        {(isAdminOrRh || user?.role === 'CLIENT') && (
                            <Link to="/client-portal/tickets">
                                <Button className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 border-none">
                                    <Plus className="w-4 h-4" /> 
                                    {t('client.new_ticket')}
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Micro-Animated Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <div className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-sm hover:shadow-md hover:border-slate-200/60 transition-all flex items-center justify-between group">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                                    <h4 className="text-2xl font-extrabold text-slate-950 tracking-tight leading-none">{stat.value}</h4>
                                </div>
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform flex-shrink-0`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Dashboard Grid Workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Ongoing Projects Section (2/3 width) */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-slate-950 tracking-tight">{t('client.ongoing_projects')}</h3>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">Suivi détaillé et progression en temps réel</p>
                                </div>
                                <Link to="/client-portal/projects">
                                    <Button variant="ghost" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-55 hover:bg-emerald-50/50 rounded-xl h-9 px-3">
                                        {t('client.see_all')} 
                                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                    </Button>
                                </Link>
                            </div>
                            
                            <div className="space-y-4">
                                {clientProjects.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                                            <Target className="w-5 h-5 text-slate-350" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            {t('client.no_active_projects')}
                                        </p>
                                    </div>
                                ) : (
                                    clientProjects.map(project => (
                                        <div 
                                            key={project.id} 
                                            className="p-5 bg-white border border-slate-100 hover:border-slate-200 hover:shadow-md rounded-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-xl bg-emerald-50/80 border border-emerald-100/50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                                    <Target className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{project.name}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Phase active</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 flex-wrap md:flex-nowrap justify-between w-full md:w-auto">
                                                {/* Progress Indicator */}
                                                <div className="w-32 space-y-1">
                                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                                        <span className="text-slate-400">{t('common.progress')}</span>
                                                        <span className="text-emerald-600">{project.progress}%</span>
                                                    </div>
                                                    <Progress value={project.progress} className="h-1.5 bg-slate-100" />
                                                </div>

                                                {/* Status Badge */}
                                                <Badge className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wide border-none ${
                                                    project.status === 'IN_PROGRESS' 
                                                        ? 'bg-emerald-50 text-emerald-700' 
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {project.status === 'IN_PROGRESS' ? t('common.in_progress') : project.status}
                                                </Badge>

                                                {/* Link icon */}
                                                <Link to="/client-portal/projects">
                                                    <div className="w-8 h-8 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all">
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    </div>
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area (1/3 width) */}
                    <div className="space-y-6">
                        {/* Support & Tickets Panel */}
                        <Card className="border border-slate-100 rounded-3xl p-6 bg-white shadow-sm space-y-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-slate-950 tracking-tight">{t('client.recent_tickets')}</h3>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">Retours d'assistance</p>
                                </div>
                                <Link to="/client-portal/tickets">
                                    <Button variant="ghost" className="text-xs font-bold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl h-8 px-2.5">
                                        {t('client.see_all')}
                                    </Button>
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {clientTickets.slice(0, 3).map(ticket => (
                                    <Link 
                                        key={ticket.id} 
                                        to="/client-portal/tickets" 
                                        className="relative block p-4 bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm rounded-2xl transition-all group overflow-hidden pl-5"
                                    >
                                        {/* Colored vertical status band */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                                            ticket.priority === 'URGENT' ? 'bg-rose-500' : 'bg-emerald-500'
                                        }`} />

                                        <div className="flex items-center justify-between mb-2">
                                            <Badge className={`text-[8px] font-bold border-none px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                                ticket.priority === 'URGENT' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {ticket.priority}
                                            </Badge>
                                            <span className="text-[10px] text-slate-400 font-semibold">
                                                {new Date(ticket.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-1">
                                            {ticket.title}
                                        </h4>
                                        <div className="flex items-center gap-1.5 mt-2 text-slate-400">
                                            <span className="text-[9px] font-bold uppercase tracking-wider truncate">{ticket.projectName}</span>
                                        </div>
                                    </Link>
                                ))}

                                {clientTickets.length === 0 && (
                                    <div className="py-10 text-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aucun ticket actif</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};
