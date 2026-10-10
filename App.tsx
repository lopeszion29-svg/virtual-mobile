import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { PhoneDesktop } from './components/PhoneDesktop';
import { AuthScreen } from './components/AuthScreen';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    if (!supabase) { setChecking(false); return; }
    supabase.auth.getSession().then(({data}) => { setSession(data.session); setChecking(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);
  if (checking) return <div className="boot"><div className="brand-mark">V</div><p>Starting Virtual Phone OS…</p></div>;
  if (!isSupabaseConfigured || !session) return <AuthScreen configured={isSupabaseConfigured} />;
  return <PhoneDesktop session={session} />;
}
