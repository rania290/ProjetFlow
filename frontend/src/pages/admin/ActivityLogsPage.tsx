import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { adminApi } from '../../api/admin.api';

export const ActivityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    adminApi.getLogs().then(data => {
      // data est directement un tableau d'objets log
      setLogs(data || []);
    }).catch(console.error);
  }, []);

  return (
    <AppLayout title="Journaux d'Activité" subtitle="Historique des événements">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <ul className="space-y-2">
            {(logs || []).map((log, i) => (
              <li key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-700">
                <div className="flex items-start gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${log.level === 'ERROR' ? 'bg-red-100 text-red-700' :
                      log.level === 'WARNING' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                    {log.level}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{log.message}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(log.timestamp).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppLayout>
  );
};
