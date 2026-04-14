import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Save, FolderKanban, Zap, Calendar, DollarSign,
    Tag, FileText, Users, ChevronRight, Trash2, AlertTriangle, Shield, Folder, Check
} from 'lucide-react';
import { useStore } from '../../store/projectStore';
import { AuthContext } from '../../store/authStore';
import type { Project, ProjectType, ProjectStatus } from '../../types/project.types';
import { projectsService } from '../../api/projects.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { 
    Dialog, DialogContent, DialogHeader, 
    DialogTitle, DialogDescription, DialogFooter 
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

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
    project: Project;
    onClose: () => void;
}

export const ProjectSettingsModal: React.FC<Props> = ({ project, onClose }) => {
    const { dispatch } = useStore();
    const { user } = useContext(AuthContext)!;
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [form, setForm] = useState({
        name: project.name,
        description: project.description,
        type: project.type,
        status: project.status,
        clientName: project.clientName || '',
        budget: project.budget.toString(),
        startDate: project.startDate,
        endDate: project.endDate,
    });

    const set = (field: string, value: string) => {
        setForm(f => ({ ...f, [field]: value }));
        if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n; });
    };

    const handleSave = async () => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = 'Le nom est requis.';
        if (!form.description.trim()) e.description = 'La description est requise.';
        if (!form.startDate) e.startDate = 'Date de début requise.';
        if (!form.endDate) e.endDate = 'Date de fin requise.';
        
        if (Object.keys(e).length > 0) {
            setErrors(e);
            return;
        }

        setLoading(true);

        const updatePayload = {
            name: form.name.trim(),
            description: form.description.trim(),
            type: form.type,
            status: form.status,
            clientName: form.clientName.trim() || undefined,
            budget: form.budget ? Number(form.budget) : 0,
            startDate: form.startDate,
            endDate: form.endDate,
        };

        const updatedProject = { ...project, ...updatePayload };

        try {
            const response = await projectsService.update(project.id, updatePayload);
            dispatch({ type: 'UPDATE_PROJECT', project: { ...updatedProject, ...response } });
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 404) {
                dispatch({ type: 'UPDATE_PROJECT', project: updatedProject });
            } else {
                console.error('Failed to update project:', err);
                const msg = err?.response?.data?.message || 'Erreur lors de la mise à jour.';
                setErrors({ submit: msg });
                setLoading(false);
                return;
            }
        }

        setLoading(false);
        setErrors({ success: 'Roadmap synchronisée avec succès !' });
        setTimeout(() => onClose(), 1500);
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await projectsService.delete(project.id);
            dispatch({ type: 'DELETE_PROJECT', id: project.id });
            onClose();
        } catch (err) {
            console.error('Failed to delete project:', err);
            setErrors({ submit: 'Erreur lors de la suppression.' });
            setLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-[32px]">
                {/* Visual Accent Header */}
                <div className="relative px-6 pt-6 pb-4 bg-slate-50/80 backdrop-blur-md border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                <Folder className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black text-slate-900 leading-none uppercase tracking-tight">Paramètres</DialogTitle>
                                <DialogDescription className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 italic">Configuration • {project.name}</DialogDescription>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-hidden flex flex-col min-h-0 bg-white">
                    <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0">
                        <div className="px-6 py-2 border-b border-slate-50 bg-slate-50/20">
                            <TabsList className="grid w-full grid-cols-3 bg-slate-100/30 p-1 rounded-xl">
                                <TabsTrigger value="general" className="text-[10px] font-black uppercase tracking-widest rounded-lg">Base</TabsTrigger>
                                <TabsTrigger value="logistics" className="text-[10px] font-black uppercase tracking-widest rounded-lg">Phase</TabsTrigger>
                                <TabsTrigger value="business" className="text-[10px] font-black uppercase tracking-widest rounded-lg">Cible</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <TabsContent value="general" className="p-6 space-y-4 m-0 focus-visible:ring-0">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-2 border-indigo-500 pl-2">Nom du Projet</Label>
                                        <Input
                                            value={form.name}
                                            onChange={e => set('name', e.target.value)}
                                            className="h-12 rounded-xl text-sm font-bold border-slate-100 bg-slate-50/30 focus-visible:ring-indigo-500/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-2 border-slate-100 pl-2">Roadmap</Label>
                                        <textarea
                                            value={form.description}
                                            onChange={e => set('description', e.target.value)}
                                            rows={5}
                                            className="w-full px-4 py-3 bg-slate-50/30 border border-slate-100 rounded-xl outline-none resize-none text-xs font-semibold text-slate-600 leading-relaxed italic"
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="logistics" className="p-6 space-y-4 m-0">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-2 border-indigo-500 pl-2">Statut Actuel</Label>
                                        <select
                                            value={form.status}
                                            onChange={e => set('status', e.target.value as ProjectStatus)}
                                            className="w-full h-12 px-4 bg-slate-50/30 border border-slate-100 rounded-xl font-black text-xs uppercase tracking-wider text-slate-700 outline-none"
                                        >
                                            {STATUS_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-2 border-slate-100 pl-2">Architecture</Label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {PROJECT_TYPES.map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => set('type', t.id)}
                                                    className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all ${form.type === t.id ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' : 'border-slate-50 bg-white hover:border-slate-100'}`}
                                                >
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${form.type === t.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400'}`}>
                                                        {t.icon}
                                                    </div>
                                                    <div className="text-left">
                                                        <div className={`text-xs font-black uppercase tracking-tight ${form.type === t.id ? 'text-indigo-900' : 'text-slate-600'}`}>{t.label}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="business" className="p-6 space-y-4 m-0">
                                <div className="grid grid-cols-1 gap-5">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-2 border-indigo-500 pl-2">Client / Commanditaire</Label>
                                        <Input
                                            value={form.clientName}
                                            onChange={e => set('clientName', e.target.value)}
                                            className="h-12 rounded-xl text-sm font-bold border-slate-100 bg-slate-50/30"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-2 border-slate-100 pl-2">Budget Financier</Label>
                                        <Input
                                            type="number"
                                            value={form.budget}
                                            onChange={e => set('budget', e.target.value)}
                                            className="h-12 rounded-xl font-black text-sm text-indigo-600 border-slate-100 bg-slate-50/30"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-2 border-indigo-500 pl-2">Lancement</Label>
                                            <Input
                                                type="date"
                                                value={form.startDate}
                                                onChange={e => set('startDate', e.target.value)}
                                                className="h-12 rounded-xl font-black text-xs border-slate-100 bg-slate-50/30"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-2 border-slate-100 pl-2">Livraison</Label>
                                            <Input
                                                type="date"
                                                value={form.endDate}
                                                onChange={e => set('endDate', e.target.value)}
                                                className="h-12 rounded-xl font-black text-xs border-slate-100 bg-slate-50/30"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                <DialogFooter className="px-6 py-6 bg-white border-t border-slate-50 flex items-center justify-start gap-3 shadow-[0_-8px_30px_rgba(0,0,0,0.02)]">
                    <Button 
                        onClick={handleSave}
                        disabled={loading || !!errors.success}
                        className="h-11 px-10 rounded-2xl bg-indigo-600 hover:bg-black text-white font-black text-[11px] uppercase tracking-[0.1em] shadow-xl shadow-indigo-500/10 transition-all active:scale-95"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : errors.success ? (
                            <><Check className="w-4 h-4" /> Sauvé</>
                        ) : (
                            <><Save className="w-4 h-4 mr-2" /> Appliquer</>
                        )}
                    </Button>

                    <Button 
                        variant="ghost" 
                        onClick={onClose} 
                        className="rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 px-8 h-11"
                    >
                        Fermer
                    </Button>

                    {user?.role === 'ADMIN' && (
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            className="ml-auto rounded-2xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-all h-11 w-11"
                            title="Supprimer le Projet"
                        >
                            <Trash2 className="w-5 h-5" />
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>

            <ConfirmDialog 
                isOpen={isDeleteDialogOpen}
                title="Suppression Définitive"
                message={`Êtes-vous sûr de vouloir supprimer "${project.name}" ? Toutes les données associées seront perdues. Cette action est irréversible.`}
                confirmText="Supprimer définitivement"
                cancelText="Annuler"
                onConfirm={handleDelete}
                onCancel={() => setIsDeleteDialogOpen(false)}
                type="danger"
            />
        </Dialog>
    );
};
