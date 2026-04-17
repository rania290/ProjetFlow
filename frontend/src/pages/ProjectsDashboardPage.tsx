import React, { useEffect, useState } from 'react';
import { projectsService, type ProjectDashboard } from '../api/projects.service';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Briefcase,
    Users,
    ArrowRight,
    LayoutDashboard,
    LogOut,
    Filter
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

export const ProjectsDashboardPage: React.FC = () => {
    const { logout } = useAuth();
    const [projects, setProjects] = useState<ProjectDashboard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const data = await projectsService.getDashboardForCurrentManager();
                setProjects(data);
            } catch {
                setError('Impossible de charger le dashboard projets.');
            } finally {
                setLoading(false);
            }
        };
        void fetchDashboard();
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.projectId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
            {/* Premium Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between px-8 h-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                        <LayoutDashboard className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase italic">VAERDIA <span className="text-primary-600">FLOW</span></h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                            Portefeuille Projets
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right mr-4 hidden md:block">
                        <p className="text-xs font-bold text-slate-900 leading-tight">Chef de Projet</p>
                        <p className="text-[10px] text-slate-400 font-medium">Session Active</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="h-10 px-4 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Quitter
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 py-10">
                {/* Dashboard Controls */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Mes Projets</h2>
                        <p className="text-sm text-slate-500 font-medium max-w-md italic">
                            Pilotez et analysez l'avancement de vos projets en temps réel.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Rechercher un projet..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 h-12 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-primary-500/20 text-sm font-medium transition-all"
                            />
                        </div>
                        <Button variant="outline" className="h-12 w-12 rounded-2xl border-slate-200 bg-white p-0 shadow-sm hover:bg-slate-50">
                            <Filter className="w-4 h-4 text-slate-500" />
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Analyse en cours...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-100 rounded-[2rem] p-8 text-center text-red-600 max-w-lg mx-auto">
                        <p className="font-bold mb-2">Erreur système</p>
                        <p className="text-sm opacity-80">{error}</p>
                    </div>
                ) : (
                    <div className="relative group">
                        {/* Table Container */}
                        <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50/80 border-b border-slate-100 h-16">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="px-8 text-slate-400 font-black text-[11px] uppercase tracking-[0.15em] h-16">Nom du Projet</TableHead>
                                        <TableHead className="px-6 text-slate-400 font-black text-[11px] uppercase tracking-[0.15em] h-16">Statut</TableHead>
                                        <TableHead className="px-6 text-slate-400 font-black text-[11px] uppercase tracking-[0.15em] h-16 text-right">Budget (DT)</TableHead>
                                        <TableHead className="px-6 text-slate-400 font-black text-[11px] uppercase tracking-[0.15em] h-16 text-right">Coût Actuel</TableHead>
                                        <TableHead className="px-6 text-slate-400 font-black text-[11px] uppercase tracking-[0.15em] h-16 text-center">Équipe</TableHead>
                                        <TableHead className="px-8 text-slate-400 font-black text-[11px] uppercase tracking-[0.15em] h-16 text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProjects.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-60 text-center text-slate-400 font-medium italic">
                                                Aucun projet trouvé pour cette recherche.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredProjects.map((p) => (
                                            <TableRow
                                                key={p.projectId}
                                                className="hover:bg-primary-50/30 transition-all duration-300 border-b border-slate-50 cursor-pointer group/row"
                                                onClick={() => navigate(`/projects/${p.projectId}`)}
                                            >
                                                <TableCell className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover/row:bg-white transition-colors">
                                                            <Briefcase className="w-5 h-5 text-slate-400 group-hover/row:text-primary-600 transition-colors" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-800 tracking-tight text-base group-hover/row:text-primary-700 transition-colors">{p.name}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">ID: {p.projectId}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-6 font-medium">
                                                    <Badge className={`rounded-xl px-3 py-1 text-[10px] uppercase font-black tracking-widest shadow-sm ${p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            p.status === 'PLANNING' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                'bg-slate-50 text-slate-500 border-slate-100'
                                                        }`}>
                                                        {p.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-6 py-6 text-right font-bold text-slate-600">
                                                    {p.budget.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="px-6 py-6 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-black text-primary-600">
                                                            {p.totalActualCost?.toLocaleString() || 0}
                                                        </span>
                                                        <div className="w-24 h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                                            <div className="h-full bg-primary-500" style={{ width: `${Math.min(100, (p.totalActualCost || 0) / p.budget * 100)}%` }}></div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-6 text-center">
                                                    <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 font-black text-[11px] text-slate-600">
                                                        <Users className="w-3.5 h-3.5" />
                                                        {p.membersCount}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-8 py-6 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-10 w-10 p-0 rounded-xl hover:bg-primary-600 hover:text-white transition-all shadow-none group-hover/row:scale-110"
                                                    >
                                                        <ArrowRight className="w-5 h-5" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

