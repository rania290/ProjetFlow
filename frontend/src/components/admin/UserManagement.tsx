import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../layout/AppLayout';
import api from '../../api/api-client';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Search,
  Filter,
  Crown,
  Briefcase,
  Code,
  Shield,
  Eye,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
  MoreVertical,
  Mail,
  MapPin,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Label } from "../ui/label";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER' | 'DESIGNER' | 'TESTER' | 'RH' | 'CLIENT';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  projectCount?: number;
  lastLogin?: string;
  department?: string;
  location?: string;
  avatar?: string;
  phone?: string;
  skills?: string[];
}

interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  role: string;
}

const getRoleConfig = (t: any): Record<string, any> => ({
  ADMIN: {
    label: t('admin.roles.ADMIN'),
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: Crown,
    description: t('admin.role_descriptions.ADMIN'),
    gradient: 'from-purple-500 to-indigo-600'
  },
  PROJECT_MANAGER: {
    label: t('admin.roles.PROJECT_MANAGER'),
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Briefcase,
    description: t('admin.role_descriptions.PROJECT_MANAGER'),
    gradient: 'from-blue-500 to-cyan-600'
  },
  DEVELOPER: {
    label: t('admin.roles.DEVELOPER'),
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    icon: Code,
    description: t('admin.role_descriptions.DEVELOPER'),
    gradient: 'from-cyan-500 to-blue-600'
  },
  DESIGNER: {
    label: t('admin.roles.DESIGNER'),
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    icon: Shield,
    description: t('admin.role_descriptions.DESIGNER'),
    gradient: 'from-pink-500 to-rose-600'
  },
  TESTER: {
    label: t('admin.roles.TESTER'),
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Eye,
    description: t('admin.role_descriptions.TESTER'),
    gradient: 'from-amber-500 to-orange-600'
  },
  RH: {
    label: t('admin.roles.RH'),
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: Users,
    description: t('admin.role_descriptions.RH'),
    gradient: 'from-purple-500 to-indigo-600'
  },
  CLIENT: {
    label: t('admin.roles.CLIENT'),
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: UserX,
    description: t('admin.role_descriptions.CLIENT'),
    gradient: 'from-orange-500 to-red-600'
  }
});

