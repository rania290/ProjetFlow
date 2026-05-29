import React, { useState, useRef } from 'react';
import { 
    X, Paperclip, AlertCircle, Clock, Send, 
    CheckCircle2, Plus, Info, ChevronRight,
    Loader2, Sparkles, MessageCircle
} from 'lucide-react';
import { useStore } from '../../store/projectStore';
import { useAuth } from '../../hooks/useAuth';
import { ticketsService } from '../../api/tickets.service';
import { storageService } from '../../api/storage.service';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface CreateTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PRIORITIES = [
    { value: 'LOW', label: 'Basse', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
    { value: 'MEDIUM', label: 'Moyenne', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    { value: 'HIGH', label: 'Haute', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { value: 'URGENT', label: 'Urgente', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' }
];

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose }) => {

    const { user } = useAuth();
    const { state, dispatch } = useStore();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
        e?.preventDefault();
        const trimmedTitle = title.trim();
        const trimmedDescription = description.trim();
        if (!trimmedTitle || trimmedDescription.length < 10) {
            toast.error('La description doit contenir au moins 10 caractères.');
            return;
        }

        setIsSubmitting(true);
        try {
            const ticketData: Record<string, unknown> = {
                title: trimmedTitle,
                description: trimmedDescription,
                priority,
                type: 'SUPPORT',
            };

            if (attachedFile) {
                const uploadResult = await storageService.uploadFile(attachedFile);
                ticketData.attachments = [{
                    name: attachedFile.name,
                    url: uploadResult.url,
                    size: attachedFile.size,
                    type: attachedFile.type || 'application/octet-stream',
                }];
            }
            
            const createdTicket = await ticketsService.create(ticketData, user?.email);
            dispatch({ type: 'ADD_TICKET', ticket: createdTicket as any });
            toast.success("Ticket créé avec succès ! Nos équipes reviendront vers vous rapidement.");
            setIsSubmitting(false);
            onClose();
            // Reset form
            setTitle('');
            setDescription('');
            setPriority('MEDIUM');
            setAttachedFile(null);
        } catch (error: any) {
            console.error('Failed to create ticket:', error);
            const apiMessage = error?.response?.data?.message;
            const msg =
                (Array.isArray(apiMessage) ? apiMessage.join(', ') : apiMessage)
                || error?.response?.data?.error
                || (error?.response?.status === 502 ? 'Service portail client indisponible. Démarrez client-portal-service.' : null)
                || "Erreur lors de la création du ticket. Veuillez réessayer.";
            toast.error(typeof msg === 'string' ? msg : "Erreur lors de la création du ticket.");
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-[24px] bg-white text-slate-900">
                {/* Premium Header - Emerald Theme */}
                <div className="relative px-6 py-5 bg-emerald-50 border-b border-emerald-100 overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16" />
                   <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br from-emerald-500 to-teal-700 shadow-emerald-500/20">
                            <Plus className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight">Nouveau Ticket</DialogTitle>
                            <DialogDescription className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.1em] mt-0.5 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3" /> Support Technique Émeraude
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
                    <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Sujet de la demande</Label>
                        <Input
                            placeholder="Entrez le sujet..."
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="h-10 border-emerald-50 bg-emerald-50/10 rounded-xl font-medium focus-visible:ring-emerald-500/20 text-sm text-slate-900"
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Priorité</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {PRIORITIES.map(p => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => setPriority(p.value)}
                                    className={`relative px-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight border-2 transition-all overflow-hidden ${priority === p.value
                                        ? `bg-white border-emerald-600 ${p.color.replace('indigo', 'emerald').replace('rose', 'rose').replace('amber', 'amber').replace('slate', 'emerald')}` 
                                        : 'bg-emerald-50/30 border-transparent text-slate-400 hover:bg-emerald-50/50'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Description détaillée du problème</Label>
                        <Textarea
                            placeholder="Expliquez-nous le problème rencontré ou votre réclamation... (min. 10 caractères)"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="min-h-[120px] border-emerald-50 bg-emerald-50/10 rounded-xl font-medium focus-visible:ring-emerald-500/20 text-sm text-slate-900 resize-none"
                            required
                            minLength={10}
                        />
                        {description.trim().length > 0 && description.trim().length < 10 && (
                            <p className="text-[10px] font-bold text-amber-600 pl-1">
                                {10 - description.trim().length} caractère(s) restant(s) (minimum 10)
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={e => setAttachedFile(e.target.files?.[0] || null)}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => fileInputRef.current?.click()}
                            className={`h-10 px-4 rounded-xl text-xs font-black uppercase tracking-wide gap-2 transition-all ${attachedFile 
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-emerald-50/30 text-emerald-600 hover:bg-emerald-50'}`}
                        >
                            {attachedFile ? <CheckCircle2 className="w-4 h-4" /> : <Paperclip className="w-4 h-4" />}
                            <span>{attachedFile ? attachedFile.name.substring(0, 15) + '...' : 'Attacher un fichier'}</span>
                        </Button>
                    </div>
                </form>

                <DialogFooter className="px-6 py-4 bg-emerald-50/50 border-t border-emerald-100 flex items-center justify-between sm:justify-between">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="rounded-xl font-black text-xs uppercase tracking-[0.1em] text-slate-400 hover:text-emerald-700 h-10"
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !title.trim() || description.trim().length < 10}
                        className={`h-10 px-6 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg transition-all ${isSubmitting || !title.trim() || description.trim().length < 10
                            ? 'bg-slate-200 text-slate-400'
                            : 'bg-emerald-600 text-white hover:bg-black shadow-emerald-100'
                        }`}
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                        {isSubmitting ? 'Envoi...' : 'Soumettre'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
