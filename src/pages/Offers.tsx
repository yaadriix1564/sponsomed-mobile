import { useEffect, useState } from 'react';
import { Search, X, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import OfferCard from '@/components/OfferCard';

export default function Offers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: e }) => {
        if (e) setError(e.message);
        setOffers(data ?? []);
        setFiltered(data ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(q ? offers.filter(o =>
      [o.title, o.location, o.specialty, o.center_name].some(v => v?.toLowerCase().includes(q))
    ) : offers);
  }, [query, offers]);

  return (
    <div className="page">
      <div className="sticky top-14 z-30 bg-surface/95 backdrop-blur-md px-4 pt-3 pb-2 border-b border-slate-100">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9 pr-9" placeholder="Ville, spécialité, centre…" value={query} onChange={e => setQuery(e.target.value)} />
          {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={16} className="text-slate-400" /></button>}
        </div>
        <p className="text-xs text-slate-400 mt-2">{filtered.length} offre{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="px-4 py-4 space-y-3">
        {error && (
          <div className="card p-4 bg-amber-50 border border-amber-100 flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-700 text-sm">Impossible de charger les offres</p>
              <p className="text-xs text-amber-500 mt-0.5">{error}</p>
              <p className="text-xs text-amber-400 mt-1">👉 Supabase → Table Editor → offers → RLS policies → ajouter SELECT pour anon</p>
            </div>
          </div>
        )}
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-36 animate-pulse bg-slate-100" />)
        ) : filtered.length === 0 && !error ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
              <Search size={28} className="text-slate-300" />
            </div>
            <p className="font-display font-bold text-slate-700">Aucune offre trouvée</p>
            <p className="text-sm text-slate-400 mt-1">Essayez d'autres mots-clés</p>
          </div>
        ) : (
          filtered.map(o => <OfferCard key={o.id} offer={o} />)
        )}
      </div>
    </div>
  );
}
