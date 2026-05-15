import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Search, Plus, Filter, MessageSquare,
    Clock, AlertCircle, CheckCircle2, X,
    ChevronRight, Send, Paperclip, Loader2,
    Calendar, User, Tag, MessageCircle, Info, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useStore } from '../../store/projectStore';
import { useAuth } from '../../hooks/useAuth';
import { AppLayout } from '../../components/layout/AppLayout';
import { CreateTicketModal } from '../../components/client/CreateTicketModal';
import { ticketsService } from '../../api/tickets.service';
import { storageService } from '../../api/storage.service';
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

const getStatusConfig = (t: any): Record<TicketStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string; bg: string; icon: React.ReactNode }> => ({
    OPEN: { label: t('client.status_labels.OPEN'), variant: "default", color: 'text-emerald-700', bg: 'bg-emerald-50', icon: <AlertCircle className="w-3.5 h-3.5" /> },
    IN_PROGRESS: { label: t('client.status_labels.IN_PROGRESS'), variant: "secondary", color: 'text-amber-700', bg: 'bg-amber-50', icon: <Clock className="w-3.5 h-3.5" /> },
    WAITING_ON_CLIENT: { label: t('client.status_labels.WAITING_ON_CLIENT'), variant: "outline", color: 'text-violet-700', bg: 'bg-violet-50', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    RESOLVED: { label: t('client.status_labels.RESOLVED'), variant: "default", color: 'text-emerald-700', bg: 'bg-emerald-50', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    CLOSED: { label: t('client.status_labels.CLOSED'), variant: "outline", color: 'text-slate-600', bg: 'bg-slate-100', icon: <X className="w-3.5 h-3.5" /> }
});

const getPriorityConfig = (t: any): Record<TicketPriority, { label: string; color: string; bg: string }> => ({
    LOW: { label: t('client.priority_labels.LOW'), color: 'text-slate-500', bg: 'bg-slate-50' },
    MEDIUM: { label: t('client.priority_labels.MEDIUM'), color: 'text-blue-500', bg: 'bg-blue-50' },
    HIGH: { label: t('client.priority_labels.HIGH'), color: 'text-amber-600', bg: 'bg-amber-50' },
    URGENT: { label: t('client.priority_labels.URGENT'), color: 'text-rose-600', bg: 'bg-rose-50' }
});

export const ClientTicketsPage: React.FC = () => {
    const { t } = useTranslation();
    const STATUS_CONFIG = getStatusConfig(t);
    const PRIORITY_CONFIG = getPriorityConfig(t);
    const { state, dispatch } = useStore();
    const { user } = useAuth();
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(state.tickets[0]?.id || null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
    const [replyText, setReplyText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [pendingAttachments, setPendingAttachments] = useState<any[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        const loadTickets = async () => {
            setIsLoading(true);
            try {
                const data = await ticketsService.getAll({}, user?.email);
                dispatch({ type: 'SET_TICKETS', tickets: data as any });
                if (data.length > 0 && !selectedTicketId) {
                    setSelectedTicketId(data[0].id);
                }
            } catch (error) {
                console.error('Failed to load tickets:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadTickets();
    }, [dispatch, selectedTicketId]);

    const selectedTicket = state.tickets.find(t => t.id === selectedTicketId);

    const filteredTickets = state.tickets.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const newAttachments = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const result = await storageService.uploadFile(file);
                newAttachments.push({
                    name: file.name,
                    url: result.url,
                    size: file.size,
                    type: file.type
                });
            }
            setPendingAttachments([...pendingAttachments, ...newAttachments]);
            toast.success(t('client.files_ready', { count: files.length }));
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error(t('client.upload_error'));
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSendReply = async () => {
        const hasContent = replyText.trim().length > 0;
        const hasAttachments = pendingAttachments.length > 0;
        
        if ((!hasContent && !hasAttachments) || !selectedTicketId) return;

        try {
            const updatedTicket = await ticketsService.addComment(
                selectedTicketId, 
                replyText, 
                pendingAttachments,
                user?.email
            );
            dispatch({
                type: 'UPDATE_TICKET',
                ticket: updatedTicket
            });
            toast.success(t('client.message_sent'));
            setReplyText('');
            setPendingAttachments([]);
        } catch (error: any) {
            console.error('Failed to send reply:', error);
            const errorMsg = error.response?.data?.message || error.message || t('client.unknown_error');
            toast.error(`${t('client.db_error')} ${errorMsg}`);
        }
    };



    return (
        <AppLayout title={t('client.tickets_title')} subtitle={t('client.tickets_subtitle')}>
            <div className="absolute inset-0 flex bg-slate-50/50 overflow-hidden">
                {/* Left Sidebar - Tickets List - High Density but Legible Text */}
                <div className="w-[320px] border-r border-slate-100 bg-white flex flex-col flex-shrink-0 shadow-sm relative z-10 transition-all">
                    <div className="p-5 space-y-4 border-b border-slate-50">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Tag className="w-4 h-4 text-emerald-500" /> {t('client.your_tickets')} ({filteredTickets.length})
                            </h2>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder={t('client.search_tickets')}
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
                                <SelectValue placeholder={t('client.all_statuses')} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100">
                                <SelectItem value="ALL" className="text-[10px] font-black uppercase m-1">{t('client.all_statuses')}</SelectItem>
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
                <div className="flex-1 bg-white flex flex-col overflow-hidden relative">
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
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t('client.ticket_id')}{selectedTicket.id.split('-')[0]}</span>
                                            {selectedTicket.projectId && (
                                                <>
                                                    <Separator orientation="vertical" className="h-3.5" />
                                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                                                        CM: {state.projects.find(p => p.id === selectedTicket.projectId)?.managerName || t('client.support_team')}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={`h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest ${STATUS_CONFIG[selectedTicket.status].bg} ${STATUS_CONFIG[selectedTicket.status].color} border-none shadow-sm`}>
                                        {STATUS_CONFIG[selectedTicket.status].label}
                                    </Badge>
                                </div>
                            </div>
                            <ScrollArea className="flex-1 min-h-0 bg-slate-50/10">
                                <div className="max-w-4xl mx-auto p-8">
                                    {/* Info Header */}
                                    <div className="grid grid-cols-3 gap-6 mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('client.project_manager')}</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <p className="text-sm font-black text-emerald-600 uppercase tracking-tight">
                                                    {state.projects.find(p => p.id === selectedTicket.projectId)?.managerName || t('client.technical_support')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 border-x border-slate-50 px-6">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('client.priority_label')}</p>
                                            <p className={`text-sm font-black uppercase tracking-tight ${PRIORITY_CONFIG[selectedTicket.priority].color}`}>
                                                {PRIORITY_CONFIG[selectedTicket.priority].label}
                                            </p>
                                        </div>
                                        <div className="space-y-1.5 text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('client.last_update')}</p>
                                            <p className="text-sm font-black text-slate-700 uppercase tracking-tight">
                                                {new Date(selectedTicket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Description Card */}
                                    <div className="mb-10 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                                        <div className="flex items-center gap-2 mb-3">
                                            <Info className="w-4 h-4 text-emerald-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('client.initial_description')}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            {selectedTicket.description}
                                        </p>
                                        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight bg-slate-50 p-2 rounded-xl border border-slate-100 w-fit">
                                            <Sparkles className="w-3 h-3 text-emerald-500" />
                                            {t('client.analysis_message')}
                                        </div>
                                    </div>

                                    {/* Chat Thread */}
                                    <div className="space-y-6 mb-4">
                                        {(selectedTicket.messages || []).map((msg, idx) => (
                                            <motion.div 
                                                initial={{ opacity: 0, x: msg.isClient ? 20 : -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3 }}
                                                key={msg.id} 
                                                className={`flex gap-3 ${msg.isClient ? 'flex-row-reverse' : 'flex-row'}`}
                                            >
                                                {/* Avatar */}
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black flex-shrink-0 shadow-sm border ${
                                                    msg.isClient 
                                                        ? 'bg-emerald-600 text-white border-emerald-500' 
                                                        : 'bg-white text-slate-400 border-slate-100'
                                                }`}>
                                                    {(msg.authorName || 'S').substring(0, 1).toUpperCase()}
                                                </div>

                                                {/* Message Bubble */}
                                                <div className={`flex flex-col max-w-[70%] ${msg.isClient ? 'items-end' : 'items-start'}`}>
                                                    <div className={`px-4 py-3 text-sm font-medium leading-relaxed shadow-sm rounded-2xl ${
                                                        msg.isClient 
                                                            ? 'bg-emerald-600 text-white rounded-tr-none' 
                                                            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                                    }`}>
                                                        {msg.content}
                                                        
                                                        {/* Attachments Display */}
                                                        {msg.attachments && msg.attachments.length > 0 && (
                                                            <div className="mt-3 space-y-2 border-t border-white/20 pt-2">
                                                                {msg.attachments.map((file: any, fIdx: number) => (
                                                                    <a 
                                                                        key={fIdx}
                                                                        href={file.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${
                                                                            msg.isClient ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-50 hover:bg-slate-100'
                                                                        }`}
                                                                    >
                                                                        <Paperclip className="w-3 h-3" />
                                                                        <span className="truncate max-w-[150px]">{file.name}</span>
                                                                        <span className="opacity-50 ml-auto">{(file.size / 1024).toFixed(0)}KB</span>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1.5 px-1">
                                                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                                                            {msg.authorName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </ScrollArea>

                            {/* Fixed Premium Reply Section */}
                            <div className="p-6 bg-white border-t border-slate-50">
                                <div className="max-w-4xl mx-auto">
                                    {/* Pending Attachments Preview */}
                                    {pendingAttachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {pendingAttachments.map((file, idx) => (
                                                <div key={idx} className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                                                    <Paperclip className="w-3 h-3 text-emerald-600" />
                                                    <span className="text-xs font-bold text-emerald-700 truncate max-w-[120px]">{file.name}</span>
                                                    <button 
                                                        onClick={() => setPendingAttachments(prev => prev.filter((_, i) => i !== idx))}
                                                        className="hover:bg-emerald-100 p-0.5 rounded-full"
                                                    >
                                                        <X className="w-3 h-3 text-emerald-600" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="bg-slate-50 rounded-3xl p-2 border border-slate-100 transition-all focus-within:border-emerald-500/30 focus-within:ring-4 focus-within:ring-emerald-500/5 focus-within:bg-white">
                                        <input 
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            multiple
                                        />
                                        <textarea
                                            value={replyText}
                                            onChange={e => setReplyText(e.target.value)}
                                            placeholder={t('client.write_message')}
                                            className="w-full min-h-[60px] max-h-40 p-3 bg-transparent border-none text-sm font-black text-slate-900 focus:outline-none resize-none placeholder:text-slate-400"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendReply();
                                                }
                                            }}
                                        />
                                        <div className="flex items-center justify-between p-1 border-t border-slate-100/50">
                                            <div className="flex gap-1">
                                                <Button 
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={isUploading}
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="w-9 h-9 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                                >
                                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                            <Button
                                                onClick={handleSendReply}
                                                disabled={(!replyText.trim() && pendingAttachments.length === 0) || isUploading}
                                                className={`h-9 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                                    (replyText.trim() || pendingAttachments.length > 0) 
                                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]' 
                                                        : 'bg-slate-200 text-slate-400 shadow-none'
                                                }`}
                                            >
                                                {t('client.send')}
                                                <Send className="w-3.5 h-3.5 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mb-5 border border-slate-100">
                                <MessageCircle className="w-10 h-10 opacity-20" />
                            </div>
                            <p className="text-xs font-black uppercase tracking-[0.3em]">{t('client.select_discussion')}</p>
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
