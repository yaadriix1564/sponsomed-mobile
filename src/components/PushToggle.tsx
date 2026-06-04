import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function PushToggle() {
  const { enabled, loading, enable, disable } = usePushNotifications();
  if (!('Notification' in window)) return null;
  return (
    <button
      onClick={enabled ? disable : enable}
      disabled={loading}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderRadius: 18, border: '1.5px solid',
        borderColor: enabled ? '#bbf7d0' : '#e2e8f0',
        background: enabled ? '#f0fdf4' : '#f8fafc',
        cursor: loading ? 'wait' : 'pointer', transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: enabled ? '#dcfce7' : '#f1f5f9' }}>
          {enabled ? <Bell size={20} color="#059669" /> : <BellOff size={20} color="#94a3b8" />}
        </div>
        <div style={{ textAlign: 'left' }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', margin: 0 }}>Notifications push</p>
          <p style={{ fontSize: 12, color: enabled ? '#059669' : '#94a3b8', margin: 0 }}>
            {loading ? 'Chargement…' : enabled ? 'Activées ✓' : 'Désactivées'}
          </p>
        </div>
      </div>
      <div style={{ width: 44, height: 26, borderRadius: 13, background: enabled ? '#059669' : '#cbd5e1', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 3, left: enabled ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
      </div>
    </button>
  );
}
