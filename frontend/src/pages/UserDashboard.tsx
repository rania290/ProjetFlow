import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/api-client';
import { projectsService } from '../api/projects.service';
import { useAuth } from '../hooks/useAuth';
import {
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Target,
  Briefcase,
  Bell,
  Filter,
  Search,
  ArrowRight,
  MoreVertical,
  MessageCircle,
  Settings,
  LogOut,
  ChevronRight,
  TrendingUp,
  Users,
  Star
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  projectName: string;
  projectId: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
  status: 'TODO' | 'IN_PROGRESS' | 'IN_TEST' | 'DONE';
  dueDate: string;
  assigneeName: string;
  storyPoints?: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  members: Array<{
    id: string;
    fullName: string;
    avatar: string;
  }>;
  deadline: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}

interface Notification {
  id: string;
  type: 'TASK_ASSIGNED' | 'PROJECT_UPDATED' | 'MESSAGE' | 'REMINDER';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

interface UserStats {
  tasksCompleted: number;
  tasksPending: number;
  projectsActive: number;
  weeklyProgress: number;
}

const PRIORITY_CONFIG = {
  CRITICAL: {
    label: 'Critique',
    color: 'bg-rose-100 text-rose-800 border-rose-200',
    icon: AlertCircle
  },
  HIGH: {
    label: 'Haute',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertCircle
  },
  MEDIUM: {
    label: 'Moyenne',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock
  },
  LOW: {
    label: 'Basse',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle
  }
};

const STATUS_CONFIG = {
  TODO: {
    label: 'À faire',
    color: 'bg-slate-100 text-slate-800 border-slate-200'
  },
  IN_PROGRESS: {
    label: 'En cours',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  IN_TEST: {
    label: 'En test',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  DONE: {
    label: 'Terminé',
    color: 'bg-green-100 text-green-800 border-green-200'
  }
};

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  // Debug: Vérifier ce que contient le user
  console.log('Dashboard - User du authStore:', user);
  console.log('Dashboard - User profilePhoto:', user?.profilePhoto);

  const [stats, setStats] = useState<UserStats>({
    tasksCompleted: 0,
    tasksPending: 0,
    projectsActive: 0,
    weeklyProgress: 0
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'TODO' | 'IN_PROGRESS' | 'DONE'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'HIGH' | 'MEDIUM' | 'LOW'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Surveiller les changements du user pour la photo de profil
  useEffect(() => {
    console.log('Dashboard - User changé:', user);
    console.log('Dashboard - ProfilePhoto changé:', user?.profilePhoto);
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Ne plus récupérer les infos utilisateur depuis l'API
      // Utiliser le user du authStore qui contient déjà la photo de profil

      // Récupérer les projets et tâches réels via l'API
      const [projectsData, tasksData] = await Promise.all([
        projectsService.getAll(),
        projectsService.getAllTasks().catch(() => []),
      ]);

      const fetchedProjectsRaw = projectsData || [];
      const projectIds = new Set(fetchedProjectsRaw.map((p: any) => p.id));
      
      // Filtrer les tâches pour ne garder que celles qui appartiennent aux projets de l'utilisateur et enrichir de projectName
      const fetchedTasks: Task[] = (tasksData || [])
        .filter((t: any) => projectIds.has(t.projectId))
        .map((t: any) => {
          const proj = fetchedProjectsRaw.find((p: any) => p.id === t.projectId);
          return {
            ...t,
            projectName: proj ? proj.name : 'Projet',
          };
        });

      // Calculer l'avancement DYNAMIQUE pour chaque projet
      const fetchedProjects = fetchedProjectsRaw.map((p: any) => {
         const pTasks = fetchedTasks.filter(t => t.projectId === p.id);
         let pEffort = 0;
         pTasks.forEach(t => {
             if (t.status === 'DONE') pEffort += 1;
             else if (t.status === 'IN_TEST') pEffort += 0.9;
             else if (t.status === 'IN_PROGRESS') pEffort += 0.5;
         });
         const calculatedProgress = pTasks.length > 0 ? Math.round((pEffort / pTasks.length) * 100) : (Number(p.progress) || 0);
         return { ...p, progress: calculatedProgress };
      });

      setProjects(fetchedProjects as any);
      setTasks(fetchedTasks);

      // Calculer les statistiques réelles depuis les données récupérées
      const doneTasks = fetchedTasks.filter((t: Task) => t.status === 'DONE').length;
      const inProgressTasks = fetchedTasks.filter((t: Task) => t.status === 'IN_PROGRESS' || t.status === 'IN_TEST').length;
      const todoTasks = fetchedTasks.filter((t: Task) => t.status === 'TODO').length;
      const activeProjects = fetchedProjects.filter((p: any) => p.status === 'IN_PROGRESS' || p.status === 'ACTIVE' || p.status === 'PLANNED').length;
      
      // Calculate weighted progress for the dashboard (same formula as Admin)
      let completedEffort = 0;
      fetchedTasks.forEach((t: Task) => {
          if (t.status === 'DONE') completedEffort += 1;
          else if (t.status === 'IN_TEST') completedEffort += 0.9;
          else if (t.status === 'IN_PROGRESS') completedEffort += 0.5;
      });
      const weeklyProgress = fetchedTasks.length > 0 ? Math.round((completedEffort / fetchedTasks.length) * 100) : 0;

      setStats({
        tasksCompleted: doneTasks,
        tasksPending: inProgressTasks + todoTasks,
        projectsActive: activeProjects || fetchedProjects.length,
        weeklyProgress,
      });

      // Récupérer les notifications (simulation)
      setNotifications([
        {
          id: '1',
          type: 'TASK_ASSIGNED',
          title: 'Nouvelle tâche assignée',
          message: 'Vous avez une nouvelle tâche à compléter',
          createdAt: new Date().toISOString(),
          read: false
        }
      ]);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });

      // Mettre à jour localement
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ));

      // Mettre à jour les stats
      if (newStatus === 'DONE') {
        setStats(prev => ({
          ...prev,
          tasksCompleted: prev.tasksCompleted + 1,
          tasksPending: Math.max(0, prev.tasksPending - 1)
        }));
      } else if (newStatus === 'TODO' || newStatus === 'IN_PROGRESS') {
        setStats(prev => ({
          ...prev,
          tasksCompleted: Math.max(0, prev.tasksCompleted - 1),
          tasksPending: prev.tasksPending + 1
        }));
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
    } catch (err) {
      console.error('Erreur lors du marquage de la notification:', err);
    }
  };

  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = taskFilter === 'all' || task.status === taskFilter || (taskFilter === 'DONE' && task.status === 'DONE');
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesProject = projectFilter === 'all' || task.projectId === projectFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getRoleLabel = (role?: string) => {
    if (!role) return '';
    return t(`admin.roles.${role}`, { defaultValue: role });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {user?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    {t('dashboard_custom.greeting', { name: user?.fullName?.split(' ')[0] })}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">{getRoleLabel(user?.role)}</span>
                    <span className="text-xs px-2 py-1 bg-primary-100 text-primary-800 rounded-full">
                      {user?.department}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 max-h-96 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-900">{t('dashboard_custom.notifications')}</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-slate-500">
                            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            <p>{t('dashboard_custom.no_notifications')}</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${!notif.read ? 'bg-blue-50' : ''}`}
                              onClick={() => markNotificationAsRead(notif.id)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${!notif.read ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-slate-900 text-sm">{notif.title}</h4>
                                  <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
                                  <p className="text-xs text-slate-400 mt-2">
                                    {new Date(notif.createdAt).toLocaleString('fr-FR')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative group">
                <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                  <Settings className="w-5 h-5" />
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    {t('dashboard_custom.my_profile')}
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    {t('dashboard_custom.logout')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t('dashboard_custom.completed_tasks')}</p>
                <p className="text-2xl font-bold text-slate-900">{stats.tasksCompleted}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t('dashboard_custom.pending_tasks')}</p>
                <p className="text-2xl font-bold text-slate-900">{stats.tasksPending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t('dashboard_custom.active_projects')}</p>
                <p className="text-2xl font-bold text-slate-900">{stats.projectsActive}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Progression hebdo</p>
                <p className="text-2xl font-bold text-slate-900">{stats.weeklyProgress}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mes Tâches */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Mes Tâches</h2>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <select
                    value={taskFilter}
                    onChange={(e) => setTaskFilter(e.target.value as any)}
                    className="px-3 py-1 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="TODO">À faire</option>
                    <option value="IN_PROGRESS">En cours</option>
                    <option value="DONE">Terminé</option>
                  </select>

                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as any)}
                    className="px-3 py-1 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="all">Toutes les priorités</option>
                    <option value="HIGH">Haute</option>
                    <option value="MEDIUM">Moyenne</option>
                    <option value="LOW">Basse</option>
                  </select>

                  <select
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    className="px-3 py-1 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="all">Tous les projets</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="divide-y divide-slate-200">
                {filteredTasks.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <Target className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Aucune tâche trouvée</p>
                  </div>
                ) : (
                  filteredTasks.map((task, index) => {
                    const PriorityIcon = PRIORITY_CONFIG[task.priority].icon;
                    const daysUntilDue = getDaysUntilDue(task.dueDate);
                    const isOverdue = daysUntilDue < 0;

                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                        className="p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-slate-900">{task.title}</h3>
                              {task.storyPoints && (
                                <span className="text-xs bg-primary-100 text-primary-800 px-2 py-0.5 rounded">
                                  {task.storyPoints}p
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.description}</p>

                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                {task.projectName}
                              </span>
                              <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                                <Calendar className="w-3 h-3" />
                                {isOverdue
                                  ? `En retard de ${Math.abs(daysUntilDue)} jour(s)`
                                  : daysUntilDue <= 3
                                    ? `Dans ${daysUntilDue} jour(s)`
                                    : formatDate(task.dueDate)
                                }
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${PRIORITY_CONFIG[task.priority].color}`}>
                              <PriorityIcon className="w-3 h-3 inline mr-1" />
                              {PRIORITY_CONFIG[task.priority].label}
                            </span>

                            <select
                              value={task.status}
                              onChange={(e) => updateTaskStatus(task.id, e.target.value as Task['status'])}
                              className={`px-2 py-1 rounded-full text-xs font-medium border cursor-pointer ${STATUS_CONFIG[task.status].color}`}
                            >
                              <option value="TODO">À faire</option>
                              <option value="IN_PROGRESS">En cours</option>
                              <option value="DONE">Terminé</option>
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>

          {/* Mes Projets */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-900">Mes Projets</h2>
              </div>

              <div className="p-6 space-y-4">
                {projects.length === 0 ? (
                  <div className="text-center text-slate-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Aucun projet assigné</p>
                  </div>
                ) : (
                  projects.map((project, index) => {
                    const daysUntilDeadline = getDaysUntilDue(project.deadline);
                    const isOverdue = daysUntilDeadline < 0;

                    return (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-slate-900 mb-1">{project.name}</h3>
                            <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                              <span>Progression</span>
                              <span>{project.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-primary-500 to-indigo-600 h-2 rounded-full transition-all"
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                                {isOverdue
                                  ? `Terminé il y a ${Math.abs(daysUntilDeadline)} jour(s)`
                                  : `Dans ${daysUntilDeadline} jour(s)`
                                }
                              </span>
                            </div>

                            <div className="flex -space-x-2">
                              {project.members.slice(0, 3).map((member) => (
                                <div
                                  key={member.id}
                                  className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-indigo-400 border-2 border-white flex items-center justify-center text-white text-[8px] font-bold"
                                  title={member.fullName}
                                >
                                  {member.avatar}
                                </div>
                              ))}
                              {project.members.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-600 text-[8px] font-bold">
                                  +{project.members.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};
