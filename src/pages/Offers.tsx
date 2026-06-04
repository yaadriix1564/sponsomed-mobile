import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import OfferCard from '@/components/OfferCard';

export default function Offers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('offers').select('*').eq('status', 'active').order('created_at', { ascending: false })
      .then(({ data }) => { setOffers(data ?? []); setFiltered(data ?? []); setLoading(false); });
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(q ? offers.filter(o =>
      o.title?.toLowerCase().includes(q) ||
      o.location?.toLowerCase().includes(q) ||
      o.specialty?.toLowerCase().includes(q) ||
      o.center_name?.toLowerCase().includes(q)
    ) : offers);
  }, [query, offers]);

  return (
    <div className="page">
      {/* Sticky search */}
      <div className="sticky top-14 z-30 bg-surface/95 backdrop-blur-md px-4 pt-3 pb-2 border-b border-slate-100">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9 pr-9"
            placeholder="Rechercher une offre, ville, spécialité…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={16} className="text-slate-400" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-slate-500">{filtered.length} offre{filtered.length !== 1 ? 's' : ''}</p>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <SlidersHorizontal size={14} /> Filtres
          </button>
        </div>
      </div>

      {/* List */}
      <div className="px-4 py-4 space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-36 animate-pulse bg-slate-100" />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
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
