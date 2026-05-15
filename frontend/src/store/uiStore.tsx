import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';

export type UiSettings = {
  siteName: string;
  maintenance: boolean;
  theme: ThemeMode;
};

const STORAGE_KEY = 'vaerdia.ui.settings.v1';

const DEFAULT_SETTINGS: UiSettings = {
  siteName: 'VAERDIA',
  maintenance: false,
  theme: 'light',
};

function safeParseSettings(raw: string | null): Partial<UiSettings> | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Partial<UiSettings>;
  } catch {
    return null;
  }
}

function loadSettings(): UiSettings {
  const parsed = safeParseSettings(localStorage.getItem(STORAGE_KEY));
  return {
    ...DEFAULT_SETTINGS,
    ...(parsed ?? {}),
  };
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

type UiContextValue = {
  settings: UiSettings;
  setSettings: (next: UiSettings) => void;
  updateSettings: (patch: Partial<UiSettings>) => void;
};

const UiContext = createContext<UiContextValue | undefined>(undefined);

export function UiProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<UiSettings>(() => loadSettings());

  const setSettings = (next: UiSettings) => setSettingsState(next);
  const updateSettings = (patch: Partial<UiSettings>) =>
    setSettingsState((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    document.title = settings.siteName || DEFAULT_SETTINGS.siteName;
  }, [settings.siteName]);

  const value = useMemo(
    () => ({ settings, setSettings, updateSettings }),
    [settings],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi must be used within a UiProvider');
  return ctx;
}

