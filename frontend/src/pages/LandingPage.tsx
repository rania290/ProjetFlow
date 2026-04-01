import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
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
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { FadeInView } from '../components/ui/FadeInView';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';

/* ============================================================
   LANDING PAGE – VAERDIA ProjectFlow
   Premium LIGHT design
   ============================================================ */

export const LandingPage: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const { scrollYProgress } = useScroll();
    const navBg = useTransform(scrollYProgress, [0, 0.05], [0, 1]);
    const [navOpacity, setNavOpacity] = React.useState(0);

    React.useEffect(() => {
        return navBg.on('change', (v) => setNavOpacity(v));
    }, [navBg]);

    return (
        <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-primary-100 selection:text-primary-700">

            {/* ===== SUBTLE BACKGROUND GRADIENTS ===== */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-[80%] h-[60%] rounded-full opacity-30"
                    style={{ background: 'radial-gradient(ellipse at 20% 10%, rgba(92,124,250,0.12) 0%, transparent 60%)' }} />
                <div className="absolute bottom-0 right-0 w-[60%] h-[50%] rounded-full opacity-20"
                    style={{ background: 'radial-gradient(ellipse at 80% 90%, rgba(190,75,219,0.1) 0%, transparent 60%)' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[40%] opacity-15"
                    style={{ background: 'radial-gradient(ellipse, rgba(92,124,250,0.08) 0%, transparent 70%)' }} />
            </div>

            {/* ===== NAVIGATION ===== */}
            <motion.nav className="fixed top-0 w-full z-50">
                <div
                    className="mx-4 md:mx-8 mt-4 rounded-2xl transition-all duration-500"
                    style={{
                        background: navOpacity > 0.1
                            ? `rgba(255, 255, 255, ${0.85 + navOpacity * 0.15})`
                            : 'rgba(255,255,255,0)',
                        backdropFilter: navOpacity > 0.1 ? `blur(20px)` : 'none',
                        border: navOpacity > 0.1 ? `1px solid rgba(92,124,250,${0.08 + navOpacity * 0.08})` : '1px solid transparent',
                        boxShadow: navOpacity > 0.3 ? '0 4px 24px rgba(92,124,250,0.08), 0 1px 0 rgba(0,0,0,0.04)' : 'none',
                    }}
                >
                    <div className="max-w-7xl mx-auto px-6 h-16 md:h-18 flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="relative w-9 h-9">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity shadow-lg shadow-primary-500/30" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Layers className="text-white w-5 h-5" />
                                </div>
                            </div>
                            <span className="text-lg font-bold font-display tracking-tight text-slate-900">
                                VAERDIA
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-1">
                            {['Produit', 'Solutions', 'Entreprise', 'Tarifs'].map((item) => (
                                <Link
                                    key={item}
                                    to="#"
                                    className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all duration-200"
                                >
                                    {item}
                                </Link>
                            ))}
                        </div>

                        {/* Desktop CTA */}
                        <div className="hidden md:flex items-center gap-3">
                            <Link to="/login">
                                <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                                    Se connecter
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/25 border-0 text-white">
                                    Commencer gratuitement
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-700"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:hidden mx-4 mt-2 rounded-2xl bg-white border border-slate-200 shadow-xl p-6 space-y-3"
                    >
                        {['Produit', 'Solutions', 'Entreprise', 'Tarifs'].map((item) => (
                            <Link key={item} to="#" className="block px-4 py-3 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                                {item}
                            </Link>
                        ))}
                        <div className="pt-4 border-t border-slate-100 space-y-3">
                            <Link to="/login" className="block"><Button variant="ghost" className="w-full text-slate-700">Se connecter</Button></Link>
                            <Link to="/register" className="block"><Button className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white">Commencer gratuitement</Button></Link>
                        </div>
                    </motion.div>
                )}
            </motion.nav>

            {/* ===== HERO ===== */}
            <section className="relative pt-36 pb-20 md:pt-52 md:pb-32 px-6 z-10">
                <div className="max-w-7xl mx-auto text-center">

                    {/* Badge */}
                    <FadeInView delay={0.1}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-200 mb-8 group hover:border-primary-300 transition-colors cursor-default">
                            <Sparkles className="w-4 h-4 text-primary-500" />
                            <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
                                Nouvelle version 2.0
                            </span>
                            <ChevronRight className="w-3 h-3 text-primary-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </FadeInView>

                    {/* Heading */}
                    <FadeInView delay={0.2}>
                        <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[6.5rem] font-black font-display mb-8 tracking-tight leading-[0.95] text-slate-900">
                            Gérez vos projets
                            <br />
                            <span className="gradient-text">sans limites.</span>
                        </h1>
                    </FadeInView>

                    {/* Sub-heading */}
                    <FadeInView delay={0.3}>
                        <p className="text-base md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
                            VAERDIA ProjectFlow centralise planification, suivi et collaboration.{' '}
                            <span className="text-slate-700 font-medium">Plus rapide, plus flexible, plus puissant que tout ce que vous avez utilisé avant.</span>
                        </p>
                    </FadeInView>

                    {/* CTA */}
                    <FadeInView delay={0.4} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register">
                            <Button size="lg" className="h-14 px-10 text-base font-bold bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-xl shadow-primary-500/25 group border-0 text-white">
                                <Sparkles className="mr-2 w-5 h-5" />
                                Essai gratuit 14 jours
                                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Button variant="outline" size="lg" className="h-14 px-10 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300">
                            <svg className="mr-2 w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
                            Voir la démo
                        </Button>
                    </FadeInView>

                    {/* Social proof */}
                    <FadeInView delay={0.5}>
                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400">
                            <div className="flex -space-x-2">
                                {[
                                    'bg-gradient-to-br from-blue-400 to-blue-600',
                                    'bg-gradient-to-br from-emerald-400 to-emerald-600',
                                    'bg-gradient-to-br from-amber-400 to-amber-600',
                                    'bg-gradient-to-br from-rose-400 to-rose-600',
                                    'bg-gradient-to-br from-violet-400 to-violet-600',
                                ].map((bg, i) => (
                                    <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}>
                                        {['A', 'M', 'S', 'K', 'R'][i]}
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ))}
                                <span className="ml-2 text-slate-500">
                                    Noté <span className="text-slate-800 font-semibold">4.9/5</span> par +10 000 équipes
                                </span>
                            </div>
                        </div>
                    </FadeInView>

                    {/* ===== PLATFORM PREVIEW ===== */}
                    <FadeInView delay={0.7} className="mt-20 relative">
                        <div className="relative mx-auto max-w-6xl">
                            {/* Glow */}
                            <div className="absolute inset-0 -m-10 bg-gradient-to-b from-primary-500/08 via-accent-500/04 to-transparent rounded-[60px] blur-3xl pointer-events-none" />

                            <div className="relative rounded-3xl border border-slate-200 p-1.5 bg-white shadow-[0_24px_80px_rgba(92,124,250,0.12)] overflow-hidden">
                                <div className="rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden shadow-inner">
                                    {/* Tab bar */}
                                    <div className="flex items-center px-5 py-3 border-b border-slate-100 bg-white">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-400/70" />
                                            <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                                            <div className="w-3 h-3 rounded-full bg-emerald-400/70" />
                                        </div>
                                        <div className="flex-1 flex justify-center">
                                            <div className="px-4 py-1 rounded-lg bg-slate-100 text-[11px] text-slate-400 font-mono">
                                                app.vaerdia.com/dashboard
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dashboard Content */}
                                    <div className="flex" style={{ minHeight: '420px' }}>
                                        {/* Sidebar */}
                                        <div className="hidden md:flex w-56 border-r border-slate-100 bg-white flex-col p-4 gap-1">
                                            <div className="flex items-center gap-3 px-3 py-2 mb-4">
                                                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                                                    <Layers className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-800">VAERDIA</span>
                                            </div>
                                            {[
                                                { icon: <Layout className="w-4 h-4" />, label: 'Dashboard', active: true },
                                                { icon: <Kanban className="w-4 h-4" />, label: 'Board', active: false },
                                                { icon: <GanttChart className="w-4 h-4" />, label: 'Timeline', active: false },
                                                { icon: <Users className="w-4 h-4" />, label: 'Équipe', active: false },
                                                { icon: <BarChart3 className="w-4 h-4" />, label: 'Analytics', active: false },
                                                { icon: <MessageSquare className="w-4 h-4" />, label: 'Messages', active: false },
                                            ].map(({ icon, label, active }) => (
                                                <div key={label} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${active ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                                                    {icon}
                                                    {label}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Main area */}
                                        <div className="flex-1 p-6 md:p-8 space-y-6 overflow-hidden bg-slate-50/60">
                                            {/* Header row */}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-lg font-bold text-slate-800 mb-1">Projet Alpha</div>
                                                    <div className="text-xs text-slate-400">12 tâches · 4 membres</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex -space-x-2">
                                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white" />
                                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-white" />
                                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-white" />
                                                    </div>
                                                    <div className="h-8 px-3 rounded-lg bg-primary-50 text-primary-600 text-xs font-semibold flex items-center gap-1 border border-primary-100">
                                                        <Zap className="w-3 h-3" /> Sprint 4
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Kanban columns */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {[
                                                    {
                                                        title: 'À faire', color: 'bg-slate-400', cards: [
                                                            { t: 'Refonte UX checkout', tag: 'Design', tagColor: 'text-violet-600 bg-violet-50 border-violet-100' },
                                                            { t: 'API v2 endpoints', tag: 'Backend', tagColor: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                                                        ]
                                                    },
                                                    {
                                                        title: 'En cours', color: 'bg-primary-500', cards: [
                                                            { t: 'Dashboard analytics', tag: 'Frontend', tagColor: 'text-blue-600 bg-blue-50 border-blue-100' },
                                                            { t: 'Tests E2E sprint', tag: 'QA', tagColor: 'text-amber-600 bg-amber-50 border-amber-100' },
                                                        ]
                                                    },
                                                    {
                                                        title: 'Terminé', color: 'bg-emerald-500', cards: [
                                                            { t: 'Auth SSO Google', tag: 'Sécurité', tagColor: 'text-rose-600 bg-rose-50 border-rose-100' },
                                                        ]
                                                    },
                                                ].map(({ title, color, cards }) => (
                                                    <div key={title} className="space-y-3">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className={`w-2 h-2 rounded-full ${color}`} />
                                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
                                                            <span className="ml-auto text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{cards.length}</span>
                                                        </div>
                                                        {cards.map(({ t, tag, tagColor }) => (
                                                            <div key={t} className="p-3 rounded-xl border border-slate-200 bg-white hover:shadow-md hover:border-primary-200 transition-all space-y-2 cursor-default">
                                                                <div className="text-sm font-medium text-slate-700">{t}</div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tagColor}`}>{tag}</span>
                                                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border border-white shadow-sm" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Cards */}
                            <div className="absolute -top-8 -right-6 hidden lg:block z-20">
                                <motion.div
                                    animate={{ y: [0, -12, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                                    className="bg-white border border-slate-200 shadow-xl p-4 rounded-2xl flex items-center gap-4"
                                >
                                    <div className="w-11 h-11 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
                                        <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">+85% efficacité</p>
                                        <p className="text-[11px] text-slate-400">vs outils classiques</p>
                                    </div>
                                </motion.div>
                            </div>

                            <div className="absolute -bottom-6 -left-6 hidden lg:block z-20">
                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                    className="bg-white border border-slate-200 shadow-xl p-4 rounded-2xl flex items-center gap-4"
                                >
                                    <div className="w-11 h-11 bg-primary-50 border border-primary-100 rounded-xl flex items-center justify-center">
                                        <Bot className="text-primary-500 w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">IA intégrée</p>
                                        <p className="text-[11px] text-slate-400">Automatisation intelligente</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </FadeInView>
                </div>
            </section>

            {/* ===== TRUSTED BY ===== */}
            <section className="py-16 px-6 border-t border-slate-100 relative z-10 bg-slate-50/50">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em] mb-10">
                        Adopté par les équipes les plus ambitieuses
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-6 opacity-50">
                        {['Google', 'Microsoft', 'Stripe', 'Vercel', 'Spotify', 'Notion'].map((name) => (
                            <span key={name} className="text-xl font-bold font-display text-slate-400 tracking-tight hover:text-slate-600 transition-colors cursor-default">
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== STATS ===== */}
            <section className="py-20 px-6 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        <StatCard value={10000} suffix="+" label="Équipes actives" delay={0} />
                        <StatCard value={99} suffix="%" label="Uptime garanti" delay={0.1} />
                        <StatCard value={50} suffix="M" label="Tâches créées" delay={0.2} />
                        <StatCard value={150} suffix="+" label="Pays couverts" delay={0.3} />
                    </div>
                </div>
            </section>

            {/* ===== FEATURES GRID ===== */}
            <section className="py-24 px-6 relative z-10 bg-slate-50/60">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <FadeInView>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-xs font-semibold text-primary-600 uppercase tracking-wider mb-6">
                                <Zap className="w-3 h-3" /> Fonctionnalités
                            </div>
                        </FadeInView>
                        <FadeInView delay={0.1}>
                            <h2 className="text-4xl md:text-6xl font-black font-display mb-6 tracking-tight text-slate-900">
                                Tout ce qu'il vous faut.
                                <br />
                                <span className="text-slate-400">Rien de superflu.</span>
                            </h2>
                        </FadeInView>
                        <FadeInView delay={0.2}>
                            <p className="text-slate-500 max-w-xl mx-auto text-lg">
                                Plus besoin de jongler entre 10 outils différents. VAERDIA centralise tout votre flux de travail en un seul endroit.
                            </p>
                        </FadeInView>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* Feature 1 – Large */}
                        <LightCard className="lg:col-span-2 p-8 md:p-10" delay={0.1}>
                            <div className="flex flex-col md:flex-row md:items-center gap-8">
                                <div className="flex-1">
                                    <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-6">
                                        <Zap className="text-amber-500 w-7 h-7" />
                                    </div>
                                    <h3 className="text-2xl font-bold font-display mb-3 text-slate-900">Vitesse éclair</h3>
                                    <p className="text-slate-500 leading-relaxed">
                                        Optimisé pour la rapidité extrême. Chargez vos boards instantanément, même avec des milliers de tâches et d'énormes équipes.
                                    </p>
                                </div>
                                <div className="flex-shrink-0 w-full md:w-52">
                                    <div className="space-y-3">
                                        {[
                                            { label: 'VAERDIA', val: 95, color: 'from-primary-500 to-accent-500' },
                                            { label: 'Outil A', val: 40, color: 'from-slate-200 to-slate-300' },
                                            { label: 'Outil B', val: 55, color: 'from-slate-200 to-slate-300' },
                                        ].map(({ label, val, color }) => (
                                            <div key={label}>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-slate-600">{label}</span>
                                                    <span className="text-slate-400">{val}ms</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${val}%` }}
                                                        viewport={{ once: true }}
                                                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                                                        className={`h-full rounded-full bg-gradient-to-r ${color}`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </LightCard>

                        {/* Feature 2 */}
                        <LightCard className="p-8" delay={0.2}>
                            <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center mb-6">
                                <Users className="text-primary-500 w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold font-display mb-3 text-slate-900">Collaboration Temps Réel</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Assignez, commentez, partagez. Tout en temps réel, sans latence. Comme si votre équipe était dans la même pièce.
                            </p>
                            <div className="mt-6 flex -space-x-2">
                                {['from-blue-400 to-blue-600', 'from-emerald-400 to-emerald-600', 'from-rose-400 to-rose-600'].map((c, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ scale: 0, opacity: 0 }}
                                        whileInView={{ scale: 1, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                        className={`w-9 h-9 rounded-full bg-gradient-to-br ${c} border-2 border-white shadow-sm`}
                                    />
                                ))}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.8 }}
                                    className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-500 font-bold shadow-sm"
                                >
                                    +12
                                </motion.div>
                            </div>
                        </LightCard>

                        {/* Feature 3 */}
                        <LightCard className="p-8" delay={0.3}>
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6">
                                <Layout className="text-emerald-500 w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold font-display mb-3 text-slate-900">Vues Multiples</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Kanban, Gantt, Liste, Calendrier. Visualisez votre travail exactement comme vous le souhaitez.
                            </p>
                            <div className="mt-6 flex gap-2">
                                {[
                                    { icon: <Kanban className="w-4 h-4" />, active: true },
                                    { icon: <GanttChart className="w-4 h-4" />, active: false },
                                    { icon: <BarChart3 className="w-4 h-4" />, active: false },
                                ].map(({ icon, active }, i) => (
                                    <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-primary-100 text-primary-600 border border-primary-200' : 'bg-slate-100 text-slate-400 hover:text-slate-600 border border-slate-100'}`}>
                                        {icon}
                                    </div>
                                ))}
                            </div>
                        </LightCard>

                        {/* Feature 4 – Large */}
                        <LightCard className="lg:col-span-2 p-8 md:p-10" delay={0.4}>
                            <div className="flex flex-col md:flex-row md:items-center gap-8">
                                <div className="flex-1">
                                    <div className="w-14 h-14 rounded-2xl bg-accent-50 border border-accent-100 flex items-center justify-center mb-6"
                                        style={{ backgroundColor: 'rgba(190,75,219,0.06)', borderColor: 'rgba(190,75,219,0.15)' }}>
                                        <Bot className="text-accent-500 w-7 h-7" />
                                    </div>
                                    <h3 className="text-2xl font-bold font-display mb-3 text-slate-900">Intelligence Artificielle</h3>
                                    <p className="text-slate-500 leading-relaxed">
                                        Notre IA comprend vos projets. Elle prédit les blocages, suggère des optimisations et automatise les workflows répétitifs.
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    <div className="w-full md:w-64 rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 shadow-sm">
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <Bot className="w-3 h-3 text-accent-500" />
                                            <span>VAERDIA AI</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-600 shadow-sm">
                                            Le sprint 4 risque un retard de 2 jours. Je suggère de réaffecter la tâche "API v2" à Sara.
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="px-3 py-1.5 rounded-lg bg-primary-500 text-white text-[11px] font-semibold cursor-default hover:bg-primary-600 transition-colors">
                                                Appliquer
                                            </div>
                                            <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-semibold cursor-default hover:bg-slate-200 transition-colors">
                                                Ignorer
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </LightCard>

                        {/* Feature 5 */}
                        <LightCard className="p-8" delay={0.5}>
                            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-6">
                                <BarChart3 className="text-rose-500 w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold font-display mb-3 text-slate-900">Analyses Profondes</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Suivez la vélocité, les burn-down charts et les performances avec des rapports automatiques en temps réel.
                            </p>
                        </LightCard>

                        {/* Feature 6 */}
                        <LightCard className="p-8" delay={0.55}>
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6">
                                <Layers className="text-indigo-500 w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold font-display mb-3 text-slate-900">Scalabilité Totale</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                De 5 à 5 000 utilisateurs sans perte de performance. Architecture distribuée de dernière génération.
                            </p>
                        </LightCard>

                        {/* Feature 7 */}
                        <LightCard className="p-8" delay={0.6}>
                            <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-6">
                                <Workflow className="text-sky-500 w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold font-display mb-3 text-slate-900">Automatisations</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Workflows personnalisables sans code. Laissez les robots gérer le travail répétitif pour vous.
                            </p>
                        </LightCard>
                    </div>
                </div>
            </section>

            {/* ===== TESTIMONIALS ===== */}
            <section className="py-24 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <FadeInView>
                            <h2 className="text-4xl md:text-5xl font-black font-display mb-4 tracking-tight text-slate-900">
                                Ils nous font confiance
                            </h2>
                        </FadeInView>
                        <FadeInView delay={0.1}>
                            <p className="text-slate-500 text-lg">Ce que disent nos utilisateurs les plus fidèles.</p>
                        </FadeInView>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                quote: "VAERDIA a transformé notre façon de travailler. Nous avons réduit notre temps de livraison de 40% en 3 mois.",
                                name: 'Sophie Martin',
                                role: 'VP Engineering, TechCorp',
                                avatar: 'from-blue-400 to-blue-600',
                            },
                            {
                                quote: "Après avoir testé de nombreux outils, VAERDIA est le seul qui a convaincu toute l'équipe dès le premier jour.",
                                name: 'Karim Benzarti',
                                role: 'CTO, StartupFlow',
                                avatar: 'from-emerald-400 to-emerald-600',
                            },
                            {
                                quote: "L'IA intégrée est un game-changer. Elle anticipe les problèmes avant même qu'on les identifie nous-mêmes.",
                                name: 'Laura Chen',
                                role: 'Chef de Projet, DesignStudio',
                                avatar: 'from-rose-400 to-rose-600',
                            },
                        ].map(({ quote, name, role, avatar }, i) => (
                            <LightCard key={name} className="p-8" delay={0.1 + i * 0.1}>
                                <div className="flex mb-4">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-slate-600 leading-relaxed mb-8 text-sm italic">
                                    "{quote}"
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatar} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                                        {name[0]}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-800">{name}</div>
                                        <div className="text-xs text-slate-400">{role}</div>
                                    </div>
                                </div>
                            </LightCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA SECTION ===== */}
            <section className="py-32 px-6 relative z-10">
                <div className="max-w-4xl mx-auto relative">
                    <FadeInView>
                        <div className="relative rounded-[40px] overflow-hidden"
                            style={{ background: 'linear-gradient(135deg, #4c6ef5 0%, #be4bdb 50%, #4263eb 100%)' }}>
                            <div className="absolute inset-0 opacity-20"
                                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")" }} />
                            <div className="relative p-12 md:p-20 text-center text-white">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-semibold text-white uppercase tracking-wider mb-8">
                                    <Sparkles className="w-3 h-3" /> Offre de lancement
                                </div>
                                <h2 className="text-4xl md:text-7xl font-black font-display mb-8 tracking-tight leading-[0.95]">
                                    Prêt à propulser
                                    <br />
                                    vos projets ?
                                </h2>
                                <p className="text-lg text-white/80 mb-12 max-w-lg mx-auto leading-relaxed">
                                    Rejoignez plus de <span className="text-white font-semibold">10 000 équipes</span> qui utilisent déjà VAERDIA pour transformer leur productivité.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link to="/register">
                                        <Button size="lg" className="h-16 px-12 text-lg font-bold bg-white text-primary-700 hover:bg-primary-50 shadow-2xl border-0 group">
                                            Démarrer gratuitement
                                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/60">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        <span>Pas de carte bancaire</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span>Setup en 2 minutes</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        <span>Support 24/7</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeInView>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="py-20 px-6 border-t border-slate-100 relative z-10 bg-slate-50/50">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12">
                    <div className="col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-md">
                                <Layers className="text-white w-5 h-5" />
                            </div>
                            <span className="text-lg font-bold font-display text-slate-900">VAERDIA</span>
                        </div>
                        <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                            La plateforme de gestion de projet nouvelle génération. Conçue pour les équipes qui exigent l'excellence.
                        </p>
                        <div className="flex gap-3">
                            {['X', 'in', 'D'].map((s) => (
                                <div key={s} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 text-xs font-bold cursor-pointer transition-all">
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>

                    {[
                        { title: 'Produit', links: ['Fonctionnalités', 'Intégrations', 'Mobile', 'Changelog'] },
                        { title: 'Ressources', links: ['Documentation', 'Support', 'API', 'Blog'] },
                        { title: 'Entreprise', links: ['À propos', 'Carrières', 'Presse', 'Contact'] },
                        { title: 'Légal', links: ['Confidentialité', 'Conditions', 'Sécurité', 'RGPD'] },
                    ].map(({ title, links }) => (
                        <div key={title}>
                            <h4 className="font-bold mb-6 text-[11px] uppercase tracking-[0.15em] text-slate-400">{title}</h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link}>
                                        <Link to="#" className="text-sm text-slate-500 hover:text-primary-600 transition-colors duration-200">
                                            {link}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="max-w-7xl mx-auto pt-16 mt-16 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-400 text-xs">© 2026 VAERDIA ProjectFlow. Tous droits réservés.</p>
                    <div className="flex gap-8">
                        {['Statut', 'Sécurité', 'ChangeLog'].map((item) => (
                            <Link key={item} to="#" className="text-xs text-slate-400 hover:text-primary-600 transition-colors duration-200">
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
};

/* ===== LOCAL COMPONENTS ===== */

const LightCard: React.FC<{ className?: string; delay?: number; children: React.ReactNode }> = ({ className = '', delay = 0, children }) => (
    <FadeInView delay={delay}>
        <motion.div
            whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(92,124,250,0.12)' }}
            transition={{ duration: 0.3 }}
            className={`bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-primary-200 transition-colors ${className}`}
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
