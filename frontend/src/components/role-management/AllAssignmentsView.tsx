import React, { useState } from 'react';
import { 
  Edit, 
  Trash2,
  UserCheck,
  CheckCircle,
  X
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
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Toutes Les Assignations ({assignments.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-transparent hover:bg-transparent">
              <TableHead className="font-semibold text-slate-500 uppercase text-xs">Utilisateur</TableHead>
              <TableHead className="font-semibold text-slate-500 uppercase text-xs">Projet</TableHead>
              <TableHead className="font-semibold text-slate-500 uppercase text-xs">Rôle Assigné</TableHead>
              <TableHead className="font-semibold text-slate-500 uppercase text-xs">Date</TableHead>
              <TableHead className="font-semibold text-slate-500 uppercase text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.length > 0 ? assignments.map((assignment: RoleAssignment) => {
              const roleConfig = ROLE_CONFIG[assignment.role as keyof typeof ROLE_CONFIG];
              const RoleIcon = roleConfig?.icon || UserCheck;
              const isEditing = editingId === assignment.id;
              
              return (
                <TableRow key={assignment.id} className="group border-slate-100/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">
                         {assignment.user.avatar ? <img src={assignment.user.avatar} className="w-full h-full rounded-full object-cover"/> : assignment.user.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm whitespace-nowrap">{assignment.user.fullName}</p>
                        <p className="text-xs text-slate-500">{assignment.user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900 text-sm">{assignment.project.name || `Projet #${assignment.project.id.slice(0, 6)}`}</div>
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Select value={editingRole} onValueChange={(val) => setEditingRole(val || '')}>
                         <SelectTrigger className="w-[160px] h-8 text-xs">
                           <SelectValue placeholder="Rôle" />
                         </SelectTrigger>
                         <SelectContent>
                           {Object.entries(ROLE_CONFIG).map(([rKey, config]) => (
                             <SelectItem key={rKey} value={rKey} className="text-xs">{config.label}</SelectItem>
                           ))}
                         </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className={`${roleConfig?.color || 'bg-slate-50 text-slate-700'}`}>
                        {roleConfig?.label || assignment.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                    {new Date(assignment.createdAt).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isEditing ? (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => { onUpdateRole(assignment.id, editingRole); setEditingId(null); }} className="text-emerald-600 hover:bg-emerald-50" title="Sauvegarder">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600" title="Annuler">
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => { setEditingId(assignment.id); setEditingRole(assignment.role); }} className="text-primary-600 hover:bg-primary-50 opacity-0 group-hover:opacity-100" title="Modifier">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => onRemoveRole(assignment.user.id, assignment.project.id, assignment.user.fullName, assignment.project.name)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100" title="Supprimer">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            }) : (
                <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-slate-500 text-sm">
                        Aucune assignation trouvée
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
