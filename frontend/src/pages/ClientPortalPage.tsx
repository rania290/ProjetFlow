import React from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    CheckCircle2, Target, Printer,
    Calendar, Clock, ShieldCheck
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { useStore } from '../store/projectStore';
import { useAuth } from '../hooks/useAuth';

export const ClientPortalPage: React.FC = () => {
    const { state } = useStore();
    const { user } = useAuth();

    // Filter projects where the user might be the client (if clientName matches or just show overall summary for demo)
    const clientProjects = state.projects;

    const avgProgress = Math.round(clientProjects.reduce((acc, p) => acc + p.progress, 0) / Math.max(clientProjects.length, 1));

    const tasksByStatus = {
        TODO: state.tasks.filter(t => t.status === 'TODO').length,
        IN_PROGRESS: state.tasks.filter(t => t.status === 'IN_PROGRESS').length,
        IN_TEST: state.tasks.filter(t => t.status === 'IN_TEST').length,
        DONE: state.tasks.filter(t => t.status === 'DONE').length,
    };


    return (
        <AppLayout title="Portail Client" subtitle="Suivi transparent de vos projets et livrables">
            <div className="p-6 space-y-6">

                {/* Welcome Message */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold mb-2">Bonjour, {user?.fullName || 'Client'}</h2>
                        <p className="text-indigo-100 text-sm max-w-2xl">
                            Bienvenue sur votre espace dédié. Vous pouvez suivre ici l'état d'avancement de vos projets,
                            consulter les métriques clés et accéder aux derniers rapports de livraison.
                        </p>
                    </div>
                    <ShieldCheck className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white/10 rotate-12" />
                </motion.div>

                {/* KPI Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Projets Actifs', value: clientProjects.length, sub: 'En cours de réalisation', icon: <Target className="w-5 h-5" />, color: 'from-blue-500 to-blue-600' },
                        { label: 'Avancement Moyen', value: `${avgProgress}%`, sub: 'Sur l\'ensemble des projets', icon: <TrendingUp className="w-5 h-5" />, color: 'from-emerald-500 to-emerald-600' },
                        { label: 'Tâches Terminées', value: tasksByStatus.DONE, sub: `sur ${state.tasks.length} identifiées`, icon: <CheckCircle2 className="w-5 h-5" />, color: 'from-indigo-500 to-indigo-600' },
                        { label: 'Prochaine Livraison', value: '12 Mars', sub: 'Sprint 1 - V1.0', icon: <Calendar className="w-5 h-5" />, color: 'from-amber-500 to-amber-600' },
                    ].map((kpi, i) => (
                        <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
                        >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white mb-4 shadow-sm`}>
                                {kpi.icon}
                            </div>
                            <div className="text-2xl font-bold text-slate-900 mb-0.5">{kpi.value}</div>
                            <div className="text-sm font-semibold text-slate-700 mb-1">{kpi.label}</div>
                            <div className="text-[11px] text-slate-400">{kpi.sub}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Project Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800">Détails des Projets</h3>
                            <button className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1">
                                <Printer className="w-3.5 h-3.5" /> Exporter le rapport
                            </button>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {clientProjects.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm">Aucun projet à afficher</div>
                            ) : clientProjects.map((p) => (
                                <div key={p.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="font-bold text-slate-900">{p.name}</h4>
                                            <p className="text-xs text-slate-400 mt-0.5">{p.description.substring(0, 100)}...</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${p.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' :
                                            p.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600'
                                            }`}>
                                            {p.status}
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[11px] font-bold">
                                            <span className="text-slate-500">Progression globale</span>
                                            <span className="text-slate-900">{p.progress}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${p.progress}%` }}
                                                transition={{ duration: 1 }}
                                                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar components for portal */}
                    <div className="space-y-6">
                        {/* Summary */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-500" /> Historique récent
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { text: 'Mise à jour du Sprint 1', time: 'Hier, 14:30', type: 'update' },
                                    { text: 'Nouveau document : Spécifications V1.2', time: '2 mars 2026', type: 'doc' },
                                    { text: 'Validation de l\'étape d\'analyse', time: '28 fév. 2026', type: 'milestone' },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-medium text-slate-800">{item.text}</p>
                                            <p className="text-[10px] text-slate-400">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Support Widget */}
                        <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                            <h3 className="font-bold text-indigo-900 text-sm mb-2">Besoin d'assistance ?</h3>
                            <p className="text-indigo-700 text-[11px] mb-4">
                                Votre chef de projet dédié est disponible pour répondre à vos questions.
                            </p>
                            <button className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                                Contacter le support
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};
