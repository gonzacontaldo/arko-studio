import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSession } from '../admin/useSession';
import Login from '../admin/Login';
import Dashboard from '../admin/Dashboard';
import Leads from '../admin/Leads';
import Producciones from '../admin/Producciones';
import HubLogo from '../admin/HubLogo';

const TABS = [
  { key: 'dashboard',   label: 'Inicio',     icon: 'dashboard' },
  { key: 'leads',       label: 'Leads',      icon: 'contacts' },
  { key: 'produccion',  label: 'Producción', icon: 'movie'    },
];

export default function AdminPage() {
  const session = useSession();
  const [tab, setTab] = useState('dashboard');

  // Cargando estado de sesión
  if (session === undefined) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-container-low text-on-surface-variant text-sm">Cargando…</div>;
  }

  // No logueado → pantalla de login
  if (!session) return <Login />;

  // Logueado → hub
  return (
    <div className="min-h-screen bg-surface-container-low font-body">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-nav border-b border-outline-variant/30">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <HubLogo size="sm" />
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-on-surface-variant hover:text-secondary transition-colors">Ver sitio</Link>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-sm font-medium text-on-surface-variant hover:text-error transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6">
        <div className="flex gap-2 mb-6">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 font-headline font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full border transition-all ${
                tab === t.key
                  ? 'bg-secondary text-on-secondary border-secondary'
                  : 'bg-transparent text-on-surface-variant border-outline-variant hover:border-secondary'
              }`}
            >
              <span className="material-symbols-outlined text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="bg-surface rounded-2xl border border-outline-variant/40 shadow-sm p-6 md:p-8 mb-12">
          {tab === 'dashboard'  && <Dashboard onGo={setTab} />}
          {tab === 'leads'      && <Leads />}
          {tab === 'produccion' && <Producciones />}
        </div>
      </div>
    </div>
  );
}
