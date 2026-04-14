import React from 'react';
import { 
    Zap, CheckSquare, AlertCircle, Archive, 
    Trophy, ArrowUpRight, Target, TrendingUp,
    FileText
} from 'lucide-react';
import { 
    Dialog, DialogContent, DialogHeader, 
    DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { Sprint, Task } from '@/types/project.types';

interface SprintReportModalProps {
    isOpen: boolean;
    sprint: Sprint | null;
    tasks: Task[];
    onClose: () => void;
    onConfirmClose?: (id: string) => void;
}

export const SprintReportModal: React.FC<SprintReportModalProps> = ({ 
    isOpen, sprint, tasks, onClose, onConfirmClose 
}) => {
    // CRITICAL GUARD: Component must not render if sprint is null
    if (!sprint) return null;

    const isClosing = sprint.status === 'ACTIVE';
    const safeTasks = tasks || [];
    const doneTasks = safeTasks.filter(t => t.status === 'DONE');
    const incompleteTasks = safeTasks.filter(t => t.status !== 'DONE');
    
    const totalPoints = safeTasks.reduce((acc, t) => acc + (t.storyPoints ?? 0), 0);
    const donePoints = doneTasks.reduce((acc, t) => acc + (t.storyPoints ?? 0), 0);
    const completionRate = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

    const handleExportPdf = () => {
        const reportWindow = window.open('', '_blank', 'width=900,height=700');
        if (!reportWindow) return;

        const html = `
        <html>
          <head>
            <title>Rapport Sprint - ${sprint.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; }
              h1 { margin: 0 0 8px 0; font-size: 24px; }
              .meta { color: #64748b; margin-bottom: 24px; font-size: 13px; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
              .card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; }
              .label { font-size: 12px; color: #64748b; }
              .value { font-size: 22px; font-weight: 700; margin-top: 6px; }
              .section-title { margin-top: 20px; font-size: 15px; font-weight: 700; }
              ul { margin: 8px 0 0 20px; }
              li { margin-bottom: 6px; }
            </style>
          </head>
          <body>
            <h1>Rapport Sprint - ${sprint.name}</h1>
            <div class="meta">Période: ${new Date(sprint.startDate).toLocaleDateString('fr-FR')} -> ${new Date(sprint.endDate).toLocaleDateString('fr-FR')}</div>
            <div class="grid">
              <div class="card"><div class="label">Tâches livrées</div><div class="value">${doneTasks.length}/${safeTasks.length}</div></div>
              <div class="card"><div class="label">Points complétés</div><div class="value">${donePoints}/${totalPoints}</div></div>
            </div>
            <div class="card">
              <div class="label">Taux de réussite</div>
              <div class="value">${completionRate}%</div>
            </div>
            <div class="section-title">Tâches non terminées (${incompleteTasks.length})</div>
            <ul>
              ${incompleteTasks.map((t) => `<li>${t.title}</li>`).join('') || '<li>Aucune</li>'}
            </ul>
          </body>
        </html>`;

        reportWindow.document.open();
        reportWindow.document.write(html);
        reportWindow.document.close();
        reportWindow.focus();
        reportWindow.print();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[32px]">
                {/* Corrected Header usage */}
                <DialogHeader className="relative px-8 pt-8 pb-6 bg-slate-50/80 backdrop-blur-md border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                            isClosing ? "bg-amber-500 shadow-amber-500/20" : "bg-emerald-500 shadow-emerald-500/20"
                        }`}>
                            {isClosing ? <Zap className="w-5 h-5 fill-current" /> : <Trophy className="w-5 h-5" />}
                        </div>
                        <div className="text-left">
                            <DialogTitle className="text-xl font-black text-slate-900 leading-none uppercase tracking-tight">
                                {isClosing ? 'Clôture de l\'itération' : 'Bilan de performance'}
                            </DialogTitle>
                            <DialogDescription className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 italic">
                                {sprint.name}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-y-auto px-8 py-8 bg-white space-y-8 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50/30 p-6 rounded-[28px] border border-slate-100/50 flex flex-col gap-2 text-left">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> Tâches livrées
                            </p>
                            <p className="text-2xl font-black text-slate-900 leading-none">{doneTasks.length} <span className="text-slate-300 font-medium text-xs">/ {safeTasks.length}</span></p>
                        </div>
                        <div className="bg-slate-50/30 p-6 rounded-[28px] border border-slate-100/50 flex flex-col gap-2 text-left">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> Vélocité
                            </p>
                            <p className="text-2xl font-black text-indigo-600 leading-none">{donePoints} <span className="text-indigo-300 font-medium text-xs">pts</span></p>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl shadow-slate-900/10 transition-all hover:scale-[1.01]">
                        <div className="flex justify-between items-center mb-6 text-left">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Taux de réussite</h4>
                                <p className="text-3xl font-black tracking-tighter">{completionRate}%</p>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/5">
                                <Target className="w-8 h-8 text-white/40" />
                            </div>
                        </div>
                        <Progress value={completionRate} className="h-3 bg-white/10 border-none rounded-full" />
                        <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{sprint.goal || 'Continuité du backlog'}</p>
                            <ArrowUpRight className="w-4 h-4 text-white/20" />
                        </div>
                    </div>

                    {isClosing && incompleteTasks.length > 0 && (
                        <div className="p-6 bg-amber-50/50 rounded-[28px] border border-amber-100 flex gap-4 text-left">
                            <div className="w-10 h-10 rounded-xl bg-white text-amber-600 flex items-center justify-center shadow-sm shrink-0 border border-amber-50">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-[11px] font-black text-amber-900 uppercase tracking-tight">Report automatique</h4>
                                <p className="text-[10px] text-amber-700/80 leading-relaxed font-medium italic">
                                    {incompleteTasks.length} tâches en suspens seront déplacées vers le backlog dès la validation.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="px-8 py-6 bg-white border-t border-slate-100 flex items-center justify-between shadow-[0_-8px_20px_rgba(0,0,0,0.02)]">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600">
                        Retour
                    </Button>
                    {isClosing ? (
                        <Button 
                            onClick={() => onConfirmClose?.(sprint.id)}
                            className="h-11 px-8 rounded-xl bg-indigo-600 hover:bg-black text-white font-black text-[11px] uppercase tracking-[0.1em] shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Archive className="w-4 h-4" /> Valider la clôture
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleExportPdf}
                            className="h-11 px-8 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-[11px] uppercase tracking-[0.1em] shadow-lg transition-all active:scale-95 flex items-center gap-2"
                        >
                            <FileText className="w-4 h-4" /> Exporter PDF
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
