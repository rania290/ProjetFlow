import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Calendar, Users, TrendingUp, CheckCircle2, Clock, Shield } from 'lucide-react';
import type { Project } from '../../types/project.types';

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
                        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header Image/Pattern */}
                        <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-700 relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors backdrop-blur-md"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="absolute -bottom-6 left-8 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-indigo-600 border-4 border-white">
                                <Target className="w-8 h-8" />
                            </div>
                        </div>

                        <div className="pt-10 px-8 pb-8 space-y-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">{project.name}</h2>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${project.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                        }`}>
                                        {project.status === 'IN_PROGRESS' ? 'En Cours' : project.status}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    {project.description || "Aucune description détaillée fournie pour ce projet."}
                                </p>
                            </div>

                            {/* Progress Section */}
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-indigo-500" /> Progression Globale
                                    </span>
                                    <span className="text-sm font-bold text-indigo-600">{project.progress}%</span>
                                </div>
                                <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-100">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${project.progress}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                                    />
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                    <Calendar className="w-5 h-5 text-indigo-500 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date de début</p>
                                        <p className="text-sm font-bold text-slate-800">{new Date(project.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                    <Users className="w-5 h-5 text-indigo-500 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Équipe Projet</p>
                                        <p className="text-sm font-bold text-slate-800">{project.members?.length || 0} Membres assignés</p>
                                    </div>
                                </div>
                            </div>

                            {/* Mock Milestones */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Jalons Récents</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs font-medium text-slate-700">Validation du Cahier des Charges</span>
                                        <span className="ml-auto text-[10px] text-slate-400 font-bold">TERMINÉ</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl">
                                        <Clock className="w-4 h-4 text-amber-500" />
                                        <span className="text-xs font-medium text-slate-700">Développement du Prototype UI/UX</span>
                                        <span className="ml-auto text-[10px] text-amber-600 font-bold">EN COURS</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="w-full py-3 px-4 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                >
                                    Fermer les détails
                                </button>
                            </div>
                        </div>

                        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
                            <Shield className="w-3 h-3 text-slate-400" />
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Informations Certifiées VAERDIA</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
