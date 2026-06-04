import { MapPin, Euro, Clock, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Offer {
  id: string;
  title: string;
  location: string;
  specialty: string;
  amount: number;
  duration_years: number;
  center_name: string;
  status: string;
}

export default function OfferCard({ offer, className }: { offer: Offer; className?: string }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/offers/${offer.id}`)}
      className={cn('card p-4 space-y-3 active:scale-[0.98] transition-transform cursor-pointer', className)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-slate-900 text-base leading-tight truncate">{offer.title}</p>
          <p className="text-sm text-slate-500 mt-0.5 truncate">{offer.center_name}</p>
        </div>
        <span className={cn('badge shrink-0', offer.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
          {offer.status === 'active' ? 'Actif' : offer.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl">
          <MapPin size={12} className="text-primary" />{offer.location}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl">
          <Stethoscope size={12} className="text-accent" />{offer.specialty}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl">
          <Clock size={12} className="text-slate-400" />{offer.duration_years} ans
        </span>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="label">Montant</p>
          <p className="font-display font-bold text-primary text-lg">{offer.amount.toLocaleString('fr-FR')} €</p>
        </div>
        <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center">
          <Euro size={16} className="text-white" />
        </div>
      </div>
    </div>
  );
}
