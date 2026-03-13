import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Plus, FolderKanban, Zap, Calendar, DollarSign,
    Tag, FileText, Users, ChevronRight
} from 'lucide-react';
import { useStore } from '../../store/projectStore';
import type { ProjectType, ProjectStatus } from '../../types/project.types';
import { projectsService } from '../../api/projects.service';

const PROJECT_TYPES: { id: ProjectType; label: string; desc: string; icon: React.ReactNode; color: string; gradient: string }[] = [
    {
        id: 'WEB_APPLICATION',
        label: 'Application Web',
        desc: 'Site web ou plateforme web responsive',
        icon: <Tag className="w-5 h-5" />,
        color: 'text-blue-600',
        gradient: 'from-blue-500 to-cyan-600',
    },
    {
        id: 'MOBILE_APP',
        label: 'Application Mobile',
        desc: 'Application iOS ou Android native',
        icon: <Users className="w-5 h-5" />,
        color: 'text-green-600',
        gradient: 'from-green-500 to-emerald-600',
    },
    {
        id: 'API_INTEGRATION',
        label: 'API Integration',
        desc: 'Service web ou intégration d\'API',
        icon: <ChevronRight className="w-5 h-5" />,
        color: 'text-purple-600',
        gradient: 'from-purple-500 to-pink-600',
    },
];

const STATUS_OPTIONS: { id: ProjectStatus; label: string; dot: string }[] = [
    { id: 'PLANNED', label: 'Planifié', dot: 'bg-slate-400' },
    { id: 'IN_PROGRESS', label: 'En cours', dot: 'bg-blue-500' },
    { id: 'DELIVERED', label: 'Livré', dot: 'bg-emerald-500' },
    { id: 'SUSPENDED', label: 'Suspendu', dot: 'bg-red-400' },
];

interface Props {
    onClose: () => void;
}

