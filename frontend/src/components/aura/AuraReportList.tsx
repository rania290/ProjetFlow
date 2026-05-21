import React, { useState, useEffect } from 'react';
import { auraService } from '../../api/aura.service';
import { FileText, Calendar, ChevronRight, Loader2, Search, Info, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuraReportView } from './AuraReportView';

interface AuraReportListProps {
  projectId: string;
}

export const AuraReportList: React.FC<AuraReportListProps> = ({ projectId }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

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

  useEffect(() => {
    if (projectId) fetchReports();
  }, [projectId]);

  const handleGenerateReport = async () => {
    if (!projectId || generating) return;
    setGenerating(true);
    try {
      await auraService.getReport(projectId);
      await fetchReports();
    } catch (error) {
      console.error("Failed to generate report", error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading && !generating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 bg-white h-full">
        <div className="relative">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
        <p className="text-[11px] font-semibold tracking-wide text-slate-400">Chargement des rapports...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFAFA] overflow-hidden relative">
      <div className="px-6 py-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center gap-4 justify-between z-10 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        <div>
            <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight">Rapports IA</h3>
            <p className="text-[12px] text-slate-500 mt-0.5">Historique des synthèses de projet</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-50 transition-all shadow-sm"
              />
            </div>
            <button 
              onClick={handleGenerateReport}
              disabled={generating}
              className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[13px] font-medium flex items-center gap-2 transition-all disabled:opacity-50 shadow-sm shrink-0"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Générer
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
        {reports.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-center space-y-4">
             <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm">
                <Info className="w-5 h-5 text-slate-400" />
             </div>
             <div className="space-y-1">
                <p className="text-[14px] font-medium text-slate-900">Aucun rapport disponible</p>
                <p className="text-[12px] text-slate-500 max-w-[250px]">Générez un rapport manuellement ou attendez la génération hebdomadaire.</p>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.2 }}
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="p-5 bg-white border border-slate-200/70 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                    <FileText className="w-4 h-4 text-indigo-600 group-hover:text-white" />
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:text-indigo-500 bg-slate-50 group-hover:bg-indigo-50 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
                
                <h4 className="text-[14px] font-semibold text-slate-900 leading-snug mb-2 line-clamp-2">{report.summary}</h4>
                
                <div className="mt-auto pt-4 flex items-center gap-2 text-[11px] font-medium text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(report.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedReport && (
          <div className="absolute inset-0 z-50 p-4 sm:p-6 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center">
            <AuraReportView report={selectedReport} onClose={() => setSelectedReport(null)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

