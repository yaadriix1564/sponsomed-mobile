import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const TITLES: Record<string, string> = {
  '/': 'SponsoMed',
  '/offers': 'Offres',
  '/messages': 'Messages',
  '/dashboard': 'Dashboard',
  '/profile': 'Profil',
  '/auth': 'Connexion',
};

export default function TopBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isRoot = ['/', '/offers', '/messages', '/dashboard', '/profile', '/auth'].includes(pathname);
  const title = TITLES[pathname] ?? 'SponsoMed';

  return (
    <header
      className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center h-14 px-4 gap-3">
        {!isRoot && (
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-2xl hover:bg-slate-100 active:scale-90 transition-all">
            <ArrowLeft size={20} className="text-slate-700" />
          </button>
        )}
        {isRoot && pathname === '/' && (
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
        )}
        <span className={cn('font-display font-bold text-lg text-slate-900 flex-1', !isRoot && 'text-base')}>{title}</span>
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
