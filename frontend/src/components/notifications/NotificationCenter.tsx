import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCheck, Info, AlertTriangle, AlertCircle, Zap } from 'lucide-react';
import { useSocketNotifications } from '../../hooks/useSocketNotifications';

export interface AppNotification {
    id: string;
    userId?: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    time?: string;
    read?: boolean;
}

const TYPE_CONFIG = {
    info:    { icon: Info,          color: 'text-blue-500',   bg: 'bg-blue-500',   pill: 'bg-blue-500/10 text-blue-600' },
    success: { icon: Zap,           color: 'text-emerald-500', bg: 'bg-emerald-500', pill: 'bg-emerald-500/10 text-emerald-600' },
    warning: { icon: AlertTriangle, color: 'text-amber-500',   bg: 'bg-amber-500',   pill: 'bg-amber-500/10 text-amber-600' },
    error:   { icon: AlertCircle,   color: 'text-red-500',     bg: 'bg-red-500',     pill: 'bg-red-500/10 text-red-600' },
};

interface NotificationCenterProps {
    token: string | null;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ token }) => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<AppNotification[]>([
        {
            id: 'demo-1',
            type: 'info',
            title: 'Bienvenue',
            message: 'Les notifications en temps réel sont maintenant actives.',
            time: "À l'instant",
            read: false,
        },
    ]);

    const handleNotification = useCallback((notif: AppNotification) => {
        const newNotif: AppNotification = {
            ...notif,
            id: notif.id || `notif-${Date.now()}`,
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            read: false,
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 20));
    }, []);

    useSocketNotifications({ token, onNotification: handleNotification });

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const markRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const dismiss = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Close panel when clicking outside
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            const panel = document.getElementById('notification-center-panel');
            const trigger = document.getElementById('notification-center-trigger');
            if (panel && !panel.contains(e.target as Node) && !trigger?.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                id="notification-center-trigger"
                onClick={() => setOpen(v => !v)}
                className="relative p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-4 h-4" />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            key="badge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-white"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            {/* Panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        id="notification-center-panel"
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-96 rounded-2xl shadow-2xl z-50 overflow-hidden border"
                        style={{ backgroundColor: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50/80 to-white/60">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-800">Notifications</span>
                                {unreadCount > 0 && (
                                    <span className="px-1.5 py-0.5 rounded-full bg-indigo-500 text-white text-[9px] font-bold">
                                        {unreadCount}
                                    </span>
                                )}
                                {/* Live indicator */}
                                <span className="flex items-center gap-1 text-[9px] text-emerald-600 font-semibold uppercase tracking-wide">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Live
                                </span>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline"
                                >
                                    <CheckCheck className="w-3 h-3" />
                                    Tout lire
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                                    <Bell className="w-8 h-8 opacity-30" />
                                    <p className="text-sm font-medium">Aucune notification</p>
                                </div>
                            ) : (
                                notifications.map(n => {
                                    const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
                                    const Icon = cfg.icon;
                                    return (
                                        <motion.div
                                            key={n.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`group px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer relative ${!n.read ? 'bg-indigo-50/30' : ''}`}
                                            onClick={() => markRead(n.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Icon */}
                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.pill}`}>
                                                    <Icon className="w-3.5 h-3.5" />
                                                </div>
                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-semibold ${!n.read ? 'text-slate-800' : 'text-slate-600'} truncate`}>
                                                        {n.title}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                                                        {n.message}
                                                    </p>
                                                    {n.time && (
                                                        <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                                                    )}
                                                </div>
                                                {/* Unread dot */}
                                                {!n.read && (
                                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${cfg.bg}`} />
                                                )}
                                                {/* Dismiss btn */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-slate-200 text-slate-400"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex justify-center">
                            <button
                                onClick={() => setNotifications([])}
                                className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
                            >
                                <X className="w-3 h-3" />
                                Effacer tout
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
