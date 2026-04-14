import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Mail,
    FolderKanban,
    Users,
    Shield,
    Briefcase,
    ArrowUpRight,
    ChevronRight,
    SlidersHorizontal,
} from 'lucide-react';
import { useStore } from '../store/projectStore';
import type { ProjectMember, Project } from '../types/project.types';
import { useAuth } from '../hooks/useAuth';

interface EnrichedMember extends ProjectMember {
    projects: { id: string; name: string }[];
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; Icon: React.ElementType }> = {
    ADMIN: { label: 'Admin', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', Icon: Shield },
    PROJECT_MANAGER: { label: 'Manager', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', Icon: Briefcase },
    TEAM_MEMBER: { label: 'Membre', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', Icon: Users },
};

const getRoleConf = (role: string) =>
    ROLE_CONFIG[role] ?? { label: role, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', Icon: Users };

// Derive a nice avatar background from member id
const AVATAR_COLORS = [
    'bg-indigo-500', 'bg-violet-500', 'bg-blue-500',
    'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-teal-500',
];
const getAvatarColor = (id: string) => AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];

export const TeamPage: React.FC = () => {
    const { state, dispatch } = useStore();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    // Build a deduplicated member list from all projects in the store
    const enrichedMembers = useMemo((): EnrichedMember[] => {
        const memberMap = new Map<string, EnrichedMember>();

        state.projects.forEach((project: Project) => {
            (project.members || []).forEach(member => {
                if (memberMap.has(member.id)) {
                    memberMap.get(member.id)!.projects.push({ id: project.id, name: project.name });
                } else {
                    memberMap.set(member.id, {
                        ...member,
                        projects: [{ id: project.id, name: project.name }],
                    });
                }
            });
        });

        // Add performance stats directly out of state.tasks
        const membersWithStats = Array.from(memberMap.values()).map(m => {
            const mTasks = state.tasks?.filter(t => t.assigneeId === m.id) || [];
            const doneTasks = mTasks.filter(t => t.status === 'DONE');
            return {
                ...m,
                totalTasksAssigned: mTasks.length,
                completedTasksCount: doneTasks.length
            };
        });

        return membersWithStats;
    }, [state.projects, state.tasks]);

    const filteredMembers = useMemo(() => {
        const q = search.toLowerCase();
        return enrichedMembers.filter(m => {
            const matchSearch = m.fullName.toLowerCase().includes(q) || m.role.toLowerCase().includes(q);
            const matchRole = roleFilter === 'ALL' || m.role === roleFilter;
            return matchSearch && matchRole;
        });
    }, [enrichedMembers, search, roleFilter]);

    const hasProjects = state.projects.length > 0;
    const hasMembers = enrichedMembers.length > 0;

    const goToProject = (projectId: string) => {
        dispatch({ type: 'SELECT_PROJECT', id: projectId });
        navigate(`/projects/${projectId}`);
    };

    return (
        <div className="min-h-full bg-[#f8fafc]">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-500" />
                                Équipe
                                <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                                    {filteredMembers.length}
                                </span>
                            </h1>
                            <p className="text-slate-500 text-xs font-medium mt-0.5">
                                {enrichedMembers.length} membre{enrichedMembers.length !== 1 ? 's' : ''} sur {state.projects.length} projet{state.projects.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Rechercher un membre..."
                                    className="pl-9 pr-3 py-1.5 w-56 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>

                            {/* Role filter dropdown */}
                            <div className="relative group">
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                    {roleFilter === 'ALL' ? 'Rôle' : getRoleConf(roleFilter).label}
                                </button>
                                <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-slate-200 shadow-xl rounded-xl p-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                    {['ALL', 'ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER'].map(r => {
                                        const conf = r === 'ALL' ? null : getRoleConf(r);
                                        return (
                                            <button
                                                key={r}
                                                onClick={() => setRoleFilter(r)}
                                                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${roleFilter === r ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {conf && <conf.Icon className="w-3.5 h-3.5" />}
                                                {r === 'ALL' ? 'Tous les rôles' : conf?.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {!hasProjects ? (
                    <EmptyNoProjects onGoProjects={() => navigate('/projects')} />
                ) : !hasMembers ? (
                    <EmptyNoMembers onGoProjects={() => navigate('/projects')} />
                ) : filteredMembers.length === 0 ? (
                    <NoResults />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        <AnimatePresence>
                            {filteredMembers.map((member, i) => {
                                const roleConf = getRoleConf(member.role);
                                const RoleIcon = roleConf.Icon;
                                const initials = member.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                                const avatarColor = getAvatarColor(member.id);
                                const isCurrentUser = user?.id === member.id;

                                return (
                                    <motion.div
                                        key={member.id}
                                        layout
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.04 }}
                                        className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all group overflow-hidden ${isCurrentUser ? 'border-indigo-200 ring-1 ring-indigo-200' : 'border-slate-200 hover:border-indigo-200'
                                            }`}
                                    >
                                        {/* Card top accent */}
                                        <div className={`h-1.5 w-full ${roleConf.bg} ${roleConf.border} border-b`} />

                                        <div className="p-5">
                                            {/* Avatar + Name */}
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className={`w-12 h-12 rounded-xl ${avatarColor} flex items-center justify-center text-white text-base font-black shadow-sm flex-shrink-0`}>
                                                    {initials}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="text-sm font-black text-slate-900 truncate">{member.fullName}</h3>
                                                        {isCurrentUser && (
                                                            <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-bold rounded uppercase tracking-wider">Vous</span>
                                                        )}
                                                    </div>
                                                    <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleConf.bg} ${roleConf.color} ${roleConf.border}`}>
                                                        <RoleIcon className="w-2.5 h-2.5" />
                                                        {member.role === 'PROJECT_MANAGER' ? 'Manager' : roleConf.label}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Role / TJM */}
                                            <div className="space-y-2 mb-4">
                                                <div className="text-xs text-slate-500 font-medium leading-snug truncate">
                                                    {member.role}
                                                </div>
                                                {member.tjm > 0 && (
                                                    <div className="text-xs font-bold text-slate-700">
                                                        {member.tjm} DT / jour
                                                    </div>
                                                )}
                                            </div>

                                            {/* Performance stats */}
                                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Performances</span>
                                                    <span className="text-xs font-bold text-slate-900">
                                                        {(member as any).completedTasksCount} / {(member as any).totalTasksAssigned} tâches
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
                                                        style={{ width: `${(member as any).totalTasksAssigned > 0 ? ((member as any).completedTasksCount / (member as any).totalTasksAssigned) * 100 : 0}%` }}
                                                    />
                                                </div>
                                                {(member as any).totalTasksAssigned > 0 && (
                                                    <p className="text-right text-[10px] font-bold text-emerald-600">
                                                        {Math.round(((member as any).completedTasksCount / (member as any).totalTasksAssigned) * 100)}% d'avancement
                                                    </p>
                                                )}
                                            </div>

                                            {/* Projects */}
                                            {member.projects.length > 0 && (
                                                <div className="border-t border-slate-100 pt-4">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                        {member.projects.length === 1 ? '1 Projet' : `${member.projects.length} Projets`}
                                                    </p>
                                                    <div className="space-y-1.5">
                                                        {member.projects.slice(0, 2).map(proj => (
                                                            <button
                                                                key={proj.id}
                                                                onClick={() => goToProject(proj.id)}
                                                                className="w-full flex items-center gap-2 text-left text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors group/proj"
                                                            >
                                                                <FolderKanban className="w-3.5 h-3.5 flex-shrink-0" />
                                                                <span className="truncate flex-1">{proj.name}</span>
                                                                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover/proj:opacity-100 transition-opacity flex-shrink-0" />
                                                            </button>
                                                        ))}
                                                        {member.projects.length > 2 && (
                                                            <p className="text-[10px] text-slate-400 font-bold pl-1">
                                                                +{member.projects.length - 2} autre{member.projects.length - 2 > 1 ? 's' : ''}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

const EmptyNoProjects: React.FC<{ onGoProjects: () => void }> = ({ onGoProjects }) => (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-indigo-300" />
        </div>
        <h3 className="text-base font-black text-slate-700 mb-1">Aucun projet créé</h3>
        <p className="text-sm text-slate-400 mb-5 text-center max-w-xs">
            Les membres de votre équipe apparaîtront ici une fois que des projets avec des membres seront créés.
        </p>
        <button
            onClick={onGoProjects}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
        >
            <FolderKanban className="w-4 h-4" />
            Créer un projet
            <ChevronRight className="w-4 h-4" />
        </button>
    </div>
);

const EmptyNoMembers: React.FC<{ onGoProjects: () => void }> = ({ onGoProjects }) => (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-base font-black text-slate-700 mb-1">Aucun membre dans vos projets</h3>
        <p className="text-sm text-slate-400 mb-5 text-center max-w-xs">
            Ajoutez des membres à vos projets pour les voir apparaître ici.
        </p>
        <button
            onClick={onGoProjects}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
        >
            <FolderKanban className="w-4 h-4" />
            Voir mes projets
            <ChevronRight className="w-4 h-4" />
        </button>
    </div>
);

const NoResults = () => (
    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200">
        <Search className="w-10 h-10 text-slate-200 mb-3" />
        <p className="text-sm font-bold text-slate-500">Aucun membre trouvé</p>
        <p className="text-xs text-slate-400 mt-1">Modifiez votre recherche ou filtre.</p>
    </div>
);
