import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

// Supabase limits each response; never silently truncate a financial balance.
async function allRows(table) {
  const rows = [];
  for (let start = 0; ; start += 1000) {
    const { data, error } = await supabase.from(table).select('*').order('id').range(start, start + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}
export function useFinance() {
  const [data, setData] = useState({ movements: [], categories: [], accounts: [], recurring: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const generated = await supabase.rpc('fin_generar_pendientes');
      if (generated.error) throw generated.error;
      const [movements, categories, accounts, recurring] = await Promise.all([
        allRows('fin_movimientos'), allRows('fin_categorias'), allRows('fin_cobros'), allRows('fin_recurrentes'),
      ]);
      setData({ movements: movements.sort((a, b) => b.fecha.localeCompare(a.fecha) || b.created_at.localeCompare(a.created_at)), categories: categories.sort((a, b) => a.nombre.localeCompare(b.nombre)), accounts, recurring });
    } catch (err) { setError(err); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  return { ...data, loading, error, load };
}

export function useOfficialRate() {
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('https://dolarapi.com/v1/dolares/oficial', { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (!Number.isFinite(data.venta) || data.venta <= 0 || !Number.isFinite(Date.parse(data.fechaActualizacion))) throw new Error();
      setQuote({ rate: data.venta, updated: data.fechaActualizacion }); setError('');
    } catch (err) {
      setError('No se pudo actualizar la cotización. Podés ingresar el valor al registrar el pago.');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => {
    refresh();
    const interval = setInterval(() => refresh(), 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refresh]);
  return { quote, error, loading, refresh };
}
