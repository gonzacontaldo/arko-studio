import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Sigue el estado de login del usuario en tiempo real.
export function useSession() {
  const [session, setSession] = useState(undefined); // undefined = cargando

  useEffect(() => {
    if (!supabase) { setSession(null); return; }

    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return session;
}
