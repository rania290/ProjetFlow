import React, { useEffect, useState } from 'react';
import { Clock, Loader2, Trash2, FileText } from 'lucide-react';
import { taskTimelogApi, type TaskTimelog } from '../../api/task-timelog.api';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { toast } from 'sonner';

import { ConfirmDialog } from '../ui/ConfirmDialog';

interface TaskTimelogListProps {
  taskId: string;
  isAdmin?: boolean;
  refreshKey?: number; // increment to force refresh after a stop
}

const formatDuration = (minutes: number) => {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export const TaskTimelogList: React.FC<TaskTimelogListProps> = ({
  taskId,
  isAdmin = false,
  refreshKey = 0,
}) => {
  const [sessions, setSessions] = useState<TaskTimelog[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });

  const load = async () => {
    try {
      setIsLoading(true);
      const summary = await taskTimelogApi.getSummaryByTask(taskId);
      setSessions(summary.sessions);
      setTotalMinutes(summary.totalMinutes);
    } catch {
      // silently fail — task may have no timelogs yet
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [taskId, refreshKey]);

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await taskTimelogApi.delete(deleteDialog.id);
      toast.success('Pointage supprimé');
      setDeleteDialog({ isOpen: false, id: null });
      load();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Supprimer ce pointage ?"
        message="Cette action est irréversible et supprimera définitivement cette session de travail."
        confirmText="Supprimer"
        variant="danger"
      />
      {/* Header + total */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-900">
            Temps enregistré
          </span>
        </div>
        {totalMinutes > 0 && (
          <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[10px] px-3 py-1 uppercase tracking-widest">
            Total : {formatDuration(totalMinutes)}
          </Badge>
        )}
      </div>

      {/* Session list */}
      {sessions.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
          <Clock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            Aucun pointage pour cette tâche
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => {
            const isActive = !s.endTime;
            return (
              <div
                key={s.id}
                className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                  isActive
                    ? 'border-rose-200 bg-rose-50/50'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                {/* Indicator */}
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isActive ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'
                  }`}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">
                      {s.userName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {new Date(s.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                    {isActive && (
                      <Badge className="bg-rose-100 text-rose-600 border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                        En cours
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-slate-400">
                      {new Date(s.startTime).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' → '}
                      {s.endTime
                        ? new Date(s.endTime).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '...'}
                    </span>
                    {s.note && (
                      <span
                        className="flex items-center gap-1 text-[10px] text-slate-500 italic truncate max-w-[140px]"
                        title={s.note}
                      >
                        <FileText className="w-2.5 h-2.5 shrink-0" />
                        {s.note}
                      </span>
                    )}
                  </div>
                </div>

                {/* Duration */}
                <span
                  className={`text-xs font-black tabular-nums shrink-0 ${
                    isActive ? 'text-rose-600' : 'text-slate-900'
                  }`}
                >
                  {isActive ? '⏱' : formatDuration(s.durationMinutes)}
                </span>

                {/* Delete (admin) */}
                {isAdmin && !isActive && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteDialog({ isOpen: true, id: s.id })}
                    className="w-7 h-7 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
