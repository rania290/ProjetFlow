import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, FolderKanban, ArrowUpRight,
    CalendarDays, Users, LayoutGrid, List, Sparkles, Filter
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { useStore } from '../store/projectStore';
import type { Project, ProjectStatus, ProjectType } from '../types/project.types';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { Card } from '@/components/ui/card';
import { FadeInView } from '../components/ui/FadeInView';
import { projectsService } from '../api/projects.service';
import { useAuth } from '../hooks/useAuth';


// Re-export CreateProjectModal inline for this page
const STATUS_LABELS: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    PLANNED: { label: 'Planifié', color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400' },
    IN_PROGRESS: { label: 'En cours', color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
    DELIVERED: { label: 'Livré', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
    SUSPENDED: { label: 'Suspendu', color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-400' },
};

export const ProjectsListPage: React.FC = () => {
    const { t } = useTranslation();
    const { state, dispatch } = useStore();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'ALL'>('ALL');
    const [filterCategory, setFilterCategory] = useState<ProjectType | 'ALL'>('ALL');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showCreate, setShowCreate] = useState(false);

    React.useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await projectsService.getAll();
                dispatch({ type: 'SET_PROJECTS', projects: data });
            } catch (err) {
                console.error('Failed to load projects', err);
            }
        };
        void fetchProjects();
    }, [dispatch]);

    const filtered = state.projects.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase()) ||
            (p.clientName ?? '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
        const matchCategory = filterCategory === 'ALL' || p.type === filterCategory;
        return matchSearch && matchStatus && matchCategory;
    });

    return (
        <AppLayout title={t('common.projects', 'Projects')} subtitle={t('projects.total_projects', '{{count}} projects in total', { count: state.projects.length })}>
            <FadeInView className="p-4 md:p-6 space-y-6">

                {/* Premium Toolbar */}
                <Card className="p-4 shadow-sm border-slate-100">
                    <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4">
                        {/* Search */}
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder={t('projects.search_placeholder', 'Search project, client, tags...')}
                                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 text-slate-700 placeholder:text-slate-400 transition-all"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Filter Status */}
                            <div className="flex gap-1 bg-slate-50/80 p-1 rounded-xl border border-slate-200/50">
                                {(['ALL', 'PLANNED', 'IN_PROGRESS', 'DELIVERED', 'SUSPENDED'] as const).map(s => (
                                    <button key={s}
                                        onClick={() => setFilterStatus(s)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${filterStatus === s ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                        {s === 'ALL' ? t('common.all', 'All') : t(`projects.status_labels.${s}`, STATUS_LABELS[s]?.label)}
                                    </button>
                                ))}
                            </div>

                            {/* Filter Category */}
                            <div className="flex gap-1 bg-slate-50/80 p-1 rounded-xl border border-slate-200/50">
                                {(['ALL', 'WEB_APPLICATION', 'MOBILE_APP', 'API_INTEGRATION'] as const).map(cat => (
                                    <button key={cat}
                                        onClick={() => setFilterCategory(cat)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${filterCategory === cat ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                        {cat === 'ALL' ? t('projects.categories', 'Categories') : cat === 'WEB_APPLICATION' ? t('projects.web', 'Web') : cat === 'MOBILE_APP' ? t('projects.mobile', 'Mobile') : t('projects.api', 'API')}
                                    </button>
                                ))}
                            </div>

                            {/* View toggle */}
                            <div className="flex bg-slate-50/80 p-1 rounded-xl border border-slate-200/50">
                                <button onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    title={t('projects.grid_view', 'Grid View')}>
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    title={t('projects.list_view', 'List View')}>
                                    <List className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Create */}
                            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'HR_ADMIN' || user?.role === 'PROJECT_MANAGER') && (
                                <button onClick={() => setShowCreate(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                                    <Plus className="w-4 h-4" /> {t('common.new', 'New')}
                                </button>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Results count & Clear */}
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">
                            {filtered.length === 1 
                                ? t('projects.projects_found', '{{count}} project found', { count: 1 }) 
                                : t('projects.projects_found_plural', '{{count}} projects found', { count: filtered.length })}
                        </span>
                    </div>
                    {(search || filterStatus !== 'ALL' || filterCategory !== 'ALL') && (
                        <button onClick={() => { setSearch(''); setFilterStatus('ALL'); setFilterCategory('ALL'); }}
                            className="text-[10px] text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-widest transition-colors flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                            {t('common.clear_filters', 'Clear Filters')}
                        </button>
                    )}
                </div>

                {/* Grid view */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filtered.map((p, i) => (
                            <ProjectGridCard key={p.id} project={p} index={i} onOpen={() => {
                                dispatch({ type: 'SELECT_PROJECT', id: p.id });
                                navigate(`/projects/${p.id}`);
                            }} />
                        ))}
                        {/* Empty */}
                        {filtered.length === 0 && (
                            <Card className="col-span-full p-20 text-center shadow-sm border-slate-100">
                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
                                    <FolderKanban className="w-10 h-10 text-slate-200" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 font-display uppercase tracking-tight">{t('projects.no_projects_found', 'No projects found')}</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2 max-w-xs mx-auto">
                                    {t('projects.adjust_filters', 'Adjust your filters or create a new roadmap to start managing.')}
                                </p>
                                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'HR_ADMIN' || user?.role === 'PROJECT_MANAGER') && (
                                    <button onClick={() => setShowCreate(true)}
                                        className="mt-8 px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-indigo-600 hover:bg-slate-50 transition-all shadow-sm">
                                        + {t('projects.create_project', 'Create Project')}
                                    </button>
                                )}
                            </Card>
                        )}
                    </div>
                )}

                {/* List view */}
                {viewMode === 'list' && (
                    <Card className="overflow-hidden shadow-sm border-slate-100">
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="col-span-4">{t('projects.project_info', 'Project Info')}</div>
                            <div className="col-span-2">{t('projects.configuration', 'Configuration')}</div>
                            <div className="col-span-2">{t('common.status', 'Status')}</div>
                            <div className="col-span-2">{t('common.progress', 'Progress')}</div>
                            <div className="col-span-1">{t('common.team_members', 'Team')}</div>
                            <div className="col-span-1 text-right">{t('common.budget', 'Budget')}</div>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {filtered.map((p, i) => (
                                <ProjectListRow key={p.id} project={p} index={i} onOpen={() => {
                                    dispatch({ type: 'SELECT_PROJECT', id: p.id });
                                    navigate(`/projects/${p.id}`);
                                }} />
                            ))}
                        </div>
                        {filtered.length === 0 && (
                            <div className="py-20 text-center">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{t('projects.empty_list', 'Empty list')}</p>
                            </div>
                        )}
                    </Card>
                )}
            </FadeInView>
            {/* Real create project modal */}
            <AnimatePresence>
                {showCreate && (
                    <CreateProjectModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
                )}
            </AnimatePresence>
        </AppLayout>
    );
};

