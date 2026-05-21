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
  Search,
  Edit,
  Trash2,
  MessageSquare,
  AlertCircle,
  X,
  Calendar
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface Project {
  id: string;
  name: string;
}

interface RoleAssignment {
  id: string;
  user: User;
  project: Project;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER' | 'DESIGNER' | 'TESTER' | 'RH' | 'CLIENT';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assignedBy?: string;
  notes?: string;
  expiresAt?: string;
}

interface ProjectMembersResponse {
  projectId: string;
  projectName: string;
  members: RoleAssignment[];
  totalCount: number;
  roleCounts: {
    ADMIN: number;
    PROJECT_MANAGER: number;
    DEVELOPER: number;
    DESIGNER: number;
    TESTER: number;
    RH: number;
    CLIENT: number;
  };
}

const ROLE_CONFIG = {
  ADMIN: {
    label: 'ADMIN',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Crown,
    description: 'Accès complet au projet'
  },
  PROJECT_MANAGER: {
    label: 'CHEF DE PROJET',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Briefcase,
    description: 'Gestion du projet et équipe'
  },
  RH: {
    label: 'RESSOURCES HUMAINES',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: UserCheck,
    description: 'Gestion RH et administration'
  },
  DESIGNER: {
    label: 'DESIGNER',
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    icon: UserCheck,
    description: 'Design et UI/UX'
  },
  TESTER: {
    label: 'TESTEUR',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Eye,
    description: 'Tests et QA'
  },
  DEVELOPER: {
    label: 'DÉVELOPPEUR',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: UserCheck,
    description: 'Développement'
  },
  CLIENT: {
    label: 'CLIENT',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: UserX,
    description: 'Accès consultation uniquement'
  }
};

export const RoleManager: React.FC<{ projectId: string; projectName: string }> = ({
  projectId,
  projectName
}) => {
  const [members, setMembers] = useState<ProjectMembersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingMember, setEditingMember] = useState<RoleAssignment | null>(null);

  useEffect(() => {
    fetchProjectMembers();
  }, [projectId, roleFilter]);

  const fetchProjectMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/role-assignments/project/${projectId}/members`, {
        params: { role: roleFilter !== 'all' ? roleFilter : undefined }
      });
      setMembers(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members?.members.filter(member =>
    member.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleAddMember = async (userId: string, role: string, notes?: string) => {
    try {
      await api.post('/role-assignments/assign', { userId, projectId, role, notes });
      setShowAddMember(false);
      fetchProjectMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleUpdateRole = async (assignmentId: string, role: string, notes?: string) => {
    try {
      await api.put(`/role-assignments/${assignmentId}`, { role, notes });
      setEditingMember(null);
      fetchProjectMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleRemoveMember = async (memberId: string, reason?: string) => {
    try {
      await api.delete(`/role-assignments/${memberId}`);
      fetchProjectMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du membre');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestion des Rôles</h2>
          <p className="text-slate-600 mt-1">{projectName} • {members?.totalCount || 0} membre(s)</p>
        </div>
        <button
          onClick={() => setShowAddMember(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Ajouter un membre
        </button>
      </div>

      {/* Stats Cards */}
      {members && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(ROLE_CONFIG).map(([role, config]) => {
            const Icon = config.icon;
            const count = members.roleCounts[role as keyof typeof members.roleCounts];
            return (
              <div key={role} className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color.split(' ')[0]}`}>
                    <Icon className="w-5 h-5" />
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
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un membre..."
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

      {/* Members List */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>Aucun membre trouvé</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredMembers.map((member) => {
              const RoleIcon = ROLE_CONFIG[member.role].icon;
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">
                          {member.user.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{member.user.fullName}</p>
                        <p className="text-sm text-slate-600">{member.user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${ROLE_CONFIG[member.role].color}`}>
                        <RoleIcon className="w-3 h-3 inline mr-1" />
                        {ROLE_CONFIG[member.role].label}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingMember(member)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {member.notes && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5" />
                        <p className="text-sm text-slate-600">{member.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Project Assignment Info */}
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">
                        {projectName || member.project?.name || 'Projet'} • Assigné le {new Date(member.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onAdd={handleAddMember}
      />

      {/* Edit Member Modal */}
      <EditMemberModal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        onUpdate={handleUpdateRole}
        member={editingMember}
      />
    </div>
  );
};

// Add Member Modal Component
const AddMemberModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAdd: (userId: string, role: string, notes?: string) => void;
}> = ({ isOpen, onClose, onAdd }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('DEVELOPER');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setLoading(true);
    try {
      await onAdd(selectedUser, selectedRole, notes);
      setSelectedUser('');
      setSelectedRole('DEVELOPER');
      setNotes('');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[200]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Ajouter un membre</h3>
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

// Edit Member Modal Component
const EditMemberModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (assignmentId: string, role: string, notes?: string) => void;
  member: RoleAssignment | null;
}> = ({ isOpen, onClose, onUpdate, member }) => {
  const [role, setRole] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setRole(member.role);
      setNotes(member.notes || '');
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    setLoading(true);
    try {
      await onUpdate(member.id, role, notes);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[200]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Modifier le rôle</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <p className="font-medium text-slate-900">{member.user.fullName}</p>
          <p className="text-sm text-slate-600">{member.user.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Rôle
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {Object.entries(ROLE_CONFIG).map(([roleKey, config]) => (
                <option key={roleKey} value={roleKey}>{config.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes
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
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
