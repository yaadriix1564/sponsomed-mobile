import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Stethoscope, Clock, Euro, Building2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase.from('offers').select('*').eq('id', id).single()
      .then(({ data }) => { setOffer(data); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="page px-4 py-6 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-20 animate-pulse bg-slate-100" />)}
    </div>
  );
  if (!offer) return (
    <div className="page flex flex-col items-center justify-center py-20">
      <p className="text-slate-500">Offre introuvable</p>
    </div>
  );

  return (
    <div className="page px-4 py-5 space-y-4 pb-24">
      {/* Hero card */}
      <div className="bg-gradient-to-br from-primary to-accent rounded-3xl p-5 text-white">
        <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">{offer.specialty}</span>
        <h1 className="font-display font-extrabold text-xl mt-1 leading-tight">{offer.title}</h1>
        <p className="text-white/80 text-sm mt-1">{offer.center_name}</p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-white/60 text-xs">Financement</p>
            <p className="font-display font-extrabold text-3xl">{offer.amount?.toLocaleString('fr-FR')} €</p>
          </div>
          <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-xl">{offer.duration_years} ans</span>
        </div>
      </div>

      {/* Info chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { icon: MapPin,      val: offer.location },
          { icon: Stethoscope, val: offer.specialty },
          { icon: Clock,       val: `${offer.duration_years} ans d'engagement` },
          { icon: Building2,   val: offer.center_name },
        ].map(({ icon: Icon, val }) => val && (
          <span key={val} className="flex items-center gap-1.5 text-xs text-slate-700 bg-white border border-slate-100 px-3 py-2 rounded-2xl shadow-sm">
            <Icon size={13} className="text-primary" />{val}
          </span>
        ))}
      </div>

      {/* Description */}
      {offer.description && (
        <div className="card p-4">
          <p className="label mb-2">Description</p>
          <p className="text-sm text-slate-700 leading-relaxed">{offer.description}</p>
        </div>
      )}

      {/* Conditions */}
      <div className="card p-4 space-y-2">
        <p className="label mb-1">Conditions</p>
        {[
          'Étudiant en médecine, dentaire ou paramédical',
          'Engagement post-diplôme dans le centre',
          'Paiement sécurisé via Stripe Escrow',
          '100% gratuit pour les étudiants',
        ].map(c => (
          <div key={c} className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-sm text-slate-700">{c}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-100" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        {user ? (
          <button className="btn-primary w-full text-center">Postuler à cette offre</button>
        ) : (
          <button onClick={() => navigate('/auth')} className="btn-primary w-full text-center">Se connecter pour postuler</button>
        )}
      </div>
    </div>
  );
}
