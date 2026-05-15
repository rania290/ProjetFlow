import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight, Info, CheckCircle2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/* ============================================================
   LOGIN PAGE – VAERDIA (PREMIUM LIGHT THEME)
   ============================================================ */

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
        <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-white font-sans selection:bg-primary-100 selection:text-primary-900">
            {/* --- Premium Background Effects (Light) --- */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary-50/50 to-transparent -z-10" />
                <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-primary-100/30 blur-[120px] rounded-full -z-10 animate-pulse" />
                <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-accent-100/20 blur-[120px] rounded-full -z-10" />
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
                    <div className="text-center mb-10">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Ravi de vous revoir</h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">
                            Connectez-vous pour accéder à votre espace
                        </p>
                    </div>

                    {/* Login Card */}
                    <motion.div
                        className="bg-white rounded-[2.5rem] p-10 relative overflow-hidden border border-slate-100 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.08)]"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                    >
                        <form onSubmit={handleSubmit} className="space-y-8">
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
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email professionnel</label>
                                    <div className="relative group/input">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-primary-600 transition-colors" />
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="nom@vaerdia.com"
                                            className="h-14 pl-12 pr-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-primary-600/10 focus:border-primary-600/30 transition-all font-bold text-slate-900"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mot de passe</label>
                                        <Link to="#" className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider">Oublié ?</Link>
                                    </div>
                                    <div className="relative group/input">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-primary-600 transition-colors" />
                                        <Input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="h-14 pl-12 pr-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-primary-600/10 focus:border-primary-600/30 transition-all font-bold text-slate-900"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 px-1">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-5 h-5 rounded-lg border-slate-200 text-primary-600 focus:ring-primary-600/10 cursor-pointer transition-all"
                                />
                                <label htmlFor="remember" className="text-xs font-bold text-slate-500 cursor-pointer select-none">
                                    Maintenir la session active
                                </label>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-200 transition-all flex items-center justify-center gap-3 active:scale-[0.97] group/submit disabled:opacity-50"
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
                    </motion.div>

                    {/* Footer Info */}
                    <div className="mt-10 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">
                            © 2026 Vaerdia Platform • 
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
