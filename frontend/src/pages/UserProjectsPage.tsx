import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { useStore } from '../store/projectStore';
import { useAuth } from '../hooks/useAuth';
import { ProjectSettingsModal } from '../components/projects/ProjectSettingsModal';
import type { Project as GlobalProject } from '../types/project.types';
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
  Settings,
  ArrowUpRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { FadeInView } from '../components/ui/FadeInView';

interface Project {
  id: string;
  name: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'TEAM_MEMBER' | 'CLIENT';
  isActive: boolean;
  assignedAt: string;
  expiresAt?: string;
  _source: GlobalProject;
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

const STATUS_CONFIG: Record<string, { label: string, color: string }> = {
  PLANNED: { label: 'PLANIFIÉ', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  IN_PROGRESS: { label: 'EN COURS', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  DELIVERED: { label: 'LIVRÉ', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  SUSPENDED: { label: 'SUSPENDU', color: 'bg-amber-100 text-amber-800 border-amber-200' },
};

export const UserProjectsPage: React.FC = () => {
  const { state, dispatch } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProjectForSettings, setSelectedProjectForSettings] = useState<GlobalProject | null>(null);

  const mappedProjects = useMemo(() => {
    return state.projects
      .filter(p => {
        const isMember = (p.members || []).some(m => m.id === user?.id);
        const isManager = p.managerId === user?.id;
        const isClient = user?.role === 'CLIENT' && p.clientName === user?.fullName; // Basic client check
        const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
        return isAdmin || isMember || isManager || isClient;
      })
      .map((p): Project => {
        let role: Project['role'] = 'TEAM_MEMBER';
        if (p.managerId === user?.id) role = 'PROJECT_MANAGER';
        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') role = 'ADMIN';

        return {
          id: p.id,
          name: p.name,
          role,
          isActive: p.status === 'IN_PROGRESS',
          assignedAt: p.startDate || p.createdAt || new Date().toISOString(),
          expiresAt: p.endDate || undefined,
          _source: p
        };
      });
  }, [state.projects, user]);

  const userProjects = useMemo(() => {
    return {
      userId: user?.id || 'u1',
      userFullName: user?.fullName || 'Utilisateur',
      userEmail: user?.email || '',
      projects: mappedProjects,
      totalProjects: mappedProjects.length
    };
  }, [mappedProjects, user]);

  const loading = false;
  const error = null;

  const filteredProjects = userProjects?.projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  }) || [];

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



  return (
    <AppLayout title="Mes Projets" subtitle="Accès et rôles administratifs">
      <FadeInView className="p-4 md:p-6 space-y-6">
        {/* Glass Header & Actions */}
        <Card className="p-6 shadow-sm border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">

                <div>
                  <h1 className="text-2xl font-black text-transparent bg-clip-text gradient-text font-display flex items-center gap-2 uppercase tracking-wide">
                    Mes Projets
                  </h1>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {userProjects?.userFullName} • GESTION DES ACCÈS
                  </p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full md:w-64 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Rechercher un projet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 text-sm transition-all placeholder:text-slate-400/70"
                />
              </div>
              
              <div className="flex bg-slate-50/80 p-1 rounded-xl border border-slate-200/50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Projects Grid/List */}
        {filteredProjects.length === 0 ? (
          <Card className="p-12 text-center shadow-sm border-slate-100">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-black text-slate-800 font-display uppercase tracking-tight">Aucun projet trouvé</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2 font-black">
              {searchTerm
                ? 'Essayez de modifier vos filtres'
                : 'Vous n\'êtes assigné à aucun projet pour le moment'}
            </p>
          </Card>
        ) : (
          <motion.div 
            className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start'
              : 'space-y-4'
            }
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
          >
            <AnimatePresence>
              {filteredProjects.map((project, index) => {
                const RoleIcon = ROLE_CONFIG[project.role].icon;
                const expired = isExpired(project.expiresAt);
                const daysUntilExpiry = getDaysUntilExpiry(project.expiresAt);

                return (
                  <motion.div
                    key={project.id}
                    layout
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card
                      className={`p-6 glass-card group transition-all duration-500 overflow-hidden relative ${expired ? 'ring-2 ring-red-100 bg-red-50/10' : ''} ${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}
                    >
                      {/* Subtle gradient hover effect behind the card */}
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none" />
                  <div className={viewMode === 'list' ? 'flex items-center gap-6 flex-1' : ''}>


                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-black text-slate-800 font-display group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                            {project.name}
                        </h3>
                        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-tight border shadow-sm ${expired
                          ? 'bg-red-50 text-red-600 border-red-100'
                          : ROLE_CONFIG[project.role].color
                          }`}>
                          {expired ? 'ACCÈS EXPIRÉ' : ROLE_CONFIG[project.role].label}
                        </span>

                        {project.isActive && !expired && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-tight">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            ACTIF
                          </div>
                        )}

                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-tight border shadow-sm ${STATUS_CONFIG[project._source.status]?.color || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                          {STATUS_CONFIG[project._source.status]?.label || project._source.status}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400">
                          <Calendar className="w-4 h-4 text-slate-300" />
                          <span>Assigné le {formatDate(project.assignedAt)}</span>
                        </div>

                        {project.expiresAt && (
                          <div className={`flex items-center gap-3 text-[11px] font-bold ${expired ? 'text-red-500' : 'text-slate-400'}`}>
                            <Clock className="w-4 h-4 opacity-70" />
                            <span>
                              {expired
                                ? `Expiré le ${formatDate(project.expiresAt)}`
                                : daysUntilExpiry !== null && daysUntilExpiry <= 7
                                  ? `Expire dans ${daysUntilExpiry} jour(s)`
                                  : `Echéance : ${formatDate(project.expiresAt)}`
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={`flex items-center gap-3 ${viewMode === 'list' ? '' : 'mt-8 pt-4 border-t border-slate-100/50'}`}>
                      <button 
                        onClick={() => {
                          dispatch({ type: 'SELECT_PROJECT', id: project.id });
                          navigate(`/projects/${project.id}`);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border border-slate-100 hover:border-indigo-100 shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Aperçu
                      </button>
                      <button 
                        onClick={() => setSelectedProjectForSettings(project._source)}
                        className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-xl transition-all border border-slate-100 shadow-sm"
                        title="Paramètres"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
              );
            })}
            </AnimatePresence>
          </motion.div>
        )}
      </FadeInView>

      <AnimatePresence>
        {selectedProjectForSettings && (
          <ProjectSettingsModal 
            project={selectedProjectForSettings} 
            onClose={() => setSelectedProjectForSettings(null)} 
          />
        )}
      </AnimatePresence>
    </AppLayout>
  );
};
