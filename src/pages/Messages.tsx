import { useEffect, useState } from 'react';
import { MessageSquare, RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [columns, setColumns] = useState<string[]>([]);

  const load = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true); setError('');

    // 1️⃣ On récupère TOUS les messages pour voir les colonnes disponibles
    const { data: sample, error: e1 } = await supabase
      .from('messages')
      .select('*')
      .limit(1);

    if (e1) { setError(e1.message); setLoading(false); return; }

    // Détecter les colonnes disponibles
    const cols = sample && sample.length > 0 ? Object.keys(sample[0]) : [];
    setColumns(cols);

    // 2️⃣ Construire la requête selon les colonnes existantes
    let query = supabase.from('messages').select('*').order('created_at', { ascending: false });

    const hasSender   = cols.includes('sender_id');
    const hasReceiver = cols.includes('receiver_id');
    const hasUser     = cols.includes('user_id');
    const hasFrom     = cols.includes('from_id');
    const hasTo       = cols.includes('to_id');

    if (hasSender && hasReceiver) {
      query = query.or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
    } else if (hasUser) {
      query = query.eq('user_id', user.id);
    } else if (hasFrom && hasTo) {
      query = query.or(`from_id.eq.${user.id},to_id.eq.${user.id}`);
    } else if (hasFrom) {
      query = query.eq('from_id', user.id);
    }
    // Si aucune colonne connue, on affiche tous (RLS filtrera)

    const { data, error: e2 } = await query;
    if (e2) { setError(e2.message); setLoading(false); return; }
    setMessages(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  if (!user) return (
    <div className="page px-4 py-10 flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center">
        <MessageSquare size={28} className="text-primary" />
      </div>
      <p className="font-display font-bold text-slate-900 text-xl">{t('nav.messages')}</p>
      <p className="text-sm text-slate-500">{t('auth.subtitleLogin')}</p>
      <button onClick={() => navigate('/auth')} className="btn-primary">{t('auth.signIn')}</button>
    </div>
  );

  return (
    <div className="page">
      <div className="px-4 py-4 space-y-3">

        {/* Erreur Supabase visible */}
        {error && (
          <div className="card p-4 bg-red-50 border border-red-100 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-red-700 text-sm">Erreur de chargement</p>
              <p className="text-xs text-red-500 mt-1 break-all">{error}</p>
              {columns.length > 0 && (
                <p className="text-[10px] text-slate-400 mt-1">Colonnes: {columns.join(', ')}</p>
              )}
            </div>
            <button onClick={load} className="shrink-0">
              <RefreshCw size={16} className="text-red-400" />
            </button>
          </div>
        )}

        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-20 animate-pulse bg-slate-100" />
          ))
        ) : messages.length === 0 && !error ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
              <MessageSquare size={28} className="text-slate-300" />
            </div>
            <p className="font-display font-bold text-slate-700">{t('messages.empty')}</p>
            <p className="text-sm text-slate-400 mt-1">{t('messages.hint')}</p>
            {/* Debug: colonnes détectées */}
            {columns.length > 0 && (
              <p className="text-[10px] text-slate-300 mt-3">Table OK — colonnes: {columns.join(', ')}</p>
            )}
          </div>
        ) : (
          messages.map(m => {
            // Détecter dynamiquement les champs d'affichage
            const title   = m.subject ?? m.title ?? m.objet ?? m.content?.slice(0, 50) ?? '—';
            const preview = m.body ?? m.content ?? m.message ?? m.texte ?? '';
            const date    = m.created_at ?? m.date ?? m.sent_at;
            const isUnread = m.read === false || m.lu === false || m.is_read === false;

            return (
              <div key={m.id}
                className="card p-4 flex items-start gap-3 active:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  isUnread ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                }`}>
                  <MessageSquare size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${
                      isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                    }`}>{title}</p>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  {preview && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{preview}</p>
                  )}
                  {date && (
                    <p className="text-[10px] text-slate-300 mt-1">
                      {new Date(date).toLocaleDateString()} · {new Date(date).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
