import { useEffect, useState } from 'react';
import { MessageSquare, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function Messages() {
  const { user } = useAuth();
  const [convs, setConvs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('messages')
      .select('*, sender:sender_id(id, email), receiver:receiver_id(id, email)')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => { setConvs(data ?? []); setLoading(false); });
  }, [user]);

  return (
    <div className="page">
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Rechercher…" />
        </div>
      </div>
      <div className="divide-y divide-slate-50">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="w-11 h-11 rounded-full bg-slate-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-slate-100 rounded-xl animate-pulse w-1/2" />
                <div className="h-3 bg-slate-100 rounded-xl animate-pulse w-3/4" />
              </div>
            </div>
          ))
        ) : convs.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center px-8">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare size={28} className="text-primary" />
            </div>
            <p className="font-display font-bold text-slate-700">Aucun message</p>
            <p className="text-sm text-slate-400 mt-1">Commencez par postuler à une offre !</p>
          </div>
        ) : (
          convs.map((m) => {
            const other = m.sender?.id === user?.id ? m.receiver : m.sender;
            return (
              <div key={m.id} className={cn('flex items-center gap-3 px-4 py-3 active:bg-slate-50 cursor-pointer')}>
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-bold text-primary text-sm">{(other?.email?.[0] ?? '?').toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 text-sm truncate">{other?.email ?? 'Inconnu'}</p>
                    <p className="text-[10px] text-slate-400 shrink-0 ml-2">{new Date(m.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</p>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{m.content ?? '…'}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
