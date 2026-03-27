import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import en from '../i18n/en.json';
import vi from '../i18n/vi.json';

const TRANSLATIONS = { en, vi };
const STORAGE_KEY = '8q-lang';

const LanguageContext = createContext(null);

/**
 * Interpolate {key} placeholders in a string.
 * e.g. t('manualHint', { n: 8 }) replaces {n} with 8.
 */
function interpolate(str, vars) {
  if (!vars || typeof str !== 'string') return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
}

/**
 * Deep-get a dotted key from an object.
 * e.g. get(obj, 'stopBox.solved')
 */
function get(obj, path) {
  return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'vi'; } catch { return 'vi'; }
  });

  const switchLang = useCallback((l) => {
    setLang(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  }, []);

  /**
   * Translate a key with optional variable interpolation.
   * t('buttons.reset') → "Reset" / "Reset"
   * t('manualHint', { n: 8 }) → "Enter row (1–8)…"
   */
  const t = useCallback((key, vars) => {
    const val = get(TRANSLATIONS[lang], key) ?? get(TRANSLATIONS['vi'], key) ?? key;
    return interpolate(val, vars);
  }, [lang]);

  const value = useMemo(() => ({ lang, switchLang, t }), [lang, switchLang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider');
  return ctx;
}
