import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { useAuraStore } from '../../store/auraStore';
import { useStore } from '../../store/projectStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const AuraChatPanel: React.FC = () => {
    const { isOpen, toggleOpen, messages, isLoading, sendMessage } = useAuraStore();
    const { state } = useStore();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, isOpen]);

    const activeProject = state.projects.find(p => p.id === state.selectedProjectId) || state.projects[0];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;
        
        const projectIdToUse = activeProject?.id;
        if (!projectIdToUse) {
            return;
        }

        sendMessage(inputValue, projectIdToUse);
        setInputValue('');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleOpen}
                        className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-[100]"
                    />
                    
                    {/* Drawer */}
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-screen w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col border-l border-slate-100"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-slate-900 tracking-tight">Aura IA</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                        En ligne
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={toggleOpen}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Project Context Warning */}
                        {!activeProject && (
                            <div className="mx-4 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200/50 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                                <p className="text-xs text-amber-700 font-medium">Vous devez sélectionner un projet actif dans le menu pour discuter avec Aura des spécificités du projet.</p>
                            </div>
                        )}
                        {activeProject && (
                            <div className="px-4 py-2 bg-indigo-50/50 border-b border-indigo-100/50 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Contexte :</span>
                                <span className="text-xs font-bold text-indigo-700 truncate max-w-[250px]">{activeProject.name}</span>
                            </div>
                        )}

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/30 custom-scrollbar">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                        msg.role === 'aura' 
                                            ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md' 
                                            : 'bg-slate-200 text-slate-600'
                                    }`}>
                                        {msg.role === 'aura' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                    </div>
                                    
                                    {/* Bubble */}
                                    <div className={`max-w-[80%] rounded-2xl p-3.5 text-sm shadow-sm ${
                                        msg.role === 'user'
                                            ? 'bg-slate-900 text-white rounded-tr-none'
                                            : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none prose prose-sm prose-p:leading-snug prose-a:text-indigo-600'
                                    }`}>
                                        {msg.role === 'user' ? (
                                            msg.content
                                        ) : (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.content}
                                            </ReactMarkdown>
                                        )}
                                        <div className={`text-[9px] mt-2 font-bold ${msg.role === 'user' ? 'text-slate-400 text-right' : 'text-slate-300'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {isLoading && (
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                                        <span className="text-xs font-bold text-slate-400">Aura analyse le projet...</span>
                                    </div>
                                </div>
                            )}
                            
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-slate-100 bg-white">
                            <form onSubmit={handleSubmit} className="relative flex items-center">
                                <input 
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={activeProject ? "Demandez un rapport, des retards..." : "Sélectionnez un projet..."}
                                    disabled={!activeProject || isLoading}
                                    className="w-full h-12 pl-4 pr-12 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || !activeProject || isLoading}
                                    className="absolute right-2 w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                                >
                                    <Send className="w-4 h-4 ml-0.5" />
                                </button>
                            </form>
                            <p className="text-center text-[9px] font-bold text-slate-400 mt-3">
                                Aura peut faire des erreurs. Vérifiez les données critiques.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
