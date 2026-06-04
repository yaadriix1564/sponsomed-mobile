import { useState } from 'react';
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
  const current = LANGS.find(l => l.code === i18n.language) ?? LANGS[0];

  const change = (code: string) => {
    i18n.changeLanguage(code);
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-1.5 rounded-2xl transition-all active:scale-90',
          compact
            ? 'w-9 h-9 justify-center hover:bg-slate-100'
            : 'px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700'
        )}
      >
        <Globe size={16} className="text-slate-500" />
        {!compact && <span className="text-xs font-semibold uppercase">{i18n.language}</span>}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 bg-white rounded-3xl shadow-card-hover border border-slate-100 overflow-hidden w-48 animate-scale-in">
            <p className="px-4 pt-3 pb-1 label">{t('profile.language')}</p>
            {LANGS.map(({ code, flag }) => (
              <button
                key={code}
                onClick={() => change(code)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                <span className="text-lg">{flag}</span>
                <span className="flex-1 text-sm font-medium text-slate-700 text-left">{t(`lang.${code}`)}</span>
                {i18n.language === code && <Check size={14} className="text-primary" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
