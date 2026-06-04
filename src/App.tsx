import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './contexts/AuthContext';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Offers from './pages/Offers';
import OfferDetail from './pages/OfferDetail';
import Messages from './pages/Messages';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Auth from './pages/Auth';

function AppInner() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language;
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [i18n.language]);

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <TopBar />
      <main className="flex-1 pb-20">
        <Suspense fallback={<div className="p-8 text-center text-slate-400">...</div>}>
          <Routes>
            <Route path="/"           element={<Home />} />
            <Route path="/offers"     element={<Offers />} />
            <Route path="/offers/:id" element={<OfferDetail />} />
            <Route path="/messages"   element={<Messages />} />
            <Route path="/dashboard"  element={<Dashboard />} />
            <Route path="/profile"    element={<Profile />} />
            <Route path="/auth"       element={<Auth />} />
          </Routes>
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </BrowserRouter>
  );
}
