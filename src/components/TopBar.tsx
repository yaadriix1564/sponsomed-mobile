import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import LanguageSwitcher from './LanguageSwitcher';

const LOGO_URL = 'https://sponsomed.com/favicon.png';

export default function TopBar({ unreadCount = 0 }: { unreadCount?: number }) {
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
    '/notifications': 'Notifications',
  };

  const isRoot = ['/', '/offers', '/messages', '/dashboard', '/profile'].includes(pathname);
  const title = TITLES[pathname] ?? t('app.name');

  if (pathname === '/auth' || pathname === '/kyc') return null;

  return (
    <header
      className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center h-14 px-4 gap-3">
        {!isRoot ? (
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-2xl hover:bg-slate-100 active:scale-90 transition-all">
            <ArrowLeft size={20} className="text-slate-700" />
          </button>
        ) : (
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 active:opacity-70 transition-opacity">
            <img src={LOGO_URL} alt="SponsoMed" className="h-8 w-8 rounded-xl object-cover"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
            {pathname === '/' && (
              <span className="font-display font-extrabold text-lg text-slate-900 tracking-tight">
                Sponso<span className="text-primary">Med</span>
              </span>
            )}
          </button>
        )}

        {title ? (
          <span className={cn('font-display font-bold text-slate-900 flex-1', !isRoot ? 'text-base' : 'text-lg')}>{title}</span>
        ) : <span className="flex-1" />}

        <LanguageSwitcher compact />

        {user && isRoot && (
          <button onClick={() => navigate('/notifications')}
            className="w-9 h-9 flex items-center justify-center rounded-2xl hover:bg-slate-100 active:scale-90 transition-all relative">
            <Bell size={20} className="text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
