import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, MessageSquare, LayoutDashboard, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function BottomNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user || ['/auth', '/kyc'].includes(pathname)) return null;

  const tabs = [
    { path: '/',           icon: Home,            label: t('nav.home', 'Accueil') },
    { path: '/offers',     icon: Search,          label: t('nav.offers') },
    { path: '/messages',   icon: MessageSquare,   label: t('nav.messages'), badge: 0 },
    { path: '/dashboard',  icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/profile',    icon: User,            label: t('nav.profile') },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16 max-w-screen-sm mx-auto px-2">
        {tabs.map(({ path, icon: Icon, label, badge }) => {
          const active = pathname === path;
          return (
            <button key={path} onClick={() => navigate(path)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-2xl transition-all active:scale-90',
                active ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                {badge != null && badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-0.5">
                    {badge}
                  </span>
                )}
              </div>
              <span className={cn('text-[10px] font-semibold leading-none', active ? 'text-primary' : '')}>{label}</span>
              {active && <div className="w-1 h-1 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
