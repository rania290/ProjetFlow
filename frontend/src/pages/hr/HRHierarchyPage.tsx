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
        const map: Record<string, TreeNode> = {};
        userList.forEach(u => {
            map[u.id] = { ...u, children: [] };
        });

        const roots: TreeNode[] = [];
        userList.forEach(u => {
            if (u.managerId && map[u.managerId]) {
                map[u.managerId].children.push(map[u.id]);
            } else {
                roots.push(map[u.id]);
            }
        });
        return roots;
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

    const roleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-red-500';
            case 'PROJECT_MANAGER': return 'bg-blue-500';
            case 'RH': return 'bg-purple-500';
            default: return 'bg-slate-500';
        }
    };

    const Node: React.FC<{ node: TreeNode; depth: number }> = ({ node, depth }) => {
        const isExpanded = expandedIds.has(node.id);
        const hasChildren = node.children.length > 0;
        const matchesSearch = searchQuery && (
            node.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            node.email.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div className="ml-8 mt-4 relative">
                {/* Connection Lines */}
                {depth > 0 && (
                    <div className="absolute -left-6 top-0 bottom-0 w-px bg-slate-200">
                        <div className="absolute top-6 left-0 w-6 h-px bg-slate-200" />
                    </div>
                )}

                <motion.div
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`group relative flex items-center gap-4 p-4 rounded-[2rem] border transition-all ${matchesSearch
                            ? 'bg-pink-50 border-pink-200 ring-2 ring-pink-500/20 shadow-lg'
                            : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md'
                        }`}
                >
                    {/* Role Indicator Bubble */}
                    <div className={`absolute -left-2 -top-2 w-5 h-5 rounded-full ${roleColor(node.role)} border-2 border-white shadow-sm flex items-center justify-center`}>
                        {node.role === 'ADMIN' ? <Shield className="w-2.5 h-2.5 text-white" /> : <User className="w-2.5 h-2.5 text-white" />}
                    </div>

                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-400 text-sm overflow-hidden border border-white shadow-inner`}>
                        {initials(node.fullName)}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-slate-900 truncate tracking-tight">{node.fullName}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{node.role}</p>
                    </div>

                    {hasChildren && (
                        <button
                            onClick={() => toggleExpand(node.id)}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                }`}
                        >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                    )}
                </motion.div>

                <AnimatePresence>
                    {isExpanded && hasChildren && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            {node.children.map(child => (
                                <Node key={child.id} node={child} depth={depth + 1} />
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
                <GlassCard className="p-6 border-white/40">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600 shadow-sm border border-pink-100">
                                <Network className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Structure Hiérarchique</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                    {users.length} Collaborateurs • {treeData.length} Racines
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative w-full md:w-64 group">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-pink-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un talent..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400/50 text-xs transition-all outline-none"
                                />
                            </div>
                            <button onClick={expandAll} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-all shadow-sm" title="Tout déployer">
                                <Maximize2 className="w-4 h-4" />
                            </button>
                            <button onClick={collapseAll} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all shadow-sm" title="Tout réduire">
                                <Minimize2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </GlassCard>

                <div className="max-w-4xl mx-auto pb-20">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="ml-8 h-20 rounded-[2rem] bg-slate-100 animate-pulse border border-slate-200" />
                            ))}
                        </div>
                    ) : (
                        <div className="-ml-8"> {/* Negative margin to offset the first node's margin */}
                            {treeData.map(root => (
                                <Node key={root.id} node={root} depth={0} />
                            ))}
                        </div>
                    )}
                </div>
            </FadeInView>
        </AppLayout>
    );
};
