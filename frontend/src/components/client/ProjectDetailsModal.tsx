import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Calendar, Clock, AlertTriangle } from 'lucide-react';
import type { Project } from '../../types/project.types';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
                        className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Minimalist Header */}
                        <div className="pt-8 px-8 flex items-center justify-between">
                            <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <Target className="w-5 h-5" />
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="p-8 space-y-8">
                            <div>
                                <div className="flex items-center justify-between mb-2.5">
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{project.name}</h2>
                                    <Badge variant="outline" className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${project.status === 'IN_PROGRESS' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                                        }`}>
                                        {project.status === 'PLANNED' ? 'Planifié' : project.status === 'IN_PROGRESS' ? 'En Cours' : project.status}
                                    </Badge>
                                </div>
                                <p className="text-[12px] font-medium text-slate-400 leading-relaxed">
                                    {project.description || "Aucune description fournie."}
                                </p>
                            </div>

                            {/* Progress Section */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.1em] text-slate-400">
                                    <span>Progression du projet</span>
                                    <span className="text-emerald-600 text-xs">{project.progress}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${project.progress}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Important Dates Grid (Start & Deadline) */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                        <Calendar className="w-3 h-3 text-emerald-500" /> Lancement
                                    </p>
                                    <p className="text-xs font-black text-slate-800">{new Date(project.startDate).toLocaleDateString()}</p>
                                </div>
                                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                                    <p className="text-[9px] font-black text-amber-600/70 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-amber-500" /> Échéance
                                    </p>
                                    <p className="text-xs font-black text-amber-900">{new Date(project.endDate).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <Button
                                onClick={onClose}
                                className="w-full h-12 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-100 transition-all"
                            >
                                Fermer
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
