import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    Layers,
    Zap,
    Users,
    Layout,
    BarChart3,
    CheckCircle2,
    Menu,
    X,
    Sparkles,
    Shield,
    Clock,
    ArrowRight,
    Star,
    Globe,
    Bot,
    Workflow,
    Kanban,
    GanttChart,
    MessageSquare,
    Play,
    Database,
    BookOpen,
    HelpCircle,
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    TrendingUp
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { FadeInView } from '../components/ui/FadeInView';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';

/* ============================================================
   LANDING PAGE – VAERDIA ProjectFlow (PREMIUM LIGHT THEME)
   ============================================================ */

export const LandingPage: React.FC = () => {
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
    const [guideTab, setGuideTab] = useState<'basics' | 'tickets' | 'aura'>('basics');
    const [demoStep, setDemoStep] = useState(0);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-primary-100 selection:text-primary-900 font-sans">
            
            {/* ===== NAVBAR ===== */}
            <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 px-6 py-4 ${
                scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-100 py-3 shadow-sm' : 'bg-transparent'
            }`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg shadow-slate-100 group-hover:scale-110 transition-transform duration-300 border border-slate-100 overflow-hidden">
                            <svg viewBox="0 0 100 100" className="w-7 h-7">
                                <defs>
                                    <linearGradient id="logo-gradient-nav" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#2bd8a7', stopOpacity: 1 }} />
                                        <stop offset="50%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                                        <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M30 65c-8 0-15-7-15-15s7-15 15-15c5 0 10 3 13 8l4-7c-5-6-11-10-17-10-14 0-25 11-25 25s11 25 25 25c6 0 12-4 17-10l-4-7c-3 5-8 8-13 8z"
                                    fill="url(#logo-gradient-nav)"
                                />
                                <path
                                    d="M70 35c8 0 15 7 15 15s-7 15-15 15c-5 0-10-3-13-8l-4 7c5 6 11 10 17 10 14 0 25-11 25-25s-11-25-25-25c-6 0-12 4-17 10l4 7c3-5 8-8 13-8z"
                                    fill="url(#logo-gradient-nav)"
                                />
                                <rect x="47" y="25" width="6" height="30" rx="3" fill="#0f172a" />
                                <circle cx="50" cy="18" r="4" fill="#0f172a" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-[0.1em] text-slate-900 font-display uppercase leading-none">
                                VAER<span className="text-emerald-500">DIA</span>
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-10 relative z-[110]">
                        {[
                            { name: 'Fonctionnalités', href: '#features' },
                            { name: 'Guide', onClick: () => setIsGuideModalOpen(true) },
                        ].map((link) => (
                            link.href ? (
                                <a 
                                    key={link.name} 
                                    href={link.href}
                                    className="text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors tracking-wide"
                                >
                                    {link.name}
                                </a>
                            ) : (
                                <button
                                    key={link.name}
                                    onClick={link.onClick}
                                    className="text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors tracking-wide cursor-pointer"
                                >
                                    {link.name}
                                </button>
                            )
                        ))}
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsVideoModalOpen(true);
                            }}
                            className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors tracking-wide cursor-pointer py-2 px-1"
                        >
                            Voir la démo
                        </button>
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-4">
                            Se connecter
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ===== HERO SECTION ===== */}
            <section className="relative pt-40 pb-24 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-primary-50/50 to-transparent -z-10" />
                
                <div className="max-w-7xl mx-auto">
                    <FadeInView className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 border border-primary-200 text-xs font-bold text-primary-700 uppercase tracking-widest mb-8">
                            <Sparkles className="w-4 h-4" /> Propulsé par Aura IA
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[0.9] font-display">
                            Gérez vos projets <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
                                sans limites.
                            </span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                            VAERDIA centralise vos tâches et vos insights IA dans une interface épurée conçue pour la performance brute.
                        </p>
                    </FadeInView>

                    {/* INTERACTIVE BROWSER MOCKUP (LIGHT) */}
                    <FadeInView delay={0.3} className="relative max-w-6xl mx-auto mt-20">
                        <div className="relative rounded-[2.5rem] p-3 bg-white border border-slate-200 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)]">
                            <div className="bg-slate-50 rounded-[2rem] overflow-hidden aspect-[16/10] relative flex border border-slate-100">
                                {/* Sidebar Mockup */}
                                <div className="w-64 bg-white border-r border-slate-100 hidden md:flex flex-col p-6">
                                    <div className="flex items-center gap-3 mb-10">
                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden">
                                            <svg viewBox="0 0 100 100" className="w-5 h-5">
                                                <defs>
                                                    <linearGradient id="logo-gradient-mockup" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" style={{ stopColor: '#2bd8a7', stopOpacity: 1 }} />
                                                        <stop offset="50%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                                                        <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                                                    </linearGradient>
                                                </defs>
                                                <path
                                                    d="M30 65c-8 0-15-7-15-15s7-15 15-15c5 0 10 3 13 8l4-7c-5-6-11-10-17-10-14 0-25 11-25 25s11 25 25 25c6 0 12-4 17-10l-4-7c-3 5-8 8-13 8z"
                                                    fill="url(#logo-gradient-mockup)"
                                                />
                                                <path
                                                    d="M70 35c8 0 15 7 15 15s-7 15-15 15c-5 0-10-3-13-8l-4 7c5 6 11 10 17 10 14 0 25-11 25-25s-11-25-25-25c-6 0-12 4-17 10l4 7c3-5 8-8 13-8z"
                                                    fill="url(#logo-gradient-mockup)"
                                                />
                                                <rect x="47" y="25" width="6" height="30" rx="3" fill="#0f172a" />
                                                <circle cx="50" cy="18" r="4" fill="#0f172a" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-black tracking-tighter uppercase">VAERDIA</span>
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { icon: LayoutDashboard, label: 'Dashboard', active: true },
                                            { icon: FolderKanban, label: 'Projets', active: false },
                                            { icon: CheckSquare, label: 'Tâches', active: false },
                                            { icon: Users, label: 'Équipe', active: false },
                                            { icon: TrendingUp, label: 'Reporting', active: false },
                                            { icon: MessageSquare, label: 'Messages', active: false },
                                        ].map((item) => (
                                            <div key={item.label} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${item.active ? 'bg-primary-50 text-primary-600' : 'text-slate-400'}`}>
                                                <item.icon className="w-5 h-5" />
                                                <span className="text-xs font-bold">{item.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Main Content Mockup */}
                                <div className="flex-1 p-8 overflow-hidden">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900">Projet Alpha - Refonte V2</h3>
                                            <p className="text-xs font-medium text-slate-400">12 tâches · 4 membres actifs</p>
                                        </div>
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-200 shadow-sm`} />
                                            ))}
                                            <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-600 flex items-center justify-center text-[8px] font-bold text-white shadow-sm">+</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {['À FAIRE', 'EN COURS', 'TERMINÉ'].map((col, idx) => (
                                            <div key={col} className="space-y-4">
                                                <div className="flex items-center justify-between px-1">
                                                    <span className="text-[10px] font-black text-slate-400 tracking-widest">{col}</span>
                                                    <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">2</span>
                                                </div>
                                                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
                                                    <div className="w-10 h-1 bg-primary-600/20 rounded-full" />
                                                    <p className="text-xs font-bold text-slate-800">Tâche Critique #{idx + 1}</p>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex -space-x-1">
                                                            <div className="w-5 h-5 rounded-full bg-slate-200 border border-white" />
                                                        </div>
                                                        <div className="text-[8px] px-2 py-0.5 rounded-full bg-slate-100 font-black text-slate-500">PRIORITÉ</div>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3 opacity-50">
                                                    <div className="w-8 h-1 bg-slate-200 rounded-full" />
                                                    <p className="text-xs font-bold text-slate-800">Review PR</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Floating UI Elements (Light Mode) */}
                            <motion.div 
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute -top-6 -right-6 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-5 rounded-3xl border border-slate-100 flex items-center gap-4 z-20"
                            >
                                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center">
                                    <CheckCircle2 className="text-emerald-600 w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">+85% d'efficacité</p>
                                    <p className="text-[10px] text-slate-400 font-medium">vs outils classiques</p>
                                </div>
                            </motion.div>

                            <motion.div 
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                className="absolute -bottom-8 -left-8 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-5 rounded-3xl border border-slate-100 flex items-center gap-4 z-20"
                            >
                                <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center">
                                    <Bot className="text-indigo-600 w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">Aura AI Active</p>
                                    <p className="text-[10px] text-slate-400 font-medium">Automatisation intelligente</p>
                                </div>
                            </motion.div>
                        </div>
                    </FadeInView>
                </div>
            </section>

            {/* ===== TECH STACK ===== */}
            <section className="py-20 px-6 border-t border-slate-100 relative z-10 bg-slate-50">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-12">
                        Technologies au cœur de l'écosystème
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                        {['React', 'NestJS', 'Docker', 'PostgreSQL', 'Redis', 'LLaMA 3.1'].map((name) => (
                            <span key={name} className="text-2xl font-black font-display text-slate-900 tracking-tight hover:text-primary-600 transition-colors cursor-default">
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== STATS ===== */}
            <section className="py-24 px-6 relative z-10 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        <StatCard value={6} suffix="" label="Microservices" delay={0} />
                        <StatCard value={100} suffix="%" label="Dockerisé" delay={0.1} />
                        <StatCard value={1} suffix="" label="IA Aura" delay={0.2} />
                        <StatCard value={3} suffix="" label="Bases de Données" delay={0.3} />
                    </div>
                </div>
            </section>

            {/* ===== FEATURES GRID ===== */}
            <section id="features" className="py-32 px-6 relative z-10 bg-slate-50 border-y border-slate-100">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl font-black font-display text-slate-900 mb-6 tracking-tighter">
                            Tout ce qu'il vous faut.<br />
                            <span className="text-primary-600 text-3xl md:text-5xl">Rien de superflu.</span>
                        </h2>
                        <p className="text-slate-500 max-w-xl mx-auto font-medium">
                            Plus besoin de jongler entre 10 outils. VAERDIA centralise tout dans une interface conçue pour la vitesse.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                        {/* Feature 1 – Performance */}
                        <DarkCard className="p-8 group" delay={0.1}>
                            <div className="w-12 h-12 rounded-xl bg-primary-100 border border-primary-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="text-primary-600 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-3 font-display">Vitesse Inégalée</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-grow">
                                Architecture Serverless optimisée. Chargez vos boards instantanément.
                            </p>
                            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">VAERDIA</span>
                                        <span className="text-xs font-black text-emerald-600">95ms</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} whileInView={{ width: '30%' }} className="h-full bg-emerald-500" />
                                    </div>
                                    <div className="flex justify-between items-center opacity-40">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Concurrent A</span>
                                        <span className="text-xs font-black text-slate-500">350ms</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden opacity-40">
                                        <div className="h-full bg-slate-300 w-[80%]" />
                                    </div>
                                </div>
                            </div>
                        </DarkCard>

                        {/* Feature 2 – Live Collaboration */}
                        <DarkCard className="p-8 group" delay={0.2}>
                            <div className="w-12 h-12 rounded-xl bg-accent-100 border border-accent-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Users className="text-accent-600 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-3 font-display">Collaboration Live</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-grow">
                                Curseur en temps réel, présence et chat intégré.
                            </p>
                            <div className="flex items-center -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                                    </div>
                                ))}
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-primary-100 flex items-center justify-center text-[10px] font-black text-primary-700">
                                    +12
                                </div>
                            </div>
                        </DarkCard>

                        {/* Feature 3 – Views */}
                        <DarkCard className="p-8 group" delay={0.3}>
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Layout className="text-emerald-600 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-3 font-display">Vues Multiples</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-grow">
                                Kanban, Liste, Calendrier ou Dashboard BI.
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {['Kanban', 'List', 'Calendar', 'Gantt'].map(view => (
                                    <div key={view} className="px-3 py-2 rounded-lg bg-white border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                                        {view}
                                    </div>
                                ))}
                            </div>
                        </DarkCard>

                        {/* Feature 4 – Aura IA */}
                        <DarkCard id="aura" className="p-8 overflow-hidden group" delay={0.4}>
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Bot className="text-indigo-600 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-3 font-display">Aura IA Intégrée</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                                Propulsé par LLaMA 3.1. Analyse vos projets automatiquement.
                            </p>
                            <div className="relative bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm overflow-hidden">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
                                        <Sparkles className="text-white w-3 h-3" />
                                    </div>
                                    <span className="text-[10px] font-black text-indigo-900 uppercase">Aura Analyst</span>
                                </div>
                                <p className="text-[10px] text-slate-600 leading-tight">
                                    Alerte : Le projet Alpha risque un dépassement de budget.
                                </p>
                                <div className="mt-3">
                                    <div className="px-3 py-1.5 rounded-lg bg-indigo-600 text-[9px] font-bold text-white inline-block">Générer rapport</div>
                                </div>
                            </div>
                        </DarkCard>
                    </div>
                </div>
            </section>

            {/* ===== APP GUIDE SECTION ===== */}
            <section id="guide" className="py-32 px-6 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1">
                            <FadeInView>
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-8">
                                    <HelpCircle className="w-4 h-4" /> Tutoriel Rapide
                                </div>
                                <h2 className="text-5xl font-black font-display text-slate-900 mb-8 tracking-tighter">
                                    Comment utiliser <br />
                                    <span className="text-primary-600">Vaerdia Flow ?</span>
                                </h2>
                                <div className="space-y-10">
                                    {[
                                        { 
                                            step: '01', 
                                            title: 'Planification Agile', 
                                            desc: 'Organisez vos Sprints, gérez votre Backlog et assignez des points d\'effort pour une visibilité totale sur vos cycles de développement.',
                                            icon: <GanttChart className="w-5 h-5 text-primary-600" />
                                        },
                                        { 
                                            step: '02', 
                                            title: 'Collaboration Client', 
                                            desc: 'Unifiez les retours via notre système de tickets intégré. Communiquez directement avec vos clients au cœur de chaque tâche.',
                                            icon: <MessageSquare className="w-5 h-5 text-accent-600" />
                                        },
                                        { 
                                            step: '03', 
                                            title: 'Insights Prédictifs Aura', 
                                            desc: 'Suivez vos Burndown Charts en temps réel et laissez Aura IA identifier les risques de retard avant qu\'ils ne surviennent.',
                                            icon: <BarChart3 className="w-5 h-5 text-indigo-600" />
                                        },
                                    ].map((item) => (
                                        <div key={item.step} className="flex gap-8 group">
                                            <div className="relative">
                                                <div className="text-4xl font-black text-slate-100 group-hover:text-primary-50 transition-colors font-display">
                                                    {item.step}
                                                </div>
                                                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-white border border-slate-100 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    {item.icon}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">{item.title}</h3>
                                                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </FadeInView>
                        </div>
                        <div className="flex-1 relative">
                            <FadeInView delay={0.3} className="relative z-10">
                                <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-primary-500/20 border border-slate-800">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500" />
                                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                            Aura IA Dashboard
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        {/* Simulated Task */}
                                        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="h-4 w-1/3 bg-primary-600/30 rounded-full" />
                                                <div className="h-4 w-4 bg-primary-600 rounded-md" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-2 w-full bg-slate-700 rounded-full" />
                                                <div className="h-2 w-2/3 bg-slate-700 rounded-full" />
                                            </div>
                                        </div>

                                        {/* Simulated Aura Response */}
                                        <div className="relative pl-12">
                                            <div className="absolute left-0 top-0 w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-900/50">
                                                <Sparkles className="text-white w-4 h-4" />
                                            </div>
                                            <div className="p-4 bg-primary-900/20 rounded-2xl border border-primary-500/20">
                                                <p className="text-[10px] text-primary-200 leading-relaxed font-medium">
                                                    "Analyse terminée. J'ai détecté 3 goulots d'étranglement potentiels dans le Sprint actuel. Voulez-vous que je réassigne les tâches ?"
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="h-16 bg-slate-800/30 rounded-2xl border border-slate-700/30" />
                                            <div className="h-16 bg-slate-800/30 rounded-2xl border border-slate-700/30" />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Overlay Play Button */}
                                <div 
                                    onClick={() => setIsGuideModalOpen(true)}
                                    className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-500 bg-slate-900/20 backdrop-blur-[2px] rounded-[2.5rem] cursor-pointer group"
                                >
                                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                                        <BookOpen className="text-primary-600 w-8 h-8" />
                                    </div>
                                    <div className="absolute bottom-10 bg-white px-6 py-3 rounded-2xl shadow-xl text-primary-600 font-black uppercase tracking-widest text-xs transform translate-y-4 group-hover:translate-y-0 transition-all opacity-0 group-hover:opacity-100">
                                        Ouvrir le Guide Interactif
                                    </div>
                                </div>

                            </FadeInView>
                            {/* Decorative elements */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500 rounded-full blur-[100px] opacity-20" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent-500 rounded-full blur-[100px] opacity-20" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}

            <footer className="py-24 px-6 border-t border-slate-100 relative z-10 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                    <div className="relative mb-10 group">
                        <div className="absolute inset-0 bg-primary-100 blur-[80px] rounded-full opacity-50" />
                        <div className="relative flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden">
                                <svg viewBox="0 0 100 100" className="w-10 h-10">
                                    <defs>
                                        <linearGradient id="logo-gradient-footer" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#2bd8a7', stopOpacity: 1 }} />
                                            <stop offset="50%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                                            <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M30 65c-8 0-15-7-15-15s7-15 15-15c5 0 10 3 13 8l4-7c-5-6-11-10-17-10-14 0-25 11-25 25s11 25 25 25c6 0 12-4 17-10l-4-7c-3 5-8 8-13 8z"
                                        fill="url(#logo-gradient-footer)"
                                    />
                                    <path
                                        d="M70 35c8 0 15 7 15 15s-7 15-15 15c-5 0-10-3-13-8l-4 7c5 6 11 10 17 10 14 0 25-11 25-25s-11-25-25-25c-6 0-12 4-17 10l4 7c3-5 8-8 13-8z"
                                        fill="url(#logo-gradient-footer)"
                                    />
                                    <rect x="47" y="25" width="6" height="30" rx="3" fill="#0f172a" />
                                    <circle cx="50" cy="18" r="4" fill="#0f172a" />
                                </svg>
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-3xl font-black tracking-[0.1em] text-slate-900 font-display uppercase leading-none">
                                    VAER<span className="text-emerald-500">DIA</span>
                                </span>

                            </div>
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-md mb-12 font-medium">
                        La plateforme de gestion de projet intelligente. <br />
                        Conçue pour les équipes qui bâtissent le monde de demain.
                    </p>
                    <div className="w-full pt-10 border-t border-slate-100">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
                            © 2026 VAERDIA · Tous droits réservés
                        </p>
                    </div>
                </div>
            </footer>

            {/* ===== GUIDE INTERACTIF MODAL ===== */}
            <AnimatePresence>
                {isGuideModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[250] flex items-center justify-center p-4 md:p-10 bg-slate-900/60 backdrop-blur-xl"
                    >
                        <div className="absolute inset-0 cursor-pointer" onClick={() => setIsGuideModalOpen(false)} />
                        
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col md:flex-row h-[80vh]"
                        >
                            {/* Modal Sidebar */}
                            <div className="w-full md:w-72 bg-slate-50 border-r border-slate-100 p-8 flex flex-col">
                                <div className="flex items-center gap-3 mb-12">
                                    <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-200">
                                        <BookOpen className="text-white w-6 h-6" />
                                    </div>
                                    <span className="text-xl font-black tracking-tighter uppercase">Guide</span>
                                </div>

                                <nav className="space-y-2 flex-1">
                                    {[
                                        { id: 'basics', label: 'Espace & Sprints', icon: Kanban },
                                        { id: 'tickets', label: 'Support Client', icon: MessageSquare },
                                        { id: 'aura', label: 'IA Aura', icon: Sparkles },
                                        { id: 'bi', label: 'Analytics & Pilotage', icon: BarChart3 },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setGuideTab(tab.id as any)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                                                guideTab === tab.id ? 'bg-white shadow-md text-primary-600 border border-slate-100' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                                            }`}
                                        >
                                            <tab.icon className="w-5 h-5" />
                                            {tab.label}
                                        </button>
                                    ))}
                                </nav>

                                <button 
                                    onClick={() => setIsGuideModalOpen(false)}
                                    className="mt-8 w-full py-4 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-xl shadow-slate-200"
                                >
                                    J'ai compris
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-12 bg-white">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={guideTab}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        {guideTab === 'basics' && (
                                            <>
                                                <h2 className="text-4xl font-black text-slate-900 leading-tight">Excellence Opérationnelle</h2>
                                                <p className="text-slate-500 font-medium text-lg leading-relaxed">
                                                    Maîtrisez la hiérarchie de Vaerdia Flow pour une organisation sans faille : Espace de Travail &gt; Projets &gt; Sprints &gt; Tâches.
                                                </p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                                    <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm">
                                                        <h4 className="text-slate-900 font-bold mb-3 flex items-center gap-2">
                                                            <Workflow className="w-4 h-4 text-primary-600" />
                                                            Cycle de Vie Agile
                                                        </h4>
                                                        <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                                            Transformez vos idées brutes du Backlog en livrables concrets via des Sprints structurés. La gestion par points permet un suivi précis de la vélocité.
                                                        </p>
                                                    </div>
                                                    <div className="p-8 bg-primary-50 rounded-[2rem] border border-primary-100 shadow-sm">
                                                        <h4 className="text-primary-900 font-bold mb-3 flex items-center gap-2">
                                                            <Bot className="w-4 h-4 text-primary-700" />
                                                            Stratégie de Tâches
                                                        </h4>
                                                        <p className="text-primary-700 text-sm leading-relaxed font-medium">
                                                            Catégorisez vos efforts (Bug, Story, Tâche) pour une lecture immédiate de la santé de votre projet et une priorisation intelligente.
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {guideTab === 'tickets' && (
                                            <>
                                                <h2 className="text-4xl font-black text-slate-900 leading-tight">Relation Client Unifiée</h2>
                                                <p className="text-slate-500 font-medium text-lg leading-relaxed">
                                                    Éliminez les frictions de communication. Notre portail centralise les besoins de vos partenaires pour une réactivité maximale.
                                                </p>
                                                <div className="space-y-4">
                                                    {[
                                                        { title: "Standardisation des flux", desc: "Conversion automatique des demandes clients en unités de travail techniques." },
                                                        { title: "Transparence totale", desc: "Suivi en temps réel de l'état d'avancement pour rassurer vos donneurs d'ordres." },
                                                        { title: "Communication synchrone", desc: "Échanges instantanés via WebSocket pour une résolution accélérée des points de blocage." },
                                                    ].map((item, i) => (
                                                        <div key={i} className="flex items-start gap-6 p-6 rounded-[2rem] border border-slate-100 hover:border-primary-200 transition-all group bg-white shadow-sm hover:shadow-md">
                                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-primary-600 group-hover:text-white transition-all shrink-0">{i+1}</div>
                                                            <div>
                                                                 <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                                                                 <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                                             </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                        {guideTab === 'aura' && (
                                            <>
                                                <h2 className="text-4xl font-black text-slate-900 leading-tight">Intelligence Assistée</h2>
                                                <p className="text-slate-500 font-medium text-lg leading-relaxed">
                                                    Aura n'est pas qu'un assistant, c'est le moteur cognitif de votre projet, capable d'analyser vos données en temps réel.
                                                </p>
                                                <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
                                                    <Sparkles className="absolute -right-16 -bottom-16 w-64 h-64 text-primary-500/10 rotate-12" />
                                                    <div className="relative z-10 space-y-8">
                                                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600/20 text-primary-400 border border-primary-500/30 text-[10px] font-black uppercase tracking-widest">
                                                            Contextual Analysis Engine
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                            <div className="space-y-4">
                                                                <h4 className="text-xl font-bold">Analyse Contextuelle</h4>
                                                                <p className="text-slate-400 text-sm leading-relaxed">
                                                                    Aura scanne vos données de projet pour identifier les risques critiques et suggérer des actions correctives immédiates.
                                                                </p>
                                                            </div>
                                                            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                                                <p className="text-xs text-primary-300 font-medium italic mb-2">Prompt conseillé :</p>
                                                                <p className="text-sm text-white font-bold leading-relaxed">
                                                                    "Identifie les dépendances critiques qui pourraient retarder le prochain jalon."
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {guideTab === 'bi' && (
                                            <>
                                                <h2 className="text-4xl font-black text-slate-900 leading-tight">Pilotage Stratégique</h2>
                                                <p className="text-slate-500 font-medium text-lg leading-relaxed">
                                                    Transformez vos données brutes en leviers de décision grâce à nos outils de haute précision.
                                                </p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                                    <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">
                                                            <BarChart3 className="text-emerald-600 w-6 h-6" />
                                                        </div>
                                                        <h4 className="text-slate-900 font-black mb-3 font-display">Vélocité & Burndown</h4>
                                                        <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                                            Suivez l'effort consommé en temps réel pour une prédictibilité totale sur vos dates de livraison.
                                                        </p>
                                                    </div>
                                                    <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
                                                            <Database className="w-6 h-6 text-indigo-600" />
                                                        </div>
                                                        <h4 className="text-slate-900 font-black mb-3 font-display">Rapports de Gouvernance</h4>
                                                        <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                                            Générez des rapports PDF exhaustifs pour vos comités de pilotage, centralisant KPIs et santé du projet.
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== VIDEO/DEMO MODAL ===== */}
            <AnimatePresence>
                {isVideoModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-slate-900/40 backdrop-blur-md"
                    >
                        <div className="absolute inset-0 cursor-pointer" onClick={() => setIsVideoModalOpen(false)} />
                        
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-6xl aspect-video bg-white rounded-[2rem] border border-slate-200 shadow-[0_40px_100px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col"
                        >
                            <div className="absolute top-0 w-full h-14 bg-gradient-to-b from-white/80 to-transparent z-[210] flex items-center justify-end px-6">
                                <button 
                                    onClick={() => setIsVideoModalOpen(false)}
                                    className="w-10 h-10 rounded-full bg-white/50 hover:bg-white flex items-center justify-center text-slate-900 transition-colors border border-slate-200 shadow-sm"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-hidden relative group bg-slate-50">
                                <iframe 
                                    src="/login" 
                                    title="Vaerdia Live Demo"
                                    className="w-full h-full border-0"
                                    style={{ background: 'white' }}
                                />
                                
                                <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-xl z-[220]">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Live Preview Active</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ===== LOCAL COMPONENTS ===== */

const DarkCard: React.FC<{ id?: string; className?: string; delay?: number; children: React.ReactNode }> = ({ id, className = '', delay = 0, children }) => (
    <FadeInView delay={delay} className="h-full">
        <motion.div
            id={id}
            whileHover={{ y: -5, boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.05)' }}
            transition={{ duration: 0.3 }}
            className={`h-full bg-white rounded-[2.5rem] border border-slate-100 hover:border-primary-100 transition-all flex flex-col shadow-sm ${className}`}
        >
            {children}
        </motion.div>
    </FadeInView>
);

const StatCard: React.FC<{ value: number; suffix: string; label: string; delay: number }> = ({ value, suffix, label, delay }) => (
    <FadeInView delay={delay} className="text-center">
        <AnimatedCounter value={value} suffix={suffix} label={label} />
    </FadeInView>
);
