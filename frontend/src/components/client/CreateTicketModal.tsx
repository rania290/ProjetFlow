import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Paperclip, AlertCircle, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../store/projectStore';
import { useAuth } from '../../hooks/useAuth';

interface CreateTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PRIORITIES = [
    { value: 'LOW', label: 'Basse', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' },
    { value: 'MEDIUM', label: 'Moyenne', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { value: 'HIGH', label: 'Haute', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
    { value: 'URGENT', label: 'Urgente', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' }
];

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose }) => {
    const { dispatch } = useStore();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) return;

        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const now = new Date().toISOString();
        const newTicket = {
            id: `ticket_${Date.now()}`,
            title,
            description,
            status: 'OPEN',
            priority,
            clientId: (user as any)?.id || 'client-id',
            requesterName: user?.fullName || 'Client',
            requesterEmail: (user as any)?.email || '',
            assigneeName: null,
            createdAt: now,
            updatedAt: now,
            messages: [
                {
                    id: `msg_${Date.now()}`,
                    authorId: (user as any)?.id || 'client-id',
                    authorName: user?.fullName || 'Client',
                    content: description,
                    createdAt: now,
                    isClient: true
                }
            ]
        };

        dispatch({ type: 'ADD_TICKET', ticket: newTicket as any });
        setIsSubmitting(false);
        onClose();
        // Reset form
        setTitle('');
        setDescription('');
        setPriority('MEDIUM');
        setAttachedFile(null);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20"
                >
                    <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Nouveau Ticket</h2>
                                <p className="text-xs text-slate-500 font-medium">Décrivez votre problème ou votre demande.</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Titre de la demande</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="ex: Problème d'accès au projet..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Priorité</label>
                            <div className="grid grid-cols-4 gap-2">
                                {PRIORITIES.map(p => (
                                    <button
                                        key={p.value}
                                        type="button"
                                        onClick={() => setPriority(p.value)}
                                        className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${priority === p.value
                                            ? `${p.bg} ${p.color} ${p.border} ring-2 ring-offset-1 ring-indigo-500/10`
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                            }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description détaillée</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Expliquez-nous votre problème en détail..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[120px] resize-none"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={e => setAttachedFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${attachedFile
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                        : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100'}`}
                                >
                                    {attachedFile ? (
                                        <><CheckCircle2 className="w-3.5 h-3.5" /> Fichier ajouté</>
                                    ) : (
                                        <><Paperclip className="w-3.5 h-3.5" /> Pièce jointe</>
                                    )}
                                </button>
                                {attachedFile && (
                                    <span className="text-[10px] font-medium text-slate-400 truncate max-w-[120px]">
                                        {attachedFile.name}
                                    </span>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !title.trim() || !description.trim()}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all ${isSubmitting || !title.trim() || !description.trim()
                                    ? 'bg-slate-100 text-slate-400 shadow-none'
                                    : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <><Clock className="w-4 h-4 animate-spin" /> Envoi...</>
                                ) : (
                                    <><Send className="w-4 h-4" /> Créer le ticket</>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
