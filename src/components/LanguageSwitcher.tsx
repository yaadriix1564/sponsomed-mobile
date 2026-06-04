import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const LANGS = [
  { code: 'fr', flag: '🇫🇷' },
  { code: 'en', flag: '🇬🇧' },
  { code: 'ar', flag: '🇸🇦' },
  { code: 'ro', flag: '🇷🇴' },
  { code: 'it', flag: '🇮🇹' },
  { code: 'pt', flag: '🇵🇹' },
  { code: 'es', flag: '🇪🇸' },
  { code: 'de', flag: '🇩🇪' },
];

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const isRTL = i18n.language === 'ar';

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.closest('[data-lang-switcher]')?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const change = (code: string) => {
    i18n.changeLanguage(code);
    document.documentElement.dir  = code === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
    setOpen(false);
  };

  return (
    // data-lang-switcher isolates click detection; dir=ltr keeps internal layout stable
    <div className="relative" data-lang-switcher dir="ltr">
      <button
        ref={btnRef}
        onClick={() => setOpen(o => !o)}
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

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown — always anchored right in ltr context, never overflows */}
          <div
            dir="ltr"
            className="absolute z-50 bg-white rounded-3xl overflow-hidden w-52 animate-scale-in"
            style={{
              top: '2.75rem',
              right: 0,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid #f1f5f9',
              // Prevent going off-screen on the left on small viewports
              maxWidth: 'calc(100vw - 1rem)',
            }}
          >
            <p className="px-4 pt-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {t('profile.language')}
            </p>

            <div className="pb-2">
              {LANGS.map(({ code, flag }) => {
                const active = i18n.language === code;
                return (
                  <button
                    key={code}
                    onClick={() => change(code)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left',
                      active ? 'bg-primary/5' : 'hover:bg-slate-50 active:bg-slate-100'
                    )}
                  >
                    <span className="text-xl leading-none">{flag}</span>
                    <span className={cn('flex-1 text-sm font-medium', active ? 'text-primary' : 'text-slate-700')}>
                      {t(`lang.${code}`)}
                    </span>
                    {active && (
                      <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Check size={11} className="text-white" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
