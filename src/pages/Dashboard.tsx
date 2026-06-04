import { useEffect, useState } from 'react';
import { TrendingUp, FileText, MessageSquare, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const STATUS_META: Record<string, { label: string; color: string; icon: any }> = {
  pending:  { label: 'En attente',  color: 'bg-amber-50 text-amber-700',   icon: Clock },
  accepted: { label: 'Acceptée',   color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  rejected: { label: 'Refusée',    color: 'bg-red-50 text-red-600',         icon: XCircle },
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('applications')
      .select('*, offer:offer_id(title, amount, location, specialty, center_name)')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setApps(data ?? []); setLoading(false); });
  }, [user]);

  const counts = {
    total: apps.length,
    accepted: apps.filter(a => a.status === 'accepted').length,
    pending: apps.filter(a => a.status === 'pending').length,
  };

  return (
    <div className="page px-4 py-5 space-y-5">
      {/* Welcome */}
      <div>
        <p className="text-slate-500 text-sm">Bonjour 👋</p>
        <h2 className="section-title">{user?.email?.split('@')[0]}</h2>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: counts.total, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Acceptées', value: counts.accepted, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'En attente', value: counts.pending, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="card p-3 text-center">
            <p className={`font-display font-extrabold text-2xl ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => navigate('/offers')} className="card p-4 flex flex-col items-start gap-2 active:scale-[0.97] transition-transform">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <FileText size={18} className="text-primary" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">Parcourir</p>
            <p className="text-xs text-slate-400">Nouvelles offres</p>
          </div>
        </button>
        <button onClick={() => navigate('/messages')} className="card p-4 flex flex-col items-start gap-2 active:scale-[0.97] transition-transform">
          <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
            <MessageSquare size={18} className="text-accent" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">Messages</p>
            <p className="text-xs text-slate-400">Vos échanges</p>
          </div>
        </button>
      </div>

      {/* Applications */}
      <section>
        <h3 className="section-title mb-3">Mes candidatures</h3>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-20 mb-3 animate-pulse bg-slate-100" />)
        ) : apps.length === 0 ? (
          <div className="card p-6 flex flex-col items-center gap-2 text-center">
            <TrendingUp size={28} className="text-primary/30" />
            <p className="font-semibold text-slate-600">Aucune candidature</p>
            <button onClick={() => navigate('/offers')} className="btn-primary mt-2 text-sm">Voir les offres</button>
          </div>
        ) : (
          apps.map(a => {
            const meta = STATUS_META[a.status] ?? STATUS_META['pending'];
            const Icon = meta.icon;
            return (
              <div key={a.id} className="card p-4 mb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{a.offer?.title ?? 'Offre'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{a.offer?.center_name} · {a.offer?.location}</p>
                  </div>
                  <span className={`badge ${meta.color} flex items-center gap-1 shrink-0`}>
                    <Icon size={11} />{meta.label}
                  </span>
                </div>
                {a.offer?.amount && (
                  <p className="font-display font-bold text-primary text-base mt-2">{a.offer.amount.toLocaleString('fr-FR')} €</p>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
