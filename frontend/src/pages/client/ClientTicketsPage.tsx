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
    const [statusFilter, setStatusFilter] = useState<TicketStatus | undefined>(undefined);
    const [replyText, setReplyText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [pendingAttachments, setPendingAttachments] = useState<any[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (!user?.email) {
            return;
        }

        const loadTickets = async () => {
            setIsLoading(true);
            try {
                const data = await ticketsService.getAll({}, user.email);
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
    }, [dispatch, selectedTicketId, user?.email]);

    // Use the tickets returned by the backend for the client.
    const isClientRole = user?.role?.toUpperCase() === 'CLIENT';
    const isAdminOrRh = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'HR_ADMIN' || user?.role === 'RH';

    const ownTickets = React.useMemo(() => {
        if (isClientRole) {
            return state.tickets.filter(tk =>
                tk.clientEmail === user?.email ||
                tk.requesterEmail === user?.email ||
                tk.createdBy === user?.email ||
                tk.reporterEmail === user?.email ||
                (tk as any).authorEmail === user?.email
            );
        }
        if (isAdminOrRh) {
            return state.tickets;
        }

        const assignedProjects = state.projects.filter(p => {
            const isManager = p.managerId === user?.id;
            const isMember = p.members?.some(m => m.id === user?.id);
            return isManager || isMember;
        });
        const assignedProjectIds = new Set(assignedProjects.map(p => p.id));

        return state.tickets.filter(tk => assignedProjectIds.has(tk.projectId));
    }, [state.tickets, state.projects, user, isClientRole, isAdminOrRh]);
    const selectedTicket = ownTickets.find(t => t.id === selectedTicketId);

    const filteredTickets = ownTickets.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === undefined || t.status === statusFilter;
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
                {/* Left Sidebar - Tickets List - Highly Professional & Compact */}
                <div className="w-[320px] border-r border-slate-100 bg-white flex flex-col flex-shrink-0 shadow-sm relative z-10 transition-all">
                    <div className="p-4 space-y-3.5 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Tag className="w-3.5 h-3.5 text-emerald-500" /> {t('client.your_tickets')} ({filteredTickets.length})
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
                            {(isAdminOrRh || isClientRole) && (
                                <Button
                                    onClick={() => setIsModalOpen(true)}
                                    size="icon"
                                    className="h-10 w-10 bg-emerald-600 hover:bg-black text-white rounded-xl shadow-lg shadow-emerald-500/15 flex-shrink-0 transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                </Button>
                            )}
                        </div>
                        
                        {!isClientRole && (
                            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val === 'ALL' ? undefined : (val as TicketStatus))}>
                                <SelectTrigger className="h-9 border-slate-100 bg-slate-50/50 rounded-xl text-xs font-semibold text-slate-500">
                                    <SelectValue placeholder={t('client.all_statuses')} />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100">
                                    <SelectItem value="ALL" className="text-xs font-semibold m-1">{t('client.all_statuses')}</SelectItem>
                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                        <SelectItem key={key} value={key} className="text-xs font-semibold m-1">{config.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto bg-white">
                        <div className="p-3 space-y-2">
                            {filteredTickets.map(ticket => (
                                <button
                                    key={ticket.id}
                                    onClick={() => setSelectedTicketId(ticket.id)}
                                    className={`w-full p-4 rounded-2xl transition-all text-left flex flex-col gap-2 group ${selectedTicketId === ticket.id
                                        ? 'bg-emerald-50/70 border-emerald-100 shadow-sm'
                                        : 'hover:bg-slate-50 border-transparent'
                                        } border`}
                                >
                                    <div className="flex justify-between items-center">
                                        <Badge className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold border-none ${STATUS_CONFIG[ticket.status].bg} ${STATUS_CONFIG[ticket.status].color}`}>
                                            {STATUS_CONFIG[ticket.status].label}
                                        </Badge>
                                        <span className="text-[10px] text-slate-400 font-semibold">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className={`text-sm font-bold leading-tight group-hover:text-emerald-700 transition-colors line-clamp-1 ${selectedTicketId === ticket.id ? 'text-emerald-950' : 'text-slate-800'}`}>
                                        {ticket.title}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${ticket.priority === 'URGENT' ? 'bg-rose-500 shadow-sm shadow-rose-200' : 'bg-slate-300'}`} />
                                        <span className="text-[10px] text-slate-400 font-semibold truncate">{ticket.projectName}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Content - Chat Thread - Legible, Beautiful & Modern */}
                <div className="flex-1 bg-white flex flex-col overflow-hidden relative">
                    {selectedTicket ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white relative z-10 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${STATUS_CONFIG[selectedTicket.status].bg} ${STATUS_CONFIG[selectedTicket.status].color} border border-slate-100/50`}>
                                        <MessageCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900 leading-tight">{selectedTicket.title}</h2>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <span className="text-[10px] font-semibold text-slate-450 text-slate-400 uppercase tracking-wide">{selectedTicket.projectName}</span>
                                            <Separator orientation="vertical" className="h-3" />
                                            <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">{t('client.ticket_id')}{selectedTicket.id.split('-')[0]}</span>
                                            {selectedTicket.projectId && (
                                                <>
                                                    <Separator orientation="vertical" className="h-3" />
                                                    <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide">
                                                        CM: {state.projects.find(p => p.id === selectedTicket.projectId)?.managerName || t('client.support_team')}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className={`px-3 py-1 rounded-full text-[10px] font-bold border-none shadow-sm ${STATUS_CONFIG[selectedTicket.status].bg} ${STATUS_CONFIG[selectedTicket.status].color}`}>
                                        {STATUS_CONFIG[selectedTicket.status].label}
                                    </Badge>
                                </div>
                            </div>
                            <ScrollArea className="flex-1 min-h-0 bg-slate-50/30">
                                <div className="max-w-3xl mx-auto p-6 space-y-6">
                                    {/* Info Header */}
                                    <div className="grid grid-cols-3 gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t('client.project_manager')}</p>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <p className="text-xs font-bold text-slate-800">
                                                    {state.projects.find(p => p.id === selectedTicket.projectId)?.managerName || t('client.technical_support')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-1 border-x border-slate-100 px-4">
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t('client.priority_label')}</p>
                                            <p className={`text-xs font-bold uppercase ${PRIORITY_CONFIG[selectedTicket.priority].color}`}>
                                                {PRIORITY_CONFIG[selectedTicket.priority].label}
                                            </p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t('client.last_update')}</p>
                                            <p className="text-xs font-bold text-slate-700">
                                                {new Date(selectedTicket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Description Card */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                                        <div className="flex items-center gap-2 mb-2">
                                            <Info className="w-4 h-4 text-emerald-500" />
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-450 text-slate-400">{t('client.initial_description')}</span>
                                        </div>
                                        <p className="text-sm text-slate-650 text-slate-600 leading-relaxed font-medium">
                                            {selectedTicket.description}
                                        </p>
                                        <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-slate-500 uppercase tracking-tight bg-slate-50 p-2 rounded-xl border border-slate-100 w-fit">
                                            <Sparkles className="w-3.5 h-3.5 text-emerald-55 text-emerald-600" />
                                            {t('client.analysis_message')}
                                        </div>
                                    </div>

                                    {/* Chat Thread */}
                                    <div className="space-y-4">
                                        {(selectedTicket.messages || []).map((msg, idx) => (
                                            <motion.div 
                                                initial={{ opacity: 0, x: msg.isClient ? 20 : -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3 }}
                                                key={msg.id} 
                                                className={`flex gap-3 ${msg.isClient ? 'flex-row-reverse' : 'flex-row'}`}
                                            >
                                                {/* Avatar */}
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold flex-shrink-0 shadow-sm border ${
                                                    msg.isClient 
                                                        ? 'bg-emerald-65 bg-emerald-600 text-white border-emerald-500' 
                                                        : 'bg-white text-slate-400 border-slate-100'
                                                }`}>
                                                    {(msg.authorName || 'S').substring(0, 1).toUpperCase()}
                                                </div>

                                                {/* Message Bubble */}
                                                <div className={`flex flex-col max-w-[75%] ${msg.isClient ? 'items-end' : 'items-start'}`}>
                                                    <div className={`px-4 py-2.5 text-sm font-medium leading-relaxed shadow-sm rounded-2xl ${
                                                        msg.isClient 
                                                            ? 'bg-emerald-600 text-white rounded-tr-none' 
                                                            : 'bg-white text-slate-700 border border-slate-100/80 rounded-tl-none'
                                                    }`}>
                                                        {msg.content}
                                                        
                                                        {/* Attachments Display */}
                                                        {msg.attachments && msg.attachments.length > 0 && (
                                                            <div className="mt-2.5 space-y-1.5 border-t border-white/20 pt-2">
                                                                {msg.attachments.map((file: any, fIdx: number) => (
                                                                    <a 
                                                                        key={fIdx}
                                                                        href={file.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className={`flex items-center gap-2 p-2 rounded-xl text-xs transition-colors ${
                                                                            msg.isClient ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-50 hover:bg-slate-100'
                                                                        }`}
                                                                    >
                                                                        <Paperclip className="w-3 h-3" />
                                                                        <span className="truncate max-w-[150px]">{file.name}</span>
                                                                        <span className="opacity-60 ml-auto">{(file.size / 1024).toFixed(0)}KB</span>
                                                                    </a>
                                                                ))}
                                                             </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1 px-1">
                                                        <span className="text-[9px] font-semibold text-slate-400">
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
                            <div className="p-4 bg-white border-t border-slate-100">
                                <div className="max-w-3xl mx-auto">
                                    {/* Pending Attachments Preview */}
                                    {pendingAttachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {pendingAttachments.map((file, idx) => (
                                                <div key={idx} className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                                                    <Paperclip className="w-3 h-3 text-emerald-600" />
                                                    <span className="text-xs font-semibold text-emerald-700 truncate max-w-[120px]">{file.name}</span>
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

                                    <div className="bg-slate-50 rounded-2xl p-2 border border-slate-100/80 transition-all focus-within:border-emerald-500/20 focus-within:ring-4 focus-within:ring-emerald-500/5 focus-within:bg-white">
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
                                            className="w-full min-h-[50px] max-h-36 p-2.5 bg-transparent border-none text-sm font-medium text-slate-800 focus:outline-none resize-none placeholder:text-slate-400"
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
                                                className={`h-9 px-5 rounded-xl text-xs font-bold transition-all ${
                                                    (replyText.trim() || pendingAttachments.length > 0) 
                                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/10 hover:scale-[1.01] active:scale-[0.99]' 
                                                        : 'bg-slate-205 bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                                                }`}
                                            >
                                                {t('client.send')}
                                                <Send className="w-3.5 h-3.5 ml-1.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                                <MessageCircle className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('client.select_discussion')}</p>
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
