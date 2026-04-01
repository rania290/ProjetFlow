import React from 'react';
import { Search, Filter, ArrowUpDown, MoreHorizontal, User } from 'lucide-react';
import type { TaskPriority, TaskStatus } from '../../types/project.types';

interface ProjectToolbarProps {
    search: string;
    onSearchChange: (val: string) => void;
    filterAssignee: string;
    onFilterAssigneeChange: (val: string) => void;
    filterStatus: TaskStatus | 'ALL';
    onFilterStatusChange: (val: TaskStatus | 'ALL') => void;
    filterPriority: TaskPriority | 'ALL';
    onFilterPriorityChange: (val: TaskPriority | 'ALL') => void;
    sortBy: 'DATE' | 'STATUS' | 'NAME';
    onSortByChange: (val: 'DATE' | 'STATUS' | 'NAME') => void;
    assignees: { id: string; fullName: string; avatar: string }[];
}

export const ProjectToolbar: React.FC<ProjectToolbarProps> = ({
    search, onSearchChange,
    filterAssignee, onFilterAssigneeChange,
    filterStatus, onFilterStatusChange,
    filterPriority, onFilterPriorityChange,
    sortBy, onSortByChange,
    assignees
}) => {
    return (
        <div className="flex flex-wrap items-center gap-3 py-3 px-6 bg-white border-b border-slate-100">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-transparent hover:border-slate-200 focus:bg-white focus:border-primary-400 rounded-lg outline-none transition-all placeholder:text-slate-400"
                />
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            {/* Person Filter */}
            <div className="relative group">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                    <User className="w-4 h-4" />
                    <span>Personne</span>
                </button>
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                    <button onClick={() => onFilterAssigneeChange('')} className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-50 transition-colors ${!filterAssignee ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-slate-600'}`}>Tous les membres</button>
                    {assignees.map(a => (
                        <button key={a.id} onClick={() => onFilterAssigneeChange(a.id)}
                            className={`w-full flex items-center gap-2 text-left px-4 py-2 text-xs hover:bg-slate-50 transition-colors ${filterAssignee === a.id ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-slate-600'}`}>
                            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600">{a.avatar}</div>
                            {a.fullName}
                        </button>
                    ))}
                </div>
            </div>

            {/* General Filter */}
            <div className="relative group">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                    <Filter className="w-4 h-4" />
                    <span>Filtrer</span>
                </button>
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 p-2">
                    <div className="mb-2">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">Statut</span>
                        <select value={filterStatus} onChange={e => onFilterStatusChange(e.target.value as any)} className="w-full text-xs p-2 rounded-lg bg-slate-50 border border-slate-200 outline-none">
                            <option value="ALL">Tous les statuts</option>
                            <option value="DONE">Fait</option>
                            <option value="IN_PROGRESS">En cours</option>
                            <option value="IN_TEST">En test</option>
                            <option value="TODO">À faire</option>
                        </select>
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">Priorité</span>
                        <select value={filterPriority} onChange={e => onFilterPriorityChange(e.target.value as any)} className="w-full text-xs p-2 rounded-lg bg-slate-50 border border-slate-200 outline-none">
                            <option value="ALL">Toutes propriétés</option>
                            <option value="CRITICAL">Critique</option>
                            <option value="HIGH">Haute</option>
                            <option value="MEDIUM">Moyenne</option>
                            <option value="LOW">Basse</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Sort */}
            <div className="relative group">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                    <ArrowUpDown className="w-4 h-4" />
                    <span>Trier</span>
                </button>
                <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                    <button onClick={() => onSortByChange('DATE')} className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-50 transition-colors ${sortBy === 'DATE' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-slate-600'}`}>Par Date</button>
                    <button onClick={() => onSortByChange('STATUS')} className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-50 transition-colors ${sortBy === 'STATUS' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-slate-600'}`}>Par Statut</button>
                    <button onClick={() => onSortByChange('NAME')} className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-50 transition-colors ${sortBy === 'NAME' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-slate-600'}`}>Par Nom</button>
                </div>
            </div>
            
            <div className="ml-auto">
                 <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all" title="Plus d'options">
                    <MoreHorizontal className="w-5 h-5"/>
                 </button>
            </div>
        </div>
    );
};
