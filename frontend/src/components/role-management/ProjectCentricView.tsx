import React, { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  UserPlus, 
  Trash2,
  UserCheck
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { User, Project, RoleAssignment } from './types';
import { ROLE_CONFIG } from './types';
import { AddMemberModal } from './Modals';

interface ProjectCentricViewProps {
  projects: Project[];
  users: User[];
  assignments: RoleAssignment[];
  onAssignRole: (userId: string, projectId: string, role: string) => Promise<void>;
  onRemoveRole: (userId: string, projectId: string, userName: string, projectName: string) => void;
}

export const ProjectCentricView: React.FC<ProjectCentricViewProps> = ({ 
  projects, 
  users, 
  assignments, 
  onAssignRole, 
  onRemoveRole 
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);

  const projectAssignments = selectedProject
    ? assignments.filter((a: RoleAssignment) => a.project.id === selectedProject.id)
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Projects List Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <Card className="flex flex-col h-[600px] border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catalogue Projets</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {projects.map((project: Project) => {
              const isActive = selectedProject?.id === project.id;
              const count = assignments.filter((a: RoleAssignment) => a.project.id === project.id).length;
              
              return (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`w-full p-4 flex flex-col gap-2 rounded-xl transition-all duration-200 text-left ${
                    isActive ? 'bg-primary-50 border border-primary-200/50 shadow-sm' : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between w-full border-transparent">
                    <p className={`text-sm font-semibold truncate pr-2 ${isActive ? 'text-primary-900' : 'text-slate-900'}`}>
                        {project.name}
                    </p>
                    <Badge variant={project.status === 'ACTIVE' ? 'default' : project.status === 'COMPLETED' ? 'secondary' : 'outline'} className={
                        project.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' :
                        project.status === 'COMPLETED' ? 'bg-slate-200 text-slate-700 hover:bg-slate-200' : 'text-slate-500'
                    }>
                      {project.status === 'ACTIVE' ? 'En cours' : project.status === 'COMPLETED' ? 'Fait' : 'Archivé'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between w-full">
                     <p className="text-xs text-slate-500 truncate max-w-[150px]">{project.description || 'Aucune description'}</p>
                     <div className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-100">
                         <Users className="w-3 h-3"/> {count}
                     </div>
                  </div>
                </button>
              );
            })}
             {projects.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                    Aucun projet trouvé
                </div>
            )}
          </div>
        </Card>
      </div>

      {/* Project Details Panel */}
      <div className="lg:col-span-8">
        {selectedProject ? (
          <div className="space-y-4">
             {/* Project Header */}
             <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                            <Briefcase className="w-5 h-5"/>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">{selectedProject.name}</h2>
                    </div>
                    <p className="text-sm text-slate-500 ml-11 max-w-xl">{selectedProject.description}</p>
                  </div>
                  <Button onClick={() => setShowAddMember(true)} className="gap-2 shrink-0">
                    <UserPlus className="w-4 h-4" />
                    Ajouter un membre
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Team List */}
            <Card className="overflow-hidden min-h-[400px] border-slate-200 shadow-sm">
               <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div className="flex items-center gap-2">
                     <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Équipe Projet</h3>
                     <Badge variant="secondary">{projectAssignments.length}</Badge>
                 </div>
               </div>
               <div className="p-0">
                  {projectAssignments.length > 0 ? (
                      <div className="divide-y divide-slate-100/50">
                          {projectAssignments.map((assignment: RoleAssignment) => {
                               const roleConfig = ROLE_CONFIG[assignment.role as keyof typeof ROLE_CONFIG];
                               const RoleIcon = roleConfig?.icon || UserCheck;
                               
                               return (
                                  <div key={assignment.id} className="p-4 sm:px-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between group border-transparent">
                                      <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">
                                              {assignment.user.avatar ? (
                                                  <img src={assignment.user.avatar} className="w-full h-full object-cover" alt=""/>
                                              ) : (
                                                  assignment.user.fullName.charAt(0).toUpperCase()
                                              )}
                                          </div>
                                          <div className="min-w-0">
                                              <p className="font-semibold text-slate-900 truncate">{assignment.user.fullName}</p>
                                              <div className="flex items-center gap-2 mt-0.5 whitespace-nowrap">
                                                 <p className="text-xs text-slate-500 truncate">{assignment.user.email}</p>
                                                 <span className="w-1 h-1 rounded-full bg-slate-300 flex-shrink-0"></span>
                                                 <p className="text-[10px] text-slate-400">Ajouté le {new Date(assignment.createdAt).toLocaleDateString('fr-FR')}</p>
                                              </div>
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-4">
                                         <Badge variant="outline" className={`hidden sm:flex items-center px-2.5 py-1 ${roleConfig?.color || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                            {roleConfig?.label || assignment.role}
                                         </Badge>
                                         <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onRemoveRole(assignment.user.id, selectedProject.id, assignment.user.fullName, selectedProject.name)}
                                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100"
                                            title="Retirer du projet"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                      </div>
                                  </div>
                               );
                          })}
                      </div>
                  ) : (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Briefcase className="w-6 h-6 text-slate-400" />
                        </div>
                        <h4 className="text-slate-900 font-medium mb-1">Équipe vide</h4>
                        <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">Il n'y a pas encore de membres assignés à ce projet.</p>
                      </div>
                  )}
               </div>
            </Card>
            
          </div>
        ) : (
          <Card className="h-[600px] flex items-center justify-center flex-col text-center p-8 border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-6">
                <Briefcase className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Sélectionnez un projet</h3>
            <p className="text-slate-500 text-sm max-w-md">
              Choisissez un projet pour voir l'équipe associée et configurer les accès et responsabilités
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
