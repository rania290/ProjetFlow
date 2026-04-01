import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Save, FolderKanban, Zap, Calendar, DollarSign,
    Tag, FileText, Users, ChevronRight
} from 'lucide-react';
import { useStore } from '../../store/projectStore';
import type { Project, ProjectType, ProjectStatus } from '../../types/project.types';
import { projectsService } from '../../api/projects.service';

const PROJECT_TYPES: { id: ProjectType; label: string; desc: string; icon: React.ReactNode; color: string; gradient: string }[] = [
    {
        id: 'WEB_APPLICATION',
        label: 'Application Web',
        desc: 'Site web ou plateforme web responsive',
        icon: <Tag className="w-5 h-5" />,
        color: 'text-blue-600',
        gradient: 'from-blue-500 to-cyan-600',
    },
    {
        id: 'MOBILE_APP',
        label: 'Application Mobile',
        desc: 'Application iOS ou Android native',
        icon: <Users className="w-5 h-5" />,
        color: 'text-green-600',
        gradient: 'from-green-500 to-emerald-600',
    },
    {
        id: 'API_INTEGRATION',
        label: 'API Integration',
        desc: 'Service web ou intégration d\'API',
        icon: <ChevronRight className="w-5 h-5" />,
        color: 'text-purple-600',
        gradient: 'from-purple-500 to-pink-600',
    },
];

const STATUS_OPTIONS: { id: ProjectStatus; label: string; dot: string }[] = [
    { id: 'PLANNED', label: 'Planifié', dot: 'bg-slate-400' },
    { id: 'IN_PROGRESS', label: 'En cours', dot: 'bg-blue-500' },
    { id: 'DELIVERED', label: 'Livré', dot: 'bg-emerald-500' },
    { id: 'SUSPENDED', label: 'Suspendu', dot: 'bg-red-400' },
];

interface Props {
    project: Project;
    onClose: () => void;
}

