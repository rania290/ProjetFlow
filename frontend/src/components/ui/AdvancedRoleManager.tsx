import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api-client';
import {
  Users,
  UserPlus,
  Crown,
  Briefcase,
  UserCheck,
  UserX,
  Code,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  GitBranch,
  Shield,
  Eye,
  RefreshCw
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}

interface RoleAssignment {
  id: string;
  user: User;
  project: Project;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'TEAM_MEMBER' | 'CLIENT' | 'DEVELOPER' | 'DESIGNER' | 'TESTER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assignedBy?: string;
  notes?: string;
  expiresAt?: string;
}

interface UserProjectRolesResponse {
  userId: string;
  userFullName: string;
  userEmail: string;
  projects: {
    projectId: string;
    projectName: string;
    role: string;
    isActive: boolean;
    assignedAt: string;
    expiresAt?: string;
  }[];
  totalProjects: number;
}

const ROLE_CONFIG = {
  ADMIN: {
    label: 'Admin',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Crown,
    description: 'Accès complet au projet',
    level: 100
  },
  PROJECT_MANAGER: {
    label: 'Chef de Projet',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Briefcase,
    description: 'Gestion du projet et équipe',
    level: 80
  },
  DEVELOPER: {
    label: 'Développeur',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: Code,
    description: 'Développement et code',
    level: 60
  },
  DESIGNER: {
    label: 'Designer',
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    icon: Shield,
    description: 'Design et UX/UI',
    level: 60
  },
  TESTER: {
    label: 'Testeur',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Eye,
    description: 'Tests et QA',
    level: 50
  },
  TEAM_MEMBER: {
    label: 'Membre',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: UserCheck,
    description: 'Participation au projet',
    level: 40
  },
  CLIENT: {
    label: 'Client',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: UserX,
    description: 'Accès consultation uniquement',
    level: 20
  }
};

