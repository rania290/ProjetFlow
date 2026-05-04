import React, { useState, useEffect } from 'react';
import { Clock, History, Users, Trash2, Calendar, Filter, AlertCircle, FileText, Download, Briefcase, Settings2, Edit, CheckSquare } from 'lucide-react';
import { useTimeTracking, type TimeTrackingSession } from '../hooks/useTimeTracking';
import { useAuth } from '../../../../hooks/useAuth';
import { useStore } from '../../../../store/projectStore';
import { TimeTrackingWidget } from '../components/TimeTrackingWidget';
import { AppLayout } from '../../../../components/layout/AppLayout';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Button } from '../../../../components/ui/button';
import { timeTrackingApi } from '../api/time-tracking.api';
import { taskTimelogApi, type TaskTimelog as TaskLog } from '../../../../api/task-timelog.api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../../../components/ui/ConfirmDialog';

export const TimeTrackingPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR_ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'SUPERADMIN';
  const { state: { projects } } = useStore();
  
  const { history: personalHistory } = useTimeTracking(user?.id);
  const myTotalMinutes = personalHistory.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  const myTotalHours = (myTotalMinutes / 60).toFixed(1);
  const myAvgHours = personalHistory.length > 0 ? (myTotalMinutes / 60 / personalHistory.length).toFixed(1) : '0';
  const mySessionCount = personalHistory.length;
  
  const [teamHistory, setTeamHistory] = useState<TimeTrackingSession[]>([]);
  const [taskHistory, setTaskHistory] = useState<TaskLog[]>([]);
  const [allTaskHistory, setAllTaskHistory] = useState<TaskLog[]>([]);
  const [anomalies, setAnomalies] = useState<TimeTrackingSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<TimeTrackingSession | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string | null; type: 'session' | 'taskLog' }>({
    isOpen: false,
    id: null,
    type: 'session',
  });

  const fetchTeamHistory = async () => {
    if (isAdmin) {
      try {
        const data = await timeTrackingApi.getTeam() as TimeTrackingSession[];
        setTeamHistory(data);
        setAnomalies(data.filter(s => s.isAnomaly));
      } catch (error) {
        console.error('Failed to fetch team history', error);
      }
    }
  };

  const fetchTaskHistory = async () => {
    if (user?.id) {
      try {
        const personalData = await taskTimelogApi.getByUser(user.id);
        setTaskHistory(personalData);

        if (isAdmin) {
            // For admin, we ideally want ALL logs.
            // Since we don't have a global 'getAll', we can fetch by project for all projects in store
            const allLogs: TaskLog[] = [];
            for (const p of projects) {
                try {
                    const logs = await taskTimelogApi.getByProject(p.id);
                    allLogs.push(...logs);
                } catch (e) {
                    console.error(`Failed to fetch logs for project ${p.id}`, e);
                }
            }
            // Sort by date
            allLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setAllTaskHistory(allLogs);
        }
      } catch (error) {
        console.error('Failed to fetch task history', error);
      }
    }
  };

  useEffect(() => {
    fetchTeamHistory();
    fetchTaskHistory();
    // Set up polling for real-time view
    const interval = setInterval(() => {
        fetchTeamHistory();
        fetchTaskHistory();
    }, 30000);
    return () => clearInterval(interval);
  }, [isAdmin, user?.id]);

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const totalTaskMinutes = allTaskHistory.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  const totalTaskHours = (totalTaskMinutes / 60).toFixed(1);
  const activeTaskCount = allTaskHistory.filter(log => !log.endTime).length;

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
        if (deleteDialog.type === 'session') {
            await timeTrackingApi.delete(deleteDialog.id);
            fetchTeamHistory();
        } else {
            await taskTimelogApi.delete(deleteDialog.id);
            fetchTaskHistory();
        }
        toast.success("Élément supprimé");
        setDeleteDialog({ isOpen: false, id: null, type: 'session' });
    } catch (e) {
        toast.error("Erreur lors de la suppression");
    }
  };

  const calculateCost = (session: TimeTrackingSession) => {
      if (!session.projectId) return 0;
      const project = projects.find(p => p.id === session.projectId);
      if (!project) return 0;
      const member = project.members?.find(m => m.id === session.employeeId);
      const tjm = member?.tjm || 0;
      // TJM is per day (assuming 8 hours/day) -> Cost per hour = TJM / 8
      const hourlyRate = tjm / 8;
      const hours = session.durationMinutes / 60;
      return Math.round(hourlyRate * hours);
  };

  const totalCost = teamHistory.reduce((acc, curr) => acc + calculateCost(curr), 0);
  const totalHours = Math.round(teamHistory.reduce((acc, curr) => acc + curr.durationMinutes, 0) / 60);

  const handleExportCSV = async () => {
      try {
          const blob = await timeTrackingApi.exportCsv();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `pointages_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success("Exportation CSV réussie");
      } catch (error) {
          console.error("Export failed", error);
          toast.error("Échec de l'exportation CSV");
      }
  };

  const handleCorrection = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!selectedSession) return;
      
      const formData = new FormData(e.currentTarget);
      const startTime = formData.get('startTime') as string;
      const endTime = formData.get('endTime') as string;
      
      try {
          // Combine date with new times
          const datePrefix = selectedSession.date;
          const newStart = `${datePrefix}T${startTime}:00`;
          const newEnd = endTime ? `${datePrefix}T${endTime}:00` : undefined;

          await timeTrackingApi.manualCorrection({
              sessionId: selectedSession.id,
              startTime: newStart,
              endTime: newEnd,
              isAnomaly: false // Reset anomaly upon manual validation
          });
          toast.success("Pointage corrigé avec succès");
          setSelectedSession(null);
          fetchTeamHistory();
      } catch (error) {
          toast.error("Erreur lors de la correction");
      }
  };

  return (
    <AppLayout title="Pointage & Temps" subtitle="Gestion de la présence et du temps de travail">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Pointage</h1>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1">Espace de gestion du temps VAERDIA</p>
            </div>
          </div>
          {isAdmin && (
              <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExportCSV} className="h-10 border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 rounded-xl">
                      <Download className="w-4 h-4 mr-2" /> Exporter CSV
                  </Button>
              </div>
          )}
        </header>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="bg-slate-100 p-1 rounded-2xl mb-8">
            <TabsTrigger value="personal" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Clock className="w-3.5 h-3.5 mr-2" /> Mon Pointage
            </TabsTrigger>

            {isAdmin && (
              <TabsTrigger value="team" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Users className="w-3.5 h-3.5 mr-2" /> Dashboard Admin
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="personal">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <TimeTrackingWidget />
              </div>
              <div className="lg:col-span-2">
                <Card className="p-6 border-none shadow-xl bg-white rounded-[2.5rem]">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Statistiques Mensuelles</h3>
                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] px-3 py-1 uppercase tracking-widest">
                      Ce Mois
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: 'Heures Ce Mois', value: `${myTotalHours}h`, color: 'bg-blue-50 text-blue-600' },
                      { label: 'Moyenne/Jour', value: `${myAvgHours}h`, color: 'bg-emerald-50 text-emerald-600' },
                      { label: 'Sessions', value: `${mySessionCount}`, color: 'bg-amber-50 text-amber-600' },
                    ].map((stat, i) => (
                      <div key={i} className={`p-4 rounded-3xl ${stat.color.split(' ')[0]} border border-white/20 shadow-sm`}>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">{stat.label}</p>
                        <p className={`text-xl font-black ${stat.color.split(' ')[1]}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>



          {isAdmin && (
            <TabsContent value="team" className="space-y-6">
              
              {/* Dashboard KPI */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                  <Card className="p-6 border-none shadow-lg bg-indigo-600 text-white rounded-3xl relative overflow-hidden">
                      <div className="relative z-10">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Présents</p>
                          <p className="text-2xl font-black">{teamHistory.filter(s => s.status !== 'COMPLETED' && s.date === new Date().toISOString().split('T')[0]).length}</p>
                      </div>
                      <Users className="absolute -right-4 -bottom-4 w-20 h-20 opacity-10" />
                  </Card>

                  <Card className="p-6 border-none shadow-lg bg-white rounded-3xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Heures (Global)</p>
                      <p className="text-2xl font-black text-slate-900">{totalHours}h</p>
                  </Card>

                  <Card className="p-6 border-none shadow-lg bg-white rounded-3xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Temps Tâches</p>
                      <p className="text-2xl font-black text-indigo-600">{totalTaskHours}h</p>
                  </Card>

                  <Card className="p-6 border-none shadow-lg bg-white rounded-3xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tâches en cours</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-black text-emerald-600">{activeTaskCount}</p>
                        {activeTaskCount > 0 && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
                      </div>
                  </Card>

                  <Card className="p-6 border-none shadow-lg bg-white rounded-3xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Coût Projets</p>
                      <p className="text-2xl font-black text-amber-600">{totalCost.toLocaleString('fr-FR')}€</p>
                  </Card>

                  <Card className="p-6 border-none shadow-lg bg-rose-50 rounded-3xl border border-rose-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-2">Anomalies</p>
                      <div className="flex items-center gap-3">
                          <p className="text-2xl font-black text-rose-600">{anomalies.length}</p>
                          {anomalies.length > 0 && <AlertCircle className="w-5 h-5 text-rose-500 animate-pulse" />}
                      </div>
                  </Card>
              </div>

              {/* Liste des Sessions Réelles (Pointage Standard) */}
              <Card className="p-8 border-none shadow-xl bg-white rounded-[2.5rem]">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Pointage Collaborateurs (Standard)</h3>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-50">
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Collaborateur</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Heures</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Projet / Coût</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Durée</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {teamHistory.map((session) => (
                        <tr key={session.id} className="group">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${session.isAnomaly ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                                {session.employeeName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <span className="text-xs font-black text-slate-900 uppercase tracking-tight block">{session.employeeName}</span>
                                {session.isAnomaly && (
                                    <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">{session.anomalyReason}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="text-xs font-black text-slate-700 block">{new Date(session.date).toLocaleDateString()}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                {session.endTime ? new Date(session.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
                            </span>
                          </td>
                          <td className="py-4">
                              {session.projectName ? (
                                  <div>
                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border-none mb-1">
                                        <Briefcase className="w-3 h-3 mr-1" /> {session.projectName}
                                    </Badge>
                                    <p className="text-[10px] font-bold text-slate-400">Coût: <span className="text-slate-700">{calculateCost(session)} €</span></p>
                                  </div>
                              ) : (
                                  <span className="text-[10px] text-slate-300 italic">Interne</span>
                              )}
                          </td>
                          <td className="py-4">
                            <span className="text-xs font-black text-slate-900 block">{formatDuration(session.durationMinutes)}</span>
                            {session.totalPauseMinutes > 0 && (
                                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Pause: {session.totalPauseMinutes}m</span>
                            )}
                          </td>
                          <td className="py-4">
                            <Badge className={
                                session.status === 'COMPLETED' ? "bg-slate-50 text-slate-500 border-none" : 
                                session.status === 'PAUSED' ? "bg-amber-50 text-amber-600 border-none animate-pulse" :
                                "bg-emerald-50 text-emerald-600 border-none"
                            }>
                              {session.status === 'COMPLETED' ? 'Terminé' : session.status === 'PAUSED' ? 'En Pause' : 'En cours'}
                            </Badge>
                          </td>
                          <td className="py-4 text-right flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedSession(session)} className="text-slate-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ isOpen: true, id: session.id, type: 'session' })} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {teamHistory.length === 0 && (
                      <div className="py-12 text-center">
                          <p className="text-xs text-slate-400 uppercase tracking-widest font-black">Aucune donnée trouvée</p>
                      </div>
                  )}
                </div>
              </Card>

              {/* SECTION: HISTORIQUE DES TACHES (EQUIPE) */}
              <Card className="p-8 border-none shadow-xl bg-white rounded-[2.5rem]">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Suivi des Tâches (Équipe)</h3>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-50">
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Collaborateur</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Tâche / Projet</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Durée</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {allTaskHistory.map((log) => (
                        <tr key={log.id} className="group">
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-600">
                                {log.userName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{log.userName}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="text-xs font-black text-slate-900 uppercase tracking-tight block">{log.taskTitle}</span>
                            <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest block mt-0.5">
                              {projects.find(p => p.id === log.projectId)?.name || 'Projet'}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className="text-xs font-black text-slate-700 block">{new Date(log.startTime).toLocaleDateString()}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Durée : {log.endTime ? (log.durationMinutes >= 60 ? `${Math.floor(log.durationMinutes / 60)}h ${log.durationMinutes % 60}m` : `${log.durationMinutes}m`) : 'En cours'}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => setDeleteDialog({ isOpen: true, id: log.id, type: 'taskLog' })}
                              className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Manual Correction Modal */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
          <DialogContent className="sm:max-w-md rounded-3xl p-6">
              <DialogHeader>
                  <DialogTitle className="text-lg font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                      <Edit className="w-5 h-5 text-indigo-500" />
                      Correction Manuelle
                  </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCorrection} className="space-y-4 mt-4">
                  <div className="bg-slate-50 p-4 rounded-2xl mb-4">
                      <p className="text-xs font-bold text-slate-700">Collaborateur : <span className="font-black text-indigo-600">{selectedSession?.employeeName}</span></p>
                      <p className="text-xs font-bold text-slate-700">Date : {selectedSession?.date}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Heure Arrivée</label>
                          <input 
                              type="time" 
                              name="startTime" 
                              defaultValue={selectedSession?.startTime ? new Date(selectedSession.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors"
                              required
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Heure Départ</label>
                          <input 
                              type="time" 
                              name="endTime" 
                              defaultValue={selectedSession?.endTime ? new Date(selectedSession.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors"
                          />
                      </div>
                  </div>

                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 bg-amber-50 text-amber-600 p-2 rounded-lg">
                      Info : La validation d'une correction réinitialise l'alerte d'anomalie de cette session.
                  </p>

                  <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setSelectedSession(null)} className="flex-1 rounded-xl">Annuler</Button>
                      <Button type="submit" className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest">Enregistrer</Button>
                  </div>
              </form>
          </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null, type: 'session' })}
        onConfirm={handleDelete}
        title="Supprimer définitivement ?"
        message="Cette action effacera définitivement cet enregistrement de temps."
        confirmText="Supprimer"
        variant="danger"
      />
    </AppLayout>
  );
};
