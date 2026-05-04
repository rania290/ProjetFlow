import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api-client';
import {
  X,
  UserPlus,
  Mail,
  Building,
  Crown,
  Briefcase,
  UserCheck,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ROLE_CONFIG = {
  ADMIN: {
    label: 'Administrateur',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Crown,
    description: 'Accès complet au système'
  },
  PROJECT_MANAGER: {
    label: 'Gestionnaire',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Briefcase,
    description: 'Gestion des projets et équipes'
  },
  TEAM_MEMBER: {
    label: 'Membre',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: UserCheck,
    description: 'Participation aux projets'
  },
  OBSERVER: {
    label: 'Observateur',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: Eye,
    description: 'Accès consultation uniquement'
  }
};

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [generatedPassword, setGeneratedPassword] = useState('');
  
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    department: '',
    role: 'TEAM_MEMBER',
    assignedProjects: [] as string[],
    assignedTasks: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
      fetchTasks();
      generatePassword();
    }
  }, [isOpen]);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(password);
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des projets:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des tâches:', err);
    }
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Le nom complet est requis.';
    if (!form.email.trim()) e.email = 'L\'email est requis.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalide.';
    if (!form.department.trim()) e.department = 'Le département est requis.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (form.assignedProjects.length === 0) e.assignedProjects = 'Au moins un projet doit être assigné.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const userData = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        role: form.role,
        temporaryPassword: generatedPassword,
        assignedProjects: form.assignedProjects,
        assignedTasks: form.assignedTasks,
        status: 'PENDING' // En attente de première connexion
      };

      await api.post('/admin/users', userData);
      
      // Envoyer l'email de bienvenue
      await api.post('/admin/send-welcome-email', {
        email: form.email,
        fullName: form.fullName,
        temporaryPassword: generatedPassword
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (err: any) {
      setErrors({ 
        submit: err.response?.data?.message || 'Erreur lors de la création de l\'utilisateur' 
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      fullName: '',
      email: '',
      department: '',
      role: 'TEAM_MEMBER',
      assignedProjects: [],
      assignedTasks: []
    });
    setStep(1);
    setErrors({});
    setGeneratedPassword('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[200]"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Créer un utilisateur</h2>
                  <p className="text-sm text-slate-600">
                    {step === 1 && 'Informations de base'}
                    {step === 2 && 'Assignations'}
                    {step === 3 && 'Confirmation'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                      s <= step
                        ? 'bg-primary-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {s < step ? <CheckCircle className="w-4 h-4" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-8 h-0.5 transition-colors ${
                        s < step ? 'bg-primary-600' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                {errors.submit}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Jean Dupont"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="jean.dupont@entreprise.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Département/Équipe *
                  </label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Développement"
                  />
                  {errors.department && (
                    <p className="mt-1 text-xs text-red-600">{errors.department}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Rôle *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(ROLE_CONFIG).map(([role, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setForm({ ...form, role: role as any })}
                          className={`p-3 border rounded-lg text-left transition-all ${
                            form.role === role
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-4 h-4" />
                            <span className="font-medium text-sm">{config.label}</span>
                          </div>
                          <p className="text-xs text-slate-600">{config.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Mot de passe temporaire</p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-amber-100 px-2 py-1 rounded font-mono">
                          {showPassword ? generatedPassword : '••••••••••••'}
                        </code>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-amber-600 hover:text-amber-700"
                        >
                          {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                        <button
                          type="button"
                          onClick={generatePassword}
                          className="text-xs text-amber-700 hover:text-amber-800 underline"
                        >
                          Régénérer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Projets assignés *
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3">
                    {projects.map((project) => (
                      <label
                        key={project.id}
                        className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.assignedProjects.includes(project.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({
                                ...form,
                                assignedProjects: [...form.assignedProjects, project.id]
                              });
                            } else {
                              setForm({
                                ...form,
                                assignedProjects: form.assignedProjects.filter(id => id !== project.id)
                              });
                            }
                          }}
                          className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm">{project.name}</span>
                      </label>
                    ))}
                  </div>
                  {errors.assignedProjects && (
                    <p className="mt-1 text-xs text-red-600">{errors.assignedProjects}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tâches assignées (optionnel)
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3">
                    {tasks
                      .filter(task => form.assignedProjects.includes(task.projectId))
                      .map((task) => (
                        <label
                          key={task.id}
                          className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={form.assignedTasks.includes(task.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm({
                                  ...form,
                                  assignedTasks: [...form.assignedTasks, task.id]
                                });
                              } else {
                                setForm({
                                  ...form,
                                  assignedTasks: form.assignedTasks.filter(id => id !== task.id)
                                });
                              }
                            }}
                            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm">{task.title}</span>
                            <span className="text-xs text-slate-500 ml-2">({task.projectName})</span>
                          </div>
                        </label>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Prêt à créer l'utilisateur</h3>
                  <p className="text-sm text-slate-600">
                    Vérifiez les informations avant de confirmer
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-slate-500">Nom</span>
                      <p className="font-medium">{form.fullName}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Email</span>
                      <p className="font-medium">{form.email}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Département</span>
                      <p className="font-medium">{form.department}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Rôle</span>
                      <p className="font-medium">{ROLE_CONFIG[form.role as keyof typeof ROLE_CONFIG]?.label}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500">Projets assignés</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {form.assignedProjects.map(projectId => {
                        const project = projects.find(p => p.id === projectId);
                        return project ? (
                          <span key={projectId} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {project.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>

                  {form.assignedTasks.length > 0 && (
                    <div>
                      <span className="text-xs text-slate-500">Tâches assignées</span>
                      <p className="text-sm font-medium">{form.assignedTasks.length} tâche(s)</p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Action automatique :</strong> Un email de bienvenue sera envoyé à {form.email} 
                    avec les identifiants de connexion.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 flex justify-between">
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  onClick={handlePrev}
                  className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Précédent
                </button>
            )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>

              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Suivant
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    'Créer l\'utilisateur'
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
