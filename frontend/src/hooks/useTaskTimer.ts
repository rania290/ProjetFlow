import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { taskTimelogApi, type TaskTimelog } from '../api/task-timelog.api';

export const useTaskTimer = (userId?: string) => {
  const [activeTimelog, setActiveTimelog] = useState<TaskTimelog | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start the live ticker
  const startTicker = useCallback((startTime: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const update = () => {
      const diff = Math.floor(
        (Date.now() - new Date(startTime).getTime()) / 1000,
      );
      setElapsedSeconds(diff > 0 ? diff : 0);
    };
    update();
    intervalRef.current = setInterval(update, 1000);
  }, []);

  const stopTicker = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setElapsedSeconds(0);
  }, []);

  // Restore active timer on mount
  useEffect(() => {
    if (!userId) return;
    taskTimelogApi
      .getActive(userId)
      .then((active) => {
        if (active) {
          setActiveTimelog(active);
          startTicker(active.startTime);
        }
      })
      .catch(() => {});
  }, [userId, startTicker]);

  // Cleanup ticker on unmount
  useEffect(() => () => stopTicker(), [stopTicker]);

  const startTimer = useCallback(
    async (task: {
      id: string;
      title: string;
      projectId: string;
      userName: string;
    }) => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const timelog = await taskTimelogApi.start({
          taskId: task.id,
          taskTitle: task.title,
          projectId: task.projectId,
          userId,
          userName: task.userName,
        });
        setActiveTimelog(timelog);
        startTicker(timelog.startTime);
        toast.success(`⏱ Timer démarré — ${task.title}`);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || 'Impossible de démarrer le timer';
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, startTicker],
  );

  const stopTimer = useCallback(
    async (note?: string) => {
      if (!activeTimelog) return;
      setIsLoading(true);
      try {
        const finished = await taskTimelogApi.stop({
          timelogId: activeTimelog.id,
          note,
        });
        stopTicker();
        setActiveTimelog(null);
        const mins = finished.durationMinutes;
        const display =
          mins >= 60
            ? `${Math.floor(mins / 60)}h ${mins % 60}m`
            : `${mins}m`;
        toast.success(`✅ Timer arrêté — ${display} enregistrés`);
        return finished;
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message || "Impossible d'arrêter le timer",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeTimelog, stopTicker],
  );

  const formatElapsed = () => {
    const h = Math.floor(elapsedSeconds / 3600);
    const m = Math.floor((elapsedSeconds % 3600) / 60);
    const s = elapsedSeconds % 60;
    if (h > 0)
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return {
    activeTimelog,
    elapsedSeconds,
    isLoading,
    startTimer,
    stopTimer,
    formatElapsed,
    isRunning: !!activeTimelog,
    isRunningOnTask: (taskId: string) => activeTimelog?.taskId === taskId,
  };
};
