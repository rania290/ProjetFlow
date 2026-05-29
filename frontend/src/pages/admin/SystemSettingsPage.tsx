import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Zap, Save,
  Check, Sun, Moon, Activity,
  Layers, Server
} from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { adminApi } from '../../api/admin.api';
import { useUi } from '../../store/uiStore';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../api/auth.service';

const Field = ({ label, hint, children }: { label: string, hint?: string, children: React.ReactNode }) => (
  <div className="space-y-2">
    <div className="flex items-baseline justify-between">
      <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B7280' }}>
        {label}
      </label>
      {hint && <span style={{ fontSize: 11, color: '#9CA3AF' }}>{hint}</span>}
    </div>
    {children}
  </div>
);

const Toggle = ({ value, onChange }: { value: boolean, onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!value)}
    style={{
      position: 'relative',
      width: 44, height: 24,
      borderRadius: 12,
      border: 'none',
      cursor: 'pointer',
      transition: 'background 0.25s',
      background: value ? '#4F46E5' : '#E5E7EB',
      flexShrink: 0,
    }}
  >
    <span style={{
      position: 'absolute',
      top: 3, left: value ? 23 : 3,
      width: 18, height: 18,
      borderRadius: '50%',
      background: '#fff',
      transition: 'left 0.25s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
    }} />
  </button>
);

