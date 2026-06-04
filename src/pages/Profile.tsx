import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, Shield, Bell, ChevronRight, User, CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const ROLE_COLORS: Record<string, string> = {
  student: 'bg-blue-100 text-blue-700',
  center:  'bg-emerald-100 text-emerald-700',
  admin:   'bg-violet-100 text-violet-700',
};

const ROLE_ICONS: Record<string, string> = {
  student: '🎓',
  center:  '🏥',
  admin:   '⚙️',
};

type KycStatus = 'not_started' | 'pending' | 'verified' | 'rejected';

const KYC_CONFIG: Record<KycStatus, { label: string; color: string; bg: string; border: string; icon: any }> = {
  not_started: { label: 'KYC non commencé',    color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0', icon: FileText },
  pending:     { label: 'KYC en vérification', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: Clock },
  verified:    { label: 'KYC vérifié ✓',        color: '#059669', bg: '#f0fdf4', border: '#bbf7d0', icon: CheckCircle2 },
  rejected:    { label: 'KYC rejeté',           color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: XCircle },
};

export default function Profile() {
  const { user, role, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const displayName =
    profile?.full_name ?? profile?.name ?? profile?.display_name ??
    user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Utilisateur';

  const displayRole  = role ?? 'student';
  const roleLabel    = t(`profile.role_${displayRole}`, { defaultValue: displayRole });
  const roleColor    = ROLE_COLORS[displayRole] ?? 'bg-slate-100 text-slate-600';
  const roleIcon     = ROLE_ICONS[displayRole] ?? '👤';

  const kycStatus: KycStatus = (profile?.kyc_status as KycStatus) ?? 'not_started';
  const kycCfg   = KYC_CONFIG[kycStatus];
  const KycIcon  = kycCfg.icon;

  const MENU = [
    { icon: Settings, label: t('profile.accountSettings'), sub: 'email & mot de passe' },
    { icon: Bell,     label: t('profile.notifications'),   sub: 'push & email' },
    { icon: Shield,   label: t('profile.privacy'),         sub: 'RGPD' },
  ];

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  if (!user) return (
    <div className="page px-4 py-10 flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center">
        <User size={28} className="text-primary" />
      </div>
      <p className="font-display font-bold text-slate-900 text-xl">{t('profile.title')}</p>
      <p className="text-sm text-slate-500">{t('auth.subtitleLogin')}</p>
      <button onClick={() => navigate('/auth')} className="btn-primary">{t('auth.signIn')}</button>
    </div>
  );

  return (
    <div className="page px-4 py-5 space-y-5">

      {/* Avatar + infos */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 relative">
          <span className="font-display font-extrabold text-white text-2xl">
            {displayName[0].toUpperCase()}
          </span>
          {kycStatus === 'verified' && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white">
              <CheckCircle2 size={12} color="white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-slate-900 text-lg truncate">{displayName}</p>
          <p className="text-sm text-slate-500 mt-0.5 truncate">{user.email}</p>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl mt-1.5 ${roleColor}`}>
            {roleIcon} {roleLabel}
          </span>
        </div>
      </div>

      {/* KYC Banner */}
      <button
        onClick={() => navigate('/kyc')}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          background: kycCfg.bg, border: `1.5px solid ${kycCfg.border}`,
          borderRadius: 20, padding: '16px 18px', cursor: 'pointer',
        }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <KycIcon size={22} color={kycCfg.color} />
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', margin: '0 0 2px' }}>Vérification d'identité (KYC)</p>
          <p style={{ fontSize: 12, color: kycCfg.color, fontWeight: 600, margin: 0 }}>{kycCfg.label}</p>
        </div>
        <ChevronRight size={18} color={kycCfg.color} />
      </button>

      {/* Infos profil */}
      {profile && (profile.specialty || profile.country || profile.university || profile.clinic_name) && (
        <div className="card p-4 space-y-2">
          {profile.specialty   && <div className="flex justify-between text-sm"><span className="text-slate-400">Spécialité</span><span className="font-medium text-slate-800">{profile.specialty}</span></div>}
          {profile.country     && <div className="flex justify-between text-sm"><span className="text-slate-400">Pays</span><span className="font-medium text-slate-800">{profile.country}</span></div>}
          {profile.university  && <div className="flex justify-between text-sm"><span className="text-slate-400">Université</span><span className="font-medium text-slate-800">{profile.university}</span></div>}
          {profile.clinic_name && <div className="flex justify-between text-sm"><span className="text-slate-400">Centre</span><span className="font-medium text-slate-800">{profile.clinic_name}</span></div>}
        </div>
      )}

      {/* Langue */}
      <div className="card p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-900 text-sm">{t('profile.language')}</p>
          <p className="text-xs text-slate-400">EN · FR · RO · IT · PT · AR · ES · DE</p>
        </div>
        <LanguageSwitcher />
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

      {/* Déconnexion */}
      <button onClick={handleSignOut}
        className="card w-full flex items-center gap-3 px-4 py-4 text-red-500 active:bg-red-50 transition-colors">
        <div className="w-9 h-9 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
          <LogOut size={17} className="text-red-500" />
        </div>
        <span className="font-semibold text-sm">{t('profile.logout')}</span>
      </button>
    </div>
  );
}
