import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Clock, CheckCircle, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import OfferCard from '@/components/OfferCard';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('applications').select('*, offers(*)').eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setApplications(data ?? []); setLoading(false); });
  }, [user]);

  if (!user) return (
    <div className="page px-4 py-10 flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center">
        <Search size={28} className="text-primary" />
      </div>
      <p className="font-display font-bold text-slate-900 text-xl">{t('nav.dashboard')}</p>
      <p className="text-sm text-slate-500">{t('auth.subtitleLogin')}</p>
      <button onClick={() => navigate('/auth')} className="btn-primary">{t('auth.signIn')}</button>
    </div>
  );

  const total    = applications.length;
  const accepted = applications.filter(a => a.status === 'accepted').length;
  const pending  = applications.filter(a => ['pending','submitted'].includes(a.status)).length;

  return (
    <div className="page px-4 py-5 space-y-5">
      <div className="card p-4 bg-gradient-to-r from-primary/5 to-accent/5">
        <p className="text-slate-500 text-sm">{t('dashboard.greeting')},</p>
        <p className="font-display font-extrabold text-slate-900 text-xl mt-0.5">{user.email?.split('@')[0]}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t('dashboard.total'),    value: total,    icon: TrendingUp,  color: 'bg-blue-50 text-blue-600' },
          { label: t('dashboard.accepted'), value: accepted, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
          { label: t('dashboard.pending'),  value: pending,  icon: Clock,       color: 'bg-amber-50 text-amber-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-3 flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${color}`}><Icon size={16} /></div>
            <p className="font-display font-bold text-slate-900 text-lg leading-none">{value}</p>
            <p className="text-[10px] text-slate-500 text-center leading-tight">{label}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">{t('dashboard.myApplications')}</h2>
          <button onClick={() => navigate('/offers')} className="text-primary text-sm font-semibold">{t('dashboard.browse')}</button>
        </div>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-32 animate-pulse bg-slate-100 mb-3" />)
        ) : applications.length === 0 ? (
          <div className="card p-6 text-center space-y-3">
            <p className="text-slate-400 text-sm">{t('dashboard.noApplications')}</p>
            <button onClick={() => navigate('/offers')} className="btn-primary text-sm px-5 py-2.5">
              {t('dashboard.newOffers')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map(a => (
              <OfferCard key={a.id} offer={a.offers ?? a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
