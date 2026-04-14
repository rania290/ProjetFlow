import React from 'react';
import { 
    Dialog, DialogContent, 
    DialogHeader, DialogTitle, 
    DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, Trash2, X, CheckCircle2 } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info' | 'success';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    onConfirm,
    onCancel,
    type = 'warning'
}) => {
    const CONFIG = {
        danger: {
            icon: Trash2,
            color: 'text-red-600',
            bg: 'bg-red-50',
            btn: 'bg-red-600 hover:bg-red-700 shadow-red-500/20',
            border: 'border-red-100',
            titleColor: 'text-red-900'
        },
        warning: {
            icon: AlertTriangle,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20',
            border: 'border-amber-100',
            titleColor: 'text-amber-900'
        },
        info: {
            icon: Info,
            color: 'text-primary-600',
            bg: 'bg-primary-50',
            btn: 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/20',
            border: 'border-primary-100',
            titleColor: 'text-primary-900'
        },
        success: {
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20',
            border: 'border-emerald-100',
            titleColor: 'text-emerald-900'
        }
    };

    const cfg = CONFIG[type];
    const Icon = cfg.icon;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border border-slate-200 shadow-xl rounded-2xl">
                <div className="px-6 pt-6 pb-4 bg-white">
                    <DialogHeader className="space-y-3 text-left">
                        <div className="flex items-start gap-3">
                            <div className={cn("mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center border", cfg.bg, cfg.border)}>
                                <Icon className={cn("w-4.5 h-4.5", cfg.color)} />
                            </div>
                            <div className="space-y-1">
                                <DialogTitle className={cn("text-base font-bold tracking-tight", cfg.titleColor)}>
                                    {title}
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 text-sm leading-relaxed">
                                    {message}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                    <Button 
                        variant="outline" 
                        onClick={onCancel}
                        className="flex-1 h-10 rounded-lg font-semibold text-slate-600 border-slate-200 hover:bg-white order-2 sm:order-1"
                    >
                        {cancelText}
                    </Button>
                    <Button 
                        onClick={onConfirm}
                        className={cn(
                            "flex-1 h-10 rounded-lg font-semibold text-white shadow-sm transition-all active:scale-95 order-1 sm:order-2",
                            cfg.btn
                        )}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
