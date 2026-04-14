import React, { useState, useMemo, useEffect } from 'react';
import { documentsService } from '../api/documents.service';
import type { DocumentInfo } from '../api/documents.service';
import {
    Search,
    Upload,
    Folder,
    File,
    FileText,
    FileImage,
    FileArchive,
    FileCode,
    MoreVertical,
    Download,
    Share2,
    Trash2,
    Grid,
    List,
    ChevronRight,
    Home,
    Clock,
    Star,
    Shield,
    HardDrive,
    Filter,
    Plus,
    X,
    Users
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';

// Mock Data
const MOCK_FILES = [
    { id: '1', name: 'Cahier des charges V1.2.pdf', type: 'pdf', size: '2.4 MB', date: '2026-03-12', category: 'Specs', project: 'Flow' },
    { id: '2', name: 'Branding_Assets.zip', type: 'zip', size: '45.0 MB', date: '2026-03-08', category: 'Design', project: 'Core' },
    { id: '3', name: 'Contrat_Signe.pdf', type: 'pdf', size: '1.2 MB', date: '2026-03-01', category: 'Admin', project: 'Flow' },
    { id: '4', name: 'Home_Mockup_Final.png', type: 'image', size: '8.2 MB', date: '2026-02-28', category: 'Design', project: 'Core' },
    { id: '5', name: 'api_documentation.md', type: 'code', size: '45 KB', date: '2026-04-10', category: 'Development', project: 'API' },
    { id: '6', name: 'Budget_2026.xlsx', type: 'sheet', size: '1.5 MB', date: '2026-04-05', category: 'Admin', project: 'Core' },
];

const CATEGORIES = [
    { id: 'all', label: 'Tous les fichiers', icon: <Home className="w-4 h-4" /> },
    { id: 'recent', label: 'Récents', icon: <Clock className="w-4 h-4" /> },
    { id: 'starred', label: 'Favoris', icon: <Star className="w-4 h-4" /> },
    { id: 'shared', label: 'Partagés', icon: <Users className="w-4 h-4" /> },
];

const FOLDERS = [
    { name: 'Designs', count: 12, color: 'text-blue-500' },
    { name: 'Spécifications', count: 5, color: 'text-indigo-500' },
    { name: 'Administratif', count: 8, color: 'text-emerald-500' },
    { name: 'Livrables Client', count: 3, color: 'text-amber-500' },
];

const getFileIcon = (type: string, className = "w-8 h-8") => {
    switch (type) {
        case 'pdf': return <FileText className={`${className} text-red-500`} />;
        case 'image': return <FileImage className={`${className} text-blue-500`} />;
        case 'zip': return <FileArchive className={`${className} text-amber-500`} />;
        case 'code': return <FileCode className={`${className} text-indigo-500`} />;
        default: return <File className={`${className} text-slate-400`} />;
    }
};

export const DocumentsPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [files, setFiles] = useState<DocumentInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDocs = async () => {
            setLoading(true);
            try {
                const data = await documentsService.getAllDocuments();
                setFiles(data);
            } catch (error) {
                console.error('Failed to fetch documents:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, []);

    const filteredFiles = useMemo(() => {
        return files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [files, searchQuery]);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadProgress(10);
        try {
            await documentsService.uploadDocument(file, { category: 'Général' });
            setUploadProgress(100);

            // Refresh list
            const data = await documentsService.getAllDocuments();
            setFiles(data);

            setTimeout(() => {
                setIsUploadOpen(false);
                setUploadProgress(0);
            }, 1000);
        } catch (error) {
            console.error('Upload failed:', error);
            setUploadProgress(0);
        }
    };

    const handleDownload = async (file: DocumentInfo) => {
        try {
            await documentsService.downloadDocument(file.id, file.name);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;
        try {
            await documentsService.deleteDocument(id);
            setFiles(prev => prev.filter(f => f.id !== id));
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    return (
        <AppLayout title="Gestion Documentaire">
            <div className="flex h-[calc(100vh-theme(spacing.20))] overflow-hidden bg-slate-50/50">

                {/* --- Left Sidebar --- */}
                <div className="w-72 shrink-0 border-r border-slate-200 bg-white p-6 flex flex-col gap-8">
                    <div>
                        <Button
                            onClick={() => setIsUploadOpen(true)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-12 flex items-center gap-2 shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98]"
                        >
                            <Upload className="w-4 h-4" />
                            <span className="font-bold text-sm">Transférer</span>
                        </Button>
                    </div>

                    <div className="space-y-1">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all border ${selectedCategory === cat.id ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                {cat.icon}
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Dossiers</h3>
                            <Plus className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600 cursor-pointer" />
                        </div>
                        <div className="space-y-1">
                            {FOLDERS.map(folder => (
                                <button key={folder.name} className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all group">
                                    <div className="flex items-center gap-2">
                                        <Folder className={`w-4 h-4 ${folder.color} fill-current opacity-20 group-hover:opacity-40 transition-opacity`} />
                                        <span>{folder.name}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-300">{folder.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <HardDrive className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase">Stockage</p>
                                <p className="text-xs font-bold text-slate-900">45.0 MB / 2 GB</p>
                            </div>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 w-[20%]" />
                        </div>
                    </div>
                </div>

                {/* --- Main Content --- */}
                <div className="flex-1 flex flex-col min-w-0 bg-white">
                    {/* Toolbar */}
                    <div className="h-20 border-b border-slate-100 px-8 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                                <Home className="w-4 h-4" />
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-slate-900">Tous les fichiers</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <Input
                                    placeholder="Rechercher..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 h-10 w-64 bg-slate-50 border-transparent focus:bg-white focus:ring-indigo-500/20 rounded-xl text-sm font-bold transition-all"
                                />
                            </div>
                            <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                            <Button variant="outline" className="rounded-xl border-slate-200 h-10 px-4 flex items-center gap-2">
                                <Filter className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Filtrer</span>
                            </Button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {viewMode === 'grid' ? (
                                <motion.div
                                    key="grid"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                                >
                                    {filteredFiles.map((file, i) => (
                                        <motion.div
                                            key={file.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group bg-white rounded-3xl border border-slate-100 p-4 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all flex flex-col items-center text-center relative"
                                        >
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900"><MoreVertical className="w-4 h-4" /></button>
                                            </div>
                                            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                                                {getFileIcon(file.type)}
                                            </div>
                                            <h4 className="text-xs font-black text-slate-900 line-clamp-2 px-2 leading-tight">{file.name}</h4>
                                            <div className="mt-3 flex items-center gap-2">
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{file.size}</span>
                                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{file.category}</span>
                                            </div>

                                            <div className="mt-4 flex gap-2 w-full pt-4 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDownload(file)}
                                                    className="flex-1 h-9 bg-slate-50 hover:bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center transition-colors"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(file.id)}
                                                    className="flex-1 h-9 bg-slate-50 hover:bg-red-50 text-red-600 rounded-xl flex items-center justify-center transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="list"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm"
                                >
                                    <table className="w-full">
                                        <thead className="bg-slate-50/50 border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Nom</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Modifié</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Taille</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Projet</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredFiles.map(file => (
                                                <tr key={file.id} className="hover:bg-indigo-50/20 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                                                                {getFileIcon(file.type, 'w-5 h-5')}
                                                            </div>
                                                            <span className="text-sm font-bold text-slate-900">{file.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-bold text-slate-500">{new Date(file.uploadedAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-xs font-bold text-slate-500">{file.size}</td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none px-3">{file.projectName}</Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleDownload(file)}
                                                                className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(file.id)}
                                                                className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-red-500 transition-all"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* --- Upload Modal --- */}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent className="max-w-md bg-white rounded-3xl p-8 border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900">Transférer des fichiers</DialogTitle>
                    </DialogHeader>

                    <div
                        className="mt-6 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer group relative"
                    >
                        <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleUpload}
                            disabled={uploadProgress > 0}
                        />
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <p className="text-sm font-bold text-slate-600">Cliquez ou déposez vos fichiers ici</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Maximum 50 MB par fichier</p>
                    </div>

                    {uploadProgress > 0 && (
                        <div className="mt-6 space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] font-black uppercase text-slate-500">Progression</span>
                                <span className="text-[10px] font-black uppercase text-indigo-600">{uploadProgress}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-indigo-600"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-8 flex items-center justify-center border-none">
                        <Button variant="ghost" className="text-slate-400 font-bold hover:bg-slate-50 rounded-xl" onClick={() => setIsUploadOpen(false)}>Annuler</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 20px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #e2e8f0; }
            `}</style>
        </AppLayout>
    );
};

export default DocumentsPage;