export const CreateProjectModal: React.FC<Props> = ({ onClose }) => {
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
        startDate: '',
        endDate: '',
        tags: '',
    });
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const set = (field: string, value: string) => {
        setForm(f => ({ ...f, [field]: value }));
        if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n; });
    };

    const addTag = () => {
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
        if (!form.endDate) e.endDate = 'Date de fin requise.';
        if (form.startDate && form.endDate && form.startDate > form.endDate)
            e.endDate = 'La date de fin doit être après la date de début.';
        if (!form.budget || isNaN(Number(form.budget))) e.budget = 'Budget invalide.';
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
                viewMode: 'BOARD' as const, // Mode d'affichage par défaut
                status: form.status,
                clientName: form.clientName.trim() || undefined,
                budget: Number(form.budget) || 0,
                startDate: form.startDate,
                endDate: form.endDate,
                progress: 0,
            };

            const newProject = await projectsService.create(projectData);

            // Add to local store to update UI immediately
            dispatch({ type: 'ADD_PROJECT', project: newProject });
            onClose();
        } catch (error) {
            console.error('Failed to create project:', error);
            setErrors({ submit: 'Erreur lors de la création du projet. Veuillez réessayer.' });
        } finally {
            setLoading(false);
        }
    };

    const STEPS = ['Informations', 'Planification', 'Confirmation'];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="relative px-8 pt-8 pb-6 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                                <Plus className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Créer un nouveau projet</h2>
                                <p className="text-sm text-slate-400 mt-1">Remplissez les informations étape par étape</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Fermer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-6 flex gap-2">
                        {STEPS.map((stepName, i) => (
                            <div key={i} className="flex-1 flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                        step > i ? 'bg-emerald-500 text-white' :
                                        step === i + 1 ? 'bg-primary-500 text-white' :
                                        'bg-slate-200 text-slate-400'
                                    }`}>
                                        {step > i ? '✓' : i + 1}
                                    </div>
                                    <span className={`text-xs font-semibold transition-colors ${
                                        step === i + 1 ? 'text-primary-700' : 'text-slate-400'
                                    }`}>
                                        {stepName}
                                    </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: step > i ? '100%' : step === i + 1 ? '50%' : '0%' }}
                                        transition={{ duration: 0.4 }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* STEP CONTENT */}
                <div className="flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                        <motion.div key="step1"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                                className="px-8 py-6 space-y-6"
                            >
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <h3 className="text-sm font-bold text-blue-900 mb-1">Étape 1: Informations générales</h3>
                                    <p className="text-xs text-blue-700">Renseignez les informations de base de votre projet.</p>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                                        <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-slate-500" /> Nom du projet *</span>
                                    </label>
                                    <input
                                        autoFocus
                                        value={form.name}
                                        onChange={e => set('name', e.target.value)}
                                        placeholder="Ex: Refonte portail client VAERDIA"
                                        className={`w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all placeholder:text-slate-400 ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}
                                    />
                                    {errors.name && <p className="mt-2 text-sm text-red-600 font-medium">{errors.name}</p>}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                                        Description *
                                    </label>
                                    <textarea
                                        value={form.description}
                                        onChange={e => set('description', e.target.value)}
                                        placeholder="Décrivez l'objectif principal de ce projet..."
                                        rows={3}
                                        className={`w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all placeholder:text-slate-400 resize-none ${errors.description ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}
                                    />
                                    {errors.description && <p className="mt-2 text-sm text-red-600 font-medium">{errors.description}</p>}
                                </div>

                            {/* Type */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                                    Type de projet *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {PROJECT_TYPES.map(t => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => set('type', t.id)}
                                            className={`relative flex flex-col items-start gap-2 p-4 rounded-2xl border-2 transition-all text-left ${form.type === t.id
                                                ? 'border-primary-400 bg-primary-50'
                                                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white shadow-sm`}>
                                                {t.icon}
                                            </div>
                                            <div>
                                                <span className={`text-sm font-bold ${form.type === t.id ? 'text-primary-700' : 'text-slate-700'}`}>{t.label}</span>
                                                <p className="text-[11px] text-slate-400 mt-0.5">{t.desc}</p>
                                            </div>
                                            {form.type === t.id && (
                                                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                                                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Client + Status row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Client</span>
                                    </label>
                                    <input
                                        value={form.clientName}
                                        onChange={e => set('clientName', e.target.value)}
                                        placeholder="Nom du client (optionnel)"
                                        className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-white transition-all placeholder:text-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                                        Statut initial
                                    </label>
                                    <select
                                        value={form.status}
                                        onChange={e => set('status', e.target.value)}
                                        className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-white transition-all text-slate-700"
                                    >
                                        {STATUS_OPTIONS.map(s => (
                                            <option key={s.id} value={s.id}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                                className="px-8 py-6 space-y-6"
                            >
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <h3 className="text-sm font-bold text-green-900 mb-1">Étape 2: Planification et budget</h3>
                                    <p className="text-xs text-green-700">Définissez les dates et le budget de votre projet.</p>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                                            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-500" /> Date de début *</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={form.startDate}
                                            onChange={e => set('startDate', e.target.value)}
                                            className={`w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all text-slate-700 ${errors.startDate ? 'border-red-300' : 'border-slate-200 hover:border-slate-300'}`}
                                        />
                                        {errors.startDate && <p className="mt-2 text-sm text-red-600 font-medium">{errors.startDate}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                                            Date de livraison *
                                        </label>
                                        <input
                                            type="date"
                                            value={form.endDate}
                                            onChange={e => set('endDate', e.target.value)}
                                            min={form.startDate}
                                            className={`w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all text-slate-700 ${errors.endDate ? 'border-red-300' : 'border-slate-200 hover:border-slate-300'}`}
                                        />
                                        {errors.endDate && <p className="mt-2 text-sm text-red-600 font-medium">{errors.endDate}</p>}
                                    </div>
                                </div>
                                {/* Budget */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                                        <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Budget (€) *</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">€</span>
                                        <input
                                            type="number"
                                            value={form.budget}
                                            onChange={e => set('budget', e.target.value)}
                                            placeholder="50000"
                                            min={0}
                                            className={`w-full pl-8 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-white transition-all placeholder:text-slate-400 ${errors.budget ? 'border-red-300' : 'border-slate-200'}`}
                                        />
                                    </div>
                                    {errors.budget && <p className="mt-1 text-xs text-red-500">{errors.budget}</p>}
                                </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                                    <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Tags</span>
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        placeholder="Ex: React, API, Mobile"
                                        className="flex-1 px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-white transition-all placeholder:text-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={addTag}
                                        className="px-4 py-2.5 bg-slate-100 text-slate-600 text-sm font-semibold rounded-xl hover:bg-primary-50 hover:text-primary-700 transition-colors"
                                    >
                                        Ajouter
                                    </button>
                                </div>
                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {tags.map(t => (
                                            <span key={t} className="flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full border border-primary-100">
                                                {t}
                                                <button onClick={() => removeTag(t)} className="text-primary-400 hover:text-primary-700 leading-none">×</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                            className="px-8 py-6"
                        >
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                                <h3 className="text-sm font-bold text-emerald-900 mb-1">Étape 3: Confirmation</h3>
                                <p className="text-xs text-emerald-700">Vérifiez les informations et créez votre projet.</p>
                            </div>

                            <div className="bg-gradient-to-br from-slate-50 to-primary-50/30 rounded-2xl border border-slate-200 p-5 space-y-4">
                                <h3 className="text-sm font-bold text-slate-700 mb-3">Récapitulatif du projet</h3>

                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Nom', value: form.name },
                                        { label: 'Type', value: form.type },
                                        { label: 'Statut', value: STATUS_OPTIONS.find(s => s.id === form.status)?.label },
                                        { label: 'Client', value: form.clientName || '—' },
                                        { label: 'Début', value: form.startDate || '—' },
                                        { label: 'Fin', value: form.endDate || '—' },
                                        { label: 'Budget', value: form.budget ? `€ ${Number(form.budget).toLocaleString()}` : '—' },
                                    ].map(item => (
                                        <div key={item.label} className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{item.label}</span>
                                            <span className="text-sm font-semibold text-slate-800">{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {tags.length > 0 && (
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Tags</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {tags.map(t => (
                                                <span key={t} className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-2 border-t border-slate-200">
                                    <p className="text-xs text-slate-500">{form.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Step indicator */}
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                <span>Étape {step}</span>
                                <span className="text-slate-300">•</span>
                                <span>sur 3</span>
                            </div>

                            {/* Previous button */}
                            {step > 1 ? (
                                <button
                                    onClick={() => setStep(s => s - 1)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 hover:border-slate-300"
                                >
                                    ← Précédent
                                </button>
                            ) : (
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    Annuler
                                </button>
                            )}
                        </div>

                        {/* Next/Create button */}
                        <div className="flex items-center gap-3">
                            {errors.submit && (
                                <div className="text-sm text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                                    {errors.submit}
                                </div>
                            )}
                            {step < 3 ? (
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-bold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105"
                                >
                                    Suivant
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleCreate}
                                    disabled={loading}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Création...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            Créer le projet
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
