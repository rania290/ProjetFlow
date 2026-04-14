import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api-client';
import { 
  AlertCircle, 
  X 
} from 'lucide-react';
import { toast } from "sonner";

import type { 
  User, 
  Project, 
  RoleAssignment, 
  UserProjectRolesResponse 
} from '../role-management/types';
import { ROLE_CONFIG } from '../role-management/types';

import { UserCentricView } from '../role-management/UserCentricView';
import { ProjectCentricView } from '../role-management/ProjectCentricView';
import { AllAssignmentsView } from '../role-management/AllAssignmentsView';
import { ManagerHeader } from '../role-management/ManagerHeader';
import { ManagerFilters } from '../role-management/ManagerFilters';
import { DeleteConfirmModal } from '../role-management/Modals';

export const AdvancedRoleManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<UserProjectRolesResponse | null>(null);
  const [allAssignments, setAllAssignments] = useState<RoleAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; userId: string; projectId: string; userName: string; projectName: string } | null>(null);
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
        { id: '1', name: 'Projet Alpha', status: 'ACTIVE' },
        { id: '2', name: 'Projet Beta', status: 'COMPLETED' }
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

  const assignRole = async (userId: string, projectId: string, role: string, tjm?: number, notes?: string) => {
    setLoading(true);
    try {
      const project = projects.find(p => p.id === projectId);
      const user = users.find(u => u.id === userId);
      const payload: any = { 
        userId, 
        projectId, 
        role,
        tjm,
        user: user ? { id: user.id, fullName: user.fullName, email: user.email } : undefined,
        project: project ? { id: project.id, name: project.name } : undefined
      };
      if (notes?.trim()) payload.notes = notes;
      await api.post('/role-assignments/assign', payload);
      
      if (selectedUser?.id === userId) fetchUserRoles(userId);
      await fetchInitialData();
      
      toast.success("Assignation réussie", {
        description: (
          <div className="flex flex-col gap-1">
            <p className="text-emerald-800">
              <span className="font-bold text-indigo-700 underline decoration-indigo-200">{user?.fullName || "L'utilisateur"}</span> a été avec succès assigné(e) au projet <span className="font-bold text-emerald-700 underline decoration-emerald-200">{project?.name || "Inconnu"}</span>.
            </p>
          </div>
        ),
        duration: 5000,
        className: "bg-emerald-50 border-emerald-100 shadow-lg",
      });
    } catch (err: any) {
      console.error('Assignment error:', err);
      toast.error("Échec de l'assignation", {
        description: err.response?.data?.message || err.message || "Une erreur est survenue lors de l'assignation."
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (assignmentId: string, role: string, notes?: string) => {
    try {
      const payload: any = { role };
      if (notes?.trim()) payload.notes = notes;
      await api.put(`/role-assignments/${assignmentId}`, payload);
      fetchInitialData();
    } catch (err: any) {
      setError(`Erreur: ${err.response?.data?.message || err.message}`);
    }
  };

  const bulkAssignRoles = async (userId: string, assignments: { projectId: string; role: string; tjm: number; notes?: string }[]) => {
    setLoading(true);
    try {
      if (!assignments.length) return;
      const user = users.find(u => u.id === userId);
      const payload = {
        assignments: assignments.map(a => {
          const project = projects.find(p => p.id === a.projectId);
          return {
            userId,
            projectId: a.projectId,
            role: a.role,
            tjm: a.tjm,
            notes: a.notes?.trim(),
            user: user ? { id: user.id, fullName: user.fullName, email: user.email } : undefined,
            project: project ? { id: project.id, name: project.name } : undefined
          };
        })
      };
      await api.post('/role-assignments/bulk-assign', payload);
      
      if (selectedUser?.id === userId) fetchUserRoles(userId);
      await fetchInitialData();
      
      const projectNames = assignments.map(a => projects.find(p => p.id === a.projectId)?.name).filter(Boolean).join(', ');
      toast.success("Assignations réussies", {
        description: (
          <div className="flex flex-col gap-1">
            <p className="text-emerald-800">
              <span className="font-bold text-indigo-700 underline decoration-indigo-200">{user?.fullName || "L'utilisateur"}</span> a été assigné(e) aux projets : <span className="font-bold text-emerald-700 underline decoration-emerald-200">{projectNames || "projets sélectionnés"}</span>.
            </p>
          </div>
        ),
        duration: 6000,
        className: "bg-emerald-50 border-emerald-100 shadow-lg",
      });
    } catch (err: any) {
      console.error('Bulk assignment error:', err);
      toast.error("Échec des assignations", {
        description: err.response?.data?.message || err.message || "Une erreur est survenue lors des assignations groupées."
      });
    } finally {
      setLoading(false);
    }
  };

  const removeRole = (userId: string, projectId: string, userName: string, projectName: string) => {
    setDeleteConfirm({ isOpen: true, userId, projectId, userName, projectName });
  };

  const confirmRemoveRole = async () => {
    if (!deleteConfirm) return;
    try {
      await api.delete('/role-assignments/remove', { data: { userId: deleteConfirm.userId, projectId: deleteConfirm.projectId } });
      if (selectedUser?.id === deleteConfirm.userId) fetchUserRoles(deleteConfirm.userId);
      fetchInitialData();
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(`Erreur de suppression: ${err.response?.data?.message || err.message}`);
      setDeleteConfirm(null);
    }
  };

  const filteredAssignments = allAssignments.filter(assignment => {
    const matchesSearch = assignment.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || assignment.role === roleFilter;
    const matchesProject = projectFilter === 'all' || assignment.project.id === projectFilter;
    return matchesSearch && matchesRole && matchesProject;
  });

  return (
    <div className="space-y-6">
      <ManagerHeader
        totalActive={allAssignments.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRefresh={fetchInitialData}
      />

      <ManagerFilters
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        projectFilter={projectFilter}
        setProjectFilter={setProjectFilter}
        projects={projects}
        roleConfig={ROLE_CONFIG}
        assignments={allAssignments}
      />

      <AnimatePresence mode="wait">
        <motion.div
           key={viewMode}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
        >
          {viewMode === 'user-centric' && (
            <UserCentricView
              users={users.filter(u => u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))}
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
              projects={projects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))}
              users={users}
              assignments={allAssignments}
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
        </motion.div>
      </AnimatePresence>

      <DeleteConfirmModal
        isOpen={!!deleteConfirm?.isOpen}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmRemoveRole}
        userName={deleteConfirm?.userName}
        projectName={deleteConfirm?.projectName}
      />
    </div>
  );
};
