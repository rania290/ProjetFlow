import React, { useEffect, useState } from 'react';
import { projectsService, type ProjectDashboard } from '../api/projects.service';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const ProjectsDashboardPage: React.FC = () => {
    const { logout } = useAuth();
    const [projects, setProjects] = useState<ProjectDashboard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-white/80 backdrop-blur">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">VAERDIA ProjectFlow</h1>
                    <p className="text-xs text-slate-500">
                        Dashboard projets – Chef de projet
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                    Se déconnecter
                </Button>
            </header>

            <main className="px-8 py-6">
                <h2 className="text-2xl font-bold mb-4">Mes projets</h2>

                {loading && <div className="text-slate-500">Chargement du dashboard...</div>}
                {error && !loading && (
                    <div className="text-red-600 mb-4 text-sm">{error}</div>
                )}

                {!loading && !error && (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((p) => (
                            <div
                                key={p.projectId}
                                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-2"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-slate-900">{p.name}</h3>
                                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                                        {p.status}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500">
                                    Budget : <span className="font-medium text-slate-800">{p.budget} €</span>
                                </p>
                                <p className="text-sm text-slate-500">
                                    Coût planifié :{' '}
                                    <span className="font-medium text-slate-800">
                                        {p.totalPlannedCost} €
                                    </span>
                                </p>
                                <p className="text-sm text-slate-500">
                                    Coût actuel (simulé) :{' '}
                                    <span className="font-medium text-slate-800">
                                        {p.totalActualCost} €
                                    </span>
                                </p>
                                <p className="text-sm text-slate-500">
                                    Membres :{' '}
                                    <span className="font-medium text-slate-800">
                                        {p.membersCount}
                                    </span>
                                </p>
                            </div>
                        ))}
                        {projects.length === 0 && (
                            <div className="text-slate-500 text-sm">
                                Aucun projet pour l&apos;instant. Créez un projet dans l&apos;API backend.
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

