import React from 'react';
import { useLang } from '../context/LanguageContext.jsx';

/**
 * Language switcher — renders EN / VI toggle buttons.
 * Placed in the Navbar.
 */
export default function LanguageSwitcher() {
  const { lang, switchLang } = useLang();

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {['en', 'vi'].map((l) => (
        <button
          key={l}
          onClick={() => switchLang(l)}
          style={{
            padding: '3px 10px',
            borderRadius: '5px',
            border: lang === l ? '1px solid var(--gold)' : '1px solid var(--bd)',
            background: lang === l ? 'var(--gg)' : 'transparent',
            color: lang === l ? 'var(--gold)' : 'var(--muted)',
            fontSize: '.65rem',
            fontWeight: lang === l ? 700 : 400,
            letterSpacing: '1px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'all .18s',
          }}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
