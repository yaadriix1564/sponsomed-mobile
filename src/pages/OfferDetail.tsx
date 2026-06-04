import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Euro, Clock, Stethoscope, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('offers').select('*').eq('id', id).single()
      .then(({ data, error: e }) => {
        if (e) setError(e.message);
        setOffer(data);
        setLoading(false);
      });
  }, [id]);

  const apply = async () => {
    if (!user) { navigate('/auth'); return; }
    setApplying(true);
    const { error: e } = await supabase.from('applications').insert({ student_id: user.id, offer_id: id, status: 'pending' });
    if (e) setError(e.message);
    else setDone(true);
    setApplying(false);
  };

  if (loading) return <div className="page px-4 py-5 space-y-4">{Array.from({length:4}).map((_,i)=><div key={i} className="card h-24 animate-pulse bg-slate-100" />)}</div>;
  if (!offer)  return <div className="page px-4 py-10 text-center"><p className="text-slate-400">{t('offer.notFound')}</p></div>;

  return (
    <div className="page px-4 py-5 space-y-4">
      <div className="card p-5 space-y-2">
        <h1 className="font-display font-extrabold text-slate-900 text-xl">{offer.title}</h1>
        <p className="text-sm text-slate-500">{offer.center_name ?? offer.clinic_name}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {offer.location  && <span className="flex items-center gap-1 text-xs bg-slate-50 px-2.5 py-1.5 rounded-xl text-slate-600"><MapPin size={12} className="text-primary" />{offer.location}</span>}
          {offer.specialty && <span className="flex items-center gap-1 text-xs bg-slate-50 px-2.5 py-1.5 rounded-xl text-slate-600"><Stethoscope size={12} className="text-accent" />{offer.specialty}</span>}
          {offer.duration_years && <span className="flex items-center gap-1 text-xs bg-slate-50 px-2.5 py-1.5 rounded-xl text-slate-600"><Clock size={12} />{offer.duration_years} {t('offer.years')}</span>}
        </div>
      </div>

      {offer.amount && (
        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="label">{t('offer.amount')}</p>
            <p className="font-display font-extrabold text-primary text-2xl">{offer.amount.toLocaleString('fr-FR')} €</p>
          </div>
          <div className="w-12 h-12 rounded-3xl bg-primary flex items-center justify-center">
            <Euro size={22} className="text-white" />
          </div>
        </div>
      )}

      {offer.description && (
        <div className="card p-4 space-y-1">
          <p className="label">{t('offer.description')}</p>
          <p className="text-sm text-slate-700 leading-relaxed">{offer.description}</p>
        </div>
      )}

      {offer.conditions && (
        <div className="card p-4 space-y-1">
          <p className="label">{t('offer.conditions')}</p>
          <p className="text-sm text-slate-700 leading-relaxed">{offer.conditions}</p>
        </div>
      )}

      {error && (
        <div className="card p-3 bg-red-50 border border-red-100 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-500" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {done ? (
        <div className="card p-4 bg-emerald-50 border border-emerald-100 text-center">
          <p className="font-semibold text-emerald-700">✅ {t('offer.apply')} !</p>
        </div>
      ) : (
        <button onClick={apply} disabled={applying} className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50">
          {applying
            ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : user ? t('offer.apply') : t('offer.loginApply')
          }
        </button>
      )}
    </div>
  );
}
