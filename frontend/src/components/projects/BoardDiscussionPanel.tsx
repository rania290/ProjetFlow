import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Send, Paperclip, SmilePlus, Image as ImageIcon, 
    MoreVertical, Info, Users, Circle, Loader2, Sparkles, Search, MessageSquare,
    Heart, CornerUpLeft, Pin, Reply, Edit2, Trash2, AtSign
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TiptapImage from '@tiptap/extension-image';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import { toast } from 'sonner';
import { Sheet, SheetContent } from '../ui/sheet';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Dialog, DialogContent } from '../ui/dialog';
import { Separator } from '../ui/separator';
import type { ChatMessage } from '@/api/communication.service';

export interface BoardDiscussionPanelProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    projectName: string;
    members?: { id: string; fullName: string; }[];
}

export const BoardDiscussionPanel: React.FC<BoardDiscussionPanelProps> = ({ isOpen, onClose, projectId, projectName, members = [] }) => {
    const [search, setSearch] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
    const { user } = useAuth();
    const { 
        messages, isLoading, isConnected, 
        onlineUsers, typingUsers,
        replyTo, setReplyTo, handleLocalTyping, sendMessage, 
        editMessage, deleteMessage,
        toggleLike, togglePin 
    } = useChat(projectId);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const emojiList = ['😀', '😁', '😂', '🤣', '😊', '😍', '😎', '🤔', '🙌', '👏', '🔥', '✅', '👍', '👀', '🎯', '🚀', '💡', '🛠️'];

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: `Écrire dans ${projectName}...` }),
            Highlight,
            TaskList,
            TaskItem.configure({ nested: true }),
            TiptapImage.configure({ inline: true, allowBase64: true }),
            Mention.configure({
                suggestion: {
                    items: ({ query }) => {
                        return (members || [])
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
                console.log('[Board] Editor update detected, calling handleLocalTyping');
                handleLocalTyping();
            }
        };

        editor.on('update', handleUpdate);
        return () => {
            editor.off('update', handleUpdate);
        };
    }, [editor, isConnected, handleLocalTyping]);

    useEffect(() => { 
        if (isOpen) { 
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    }, [isOpen, messages]);

    const handleSend = () => {
        if (!editor) return;
        const html = editor.getHTML();
        if (editor.isEmpty && !html.includes('href') && !html.includes('img')) return;
        
        if (editingMessage) {
            editMessage(editingMessage.id, html);
            setEditingMessage(null);
        } else {
            sendMessage(html);
        }
        editor.commands.clearContent();
        setReplyTo(null);
        toast.success(editingMessage ? 'Message modifié' : 'Message envoyé');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error("Le fichier est trop volumineux (max 10MB)");
                return;
            }
            toast.loading("Préparation du fichier...");
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                editor?.chain().focus().insertContent([
                    {
                        type: 'text',
                        marks: [{ type: 'link', attrs: { href: '#' + base64 } }],
                        text: `📎 ${file.name}`
                    },
                    { type: 'text', text: ' ' }
                ]).run();
                toast.dismiss();
                toast.success("Fichier joint prêt !");
            };
            reader.readAsDataURL(file);
        }
    };

    const filteredMessages = messages.filter(m => {
        const searchable = (m.content + m.authorName).toLowerCase();
        return search ? searchable.includes(search.toLowerCase()) : true;
    });

    return (
        <Sheet open={isOpen} onOpenChange={val => !val && onClose()}>
            <SheetContent side="right" showCloseButton={false} className="w-full sm:max-w-[800px] p-0 border-l border-slate-100 shadow-[0_0_120px_rgba(37,99,235,0.08)] bg-white flex min-h-0 flex-col rounded-l-[32px] overflow-hidden">
                
                {/* Header */}
                <div className="px-8 pt-10 pb-6 bg-white border-b border-slate-50 shrink-0">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h2 className="text-[20px] font-black text-slate-900 tracking-tight leading-none uppercase">Discussion : {projectName}</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{members.length} membres actifs</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-50 text-slate-300 hover:text-slate-900 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="px-8 py-4 shrink-0 bg-slate-50/30 border-b border-slate-100">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher..."
                            className="pl-9 rounded-xl border-slate-200 h-10 text-xs font-medium bg-white"
                        />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                    {messages.filter(m => m.isPinned).length > 0 && (
                        <div className="bg-amber-50 shrink-0 border-b border-amber-100 flex items-center p-3 px-8 gap-4 overflow-x-auto custom-scrollbar sticky top-0 z-10 shadow-sm shadow-amber-500/5">
                            <Pin className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="text-[10px] font-black uppercase text-amber-700 tracking-widest shrink-0">Épinglés</span>
                            <div className="flex items-center gap-2">
                                {messages.filter(m => m.isPinned).map(msg => (
                                    <div 
                                        key={`pin-${msg.id}`} 
                                        className="bg-white/90 shrink-0 px-3 py-1.5 rounded-lg border border-amber-200/50 shadow-[0_2px_10px_rgba(245,158,11,0.05)] min-w-[200px] max-w-[260px] cursor-pointer hover:border-amber-400 hover:bg-white transition-all backdrop-blur-sm" 
                                        onClick={() => document.getElementById(`board-msg-${msg.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <img src={msg.authorAvatar} alt="" className="w-4 h-4 rounded-full" />
                                            <span className="text-[10px] items-center font-black text-slate-700 uppercase tracking-tight truncate flex-1">{msg.authorName}</span>
                                            <span className="text-[8px] text-amber-500 font-bold uppercase">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 truncate" dangerouslySetInnerHTML={{ __html: msg.content }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="px-8 py-8">
                        <AnimatePresence mode="wait">
                            <motion.div key="discussion-list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                {isLoading && messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 opacity-20">
                                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Chargement...</p>
                                    </div>
                                ) : filteredMessages.length === 0 ? (
                                    <div className="text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] p-12 text-slate-300">
                                        <MessageSquare className="w-10 h-10 mx-auto mb-4 opacity-20" />
                                        <p className="font-bold text-sm uppercase tracking-widest">Aucun message</p>
                                    </div>
                                ) : (
                                    filteredMessages.map((msg) => {
                                        const isMine = msg.authorId === user?.id;
                                        return (
                                        <div key={msg.id} id={`board-msg-${msg.id}`} className="group relative flex items-start gap-4 hover:bg-slate-50/50 -mx-4 px-4 py-4 rounded-[2rem] transition-all h-auto">
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
                                                <Button variant="ghost" size="icon" className={`h-8 w-8 rounded-lg ${msg.likes?.includes(user?.id || '') ? 'text-rose-500 bg-rose-50' : 'text-slate-400'}`} onClick={() => toggleLike(msg.id)}>
                                                    <Heart className={`w-4 h-4 ${msg.likes?.includes(user?.id || '') ? 'fill-current' : ''}`} />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => setReplyTo(msg)}>
                                                    <CornerUpLeft className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className={`h-8 w-8 rounded-lg ${msg.isPinned ? 'text-amber-500 bg-amber-50' : 'text-slate-400'}`} onClick={() => togglePin(msg.id)}>
                                                    <Pin className={`w-4 h-4 ${msg.isPinned ? 'fill-current' : ''}`} />
                                                </Button>
                                            </div>

                                            {!isMine && (
                                                <div className="relative shrink-0">
                                                    <Avatar className="w-10 h-10 rounded-2xl shadow-sm mt-1 ring-2 ring-white">
                                                        <AvatarImage src={msg.authorAvatar} />
                                                        <AvatarFallback>{msg.authorName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    {onlineUsers.includes(msg.authorId) && (
                                                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full transition-all duration-500 animate-pulse shadow-sm" />
                                                    )}
                                                </div>
                                            )}

                                            <div className={`flex-1 min-w-0 ${isMine ? 'flex flex-col items-end' : ''}`}>
                                                <div className={`flex items-center gap-3 mb-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity ${isMine ? 'flex-row-reverse' : ''}`}>
                                                    <span className="text-[11px] font-black tracking-tight text-slate-900 uppercase">
                                                        {isMine ? 'Moi' : msg.authorName}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-300 uppercase">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                                                </div>

                                                {msg.replyTo && (
                                                    <div className="mb-2 pl-3 border-l-2 border-indigo-200 bg-slate-50/50 py-1.5 px-3 rounded-lg overflow-hidden max-w-sm">
                                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tight mb-0.5">Réponse à {msg.replyTo.authorName}</p>
                                                        <p className="text-[11px] text-slate-400 truncate font-medium italic" dangerouslySetInnerHTML={{ __html: msg.replyTo.content }} />
                                                    </div>
                                                )}

                                                <div 
                                                    className={`px-5 py-3 rounded-[24px] text-sm font-medium leading-relaxed shadow-sm ${
                                                        isMine 
                                                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                                                        : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'
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
                                                    }}
                                                >
                                                    <div dangerouslySetInnerHTML={{ __html: msg.content }} className={msg.isDeleted ? 'opacity-60 grayscale relative' : ''} />
                                                </div>
                                                
                                                {msg.isEdited && !msg.isDeleted && (
                                                    <div className={`flex items-center gap-1 mt-1 opacity-50 ${isMine ? 'justify-end' : ''}`}>
                                                        <Edit2 className="w-3 h-3 text-slate-500" />
                                                        <span className="text-[9px] font-bold uppercase text-slate-500">Modifié</span>
                                                    </div>
                                                )}

                                                {msg.likes && msg.likes.length > 0 && (
                                                    <div className={`mt-2 flex ${isMine ? 'justify-end' : ''}`}>
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-100/50 text-rose-600 shadow-sm">
                                                            <Heart className="w-3.5 h-3.5 fill-current" />
                                                            <span className="text-[10px] font-black">{msg.likes.length}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} className="h-4" />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-slate-50 bg-white shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                    {/* Typing Indicator */}
                    <AnimatePresence>
                        {typingUsers.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 5 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: 5 }}
                                className="px-6 py-1 flex items-center gap-2 mb-1"
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

                    <div className="bg-slate-50 border border-slate-100 rounded-[28px] overflow-hidden transition-all focus-within:bg-white focus-within:border-indigo-100 focus-within:shadow-xl focus-within:shadow-indigo-500/5">
                        
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
                            <EditorContent editor={editor} className="prose prose-sm max-w-none focus:outline-none text-slate-600 font-medium text-sm" />
                        </div>
                        
                        <div className="flex items-center justify-between px-3 pb-2 pt-1 border-t border-slate-100/50 mt-2 bg-slate-50/50">
                            <div className="flex items-center gap-1">
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-slate-400 hover:text-indigo-600" onClick={() => fileInputRef.current?.click()}>
                                    <Paperclip className="w-4 h-4"/>
                                </Button>
                                <Separator orientation="vertical" className="h-3 mx-1 bg-slate-200" />
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-slate-400 hover:text-indigo-600" onClick={() => editor?.chain().focus().insertContent('@').run()}>
                                    <AtSign className="w-4 h-4"/>
                                </Button>
                                <Separator orientation="vertical" className="h-3 mx-1 bg-slate-200" />
                                <Popover>
                                    <PopoverTrigger className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-indigo-600">
                                        <SmilePlus className="w-4 h-4" />
                                    </PopoverTrigger>
                                    <PopoverContent align="center" className="w-[240px] p-3 rounded-2xl shadow-2xl border-slate-100">
                                        <div className="grid grid-cols-6 gap-2">
                                            {emojiList.map(emoji => (
                                                <button key={emoji} className="h-8 w-8 rounded-lg hover:bg-slate-50 text-lg" onClick={() => editor?.chain().focus().insertContent(`${emoji} `).run()}>
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <Button 
                                onClick={handleSend}
                                className={`h-11 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${(!editor || (editor.isEmpty && !editor.getHTML().includes('href') && !editor.getHTML().includes('img'))) ? 'opacity-50' : 'shadow-lg shadow-indigo-600/30'}`}
                            >
                                <span>Envoyer</span>
                                <Send className="w-3.5 h-3.5 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>

                {selectedImage && (
                    <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                        <DialogContent className="max-w-[80vw] max-h-[90vh] p-4 bg-white/90 backdrop-blur-xl border-none shadow-2xl rounded-3xl flex flex-col items-center justify-center overflow-hidden">
                            <img src={selectedImage} alt="Aperçu du fichier" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-lg ring-1 ring-black/5" />
                        </DialogContent>
                    </Dialog>
                )}
            </SheetContent>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #94a3b8;
                    pointer-events: none;
                    height: 0;
                }
            `}} />
        </Sheet>
    );
};
