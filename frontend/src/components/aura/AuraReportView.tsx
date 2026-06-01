import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { Calendar, Download, Share2, Sparkles, X, FileText, Copy } from 'lucide-react';
import { Button } from '../ui/button';
import { jsPDF } from 'jspdf';
import { useAuth } from '../../hooks/useAuth';

interface AuraReportViewProps {
  report: {
    id: string;
    content: string;
    summary: string;
    created_at: string;
  };
  onClose: () => void;
}

export const AuraReportView: React.FC<AuraReportViewProps> = ({ report, onClose }) => {
  const { user } = useAuth();
  const canExport = 
    user?.role === 'ADMIN' || 
    user?.role === 'SUPER_ADMIN' || 
    user?.role === 'ROOT' || 
    user?.role === 'RH' || 
    user?.role === 'HR_ADMIN' || 
    user?.role === 'PROJECT_MANAGER' || 
    user?.role === 'MANAGER' ||
    user?.role === 'CHEF' ||
    user?.role === 'CHEF DE PROJET';

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const date = new Date(report.created_at).toLocaleDateString('fr-FR');
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(63, 81, 181); // Indigo
    doc.text("Rapport Hebdomadaire Aura IA", 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Généré le : ${date}`, 20, 30);
    doc.text(`ID: ${report.id}`, 20, 35);
    
    doc.setDrawColor(200);
    doc.line(20, 40, 190, 40);
    
    // Summary
    doc.setFontSize(12);
    doc.setTextColor(50);
    doc.text("Résumé :", 20, 50);
    doc.setFontSize(10);
    const splitSummary = doc.splitTextToSize(report.summary, 170);
    doc.text(splitSummary, 20, 55);
    
    // Content
    doc.setFontSize(12);
    doc.text("Détails du rapport :", 20, 75);
    doc.setFontSize(10);
    // Simple cleaning of markdown for PDF
    const cleanContent = report.content.replace(/[#*`]/g, '');
    const splitContent = doc.splitTextToSize(cleanContent, 170);
    doc.text(splitContent, 20, 80);
    
    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text("© VAERDIA - Aura IA Intelligence", 20, 285);
    }
    
    doc.save(`Rapport_Aura_${date.replace(/\//g, '-')}.pdf`);
  };

  const handleShare = async () => {
    try {
        const textToShare = `# ${report.summary}\n\n${report.content}`;
        await navigator.clipboard.writeText(textToShare);
        import('sonner').then(({ toast }) => toast.success("Contenu du rapport copié dans le presse-papier !"));
    } catch (err) {
        console.error("Failed to copy", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 10 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col h-full w-full max-w-4xl mx-auto border border-slate-200"
    >
      {/* Header */}
      <div className="p-6 sm:px-8 border-b border-slate-100 bg-white relative shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center shrink-0 border border-indigo-50 shadow-inner">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">Rapport de Synthèse Aura</h2>
              <div className="flex items-center gap-3 mt-1 text-[12px] font-medium text-slate-500">
                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(report.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span className="hidden sm:inline text-indigo-600">Généré automatiquement par IA</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 sm:static w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#FAFAFA] custom-scrollbar scroll-smooth">
        <div className="max-w-3xl mx-auto">
          {/* Summary Box */}
          <div className="mb-10 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
            <p className="text-[15px] font-medium text-slate-800 leading-relaxed pl-2">
              {report.summary}
            </p>
          </div>

          <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-loose prose-p:text-[15px] prose-strong:text-indigo-900 prose-strong:font-bold prose-li:text-slate-600 prose-li:text-[15px] prose-hr:border-slate-200 prose-table:border-collapse prose-th:bg-slate-50 prose-th:font-semibold prose-th:text-slate-700 prose-th:p-3 prose-td:p-3 prose-td:border-t prose-td:border-slate-100">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {report.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="p-4 sm:px-8 bg-white border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
        <Button 
          onClick={handleShare}
          variant="outline" 
          className="rounded-xl font-medium text-[13px] h-10 border-slate-200 hover:bg-slate-50 text-slate-700 transition-all"
        >
          <Copy className="w-4 h-4 mr-2" /> Copier
        </Button>
        {canExport && (
          <Button 
            onClick={handleDownloadPDF}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-[13px] h-10 px-6 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 mr-2" /> Télécharger PDF
          </Button>
        )}
      </div>
    </motion.div>
  );
};
