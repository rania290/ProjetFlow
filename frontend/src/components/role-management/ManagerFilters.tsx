import React from 'react';
import type { Project, RoleConfigType, RoleAssignment } from './types';

interface ManagerFiltersProps {
  roleFilter: string;
  setRoleFilter: (val: string) => void;
  projectFilter: string;
  setProjectFilter: (val: string) => void;
  projects: Project[];
  roleConfig: RoleConfigType;
  assignments: RoleAssignment[];
}

export const ManagerFilters: React.FC<ManagerFiltersProps> = ({
  roleFilter,
  setRoleFilter,
  projectFilter,
  setProjectFilter,
  projects,
  roleConfig,
  assignments
}) => {
  const activeCount = assignments.filter(a => a.isActive).length;
  const inactiveCount = assignments.filter(a => !a.isActive).length;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl text-[10px] font-black text-emerald-700 border border-emerald-100 shadow-sm uppercase tracking-tighter">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Actifs : {activeCount}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 border border-slate-100 shadow-sm uppercase tracking-tighter">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>Inactifs : {inactiveCount}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-end gap-2">
      <div className="flex items-center gap-2">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="py-1.5 pl-3 pr-8 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-tight focus:ring-4 focus:ring-indigo-500/10 outline-none hover:bg-slate-50 transition-colors"
        >
          <option value="all">Tous les rôles</option>
          {Object.entries(roleConfig).map(([role, config]) => (
            <option key={role} value={role}>{config.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="py-1.5 pl-3 pr-8 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-tight focus:ring-4 focus:ring-indigo-500/10 outline-none hover:bg-slate-50 transition-colors"
        >
          <option value="all">Tous les projets</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>
      </div>
    </div>
  );
};
