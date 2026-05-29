import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, User, Loader2, History, Plus, FileText, Copy, Check, MessageSquare } from 'lucide-react';
import { useAuraStore } from '../../store/auraStore';
import { useStore } from '../../store/projectStore';
import { useAuth } from '../../hooks/useAuth';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AuraReportList } from './AuraReportList';

// Helper component for copying text
const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button 
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all duration-200"
            title="Copier le message"
        >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
    );
};

export const AuraChatPanel: React.FC = () => {
    const { 
        isOpen, toggleOpen, setOpen, getMessages, isLoading, sendMessage, 
        conversations, activeConversationId, fetchConversations, 
        selectConversation, startNewConversation 
    } = useAuraStore();
    
    const { state } = useStore();
    const { user } = useAuth();
    const location = useLocation();
    const [inputValue, setInputValue] = useState('');
    const [showHistory, setShowHistory] = useState(false); // Reports
    const [showConversations, setShowConversations] = useState(false); // Chat History
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    // Close Aura when navigating to a different page
    useEffect(() => {
        if (isOpen) {
            setOpen(false);
        }
    }, [location.pathname]);
    
    const activeProject = state.projects.find(p => p.id === state.selectedProjectId) || state.projects[0];
    const messages = activeProject ? getMessages(activeProject.id) : [];

    // Is this a fresh conversation? (Only welcome message present)
    const isFreshConversation = messages.length <= 1;

    const isClient = (user?.role || '').toUpperCase() === 'CLIENT';

    const quickPrompts = [
        "Résumer l'état d'avancement du projet",
        "Quels sont les principaux risques actuels ?",
        "Lister les tâches en retard",
        ...(isClient ? [] : ["Générer un rapport de synthèse pour le client"])
    ];

    // Clients should not have access to Aura reports UI
    useEffect(() => {
        if (isClient && showHistory) setShowHistory(false);
    }, [isClient, showHistory]);

    useEffect(() => {
        if (isOpen && activeProject) {
            fetchConversations(activeProject.id);
        }
    }, [isOpen, activeProject, fetchConversations]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!showHistory) {
            scrollToBottom();
        }
    }, [messages, isLoading, isOpen, showHistory]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
        }
    }, [inputValue]);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputValue.trim() || isLoading) return;
        
        const projectIdToUse = activeProject?.id;
        if (!projectIdToUse) return;

        sendMessage(inputValue, projectIdToUse);
        setInputValue('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleQuickPrompt = (prompt: string) => {
        const projectIdToUse = activeProject?.id;
        if (!projectIdToUse || isLoading) return;
        sendMessage(prompt, projectIdToUse);
    };

    const handleNewChat = () => {
        if (!activeProject) return;
        startNewConversation(activeProject.id);
        setShowConversations(false);
    };

    const handleSelectConversation = (id: string) => {
        selectConversation(id);
        setShowConversations(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute inset-0 bg-[#FAFAFA] z-[50] flex flex-row overflow-hidden text-slate-800 font-sans shadow-[-10px_0_30px_rgba(0,0,0,0.03)]"
                >
                    {/* Chat Sidebar (Conversations) */}
                    <AnimatePresence>
                        {showConversations && (
                            <motion.div 
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 280, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                className="h-full border-r border-slate-200 bg-white/90 backdrop-blur-md flex flex-col overflow-hidden shrink-0"
                            >
                                <div className="p-4 border-b border-slate-100 bg-white/50">
                                    <button 
                                        onClick={handleNewChat}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 border border-indigo-700 rounded-xl text-sm font-medium text-white hover:bg-indigo-700 hover:border-indigo-800 transition-all shadow-sm shadow-indigo-200"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Nouvelle discussion
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-0.5 custom-scrollbar">
                                    <div className="px-3 py-4">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Historique</span>
                                    </div>
                                    {conversations.map(conv => (
                                        <button
                                            key={conv.id}
                                            onClick={() => handleSelectConversation(conv.id)}
                                            className={`w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all truncate group ${activeConversationId === conv.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${activeConversationId === conv.id ? 'text-indigo-500' : 'text-slate-400'}`} />
                                            <span className="truncate">{conv.title}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main Chat Area */}
                    <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
                        {/* Decorative background mesh */}
                        <div className="absolute inset-0 -z-10 overflow-hidden">
                            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-100/40 blur-3xl" />
                            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-100/40 blur-3xl" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-white/80 backdrop-blur-xl relative z-10 shadow-sm shadow-slate-100/20">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setShowConversations(!showConversations)}
                                    className={`p-2 rounded-lg transition-colors ${showConversations ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                                    title="Historique des discussions"
                                >
                                    <History className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-sm shadow-indigo-200">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-[15px] font-semibold text-slate-900 tracking-tight leading-none">Aura</h2>
                                        <p className="text-[11px] text-indigo-600 font-medium mt-1">Intelligence Artificielle</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {!isClient && (
                                    <button
                                        onClick={() => setShowHistory(!showHistory)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${showHistory ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span>Rapports</span>
                                    </button>
                                )}
                                <div className="w-px h-5 bg-slate-200"></div>
                                <button 
                                    onClick={toggleOpen}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Project Context & Content */}
                        <div className="flex-1 overflow-hidden flex flex-col relative z-10">
                            {showHistory && !isClient ? (
                                <div className="flex-1 overflow-y-auto bg-white border-l border-slate-100">
                                    <AuraReportList projectId={activeProject?.id || ''} />
                                </div>
                            ) : (
                                <>
                                    {/* Messages Area */}
                                    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 custom-scrollbar scroll-smooth">
                                        <div className="max-w-3xl mx-auto w-full space-y-8">
                                            {messages.map((msg, index) => (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    key={msg.id || index} 
                                                    className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 ${
                                                        msg.role === 'aura' 
                                                            ? 'bg-white border border-indigo-100 shadow-sm text-indigo-600' 
                                                            : 'bg-slate-800 text-white'
                                                    }`}>
                                                        {msg.role === 'aura' ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                                    </div>
                                                    
                                                    <div className={`flex flex-col gap-1.5 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                                        <div className={`px-5 py-4 text-[14px] leading-relaxed ${
                                                            msg.role === 'user'
                                                                ? 'bg-gradient-to-tr from-slate-800 to-slate-900 text-white rounded-2xl rounded-tr-sm shadow-sm'
                                                                : 'bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-sm shadow-[0_2px_15px_rgba(0,0,0,0.03)] prose prose-slate prose-sm prose-p:leading-relaxed prose-a:text-indigo-600 prose-code:text-indigo-600 prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-100 max-w-none'
                                                        }`}>
                                                            {msg.role === 'user' ? (
                                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                                            ) : (
                                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                    {msg.content}
                                                                </ReactMarkdown>
                                                            )}
                                                        </div>
                                                        <div className={`flex items-center gap-2 px-1 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                                            <span className="text-[11px] font-medium text-slate-400">
                                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            {msg.role === 'aura' && (
                                                                <CopyButton text={msg.content} />
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                            
                                            {/* Quick Prompts for Fresh Conversations */}
                                            {isFreshConversation && !isLoading && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                    className="pt-6 pb-2"
                                                >
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-12 pr-4">
                                                        {quickPrompts.map((prompt, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => handleQuickPrompt(prompt)}
                                                                className="text-left p-4 rounded-xl border border-slate-200/60 bg-white hover:bg-white hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col gap-3 shadow-sm"
                                                            >
                                                                <span className="text-[13px] font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">{prompt}</span>
                                                                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center">
                                                                        <Send className="w-3 h-3 text-indigo-600" />
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Typing Indicator */}
                                            {isLoading && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex items-start gap-4"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-white border border-indigo-100 shadow-sm text-indigo-600 flex items-center justify-center shrink-0 mt-1">
                                                        <Sparkles className="w-4 h-4" />
                                                    </div>
                                                    <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center justify-center shadow-[0_2px_15px_rgba(0,0,0,0.03)] h-[46px]">
                                                        <div className="flex space-x-1.5">
                                                            <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                                                            <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                                                            <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    </div>

                                    {/* Input Area */}
                                    <div className="bg-transparent p-4 sm:px-8 pb-6">
                                        <div className="max-w-3xl mx-auto">
                                            <div className="relative flex items-end gap-2 bg-white border border-slate-200 rounded-2xl shadow-sm focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50/50 transition-all">
                                                <textarea 
                                                    ref={textareaRef}
                                                    value={inputValue}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    placeholder={activeProject ? "Demandez à Aura..." : "Sélectionnez un projet..."}
                                                    disabled={!activeProject || isLoading}
                                                    rows={1}
                                                    className="w-full max-h-[200px] py-4 pl-5 pr-14 bg-transparent border-none focus:ring-0 resize-none text-[14px] text-slate-800 outline-none placeholder:text-slate-400 custom-scrollbar"
                                                />
                                                
                                                <div className="absolute right-2 bottom-2">
                                                    <button
                                                        onClick={handleSubmit}
                                                        disabled={!inputValue.trim() || !activeProject || isLoading}
                                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                                            !inputValue.trim() || !activeProject || isLoading 
                                                            ? 'bg-transparent text-slate-300' 
                                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200'
                                                        }`}
                                                    >
                                                        {isLoading ? (
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                        ) : (
                                                            <Send className="w-4 h-4 ml-0.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-center mt-3">
                                                <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                                                    L'IA peut générer des informations inexactes. Vérifiez les détails importants.
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
