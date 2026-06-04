import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Search, Shield, ChevronRight, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import OfferCard from '@/components/OfferCard';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, avg: 0, centers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error: e } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      if (e) { setError(e.message); setLoading(false); return; }
      setOffers(data ?? []);
      const total = data?.length ?? 0;
      const avg = total > 0 ? Math.round(data!.reduce((s: number, o: any) => s + (o.amount || 0), 0) / total) : 0;
      const centers = new Set(data?.map((o: any) => o.center_id ?? o.center_name)).size;
      setStats({ total, avg, centers });
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="page px-4 py-5 space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary to-accent rounded-3xl p-5 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -right-4 -bottom-6 w-20 h-20 bg-white/10 rounded-full" />
        <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Bienvenue sur</p>
        <h1 className="font-display font-extrabold text-2xl leading-tight">SponsoMed 🩺</h1>
        <p className="text-white/80 text-sm mt-1 mb-4">Financement médical sécurisé en Europe</p>
        {!user ? (
          <div className="flex gap-2">
            <button onClick={() => navigate('/auth')} className="bg-white text-primary font-bold text-sm px-4 py-2.5 rounded-2xl active:scale-95 transition-transform">Commencer</button>
            <button onClick={() => navigate('/offers')} className="bg-white/20 text-white font-semibold text-sm px-4 py-2.5 rounded-2xl active:scale-95 transition-transform">Voir les offres</button>
          </div>
        ) : (
          <button onClick={() => navigate('/dashboard')} className="bg-white text-primary font-bold text-sm px-4 py-2.5 rounded-2xl active:scale-95 transition-transform">Mon dashboard →</button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Offres', value: stats.total, icon: TrendingUp, color: 'bg-blue-50 text-blue-600' },
          { label: 'Moy.', value: stats.avg > 0 ? `${Math.round(stats.avg/1000)}k€` : '—', icon: Shield, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Centres', value: stats.centers, icon: Search, color: 'bg-violet-50 text-violet-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-3 flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${color}`}><Icon size={16} /></div>
            <p className="font-display font-bold text-slate-900 text-lg leading-none">{value}</p>
            <p className="text-[10px] text-slate-500 text-center leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="card p-4 bg-red-50 border border-red-100 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700 text-sm">Erreur de connexion</p>
            <p className="text-xs text-red-500 mt-0.5">{error}</p>
            <p className="text-xs text-red-400 mt-1">Vérifie les RLS policies dans Supabase → Table Editor → offers</p>
          </div>
        </div>
      )}

      {/* Latest offers */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Dernières offres</h2>
          <button onClick={() => navigate('/offers')} className="flex items-center gap-0.5 text-primary text-sm font-semibold">
            Voir tout <ChevronRight size={16} />
          </button>
        </div>
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="card p-4 h-32 animate-pulse bg-slate-100" />)
          ) : offers.length === 0 && !error ? (
            <div className="card p-6 text-center">
              <p className="text-slate-400 text-sm">Aucune offre disponible pour le moment</p>
              <p className="text-xs text-slate-300 mt-1">Les offres apparaîtront ici dès qu'elles seront publiées</p>
            </div>
          ) : (
            offers.map(o => <OfferCard key={o.id} offer={o} />)
          )}
        </div>
      </section>

      {/* Trust */}
      <div className="card p-4 bg-gradient-to-r from-slate-50 to-blue-50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <Shield size={20} className="text-primary" />
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-sm">100% sécurisé Stripe</p>
          <p className="text-xs text-slate-500">Paiements en escrow — argent protégé jusqu'au déblocage</p>
        </div>
      </div>
    </div>
  );
}
