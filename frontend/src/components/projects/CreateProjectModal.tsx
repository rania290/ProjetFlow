import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Plus, FolderKanban, Zap, Calendar, DollarSign,
    Tag, FileText, Users, ChevronRight, Check, AlertCircle,
    Info, Briefcase, Layout
} from 'lucide-react';
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
import { useStore } from '../../store/projectStore';
import type { ProjectType, ProjectStatus } from '../../types/project.types';
import { projectsService } from '../../api/projects.service';

const PROJECT_TYPES: { id: ProjectType; label: string; desc: string; icon: React.ReactNode; gradient: string }[] = [
    {
        id: 'WEB_APPLICATION',
        label: 'Application Web',
        desc: 'Plateforme web responsive ou site vitrine',
        icon: <Layout className="w-5 h-5" />,
        gradient: 'from-blue-500 to-indigo-600',
    },
    {
        id: 'MOBILE_APP',
        label: 'Application Mobile',
        desc: 'App native iOS / Android ou Cross-platform',
        icon: <Zap className="w-5 h-5 fill-current" />,
        gradient: 'from-emerald-500 to-teal-600',
    },
    {
        id: 'API_INTEGRATION',
        label: 'Système API',
        desc: 'Microservices, backend ou intégrations tierces',
        icon: <Zap className="w-5 h-5" />,
        gradient: 'from-violet-500 to-purple-600',
    },
    {
        id: 'ECOMMERCE_PLATFORM',
        label: 'E-commerce',
        desc: 'Boutique en ligne ou marketplace',
        icon: <Tag className="w-5 h-5" />,
        gradient: 'from-orange-500 to-red-600',
    },
];

