import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Shield, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  BarChart3, 
  Download, 
  MessageSquare, 
  Upload, 
  CheckSquare, 
  Settings, 
  X, 
  Plus, 
  Search, 
  Filter, 
  Lock, 
  AlertCircle, 
  CheckCircle, 
  Calendar, 
  BookOpen, 
  Layers, 
  GitBranch,
  ChevronRight,
  ShieldCheck,
  MoreVertical
} from 'lucide-react';
import { AppLayout } from '../layout/AppLayout';
import api from '../../api/api-client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

interface Permission {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  canViewReports: boolean;
  canExport: boolean;
  canComment: boolean;
  canUploadFiles: boolean;
  canManageTasks: boolean;
  canAccessSettings: boolean;
  canModifierConges: boolean;
  canSupprimerConges: boolean;
  canGererConges: boolean;
  canCreerUserStory: boolean;
  canVoirUserStory: boolean;
  canModifierUserStory: boolean;
  canSupprimerUserStory: boolean;
  canGererUserStory: boolean;
  canCreerSprint: boolean;
  canVoirSprint: boolean;
  canModifierSprint: boolean;
  canSupprimerSprint: boolean;
  canGererSprint: boolean;
  canCreerBacklog: boolean;
  canVoirBacklog: boolean;
  canModifierBacklog: boolean;
  canSupprimerBacklog: boolean;
  canGererBacklog: boolean;
}

interface ProjectPermission {
  id: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  project: {
    id: string;
    name: string;
    description?: string;
  };
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER' | 'RH' | 'CLIENT' | 'TESTER' | 'DESIGNER';
  permissions: Permission;
  createdAt: string;
}

const ROLE_THEMES: Record<string, { bg: string, text: string, icon: string, border: string }> = {
  'ADMIN': { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', icon: '👑' },
  'PROJECT_MANAGER': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: '📋' },
  'DEVELOPER': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', icon: '💻' },
  'RH': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', icon: '👤' },
  'TESTER': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: '🔍' },
  'DESIGNER': { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100', icon: '🎨' },
  'CLIENT': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: '🤝' },
};

