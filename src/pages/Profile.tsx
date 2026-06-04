import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, Shield, Bell, ChevronRight, User } from 'lucide-react';

const MENU = [
  { icon: Settings, label: 'Paramètres du compte', sub: 'Modifier vos informations' },
  { icon: Bell,     label: 'Notifications',         sub: 'Gérer les alertes' },
  { icon: Shield,   label: 'Confidentialité',        sub: 'Données et sécurité' },
];

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  return (
    <div className="page px-4 py-5 space-y-5">
      {/* Avatar */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
          <span className="font-display font-extrabold text-white text-2xl">
            {(user?.email?.[0] ?? 'U').toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-display font-bold text-slate-900 text-lg">{user?.email?.split('@')[0]}</p>
          <p className="text-sm text-slate-500 mt-0.5">{user?.email}</p>
          <span className="badge bg-primary/10 text-primary mt-1 inline-block">Étudiant</span>
        </div>
      </div>

      {/* Menu */}
      <div className="card divide-y divide-slate-50">
        {MENU.map(({ icon: Icon, label, sub }) => (
          <button key={label} className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 transition-colors">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Icon size={17} className="text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-slate-900 text-sm">{label}</p>
              <p className="text-xs text-slate-400">{sub}</p>
            </div>
            <ChevronRight size={16} className="text-slate-300" />
          </button>
        ))}
      </div>

      {/* Sign out */}
      <button onClick={handleSignOut} className="card w-full flex items-center gap-3 px-4 py-4 text-red-500 active:bg-red-50 transition-colors">
        <div className="w-9 h-9 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
          <LogOut size={17} className="text-red-500" />
        </div>
        <span className="font-semibold text-sm">Se déconnecter</span>
      </button>
    </div>
  );
}
