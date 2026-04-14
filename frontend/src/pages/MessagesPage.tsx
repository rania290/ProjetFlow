import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useStore } from '@/store/projectStore';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, MessageSquare, AtSign, Settings, Hash,
    Send, Paperclip, SmilePlus, Image as ImageIcon,
    MoreVertical, Info, Users, Circle, Loader2, Sparkles,
    Heart, CornerUpLeft, Pin, Reply, Edit2, Trash2, X
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '../components/ui/separator';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { communicationApi, type ActivityLog, type ChatMessage } from '@/api/communication.service';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import TiptapImage from '@tiptap/extension-image';
import { toast } from 'sonner';
import { adminApi } from '@/api/admin.api';
import { Progress } from '@/components/ui/progress';
import { Check, UserPlus, Shield, ExternalLink, Calendar as CalendarIcon, BellOff, Bell, Plus, ChevronDown, Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, SquareCode, Palette, Type } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
export const MessagesPage: React.FC = () => {
    const { state, dispatch } = useStore();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(state.projects[0]?.id || null);
    const [searchQuery, setSearchQuery] = useState('');
    const [mutedProjects, setMutedProjects] = useState<Set<string>>(new Set());
    const [chatSettings, setChatSettings] = useState({ sound: true, push: true });
    const [activityHistory, setActivityHistory] = useState<ActivityLog[]>([]);
    const [viewMode, setViewMode] = useState<'chat' | 'activity'>('chat');
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [activeSidebar, setActiveSidebar] = useState<'none' | 'members' | 'info'>('none');
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [isInviting, setIsInviting] = useState(false);
    const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
    const [showScrollBottom, setShowScrollBottom] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const selectedProject = state.projects.find(p => p.id === selectedProjectId);
    const {
        messages, isLoading, isConnected,
        onlineUsers, typingUsers,
        replyTo, setReplyTo, handleLocalTyping, sendMessage,
        editMessage, deleteMessage,
        toggleLike, togglePin
    } = useChat(selectedProjectId);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const emojiList = ['😀', '😁', '😂', '🤣', '😊', '😍', '😎', '🤔', '🙌', '👏', '🔥', '✅', '👍', '👀', '🎯', '🚀', '💡', '🛠️'];

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            FontFamily,
            Placeholder.configure({ placeholder: `Écrire dans #${selectedProject?.name || 'général'}...` }),
            Underline,
            Highlight,
            TaskList,
            TaskItem.configure({ nested: true }),
            TiptapImage.configure({
                inline: true,
                allowBase64: true,
            }),
            Mention.configure({
                suggestion: {
                    items: ({ query }) => {
                        const members = selectedProject?.members || [];
                        return members
                            .filter(m => m.fullName.toLowerCase().startsWith(query.toLowerCase()))
                            .slice(0, 5);
                    },
                },
            }),
        ],
        content: '',
    });

    useEffect(() => {
        if (!editor || !isConnected) return;

        const handleUpdate = () => {
            if (!editor.isEmpty) {
                console.log('[MessagesPage] Editor update detected, calling handleLocalTyping');
                handleLocalTyping();
            }
        };

        editor.on('update', handleUpdate);
        return () => {
            editor.off('update', handleUpdate);
        };
    }, [editor, isConnected, handleLocalTyping]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const users = await adminApi.getAllUsers();
                setAllUsers(users);
            } catch (error) {
                console.error('Failed to fetch users', error);
            }
        };
        fetchUsers();
    }, []);

    const handleAddMember = async (userId: string) => {
        if (!selectedProject) return;
        try {
            const userToAdd = allUsers.find(u => u.id === userId);
            if (!userToAdd) return;

            // Dispatch to store
            dispatch({
                type: 'ADD_PROJECT_MEMBER',
                projectId: selectedProject.id,
                member: {
                    id: userToAdd.id,
                    fullName: userToAdd.fullName,
                    role: 'Membre',
                    avatar: userToAdd.fullName.substring(0, 2).toUpperCase(),
                    tjm: 0
                }
            });

            toast.success(`${userToAdd.fullName} a été ajouté au projet`);
            setIsInviting(false);
        } catch (error) {
            toast.error('Erreur lors de l\'ajout du membre');
        }
    };

    useEffect(() => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;

        const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;

        if (isAtBottom) {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
            setUnreadCount(0);
        } else {
            setUnreadCount(prev => prev + 1);
        }
    }, [messages]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 200;
        setShowScrollBottom(!isNearBottom);
        if (isNearBottom) setUnreadCount(0);
    };

    const scrollToBottom = () => {
        scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
        setUnreadCount(0);
    };

    useEffect(() => {
        if (selectedProjectId && viewMode === 'activity') {
            communicationApi.getProjectActivity(selectedProjectId)
                .then(setActivityHistory)
                .catch(console.error);
        }
    }, [selectedProjectId, viewMode]);

    const handleSend = () => {
        if (!editor) return;
        const html = editor.getHTML();
        if (editor.isEmpty && !html.includes('href') && !html.includes('img')) return;

        if (editingMessage) {
            editMessage(editingMessage.id, html);
            setEditingMessage(null);
        } else {
            sendMessage(html, replyTo?.id);
        }
        editor.commands.clearContent();
        setReplyTo(null);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("L'image est trop volumineuse (max 5MB)");
                return;
            }
            toast.loading("Préparation du fichier...");
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                editor?.chain().focus().insertContent([
                    {
                        type: 'text',
                        marks: [{
                            type: 'link',
                            attrs: {
                                href: '#' + base64
                            }
                        }],
                        text: `📎 ${file.name}`
                    },
                    {
                        type: 'text',
                        text: ' '
                    }
                ]).run();
                toast.dismiss();
                toast.success("Fichier joint prêt à l'envoi !");
            };
            reader.readAsDataURL(file);
        }
    };

    const sortedProjects = [...state.projects].filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout title="Messagerie Interne" subtitle="Plateforme collaborative temps réel">
            <div className="flex h-full bg-white overflow-hidden rounded-t-[32px] border-t border-slate-100 shadow-2xl shadow-indigo-500/10">

                {/* --- Internal Sidebar: Projects --- */}
                <div className="w-[320px] border-r border-slate-50 bg-slate-50/30 flex flex-col pt-6">
                    <div className="px-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Conversations</h3>
                            <Popover>
                                <PopoverTrigger className="p-1.5 rounded-lg hover:bg-white transition-all shadow-sm border border-transparent hover:border-slate-100 focus:outline-none">
                                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-[280px] p-4 rounded-3xl shadow-2xl border-slate-100 bg-white/95 backdrop-blur-xl">
                                    <div className="mb-4">
                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                            <Settings className="w-3 h-3 text-indigo-500" />
                                            Paramètres
                                        </h4>
                                        <p className="text-[10px] text-slate-400 font-medium mt-1">Préférences de messagerie</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${chatSettings.sound ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                                                    {chatSettings.sound ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Sons d'alerte</p>
                                                    <p className="text-[9px] text-slate-400 uppercase tracking-widest">{chatSettings.sound ? 'Activés' : 'Désactivés'}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setChatSettings(s => ({ ...s, sound: !s.sound }))}
                                                className={`w-10 h-6 flex items-center rounded-full transition-colors duration-300 p-1 ${chatSettings.sound ? 'bg-indigo-500' : 'bg-slate-300'}`}
                                            >
                                                <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-md" style={{ marginLeft: chatSettings.sound ? "1rem" : "0" }} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${chatSettings.push ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                                                    <MessageSquare className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Notifs Push</p>
                                                    <p className="text-[9px] text-slate-400 uppercase tracking-widest">{chatSettings.push ? 'Actives' : 'Muettes'}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setChatSettings(s => ({ ...s, push: !s.push }))}
                                                className={`w-10 h-6 flex items-center rounded-full transition-colors duration-300 p-1 ${chatSettings.push ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                            >
                                                <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-md" style={{ marginLeft: chatSettings.push ? "1rem" : "0" }} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-50">
                                        <button className="w-full h-10 flex items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-colors"
                                            onClick={() => toast.success("Cache système validé")}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Vider le cache chat
                                        </button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Rechercher un projet..."
                                className="pl-9 h-10 bg-white/50 border-slate-100 rounded-xl text-xs font-medium focus-visible:ring-indigo-500/20"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
                        <div className="px-3 mb-2 flex items-center gap-2 opacity-30">
                            <Hash className="w-3 h-3" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Canaux de Projets</span>
                        </div>
                        {sortedProjects.map(project => (
                            <button
                                key={project.id}
                                onClick={() => setSelectedProjectId(project.id)}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 group relative ${selectedProjectId === project.id
                                    ? 'bg-white shadow-xl shadow-indigo-500/5 text-indigo-600 border border-slate-100'
                                    : 'text-slate-500 hover:bg-white hover:text-slate-900'
                                    }`}
                            >
                                <div className={`w-2 h-2 rounded-full ${selectedProjectId === project.id ? 'bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]' : 'bg-slate-200 group-hover:bg-slate-300'}`} />
                                <span className="flex-1 text-xs font-black truncate text-left uppercase tracking-tight">{project.name}</span>
                                {selectedProjectId === project.id && (
                                    <motion.div layoutId="active-nav" className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 mt-auto">
                        <div className="bg-indigo-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-600/20">
                            <div className="flex items-center gap-3 mb-2">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-[11px] font-black uppercase tracking-widest">Aura Intelligence</span>
                            </div>
                            <p className="text-[10px] leading-relaxed opacity-80 font-medium">Aura est prête à résumer vos conversations manquées.</p>
                        </div>
                    </div>
                </div>

                {/* --- Main Chat Area --- */}
                <div className="flex-1 flex flex-col min-w-0 bg-white">
                    {selectedProject ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-20 border-b border-slate-50 px-8 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-10 h-10 shrink-0 rounded-2xl bg-slate-950 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-slate-950/20">
                                        {selectedProject.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none truncate">{selectedProject.name}</h2>
                                            <div className={`shrink-0 w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                                        </div>
                                        <p className="text-[10px] truncate font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">
                                            {selectedProject.members?.length || 0} participants · <span className={isConnected ? 'text-emerald-500' : 'text-amber-500'}>{isConnected ? 'En direct' : 'Reconnexion...'}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <h3 className="text-sm hidden sm:block font-black text-slate-900 uppercase tracking-widest bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-100">Conversation</h3>
                                    <Separator orientation="vertical" className="h-6 hidden sm:block" />
                                    <button
                                        onClick={() => setActiveSidebar(activeSidebar === 'members' ? 'none' : 'members')}
                                        className={`p-2 rounded-xl border transition-all shadow-sm ${activeSidebar === 'members'
                                            ? 'bg-slate-950 border-slate-950 text-white'
                                            : 'border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        <Users className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setActiveSidebar(activeSidebar === 'info' ? 'none' : 'info')}
                                        className={`p-2 rounded-xl border transition-all shadow-sm ${activeSidebar === 'info'
                                            ? 'bg-slate-950 border-slate-950 text-white'
                                            : 'border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        <Info className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 flex min-w-0 overflow-hidden">
                                <div className="flex-1 flex flex-col min-w-0 bg-white relative">
                                    {messages.filter(m => m.isPinned).length > 0 && (
                                        <div className="bg-amber-50 shrink-0 border-b border-amber-100 flex items-center p-3 gap-3 overflow-x-auto custom-scrollbar sticky top-0 z-10 shadow-sm shadow-amber-500/5">
                                            <Pin className="w-4 h-4 text-amber-500 shrink-0 ml-2" />
                                            <span className="text-[10px] font-black uppercase text-amber-700 tracking-widest mr-2 shrink-0">Épinglés</span>
                                            {messages.filter(m => m.isPinned).map(msg => (
                                                <div
                                                    key={`pin-${msg.id}`}
                                                    className="bg-white/80 shrink-0 px-3 py-1.5 rounded-lg border border-amber-200/50 shadow-[0_2px_10px_rgba(245,158,11,0.05)] min-w-[200px] max-w-[300px] cursor-pointer hover:border-amber-400 hover:bg-white transition-all backdrop-blur-sm"
                                                    onClick={() => document.getElementById(`msg-${msg.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <img src={msg.authorAvatar} className="w-4 h-4 rounded-full border border-white shadow-sm" />
                                                        <span className="text-[10px] items-center font-black text-slate-700 uppercase tracking-tight truncate flex-1">{msg.authorName}</span>
                                                        <span className="text-[8px] text-amber-500 font-bold uppercase">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 truncate" dangerouslySetInnerHTML={{ __html: msg.content }} />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div
                                        ref={scrollContainerRef}
                                        onScroll={handleScroll}
                                        className="flex-1 overflow-y-auto custom-scrollbar bg-white p-8 relative"
                                    >
                                        {/* Scroll to Bottom Button */}
                                        <AnimatePresence>
                                            {showScrollBottom && (
                                                <motion.button
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 20 }}
                                                    onClick={scrollToBottom}
                                                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-md border border-slate-200/60 text-slate-600 px-5 py-2.5 rounded-full shadow-xl shadow-slate-200/50 hover:bg-white hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center gap-2 group cursor-pointer"
                                                >
                                                    <div className="relative">
                                                        <ChevronDown className="w-4 h-4" />
                                                        {unreadCount > 0 && (
                                                            <span className="absolute -top-1 -right-2 flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                                        {unreadCount > 0 ? `${unreadCount} nouveaux messages` : 'Voir messages récents'}
                                                    </span>
                                                </motion.button>
                                            )}
                                        </AnimatePresence>

                                        <AnimatePresence mode="wait">
                                            {viewMode === 'chat' ? (
                                                <motion.div
                                                    key="chat-view"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="space-y-8 max-w-5xl mx-auto"
                                                >
                                                    {isLoading && messages.length === 0 && (
                                                        <div className="flex flex-col items-center justify-center h-[300px] opacity-20">
                                                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                                            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Chargement de l'historique...</p>
                                                        </div>
                                                    )}

                                                    {!isLoading && messages.length === 0 && (
                                                        <div className="text-center py-20 border-2 border-dashed border-slate-50 rounded-[40px]">
                                                            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                                                <MessageSquare className="w-8 h-8 text-slate-300" />
                                                            </div>
                                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Le début de l'histoire</h4>
                                                            <p className="text-xs text-slate-400 mt-2">Dites bonjour à votre équipe !</p>
                                                        </div>
                                                    )}

                                                    {messages.map((msg, idx) => {
                                                        const isMine = msg.authorId === user?.id;

                                                        // Date Separator Logic
                                                        const prevMsg = idx > 0 ? messages[idx - 1] : null;
                                                        const currDate = new Date(msg.createdAt).toLocaleDateString();
                                                        const prevDate = prevMsg ? new Date(prevMsg.createdAt).toLocaleDateString() : null;
                                                        const showDateSeparator = currDate !== prevDate;

                                                        // Smart Grouping Logic
                                                        const sameAsPrev = prevMsg && prevMsg.authorId === msg.authorId &&
                                                            (new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() < 5 * 60 * 1000);
                                                        const showAvatar = !sameAsPrev || showDateSeparator;

                                                        return (
                                                            <React.Fragment key={msg.id}>
                                                                {showDateSeparator && (
                                                                    <div className="flex items-center gap-4 my-8 opacity-40">
                                                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">
                                                                            {currDate === new Date().toLocaleDateString() ? "Aujourd'hui" :
                                                                                currDate === new Date(Date.now() - 86400000).toLocaleDateString() ? "Hier" :
                                                                                    currDate}
                                                                        </span>
                                                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                                                                    </div>
                                                                )}

                                                                <div id={`msg-${msg.id}`} className={`group relative flex items-start gap-4 ${isMine ? 'flex-row-reverse' : ''} ${!showAvatar ? 'mt-[-28px]' : ''}`}>
                                                                    {/* Action Bar Overlay */}
                                                                    <div className={`absolute -top-3 opacity-0 group-hover:opacity-100 transition-all z-20 flex items-center gap-1 bg-white border border-slate-100 shadow-xl shadow-indigo-500/10 rounded-xl p-1 ${isMine ? 'left-4' : 'right-4'}`}>
                                                                        {isMine && !msg.isDeleted && (
                                                                            <>
                                                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50" onClick={() => deleteMessage(msg.id)}>
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </Button>
                                                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => { setEditingMessage(msg); editor?.commands.setContent(msg.content); }}>
                                                                                    <Edit2 className="w-4 h-4" />
                                                                                </Button>
                                                                            </>
                                                                        )}
                                                                        <Button
                                                                            variant="ghost" size="icon" className={`h-8 w-8 rounded-lg ${msg.likes?.includes(user?.id || '') ? 'text-rose-500 bg-rose-50' : 'text-slate-400'}`}
                                                                            onClick={() => toggleLike(msg.id)}
                                                                        >
                                                                            <Heart className={`w-4 h-4 ${msg.likes?.includes(user?.id || '') ? 'fill-current' : ''}`} />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                                                            onClick={() => setReplyTo(msg)}
                                                                        >
                                                                            <CornerUpLeft className="w-4 h-4" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost" size="icon" className={`h-8 w-8 rounded-lg ${msg.isPinned ? 'text-amber-500 bg-amber-50' : 'text-slate-400'}`}
                                                                            onClick={() => togglePin(msg.id)}
                                                                        >
                                                                            <Pin className={`w-4 h-4 ${msg.isPinned ? 'fill-current' : ''}`} />
                                                                        </Button>
                                                                    </div>

                                                                    <div className="shrink-0 pt-1 relative">
                                                                        {showAvatar ? (
                                                                            <>
                                                                                <Avatar className="w-10 h-10 rounded-2xl shadow-lg shadow-indigo-500/10 ring-2 ring-white border border-slate-100">
                                                                                    <AvatarImage src={msg.authorAvatar} />
                                                                                    <AvatarFallback className="bg-slate-800 text-white font-black text-[10px]">{msg.authorName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                                                </Avatar>
                                                                                {onlineUsers.includes(msg.authorId) && (
                                                                                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full transition-all duration-500 animate-pulse shadow-sm" />
                                                                                )}
                                                                            </>
                                                                        ) : (
                                                                            <div className="w-10 flex flex-col items-center pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <span className="text-[8px] font-bold text-slate-300 uppercase">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className={`max-w-[70%] space-y-1.5 ${isMine ? 'items-end' : ''}`}>
                                                                        {showAvatar && (
                                                                            <div className={`flex items-center gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-[12px] font-black text-slate-900 tracking-tight uppercase">{msg.authorName}</span>
                                                                                    {msg.isPinned && (
                                                                                        <Badge className="bg-amber-100 text-amber-700 border-none rounded-lg text-[8px] font-black uppercase tracking-widest px-1.5 h-4">
                                                                                            Épinglé
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                                <span className="text-[10px] font-bold text-slate-300 uppercase">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                            </div>
                                                                        )}

                                                                        {/* Reply To Preview */}
                                                                        {msg.replyTo && (
                                                                            <div className={`mb-1 pl-3 border-l-3 border-indigo-200 bg-slate-50/50 py-2 px-3 rounded-xl overflow-hidden ${isMine ? 'self-end text-right border-r-3 border-l-0' : 'text-left'}`}>
                                                                                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                                                    <Reply className="w-2.5 h-2.5" />
                                                                                    Réponse à {msg.replyTo.authorName}
                                                                                </p>
                                                                                <p className="text-[11px] text-slate-400 truncate font-medium italic opacity-80" dangerouslySetInnerHTML={{ __html: msg.replyTo.content }} />
                                                                            </div>
                                                                        )}

                                                                        <motion.div
                                                                            initial={showDateSeparator ? { opacity: 0, y: 10 } : false}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            className={`px-5 py-3 rounded-[24px] text-sm font-medium leading-relaxed shadow-sm transition-all hover:shadow-md ${isMine
                                                                                ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/10'
                                                                                : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-slate-200/50'
                                                                                }`}
                                                                            onClick={(e) => {
                                                                                const target = e.target as Node;
                                                                                const element = (target.nodeType === Node.TEXT_NODE ? target.parentElement : target) as HTMLElement;
                                                                                const anchor = element?.closest('a');
                                                                                if (anchor) {
                                                                                    const href = anchor.getAttribute('href');
                                                                                    if (href && href.startsWith('#data:')) {
                                                                                        e.preventDefault();
                                                                                        e.stopPropagation();
                                                                                        if (href.startsWith('#data:image')) {
                                                                                            setSelectedImage(href.substring(1));
                                                                                        } else {
                                                                                            const dl = document.createElement('a');
                                                                                            dl.href = href.substring(1);
                                                                                            dl.download = anchor.textContent?.replace('📎 ', '') || 'document';
                                                                                            dl.click();
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }}>
                                                                            <div dangerouslySetInnerHTML={{ __html: msg.content }} className={msg.isDeleted ? 'opacity-60 grayscale relative' : ''} />
                                                                        </motion.div>

                                                                        {msg.isEdited && !msg.isDeleted && (
                                                                            <div className={`flex items-center gap-1 mt-1 opacity-40 ${isMine ? 'justify-end' : ''}`}>
                                                                                <Edit2 className="w-2.5 h-2.5 text-slate-500" />
                                                                                <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Modifié</span>
                                                                            </div>
                                                                        )}

                                                                        {/* Reactions Info */}
                                                                        {msg.likes && msg.likes.length > 0 && (
                                                                            <div className={`flex pt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-100/50 text-rose-600 shadow-sm animate-in fade-in zoom-in duration-300 hover:scale-110 transition-transform cursor-pointer">
                                                                                    <Heart className="w-3 h-3 fill-current" />
                                                                                    <span className="text-[10px] font-black tracking-tight">{msg.likes.length}</span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                    <div ref={messagesEndRef} className="h-4" />
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="activity-view"
                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="space-y-4 max-w-4xl mx-auto"
                                                >
                                                    <div className="mb-8">
                                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2 px-2">Flux d'Activité</h3>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2">Suivi complet des modifications du projet</p>
                                                    </div>
                                                    {activityHistory.length === 0 ? (
                                                        <div className="text-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-100">
                                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-200" />
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aucune activité enregistrée</p>
                                                        </div>
                                                    ) : (
                                                        activityHistory.map((log) => (
                                                            <div key={log.id} className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                                                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between gap-4">
                                                                        <p className="text-xs font-black text-slate-900 leading-snug tracking-tight">
                                                                            <span className="text-indigo-600">{log.userName}</span> a {log.action.toLowerCase()} {log.entityType.toLowerCase()}
                                                                        </p>
                                                                        <span className="text-[10px] font-bold text-slate-300 uppercase whitespace-nowrap">{new Date(log.createdAt).toLocaleDateString()}</span>
                                                                    </div>
                                                                    {log.metadata && (
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">ID: {log.entityId}</p>
                                                                    )}
                                                                </div>
                                                                <button className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-slate-400">
                                                                    <MoreVertical className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        ))
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Chat Input */}
                                    <div className="p-8 bg-white border-t border-slate-50 shrink-0">
                                        <div className="max-w-5xl mx-auto">
                                            {/* Typing Indicator */}
                                            <AnimatePresence>
                                                {typingUsers.length > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 5 }}
                                                        className="px-6 py-1 flex items-center gap-2 mb-2"
                                                    >
                                                        <div className="flex gap-1">
                                                            <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                            <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                            <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight italic">
                                                            {typingUsers.length === 1
                                                                ? `${typingUsers[0].name} est en train d'écrire...`
                                                                : `${typingUsers.length} personnes écrivent...`
                                                            }
                                                        </span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <div className="bg-slate-50 border border-slate-100 rounded-[32px] overflow-hidden p-2 flex flex-col gap-2 transition-all focus-within:bg-white focus-within:shadow-2xl focus-within:shadow-indigo-500/10 focus-within:border-indigo-100 ring-1 ring-black/[0.01]">
                                                {/* Action Mode Banners */}
                                                {(replyTo || editingMessage) && (
                                                    <div className="bg-indigo-50/5 border-b border-indigo-100/50 px-6 py-3 flex items-center justify-between animate-in slide-in-from-bottom-2">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center">
                                                                {replyTo ? <Reply className="w-3.5 h-3.5 text-indigo-600" /> : <Edit2 className="w-3.5 h-3.5 text-amber-500" />}
                                                            </div>
                                                            <div className="truncate">
                                                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tight">
                                                                    {replyTo ? `Répondre à ` : `Édition de votre message`}
                                                                    {replyTo && <span className="text-slate-900">{replyTo.authorName}</span>}
                                                                </p>
                                                                {replyTo && (
                                                                    <p className="text-[11px] text-slate-500 truncate italic font-medium" dangerouslySetInnerHTML={{ __html: replyTo.content }} />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => { setReplyTo(null); setEditingMessage(null); editor?.commands.clearContent(); }}
                                                            className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-400 transition-colors cursor-pointer"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                                <div className="px-6 pt-4 pb-2 min-h-[44px]">
                                                    <EditorContent
                                                        editor={editor}
                                                        className="prose prose-sm max-w-none focus:outline-none text-slate-600 font-medium text-sm"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();
                                                                if (!editor?.isEmpty) handleSend();
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between px-3 pb-2 pt-1 border-t border-slate-50 mt-1 gap-2">
                                                    <div className="flex-1 min-w-0 flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1">
                                                        <Button variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleBold().run()} className={`shrink-0 w-8 h-8 rounded-lg ${editor?.isActive('bold') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}>
                                                            <Bold className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleItalic().run()} className={`shrink-0 w-8 h-8 rounded-lg ${editor?.isActive('italic') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}>
                                                            <Italic className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleUnderline().run()} className={`shrink-0 w-8 h-8 rounded-lg ${editor?.isActive('underline') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}>
                                                            <UnderlineIcon className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleStrike().run()} className={`shrink-0 w-8 h-8 rounded-lg ${editor?.isActive('strike') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}>
                                                            <Strikethrough className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Separator orientation="vertical" className="shrink-0 h-4 mx-1 bg-slate-200" />
                                                        <Button variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleCode().run()} className={`shrink-0 w-8 h-8 rounded-lg ${editor?.isActive('code') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}>
                                                            <Code className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className={`shrink-0 w-8 h-8 rounded-lg ${editor?.isActive('codeBlock') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}>
                                                            <SquareCode className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Separator orientation="vertical" className="shrink-0 h-4 mx-1 bg-slate-200" />
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="shrink-0 w-8 h-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200">
                                                                    <Palette className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-[150px] p-2 rounded-2xl border-slate-100 shadow-xl" align="start">
                                                                <div className="grid grid-cols-5 gap-1.5 place-items-center">
                                                                    {['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#64748b'].map((color) => (
                                                                        <button
                                                                            key={color}
                                                                            onClick={() => editor?.chain().focus().setColor(color).run()}
                                                                            className="w-5 h-5 rounded-full border border-slate-200 hover:scale-110 active:scale-95 transition-transform"
                                                                            style={{ backgroundColor: color }}
                                                                        />
                                                                    ))}
                                                                    <button
                                                                        onClick={() => editor?.chain().focus().unsetColor().run()}
                                                                        className="col-span-5 w-full h-7 mt-1 text-[10px] font-black text-rose-500 hover:bg-rose-50 rounded-lg uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" /> Effacer
                                                                    </button>
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="shrink-0 w-8 h-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200">
                                                                    <Type className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-32 p-1.5 rounded-2xl border-slate-100 shadow-xl" align="start">
                                                                <div className="flex flex-col gap-1">
                                                                    {[
                                                                        { label: 'Inter', value: 'Inter, sans-serif' },
                                                                        { label: 'Garamond', value: 'Garamond, serif' },
                                                                        { label: 'Courier', value: 'Courier New, monospace' },
                                                                        { label: 'Comic', value: '"Comic Sans MS"' },
                                                                    ].map((font) => (
                                                                        <button
                                                                            key={font.label}
                                                                            onClick={() => editor?.chain().focus().setFontFamily(font.value).run()}
                                                                            className={`text-xs p-2 text-left rounded-xl transition-all ${editor?.isActive('textStyle', { fontFamily: font.value }) ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                                                                            style={{ fontFamily: font.value }}
                                                                        >
                                                                            {font.label}
                                                                        </button>
                                                                    ))}
                                                                    <button
                                                                        onClick={() => editor?.chain().focus().unsetFontFamily().run()}
                                                                        className="text-[10px] p-2 border-t border-slate-100 mt-1 text-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors uppercase tracking-widest font-black rounded-b-xl"
                                                                    >
                                                                        Standard
                                                                    </button>
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>

                                                        <Separator orientation="vertical" className="shrink-0 h-4 mx-1 bg-slate-200" />

                                                        <input
                                                            type="file"
                                                            ref={fileInputRef}
                                                            className="hidden"
                                                            onChange={handleFileUpload}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="shrink-0 w-8 h-8 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
                                                            onClick={() => fileInputRef.current?.click()}
                                                        >
                                                            <Paperclip className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="shrink-0 h-8 w-8 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
                                                            onClick={() => fileInputRef.current?.click()}
                                                        >
                                                            <ImageIcon className="w-4 h-4" />
                                                        </Button>
                                                        <Separator orientation="vertical" className="shrink-0 h-3 mx-1 bg-slate-200" />

                                                        <Popover>
                                                            <PopoverTrigger className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-900 transition-all bg-transparent">
                                                                <SmilePlus className="w-4 h-4" />
                                                            </PopoverTrigger>
                                                            <PopoverContent align="start" className="w-[300px] p-4 rounded-3xl shadow-2xl border-slate-100">
                                                                <div className="grid grid-cols-6 gap-2">
                                                                    {emojiList.map(emoji => (
                                                                        <button
                                                                            key={emoji}
                                                                            className="w-10 h-10 text-xl hover:bg-slate-50 rounded-xl transition-all"
                                                                            onClick={() => editor?.chain().focus().insertContent(emoji).run()}
                                                                        >
                                                                            {emoji}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>

                                                        <Separator orientation="vertical" className="shrink-0 h-4 mx-1 bg-slate-200" />

                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="shrink-0 w-8 h-8 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
                                                            onClick={() => editor?.chain().focus().insertContent('@').run()}
                                                        >
                                                            <AtSign className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        onClick={handleSend}
                                                        className={`h-11 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${(!editor || editor.isEmpty) ? 'opacity-50' : 'shadow-lg shadow-indigo-600/30'}`}
                                                    >
                                                        <span>Envoyer</span>
                                                        <Send className="w-3.5 h-3.5 ml-2" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center justify-center gap-4 opacity-30">
                                                <div className="flex items-center gap-1.5">
                                                    <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[9px] font-black border border-slate-200 uppercase tracking-widest">Return</kbd>
                                                    <span className="text-[9px] font-black uppercase tracking-widest">pour envoyer</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[9px] font-black border border-slate-200 uppercase tracking-widest">@</kbd>
                                                    <span className="text-[9px] font-black uppercase tracking-widest">pour mentionner</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* --- Right Sidebar --- */}
                                <AnimatePresence>
                                    {activeSidebar !== 'none' && (
                                        <motion.div
                                            initial={{ x: '100%' }}
                                            animate={{ x: 0 }}
                                            exit={{ x: '100%' }}
                                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                            className="w-80 h-full bg-white border-l border-slate-100 flex flex-col shrink-0 z-20 shadow-2xl shadow-slate-200/50"
                                        >
                                            <div className="h-20 px-6 flex items-center justify-between border-b border-slate-50">
                                                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">
                                                    {activeSidebar === 'members' ? 'Équipe du Projet' : 'Aperçu du Projet'}
                                                </h4>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setActiveSidebar('none')}
                                                    className="w-8 h-8 rounded-lg hover:bg-slate-50 text-slate-400"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                                {activeSidebar === 'members' ? (
                                                    <div className="p-6 space-y-6">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                                {selectedProject.members?.length || 0} Membres
                                                            </span>
                                                            <Popover open={isInviting} onOpenChange={setIsInviting}>
                                                                <PopoverTrigger className="h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest px-3 flex items-center shadow-lg shadow-indigo-600/20 transition-all active:scale-95 border-none cursor-pointer">
                                                                    <UserPlus className="w-3 h-3 mr-2" />
                                                                    Inviter
                                                                </PopoverTrigger>
                                                                <PopoverContent align="end" className="w-[280px] p-2 rounded-2xl shadow-2xl border-slate-100">
                                                                    <div className="p-2 mb-2 border-b border-slate-50">
                                                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Chercher un utilisateur</span>
                                                                    </div>
                                                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                                                        {allUsers
                                                                            .filter(u => !selectedProject.members?.some(m => m.id === u.id))
                                                                            .map(u => (
                                                                                <button
                                                                                    key={u.id}
                                                                                    onClick={() => handleAddMember(u.id)}
                                                                                    className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-all group"
                                                                                >
                                                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-[10px]">
                                                                                        {u.fullName.substring(0, 2).toUpperCase()}
                                                                                    </div>
                                                                                    <div className="flex-1 text-left">
                                                                                        <p className="text-[11px] font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{u.fullName}</p>
                                                                                        <p className="text-[9px] text-slate-400 uppercase tracking-widest">{u.role || 'Utilisateur'}</p>
                                                                                    </div>
                                                                                    <Plus className="w-3 h-3 text-slate-300 group-hover:text-indigo-500" />
                                                                                </button>
                                                                            ))}
                                                                    </div>
                                                                </PopoverContent>
                                                            </Popover>
                                                        </div>

                                                        <div className="space-y-1">
                                                            {selectedProject.members?.map(member => {
                                                                const isOnline = onlineUsers.includes(member.id);
                                                                return (
                                                                    <div key={member.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group">
                                                                        <div className="relative">
                                                                            <div className="w-10 h-10 rounded-[14px] bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-md">
                                                                                {member.avatar || member.fullName.substring(0, 2).toUpperCase()}
                                                                            </div>
                                                                            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-white shadow-sm ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-black text-slate-900 uppercase tracking-tight truncate">{member.fullName}</p>
                                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-0.5 italic">{member.role}</p>
                                                                        </div>
                                                                        {member.id === selectedProject.managerId && (
                                                                            <Shield className="w-3.5 h-3.5 text-indigo-500" />
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-6 space-y-8">
                                                        <div className="space-y-4">
                                                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                                                                <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center text-2xl mb-4 shadow-xl shadow-slate-200/50 border border-slate-100">
                                                                    🚀
                                                                </div>
                                                                <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">{selectedProject.name}</h5>
                                                                <p className="text-[11px] text-slate-500 leading-relaxed italic mb-4">"{selectedProject.description || 'Aucune description fournie.'}"</p>
                                                                <div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                                                    <CalendarIcon className="w-3 h-3" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest">Échéance : {new Date(selectedProject.endDate).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <h6 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Statistiques de Santé</h6>
                                                            <div className="bg-white p-5 rounded-3xl border border-slate-100 space-y-4 shadow-sm">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Progression Globale</span>
                                                                    <span className="text-[11px] font-black text-indigo-600">{selectedProject.progress}%</span>
                                                                </div>
                                                                <Progress value={selectedProject.progress} className="h-2 bg-slate-100" />

                                                                <div className="grid grid-cols-2 gap-4 mt-6">
                                                                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Budget</p>
                                                                        <p className="text-xs font-black text-slate-900">{selectedProject.budget.toLocaleString()}€</p>
                                                                    </div>
                                                                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Membres</p>
                                                                        <p className="text-xs font-black text-slate-900">{selectedProject.members?.length || 0}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3 pt-4">
                                                            <Button
                                                                onClick={() => navigate('/projects/' + selectedProject.id)}
                                                                className="w-full h-11 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-slate-900/10"
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5 mr-3" />
                                                                Voir Planning Complet
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setMutedProjects(prev => {
                                                                        const newSet = new Set(prev);
                                                                        if (newSet.has(selectedProject.id)) {
                                                                            newSet.delete(selectedProject.id);
                                                                            toast.success("Notifications réactivées pour ce projet");
                                                                        } else {
                                                                            newSet.add(selectedProject.id);
                                                                            toast.success("Notifications désactivées pour ce projet");
                                                                        }
                                                                        return newSet;
                                                                    });
                                                                }}
                                                                className="w-full h-11 rounded-2xl border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50"
                                                            >
                                                                {mutedProjects.has(selectedProject.id) ? (
                                                                    <>
                                                                        <Bell className="w-3.5 h-3.5 mr-3" />
                                                                        Activer le son
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <BellOff className="w-3.5 h-3.5 mr-3" />
                                                                        Muer le Projet
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-12">
                            <div className="w-20 h-20 bg-slate-50 rounded-[40px] flex items-center justify-center mb-4">
                                <MessageSquare className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-[0.1em]">Aucune conversation sélectionnée</h3>
                            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">Veuillez choisir un projet dans la liste à gauche pour commencer à discuter avec votre équipe.</p>
                            <Button className="mt-4 rounded-2xl bg-slate-950 text-white font-black text-xs uppercase tracking-widest px-8">Nouveau Projet</Button>
                        </div>
                    )}
                </div>

            </div>

            {/* Image Preview Modal */}
            {selectedImage && (
                <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                    <DialogContent className="max-w-[80vw] max-h-[90vh] p-4 bg-white/90 backdrop-blur-xl border-none shadow-2xl rounded-3xl flex flex-col items-center justify-center overflow-hidden">
                        <img
                            src={selectedImage}
                            alt="Aperçu du fichier"
                            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-lg ring-1 ring-black/5"
                        />
                    </DialogContent>
                </Dialog>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #94a3b8;
                    pointer-events: none;
                    height: 0;
                }
            `}} />
        </AppLayout>
    );
};
