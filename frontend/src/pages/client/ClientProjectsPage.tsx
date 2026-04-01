import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FolderKanban, Filter, Search,
    Calendar, Users, ArrowUpRight,
    TrendingUp, ExternalLink
} from 'lucide-react';
import { useStore } from '../../store/projectStore';
import { AppLayout } from '../../components/layout/AppLayout';
import { ProjectDetailsModal } from '../../components/client/ProjectDetailsModal';
import type { Project } from '../../types/project.types';

export const ClientProjectsPage: React.FC = () => {
    const { state } = useStore();
    const projects = state.projects;
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenDetails = (project: Project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    return (
        <AppLayout title="Mes Projets" subtitle="Suivi détaillé de vos collaborations">
            <div className="p-8 max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Mes Projets</h1>
                    <p className="text-slate-500 text-sm mt-1">Suivi détaillé de vos collaborations avec VAERDIA.</p>
                </header>

                {/* Filters Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un projet..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                            <Filter className="w-4 h-4" /> Filtres
                        </button>
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project, i) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <FolderKanban className="w-5 h-5" />
                                    </div>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${project.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                                        }`}>
                                        {project.status}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                    {project.name}
                                </h3>
                                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                                    {project.description}
                                </p>

                                <div className="mt-6 flex items-center gap-4 text-xs font-medium text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" /> {new Date(project.startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5" /> {project.members?.length || 0} membres
                                    </span>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 space-y-3">
                                <div className="flex justify-between items-center text-[11px] font-bold">
                                    <span className="text-slate-500 uppercase tracking-widest">Avancement</span>
                                    <span className="text-indigo-600">{project.progress}%</span>
                                </div>
                                <div className="h-1.5 bg-white border border-slate-200 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${project.progress}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                                    />
                                </div>
                                <button
                                    onClick={() => handleOpenDetails(project)}
                                    className="w-full mt-2 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400 hover:text-indigo-600 py-1 transition-colors"
                                >
                                    Détails du projet <ExternalLink className="w-3 h-3" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <ProjectDetailsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    project={selectedProject}
                />
            </div>
        </AppLayout>
    );
};
