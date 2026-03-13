import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    CheckCircle2,
    Briefcase,
    User,
    Building2,
    ChevronLeft,
    Layout
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../store/projectStore';

type OnboardingStep = 'ROLE' | 'WORKSPACE' | 'CONTEXT';

export const AccountSetup: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<OnboardingStep>('ROLE');
    const [isConfiguring, setIsConfiguring] = useState(false);

    // Data
    const [role, setRole] = useState<'PROJECT_MANAGER' | 'TEAM_MEMBER' | null>(null);
    const [workspaceName, setWorkspaceName] = useState('');
    const [domain, setDomain] = useState('');
    const [institution, setInstitution] = useState('');

    const { updateProfile } = useAuth();
    const { dispatch } = useStore();

    const handleNext = () => {
        if (step === 'ROLE') setStep('WORKSPACE');
        else if (step === 'WORKSPACE') setStep('CONTEXT');
    };

    const handleBack = () => {
        if (step === 'WORKSPACE') setStep('ROLE');
        else if (step === 'CONTEXT') setStep('WORKSPACE');
    };

    const handleFinish = () => {
        setIsConfiguring(true);

        // Persist data
        if (role) updateProfile({ role });
        if (domain) updateProfile({ domain });
        if (institution) updateProfile({ institution });
        if (workspaceName) dispatch({ type: 'UPDATE_WORKSPACE', name: workspaceName });

        setTimeout(() => {
            navigate('/dashboard');
        }, 2000);
    };

    if (isConfiguring) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
                <div className="relative mb-8">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 rounded-full border-2 border-slate-100 border-t-indigo-600"
                    />
                </div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    <h1 className="text-xl font-semibold text-slate-800 mb-2">Préparation de votre espace...</h1>
                    <p className="text-slate-500 text-sm">Nous personnalisons l'expérience Vaerdia pour vous.</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
            <div className="w-full max-w-[540px]">
                {/* Progress Header */}
                <div className="flex flex-col items-center mb-12 text-center">
                    <div className="flex items-center gap-2 mb-6 text-indigo-600">
                        <Layout className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Configuration</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {step === 'ROLE' && "Comment comptez-vous utiliser Vaerdia ?"}
                        {step === 'WORKSPACE' && "Commençons par votre espace"}
                        {step === 'CONTEXT' && "Un peu plus de contexte"}
                    </h1>
                </div>

                <div className="space-y-10">
                    <AnimatePresence mode="wait">
                        {step === 'ROLE' && (
                            <motion.div
                                key="role"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setRole('PROJECT_MANAGER')}
                                        className={`p-6 rounded-xl border-2 transition-all text-left flex flex-col gap-4 group ${role === 'PROJECT_MANAGER' ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${role === 'PROJECT_MANAGER' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-slate-900 text-sm mb-1">Responsable Projet</span>
                                            <span className="text-xs text-slate-500 leading-relaxed">Je gère des équipes et des objectifs globaux.</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setRole('TEAM_MEMBER')}
                                        className={`p-6 rounded-xl border-2 transition-all text-left flex flex-col gap-4 group ${role === 'TEAM_MEMBER' ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${role === 'TEAM_MEMBER' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-slate-900 text-sm mb-1">Collaborateur</span>
                                            <span className="text-xs text-slate-500 leading-relaxed">Je travaille sur des tâches et des sprints.</span>
                                        </div>
                                    </button>
                                </div>

                                <Button
                                    onClick={handleNext}
                                    disabled={!role}
                                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 border-0"
                                >
                                    Continuer
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </motion.div>
                        )}

                        {step === 'WORKSPACE' && (
                            <motion.div
                                key="workspace"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-8"
                            >
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-semibold text-slate-700">Nom de votre espace de travail</label>
                                        <div className="relative group">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                            <input
                                                placeholder="Ex: Équipe Marketing / Lab R&D"
                                                value={workspaceName}
                                                onChange={(e) => setWorkspaceName(e.target.value)}
                                                className="block w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 transition-all text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleBack}
                                        variant="outline"
                                        className="w-12 h-12 p-0 flex items-center justify-center rounded-lg border-slate-200 text-slate-400 hover:text-slate-600"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </Button>
                                    <Button
                                        onClick={handleNext}
                                        disabled={!workspaceName}
                                        className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all border-0"
                                    >
                                        Dernière étape
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'CONTEXT' && (
                            <motion.div
                                key="context"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-8"
                            >
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-semibold text-slate-700">Dans quel domaine travaillez-vous ?</label>
                                        <input
                                            placeholder="Ex: Design / Ingénierie / Education"
                                            value={domain}
                                            onChange={(e) => setDomain(e.target.value)}
                                            className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 transition-all text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-semibold text-slate-700">Nom de votre institution</label>
                                        <input
                                            placeholder="Ex: Startup X / Université Y"
                                            value={institution}
                                            onChange={(e) => setInstitution(e.target.value)}
                                            className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleBack}
                                        variant="outline"
                                        className="w-12 h-12 p-0 flex items-center justify-center rounded-lg border-slate-200 text-slate-400 hover:text-slate-600"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </Button>
                                    <Button
                                        onClick={handleFinish}
                                        disabled={!domain || !institution}
                                        className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all border-0 flex items-center justify-center gap-2"
                                    >
                                        Prêt à commencer
                                        <CheckCircle2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Progress Indicators */}
                <div className="mt-16 flex justify-center gap-2">
                    {['ROLE', 'WORKSPACE', 'CONTEXT'].map((s) => (
                        <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${step === s ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-100'}`} />
                    ))}
                </div>
            </div>
        </div>
    );
};
