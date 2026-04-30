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
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-none shadow-3xl rounded-[32px]">


                {/* Corrected Header usage */}
                <DialogHeader className="relative px-8 pt-7 pb-5 bg-slate-50/80 backdrop-blur-md border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                            isClosing ? "bg-amber-500 shadow-amber-500/20" : "bg-emerald-500 shadow-emerald-500/20"
                        }`}>
                            {isClosing ? <Zap className="w-5 h-5 fill-current" /> : <Trophy className="w-5 h-5" />}
                        </div>
                        <div className="text-left">
                            <DialogTitle className="text-xl font-black text-slate-900 leading-none uppercase tracking-tight">
                                {isClosing ? 'Clôture de l\'itération' : 'Bilan de performance'}
                            </DialogTitle>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 italic font-mono">
                                {sprint.name}
                            </p>
                        </div>
                    </div>
                </DialogHeader>




                <div className="px-8 py-7 bg-white space-y-7">
                    {/* Balanced Stat Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50/50 p-5 rounded-[24px] border border-slate-100/50 flex flex-col items-center justify-center text-center group hover:bg-white transition-all hover:shadow-md">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> Tâches
                            </p>
                            <p className="text-2xl font-black text-slate-900 tabular-nums">{doneTasks.length}<span className="text-xs text-slate-300 font-medium ml-1">/{safeTasks.length}</span></p>
                        </div>
                        <div className="bg-slate-50/50 p-5 rounded-[24px] border border-slate-100/50 flex flex-col items-center justify-center text-center group hover:bg-white transition-all hover:shadow-md">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> Points
                            </p>
                            <p className="text-2xl font-black text-indigo-600 tabular-nums">{donePoints}<span className="text-xs text-indigo-300 font-medium ml-1">pts</span></p>
                        </div>
                        <div className="bg-slate-50/50 p-5 rounded-[24px] border border-slate-100/50 flex flex-col items-center justify-center text-center group hover:bg-white transition-all hover:shadow-md">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <Target className="w-3.5 h-3.5 text-emerald-500" /> Succès
                            </p>
                            <p className="text-2xl font-black text-emerald-600 tabular-nums">{completionRate}%</p>
                        </div>
                    </div>

                    {/* Integrated Success Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end px-1">
                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Objectif de l'itération</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{sprint.goal || 'Continuité du backlog'}</p>
                        </div>
                        <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                            <Progress value={completionRate} className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 border-none rounded-full transition-all duration-1000" />
                        </div>
                    </div>


                    {isClosing && incompleteTasks.length > 0 && (
                        <div className="p-5 bg-amber-50/30 rounded-[28px] border border-amber-100/50 flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-2xl bg-white text-amber-500 flex items-center justify-center shadow-sm border border-amber-50 shrink-0 group-hover:scale-110 transition-transform">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="text-[11px] font-black text-amber-900 uppercase tracking-tight">Report automatique</h4>
                                <p className="text-[10px] text-amber-700/80 leading-relaxed font-medium italic">
                                    <span className="font-bold text-amber-900">{incompleteTasks.length} tâches</span> seront déplacées vers le backlog.
                                </p>
                            </div>
                        </div>
                    )}

                </div>

                <DialogFooter className="px-8 py-6 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
                    <Button variant="ghost" onClick={onClose} className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                        Retour
                    </Button>
                    <Button 
                        onClick={isClosing ? () => onConfirmClose?.(sprint.id) : handleExportPdf}
                        className={`h-11 px-8 rounded-xl text-white font-black text-[11px] uppercase tracking-[0.1em] shadow-lg flex items-center gap-2.5 transition-all active:scale-95 ${
                            isClosing ? "bg-indigo-600 hover:bg-black shadow-indigo-500/20" : "bg-slate-900 hover:bg-black shadow-slate-900/10"
                        }`}
                    >
                        {isClosing ? <Archive className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        {isClosing ? "Valider la clôture" : "Exporter le rapport"}
                    </Button>
                </DialogFooter>



            </DialogContent>
        </Dialog>
    );
};
