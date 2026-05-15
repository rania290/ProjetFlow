import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Calendar, Zap, RefreshCw } from 'lucide-react';
import { auraService } from '../../api/aura.service';
import { AuraReportView } from './AuraReportView';

interface AuraInsightCardProps {
    projectId: string;
}

export const AuraInsightCard: React.FC<AuraInsightCardProps> = ({ projectId }) => {
    const [latestReport, setLatestReport] = useState<any>(null);
    const [showFullReport, setShowFullReport] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchLatest = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const reports = await auraService.getReportsList(projectId);
            if (reports && reports.length > 0) {
                // API already sorts by desc, so [0] is the latest
                setLatestReport(reports[0]);
            }
        } catch (e) {
            console.error("Failed to fetch latest insight", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [projectId]);

    useEffect(() => {
        if (projectId) fetchLatest();
    }, [projectId, fetchLatest]);

    if (loading || !latestReport) return null;

    return (
        <>
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-4 mt-4 p-4 bg-gradient-to-br from-indigo-600/10 to-violet-600/10 border border-indigo-100 rounded-3xl relative overflow-hidden group hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer"
                onClick={() => setShowFullReport(true)}
            >
                {/* Background Sparkle Decoration */}
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors" />
                
                <div className="flex items-start gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
                        <Zap className="w-4 h-4 fill-current" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Pulse Hebdo Aura</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5" />
                                    {new Date(latestReport.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); fetchLatest(true); }}
                                    className="p-0.5 rounded-md hover:bg-indigo-100 text-slate-400 hover:text-indigo-600 transition-colors"
                                    title="Rafraîchir le rapport"
                                >
                                    <RefreshCw className={`w-2.5 h-2.5 ${refreshing ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>
                        
                        <p className="text-xs font-bold text-slate-900 line-clamp-2 leading-relaxed">
                            {latestReport.summary}
                        </p>
                        
                        <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            Consulter l'analyse complète <ArrowRight className="w-3 h-3" />
                        </div>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {showFullReport && (
                    <div className="fixed inset-0 z-[1000] p-4 flex items-center justify-center bg-slate-950/40 backdrop-blur-md">
                         <div className="w-full max-w-lg h-[90vh]">
                            <AuraReportView report={latestReport} onClose={() => setShowFullReport(false)} />
                         </div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
