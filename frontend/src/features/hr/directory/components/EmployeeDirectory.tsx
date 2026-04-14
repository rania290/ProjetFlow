import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, ShieldCheck, Cpu, LayoutGrid } from 'lucide-react';
import { Input } from '../../../../components/ui/input';
import { EmployeeCard } from './EmployeeCard';
import { leaveApi } from '../../leave/api/leave.api';
import type { LeaveRequest } from '../../leave/types/leave.types';

interface EmployeeDirectoryProps {
  users: any[];
  isLoading: boolean;
}

type FilterCategory = 'ALL' | 'MANAGEMENT' | 'PRODUCTION' | 'OTHERS';

const CATEGORIES: { id: FilterCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'ALL', label: 'Tous', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'MANAGEMENT', label: 'Direction', icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'PRODUCTION', label: 'Production', icon: <Cpu className="w-4 h-4" /> },
  { id: 'OTHERS', label: 'Autres', icon: <Users className="w-4 h-4" /> },
];

const categoryMatches = (role: string, category: FilterCategory): boolean => {
  if (category === 'ALL') return true;
  if (category === 'MANAGEMENT') return ['ADMIN', 'PROJECT_MANAGER'].includes(role);
  if (category === 'PRODUCTION') return ['DEVELOPER', 'DESIGNER', 'TESTER'].includes(role);
  if (category === 'OTHERS') return ['TEAM_MEMBER', 'CLIENT', 'AURA_AI'].includes(role);
  return false;
};

export const EmployeeDirectory = ({ users, isLoading: usersLoading }: EmployeeDirectoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('ALL');
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [leavesLoading, setLeavesLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaves() {
      try {
        const data = await leaveApi.getLeaves();
        setLeaves(data);
      } catch (err) {
        console.error('Failed to fetch leaves', err);
      } finally {
        setLeavesLoading(false);
      }
    }
    fetchLeaves();
  }, []);

  const isLoading = usersLoading || leavesLoading;

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryMatches(user.role, activeCategory);
      
      return matchesSearch && matchesCategory;
    });
  }, [users, searchTerm, activeCategory]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white/50 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white shadow-xl shadow-pink-100/20">
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-pink-500 transition-colors" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un collaborateur..."
            className="h-12 w-full pl-12 rounded-2xl border-slate-100 bg-white/60 shadow-sm focus:ring-2 focus:ring-pink-500/20 font-medium text-xs transition-all hover:bg-white"
          />
          {searchTerm && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-pink-400 animate-pulse">
              {filteredUsers.length} trouvé(s)
            </div>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-100 overflow-hidden shrink-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeCategory === cat.id
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-100'
                  : 'text-slate-400 hover:text-pink-600 hover:bg-white'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Results */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 rounded-[2rem] bg-white border border-slate-100 animate-pulse" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center p-20 bg-white/40 rounded-[3rem] border-2 border-dashed border-slate-200"
            >
               <Users className="w-16 h-16 text-slate-200 mb-4" />
               <p className="text-lg font-black text-slate-400 tracking-tight">Aucun collaborateur trouvé</p>
               <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-1">Essayez d'autres critères de recherche</p>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              layout
            >
              {filteredUsers.map((user, idx) => (
                <EmployeeCard 
                  key={user.id} 
                  employee={user} 
                  index={idx} 
                  leaves={leaves.filter(l => l.employeeId === user.id)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
