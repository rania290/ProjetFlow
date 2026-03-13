import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { ChartComponent, useChartData } from '../../components/charts/ChartComponent';
import { ShieldCheck, BarChart3, Users, CheckSquare, Trash2, AlertCircle, Shield, Settings } from 'lucide-react';
import { useStore } from '../../store/projectStore';
import { projectsService } from '../../api/projects.service';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminDashboard: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('avancement');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { state, dispatch } = useStore();
  const chartData = useChartData();

  const projectCosts = state.projects.map(p => ({
    name: p.name,
    budget: p.budget || 0,
    spent: (p.budget || 0) * ((p.progress || 0) / 100),
    remaining: (p.budget || 0) * (1 - (p.progress || 0) / 100)
  }));

  const totalBudget = projectCosts.reduce((acc, p) => acc + p.budget, 0);
  const totalSpent = projectCosts.reduce((acc, p) => acc + p.spent, 0);

  const reportData = {
    avancement: {
      totalTasks: state.tasks.length,
      completedTasks: state.tasks.filter(t => t.status === 'DONE').length,
      delayedTasks: state.tasks.filter(t => t.priority === 'CRITICAL').length,
      completionRate: state.projects.length ? Math.round(state.projects.reduce((acc, p) => acc + p.progress, 0) / state.projects.length) : 0,
      weeklyProgress: [45, 52, 58, 61, 65],
      monthlyProgress: [20, 35, 45, 58, 65]
    },
    charge: {
      resources: [
        { name: 'Admin', hoursThisWeek: 40, hoursThisMonth: 160, efficiency: 100 }
      ],
      totalHoursWeek: 40,
      totalHoursMonth: 160,
      averageEfficiency: 100
    },
    financier: {
      projectCosts: projectCosts.length ? projectCosts : [
        { name: 'Aucun projet', budget: 0, spent: 0, remaining: 0 }
      ],
      totalBudget: totalBudget,
      totalSpent: totalSpent,
      totalRemaining: totalBudget - totalSpent,
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
      alert('Toutes les données de projet ont été effacées.');
    } catch (error) {
      console.error('Failed to delete all projects:', error);
      alert('Erreur lors de la suppression des données.');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Reporting et Tableaux de Bord</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            Exporter PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        {[
          { id: 'avancement', name: 'Avancement', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'charge', name: 'Charge', icon: <CheckSquare className="w-4 h-4" /> },
          { id: 'financier', name: 'Financier', icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'rh', name: 'RH', icon: <Users className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedReport(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${selectedReport === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      {/* Report Content */}
      {selectedReport === 'avancement' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Nombre de tâches</h4>
              <p className="text-3xl font-bold text-slate-900">{reportData.avancement.totalTasks}</p>
              <p className="text-xs text-slate-500 mt-1">{reportData.avancement.completedTasks} terminées</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">% Réalisé</h4>
              <p className="text-3xl font-bold text-emerald-600">{reportData.avancement.completionRate}%</p>
              <p className="text-xs text-slate-500 mt-1">En progression</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Retards</h4>
              <p className="text-3xl font-bold text-red-500">{reportData.avancement.delayedTasks}</p>
              <p className="text-xs text-slate-500 mt-1">Tâches en retard</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-6">Progression Hebdomadaire</h3>
              <ChartComponent type="bar" data={chartData.weeklyProgressData} height={300} title="Progression Hebdomadaire" />
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-6">Progression Mensuelle</h3>
              <ChartComponent type="line" data={chartData.monthlyProgressData} height={300} title="Progression Mensuelle" />
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'charge' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Heures (Semaine)</h4>
              <p className="text-3xl font-bold text-slate-900">{reportData.charge.totalHoursWeek}h</p>
              <p className="text-xs text-slate-500 mt-1">{reportData.charge.resources.length} ressources</p>
            </div>
            {/* ... other KPIs */}
          </div>
          {/* resources details table would go here, omitting for brevity in implementation plan refactor */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50">
              <h3 className="text-sm font-bold text-slate-800">Détail des ressources</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Ressource</th>
                    <th className="px-6 py-4 text-center">Heures/Sem</th>
                    <th className="px-6 py-4 text-center">Efficacité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reportData.charge.resources.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium text-slate-700">{r.name}</td>
                      <td className="px-6 py-4 text-center text-slate-600">{r.hoursThisWeek}h</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${r.efficiency >= 90 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {r.efficiency}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Adding more modules if users clicks other sidebar items */}
    </div>
  );

  return (
    <AppLayout title="Administration Globale" subtitle="Configuration, monitoring et reporting centralisé">
      <div className="p-6">
        {renderReports()}
      </div>

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
