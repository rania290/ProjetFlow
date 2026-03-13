import React, { useEffect, useState, useMemo } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { adminApi } from '../../api/admin.api';
import { UserRole } from '../../types/auth.types';
import type { User } from '../../types/auth.types';
import {
    Edit2, Shield, Trash2, UserPlus, X, Check, Search,
    Users, UserCheck, ShieldCheck, UserX, ChevronDown,
    Pencil, PlusCircle, AlertTriangle
} from 'lucide-react';

/* ───────────────────────── helpers ───────────────────────── */
type ToastType = 'success' | 'error';
interface Toast { id: number; type: ToastType; message: string }

const roleConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    ROOT: { label: 'Root', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
    ADMIN: { label: 'Admin', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
    PROJECT_MANAGER: { label: 'Chef de Projet', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    DEVELOPER: { label: 'Développeur', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    DESIGNER: { label: 'Designer', color: 'text-pink-700', bg: 'bg-pink-50', border: 'border-pink-200' },
    CLIENT: { label: 'Client', color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200' },
    AURA_AI: { label: 'Aura AI', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
};


const initials = (name?: string) =>
    (name ?? '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const avatarColor = (role: string) => {
    const map: Record<string, string> = {
        ROOT: 'from-purple-500 to-purple-700',
        ADMIN: 'from-red-500 to-red-700',
        PROJECT_MANAGER: 'from-blue-500 to-blue-700',
        DEVELOPER: 'from-indigo-500 to-indigo-700',
        DESIGNER: 'from-pink-500 to-pink-700',
        CLIENT: 'from-cyan-500 to-cyan-700',
        AURA_AI: 'from-amber-500 to-amber-700',
    };
    return map[role] ?? 'from-slate-500 to-slate-700';
};



/* ───────────────────────── component ───────────────────────── */
export const UsersManagementPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');

    // Modal state
    const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
    const [form, setForm] = useState<Partial<User> & { password?: string }>({
        password: 'changeme123', role: UserRole.DEVELOPER,
    });

    // Toasts
    const [toasts, setToasts] = useState<Toast[]>([]);
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
        if (!window.confirm(`Supprimer ${user.fullName ?? user.email} ?`)) return;
        try {
            await adminApi.deleteUser(user.id);
            setUsers(prev => prev.filter(u => u.id !== user.id));
            addToast('success', 'Utilisateur supprimé');
        } catch { addToast('error', 'Erreur lors de la suppression'); }
    };

    const toggleActive = async (user: User) => {
        try {
            const updated = await adminApi.updateUser(user.id, { isActive: !user.isActive });
            setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
            addToast('success', updated.isActive ? 'Compte activé' : 'Compte désactivé');
        } catch { addToast('error', 'Erreur lors du changement de statut'); }
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
    const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> =
        ({ icon, label, value, color }) => (
            <div className={`flex items-center gap-4 bg-white rounded-xl border border-slate-200 px-5 py-4 shadow-sm`}>
                <div className={`p-2.5 rounded-lg ${color}`}>{icon}</div>
                <div>
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                    <p className="text-xs text-slate-500 font-medium">{label}</p>
                </div>
            </div>
        );

    return (
        <AppLayout title="Gestion des Utilisateurs" subtitle="CRUD complet et gestion des rôles (RBAC)">
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

                {/* ── Page header with blue button top-right ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Utilisateurs du Système</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Gérez les comptes, rôles et accès</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm font-medium text-sm"
                    >
                        <UserPlus className="w-4 h-4" />
                        Nouveau Profil
                    </button>
                </div>

                {/* ── Stats bar ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={<Users className="w-5 h-5 text-blue-600" />} label="Total utilisateurs" value={stats.total} color="bg-blue-50" />
                    <StatCard icon={<UserCheck className="w-5 h-5 text-emerald-600" />} label="Comptes actifs" value={stats.active} color="bg-emerald-50" />
                    <StatCard icon={<ShieldCheck className="w-5 h-5 text-purple-600" />} label="Administrateurs" value={stats.admins} color="bg-purple-50" />
                    <StatCard icon={<UserX className="w-5 h-5 text-slate-500" />} label="Comptes inactifs" value={stats.inactive} color="bg-slate-100" />
                </div>

                {/* ── Search & Filter ── */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou email…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={roleFilter}
                            onChange={e => setRoleFilter(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        >
                            <option value="ALL">Tous les rôles</option>
                            {Object.entries(roleConfig).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* ── User cards grid ── */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-200" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
                        <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Aucun utilisateur trouvé</p>
                        <p className="text-slate-400 text-sm mt-1">Essayez de modifier vos filtres</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(user => {
                            const cfg = roleConfig[user.role];
                            const isActive = user.isActive !== false;
                            return (
                                <div key={user.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                                    {/* Card top accent line */}
                                    <div className={`h-1 ${cfg ? cfg.bg.replace('bg-', 'bg-gradient-to-r from-') : 'bg-slate-200'}`} />

                                    <div className="p-5">
                                        {/* Avatar + info */}
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarColor(user.role)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow`}>
                                                {initials(user.fullName)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-900 truncate">{user.fullName ?? '—'}</p>
                                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                                {user.createdAt && (
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        Créé le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Badges */}
                                        <div className="flex items-center gap-2 flex-wrap mb-4">
                                            <RoleBadge role={user.role} />
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
                        ${isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                {isActive ? 'Actif' : 'Inactif'}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                            <div className="flex items-center gap-1">
                                                {/* Edit */}
                                                <button
                                                    onClick={() => openEdit(user)}
                                                    title="Modifier"
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                {/* Toggle active */}
                                                <button
                                                    onClick={() => toggleActive(user)}
                                                    title={isActive ? 'Désactiver' : 'Activer'}
                                                    className={`p-2 rounded-lg transition-colors ${isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                                >
                                                    {isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                </button>
                                                {/* Delete */}
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    title="Supprimer"
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>

            {/* ────────────── Create / Edit Modal ────────────── */}
            {modalMode && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        onClick={closeModal}
                    />
                    {/* Panel */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-700">
                            <div className="flex items-center gap-3">
                                {modalMode === 'create'
                                    ? <PlusCircle className="w-5 h-5 text-white" />
                                    : <Pencil className="w-5 h-5 text-white" />}
                                <h3 className="text-white font-semibold text-lg">
                                    {modalMode === 'create' ? 'Créer un utilisateur' : 'Modifier l\'utilisateur'}
                                </h3>
                            </div>
                            <button onClick={closeModal} className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/20">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 space-y-4">
                            {/* Avatar preview */}
                            {form.role && (
                                <div className="flex justify-center">
                                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${avatarColor(form.role)} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                                        {initials(form.fullName)}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Nom complet *</label>
                                    <input
                                        type="text"
                                        placeholder="Jean Dupont"
                                        value={form.fullName ?? ''}
                                        onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email *</label>
                                    <input
                                        type="email"
                                        placeholder="jean@vaerdia.com"
                                        value={form.email ?? ''}
                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                                        Mot de passe {modalMode === 'edit' ? '(laisser vide = inchangé)' : '*'}
                                    </label>
                                    <input
                                        type="password"
                                        placeholder={modalMode === 'edit' ? '••••••••' : 'Min. 8 caractères'}
                                        value={form.password ?? ''}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Rôle</label>
                                    <div className="relative">
                                        <select
                                            value={form.role ?? UserRole.DEVELOPER}
                                            onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
                                            className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {Object.entries(roleConfig).map(([k, v]) => (
                                                <option key={k} value={k}>{v.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                    {form.role && (
                                        <div className="mt-2">
                                            <RoleBadge role={form.role} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">Compte actif</p>
                                        <p className="text-xs text-slate-400">L'utilisateur peut se connecter</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.isActive !== false ? 'bg-blue-600' : 'bg-slate-300'
                                            }`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isActive !== false ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
                            <button
                                onClick={closeModal}
                                className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
                            >
                                <Check className="w-4 h-4" />
                                {modalMode === 'create' ? 'Créer' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
};
