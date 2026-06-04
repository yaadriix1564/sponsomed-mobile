import { useEffect, useState } from 'react';
import { Search, X, AlertCircle, MapPin, Clock, Euro, Filter, ArrowUpDown, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const SPECIALTIES = [
  'medicine', 'dental', 'pharmacy', 'physiotherapy', 'nursing', 'other'
];

const COUNTRIES = [
  { code: 'FR', flag: '\ud83c\udde8\ud83c\uddf7', label: 'France' },
  { code: 'DE', flag: '\ud83c\udde9\ud83c\uddea', label: 'Deutschland' },
  { code: 'RO', flag: '\ud83c\uddf7\ud83c\uddf4', label: 'Rom\u00e2nia' },
  { code: 'IT', flag: '\ud83c\uddee\ud83c\uddf9', label: 'Italia' },
  { code: 'PT', flag: '\ud83c\uddf5\ud83c\uddf9', label: 'Portugal' },
  { code: 'ES', flag: '\ud83c\uddea\ud83c\uddf8', label: 'Espa\u00f1a' },
];

export default function Offers() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [offers, setOffers]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [specialty, setSpecialty] = useState('all');
  const [country, setCountry]     = useState('all');
  const [sortBy, setSortBy]       = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchOffers(); }, [specialty, country]);

  const fetchOffers = async () => {
    setLoading(true); setError('');
    let q = supabase
      .from('offers')
      .select('*, centers(anonymous_id, city, country, verification_status)')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    if (specialty !== 'all') q = q.eq('specialty', specialty);
    if (country   !== 'all') q = q.eq('country', country);
    const { data, error: e } = await q;
    if (e) setError(e.message);
    setOffers(data ?? []);
    setLoading(false);
  };

  const filtered = offers
    .filter(o => {
      if (!search) return true;
      const s = search.toLowerCase();
      return [o.title, o.description, o.city, o.country, o.specialty]
        .some(v => v?.toLowerCase().includes(s));
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount_desc': return b.funding_amount - a.funding_amount;
        case 'amount_asc':  return a.funding_amount - b.funding_amount;
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:       return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  return (
    <div className="page">

      {/* Barre recherche */}
      <div className="sticky top-14 z-30 bg-surface/95 backdrop-blur-md px-4 pt-3 pb-2 border-b border-slate-100">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9 pr-9"
              placeholder={t('offers.placeholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={16} className="text-slate-400" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors ${
              showFilters ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <Filter size={16} />
          </button>
        </div>

        {/* Filtres dépliables */}
        {showFilters && (
          <div className="mt-3 space-y-3 pb-1">
            {/* Spécialité */}
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1.5">{t('offers.allSpecialties')}</p>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                <Chip active={specialty === 'all'} onClick={() => setSpecialty('all')}>{t('offers.allSpecialties')}</Chip>
                {SPECIALTIES.map(s => (
                  <Chip key={s} active={specialty === s} onClick={() => setSpecialty(s)}>
                    {t(`offers.specialties.${s}`)}
                  </Chip>
                ))}
              </div>
            </div>
            {/* Pays */}
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1.5">{t('offers.allCountries')}</p>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                <Chip active={country === 'all'} onClick={() => setCountry('all')}>{t('offers.allCountries')}</Chip>
                {COUNTRIES.map(c => (
                  <Chip key={c.code} active={country === c.code} onClick={() => setCountry(c.code)}>
                    {c.flag} {c.label}
                  </Chip>
                ))}
              </div>
            </div>
            {/* Tri */}
            <div className="flex items-center gap-2">
              <ArrowUpDown size={14} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-sm border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-700 flex-1"
              >
                <option value="newest">{t('offers.sortNewest', 'Plus récentes')}</option>
                <option value="oldest">{t('offers.sortOldest', 'Plus anciennes')}</option>
                <option value="amount_desc">{t('offers.sortAmountDesc', 'Montant ↓')}</option>
                <option value="amount_asc">{t('offers.sortAmountAsc', 'Montant ↑')}</option>
              </select>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-400 mt-2">
          {filtered.length} {t('offers.results', 'résultat(s)')}
        </p>
      </div>

      {/* Liste */}
      <div className="px-4 py-4 space-y-3">
        {error && (
          <div className="card p-4 bg-amber-50 border border-amber-100 flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-700 text-sm">{t('offers.loadError')}</p>
              <p className="text-xs text-amber-400 mt-1">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card h-44 animate-pulse bg-slate-100" />
          ))
        ) : filtered.length === 0 && !error ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
              <Search size={28} className="text-slate-300" />
            </div>
            <p className="font-display font-bold text-slate-700">{t('offers.none')}</p>
            <p className="text-sm text-slate-400 mt-1">{t('offers.hint')}</p>
          </div>
        ) : (
          filtered.map(o => (
            <button
              key={o.id}
              onClick={() => user ? navigate(`/offers/${o.id}`) : navigate('/auth')}
              className="card w-full text-left p-4 space-y-3 active:scale-[0.98] transition-transform"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-slate-900 text-base leading-tight line-clamp-2">
                    {o.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {o.centers?.anonymous_id || 'Centre anonyme'}
                    {o.centers?.verification_status === 'verified' && (
                      <span className="inline-flex items-center gap-1 ml-1.5 text-primary">
                        <CheckCircle size={11} /> Vérifié
                      </span>
                    )}
                  </p>
                </div>
                <div className="shrink-0 bg-primary/10 rounded-xl px-2.5 py-1 text-right">
                  <p className="text-sm font-extrabold text-primary">
                    {(o.funding_amount ?? 0).toLocaleString()} {o.currency ?? '\u20ac'}
                  </p>
                </div>
              </div>

              {/* Description */}
              {o.description && (
                <p className="text-sm text-slate-500 line-clamp-2">{o.description}</p>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                {o.specialty && (
                  <span className="text-xs font-semibold bg-primary/10 text-primary rounded-lg px-2 py-0.5">
                    {t(`offers.specialties.${o.specialty}`, o.specialty)}
                  </span>
                )}
                {o.funding_type && (
                  <span className="text-xs font-semibold bg-slate-100 text-slate-600 rounded-lg px-2 py-0.5">
                    {o.funding_type}
                  </span>
                )}
              </div>

              {/* Méta */}
              <div className="flex items-center gap-4 text-xs text-slate-400">
                {(o.city || o.country) && (
                  <span className="flex items-center gap-1">
                    <MapPin size={11} /> {[o.city, o.country].filter(Boolean).join(', ')}
                  </span>
                )}
                {o.commitment_years && (
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {o.commitment_years} {t('offers.years', 'ans')}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? 'bg-primary text-white border-primary'
          : 'bg-white text-slate-600 border-slate-200'
      }`}
    >
      {children}
    </button>
  );
}
