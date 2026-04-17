import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Download, Search,
    File, FileCode, FileImage,
    MoreVertical, ExternalLink, Check, Copy, Loader2, Upload
} from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { documentsService, type DocumentInfo } from '../../api/documents.service';

const getIcon = (type: string) => {
    switch (type) {
        case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
        case 'image': return <FileImage className="w-5 h-5 text-blue-500" />;
        case 'code': return <FileCode className="w-5 h-5 text-indigo-500" />;
        default: return <File className="w-5 h-5 text-slate-400" />;
    }
};

export const ClientDocumentsPage: React.FC = () => {
    const [documents, setDocuments] = useState<DocumentInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchDocs = async () => {
        try {
            setIsLoading(true);
            const data = await documentsService.getAllDocuments();
            setDocuments(data);
        } catch (error) {
            console.error("Erreur lors du chargement des documents:", error);
            showNotification("Erreur de chargement des documents", "info");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchDocs();
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            showNotification(`Importation de "${file.name}" en cours...`, 'info');
            
            await documentsService.uploadDocument(file, { category: 'Ressources Client' });
            
            showNotification(`Fichier "${file.name}" importé avec succès`, 'success');
            await fetchDocs(); // Recharger la liste
        } catch (error) {
            console.error('Erreur Importation:', error);
            showNotification('Erreur lors de l\'importation du fichier', 'info');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const filteredDocs = documents.filter(doc => 
        (doc.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDownload = async (docId: string, docName: string) => {
        try {
            showNotification(`Téléchargement de "${docName}" en cours...`);
            await documentsService.downloadDocument(docId, docName);
            showNotification(`Document "${docName}" téléchargé avec succès`, 'success');
        } catch (error) {
            console.error('Erreur Téléchargement:', error);
            showNotification('Erreur lors du téléchargement du document', 'info');
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
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            className="hidden" 
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex items-center gap-2 h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                        >
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            <span className="hidden sm:inline">{isUploading ? 'En cours...' : 'Ajouter un document'}</span>
                        </button>
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
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chargement des documents...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredDocs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                                <FileText className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <p className="text-sm font-black text-slate-500">Aucun document trouvé</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredDocs.map((doc, i) => (
                                    <motion.tr
                                        key={doc.id}
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
                                            {new Date(doc.uploadedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleDownload(doc.id, doc.name)}
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
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Storage insight */}
                <div className="mt-8 p-6 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-green-600 shadow-sm">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-green-900">Espace Documentaire</h4>
                            {isLoading ? (
                                <p className="text-xs text-green-600/70">Calcul en cours...</p>
                            ) : (
                                <p className="text-xs text-green-600/70">{documents.length} fichiers partagés</p>
                            )}
                        </div>
                    </div>
                    <div className="hidden sm:block">
                        <div className="w-48 h-2 bg-white rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-[20%]" />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};
