import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type UserRole = 'student' | 'center' | 'admin' | null;

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: UserRole;
  profile: any;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null, session: null, loading: true,
  role: null, profile: null,
  signOut: async () => {}
});

async function fetchProfile(userId: string) {
  // Essaie plusieurs noms de table courants
  for (const table of ['profiles', 'users', 'user_profiles']) {
    const { data, error } = await supabase
      .from(table).select('*').eq('id', userId).single();
    if (!error && data) return data;
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole]       = useState<UserRole>(null);
  const [profile, setProfile] = useState<any>(null);

  const loadProfile = async (u: User | null) => {
    if (!u) { setRole(null); setProfile(null); return; }

    // 1️⃣ Cherche dans user_metadata (défini à l'inscription)
    const metaRole = u.user_metadata?.role ?? u.user_metadata?.type ?? null;

    // 2️⃣ Cherche dans la table profiles
    const prof = await fetchProfile(u.id);
    setProfile(prof);

    const dbRole = prof?.role ?? prof?.type ?? prof?.user_type ?? null;
    const resolvedRole = (metaRole ?? dbRole ?? 'student') as UserRole;
    setRole(resolvedRole);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user ?? null;
      setSession(data.session);
      setUser(u);
      await loadProfile(u);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, s) => {
      const u = s?.user ?? null;
      setSession(s);
      setUser(u);
      await loadProfile(u);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => { await supabase.auth.signOut(); };

  return (
    <Ctx.Provider value={{ user, session, loading, role, profile, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