const GeneralSection = ({ edited, setEdited }: { edited: any; setEdited: React.Dispatch<React.SetStateAction<any>> }) => {
  const { t, i18n } = useTranslation();
  const { user, updateProfile: updateUserProfile } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{t('admin.instance_identity')}</h2>
        <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.6 }}>{t('admin.configure_fundamental')}</p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Field label={t('admin.instance_name')}>
          <input
            value={edited.siteName ?? ''}
            onChange={e => setEdited((f: any) => ({ ...f, siteName: e.target.value }))}
            style={{
              width: '100%', padding: '10px 14px', fontSize: 14, fontWeight: 500,
              border: '1.5px solid #E5E7EB', borderRadius: 10, outline: 'none',
              transition: 'border 0.18s', background: '#FAFAFA', color: '#111827',
              boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.border = '1.5px solid #4F46E5'}
            onBlur={e => e.target.style.border = '1.5px solid #E5E7EB'}
            placeholder={t('admin.site_name_placeholder')}
          />
        </Field>

        <Field label={t('admin.default_platform_language')}>
          <select
            value={edited.defaultLanguage ?? i18n.language}
            onChange={e => {
              const newLang = e.target.value;
              setEdited((f: any) => ({ ...f, defaultLanguage: newLang }));
              void i18n.changeLanguage(newLang);
              if (user) {
                updateUserProfile({ preferredLanguage: newLang as 'fr' | 'en' });
                authService.updateProfile({ preferredLanguage: newLang as 'fr' | 'en' }).catch(() => {});
              }
            }}
            style={{
              width: '100%', padding: '10px 14px', fontSize: 14, fontWeight: 500,
              border: '1.5px solid #E5E7EB', borderRadius: 10, outline: 'none',
              transition: 'border 0.18s', background: '#FAFAFA', color: '#111827',
              boxSizing: 'border-box',
            }}
          >
            <option value="fr">{t('admin.lang_fr')}</option>
            <option value="en">{t('admin.lang_en')}</option>
          </select>
        </Field>

        <Field label={t('admin.software_version')} hint={t('admin.read_only')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F9FAFB', border: '1.5px solid #F3F4F6', borderRadius: 10 }}>
            <Activity style={{ width: 15, height: 15, color: '#9CA3AF' }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#6B7280' }}>{edited.version}</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, background: '#ECFDF5', color: '#059669', padding: '2px 8px', borderRadius: 6 }}>{t('admin.stable')}</span>
          </div>
        </Field>
      </div>

      <div style={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>{t('admin.quota_colleagues')}</p>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>{t('admin.max_capacity')}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{edited.currentUsers}</span>
            <span style={{ fontSize: 14, color: '#9CA3AF' }}> / {edited.maxUsers}</span>
          </div>
        </div>

        <div style={{ background: '#F3F4F6', borderRadius: 99, height: 6, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.round(((edited.currentUsers || 0) / (edited.maxUsers || 1)) * 100)}%`,
            background: (edited.currentUsers / edited.maxUsers) > 0.85 ? '#EF4444' : '#4F46E5',
            borderRadius: 99,
            transition: 'width 0.5s',
          }} />
        </div>

        <Field label={t('admin.max_limit')}>
          <input
            type="number"
            value={edited.maxUsers ?? 0}
            onChange={e => setEdited((f: any) => ({ ...f, maxUsers: parseInt(e.target.value) || 0 }))}
            style={{
              width: '100%', padding: '10px 14px', fontSize: 14, fontWeight: 500,
              border: '1.5px solid #E5E7EB', borderRadius: 10, outline: 'none',
              transition: 'border 0.18s', background: '#FAFAFA', color: '#111827',
              boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.border = '1.5px solid #4F46E5'}
            onBlur={e => e.target.style.border = '1.5px solid #E5E7EB'}
          />
        </Field>
      </div>
    </div>
  );
};

const AppearanceSection = ({ edited, setEdited }: { edited: any; setEdited: React.Dispatch<React.SetStateAction<any>> }) => {
  const { t, i18n } = useTranslation();

  const themes = useMemo(() => [
    { id: 'light', icon: Sun, label: t('admin.theme_standard_light'), desc: t('admin.theme_standard_light_desc') },
    { id: 'dark', icon: Moon, label: t('admin.theme_aura_night'), desc: t('admin.theme_aura_night_desc') },
  ], [t, i18n.language]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{t('admin.visual_experience')}</h2>
        <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.6 }}>{t('admin.define_ambiance')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {themes.map(theme => (
          <button
            key={theme.id}
            onClick={() => setEdited((f: any) => ({ ...f, theme: theme.id }))}
            style={{
              padding: 20, borderRadius: 16, textAlign: 'left', cursor: 'pointer',
              border: edited.theme === theme.id ? '2px solid #4F46E5' : '2px solid #F3F4F6',
              background: edited.theme === theme.id ? '#EEF2FF' : '#FAFAFA',
              transition: 'all 0.18s',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <theme.icon style={{ width: 14, height: 14, color: edited.theme === theme.id ? '#4F46E5' : '#9CA3AF' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: edited.theme === theme.id ? '#4338CA' : '#374151' }}>{theme.label}</span>
            </div>
            <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{theme.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

const SystemSection = ({ edited, setEdited }: { edited: any; setEdited: React.Dispatch<React.SetStateAction<any>> }) => {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{t('admin.service_steering')}</h2>
        <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.6 }}>{t('admin.manage_core_state')}</p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F9FAFB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: edited.maintenance ? '#FEF9C3' : '#F3F4F6' }}>
              <Zap style={{ width: 18, height: 18, color: edited.maintenance ? '#CA8A04' : '#9CA3AF' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>{t('admin.maintenance_mode')}</p>
            </div>
          </div>
          <Toggle value={!!edited.maintenance} onChange={v => setEdited((f: any) => ({ ...f, maintenance: v }))} />
        </div>

        <div style={{ padding: 24 }}>
          <Field label={t('admin.maintenance_message')}>
            <textarea
              value={edited.maintenanceMessage ?? ''}
              onChange={e => setEdited((f: any) => ({ ...f, maintenanceMessage: e.target.value }))}
              rows={4}
              style={{
                width: '100%', padding: '10px 14px', fontSize: 13,
                border: '1.5px solid #E5E7EB', borderRadius: 10, outline: 'none',
                transition: 'border 0.18s', background: '#FAFAFA', color: '#374151',
                resize: 'none', boxSizing: 'border-box',
              }}
            />
          </Field>
        </div>
      </div>
    </div>
  );
};

export const SystemSettingsPage = () => {
  const [edited, setEdited] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { updateSettings: updateUiSettings, settings: uiSettings } = useUi();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    adminApi.getSettings().then(data => {
      setEdited({
        ...data,
        theme: (data as any).theme ?? uiSettings.theme,
        siteName: (data as any).siteName ?? uiSettings.siteName,
      });
    });
  }, []);

  const navItems = useMemo(() => [
    { id: 'general', label: t('admin.tab_general'), icon: Settings },
    { id: 'appearance', label: t('admin.tab_appearance'), icon: Layers },
    { id: 'system', label: t('admin.tab_system'), icon: Server },
  ], [t, i18n.language]);

  const save = async () => {
    if (!edited) return;
    setSaving(true);
    try {
      const updated = await adminApi.updateSettings(edited);
      setEdited(updated);
      updateUiSettings({
        siteName: (updated as any).siteName ?? uiSettings.siteName,
        maintenance: !!(updated as any).maintenance,
        theme: (updated as any).theme as 'light' | 'dark',
      });
      setFeedback({ type: 'success', message: t('admin.sync_success') });
    } catch {
      setFeedback({ type: 'error', message: t('admin.sync_error') });
    }
    setSaving(false);
    setTimeout(() => setFeedback(null), 3000);
  };

  if (!edited) return null;

  return (
    <AppLayout
      title={t('admin.system_settings')}
      subtitle={t('admin.settings_subtitle', { siteName: edited.siteName })}
    >
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ display: 'flex', maxWidth: 1100, margin: '0 auto', padding: '32px 24px', gap: 32, alignItems: 'flex-start' }}>

        <aside style={{ width: 220, flexShrink: 0, position: 'sticky', top: 92 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navItems.map(item => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                    borderRadius: 9, border: 'none', cursor: 'pointer', textAlign: 'left',
                    background: active ? '#EEF2FF' : 'transparent',
                    color: active ? '#4338CA' : '#6B7280',
                    transition: 'all 0.15s', width: '100%',
                  }}
                >
                  <item.icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: active ? 600 : 500 }}>{item.label}</span>
                  {active && <div style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: '#4F46E5' }} />}
                </button>
              );
            })}
          </nav>

          <div style={{ marginTop: 24, padding: '14px 16px', background: '#F3F4F6', borderRadius: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#9CA3AF' }}>{t('admin.build_label')}</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>2026.03.31</p>
          </div>

          <button
            onClick={save}
            disabled={saving}
            style={{
              marginTop: 20, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px',
              background: '#111827', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600
            }}
          >
            {saving ? <div style={{ width: 14, height: 14, border: '2px solid #374151', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : <Save style={{ width: 14, height: 14 }} />}
            {saving ? t('admin.syncing') : t('admin.sync_instance')}
          </button>
        </aside>

        <main style={{ flex: 1, minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'general' && <GeneralSection edited={edited} setEdited={setEdited} />}
              {activeTab === 'appearance' && <AppearanceSection edited={edited} setEdited={setEdited} />}
              {activeTab === 'system' && <SystemSection edited={edited} setEdited={setEdited} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
              background: '#fff', border: `1px solid ${feedback.type === 'success' ? '#10B981' : '#EF4444'}`,
              borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', zIndex: 100, fontSize: 13, fontWeight: 600,
              color: feedback.type === 'success' ? '#059669' : '#DC2626',
            }}
          >
            <Check style={{ width: 16, height: 16 }} />
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default SystemSettingsPage;
