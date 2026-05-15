import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, User, Loader2, AlertCircle, History, Plus, FileText, Activity } from 'lucide-react';
import { useAuraStore } from '../../store/auraStore';
import { useStore } from '../../store/projectStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AuraReportList } from './AuraReportList';
import { auraService } from '../../api/aura.service';

export const AuraChatPanel: React.FC = () => {
    const { isOpen, toggleOpen, getMessages, isLoading, sendMessage } = useAuraStore();
    const { state } = useStore();
    const [inputValue, setInputValue] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const actionsRef = useRef<HTMLDivElement>(null);
    
    const activeProject = state.projects.find(p => p.id === state.selectedProjectId) || state.projects[0];
    const messages = activeProject ? getMessages(activeProject.id) : [];

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!showHistory) {
            scrollToBottom();
        }
    }, [messages, isLoading, isOpen, showHistory]);

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

    const handleGenerateReport = async () => {
        if (!activeProject || isGenerating) return;
        setIsGenerating(true);
        setShowActions(false);
        try {
            await auraService.getReport(activeProject.id);
            // Optionally add a message to chat or show a success notification, here we just switch to history
            setShowHistory(true);
        } catch (error) {
            console.error("Failed to generate report", error);
        } finally {
            setIsGenerating(false);
        }
    };

    // Close actions menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
                setShowActions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                    
                    {/* Drawer - Sleek Light Theme */}
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
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <h2 className="text-sm font-black text-slate-900 tracking-tight">Aura IA</h2>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => setShowHistory(!showHistory)}
                                    className={`p-2 rounded-xl transition-colors ${showHistory ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                                    title="Historique des rapports"
                                >
                                    <History className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={toggleOpen}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Project Context Warning */}
                        {!activeProject && (
                            <div className="mx-4 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200/50 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                                <p className="text-xs text-amber-700 font-medium">Vous devez sélectionner un projet actif pour voir les analyses d'Aura.</p>
                            </div>
                        )}

                        {activeProject && (
                            <div className="px-4 py-2 mt-4 bg-slate-50 border-y border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{showHistory ? 'Historique' : 'Analyse de'}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-widest">{activeProject.name}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-hidden flex flex-col relative">
                            {showHistory ? (
                                <AuraReportList projectId={activeProject?.id || ''} />
                            ) : (
                                <>
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
                                                    {msg.role === 'aura' ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                                </div>
                                                
                                                {/* Bubble */}
                                                <div className={`max-w-[85%] rounded-2xl p-4 text-[13px] shadow-sm leading-relaxed ${
                                                    msg.role === 'user'
                                                        ? 'bg-slate-900 text-white rounded-tr-none shadow-slate-200/50'
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
                                                    <Sparkles className="w-4 h-4" />
                                                </div>
                                                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Analyse en cours...</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input Area */}
                                    <div className="p-4 border-t border-slate-100 bg-white">
                                        <div className="relative flex items-center gap-2">
                                            {/* Plus button & Dropdown */}
                                            {activeProject && (
                                                <div className="relative" ref={actionsRef}>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setShowActions(!showActions)}
                                                        disabled={isLoading}
                                                        className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-colors ${showActions ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
                                                    >
                                                        <Plus className={`w-5 h-5 transition-transform ${showActions ? 'rotate-45' : ''}`} />
                                                    </button>
                                                    
                                                    {/* Dropdown Menu */}
                                                    <AnimatePresence>
                                                        {showActions && (
                                                            <motion.div 
                                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                className="absolute bottom-full left-0 mb-3 w-64 bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 rounded-2xl p-2 z-50 overflow-hidden"
                                                            >
                                                                <button 
                                                                    onClick={handleGenerateReport}
                                                                    disabled={isGenerating}
                                                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50 transition-colors text-left disabled:opacity-50 group"
                                                                >
                                                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <span className="block font-bold">Générer Rapport Hebdo</span>
                                                                        <span className="text-[10px] text-slate-400">Créer une synthèse de la semaine</span>
                                                                    </div>
                                                                </button>
                                                                <button 
                                                                    onClick={() => { setShowActions(false); setShowHistory(true); }}
                                                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left mt-1 group"
                                                                >
                                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                                                                        <FileText className="w-4 h-4" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <span className="block font-bold">Consulter les rapports</span>
                                                                        <span className="text-[10px] text-slate-400">Historique, PDF, partages</span>
                                                                    </div>
                                                                </button>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )}

                                            <form onSubmit={handleSubmit} className="relative flex-1 flex items-center">
                                                <input 
                                                    type="text"
                                                    value={inputValue}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    placeholder={activeProject ? "Demandez à Aura..." : "Sélectionnez un projet..."}
                                                    disabled={!activeProject || isLoading}
                                                    className="w-full h-12 pl-4 pr-12 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 transition-all text-sm text-slate-900 outline-none disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-400"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!inputValue.trim() || !activeProject || isLoading}
                                                    className="absolute right-2 w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-200"
                                                >
                                                    <Send className="w-4 h-4 ml-0.5" />
                                                </button>
                                            </form>
                                        </div>
                                        <p className="text-center text-[9px] font-black text-slate-400 mt-3 uppercase tracking-widest">
                                            Aura IA Intelligence · Vaerdia
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
