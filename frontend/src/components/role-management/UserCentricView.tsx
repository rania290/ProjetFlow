import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Plus, 
  Trash2,
  UserCheck
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { User, Project, UserProjectRolesResponse } from './types';
import { ROLE_CONFIG } from './types';
import { BulkAssignModal } from './Modals';

interface UserCentricViewProps {
  users: User[];
  projects: Project[];
  selectedUser: User | null;
  userRoles: UserProjectRolesResponse | null;
  onSelectUser: (user: User) => void;
  onBulkAssignRoles: (userId: string, assignments: { projectId: string; role: string }[]) => Promise<void>;
  onRemoveRole: (userId: string, projectId: string, userName: string, projectName: string) => void;
}

export const UserCentricView: React.FC<UserCentricViewProps> = ({ 
  users, 
  projects, 
  selectedUser, 
  userRoles, 
  onSelectUser, 
  onBulkAssignRoles, 
  onRemoveRole 
}) => {
  const [showBulkAssign, setShowBulkAssign] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Users List Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <Card className="flex flex-col h-[600px] overflow-hidden border-slate-200 shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Annuaire Utilisateurs</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {users.map((user: User) => {
              const isActive = selectedUser?.id === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => onSelectUser(user)}
                  className={`w-full p-3 flex items-center gap-3 rounded-xl transition-all duration-200 text-left ${
                    isActive ? 'bg-primary-50 border border-primary-200/50 shadow-sm' : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    isActive ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="" /> : user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${isActive ? 'text-primary-900' : 'text-slate-900'}`}>{user.fullName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </button>
              );
            })}
            {users.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                    Aucun utilisateur trouvé
                </div>
            )}
          </div>
        </Card>
      </div>

      {/* User Details Panel */}
      <div className="lg:col-span-8">
        {selectedUser ? (
          <div className="space-y-4">
            {/* User Profile Header */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 p-[2px] shadow-sm">
                      <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
                         {selectedUser.avatar ? (
                             <img src={selectedUser.avatar} className="w-full h-full object-cover" alt="" />
                         ) : (
                             <span className="text-2xl font-bold text-indigo-500">
                                  {selectedUser.fullName.charAt(0).toUpperCase()}
                             </span>
                         )}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 leading-tight">{selectedUser.fullName}</h2>
                      <p className="text-sm text-slate-500">{selectedUser.email}</p>
                      <div className="mt-2 flex items-center gap-2">
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Actif</Badge>
                          <span className="text-xs text-slate-400 font-medium">
                              {userRoles?.totalProjects || 0} projet(s) assigné(s)
                          </span>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => setShowBulkAssign(true)} className="gap-2 shrink-0">
                    <Plus className="w-4 h-4" />
                    Gérer les accès
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Assignments List */}
            <Card className="overflow-hidden min-h-[400px] border-slate-200 shadow-sm">
              <div className="p-5 border-b border-slate-100/50 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Rôles par Projet</h3>
              </div>
              <div className="p-5">
                {userRoles?.projects.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userRoles.projects.map((projectRole, idx) => {
                      const roleConfig = ROLE_CONFIG[projectRole.role as keyof typeof ROLE_CONFIG];
                      const RoleIcon = roleConfig?.icon || UserCheck;
                      return (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          key={projectRole.projectId}
                          className="p-4 rounded-xl border border-slate-200/60 bg-white hover:border-slate-300 hover:shadow-sm transition-all group"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-slate-900 truncate">{projectRole.projectName || `Projet #${projectRole.projectId.slice(0, 6)}`}</h4>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Assigné le {new Date(projectRole.assignedAt).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                            <button
                                onClick={() => onRemoveRole(selectedUser.id, projectRole.projectId, selectedUser.fullName, projectRole.projectName)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2">
                             <div className={`flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${roleConfig?.color || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                {roleConfig?.label || projectRole.role}
                             </div>
                             {!projectRole.isActive && (
                                <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500 uppercase">Inactif</span>
                             )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <UserPlus className="w-6 h-6 text-slate-400" />
                    </div>
                    <h4 className="text-slate-900 font-medium mb-1">Aucun projet assigné</h4>
                    <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">Cet utilisateur n'a pas encore de rôles assignés sur les projets.</p>
                    <button
                      onClick={() => setShowBulkAssign(true)}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm hover:underline"
                    >
                      Assigner des projets
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ) : (
          <Card className="h-[600px] flex items-center justify-center flex-col text-center p-8 border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Sélectionnez un profil</h3>
            <p className="text-slate-500 text-sm max-w-md">
              Choisissez un profil dans le panneau de gauche (Annuaire Utilisateurs) pour voir et gérer ses rôles à travers vos différents projets.
            </p>
          </Card>
        )}
      </div>

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
