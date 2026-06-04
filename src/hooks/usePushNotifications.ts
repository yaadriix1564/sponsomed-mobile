import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { registerPush, unregisterPush, isPushEnabled } from '@/lib/webpush';
import { useNavigate } from 'react-router-dom';

export function usePushNotifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { isPushEnabled().then(setEnabled); }, [user]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'NAVIGATE') navigate(e.data.link);
    };
    navigator.serviceWorker?.addEventListener('message', handler);
    return () => navigator.serviceWorker?.removeEventListener('message', handler);
  }, [navigate]);

  const enable = async () => {
    if (!user) return;
    setLoading(true);
    const ok = await registerPush(user.id);
    setEnabled(ok);
    setLoading(false);
  };

  const disable = async () => {
    if (!user) return;
    setLoading(true);
    await unregisterPush(user.id);
    setEnabled(false);
    setLoading(false);
  };

  return { enabled, loading, enable, disable };
}
