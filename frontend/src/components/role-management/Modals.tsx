import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  CheckCircle, 
  AlertCircle,
  ChevronsUpDown,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { User, Project } from './types';
import { ROLE_CONFIG } from './types';

interface BulkAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  projects: Project[];
  onBulkAssign: (userId: string, assignments: { projectId: string; role: string }[]) => Promise<void>;
}

export const BulkAssignModal: React.FC<BulkAssignModalProps> = ({ isOpen, onClose, user, projects, onBulkAssign }) => {
  const [assignments, setAssignments] = useState<{ projectId: string; role: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!isOpen || !user) return null;

  const handleSubmit = async () => {
    if (assignments.length > 0) {
       setIsSubmitting(true);
       try {
         await onBulkAssign(user.id, assignments);
         setAssignments([]);
         onClose();
       } finally {
         setIsSubmitting(false);
       }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Assignations multiples</h3>
            <p className="text-sm text-slate-500 mt-1">Gérer les accès pour <span className="font-semibold text-slate-700">{user.fullName}</span></p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          <div>
             <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest mb-3">1. Projets</label>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {projects.map((p: Project) => {
                     const isAssigned = assignments.find(a => a.projectId === p.id);
                     return (
                         <button 
                            key={p.id}
                            onClick={() => {
                                if (isAssigned) setAssignments(assignments.filter(a => a.projectId !== p.id));
                                else setAssignments([...assignments, { projectId: p.id, role: 'TEAM_MEMBER'}]);
                            }}
                            className={`p-3 rounded-xl border text-left transition-all ${
                                isAssigned ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                         >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className={`font-semibold text-sm ${isAssigned ? 'text-primary-900' : 'text-slate-900'}`}>{p.name}</p>
                                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{p.description}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 ${
                                    isAssigned ? 'bg-primary-500 border-primary-500 text-white' : 'border-slate-300 bg-white hidden'
                                }`}>
                                    <CheckCircle className="w-3.5 h-3.5" />
                                </div>
                            </div>
                         </button>
                     );
                 })}
             </div>
          </div>

          {assignments.length > 0 && (
             <div>
                 <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest mb-3">2. Configurer les Rôles</label>
                 <div className="space-y-3">
                    {assignments.map(a => {
                        const project = projects.find((p: Project) => p.id === a.projectId);
                        return (
                            <div key={a.projectId} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-slate-900 truncate">{project?.name}</p>
                                </div>
                                <select
                                  value={a.role}
                                  onChange={(e) => setAssignments(assignments.map(x => x.projectId === a.projectId ? {...x, role: e.target.value} : x))}
                                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:ring-2 focus:ring-primary-500/20 outline-none w-48 shadow-sm"
                                >
                                  {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                                    <option key={role} value={role}>{config.label}</option>
                                  ))}
                                </select>
                            </div>
                        )
                    })}
                 </div>
             </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
           <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-200/50 transition-colors">
              Annuler
           </button>
           <button 
              onClick={handleSubmit}
              disabled={assignments.length === 0}
              className="px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm"
           >
              Confirmer l'assignation ({assignments.length})
           </button>
        </div>
      </motion.div>
    </div>
  );
};

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  users: User[];
  existingUserIds?: string[];
  onAssignRole: (userId: string, projectId: string, role: string) => Promise<void>;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, project, users, existingUserIds = [], onAssignRole }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('TEAM_MEMBER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
        setIsSubmitting(true);
        try {
          await onAssignRole(selectedUser, project.id, selectedRole);
          setSelectedUser('');
          setSelectedRole('TEAM_MEMBER');
          onClose();
        } finally {
          setIsSubmitting(false);
        }
    }
  };

  const selectedUserDisplay = selectedUser
    ? (() => {
        const u = users.find((user: User) => user.id === selectedUser);
        return u ? `${u.fullName} (${u.email})` : "Rechercher par nom...";
      })()
    : "Rechercher par nom...";

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Ajouter à {project.name}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           <div className="flex flex-col">
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Utilisateur à ajouter</label>
               <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-400 transition-all">
                 <Command className="bg-transparent border-none">
                   <CommandInput 
                      placeholder="Rechercher par nom..." 
                      className="h-12 border-none focus:ring-0 bg-transparent placeholder:text-slate-400"
                   />
                   <CommandList className="max-h-[180px] border-t border-slate-100">
                     <CommandEmpty className="py-4 text-center text-sm text-slate-500">Aucun membre trouvé.</CommandEmpty>
                     <CommandGroup>
                       {users.filter(u => !existingUserIds.includes(u.id)).map((u: User) => (
                         <CommandItem
                           key={u.id}
                           value={`${u.fullName} ${u.email} ${u.id}`.toLowerCase()}
                           onSelect={() => setSelectedUser(u.id)}
                           className={cn(
                             "flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors",
                             selectedUser === u.id ? "bg-primary-50 text-primary-900" : "hover:bg-slate-100 text-slate-700 data-[selected=true]:bg-slate-100"
                           )}
                         >
                           <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                              {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover"/> : <span className="text-xs font-bold text-slate-500">{u.fullName.charAt(0)}</span>}
                           </div>
                           <div className="flex-1 flex flex-col min-w-0">
                             <p className="font-semibold text-sm truncate">{u.fullName}</p>
                             <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                           </div>
                           {selectedUser === u.id && (
                             <div className="bg-primary-100 p-1 rounded-full text-primary-600">
                                <Check className="h-3 w-3" />
                             </div>
                           )}
                         </CommandItem>
                       ))}
                     </CommandGroup>
                   </CommandList>
                 </Command>
               </div>
               {selectedUser && (
                  <div className="mt-2 flex items-center gap-2 px-2 py-1 bg-primary-50/50 rounded-lg border border-primary-100 w-fit">
                    <span className="text-[10px] font-bold text-primary-600 uppercase">Sélection :</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {users.find(u => u.id === selectedUser)?.fullName}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setSelectedUser('')}
                      className="ml-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
               )}
               <input type="text" className="w-0 h-0 opacity-0 absolute" value={selectedUser} required onChange={() => {}} tabIndex={-1} />
           </div>
           <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rôle</label>
               <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
               >
                  {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                    <option key={role} value={role}>{config.label}</option>
                  ))}
               </select>
           </div>
           
           <div className="pt-2 flex gap-3">
               <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-100 transition-colors">
                   Annuler
               </button>
               <button type="submit" disabled={!selectedUser} className="flex-1 py-3 rounded-xl font-medium text-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm shadow-primary-500/30">
                   Ajouter
               </button>
           </div>
        </form>
      </motion.div>
    </div>
  );
};

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  userName?: string;
  projectName?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ isOpen, onClose, onConfirm, userName, projectName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-md overflow-hidden flex flex-col border border-slate-100"
      >
        <div className="p-4 border-b border-red-100 flex items-center justify-between bg-red-50/50">
          <div className="flex items-center gap-2 text-red-600">
             <AlertCircle className="w-5 h-5" />
             <h3 className="text-[17px] font-semibold">Confirmation de suppression</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 border-b border-slate-100">
           <p className="text-slate-600 text-[15px] leading-relaxed">
             Êtes-vous sûr de vouloir supprimer l'assignation de <span className="font-semibold text-slate-900">"{userName}"</span> sur le projet <span className="font-semibold text-slate-900">"{projectName}"</span> ? Cette action est irréversible.
           </p>
        </div>
        
        <div className="p-4 bg-slate-50/50 flex justify-end gap-3">
           <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-200/50 transition-colors">
               Annuler
           </button>
           <button onClick={onConfirm} className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm shadow-red-500/30">
               Supprimer
           </button>
        </div>
      </motion.div>
    </div>
  );
};
