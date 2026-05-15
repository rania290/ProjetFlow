import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { ChartComponent, useChartData, THEME } from '../../components/charts/ChartComponent';
import { ShieldCheck, BarChart3, Users, CheckSquare, Trash2, AlertCircle, Shield, Settings, Download, Loader2, Target, TrendingUp, Clock, Activity, Briefcase } from 'lucide-react';
import { useStore } from '../../store/projectStore';
import { projectsService } from '../../api/projects.service';
import { reportingService, type GlobalAnalytics } from '../../api/reporting.service';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';
import { GlassCard } from '../../components/ui/GlassCard';
import { FadeInView } from '../../components/ui/FadeInView';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from '../../components/ui/badge';
import { timeTrackingApi } from '../../features/hr/time-tracking/api/time-tracking.api';

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [showCriticalPanel, setShowCriticalPanel] = useState(false);
  const [selectedReport, setSelectedReport] = useState('avancement');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [analytics, setAnalytics] = useState<GlobalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const { state, dispatch } = useStore();
  const chartData = useChartData();

  // Compute analytics from local store as a reliable fallback
  const computeFromStore = (): GlobalAnalytics => {
    const tasks = state.tasks || [];
    const storeProjects = state.projects || [];
    const tasksByStatus = {
      TODO: tasks.filter(t => t.status === 'TODO').length,
      IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      IN_TEST: tasks.filter(t => t.status === 'IN_TEST').length,
      DONE: tasks.filter(t => t.status === 'DONE').length,
    };
    const totalTasks = tasks.length;
    const now = new Date();
    const delayedTasksCount = tasks.filter(t =>
      t.status !== 'DONE' && (
        (t.dueDate && new Date(t.dueDate) < now) ||
        t.priority === 'CRITICAL'
      )
    ).length;

    const completionRate = totalTasks > 0 
      ? Math.round(((tasksByStatus.DONE + tasksByStatus.IN_TEST * 0.9 + tasksByStatus.IN_PROGRESS * 0.5) / totalTasks) * 100) 
      : 0;
    const totalBudget = storeProjects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0);
    return {
      summary: { 
        totalProjects: storeProjects.length, 
        totalBudget, 
        totalTasks, 
        completionRate, 
        delayedTasksCount,
        tasksByStatus,
        invoices: { totalAmount: 0, paidAmount: 0, totalInvoices: 0 }
      },
      resources: (() => {
        const resourceMap = new Map<string, any>();
        
        // 1. Gather all members from all projects
        storeProjects.forEach(p => {
          (p.members || []).forEach(m => {
            if (!resourceMap.has(m.id)) {
              resourceMap.set(m.id, {
                id: m.id,
                name: m.fullName,
                avatar: m.avatar,
                role: m.role || 'Collaborateur',
                assignedPoints: 0,
                completedPoints: 0,
                tasksCount: 0,
                projects: new Set([p.id])
              });
            } else {
              resourceMap.get(m.id).projects.add(p.id);
            }
          });
        });

        // 2. Add tasks data to members
        tasks.forEach(t => {
           if (t.assigneeId) {
             let res = resourceMap.get(t.assigneeId);
             if (!res) {
               res = {
                  id: t.assigneeId,
                  name: t.assigneeName || 'Inconnu',
                  avatar: t.assigneeAvatar,
                  role: 'Collaborateur',
                  assignedPoints: 0,
                  completedPoints: 0,
                  tasksCount: 0,
                  projects: new Set([t.projectId])
               };
               resourceMap.set(t.assigneeId, res);
             }
             res.tasksCount += 1;
             const points = t.storyPoints || t.estimatedHours || 3; // default points if none set
             res.assignedPoints += points;
             if (t.status === 'DONE') {
               res.completedPoints += points;
             }
             res.projects.add(t.projectId);
           }
        });

        return Array.from(resourceMap.values()).map(r => ({
          ...r,
          projects: r.projects.size,
          // load is an absolute estimation based on points
          // 40 points considered full capacity (approx 1 sprint)
          load: Math.min(100, Math.round((r.assignedPoints / 40) * 100))
        }));
      })(),
      projects: storeProjects.map(p => {
        const projectTasks = tasks.filter(t => t.projectId === p.id);
        
        let completedEffort = 0;
        let spentAmount = 0;

        projectTasks.forEach(t => {
            let progressRatio = 0;
            if (t.status === 'DONE') {
                completedEffort += 1;
                progressRatio = 1;
            } else if (t.status === 'IN_TEST') {
                completedEffort += 0.9;
                progressRatio = 0.9;
            } else if (t.status === 'IN_PROGRESS') {
                completedEffort += 0.5;
                progressRatio = 0.5;
            }

            // Calcul du coût réel de la tâche
            const effortInDays = t.storyPoints || (t.estimatedHours ? t.estimatedHours / 8 : 1);
            let tjm = 300; // TJM par défaut si non spécifié
            if (t.assigneeId) {
                const member = p.members?.find(m => m.id === t.assigneeId);
                if (member && member.tjm) tjm = member.tjm;
            }
            spentAmount += effortInDays * tjm * progressRatio;
        });

        const calculatedProgress = projectTasks.length > 0 
          ? Math.round((completedEffort / projectTasks.length) * 100) 
          : 0;

        return {
          id: p.id,
          name: p.name,
          progress: calculatedProgress,
          status: p.status,
          budget: Number(p.budget) || 0,
          spentAmount: Math.round(spentAmount)
        };
      }),
    };
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [data, allTasks] = await Promise.all([
            reportingService.getGlobalAnalytics(),
            projectsService.getAllTasks()
        ]);
        setAnalytics(data);
        dispatch({ type: 'SET_TASKS', tasks: allTasks });
      } catch (error) {
        console.warn('[Dashboard] API unavailable, using local store fallback:', error);
        // Fallback: use local store data so charts still display correctly
        setAnalytics(computeFromStore());
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-sync with store changes if we are using the fallback (analytics came from store)
  useEffect(() => {
    if (!loading && analytics && analytics.summary.totalProjects === state.projects.length) {
      // Refresh local analytics when store changes (e.g. new project added)
      setAnalytics(prev => prev ? { ...prev, ...computeFromStore() } : null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.projects, state.tasks]);

  // Poll active time tracking sessions when RH tab is selected
  useEffect(() => {
    let mounted = true;
    const fetchActiveSessions = async () => {
      try {
        const active = await timeTrackingApi.getTeamActive();
        if (mounted) setActiveSessions(active);
      } catch (e) {
        console.warn('Failed to fetch active sessions', e);
      }
    };
    if (selectedReport === 'rh') {
      fetchActiveSessions();
      const interval = setInterval(fetchActiveSessions, 10000);
      return () => {
        mounted = false;
        clearInterval(interval);
      };
    }
  }, [selectedReport]);

  if (loading) {
      return (
          <AppLayout title={t('dashboard.admin_dashboard')}>
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                  <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                  <p className="text-slate-500 font-medium animate-pulse">{t('analytics.loading_data')}</p>
              </div>
          </AppLayout>
      );
  }

  const { summary, resources, projects } = analytics ?? computeFromStore();

  // Build list of truly critical tasks for the detail panel
  const now = new Date();
  const criticalTasksList = state.tasks.filter(t =>
    t.status !== 'DONE' && (
      (t.dueDate && new Date(t.dueDate) < now) ||
      t.priority === 'CRITICAL'
    )
  );

  const projectCosts = projects.map(p => {
    const consumed = p.spentAmount || 0;
    return {
      name: p.name,
      budget: p.budget || 0,
      spent: consumed,
      remaining: (p.budget || 0) - consumed,
      estimatedCost: p.budget || 0
    };
  });

  const totalBudget = summary.totalBudget;
  const totalSpent = projectCosts.reduce((acc, p) => acc + p.spent, 0);
  const totalEstimatedCost = summary.totalBudget;

  const realResources = resources.map(r => ({
      ...r,
      efficiency: Math.round((r.completedPoints / Math.max(r.assignedPoints, 1)) * 100),
      remainingHours: Math.max(0, Math.round((r.assignedPoints - r.completedPoints) * 8)), // Assumption: 1 point = 8h
      workloadStatus: r.load > 90 ? 'OVERLOADED' : r.load > 60 ? 'OPTIMAL' : 'AVAILABLE',
      activeProjectsArray: r.projects
  }));

  const totalAssignedHours = Math.round(realResources.reduce((acc, r) => acc + r.assignedPoints * 8, 0));
  const totalCompletedHours = Math.round(realResources.reduce((acc, r) => acc + r.completedPoints * 8, 0));
  const averageGlobalEfficiency = summary.completionRate;
  
  // Real Avancement Data
  const projectsNames = projects.map(p => p.name);
  const projectsProgress = projects.map(p => p.progress);

  const realProjectProgressData = {
    labels: projectsNames.length ? projectsNames : ['Aucun projet'],
    datasets: [{
      label: 'Progression (%)',
      data: projectsProgress.length ? projectsProgress : [0],
      backgroundColor: 'rgba(79, 70, 229, 0.8)', // Indigo-600
      borderColor: 'rgba(79, 70, 229, 1)',
      borderWidth: 0,
      borderRadius: 20,
      barThickness: 32,
      maxBarThickness: 48,
    }]
  };

  const tasksByStatusCount = {
    'À faire': summary.tasksByStatus.TODO,
    'En cours': summary.tasksByStatus.IN_PROGRESS,
    'En test': summary.tasksByStatus.IN_TEST,
    'Terminées': summary.tasksByStatus.DONE,
  };

  const hasTasks = summary.totalTasks > 0;
  const realTaskStatusData = {
    labels: hasTasks ? Object.keys(tasksByStatusCount) : ['Aucune tâche'],
    datasets: [{
      data: hasTasks ? Object.values(tasksByStatusCount) : [1],
      backgroundColor: [
        '#94a3b8', // Todo: Slate-400
        '#6366f1', // In Progress: Indigo-500
        '#a855f7', // In Test: Purple-500
        '#10b981'  // Done: Emerald-500
      ],
      borderWidth: 4,
      borderColor: '#ffffff',
      hoverOffset: 15,
      weight: 0.5
    }]
  };

  const totalTasksCount = summary.totalTasks;
  const completedTasksCount = summary.tasksByStatus.DONE;
  const criticalActiveTasksCount = criticalTasksList.length; // read directly from live state.tasks
  const globalCompletion = summary.completionRate;

  const reportData = {
    avancement: {
      totalTasks: totalTasksCount,
      completedTasks: completedTasksCount,
      delayedTasks: criticalActiveTasksCount,
      completionRate: globalCompletion,
    },
    charge: {
      resources: realResources,
      totalHoursWeek: totalAssignedHours,
      totalCompletedHours: totalCompletedHours,
      averageEfficiency: averageGlobalEfficiency
    },
    financier: {
      projectCosts: projectCosts.length ? projectCosts : [
        { name: 'Aucun projet', budget: 0, spent: 0, remaining: 0, estimatedCost: 0 }
      ],
      totalBudget: totalBudget,
      totalSpent: totalSpent,
      totalRemaining: totalBudget - totalSpent,
      totalEstimatedCost: totalEstimatedCost,
      monthlyBurn: [8000, 12000, 9500, 11000, totalSpent]
    },
    rh: {
      totalStaff: realResources.length,
      roleDistribution: (() => {
        const counts: Record<string, number> = {};
        realResources.forEach(r => {
          counts[r.role] = (counts[r.role] || 0) + 1;
        });
        return {
          labels: Object.keys(counts),
          data: Object.values(counts)
        };
      })(),
      productivityTrend: (() => {
        const trend = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
          const tasksUpToMonth = state.tasks.filter(t => new Date(t.createdAt) <= monthEnd);
          if (tasksUpToMonth.length === 0) { trend.push(0); continue; }
          
          let totalEffort = 0;
          let completedEffort = 0;
          tasksUpToMonth.forEach(t => {
            const effort = t.storyPoints || (t.estimatedHours ? t.estimatedHours / 8 : 1);
            totalEffort += effort;
            
            // Fix: Use updatedAt or createdAt if completedAt is missing for DONE tasks
            const taskDate = t.completedAt ? new Date(t.completedAt) : (t.updatedAt ? new Date(t.updatedAt) : new Date(t.createdAt));

            if (t.status === 'DONE' && taskDate <= monthEnd) {
              completedEffort += effort;
            } else if (i === 0) { // Pour le mois courant, on compte partiellement ce qui est en cours
              if (t.status === 'DONE') completedEffort += effort;
              else if (t.status === 'IN_TEST') completedEffort += effort * 0.9;
              else if (t.status === 'IN_PROGRESS') completedEffort += effort * 0.5;
            }
          });
          trend.push(totalEffort > 0 ? Math.round((completedEffort / totalEffort) * 100) : 0);
        }
        return trend;
      })(),
      retentionRate: (() => {
        // Formule : 100% de base, -5% par projet suspendu
        const suspendedCount = state.projects.filter(p => p.status === 'SUSPENDED').length;
        return Math.max(0, 100 - (suspendedCount * 5));
      })(),
      socialClimate: (() => {
        // Formule : Base de 3/5 + bonus proportionnel à l'efficacité globale
        return 3.0 + (averageGlobalEfficiency / 100) * 2.0;
      })()
    }
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      await projectsService.deleteAll();
      dispatch({ type: 'SET_PROJECTS', projects: [] });
      setShowDeleteConfirm(false);
      setFeedback({ type: 'success', message: 'Toutes les données de projet ont été effacées.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      console.error('Failed to delete all projects:', error);
      setFeedback({ type: 'error', message: 'Erreur lors de la suppression des données.' });
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById('dashboard-export-area');
      if (!element) return;

      const dataUrl = await toJpeg(element, { 
        quality: 0.95,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Dashboard_VAERDIA_${new Date().toISOString().split('T')[0]}.pdf`);
      setFeedback({ type: 'success', message: 'Export PDF réussi !' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      setFeedback({ type: 'error', message: 'Une erreur est survenue lors de l\'export PDF.' });
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const renderReports = () => {
    const { totalBudget, totalSpent, totalRemaining, totalEstimatedCost, projectCosts } = reportData.financier;
    
    let rawBurnRate = Math.round((totalSpent / Math.max(totalBudget, 1)) * 100);
    const burnRate = isNaN(rawBurnRate) ? 0 : Math.min(100, Math.max(0, rawBurnRate));
    
    // Dynamic estimation based on actual assigned tasks and TJMs vs total budget
    const margin = totalBudget - (totalEstimatedCost || totalSpent || 0);
    const isOverBudget = margin < 0;

    return (
    <div className="space-y-6" id="dashboard-export-area">
      {/* Compact Header row containing Title, Tabs and Actions */}
      <FadeInView direction="down">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-strong p-5 rounded-[2rem] shadow-xl border border-white/40 mb-2">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 font-display">
              {t('dashboard.global_view')}
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black border border-indigo-100 uppercase tracking-tighter">
                {t('dashboard.active_projects', { count: state.projects.length })}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 font-medium">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Supervision et reporting de portefeuille intelligent
            </p>
          </div>

            <div className="flex items-center gap-3">
              {/* Compact Tabs */}
              <div className="hidden md:flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-indigo-100 shadow-inner">
                {[
                  { id: 'avancement', name: t('dashboard.progress_advancement'), icon: <BarChart3 className="w-4 h-4" /> },
                  { id: 'charge', name: t('dashboard.team_capacity'), icon: <Users className="w-4 h-4" /> },
                  { id: 'financier', name: t('dashboard.finances'), icon: <ShieldCheck className="w-4 h-4" /> },
                  { id: 'rh', name: t('dashboard.team'), icon: <Activity className="w-4 h-4" /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedReport(tab.id)}
                    className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all duration-300 ${selectedReport === tab.id 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 border border-indigo-500 scale-[1.02]' 
                        : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50'
                      }`}
                  >
                    {tab.icon}
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>

            </div>
          </div>
        </FadeInView>

      {/* Tabs for mobile */}
      <div className="md:hidden flex bg-white/80 backdrop-blur-md p-1.5 rounded-[1.5rem] border border-indigo-100 shadow-lg overflow-x-auto gap-2 no-scrollbar">
        {[
          { id: 'avancement', name: 'Projets', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'charge', name: 'Ressources', icon: <Users className="w-4 h-4" /> },
          { id: 'financier', name: 'Finances', icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'rh', name: 'Équipe', icon: <Activity className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedReport(tab.id)}
            className={`flex-shrink-0 flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-black transition-all ${selectedReport === tab.id 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-500 bg-slate-50 border border-slate-100'
              }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      {/* Report Content */}
      {selectedReport === 'avancement' && (
        <FadeInView className="space-y-6">
          <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 font-display">{t('dashboard.progress_advancement')}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('dashboard.portfolio_performance')}</p>
                  </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-500 border border-slate-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-tighter">{t('dashboard.real_time_data')}</span>
              </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <GlassCard className="p-6 border-white/40" delay={0.1}>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 ring-4 ring-indigo-50/50">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                  <TrendingUp className="w-3 h-3" />
                  +12%
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-black mb-1 uppercase tracking-[0.1em]">{t('dashboard.task_volume')}</p>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-black text-slate-900 font-display">{reportData.avancement.totalTasks}</p>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500">{reportData.avancement.completedTasks} {t('dashboard.completed')}</p>
                  <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${(reportData.avancement.completedTasks / Math.max(reportData.avancement.totalTasks, 1)) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 border-white/40" delay={0.2}>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50/50">
                  <Target className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase tracking-tighter">
                  Moyenne pondérée
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-black mb-1 uppercase tracking-[0.1em]">{t('dashboard.global_completion')}</p>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-black text-emerald-600 font-display">{reportData.avancement.completionRate}%</p>
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
                      U{i}
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            <GlassCard
              className={`p-6 border-white/40 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                reportData.avancement.delayedTasks > 0
                  ? 'ring-2 ring-red-200 hover:ring-red-300'
                  : 'hover:ring-2 hover:ring-slate-100'
              }`}
              delay={0.3}
            >
              <button
                onClick={() => setShowCriticalPanel(v => !v)}
                className="w-full text-left"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2.5 rounded-xl ring-4 ${
                    reportData.avancement.delayedTasks > 0
                      ? 'bg-red-50 text-red-600 ring-red-50/50'
                      : 'bg-slate-50 text-slate-600 ring-slate-50/50'
                  }`}>
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  {reportData.avancement.delayedTasks > 0 && (
                    <span className="animate-pulse px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-wider border border-red-200">
                      {showCriticalPanel ? 'Masquer ▲' : 'Voir détail ▼'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-black mb-1 uppercase tracking-[0.1em]">{t('dashboard.critical_alerts')}</p>
                <div className="flex items-end justify-between">
                  <p className={`text-4xl font-black font-display ${
                    reportData.avancement.delayedTasks > 0 ? 'text-red-500' : 'text-slate-400'
                  }`}>
                    {reportData.avancement.delayedTasks}
                  </p>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${
                    reportData.avancement.delayedTasks > 0
                      ? 'bg-red-50 text-red-700 border-red-100'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                    {reportData.avancement.delayedTasks > 0 ? 'En retard / Critique' : t('dashboard.no_alerts')}
                  </span>
                </div>
              </button>

              {/* Expandable critical tasks list */}
              <AnimatePresence>
                {showCriticalPanel && criticalTasksList.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-red-100 space-y-2">
                      {criticalTasksList.slice(0, 8).map(t => {
                        const proj = analytics?.projects?.find(p => p.id === t.projectId) || state.projects.find(p => p.id === t.projectId);
                        const isOverdue = t.dueDate && new Date(t.dueDate) < now;
                        return (
                          <div key={t.id} className="flex items-start justify-between gap-2 p-2 rounded-xl bg-red-50/60 border border-red-100/80">
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-black text-slate-800 truncate">{t.title}</p>
                              <p className="text-[9px] font-bold text-slate-400 truncate">{proj?.name ?? 'Projet inconnu'}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md border ${
                                t.priority === 'CRITICAL'
                                  ? 'bg-red-100 text-red-700 border-red-200'
                                  : 'bg-orange-50 text-orange-700 border-orange-100'
                              }`}>
                                {t.priority === 'CRITICAL' ? 'CRITIQUE' : 'HAUTE'}
                              </span>
                              {isOverdue && (
                                <span className="text-[8px] font-bold text-red-500">
                                  ⚠ {new Date(t.dueDate!).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {criticalTasksList.length > 8 && (
                        <p className="text-[9px] font-black text-red-400 text-center pt-1">+{criticalTasksList.length - 8} autres tâches critiques</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <GlassCard className="p-8 border-white/40 shadow-2xl" delay={0.4}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                    Progression du Portefeuille
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Avancement par projet actif sur l'entreprise</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-indigo-600 leading-none">{globalCompletion}%</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Moyenne Globale</p>
                </div>
              </div>
              <div className="relative pt-4">
                 <ChartComponent type="bar" data={realProjectProgressData} height={320} animate={true} />
              </div>
            </GlassCard>
            
            <GlassCard className="p-8 border-white/40 shadow-2xl" delay={0.5}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                    Santé des Tâches
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Répartition par statut opérationnel</p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black text-[10px] uppercase">
                   Stable
                </Badge>
              </div>
              <div className="relative flex justify-center py-6">
                 <div className="w-full max-w-[280px]">
                     <ChartComponent type="doughnut" data={realTaskStatusData} height={280} animate={true} />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100/50">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Productivité</p>
                    <p className="text-sm font-black text-slate-800">Haute density</p>
                 </div>
                 <div className="space-y-1 text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Focus</p>
                    <p className="text-sm font-black text-emerald-600">Livraisons</p>
                 </div>
              </div>
            </GlassCard>
          </div>
        </FadeInView>
      )}

      {selectedReport === 'charge' && (() => {
        const overloadedCount = reportData.charge.resources.filter((r: any) => r.workloadStatus === 'OVERLOADED').length;
        
        return (
        <FadeInView className="space-y-6">
          <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 font-display">Capacité & Charge d'Équipe</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Optimisation des ressources</p>
                  </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-500 border border-slate-200">
                  <span className="text-[10px] font-black uppercase tracking-tighter">Analyse hebdomadaire</span>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-6 border-white/40" delay={0.1}>
              <p className="text-[11px] text-slate-400 font-black mb-2 uppercase tracking-widest">Volume Assigné</p>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-black text-slate-900 font-display">
                  {reportData.charge.totalHoursWeek}
                  <span className="text-sm font-bold text-slate-300 ml-1">h</span>
                </p>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500">{reportData.charge.resources.length} experts actifs</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 border-white/40" delay={0.2}>
              <p className="text-[11px] text-slate-400 font-black mb-2 uppercase tracking-widest">Temps Réalisé</p>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-black text-slate-900 font-display">
                  {reportData.charge.totalCompletedHours}
                  <span className="text-sm font-bold text-slate-300 ml-1">h</span>
                </p>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100">
                    {reportData.charge.totalHoursWeek > 0 ? reportData.charge.averageEfficiency : 0}% efficacité
                  </span>
                </div>
              </div>
            </GlassCard>

            <GlassCard 
              className={`p-6 border-white/40 ${overloadedCount > 0 ? 'ring-2 ring-amber-100 bg-amber-50/10' : ''}`} 
              delay={0.3}
            >
              <p className="text-[11px] text-slate-400 font-black mb-2 uppercase tracking-widest">Alerte Surcharge</p>
              <div className="flex items-end justify-between">
                <p className={`text-4xl font-black font-display ${overloadedCount > 0 ? 'text-amber-500' : 'text-slate-900'}`}>{overloadedCount}</p>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${overloadedCount > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                  &gt; 40h / ressource
                </span>
              </div>
            </GlassCard>
          </div>

          <GlassCard className="border-white/40 overflow-hidden" delay={0.4}>
            <div className="p-6 border-b border-slate-100/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Détail des ressources</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100/50">
                    <TableHead className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-[0.15em] h-14">Membre de l'équipe</TableHead>
                    <TableHead className="px-6 py-5 text-slate-400 font-black text-[10px] uppercase tracking-[0.15em] h-14">Tâches</TableHead>
                    <TableHead className="px-6 py-5 text-right text-slate-400 font-black text-[10px] uppercase tracking-[0.15em] h-14">Reste à faire</TableHead>
                    <TableHead className="px-6 py-5 text-center text-slate-400 font-black text-[10px] uppercase tracking-[0.15em] h-14">Progression</TableHead>
                    <TableHead className="px-8 py-5 text-right text-slate-400 font-black text-[10px] uppercase tracking-[0.15em] h-14">Disponibilité</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.charge.resources.length > 0 ? reportData.charge.resources.map((r: any, i: number) => (
                    <TableRow key={i} className="hover:bg-indigo-50/20 transition-all group cursor-default border-slate-100/50">
                      <TableCell className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-primary-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-100">
                              {r.avatar || r.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-emerald-500"></div>
                          </div>
                          <div>
                            <div className="font-black text-slate-800 text-[13px]">{r.name}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{r.role}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-black text-[10px]">
                          {r.tasksCount} active
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-right">
                        <span className="font-black text-slate-800">{r.remainingHours}h</span>
                        <span className="text-[10px] text-slate-400 font-bold block">sur {r.assignedHours}h</span>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <div className="flex flex-col items-center gap-2 w-full max-w-[140px] mx-auto">
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden p-[1px]">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: `${r.efficiency}%` }}
                              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" 
                            />
                          </div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{r.efficiency}% complété</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-5 text-right">
                        {r.workloadStatus === 'OVERLOADED' && <span className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-red-50 text-red-600 border border-red-100">SATURÉ</span>}
                        {r.workloadStatus === 'AVAILABLE_SOON' && <span className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100">PROCHAINEMENT</span>}
                        {r.workloadStatus === 'AVAILABLE' && <span className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100">LIBRE</span>}
                        {r.workloadStatus === 'OPTIMAL' && <span className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100">OPTIMAL</span>}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                        <TableCell colSpan={5} className="px-8 py-16 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">Aucune ressource assignée au workflow actuel.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </GlassCard>
        </FadeInView>
        );
      })()}

      {selectedReport === 'financier' && (
          <FadeInView className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 font-display">Performance Financière</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Santé du portefeuille de projets</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-500 border border-slate-200">
                    <span className="text-[10px] font-black uppercase tracking-tighter">Budget Consolidé</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <GlassCard className="p-6 border-white/40" delay={0.1}>
                    <p className="text-[11px] text-slate-400 font-black mb-2 uppercase tracking-widest">Budget Alloué</p>
                    <p className="text-3xl font-black text-slate-900 font-display">{(totalBudget / 1000).toFixed(0)}k <span className="text-xs font-bold text-slate-300">DT</span></p>
                </GlassCard>

                <GlassCard className="p-6 border-white/40" delay={0.2}>
                    <p className="text-[11px] text-slate-400 font-black mb-2 uppercase tracking-widest">Consommé</p>
                    <p className="text-3xl font-black text-slate-900 font-display">{(totalSpent / 1000).toFixed(1)}k <span className="text-xs font-bold text-slate-300">DT</span></p>
                </GlassCard>

                <GlassCard className="p-6 border-white/40" delay={0.3}>
                    <p className="text-[11px] text-slate-400 font-black mb-2 uppercase tracking-widest">Disponible</p>
                    <p className="text-3xl font-black text-emerald-600 font-display">{(totalRemaining / 1000).toFixed(1)}k <span className="text-xs font-bold text-emerald-300">DT</span></p>
                </GlassCard>

                <GlassCard className={`p-6 border-white/40 ${isOverBudget ? 'bg-red-50/10 ring-2 ring-red-100' : ''}`} delay={0.4}>
                    <p className="text-[11px] text-slate-400 font-black mb-2 uppercase tracking-widest">Marge Estimée</p>
                    <p className={`text-3xl font-black font-display ${isOverBudget ? 'text-red-600' : 'text-slate-900'}`}>
                      {Math.abs(margin / 1000).toFixed(1)}k <span className="text-xs font-bold opacity-30">DT</span>
                    </p>
                </GlassCard>
            </div>

            {/* Burn Rate Module */}
            <GlassCard className="p-8 border-white/40" delay={0.5}>
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <div className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">Analyse du Workflow</div>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Vitesse de consommation globale</h4>
                    </div>
                    <div className="flex items-end gap-2 text-3xl font-black font-display">
                        <span className={burnRate > 90 ? 'text-red-500' : burnRate > 75 ? 'text-amber-500' : 'text-emerald-500'}>
                          {burnRate}%
                        </span>
                        <span className="text-xs text-slate-300 pb-2">consommé</span>
                    </div>
                </div>
                <div className="h-6 bg-slate-50 border border-slate-200/50 rounded-2xl overflow-hidden p-[3px]">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${burnRate}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full rounded-xl shadow-inner ${
                            burnRate > 90 ? 'bg-gradient-to-r from-red-400 to-red-600' : 
                            burnRate > 75 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 
                            'bg-gradient-to-r from-emerald-400 to-emerald-600'
                        }`}
                    />
                </div>
                {isOverBudget && (
                    <div className="mt-6 flex items-start gap-4 text-red-600 bg-red-50/50 p-5 rounded-2xl border border-red-100/50">
                        <div className="p-2 bg-red-100 rounded-xl">
                          <AlertCircle className="w-5 h-5 shrink-0" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-wider">Alerte de Dépassement</p>
                          <p className="text-[11px] font-bold leading-relaxed text-red-500/80">
                              La projection actuelle indique un dépassement de budget inter-projets de <span className="font-black text-red-600">{Math.abs(margin / 1000).toFixed(1)}k DT</span>.
                          </p>
                        </div>
                    </div>
                )}
            </GlassCard>

            {/* Costs table */}
            <GlassCard className="border-white/40 overflow-hidden" delay={0.6}>
              <div className="p-8 border-b border-slate-100/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Coûts par Projet</h3>
                </div>

              </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100/50">
                    <TableHead className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-[0.15em] h-14">Identifiant Projet</TableHead>
                    <TableHead className="px-6 py-5 text-right text-slate-400 font-black text-[10px] uppercase tracking-[0.15em] h-14">Budget Alloué</TableHead>
                    <TableHead className="px-6 py-5 text-right text-slate-400 font-black text-[10px] uppercase tracking-[0.15em] h-14">Consommé Réel</TableHead>
                    <TableHead className="px-6 py-5 text-right text-slate-400 font-black text-[10px] uppercase tracking-[0.15em] h-14">Reste</TableHead>
                    <TableHead className="px-8 py-5 text-right text-slate-400 font-black text-[10px] uppercase tracking-[0.15em] h-14">Progression Budget</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectCosts.map((p, i) => {
                    const projRate = Math.min(100, Math.round((p.spent / Math.max(p.budget, 1)) * 100));
                    return (
                      <TableRow key={i} className="hover:bg-emerald-50/10 transition-all group border-slate-100/50">
                        <TableCell className="px-8 py-6 font-black text-slate-800 text-[13px]">{p.name}</TableCell>
                        <TableCell className="px-6 py-6 text-right text-slate-400 font-bold">{(p.budget / 1000).toFixed(1)}k</TableCell>
                        <TableCell className="px-6 py-6 text-right font-black text-indigo-600">{(p.spent / 1000).toFixed(1)}k</TableCell>
                        <TableCell className="px-6 py-6 text-right text-slate-400 font-bold">{(p.remaining / 1000).toFixed(1)}k</TableCell>
                        <TableCell className="px-8 py-6">
                           <div className="flex flex-col items-end gap-2">
                               <div className="w-full max-w-[120px] h-1.5 bg-slate-100 rounded-full overflow-hidden p-[1px]">
                                   <div className={`h-full rounded-full ${projRate > 90 ? 'bg-red-500' : projRate > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${projRate}%` }} />
                               </div>
                               <span className={`text-[9px] font-black ${projRate > 90 ? 'text-red-500' : projRate > 75 ? 'text-amber-500' : 'text-emerald-500'}`}>{projRate}%</span>
                           </div>
                        </TableCell>
                      </TableRow>
                    )})}
                </TableBody>
              </Table>
            </div>
            </GlassCard>
          </FadeInView>
      )}

      {selectedReport === 'rh' && (
        <FadeInView className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm border border-purple-100">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 font-display">Performance RH</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Capital humain & engagement</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-6 border-white/40" delay={0.1}>
              <p className="text-[11px] text-slate-400 font-black mb-2 uppercase tracking-widest">Effectif Total</p>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-black text-slate-900 font-display">{reportData.rh.totalStaff}</p>
                <span className="text-[10px] font-black px-2 py-1 bg-purple-50 text-purple-600 rounded-lg">Experts actifs</span>
              </div>
            </GlassCard>

            <GlassCard className="p-6 border-white/40" delay={0.2}>
              <p className="text-[11px] text-slate-400 font-black mb-2 uppercase tracking-widest">Taux de Rétention</p>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-black text-slate-900 font-display">{reportData.rh.retentionRate}%</p>
                <div className="w-12 h-12">
                   <ChartComponent type="doughnut" data={{
                     datasets: [{ data: [reportData.rh.retentionRate, 100 - reportData.rh.retentionRate], backgroundColor: [THEME.emerald.start, 'rgba(0,0,0,0.05)'], borderWidth: 0 }]
                   }} height={48} animate={true} />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 border-white/40" delay={0.3}>
              <p className="text-[11px] text-slate-400 font-black mb-2 uppercase tracking-widest">Climat Social</p>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-black text-indigo-600 font-display">{reportData.rh.socialClimate.toFixed(1)}</p>
                <div className="flex gap-0.5 mb-1">
                  {[1,2,3,4,5].map(i => <div key={i} className={`w-1.5 h-3 rounded-full ${i <= reportData.rh.socialClimate ? 'bg-indigo-500' : 'bg-slate-200'}`} />)}
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <GlassCard className="p-8 border-white/40" delay={0.4}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                  <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                  Productivité Mensuelle
                </h3>
                <div className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-1 rounded-lg uppercase">
                  Vs mois précédent : +{Math.max(0, reportData.rh.productivityTrend[5] - reportData.rh.productivityTrend[4])}%
                </div>
              </div>
              <div className="relative">
                 <ChartComponent type="line" data={{
                   labels: (() => {
                      const labels = [];
                      const now = new Date();
                      for (let i = 5; i >= 0; i--) {
                        labels.push(new Date(now.getFullYear(), now.getMonth() - i, 1).toLocaleString('fr-FR', { month: 'short' }));
                      }
                      return labels;
                    })(),
                   datasets: [{
                     label: 'Productivité (%)',
                     data: reportData.rh.productivityTrend,
                     borderColor: '#8b5cf6',
                     backgroundColor: 'rgba(139, 92, 246, 0.1)',
                   }]
                 }} height={300} animate={true} />
              </div>
            </GlassCard>

            <GlassCard className="p-8 border-white/40" delay={0.5}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                  <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                  Répartition des Compétences
                </h3>
              </div>
              <div className="relative">
                 <ChartComponent type="bar" data={{
                   labels: reportData.rh.roleDistribution.labels,
                   datasets: [{
                     label: 'Nombre d\'Experts',
                     data: reportData.rh.roleDistribution.data,
                     backgroundColor: 'rgba(245, 158, 11, 0.8)',
                   }]
                 }} height={300} animate={true} />
              </div>
            </GlassCard>
          </div>

          <GlassCard className="border-white/40 overflow-hidden" delay={0.6}>
             <div className="p-8 border-b border-slate-100/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Présence en Direct</h3>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black text-[10px] uppercase">
                   {activeSessions.length} actif(s)
                </Badge>
             </div>
             <div className="p-6">
                 {activeSessions.length === 0 ? (
                    <div className="text-center py-10">
                       <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                       <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Personne n'est actuellement pointé</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                       {activeSessions.map((session, idx) => (
                           <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-all shadow-sm">
                              <div className="relative">
                                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                                    <Activity className="w-5 h-5" />
                                 </div>
                                 <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${session.status === 'PAUSED' ? 'bg-amber-400' : 'bg-emerald-500'}`}></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-xs font-black text-slate-800 truncate">{session.employeeName}</p>
                                 <p className="text-[10px] font-bold text-slate-500 truncate mt-0.5">{session.activity || 'Travail standard'}</p>
                                 <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-[9px] font-black uppercase text-emerald-600 tracking-wider">
                                       Depuis {new Date(session.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {session.status === 'PAUSED' && (
                                       <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-100 text-amber-700 uppercase">En pause</span>
                                    )}
                                 </div>
                              </div>
                           </div>
                       ))}
                    </div>
                 )}
             </div>
          </GlassCard>
        </FadeInView>
      )}
    </div>
    );
  };

  return (
    <AppLayout title="Administration Globale" subtitle="Configuration, monitoring et reporting centralisé">
      <div className="p-6">
        {renderReports()}
      </div>

      {/* Floating Feedback Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-8 left-1/2 z-[110] flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl border text-sm font-bold backdrop-blur-md ${
              feedback.type === 'success' 
                ? 'bg-emerald-500/90 text-white border-emerald-400' 
                : 'bg-red-500/90 text-white border-red-400'
            }`}
          >
            {feedback.type === 'success' ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-100"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 mb-6">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Effacer toutes les données ?</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-8">
                Cette action supprimera définitivement tous les projets enregistrés dans le système. Cette opération est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteAll}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30 disabled:opacity-50"
                >
                  {isDeleting ? 'Suppression...' : 'Confirmer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};
