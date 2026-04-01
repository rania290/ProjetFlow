import React, { useState } from 'react';
import {
    TrendingUp,
    CheckCircle2, Target, Printer,
    Calendar, Clock, ShieldCheck,
    ArrowRight, MessageSquare, FileText, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/projectStore';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { jsPDF } from 'jspdf';

export const ClientDashboard: React.FC = () => {
    const { state } = useStore();
    const { user } = useAuth();
    const [notification, setNotification] = useState<string | null>(null);

    const showNotification = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleExportReport = () => {
        try {
            const doc = new jsPDF();
            const now = new Date();

            // Cover Page / Header
            doc.setFillColor(79, 70, 229);
            doc.rect(0, 0, 210, 40, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.text('RAPPORT D\'ACTIVITÉ PROJET', 20, 25);

            doc.setFontSize(10);
            doc.text(`Généré le: ${now.toLocaleString()}`, 150, 25);

            // Client Info
            doc.setTextColor(30, 41, 59);
            doc.setFontSize(14);
            doc.text(`Client : ${user?.fullName || 'Client'}`, 20, 55);
            doc.line(20, 58, 190, 58);

            // Summary Stats
            doc.setFontSize(12);
            doc.text('RÉSUMÉ DES INDICATEURS', 20, 70);

            const avgProgress = Math.round(state.projects.reduce((acc, p) => acc + p.progress, 0) / Math.max(state.projects.length, 1));
            const openTickets = state.tickets.filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length;

            doc.setFontSize(10);
            doc.text(`- Projets actifs : ${state.projects.length}`, 25, 80);
            doc.text(`- Progression moyenne : ${avgProgress}%`, 25, 87);
            doc.text(`- Tickets de support ouverts : ${openTickets}`, 25, 94);

            // Projects Table Simulation
            doc.setFontSize(12);
            doc.text('ÉTAT DÉTAILLÉ DES PROJETS', 20, 110);
            doc.line(20, 112, 190, 112);

            let y = 125;
            state.projects.forEach((p, i) => {
                if (y > 250) { doc.addPage(); y = 20; }
                doc.setFontSize(11);
                doc.setTextColor(15, 23, 42);
                doc.text(`${p.name} - ${p.status}`, 20, y);

                doc.setFontSize(9);
                doc.setTextColor(100, 116, 139);
                doc.text(`Progression: ${p.progress}%`, 25, y + 6);

                doc.setFillColor(241, 245, 249);
                doc.rect(25, y + 10, 100, 2, 'F');
                doc.setFillColor(79, 70, 229);
                doc.rect(25, y + 10, p.progress, 2, 'F');

                y += 25;
            });

            // Footer
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text('© 2026 VAERDIA - Ce document est confidentiel et destiné à l\'usage exclusif du client.', 20, 285);

            doc.save(`Rapport_Projet_${user?.fullName?.replace(/\s+/g, '_')}_${now.toISOString().split('T')[0]}.pdf`);
            showNotification('Rapport exporté avec succès');
        } catch (error) {
            console.error('Export error:', error);
            showNotification('Erreur lors de l\'exportation');
        }
    };

    const clientProjects = state.projects;
    const avgProgress = Math.round(clientProjects.reduce((acc, p) => acc + p.progress, 0) / Math.max(clientProjects.length, 1));
    const openTickets = state.tickets.filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length;

    const stats = [
        { label: 'Projets Actifs', value: clientProjects.length, icon: <Target className="w-5 h-5" />, color: 'from-blue-500 to-indigo-600' },
        { label: 'Progression Moyenne', value: `${avgProgress}%`, icon: <TrendingUp className="w-5 h-5" />, color: 'from-emerald-500 to-teal-600' },
        { label: 'Tickets Ouverts', value: openTickets, icon: <MessageSquare className="w-5 h-5" />, color: 'from-amber-500 to-orange-600' },
        { label: 'Documents Partagés', value: '12', icon: <FileText className="w-5 h-5" />, color: 'from-violet-500 to-purple-600' },
    ];

    return (
        <AppLayout title="Espace Client" subtitle="Tableau de bord et vue d'ensemble">
            {/* Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 20, x: '-50%' }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-4 left-1/2 z-[100] px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md"
                    >
                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium">{notification}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="p-8 space-y-8 max-w-7xl mx-auto">
                {/* Header section content moved to AppLayout title/subtitle or kept here */}
                {/* I'll keep the internal header but wrap everything */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Bienvenue, {user?.fullName || 'Client'}</h1>
                        <p className="text-slate-500 text-sm mt-1">Voici un aperçu de l'état de vos projets et de vos demandes en cours.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportReport}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <Printer className="w-4 h-4" /> Exporter Rapport
                        </button>
                        <Link
                            to="/client-portal/tickets"
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100"
                        >
                            Nouveau Ticket
                        </Link>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4 shadow-lg shadow-current/10 group-hover:scale-110 transition-transform`}>
                                {stat.icon}
                            </div>
                            <div className="text-3xl font-bold text-slate-900 leading-none">{stat.value}</div>
                            <div className="text-sm font-medium text-slate-500 mt-2">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Activities */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                                <h2 className="font-bold text-slate-800">Projets en cours</h2>
                                <Link to="/client-portal/projects" className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1">
                                    Tout voir <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {clientProjects.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400">Aucun projet actif pour le moment.</div>
                                ) : (
                                    clientProjects.map(project => (
                                        <div key={project.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="font-bold text-slate-900">{project.name}</h3>
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{project.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${project.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' :
                                                        project.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600'
                                                        }`}>
                                                        {project.status === 'IN_PROGRESS' ? 'EN COURS' : project.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold">
                                                    <span className="text-slate-500">Progression</span>
                                                    <span className="text-indigo-600">{project.progress}%</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${project.progress}%` }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar context */}
                    <div className="space-y-6">
                        {/* Recent Support activity */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-500" /> Tickets Récents
                            </h3>
                            <div className="space-y-4">
                                {state.tickets.slice(0, 3).map(ticket => (
                                    <div key={ticket.id} className="flex gap-4">
                                        <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${ticket.priority === 'URGENT' ? 'bg-red-500' : 'bg-indigo-400'
                                            }`} />
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 line-clamp-1">{ticket.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-slate-400 font-medium">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{ticket.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Link to="/client-portal/tickets" className="block text-center pt-2 text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
                                    Gérer mes tickets
                                </Link>
                            </div>
                        </div>

                        {/* Support card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                            <ShieldCheck className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-500" />
                            <div className="relative z-10">
                                <h3 className="font-bold text-lg mb-2">Besoin d'aide ?</h3>
                                <p className="text-white/80 text-xs mb-6 leading-relaxed">
                                    Notre équipe technique est à votre disposition 24/7 pour répondre à vos besoins.
                                </p>
                                <button className="w-full py-2.5 bg-white text-indigo-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm">
                                    Contacter le support
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};
