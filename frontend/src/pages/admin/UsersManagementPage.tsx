import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, Edit2, Trash2, Shield, Users, Mail, Calendar, Filter, MoreVertical, AlertCircle,
    UserPlus, X, Check, UserCheck, ShieldCheck, UserX, ChevronDown, Camera, User as UserIcon,
    Pencil, PlusCircle, AlertTriangle, Settings, Lock, Crown, Key,
    Briefcase, RotateCcw, Save, Eye
} from 'lucide-react';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { AppLayout } from '../../components/layout/AppLayout';
import { adminApi } from '../../api/admin.api';
import { UserRole } from '../../types/auth.types';
import type { User } from '../../types/auth.types';
import { GlassCard } from '../../components/ui/GlassCard';
import { FadeInView } from '../../components/ui/FadeInView';

/* ───────────────────────── helpers ───────────────────────── */
type ToastType = 'success' | 'error';
interface Toast { id: number; type: ToastType; message: string }

// Configuration des permissions
const PERMISSIONS_CONFIG = {
    // Utilisateurs
    CREATE_USER: { label: 'Créer des utilisateurs', category: 'Utilisateurs', icon: '👤', description: 'Ajouter de nouveaux membres' },
    READ_USER: { label: 'Voir les utilisateurs', category: 'Utilisateurs', icon: '👁️', description: 'Consulter la liste des utilisateurs' },
    UPDATE_USER: { label: 'Modifier les utilisateurs', category: 'Utilisateurs', icon: '✏️', description: 'Mettre à jour les profils' },
    DELETE_USER: { label: 'Supprimer les utilisateurs', category: 'Utilisateurs', icon: '🗑️', description: 'Retirer des utilisateurs' },
    MANAGE_ROLES: { label: 'Gérer les rôles', category: 'Utilisateurs', icon: '👑', description: 'Administrer les rôles et permissions' },

    // Projets
    CREATE_PROJECT: { label: 'Créer des projets', category: 'Projets', icon: '📁', description: 'Démarrer de nouveaux projets' },
    READ_PROJECT: { label: 'Voir les projets', category: 'Projets', icon: '👁️', description: 'Accéder à tous les projets' },
    UPDATE_PROJECT: { label: 'Modifier les projets', category: 'Projets', icon: '✏️', description: 'Éditer les informations de projet' },
    DELETE_PROJECT: { label: 'Supprimer les projets', category: 'Projets', icon: '🗑️', description: 'Archiver ou supprimer des projets' },
    ASSIGN_TASKS: { label: 'Assigner des tâches', category: 'Projets', icon: '📋', description: 'Distribuer le travail' },

    // Tâches
    CREATE_TASK: { label: 'Créer des tâches', category: 'Tâches', icon: '📝', description: 'Ajouter des tâches aux projets' },
    READ_TASK: { label: 'Voir les tâches', category: 'Tâches', icon: '👁️', description: 'Consulter toutes les tâches' },
    UPDATE_TASK: { label: 'Modifier les tâches', category: 'Tâches', icon: '✏️', description: 'Mettre à jour les tâches' },
    DELETE_TASK: { label: 'Supprimer les tâches', category: 'Tâches', icon: '🗑️', description: 'Retirer des tâches' },
    COMPLETE_TASK: { label: 'Terminer des tâches', category: 'Tâches', icon: '✅', description: 'Marquer les tâches comme terminées' },

    // Tickets
    CREATE_TICKET: { label: 'Créer des tickets', category: 'Tickets', icon: '🎫', description: 'Ouvrir des tickets de support' },
    READ_TICKET: { label: 'Voir les tickets', category: 'Tickets', icon: '👁️', description: 'Consulter les tickets' },
    UPDATE_TICKET: { label: 'Modifier les tickets', category: 'Tickets', icon: '✏️', description: 'Mettre à jour les tickets' },
    DELETE_TICKET: { label: 'Supprimer les tickets', category: 'Tickets', icon: '🗑️', description: 'Fermer des tickets' },
    ASSIGN_TICKET: { label: 'Assigner des tickets', category: 'Tickets', icon: '🔄', description: 'Distribuer les tickets' },

    // Communication
    SEND_MESSAGE: { label: 'Envoyer des messages', category: 'Communication', icon: '💬', description: 'Communiquer avec l\'équipe' },
    READ_MESSAGE: { label: 'Voir les messages', category: 'Communication', icon: '👁️', description: 'Accéder aux conversations' },
    CREATE_CHANNEL: { label: 'Créer des canaux', category: 'Communication', icon: '📢', description: 'Organiser la communication' },
    MANAGE_CHANNELS: { label: 'Gérer les canaux', category: 'Communication', icon: '⚙️', description: 'Administrer les canaux' },

    // RH
    REQUEST_LEAVE: { label: 'Demander des congés', category: 'RH', icon: '🏖️', description: 'Soumettre des demandes de congé' },
    APPROVE_LEAVE: { label: 'Approuver les congés', category: 'RH', icon: '✅', description: 'Valider les demandes de congé' },
    UPDATE_LEAVE: { label: 'Modifier les congés', category: 'RH', icon: '✏️', description: 'Mettre à jour les congés' },
    DELETE_LEAVE: { label: 'Supprimer les congés', category: 'RH', icon: '🗑️', description: 'Supprimer des congés' },
    MANAGE_LEAVE: { label: 'Gérer les congés', category: 'RH', icon: '⚙️', description: 'Gestion avancée des congés' },

    // User Story
    CREATE_USER_STORY: { label: 'Créer une User Story', category: 'User Story', icon: '➕', description: 'Ajouter une User Story' },
    READ_USER_STORY: { label: 'Voir les User Stories', category: 'User Story', icon: '👁️', description: 'Consulter les User Stories' },
    UPDATE_USER_STORY: { label: 'Modifier User Story', category: 'User Story', icon: '✏️', description: 'Mettre à jour' },
    DELETE_USER_STORY: { label: 'Supprimer User Story', category: 'User Story', icon: '🗑️', description: 'Supprimer' },
    MANAGE_USER_STORY: { label: 'Gérer User Stories', category: 'User Story', icon: '⚙️', description: 'Administration' },

    // Sprint
    CREATE_SPRINT: { label: 'Créer un Sprint', category: 'Sprint', icon: '➕', description: 'Planifier un Sprint' },
    READ_SPRINT: { label: 'Voir les Sprints', category: 'Sprint', icon: '👁️', description: 'Consulter les Sprints' },
    UPDATE_SPRINT: { label: 'Modifier Sprint', category: 'Sprint', icon: '✏️', description: 'Mettre à jour' },
    DELETE_SPRINT: { label: 'Supprimer Sprint', category: 'Sprint', icon: '🗑️', description: 'Supprimer' },
    MANAGE_SPRINT: { label: 'Gérer les Sprints', category: 'Sprint', icon: '⚙️', description: 'Administration' },

    // Backlog
    CREATE_BACKLOG: { label: 'Créer dans Backlog', category: 'Backlog', icon: '➕', description: 'Ajouter au Backlog' },
    READ_BACKLOG: { label: 'Voir le Backlog', category: 'Backlog', icon: '👁️', description: 'Consulter le Backlog' },
    UPDATE_BACKLOG: { label: 'Modifier Backlog', category: 'Backlog', icon: '✏️', description: 'Mettre à jour' },
    DELETE_BACKLOG: { label: 'Supprimer Backlog', category: 'Backlog', icon: '🗑️', description: 'Supprimer' },
    MANAGE_BACKLOG: { label: 'Gérer le Backlog', category: 'Backlog', icon: '⚙️', description: 'Administration' },

    // Reporting
    VIEW_REPORTS: { label: 'Voir les rapports', category: 'Reporting', icon: '📊', description: 'Accéder aux rapports' },
    GENERATE_REPORTS: { label: 'Générer des rapports', category: 'Reporting', icon: '📈', description: 'Créer des rapports personnalisés' },
    EXPORT_DATA: { label: 'Exporter des données', category: 'Reporting', icon: '📤', description: 'Télécharger les données' },
};

