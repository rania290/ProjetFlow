import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { adminApi } from '../../api/admin.api';

type SystemSettings = {
  siteName?: string;
  version?: string;
  maxUsers?: number;
  currentUsers?: number;
  maintenance?: boolean;
  [key: string]: unknown;
};

export const SystemSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [edited, setEdited] = useState<SystemSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('general');

  useEffect(() => {
    adminApi
      .getSettings()
      .then((data) => {
        setSettings(data);
        setEdited(data);
      })
      .catch(console.error);
  }, []);

  const save = async () => {
    if (!edited) return;
    setSaving(true);
    try {
      const updated = await adminApi.updateSettings(edited);
      setSettings(updated);
      setEdited(updated);
      // TODO: remplacer par un toast global si tu en as un
      alert('Paramètres sauvegardés');
    } catch (err) {
      console.error(err);
      alert('Échec lors de la sauvegarde');
    }
    setSaving(false);
  };

  const sections = [
    { id: 'general', label: 'Général' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'users', label: 'Utilisateurs & rôles' },
    { id: 'integrations', label: 'Intégrations' },
  ];

  const renderGeneral = () => {
    if (!edited) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Identité de la plateforme
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                Nom du site
              </label>
              <input
                value={edited.siteName ?? ''}
                onChange={(e) =>
                  setEdited((prev) => ({
                    ...(prev || {}),
                    siteName: e.target.value,
                  }))
                }
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Visible dans la barre de titre et les mails automatiques.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Version
                </label>
                <input
                  value={edited.version ?? ''}
                  readOnly
                  className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Utilisateurs actuels
                </label>
                <input
                  value={edited.currentUsers ?? 0}
                  readOnly
                  className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Capacité & limites
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                Utilisateurs max
              </label>
              <input
                type="number"
                min={0}
                value={edited.maxUsers ?? 0}
                onChange={(e) =>
                  setEdited((prev) => ({
                    ...(prev || {}),
                    maxUsers: Number.parseInt(e.target.value || '0', 10),
                  }))
                }
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Limite douce utilisée pour les alertes et projections.
              </p>
            </div>

            <div className="rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-800 border border-indigo-100">
              Pense à ajuster cette valeur lorsque tu ajoutes de nouveaux
              collaborateurs pour garder une vue réaliste sur la capacité
              globale.
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMaintenance = () => {
    if (!edited) return null;
    const maintenance = !!edited.maintenance;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-800">
              Mode maintenance
            </p>
            <p className="text-xs text-gray-500">
              Lorsque le mode maintenance est activé, seuls les administrateurs
              peuvent se connecter.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setEdited((prev) => ({
                ...(prev || {}),
                maintenance: !maintenance,
              }))
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              maintenance ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                maintenance ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-2">
              Message affiché aux utilisateurs
            </h3>
            <p className="text-xs text-gray-500 mb-2">
              Ce texte est informatif pour la roadmap, il sera connecté plus
              tard au backend.
            </p>
            <textarea
              value={
                (edited as any).maintenanceMessage ??
                "La plateforme est temporairement en maintenance. Merci de revenir dans quelques minutes."
              }
              onChange={(e) =>
                setEdited((prev) => ({
                  ...(prev || {}),
                  maintenanceMessage: e.target.value,
                }))
              }
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-2">
              Bonnes pratiques
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
              <li>Planifier le créneau de maintenance en heures creuses.</li>
              <li>Prévenir les équipes clientes à l’avance.</li>
              <li>Limiter la durée de coupure autant que possible.</li>
              <li>Valider les tests de non-régression avant de désactiver.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                Gestion des utilisateurs
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Crée, désactive et met à jour les comptes utilisateurs de la
                plateforme.
              </p>
            </div>
            <a
              href="/admin/users"
              className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
            >
              Ouvrir la gestion des utilisateurs
            </a>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                Rôles & permissions
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Configure les rôles (ADMIN, PROJECT_MANAGER, TEAM_MEMBER,
                etc.) et leurs droits projet par projet.
              </p>
            </div>
            <a
              href="/admin/access"
              className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
            >
              Gérer les rôles & permissions
            </a>
          </div>
        </div>

        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 text-xs text-gray-500">
          Cette section centralise les liens vers les modules de gestion des
          utilisateurs et des accès. Tu peux la faire évoluer ensuite vers un
          vrai panneau de configuration (quotas par rôle, politiques de mot de
          passe, etc.).
        </div>
      </div>
    );
  };

  const renderIntegrations = () => {
    return (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Configure ici les intégrations clés de VAERDIA (synchronisation
          calendrier, stockage de fichiers, outils de communication).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-1">Calendrier</h3>
            <p className="text-xs text-gray-500 mb-3">
              Synchronise les jalons de projet avec Google Calendar / Outlook.
            </p>
            <button
              disabled
              className="w-full px-3 py-2 text-xs rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
            >
              Bientôt disponible
            </button>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-1">Stockage</h3>
            <p className="text-xs text-gray-500 mb-3">
              Connecte un bucket S3 / Azure Blob pour centraliser les documents
              de projet.
            </p>
            <button
              disabled
              className="w-full px-3 py-2 text-xs rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
            >
              Bientôt disponible
            </button>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-1">Notifications</h3>
            <p className="text-xs text-gray-500 mb-3">
              Envoie des notifications vers Slack / Teams à chaque mise à jour
              importante.
            </p>
            <button
              disabled
              className="w-full px-3 py-2 text-xs rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
            >
              Bientôt disponible
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout
      title="Configuration globale"
      subtitle="Paramètres avancés de la plateforme"
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white flex shadow-sm rounded-2xl overflow-hidden border border-gray-100">
          {/* sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-100">
            <nav className="flex flex-col py-4">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`text-left px-5 py-3 w-full text-sm flex items-center justify-between transition-colors ${
                    activeSection === sec.id
                      ? 'bg-white text-indigo-600 border-r-4 border-indigo-500 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{sec.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* content area */}
          <div className="flex-1 p-7 bg-gray-25">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-gray-900">
                {sections.find((s) => s.id === activeSection)?.label}
              </h2>
              {settings && (
                <button
                  onClick={save}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : 'Sauvegarder'}
                </button>
              )}
            </div>

            {!settings && (
              <p className="text-sm text-gray-500">
                Chargement des paramètres système...
              </p>
            )}

            {settings && (
              <>
                {activeSection === 'general' && renderGeneral()}
                {activeSection === 'maintenance' && renderMaintenance()}
                {activeSection === 'users' && renderUsers()}
                {activeSection === 'integrations' && renderIntegrations()}
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
