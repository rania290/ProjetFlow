import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
    FolderKanban, Filter, Search,
    Calendar, Users, ArrowUpRight,
    TrendingUp, ExternalLink, LayoutGrid, ListFilter, Target
} from 'lucide-react';
import { useStore } from '../../store/projectStore';
import { AppLayout } from '../../components/layout/AppLayout';
import { ProjectDetailsModal } from '../../components/client/ProjectDetailsModal';
import type { Project } from '../../types/project.types';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const ClientProjectsPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { state } = useStore();
    const projects = state.projects;
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleOpenDetails = (project: Project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const filteredProjects = projects.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout title={t('client.my_projects')} subtitle={t('client.detailed_followup')}>
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Premium Header - Condensed Layout but Legible */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                            <FolderKanban className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('client.my_projects')}</h1>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-0.5">{t('client.vaerdia_followup')}</p>
                        </div>
                    </div>
                </header>

                {/* Optimized Filters Bar - Legible Fonts */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={t('client.search_project_placeholder')}
                            className="w-full pl-10 h-10 border-slate-100 bg-white rounded-xl text-sm focus-visible:ring-emerald-500/10 placeholder:text-slate-400"
                        />
                    </div>
                    <Button variant="outline" className="h-10 px-5 rounded-xl border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-500">
                        <ListFilter className="w-3.5 h-3.5 mr-2" /> {t('client.filters')}
                    </Button>
                </div>

                {/* Projects Grid - High Density Cards with Legible Text */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.length === 0 ? (
                        <div className="col-span-full py-12 text-center">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('client.no_projects_found')}</p>
                        </div>
                    ) : (
                        filteredProjects.map((project, i) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="border-none shadow-sm hover:shadow-xl transition-all rounded-[32px] overflow-hidden group bg-white">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-5">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                                <Target className="w-5 h-5" />
                                            </div>
                                            <Badge variant="outline" className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                project.status === 'IN_PROGRESS' 
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                                    : 'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                                {project.status === 'IN_PROGRESS' ? t('common.in_progress') : project.status}
                                            </Badge>
                                        </div>

                                        <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight mb-2">
                                            {project.name}
                                        </h3>
                                        <p className="text-sm font-medium text-slate-400 line-clamp-2 leading-relaxed mb-5">
                                            {project.description}
                                        </p>

                                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 rounded-lg">
                                                <Calendar className="w-3.5 h-3.5 text-emerald-500" /> 
                                                {new Date(project.startDate).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 rounded-lg">
                                                <Users className="w-3.5 h-3.5 text-emerald-500" /> 
                                                {t('client.members_count', { count: project.members?.length || 0 })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 space-y-4">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('client.global_progress')}</span>
                                            <span className="text-xs font-black text-emerald-600 font-black">{project.progress}%</span>
                                        </div>
                                        <Progress value={project.progress} className="h-1.5 bg-white" />
                                        
                                        <Button
                                            onClick={() => handleOpenDetails(project)}
                                            variant="ghost"
                                            className="w-full mt-1 h-9 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100"
                                        >
                                            {t('client.view_details')} <ArrowUpRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    )}
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
