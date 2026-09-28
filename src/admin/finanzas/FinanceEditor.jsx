import { cloneElement, useEffect, useId, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { money, today, toArs, METHODS, accountStatus } from './model';

export function Field({ label, children, wide = false }) {
  const id = useId();
  return <div className={`fin-field ${wide ? 'sm:col-span-2' : ''}`}><label htmlFor={id}>{label}</label>{cloneElement(children, { id })}</div>;
}
export default function FinanceEditor({ editor, categories, movements, quote, onClose, onSaved }) {
  const { kind, value = {}, confirmPayment = false } = editor;
  const isMovement = kind === 'movement';
  const isRecurring = kind === 'recurring';
  const isAccount = kind === 'account';
  const isCategory = kind === 'category';
  const account = editor.account;
  const [form, setForm] = useState(() => ({
    tipo: isAccount || account ? 'entrada' : 'salida', estado: 'pagado', fecha: today(),
    inicio: today(), frecuencia: 'mensual', cuotas: '', fin: '', activa: true,
    moneda: 'ARS', cotizacion: quote?.rate || '', importe: '', total: '',
    descripcion: '', pagador: 'ARKO Studio', receptor: '', medio: 'transferencia',
    categoria_id: '', cliente: '', vencimiento: '', nombre: '', ...value,
    ...(account ? { tipo: 'entrada', cobro_id: account.id, pagador: account.cliente, receptor: 'ARKO Studio', categoria_id: account.categoria_id, importe: accountStatus(account, movements).next, descripcion: `${account.descripcion} · ${accountStatus(account, movements).paid ? 'Saldo' : 'Anticipo'}` } : {}),
    ...(confirmPayment ? { estado: 'pagado', fecha: today(), cotizacion: quote?.rate || '' } : {}),
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(value.id || crypto.randomUUID());
  const dialog = useRef(null);
  useEffect(() => { dialog.current.showModal(); }, []);
  const set = patch => setForm(f => ({ ...f, ...patch }));
  const type = isAccount ? 'entrada' : isRecurring ? 'salida' : form.tipo;
  const choices = categories.filter(c => c.tipo === type && (c.activa || c.id === form.categoria_id));
  const title = isMovement ? confirmPayment ? 'Confirmar pago' : account ? 'Registrar cobro' : value.id ? 'Editar movimiento' : 'Nuevo movimiento'
    : isAccount ? value.id ? 'Editar cuenta por cobrar' : 'Nueva cuenta por cobrar'
      : isRecurring ? value.id ? 'Editar gasto recurrente' : 'Nuevo gasto recurrente' : value.id ? 'Editar categoría' : 'Nueva categoría';
  const save = async event => {
    event.preventDefault(); if (saving) return;
    setError('');
    if (!isCategory && !form.categoria_id) { setError('Elegí una categoría.'); return; }
    if (isMovement && form.estado === 'pagado' && form.fecha > today()) { setError('Un pago futuro debe quedar pendiente hasta que lo confirmes.'); return; }
    if (isMovement && form.moneda === 'USD' && form.estado === 'pagado' && !(Number(form.cotizacion) > 0)) { setError('Ingresá una cotización válida para confirmar el pago.'); return; }
    if (isRecurring && form.fin && form.fin < form.inicio) { setError('La fecha de finalización debe ser posterior al inicio.'); return; }
    if (isAccount && form.vencimiento && form.vencimiento < form.fecha) { setError('El vencimiento debe ser posterior a la fecha de creación.'); return; }
    let payload, table;
    if (isCategory) {
      table = 'fin_categorias'; payload = { nombre: form.nombre.trim(), tipo: form.tipo, activa: form.activa };
    } else if (isAccount) {
      table = 'fin_cobros'; payload = { cliente: form.cliente.trim(), descripcion: form.descripcion.trim(), fecha: form.fecha, vencimiento: form.vencimiento || null, total: Number(form.total), categoria_id: form.categoria_id };
    } else {
      payload = { descripcion: form.descripcion.trim(), importe: Number(form.importe), moneda: form.moneda, categoria_id: form.categoria_id, pagador: form.pagador.trim(), receptor: form.receptor.trim(), medio: form.medio };
      if (isRecurring) {
        table = 'fin_recurrentes'; Object.assign(payload, { inicio: form.inicio, frecuencia: form.frecuencia, cuotas: form.cuotas ? Number(form.cuotas) : null, fin: form.fin || null, activa: form.activa });
      } else {
        table = 'fin_movimientos'; Object.assign(payload, { tipo: form.tipo, estado: form.estado, fecha: form.fecha, vencimiento: form.vencimiento || null, cotizacion: form.moneda === 'USD' && Number(form.cotizacion) > 0 ? Number(form.cotizacion) : null });
        if (!value.id && account) payload.cobro_id = account.id;
      }
    }
    setSaving(true);
    try {
      const result = value.id
        ? await supabase.from(table).update(payload).eq('id', value.id).select('id').single()
        : await supabase.from(table).insert({ ...payload, id: requestId.current }).select('id').single();
      if (result.error) throw result.error;
      onSaved();
    } catch (err) { setError(err.message || 'No se pudo guardar. Intentá nuevamente.'); }
    finally { setSaving(false); }
  };
  const amount = toArs(form.importe, form.moneda, form.cotizacion || quote?.rate);
  return <dialog ref={dialog} className="fin-dialog" aria-labelledby="fin-editor-title" onCancel={e => { e.preventDefault(); if (!saving) onClose(); }}>
    <form onSubmit={save}>
      <div className="flex justify-between items-center mb-6"><h3 id="fin-editor-title" className="font-headline font-bold text-xl">{title}</h3><button type="button" aria-label="Cerrar" disabled={saving} onClick={onClose} className="fin-icon">×</button></div>
      {account && <div className="fin-note mb-5">{account.cliente} · Total {money(account.total)} · Pendiente {money(accountStatus(account, movements).remaining)}<br />Podés registrar el anticipo sugerido o ajustar el importe.</div>}
      <div className="grid sm:grid-cols-2 gap-4">
        {isCategory ? <>
          <Field label="Nombre" wide><input className="input" required maxLength={120} value={form.nombre} onChange={e => set({ nombre: e.target.value })} /></Field>
          <Field label="Tipo"><select className="input" disabled={!!value.id} value={form.tipo} onChange={e => set({ tipo: e.target.value })}><option value="entrada">Entrada</option><option value="salida">Salida</option></select></Field>
          <Field label="Disponibilidad"><select className="input" value={String(form.activa)} onChange={e => set({ activa: e.target.value === 'true' })}><option value="true">Activa</option><option value="false">Archivada</option></select></Field>
        </> : <>
          {isMovement && <><Field label="Tipo"><select className="input" disabled={!!form.cobro_id || !!form.recurrente_id} value={form.tipo} onChange={e => set({ tipo: e.target.value, categoria_id: '', pagador: e.target.value === 'salida' ? 'ARKO Studio' : '', receptor: e.target.value === 'entrada' ? 'ARKO Studio' : '' })}><option value="entrada">Entrada</option><option value="salida">Salida</option></select></Field>
            <Field label="Estado"><select className="input" value={form.estado} onChange={e => set({ estado: e.target.value })}><option value="pagado">Pago confirmado</option><option value="pendiente">Pendiente</option>{value.id && <option value="anulado">Anulado</option>}</select></Field></>}
          {isAccount && <Field label="Cliente" wide><input className="input" required maxLength={200} value={form.cliente} onChange={e => set({ cliente: e.target.value })} /></Field>}
          <Field label="Descripción" wide><input className="input" required maxLength={500} value={form.descripcion} onChange={e => set({ descripcion: e.target.value })} placeholder={isRecurring ? 'Ej. Adobe Creative Cloud' : 'Ej. Producción de fotos y video'} /></Field>
          <Field label="Categoría" wide><select className="input" required value={form.categoria_id} onChange={e => set({ categoria_id: e.target.value })}><option value="">Elegir categoría</option>{choices.map(c => <option key={c.id} value={c.id}>{c.nombre}{!c.activa ? ' (archivada)' : ''}</option>)}</select></Field>
          {isAccount ? <><Field label="Total acordado en pesos"><input className="input" type="number" min="0.01" max="999999999999" step="0.01" required value={form.total} onChange={e => set({ total: e.target.value })} /></Field><div className="fin-note self-end">Anticipo 50%: {money(Math.round(Number(form.total) * 50) / 100)}<br />El resto, al entregar.</div></> : <>
            <Field label={isRecurring ? 'Importe por período / cuota' : 'Importe'}><input className="input" type="number" min="0.01" max="999999999999" step="0.01" required value={form.importe} onChange={e => set({ importe: e.target.value })} /></Field>
            <Field label="Moneda"><select className="input" disabled={!!form.cobro_id} value={form.moneda} onChange={e => set({ moneda: e.target.value, cotizacion: form.cotizacion || quote?.rate || '' })}><option value="ARS">Pesos argentinos (ARS)</option><option value="USD">Dólares (USD)</option></select></Field>
            {form.moneda === 'USD' && <div className="sm:col-span-2 fin-note">
              {!isRecurring && <Field label="Cotización · pesos por dólar"><input className="input" type="number" min="0.0001" max="999999999" step="0.0001" required={form.estado === 'pagado'} value={form.cotizacion || ''} onChange={e => set({ cotizacion: e.target.value })} /></Field>}
              <p className="mt-2">{amount === null ? 'Sin cotización disponible.' : `${isRecurring ? 'Estimado hoy' : 'Equivalente'}: ${money(amount)}`}</p>
              <p className="mt-1 text-xs">{isRecurring ? 'Se convertirá al confirmar cada pago con la cotización de ese momento.' : 'Referencia: dólar oficial, venta. Para movimientos anteriores, ingresá la cotización de la fecha del pago. El valor guardado no cambia después.'}</p>
            </div>}
          </>}
          {!isRecurring && <><Field label={isAccount ? 'Fecha de creación' : form.estado === 'pagado' ? 'Fecha del pago' : 'Fecha del movimiento'}><input className="input" type="date" required value={form.fecha} onChange={e => set({ fecha: e.target.value })} /></Field>
            <Field label="Vencimiento (opcional)"><input className="input" type="date" value={form.vencimiento || ''} onChange={e => set({ vencimiento: e.target.value })} /></Field></>}
          {!isAccount && <><Field label="Quién paga"><input className="input" required maxLength={200} value={form.pagador} onChange={e => set({ pagador: e.target.value })} /></Field><Field label="Quién recibe"><input className="input" required maxLength={200} value={form.receptor} onChange={e => set({ receptor: e.target.value })} /></Field><Field label="Medio de pago" wide><select className="input" value={form.medio} onChange={e => set({ medio: e.target.value })}>{Object.entries(METHODS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field></>}
          {isRecurring && <>
            <Field label="Primer vencimiento"><input className="input" type="date" required disabled={!!value.id} value={form.inicio} onChange={e => set({ inicio: e.target.value })} /></Field>
            <Field label="Frecuencia"><select className="input" disabled={!!value.id} value={form.frecuencia} onChange={e => set({ frecuencia: e.target.value })}><option value="mensual">Mensual</option><option value="anual">Anual</option></select></Field>
            <Field label="Cantidad de cuotas (opcional)"><input className="input" type="number" min="1" max="1200" step="1" value={form.cuotas || ''} onChange={e => set({ cuotas: e.target.value })} placeholder="Sin límite" /></Field>
            <Field label="Fecha de finalización (opcional)"><input className="input" type="date" min={form.inicio} value={form.fin || ''} onChange={e => set({ fin: e.target.value })} /></Field>
            <Field label="Estado"><select className="input" value={String(form.activa)} onChange={e => set({ activa: e.target.value === 'true' })}><option value="true">Activo</option><option value="false">Pausado</option></select></Field>
            <p className="fin-note sm:col-span-2">Cada vencimiento queda pendiente hasta que confirmes el pago. En meses cortos se usa el último día del mes. {value.id && 'Los cambios afectan solo vencimientos aún no generados. Al reactivar, se recuperan períodos pendientes; podés anular los que no correspondan.'}</p>
          </>}
        </>}
      </div>
      {error && <p role="alert" className="text-error text-sm mt-4">{error}</p>}
      <div className="flex justify-end gap-3 mt-6"><button type="button" className="fin-button" disabled={saving} onClick={onClose}>Cancelar</button><button className="fin-button fin-primary" disabled={saving}>{saving ? 'Guardando…' : confirmPayment ? 'Confirmar pago' : 'Guardar'}</button></div>
    </form>
  </dialog>;
}
