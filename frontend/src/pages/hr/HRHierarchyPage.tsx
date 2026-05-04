import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, ChevronRight, ChevronDown, User, Shield,
    Briefcase, Search, Network, Maximize2, Minimize2
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import type { User as AuthUser } from '../../types/auth.types';
import { AppLayout } from '../../components/layout/AppLayout';
import { GlassCard } from '../../components/ui/GlassCard';
import { FadeInView } from '../../components/ui/FadeInView';

interface TreeNode extends AuthUser {
    children: TreeNode[];
}

export const HRHierarchyPage: React.FC = () => {
    const [users, setUsers] = useState<AuthUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await adminApi.getAllUsers();
                console.log('[OrgChart] Raw users data:', data);
                setUsers(data);
                // Expand roots by default
                const roots = data.filter(u => !u.managerId);
                setExpandedIds(new Set(roots.map(r => r.id)));
            } catch (err) {
                console.error('Failed to load users for org chart', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const buildTree = (userList: AuthUser[]): TreeNode[] => {
        // 1. Create a map of all users with empty children arrays
        const map: Record<string, TreeNode> = {};
        userList.forEach(u => {
            map[u.id] = { ...u, children: [] };
        });

        const roots: TreeNode[] = [];
        const isChildOfAny = new Set<string>();

        // 2. Build relationships
        userList.forEach(u => {
            const mIds = (u as any).managerIds || (u.managerId ? [u.managerId] : []);
            let hasValidManager = false;

            if (mIds.length > 0) {
                mIds.forEach(mId => {
                    if (map[mId]) {
                        // We use a reference here first to build the full graph
                        map[mId].children.push(map[u.id]);
                        isChildOfAny.add(u.id);
                        hasValidManager = true;
                    }
                });
            }

            // If no manager or manager not found in list, it's a root
            if (!hasValidManager) {
                roots.push(map[u.id]);
            }
        });

        // 3. Since we have a matrix (multi-parent), a simple tree reference might lead to 
        // shared children arrays. For the UI to work with framer-motion and unique keys,
        // we might need to deep clone or handle it at render.
        // For now, let's keep references but ensure roots are correctly identified.
        
        return roots.filter((node, index, self) => 
            self.findIndex(t => t.id === node.id) === index
        );
    };

    const treeData = useMemo(() => buildTree(users), [users]);

    const toggleExpand = (id: string) => {
        const next = new Set(expandedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedIds(next);
    };

    const expandAll = () => {
        setExpandedIds(new Set(users.map(u => u.id)));
    };

    const collapseAll = () => {
        setExpandedIds(new Set());
    };

    const initials = (name?: string) =>
        (name ?? '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const roleConfig = (role: string) => {
        switch (role) {
            case 'ADMIN': return { color: 'from-rose-500 to-rose-600', icon: <Shield className="w-3 h-3" />, label: 'Direction' };
            case 'PROJECT_MANAGER': return { color: 'from-amber-500 to-amber-600', icon: <Briefcase className="w-3 h-3" />, label: 'Management' };
            case 'RH': return { color: 'from-purple-500 to-purple-600', icon: <Network className="w-3 h-3" />, label: 'Ressources Humaines' };
            default: return { color: 'from-slate-500 to-slate-600', icon: <User className="w-3 h-3" />, label: 'Collaborateur' };
        }
    };

    const Node: React.FC<{ node: TreeNode; depth: number }> = ({ node, depth }) => {
        const isExpanded = expandedIds.has(node.id);
        const hasChildren = node.children.length > 0;
        const config = roleConfig(node.role);
        
        const mIds = (node as any).managerIds || (node.managerId ? [node.managerId] : []);
        const managers = users.filter(u => mIds.includes(u.id));

        const matchesSearch = searchQuery && (
            node.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            node.email.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div className="ml-12 mt-6 relative">
                {/* Connection Lines (Refined) */}
                {depth > 0 && (
                    <div className="absolute -left-8 top-[-24px] bottom-0 w-px bg-gradient-to-b from-slate-200 via-slate-200 to-transparent">
                        <div className="absolute top-[44px] left-0 w-8 h-px bg-slate-200" />
                    </div>
                )}

                <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`group relative flex items-center gap-5 p-5 rounded-[2.5rem] border transition-all duration-500 ${matchesSearch
                            ? 'bg-amber-50 border-amber-300 ring-4 ring-amber-700/5 shadow-2xl scale-[1.02] z-10'
                            : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5'
                        }`}
                >
                    {/* Level Badge */}
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[8px] font-black text-slate-400">
                        L{depth}
                    </div>

                    {/* Avatar with Gradient Ring */}
                    <div className="relative shrink-0">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.color} p-0.5 shadow-lg shadow-slate-200`}>
                            <div className="w-full h-full rounded-[0.9rem] bg-white flex items-center justify-center text-slate-900 font-black text-base">
                                {initials(node.fullName)}
                            </div>
                        </div>
                        <div className={`absolute -right-1 -bottom-1 w-6 h-6 rounded-lg bg-gradient-to-br ${config.color} border-2 border-white shadow-md flex items-center justify-center text-white`}>
                            {config.icon}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-slate-900 truncate tracking-tight">{node.fullName}</h4>
                            {mIds.length > 1 && (
                                <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-widest border border-indigo-100">
                                    Matrix
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{config.label}</p>
                        
                        {/* Manager Chips */}
                        {managers.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {managers.map(m => (
                                    <div key={m.id} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100 text-[8px] font-bold text-slate-500">
                                        <div className="w-1 h-1 rounded-full bg-slate-400" />
                                        {m.fullName?.split(' ')[0]}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        {hasChildren && (
                            <button
                                onClick={() => toggleExpand(node.id)}
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isExpanded 
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 rotate-180' 
                                    : 'bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'
                                    }`}
                            >
                                <ChevronDown className="w-5 h-5 transition-transform" />
                            </button>
                        )}
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{node.children.length} Directs</span>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {isExpanded && hasChildren && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, x: -20 }}
                            animate={{ opacity: 1, height: 'auto', x: 0 }}
                            exit={{ opacity: 0, height: 0, x: -20 }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                            className="overflow-hidden"
                        >
                            {node.children.map((child, idx) => (
                                <Node key={`${child.id}-${idx}`} node={child} depth={depth + 1} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <AppLayout title="Organigramme" subtitle="Visualisation de la hiérarchie d'entreprise">
            <FadeInView className="p-8 space-y-8">
                {/* Control Bar */}
                <GlassCard className="p-6 border-white/40">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                                <Search className="w-5 h-5" />
                            </div>
                            <div className="relative w-full md:w-80 group">
                                <input
                                    type="text"
                                    placeholder="Rechercher par nom ou rôle..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-400/50 text-xs font-bold transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button 
                                onClick={expandAll} 
                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm active:scale-95"
                                title="Tout déployer"
                            >
                                <Maximize2 className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={collapseAll} 
                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                                title="Tout réduire"
                            >
                                <Minimize2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </GlassCard>

                {/* Tree View */}
                <div className="max-w-5xl mx-auto pb-32">
                    {isLoading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="ml-12 h-24 rounded-[2.5rem] bg-slate-50 animate-pulse border border-slate-100" />
                            ))}
                        </div>
                    ) : (
                        <div className="-ml-12">
                            {treeData.length > 0 ? (
                                treeData.map(root => (
                                    <Node key={root.id} node={root} depth={0} />
                                ))
                            ) : (
                                <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200">
                                        <Network className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase">Aucune structure détectée</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Veuillez configurer les managers dans la gestion des utilisateurs.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </FadeInView>
        </AppLayout>
    );
};
