import React, { useState, useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Plus,
    Filter,
    Search,
    LayoutGrid,
    Users,
    Briefcase,
    Settings,
    Bell,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Palmtree,
    Star
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { useStore } from '../store/projectStore';
import type { ProjectStatus, TaskStatus } from '../types/project.types';

import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Removed static MOCK_EVENTS - now dynamic

const TYPE_CONFIG = {
    TASK: { icon: <CheckCircle2 className="w-3 h-3" />, color: 'text-slate-600', label: 'Tâche' },
    BUG: { icon: <AlertTriangle className="w-3 h-3 text-red-500" />, color: 'text-red-600', label: 'Bug' },
    STORY: { icon: <Star className="w-3 h-3 text-amber-500" />, color: 'text-amber-600', label: 'Story' },
    LEAVE: { icon: <Palmtree className="w-3 h-3 text-emerald-500" />, color: 'text-emerald-600', label: 'Congé' },
    EVENT: { icon: <Clock className="w-3 h-3 text-blue-500" />, color: 'text-blue-600', label: 'Événement' },
};

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export const CalendarPage: React.FC = () => {
    const { state } = useStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [direction, setDirection] = useState(0);
    const [selectedProjectFilter, setSelectedProjectFilter] = useState<string | 'all'>('all');
    const [selectedType, setSelectedType] = useState<string | 'all'>('all');
    const [isAddEventOpen, setIsAddEventOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', date: '', project: '', type: 'TASK' });

    // Dynamic Projects mapping
    const projects = useMemo(() => {
        const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500'];
        const borders = ['border-blue-200', 'border-indigo-200', 'border-emerald-200', 'border-amber-200', 'border-rose-200', 'border-purple-200'];
        const lights = ['bg-blue-50', 'bg-indigo-50', 'bg-emerald-50', 'bg-amber-50', 'bg-rose-50', 'bg-purple-50'];

        return state.projects.map((p, i) => ({
            id: p.id,
            name: p.name,
            color: colors[i % colors.length],
            border: borders[i % borders.length],
            light: lights[i % lights.length]
        }));
    }, [state.projects]);

    // Dynamic Events mapping from Store
    const allEvents = useMemo(() => {
        const evs: any[] = [];

        // Add projects as date-spanning events (simplified to start date)
        state.projects.forEach(p => {
            if (p.startDate) {
                evs.push({
                    id: `p-${p.id}`,
                    title: `Démarrage: ${p.name}`,
                    date: p.startDate,
                    type: 'EVENT',
                    project: p.id,
                    status: 'TODO'
                });
            }
            if (p.endDate) {
                evs.push({
                    id: `pe-${p.id}`,
                    title: `Deadline: ${p.name}`,
                    date: p.endDate,
                    type: 'EVENT',
                    project: p.id,
                    status: 'URGENT'
                });
            }
        });

        // Add tasks
        state.tasks.forEach(t => {
            const date = t.dueDate || t.createdAt?.split('T')[0];
            if (date) {
                evs.push({
                    id: t.id,
                    title: t.title,
                    date: date,
                    type: t.type === 'BUG' ? 'BUG' : (t.type === 'STORY' ? 'STORY' : 'TASK'),
                    project: t.projectId,
                    status: t.status
                });
            }
        });

        return evs;
    }, [state.projects, state.tasks]);

    const handleAddEvent = () => {
        if (!newEvent.title || !newEvent.date) return;
        // In a real app, this would be a dispatch or API call
        console.log('Adding event:', newEvent);
        setIsAddEventOpen(false);
    };

    const { daysInMonth, startDayIndex, year, month } = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let startDayIndex = new Date(year, month, 1).getDay() - 1;
        if (startDayIndex === -1) startDayIndex = 6;
        return { daysInMonth, startDayIndex, year, month };
    }, [currentDate]);

    const eventsByDate = useMemo(() => {
        const map: Record<string, any[]> = {};
        allEvents.filter(e => {
            const projectMatch = selectedProjectFilter === 'all' || e.project === selectedProjectFilter;
            const typeMatch = selectedType === 'all' || e.type === selectedType;
            return projectMatch && typeMatch;
        }).forEach(event => {
            if (!map[event.date]) map[event.date] = [];
            map[event.date].push(event);
        });
        return map;
    }, [allEvents, selectedProjectFilter, selectedType]);

    const nextMonth = () => { setCurrentDate(new Date(year, month + 1, 1)); setDirection(1); };
    const prevMonth = () => { setCurrentDate(new Date(year, month - 1, 1)); setDirection(-1); };
    const goToday = () => { setCurrentDate(new Date()); setDirection(0); };
    const openAddEvent = (dateStr?: string) => {
        if (dateStr) setNewEvent({ ...newEvent, date: dateStr });
        setIsAddEventOpen(true);
    };

    return (
        <AppLayout title="Calendrier Global">
            <div className="flex h-[calc(100vh-theme(spacing.20))] overflow-hidden bg-slate-50/50">

                {/* --- Left Sidebar (Controls) --- */}
                <div className="w-80 shrink-0 border-r border-slate-200 bg-white p-6 flex flex-col gap-8">
                    <div>
                        <Button
                            onClick={() => openAddEvent()}
                            className="w-full bg-slate-950 hover:bg-slate-900 text-white rounded-2xl h-12 flex items-center gap-2 shadow-xl shadow-slate-950/10 transition-all active:scale-[0.98]"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="font-bold text-sm">Nouvel Événement</span>
                        </Button>
                    </div>

                    {/* Mini Month Preview (Simple) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-950 uppercase tracking-widest italic">Aperçu rapide</h3>
                            <div className="flex gap-1">
                                <button className="p-1 hover:bg-slate-50 rounded-md text-slate-400"><ChevronLeft className="w-3.5 h-3.5" /></button>
                                <button className="p-1 hover:bg-slate-50 rounded-md text-slate-400"><ChevronRight className="w-3.5 h-3.5" /></button>
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            {/* Mini Grid Placeholder */}
                            <div className="grid grid-cols-7 gap-1">
                                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => <div key={d} className="text-[10px] text-center font-bold text-slate-400 py-1">{d}</div>)}
                                {Array.from({ length: 31 }).map((_, i) => (
                                    <div key={i} className={`aspect-square flex items-center justify-center text-[10px] font-bold rounded-md ${i + 1 === currentDate.getDate() ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-white cursor-pointer transition-colors'}`}>
                                        {i + 1}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Filters: Projects */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-950 uppercase tracking-widest italic">Filtrer par Projet</h3>
                        <div className="space-y-1.5">
                            <button
                                onClick={() => setSelectedProjectFilter('all')}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedProjectFilter === 'all' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-50'}`}
                            >
                                <span className="flex items-center gap-2"><LayoutGrid className="w-3.5 h-3.5" /> Tous les projets</span>
                                <Badge variant="secondary" className="bg-white/50">{allEvents.length}</Badge>
                            </button>
                            {projects.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedProjectFilter(p.id)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedProjectFilter === p.id ? `${p.light} ${p.border.replace('border-', 'border-opacity-50 border-')} text-slate-800` : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <span className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${p.color}`} />
                                        <span className="truncate max-w-[120px]">{p.name}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filters: Type */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-950 uppercase tracking-widest italic">Types</h3>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedType(selectedType === key ? 'all' : key)}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${selectedType === key ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}
                                >
                                    {cfg.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- Main Calendar Grid --- */}
                <div className="flex-1 flex flex-col min-w-0 bg-white">
                    {/* Header */}
                    <div className="h-20 border-b border-slate-100 px-8 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm border border-indigo-100/50">
                                    <CalendarIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-950 tracking-tight leading-none uppercase">
                                        {MONTHS[month]} <span className="text-slate-400 font-bold ml-1">{year}</span>
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest italic">Vue Mensuelle Globale</p>
                                </div>
                            </div>

                            <div className="flex items-center bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50 ml-4">
                                <button onClick={prevMonth} className="px-3 py-1.5 hover:bg-white hover:shadow-sm rounded-xl text-slate-400 hover:text-slate-900 transition-all"><ChevronLeft className="w-4 h-4" /></button>
                                <button onClick={goToday} className="px-5 py-1.5 bg-white shadow-sm rounded-xl text-xs font-black text-slate-950 border border-slate-200/50 transition-all active:scale-95 mx-1">Aujourd'hui</button>
                                <button onClick={nextMonth} className="px-3 py-1.5 hover:bg-white hover:shadow-sm rounded-xl text-slate-400 hover:text-slate-900 transition-all"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center bg-slate-50 rounded-xl border border-slate-100 px-3 py-1.5 gap-2">
                                <Search className="w-3.5 h-3.5 text-slate-400" />
                                <input type="text" placeholder="Rechercher..." className="bg-transparent text-xs font-bold outline-none text-slate-600 w-32 focus:w-48 transition-all" />
                            </div>
                            <Button variant="outline" className="rounded-xl border-slate-200 h-10 px-4 flex items-center gap-2 group">
                                <Filter className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                <span className="text-xs font-black text-slate-700">Vue</span>
                            </Button>
                        </div>
                    </div>

                    {/* Days Header */}
                    <div className="grid grid-cols-7 border-b border-slate-50 bg-white">
                        {DAYS_OF_WEEK.map(day => (
                            <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Grid Content */}
                    <div className="flex-1 overflow-hidden relative group/grid">
                        <AnimatePresence mode="popLayout" custom={direction}>
                            <motion.div
                                key={currentDate.toISOString()}
                                custom={direction}
                                initial={{ x: direction * 40, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: direction * -40, opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="grid grid-cols-7 h-full absolute inset-0"
                            >
                                {/* Start Empty Cells */}
                                {Array.from({ length: startDayIndex }).map((_, i) => (
                                    <div key={`empty-${i}`} className="bg-slate-50/40 border-r border-b border-slate-50/60" />
                                ))}

                                {/* Day Cells */}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                    const dayEvents = eventsByDate[dateStr] || [];
                                    const isToday = new Date().toISOString().split('T')[0] === dateStr;

                                    return (
                                        <div key={day} className={`relative flex flex-col group/day border-r border-b border-slate-100 p-2 min-h-0 bg-white hover:bg-indigo-50/10 transition-colors`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`w-7 h-7 flex items-center justify-center rounded-xl text-xs font-black transition-all ${isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 group-hover/day:text-slate-900'}`}>
                                                    {day}
                                                </span>
                                                <button
                                                    onClick={() => openAddEvent(dateStr)}
                                                    className="opacity-0 group-hover/day:opacity-100 p-1 hover:bg-white hover:shadow-sm rounded-lg text-slate-300 hover:text-indigo-600 transition-all"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>

                                            <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-0.5">
                                                {dayEvents.map(event => {
                                                    const project = projects.find(p => p.id === event.project);
                                                    const typeIcon = TYPE_CONFIG[event.type as keyof typeof TYPE_CONFIG];
                                                    return (
                                                        <motion.div
                                                            key={event.id}
                                                            layoutId={event.id}
                                                            className={`p-1.5 rounded-xl border border-transparent bg-white shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group/card`}
                                                        >
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${project?.color || 'bg-slate-400'}`} />
                                                                <span className="text-[9px] font-black text-slate-900 truncate flex-1">{event.title}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                {typeIcon.icon}
                                                                <span className={`text-[8px] font-bold uppercase tracking-wider ${typeIcon.color}`}>{typeIcon.label}</span>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>

                                            {/* Density Indicator */}
                                            {dayEvents.length > 3 && (
                                                <div className="absolute top-2 right-10">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* End Empty Cells */}
                                {Array.from({ length: (7 - (startDayIndex + daysInMonth) % 7) % 7 }).map((_, i) => (
                                    <div key={`empty-end-${i}`} className="bg-slate-50/40 border-r border-b border-slate-50/60" />
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer / Legend */}
                    <div className="h-12 border-t border-slate-100 px-6 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Confirmé</span>
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> En attente</span>
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> Urgent</span>
                        </div>
                        <span>{allEvents.length} événements ce mois-ci</span>
                    </div>
                </div>
            </div>

            {/* --- Add Event Modal --- */}
            <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                <DialogContent className="max-w-md bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="bg-slate-50 px-8 py-6 border-b border-slate-100">
                        <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                                <Plus className="w-5 h-5" />
                            </div>
                            Nouvel Événement
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Titre de l'événement</Label>
                            <Input
                                placeholder="ex: Réunion d'équipe"
                                className="h-12 rounded-xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-indigo-500 shadow-none transition-all placeholder:text-slate-300"
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Date</Label>
                                <Input
                                    type="date"
                                    className="h-12 rounded-xl border-slate-100 bg-slate-50 focus:bg-white shadow-none transition-all"
                                    value={newEvent.date}
                                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Projet</Label>
                                <select
                                    className="w-full h-12 rounded-xl border-slate-100 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                                    value={newEvent.project}
                                    onChange={(e) => setNewEvent({ ...newEvent, project: e.target.value })}
                                >
                                    <option value="">Sélectionner un projet</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Type d'activité</Label>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                                    <button
                                        key={key}
                                        onClick={() => setNewEvent({ ...newEvent, type: key })}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${newEvent.type === key ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-slate-200'}`}
                                    >
                                        {cfg.icon}
                                        {cfg.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex items-center justify-between">
                        <Button variant="ghost" onClick={() => setIsAddEventOpen(false)} className="rounded-xl font-bold text-slate-500">Annuler</Button>
                        <Button
                            onClick={handleAddEvent}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 h-11 font-black shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                        >
                            Créer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #cbd5e1; }
            `}</style>
        </AppLayout>
    );
};

export default CalendarPage;
