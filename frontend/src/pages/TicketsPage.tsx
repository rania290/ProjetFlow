import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Ticket, Search, Plus, Clock, AlertCircle, CheckCircle2,
    MessageSquare, Paperclip, Send, MoreHorizontal, X
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { useStore } from '../store/projectStore';
import type { TicketStatus, TicketPriority } from '../types/project.types';

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; bg: string; dot: string; icon: React.ReactNode }> = {
    OPEN: { label: 'Nouveau', color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500', icon: <AlertCircle className="w-3.5 h-3.5" /> },
    IN_PROGRESS: { label: 'En cours', color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500', icon: <Clock className="w-3.5 h-3.5" /> },
    WAITING_ON_CLIENT: { label: 'En attente client', color: 'text-violet-700', bg: 'bg-violet-50', dot: 'bg-violet-500', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    RESOLVED: { label: 'Résolu', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    CLOSED: { label: 'Fermé', color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400', icon: <X className="w-3.5 h-3.5" /> }
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string; bg: string }> = {
    LOW: { label: 'Basse', color: 'text-slate-600', bg: 'bg-slate-100' },
    MEDIUM: { label: 'Moyenne', color: 'text-blue-600', bg: 'bg-blue-50' },
    HIGH: { label: 'Haute', color: 'text-amber-600', bg: 'bg-amber-50' },
    URGENT: { label: 'Urgente', color: 'text-red-600', bg: 'bg-red-50' }
};

export const TicketsPage: React.FC = () => {
    const { state, dispatch } = useStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    const tickets = state.tickets || [];

    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.requesterName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const selectedTicket = tickets.find(t => t.id === selectedTicketId) || null;

    const handleSendReply = () => {
        if (!replyText.trim() || !selectedTicket) return;
        dispatch({
            type: 'ADD_TICKET_MESSAGE',
            ticketId: selectedTicket.id,
            message: {
                id: `m_${Date.now()}`,
                authorId: 'u1',
                authorName: 'Admin Vaerdia', // Should come from useAuth in real app
                content: replyText,
                createdAt: new Date().toISOString(),
                isClient: false
            }
        });
        setReplyText('');
    };

    return (
        <AppLayout title="Portail Client" subtitle="Gestion des tickets de support client">
            <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-[#f8fafc]">

                {/* Lise Column */}
                <div className={`flex flex-col transition-all duration-300 ${selectedTicket ? 'w-1/2 border-r border-slate-200' : 'w-full'} p-6`}>

                    {/* Header Actions */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3 flex-1 max-w-md">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher un ticket..."
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-sm transition-all"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value as any)}
                                className="pl-3 pr-8 py-2 bg-white border border-slate-200 text-sm rounded-xl focus:outline-none text-slate-600 shadow-sm appearance-none cursor-pointer"
                            >
                                <option value="ALL">Tous les statuts</option>
                                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                    <option key={key} value={key}>{config.label}</option>
                                ))}
                            </select>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors transform hover:scale-105">
                            <Plus className="w-4 h-4" /> Nouveau Ticket
                        </button>
                    </div>

                    {/* Tickets List */}
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                        {filteredTickets.map(ticket => {
                            const status = STATUS_CONFIG[ticket.status];
                            const priority = PRIORITY_CONFIG[ticket.priority];
                            const isSelected = selectedTicketId === ticket.id;

                            return (
                                <div
                                    key={ticket.id}
                                    onClick={() => setSelectedTicketId(ticket.id)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'bg-primary-50/50 border-primary-300 ring-4 ring-primary-500/10 shadow-md transform scale-[1.01]' : 'bg-white border-slate-200 hover:border-primary-300 hover:shadow-md hover:-translate-y-0.5'}`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">{ticket.id}</span>
                                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border border-white/20 shadow-sm ${status.bg} ${status.color}`}>
                                                {status.icon} {status.label}
                                            </span>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${priority.bg} ${priority.color}`}>
                                            {priority.label}
                                        </span>
                                    </div>
                                    <h3 className={`text-sm font-bold mb-1.5 ${isSelected ? 'text-primary-900' : 'text-slate-800'}`}>
                                        {ticket.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 line-clamp-1 mb-3">{ticket.description}</p>

                                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-3 border-t border-slate-100/80">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600">
                                                {ticket.requesterName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span>{ticket.requesterName}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3 text-slate-400" /> {ticket.messages.length}</span>
                                            <span>{new Date(ticket.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredTickets.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-2xl border border-slate-200 border-dashed">
                                <Ticket className="w-10 h-10 mb-3 text-slate-300" />
                                <p className="text-sm font-medium">Aucun ticket trouvé</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Details Side Panel */}
                <AnimatePresence>
                    {selectedTicket && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: '50%', opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="bg-white flex flex-col h-full overflow-hidden shadow-2xl relative z-10"
                        >
                            {/* Panel Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setSelectedTicketId(null)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <h2 className="text-sm font-bold text-slate-800 font-mono tracking-wider">{selectedTicket.id}</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={selectedTicket.status}
                                        onChange={(e) => dispatch({ type: 'UPDATE_TICKET_STATUS', id: selectedTicket.id, status: e.target.value as TicketStatus })}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border-2 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${STATUS_CONFIG[selectedTicket.status].bg} ${STATUS_CONFIG[selectedTicket.status].color} border-transparent hover:border-black/5 transition-all`}
                                        style={{ WebkitAppearance: 'none' }}
                                    >
                                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                    <button className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Ticket Info */}
                            <div className="px-6 py-5 border-b border-slate-100 flex-shrink-0">
                                <h1 className="text-xl font-bold text-slate-900 mb-2 leading-snug">{selectedTicket.title}</h1>

                                <div className="flex items-center gap-6 mt-4 mb-5 text-[11px]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold shadow-inner">
                                            {selectedTicket.requesterName.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{selectedTicket.requesterName}</p>
                                            <p className="text-slate-400">{selectedTicket.requesterEmail}</p>
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200" />
                                    <div className="flex flex-col">
                                        <span className="text-slate-400 mb-0.5">Assigné à</span>
                                        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                            {selectedTicket.assigneeName ? (
                                                <><div className="w-4 h-4 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-[8px] font-bold">{selectedTicket.assigneeName.substring(0, 1)}</div> {selectedTicket.assigneeName}</>
                                            ) : (
                                                <span className="text-slate-400 italic">Non assigné</span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200" />
                                    <div className="flex flex-col">
                                        <span className="text-slate-400 mb-0.5">Créé le</span>
                                        <span className="font-semibold text-slate-700">{new Date(selectedTicket.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-700 leading-relaxed border border-slate-100">
                                    {selectedTicket.description}
                                </div>
                            </div>

                            {/* Chat Thread */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                                {selectedTicket.messages.map(msg => (
                                    <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.isClient ? '' : 'ml-auto flex-row-reverse'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 shadow-sm ${msg.isClient ? 'bg-slate-200 text-slate-700' : 'bg-primary-600 text-white'}`}>
                                            {msg.authorName.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className={`flex items-baseline gap-2 mb-1 ${msg.isClient ? '' : 'flex-row-reverse'}`}>
                                                <span className="text-xs font-bold text-slate-700">{msg.authorName}</span>
                                                <span className="text-[10px] text-slate-400">{new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div className={`p-3.5 text-sm leading-relaxed ${msg.isClient ? 'bg-white rounded-2xl rounded-tl-none border border-slate-200 text-slate-700 shadow-sm' : 'bg-primary-600 rounded-2xl rounded-tr-none text-white shadow-md'}`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reply Input */}
                            <div className="p-4 border-t border-slate-200 bg-white">
                                <div className="relative">
                                    <textarea
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        placeholder="Répondre au client..."
                                        className="w-full min-h-[100px] p-3 pl-4 pr-12 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all resize-none"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendReply();
                                            }
                                        }}
                                    />
                                    <div className="absolute left-3 bottom-3 flex items-center gap-1">
                                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                            <Paperclip className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleSendReply}
                                        disabled={!replyText.trim()}
                                        className={`absolute right-3 bottom-3 p-2 rounded-xl flex items-center justify-center transition-all ${replyText.trim() ? 'bg-primary-600 text-white shadow-md hover:bg-primary-700 hover:scale-105' : 'bg-slate-100 text-slate-300'}`}
                                    >
                                        <Send className="w-4 h-4 ml-0.5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    );
};
