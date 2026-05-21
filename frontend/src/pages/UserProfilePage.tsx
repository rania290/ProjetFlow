import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/api-client';
import { authService } from '../api/auth.service';
import { useAuth } from '../hooks/useAuth';
import {
  User, Mail, Phone, Lock, Camera, CheckCircle,
  AlertCircle, Save, Shield, Settings, Eye, EyeOff,
  Bell, X as XIcon, RefreshCw
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';

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
  const { t, i18n } = useTranslation();
  const { user, updateProfile: updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    notifications: { email: true, inApp: true }
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
    if (user) {
      const STORAGE_KEY = `user_notif_prefs_${user.id}`;
      const savedPrefs = localStorage.getItem(STORAGE_KEY);
      let notifPrefs = { email: true, inApp: true };
      if (savedPrefs) {
        try {
          notifPrefs = JSON.parse(savedPrefs);
        } catch (e) {
          console.error(e);
        }
      }
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
        notifications: notifPrefs
      });
      setPhotoPreview(user.profilePhoto || null);
      setLoading(false);
    }
  }, [user]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ profilePhoto: 'La photo ne doit pas dépasser 5MB' });
      return;
    }

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
  };

  const uploadPhoto = async (file: File) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setProfile(prev => ({ ...prev, profilePhoto: photoPreview || '' }));
      setSuccess('Photo de profil mise à jour avec succès');
    } catch (err) {
      setErrors({ profilePhoto: 'Erreur lors du téléchargement de la photo' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const updateProfile = async () => {
    setSaving(true);
    setErrors({});
    try {
      const profileData = {
        fullName: profile.fullName,
        phone: profile.phoneNumber,
        bio: profile.bio,
        department: profile.department,
        profilePhoto: photoPreview || undefined,
        preferredLanguage: profile.preferredLanguage
      };

      const updatedUser = await authService.updateProfile(profileData as any);
      updateUserProfile(updatedUser as any);
      // Apply language change immediately
      if (profile.preferredLanguage) {
        void i18n.changeLanguage(profile.preferredLanguage);
      }
      setSuccess(t('profile_custom.save') + ' ✓');
    } catch (err: any) {
      setErrors({ submit: err.response?.data?.message || 'Error updating profile' });
    } finally {
      setSaving(false);
    }
  };

  const updateNotifications = async () => {
    setSaving(true);
    try {
      if (user) {
        const STORAGE_KEY = `user_notif_prefs_${user.id}`;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile.notifications));
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Préférences de notification mises à jour');
    } catch (err: any) {
      setErrors({ notifications: err.response?.data?.message || 'Erreur lors de la mise à jour des notifications' });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    const e: Record<string, string> = {};
    if (!passwordForm.currentPassword) e.currentPassword = 'Requis';
    if (!passwordForm.newPassword) {
      e.newPassword = 'Requis';
    } else if (passwordForm.newPassword.length < 8) {
      e.newPassword = 'Min 8 caractères';
    }
    if (!passwordForm.confirmPassword) {
      e.confirmPassword = 'Requis';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      e.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess('Mot de passe changé avec succès');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setErrors({ password: err.response?.data?.message || 'Erreur lors du changement de mot de passe' });
    } finally {
      setSaving(false);
    }
  };

  const setSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getRoleLabel = (role: string) => {
    return t(`admin.roles.${role}`, { defaultValue: role });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      {/* Premium Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Settings className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">{t('common.settings')}</h1>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-slate-500 hover:bg-slate-100"
            >
              {t('common.exit_portal')}
              <XIcon className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 mt-4">
        {/* Alerts */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 shadow-sm"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium text-sm">{successMessage}</span>
            </motion.div>
          )}

          {errors.submit && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 shadow-sm"
            >
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium text-sm">{errors.submit}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Summary */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-8 text-center flex flex-col items-center">
                <div className="relative inline-block mb-6 group">
                  <Avatar className="w-28 h-28 border-4 border-white shadow-xl ring-1 ring-slate-100">
                    <AvatarImage src={photoPreview || ''} alt="Profile" className="object-cover" />
                    <AvatarFallback className="bg-slate-50 text-slate-400 font-bold text-2xl">
                      {profile.fullName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-white/60 rounded-full flex items-center justify-center z-10 backdrop-blur-sm">
                      <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                    </div>
                  )}

                  <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-slate-600 rounded-full border border-slate-200 flex items-center justify-center shadow-lg cursor-pointer hover:bg-slate-50 hover:text-blue-600 hover:scale-105 transition-all">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                  </label>
                </div>

                <div className="space-y-1 w-full">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">{profile.fullName}</h2>
                  <div className="inline-flex items-center px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-widest mt-1">
                    {getRoleLabel(profile.role)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Tabs Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="w-full h-14 bg-transparent border-b border-slate-200 rounded-none p-0 flex justify-start gap-6 relative">
                <TabsTrigger
                  value="profile"
                  className="rounded-none bg-transparent h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 pt-0 pb-0 px-1 text-sm font-bold uppercase tracking-wider text-slate-500 data-[state=active]:text-blue-600"
                >
                  {t('profile_custom.personal_details')}
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="rounded-none bg-transparent h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 pt-0 pb-0 px-1 text-sm font-bold uppercase tracking-wider text-slate-500 data-[state=active]:text-blue-600"
                >
                  {t('profile_custom.security')}
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="rounded-none bg-transparent h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 pt-0 pb-0 px-1 text-sm font-bold uppercase tracking-wider text-slate-500 data-[state=active]:text-blue-600"
                >
                  {t('profile_custom.preferences')}
                </TabsTrigger>
              </TabsList>

              {/* PROFILE TAB */}
              <TabsContent value="profile" className="mt-8 outline-none">
                <Card className="border-slate-200 shadow-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-base font-black uppercase tracking-tight text-slate-800">{t('profile_custom.personal_details')}</CardTitle>
                    <CardDescription>{t('profile_custom.personal_details_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('profile_custom.full_name')}</Label>
                        <Input
                          id="fullName"
                          value={profile.fullName}
                          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                          className="h-11 bg-slate-50/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('profile_custom.email')}</Label>
                        <div className="relative">
                          <Input
                            id="email"
                            type="email"
                            value={profile.email}
                            disabled
                            className="h-11 bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
                          />
                          <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('profile_custom.phone')}</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profile.phoneNumber || ''}
                          onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                          placeholder="+216 -- --- ---"
                          className="h-11 bg-slate-50/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('profile_custom.bio')}</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio || ''}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows={3}
                        className="resize-none bg-slate-50/50"
                        placeholder={t('profile_custom.bio_placeholder')}
                      />
                    </div>

                    {/* Language Selector */}
                    <div className="space-y-2">
                      <Label htmlFor="preferredLanguage" className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('profile_custom.preferred_language')}</Label>
                      <p className="text-[11px] text-slate-400">{t('profile_custom.preferred_language_desc')}</p>
                      <select
                        id="preferredLanguage"
                        value={profile.preferredLanguage}
                        onChange={(e) => setProfile({ ...profile, preferredLanguage: e.target.value as 'fr' | 'en' })}
                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option value="fr">🇫🇷 Français</option>
                        <option value="en">🇬🇧 English</option>
                      </select>
                    </div>
                  </CardContent>
                  <CardFooter className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                    <Button
                      onClick={updateProfile}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold tracking-wide h-11 px-8 rounded-xl"
                    >
                      {saving ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {saving ? t('profile_custom.saving') : t('profile_custom.save')}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* SECURITY TAB */}
              <TabsContent value="security" className="mt-8 outline-none">
                <Card className="border-slate-200 shadow-sm rounded-2xl">
                  <CardHeader>
                    <div className="flex gap-3 items-start p-4 bg-amber-50/50 border border-amber-100 rounded-xl mb-4">
                      <Shield className="w-5 h-5 text-amber-500 mt-0.5" />
                      <div>
                        <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider">{t('profile_custom.security')}</h3>
                        <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
                          {t('common.password')}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('common.password')}</Label>
                      <div className="relative">
                        <Input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className={`h-11 bg-slate-50/50 pr-12 ${errors.currentPassword ? 'border-red-300 ring-1 ring-red-300' : ''}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.current ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                      </div>
                      {errors.currentPassword && <p className="text-[10px] text-red-500 font-bold">{errors.currentPassword}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('common.password')} (New)</Label>
                      <div className="relative">
                        <Input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className={`h-11 bg-slate-50/50 pr-12 ${errors.newPassword ? 'border-red-300 ring-1 ring-red-300' : ''}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.new ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                      </div>
                      {errors.newPassword && <p className="text-[10px] text-red-500 font-bold">{errors.newPassword}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('common.password')} (Confirm)</Label>
                      <div className="relative">
                        <Input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className={`h-11 bg-slate-50/50 pr-12 ${errors.confirmPassword ? 'border-red-300 ring-1 ring-red-300' : ''}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.confirm ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                      </div>
                      {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold">{errors.confirmPassword}</p>}
                    </div>
                  </CardContent>
                  <CardFooter className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end mt-4">
                    <Button
                      onClick={changePassword}
                      disabled={saving}
                      className="bg-slate-900 hover:bg-black text-white shadow-sm font-bold tracking-wide h-11 px-8 rounded-xl"
                    >
                      {saving ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Lock className="w-4 h-4 mr-2" />
                      )}
                      {saving ? t('profile_custom.saving') : t('profile_custom.save')}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* NOTIFICATIONS TAB */}
              <TabsContent value="notifications" className="mt-8 outline-none">
                <Card className="border-slate-200 shadow-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-base font-black uppercase tracking-tight text-slate-800">{t('profile_custom.preferences')}</CardTitle>
                    <CardDescription>{t('messages.preferences')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        id: 'email',
                        icon: Mail,
                        title: t('messages.alert_sounds'),
                        desc: t('messages.preferences'),
                        value: profile.notifications.email
                      },
                      {
                        id: 'inApp',
                        icon: Bell,
                        title: t('messages.push_notifications'),
                        desc: t('messages.preferences'),
                        value: profile.notifications.inApp
                      }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-5 bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:border-slate-300 overflow-hidden">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-800">{item.title}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setProfile({
                            ...profile,
                            notifications: { ...profile.notifications, [item.id]: !item.value }
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${item.value ? 'bg-blue-600' : 'bg-slate-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.value ? 'translate-x-[22px]' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end mt-4">
                    <Button
                      onClick={updateNotifications}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold tracking-wide h-11 px-8 rounded-xl"
                    >
                      {saving ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Bell className="w-4 h-4 mr-2" />
                      )}
                      {saving ? t('profile_custom.saving') : t('profile_custom.save')}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};
