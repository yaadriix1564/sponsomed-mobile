import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

const LANGS = [
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'ar', flag: '🇸🇦', label: 'العربية' },
  { code: 'ro', flag: '🇷🇴', label: 'Română' },
  { code: 'it', flag: '🇮🇹', label: 'Italiano' },
  { code: 'pt', flag: '🇵🇹', label: 'Português' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
];

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);

  const change = (code: string) => {
    i18n.changeLanguage(code);
    document.documentElement.dir  = code === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
    setOpen(false);
  };

  const modal = open ? createPortal(
    // Portal renders outside the RTL tree — always in <body>
    <div
      dir="ltr"
      style={{ position: 'fixed', inset: 0, zIndex: 9999,
               display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
               background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
      onClick={() => setOpen(false)}
    >
      <div
        dir="ltr"
        style={{
          background: 'white',
          borderRadius: '24px 24px 0 0',
          width: '100%',
          maxWidth: '480px',
          paddingBottom: 'env(safe-area-inset-bottom, 16px)',
          animation: 'slideUp 0.22s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ display:'flex', justifyContent:'center', paddingTop:'12px', paddingBottom:'4px' }}>
          <div style={{ width:'40px', height:'4px', borderRadius:'2px', background:'#e2e8f0' }} />
        </div>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px 8px' }}>
          <p style={{ fontWeight:700, fontSize:'16px', color:'#0f172a' }}>{t('profile.language')}</p>
          <button
            onClick={() => setOpen(false)}
            style={{ width:'32px', height:'32px', borderRadius:'50%', background:'#f1f5f9',
                     display:'flex', alignItems:'center', justifyContent:'center', border:'none', cursor:'pointer' }}
          >
            <X size={16} color="#64748b" />
          </button>
        </div>

        {/* Lang list */}
        <div style={{ padding:'4px 12px 8px' }}>
          {LANGS.map(({ code, flag, label }) => {
            const active = i18n.language === code;
            return (
              <button
                key={code}
                onClick={() => change(code)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '11px 12px', borderRadius: '16px', border: 'none', cursor: 'pointer',
                  background: active ? '#eff6ff' : 'transparent',
                  transition: 'background 0.15s',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '24px', lineHeight: 1, minWidth: '32px', textAlign: 'center' }}>{flag}</span>
                <span style={{ flex: 1, fontSize: '15px', fontWeight: active ? 700 : 500,
                               color: active ? '#1d4ed8' : '#334155' }}>
                  {label}
                </span>
                {active && (
                  <span style={{ width:'22px', height:'22px', borderRadius:'50%', background:'#1d4ed8',
                                 display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Check size={12} color="white" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>,
    document.body
  ) : null;

  return (
    <div dir="ltr">
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center gap-1.5 rounded-2xl transition-all active:scale-90',
          compact
            ? 'w-9 h-9 justify-center hover:bg-slate-100'
            : 'px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700'
        )}
        aria-label="Change language"
      >
        <Globe size={16} className="text-slate-500" />
        {!compact && (
          <span className="text-xs font-semibold uppercase tracking-wide">
            {i18n.language.toUpperCase()}
          </span>
        )}
      </button>

      {modal}
    </div>
  );
}
