import React from 'react';
import { Search, Check } from 'lucide-react';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
    DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
    onAddTask: () => void;
    onAddSprint: () => void;
    onAddMember: () => void;
}

export const ProjectToolbar: React.FC<ProjectToolbarProps> = ({
    search, onSearchChange,
    filterAssignee, onFilterAssigneeChange,
    filterStatus, onFilterStatusChange,
    filterPriority, onFilterPriorityChange,
    sortBy, onSortByChange,
    assignees,
    onAddTask,
    onAddSprint,
    onAddMember
}) => {
    const activeFiltersCount = (filterAssignee ? 1 : 0) + (filterStatus !== 'ALL' ? 1 : 0) + (filterPriority !== 'ALL' ? 1 : 0);

    return (
        <div className="flex flex-wrap items-center gap-4 py-4 px-8 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20">
            {/* Search Module */}
            <div className="relative min-w-[240px] flex-1 max-w-sm group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <Input
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    placeholder="Rechercher une tâche..."
                    className="pl-10 h-11 bg-slate-50 border-transparent hover:border-slate-200 focus:bg-white focus:border-primary-500 rounded-2xl shadow-none transition-all placeholder:text-slate-400 text-sm font-medium"
                />
            </div>

            <div className="h-8 w-px bg-slate-100 mx-2 hidden lg:block"></div>

            {/* Filters Section */}
            <div className="flex items-center gap-2">
                {/* Member Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="h-10 px-4 rounded-xl text-slate-600 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all font-semibold text-xs gap-2 flex items-center bg-transparent outline-none">
                        <span>{filterAssignee ? assignees.find(a => a.id === filterAssignee)?.fullName : 'Membres'}</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 p-2 rounded-2xl border-slate-100 shadow-2xl" align="start">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1.5">Filtrer par membre</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => onFilterAssigneeChange('')}
                                className="rounded-lg text-xs font-bold px-3 py-2 focus:bg-primary-50 focus:text-primary-700"
                            >
                                Tous les membres
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-50 my-1" />
                            {assignees.map(a => (
                                <DropdownMenuItem
                                    key={a.id}
                                    onClick={() => onFilterAssigneeChange(a.id)}
                                    className={`rounded-lg text-xs font-medium px-3 py-2 flex items-center gap-2 ${filterAssignee === a.id ? 'bg-primary-50 text-primary-700 font-bold' : ''}`}
                                >
                                    <Avatar className="w-5 h-5">
                                        <AvatarFallback className="text-[9px] bg-slate-100">{a.avatar}</AvatarFallback>
                                    </Avatar>
                                    {a.fullName}
                                    {filterAssignee === a.id && <Check className="w-3 h-3 ml-auto" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Properties Filter */}
                <Popover>
                    <PopoverTrigger className="h-10 px-4 rounded-xl text-slate-600 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all font-semibold text-xs gap-2 flex items-center bg-transparent cursor-pointer outline-none">
                        <span>Propriétés</span>
                        {activeFiltersCount > 0 && (
                            <Badge className="ml-1 h-5 w-5 p-0 bg-primary-600 text-white flex items-center justify-center rounded-full text-[10px]">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4 rounded-2xl border-slate-100 shadow-2xl" align="start">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Statut</label>
                                <Select value={filterStatus} onValueChange={(v) => onFilterStatusChange(v as any)}>
                                    <SelectTrigger className="h-9 rounded-xl border-slate-100 bg-slate-50 text-xs font-semibold focus:ring-primary-500/30">
                                        <SelectValue placeholder="Tous les statuts" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100">
                                        <SelectItem value="ALL" className="text-xs">Tous les statuts</SelectItem>
                                        <SelectItem value="TODO" className="text-xs">À faire</SelectItem>
                                        <SelectItem value="IN_PROGRESS" className="text-xs">En cours</SelectItem>
                                        <SelectItem value="IN_TEST" className="text-xs">En test</SelectItem>
                                        <SelectItem value="DONE" className="text-xs">Terminé</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Priorité</label>
                                <Select value={filterPriority} onValueChange={(v) => onFilterPriorityChange(v as any)}>
                                    <SelectTrigger className="h-9 rounded-xl border-slate-100 bg-slate-50 text-xs font-semibold focus:ring-primary-500/30">
                                        <SelectValue placeholder="Toutes priorités" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100">
                                        <SelectItem value="ALL" className="text-xs">Toutes priorités</SelectItem>
                                        <SelectItem value="CRITICAL" className="text-xs text-red-600">Critique</SelectItem>
                                        <SelectItem value="HIGH" className="text-xs text-orange-600">Haute</SelectItem>
                                        <SelectItem value="MEDIUM" className="text-xs text-blue-600">Moyenne</SelectItem>
                                        <SelectItem value="LOW" className="text-xs text-slate-500">Basse</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {activeFiltersCount > 0 && (
                                <Button
                                    variant="ghost"
                                    className="w-full text-[10px] font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 h-8 rounded-lg mt-2"
                                    onClick={() => {
                                        onFilterStatusChange('ALL');
                                        onFilterPriorityChange('ALL');
                                        onFilterAssigneeChange('');
                                    }}
                                >
                                    Rinitialiser les filtres
                                </Button>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Sort Module */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="h-10 px-4 rounded-xl text-slate-600 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all font-semibold text-xs gap-2 flex items-center bg-transparent outline-none">
                        <span>Trier</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 p-2 rounded-2xl border-slate-100 shadow-2xl" align="start">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1.5">Trier par</DropdownMenuLabel>
                            {[
                                { id: 'DATE', label: 'Date de création' },
                                { id: 'STATUS', label: 'Statut' },
                                { id: 'NAME', label: 'Nom de tâche' }
                            ].map(item => (
                                <DropdownMenuItem
                                    key={item.id}
                                    onClick={() => onSortByChange(item.id as any)}
                                    className={`rounded-lg text-xs font-semibold px-3 py-2 flex items-center justify-between ${sortBy === item.id ? 'bg-primary-50 text-primary-700' : 'text-slate-600'}`}
                                >
                                    {item.label}
                                    {sortBy === item.id && <Check className="w-3.5 h-3.5" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};
