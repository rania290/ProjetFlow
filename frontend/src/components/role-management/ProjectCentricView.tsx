import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Users, 
  Briefcase, 
  UserPlus, 
  Trash2,
  UserCheck,
  Search
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { User, Project, RoleAssignment } from './types';
import { useRoleConfig } from './useRoleConfig';
import { AddMemberModal } from './Modals';

interface ProjectCentricViewProps {
  projects: Project[];
  users: User[];
  assignments: RoleAssignment[];
  onAssignRole: (userId: string, projectId: string, role: string, tjm?: number, notes?: string) => Promise<void>;
  onRemoveRole: (userId: string, projectId: string, userName: string, projectName: string) => void;
}

export const ProjectCentricView: React.FC<ProjectCentricViewProps> = ({ 
  projects, 
  users, 
  assignments, 
  onAssignRole, 
  onRemoveRole 
}) => {
  const { t, i18n } = useTranslation();
  const roleConfig = useRoleConfig();
  const dateLocale = i18n.language === 'en' ? 'en-US' : 'fr-FR';
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const projectAssignments = selectedProject
    ? assignments.filter((a: RoleAssignment) => a.project.id === selectedProject.id)
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Projects List Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <Card className="flex flex-col h-[calc(100vh-220px)] min-h-[400px] border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/30">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{t('roles.project_catalog')}</h2>
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                value={projectSearch}
                onChange={e => setProjectSearch(e.target.value)}
                placeholder={t('roles.search_roadmap')}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200/60 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 text-slate-700 transition-all font-medium"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {filteredProjects.map((project: Project) => {
              const isActive = selectedProject?.id === project.id;
              const count = assignments.filter((a: RoleAssignment) => a.project.id === project.id).length;
              
              return (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`w-full p-4 flex flex-col gap-3 rounded-2xl transition-all duration-300 text-left group/project border ${
                    isActive 
                      ? 'bg-indigo-50/50 border-indigo-100 shadow-sm' 
                      : 'hover:bg-slate-50 border-transparent hover:border-slate-100'
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <p className={`text-sm font-black tracking-tight truncate pr-2 ${isActive ? 'text-indigo-900' : 'text-slate-900'}`}>
                        {project.name}
                    </p>
                    <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${
                        project.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        project.status === 'COMPLETED' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'text-slate-400 border-slate-100'
                    }`}>
                      {project.status === 'ACTIVE' ? t('roles.status_active') : project.status === 'COMPLETED' ? t('roles.status_done') : t('roles.status_archived')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between w-full">
                     <p className="text-[11px] text-slate-400 font-medium truncate max-w-[180px] italic">
                        {project.description || t('roles.no_description')}
                     </p>
                     <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm transition-transform group-hover/project:scale-105">
                         <Users className="w-3 h-3 text-indigo-400"/> {count}
                     </div>
                  </div>
                </button>
              );
            })}
             {filteredProjects.length === 0 && (
                <div className="p-12 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Briefcase className="w-6 h-6 text-slate-200" />
                    </div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t('roles.no_projects')}</p>
                </div>
            )}
          </div>
        </Card>
      </div>

      {/* Project Details Panel */}
      <div className="lg:col-span-8">
        {selectedProject ? (
          <div className="space-y-6">
             {/* Project Header */}
             <Card className="border-none shadow-sm bg-white rounded-[40px] overflow-hidden relative group/header">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 group-hover/header:scale-125 transition-transform duration-1000" />
              <CardContent className="p-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-inner group-hover/header:rotate-6 transition-transform">
                        <Briefcase className="w-8 h-8"/>
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 font-display tracking-tight uppercase leading-tight">{selectedProject.name}</h2>
                      <p className="text-sm font-medium text-slate-500 mt-1 max-w-xl line-clamp-2 italic opacity-80">{selectedProject.description}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setShowAddMember(true)} 
                    className="gap-2 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 py-6 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-200 active:scale-95 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    {t('roles.add_member')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Team List */}
            <Card className="border-none shadow-sm bg-white rounded-[40px] overflow-hidden min-h-[300px]">
               <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                 <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('roles.project_team')}</h3>
                     <Badge variant="outline" className="text-indigo-600 border-indigo-100 bg-white ml-2 px-2 py-0.5 rounded-full text-[10px] font-black">{projectAssignments.length}</Badge>
                 </div>
               </div>
               <div className="p-0">
                  {projectAssignments.length > 0 ? (
                      <div className="divide-y divide-slate-50">
                          {projectAssignments.map((assignment: RoleAssignment, idx) => {
                               const roleItem = roleConfig[assignment.role as keyof typeof roleConfig];
                               return (
                                  <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    key={assignment.id} 
                                    className="p-5 sm:px-8 hover:bg-indigo-50/30 transition-all flex items-center justify-between group/row border-transparent"
                                  >
                                      <div className="flex items-center gap-5 focus-within:ring-0">
                                          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-sm font-black text-slate-500 shrink-0 border border-slate-100 shadow-sm group-hover/row:scale-110 transition-transform">
                                              {assignment.user.avatar ? (
                                                  <img src={assignment.user.avatar} className="w-full h-full object-cover rounded-2xl" alt=""/>
                                              ) : (
                                                  assignment.user.fullName.charAt(0).toUpperCase()
                                              )}
                                          </div>
                                          <div className="min-w-0">
                                              <p className="text-sm font-black text-slate-900 truncate tracking-tight uppercase">{assignment.user.fullName}</p>
                                              <div className="flex items-center gap-2 mt-0.5 whitespace-nowrap">
                                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{assignment.user.email.split('@')[0]}</p>
                                                 <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                 <p className="text-[9px] text-slate-400 font-medium italic">{t('roles.since_date', { date: new Date(assignment.createdAt).toLocaleDateString(dateLocale) })}</p>
                                              </div>
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-4">
                                         <div className="hidden sm:flex flex-col items-end gap-1">
                                            <Badge variant="outline" className={`items-center px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${roleItem?.color || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                               {roleItem?.label || assignment.role}
                                            </Badge>
                                            {assignment.tjm && (
                                              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded-lg border border-indigo-100/50">
                                                {assignment.tjm} DT/J
                                              </span>
                                            )}
                                         </div>
                                         <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onRemoveRole(assignment.user.id, selectedProject.id, assignment.user.fullName, selectedProject.name)}
                                            className="text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/row:opacity-100 rounded-xl transition-all shadow-sm bg-white"
                                            title={t('roles.remove_from_project')}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                      </div>
                                  </motion.div>
                               );
                          })}
                      </div>
                  ) : (
                      <div className="text-center py-24">
                        <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                            <Briefcase className="w-8 h-8 text-slate-200" />
                        </div>
                        <h4 className="text-slate-900 font-black uppercase tracking-tight mb-2">{t('roles.empty_team')}</h4>
                        <p className="text-xs text-slate-400 font-medium mb-4 max-w-sm mx-auto uppercase tracking-wide">{t('roles.empty_team_hint')}</p>
                      </div>
                  )}
               </div>
            </Card>
            
          </div>
        ) : (
          <Card className="h-[calc(100vh-220px)] min-h-[400px] flex items-center justify-center flex-col text-center p-12 border-none shadow-sm bg-white rounded-[40px] relative overflow-hidden group">
            <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] opacity-20" />
            <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-[32px] flex items-center justify-center mb-8 relative z-10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Briefcase className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3 relative z-10 uppercase tracking-tight font-display">{t('roles.select_project')}</h3>
            <p className="text-slate-400 text-sm max-w-xs relative z-10 font-medium leading-relaxed">
              {t('roles.select_project_hint')}
            </p>
          </Card>
        )}
      </div>

      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        project={selectedProject}
        users={users}
        existingUserIds={projectAssignments.map(a => a.user.id)}
        onAssignRole={onAssignRole}
      />
    </div>
  );
};
