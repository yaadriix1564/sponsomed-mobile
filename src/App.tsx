import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/lib/supabase';
import './i18n';

const Home          = lazy(() => import('@/pages/Home'));
const Offers        = lazy(() => import('@/pages/Offers'));
const OfferDetail   = lazy(() => import('@/pages/OfferDetail'));
const Messages      = lazy(() => import('@/pages/Messages'));
const Dashboard     = lazy(() => import('@/pages/Dashboard'));
const Profile       = lazy(() => import('@/pages/Profile'));
const Auth          = lazy(() => import('@/pages/Auth'));
const KYC           = lazy(() => import('@/pages/KYC'));
const Notifications = lazy(() => import('@/pages/Notifications'));

function AppShell() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    document.documentElement.dir  = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Badge notifications en temps réel
  useEffect(() => {
    if (!user) { setUnread(0); return; }
    const fetch = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setUnread(count ?? 0);
    };
    fetch();
    const ch = supabase.channel('app-notifs-badge')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  return (
    <div className="app-container">
      <TopBar unreadCount={unread} />
      <main className="main-content">
        <Suspense fallback={
          <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #1d4ed8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        }>
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/offers"      element={<Offers />} />
            <Route path="/offers/:id" element={<OfferDetail />} />
            <Route path="/messages"   element={user ? <Messages />   : <Navigate to="/auth" />} />
            <Route path="/dashboard"  element={user ? <Dashboard />  : <Navigate to="/auth" />} />
            <Route path="/profile"    element={user ? <Profile />    : <Navigate to="/auth" />} />
            <Route path="/kyc"        element={user ? <KYC />        : <Navigate to="/auth" />} />
            <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/auth" />} />
            <Route path="/auth"       element={<Auth />} />
            <Route path="*"           element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </main>
      {<BottomNav unreadCount={unread} />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
