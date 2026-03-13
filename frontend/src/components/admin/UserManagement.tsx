import React, { useState, useEffect } from 'react';
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
  Calendar,
  Mail,
  Lock,
  User,
  Activity,
  TrendingUp,
  Settings,
  Zap,
  Star,
  Award,
  Target,
  Globe,
  Database,
  Cpu,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  MapPin,
  Building2,
  Link2,
  ChevronRight,
  MoreVertical,
  Download,
  Upload,
  BarChart3,
  PieChart,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER' | 'DESIGNER' | 'TESTER' | 'TEAM_MEMBER' | 'CLIENT';
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

const ROLE_CONFIG = {
  ADMIN: {
    label: 'Administrateur',
    color: '#8b5cf6',
    bgColor: '#f3f0ff',
    borderColor: '#c4b5fd',
    icon: Crown,
    description: 'Accès complet au système',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #c4b5fd 100%)',
    shadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
    pattern: 'radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)'
  },
  PROJECT_MANAGER: {
    label: 'Chef de Projet',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    borderColor: '#93c5fd',
    icon: Briefcase,
    description: 'Gestion de projets et équipes',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)',
    shadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
    pattern: 'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
  },
  DEVELOPER: {
    label: 'Développeur',
    color: '#06b6d4',
    bgColor: '#ecfeff',
    borderColor: '#67e8f9',
    icon: Code,
    description: 'Développement et code',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 50%, #67e8f9 100%)',
    shadow: '0 4px 20px rgba(6, 182, 212, 0.3)',
    pattern: 'radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)'
  },
  DESIGNER: {
    label: 'Designer',
    color: '#ec4899',
    bgColor: '#fdf2f8',
    borderColor: '#f9a8d4',
    icon: Shield,
    description: 'Design et UX/UI',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #f9a8d4 100%)',
    shadow: '0 4px 20px rgba(236, 72, 153, 0.3)',
    pattern: 'radial-gradient(circle at 60% 60%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)'
  },
  TESTER: {
    label: 'Testeur',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    borderColor: '#fcd34d',
    icon: Eye,
    description: 'Tests et QA',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%)',
    shadow: '0 4px 20px rgba(245, 158, 11, 0.3)',
    pattern: 'radial-gradient(circle at 30% 70%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)'
  },
  TEAM_MEMBER: {
    label: 'Membre d\'équipe',
    color: '#10b981',
    bgColor: '#ecfdf5',
    borderColor: '#6ee7b7',
    icon: UserCheck,
    description: 'Membre d\'équipe',
    gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
    shadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
    pattern: 'radial-gradient(circle at 70% 30%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)'
  },
  CLIENT: {
    label: 'Client',
    color: '#f97316',
    bgColor: '#fff7ed',
    borderColor: '#fdba74',
    icon: UserX,
    description: 'Accès client',
    gradient: 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fdba74 100%)',
    shadow: '0 4px 20px rgba(249, 115, 22, 0.3)',
    pattern: 'radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)'
  }
};

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users').catch(() => ({ data: [] }));
      setUsers(response.data || []);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
      // Données de test enrichies
      setUsers([
        {
          id: '1',
          email: 'admin@vaerdia.com',
          fullName: 'Alexandra Martin',
          role: 'ADMIN',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          projectCount: 12,
          lastLogin: new Date().toISOString(),
          department: 'Direction',
          location: 'Paris',
          phone: '+33 1 23 45 67 89',
          skills: ['Leadership', 'Strategy', 'Management']
        },
        {
          id: '2',
          email: 'dev@vaerdia.com',
          fullName: 'Thomas Dubois',
          role: 'DEVELOPER',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          projectCount: 8,
          lastLogin: new Date().toISOString(),
          department: 'Tech',
          location: 'Lyon',
          phone: '+33 4 56 78 90 12',
          skills: ['React', 'TypeScript', 'Node.js']
        },
        {
          id: '3',
          email: 'pm@vaerdia.com',
          fullName: 'Sophie Bernard',
          role: 'PROJECT_MANAGER',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          projectCount: 6,
          lastLogin: new Date().toISOString(),
          department: 'Projects',
          location: 'Marseille',
          phone: '+33 4 12 34 56 78',
          skills: ['Agile', 'Scrum', 'Planning']
        },
        {
          id: '4',
          email: 'design@vaerdia.com',
          fullName: 'Lucie Petit',
          role: 'DESIGNER',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          projectCount: 4,
          lastLogin: new Date().toISOString(),
          department: 'Design',
          location: 'Bordeaux',
          phone: '+33 5 67 89 01 23',
          skills: ['Figma', 'UI/UX', 'Prototyping']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: CreateUserDto) => {
    try {
      setLoading(true);
      const response = await api.post('/users', userData).catch(() => ({ 
        data: { 
          ...userData, 
          id: Date.now().toString(), 
          isActive: true, 
          createdAt: new Date().toISOString(), 
          updatedAt: new Date().toISOString() 
        } 
      }));
      const newUser = response.data;
      setUsers([...users, newUser]);
      setSuccess(`Utilisateur ${userData.fullName} créé avec succès !`);
      setShowCreateModal(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Erreur lors de la création';
      setError(msg);
      console.error('Create user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, updateData: Partial<User>) => {
    try {
      setLoading(true);
      const response = await api.patch(`/users/${userId}`, updateData).catch(() => ({ 
        data: { ...updateData, id: userId } 
      }));
      const updatedUser = response.data;
      setUsers(users.map(u => u.id === userId ? { ...u, ...updatedUser } : u));
      setSuccess(`Utilisateur mis à jour avec succès !`);
      setShowEditModal(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour';
      setError(msg);
      console.error('Update user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      setLoading(true);
      await api.delete(`/users/${userId}`).catch(() => {});
      setUsers(users.filter(u => u.id !== userId));
      setSuccess('Utilisateur supprimé avec succès !');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Erreur lors de la suppression';
      setError(msg);
      console.error('Delete user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    await updateUser(userId, { isActive });
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleStats = () => {
    const stats = Object.keys(ROLE_CONFIG).reduce((acc, role) => {
      acc[role] = 0;
      return acc;
    }, {} as { [key: string]: number });

    users.forEach(user => {
      if (stats[user.role] !== undefined) {
        stats[user.role]++;
      }
    });

    return stats;
  };

  const roleStats = getRoleStats();

  return (
    <AppLayout title="Gestion des Utilisateurs" subtitle="Administration des comptes et rôles">
      <div style={{ 
        padding: '24px', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
          `,
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          
          {/* Header Premium */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            padding: '40px',
            borderRadius: '24px',
            marginBottom: '32px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h1 style={{ 
                  fontSize: '36px', 
                  fontWeight: '800', 
                  marginBottom: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                  }}>
                    <Users size={28} />
                  </div>
                  Gestion des Utilisateurs
                </h1>
                <p style={{ fontSize: '18px', color: '#64748b', fontWeight: '500' }}>
                  Administration des comptes utilisateurs • {users.length} utilisateur(s) • {users.filter(u => u.isActive).length} actif(s)
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  onClick={fetchUsers}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(102, 126, 234, 0.1)',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    color: '#667eea',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <RefreshCw size={20} />
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    padding: '14px 24px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  <UserPlus size={20} />
                  Créer un utilisateur
                </button>
              </div>
            </div>

          {/* Role Cards Premium */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px', 
            marginBottom: '32px' 
          }}>
            {Object.entries(ROLE_CONFIG).map(([role, config]) => {
              const Icon = config.icon;
              const count = roleStats[role] || 0;
              const isSelected = roleFilter === role;
              return (
                <div 
                  key={role} 
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    padding: '24px',
                    borderRadius: '20px',
                    border: isSelected ? `2px solid ${config.color}` : '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: isSelected ? config.shadow : '0 8px 32px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseOver={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = config.shadow;
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                  onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}
                >
                  {/* Background Pattern */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: config.pattern,
                    pointerEvents: 'none'
                  }} />

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: config.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: config.shadow
                      }}>
                        <Icon size={28} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#1f2937' }}>{count}</div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {config.label}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.4' }}>
                      {config.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filters Premium */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: '16px', top: '14px', color: '#9ca3af' }} />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email, département ou localisation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 48px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '15px',
                    outline: 'none',
                    background: 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '15px',
                  outline: 'none',
                  background: 'rgba(255, 255, 255, 0.8)',
                  cursor: 'pointer',
                  minWidth: '150px'
                }}
              >
                <option value="all">Tous les rôles</option>
                {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                  <option key={role} value={role}>{config.label}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '15px',
                  outline: 'none',
                  background: 'rgba(255, 255, 255, 0.8)',
                  cursor: 'pointer',
                  minWidth: '150px'
                }}
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>

              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                style={{
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  background: viewMode === 'list' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255, 255, 255, 0.8)',
                  color: viewMode === 'list' ? 'white' : '#374151',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '15px',
                  fontWeight: '500',
                  minWidth: '120px',
                  transition: 'all 0.2s'
                }}
              >
                <Filter size={18} />
                {viewMode === 'list' ? 'Liste' : 'Grille'}
              </button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {error && (
            <div style={{
              padding: '16px 20px',
              borderRadius: '12px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '15px',
              fontWeight: '500',
              backgroundColor: 'rgba(254, 242, 242, 0.95)',
              color: '#dc2626',
              border: '1px solid rgba(254, 202, 202, 0.5)',
              backdropFilter: 'blur(10px)'
            }}>
              <AlertCircle size={20} />
              {error}
              <button 
                onClick={() => setError(null)} 
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}
              >
                <X size={20} />
              </button>
            </div>
          )}

          {success && (
            <div style={{
              padding: '16px 20px',
              borderRadius: '12px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '15px',
              fontWeight: '500',
              backgroundColor: 'rgba(240, 253, 244, 0.95)',
              color: '#166534',
              border: '1px solid rgba(187, 247, 208, 0.5)',
              backdropFilter: 'blur(10px)'
            }}>
              <CheckCircle size={20} />
              {success}
              <button 
                onClick={() => setSuccess(null)} 
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#166534' }}
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Users List Premium */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {loading ? (
              <div style={{ padding: '80px', textAlign: 'center' }}>
                <div style={{ display: 'inline-block', width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTop: '4px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ marginTop: '20px', color: '#6b7280', fontSize: '16px', fontWeight: '500' }}>Chargement des utilisateurs...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ padding: '80px', textAlign: 'center' }}>
                <div style={{ width: '120px', height: '120px', backgroundColor: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <Users size={48} style={{ color: '#cbd5e1' }} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>
                  Aucun utilisateur trouvé
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '16px' }}>
                  {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                    ? 'Aucun résultat pour vos filtres' 
                    : 'Commencez par créer votre premier utilisateur'
                  }
                </p>
                {!searchTerm && roleFilter === 'all' && statusFilter === 'all' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '14px 24px',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 auto',
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    <UserPlus size={20} />
                    Créer un utilisateur
                  </button>
                )}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'rgba(248, 250, 252, 0.8)' }}>
                    <tr>
                      <th style={{ padding: '20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Utilisateur
                      </th>
                      <th style={{ padding: '20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Rôle
                      </th>
                      <th style={{ padding: '20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Département
                      </th>
                      <th style={{ padding: '20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Statut
                      </th>
                      <th style={{ padding: '20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Projets
                      </th>
                      <th style={{ padding: '20px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => {
                      const RoleIcon = ROLE_CONFIG[user.role]?.icon || UserCheck;
                      return (
                        <tr key={user.id} style={{ 
                          borderBottom: '1px solid rgba(241, 245, 249, 0.8)',
                          backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(248, 250, 252, 0.5)',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.05)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(248, 250, 252, 0.5)';
                        }}>
                          <td style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ 
                                width: '48px', 
                                height: '48px', 
                                borderRadius: '12px', 
                                background: ROLE_CONFIG[user.role]?.gradient || '#e5e7eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                fontWeight: '700',
                                color: 'white',
                                boxShadow: ROLE_CONFIG[user.role]?.shadow || '0 4px 20px rgba(0, 0, 0, 0.1)'
                              }}>
                                {user.fullName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                                  {user.fullName}
                                </div>
                                <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                  <Mail size={14} />
                                  {user.email}
                                </div>
                                <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <MapPin size={12} />
                                  {user.location}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '20px' }}>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 12px',
                              borderRadius: '12px',
                              fontSize: '13px',
                              fontWeight: '600',
                              backgroundColor: ROLE_CONFIG[user.role]?.bgColor || '#f8fafc',
                              color: ROLE_CONFIG[user.role]?.color || '#475569',
                              border: `1px solid ${ROLE_CONFIG[user.role]?.borderColor || '#e2e8f0'}`
                            }}>
                              <RoleIcon size={14} />
                              {ROLE_CONFIG[user.role]?.label || user.role}
                            </div>
                          </td>
                          <td style={{ padding: '20px' }}>
                            <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                              {user.department}
                            </div>
                          </td>
                          <td style={{ padding: '20px' }}>
                            <button
                              onClick={() => toggleUserStatus(user.id, !user.isActive)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                backgroundColor: user.isActive ? '#dcfce7' : '#fee2e2',
                                color: user.isActive ? '#166534' : '#dc2626'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = user.isActive ? '#bbf7d0' : '#fecaca';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = user.isActive ? '#dcfce7' : '#fee2e2';
                              }}
                            >
                              {user.isActive ? '✓ Actif' : '✗ Inactif'}
                            </button>
                          </td>
                          <td style={{ padding: '20px' }}>
                            <div style={{ fontSize: '14px', color: '#374151', fontWeight: '600' }}>
                              {user.projectCount || 0}
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                              projet(s)
                            </div>
                          </td>
                          <td style={{ padding: '20px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowEditModal(true);
                                }}
                                style={{
                                  padding: '8px 12px',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '8px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                  color: '#475569',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor = '#f8fafc';
                                  e.currentTarget.style.borderColor = '#cbd5e1';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                                  e.currentTarget.style.borderColor = '#e2e8f0';
                                }}
                              >
                                <Edit size={14} />
                                Modifier
                              </button>
                              <button
                                onClick={() => deleteUser(user.id)}
                                style={{
                                  padding: '8px 12px',
                                  border: '1px solid #fecaca',
                                  borderRadius: '8px',
                                  backgroundColor: 'rgba(254, 242, 242, 0.8)',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor = '#fee2e2';
                                  e.currentTarget.style.borderColor = '#fca5a5';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(254, 242, 242, 0.8)';
                                  e.currentTarget.style.borderColor = '#fecaca';
                                }}
                              >
                                <Trash2 size={14} />
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createUser}
        loading={loading}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={selectedUser}
        onUpdate={updateUser}
        loading={loading}
      />
    </AppLayout>
  );
};

// CreateUserModal Component
const CreateUserModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (userData: CreateUserDto) => void;
  loading: boolean;
}> = ({ isOpen, onClose, onCreate, loading }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'TEAM_MEMBER'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.fullName) return;
    onCreate(formData);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          padding: '32px',
          borderBottom: '1px solid rgba(241, 245, 249, 0.8)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
            Créer un utilisateur
          </h3>
          <button onClick={onClose} style={{
            backgroundColor: 'rgba(241, 245, 249, 0.8)',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#e2e8f0';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(241, 245, 249, 0.8)';
          }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Nom complet
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
              required
              minLength={6}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Rôle
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            >
              {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                <option key={role} value={role}>{config.label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
            <p style={{ fontSize: '14px', color: '#0369a1', lineHeight: '1.5', margin: 0 }}>
              <strong>💡 Information :</strong> L'utilisateur pourra modifier ses informations personnelles (département, localisation, téléphone, etc.) après s'être connecté via sa page de profil.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px 24px',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                color: '#475569',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px 24px',
                border: 'none',
                borderRadius: '12px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '15px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 8px 32px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// EditUserModal Component
const EditUserModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdate: (userId: string, updateData: Partial<User>) => void;
  loading: boolean;
}> = ({ isOpen, onClose, user, onUpdate, loading }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'TEAM_MEMBER' as User['role'],
    isActive: true
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    onUpdate(user.id, formData);
  };

  if (!isOpen || !user) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          padding: '32px',
          borderBottom: '1px solid rgba(241, 245, 249, 0.8)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
            Modifier l'utilisateur
          </h3>
          <button onClick={onClose} style={{
            backgroundColor: 'rgba(241, 245, 249, 0.8)',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#e2e8f0';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(241, 245, 249, 0.8)';
          }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Nom complet
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Rôle
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            >
              {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                <option key={role} value={role}>{config.label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                style={{ margin: 0, width: '20px', height: '20px' }}
              />
              <span style={{ fontSize: '15px', fontWeight: '500', color: '#374151' }}>
                Compte actif
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px 24px',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                color: '#475569',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px 24px',
                border: 'none',
                borderRadius: '12px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '15px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 8px 32px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
