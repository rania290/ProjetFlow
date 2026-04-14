import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit, 
  Trash2,
  UserCheck,
  CheckCircle,
  X,
  Briefcase
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { RoleAssignment } from './types';
import { ROLE_CONFIG } from './types';

interface AllAssignmentsViewProps {
  assignments: RoleAssignment[];
  onRemoveRole: (userId: string, projectId: string, userName: string, projectName: string) => void;
  onUpdateRole: (assignmentId: string, role: string) => Promise<void>;
}

export const AllAssignmentsView: React.FC<AllAssignmentsViewProps> = ({ 
  assignments, 
  onRemoveRole, 
  onUpdateRole 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string>('');

  return (
    <Card className="overflow-hidden border-none shadow-sm bg-white rounded-[40px]">
      <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
        <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.5)]" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Journal des Assignations</h3>
            <Badge variant="outline" className="text-slate-600 border-slate-200 bg-white ml-2 px-2 py-0.5 rounded-full text-[10px] font-black">{assignments.length}</Badge>
        </div>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <Table>
          <TableHeader>
            <TableRow className="bg-transparent hover:bg-transparent border-slate-50">
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest pl-8 py-5">Collaborateur</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest py-5">Roadmap</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest py-5">Niveau d'accès</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest py-5">TJM</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest py-5">Date d'effet</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest py-5 text-right pr-8">Options</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.length > 0 ? assignments.map((assignment: RoleAssignment, idx) => {
              const roleConfig = ROLE_CONFIG[assignment.role as keyof typeof ROLE_CONFIG];
              const isEditing = editingId === assignment.id;
              
              return (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  key={assignment.id} 
                  className="group/row border-slate-50 hover:bg-slate-50/50 transition-all duration-300"
                >
                  <TableCell className="pl-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-xs font-black text-slate-500 shrink-0 border border-slate-100 shadow-sm group-hover/row:scale-110 transition-transform">
                         {assignment.user.avatar ? (
                             <img src={assignment.user.avatar} className="w-full h-full rounded-2xl object-cover" alt=""/>
                         ) : (
                             assignment.user.fullName.charAt(0).toUpperCase()
                         )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 text-xs whitespace-nowrap uppercase tracking-tight">{assignment.user.fullName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{assignment.user.email.split('@')[0]}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="font-black text-slate-700 text-[11px] uppercase tracking-tight flex items-center gap-2">
                        <Briefcase className="w-3 h-3 text-slate-300" />
                        {assignment.project.name || `Projet #${assignment.project.id.slice(0, 6)}`}
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    {isEditing ? (
                      <Select value={editingRole} onValueChange={(val) => setEditingRole(val || '')}>
                         <SelectTrigger className="w-[160px] h-9 text-[10px] font-black uppercase tracking-widest rounded-xl border-slate-200 bg-white">
                           <SelectValue placeholder="Rôle" />
                         </SelectTrigger>
                         <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                           {Object.entries(ROLE_CONFIG).map(([rKey, config]) => (
                             <SelectItem key={rKey} value={rKey} className="text-[10px] font-black uppercase tracking-widest rounded-lg m-1">{config.label}</SelectItem>
                           ))}
                         </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className={`px-2.5 py-0.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${roleConfig?.color || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                        {roleConfig?.label || assignment.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-5">
                    <span className="text-[11px] font-black text-indigo-600 bg-indigo-50/30 px-2 py-1 rounded-lg border border-indigo-100/30">
                      {assignment.tjm || 450} DT
                    </span>
                  </TableCell>
                  <TableCell className="text-[10px] text-slate-400 font-bold uppercase tracking-tight whitespace-nowrap italic py-5">
                    {new Date(assignment.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-right pr-8 py-5">
                    <div className="flex items-center justify-end gap-2">
                      {isEditing ? (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => { onUpdateRole(assignment.id, editingRole); setEditingId(null); }} className="w-9 h-9 rounded-xl text-emerald-600 hover:bg-emerald-50 bg-emerald-50/10" title="Sauvegarder">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setEditingId(null)} className="w-9 h-9 rounded-xl text-slate-300 hover:text-slate-600 hover:bg-slate-100" title="Annuler">
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => { setEditingId(assignment.id); setEditingRole(assignment.role); }} 
                            className="w-9 h-9 rounded-xl text-slate-300 hover:text-indigo-600 hover:bg-indigo-50/30 opacity-0 group-hover/row:opacity-100 transition-all shadow-sm bg-white border border-transparent hover:border-indigo-100" 
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => onRemoveRole(assignment.user.id, assignment.project.id, assignment.user.fullName, assignment.project.name)} 
                            className="w-9 h-9 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/row:opacity-100 transition-all shadow-sm bg-white border border-transparent hover:border-red-100" 
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </motion.tr>
              );
            }) : (
                <TableRow>
                    <TableCell colSpan={6} className="py-24 text-center">
                        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserCheck className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Aucune assignation</p>
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
