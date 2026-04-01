import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/api-client';
import {
  Eye,
  EyeOff,
  Upload,
  User,
  Mail,
  Phone,
  Globe,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Shield
} from 'lucide-react';

interface OnboardingData {
  newPassword: string;
  confirmPassword: string;
  profilePhoto: File | null;
  phoneNumber: string;
  bio: string;
  preferredLanguage: 'fr' | 'en';
  notifications: {
    email: boolean;
    inApp: boolean;
  };
}

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  
  const [form, setForm] = useState<OnboardingData>({
    newPassword: '',
    confirmPassword: '',
    profilePhoto: null,
    phoneNumber: '',
    bio: '',
    preferredLanguage: 'fr',
    notifications: {
      email: true,
      inApp: true
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Vérifier si l'utilisateur est en première connexion
    checkFirstLoginStatus();
  }, []);

  const checkFirstLoginStatus = async () => {
    try {
      const response = await api.get('/auth/first-login-status');
      if (!response.data.isFirstLogin) {
        navigate('/dashboard');
        return;
      }
      setUserData(response.data.user);
    } catch (err) {
      navigate('/login');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ profilePhoto: 'La photo ne doit pas dépasser 5MB' });
        return;
      }

      setForm({ ...form, profilePhoto: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    
    if (!form.newPassword) {
      e.newPassword = 'Le mot de passe est requis';
    } else if (form.newPassword.length < 8) {
      e.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(form.newPassword)) {
      e.newPassword = 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial';
    }

    if (!form.confirmPassword) {
      e.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (form.newPassword !== form.confirmPassword) {
      e.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    
    if (form.phoneNumber && !/^\+?[0-9\s-]{10,}$/.test(form.phoneNumber)) {
      e.phoneNumber = 'Numéro de téléphone invalide';
    }

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

  const handleComplete = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('newPassword', form.newPassword);
      formData.append('phoneNumber', form.phoneNumber);
      formData.append('bio', form.bio);
      formData.append('preferredLanguage', form.preferredLanguage);
      formData.append('emailNotifications', form.notifications.email.toString());
      formData.append('inAppNotifications', form.notifications.inApp.toString());
      
      if (form.profilePhoto) {
        formData.append('profilePhoto', form.profilePhoto);
      }

      await api.post('/auth/complete-onboarding', formData);
      
      // Rediriger vers le dashboard personnel
      navigate('/dashboard');
    } catch (err: any) {
      setErrors({ 
        submit: err.response?.data?.message || 'Erreur lors de la finalisation du profil' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Bienvenue, {userData?.fullName?.split(' ')[0]} ! 👋
          </h1>
          <p className="text-slate-600">
            Complétons votre profil pour personnaliser votre expérience
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  s <= step
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}
              >
                {s < step ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 h-0.5 transition-all ${
                    s < step ? 'bg-primary-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {errors.submit && (
            <div className="p-4 bg-red-50 border-b border-red-200 flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              {errors.submit}
            </div>
          )}

          <div className="p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <Shield className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                    <h2 className="text-2xl font-bold text-slate-900">Sécurité d'abord</h2>
                    <p className="text-slate-600">
                      Choisissez votre nouveau mot de passe permanent
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nouveau mot de passe *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={form.newPassword}
                          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>
                      )}
                      <div className="mt-2 text-xs text-slate-500">
                        Doit contenir : 8+ caractères, majuscule, minuscule, chiffre, caractère spécial
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Confirmer le mot de passe *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={form.confirmPassword}
                          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <User className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                    <h2 className="text-2xl font-bold text-slate-900">Personnalisez votre profil</h2>
                    <p className="text-slate-600">
                      Ajoutez une photo et vos informations personnelles
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                          {photoPreview ? (
                            <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-16 h-16 text-primary-400" />
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
                          <Upload className="w-5 h-5 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          <Phone className="w-4 h-4 inline mr-1" />
                          Téléphone (optionnel)
                        </label>
                        <input
                          type="tel"
                          value={form.phoneNumber}
                          onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="+216 99 123 456"
                        />
                        {errors.phoneNumber && (
                          <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          <Globe className="w-4 h-4 inline mr-1" />
                          Langue préférée
                        </label>
                        <select
                          value={form.preferredLanguage}
                          onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value as 'fr' | 'en' })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="fr">Français</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Bio / Position (optionnel)
                      </label>
                      <textarea
                        value={form.bio}
                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Développeur Full Stack passionné par les nouvelles technologies..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <Mail className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                    <h2 className="text-2xl font-bold text-slate-900">Préférences de notification</h2>
                    <p className="text-slate-600">
                      Choisissez comment vous souhaitez être notifié
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-slate-600" />
                          <div>
                            <h3 className="font-medium text-slate-900">Notifications par email</h3>
                            <p className="text-sm text-slate-600">Recevez les mises à jour importantes par email</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.notifications.email}
                            onChange={(e) => setForm({
                              ...form,
                              notifications: { ...form.notifications, email: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900">Notifications in-app</h3>
                            <p className="text-sm text-slate-600">Notifications directement dans l'application</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.notifications.inApp}
                            onChange={(e) => setForm({
                              ...form,
                              notifications: { ...form.notifications, inApp: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-green-800">Presque terminé !</h3>
                        <p className="text-sm text-green-700">
                          Après cette étape, vous accéderez à votre tableau de bord personnel avec toutes vos tâches et projets.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-between">
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  onClick={handlePrev}
                  className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-white transition-colors"
                >
                  Précédent
                </button>
              )}
            </div>

            <div className="flex gap-3">
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  Suivant
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-indigo-600 rounded-lg hover:from-primary-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Finalisation...
                    </>
                  ) : (
                    <>
                      Accéder à mon dashboard
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
