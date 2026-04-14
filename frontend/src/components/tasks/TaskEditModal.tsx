import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    CheckSquare,
    Calendar,
    Tag,
    Info,
    User2,
    Zap,
    AlertCircle,
    Copy,
    Trash2,
    Check,
    X,
    FileText,
    Type,
    Target,
    BarChart
} from 'lucide-react';
import type { Task, TaskStatus, TaskPriority, TaskType, Sprint } from '@/types/project.types';

interface TaskEditModalProps {
    isOpen: boolean;
    task: Task;
    sprints: Sprint[];
    onClose: () => void;
    onUpdate: (task: Task) => void;
    onDelete?: (id: string) => void;
    onDuplicate?: (task: Task) => void;
}

const TYPE_CONFIG: Record<TaskType, { label: string; icon: any; color: string; gradient: string }> = {
    STORY: { label: 'User Story', icon: Target, color: 'text-indigo-600', gradient: 'from-blue-500 to-indigo-600' },
    TASK: { label: 'Tâche Tech', icon: CheckSquare, color: 'text-slate-600', gradient: 'from-slate-500 to-slate-700' },
    BUG: { label: 'Correction Bug', icon: AlertCircle, color: 'text-red-600', gradient: 'from-red-500 to-rose-600' },
    IMPROVEMENT: { label: 'Amélioration', icon: Zap, color: 'text-amber-600', gradient: 'from-amber-500 to-orange-600' },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; dot: string; bg: string }> = {
    CRITICAL: { label: 'Critique', color: 'text-red-700', dot: 'bg-red-500', bg: 'bg-red-50/50' },
    HIGH: { label: 'Haute', color: 'text-orange-700', dot: 'bg-orange-500', bg: 'bg-orange-50/50' },
    MEDIUM: { label: 'Moyenne', color: 'text-indigo-700', dot: 'bg-indigo-500', bg: 'bg-indigo-50/50' },
    LOW: { label: 'Basse', color: 'text-emerald-700', dot: 'bg-emerald-500', bg: 'bg-emerald-50/50' },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; dot: string }> = {
    TODO: { label: 'À faire', dot: 'bg-slate-300' },
    IN_PROGRESS: { label: 'En cours', dot: 'bg-blue-500' },
    IN_TEST: { label: 'En test', dot: 'bg-violet-500' },
    DONE: { label: 'Terminé', dot: 'bg-emerald-500' },
};

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
    isOpen, task, sprints, onClose, onUpdate, onDelete, onDuplicate
}) => {
    const [form, setForm] = useState<Task | null>(null);
    const [tagsString, setTagsString] = useState('');

    useEffect(() => {
        if (task && isOpen) {
            setForm({ ...task });
            setTagsString((task.tags || []).join(', '));
        } else if (!isOpen) {
            setForm(null);
        }
    }, [task, isOpen]);

    // EARLY RETURN GUARD
    if (!isOpen || !task || !form) return null;

    const handleUpdate = () => {
        if (!form || !form.title.trim()) return;
        onUpdate({
            ...form,
            tags: tagsString.split(',').map(t => t.trim()).filter(Boolean),
        });
        onClose();
    };

    const handleDuplicate = () => {
        if (onDuplicate && form) {
            onDuplicate({
                ...form,
                id: `t${Date.now()}`,
                title: `${form.title} (Copie)`,
                createdAt: new Date().toISOString(),
            });
            onClose();
        }
    };

    const typeCfg = TYPE_CONFIG[form.type] || TYPE_CONFIG.TASK;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-[32px]">
                {/* Elegant Minimal Header */}
                <div className="relative px-6 pt-6 pb-4 bg-slate-50/80 backdrop-blur-md border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br",
                                typeCfg.gradient
                            )}>
                                <typeCfg.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-black text-slate-900 leading-none uppercase tracking-tight">Détails de la tâche</DialogTitle>
                                <DialogDescription className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 italic">{typeCfg.label}</DialogDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2" />
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto px-6 py-6 bg-white space-y-6 custom-scrollbar">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Type className="w-3.5 h-3.5" /> Désignation de la tâche
                            </Label>
                            <Input 
                                value={form.title}
                                onChange={e => setForm({...form, title: e.target.value})}
                                className="h-11 rounded-xl border-slate-100 bg-slate-50/30 text-sm font-bold focus-visible:ring-indigo-500/20"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Statut</Label>
                                <Select value={form.status} onValueChange={(v) => setForm({...form, status: v as TaskStatus})}>
                                    <SelectTrigger className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[form.status].dot)} />
                                            <SelectValue />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                            <SelectItem key={k} value={k} className="text-xs font-bold">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-1.5 h-1.5 rounded-full", v.dot)} />
                                                    {v.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Priorité</Label>
                                <Select value={form.priority} onValueChange={(v) => setForm({...form, priority: v as TaskPriority})}>
                                    <SelectTrigger className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                                            <SelectItem key={k} value={k} className={cn("text-xs font-bold", v.color)}>
                                                {v.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Description / Notes</Label>
                        <Textarea 
                            value={form.description}
                            onChange={e => setForm({...form, description: e.target.value})}
                            rows={4}
                            className="rounded-xl border-slate-100 bg-slate-50/30 text-xs font-medium italic resize-none"
                            placeholder="Écrivez des notes détaillées..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Sprint assigné</Label>
                            <Select 
                                value={form.sprintId ?? 'unassigned'} 
                                onValueChange={(v) => setForm({...form, sprintId: v === 'unassigned' ? undefined : v})}
                            >
                                <SelectTrigger className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold text-[11px]">
                                    <SelectValue placeholder="Choisir un sprint">
                                        {(() => {
                                            const id = form.sprintId;
                                            if (!id) return 'Backlog Projet';
                                            const sprint = sprints.find((s) => s.id === id);
                                            return sprint?.name ?? 'Choisir un sprint';
                                        })()}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="unassigned" className="text-slate-400 italic">Backlog Projet</SelectItem>
                                    {sprints.map(s => (
                                        <SelectItem key={s.id} value={s.id} className="text-[11px] font-black uppercase tracking-tight">{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Story Points</Label>
                            <Input 
                                type="number"
                                min={0}
                                value={form.storyPoints}
                                onChange={e => setForm({...form, storyPoints: Math.max(0, parseInt(e.target.value) || 0)})}
                                className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-black text-sm text-indigo-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Mots-clés (Tags)</Label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                            <Input 
                                value={tagsString}
                                onChange={e => setTagsString(e.target.value)}
                                className="pl-9 h-11 rounded-xl border-slate-100 bg-slate-50/30 text-xs font-bold"
                                placeholder="bug, ui, refactor..."
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between shadow-[0_-8px_20px_rgba(0,0,0,0.02)]">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600">
                        Fermer
                    </Button>
                    <Button 
                        onClick={handleUpdate}
                        className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.1em] shadow-lg shadow-indigo-500/10 transition-all"
                    >
                        Enregistrer les modifications
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
