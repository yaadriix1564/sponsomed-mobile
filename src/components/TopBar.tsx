import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import LanguageSwitcher from './LanguageSwitcher';

export default function TopBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const TITLES: Record<string, string> = {
    '/': t('app.name'),
    '/offers': t('nav.offers'),
    '/messages': t('nav.messages'),
    '/dashboard': t('nav.dashboard'),
    '/profile': t('nav.profile'),
    '/auth': '',
  };

  const isRoot = ['/', '/offers', '/messages', '/dashboard', '/profile', '/auth'].includes(pathname);
  const title = TITLES[pathname] ?? t('app.name');
  const isAuth = pathname === '/auth';

  if (isAuth) return null;

  return (
    <header
      className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center h-14 px-4 gap-3">
        {!isRoot ? (
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-2xl hover:bg-slate-100 active:scale-90 transition-all">
            <ArrowLeft size={20} className="text-slate-700" />
          </button>
        ) : pathname === '/' ? (
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
        ) : null}
        <span className={cn('font-display font-bold text-lg text-slate-900 flex-1', !isRoot && 'text-base')}>{title}</span>
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
