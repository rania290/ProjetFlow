import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { Calendar, Download, Share2, Sparkles, X, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { jsPDF } from 'jspdf';

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-full border border-slate-100"
    >
      {/* Header */}
      <div className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Rapport Hebdomadaire</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300/80 flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {new Date(report.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-xs font-medium text-slate-300 line-clamp-2 bg-white/5 p-3 rounded-2xl border border-white/10">
          {report.summary}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 prose prose-slate max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-indigo-600 prose-li:text-slate-600 custom-scrollbar">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {report.content}
        </ReactMarkdown>
      </div>

      {/* Footer / Actions */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
        <Button 
          onClick={handleShare}
          variant="outline" 
          size="sm" 
          className="rounded-xl font-black uppercase text-[10px] tracking-widest h-10"
        >
          <Share2 className="w-4 h-4 mr-2" /> Partager
        </Button>
        <Button 
          onClick={handleDownloadPDF}
          size="sm" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest h-10 px-6 shadow-lg shadow-indigo-600/20"
        >
          <Download className="w-4 h-4 mr-2" /> PDF
        </Button>
      </div>
    </motion.div>
  );
};
