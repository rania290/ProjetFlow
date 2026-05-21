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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <Card className="p-6 border-none shadow-sm bg-white rounded-[32px] overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 p-[2px] shadow-lg shadow-indigo-200/50">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-indigo-600">
              <Shield className="w-7 h-7" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-3 uppercase tracking-tight">
                {t('roles.authorizations', 'Authorizations')}
                <Badge variant="outline" className="px-2.5 py-0.5 rounded-lg bg-indigo-50/50 text-indigo-600 text-[10px] font-black border-indigo-100 uppercase tracking-widest">
                  {t('roles.active_count', '{{count}} actives', { count: totalActive })}
                </Badge>
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
              <span className="w-8 h-px bg-slate-200" />
              {t('roles.multi_project_access', 'Multi-project access system')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">


          <div className="relative w-full md:w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Chercher accès, utilisateur..."
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              autoComplete="off"
              className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 text-sm font-medium transition-all placeholder:text-slate-400/70 shadow-inner"
            />
          </div>

          <Tabs value={viewMode} onValueChange={(val: any) => onViewModeChange(val)} className="w-full md:w-auto">
            <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/40 h-auto gap-1">
              <TabsTrigger value="user-centric" className="gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest data-active:bg-indigo-600 data-active:text-white data-active:shadow-lg data-active:shadow-indigo-200 text-slate-400 transition-all">
                <Users className="w-3.5 h-3.5" /> Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="project-centric" className="gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest data-active:bg-indigo-600 data-active:text-white data-active:shadow-lg data-active:shadow-indigo-200 text-slate-400 transition-all">
                <Briefcase className="w-3.5 h-3.5" /> Projets
              </TabsTrigger>
              <TabsTrigger value="all-assignments" className="gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest data-active:bg-indigo-600 data-active:text-white data-active:shadow-lg data-active:shadow-indigo-200 text-slate-400 transition-all">
                <GitBranch className="w-3.5 h-3.5" /> Historique
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="ghost"
            onClick={onRefresh}
            className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-2xl transition-all border border-transparent hover:border-slate-100"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
