import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/api-client';
import { authService } from '../api/auth.service';
import { useAuth } from '../hooks/useAuth';
import {
  User,
  Mail,
  Phone,
  Globe,
  Lock,
  Upload,
  Camera,
  CheckCircle,
  AlertCircle,
  Save,
  Shield,
  Building,
  Calendar,
  Bell,
  Settings,
  Eye,
  EyeOff,
  X as XIcon,
  Download
} from 'lucide-react';

interface UserProfile {
  fullName: string;
  email: string;
  phoneNumber?: string;
  bio?: string;
  department: string;
  role: string;
  preferredLanguage: 'fr' | 'en';
  profilePhoto?: string;
  createdAt: string;
  notifications: {
    email: boolean;
    inApp: boolean;
  };
}

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile: updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [profile, setProfile] = useState<UserProfile>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phone || '',
    bio: user?.bio || '',
    department: user?.department || '',
    role: user?.role || '',
    preferredLanguage: (user?.preferredLanguage as 'fr' | 'en') || 'fr',
    profilePhoto: user?.profilePhoto || '',
    createdAt: '',
    notifications: {
      email: true,
      inApp: true
    }
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    // Initialiser avec les données de l'utilisateur connecté
    if (user) {
      setProfile({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phone || '',
        bio: user.bio || '',
        department: user.department || '',
        role: user.role || '',
        preferredLanguage: (user.preferredLanguage as 'fr' | 'en') || 'fr',
        profilePhoto: user.profilePhoto || '',
        createdAt: new Date().toISOString(),
        notifications: {
          email: true,
          inApp: true
        }
      });
      setPhotoPreview(user.profilePhoto || null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setProfile(response.data);
      setPhotoPreview(response.data.profilePhoto);
    } catch (err) {
      console.error('Erreur lors du chargement du profil:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ profilePhoto: 'La photo ne doit pas dépasser 5MB' });
        return;
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setErrors({ profilePhoto: 'Veuillez sélectionner une image valide (JPG, PNG, GIF)' });
        return;
      }

      setUploadingPhoto(true);
      setErrors({});

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        uploadPhoto(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (file: File) => {
    try {
      // Pour l'instant, on simule l'upload et on garde juste le preview
      // Plus tard, vous pourrez connecter ça à votre vraie API

      // Simulation d'upload (2 secondes)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mettre à jour le profil avec l'URL de la preview (base64)
      setProfile(prev => ({ ...prev, profilePhoto: photoPreview || '' }));
      setSuccess('Photo de profil mise à jour avec succès');

      console.log('Photo uploadée avec succès (simulation)');
    } catch (err) {
      setErrors({ profilePhoto: 'Erreur lors du téléchargement de la photo' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const downloadPhoto = () => {
    if (photoPreview) {
      const link = document.createElement('a');
      link.href = photoPreview;
      link.download = `profile-photo-${profile.fullName.replace(/\s+/g, '-').toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const removePhoto = async () => {
    try {
      // Pour l'instant, on simule la suppression
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProfile(prev => ({ ...prev, profilePhoto: '' }));
      setPhotoPreview(null);
      setSuccess('Photo de profil supprimée avec succès');

      console.log('Photo supprimée avec succès (simulation)');
    } catch (err) {
      setErrors({ profilePhoto: 'Erreur lors de la suppression de la photo' });
    }
  };

  const updateProfile = async () => {
    setSaving(true);
    setErrors({});

    try {
      // Préparer les données à envoyer
      const profileData = {
        fullName: profile.fullName,
        phone: profile.phoneNumber,
        bio: profile.bio,
        department: profile.department,
        profilePhoto: photoPreview || undefined,
        preferredLanguage: profile.preferredLanguage
      };

      console.log('Mise à jour du profil via API:', profileData);

      // Appel API réel (via le service ou directement via api-client)
      const updatedUser = await authService.updateProfile(profileData as any);

      // Mettre à jour le profil global dans le authStore avec les données du serveur
      updateUserProfile(updatedUser as any);

      setSuccess('Profil mis à jour avec succès!');
      console.log('Profil mis à jour avec succès (réel):', updatedUser);

    } catch (err: any) {
      setErrors({
        submit: err.response?.data?.message || 'Erreur lors de la mise à jour du profil'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateNotifications = async () => {
    setSaving(true);

    try {
      // Pour l'instant, on simule la sauvegarde des notifications
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Préférences de notification mises à jour');

      console.log('Notifications mises à jour (simulation):', profile.notifications);
    } catch (err: any) {
      setErrors({
        notifications: err.response?.data?.message || 'Erreur lors de la mise à jour des notifications'
      });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    const e: Record<string, string> = {};

    if (!passwordForm.currentPassword) {
      e.currentPassword = 'Le mot de passe actuel est requis';
    }

    if (!passwordForm.newPassword) {
      e.newPassword = 'Le nouveau mot de passe est requis';
    } else if (passwordForm.newPassword.length < 8) {
      e.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (!passwordForm.confirmPassword) {
      e.confirmPassword = 'La confirmation est requise';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      e.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);

    try {
      // Pour l'instant, on simule le changement de mot de passe
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccess('Mot de passe changé avec succès');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });

      console.log('Mot de passe changé avec succès (simulation)');
    } catch (err: any) {
      setErrors({
        password: err.response?.data?.message || 'Erreur lors du changement de mot de passe'
      });
    } finally {
      setSaving(false);
    }
  };

  const setSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      'ADMIN': 'Administrateur',
      'PROJECT_MANAGER': 'Gestionnaire',
      'TEAM_MEMBER': 'Membre',
      'OBSERVER': 'Observateur'
    };
    return roleMap[role] || role;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Premium Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Settings className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Paramètres du Compte</h1>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-2"
            >
              Quitter
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700"
          >
            <CheckCircle className="w-5 h-5" />
            {successMessage}
          </motion.div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {errors.submit}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Minimalist Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-28 h-28 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-2xl overflow-hidden">
                    {uploadingPhoto ? (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : photoPreview ? (
                      <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-slate-300 stroke-[1.5]" />
                    )}
                  </div>

                  <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center shadow-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <Camera className="w-4 h-4 text-slate-600" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                  </label>
                </div>

                <div className="space-y-1 mb-6">
                  <h2 className="text-xl font-bold text-slate-900">{profile.fullName}</h2>
                  <div className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                    {getRoleLabel(profile.role)}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Tabs Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              {/* Minimalist Professional Tabs */}
              <div className="px-1 border-b border-slate-100 bg-white">
                <div className="flex">
                  {[
                    { id: 'profile', label: 'Informations' },
                    { id: 'security', label: 'Sécurité' },
                    { id: 'notifications', label: 'Préférences' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider transition-all relative ${activeTab === tab.id
                        ? 'text-blue-600'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-8">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nom complet</label>
                        <input
                          type="text"
                          value={profile.fullName}
                          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Adresse e-mail</label>
                        <div className="relative">
                          <input
                            type="email"
                            value={profile.email}
                            disabled
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-500 cursor-not-allowed"
                          />
                          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Téléphone (facultatif)</label>
                      <input
                        type="tel"
                        value={profile.phoneNumber || ''}
                        onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                        placeholder="+216 -- --- ---"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bio / Position</label>
                      <textarea
                        value={profile.bio || ''}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Développeur Full Stack passionné par les nouvelles technologies..."
                      />
                    </div>

                    <div className="flex justify-between">
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                      >
                        ← Retour au dashboard
                      </button>

                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                      <button
                        onClick={updateProfile}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                          <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Sécurité du compte</h3>
                          <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
                            Renforcez votre sécurité en utilisant un mot de passe complexe et unique.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mot de passe actuel</label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPasswords.current ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.currentPassword && <p className="text-[10px] text-red-500 font-bold">{errors.currentPassword}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nouveau mot de passe</label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPasswords.new ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Confirmer le nouveau mot de passe</label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPasswords.confirm ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        onClick={changePassword}
                        disabled={saving}
                        className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        {saving ? 'Changement...' : 'Mettre à jour le mot de passe'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {errors.notifications && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {errors.notifications}
                      </div>
                    )}

                    <div className="space-y-4">
                      {[
                        {
                          id: 'email',
                          icon: Mail,
                          title: 'Notifications par email',
                          desc: 'Recevez les rapports et alertes par e-mail',
                          value: profile.notifications.email
                        },
                        {
                          id: 'inApp',
                          icon: Bell,
                          title: 'Notifications système',
                          desc: 'Alertes en temps réel dans l\'interface',
                          value: profile.notifications.inApp
                        }
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                              <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-700">{item.title}</h3>
                              <p className="text-xs text-slate-500">{item.desc}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setProfile({
                              ...profile,
                              notifications: { ...profile.notifications, [item.id]: !item.value }
                            })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${item.value ? 'bg-blue-600' : 'bg-slate-300'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.value ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-100 mt-6">
                      <button
                        onClick={updateNotifications}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                      >
                        <Bell className="w-4 h-4" />
                        {saving ? 'Enregistrement...' : 'Enregistrer les préférences'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