// ===== GRID CARD =====
const ProjectGridCard: React.FC<{ project: Project; index: number; onOpen: () => void }> = ({ project, index, onOpen }) => {
    const { t } = useTranslation();
    const st = STATUS_LABELS[project.status];

    return (
        <Card
            onClick={onOpen}
            className="p-4 sm:p-5 shadow-sm border-slate-100 hover:shadow-2xl hover:border-indigo-200/50 transition-all duration-500 cursor-pointer group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
            
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3.5 relative">
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-black text-slate-800 font-display truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                        {project.name}
                    </h3>
                    {project.clientName && (
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                            {t('projects.client', 'Client')}: <span className="text-slate-600">{project.clientName}</span>
                        </p>
                    )}
                </div>
                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all shadow-sm border border-slate-100">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-1.5 mb-3.5 flex-wrap relative">
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-tight shadow-sm`}>{t('projects.view', 'View')} {project.viewMode}</span>
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-100 uppercase tracking-tight shadow-sm`}>{project.type === 'WEB_APPLICATION' ? t('projects.web', 'Web') : project.type === 'MOBILE_APP' ? t('projects.mobile', 'Mobile') : t('projects.api', 'API')}</span>
                <span className={`flex items-center gap-1 text-[8px] font-black px-2 py-0.5 rounded-md border shadow-sm uppercase tracking-tight ${st.bg} ${st.color} ${st.dot.replace('bg-', 'border-')}`}>
                    <div className={`w-1 h-1 rounded-full ${st.dot} shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />{t(`projects.status_labels.${project.status}`, st.label)}
                </span>
            </div>

            {/* Description */}
            <p className="text-[11px] text-slate-450 leading-relaxed mb-3.5 line-clamp-2 font-medium opacity-85 group-hover:opacity-100 transition-opacity">{project.description}</p>

            {/* Progress */}
            <div className="mb-3.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                <div className="flex justify-between text-[9px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">
                    <span>{t('common.progress', 'Progress')}</span>
                    <span className="text-slate-900">{project.progress}%</span>
                </div>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden shadow-inner flex">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.05 + 0.3 }}
                        className={`h-full rounded-full shadow-[0_0_12px_rgba(99,102,241,0.3)] ${project.progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400'}`}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100/50">
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                        {(project.members || []).slice(0, 3).map((m, idx) => (
                            <div key={m.id} title={m.fullName}
                                className="w-6.5 h-6.5 rounded-full bg-white p-0.5 shadow-sm ring-1 ring-slate-100 group-hover:ring-indigo-100 transition-all"
                                style={{ zIndex: 3 - idx }}>
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 text-[8px] font-black border border-white">
                                    {m.avatar || m.fullName[0].toUpperCase()}
                                </div>
                            </div>
                        ))}
                    </div>
                    {(!project.members || project.members.length === 0) ? (
                        <span className="text-[9px] text-slate-350 font-black uppercase tracking-tight">{t('projects.no_members', 'No members')}</span>
                    ) : project.members.length > 3 && (
                        <span className="text-[9px] text-slate-400 font-black">+{project.members.length - 3}</span>
                    )}
                </div>
                
                <div className="flex items-center gap-3 text-[9px] font-black text-slate-600 uppercase tracking-tight">
                    <span className="flex items-center gap-1 text-slate-400">
                        <CalendarDays className="w-3 h-3" />
                        {new Date(project.endDate).toLocaleDateString(t('common.locale', 'fr-FR'), { day: '2-digit', month: 'short' })}
                    </span>
                    <div className="w-0.5 h-0.5 rounded-full bg-slate-200" />
                    <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md border border-indigo-100 shadow-sm">{project.budget.toLocaleString()} DT</span>
                </div>
            </div>
        </Card>
    );
};

// ===== LIST ROW =====
const ProjectListRow: React.FC<{ project: Project; index: number; onOpen: () => void }> = ({ project, index, onOpen }) => {
    const { t } = useTranslation();
    const st = STATUS_LABELS[project.status];

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03, duration: 0.4 }}
            onClick={onOpen}
            className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-indigo-50/30 transition-all cursor-pointer group"
        >
            <div className="col-span-4 flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-100 group-hover:scale-110 group-hover:border-indigo-100 transition-all">
                    <FolderKanban className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-black text-slate-800 truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{project.name}</p>
                    {project.clientName && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{project.clientName}</p>}
                </div>
            </div>
            <div className="col-span-2 flex flex-wrap gap-1.5">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100/50 uppercase tracking-tighter`}>{project.viewMode}</span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-100 uppercase tracking-tighter`}>{project.type === 'WEB_APPLICATION' ? t('projects.web', 'Web') : project.type === 'MOBILE_APP' ? t('projects.mobile', 'Mobile') : t('projects.api', 'API')}</span>
            </div>
            <div className="col-span-2">
                <span className={`flex items-center gap-1.5 text-[9px] font-black px-2.5 py-1 rounded-lg w-fit border shadow-sm uppercase tracking-tight ${st.bg} ${st.color} ${st.dot.replace('bg-', 'border-')}`}>
                    <div className={`w-1 h-1 rounded-full ${st.dot}`} />{t(`projects.status_labels.${project.status}`, st.label)}
                </span>
            </div>
            <div className="col-span-2">
                <div className="flex items-center gap-3 pr-4">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${project.progress}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-slate-700 w-8">{project.progress}%</span>
                </div>
            </div>
            <div className="col-span-1">
                <div className="flex -space-x-1.5 hover:-space-x-0.5 transition-all">
                    {(project.members || []).slice(0, 3).map((m, idx) => (
                        <div key={m.id} title={m.fullName}
                            className="w-6 h-6 rounded-full bg-white p-0.5 shadow-sm ring-1 ring-slate-100"
                            style={{ zIndex: 3 - idx }}>
                            <div className="w-full h-full rounded-full bg-slate-50 flex items-center justify-center text-slate-600 text-[8px] font-black border border-white">
                                {m.avatar || m.fullName[0]}
                            </div>
                        </div>
                    ))}
                    {(!project.members || project.members.length === 0) && <span className="text-[10px] text-slate-300 font-black uppercase">0</span>}
                </div>
            </div>
            <div className="col-span-1 text-right pr-2">
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 shadow-sm uppercase">{(project.budget / 1000).toFixed(0)}k DT</span>
            </div>
        </motion.div>
    );
};
