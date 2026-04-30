import React, { useState, useMemo, useEffect } from 'react';
import { documentsService } from '../api/documents.service';
import type { DocumentInfo } from '../api/documents.service';
import { projectsService } from '../api/projects.service';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

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
];

const FOLDER_COLORS = ['text-blue-500', 'text-indigo-500', 'text-emerald-500', 'text-amber-500', 'text-pink-500', 'text-violet-500'];

const getFileIcon = (type: string, className = "w-8 h-8") => {
    switch (type) {
        case 'pdf': return <FileText className={`${className} text-red-500`} />;
        case 'image': return <FileImage className={`${className} text-blue-500`} />;
        case 'zip': return <FileArchive className={`${className} text-amber-500`} />;
        case 'code': return <FileCode className={`${className} text-indigo-500`} />;
        default: return <File className={`${className} text-slate-400`} />;
    }
};

const getFileColorClass = (type: string) => {
    switch (type) {
        case 'pdf': return 'bg-red-500';
        case 'image': return 'bg-blue-500';
        case 'zip': return 'bg-amber-500';
        case 'code': return 'bg-indigo-500';
        default: return 'bg-slate-400';
    }
};

export const DocumentsPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [files, setFiles] = useState<DocumentInfo[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [uploadProjectId, setUploadProjectId] = useState<string>('none');
    const [uploadCategory, setUploadCategory] = useState<string>('Général');
    const [loading, setLoading] = useState(true);
    const [deleteDocId, setDeleteDocId] = useState<string | null>(null);

    useEffect(() => {
        const fetchDocsAndProjects = async () => {
            setLoading(true);
            try {
                const [docsData, projectsData] = await Promise.allSettled([
                    documentsService.getAllDocuments(),
                    projectsService.getAll()
                ]);
                
                if (docsData.status === 'fulfilled') setFiles(docsData.value);
                if (projectsData.status === 'fulfilled') setProjects(projectsData.value);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDocsAndProjects();
    }, []);

    const filteredFiles = useMemo(() => {
        let baseFiles = files;
        
        if (selectedCategory === 'recent') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            baseFiles = files.filter(f => new Date(f.uploadedAt) >= sevenDaysAgo);
        }

        return baseFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [files, searchQuery, selectedCategory]);

    const dynamicFolders = useMemo(() => {
        const counts = files.reduce((acc, file) => {
            const cat = file.category || 'Général';
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([name, count], index) => ({
            name,
            count,
            color: FOLDER_COLORS[index % FOLDER_COLORS.length]
        })).sort((a, b) => b.count - a.count); // Most populated folders first
    }, [files]);
    const { storageUsed, storagePercent } = useMemo(() => {
        const bytes = files.reduce((acc, file) => {
            const sizeStr = file.size.toLowerCase();
            let multiplier = 1;
            if (sizeStr.includes('kb')) multiplier = 1024;
            else if (sizeStr.includes(' mb')) multiplier = 1024 * 1024;
            else if (sizeStr.includes(' gb')) multiplier = 1024 * 1024 * 1024;
            const val = parseFloat(sizeStr.replace(/[^0-9.]/g, '')) || 0;
            return acc + (val * multiplier);
        }, 0);
        
        const formatBytes = (b: number, decimals = 1) => {
            if (b === 0) return '0 Bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(b) / Math.log(k));
            return parseFloat((b / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        };

        const storageLimit = 2 * 1024 * 1024 * 1024; // 2 GB
        const percent = Math.min(100, Math.round((bytes / storageLimit) * 100));

        return { storageUsed: formatBytes(bytes), storagePercent: percent };
    }, [files]);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadProgress(10);
        try {
            const selectedProject = projects.find(p => (p.id || p.projectId)?.toString() === uploadProjectId);
            const projectName = selectedProject ? selectedProject.name : undefined;

            await documentsService.uploadDocument(file, { 
                projectId: uploadProjectId !== 'none' ? uploadProjectId : undefined, 
                projectName: projectName,
                category: uploadCategory 
            });
            setUploadProgress(100);

            // Refresh list
            const data = await documentsService.getAllDocuments();
            setFiles(data);

            setTimeout(() => {
                setIsUploadOpen(false);
                setUploadProgress(0);
                setUploadProjectId('none');
                setUploadCategory('Général');
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

    const requestDelete = (id: string) => {
        setDeleteDocId(id);
    };

    const confirmDelete = async () => {
        if (!deleteDocId) return;
        try {
            await documentsService.deleteDocument(deleteDocId);
            setFiles(prev => prev.filter(f => f.id !== deleteDocId));
        } catch (error) {
            console.error('Delete failed:', error);
        } finally {
            setDeleteDocId(null);
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
                            {dynamicFolders.length > 0 ? dynamicFolders.map(folder => (
                                <button key={folder.name} className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all group">
                                    <div className="flex items-center gap-2">
                                        <Folder className={`w-4 h-4 ${folder.color} fill-current opacity-20 group-hover:opacity-40 transition-opacity`} />
                                        <span>{folder.name}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-300">{folder.count}</span>
                                </button>
                            )) : (
                                <p className="text-[10px] font-bold text-slate-400 text-center py-2">Aucun dossier trouvé</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <HardDrive className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase">Stockage</p>
                                <p className="text-xs font-bold text-slate-900">{storageUsed} / 2 GB</p>
                            </div>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden relative">
                            <div className="h-full bg-indigo-500 transition-all duration-1000 ease-in-out absolute left-0 top-0 bottom-0" style={{ width: `${storagePercent}%` }} />
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
                            {filteredFiles.length === 0 && !loading ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full flex flex-col items-center justify-center text-center p-8 z-0 mt-10"
                                >
                                    <div className="w-48 h-48 mb-6 relative">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-[3rem] rotate-12 blur-xl animate-pulse" />
                                        <div className="absolute inset-0 bg-white/50 backdrop-blur-xl rounded-[3rem] border border-white/60 shadow-xl flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-500">
                                            <FileText className="w-16 h-16 text-indigo-200" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 mb-2 tracking-tight">Aucun document trouvé</h3>
                                    <p className="text-sm font-bold text-slate-500 max-w-sm mb-8">Ce dossier est vide ou aucun document ne correspond à votre recherche actuelle.</p>
                                    <Button 
                                        onClick={() => setIsUploadOpen(true)}
                                        className="bg-indigo-600 hover:bg-indigo-700 shadow-[0_8px_30px_rgb(79,70,229,0.2)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.3)] text-white font-bold rounded-2xl h-12 px-6 transition-all"
                                    >
                                        Transférer un fichier
                                    </Button>
                                </motion.div>
                            ) : viewMode === 'grid' ? (
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
                                            className="group bg-white rounded-[2rem] border border-slate-100/60 shadow-sm p-4 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
                                        >
                                            <div className={`absolute -inset-20 opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500 rounded-full ${getFileColorClass(file.type)}`} />
                                            
                                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <button className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors"><MoreVertical className="w-4 h-4" /></button>
                                            </div>
                                            <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 relative z-10 shadow-inner">
                                                {getFileIcon(file.type)}
                                            </div>
                                            <h4 className="text-xs font-black text-slate-800 line-clamp-2 px-2 leading-tight relative z-10 group-hover:text-indigo-700 transition-colors">{file.name}</h4>
                                            <div className="mt-3 flex items-center gap-2 relative z-10">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{file.size}</span>
                                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                <Badge variant="secondary" className="px-1.5 py-0 border-none bg-slate-100 text-[9px] text-slate-500 font-black tracking-widest uppercase">{file.category}</Badge>
                                            </div>

                                            <div className="mt-4 flex gap-2 w-full pt-4 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 relative z-10">
                                                <button
                                                    onClick={() => handleDownload(file)}
                                                    className="flex-1 h-9 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl flex items-center justify-center transition-colors shadow-sm"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                {file.source !== 'invoice' && (
                                                    <button
                                                        onClick={() => requestDelete(file.id)}
                                                        className="flex-1 h-9 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl flex items-center justify-center transition-colors shadow-sm"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
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
                                                            {file.source !== 'invoice' && (
                                                                <button
                                                                    onClick={() => requestDelete(file.id)}
                                                                    className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-red-500 transition-all"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
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
                <DialogContent className="max-w-md bg-white/80 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white max-h-[90vh] overflow-y-auto shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 -z-10" />
                    <DialogHeader className="mb-2 text-center flex flex-col items-center">
                        <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">Nouveau Document</DialogTitle>
                        <p className="text-sm font-bold text-slate-500 mt-1">Ajoutez un fichier à un projet existant.</p>
                    </DialogHeader>

                    <div className="space-y-4 mt-6">
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Projet lié</label>
                            <Select value={uploadProjectId} onValueChange={setUploadProjectId}>
                                <SelectTrigger className="w-full bg-white/50 border-white/60 focus:ring-indigo-500/30 rounded-xl h-11 text-sm font-bold shadow-sm backdrop-blur-sm">
                                    <SelectValue placeholder="Sélectionner un projet">
                                        {uploadProjectId === 'none' 
                                            ? "Aucun projet (Général)" 
                                            : projects.find(p => (p.id || p.projectId)?.toString() === uploadProjectId)?.name || "Sélectionner un projet"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="bg-white/90 backdrop-blur-xl border-white/50 rounded-xl shadow-xl">
                                    <SelectItem value="none" className="text-slate-400 font-bold focus:bg-slate-50">Aucun projet (Général)</SelectItem>
                                    {projects.map(p => {
                                        const pid = p.id || p.projectId;
                                        if (!pid) return null;
                                        return (
                                            <SelectItem key={pid} value={pid.toString()} className="font-bold focus:bg-indigo-50 focus:text-indigo-700">
                                                {p.name}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Catégorie</label>
                            <Select value={uploadCategory} onValueChange={setUploadCategory}>
                                <SelectTrigger className="w-full bg-white/50 border-white/60 focus:ring-indigo-500/30 rounded-xl h-11 text-sm font-bold shadow-sm backdrop-blur-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white/90 backdrop-blur-xl border-white/50 rounded-xl shadow-xl">
                                    <SelectItem value="Général" className="font-bold focus:bg-indigo-50 focus:text-indigo-700">Général</SelectItem>
                                    <SelectItem value="Design" className="font-bold focus:bg-indigo-50 focus:text-indigo-700">Design</SelectItem>
                                    <SelectItem value="Développement" className="font-bold focus:bg-indigo-50 focus:text-indigo-700">Développement</SelectItem>
                                    <SelectItem value="Administratif" className="font-bold focus:bg-indigo-50 focus:text-indigo-700">Administratif</SelectItem>
                                    <SelectItem value="Marketing" className="font-bold focus:bg-indigo-50 focus:text-indigo-700">Marketing</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div
                        className="mt-6 border-2 border-dashed border-indigo-200/60 bg-white/40 rounded-3xl p-10 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-300 cursor-pointer group relative overflow-hidden shadow-inner"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 xl:group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-indigo-500/20 transition-all duration-300 relative z-10 pointer-events-none">
                            <Upload className="w-8 h-8 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <p className="text-sm font-bold text-slate-700 relative z-10 pointer-events-none">Cliquez ou déposez vos fichiers ici</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 relative z-10 pointer-events-none">Maximum 50 MB par fichier</p>

                        <input
                            title=""
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                            onChange={handleUpload}
                            disabled={uploadProgress > 0}
                        />
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

                    <DialogFooter className="mt-8 flex items-center justify-center border-none sm:justify-center">
                        <Button variant="ghost" className="text-slate-400 font-bold hover:bg-slate-50 rounded-xl" onClick={() => setIsUploadOpen(false)}>Annuler</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog 
                isOpen={!!deleteDocId}
                title="Supprimer le document"
                message="Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible."
                confirmText="Supprimer"
                cancelText="Annuler"
                type="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteDocId(null)}
            />

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
