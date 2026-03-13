import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { adminApi } from '../../api/admin.api';
import { Download } from 'lucide-react';

export const DataExportPage: React.FC = () => {
    const [status, setStatus] = useState<string>('');

    const handleExport = async () => {
        setStatus('Génération en cours...');
        try {
            const res = await adminApi.exportData();
            setStatus('Export réussi ! Lien généré : ' + res.downloadUrl);
        } catch (err) {
            console.error(err);
            setStatus('Échec de l\'exportation.');
        }
    };

    return (
        <AppLayout title="Export de Données" subtitle="Télécharger les sauvegardes du système">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
                    <button onClick={handleExport} className="flex items-center gap-2 mx-auto px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-sm">
                        <Download className="w-5 h-5" />
                        <span>Générer un export complet</span>
                    </button>
                    {status && <p className="mt-4 text-sm font-medium text-slate-700">{status}</p>}
                </div>
            </div>
        </AppLayout>
    );
};
