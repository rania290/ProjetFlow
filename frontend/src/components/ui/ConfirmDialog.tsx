import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    type = 'danger',
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;

    const getIconAndColors = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: <AlertTriangle className="w-5 h-5" />,
                    bgColor: 'bg-red-50',
                    iconColor: 'text-red-600',
                    borderColor: 'border-red-200',
                    confirmBg: 'bg-red-600 hover:bg-red-700',
                    confirmTextColor: 'text-white'
                };
            case 'warning':
                return {
                    icon: <AlertTriangle className="w-5 h-5" />,
                    bgColor: 'bg-amber-50',
                    iconColor: 'text-amber-600',
                    borderColor: 'border-amber-200',
                    confirmBg: 'bg-amber-600 hover:bg-amber-700',
                    confirmTextColor: 'text-white'
                };
            case 'info':
                return {
                    icon: <AlertTriangle className="w-5 h-5" />,
                    bgColor: 'bg-blue-50',
                    iconColor: 'text-blue-600',
                    borderColor: 'border-blue-200',
                    confirmBg: 'bg-blue-600 hover:bg-blue-700',
                    confirmTextColor: 'text-white'
                };
            default:
                return {
                    icon: <AlertTriangle className="w-5 h-5" />,
                    bgColor: 'bg-red-50',
                    iconColor: 'text-red-600',
                    borderColor: 'border-red-200',
                    confirmBg: 'bg-red-600 hover:bg-red-700',
                    confirmTextColor: 'text-white'
                };
        }
    };

    const { icon, bgColor, iconColor, borderColor, confirmBg, confirmTextColor } = getIconAndColors();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onCancel}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full mx-4 overflow-hidden"
                    >
                        {/* Header */}
                        <div className={`px-6 py-4 ${bgColor} ${borderColor} border-b`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl ${bgColor} ${iconColor} flex items-center justify-center`}>
                                    {icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                                </div>
                                <button
                                    onClick={onCancel}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <p className="text-slate-600 leading-relaxed">{message}</p>
                        </div>

                        {/* Actions */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3 justify-end">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`px-4 py-2.5 text-sm font-medium ${confirmBg} ${confirmTextColor} rounded-lg transition-colors shadow-md`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
