import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Plus, CheckSquare, Zap, Calendar,
    Tag, FileText, Users, ChevronRight, Check,
    AlertCircle, Info, Target, Layout, Type
} from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { Task, TaskStatus, TaskPriority, TaskType, Sprint } from '@/types/project.types';
import { projectsService } from '@/api/projects.service';
import { auraService } from '@/api/aura.service';
import { Loader2 } from 'lucide-react';

interface CreateTaskModalProps {
    isOpen: boolean;
    projectId: string;
    sprintId?: string;
    defaultStatus?: TaskStatus;
    defaultDueDate?: string;
    sprints: Sprint[];
    onClose: () => void;
    onCreated: (task: Task) => void;
}

const TYPE_OPTIONS: { id: TaskType; label: string; desc: string; icon: any; color: string; gradient: string }[] = [
    { id: 'STORY', label: 'User Story', desc: 'Fonctionnalité orientée utilisateur', icon: Target, color: 'text-primary-600', gradient: 'from-blue-500 to-indigo-600' },
    { id: 'TASK', label: 'Tâche Tech', desc: 'Travail technique ou maintenance', icon: CheckSquare, color: 'text-slate-600', gradient: 'from-slate-500 to-slate-700' },
    { id: 'BUG', label: 'Bug / Erreur', desc: 'Correction d\'un problème existant', icon: AlertCircle, color: 'text-red-600', gradient: 'from-red-500 to-rose-600' },
];

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
    isOpen, projectId, sprintId, defaultStatus, defaultDueDate, sprints, onClose, onCreated
}) => {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        title: '',
        description: '',
        status: defaultStatus || 'TODO' as TaskStatus,
        priority: 'MEDIUM' as TaskPriority,
        type: 'TASK' as TaskType,
        storyPoints: 0,
        dueDate: defaultDueDate || '',
        tags: [] as string[],
    });
    const [tagInput, setTagInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Aura Suggestions State
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
    const [isSuggesting, setIsSuggesting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setForm({
                title: '',
                description: '',
                status: defaultStatus || 'TODO',
                priority: 'MEDIUM',
                type: 'TASK',
                storyPoints: 0,
                dueDate: defaultDueDate || '',
                tags: [],
            });
            setTagInput('');
            setSuggestions([]);
            setSelectedSuggestions(new Set());
        }
    }, [isOpen, defaultStatus, defaultDueDate]);

    const handleSuggest = async () => {
        if (!form.title.trim()) return;
        setIsSuggesting(true);
        try {
            const tasks = await auraService.suggestTasks(form.title, form.description);
            setSuggestions(tasks);
            setSelectedSuggestions(new Set(tasks)); // Tout sélectionner par défaut
        } catch (error) {
            console.error('Aura failed to suggest tasks:', error);
        } finally {
            setIsSuggesting(false);
        }
    };

    const toggleSuggestion = (task: string) => {
        const next = new Set(selectedSuggestions);
        if (next.has(task)) next.delete(task);
        else next.add(task);
        setSelectedSuggestions(next);
    };

    const STEPS = ['Configuration', 'Détails', 'Récapitulatif'];

    const handleNext = () => {
        if (step === 1 && !form.title.trim()) return;
        setStep(prev => prev + 1);
    };

    const handleCreate = async () => {
        setIsSubmitting(true);
        try {
            const taskData = {
                projectId,
                sprintId: sprintId || undefined,
                ...form,
                dueDate: form.dueDate || undefined,
            };
            const createdTask = await projectsService.createTask(taskData);
            
            // Create suggested sub-tasks if any are selected
            if (selectedSuggestions.size > 0) {
                for (const subTaskTitle of selectedSuggestions) {
                    await projectsService.createTask({
                        projectId,
                        sprintId: sprintId || undefined,
                        parentTaskId: createdTask.id,
                        title: subTaskTitle,
                        description: `Généré automatiquement par Aura IA pour la story: ${form.title}`,
                        type: 'TASK',
                        status: 'TODO',
                        priority: form.priority,
                        storyPoints: 1
                    });
                }
            }

            onCreated(createdTask);
            onClose();
            setStep(1);
        } catch (error) {
            console.error('Failed to create task:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentType = TYPE_OPTIONS.find(t => t.id === form.type) || TYPE_OPTIONS[1];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-[32px]">
                {/* Elegant Wizard Header (Matching Project UI) */}
                <div className="relative px-6 pt-6 pb-4 bg-slate-50/80 backdrop-blur-md border-b border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br",
                                currentType.gradient
                            )}>
                                <currentType.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black text-slate-900 leading-none uppercase tracking-tight">Nouvelle Tâche</DialogTitle>
                                <DialogDescription className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 italic">{STEPS[step - 1]}</DialogDescription>
                            </div>
                        </div>
                    </div>

                    {/* Modern Progress Steps */}
                    <div className="flex items-center gap-3">
                        {STEPS.map((s, i) => (
                            <React.Fragment key={s}>
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all",
                                        step > i + 1 ? "bg-emerald-500 text-white" :
                                            step === i + 1 ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20" :
                                                "bg-slate-200 text-slate-400"
                                    )}>
                                        {step > i + 1 ? <Check className="w-3 h-3" /> : i + 1}
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest",
                                        step >= i + 1 ? "text-slate-800" : "text-slate-300"
                                    )}>{s}</span>
                                </div>
                                {i < STEPS.length - 1 && <div className="flex-1 h-px bg-slate-200" />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="max-h-[55vh] overflow-y-auto px-6 py-6 custom-scrollbar bg-white">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Type className="w-3.5 h-3.5" /> Titre de la tâche <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        autoFocus
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        className="h-12 rounded-xl text-sm font-bold border-slate-100 bg-slate-50/30 focus-visible:ring-primary-500/20"
                                        placeholder="ex: Design du système de navigation..."
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Type de tâche</Label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {TYPE_OPTIONS.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => setForm({ ...form, type: t.id })}
                                                className={cn(
                                                    "relative text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group",
                                                    form.type === t.id ? "border-primary-600 bg-primary-50/50" : "border-slate-50 bg-white hover:border-slate-100"
                                                )}
                                            >
                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br", t.gradient)}>
                                                    <t.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className={cn("text-xs font-black uppercase tracking-tight", form.type === t.id ? "text-primary-800" : "text-slate-700")}>{t.label}</h4>
                                                    <p className="text-[10px] text-slate-400 font-medium italic mt-0.5">{t.desc}</p>
                                                </div>
                                                {form.type === t.id && <div className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-primary-600 text-white"><Check className="w-3 h-3" /></div>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Priorité</Label>
                                        <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as TaskPriority })}>
                                            <SelectTrigger className="h-11 rounded-xl font-bold border-slate-100 bg-slate-50/30">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="LOW" className="text-xs font-bold">Basse</SelectItem>
                                                <SelectItem value="MEDIUM" className="text-xs font-bold">Moyenne</SelectItem>
                                                <SelectItem value="HIGH" className="text-xs font-bold">Haute</SelectItem>
                                                <SelectItem value="CRITICAL" className="text-xs font-bold text-red-600 uppercase">Critique</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Story Points</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={form.storyPoints}
                                            onChange={e => setForm({ ...form, storyPoints: Math.max(0, parseInt(e.target.value) || 0) })}
                                            className="h-11 rounded-xl font-bold border-slate-100 bg-slate-50/30"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleSuggest}
                                            disabled={isSuggesting || !form.title.trim()}
                                            className="h-7 px-3 text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg flex items-center gap-2 border-none"
                                        >
                                            {isSuggesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 fill-amber-500" />}
                                            {suggestions.length > 0 ? "Actualiser les suggestions" : "Suggérer des tâches (IA)"}
                                        </Button>
                                    </div>
                                    
                                    <Textarea
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        rows={3}
                                        className="rounded-xl text-xs border-slate-100 bg-slate-50/30 resize-none italic font-medium"
                                        placeholder="Détails sur la tâche..."
                                    />

                                    <AnimatePresence>
                                        {suggestions.length > 0 && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }} 
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="space-y-3 pt-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                                                        Cliquez pour accepter ou rejeter les suggestions :
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setSelectedSuggestions(new Set(suggestions))}
                                                            className="h-6 px-2 text-[8px] font-black text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg uppercase tracking-wider transition-all"
                                                        >
                                                            Tout sélectionner
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setSelectedSuggestions(new Set())}
                                                            className="h-6 px-2 text-[8px] font-black text-slate-400 bg-slate-50 hover:bg-slate-100 rounded-lg uppercase tracking-wider transition-all"
                                                        >
                                                            Tout désélectionner
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {suggestions.map((s, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => toggleSuggestion(s)}
                                                            className={cn(
                                                                "flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all",
                                                                selectedSuggestions.has(s) 
                                                                    ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                                                                    : "bg-slate-50 border-slate-100 text-slate-400 line-through opacity-60"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "w-4 h-4 rounded flex items-center justify-center border transition-all",
                                                                selectedSuggestions.has(s) ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"
                                                            )}>
                                                                {selectedSuggestions.has(s) && <Check className="w-2.5 h-2.5" />}
                                                            </div>
                                                            <span className="text-[11px] font-bold">{s}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" /> Échéance
                                    </Label>
                                    <DatePicker 
                                        date={form.dueDate ? new Date(form.dueDate) : undefined}
                                        setDate={(d) => setForm({ ...form, dueDate: d ? d.toISOString().split('T')[0] : '' })}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                                <div className="bg-slate-50/80 rounded-[28px] border border-slate-100 p-8 space-y-6 shadow-inner-sm">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <Badge className={cn("text-[9px] font-black uppercase tracking-widest h-6", currentType.color === 'text-red-600' ? "bg-red-500 text-white" : "bg-primary-600 text-white")}>
                                                {currentType.label}
                                            </Badge>
                                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-200 text-slate-400">
                                                {form.priority}
                                            </Badge>
                                        </div>
                                        <h4 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">{form.title}</h4>
                                        <p className="text-xs text-slate-400 italic leading-relaxed mt-2 line-clamp-3">{form.description || 'Aucune description fournie.'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Échéance</p>
                                            <p className="text-xs font-bold text-slate-700">{form.dueDate || 'À définir'}</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Points d'effort</p>
                                            <p className="text-xl font-black text-primary-600">{form.storyPoints} pts</p>
                                        </div>
                                    </div>

                                    {selectedSuggestions.size > 0 && (
                                        <div className="space-y-3 pt-4 border-t border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" /> Sous-tâches Aura à créer ({selectedSuggestions.size})
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {Array.from(selectedSuggestions).map(s => (
                                                    <Badge key={s} variant="secondary" className="bg-amber-50 text-amber-700 border-amber-100 text-[10px] py-1 px-2 font-bold rounded-lg">
                                                        {s}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <DialogFooter className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between shadow-[0_-8px_20px_rgba(0,0,0,0.02)]">
                    <Button 
                        variant="ghost" 
                        onClick={step === 1 ? onClose : () => setStep(prev => prev - 1)} 
                        className="rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600"
                    >
                        {step === 1 ? 'Annuler' : 'Précédent'}
                    </Button>

                    <Button 
                        onClick={step < 3 ? handleNext : handleCreate} 
                        disabled={isSubmitting}
                        className="h-11 px-8 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-black text-[11px] uppercase tracking-[0.1em] shadow-lg shadow-primary-500/20 flex items-center gap-2 group transition-all"
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {step < 3 ? (
                            <>
                                Suivant <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        ) : (
                            'Créer la Tâche'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
