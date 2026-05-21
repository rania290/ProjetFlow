import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Download, Search,
    File, FileCode, FileImage,
    MoreVertical, ExternalLink, Check, Copy, Loader2, Upload
} from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { documentsService, type DocumentInfo } from '../../api/documents.service';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const getIcon = (type: string) => {
    switch (type) {
        case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
        case 'image': return <FileImage className="w-5 h-5 text-blue-500" />;
        case 'code': return <FileCode className="w-5 h-5 text-indigo-500" />;
        default: return <File className="w-5 h-5 text-slate-400" />;
    }
};

export const ClientDocumentsPage: React.FC = () => {
    const { t, i18n } = useTranslation();
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
            console.error("Error loading documents:", error);
            showNotification(t('documents.loading_docs_error'), "info");
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
            showNotification(t('documents.uploading_file', { name: file.name }), 'info');
            
            await documentsService.uploadDocument(file, { category: 'Ressources Client' });
            
            showNotification(t('documents.upload_success', { name: file.name }), 'success');
            await fetchDocs(); // Recharger la liste
        } catch (error) {
            console.error('Error Uploading:', error);
            showNotification(t('documents.uploading_error'), 'info');
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
            showNotification(t('documents.downloading_file', { name: docName }));
            await documentsService.downloadDocument(docId, docName);
            showNotification(t('documents.download_success', { name: docName }), 'success');
        } catch (error) {
            console.error('Error Downloading:', error);
            showNotification(t('documents.downloading_error'), 'info');
        }
    };

    const handleShare = (docName: string) => {
        const dummyUrl = `https://vaerdia.proj/share/${btoa(docName).slice(0, 10)}`;

        if (navigator.share) {
            navigator.share({
                title: docName,
                text: t('documents.consult_doc', { name: docName }),
                url: dummyUrl,
            }).catch(() => copyToClipboard(dummyUrl, docName));
        } else {
            copyToClipboard(dummyUrl, docName);
        }
    };

    const copyToClipboard = (url: string, docName: string) => {
        navigator.clipboard.writeText(url).then(() => {
            showNotification(t('documents.share_link_copied', { name: docName }));
        });
    };

    return (
        <AppLayout title={t('client.docs_title')} subtitle={t('client.docs_subtitle')}>
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
                            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                                <Download className="w-3 h-3 text-white" />
                            </div>
                        )}
                        <span className="text-sm font-medium">{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Search & Actions Toolbar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            type="text"
                            placeholder={t('client.search_file_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 h-11 border-slate-100 bg-white rounded-2xl text-sm focus-visible:ring-emerald-500/10 placeholder:text-slate-400 shadow-sm"
                        />
                    </div>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                    />
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full md:w-auto flex items-center justify-center gap-2 h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-500/15 transition-all disabled:opacity-50 flex-shrink-0"
                    >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <span>{isUploading ? t('client.adding_doc') : t('documents.add_document')}</span>
                    </Button>
                </div>

                {/* Polished Documents Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-405 text-slate-400 uppercase tracking-wider">{t('documents.filename')}</th>
                                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">{t('documents.category')}</th>
                                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">{t('documents.size')}</th>
                                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t('documents.date')}</th>
                                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Loader2 className="w-8 h-8 animate-spin text-emerald-55 text-emerald-600" />
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('documents.loading_docs')}</p>
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
                                                <p className="text-sm font-semibold text-slate-550 text-slate-500">{t('documents.no_documents')}</p>
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
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0 border border-slate-100/50">
                                                        {getIcon(doc.type)}
                                                    </div>
                                                    <div className="truncate max-w-[200px] sm:max-w-xs md:max-w-sm">
                                                        <p className="text-sm font-bold text-slate-800 truncate">{doc.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-semibold md:hidden">{doc.category}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-600 rounded-lg uppercase tracking-wide">
                                                    {doc.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500 font-medium hidden lg:table-cell">
                                                {doc.size}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                                                {new Date(doc.uploadedAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleDownload(doc.id, doc.name)}
                                                        className="p-2 h-9 w-9 text-slate-400 hover:text-emerald-600 hover:bg-emerald-55 hover:bg-emerald-50 rounded-xl transition-all"
                                                        title={t('documents.download')}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleShare(doc.name)}
                                                        className="p-2 h-9 w-9 text-slate-400 hover:text-emerald-600 hover:bg-emerald-55 hover:bg-emerald-50 rounded-xl transition-all"
                                                        title={t('documents.share')}
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Storage Insight - Premium & Clean */}
                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-emerald-600 shadow-sm flex-shrink-0">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900">{t('documents.doc_space')}</h4>
                            {isLoading ? (
                                <p className="text-xs text-slate-500 font-medium">{t('documents.calculating')}</p>
                            ) : (
                                <p className="text-xs text-slate-500 font-medium">{t('documents.shared_files_count', { count: documents.length })}</p>
                            )}
                        </div>
                    </div>
                    <div className="w-full sm:w-48 space-y-1.5 flex-shrink-0">
                        <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            <span>Utilisation</span>
                            <span>20%</span>
                        </div>
                        <Progress value={20} className="h-2 bg-slate-200" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};
