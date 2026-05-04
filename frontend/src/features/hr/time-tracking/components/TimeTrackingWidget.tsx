import React, { useState, useEffect } from 'react';
import { Clock, Play, Square, Pause, History, Trash2, Calendar, Briefcase, AlertCircle } from 'lucide-react';
import { useTimeTracking } from '../hooks/useTimeTracking';
import { useAuth } from '../../../../hooks/useAuth';
import { useStore } from '../../../../store/projectStore';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card } from '../../../../components/ui/card';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { projectsService } from '../../../../api/projects.service';

export const TimeTrackingWidget: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR_ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'SUPERADMIN';
  const { activeSession, history, startTracking, pauseTracking, resumeTracking, stopTracking, deleteSession, isLoading } = useTimeTracking(user?.id);
  const { state: { projects }, dispatch } = useStore();
  const availableProjects = projects || [];
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  useEffect(() => {
    const fetchProjects = async () => {
      console.log("[TimeTracking] Checking projects in store:", availableProjects.length);
      try {
        const data = await projectsService.getAll();
        console.log("[TimeTracking] Projects fetched from API:", data.length);
        dispatch({ type: 'SET_PROJECTS', projects: data });
      } catch (error) {
        console.error('[TimeTracking] Failed to fetch projects', error);
      }
    };
    fetchProjects();
  }, [dispatch]);

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const calculateLiveDuration = () => {
    if (!activeSession) return { work: '00:00:00', pause: '00:00:00' };
    
    const start = new Date(activeSession.startTime).getTime();
    const now = new Date().getTime();
    
    // Calculate pause
    let currentPauseMs = 0;
    if (activeSession.status === 'PAUSED' && activeSession.pauseStartTime) {
        currentPauseMs = now - new Date(activeSession.pauseStartTime).getTime();
    }
    const totalPauseMs = (activeSession.totalPauseMinutes * 60000) + currentPauseMs;
    
    // Calculate work
    let workMs = (now - start) - totalPauseMs;
    if (workMs < 0) workMs = 0;
    
    const formatTime = (ms: number) => {
        const diff = Math.floor(ms / 1000);
        const h = Math.floor(diff / 3600).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
        const s = (diff % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    return { work: formatTime(workMs), pause: formatTime(totalPauseMs) };
  };

  const [liveTimer, setLiveTimer] = useState(calculateLiveDuration());

  useEffect(() => {
    if (activeSession) {
      const interval = setInterval(() => {
        setLiveTimer(calculateLiveDuration());
      }, 1000);
      return () => clearInterval(interval);
    } else {
        setLiveTimer({ work: '00:00:00', pause: '00:00:00' });
    }
  }, [activeSession]);

  const handleStart = () => {
      let projectName = undefined;
      if (selectedProjectId) {
          const proj = availableProjects.find(p => p.id === selectedProjectId);
          projectName = proj?.name;
      }
      startTracking(user?.fullName || 'Collaborateur', selectedProjectId || undefined, projectName);
  };

  return (
    <div className="space-y-6">
      {/* Active Session Header */}
      <Card className="p-6 border-none shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <Clock className="w-24 h-24" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-xl ${activeSession?.status === 'IN_PROGRESS' ? 'bg-emerald-500 animate-pulse' : activeSession?.status === 'PAUSED' ? 'bg-amber-500' : 'bg-slate-700'} transition-all`}>
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Pointage Actuel</h3>
              <p className={`text-[10px] font-bold uppercase tracking-tight ${activeSession?.status === 'PAUSED' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {activeSession?.status === 'IN_PROGRESS' ? 'Session en cours...' : activeSession?.status === 'PAUSED' ? 'En Pause' : 'Prêt à commencer'}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-end gap-4">
                <div>
                    <span className="text-4xl font-black font-display tracking-tighter tabular-nums block mb-1">
                    {liveTimer.work}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Temps de travail</span>
                </div>
                {activeSession && (activeSession.totalPauseMinutes > 0 || activeSession.status === 'PAUSED') && (
                    <div className="pb-1">
                        <span className="text-xl font-bold font-display tabular-nums text-slate-400 block mb-0.5">
                        {liveTimer.pause}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">Pause</span>
                    </div>
                )}
            </div>

            {activeSession && (
              <div className="mt-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    Arrivée à {new Date(activeSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {activeSession.projectName && (
                      <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium">
                        <Briefcase className="w-3.5 h-3.5" />
                        {activeSession.projectName}
                      </div>
                  )}
                  {activeSession.isAnomaly && (
                      <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {activeSession.anomalyReason}
                      </div>
                  )}
              </div>
            )}
          </div>

          {!activeSession && (
              <div className="mb-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Associer à un projet (Optionnel)</label>
                  <select 
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500 transition-colors"
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                  >
                      <option value="">-- Aucun projet --</option>
                      {availableProjects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                  </select>
              </div>
          )}

          <div className="flex gap-3 mt-4">
            {!activeSession ? (
              <Button 
                onClick={handleStart}
                className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-500/20 group"
              >
                Arrivée <Play className="w-4 h-4 ml-2 fill-current group-hover:scale-110 transition-transform" />
              </Button>
            ) : (
              <>
                {activeSession.status === 'IN_PROGRESS' ? (
                    <Button 
                        onClick={pauseTracking}
                        className="flex-1 h-12 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-amber-500/20 group"
                    >
                        Pause <Pause className="w-4 h-4 ml-2 fill-current group-hover:scale-110 transition-transform" />
                    </Button>
                ) : (
                    <Button 
                        onClick={resumeTracking}
                        className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-500/20 group"
                    >
                        Reprendre <Play className="w-4 h-4 ml-2 fill-current group-hover:scale-110 transition-transform" />
                    </Button>
                )}
                
                <Button 
                    onClick={stopTracking}
                    className="flex-1 h-12 bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-rose-500/20 group"
                >
                    Départ <Square className="w-4 h-4 ml-2 fill-current group-hover:scale-110 transition-transform" />
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Historique Récent</h4>
          </div>
          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-slate-50 border-slate-100 text-slate-400">
            {history.length} Sessions
          </Badge>
        </div>

        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-2">
            {history.map((session) => (
              <div 
                key={session.id}
                className="group flex flex-col gap-2 p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-emerald-100 hover:shadow-md transition-all"
              >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                    <Calendar className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight truncate">
                        {new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {session.isAnomaly && <AlertCircle className="w-3 h-3 text-rose-500 inline ml-2" />}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                        {session.endTime ? ` — ${new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ` — ${session.status}`}
                    </p>
                    </div>

                    <div className="text-right">
                    <span className="text-xs font-black text-slate-900 block">
                        {session.durationMinutes > 0 ? formatDuration(session.durationMinutes) : '--:--'}
                    </span>
                    {isAdmin && (
                        <button 
                            onClick={() => deleteSession(session.id)}
                            className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all mt-1"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                    </div>
                </div>
                {session.projectName && (
                    <div className="pl-14 text-[9px] font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> {session.projectName}
                    </div>
                )}
              </div>
            ))}
            
            {history.length === 0 && !isLoading && (
              <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                <Clock className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Aucun historique</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