export const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const ROLE_CONFIG = getRoleConfig(t);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users').catch(() => ({ data: [] }));
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: CreateUserDto) => {
    try {
      setLoading(true);
       const response = await api.post('/users', userData);
      setUsers([...users, response.data]);
      toast.success(t('common.success_create', { name: userData.fullName }));
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('admin.error_creating'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, updateData: Partial<User>) => {
    try {
      setLoading(true);
       const response = await api.patch(`/users/${userId}`, updateData);
      setUsers(users.map(u => u.id === userId ? { ...u, ...response.data } : u));
      toast.success(t('common.success_update'));
      setShowEditModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('admin.error_updating'));
    } finally {
      setLoading(false);
    }
  };

   const handleDeleteUser = async (userId: string) => {
    if (!confirm(t('common.confirm_delete'))) return;

    try {
      setLoading(true);
       await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      toast.success(t('common.success_delete'));
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('admin.error_deleting'));
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = Object.keys(ROLE_CONFIG).map(role => ({
    role,
    count: users.filter(u => u.role === role).length,
    ...ROLE_CONFIG[role]
  }));

   return (
    <AppLayout title={t('admin.user_management')} subtitle={t('admin.account_administration')}>
      <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {stats.map((stat) => (
            <Card 
              key={stat.role} 
              className={`relative overflow-hidden cursor-pointer transition-all hover:scale-105 border-none shadow-sm ${roleFilter === stat.role ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setRoleFilter(roleFilter === stat.role ? 'all' : stat.role)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 ring-1 ring-inset ring-black/5`} />
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-slate-900">{stat.count}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Bar */}
        <Card className="border-none shadow-sm bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden">
          <CardHeader className="p-6 pb-0 flex flex-row items-center justify-between space-y-0">
             <div>
              <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('admin.users_list')}</CardTitle>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t('admin.total_members', { count: users.length })}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <Input 
                  placeholder={t('common.search')} 
                  className="pl-10 h-10 rounded-xl border-slate-100 bg-slate-50/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoComplete="off"
                />
              </div>
               <Button 
                onClick={() => setShowCreateModal(true)}
                className="rounded-xl flex items-center gap-2 font-bold uppercase text-xs tracking-widest"
              >
                <UserPlus className="w-4 h-4" />
                {t('common.add')}
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={fetchUsers}
                className="rounded-xl border-slate-100"
              >
                <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 mt-6">
            <Table>
              <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-8 font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">{t('admin.user')}</TableHead>
                  <TableHead className="px-6 font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">{t('admin.role')}</TableHead>
                  <TableHead className="px-6 font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">{t('admin.department')}</TableHead>
                  <TableHead className="px-6 font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">{t('admin.status')}</TableHead>
                  <TableHead className="px-6 font-black text-[10px] uppercase tracking-widest text-slate-400 h-14 text-center">{t('common.projects')}</TableHead>
                  <TableHead className="px-8 font-black text-[10px] uppercase tracking-widest text-slate-400 h-14 text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6} className="h-16 animate-pulse bg-slate-50/20" />
                    </TableRow>
                  ))
                 ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                      {t('admin.no_users_found')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 group">
                      <TableCell className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 rounded-xl border-2 border-white shadow-sm ring-1 ring-slate-100">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-slate-100 text-slate-600 font-black text-xs">
                              {user.fullName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-black text-slate-800 text-[13px]">{user.fullName}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <Badge className={`rounded-lg px-2.5 py-1 text-[10px] uppercase font-medium tracking-widest border-none ${ROLE_CONFIG[user.role]?.color}`}>
                          {ROLE_CONFIG[user.role]?.label || user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                          <span className="text-[12px] font-bold text-slate-600">{user.department || 'N/A'}</span>
                        </div>
                      </TableCell>
                       <TableCell className="px-6 py-5">
                        <div className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className={`ml-2 text-[11px] font-black uppercase tracking-tighter ${user.isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {user.isActive ? t('common.active') : t('common.inactive')}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-center">
                        <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 font-black text-[11px]">
                          {user.projectCount || 0}
                        </span>
                      </TableCell>
                      <TableCell className="px-8 py-5 text-right">
                        <DropdownMenu>
                        <DropdownMenuTrigger className="rounded-xl hover:bg-slate-100 h-8 w-8 inline-flex items-center justify-center transition-colors">
                            <MoreVertical className="w-4 h-4 text-slate-400" />
                        </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl border-slate-100 p-1 w-40 shadow-xl">
                             <DropdownMenuItem 
                              className="rounded-lg gap-2 text-xs font-bold text-slate-600 focus:bg-slate-50"
                              onClick={() => { setSelectedUser(user); setShowEditModal(true); }}
                            >
                              <Edit className="w-3.5 h-3.5" />
                              {t('common.edit').toUpperCase()}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="rounded-lg gap-2 text-xs font-bold text-rose-600 focus:bg-rose-50"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {t('common.delete').toUpperCase()}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {showCreateModal && <CreateUserModal 
        isOpen={showCreateModal} 
        onOpenChange={setShowCreateModal} 
        onSubmit={handleCreateUser} 
        loading={loading}
      />}
      {selectedUser && (
        <EditUserModal 
          isOpen={showEditModal} 
          onOpenChange={setShowEditModal} 
          user={selectedUser}
          onSubmit={(data) => handleUpdateUser(selectedUser.id, data)}
          loading={loading}
        />
      )}
    </AppLayout>
  );
};

/* --- Sub-Components (Modals) --- */

const CreateUserModal: React.FC<{ 
  isOpen: boolean; 
  onOpenChange: (val: boolean) => void;
  onSubmit: (data: CreateUserDto) => void;
   loading: boolean;
}> = ({ isOpen, onOpenChange, onSubmit, loading }) => {
  const { t } = useTranslation();
  const ROLE_CONFIG = getRoleConfig(t);
  const [formData, setFormData] = useState<CreateUserDto>({
    fullName: '', email: '', password: '', role: 'TEAM_MEMBER'
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white/95 backdrop-blur-xl max-w-md">
         <div className="bg-primary/5 p-8 border-b border-primary/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight">{t('admin.new_user')}</DialogTitle>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t('admin.create_team_account')}</p>
          </DialogHeader>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-black ml-1">{t('admin.full_name')}</Label>
              <Input 
                required 
                className="h-12 rounded-2xl border-slate-300 bg-white !text-black font-semibold" 
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
             </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-black ml-1">{t('common.email')}</Label>
              <Input 
                required type="email"
                className="h-12 rounded-2xl border-slate-300 bg-white !text-black font-semibold" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
             </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-black ml-1">{t('common.password')}</Label>
              <Input 
                required type="password"
                className="h-12 rounded-2xl border-slate-300 bg-white !text-black font-semibold" 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-black ml-1">{t('admin.system_role')}</Label>
               <Select 
                value={formData.role} 
                onValueChange={(val) => setFormData({...formData, role: val})}
              >
                <SelectTrigger className="h-12 rounded-2xl border-slate-300 bg-white !text-black font-medium uppercase tracking-widest text-[10px]">
                  <SelectValue placeholder={t('admin.choose_role')} />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl border-slate-200 z-[100] shadow-xl p-1">
                  {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key} className="text-xs font-medium uppercase tracking-widest cursor-pointer hover:bg-slate-100 py-2">
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4">
             <Button 
              type="submit" 
              className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs"
              disabled={loading}
            >
              {loading ? t('admin.creating') : t('admin.create_user')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const EditUserModal: React.FC<{ 
  isOpen: boolean; 
  onOpenChange: (val: boolean) => void;
  user: User;
   onSubmit: (data: Partial<User>) => void;
  loading: boolean;
}> = ({ isOpen, onOpenChange, user, onSubmit, loading }) => {
  const { t } = useTranslation();
  const ROLE_CONFIG = getRoleConfig(t);
  const [formData, setFormData] = useState<Partial<User>>({
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isActive: user.isActive
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white/95 backdrop-blur-xl max-w-md">
         <div className="bg-indigo-50/50 p-8 border-b border-indigo-100/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight">{t('admin.edit_profile')}</DialogTitle>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t('admin.update_members_info')}</p>
          </DialogHeader>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-black ml-1">{t('admin.full_name')}</Label>
              <Input 
                required 
                className="h-12 rounded-2xl border-slate-300 bg-white !text-black font-semibold" 
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-black ml-1">{t('admin.system_role')}</Label>
               <Select 
                value={formData.role} 
                onValueChange={(val: any) => setFormData({...formData, role: val})}
              >
                <SelectTrigger className="h-12 rounded-2xl border-slate-300 bg-white !text-black font-medium uppercase tracking-widest text-[10px]">
                  <SelectValue placeholder={t('admin.choose_role')} />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl border-slate-200 z-[100] shadow-xl p-1">
                  {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key} className="text-xs font-medium uppercase tracking-widest cursor-pointer hover:bg-slate-100 py-2">
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <input 
                type="checkbox" 
                id="active" 
                checked={formData.isActive}
                onChange={e => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4 rounded border-slate-200 text-primary h-5 w-5"
               />
              <Label htmlFor="active" className="text-xs font-bold text-slate-600 cursor-pointer">{t('admin.account_active')}</Label>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button 
              type="submit" 
              className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs"
              disabled={loading}
            >
              {loading ? t('common.loading') : t('admin.update_user')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
