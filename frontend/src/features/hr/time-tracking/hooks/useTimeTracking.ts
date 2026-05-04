import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { timeTrackingApi } from '../api/time-tracking.api';
import type { TimeTrackingSession } from '../api/time-tracking.api';

// Re-export type for ease of use in other files
export type { TimeTrackingSession };

export const useTimeTracking = (employeeId?: string) => {
  const [activeSession, setActiveSession] = useState<TimeTrackingSession | null>(null);
  const [history, setHistory] = useState<TimeTrackingSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchActive = useCallback(async () => {
    if (!employeeId) return;
    try {
      const active = await timeTrackingApi.getActive(employeeId);
      setActiveSession(active);
    } catch (error) {
      console.error('Failed to fetch active session', error);
    }
  }, [employeeId]);

  const fetchHistory = useCallback(async () => {
    if (!employeeId) return;
    try {
      setIsLoading(true);
      const data = await timeTrackingApi.getHistory(employeeId);
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchActive();
    fetchHistory();
  }, [fetchActive, fetchHistory]);

  const startTracking = async (employeeName: string, projectId?: string, projectName?: string, activity?: string) => {
    if (!employeeId) return;
    try {
      const session = await timeTrackingApi.start({ employeeId, employeeName, activity, projectId, projectName });
      setActiveSession(session);
      if (session.isAnomaly) {
        toast.warning(session.anomalyReason || 'Arrivée tardive détectée.');
      } else {
        toast.success('Pointage démarré');
      }
      fetchHistory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du démarrage');
    }
  };

  const pauseTracking = async () => {
    if (!activeSession) return;
    try {
      const session = await timeTrackingApi.pause(activeSession.id);
      setActiveSession(session);
      toast.info('Pointage en pause');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la pause');
    }
  };

  const resumeTracking = async () => {
    if (!activeSession) return;
    try {
      const session = await timeTrackingApi.resume(activeSession.id);
      setActiveSession(session);
      toast.success('Pointage repris');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la reprise');
    }
  };

  const stopTracking = async () => {
    if (!activeSession) return;
    try {
      await timeTrackingApi.stop(activeSession.id);
      setActiveSession(null);
      toast.success('Pointage terminé');
      fetchHistory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'arrêt');
    }
  };

  const deleteSession = async (id: string) => {
    try {
      await timeTrackingApi.delete(id);
      toast.success('Pointage supprimé');
      fetchHistory();
      if (activeSession?.id === id) setActiveSession(null);
    } catch (error: any) {
      toast.error('Erreur lors de la suppression');
    }
  };

  return {
    activeSession,
    history,
    isLoading,
    startTracking,
    pauseTracking,
    resumeTracking,
    stopTracking,
    deleteSession,
    refresh: fetchHistory
  };
};
