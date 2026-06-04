import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import TopBar from '@/components/TopBar';

const Home     = lazy(() => import('@/pages/Home'));
const Offers   = lazy(() => import('@/pages/Offers'));
const OfferDetail = lazy(() => import('@/pages/OfferDetail'));
const Messages = lazy(() => import('@/pages/Messages'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Profile  = lazy(() => import('@/pages/Profile'));
const Auth     = lazy(() => import('@/pages/Auth'));

const qc = new QueryClient();

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface">
    <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
  </div>
);

function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function Layout() {
  const { user } = useAuth();
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <TopBar />
      <main className="flex-1">
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/offers/:id" element={<OfferDetail />} />
            <Route path="/messages" element={<Guard><Messages /></Guard>} />
            <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
            <Route path="/profile" element={<Guard><Profile /></Guard>} />
            <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