export const ProjectSettingsModal: React.FC<Props> = ({ project, onClose }) => {
    const { dispatch } = useStore();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState({
        name: project.name,
        description: project.description,
        type: project.type,
        status: project.status,
        clientName: project.clientName || '',
        budget: project.budget.toString(),
        startDate: project.startDate,
        endDate: project.endDate,
    });

    const set = (field: string, value: string) => {
        setForm(f => ({ ...f, [field]: value }));
        if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n; });
    };

    const handleSave = async () => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = 'Le nom est requis.';
        if (!form.description.trim()) e.description = 'La description est requise.';
        if (!form.startDate) e.startDate = 'Date de début requise.';
        if (!form.endDate) e.endDate = 'Date de fin requise.';
        
        if (Object.keys(e).length > 0) {
            setErrors(e);
            return;
        }

        setLoading(true);

        const updatePayload = {
            name: form.name.trim(),
            description: form.description.trim(),
            type: form.type,
            status: form.status,
            clientName: form.clientName.trim() || undefined,
            budget: form.budget ? Number(form.budget) : 0,
            startDate: form.startDate,
            endDate: form.endDate,
        };

        const updatedProject = { ...project, ...updatePayload };

        try {
            const response = await projectsService.update(project.id, updatePayload);
            dispatch({ type: 'UPDATE_PROJECT', project: { ...updatedProject, ...response } });
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 404) {
                dispatch({ type: 'UPDATE_PROJECT', project: updatedProject });
            } else {
                console.error('Failed to update project:', err);
                const msg = err?.response?.data?.message || 'Erreur lors de la mise à jour.';
                setErrors({ submit: msg });
                setLoading(false);
                return;
            }
        }

        setLoading(false);
        setErrors({ success: 'Roadmap synchronisée avec succès !' });
        setTimeout(() => onClose(), 1500);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-2xl bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border border-white/50 overflow-hidden max-h-[90vh] flex flex-col"
            >
                {/* Visual Accent Header */}
                <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
                
                {/* Header */}
                <div className="px-8 py-6 flex items-center justify-between border-b border-white/40">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 ring-4 ring-indigo-500/5">
                            <FolderKanban className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 font-display uppercase tracking-tight">Paramètres Projet</h2>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 opacity-70">Configuration & Roadmap • {project.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 text-slate-400 hover:text-slate-900">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pr-2 border-l-2 border-indigo-500 pl-2">Informations Générales</label>
                            <input
                                value={form.name}
                                onChange={e => set('name', e.target.value)}
                                placeholder="Nom du projet"
                                className={`w-full px-5 py-3.5 bg-slate-50/50 border ${errors.name ? 'border-red-300 ring-4 ring-red-500/5' : 'border-slate-200/60'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 transition-all outline-none font-medium text-slate-700 placeholder:text-slate-300`}
                            />
                            {errors.name && <p className="text-[10px] font-bold text-red-500 mt-2 ml-1">{errors.name}</p>}
                        </div>

                        <div className="col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pr-2 border-l-2 border-slate-200 pl-2">Description Roadmap</label>
                            <textarea
                                value={form.description}
                                onChange={e => set('description', e.target.value)}
                                rows={4}
                                placeholder="Décrivez les objectifs majeurs..."
                                className={`w-full px-5 py-3.5 bg-slate-50/50 border ${errors.description ? 'border-red-300 ring-4 ring-red-500/5' : 'border-slate-200/60'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 transition-all outline-none resize-none font-medium text-slate-700 placeholder:text-slate-300`}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pr-2 border-l-2 border-indigo-500 pl-2">Phase Actuelle</label>
                            <div className="relative">
                                <select
                                    value={form.status}
                                    onChange={e => set('status', e.target.value as ProjectStatus)}
                                    className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 transition-all outline-none appearance-none font-black text-[11px] uppercase tracking-tight text-slate-700"
                                >
                                    {STATUS_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                    <ChevronRight className="w-4 h-4 rotate-90" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pr-2 border-l-2 border-slate-200 pl-2">Architecture</label>
                            <div className="relative">
                                <select
                                    value={form.type}
                                    onChange={e => set('type', e.target.value as ProjectType)}
                                    className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 transition-all outline-none appearance-none font-black text-[11px] uppercase tracking-tight text-slate-700"
                                >
                                    {PROJECT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                    <ChevronRight className="w-4 h-4 rotate-90" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pr-2 border-l-2 border-indigo-500 pl-2">Client Associé</label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input
                                    value={form.clientName}
                                    onChange={e => set('clientName', e.target.value)}
                                    className="w-full pl-11 pr-5 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 transition-all outline-none font-medium text-slate-700"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pr-2 border-l-2 border-slate-200 pl-2">Budget Prévisionnel</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input
                                    type="number"
                                    value={form.budget}
                                    onChange={e => set('budget', e.target.value)}
                                    className="w-full pl-11 pr-5 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 transition-all outline-none font-black text-xs text-indigo-600"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pr-2 border-l-2 border-indigo-500 pl-2">Date Lancement</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input
                                    type="date"
                                    value={form.startDate}
                                    onChange={e => set('startDate', e.target.value)}
                                    className={`w-full pl-11 pr-5 py-3.5 bg-slate-50/50 border ${errors.startDate ? 'border-red-300' : 'border-slate-200/60'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 transition-all outline-none font-black text-[11px] uppercase tracking-tighter text-slate-700`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pr-2 border-l-2 border-slate-200 pl-2">Date Echéance</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input
                                    type="date"
                                    value={form.endDate}
                                    onChange={e => set('endDate', e.target.value)}
                                    className={`w-full pl-11 pr-5 py-3.5 bg-slate-50/50 border ${errors.endDate ? 'border-red-300' : 'border-slate-200/60'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 transition-all outline-none font-black text-[11px] uppercase tracking-tighter text-slate-700`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-8 py-6 border-t border-white/40 bg-slate-50/30 flex flex-col gap-5">
                    <AnimatePresence>
                        {errors.submit && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3 px-4 py-3 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-red-100 shadow-sm">
                                <Zap className="w-4 h-4" /> {errors.submit}
                            </motion.div>
                        )}
                        {errors.success && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-100 shadow-sm">
                                <Save className="w-4 h-4" /> {errors.success}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-all"
                        >
                            Ignorer
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading || !!errors.success}
                            className={`flex items-center justify-center gap-3 px-10 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-2xl hover:bg-black transition-all shadow-lg shadow-indigo-500/20 active:scale-95 ${(loading || errors.success) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><Save className="w-4 h-4" /> Synchroniser</>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
