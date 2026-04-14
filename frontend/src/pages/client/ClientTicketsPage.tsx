import React, { useState } from 'react';
import {
    Search, Plus, Filter, MessageSquare,
    Clock, AlertCircle, CheckCircle2, X,
    ChevronRight, Send, Paperclip, Loader2,
    Calendar, User, Tag, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/projectStore';
import { useAuth } from '../../hooks/useAuth';
import { AppLayout } from '../../components/layout/AppLayout';
import { CreateTicketModal } from '../../components/client/CreateTicketModal';
import type { Ticket, TicketStatus, TicketPriority } from '../../types/project.types';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const STATUS_CONFIG: Record<TicketStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string; bg: string; icon: React.ReactNode }> = {
    OPEN: { label: 'Nouveau', variant: "default", color: 'text-emerald-700', bg: 'bg-emerald-50', icon: <AlertCircle className="w-3.5 h-3.5" /> },
    IN_PROGRESS: { label: 'En cours', variant: "secondary", color: 'text-amber-700', bg: 'bg-amber-50', icon: <Clock className="w-3.5 h-3.5" /> },
    WAITING_ON_CLIENT: { label: 'En attente', variant: "outline", color: 'text-violet-700', bg: 'bg-violet-50', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    RESOLVED: { label: 'Résolu', variant: "default", color: 'text-emerald-700', bg: 'bg-emerald-50', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    CLOSED: { label: 'Fermé', variant: "outline", color: 'text-slate-600', bg: 'bg-slate-100', icon: <X className="w-3.5 h-3.5" /> }
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string; bg: string }> = {
    LOW: { label: 'Basse', color: 'text-slate-500', bg: 'bg-slate-50' },
    MEDIUM: { label: 'Moyenne', color: 'text-blue-500', bg: 'bg-blue-50' },
    HIGH: { label: 'Haute', color: 'text-amber-600', bg: 'bg-amber-50' },
    URGENT: { label: 'Urgent', color: 'text-rose-600', bg: 'bg-rose-50' }
};

export const ClientTicketsPage: React.FC = () => {
    const { state, dispatch } = useStore();
    const { user } = useAuth();
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(state.tickets[0]?.id || null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
    const [replyText, setReplyText] = useState('');

    const selectedTicket = state.tickets.find(t => t.id === selectedTicketId);

    const filteredTickets = state.tickets.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleSendReply = () => {
        if (!replyText.trim() || !selectedTicketId) return;

        dispatch({
            type: 'ADD_TICKET_MESSAGE',
            ticketId: selectedTicketId,
            message: {
                id: Date.now().toString(),
                authorId: user?.id || 'client-1',
                authorName: user?.fullName || 'Client',
                content: replyText,
                createdAt: new Date().toISOString(),
                isClient: true
            }
        });
        setReplyText('');
    };

    return (
        <AppLayout title="Support" subtitle="Gestion de vos tickets et assistance technique">
            <div className="flex h-[calc(100vh-64px)] bg-slate-50/50">
                {/* Left Sidebar - Tickets List - High Density but Legible Text */}
                <div className="w-[320px] border-r border-slate-100 bg-white flex flex-col flex-shrink-0 shadow-sm relative z-10 transition-all">
                    <div className="p-5 space-y-4 border-b border-slate-50">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Tag className="w-4 h-4 text-emerald-500" /> Tickets Support ({filteredTickets.length})
                            </h2>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Chercher..."
                                    className="pl-9 h-10 border-slate-100 bg-slate-50/50 rounded-xl text-sm focus-visible:ring-emerald-500/10 placeholder:text-slate-400"
                                />
                            </div>
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                size="icon"
                                className="h-10 w-10 bg-emerald-600 hover:bg-black text-white rounded-xl shadow-lg shadow-emerald-500/20 flex-shrink-0 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>
                        
                        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as any)}>
                            <SelectTrigger className="h-9 border-slate-100 bg-slate-50/50 rounded-xl text-[10px] font-black uppercase tracking-tight text-slate-500">
                                <SelectValue placeholder="Tous les statuts" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100">
                                <SelectItem value="ALL" className="text-[10px] font-black uppercase m-1">Tous les statuts</SelectItem>
                                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                    <SelectItem key={key} value={key} className="text-[10px] font-black uppercase m-1">{config.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-3 space-y-2">
                            {filteredTickets.map(ticket => (
                                <button
                                    key={ticket.id}
                                    onClick={() => setSelectedTicketId(ticket.id)}
                                    className={`w-full p-4 rounded-2xl transition-all text-left flex flex-col gap-2.5 group ${selectedTicketId === ticket.id
                                        ? 'bg-emerald-50 border-emerald-100 shadow-sm'
                                        : 'hover:bg-slate-50 border-transparent'
                                        } border`}
                                >
                                    <div className="flex justify-between items-center">
                                        <Badge variant="outline" className={`px-2.5 py-0.5 h-5 rounded-lg text-[9px] font-black uppercase tracking-widest border-none lg:h-4 lg:py-0 ${STATUS_CONFIG[ticket.status].bg} ${STATUS_CONFIG[ticket.status].color}`}>
                                            {STATUS_CONFIG[ticket.status].label}
                                        </Badge>
                                        <span className="text-[10px] text-slate-300 font-bold uppercase">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className={`text-sm font-black leading-tight uppercase tracking-tight line-clamp-1 ${selectedTicketId === ticket.id ? 'text-emerald-900' : 'text-slate-700'}`}>
                                        {ticket.title}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${ticket.priority === 'URGENT' ? 'bg-rose-500 shadow-md shadow-rose-200' : 'bg-slate-200'}`} />
                                        <span className="text-[10px] text-slate-400 font-bold uppercase truncate">{ticket.projectName}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Right Content - Chat Thread - Legible Text Maintained */}
                <div className="flex-1 bg-white flex flex-col overflow-hidden">
                    {selectedTicket ? (
                        <>
                            {/* Chat Header - Higher Legibility */}
                            <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-white relative z-10 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${STATUS_CONFIG[selectedTicket.status].bg} ${STATUS_CONFIG[selectedTicket.status].color}`}>
                                        <MessageCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">{selectedTicket.title}</h2>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedTicket.projectName}</span>
                                            <Separator orientation="vertical" className="h-3.5" />
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">TICKET #{selectedTicket.id.split('-')[0]}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={`h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest ${STATUS_CONFIG[selectedTicket.status].bg} ${STATUS_CONFIG[selectedTicket.status].color} border-none shadow-sm`}>
                                        {STATUS_CONFIG[selectedTicket.status].label}
                                    </Badge>
                                </div>
                            </div>

                            <ScrollArea className="flex-1 bg-slate-50/20">
                                <div className="max-w-4xl mx-auto p-8">
                                    {/* Info Header - Detailed but Compact */}
                                    <div className="grid grid-cols-3 gap-6 mb-8 bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Agent VAERDIA</span>
                                            <span className="text-sm font-black text-emerald-600 truncate">{selectedTicket.assigneeName || 'En attente'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Priorité</span>
                                            <span className={`text-sm font-black uppercase ${PRIORITY_CONFIG[selectedTicket.priority].color}`}>{PRIORITY_CONFIG[selectedTicket.priority].label}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Dernière mise à jour</span>
                                            <span className="text-sm font-black text-slate-700">{new Date(selectedTicket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    <div className="mb-10">
                                        <div className="p-5 bg-white rounded-2xl border border-slate-100 text-sm text-slate-600 leading-relaxed font-medium shadow-sm">
                                            {selectedTicket.description}
                                        </div>
                                    </div>

                                    {/* Chat Thread - Legible Fonts (text-sm) */}
                                    <div className="space-y-6">
                                        {selectedTicket.messages.map(msg => (
                                            <div key={msg.id} className={`flex gap-4 ${msg.isClient ? 'flex-row-reverse' : ''}`}>
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 shadow-sm transition-transform hover:scale-105 active:scale-95 ${msg.isClient ? 'bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                                    {(msg.authorName || '?').substring(0, 1).toUpperCase()}
                                                </div>
                                                <div className={`max-w-[80%] ${msg.isClient ? 'items-end' : 'items-start'} flex flex-col`}>
                                                    <div className={`p-4 text-sm leading-relaxed font-medium shadow-sm rounded-2xl ${
                                                        msg.isClient 
                                                            ? 'bg-emerald-600 text-white rounded-tr-none' 
                                                            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                                    }`}>
                                                        {msg.content}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-300 mt-2 uppercase tracking-wide px-1.5">
                                                        {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </ScrollArea>

                            {/* Slim Reply Box - Restored Height for Legibility */}
                            <div className="px-8 py-5 border-t border-slate-50 bg-white">
                                <div className="relative max-w-4xl mx-auto">
                                    <textarea
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        placeholder="Taper votre message..."
                                        className="w-full min-h-[80px] max-h-32 p-4 pr-14 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all resize-none shadow-inner"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendReply();
                                            }
                                        }}
                                    />
                                    <Button
                                        onClick={handleSendReply}
                                        disabled={!replyText.trim()}
                                        size="icon"
                                        className={`absolute right-3 bottom-3 w-10 h-10 rounded-xl transition-all shadow-md ${
                                            replyText.trim() ? 'bg-emerald-600 text-white hover:scale-105 shadow-emerald-500/20' : 'bg-slate-100 text-slate-300'
                                        }`}
                                    >
                                        <Send className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mb-5 border border-slate-100">
                                <MessageCircle className="w-10 h-10 opacity-20" />
                            </div>
                            <p className="text-xs font-black uppercase tracking-[0.3em]">Sélectionnez une discussion</p>
                        </div>
                    )}
                </div>
            </div>

            <CreateTicketModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </AppLayout>
    );
};
