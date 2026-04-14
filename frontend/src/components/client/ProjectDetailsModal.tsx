import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Calendar, Users, TrendingUp, CheckCircle2, Clock, Shield } from 'lucide-react';
import type { Project } from '../../types/project.types';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ProjectDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project | null;
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({ isOpen, onClose, project }) => {
    if (!project) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* High-Density Header (Keep) */}
                        <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-600 relative">
                            <button
                                onClick={onClose}
                                className="absolute top-3 right-3 p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors backdrop-blur-md"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="absolute -bottom-5 left-6 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-emerald-600 border-4 border-white">
                                <Target className="w-6 h-6" />
                            </div>
                        </div>

                        {/* Content Area - Condensed Layout but Legible Fonts */}
                        <div className="pt-8 px-6 pb-6 space-y-5 text-slate-900">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    {/* Restored title font size: text-xl (20px) */}
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{project.name}</h2>
                                    {/* Restored label font size: text-xs (12px) */}
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${project.status === 'IN_PROGRESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
                                        }`}>
                                        {project.status === 'IN_PROGRESS' ? 'En Cours' : project.status}
                                    </span>
                                </div>
                                {/* Restored description font size: text-sm (14px) */}
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                    {project.description || "Aucune description détaillée fournie."}
                                </p>
                            </div>

                            {/* Progress Section */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <div className="flex justify-between items-center mb-2.5">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-emerald-500" /> Progression
                                    </span>
                                    <span className="text-sm font-black text-emerald-600">{project.progress}%</span>
                                </div>
                                <div className="h-1.5 bg-white rounded-full overflow-hidden border border-slate-100">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${project.progress}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500"
                                    />
                                </div>
                            </div>

                            {/* Info Grid - Optimized but Legible */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-3 p-3.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Date de début</p>
                                        <p className="text-sm font-black text-slate-800">{new Date(project.startDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Participants</p>
                                        <p className="text-sm font-black text-slate-800">{project.members?.length || 0} Membres</p>
                                    </div>
                                </div>
                            </div>

                            {/* Milestones - High Density but Legible */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Jalons Stratégiques</h3>
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-3 p-3.5 bg-emerald-50/30 border border-emerald-100 rounded-xl shadow-sm">
                                        <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-[11px] font-black text-emerald-900 uppercase tracking-tight">Cahier des Charges validé</span>
                                        <span className="ml-auto text-[10px] text-emerald-600 font-black uppercase tracking-widest bg-white/50 px-2 py-0.5 rounded-full">Terminé</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3.5 bg-white border border-slate-100 rounded-xl">
                                        <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                                            <Clock className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Prototype UI/UX interactif</span>
                                        <span className="ml-auto text-[10px] text-amber-600 font-black uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-full">En cours</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 px-4 bg-emerald-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-[18px] hover:bg-black transition-all shadow-xl shadow-emerald-100"
                                >
                                    Fermer les détails
                                </button>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
                             <div className="flex items-center gap-2 opacity-50">
                                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.1em]">Documents Certifiés VAERDIA</span>
                             </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
