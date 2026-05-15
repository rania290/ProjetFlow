import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Plus, Zap, Calendar, Target,
    ChevronRight, Check, AlertCircle, Info,
    BarChart3, Clock, Rocket
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
import type { Sprint } from '@/types/project.types';

interface CreateSprintModalProps {
    isOpen: boolean;
    projectId: string;
    onClose: () => void;
    onCreated: (sprint: Sprint) => void;
}

export const CreateSprintModal: React.FC<CreateSprintModalProps> = ({
    isOpen, projectId, onClose, onCreated
}) => {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: `Sprint ${new Date().toLocaleDateString('fr-FR', { month: 'short' })}`,
        goal: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    const STEPS = ['Planification', 'Objectifs'];

    const handleNext = () => {
        if (!form.name.trim()) return;
        setStep(2);
    };

    const handleCreate = () => {
        const newSprint: Sprint = {
            id: `s${Date.now()}`,
            projectId,
            ...form,
            status: 'PLANNED',
        };
        onCreated(newSprint);
        onClose();
        setStep(1);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-[32px]">
                {/* Elegant Wizard Header */}
                <div className="relative px-8 pt-8 pb-6 bg-slate-50/80 backdrop-blur-md border-b border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-indigo-500/20">
                                <Rocket className="w-5 h-5 fill-current" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black text-slate-900 leading-none uppercase tracking-tight">Nouveau Sprint</DialogTitle>
                                <DialogDescription className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 italic">{STEPS[step - 1]}</DialogDescription>
                            </div>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-3">
                        {STEPS.map((s, i) => (
                            <React.Fragment key={s}>
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all",
                                        step > i + 1 ? "bg-emerald-500 text-white" :
                                            step === i + 1 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" :
                                                "bg-slate-200 text-slate-400"
                                    )}>
                                        {step > i + 1 ? <Check className="w-2.5 h-2.5" /> : i + 1}
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

                <div className="px-8 py-8 bg-white">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Zap className="w-3.5 h-3.5" /> Nom de l'itération
                                    </Label>
                                    <Input
                                        autoFocus
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="h-12 rounded-xl text-sm font-bold border-slate-100 bg-slate-50/30 focus-visible:ring-indigo-500/20"
                                        placeholder="ex: Sprint Alpha 1.0"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5" /> Date début
                                        </Label>
                                        <DatePicker 
                                            date={form.startDate ? new Date(form.startDate) : undefined}
                                            setDate={(d) => setForm({ ...form, startDate: d ? d.toISOString().split('T')[0] : '' })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5" /> Date Clôture
                                        </Label>
                                        <DatePicker 
                                            date={form.endDate ? new Date(form.endDate) : undefined}
                                            setDate={(d) => setForm({ ...form, endDate: d ? d.toISOString().split('T')[0] : '' })}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="s2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Target className="w-3.5 h-3.5" /> Objectif Principal
                                    </Label>
                                    <Textarea
                                        autoFocus
                                        value={form.goal}
                                        onChange={e => setForm({ ...form, goal: e.target.value })}
                                        rows={4}
                                        className="rounded-xl text-xs border-slate-100 bg-slate-50/30 resize-none italic font-medium"
                                        placeholder="Décrivez l'impact attendu de ce sprint..."
                                    />
                                </div>
                                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-amber-700 italic font-medium leading-relaxed">
                                        L'objectif sera affiché à toute l'équipe sur le tableau de bord pour maintenir le focus.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <DialogFooter className="px-8 py-6 bg-white border-t border-slate-100 flex items-center justify-between shadow-[0_-8px_20px_rgba(0,0,0,0.02)]">
                    <Button variant="ghost" onClick={step === 1 ? onClose : () => setStep(1)} className="rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600">
                        {step === 1 ? 'Annuler' : 'Précédent'}
                    </Button>

                    <Button
                        onClick={step === 1 ? handleNext : handleCreate}
                        className="h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-[0.1em] shadow-lg shadow-indigo-500/20 group transition-all"
                    >
                        {step === 1 ? 'Suivant' : 'Lancer le Sprint'}
                        {step === 1 && <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
