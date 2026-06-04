import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, MessageSquare, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const TABS_PUBLIC = [
  { icon: Home,   label: 'Accueil', path: '/' },
  { icon: Search, label: 'Offres',  path: '/offers' },
];
const TABS_AUTH = [
  { icon: Home,            label: 'Accueil',   path: '/' },
  { icon: Search,          label: 'Offres',    path: '/offers' },
  { icon: MessageSquare,   label: 'Messages',  path: '/messages' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: User,            label: 'Profil',    path: '/profile' },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  if (pathname === '/auth') return null;
  const tabs = user ? TABS_AUTH : TABS_PUBLIC;
  const isActive = (p: string) => p === '/' ? pathname === '/' : pathname.startsWith(p);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-bottom"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex" style={{ height: '64px' }}>
        {tabs.map(({ icon: Icon, label, path }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90',
                active ? 'text-primary' : 'text-slate-400'
              )}
            >
              <span className={cn('flex items-center justify-center w-10 h-7 rounded-2xl transition-all', active && 'bg-primary/10')}>
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              </span>
              <span className={cn('text-[10px] font-semibold tracking-wide', active ? 'text-primary' : 'text-slate-400')}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