export const SuperSimpleAccessManager: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<ProjectPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState<ProjectPermission | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, pRes, permRes] = await Promise.all([
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/projects').catch(() => ({ data: [] })),
        api.get('/permissions').catch(() => ({ data: [] }))
      ]);
      setUsers(uRes.data || []);
      setProjects(pRes.data || []);
      setPermissions(permRes.data || []);
    } catch (e) {
      toast.error(t('admin.data_load_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSavePermission = async (data: any) => {
    try {
      setLoading(true);
      if (editingPermission) {
        await api.put(`/permissions/${editingPermission.id}`, data);
        toast.success(t('admin.permission_updated_msg'));
      } else {
        await api.post('/permissions', data);
        toast.success(t('admin.permission_added_msg'));
      }
      loadData();
      setShowAddModal(false);
      setEditingPermission(null);
    } catch (e) {
      toast.error(t('admin.error_saving_permission'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.delete_permission_confirm'))) return;
    try {
      setLoading(true);
      await api.delete(`/permissions/${id}`);
      toast.success(t('admin.permission_deleted_msg'));
      loadData();
    } catch (e) {
      toast.error(t('admin.error_deleting_permission'));
    } finally {
      setLoading(false);
    }
  };

  const filteredPermissions = permissions.filter(p => 
    p.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout title={t('admin.access_management_title')} subtitle={t('admin.security_granular_subtitle')}>
      <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 italic uppercase">
              <ShieldCheck className="w-8 h-8 text-primary-600" />
              {t('admin.permissions_system_title')} <span className="text-primary-600">{t('admin.system_label')}</span>
            </h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
              {t('admin.configured_access_count', { count: permissions.length, users: users.length })}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder={t('common.search')} 
                className="pl-11 h-12 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-primary-500/20 font-bold"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
                onClick={() => setShowAddModal(true)}
                className="h-12 rounded-2xl px-6 font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg shadow-primary-500/20"
            >
              <Plus className="w-4 h-4" />
              {t('admin.new_access')}
            </Button>
          </div>
        </div>

        {/* Permissions Table */}
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                <TableRow className="h-16 hover:bg-transparent border-none">
                  <TableHead className="px-8 font-black text-[11px] uppercase tracking-widest text-slate-400">{t('admin.user_and_project')}</TableHead>
                  <TableHead className="px-6 font-black text-[11px] uppercase tracking-widest text-slate-400">{t('admin.role_column')}</TableHead>
                  <TableHead className="px-6 font-black text-[11px] uppercase tracking-widest text-slate-400">{t('admin.capabilities_column')}</TableHead>
                  <TableHead className="px-8 font-black text-[11px] uppercase tracking-widest text-slate-400 text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={4} className="h-20 animate-pulse bg-slate-50/20" /></TableRow>
                  ))
                ) : filteredPermissions.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="h-60 text-center text-slate-400 font-black uppercase tracking-widest text-xs italic">{t('admin.no_permissions_configured')}</TableCell></TableRow>
                ) : (
                  filteredPermissions.map(perm => (
                    <TableRow key={perm.id} className="group hover:bg-primary-50/30 transition-all border-b border-slate-50">
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12 rounded-2xl border-2 border-white shadow-md">
                            <AvatarImage src={perm.user.avatar} />
                            <AvatarFallback className="bg-slate-100 text-slate-500 font-bold text-xs">
                              {perm.user.fullName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-black text-slate-900 tracking-tight group-hover:text-primary-700 transition-colors">{perm.user.fullName}</p>
                            <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400 mt-1">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded italic">{t('admin.project_prefix')}</span>
                                <span className="text-slate-500">{perm.project.name}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <Badge className={`rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none ${ROLE_THEMES[perm.role]?.bg} ${ROLE_THEMES[perm.role]?.text}`}>
                          {ROLE_THEMES[perm.role]?.icon} {t(`admin.roles.${perm.role}`, perm.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                            {Object.entries(perm.permissions).filter(([_, v]) => v === true).slice(0, 5).map(([k]) => (
                                <span key={k} className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded-lg">
                                    {k.replace('can', '')}
                                </span>
                            ))}
                            {Object.entries(perm.permissions).filter(([_, v]) => v === true).length > 5 && (
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-2 py-0.5 rounded-lg cursor-help">
                                    +{Object.entries(perm.permissions).filter(([_, v]) => v === true).length - 5}
                                </span>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-xl hover:bg-white hover:shadow-md transition-all text-slate-400 hover:text-primary-600"
                            onClick={() => { setEditingPermission(perm); setShowAddModal(true); }}
                           >
                             <Edit className="w-4 h-4" />
                           </Button>
                           <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-xl hover:bg-white hover:shadow-md transition-all text-slate-400 hover:text-red-600"
                            onClick={() => handleDelete(perm.id)}
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Permission Modal */}
      <AccessModal 
        isOpen={showAddModal} 
        onOpenChange={(v) => { setShowAddModal(v); if(!v) setEditingPermission(null); }}
        users={users}
        projects={projects}
        initialData={editingPermission}
        onSave={handleSavePermission}
        loading={loading}
      />
    </AppLayout>
  );
};

/* --- AccessModal Component --- */

const AccessModal: React.FC<{
    isOpen: boolean,
    onOpenChange: (v: boolean) => void,
    users: any[],
    projects: any[],
    initialData: ProjectPermission | null,
    onSave: (data: any) => void,
    loading: boolean
}> = ({ isOpen, onOpenChange, users, projects, initialData, onSave, loading }) => {
    const { t } = useTranslation();
    
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedRole, setSelectedRole] = useState('DEVELOPER');
    const [perms, setPerms] = useState<Permission>({
        canView: true, canEdit: false, canDelete: false, canManageUsers: false,
        canViewReports: false, canExport: false, canComment: false, canUploadFiles: false,
        canManageTasks: false, canAccessSettings: false, canModifierConges: false,
        canSupprimerConges: false, canGererConges: false, canCreerUserStory: false,
        canVoirUserStory: false, canModifierUserStory: false, canSupprimerUserStory: false,
        canGererUserStory: false, canCreerSprint: false, canVoirSprint: false,
        canModifierSprint: false, canSupprimerSprint: false, canGererSprint: false,
        canCreerBacklog: false, canVoirBacklog: false, canModifierBacklog: false,
        canSupprimerBacklog: false, canGererBacklog: false
    });

    useEffect(() => {
        if (initialData) {
            setSelectedUser(initialData.user.id);
            setSelectedProject(initialData.project.id);
            setSelectedRole(initialData.role);
            setPerms(initialData.permissions);
        } else {
            setSelectedUser('');
            setSelectedProject('');
            setSelectedRole('DEVELOPER');
        }
    }, [initialData, isOpen]);

    const handleToggle = (key: keyof Permission) => {
        setPerms(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const sections = [
        { title: t('admin.general_section'), icon: Shield, fields: ['canView', 'canEdit', 'canDelete', 'canManageUsers', 'canViewReports', 'canManageTasks'], color: 'bg-indigo-500' },
        { title: t('admin.scrum_backlog_section'), icon: Layers, fields: ['canVoirBacklog', 'canCreerBacklog', 'canModifierBacklog', 'canSupprimerBacklog', 'canGererBacklog', 'canCreerUserStory', 'canVoirUserStory', 'canModifierUserStory', 'canGererUserStory'], color: 'bg-emerald-500' },
        { title: t('admin.sprints_section'), icon: GitBranch, fields: ['canVoirSprint', 'canCreerSprint', 'canModifierSprint', 'canSupprimerSprint', 'canGererSprint'], color: 'bg-blue-500' },
        { title: t('admin.hr_misc_section'), icon: Calendar, fields: ['canModifierConges', 'canGererConges', 'canUploadFiles', 'canComment', 'canExport', 'canAccessSettings'], color: 'bg-purple-500' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white/95 backdrop-blur-xl">
                <div className="flex h-[80vh]">
                    {/* Left Panel: Form */}
                    <div className="w-1/3 p-8 bg-slate-50/80 border-r border-slate-100 flex flex-col gap-8">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 mb-4">
                                <Lock className="w-6 h-6" />
                            </div>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">{t('admin.access_project_title')} <span className="text-primary-600">{t('admin.project_word')}</span></DialogTitle>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t('admin.configure_access_rights')}</p>
                            </DialogHeader>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{t('admin.user_select_label')}</Label>
                                <Select value={selectedUser} onValueChange={setSelectedUser} disabled={!!initialData}>
                                    <SelectTrigger className="h-12 rounded-2xl bg-white border-slate-100 font-bold">
                                        <SelectValue placeholder={t('admin.choose_member')} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100">
                                        {users.map(u => (
                                            <SelectItem key={u.id} value={u.id} className="font-bold">{u.fullName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{t('admin.project_select_label')}</Label>
                                <Select value={selectedProject} onValueChange={setSelectedProject} disabled={!!initialData}>
                                    <SelectTrigger className="h-12 rounded-2xl bg-white border-slate-100 font-bold text-slate-600">
                                        <SelectValue placeholder={t('admin.choose_project')} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100">
                                        {projects.map(p => (
                                            <SelectItem key={p.id} value={p.id} className="font-bold">{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{t('admin.project_role_label')}</Label>
                                <Select value={selectedRole} onValueChange={setSelectedRole}>
                                    <SelectTrigger className="h-12 rounded-2xl bg-white border-slate-100 font-bold">
                                        <SelectValue placeholder={t('admin.choose_role_access')} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100">
                                        {Object.entries(ROLE_THEMES).map(([r, theme]) => (
                                            <SelectItem key={r} value={r} className="font-bold text-[11px] uppercase tracking-widest">
                                                {t(`admin.roles.${r}`, r.replace('_', ' '))}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <Button 
                                className="w-full h-14 rounded-[1.25rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-500/20"
                                disabled={loading || !selectedUser || !selectedProject}
                                onClick={() => onSave({ userId: selectedUser, projectId: selectedProject, role: selectedRole, permissions: perms })}
                            >
                                {loading ? t('admin.processing') : (initialData ? t('admin.update_access') : t('admin.create_access'))}
                            </Button>
                        </div>
                    </div>

                    {/* Right Panel: Permissions Grid */}
                    <div className="flex-1 flex flex-col">
                        <div className="p-8 pb-4 border-b border-slate-100 bg-white">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-600">{t('admin.detailed_access_rights')}</h3>
                        </div>
                        <ScrollArea className="flex-1 p-8 bg-white">
                            <div className="grid grid-cols-1 gap-12 pb-12">
                               {sections.map((section, idx) => (
                                   <div key={idx} className="space-y-6">
                                       <div className="flex items-center gap-3">
                                           <div className={`p-2 rounded-xl text-white ${section.color} shadow-lg shadow-black/5`}>
                                               <section.icon className="w-4 h-4" />
                                           </div>
                                           <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">{section.title}</h4>
                                           <div className="flex-1 h-px bg-slate-100" />
                                       </div>
                                       <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                           {section.fields.map(field => (
                                               <div key={field} className="flex items-center space-x-3 group cursor-pointer" onClick={() => handleToggle(field as any)}>
                                                   <Checkbox 
                                                    id={field} 
                                                    checked={perms[field as keyof Permission]} 
                                                    onCheckedChange={() => handleToggle(field as any)}
                                                    className="w-5 h-5 rounded-lg border-2 border-slate-200 transition-all focus:ring-0"
                                                   />
                                                   <Label htmlFor={field} className="text-xs font-bold text-slate-500 group-hover:text-slate-800 transition-colors uppercase tracking-tight cursor-pointer">
                                                       {field.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                                                   </Label>
                                               </div>
                                           ))}
                                       </div>
                                   </div>
                               ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