// Configuration des rôles avec permissions par défaut
const ROLE_PERMISSIONS_CONFIG = {
    ADMIN: {
        label: 'ADMIN',
        color: '#ef4444',
        bgColor: '#fef2f2',
        borderColor: '#fca5a5',
        icon: Shield,
        description: 'Accès complet au système',
        gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 50%, #fca5a5 100%)',
        shadow: '0 4px 20px rgba(239, 68, 68, 0.3)',
        defaultPermissions: Object.keys(PERMISSIONS_CONFIG)
    },
    PROJECT_MANAGER: {
        label: 'CHEF DE PROJET',
        color: '#3b82f6',
        bgColor: '#eff6ff',
        borderColor: '#93c5fd',
        icon: Briefcase,
        description: 'Gestion des projets et équipes',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)',
        shadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
        defaultPermissions: [
            'READ_USER', 'UPDATE_USER',
            'CREATE_PROJECT', 'READ_PROJECT', 'UPDATE_PROJECT', 'DELETE_PROJECT', 'ASSIGN_TASKS',
            'CREATE_TASK', 'READ_TASK', 'UPDATE_TASK', 'DELETE_TASK', 'COMPLETE_TASK',
            'CREATE_TICKET', 'READ_TICKET', 'UPDATE_TICKET', 'ASSIGN_TICKET',
            'SEND_MESSAGE', 'READ_MESSAGE', 'CREATE_CHANNEL',
            'VIEW_REPORTS', 'GENERATE_REPORTS',
            'READ_USER_STORY', 'READ_SPRINT', 'READ_BACKLOG'
        ]
    },
    DEVELOPER: {
        label: 'DÉVELOPPEUR',
        color: '#6366f1',
        bgColor: '#eef2ff',
        borderColor: '#a5b4fc',
        icon: Settings,
        description: 'Développement et code',
        gradient: 'linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #a5b4fc 100%)',
        shadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
        defaultPermissions: [
            'READ_USER',
            'READ_PROJECT', 'UPDATE_PROJECT',
            'CREATE_TASK', 'READ_TASK', 'UPDATE_TASK', 'COMPLETE_TASK',
            'CREATE_TICKET', 'READ_TICKET', 'UPDATE_TICKET',
            'SEND_MESSAGE', 'READ_MESSAGE',
            'VIEW_REPORTS'
        ]
    },
    DESIGNER: {
        label: 'DESIGNER',
        color: '#ec4899',
        bgColor: '#fdf2f8',
        borderColor: '#f9a8d4',
        icon: Settings,
        description: 'Design et UX/UI',
        gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #f9a8d4 100%)',
        shadow: '0 4px 20px rgba(236, 72, 153, 0.3)',
        defaultPermissions: [
            'READ_USER',
            'READ_PROJECT', 'UPDATE_PROJECT',
            'CREATE_TASK', 'READ_TASK', 'UPDATE_TASK', 'COMPLETE_TASK',
            'CREATE_TICKET', 'READ_TICKET', 'UPDATE_TICKET',
            'SEND_MESSAGE', 'READ_MESSAGE',
            'VIEW_REPORTS'
        ]
    },
    TESTER: {
        label: 'TESTEUR',
        color: '#f59e0b',
        bgColor: '#fffbeb',
        borderColor: '#fcd34d',
        icon: Eye,
        description: 'Tests et QA',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%)',
        shadow: '0 4px 20px rgba(245, 158, 11, 0.3)',
        defaultPermissions: [
            'READ_USER',
            'READ_PROJECT',
            'CREATE_TASK', 'READ_TASK', 'UPDATE_TASK',
            'CREATE_TICKET', 'READ_TICKET', 'UPDATE_TICKET',
            'SEND_MESSAGE', 'READ_MESSAGE',
            'VIEW_REPORTS'
        ]
    },
    CLIENT: {
        label: 'CLIENT',
        color: '#06b6d4',
        bgColor: '#ecfeff',
        borderColor: '#67e8f9',
        icon: UserCheck,
        description: 'Accès client aux projets',
        gradient: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 50%, #67e8f9 100%)',
        shadow: '0 4px 20px rgba(6, 182, 212, 0.3)',
        defaultPermissions: [
            'READ_PROJECT',
            'CREATE_TICKET', 'READ_TICKET', 'UPDATE_TICKET',
            'SEND_MESSAGE', 'READ_MESSAGE',
            'VIEW_REPORTS'
        ]
    },
    RH: {
        label: 'RESSOURCES HUMAINES',
        color: '#9333ea',
        bgColor: '#faf5ff',
        borderColor: '#d8b4fe',
        icon: Users,
        description: 'Gestion avancée RH',
        gradient: 'linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #c084fc 100%)',
        shadow: '0 4px 20px rgba(147, 51, 234, 0.3)',
        defaultPermissions: [
            'READ_USER', 'UPDATE_USER',
            'REQUEST_LEAVE', 'APPROVE_LEAVE',
            'UPDATE_LEAVE', 'DELETE_LEAVE', 'MANAGE_LEAVE',
            'VIEW_REPORTS'
        ]
    }
};

const roleConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    ADMIN: { label: 'ADMIN', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
    PROJECT_MANAGER: { label: 'CHEF DE PROJET', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    DEVELOPER: { label: 'DÉVELOPPEUR', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    DESIGNER: { label: 'DESIGNER', color: 'text-pink-700', bg: 'bg-pink-50', border: 'border-pink-200' },
    TESTER: { label: 'TESTEUR', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    RH: { label: 'RESSOURCES HUMAINES', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
    CLIENT: { label: 'CLIENT', color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200' },
};


const initials = (name?: string) =>
    (name ?? '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const avatarColor = (role: string) => {
    const map: Record<string, string> = {
        ADMIN: 'from-red-500 to-red-700',
        PROJECT_MANAGER: 'from-blue-500 to-blue-700',
        DESIGNER: 'from-pink-500 to-pink-700',
        CLIENT: 'from-cyan-500 to-cyan-700',
        RH: 'from-purple-500 to-purple-700',
        TESTER: 'from-amber-500 to-amber-700',
        AURA_AI: 'from-amber-400 to-orange-600',
    };
    return map[role] ?? 'from-slate-500 to-slate-700';
};



/* ───────────────────────── component ───────────────────────── */
const ROLE_DESC_KEYS: Record<string, string> = {
    ADMIN: 'admin.role_desc_admin',
    PROJECT_MANAGER: 'admin.role_desc_pm',
    DEVELOPER: 'admin.role_desc_dev',
    DESIGNER: 'admin.role_desc_designer',
    TESTER: 'admin.role_desc_tester',
    CLIENT: 'admin.role_desc_client',
    RH: 'admin.role_desc_rh',
};

export const UsersManagementPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    type UserWithPermissions = User & { permissions?: string[] };
    type RoleKey = keyof typeof ROLE_PERMISSIONS_CONFIG;
    const isRoleKey = (role: string): role is RoleKey => role in ROLE_PERMISSIONS_CONFIG;

    const permissionsByCategory = useMemo(() => {
        const acc: Record<string, Array<{ key: string; label: string; category: string; icon: string; description: string }>> = {};
        for (const [key, config] of Object.entries(PERMISSIONS_CONFIG)) {
            if (!acc[config.category]) acc[config.category] = [];
            acc[config.category].push({
                key,
                icon: config.icon,
                category: t(`admin.perm_categories.${config.category}`, config.category),
                label: t(`admin.perm_labels.${key}`, config.label),
                description: t(`admin.perm_descriptions.${key}`, config.description),
            });
        }
        return acc;
    }, [t, i18n.language]);

    const rolePermissionsConfig = useMemo(() => {
        return Object.fromEntries(
            Object.entries(ROLE_PERMISSIONS_CONFIG).map(([role, cfg]) => [
                role,
                {
                    ...cfg,
                    label: t(`admin.roles.${role}`, cfg.label),
                    description: t(ROLE_DESC_KEYS[role] ?? '', cfg.description),
                },
            ]),
        ) as typeof ROLE_PERMISSIONS_CONFIG;
    }, [t, i18n.language]);

    const [users, setUsers] = useState<UserWithPermissions[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');

    // Modal state
    const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
    const [form, setForm] = useState<Partial<User> & { password?: string }>({
        password: 'changeme123', role: UserRole.DEVELOPER,
    });

    // Permissions modal state
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<UserWithPermissions | null>(null);
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [hasPermissionChanges, setHasPermissionChanges] = useState(false);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

    // Toasts
    const [toasts, setToasts] = useState<Toast[]>([]);

    // Inline confirmation state
    const [pendingToggle, setPendingToggle] = useState<string | null>(null);

    // Confirmation dialog state (for delete)
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type?: 'danger' | 'warning' | 'info';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });
    const addToast = (type: ToastType, message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    };

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getAllUsers();
            setUsers(data);
        } catch (err: any) {
            console.error('Users API error:', err?.response?.status, err?.response?.data || err?.message);
            addToast('error', `Impossible de charger les utilisateurs: ${err?.response?.status || 'Erreur réseau'}`);
        } finally { setLoading(false); }
    };

    /* ─── filter ─── */
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return users.filter(u => {
            const matchSearch = !q
                || (u.fullName ?? '').toLowerCase().includes(q)
                || u.email.toLowerCase().includes(q);
            const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
            return matchSearch && matchRole;
        });
    }, [users, search, roleFilter]);

    /* ─── stats ─── */
    const stats = useMemo(() => ({
        total: users.length,
        active: users.filter(u => u.isActive !== false).length,
        admins: users.filter(u => ['ROOT', 'ADMIN'].includes(u.role)).length,
        inactive: users.filter(u => u.isActive === false).length,
    }), [users]);

    /* ─── CRUD handlers ─── */
    const openCreate = () => {
        setForm({ password: 'changeme123', role: UserRole.DEVELOPER, isActive: true });
        setModalMode('create');
    };

    const openEdit = (user: User) => {
        setForm({ ...user, password: '' });
        setModalMode('edit');
    };

    const closeModal = () => { setModalMode(null); setForm({ password: 'changeme123', role: UserRole.DEVELOPER }); };

    const handleSave = async () => {
        if (modalMode === 'create') {
            if (!form.email || !form.fullName) { addToast('error', 'Email et nom sont requis'); return; }
            try {
                const newUser = await adminApi.createUser(form);
                setUsers(prev => [...prev, newUser]);
                addToast('success', `Utilisateur ${newUser.fullName} créé avec succès`);
                closeModal();
            } catch (err: any) {
                addToast('error', err?.response?.data?.message ?? 'Erreur lors de la création');
            }
        } else if (modalMode === 'edit' && form.id) {
            try {
                const updated = await adminApi.updateUser(form.id, form);
                setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
                addToast('success', 'Utilisateur mis à jour');
                closeModal();
            } catch {
                addToast('error', 'Erreur lors de la mise à jour');
            }
        }
    };

    const handleDelete = async (user: User) => {
        console.log('handleDelete called for user:', user);
        setConfirmDialog({
            isOpen: true,
            title: 'Confirmation de suppression',
            message: `Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.fullName ?? user.email}" ? Cette action est irréversible.`,
            onConfirm: async () => {
                try {
                    await adminApi.deleteUser(user.id);
                    setUsers(prev => prev.filter(u => u.id !== user.id));
                    addToast('success', 'Utilisateur supprimé');
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                } catch {
                    addToast('error', 'Erreur lors de la suppression');
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const toggleActive = async (user: User) => {
        // If not already in pending state for THIS user, set it and wait
        if (pendingToggle !== user.id) {
            setPendingToggle(user.id);
            // Auto-cancel after 4 seconds
            setTimeout(() => {
                setPendingToggle(prev => prev === user.id ? null : prev);
            }, 4000);
            return;
        }

        // Second click: perform the action
        const isActive = user.isActive !== false;
        try {
            const updated = await adminApi.updateUser(user.id, { isActive: !isActive });
            setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
            addToast('success', updated.isActive ? 'Compte activé' : 'Compte désactivé');
            setPendingToggle(null);
        } catch {
            addToast('error', 'Erreur lors du changement de statut');
            setPendingToggle(null);
        }
    };

    // Permissions handlers
    const openPermissionsModal = (user: User) => {
        setSelectedUserForPermissions(user);
        setSelectedRole(user.role || '');
        const permissions =
            (user as UserWithPermissions).permissions ||
            ROLE_PERMISSIONS_CONFIG[user.role]?.defaultPermissions ||
            [];
        setSelectedPermissions([...permissions]);
        setHasPermissionChanges(false);
        setShowPermissionsModal(true);
    };

    const closePermissionsModal = () => {
        setShowPermissionsModal(false);
        setSelectedUserForPermissions(null);
        setSelectedRole('');
        setSelectedPermissions([]);
        setHasPermissionChanges(false);
    };

    const handleRoleChange = (newRole: string) => {
        setSelectedRole(newRole);
        const defaultPermissions = isRoleKey(newRole) ? ROLE_PERMISSIONS_CONFIG[newRole].defaultPermissions : [];
        setSelectedPermissions(defaultPermissions);
        setHasPermissionChanges(true);
    };

    const handlePermissionToggle = (permission: string) => {
        setSelectedPermissions(prev => {
            const updated = prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission];
            setHasPermissionChanges(true);
            return updated;
        });
    };

    const handleCategoryToggle = (category: string, permissions: Array<{ key: string }>) => {
        const categoryKeys = permissions.map(p => p.key);
        const hasAllPermissions = categoryKeys.every(key => selectedPermissions.includes(key));

        setSelectedPermissions(prev => {
            const updated = hasAllPermissions
                ? prev.filter(p => !categoryKeys.includes(p))
                : [...prev, ...categoryKeys.filter(key => !prev.includes(key))];
            setHasPermissionChanges(true);
            return updated;
        });
    };

    const resetToDefaults = () => {
        const defaultPermissions = isRoleKey(selectedRole) ? ROLE_PERMISSIONS_CONFIG[selectedRole].defaultPermissions : [];
        setSelectedPermissions(defaultPermissions);
        setHasPermissionChanges(true);
    };

    const savePermissions = async () => {
        if (!selectedUserForPermissions) return;

        setIsLoadingPermissions(true);
        try {
            // Simuler appel API
            await new Promise(resolve => setTimeout(resolve, 1000));

            setUsers(prev => prev.map(user =>
                user.id === selectedUserForPermissions.id
                    ? { ...user, role: (selectedRole as UserRole), permissions: selectedPermissions }
                    : user
            ));

            addToast('success', `Permissions mises à jour pour ${selectedUserForPermissions.fullName}`);
            closePermissionsModal();
        } catch (error) {
            addToast('error', 'Erreur lors de la mise à jour des permissions');
        } finally {
            setIsLoadingPermissions(false);
        }
    };

    /* ─── ROLE BADGE ─── */
    const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
        const cfg = roleConfig[role] ?? { label: role, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' };
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                <Shield className="w-3 h-3" />
                {cfg.label}
            </span>
        );
    };

    /* ─── STAT CARD ─── */
    const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string; subValue?: string }> =
        ({ icon, label, value, color, subValue }) => (
            <GlassCard className="flex items-center gap-5 px-6 py-5 group hover:scale-[1.02] transition-transform duration-300">
                <div className={`p-3.5 rounded-2xl ${color} shadow-lg ring-4 ring-current/5 group-hover:scale-110 transition-transform`}>{icon}</div>
                <div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
                        {subValue && <span className="text-[10px] font-bold text-slate-400">{subValue}</span>}
                    </div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5 opacity-70">{label}</p>
                </div>
            </GlassCard>
        );

    return (
        <AppLayout title={t('admin.users_title')} subtitle={t('admin.crud_subtitle')}>
            <FadeInView className="p-4 md:p-6 space-y-6">
                {/* ── Toast notifications ── */}
                <div className="fixed top-5 right-5 z-50 space-y-2 pointer-events-none">
                    {toasts.map(t => (
                        <div
                            key={t.id}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium pointer-events-auto transition-all duration-300
                  ${t.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
                        >
                            {t.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                            {t.message}
                        </div>
                    ))}
                </div>

                <div className="max-w-7xl mx-auto space-y-6">

                    {/* NEW HEADER CARD: Identity + Integrated Search (Mes Projets Style) */}
                    <GlassCard className="p-6 border-white/40" delay={0.1}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-xl font-black text-slate-900 font-display flex items-center gap-2 uppercase tracking-tight">
                                            {t('admin.users_title')}
                                            <span className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-400 text-[10px] font-black border border-slate-100">
                                                {stats.total}
                                            </span>
                                        </h1>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                        {t('admin.rbac_system_desc')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="relative w-full md:w-80 group">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder={t('admin.search_name_email_role')}
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        autoComplete="off"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 text-sm transition-all placeholder:text-slate-400/70"
                                    />
                                </div>



                                <button
                                    onClick={openCreate}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl hover:bg-slate-800 active:scale-95 transition-all shadow-lg font-black text-[10px] uppercase tracking-widest group"
                                >
                                    <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    {t('admin.add_profile')}
                                </button>
                            </div>
                        </div>
                    </GlassCard>

                    {/* NEW FILTER ROW: Pills + Dropdowns (Mes Projets Style) */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl text-[10px] font-black text-emerald-700 border border-emerald-100 shadow-sm uppercase tracking-tighter transition-transform hover:-translate-y-0.5 cursor-default">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>{t('admin.active_count', { count: stats.active })}</span>
                            </div>

                            {stats.inactive > 0 && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 border border-slate-200 shadow-sm uppercase tracking-tighter transition-transform hover:-translate-y-0.5 cursor-default">
                                    <X className="w-3.5 h-3.5 opacity-60" />
                                    <span>{t('admin.inactive_count', { count: stats.inactive })}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-xl text-[10px] font-black text-indigo-700 border border-indigo-100 shadow-sm uppercase tracking-tighter transition-transform hover:-translate-y-0.5 cursor-default">
                                <ShieldCheck className="w-3.5 h-3.5 opacity-80" />
                                <span>{t('admin.admins_count', { count: stats.admins })}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                value={roleFilter}
                                onChange={e => setRoleFilter(e.target.value)}
                                className="py-1.5 pl-3 pr-8 bg-white border border-slate-200 rounded-xl text-[11px] font-medium uppercase tracking-tight text-slate-800 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                            >
                                <option value="ALL" className="text-slate-800 bg-white font-medium">Tous les rôles</option>
                                {Object.entries(roleConfig).map(([k, v]) => (
                                    <option key={k} value={k} className="text-slate-800 bg-white font-medium">{v.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ── User cards grid ── */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <GlassCard key={i} className="p-6 animate-pulse">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-100" />
                                        <div className="flex-1 space-y-3">
                                            <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                                            <div className="h-3 bg-slate-50 rounded-full w-1/2" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-8 bg-slate-50 rounded-xl w-full" />
                                        <div className="h-10 bg-slate-100 rounded-xl w-full" />
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <GlassCard className="py-24 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <Users className="w-10 h-10" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Aucun profil détecté</h3>
                            <p className="text-xs text-slate-400 mt-2 font-medium">Ajustez vos filtres ou effectuez une nouvelle recherche.</p>
                        </GlassCard>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((user, idx) => {
                                const cfg = roleConfig[user.role];
                                const isActive = user.isActive !== false;
                                return (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <GlassCard className="group relative overflow-hidden h-full flex flex-col hover:border-indigo-500/30 transition-all duration-300">
                                            {/* Card top accent line */}
                                            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                            <div className="p-6 flex-1 flex flex-col">
                                                {/* Avatar + info */}
                                                <div className="flex items-start gap-4 mb-6">
                                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarColor(user.role)} flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-lg ring-4 ring-indigo-500/5 transition-transform group-hover:scale-110 duration-300`}>
                                                        {initials(user.fullName)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-slate-900 truncate tracking-tight text-base">{user.fullName ?? 'Utilisateur Anonyme'}</p>
                                                        <p className="text-[11px] text-slate-500 truncate font-semibold lowercase mt-0.5 opacity-80">{user.email}</p>
                                                        {user.createdAt && (
                                                            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 mt-2 uppercase tracking-widest">
                                                                <Calendar className="w-3 h-3" />
                                                                Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                                            </div>
                                                        )}

                                                    </div>
                                                </div>

                                                {/* Badges Section */}
                                                <div className="flex items-center gap-2 flex-wrap mb-6">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-medium uppercase tracking-widest border shadow-sm transition-all ${cfg?.color || 'text-slate-500'}`}>
                                                        <Shield className="w-3 h-3" />
                                                        {cfg?.label || user.role}
                                                    </div>
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all
                                                    ${isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm shadow-emerald-500/5' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                                        {isActive ? 'Actif' : 'Désactivé'}
                                                    </div>
                                                </div>

                                                {/* Actions Footer */}
                                                <div className="mt-auto pt-5 border-t border-slate-100/50 flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => openEdit(user)}
                                                            title="Modifier le profil"
                                                            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100 active:scale-90"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openPermissionsModal(user)}
                                                            title="Gestion des accès"
                                                            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all border border-transparent hover:border-purple-100 active:scale-90"
                                                        >
                                                            <Lock className="w-4 h-4" />
                                                        </button>
                                                        <div className="relative">
                                                            {pendingToggle === user.id ? (
                                                                <motion.button
                                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    onClick={(e) => { e.stopPropagation(); toggleActive(user); }}
                                                                    className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all animate-pulse border-2 active:scale-95
                                                                    ${isActive ? 'bg-red-500 text-white border-red-400' : 'bg-emerald-500 text-white border-emerald-400'}`}
                                                                >
                                                                    Confirmer ?
                                                                </motion.button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => toggleActive(user)}
                                                                    title={isActive ? 'Bloquer l\'accès' : 'Autoriser l\'accès'}
                                                                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all border border-transparent active:scale-90
                                                                    ${isActive ? 'text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 hover:border-emerald-100'}`}
                                                                >
                                                                    {isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleDelete(user)}
                                                        title="Supprimer définitivement"
                                                        className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent active:scale-90"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </FadeInView>

            {/* ────────────── Create / Edit Modal (Ultra-Professional Identity Header) ────────────── */}
            <AnimatePresence>
                {modalMode && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                            onClick={closeModal}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.99, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.99, y: 15 }}
                            className="relative bg-white rounded-[32px] shadow-[0_30px_80px_rgba(0,0,0,0.15)] w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border border-slate-100"
                        >
                            {/* VISUAL ACCENT HEADER */}
                            <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

                            {/* MODAL HEADER */}
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">
                                            {modalMode === 'create' ? 'Nouveau collaborateur' : 'Dossier collaborateur'}
                                        </h3>
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Configuration des accès système</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-90 border border-transparent hover:border-slate-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* BODY CONTENT */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">

                                {/* 1. IDENTITY HEADER BLOCK */}
                                <div className="px-6 py-6 bg-slate-50/30 border-b border-slate-100">
                                    <div className="flex items-center gap-5">
                                        {/* Avatar circular on the left */}
                                        <div className="relative shrink-0 group">
                                            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${form.role ? avatarColor(form.role) : 'from-slate-100 to-slate-200'} flex items-center justify-center text-white font-black text-3xl shadow-xl border-2 border-white ring-1 ring-slate-100 transition-transform group-hover:scale-[1.02] duration-300`}>
                                                {form.fullName ? initials(form.fullName) : <UserIcon className="w-8 h-8 opacity-40" />}
                                            </div>
                                            <button className="absolute bottom-0 right-0 bg-white text-slate-900 rounded-full w-7 h-7 flex items-center justify-center shadow-lg border border-slate-100 hover:bg-slate-50 transition-all">
                                                <Camera className="w-3 h-3" />
                                            </button>
                                        </div>

                                        {/* Identity Data on the right */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2 truncate">
                                                {form.fullName || 'Nouvelle Identité'}
                                            </h4>
                                            <div className="space-y-1 font-display">
                                                <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em]">
                                                    {form.role || 'Profil à définir'}
                                                </p>
                                                <span className="text-sm font-medium text-slate-400 lowercase flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200 inline-block" />
                                                    {form.email || 'email@vaerdia.tech'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. CONFIGURATION FIELDS SECTION */}
                                <div className="px-6 py-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest pr-2 border-l-2 border-indigo-500 pl-3">Identité Nominale</label>
                                            <input
                                                type="text"
                                                placeholder="ex. Alexander Sterling"
                                                value={form.fullName ?? ''}
                                                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                                                className="w-full bg-slate-50/50 border border-slate-200/60 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-950 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest pr-2 border-l-2 border-slate-200 pl-3">Contact Professionnel</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                                                <input
                                                    type="email"
                                                    placeholder="sterling@vaerdia.tech"
                                                    value={form.email ?? ''}
                                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                                    className="w-full pl-11 pr-5 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-sm font-medium text-slate-950 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest pr-2 border-l-2 border-indigo-500 pl-3">Accréditation Système</label>
                                            <div className="relative">
                                                <select
                                                    value={form.role ?? ''}
                                                    onChange={e => setForm(f => ({ ...f, role: e.target.value as any }))}
                                                    className="w-full appearance-none bg-slate-50/50 border border-slate-200/60 rounded-2xl px-5 py-3.5 text-[11px] font-medium uppercase tracking-widest text-slate-900 cursor-pointer focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 transition-all outline-none"
                                                >
                                                    <option value="" disabled>Choisir un profil</option>
                                                    {Object.entries(rolePermissionsConfig).map(([k, cfg]) => (
                                                        <option key={k} value={k}>{cfg.label}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest pr-2 border-l-2 border-slate-200 pl-3">Sécurité & Pass</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                <input
                                                    type="password"
                                                    placeholder="••••••••••••"
                                                    value={form.password ?? ''}
                                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                                    className="w-full pl-11 pr-5 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-sm font-medium text-slate-950 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>



                                    {/* STATUS BLOCK (PURE LIGHT VERSION) */}
                                    <div className="p-5 bg-slate-50/60 rounded-3xl border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-white shadow-sm border shrink-0 ${form.isActive !== false ? 'text-emerald-500 border-emerald-100' : 'text-slate-300 border-slate-200'}`}>
                                                {form.isActive !== false ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Accès Portail Professionnel</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                    {form.isActive !== false ? 'L\'utilisateur peut se connecter à son espace' : 'L\'accès est temporairement suspendu'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                                            className={`relative inline-flex h-9 w-16 items-center rounded-full transition-all ring-4 ring-white shadow-inner ${form.isActive !== false ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                        >
                                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-500 shadow-lg ${form.isActive !== false ? 'translate-x-[2.25rem]' : 'translate-x-1.5'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* FOOTER ACTIONS */}
                            <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
                                <button
                                    onClick={closeModal}
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-950 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:bg-black transition-all active:scale-95"
                                >
                                    {modalMode === 'create' ? <PlusCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                    <span>{modalMode === 'create' ? 'Certifier & Créer' : 'Sauvegarder'}</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ────────────── Permissions Modal ────────────── */}
            <AnimatePresence>
                {showPermissionsModal && selectedUserForPermissions && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/70 backdrop-blur-2xl"
                            onClick={closePermissionsModal}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 30 }}
                            className="relative bg-white rounded-[2.5rem] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.5)] w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden border border-white/20"
                        >
                            {/* Matrix Header */}
                            <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-2xl shadow-purple-500/20">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                            {t('admin.rbac_control_matrix')}
                                        </h3>
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                                            {t('admin.granular_privileges_for')} <span className="text-slate-900">{selectedUserForPermissions.fullName}</span>
                                        </p>
                                    </div>
                                </div>
                                <button onClick={closePermissionsModal} className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 flex min-h-0 bg-slate-50/50">
                                {/* Left Panel: Control Center */}
                                <div className="w-[240px] flex-none border-r border-slate-100 bg-white p-5 space-y-6 overflow-y-auto custom-scrollbar">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{t('admin.target_profile')}</h4>
                                        <GlassCard className="p-4 flex flex-col items-center text-center gap-3 border-none shadow-xl shadow-slate-200/50">
                                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarColor(selectedUserForPermissions.role)} flex items-center justify-center text-white font-black text-lg shadow-xl ring-4 ring-white`}>
                                                {initials(selectedUserForPermissions.fullName)}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 text-sm tracking-tight leading-tight">{selectedUserForPermissions.fullName}</div>
                                                <div className="text-[10px] text-slate-500 font-semibold lowercase opacity-70 mt-0.5 max-w-[180px] truncate">{selectedUserForPermissions.email}</div>
                                            </div>
                                        </GlassCard>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{t('admin.role_model_label')}</h4>
                                        <div className="relative group">
                                            <select
                                                value={selectedRole}
                                                onChange={(e) => handleRoleChange(e.target.value)}
                                                className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 transition-all cursor-pointer"
                                            >
                                                <option value="" disabled>{t('admin.select_profile_placeholder')}</option>
                                                {Object.entries(rolePermissionsConfig).map(([role, config]) => (
                                                    <option key={role} value={role}>{config.label}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-purple-500" />
                                        </div>
                                        {selectedRole && isRoleKey(selectedRole) && (
                                            <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                                                <p className="text-[10px] leading-relaxed text-purple-700 font-bold uppercase tracking-wider opacity-80">
                                                    {rolePermissionsConfig[selectedRole].description}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{t('admin.rights_summary')}</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-4 rounded-xl bg-indigo-900 text-white shadow-xl shadow-indigo-900/20">
                                                <div className="text-2xl font-black">{selectedPermissions.length}</div>
                                                <div className="text-[8px] font-black uppercase tracking-widest mt-1 opacity-60">{t('admin.active_permissions')}</div>
                                            </div>
                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                                <div className="text-2xl font-black text-slate-900">{Object.keys(PERMISSIONS_CONFIG).length}</div>
                                                <div className="text-[8px] font-black uppercase tracking-widest mt-1 text-slate-400">{t('admin.total_label')}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={resetToDefaults}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                                        >
                                            <RotateCcw className="w-3 h-3" />
                                            {t('admin.reset_to_model')}
                                        </button>
                                    </div>
                                </div>

                                {/* Right Panel: Matrix Grid */}
                                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar relative">
                                    <div className="max-w-6xl mx-auto space-y-10 pb-8">
                                        {Object.entries(permissionsByCategory).map(([category, permissions]) => {
                                            const categoryCodes = permissions.map(p => p.key);
                                            const allSelected = categoryCodes.every(key => selectedPermissions.includes(key));

                                            return (
                                                <div key={category} className="space-y-6">
                                                    <div className="flex items-end justify-between border-b-2 border-slate-100 pb-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-lg shadow-slate-200/50 text-xl">
                                                                {permissions[0]?.icon}
                                                            </div>
                                                            <div>
                                                                <h5 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t(`admin.perm_categories.${category}`, category)}</h5>
                                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{t('admin.security_modules_count', { count: permissions.length })}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleCategoryToggle(category, permissions)}
                                                            className={`text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all border shadow-sm ${allSelected
                                                                ? 'bg-slate-900 text-white border-black'
                                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                                }`}
                                                        >
                                                            {allSelected ? t('admin.batch_disable') : t('admin.batch_enable_all')}
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                        {permissions.map((permission) => {
                                                            const isChecked = selectedPermissions.includes(permission.key);
                                                            return (
                                                                <label
                                                                    key={permission.key}
                                                                    className={`relative flex flex-col gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer group select-none ${isChecked
                                                                        ? 'bg-indigo-50/30 border-indigo-500 shadow-xl shadow-indigo-500/5'
                                                                        : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${isChecked ? 'bg-indigo-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                                                            {permission.icon}
                                                                        </div>
                                                                        <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 ${isChecked ? 'bg-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.3)]' : 'bg-slate-200'}`}>
                                                                            <input
                                                                                type="checkbox"
                                                                                className="sr-only"
                                                                                checked={isChecked}
                                                                                onChange={() => handlePermissionToggle(permission.key)}
                                                                            />
                                                                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xl transition-transform duration-300 ${isChecked ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex-1">
                                                                        <div className={`text-xs font-black uppercase tracking-tight mb-0.5 ${isChecked ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                                            {permission.label}
                                                                        </div>
                                                                        <p className={`text-[9px] font-bold leading-relaxed transition-colors ${isChecked ? 'text-indigo-600' : 'text-slate-400'}`}>
                                                                            {permission.description}
                                                                        </p>
                                                                    </div>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Matrix Footer */}
                            <div className="flex-none flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white/80 backdrop-blur-md z-10">
                                <div className="flex items-center gap-4">
                                    <AnimatePresence>
                                        {hasPermissionChanges && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="flex items-center gap-3 px-5 py-2.5 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20"
                                            >
                                                <AlertTriangle className="w-5 h-5" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.15em]">{t('admin.pending_changes')}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={closePermissionsModal}
                                        className="px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 hover:text-slate-900 transition-colors"
                                    >
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        onClick={savePermissions}
                                        disabled={!hasPermissionChanges || isLoadingPermissions}
                                        className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 disabled:opacity-30 disabled:shadow-none transition-all active:scale-95"
                                    >
                                        {isLoadingPermissions ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>{t('admin.syncing_permissions')}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-3 h-3" />
                                                <span>{t('admin.apply_security')}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmText={t('admin.delete_confirm_text')}
                cancelText={t('common.cancel')}
                type="danger"
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            />
        </AppLayout>
    );
};
