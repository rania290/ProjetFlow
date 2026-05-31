import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
    Calendar, Users, ArrowUpRight, Target, Search, ListFilter
} from 'lucide-react';
import { useStore } from '../../store/projectStore';
import { useAuth } from '../../hooks/useAuth';
import { AppLayout } from '../../components/layout/AppLayout';
import { ProjectDetailsModal } from '../../components/client/ProjectDetailsModal';
import type { Project } from '../../types/project.types';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const ClientProjectsPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { state } = useStore();
    const { user } = useAuth();
    const isAdminOrRh = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'HR_ADMIN' || user?.role === 'RH';
    
    const projects = state.projects.filter(p => {
        if (isAdminOrRh || user?.role === 'CLIENT') return true;
        const isManager = p.managerId === user?.id;
        const isMember = p.members?.some(m => m.id === user?.id);
        return isManager || isMember;
    });
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
                {/* Optimized Filters Bar */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={t('client.search_project_placeholder')}
                            className="w-full pl-10 h-11 border-slate-100 bg-white rounded-2xl text-sm focus-visible:ring-emerald-500/10 placeholder:text-slate-400"
                        />
                    </div>
                    <Button variant="outline" className="h-11 px-5 rounded-2xl border-slate-100 font-bold text-xs text-slate-500 shadow-sm">
                        <ListFilter className="w-4 h-4 mr-2" /> {t('client.filters')}
                    </Button>
                </div>

                {/* Projects Grid - High Density Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProjects.length === 0 ? (
                        <div className="col-span-full py-16 text-center">
                            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t('client.no_projects_found')}</p>
                        </div>
                    ) : (
                        filteredProjects.map((project, i) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex"
                            >
                                <Card className="border border-slate-100/90 hover:border-slate-200/80 hover:shadow-md transition-all rounded-2xl overflow-hidden group bg-white shadow-sm flex flex-col justify-between w-full p-4 space-y-3.5">
                                    {/* Header: Icon, Name and Status */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-55 bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 border border-emerald-100/50">
                                                <Target className="w-4.5 h-4.5" />
                                            </div>
                                            <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight truncate">
                                                {project.name}
                                            </h3>
                                        </div>
                                        <Badge className={`px-2 py-0.5 rounded-md text-[9px] font-bold border-none flex-shrink-0 uppercase tracking-wide ${
                                            project.status === 'IN_PROGRESS' 
                                                ? 'bg-emerald-50 text-emerald-700' 
                                                : 'bg-blue-50 text-blue-700'
                                        }`}>
                                            {project.status === 'IN_PROGRESS' ? t('common.in_progress') : project.status}
                                        </Badge>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-slate-500 line-clamp-1 font-medium leading-relaxed">
                                        {project.description}
                                    </p>

                                    {/* Progress Bar (inline) */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                            <span className="text-slate-400">{t('client.global_progress')}</span>
                                            <span className="text-emerald-600">{project.progress}%</span>
                                        </div>
                                        <Progress value={project.progress} className="h-1 bg-slate-100" />
                                    </div>

                                    {/* Metadata & Actions Inline */}
                                    <div className="flex items-center justify-between pt-2 gap-2 border-t border-slate-100/50">
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                                                {new Date(project.startDate).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5 text-emerald-500" />
                                                {project.members?.length || 0}
                                            </span>
                                        </div>

                                        <Button
                                            onClick={() => handleOpenDetails(project)}
                                            variant="ghost"
                                            className="h-7 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold text-[10px] transition-all flex items-center gap-1 border-none"
                                        >
                                            {t('client.view_details')}
                                            <ArrowUpRight className="w-3 h-3" />
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
