import { motion } from 'framer-motion';
import { Mail, MapPin, Copy, Shield, Zap, User, Cpu, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../../../components/ui/Badge';
import type { LeaveRequest } from '../../leave/types/leave.types';

interface EmployeeCardProps {
  employee: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  index: number;
  leaves?: LeaveRequest[];
}

const ROLE_CONFIG: Record<string, { color: string, icon: React.ReactNode, label: string }> = {
  ADMIN: { color: 'bg-rose-500', icon: <Shield className="w-3 h-3" />, label: 'Administrateur' },
  PROJECT_MANAGER: { color: 'bg-indigo-500', icon: <Zap className="w-3 h-3" />, label: 'Manager' },
  DEVELOPER: { color: 'bg-sky-500', icon: <Cpu className="w-3 h-3" />, label: 'Développeur' },
  DESIGNER: { color: 'bg-amber-700', icon: <User className="w-3 h-3" />, label: 'Designer' },
  TEAM_MEMBER: { color: 'bg-slate-500', icon: <User className="w-3 h-3" />, label: 'Membre' },
  DEFAULT: { color: 'bg-slate-400', icon: <User className="w-3 h-3" />, label: 'Employé' }
};

export const EmployeeCard = ({ employee, index, leaves = [] }: EmployeeCardProps) => {
  const roleInfo = ROLE_CONFIG[employee.role] || ROLE_CONFIG.DEFAULT;
  const initials = employee.fullName?.substring(0, 2).toUpperCase() || employee.email.substring(0, 2).toUpperCase();

  // Determine presence status
  const now = new Date();
  const currentLeave = leaves.find(l => 
    l.status === 'APPROVED' && 
    new Date(l.startDate) <= now && 
    new Date(l.endDate) >= now
  );

  const upcomingLeave = leaves
    .filter(l => l.status === 'APPROVED' && new Date(l.startDate) > now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

  const copyEmail = () => {
    navigator.clipboard.writeText(employee.email);
    toast.success('Email copié dans le presse-papier');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:border-indigo-200"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-50/50 to-transparent blur-3xl rounded-full transition-opacity opacity-0 group-hover:opacity-100" />
      
      <div className="relative z-10">
        {/* Header: Avatar & Status */}
        <div className="flex items-start justify-between mb-6">
          <div className="relative">
             <div className={`h-16 w-16 rounded-2xl ${roleInfo.color} flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform duration-500`}>
                {initials}
             </div>
             <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-lg bg-white border-2 border-slate-50 flex items-center justify-center shadow-sm">
                <div className={`h-2 w-2 rounded-full ${currentLeave ? 'bg-orange-500' : 'bg-emerald-500'} ${currentLeave ? 'animate-pulse' : ''}`} />
             </div>
          </div>
          
          <Badge variant="outline" className="h-6 px-3 bg-slate-50/50 border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
            {roleInfo.icon}
            {roleInfo.label}
          </Badge>
        </div>

        {/* Content */}
        <div className="space-y-1 mb-6">
          <h3 className="text-lg font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
            {employee.fullName || 'Utilisateur'}
          </h3>
          
          {/* Absence Status Badge */}
          <div className="flex items-center gap-2 mt-2">
            {currentLeave ? (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-orange-50 border border-orange-100 text-[10px] font-bold text-orange-600 uppercase tracking-tight">
                <Clock className="w-3 h-3" />
                En congé (Retour: {new Date(currentLeave.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })})
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-600 uppercase tracking-tight">
                <CheckCircle2 className="w-3 h-3" />
                Disponible
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-50">
          <div className="flex items-center justify-between group/info">
            <div className="flex items-center gap-3 text-sm text-slate-500 font-medium overflow-hidden">
               <Mail className="w-4 h-4 text-slate-300 shrink-0" />
               <span className="truncate">{employee.email}</span>
            </div>
            <button 
              onClick={copyEmail}
              className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all"
              title="Copier l'email"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>



          {upcomingLeave && !currentLeave && (
            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 p-2 rounded-xl border border-slate-100">
               <Calendar className="w-3.5 h-3.5 text-slate-300 shrink-0" />
               <span>Prochain congé: {new Date(upcomingLeave.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>
            </div>
          )}
        </div>

        {/* Action Buttons could go here */}
      </div>
    </motion.div>
  );
};
