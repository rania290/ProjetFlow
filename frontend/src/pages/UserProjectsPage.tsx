import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '../components/layout/AppLayout';
import api from '../api/api-client';
import {
  Briefcase,
  Crown,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  Search,
  Grid,
  List,
  Eye,
  Settings
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'TEAM_MEMBER' | 'CLIENT';
  isActive: boolean;
  assignedAt: string;
  expiresAt?: string;
}

interface UserProjectRolesResponse {
  userId: string;
  userFullName: string;
  userEmail: string;
  projects: Project[];
  totalProjects: number;
}

const ROLE_CONFIG = {
  ADMIN: {
    label: 'Admin',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Crown,
    description: 'Accès complet au projet'
  },
  PROJECT_MANAGER: {
    label: 'Chef de Projet',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Briefcase,
    description: 'Gestion du projet et équipe'
  },
  TEAM_MEMBER: {
    label: 'Membre',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: UserCheck,
    description: 'Participation au projet'
  },
  CLIENT: {
    label: 'Client',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: UserX,
    description: 'Accès consultation uniquement'
  }
};

export const UserProjectsPage: React.FC = () => {
  const [userProjects, setUserProjects] = useState<UserProjectRolesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchUserProjects();
  }, [roleFilter, statusFilter]);

  const fetchUserProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/role-assignments/me/projects', {
        params: {
          role: roleFilter !== 'all' ? roleFilter : undefined,
          activeOnly: statusFilter !== 'all' ? (statusFilter === 'active' ? 'true' : 'false') : undefined,
        }
      });
      setUserProjects(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = userProjects?.projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || project.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && project.isActive) ||
      (statusFilter === 'inactive' && !project.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  const getRoleStats = () => {
    if (!userProjects) return {
      ADMIN: 0,
      PROJECT_MANAGER: 0,
      TEAM_MEMBER: 0,
      CLIENT: 0,
      active: 0,
      expired: 0
    };

    const stats = {
      ADMIN: 0,
      PROJECT_MANAGER: 0,
      TEAM_MEMBER: 0,
      CLIENT: 0,
      active: 0,
      expired: 0
    };

    userProjects.projects.forEach(project => {
      stats[project.role]++;
      if (project.isActive) {
        stats.active++;
      } else {
        stats.expired++;
      }
    });

    return stats;
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const days = Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const roleStats = getRoleStats();

  return (
    <AppLayout title="Mes Projets" subtitle="Gérez vos projets et vos rôles">
      <div className="p-4 md:p-6 space-y-4">
        {/* Header & Filters Combined */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">Mes Projets</h1>
              <p className="text-sm text-slate-600 mt-0.5">
                {userProjects?.userFullName} • {userProjects?.totalProjects || 0} projet(s)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            <div className="flex w-full md:w-auto gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="flex-1 md:flex-none px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="all">Tous les rôles</option>
                {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                  <option key={role} value={role}>{config.label}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 md:flex-none px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-900">{userProjects?.totalProjects || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-slate-600">Actifs</p>
                <p className="text-2xl font-bold text-slate-900">{roleStats.active || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-slate-600">Expirés</p>
                <p className="text-2xl font-bold text-slate-900">{roleStats.expired || 0}</p>
              </div>
            </div>
          </div>

          {Object.entries(ROLE_CONFIG).map(([role, config]) => {
            const Icon = config.icon;
            const count = roleStats[role as keyof typeof roleStats] || 0;
            return (
              <div key={role} className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded ${config.color.split(' ')[0]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">{config.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{count}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>



        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
            <span>{error}</span>
          </div>
        )}

        {/* Projects Grid/List */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun projet trouvé</h3>
            <p className="text-slate-600">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Essayez de modifier vos filtres'
                : 'Vous n\'êtes assigné à aucun projet pour le moment'}
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredProjects.map((project, index) => {
              const RoleIcon = ROLE_CONFIG[project.role].icon;
              const expired = isExpired(project.expiresAt);
              const daysUntilExpiry = getDaysUntilExpiry(project.expiresAt);

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-xl p-6 shadow-sm border ${expired ? 'border-red-200 bg-red-50' : 'border-slate-200'
                    } ${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}
                >
                  <div className={viewMode === 'list' ? 'flex items-center gap-4 flex-1' : ''}>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${ROLE_CONFIG[project.role].color.split(' ')[0]
                      }`}>
                      <RoleIcon className="w-6 h-6" />
                    </div>

                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">{project.name}</h3>

                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${expired
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : ROLE_CONFIG[project.role].color
                          }`}>
                          <RoleIcon className="w-3 h-3 inline mr-1" />
                          {expired ? 'Expiré' : ROLE_CONFIG[project.role].label}
                        </span>

                        {project.isActive && !expired && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            Actif
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Assigné le {formatDate(project.assignedAt)}</span>
                        </div>

                        {project.expiresAt && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className={expired ? 'text-red-600 font-medium' : ''}>
                              {expired
                                ? `Expiré le ${formatDate(project.expiresAt)}`
                                : daysUntilExpiry !== null && daysUntilExpiry <= 7
                                  ? `Expire dans ${daysUntilExpiry} jour(s)`
                                  : `Expire le ${formatDate(project.expiresAt)}`
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={`flex items-center gap-2 ${viewMode === 'list' ? '' : 'mt-4'}`}>
                      <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
