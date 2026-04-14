import React from 'react';
import {
  Calendar, CheckCircle, XCircle, Clock,
  MoreHorizontal, Eye, ShieldCheck, User
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { LeaveRequest } from '../types/leave.types';
import { Badge } from '../../../../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../../../../components/ui/dropdown-menu';

interface LeaveTableProps {
  leaves: LeaveRequest[];
  role: 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN';
  onReview?: (id: string) => void;
  onView?: (id: string) => void;
  isLoading?: boolean;
}

export const LeaveTable: React.FC<LeaveTableProps> = ({
  leaves,
  role,
  onReview,
  onView,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="w-full space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Employé</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Type</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Période</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Durée</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Statut</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leaves.map((leave) => (
              <tr key={leave.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-pink-600 text-[10px] font-bold border border-pink-100 shadow-sm">
                      {leave.employeeName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-800 tracking-tight">{leave.employeeName}</span>
                      <span className="text-[10px] text-slate-400 font-medium">#{leave.id.substring(0, 8)}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-lg">
                    {leave.type.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{format(new Date(leave.startDate), 'dd MMM', { locale: fr })}</span>
                    <span className="text-slate-300">→</span>
                    <span>{format(new Date(leave.endDate), 'dd MMM', { locale: fr })}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-pink-50 text-pink-700 text-xs font-black">
                    {leave.durationDays}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {leave.status === 'PENDING' && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-black uppercase tracking-wider">
                        <Clock className="h-3 w-3 animate-pulse" />
                        En attente
                      </div>
                    )}
                    {leave.status === 'APPROVED' && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-black uppercase tracking-wider">
                        <CheckCircle className="h-3 w-3" />
                        Approuvé
                      </div>
                    )}
                    {leave.status === 'REJECTED' && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-[9px] font-black uppercase tracking-wider">
                        <XCircle className="h-3 w-3" />
                        Rejeté
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors focus:outline-none">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-xl border-slate-200 shadow-xl bg-white z-50">
                      <DropdownMenuItem
                        onClick={() => onView?.(leave.id)}
                        className="gap-2 text-xs font-bold text-slate-600 rounded-lg cursor-pointer"
                      >
                        <Eye className="h-4 w-4" /> Voir détails
                      </DropdownMenuItem>
                      {(role === 'MANAGER' || role === 'HR_ADMIN') && leave.status === 'PENDING' && (
                        <DropdownMenuItem
                          onClick={() => onReview?.(leave.id)}
                          className="gap-2 text-xs font-bold text-pink-600 hover:text-pink-700 hover:bg-pink-50 rounded-lg cursor-pointer"
                        >
                          <ShieldCheck className="h-4 w-4" /> Valider / Refuser
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
