import React, { useState, useEffect } from 'react';
import { auraService } from '../../api/aura.service';
import { FileText, Calendar, ChevronRight, Loader2, Search, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuraReportView } from './AuraReportView';

interface AuraReportListProps {
  projectId: string;
}

export const AuraReportList: React.FC<AuraReportListProps> = ({ projectId }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const data = await auraService.getReportsList(projectId);
        setReports(data);
      } catch (error) {
        console.error("Failed to fetch reports", error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchReports();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-500" />
            </div>
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Récupération des rapports...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/30 overflow-hidden relative">
      <div className="p-4 border-b border-slate-100 bg-white/50 backdrop-blur-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher un rapport..." 
            className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {reports.length === 0 ? (
          <div className="py-20 text-center space-y-4">
             <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto">
                <Info className="w-8 h-8 text-slate-300" />
             </div>
             <div className="space-y-1">
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Aucun rapport disponible</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Les rapports sont générés automatiquement chaque lundi.</p>
             </div>
          </div>
        ) : (
          reports.map((report, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="p-4 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                    <FileText className="w-5 h-5 text-indigo-500 group-hover:text-white" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight line-clamp-1">{report.summary}</p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Calendar className="w-3 h-3" />
                      {new Date(report.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {selectedReport && (
          <div className="absolute inset-0 z-10 p-4 bg-slate-950/20 backdrop-blur-sm">
            <AuraReportView report={selectedReport} onClose={() => setSelectedReport(null)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
