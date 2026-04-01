import React from 'react';
import { 
  Users, 
  Briefcase, 
  Search, 
  RefreshCw, 
  GitBranch, 
  Shield 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ManagerHeaderProps {
  totalActive: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: 'user-centric' | 'project-centric' | 'all-assignments';
  onViewModeChange: (val: 'user-centric' | 'project-centric' | 'all-assignments') => void;
  onRefresh: () => void;
}

export const ManagerHeader: React.FC<ManagerHeaderProps> = ({
  totalActive,
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onRefresh
}) => {
  return (
    <Card className="p-6 border-slate-100 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-slate-900 font-display flex items-center gap-2 uppercase tracking-tight">
                Gestion des Autorisations
                <span className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-400 text-[10px] font-black border border-slate-100">
                  {totalActive} actives
                </span>
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              SYSTÈME D'ACCÈS MULTI-PROJETS
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:w-64 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Chercher accès, utilisateur..."
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 text-sm transition-all placeholder:text-slate-400/70"
            />
          </div>

          <Tabs value={viewMode} onValueChange={(val: any) => onViewModeChange(val)} className="w-full md:w-auto">
            <TabsList className="bg-slate-50/80 p-1 rounded-xl border border-slate-200/50 h-auto">
              <TabsTrigger value="user-centric" className="gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-slate-400"><Users className="w-4 h-4"/> Utilisateurs</TabsTrigger>
              <TabsTrigger value="project-centric" className="gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-slate-400"><Briefcase className="w-4 h-4"/> Projets</TabsTrigger>
              <TabsTrigger value="all-assignments" className="gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-slate-400"><GitBranch className="w-4 h-4"/> Assignations</TabsTrigger>
            </TabsList>
          </Tabs>

          <button onClick={onRefresh} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200">
             <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};
