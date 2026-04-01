import { useState } from 'react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

interface ConfirmDialogState {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm?: () => void;
    onCancel?: () => void;
}

export const useConfirmDialog = () => {
    const [dialog, setDialog] = useState<ConfirmDialogState>({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirmer',
        cancelText: 'Annuler',
        type: 'danger'
    });

    const confirm = (options: {
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        type?: 'danger' | 'warning' | 'info';
    }) => {
        return new Promise<boolean>((resolve) => {
            setDialog({
                isOpen: true,
                ...options,
                onConfirm: () => {
                    setDialog(prev => ({ ...prev, isOpen: false }));
                    resolve(true);
                },
                onCancel: () => {
                    setDialog(prev => ({ ...prev, isOpen: false }));
                    resolve(false);
                }
            });
        });
    };

    const confirmDelete = (itemName: string, itemType?: string) => {
        return confirm({
            title: 'Confirmation de suppression',
            message: `Êtes-vous sûr de vouloir supprimer ${itemType ? 'cet/cette' + ' ' + itemType : 'cet élément'} "${itemName}" ? Cette action est irréversible.`,
            confirmText: 'Supprimer',
            cancelText: 'Annuler',
            type: 'danger'
        });
    };

    const confirmDanger = (title: string, message: string) => {
        return confirm({
            title,
            message,
            confirmText: 'Confirmer',
            cancelText: 'Annuler',
            type: 'danger'
        });
    };

    const confirmWarning = (title: string, message: string) => {
        return confirm({
            title,
            message,
            confirmText: 'Continuer',
            cancelText: 'Annuler',
            type: 'warning'
        });
    };

    const confirmInfo = (title: string, message: string) => {
        return confirm({
            title,
            message,
            confirmText: 'OK',
            cancelText: 'Annuler',
            type: 'info'
        });
    };

    const closeDialog = () => {
        setDialog(prev => ({ ...prev, isOpen: false }));
        dialog.onCancel?.();
    };

    const DialogComponent = () => {
        return (
            <ConfirmDialog
                isOpen={dialog.isOpen}
                title={dialog.title}
                message={dialog.message}
                confirmText={dialog.confirmText}
                cancelText={dialog.cancelText}
                type={dialog.type}
                onConfirm={() => dialog.onConfirm?.()}
                onCancel={closeDialog}
            />
        );
    };

    return {
        confirm,
        confirmDelete,
        confirmDanger,
        confirmWarning,
        confirmInfo,
        closeDialog,
        DialogComponent,
        isOpen: dialog.isOpen
    };
};

