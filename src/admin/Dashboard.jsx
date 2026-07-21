import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

function StatCard({ label, value, hint, icon }) {
  return (
    <div className="bg-surface rounded-2xl border border-outline-variant/40 p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-headline uppercase tracking-widest text-on-surface-variant">{label}</span>
        <span className="material-symbols-outlined text-secondary text-xl">{icon}</span>
      </div>
      <div className="font-headline font-extrabold text-3xl text-on-surface leading-none">{value}</div>
      {hint && <div className="text-xs text-on-surface-variant mt-2">{hint}</div>}
    </div>
  );
}

const inSameMonth = (iso) => {
  const d = new Date(iso), n = new Date();
  return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
};

export default function Dashboard({ onGo }) {
  const [leads, setLeads] = useState([]);
  const [prods, setProds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [l, p] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('producciones').select('*').order('created_at', { ascending: false }),
      ]);
      setLeads(l.data || []);
      setProds(p.data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-on-surface-variant text-sm">Cargando…</p>;

  const leadsMes    = leads.filter(l => inSameMonth(l.created_at)).length;
  const leadsNuevos = leads.filter(l => l.estado === 'nuevo').length;
  const activos     = prods.filter(p => p.estado !== 'entregado').length;
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const proximas = prods
    .filter(p => p.fecha_sesion && new Date(p.fecha_sesion) >= hoy)
    .sort((a, b) => new Date(a.fecha_sesion) - new Date(b.fecha_sesion));
  const ganados = leads.filter(l => l.estado === 'ganado').length;
  const conv = leads.length ? Math.round((ganados / leads.length) * 100) : 0;

  return (
    <div>
      <h2 className="font-headline font-bold text-xl text-on-surface mb-5">Resumen</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Leads del mes"   value={leadsMes}   hint={`${leadsNuevos} sin contactar`} icon="trending_up" />
        <StatCard label="Trabajos activos" value={activos}    hint="en producción" icon="movie" />
        <StatCard label="Próximas sesiones" value={proximas.length} hint="agendadas" icon="event" />
        <StatCard label="Conversión"        value={`${conv}%`} hint={`${ganados} ganados`} icon="check_circle" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Próximas sesiones */}
        <div className="bg-surface rounded-2xl border border-outline-variant/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline font-bold text-on-surface">Próximas sesiones</h3>
            <button onClick={() => onGo?.('produccion')} className="text-xs text-secondary font-bold uppercase tracking-widest hover:opacity-70">Ver todo</button>
          </div>
          {proximas.length === 0 ? (
            <p className="text-on-surface-variant text-sm">Nada agendado.</p>
          ) : (
            <ul className="space-y-2">
              {proximas.slice(0, 5).map(p => (
                <li key={p.id} className="flex items-center justify-between text-sm border-b border-outline-variant/20 pb-2 last:border-0">
                  <span className="text-on-surface font-medium">{p.propiedad}</span>
                  <span className="text-on-surface-variant whitespace-nowrap">{new Date(p.fecha_sesion).toLocaleDateString('es-AR')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Últimos leads */}
        <div className="bg-surface rounded-2xl border border-outline-variant/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline font-bold text-on-surface">Últimos leads</h3>
            <button onClick={() => onGo?.('leads')} className="text-xs text-secondary font-bold uppercase tracking-widest hover:opacity-70">Ver todo</button>
          </div>
          {leads.length === 0 ? (
            <p className="text-on-surface-variant text-sm">Todavía no hay leads.</p>
          ) : (
            <ul className="space-y-2">
              {leads.slice(0, 5).map(l => (
                <li key={l.id} className="flex items-center justify-between text-sm border-b border-outline-variant/20 pb-2 last:border-0">
                  <span className="text-on-surface font-medium">{l.nombre}</span>
                  <span className="text-xs text-on-surface-variant">{l.estado}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
