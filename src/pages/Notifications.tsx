import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Bell, CheckCheck, Trash2, Info, AlertTriangle, CheckCircle, MessageSquare, FileText, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Notif {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  link?: string;
}

const TYPE_CFG: Record<string, { color: string; bg: string; Icon: any }> = {
  info:     { color: '#1d4ed8', bg: '#eff6ff', Icon: Info },
  success:  { color: '#059669', bg: '#f0fdf4', Icon: CheckCircle },
  warning:  { color: '#d97706', bg: '#fffbeb', Icon: AlertTriangle },
  message:  { color: '#7c3aed', bg: '#f5f3ff', Icon: MessageSquare },
  kyc:      { color: '#0891b2', bg: '#ecfeff', Icon: FileText },
  payment:  { color: '#059669', bg: '#f0fdf4', Icon: DollarSign },
  default:  { color: '#64748b', bg: '#f8fafc', Icon: Bell },
};

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60)    return 'À l\'instant';
  if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return `Il y a ${Math.floor(diff / 86400)} j`;
}

export default function Notifications() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }
    fetchNotifs();

    // Realtime
    const channel = supabase
      .channel('notifs-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, payload => {
        setNotifs(prev => [payload.new as Notif, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, authLoading]);

  const fetchNotifs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifs(data ?? []);
    setLoading(false);
  };

  const markAllRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user!.id)
      .eq('is_read', false);
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const deleteNotif = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const unread = notifs.filter(n => !n.is_read).length;

  if (authLoading || loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #1d4ed8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a8a 60%,#1d4ed8 100%)', paddingTop: 'env(safe-area-inset-top,0px)', flexShrink: 0 }}>
        <div style={{ padding: '16px 16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 4px' }}>Centre de</p>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={20} /> Notifications
              {unread > 0 && (
                <span style={{ fontSize: 12, fontWeight: 700, background: '#ef4444', color: 'white', borderRadius: 20, padding: '2px 8px' }}>
                  {unread}
                </span>
              )}
            </h1>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 12, padding: '8px 14px', cursor: 'pointer', color: 'white', fontSize: 12, fontWeight: 700 }}>
              <CheckCheck size={14} /> Tout lire
            </button>
          )}
        </div>
      </div>

      {/* Liste */}
      <div style={{ flex: 1, padding: '16px 16px 40px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {notifs.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 24, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Bell size={32} color="#94a3b8" />
            </div>
            <p style={{ fontWeight: 700, fontSize: 17, color: '#0f172a', margin: '0 0 6px' }}>Aucune notification</p>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Vous êtes à jour ✓</p>
          </div>
        ) : notifs.map(n => {
          const cfg = TYPE_CFG[n.type] ?? TYPE_CFG.default;
          const Icon = cfg.Icon;
          return (
            <div key={n.id}
              onClick={() => { markRead(n.id); if (n.link) navigate(n.link); }}
              style={{ background: n.is_read ? 'white' : cfg.bg, border: `1.5px solid ${n.is_read ? '#e2e8f0' : cfg.color + '33'}`, borderRadius: 18, padding: '14px 16px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start', position: 'relative', transition: 'transform 0.15s', boxShadow: n.is_read ? 'none' : '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              {/* Icône */}
              <div style={{ width: 40, height: 40, borderRadius: 14, background: cfg.bg, border: `1.5px solid ${cfg.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={cfg.color} />
              </div>

              {/* Contenu */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <p style={{ fontWeight: n.is_read ? 600 : 800, fontSize: 14, color: '#0f172a', margin: 0, flex: 1 }}>{n.title}</p>
                  {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />}
                </div>
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 6px', lineHeight: 1.4 }}>{n.message}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, fontWeight: 500 }}>{timeAgo(n.created_at)}</p>
              </div>

              {/* Supprimer */}
              <button onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
                style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8, opacity: 0.4 }}>
                <Trash2 size={14} color="#64748b" />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
