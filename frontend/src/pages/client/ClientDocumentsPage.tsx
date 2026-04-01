import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Download, Search,
    File, FileCode, FileImage,
    MoreVertical, ExternalLink, Check, Copy
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { AppLayout } from '../../components/layout/AppLayout';

const MOCK_DOCS = [
    { name: 'Cahier des charges V1.2.pdf', type: 'pdf', size: '2.4 MB', date: '12 Mars 2026', category: 'Spécifications' },
    { name: 'Charte Graphique - VAERDIA.zip', type: 'zip', size: '45 MB', date: '08 Mars 2026', category: 'Design' },
    { name: 'Contrat de prestation signée.pdf', type: 'pdf', size: '1.1 MB', date: '01 Mars 2026', category: 'Administratif' },
    { name: 'Rapport mensuel - Février.pdf', type: 'pdf', size: '840 KB', date: '02 Mars 2026', category: 'Reporting' },
    { name: 'Maquettes_UI_Figma.png', type: 'image', size: '8.2 MB', date: '28 Fév 2026', category: 'Design' },
];

const getIcon = (type: string) => {
    switch (type) {
        case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
        case 'image': return <FileImage className="w-5 h-5 text-blue-500" />;
        case 'code': return <FileCode className="w-5 h-5 text-indigo-500" />;
        default: return <File className="w-5 h-5 text-slate-400" />;
    }
};

export const ClientDocumentsPage: React.FC = () => {
    const [notification, setNotification] = React.useState<{ message: string, type: 'success' | 'info' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleDownload = (docName: string) => {
        try {
            const doc = new jsPDF();

            // Branding VAERDIA
            doc.setFontSize(22);
            doc.setTextColor(79, 70, 229); // Indigo-600
            doc.text('VAERDIA PROJECTFLOW', 20, 20);

            doc.setDrawColor(226, 232, 240); // Slate-200
            doc.line(20, 25, 190, 25);

            // Titre du Document
            doc.setFontSize(16);
            doc.setTextColor(30, 41, 59); // Slate-800
            doc.text(`Document : ${docName}`, 20, 45);

            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139); // Slate-500
            doc.text(`Date de génération : ${new Date().toLocaleString()}`, 20, 55);

            // Corps du texte
            doc.setFontSize(12);
            doc.setTextColor(71, 85, 105); // Slate-600
            const bodyContent =
                `Ceci est un document officiel généré via le Portail Client VAERDIA. \n\n` +
                `Le fichier "${docName}" est prêt pour la consultation. \n\n` +
                `Note de sécurité : \n` +
                `Ce document a été généré dynamiquement pour cette démonstration technique. ` +
                `Dans un environnement de production, ce bouton permettrait de récupérer le ` +
                `véritable fichier binaire stocké sur vos serveurs sécurisés.`;

            const splitText = doc.splitTextToSize(bodyContent, 170);
            doc.text(splitText, 20, 75);

            // Pied de page
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184); // Slate-400
            doc.text('Document généré par le système VAERDIA SaaS - Plateforme de Gestion de Projet', 20, 285);

            // Sauvegarde
            const pdfName = docName.toLowerCase().endsWith('.pdf') ? docName : `${docName.split('.')[0]}.pdf`;
            doc.save(pdfName);

            showNotification(`Document PDF généré pour "${docName}"`, 'success');
        } catch (error) {
            console.error('Erreur PDF:', error);
            showNotification('Erreur lors de la génération du PDF', 'info');
        }
    };

    const handleShare = (docName: string) => {
        const dummyUrl = `https://vaerdia.proj/share/${btoa(docName).slice(0, 10)}`;

        if (navigator.share) {
            navigator.share({
                title: docName,
                text: `Consultez ce document sur VAERDIA : ${docName}`,
                url: dummyUrl,
            }).catch(() => copyToClipboard(dummyUrl, docName));
        } else {
            copyToClipboard(dummyUrl, docName);
        }
    };

    const copyToClipboard = (url: string, docName: string) => {
        navigator.clipboard.writeText(url).then(() => {
            showNotification(`Lien de partage copié pour "${docName}"`);
        });
    };

    return (
        <AppLayout title="Documents" subtitle="Consultez les fichiers partagés">
            {/* Notification Popup */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 20, x: '-50%' }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-4 left-1/2 z-[100] px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md"
                    >
                        {notification.type === 'success' ? (
                            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                            </div>
                        ) : (
                            <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center animate-pulse">
                                <Download className="w-3 h-3 text-white" />
                            </div>
                        )}
                        <span className="text-sm font-medium">{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="p-8 max-w-7xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Mes Documents</h1>
                        <p className="text-slate-500 text-sm mt-1">Accédez à l'ensemble des fichiers partagés par l'équipe projet.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un fichier..."
                                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>
                </header>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nom du fichier</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Catégorie</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden lg:table-cell">Taille</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {MOCK_DOCS.map((doc, i) => (
                                <motion.tr
                                    key={doc.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="hover:bg-slate-50/50 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                {getIcon(doc.type)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{doc.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium md:hidden">{doc.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md uppercase tracking-tighter">
                                            {doc.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500 hidden lg:table-cell">
                                        {doc.size}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500">
                                        {doc.date}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleDownload(doc.name)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                title="Télécharger"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleShare(doc.name)}
                                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                title="Partager"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all lg:hidden">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Storage insight */}
                <div className="mt-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-indigo-900">Espace Documentary</h4>
                            <p className="text-xs text-indigo-600/70">12 fichiers partagés • 58.4 MB utilisés</p>
                        </div>
                    </div>
                    <div className="hidden sm:block">
                        <div className="w-48 h-2 bg-white rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 w-[20%]" />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};
