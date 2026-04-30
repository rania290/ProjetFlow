import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('admin@vaerdia.com');
    const [password, setPassword] = useState('admin123');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const user = await login({ email, password });
            if (user.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Identifiants invalides');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 font-sans selection:bg-indigo-500/30">
            {/* --- Premium Background Effects --- */}
            <div className="absolute inset-0 z-0">
                <div className="mesh-gradient absolute inset-0 opacity-40 animate-mesh-rotate" />
                <div className="bg-grid-pattern absolute inset-0 opacity-20" />
                
                {/* Dynamic Blurs */}
                <div className="absolute top-[20%] -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-glow" />
                <div className="absolute bottom-[20%] -right-20 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
            </div>

            {/* --- Main Login Container --- */}
            <div className="container relative z-10 w-full flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-[440px]"
                >
                    {/* Header Section */}
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-black text-white tracking-tighter mb-1 uppercase flex flex-col leading-none">
                            <span className="text-indigo-400">Vaerdia</span>
                            <span className="text-xl mt-1 tracking-[0.2em] opacity-40 font-light">Espace Collaborateur</span>
                        </h1>
                        <p className="text-slate-400 text-xs font-medium tracking-tight">
                            Connectez-vous pour accéder à vos outils
                        </p>
                    </div>

                    {/* Login Card */}
                    <motion.div
                        className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden group border border-white/10"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                    >
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* SSO Button */}
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-14 rounded-2xl border-slate-200/60 bg-white/50 hover:bg-white hover:border-indigo-300 text-slate-700 font-bold transition-all gap-3 active:scale-95 group/google"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" className="group-hover/google:rotate-12 transition-transform">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continuer avec Google
                            </Button>

                            <div className="relative flex items-center gap-4 my-6">
                                <div className="h-[1px] flex-1 bg-slate-200/50" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white/0 px-2">Ou identifiants</span>
                                <div className="h-[1px] flex-1 bg-slate-200/50" />
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3"
                                    >
                                        <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                        <p className="text-xs font-bold text-rose-600 leading-tight">{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Inputs */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email professionnel</label>
                                    <div className="relative group/input">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors" />
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="nom@vaerdia.com"
                                            className="h-14 pl-12 pr-4 bg-slate-50/50 border-slate-200/60 rounded-2xl focus:ring-indigo-600/20 focus:border-indigo-500/50 active:scale-[0.99] transition-all font-bold text-slate-900"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mot de passe</label>
                                        <a href="#" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Oublié ?</a>
                                    </div>
                                    <div className="relative group/input">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors" />
                                        <Input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="h-14 pl-12 pr-4 bg-slate-50/50 border-slate-200/60 rounded-2xl focus:ring-indigo-600/20 focus:border-indigo-500/50 active:scale-[0.99] transition-all font-bold text-slate-900"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 px-1">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600/20 cursor-pointer"
                                />
                                <label htmlFor="remember" className="text-xs font-bold text-slate-500 cursor-pointer select-none">
                                    Maintenir la session active
                                </label>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 active:scale-[0.97] group/submit disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Se connecter
                                        <ArrowRight className="w-4 h-4 group-hover/submit:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Admin Badge */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-6 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center gap-3"
                        >
                            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] font-black text-indigo-900 uppercase tracking-widest leading-none">Accès Démo</p>
                                <p className="text-[9px] text-indigo-600/70 font-bold mt-1 truncate">Admin pré-renseigné</p>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Footer Info */}
                    <div className="mt-6 text-center">
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em]">
                            © 2026 Vaerdia Platform • Secu-Portail V2.4
                        </p>
                    </div>
                </motion.div>
            </div>
            
            <style>{`
                @keyframes mesh-rotate {
                    from { transform: rotate(0deg) scale(1); }
                    50% { transform: rotate(180deg) scale(1.1); }
                    to { transform: rotate(360deg) scale(1); }
                }
                .animate-mesh-rotate {
                    animation: mesh-rotate 20s linear infinite;
                }
            `}</style>
        </div>
    );
};
