import React, { useState } from 'react';
import {
    TrendingUp,
    CheckCircle2, Target, Printer,
    Calendar, Clock, ShieldCheck,
    ArrowRight, MessageSquare, FileText, Check, Plus, LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/projectStore';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { jsPDF } from 'jspdf';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

            doc.setFillColor(16, 185, 129); // Emerald-500
            doc.rect(0, 0, 210, 40, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.text('RAPPORT D\'ACTIVITÉ PROJET', 20, 25);

            doc.setFontSize(10);
            doc.text(`Généré le: ${now.toLocaleString()}`, 150, 25);

            doc.setTextColor(30, 41, 59);
            doc.setFontSize(14);
            doc.text(`Client : ${user?.fullName || 'Client'}`, 20, 55);
            doc.line(20, 58, 190, 58);

            doc.setFontSize(12);
            doc.text('RÉSUMÉ DES INDICATEURS', 20, 70);

            const avgProgress = Math.round(state.projects.reduce((acc, p) => acc + p.progress, 0) / Math.max(state.projects.length, 1));
            const openTickets = state.tickets.filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length;

            doc.setFontSize(10);
            doc.text(`- Projets actifs : ${state.projects.length}`, 25, 80);
            doc.text(`- Progression moyenne : ${avgProgress}%`, 25, 87);
            doc.text(`- Tickets de support ouverts : ${openTickets}`, 25, 94);

            doc.setFontSize(12);
            doc.text('ÉTAT DÉTAILLÉ DES PROJETS', 20, 110);
            doc.line(20, 112, 190, 112);

            let y = 125;
            state.projects.forEach((p, i) => {
                if (y > 250) { doc.addPage(); y = 20; }
                doc.setFontSize(11);
                doc.setTextColor(15, 23, 42);
                doc.text(`${p.name} - ${p.status}`, 20, y);

                doc.setFontSize(11);
                doc.setTextColor(100, 116, 139);
                doc.text(`Progression: ${p.progress}%`, 25, y + 6);

                doc.setFillColor(241, 245, 249);
                doc.rect(25, y + 10, 100, 2, 'F');
                doc.setFillColor(16, 185, 129);
                doc.rect(25, y + 10, p.progress, 2, 'F');

                y += 25;
            });

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
        { label: 'Projets Actifs', value: clientProjects.length, icon: <Target className="w-5 h-5" />, color: 'from-emerald-500 to-teal-600' },
        { label: 'Progression Moyenne', value: `${avgProgress}%`, icon: <TrendingUp className="w-5 h-5" />, color: 'from-blue-500 to-indigo-600' },
        { label: 'Tickets Support', value: openTickets, icon: <MessageSquare className="w-5 h-5" />, color: 'from-amber-500 to-orange-600' },
        { label: 'Documents Partagés', value: '12', icon: <FileText className="w-5 h-5" />, color: 'from-violet-500 to-purple-600' },
    ];

    return (
        <AppLayout title="Espace Client" subtitle="Tableau de bord interactif">
            {/* Notification - shadcn style - Legible Font */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 20, x: '-50%' }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-4 left-1/2 z-[100] px-6 py-3 bg-slate-900/90 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md"
                    >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-black uppercase tracking-widest">{notification}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="p-4 space-y-4 max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/10">
                            <LayoutDashboard className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Bonjour, {user?.fullName || 'Client'}</h1>
                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1">Activité en temps réel</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            onClick={handleExportReport}
                            className="h-8 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest bg-white border-slate-100 shadow-sm hover:bg-slate-50"
                        >
                            <Printer className="w-3.5 h-3.5 mr-2" /> Exporter PDF
                        </Button>
                        <Link to="/client-portal/tickets">
                            <Button className="h-8 px-4 bg-emerald-600 text-white rounded-lg font-black text-[9px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-black transition-all">
                                <Plus className="w-3.5 h-3.5 mr-2" /> Nouveau Ticket
                            </Button>
                        </Link>
                    </div>
                </header>

                {/* Condensed Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className="border-none shadow-sm hover:shadow-lg transition-all rounded-[18px] overflow-hidden group bg-white">
                                <CardContent className="p-4 flex flex-row items-center gap-4 sm:items-center">
                                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                                        <div className="w-4 h-4 flex items-center justify-center child-icon-compact">
                                            {stat.icon}
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="text-xl font-black text-slate-900 tracking-tighter leading-none">{stat.value}</div>
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Projects Status - High Density for Layout, High Legibility for Text */}
                    <div className="lg:col-span-2">
                        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                            <CardHeader className="px-8 py-5 border-b border-slate-50 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest">Projets en cours</CardTitle>
                                <Link to="/client-portal/projects">
                                    <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl h-9">
                                        Voir Tout <ArrowRight className="w-3.5 h-3.5 ml-2" />
                                    </Button>
                                </Link>
                            </CardHeader>
                            <div className="divide-y divide-slate-50">
                                {clientProjects.length === 0 ? (
                                    <div className="p-12 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Aucun projet actif</div>
                                ) : (
                                    clientProjects.map(project => (
                                        <div key={project.id} className="p-4 hover:bg-slate-50/50 transition-colors group">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                                        <Target className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">{project.name}</h3>
                                                        <p className="text-[11px] font-medium text-slate-400 mt-0.5 line-clamp-1">{project.description}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${project.status === 'IN_PROGRESS' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500'
                                                    }`}>
                                                    {project.status === 'IN_PROGRESS' ? 'EN COURS' : project.status}
                                                </Badge>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-center px-0.5">
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Avancement</span>
                                                    <span className="text-xs font-black text-emerald-600">{project.progress}%</span>
                                                </div>
                                                <Progress value={project.progress} className="h-1 bg-slate-100" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar context - Legible sidebar text */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-sm rounded-[24px] overflow-hidden p-5 bg-white">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-emerald-500" /> Tickets Récents
                            </h3>
                            <div className="space-y-4">
                                {state.tickets.slice(0, 3).map(ticket => (
                                    <Link key={ticket.id} to="/client-portal/tickets" className="flex gap-3 group cursor-pointer">
                                        <div className={`w-1 h-8 rounded-full flex-shrink-0 transition-all ${ticket.priority === 'URGENT' ? 'bg-rose-500' : 'bg-emerald-500'
                                            }`} />
                                        <div className="overflow-hidden">
                                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight group-hover:text-emerald-600 transition-colors line-clamp-1">{ticket.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] text-slate-300 font-bold uppercase">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                                                <Badge variant="secondary" className="text-[8px] font-black uppercase px-1.5 py-0 h-3.5 bg-slate-50 text-slate-400 border-none">
                                                    {ticket.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                <Button variant="ghost" className="w-full mt-1 text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg h-8">
                                    Voir Tout <ArrowRight className="w-3 h-3 ml-2" />
                                </Button>
                            </div>
                        </Card>

                        {/* Premium Support Card Compact */}
                        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[24px] p-5 text-white shadow-xl shadow-emerald-500/10 relative overflow-hidden group">
                            <ShieldCheck className="absolute -right-4 -bottom-4 w-20 h-20 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-500" />
                            <div className="relative z-10">
                                <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center mb-4">
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                                <h3 className="font-black text-lg mb-1 tracking-tight">Support</h3>
                                <p className="text-white/80 text-xs font-medium mb-5 leading-snug">
                                    Expertise VAERDIA dédiée 24/7.
                                </p>
                                <Button className="w-full h-9 bg-white text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] hover:bg-slate-100 shadow-md shadow-black/5">
                                    Contacter
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};
