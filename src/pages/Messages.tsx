import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
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

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase.from('messages').select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setMessages(data ?? []); setLoading(false); });
  }, [user]);

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
      <div className="px-4 py-4 space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-20 animate-pulse bg-slate-100" />)
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
              <MessageSquare size={28} className="text-slate-300" />
            </div>
            <p className="font-display font-bold text-slate-700">{t('messages.empty')}</p>
            <p className="text-sm text-slate-400 mt-1">{t('messages.hint')}</p>
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} className="card p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <MessageSquare size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{m.subject ?? m.content?.slice(0,40) ?? '—'}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{m.content}</p>
                <p className="text-[10px] text-slate-300 mt-1">{new Date(m.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
