import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useTaskTimer } from '../../hooks/useTaskTimer';
import { useAuth } from '../../hooks/useAuth';

interface TaskTimerButtonProps {
  task: {
    id: string;
    title: string;
    projectId: string;
  };
  variant?: 'compact' | 'full';
}

export const TaskTimerButton: React.FC<TaskTimerButtonProps> = ({
  task,
  variant = 'compact',
}) => {
  const { user } = useAuth();
  const { activeTimelog, isLoading, isRunningOnTask, startTimer, stopTimer, formatElapsed } =
    useTaskTimer(user?.id);

  const [showStopModal, setShowStopModal] = useState(false);
  const [note, setNote] = useState('');

  const isThisTaskRunning = isRunningOnTask(task.id);
  const isOtherTaskRunning = !!activeTimelog && !isThisTaskRunning;

  const handleStart = async () => {
    if (isOtherTaskRunning) return; // hook shows toast error automatically
    await startTimer({
      id: task.id,
      title: task.title,
      projectId: task.projectId,
      userName: user?.fullName || 'Utilisateur',
    });
  };

  const handleStopConfirm = async () => {
    await stopTimer(note.trim() || undefined);
    setShowStopModal(false);
    setNote('');
  };

  if (variant === 'full') {
    return (
      <>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={isThisTaskRunning ? () => setShowStopModal(true) : handleStart}
          disabled={isLoading || (isOtherTaskRunning && !isThisTaskRunning)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            isThisTaskRunning
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600'
              : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isThisTaskRunning ? (
            <Square className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <AnimatePresence mode="wait">
            {isThisTaskRunning ? (
              <motion.span
                key="elapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-mono"
              >
                {formatElapsed()}
              </motion.span>
            ) : (
              <motion.span
                key="start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Démarrer
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <StopModal
          open={showStopModal}
          note={note}
          elapsed={formatElapsed()}
          onNoteChange={setNote}
          onConfirm={handleStopConfirm}
          onCancel={() => setShowStopModal(false)}
          isLoading={isLoading}
        />
      </>
    );
  }

  // Compact variant (icon only for Kanban cards)
  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={isThisTaskRunning ? () => setShowStopModal(true) : handleStart}
        disabled={isLoading || (isOtherTaskRunning && !isThisTaskRunning)}
        title={
          isOtherTaskRunning
            ? `Timer actif sur: ${activeTimelog?.taskTitle}`
            : isThisTaskRunning
            ? `Arrêter (${formatElapsed()})`
            : 'Démarrer le timer'
        }
        className={`relative flex items-center justify-center w-7 h-7 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
          isThisTaskRunning
            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/40'
            : 'bg-slate-100 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600'
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : isThisTaskRunning ? (
          <>
            <Square className="w-3 h-3 fill-current" />
            {/* Pulsing ring */}
            <span className="absolute inset-0 rounded-lg animate-ping bg-rose-400 opacity-30 pointer-events-none" />
          </>
        ) : (
          <Play className="w-3 h-3 fill-current ml-0.5" />
        )}
      </motion.button>

      {isThisTaskRunning && (
        <span className="text-[10px] font-mono font-bold text-rose-500 tabular-nums">
          {formatElapsed()}
        </span>
      )}

      <StopModal
        open={showStopModal}
        note={note}
        elapsed={formatElapsed()}
        onNoteChange={setNote}
        onConfirm={handleStopConfirm}
        onCancel={() => setShowStopModal(false)}
        isLoading={isLoading}
      />
    </>
  );
};

// ─── Stop Confirmation Modal ─────────────────────────────────────────────────

interface StopModalProps {
  open: boolean;
  note: string;
  elapsed: string;
  onNoteChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const StopModal: React.FC<StopModalProps> = ({
  open,
  note,
  elapsed,
  onNoteChange,
  onConfirm,
  onCancel,
  isLoading,
}) => (
  <Dialog open={open} onOpenChange={onCancel}>
    <DialogContent className="sm:max-w-sm rounded-3xl p-6">
      <DialogHeader>
        <DialogTitle className="text-base font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
          <Square className="w-4 h-4 text-rose-500 fill-current" />
          Arrêter le timer
        </DialogTitle>
      </DialogHeader>

      <div className="mt-4 space-y-4">
        {/* Elapsed display */}
        <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            Temps écoulé
          </p>
          <p className="text-3xl font-black font-mono text-slate-900 tabular-nums">
            {elapsed}
          </p>
        </div>

        {/* Optional note */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Note (optionnel)
          </label>
          <textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Ce que vous avez accompli..."
            rows={3}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-colors resize-none"
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 rounded-xl"
          >
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Enregistrer'
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);