const STATUS_OPTIONS: { id: ProjectStatus; label: string }[] = [
    { id: 'PLANNED', label: 'Planifié' },
    { id: 'IN_PROGRESS', label: 'En cours' },
    { id: 'DELIVERED', label: 'Livré' },
    { id: 'SUSPENDED', label: 'Suspendu' },
];

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateProjectModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { dispatch } = useStore();

    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: '',
        description: '',
        type: 'WEB_APPLICATION' as ProjectType,
        status: 'PLANNED' as ProjectStatus,
        clientName: '',
        managerName: 'Moi',
        budget: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
    });
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const set = (field: string, value: any) => {
        setForm(f => ({ ...f, [field]: value }));
        if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n; });
    };

    const addTag = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const t = tagInput.trim();
        if (t && !tags.includes(t)) setTags(v => [...v, t]);
        setTagInput('');
    };

    const removeTag = (t: string) => setTags(v => v.filter(x => x !== t));

    const validateStep1 = () => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = 'Le nom est requis.';
        if (!form.description.trim()) e.description = 'La description est requise.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep2 = () => {
        const e: Record<string, string> = {};
        if (!form.startDate) e.startDate = 'Date de début requise.';
        if (!form.endDate) e.endDate = 'Date de livraison requise.';
        if (form.startDate && form.endDate && form.startDate > form.endDate)
            e.endDate = 'La date de fin doit être après le début.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) setStep(2);
        else if (step === 2 && validateStep2()) setStep(3);
    };

    const handleCreate = async () => {
        setLoading(true);
        try {
            const projectData = {
                name: form.name.trim(),
                description: form.description.trim(),
                type: form.type,
                viewMode: 'BOARD' as const,
                status: form.status,
                clientName: form.clientName.trim() || undefined,
                budget: form.budget ? Number(form.budget) : 0,
                startDate: form.startDate,
                endDate: form.endDate,
                progress: 0,
            };

            const newProject = await projectsService.create(projectData);
            dispatch({ type: 'ADD_PROJECT', project: newProject });
            onClose();
        } catch (error) {
            console.error('Failed to create project:', error);
            setErrors({ submit: 'Erreur lors de la création du projet.' });
        } finally {
            setLoading(false);
        }
    };

    const STEPS = ['Configuration', 'Planification', 'Validation'];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[32px]">
                {/* Custom Header with Progress */}
                <div className="relative px-6 pt-6 pb-4 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <Plus className="w-6 h-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-900 leading-none">Nouveau Projet</DialogTitle>
                                <DialogDescription className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">{STEPS[step-1]}</DialogDescription>
                            </div>
                        </div>
                    </div>

                    {/* Modern Progress Line */}
                    <div className="flex items-center gap-4">
                        {STEPS.map((s, i) => (
                            <React.Fragment key={s}>
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300",
                                        step > i + 1 ? "bg-emerald-500 text-white" : 
                                        step === i + 1 ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30" : 
                                        "bg-slate-200 text-slate-400"
                                    )}>
                                        {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
                                    </div>
                                    <span className={cn(
                                        "hidden sm:block text-[11px] font-black uppercase tracking-widest",
                                        step >= i + 1 ? "text-slate-800" : "text-slate-300"
                                    )}>{s}</span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className="flex-1 h-px bg-slate-200" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto px-6 py-6 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: 20 }} 
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5" /> Nom du projet <span className="text-red-500">*</span>
                                    </Label>
                                    <Input 
                                        autoFocus 
                                        value={form.name} 
                                        onChange={e => set('name', e.target.value)}
                                        placeholder="ex: Transformation Digitale 2024"
                                        className={cn(
                                            "h-12 rounded-xl text-sm font-bold border-slate-200 focus-visible:ring-primary-500/20",
                                            errors.name && "border-red-300 bg-red-50"
                                        )}
                                    />
                                    {errors.name && <p className="text-[10px] font-bold text-red-500 uppercase italic ml-1">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                        Description <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea 
                                        value={form.description} 
                                        onChange={e => set('description', e.target.value)}
                                        placeholder="Quels sont les enjeux et objectifs de ce projet ?"
                                        rows={3}
                                        className={cn(
                                            "rounded-xl text-sm border-slate-200 focus-visible:ring-primary-500/20 resize-none",
                                            errors.description && "border-red-300 bg-red-50"
                                        )}
                                    />
                                    {errors.description && <p className="text-[10px] font-bold text-red-500 uppercase italic ml-1">{errors.description}</p>}
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">
                                        Type de plateforme
                                    </Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {PROJECT_TYPES.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => set('type', t.id)}
                                                className={cn(
                                                    "relative text-left p-4 rounded-2xl border-2 transition-all group overflow-hidden",
                                                    form.type === t.id 
                                                        ? "border-primary-600 bg-primary-50/30" 
                                                        : "border-slate-100 hover:border-slate-200 bg-white"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3 shadow-md bg-gradient-to-br",
                                                    t.gradient
                                                )}>
                                                    {t.icon}
                                                </div>
                                                <h4 className={cn("text-[13px] font-black", form.type === t.id ? "text-primary-700" : "text-slate-700")}>{t.label}</h4>
                                                <p className="text-[11px] text-slate-400 font-medium leading-tight mt-1">{t.desc}</p>
                                                
                                                {form.type === t.id && (
                                                    <div className="absolute top-4 right-4">
                                                        <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                                                            <Check className="w-3 h-3 text-white" />
                                                        </div>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: 20 }} 
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5" /> Date de début <span className="text-red-500">*</span>
                                        </Label>
                                        <Input 
                                            type="date" 
                                            value={form.startDate} 
                                            onChange={e => set('startDate', e.target.value)}
                                            className="h-11 rounded-xl font-bold border-slate-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                            Date de livraison <span className="text-red-500">*</span>
                                        </Label>
                                        <Input 
                                            type="date" 
                                            value={form.endDate} 
                                            onChange={e => set('endDate', e.target.value)}
                                            className={cn("h-11 rounded-xl font-bold border-slate-200", errors.endDate && "border-red-300")}
                                        />
                                    </div>
                                </div>
                                {errors.endDate && <p className="text-[10px] font-bold text-red-500 uppercase italic ml-1">{errors.endDate}</p>}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <Users className="w-3.5 h-3.5" /> Client (Entité)
                                        </Label>
                                        <Input 
                                            value={form.clientName} 
                                            onChange={e => set('clientName', e.target.value)}
                                            placeholder="ex: Google Search Console"
                                            className="h-11 rounded-xl border-slate-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <DollarSign className="w-3.5 h-3.5" /> Budget global
                                        </Label>
                                        <Input 
                                            type="number" 
                                            value={form.budget} 
                                            onChange={e => set('budget', e.target.value)}
                                            placeholder="ex: 45000"
                                            className="h-11 rounded-xl border-slate-200 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                        Mots-clés (Tags)
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            value={tagInput} 
                                            onChange={e => setTagInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && addTag()}
                                            placeholder="ex: Architecture, React, SaaS..."
                                            className="h-11 rounded-xl border-slate-200 flex-1"
                                        />
                                        <Button onClick={() => addTag()} type="button" variant="outline" className="h-11 px-4 rounded-xl font-bold">
                                            Ajouter
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {tags.map(t => (
                                            <Badge key={t} className="bg-primary-50 text-primary-700 hover:bg-primary-100 border-primary-100 rounded-lg px-3 py-1 font-bold text-[10px] uppercase gap-2">
                                                {t}
                                                <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(t)} />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div 
                                key="step3"
                                initial={{ opacity: 0, scale: 0.95 }} 
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-6 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                        <Check className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-emerald-900">Tout semble prêt !</h4>
                                        <p className="text-xs text-emerald-700 font-medium mt-1 italic">Veuillez valider le récapitulatif pour finaliser la création.</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-[28px] border border-slate-100 p-8 space-y-6 shadow-inner">
                                    <div>
                                        <h4 className="text-[20px] font-black text-slate-900 leading-tight mb-2">{form.name}</h4>
                                        <p className="text-xs text-slate-500 italic leading-relaxed line-clamp-3">{form.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Typologie</p>
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-primary-600 border-none font-black text-[10px] uppercase h-6">
                                                    {PROJECT_TYPES.find(t => t.id === form.type)?.label}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Client</p>
                                            <p className="text-sm font-black text-slate-800">{form.clientName || 'Interne'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Calendrier</p>
                                            <p className="text-xs font-black text-slate-800">{form.startDate} <span className="text-slate-300 px-1">→</span> {form.endDate}</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Budget</p>
                                            <p className="text-sm font-black text-emerald-600">{form.budget ? Number(form.budget).toLocaleString() + ' DT' : 'À définir'}</p>
                                        </div>
                                    </div>
                                    
                                    {tags.length > 0 && (
                                        <div className="pt-4 border-t border-slate-200">
                                            <div className="flex flex-wrap gap-1.5">
                                                {tags.map(t => (
                                                    <span key={t} className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white border border-slate-100 px-2.5 py-1 rounded-lg">
                                                        #{t}
                                                    </span>
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
                    <div className="flex items-center gap-3">
                        {step === 1 ? (
                            <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold text-slate-400 hover:text-slate-600">Annuler</Button>
                        ) : (
                            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="rounded-xl font-bold border-slate-200 h-11 px-6">Précédent</Button>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {errors.submit && <span className="text-[10px] font-bold text-red-500 uppercase pr-2 animate-bounce">{errors.submit}</span>}
                        {step < 3 ? (
                            <Button 
                                onClick={handleNext} 
                                className="h-11 px-8 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-black shadow-lg shadow-primary-500/20 flex items-center gap-2 group transition-all"
                            >
                                Suivant <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleCreate} 
                                disabled={loading}
                                className="h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
                            >
                                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                Créer le Projet
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
