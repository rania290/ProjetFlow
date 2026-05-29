import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Plus, 
  Trash2,
  UserCheck,
  Search,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { User, Project, UserProjectRolesResponse } from './types';
import { useRoleConfig } from './useRoleConfig';
import { BulkAssignModal } from './Modals';

interface UserCentricViewProps {
  users: User[];
  projects: Project[];
  selectedUser: User | null;
  userRoles: UserProjectRolesResponse | null;
  onSelectUser: (user: User) => void;
  onBulkAssignRoles: (userId: string, assignments: { projectId: string; role: string; tjm: number; notes?: string }[]) => Promise<void>;
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
  const { t, i18n } = useTranslation();
  const roleConfig = useRoleConfig();
  const dateLocale = i18n.language === 'en' ? 'en-US' : 'fr-FR';
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Users List Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <Card className="flex flex-col h-[calc(100vh-220px)] min-h-[400px] overflow-hidden border-none shadow-sm bg-white rounded-[32px]">
          <div className="p-6 border-b border-slate-50 bg-slate-50/30">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{t('roles.user_directory')}</h2>
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
              <input 
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder={t('roles.filter_profiles')}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200/60 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400/50 text-slate-700 transition-all font-medium"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
            {filteredUsers.map((user: User) => {
              const isActive = selectedUser?.id === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => onSelectUser(user)}
                  className={`w-full p-3 flex items-center gap-4 rounded-2xl transition-all duration-300 text-left group/user ${
                    isActive 
                      ? 'bg-primary-50/50 border-primary-100 shadow-sm' 
                      : 'hover:bg-slate-50 border border-transparent hover:border-slate-100'
                  } border`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 relative transition-transform duration-300 ${
                    isActive ? 'scale-105' : 'group-hover/user:scale-105'
                  }`}>
                    <div className={`absolute inset-0 rounded-xl opacity-20 ${isActive ? 'bg-primary-500' : 'bg-slate-400 group-hover/user:bg-primary-400'}`} />
                    {user.avatar ? (
                      <img src={user.avatar} className="w-full h-full rounded-xl object-cover relative z-10 border-2 border-white shadow-sm" alt="" />
                    ) : (
                      <span className={`relative z-10 ${isActive ? 'text-primary-700' : 'text-slate-600'}`}>
                        {user.fullName.charAt(0).toUpperCase()}
                      </span>
                    )}
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm z-20" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-black tracking-tight truncate ${isActive ? 'text-primary-900' : 'text-slate-900'}`}>{user.fullName}</p>
                    <p className={`text-[10px] uppercase font-bold tracking-widest truncate mt-0.5 ${isActive ? 'text-primary-600/70' : 'text-slate-400'}`}>
                      {user.email.split('@')[0]}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-all ${isActive ? 'text-primary-400 translate-x-0' : 'text-slate-200 opacity-0 -translate-x-2 group-hover/user:opacity-100 group-hover/user:translate-x-0'}`} />
                </button>
              );
            })}
            {filteredUsers.length === 0 && (
                <div className="p-12 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Users className="w-6 h-6 text-slate-200" />
                    </div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t('roles.no_results')}</p>
                </div>
            )}
          </div>
        </Card>
      </div>

      {/* User Details Panel */}
      <div className="lg:col-span-8">
        {selectedUser ? (
          <div className="space-y-6">
            {/* User Profile Header */}
            <Card className="border-none shadow-sm bg-white rounded-[40px] overflow-hidden relative group/header">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 group-hover/header:scale-125 transition-transform duration-1000" />
              <CardContent className="p-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 p-[3px] shadow-xl shadow-indigo-100">
                      <div className="w-full h-full bg-white rounded-[21px] flex items-center justify-center overflow-hidden">
                         {selectedUser.avatar ? (
                             <img src={selectedUser.avatar} className="w-full h-full object-cover" alt="" />
                         ) : (
                             <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-violet-600">
                                  {selectedUser.fullName.charAt(0).toUpperCase()}
                             </span>
                         )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-black text-slate-900 font-display tracking-tight uppercase leading-tight">{selectedUser.fullName}</h2>
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 text-[10px] font-black uppercase tracking-widest">{t('roles.active_badge')}</Badge>
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover/header:text-indigo-500 transition-colors mt-1">{selectedUser.email}</p>
                      <div className="mt-4 flex items-center gap-4">
                          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                            <Briefcase className="w-3 h-3 text-slate-400" />
                            <span className="text-[10px] text-slate-600 font-black uppercase tracking-tight">
                                {t('roles.project_count', { count: userRoles?.totalProjects || 0 })}
                            </span>
                          </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setShowBulkAssign(true)} 
                    className="gap-2 shrink-0 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-6 py-6 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-900/10 active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    {t('roles.manage_access')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Assignments List */}
            <Card className="border-none shadow-sm bg-white rounded-[40px] overflow-hidden min-h-[300px]">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('roles.roles_by_project')}</h3>
                </div>
              </div>
              <div className="p-8">
                {userRoles?.projects.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userRoles.projects.map((projectRole, idx) => {
                      const roleItem = roleConfig[projectRole.role as keyof typeof roleConfig];
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={projectRole.projectId}
                          className="p-5 rounded-[24px] border border-slate-100 bg-white hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 transition-all group/card relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 group-hover/card:bg-primary-50/30 rounded-full -mr-12 -mt-12 transition-colors duration-500" />
                          
                          <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
                            <div className="flex-1 min-w-0">
                                <h4 className="font-black text-slate-900 truncate uppercase tracking-tight font-display">
                                    {projectRole.projectName || t('roles.project_fallback', { id: projectRole.projectId.slice(0, 6) })}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight italic">
                                      {t('roles.assigned_on', { date: new Date(projectRole.assignedAt).toLocaleDateString(dateLocale) })}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => onRemoveRole(selectedUser.id, projectRole.projectId, selectedUser.fullName, projectRole.projectName)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover/card:opacity-100 shadow-sm bg-white"
                              >
                                <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-3 relative z-10">
                             <div className={`flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${roleItem?.color || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                {roleItem?.label || projectRole.role}
                             </div>
                             {projectRole.tjm && (
                               <span className="text-[10px] font-black text-indigo-600 bg-indigo-50/50 px-2 py-1 rounded-xl border border-indigo-100/50">
                                 {projectRole.tjm} DT/J
                               </span>
                             )}
                             {!projectRole.isActive && (
                                <Badge variant="outline" className="text-slate-400 border-slate-200 text-[9px] font-black uppercase tracking-tighter">{t('roles.inactive_badge')}</Badge>
                             )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-24">
                    <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                        <UserPlus className="w-8 h-8 text-slate-200" />
                    </div>
                    <h4 className="text-slate-900 font-black uppercase tracking-tight mb-2">{t('roles.no_project_assigned')}</h4>
                    <p className="text-xs text-slate-400 font-medium mb-8 max-w-[240px] mx-auto uppercase tracking-wide">{t('roles.no_access_hint')}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ) : (
          <Card className="h-[calc(100vh-220px)] min-h-[400px] flex items-center justify-center flex-col text-center p-12 border-none shadow-sm bg-white rounded-[40px] relative overflow-hidden group">
            <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] opacity-20" />
            <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-[32px] flex items-center justify-center mb-8 relative z-10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Users className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3 relative z-10 uppercase tracking-tight font-display">{t('roles.select_profile')}</h3>
            <p className="text-slate-400 text-sm max-w-xs relative z-10 font-medium leading-relaxed">
              {t('roles.choose_collaborator')}
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