export const AdvancedRoleManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<UserProjectRolesResponse | null>(null);
  const [allAssignments, setAllAssignments] = useState<RoleAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'user-centric' | 'project-centric' | 'all-assignments'>('user-centric');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserRoles(selectedUser.id);
    }
  }, [selectedUser]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [usersRes, projectsRes, assignmentsRes] = await Promise.all([
        api.get('/users'),
        api.get('/projects'),
        api.get('/role-assignments/all')
      ]);

      setUsers(usersRes.data);
      setProjects(projectsRes.data && projectsRes.data.length > 0 ? projectsRes.data : [
        { id: '1', name: 'Projet Alpha', description: 'Application web principale' },
        { id: '2', name: 'Projet Beta', description: 'API REST' }
      ]);
      setAllAssignments(assignmentsRes.data);
    } catch (err) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRoles = async (userId: string) => {
    try {
      const response = await api.get(`/role-assignments/user/${userId}/projects`);
      setUserRoles(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des rôles utilisateur');
    }
  };

  const assignRole = async (userId: string, projectId: string, role: string, notes?: string) => {
    try {
      const payload: any = {
        userId,
        projectId,
        role
      };

      // Ajouter notes seulement si non vide
      if (notes && notes.trim()) {
        payload.notes = notes;
      }

      console.log('Assign role payload:', payload);
      await api.post('/role-assignments/assign', payload);

      // Refresh data
      if (selectedUser?.id === userId) {
        fetchUserRoles(userId);
      }
      fetchInitialData();
    } catch (err: any) {
      console.error('Erreur assign role:', err);
      console.error('Détail erreur:', err.response?.data);
      setError(`Erreur: ${err.response?.data?.message || err.message}`);
    }
  };

  const updateRole = async (assignmentId: string, role: string, notes?: string) => {
    try {
      const payload: any = { role };
      if (notes && notes.trim()) {
        payload.notes = notes;
      }

      console.log('Update role payload:', payload);
      await api.put(`/role-assignments/${assignmentId}`, payload);

      fetchInitialData();
    } catch (err: any) {
      console.error('Erreur update role:', err);
      console.error('Détail erreur:', err.response?.data);
      setError(`Erreur: ${err.response?.data?.message || err.message}`);
    }
  };

  const bulkAssignRoles = async (userId: string, assignments: { projectId: string; role: string; notes?: string }[]) => {
    try {
      // Utiliser le premier projet comme référence pour le bulk assign
      const firstAssignment = assignments[0];
      if (!firstAssignment) {
        setError('Aucune assignation à effectuer');
        return;
      }

      // Validation des données
      if (!userId || !firstAssignment.projectId || !firstAssignment.role) {
        setError('Données invalides: userId, projectId et role sont requis');
        return;
      }

      const payload: any = {
        assignments: assignments.map(a => {
          const userAssignment: any = {
            userId,
            projectId: a.projectId || firstAssignment.projectId,
            role: a.role || firstAssignment.role
          };
          // N'ajouter notes que si non vide
          if (a.notes && a.notes.trim()) {
            userAssignment.notes = a.notes;
          }
          return userAssignment;
        })
      };

      // Ajouter notes principal seulement si non vide
      if (firstAssignment.notes && firstAssignment.notes.trim()) {
        payload.notes = firstAssignment.notes;
      }

      console.log('Payload envoyé:', payload);
      const response = await api.post('/role-assignments/bulk-assign', payload);
      console.log('Réponse:', response);

      fetchUserRoles(userId);
      fetchInitialData();
    } catch (err: any) {
      console.error('Erreur bulk assign:', err);
      console.error('Détail erreur:', err.response?.data);
      setError(`Erreur: ${err.response?.data?.message || err.message}`);
    }
  };
  const removeRole = async (userId: string, projectId: string, reason?: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette assignation de rôle ?")) {
      return;
    }

    try {
      await api.delete('/role-assignments/remove', {
        data: { userId, projectId, reason }
      });

      if (selectedUser?.id === userId) {
        fetchUserRoles(userId);
      }
      fetchInitialData();
    } catch (err: any) {
      console.error('Erreur lors de la suppression du rôle:', err);
      setError(`Erreur lors de la suppression du rôle: ${err.response?.data?.message || err.message}`);
    }
  };


  const getRoleStats = () => {
    const stats = Object.keys(ROLE_CONFIG).reduce((acc, role) => {
      acc[role] = 0;
      return acc;
    }, {} as { [key: string]: number });

    allAssignments.forEach(assignment => {
      if (stats[assignment.role] !== undefined) {
        stats[assignment.role]++;
      }
    });

    return stats;
  };

  const filteredAssignments = allAssignments.filter(assignment => {
    const matchesSearch = assignment.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || assignment.role === roleFilter;
    const matchesProject = projectFilter === 'all' || assignment.project.id === projectFilter;

    return matchesSearch && matchesRole && matchesProject;
  });

  const roleStats = getRoleStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Gestion Avancée des Rôles</h1>
              <p className="text-slate-600 mt-1">
                Système multi-projets • {allAssignments.length} assignation(s) active(s)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchInitialData}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700">Vue :</span>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('user-centric')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'user-centric'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Par Utilisateur
              </button>
              <button
                onClick={() => setViewMode('project-centric')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'project-centric'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <Briefcase className="w-4 h-4 inline mr-2" />
                Par Projet
              </button>
              <button
                onClick={() => setViewMode('all-assignments')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'all-assignments'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <GitBranch className="w-4 h-4 inline mr-2" />
                Toutes les Assignations
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Object.entries(ROLE_CONFIG).map(([role, config]) => {
            const Icon = config.icon;
            const count = roleStats[role] || 0;
            return (
              <div key={role} className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="flex flex-col items-center gap-2">
                  <div className={`p-2 rounded-lg ${config.color.split(' ')[0]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{count}</p>
                    <p className="text-xs font-medium text-slate-600">{config.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher utilisateur, projet ou rôle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Tous les rôles</option>
              {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                <option key={role} value={role}>{config.label}</option>
              ))}
            </select>

            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Tous les projets</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
              <button onClick={() => setError(null)} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        {viewMode === 'user-centric' && (
          <UserCentricView
            users={users}
            projects={projects}
            selectedUser={selectedUser}
            userRoles={userRoles}
            onSelectUser={setSelectedUser}
            onBulkAssignRoles={bulkAssignRoles}
            onRemoveRole={removeRole}
          />
        )}

        {viewMode === 'project-centric' && (
          <ProjectCentricView
            projects={projects}
            users={users}
            assignments={filteredAssignments}
            onAssignRole={assignRole}
            onRemoveRole={removeRole}
          />
        )}

        {viewMode === 'all-assignments' && (
          <AllAssignmentsView
            assignments={filteredAssignments}
            onRemoveRole={removeRole}
            onUpdateRole={updateRole}
          />
        )}
      </div>
    </div>
  );
};

// User Centric View Component
const UserCentricView: React.FC<{
  users: User[];
  projects: Project[];
  selectedUser: User | null;
  userRoles: UserProjectRolesResponse | null;
  onSelectUser: (user: User) => void;
  onBulkAssignRoles: (userId: string, assignments: { projectId: string; role: string; notes?: string }[]) => void;
  onRemoveRole: (userId: string, projectId: string, reason?: string) => void;
}> = ({ users, projects, selectedUser, userRoles, onSelectUser, onBulkAssignRoles, onRemoveRole }) => {
  const [showBulkAssign, setShowBulkAssign] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Users List */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Utilisateurs</h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => onSelectUser(user)}
                className={`w-full p-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 ${selectedUser?.id === user.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{user.fullName}</p>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Details */}
      <div className="lg:col-span-2">
        {selectedUser ? (
          <div className="space-y-6">
            {/* User Header */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-bold text-xl">
                      {selectedUser.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedUser.fullName}</h2>
                    <p className="text-slate-600">{selectedUser.email}</p>
                    <p className="text-sm text-indigo-600 font-medium">
                      {userRoles?.totalProjects || 0} projet(s) assigné(s)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBulkAssign(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Assignation multiple
                </button>
              </div>
            </div>

            {/* User Roles */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Rôles par Projet</h3>
              </div>
              <div className="p-4">
                {userRoles?.projects.length ? (
                  <div className="space-y-3">
                    {userRoles.projects.map((projectRole) => {
                      const RoleIcon = ROLE_CONFIG[projectRole.role as keyof typeof ROLE_CONFIG]?.icon || UserCheck;
                      return (
                        <motion.div
                          key={projectRole.projectId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 border border-slate-200 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${ROLE_CONFIG[projectRole.role as keyof typeof ROLE_CONFIG]?.color.split(' ')[0] || 'bg-slate-100'
                                }`}>
                                <RoleIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{projectRole.projectName}</p>
                                <p className="text-sm text-slate-600">
                                  Assigné le {new Date(projectRole.assignedAt).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${ROLE_CONFIG[projectRole.role as keyof typeof ROLE_CONFIG]?.color || 'bg-slate-100 text-slate-800'
                                }`}>
                                {ROLE_CONFIG[projectRole.role as keyof typeof ROLE_CONFIG]?.label || projectRole.role}
                              </span>
                              <button
                                onClick={() => onRemoveRole(selectedUser.id, projectRole.projectId)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <UserPlus className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Aucun projet assigné</p>
                    <button
                      onClick={() => setShowBulkAssign(true)}
                      className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Assigner des projets
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Sélectionnez un utilisateur</h3>
            <p className="text-slate-600">
              Choisissez un utilisateur pour voir et gérer ses rôles dans différents projets
            </p>
          </div>
        )}
      </div>

      {/* Bulk Assign Modal */}
      <BulkAssignModal
        isOpen={showBulkAssign}
        onClose={() => setShowBulkAssign(false)}
        user={selectedUser}
        projects={projects}
        onBulkAssign={onBulkAssignRoles}
      />
    </div>
  );
};

// Project Centric View Component
const ProjectCentricView: React.FC<{
  projects: Project[];
  users: User[];
  assignments: RoleAssignment[];
  onAssignRole: (userId: string, projectId: string, role: string, notes?: string) => void;
  onRemoveRole: (userId: string, projectId: string, reason?: string) => void;
}> = ({ projects, users, assignments, onAssignRole, onRemoveRole }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);

  const projectAssignments = selectedProject
    ? assignments.filter((a: RoleAssignment) => a.project.id === selectedProject.id)
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Projects List */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Projets</h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`w-full p-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 ${selectedProject?.id === project.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''
                  }`}
              >
                <div>
                  <p className="font-medium text-slate-900">{project.name}</p>
                  <p className="text-sm text-slate-600">{project.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                      {project.status}
                    </span>
                    <span className="text-xs text-slate-500">
                      {assignments.filter((a: RoleAssignment) => a.project.id === project.id).length} membre(s)
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Project Members */}
      <div className="lg:col-span-2">
        {selectedProject ? (
          <div className="space-y-6">
            {/* Project Header */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedProject.name}</h2>
                  <p className="text-slate-600">{selectedProject.description}</p>
                  <p className="text-sm text-indigo-600 font-medium">
                    {projectAssignments.length} membre(s) dans le projet
                  </p>
                </div>
                <button
                  onClick={() => setShowAddMember(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Ajouter un membre
                </button>
              </div>
            </div>

            {/* Members List */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Membres du Projet</h3>
              </div>
              <div className="p-4">
                {projectAssignments.length ? (
                  <div className="space-y-3">
                    {projectAssignments.map((assignment) => {
                      const RoleIcon = ROLE_CONFIG[assignment.role as keyof typeof ROLE_CONFIG]?.icon || UserCheck;
                      return (
                        <motion.div
                          key={assignment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 border border-slate-200 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 font-semibold">
                                  {assignment.user.fullName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{assignment.user.fullName}</p>
                                <p className="text-sm text-slate-600">{assignment.user.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${ROLE_CONFIG[assignment.role as keyof typeof ROLE_CONFIG]?.color || 'bg-slate-100 text-slate-800'
                                }`}>
                                <RoleIcon className="w-3 h-3 inline mr-1" />
                                {ROLE_CONFIG[assignment.role as keyof typeof ROLE_CONFIG]?.label || assignment.role}
                              </span>
                              <button
                                onClick={() => onRemoveRole(assignment.user.id, selectedProject.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <UserPlus className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Aucun membre dans ce projet</p>
                    <button
                      onClick={() => setShowAddMember(true)}
                      className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Ajouter des membres
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Sélectionnez un projet</h3>
            <p className="text-slate-600">
              Choisissez un projet pour voir et gérer ses membres et leurs rôles
            </p>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        project={selectedProject}
        users={users}
        onAssignRole={onAssignRole}
      />
    </div>
  );
};

// All Assignments View Component
const AllAssignmentsView: React.FC<{
  assignments: RoleAssignment[];
  onRemoveRole: (userId: string, projectId: string, reason?: string) => void;
  onUpdateRole: (assignmentId: string, role: string, notes?: string) => void;
}> = ({ assignments, onRemoveRole, onUpdateRole }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string>('');

  const handleStartEdit = (assignment: RoleAssignment) => {
    setEditingId(assignment.id);
    setEditingRole(assignment.role);
  };

  const handleSaveEdit = (assignment: RoleAssignment) => {
    if (editingRole && editingRole !== assignment.role) {
      onUpdateRole(assignment.id, editingRole);
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900">Toutes les Assignations de Rôles</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Utilisateur</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Projet</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rôle</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Assigné le</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Statut</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {assignments.map((assignment) => {
              const RoleIcon = ROLE_CONFIG[assignment.role as keyof typeof ROLE_CONFIG]?.icon || UserCheck;
              return (
                <tr key={assignment.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold text-xs">
                          {assignment.user.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{assignment.user.fullName}</p>
                        <p className="text-sm text-slate-600">{assignment.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{assignment.project.name}</p>
                      {assignment.project.description && (
                        <p className="text-sm text-slate-600">{assignment.project.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {editingId === assignment.id ? (
                      <select
                        value={editingRole}
                        onChange={(e) => setEditingRole(e.target.value)}
                        className="px-2 py-1 border border-indigo-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        {Object.entries(ROLE_CONFIG).map(([rKey, config]) => (
                          <option key={rKey} value={rKey}>{config.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${ROLE_CONFIG[assignment.role as keyof typeof ROLE_CONFIG]?.color || 'bg-slate-100 text-slate-800'}`}>
                        <RoleIcon className="w-3 h-3 inline mr-1" />
                        {ROLE_CONFIG[assignment.role as keyof typeof ROLE_CONFIG]?.label || assignment.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {new Date(assignment.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${assignment.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {assignment.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {editingId === assignment.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(assignment)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Sauvegarder">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={handleCancelEdit} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors" title="Annuler">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(assignment)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Modifier le rôle"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onRemoveRole(assignment.user.id, assignment.project.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Supprimer l'assignation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Bulk Assign Modal Component
const BulkAssignModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  projects: Project[];
  onBulkAssign: (userId: string, assignments: { projectId: string; role: string; notes?: string }[]) => void;
}> = ({ isOpen, onClose, user, projects, onBulkAssign }) => {
  const [assignments, setAssignments] = useState<{ projectId: string; role: string; notes?: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddProject = (projectId: string) => {
    if (!assignments.find(a => a.projectId === projectId)) {
      setAssignments([...assignments, { projectId, role: 'TEAM_MEMBER' }]);
    }
  };

  const handleUpdateRole = (projectId: string, role: string) => {
    setAssignments(assignments.map(a =>
      a.projectId === projectId ? { ...a, role } : a
    ));
  };

  const handleRemoveProject = (projectId: string) => {
    setAssignments(assignments.filter(a => a.projectId !== projectId));
  };

  const handleSubmit = async () => {
    if (!user || assignments.length === 0) return;

    setLoading(true);
    try {
      await onBulkAssign(user.id, assignments);
      setAssignments([]);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Assignation multiple pour {user.fullName}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sélectionner les projets
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              {projects.map((project) => {
                const isAssigned = assignments.find(a => a.projectId === project.id);
                return (
                  <button
                    key={project.id}
                    onClick={() => isAssigned
                      ? handleRemoveProject(project.id)
                      : handleAddProject(project.id)
                    }
                    className={`p-3 rounded-lg text-left border transition-colors ${isAssigned
                      ? 'bg-indigo-50 border-indigo-200'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{project.name}</p>
                        <p className="text-sm text-slate-600">{project.description}</p>
                      </div>
                      {isAssigned && <CheckCircle className="w-5 h-5 text-indigo-600" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Assignment */}
          {assignments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rôles par projet
              </label>
              <div className="space-y-3">
                {assignments.map((assignment) => {
                  const project = projects.find(p => p.id === assignment.projectId);
                  return (
                    <div key={assignment.projectId} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{project?.name}</p>
                        <select
                          value={assignment.role}
                          onChange={(e) => handleUpdateRole(assignment.projectId, e.target.value)}
                          className="mt-1 px-3 py-1 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                            <option key={role} value={role}>{config.label}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => handleRemoveProject(assignment.projectId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || assignments.length === 0}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Assignation...' : `Assigner ${assignments.length} rôle(s)`}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Add Member Modal Component
const AddMemberModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  users: User[];
  onAssignRole: (userId: string, projectId: string, role: string, notes?: string) => void;
}> = ({ isOpen, onClose, project, users, onAssignRole }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('TEAM_MEMBER');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !selectedUser) return;

    setLoading(true);
    try {
      await onAssignRole(selectedUser, project.id, selectedRole, notes);
      setSelectedUser('');
      setSelectedRole('TEAM_MEMBER');
      setNotes('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Ajouter un membre à {project.name}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Utilisateur
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Sélectionner un utilisateur</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Rôle
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                <option key={role} value={role}>{config.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ajouter des notes sur cette assignation..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !selectedUser}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
