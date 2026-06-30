import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!supabase);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Re-sync data from Supabase when user signs in (handles sign-out + sign-in flow)
      if (event === 'SIGNED_IN') {
        import('../hooks/useStore').then(({ useStore }) => {
          useStore.getState().initFromSupabase();
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, user, loading, isSupabaseConfigured: !!supabase };
}
