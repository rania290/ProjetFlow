import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, FolderKanban, ArrowUpRight,
    CalendarDays, Users, LayoutGrid, List
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { useStore } from '../store/projectStore';
import type { Project, ProjectStatus, ProjectType } from '../types/project.types';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';


// Re-export CreateProjectModal inline for this page
const STATUS_LABELS: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    PLANNED: { label: 'Planifié', color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400' },
    IN_PROGRESS: { label: 'En cours', color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
    DELIVERED: { label: 'Livré', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
    SUSPENDED: { label: 'Suspendu', color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-400' },
};

export const ProjectsListPage: React.FC = () => {
    const { state, dispatch } = useStore();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'ALL'>('ALL');
    const [filterCategory, setFilterCategory] = useState<ProjectType | 'ALL'>('ALL');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showCreate, setShowCreate] = useState(false);

    const filtered = state.projects.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase()) ||
            (p.clientName ?? '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
        const matchCategory = filterCategory === 'ALL' || p.type === filterCategory;
        return matchSearch && matchStatus && matchCategory;
    });

    return (
        <AppLayout title="Projets" subtitle={`${state.projects.length} projets au total`}>
            <div className="p-4">

                {/* Toolbar */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher un projet, client..."
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 text-slate-700 placeholder:text-slate-400 shadow-sm"
                        />
                    </div>

                    {/* Filter Status */}
                    <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                        {(['ALL', 'PLANNED', 'IN_PROGRESS', 'DELIVERED', 'SUSPENDED'] as const).map(s => (
                            <button key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === s ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                {s === 'ALL' ? 'Tous' : STATUS_LABELS[s]?.label}
                            </button>
                        ))}
                    </div>

                    {/* Filter Category */}
                    <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                        {(['ALL', 'WEB_APPLICATION', 'MOBILE_APP', 'API_INTEGRATION'] as const).map(t => (
                            <button key={t}
                                onClick={() => setFilterCategory(t)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterCategory === t ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                {t === 'ALL' ? 'Toutes catégories' : t === 'WEB_APPLICATION' ? 'Web' : t === 'MOBILE_APP' ? 'Mobile' : 'API'}
                            </button>
                        ))}
                    </div>

                    {/* View toggle */}
                    <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                        <button onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-700'}`}
                            title="Vue grille">
                            <LayoutGrid className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-700'}`}
                            title="Vue liste">
                            <List className="w-3.5 h-3.5" />
                        </button>
                        <button 
                            className={`p-2 rounded-lg transition-all text-slate-400 hover:text-slate-700`}
                            title="Vue tableau (bientôt)">
                            <CalendarDays className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Create */}
                    <button onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors shadow-md shadow-primary-500/20">
                        <Plus className="w-4 h-4" /> Nouveau projet
                    </button>
                </div>

                {/* Results count */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-slate-400 font-medium">{filtered.length} projet{filtered.length > 1 ? 's' : ''}</span>
                    {(search || filterStatus !== 'ALL' || filterCategory !== 'ALL') && (
                        <button onClick={() => { setSearch(''); setFilterStatus('ALL'); setFilterCategory('ALL'); }}
                            className="text-xs text-primary-600 hover:underline font-medium">
                            Effacer les filtres
                        </button>
                    )}
                </div>

                {/* Grid view */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filtered.map((p, i) => (
                            <ProjectGridCard key={p.id} project={p} index={i} onOpen={() => {
                                dispatch({ type: 'SELECT_PROJECT', id: p.id });
                                navigate(`/projects/${p.id}`);
                            }} />
                        ))}
                        {/* Empty */}
                        {filtered.length === 0 && (
                            <div className="col-span-3 text-center py-16">
                                <FolderKanban className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                <p className="text-sm text-slate-400 font-medium">Aucun projet trouvé</p>
                                <button onClick={() => setShowCreate(true)}
                                    className="mt-4 text-sm text-primary-600 font-semibold hover:underline">
                                    + Créer votre premier projet
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* List view */}
                {viewMode === 'list' && (
                    <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <div className="col-span-4">Nom</div>
                            <div className="col-span-2">Catégorie</div>
                            <div className="col-span-2">Statut</div>
                            <div className="col-span-2">Avancement</div>
                            <div className="col-span-1">Membres</div>
                            <div className="col-span-1">Budget</div>
                        </div>
                        {filtered.map((p, i) => (
                            <ProjectListRow key={p.id} project={p} index={i} onOpen={() => {
                                dispatch({ type: 'SELECT_PROJECT', id: p.id });
                                navigate(`/projects/${p.id}`);
                            }} />
                        ))}
                        {filtered.length === 0 && (
                            <div className="py-12 text-center text-sm text-slate-400">Aucun projet trouvé</div>
                        )}
                    </div>
                )}
            </div>
            {/* Real create project modal */}
            <AnimatePresence>
                {showCreate && (
                    <CreateProjectModal onClose={() => setShowCreate(false)} />
                )}
            </AnimatePresence>
        </AppLayout>
    );
};

// ===== GRID CARD =====
const ProjectGridCard: React.FC<{ project: Project; index: number; onOpen: () => void }> = ({ project, index, onOpen }) => {
    const st = STATUS_LABELS[project.status];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onOpen}
            className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all cursor-pointer group"
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-primary-700 transition-colors mb-1">
                        {project.name}
                    </h3>
                    {project.clientName && (
                        <p className="text-[11px] text-slate-400 font-medium">Client : {project.clientName}</p>
                    )}
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-200 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-1" />
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700`}>Vue {project.viewMode}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-50 text-slate-600`}>{project.type === 'WEB_APPLICATION' ? 'Web' : project.type === 'MOBILE_APP' ? 'Mobile' : 'API'}</span>
                <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                </span>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">{project.description}</p>

            {/* Progress */}
            <div className="mb-4">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
                    <span>Progression</span>
                    <span className="font-bold text-slate-600">{project.progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ duration: 0.8, delay: index * 0.05 + 0.2 }}
                        className={`h-full rounded-full ${project.progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary-500 to-accent-500'}`}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <div className="flex -space-x-1.5">
                    {(project.members || []).slice(0, 4).map(m => (
                        <div key={m.id} title={m.fullName}
                            className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 border-2 border-white flex items-center justify-center text-white text-[9px] font-bold">
                            {m.avatar}
                        </div>
                    ))}
                    {(!project.members || project.members.length === 0) && <span className="text-[10px] text-slate-300 flex items-center gap-1"><Users className="w-3 h-3" /> 0 membre</span>}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {new Date(project.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </span>
                    <span className="font-semibold text-slate-600">{project.budget.toLocaleString()} €</span>
                </div>
            </div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
                <div className="flex gap-1 mt-3 flex-wrap">
                    {project.tags.map(tag => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-slate-50 border border-slate-100 text-slate-400 rounded-md font-medium">{tag}</span>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

// ===== LIST ROW =====
const ProjectListRow: React.FC<{ project: Project; index: number; onOpen: () => void }> = ({ project, index, onOpen }) => {
    const st = STATUS_LABELS[project.status];

    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            onClick={onOpen}
            className="grid grid-cols-12 gap-4 px-4 py-3 items-center border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-colors cursor-pointer group"
        >
            <div className="col-span-4 flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center flex-shrink-0">
                    <FolderKanban className="w-4 h-4 text-primary-600" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-primary-700 transition-colors">{project.name}</p>
                    {project.clientName && <p className="text-[10px] text-slate-400 truncate">{project.clientName}</p>}
                </div>
            </div>
            <div className="col-span-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700`}>Vue {project.viewMode}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 ml-1`}>{project.type === 'WEB_APPLICATION' ? 'Web' : project.type === 'MOBILE_APP' ? 'Mobile' : 'API'}</span>
            </div>
            <div className="col-span-2">
                <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit ${st.bg} ${st.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                </span>
            </div>
            <div className="col-span-2">
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" style={{ width: `${project.progress}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 w-8">{project.progress}%</span>
                </div>
            </div>
            <div className="col-span-1">
                <div className="flex -space-x-1">
                    {project.members.slice(0, 3).map(m => (
                        <div key={m.id} title={m.fullName}
                            className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 border border-white flex items-center justify-center text-white text-[8px] font-bold">
                            {m.avatar}
                        </div>
                    ))}
                    {project.members.length === 0 && <span className="text-[10px] text-slate-300">–</span>}
                </div>
            </div>
            <div className="col-span-1">
                <span className="text-[10px] font-semibold text-slate-600">{(project.budget / 1000).toFixed(0)}k€</span>
            </div>
        </motion.div>
    );
};
