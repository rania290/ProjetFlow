import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle, 
  AlertCircle,
  ChevronsUpDown,
  Check,
  RefreshCw,
  Search,
  ChevronRight,
  Users,
  UserPlus,
  Plus,
  Trash2,
  UserCheck,
  Briefcase
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
  onBulkAssign: (userId: string, assignments: { projectId: string; role: string; tjm: number; notes?: string }[]) => Promise<void>;
}

export const BulkAssignModal: React.FC<BulkAssignModalProps> = ({ isOpen, onClose, user, projects, onBulkAssign }) => {
  const [assignments, setAssignments] = useState<{ projectId: string; role: string; tjm: number }[]>([]);
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[200]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20"
      >
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight font-display">Assignations Multiples</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                Gérer les accès pour <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-4">{user.fullName}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-3 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all relative z-10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 bg-white">
          <div>
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">1. Sélection des roadmaps</label>
               </div>
               {assignments.length > 0 && (
                 <button onClick={() => setAssignments([])} className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                   Tout désélectionner
                 </button>
               )}
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {projects.map((p: Project) => {
                     const isAssigned = assignments.find(a => a.projectId === p.id);
                     return (
                         <button 
                            key={p.id}
                            onClick={() => {
                                if (isAssigned) setAssignments(assignments.filter(a => a.projectId !== p.id));
                                else setAssignments([...assignments, { projectId: p.id, role: 'DEVELOPER', tjm: 450}]);
                            }}
                            className={`p-4 rounded-[24px] border-2 text-left transition-all relative overflow-hidden group/item ${
                                isAssigned 
                                  ? 'border-indigo-500 bg-indigo-50/30' 
                                  : 'border-slate-50 bg-slate-50/30 hover:border-slate-200 hover:bg-white hover:shadow-xl hover:shadow-slate-200/20'
                            }`}
                         >
                            <div className="flex items-start justify-between relative z-10">
                                <div className="min-w-0 flex-1">
                                    <p className={`font-black text-xs uppercase tracking-tight truncate ${isAssigned ? 'text-indigo-900' : 'text-slate-900'}`}>{p.name}</p>
                                    <p className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5 italic">{p.description || 'Pas de description'}</p>
                                </div>
                                <div className={`w-6 h-6 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
                                    isAssigned ? 'bg-indigo-600 border-indigo-600 text-white scale-110 shadow-lg shadow-indigo-200' : 'border-slate-200 bg-white group-hover/item:border-slate-300'
                                }`}>
                                    <CheckCircle className={`w-3.5 h-3.5 transition-transform ${isAssigned ? 'scale-100' : 'scale-0'}`} />
                                </div>
                            </div>
                         </button>
                     );
                 })}
             </div>
          </div>

          <AnimatePresence>
            {assignments.length > 0 && (
               <motion.div
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 exit={{ opacity: 0, height: 0 }}
               >
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">2. Configuration des Rôles</label>
                   </div>
                   <div className="space-y-3">
                      {assignments.map(a => {
                          const project = projects.find((p: Project) => p.id === a.projectId);
                          return (
                              <div key={a.projectId} className="flex items-center gap-4 p-4 rounded-[20px] bg-slate-50/50 border border-slate-100 hover:border-indigo-100 transition-colors group/row">
                                  <div className="flex-1 min-w-0">
                                      <p className="font-black text-[10px] tracking-tight text-slate-900 truncate uppercase">{project?.name}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="flex flex-col gap-1">
                                       <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">Rôle</label>
                                       <select
                                          value={a.role}
                                          onChange={(e) => setAssignments(assignments.map(x => x.projectId === a.projectId ? {...x, role: e.target.value} : x))}
                                          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-indigo-600 tracking-widest focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none w-40 shadow-sm transition-all text-center"
                                       >
                                          {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                                          <option key={role} value={role}>{config.label.toUpperCase()}</option>
                                          ))}
                                       </select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                       <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">TJM (DT)</label>
                                       <input
                                          type="number"
                                          min={0}
                                          value={a.tjm}
                                          onChange={(e) => setAssignments(assignments.map(x => x.projectId === a.projectId ? {...x, tjm: parseInt(e.target.value) || 0} : x))}
                                          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 w-24 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                       />
                                    </div>
                                  </div>
                              </div>
                          )
                      })}
                   </div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 border-t border-slate-50 bg-slate-50/20 flex justify-end gap-4">
           <button onClick={onClose} className="px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
              Annuler
           </button>
           <button 
              onClick={handleSubmit}
              disabled={assignments.length === 0 || isSubmitting}
              className="px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:grayscale transition-all shadow-xl shadow-slate-900/10 active:scale-95 flex items-center gap-2"
           >
              {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              Confirmer ({assignments.length})
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
  onAssignRole: (userId: string, projectId: string, role: string, tjm?: number, notes?: string) => Promise<void>;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, project, users, existingUserIds = [], onAssignRole }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('DEVELOPER');
  const [tjm, setTjm] = useState(450);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
        setIsSubmitting(true);
        try {
          await onAssignRole(selectedUser, project.id, selectedRole, tjm);
          setSelectedUser('');
          setSelectedRole('DEVELOPER');
          setTjm(450);
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[200]">
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
           <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">TJM (DT)</label>
                <input
                  type="number"
                  min={0}
                  value={tjm}
                  onChange={e => setTjm(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-indigo-600 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                />
              </div>
           </div>
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[200]">
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
