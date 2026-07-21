import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

const ESTADO_COLOR = {
  agendado:  'bg-blue-500',
  filmado:   'bg-amber-500',
  edicion:   'bg-purple-500',
  terminado: 'bg-green-600',
};
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function Agenda({ onGo }) {
  const [sesiones, setSesiones] = useState([]);
  const today = new Date();
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });

  useEffect(() => {
    supabase.from('producciones')
      .select('id,titulo,propiedad,estado,fecha_sesion')
      .not('fecha_sesion', 'is', null)
      .then(({ data }) => setSesiones(data || []));
  }, []);

  // Mapa fecha (YYYY-MM-DD) → sesiones de ese día.
  const porDia = useMemo(() => {
    const map = {};
    sesiones.forEach(s => { (map[s.fecha_sesion] ??= []).push(s); });
    return map;
  }, [sesiones]);

  // Próximas sesiones (desde hoy).
  const proximas = useMemo(() => {
    const hoy = ymd(new Date());
    return sesiones
      .filter(s => s.fecha_sesion >= hoy)
      .sort((a, b) => a.fecha_sesion.localeCompare(b.fecha_sesion));
  }, [sesiones]);

  // Grilla del mes (semanas de lunes a domingo).
  const celdas = useMemo(() => {
    const primero = new Date(cursor.y, cursor.m, 1);
    const offset = (primero.getDay() + 6) % 7; // 0 = lunes
    const dias = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const arr = Array(offset).fill(null);
    for (let d = 1; d <= dias; d++) arr.push(new Date(cursor.y, cursor.m, d));
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [cursor]);

  const move = (delta) => setCursor(c => {
    const m = c.m + delta;
    return { y: c.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 };
  });
  const hoyStr = ymd(new Date());

  return (
    <div>
      <h2 className="font-headline font-bold text-xl text-on-surface mb-5">Agenda</h2>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => move(-1)} className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center"><span className="material-symbols-outlined">chevron_left</span></button>
            <h3 className="font-headline font-bold text-on-surface">{MESES[cursor.m]} {cursor.y}</h3>
            <button onClick={() => move(1)} className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center"><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {DIAS.map(d => <div key={d} className="text-center text-[11px] font-headline uppercase tracking-wider text-on-surface-variant py-1">{d}</div>)}
            {celdas.map((date, i) => {
              if (!date) return <div key={i} />;
              const key = ymd(date);
              const dels = porDia[key] || [];
              const esHoy = key === hoyStr;
              return (
                <div key={i} className={`min-h-[64px] rounded-lg border p-1 ${esHoy ? 'border-secondary bg-secondary/5' : 'border-outline-variant/30'}`}>
                  <div className={`text-[11px] font-medium mb-1 ${esHoy ? 'text-secondary' : 'text-on-surface-variant'}`}>{date.getDate()}</div>
                  <div className="space-y-0.5">
                    {dels.slice(0, 3).map(s => (
                      <button
                        key={s.id}
                        onClick={() => onGo?.('produccion')}
                        title={`${s.titulo || s.propiedad} (${s.estado})`}
                        className="w-full flex items-center gap-1 text-left"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ESTADO_COLOR[s.estado] || 'bg-stone-400'}`} />
                        <span className="text-[10px] text-on-surface truncate">{s.titulo || s.propiedad}</span>
                      </button>
                    ))}
                    {dels.length > 3 && <div className="text-[9px] text-on-surface-variant">+{dels.length - 3}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Próximas sesiones */}
        <div>
          <h3 className="font-headline font-bold text-on-surface mb-3">Próximas sesiones</h3>
          {proximas.length === 0 ? (
            <p className="text-on-surface-variant text-sm">Nada agendado próximamente.</p>
          ) : (
            <ul className="space-y-2">
              {proximas.slice(0, 10).map(s => (
                <li key={s.id} className="flex items-start gap-2 bg-surface-container-low rounded-xl p-3">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${ESTADO_COLOR[s.estado] || 'bg-stone-400'}`} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-on-surface truncate">{s.titulo || s.propiedad}</div>
                    <div className="text-xs text-on-surface-variant">
                      {new Date(s.fecha_sesion + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} · {s.estado}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
