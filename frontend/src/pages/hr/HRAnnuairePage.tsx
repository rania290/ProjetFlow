import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import type { User as AuthUser } from '../../types/auth.types';
import { EmployeeDirectory } from '../../features/hr/directory/components/EmployeeDirectory';
import { AppLayout } from '../../components/layout/AppLayout';

export const HRAnnuairePage = () => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await adminApi.getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <AppLayout title="Annuaire de l'entreprise" subtitle="Retrouvez tous vos collègues">
      <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Tous les collaborateurs</h2>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-[0.2em] flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-amber-700" /> Une équipe de {users.length} talents
            </p>
          </div>
        </header>

        <section className="relative z-10">
          <EmployeeDirectory users={users} isLoading={isLoading} />
        </section>
      </div>
    </AppLayout>
  );
};
