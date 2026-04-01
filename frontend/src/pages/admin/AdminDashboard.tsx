import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { ChartComponent, useChartData, THEME } from '../../components/charts/ChartComponent';
import { ShieldCheck, BarChart3, Users, CheckSquare, Trash2, AlertCircle, Shield, Settings, Download, Loader2, Target, TrendingUp, Clock, Activity, Briefcase, MousePointer2 } from 'lucide-react';
import { useStore } from '../../store/projectStore';
import { projectsService } from '../../api/projects.service';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';
import { GlassCard } from '../../components/ui/GlassCard';
import { FadeInView } from '../../components/ui/FadeInView';

export const AdminDashboard: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('avancement');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { state, dispatch } = useStore();
  const chartData = useChartData();

  const DEFAULT_TJM = 450; // Mock default fallback

  const projectCosts = state.projects.map(p => {
    const projectTasks = state.tasks.filter(t => t.projectId === p.id);
    let spent = 0;
    let estimatedCost = 0;

    projectTasks.forEach(task => {
        const member = p.members?.find(m => m.id === task.assigneeId);
        const tjm = member?.tjm || DEFAULT_TJM; // Real daily rate if member assigned, else default
        
        // 1 Story point = 1 Day of work = 1 * TJM
        const taskEffort = task.storyPoints || (task.estimatedHours ? task.estimatedHours / 8 : 1);
        const taskCost = taskEffort * tjm;
        
        estimatedCost += taskCost;

        // Add to spent based on current progress of the task
        if (task.status === 'DONE') {
            spent += taskCost;
        } else if (task.status === 'IN_TEST') {
            spent += taskCost * 0.9;
        } else if (task.status === 'IN_PROGRESS') {
            spent += taskCost * 0.5;
        }
    });

    // Handle case where project has no tasks but has a budget to track
    if (projectTasks.length === 0) {
        // Fallback backward compat calculation if no tasks exist
        spent = (p.budget || 0) * ((p.progress || 0) / 100);
        estimatedCost = p.budget || 0;
    }

    return {
      name: p.name,
      budget: p.budget || 0,
      spent: spent,
      remaining: (p.budget || 0) - spent,
      estimatedCost: estimatedCost
    };
  });

  const totalBudget = projectCosts.reduce((acc, p) => acc + (Number(p.budget) || 0), 0);
  const totalSpent = projectCosts.reduce((acc, p) => acc + (Number(p.spent) || 0), 0);
  const totalEstimatedCost = projectCosts.reduce((acc, p) => acc + (Number(p.estimatedCost) || 0), 0);

  // Real Resource Workload (Charge)
  const resourceChargeMap = new Map<string, any>();
  
  state.projects.forEach(p => {
      p.members?.forEach(m => {
          if (!resourceChargeMap.has(m.id)) {
              resourceChargeMap.set(m.id, {
                  id: m.id,
                  name: m.fullName,
                  avatar: m.avatar,
                  role: m.role,
                  assignedHours: 0,
                  completedHours: 0,
                  tasksCount: 0,
                  activeProjects: new Set<string>()
              });
          }
          resourceChargeMap.get(m.id).activeProjects.add(p.name);
      });
  });

  state.tasks.forEach(task => {
      if (task.assigneeId && resourceChargeMap.has(task.assigneeId)) {
          const resource = resourceChargeMap.get(task.assigneeId);
          const taskHours = task.estimatedHours || (task.storyPoints ? task.storyPoints * 8 : 8);
          
          resource.tasksCount += 1;
          resource.assignedHours += taskHours;

          if (task.status === 'DONE') {
              resource.completedHours += taskHours;
          } else if (task.status === 'IN_TEST') {
              resource.completedHours += taskHours * 0.9;
          } else if (task.status === 'IN_PROGRESS') {
              resource.completedHours += taskHours * 0.5;
          }
      }
  });

  const realResources = Array.from(resourceChargeMap.values()).map(r => {
      const remainingHours = Math.max(0, Math.round(r.assignedHours - r.completedHours));
      const efficiency = r.assignedHours > 0 ? Math.round((r.completedHours / r.assignedHours) * 100) : 100;
      
      let workloadStatus = 'OPTIMAL';
      if (remainingHours > 40) workloadStatus = 'OVERLOADED';
      else if (remainingHours < 10 && remainingHours > 0) workloadStatus = 'AVAILABLE_SOON';
      else if (remainingHours === 0) workloadStatus = 'AVAILABLE';

      return { ...r, efficiency, remainingHours, workloadStatus, activeProjectsArray: Array.from(r.activeProjects) };
  });

  const totalAssignedHours = Math.round(realResources.reduce((acc, r) => acc + r.assignedHours, 0));
  const totalCompletedHours = Math.round(realResources.reduce((acc, r) => acc + r.completedHours, 0));
  const averageGlobalEfficiency = totalAssignedHours > 0 ? Math.round((totalCompletedHours / totalAssignedHours) * 100) : 100;
  
  // Real Avancement Data
  const projectsNames = state.projects.map(p => p.name);
  const projectsProgress = state.projects.map(p => {
    const pTasks = state.tasks.filter(t => t.projectId === p.id);
    if (!pTasks.length) return p.progress || 0;
    const done = pTasks.filter(t => t.status === 'DONE').length;
    return Math.round((done / pTasks.length) * 100);
  });

  const realProjectProgressData = {
    labels: projectsNames.length ? projectsNames : ['Aucun projet'],
    datasets: [{
      label: 'Progression (%)',
      data: projectsProgress.length ? projectsProgress : [0],
      backgroundColor: 'rgba(52, 152, 219, 0.8)',
      borderColor: 'rgba(52, 152, 219, 1)',
      borderWidth: 2,
      borderRadius: 6
    }]
  };

  const tasksByStatusCount = {
    'À faire': state.tasks.filter(t => t.status === 'TODO').length,
    'En cours': state.tasks.filter(t => t.status === 'IN_PROGRESS').length,
    'En test': state.tasks.filter(t => t.status === 'IN_TEST').length,
    'Terminées': state.tasks.filter(t => t.status === 'DONE').length,
  };

  const hasTasks = state.tasks.length > 0;
  const realTaskStatusData = {
    labels: hasTasks ? Object.keys(tasksByStatusCount) : ['Aucune tâche'],
    datasets: [{
      data: hasTasks ? Object.values(tasksByStatusCount) : [1],
      backgroundColor: hasTasks ? [
        'rgba(149, 165, 166, 0.8)',
        'rgba(52, 152, 219, 0.8)',
        'rgba(155, 89, 182, 0.8)',
        'rgba(39, 174, 96, 0.8)'
      ] : ['rgba(226, 232, 240, 1)'], // Slate-200
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  const totalTasksCount = state.tasks.length;
  const completedTasksCount = state.tasks.filter(t => t.status === 'DONE').length;
  const criticalActiveTasksCount = state.tasks.filter(t => t.priority === 'CRITICAL' && t.status !== 'DONE').length;
  const globalCompletion = state.projects.length 
      ? Math.round(projectsProgress.reduce((acc, val) => acc + val, 0) / state.projects.length) 
      : 0;

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
      absences: [],
      productivity: [],
      totalAbsences: 0,
      averageProductivity: 100
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
              Vue Globale
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black border border-indigo-100 uppercase tracking-tighter">
                {state.projects.length} projets actifs
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
                  { id: 'avancement', name: 'Projets', icon: <BarChart3 className="w-4 h-4" /> },
                  { id: 'charge', name: 'Ressources', icon: <Users className="w-4 h-4" /> },
                  { id: 'financier', name: 'Finances', icon: <ShieldCheck className="w-4 h-4" /> },
                  { id: 'rh', name: 'Équipe', icon: <Activity className="w-4 h-4" /> }
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
                    <h3 className="text-lg font-black text-slate-800 font-display">Avancement & Progression</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Performance du portefeuille</p>
                  </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-500 border border-slate-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-tighter">Données en temps réel</span>
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
              <p className="text-[11px] text-slate-400 font-black mb-1 uppercase tracking-[0.1em]">Volume de Tâches</p>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-black text-slate-900 font-display">{reportData.avancement.totalTasks}</p>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500">{reportData.avancement.completedTasks} terminées</p>
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
              <p className="text-[11px] text-slate-400 font-black mb-1 uppercase tracking-[0.1em]">% Réalisé Global</p>
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

            <GlassCard className={`p-6 border-white/40 ${reportData.avancement.delayedTasks > 0 ? 'ring-2 ring-red-100' : ''}`} delay={0.3}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ring-4 ${reportData.avancement.delayedTasks > 0 ? 'bg-red-50 text-red-600 ring-red-50/50' : 'bg-slate-50 text-slate-600 ring-slate-50/50'}`}>
                  <AlertCircle className="w-5 h-5" />
                </div>
                {reportData.avancement.delayedTasks > 0 && (
                  <div className="animate-bounce p-1 rounded-full bg-red-500 text-white">
                    <MousePointer2 className="w-3 h-3" />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-black mb-1 uppercase tracking-[0.1em]">Alertes Critiques</p>
              <div className="flex items-end justify-between">
                <p className={`text-4xl font-black font-display ${reportData.avancement.delayedTasks > 0 ? 'text-red-500' : 'text-slate-900'}`}>
                  {reportData.avancement.delayedTasks}
                </p>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${reportData.avancement.delayedTasks > 0 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                  Priorité Haute
                </span>
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <GlassCard className="p-8 border-white/40" delay={0.4}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                  Progression Individuelle
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Projets actifs
                </div>
              </div>
              <div className="relative">
                 <ChartComponent type="bar" data={realProjectProgressData} height={320} animate={true} />
              </div>
            </GlassCard>
            
            <GlassCard className="p-8 border-white/40" delay={0.5}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                  Santé des Tâches
                </h3>
                <select className="bg-slate-50 border-none text-[10px] font-black rounded-lg px-2 py-1 outline-none text-slate-500 cursor-pointer">
                  <option>Par Statut</option>
                  <option>Par Priorité</option>
                </select>
              </div>
              <div className="relative flex justify-center">
                 <div className="w-full max-w-[320px]">
                     <ChartComponent type="doughnut" data={realTaskStatusData} height={320} animate={true} />
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
              <button className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-tighter">Voir tout l'historique</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 text-slate-400 font-black text-[10px] uppercase tracking-[0.15em]">
                  <tr>
                    <th className="px-8 py-5">Membre de l'équipe</th>
                    <th className="px-6 py-5">Tâches</th>
                    <th className="px-6 py-5 text-right">Reste à faire</th>
                    <th className="px-6 py-5 text-center">Progression</th>
                    <th className="px-8 py-5 text-right">Disponibilité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {reportData.charge.resources.length > 0 ? reportData.charge.resources.map((r: any, i: number) => (
                    <tr key={i} className="hover:bg-indigo-50/20 transition-all group cursor-default">
                      <td className="px-8 py-5">
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
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-black text-[10px]">
                          {r.tasksCount} active
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="font-black text-slate-800">{r.remainingHours}h</span>
                        <span className="text-[10px] text-slate-400 font-bold block">sur {r.assignedHours}h</span>
                      </td>
                      <td className="px-6 py-5">
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
                      </td>
                      <td className="px-8 py-5 text-right">
                        {r.workloadStatus === 'OVERLOADED' && <span className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-red-50 text-red-600 border border-red-100">SATURÉ</span>}
                        {r.workloadStatus === 'AVAILABLE_SOON' && <span className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100">PROCHAINEMENT</span>}
                        {r.workloadStatus === 'AVAILABLE' && <span className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100">LIBRE</span>}
                        {r.workloadStatus === 'OPTIMAL' && <span className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100">OPTIMAL</span>}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                        <td colSpan={5} className="px-8 py-16 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">Aucune ressource assignée au workflow actuel.</td>
                    </tr>
                  )}
                </tbody>
              </table>
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
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/50 text-slate-400 font-black text-[10px] uppercase tracking-[0.15em]">
                    <tr>
                      <th className="px-8 py-5">Identifiant Projet</th>
                      <th className="px-6 py-5 text-right">Budget Alloué</th>
                      <th className="px-6 py-5 text-right">Consommé Réel</th>
                      <th className="px-6 py-5 text-right">Reste</th>
                      <th className="px-8 py-5 text-right">Progression Budget</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50">
                    {projectCosts.map((p, i) => {
                      const projRate = Math.min(100, Math.round((p.spent / Math.max(p.budget, 1)) * 100));
                      return (
                      <tr key={i} className="hover:bg-emerald-50/10 transition-all group">
                        <td className="px-8 py-6 font-black text-slate-800 text-[13px]">{p.name}</td>
                        <td className="px-6 py-6 text-right text-slate-400 font-bold">{(p.budget / 1000).toFixed(1)}k</td>
                        <td className="px-6 py-6 text-right font-black text-indigo-600">{(p.spent / 1000).toFixed(1)}k</td>
                        <td className="px-6 py-6 text-right text-slate-400 font-bold">{(p.remaining / 1000).toFixed(1)}k</td>
                        <td className="px-8 py-6">
                           <div className="flex flex-col items-end gap-2">
                               <div className="w-full max-w-[120px] h-1.5 bg-slate-100 rounded-full overflow-hidden p-[1px]">
                                   <div className={`h-full rounded-full ${projRate > 90 ? 'bg-red-500' : projRate > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${projRate}%` }} />
                               </div>
                               <span className={`text-[9px] font-black ${projRate > 90 ? 'text-red-500' : projRate > 75 ? 'text-amber-500' : 'text-emerald-500'}`}>{projRate}%</span>
                           </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
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
                <p className="text-4xl font-black text-slate-900 font-display">24</p>
                <span className="text-[10px] font-black px-2 py-1 bg-purple-50 text-purple-600 rounded-lg">+2 ce mois</span>
              </div>
            </GlassCard>

            <GlassCard className="p-6 border-white/40" delay={0.2}>
              <p className="text-[11px] text-slate-400 font-black mb-2 uppercase tracking-widest">Taux de Rétention</p>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-black text-slate-900 font-display">96%</p>
                <div className="w-12 h-12">
                   <ChartComponent type="doughnut" data={{
                     datasets: [{ data: [96, 4], backgroundColor: [THEME.emerald.start, 'rgba(0,0,0,0.05)'], borderWidth: 0 }]
                   }} height={48} animate={true} />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 border-white/40" delay={0.3}>
              <p className="text-[11px] text-slate-400 font-black mb-2 uppercase tracking-widest">Climat Social</p>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-black text-indigo-600 font-display">4.8</p>
                <div className="flex gap-0.5 mb-1">
                  {[1,2,3,4,5].map(i => <div key={i} className={`w-1.5 h-3 rounded-full ${i <= 4 ? 'bg-indigo-500' : 'bg-slate-200'}`} />)}
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
              </div>
              <div className="relative">
                 <ChartComponent type="line" data={{
                   labels: ['Jan', 'Féb', 'Mar', 'Avr', 'Mai', 'Juin'],
                   datasets: [{
                     label: 'Productivité (%)',
                     data: [82, 85, 88, 84, 91, 94],
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
                   labels: ['Dev', 'Design', 'Ops', 'QA', 'PM'],
                   datasets: [{
                     label: 'Experts',
                     data: [12, 5, 3, 2, 2],
                   }]
                 }} height={300} animate={true} />
              </div>
            </GlassCard>
          </div>
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
