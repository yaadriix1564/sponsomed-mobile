import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import LanguageSwitcher from './LanguageSwitcher';

// URL publique du logo dans Supabase Storage (bucket public du projet)
// ⚠️ Remplace cette URL par celle de ton bucket Supabase : Storage > public > logo.png
const SUPABASE_LOGO = 'https://sponsomed.com/favicon.png';

export default function TopBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const TITLES: Record<string, string> = {
    '/': '',
    '/offers': t('nav.offers'),
    '/messages': t('nav.messages'),
    '/dashboard': t('nav.dashboard'),
    '/profile': t('nav.profile'),
  };

  const isRoot = ['/', '/offers', '/messages', '/dashboard', '/profile'].includes(pathname);
  const title  = TITLES[pathname] ?? t('app.name');

  if (pathname === '/auth' || pathname === '/kyc') return null;

  return (
    <header
      className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center h-14 px-4 gap-3">

        {/* Bouton retour OU logo */}
        {!isRoot ? (
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-2xl hover:bg-slate-100 active:scale-90 transition-all"
          >
            <ArrowLeft size={20} className="text-slate-700" />
          </button>
        ) : (
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 active:opacity-70 transition-opacity"
          >
            <img
              src={SUPABASE_LOGO}
              alt="SponsoMed"
              className="h-8 w-8 rounded-xl object-cover"
              onError={e => {
                const img = e.currentTarget as HTMLImageElement;
                img.style.display = 'none';
                const fb = document.getElementById('logo-fallback');
                if (fb) fb.style.display = 'flex';
              }}
            />
            <div
              id="logo-fallback"
              className="h-8 w-8 rounded-xl bg-primary items-center justify-center"
              style={{ display: 'none' }}
            >
              <span className="text-white text-xs font-bold">S</span>
            </div>
            {pathname === '/' && (
              <span className="font-display font-extrabold text-lg text-slate-900 tracking-tight">
                Sponso<span className="text-primary">Med</span>
              </span>
            )}
          </button>
        )}

        {/* Titre page */}
        {title ? (
          <span className={cn('font-display font-bold text-slate-900 flex-1', !isRoot ? 'text-base' : 'text-lg')}>
            {title}
          </span>
        ) : (
          <span className="flex-1" />
        )}

        <LanguageSwitcher compact />

        {user && isRoot && (
          <button className="w-9 h-9 flex items-center justify-center rounded-2xl hover:bg-slate-100 active:scale-90 transition-all relative">
            <Bell size={20} className="text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        )}
      </div>
    </header>
  );
}
