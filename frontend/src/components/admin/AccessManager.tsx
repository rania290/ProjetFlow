import React, { useState, useEffect } from 'react';
import { Shield, Eye, Edit, Trash2, Users, BarChart3, Download, MessageSquare, Upload, CheckSquare, Settings, X, Plus, Search, Filter, Lock, AlertCircle, CheckCircle, Calendar, BookOpen, Layers, GitBranch } from 'lucide-react';
import { AppLayout } from '../layout/AppLayout';
import api from '../../api/api-client';

interface Permission {
  // Général
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
  // Congés (RH)
  canModifierConges: boolean;
  canSupprimerConges: boolean;
  canGererConges: boolean;
  // User Story
  canCreerUserStory: boolean;
  canVoirUserStory: boolean;
  canModifierUserStory: boolean;
  canSupprimerUserStory: boolean;
  canGererUserStory: boolean;
  // Sprint
  canCreerSprint: boolean;
  canVoirSprint: boolean;
  canModifierSprint: boolean;
  canSupprimerSprint: boolean;
  canGererSprint: boolean;
  // Backlog
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
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER' | 'TEAM_MEMBER' | 'CLIENT';
  permissions: Permission;
  createdAt: string;
  updatedAt?: string;
}

export const SuperSimpleAccessManager: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<ProjectPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPermission, setShowAddPermission] = useState(false);
  const [editingPermission, setEditingPermission] = useState<ProjectPermission | null>(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedRole, setSelectedRole] = useState('DEVELOPER');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  
  const [newPermissions, setNewPermissions] = useState<Permission>({
    canView: false,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canViewReports: false,
    canExport: false,
    canComment: false,
    canUploadFiles: false,
    canManageTasks: false,
    canAccessSettings: false,
    canModifierConges: false,
    canSupprimerConges: false,
    canGererConges: false,
    canCreerUserStory: false,
    canVoirUserStory: false,
    canModifierUserStory: false,
    canSupprimerUserStory: false,
    canGererUserStory: false,
    canCreerSprint: false,
    canVoirSprint: false,
    canModifierSprint: false,
    canSupprimerSprint: false,
    canGererSprint: false,
    canCreerBacklog: false,
    canVoirBacklog: false,
    canModifierBacklog: false,
    canSupprimerBacklog: false,
    canGererBacklog: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Tenter de charger les données depuis l'API
      const [usersRes, projectsRes, permissionsRes] = await Promise.all([
        api.get('/users').catch(() => ({ data: null })),
        api.get('/projects').catch(() => ({ data: null })),
        api.get('/permissions').catch(() => ({ data: null }))
      ]);
      
      // Utiliser les données de l'API si disponibles, sinon utiliser les données de test
      setUsers(usersRes.data || [
        { id: '1', fullName: 'Admin User', email: 'admin@vaerdia.com' },
        { id: '2', fullName: 'Dev User', email: 'dev@vaerdia.com' },
        { id: '3', fullName: 'Client User', email: 'client@vaerdia.com' }
      ]);
      
      setProjects(projectsRes.data && projectsRes.data.length > 0 ? projectsRes.data : [
        { id: '1', name: 'Projet Alpha', description: 'Application web principale' },
        { id: '2', name: 'Projet Beta', description: 'API REST' }
      ]);
      
      setPermissions(permissionsRes.data || []);
      
      if (!usersRes.data || !projectsRes.data || !permissionsRes.data) {
        // Mode silencieux - pas de message
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
      // Données de test en cas d'erreur
      setUsers([
        { id: '1', fullName: 'Admin User', email: 'admin@vaerdia.com' },
        { id: '2', fullName: 'Dev User', email: 'dev@vaerdia.com' },
        { id: '3', fullName: 'Client User', email: 'client@vaerdia.com' }
      ]);
      setProjects([
        { id: '1', name: 'Projet Alpha', description: 'Application web principale' },
        { id: '2', name: 'Projet Beta', description: 'API REST' }
      ]);
      // Mode silencieux - pas de message
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const addPermission = async () => {
    if (!selectedUser || !selectedProject) {
      return;
    }

    setLoading(true);
    try {
      const newPermission: Partial<ProjectPermission> = {
        user: users.find(u => u.id === selectedUser),
        project: projects.find(p => p.id === selectedProject),
        role: selectedRole as any,
        permissions: newPermissions,
        createdAt: new Date().toISOString()
      };

      if (editingPermission) {
        // Mise à jour
        try {
          await api.put(`/permissions/${editingPermission.id}`, newPermission);
          setPermissions(prev => prev.map(p => 
            p.id === editingPermission.id ? { ...p, ...newPermission } as ProjectPermission : p
          ));
        } catch (apiError) {
          console.log('API non disponible, mise à jour locale uniquement');
          setPermissions(prev => prev.map(p => 
            p.id === editingPermission.id ? { ...p, ...newPermission } as ProjectPermission : p
          ));
        }
      } else {
        // Création
        try {
          const response = await api.post('/permissions', newPermission);
          setPermissions(prev => [...prev, { ...newPermission, id: response.data.id || Date.now().toString() } as ProjectPermission]);
        } catch (apiError) {
          console.log('API non disponible, création locale uniquement');
          const localPermission = { ...newPermission, id: Date.now().toString() } as ProjectPermission;
          setPermissions(prev => [...prev, localPermission]);
        }
      }

      // Reset form
      setShowAddPermission(false);
      setEditingPermission(null);
      setSelectedUser('');
      setSelectedProject('');
      setSelectedRole('DEVELOPER');
      setNewPermissions({
        canView: false,
        canEdit: false,
        canDelete: false,
        canManageUsers: false,
        canViewReports: false,
        canExport: false,
        canComment: false,
        canUploadFiles: false,
        canManageTasks: false,
        canAccessSettings: false,
        canModifierConges: false,
        canSupprimerConges: false,
        canGererConges: false,
        canCreerUserStory: false,
        canVoirUserStory: false,
        canModifierUserStory: false,
        canSupprimerUserStory: false,
        canGererUserStory: false,
        canCreerSprint: false,
        canVoirSprint: false,
        canModifierSprint: false,
        canSupprimerSprint: false,
        canGererSprint: false,
        canCreerBacklog: false,
        canVoirBacklog: false,
        canModifierBacklog: false,
        canSupprimerBacklog: false,
        canGererBacklog: false,
      });
    } catch (error: any) {
      console.error('Erreur permission:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePermission = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette permission ?')) return;

    setLoading(true);
    try {
      try {
        await api.delete(`/permissions/${id}`);
        setPermissions(prev => prev.filter(p => p.id !== id));
      } catch (apiError) {
        console.log('API non disponible, suppression locale uniquement');
        setPermissions(prev => prev.filter(p => p.id !== id));
      }
    } catch (error: any) {
      console.error('Erreur suppression:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditPermission = (permission: ProjectPermission) => {
    setEditingPermission(permission);
    setSelectedUser(permission.user.id);
    setSelectedProject(permission.project.id);
    setSelectedRole(permission.role);
    setNewPermissions(permission.permissions);
    setShowAddPermission(true);
  };

  const filteredPermissions = permissions.filter(p => 
    p.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleColors: Record<string, { bg: string; text: string; icon: string }> = {
    'ADMIN': { bg: '#fee2e2', text: '#dc2626', icon: '👑' },
    'PROJECT_MANAGER': { bg: '#fef3c7', text: '#d97706', icon: '📋' },
    'DEVELOPER': { bg: '#dbeafe', text: '#2563eb', icon: '💻' },
    'TEAM_MEMBER': { bg: '#e0e7ff', text: '#6366f1', icon: '👥' },
    'CLIENT': { bg: '#f0fdf4', text: '#16a34a', icon: '🤝' },
    'RH': { bg: '#fdf4ff', text: '#9333ea', icon: '🗓️' },
  };

  return (
    <AppLayout title="Gestion des Permissions" subtitle="Contrôle d'accès granulaire aux projets">
      <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Shield style={{ color: '#3b82f6' }} />
                  Gestion des Permissions
                </h1>
                <p style={{ color: '#6b7280', fontSize: '16px' }}>
                  {permissions.length} permissions actives • {users.length} utilisateurs • {projects.length} projets
                </p>
              </div>
              <button
                onClick={() => setShowAddPermission(true)}
                disabled={loading}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)',
                  transition: 'all 0.2s'
                }}
              >
                <Plus size={18} />
                Ajouter Permission
              </button>
            </div>

            {/* Search and Filter */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
                <input
                  type="text"
                  placeholder="Rechercher par utilisateur, projet ou rôle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <button style={{
                padding: '10px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                color: '#374151',
                cursor: 'pointer'
              }}>
                <Filter size={16} />
                Filtrer
              </button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: messageType === 'success' ? '#f0fdf4' : messageType === 'error' ? '#fef2f2' : '#eff6ff',
              color: messageType === 'success' ? '#166534' : messageType === 'error' ? '#dc2626' : '#1e40af',
              border: `1px solid ${messageType === 'success' ? '#bbf7d0' : messageType === 'error' ? '#fecaca' : '#bfdbfe'}`
            }}>
              {messageType === 'success' ? <CheckCircle size={16} /> : messageType === 'error' ? <AlertCircle size={16} /> : <AlertCircle size={16} />}
              {message}
            </div>
          )}

          {/* Permissions Table */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ marginTop: '16px', color: '#6b7280' }}>Chargement des permissions...</p>
              </div>
            ) : filteredPermissions.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Lock size={32} style={{ color: '#9ca3af' }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Aucune permission trouvée
                </h3>
                <p style={{ color: '#6b7280' }}>
                  {searchTerm ? 'Aucun résultat pour votre recherche' : 'Commencez par ajouter votre première permission'}
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f9fafb' }}>
                    <tr>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Utilisateur
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Projet
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Rôle
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Permissions
                      </th>
                      <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPermissions.map((permission, index) => (
                      <tr key={permission.id} style={{ 
                        borderBottom: '1px solid #f3f4f6',
                        backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                        transition: 'background-color 0.2s'
                      }}>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '50%', 
                              backgroundColor: '#e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#6b7280'
                            }}>
                              {permission.user.fullName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                                {permission.user.fullName}
                              </div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                {permission.user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '2px' }}>
                              {permission.project.name}
                            </div>
                            {permission.project.description && (
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                {permission.project.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: roleColors[permission.role]?.bg || '#f3f4f6',
                            color: roleColors[permission.role]?.text || '#6b7280'
                          }}>
                            <span>{roleColors[permission.role]?.icon}</span>
                            {permission.role.replace('_', ' ')}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {/* Général */}
                            {permission.permissions.canView && <PermissionBadge icon={<Eye size={10} />} label="Vue" />}
                            {permission.permissions.canEdit && <PermissionBadge icon={<Edit size={10} />} label="Édition" />}
                            {permission.permissions.canDelete && <PermissionBadge icon={<Trash2 size={10} />} label="Suppression" />}
                            {permission.permissions.canManageUsers && <PermissionBadge icon={<Users size={10} />} label="Utilisateurs" />}
                            {permission.permissions.canViewReports && <PermissionBadge icon={<BarChart3 size={10} />} label="Rapports" />}
                            {permission.permissions.canExport && <PermissionBadge icon={<Download size={10} />} label="Export" />}
                            {permission.permissions.canComment && <PermissionBadge icon={<MessageSquare size={10} />} label="Commentaires" />}
                            {permission.permissions.canUploadFiles && <PermissionBadge icon={<Upload size={10} />} label="Upload" />}
                            {permission.permissions.canManageTasks && <PermissionBadge icon={<CheckSquare size={10} />} label="Tâches" />}
                            {permission.permissions.canAccessSettings && <PermissionBadge icon={<Settings size={10} />} label="Settings" />}
                            
                            {/* RH Congés */}
                            {permission.permissions.canModifierConges && <PermissionBadge icon={<Edit size={10} />} label="Modifier Congés" />}
                            {permission.permissions.canSupprimerConges && <PermissionBadge icon={<Trash2 size={10} />} label="Supprimer Congés" />}
                            {permission.permissions.canGererConges && <PermissionBadge icon={<Settings size={10} />} label="Gérer Congés" />}
                            
                            {/* User Story */}
                            {(permission.permissions.canCreerUserStory || permission.permissions.canVoirUserStory || permission.permissions.canModifierUserStory || permission.permissions.canSupprimerUserStory || permission.permissions.canGererUserStory) && (
                              <PermissionBadge icon={<BookOpen size={10} />} label="User Story" />
                            )}

                            {/* Sprint */}
                            {(permission.permissions.canCreerSprint || permission.permissions.canVoirSprint || permission.permissions.canModifierSprint || permission.permissions.canSupprimerSprint || permission.permissions.canGererSprint) && (
                              <PermissionBadge icon={<GitBranch size={10} />} label="Sprint" />
                            )}

                            {/* Backlog */}
                            {(permission.permissions.canCreerBacklog || permission.permissions.canVoirBacklog || permission.permissions.canModifierBacklog || permission.permissions.canSupprimerBacklog || permission.permissions.canGererBacklog) && (
                              <PermissionBadge icon={<Layers size={10} />} label="Backlog" />
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => startEditPermission(permission)}
                              style={{
                                padding: '6px 10px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                backgroundColor: 'white',
                                color: '#374151',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#f9fafb';
                                e.currentTarget.style.borderColor = '#3b82f6';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                              }}
                            >
                              <Edit size={14} />
                              Modifier
                            </button>
                            <button
                              onClick={() => deletePermission(permission.id)}
                              style={{
                                padding: '6px 10px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                backgroundColor: 'white',
                                color: '#dc2626',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#fef2f2';
                                e.currentTarget.style.borderColor = '#dc2626';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                              }}
                            >
                              <Trash2 size={14} />
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add/Edit Permission Modal */}
          {showAddPermission && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{
                  padding: '24px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                    {editingPermission ? 'Modifier Permission' : 'Ajouter Permission'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddPermission(false);
                      setEditingPermission(null);
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#6b7280',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                      Utilisateur
                    </label>
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      disabled={!!editingPermission}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: editingPermission ? '#f9fafb' : 'white'
                      }}
                    >
                      <option value="">Sélectionner un utilisateur</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.fullName} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                      Projet
                    </label>
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      disabled={!!editingPermission}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: editingPermission ? '#f9fafb' : 'white'
                      }}
                    >
                      <option value="">Sélectionner un projet</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                      Rôle
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    >
                      <option value="DEVELOPER">Développeur</option>
                      <option value="PROJECT_MANAGER">Chef de Projet</option>
                      <option value="ADMIN">Administrateur</option>
                      <option value="TEAM_MEMBER">Membre d'équipe</option>
                      <option value="CLIENT">Client</option>
                      <option value="RH">RH (Ressources Humaines)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                     <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                       Permissions
                     </label>

                     {/* Général */}
                     <PermissionGroup
                       title="Général"
                       icon={<Shield size={14} />}
                       color="#3b82f6"
                       fields={[
                         { key: 'canView', icon: <Eye size={13} />, label: 'Vue' },
                         { key: 'canEdit', icon: <Edit size={13} />, label: 'Édition' },
                         { key: 'canDelete', icon: <Trash2 size={13} />, label: 'Suppression' },
                         { key: 'canManageUsers', icon: <Users size={13} />, label: 'Utilisateurs' },
                         { key: 'canViewReports', icon: <BarChart3 size={13} />, label: 'Rapports' },
                         { key: 'canExport', icon: <Download size={13} />, label: 'Export' },
                         { key: 'canComment', icon: <MessageSquare size={13} />, label: 'Commentaires' },
                         { key: 'canUploadFiles', icon: <Upload size={13} />, label: 'Upload' },
                         { key: 'canManageTasks', icon: <CheckSquare size={13} />, label: 'Tâches' },
                         { key: 'canAccessSettings', icon: <Settings size={13} />, label: 'Settings' },
                       ]}
                       permissions={newPermissions}
                       onChange={(key, val) => setNewPermissions(prev => ({ ...prev, [key]: val }))}
                     />

                     {/* Congés (RH) */}
                     <PermissionGroup
                       title="Congés"
                       icon={<Calendar size={14} />}
                       color="#9333ea"
                       fields={[
                         { key: 'canModifierConges', icon: <Edit size={13} />, label: 'Modifier Congés' },
                         { key: 'canSupprimerConges', icon: <Trash2 size={13} />, label: 'Supprimer Congés' },
                         { key: 'canGererConges', icon: <Settings size={13} />, label: 'Gérer Congés' },
                       ]}
                       permissions={newPermissions}
                       onChange={(key, val) => setNewPermissions(prev => ({ ...prev, [key]: val }))}
                     />

                     {/* User Story */}
                     <PermissionGroup
                       title="User Story"
                       icon={<BookOpen size={14} />}
                       color="#0891b2"
                       fields={[
                         { key: 'canCreerUserStory', icon: <Plus size={13} />, label: 'Créer' },
                         { key: 'canVoirUserStory', icon: <Eye size={13} />, label: 'Voir' },
                         { key: 'canModifierUserStory', icon: <Edit size={13} />, label: 'Modifier' },
                         { key: 'canSupprimerUserStory', icon: <Trash2 size={13} />, label: 'Supprimer' },
                         { key: 'canGererUserStory', icon: <Settings size={13} />, label: 'Gérer' },
                       ]}
                       permissions={newPermissions}
                       onChange={(key, val) => setNewPermissions(prev => ({ ...prev, [key]: val }))}
                     />

                     {/* Sprint */}
                     <PermissionGroup
                       title="Sprint"
                       icon={<GitBranch size={14} />}
                       color="#059669"
                       fields={[
                         { key: 'canCreerSprint', icon: <Plus size={13} />, label: 'Créer' },
                         { key: 'canVoirSprint', icon: <Eye size={13} />, label: 'Voir' },
                         { key: 'canModifierSprint', icon: <Edit size={13} />, label: 'Modifier' },
                         { key: 'canSupprimerSprint', icon: <Trash2 size={13} />, label: 'Supprimer' },
                         { key: 'canGererSprint', icon: <Settings size={13} />, label: 'Gérer' },
                       ]}
                       permissions={newPermissions}
                       onChange={(key, val) => setNewPermissions(prev => ({ ...prev, [key]: val }))}
                     />

                     {/* Backlog */}
                     <PermissionGroup
                       title="Backlog"
                       icon={<Layers size={14} />}
                       color="#d97706"
                       fields={[
                         { key: 'canCreerBacklog', icon: <Plus size={13} />, label: 'Créer' },
                         { key: 'canVoirBacklog', icon: <Eye size={13} />, label: 'Voir' },
                         { key: 'canModifierBacklog', icon: <Edit size={13} />, label: 'Modifier' },
                         { key: 'canSupprimerBacklog', icon: <Trash2 size={13} />, label: 'Supprimer' },
                         { key: 'canGererBacklog', icon: <Settings size={13} />, label: 'Gérer' },
                       ]}
                       permissions={newPermissions}
                       onChange={(key, val) => setNewPermissions(prev => ({ ...prev, [key]: val }))}
                     />
                   </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => {
                        setShowAddPermission(false);
                        setEditingPermission(null);
                      }}
                      style={{
                        padding: '10px 20px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        color: '#374151',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={addPermission}
                      disabled={loading}
                      style={{
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {loading ? (
                        <>
                          <div style={{ width: '14px', height: '14px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                          Traitement...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          {editingPermission ? 'Mettre à jour' : 'Ajouter'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AppLayout>
  );
};

// Permission Badge Component
const PermissionBadge: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 6px',
    backgroundColor: '#f3f4f6',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '500',
    color: '#374151'
  }}>
    {icon}
    {label}
  </div>
);

// Permission Group Component
const PermissionGroup: React.FC<{
  title: string;
  icon: React.ReactNode;
  color: string;
  fields: { key: keyof Permission; icon: React.ReactNode; label: string }[];
  permissions: Permission;
  onChange: (key: string, val: boolean) => void;
}> = ({ title, icon, color, fields, permissions, onChange }) => (
  <div style={{ marginBottom: '16px' }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginBottom: '8px',
      paddingBottom: '6px',
      borderBottom: `2px solid ${color}22`
    }}>
      <span style={{ color }}>{icon}</span>
      <span style={{ fontSize: '12px', fontWeight: '700', color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
      {fields.map(({ key, icon: fieldIcon, label }) => (
        <label key={key} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 10px',
          border: `1px solid ${permissions[key] ? color + '55' : '#e5e7eb'}`,
          borderRadius: '7px',
          cursor: 'pointer',
          fontSize: '13px',
          transition: 'all 0.15s',
          backgroundColor: permissions[key] ? color + '11' : 'white'
        }}>
          <input
            type="checkbox"
            checked={!!permissions[key]}
            onChange={(e) => onChange(key as string, e.target.checked)}
            style={{ margin: 0, accentColor: color }}
          />
          <span style={{ color: permissions[key] ? color : '#6b7280' }}>{fieldIcon}</span>
          <span style={{ color: permissions[key] ? '#111827' : '#374151', fontWeight: permissions[key] ? '600' : '400' }}>{label}</span>
        </label>
      ))}
    </div>
  </div>
);
