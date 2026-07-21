import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import HubLogo from './HubLogo';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError('Email o contraseña incorrectos.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low px-4">
      <div className="w-full max-w-sm bg-surface rounded-2xl border border-outline-variant/40 shadow-xl p-8">
        <div className="mb-6">
          <HubLogo size="lg" />
          <p className="text-on-surface-variant text-sm mt-3">Panel de administración</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-4 text-xs text-error bg-error/10 rounded-lg p-3">
            Falta configurar las variables de entorno de Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-secondary transition-colors"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-secondary transition-colors"
          />
          {error && <p className="text-xs text-error">{error}</p>}
          <button
            type="submit"
            disabled={loading || !isSupabaseConfigured}
            className="mt-2 editorial-gradient text-on-secondary font-headline font-bold text-sm uppercase tracking-widest py-3 rounded-lg disabled:opacity-50 active:scale-[0.98] transition-all"
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
