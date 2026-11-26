import { cloneElement, useEffect, useId, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  ACTIONS, CHANNELS, OUTCOMES, buenosAiresClock, contactUrl, entryLabel,
  followUpLabel, followUpPreset, followUpStatus,
} from './coldCallingModel';

const primary = 'editorial-gradient rounded-lg px-4 py-2.5 text-sm font-bold text-on-secondary disabled:opacity-50';
const secondary = 'rounded-lg border border-outline-variant px-3 py-2 text-sm font-medium text-on-surface hover:border-secondary';
const textButton = 'text-sm font-medium text-secondary hover:underline';
const logFields = 'id,channel,outcome,note,next_action,follow_up_date,follow_up_time,created_at';
const filters = {
  pending: 'Pendientes', due: 'Hoy y vencidos', upcoming: 'Próximos', closed: 'Cerrados', all: 'Todos',
};
const statusOrder = ['overdue', 'today', 'upcoming', 'undated', 'closed'];
const statusLabels = {
  overdue: ['Vencido', 'bg-error/10 text-error'],
  today: ['Hoy', 'bg-secondary/10 text-secondary'],
  upcoming: ['Agendado', 'bg-surface-container text-on-surface-variant'],
  undated: ['Sin fecha', 'bg-surface-container text-on-surface-variant'],
  closed: ['Cerrado', 'bg-surface-container text-on-surface-variant'],
};

function Field({ label, children, wide }) {
  const id = useId();
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-on-surface">{label}</label>
      {cloneElement(children, { id })}
    </div>
  );
}

function FormActions({ busy, cancel, label }) {
  return (
    <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
      <button className={primary} disabled={busy}>{busy ? 'Guardando…' : label}</button>
      <button type="button" onClick={cancel} disabled={busy} className={secondary}>Cancelar</button>
    </div>
  );
}

function ContactForm({ contact, onSaved, cancel }) {
  const [form, setForm] = useState(() => ({
    name: contact?.name || '', phone: contact?.phone || '', agency: contact?.agency || '',
    email: contact?.email || '', property_url: contact?.property_url || '',
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    const fields = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim() || null]));
    if (!fields.name || !/\d/.test(fields.phone || '')) {
      setError('Completá el nombre y un teléfono válido.');
      return;
    }
    if (fields.property_url && !contactUrl(fields.property_url)) {
      setError('Ingresá un enlace que empiece con https:// o http://.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const table = supabase.from('cold_call_contacts');
      const query = contact ? table.update(fields).eq('id', contact.id) : table.insert(fields);
      const { data, error: failure } = await query.select().single();
      if (failure) throw failure;
      onSaved(data);
    } catch {
      setError('No se pudo guardar el contacto. Reintentá.');
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-xl bg-surface-container-low p-4 sm:grid-cols-2">
      <h3 className="font-headline font-bold text-on-surface sm:col-span-2">{contact ? 'Editar contacto' : 'Agregar contacto'}</h3>
      <Field label="Nombre"><input className="input" name="name" maxLength={160} required autoFocus value={form.name} onChange={change} /></Field>
      <Field label="Teléfono"><input className="input" name="phone" type="tel" maxLength={40} required value={form.phone} onChange={change} /></Field>
      <Field label="Inmobiliaria"><input className="input" name="agency" maxLength={160} value={form.agency} onChange={change} /></Field>
      <Field label="Mail"><input className="input" name="email" type="email" maxLength={254} value={form.email} onChange={change} /></Field>
      <Field label="Enlace al aviso" wide><input className="input" name="property_url" type="url" maxLength={2048} placeholder="https://…" value={form.property_url} onChange={change} /></Field>
      {error && <p role="alert" className="text-sm text-error sm:col-span-2">{error}</p>}
      <FormActions busy={busy} cancel={cancel} label="Guardar contacto" />
    </form>
  );
}

function InteractionForm({ contact, onSaved, cancel }) {
  const [id] = useState(() => crypto.randomUUID());
  const [form, setForm] = useState({
    channel: contact.latest?.next_action === 'none' ? 'call' : contact.latest?.next_action || 'call',
    outcome: '', note: '', next_action: 'call', follow_up_date: '', follow_up_time: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const change = (event) => {
    const { name, value } = event.target;
    setForm(current => ({
      ...current, [name]: value,
      ...(name === 'outcome' && value ? { next_action: OUTCOMES[value].action } : {}),
      ...(name === 'follow_up_date' && !value ? { follow_up_time: '' } : {}),
    }));
  };
  const preset = (key) => {
    const { date, time } = followUpPreset(key);
    setForm(current => ({ ...current, follow_up_date: date, follow_up_time: time }));
  };

  async function submit(event) {
    event.preventDefault();
    const date = form.next_action === 'none' ? null : form.follow_up_date || null;
    setBusy(true);
    setError('');
    try {
      const fields = {
        ...form, id, contact_id: contact.id, note: form.note.trim() || null,
        follow_up_date: date, follow_up_time: date ? form.follow_up_time || null : null,
      };
      let result = await supabase.from('cold_call_interactions').insert(fields).select(logFields).single();
      if (result.error?.code === '23505') {
        result = await supabase.from('cold_call_interactions').select(logFields).eq('id', id).single();
      }
      if (result.error) throw result.error;
      onSaved(result.data);
    } catch {
      setError('No se pudo guardar el resultado. Reintentá.');
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-xl bg-surface-container-low p-4 sm:grid-cols-2">
      <Field label="Resultado">
        <select name="outcome" className="input" value={form.outcome} onChange={change} required autoFocus>
          <option value="">Elegí qué pasó</option>
          {Object.entries(OUTCOMES).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </Field>
      <Field label="Canal">
        <select name="channel" className="input" value={form.channel} onChange={change}>
          {Object.entries(CHANNELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </Field>
      <Field label="Notas" wide>
        <textarea name="note" className="input" rows={2} maxLength={2000} value={form.note} onChange={change} placeholder="Ej. Vuelve el jueves y quiere ver trabajos de Nordelta." />
      </Field>
      <Field label="Próximo paso" wide>
        <select name="next_action" className="input" value={form.next_action} onChange={change}>
          {Object.entries(ACTIONS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </Field>
      {form.next_action !== 'none' && (
        <>
          <Field label="Fecha de seguimiento"><input className="input" type="date" name="follow_up_date" value={form.follow_up_date} onChange={change} /></Field>
          <Field label="Hora (Buenos Aires)"><input className="input" type="time" name="follow_up_time" value={form.follow_up_time} onChange={change} disabled={!form.follow_up_date} /></Field>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            {[['soon', 'En 30 min'], ['tomorrow', 'Mañana'], ['week', 'En una semana']].map(([key, label]) => (
              <button key={key} type="button" onClick={() => preset(key)} className={secondary}>{label}</button>
            ))}
          </div>
        </>
      )}
      {error && <p role="alert" className="text-sm text-error sm:col-span-2">{error}</p>}
      <FormActions busy={busy} cancel={cancel} label="Guardar resultado" />
    </form>
  );
}

function History({ contactId, latestId }) {
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const request = new AbortController();
    setError(false);
    supabase.from('cold_call_interactions').select(logFields).eq('contact_id', contactId)
      .order('created_at', { ascending: false }).order('id', { ascending: false }).abortSignal(request.signal)
      .then(({ data, error: failure }) => {
        if (request.signal.aborted) return;
        if (failure) setError(true);
        else setEntries(data);
      });
    return () => request.abort();
  }, [contactId, latestId, retry]);

  if (error) return <p role="alert" className="text-sm text-error">No se pudo cargar el historial. <button onClick={() => setRetry(n => n + 1)} className={textButton}>Reintentar</button></p>;
  if (!entries) return <p role="status" className="text-sm text-on-surface-variant">Cargando historial…</p>;
  if (!entries.length) return <p className="text-sm text-on-surface-variant">Todavía no registraste resultados.</p>;
  return (
    <ol className="divide-y divide-outline-variant/30 rounded-lg border border-outline-variant/40">
      {entries.map(entry => (
        <li key={entry.id} className="p-3 text-sm">
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
            <p className="font-medium text-on-surface">{CHANNELS[entry.channel]} · {OUTCOMES[entry.outcome].label}</p>
            <time dateTime={entry.created_at} className="text-on-surface-variant">{entryLabel.format(new Date(entry.created_at))}</time>
          </div>
          {entry.note && <p className="mt-1 whitespace-pre-wrap break-words text-on-surface-variant">{entry.note}</p>}
          <p className="mt-1 text-on-surface-variant">{[entry.next_action === 'none' ? 'Seguimiento cerrado' : ACTIONS[entry.next_action], followUpLabel(entry)].filter(Boolean).join(' · ')}</p>
        </li>
      ))}
    </ol>
  );
}

export default function ColdCalling() {
  const [contacts, setContacts] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [retry, setRetry] = useState(0);
  const [now, setNow] = useState(buenosAiresClock);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState(null);
  const [historyId, setHistoryId] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setNow(buenosAiresClock()), 15_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const request = new AbortController();
    setLoadError('');
    async function load() {
      const rows = [];
      for (let start = 0; ; start += 500) {
        const { data, error } = await supabase.from('cold_call_contacts')
          .select(`*,latest:cold_call_interactions(${logFields})`).order('id').range(start, start + 499)
          .order('created_at', { referencedTable: 'latest', ascending: false })
          .order('id', { referencedTable: 'latest', ascending: false })
          .limit(1, { referencedTable: 'latest' }).abortSignal(request.signal);
        if (request.signal.aborted) return;
        if (error) throw error;
        rows.push(...data.map(row => ({ ...row, latest: row.latest[0] || null })));
        if (data.length < 500) break;
      }
      setContacts(rows);
    }
    load().catch(error => {
      if (request.signal.aborted) return;
      setLoadError(['PGRST205', 'PGRST200', '42P01'].includes(error.code)
        ? 'Cold calling todavía no está habilitado en la base de datos.'
        : 'No se pudieron cargar los contactos.');
    });
    return () => request.abort();
  }, [retry]);

  const open = (type, id) => {
    setNotice('');
    setEditor({ type, id });
  };
  const cancel = () => setEditor(null);
  const savedContact = (contact) => {
    setContacts(list => editor.id
      ? list.map(row => row.id === contact.id ? { ...row, ...contact } : row)
      : [...list, { ...contact, latest: null }]);
    if (!editor.id) { setFilter('pending'); setSearch(''); }
    setEditor(null);
    setNotice(`Se guardó el contacto de ${contact.name}.`);
  };
  const savedInteraction = (contact, entry) => {
    setContacts(list => list.map(row => row.id === contact.id ? { ...row, latest: entry } : row));
    setNow(buenosAiresClock());
    setEditor(null);
    setNotice(entry.next_action === 'none'
      ? `Seguimiento de ${contact.name} cerrado.`
      : [`Próximo paso para ${contact.name}`, ACTIONS[entry.next_action], followUpLabel(entry)].filter(Boolean).join(' · '));
  };

  const cards = (contacts || []).map(contact => ({ ...contact, status: followUpStatus(contact.latest, now) }));
  const counts = {
    all: cards.length,
    pending: cards.filter(row => row.status !== 'closed').length,
    due: cards.filter(row => ['today', 'overdue'].includes(row.status)).length,
    upcoming: cards.filter(row => row.status === 'upcoming').length,
    closed: cards.filter(row => row.status === 'closed').length,
  };
  const term = search.trim().toLocaleLowerCase('es-AR');
  const phoneTerm = /^[+\d().\s-]+$/.test(term) ? term.replace(/\D/g, '') : '';
  const visible = cards.filter(row => {
    if (row.id === editor?.id) return true;
    const searchText = `${row.name} ${row.agency || ''} ${row.phone} ${row.email || ''}`.toLocaleLowerCase('es-AR');
    if (!searchText.includes(term) && !(phoneTerm && row.phone.replace(/\D/g, '').includes(phoneTerm))) return false;
    if (filter === 'pending') return row.status !== 'closed';
    if (filter === 'due') return ['today', 'overdue'].includes(row.status);
    return filter === 'all' || row.status === filter;
  }).sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
    || (a.latest?.follow_up_date || '').localeCompare(b.latest?.follow_up_date || '')
    || (a.latest?.follow_up_time || '').localeCompare(b.latest?.follow_up_time || '')
    || a.name.localeCompare(b.name, 'es-AR'));

  return (
    <section className="space-y-5" aria-labelledby="cold-calling-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="cold-calling-title" className="font-headline text-xl font-bold text-on-surface">Cold calling</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Registrá qué pasó y cuándo volver a contactar a cada agente.</p>
        </div>
        <button onClick={() => open('contact', null)} disabled={!contacts || Boolean(editor)} className={primary}>Agregar contacto</button>
      </div>

      {loadError && <p role="alert" className="text-sm text-error">{loadError} <button onClick={() => setRetry(n => n + 1)} className={textButton}>Reintentar</button></p>}
      {!contacts && !loadError && <p role="status" className="text-sm text-on-surface-variant">Cargando contactos…</p>}
      {editor?.type === 'contact' && !editor.id && <ContactForm onSaved={savedContact} cancel={cancel} />}
      {notice && <p role="status" className="rounded-lg bg-secondary/10 px-4 py-2 text-sm text-secondary">{notice}</p>}

      {contacts && <>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar seguimientos">
          {Object.entries(filters).map(([key, label]) => (
            <button key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}
              className={`${secondary} ${filter === key ? 'border-secondary bg-secondary/10 text-secondary' : ''}`}>
              {label} <span className="ml-1 tabular-nums">{counts[key]}</span>
            </button>
          ))}
        </div>
        <input className="input sm:max-w-sm" type="search" aria-label="Buscar contactos" placeholder="Nombre, inmobiliaria o teléfono…" value={search} onChange={e => setSearch(e.target.value)} />
        {!visible.length && <p className="rounded-xl border border-outline-variant/40 p-4 text-sm text-on-surface-variant">{cards.length ? 'No hay contactos en esta vista.' : 'Agregá tu primer contacto para registrar una llamada.'}</p>}
        <div className="space-y-3">
          {visible.map(contact => {
            const latest = contact.latest;
            const [status, color] = statusLabels[contact.status];
            const editing = editor?.id === contact.id;
            const property = contactUrl(contact.property_url);
            return (
              <article key={contact.id} className="space-y-3 rounded-xl border border-outline-variant/40 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="min-w-0 break-words">
                    <h3 className="font-headline font-bold text-on-surface">{contact.name}</h3>
                    {contact.agency && <p className="mt-0.5 text-sm text-on-surface-variant">{contact.agency}</p>}
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                      <a className={textButton} href={`tel:${contact.phone.trim().replace(/[^+\d]/g, '')}`}>{contact.phone}</a>
                      {contact.email && <a className={`${textButton} break-all`} href={`mailto:${encodeURIComponent(contact.email).replace('%40', '@')}`}>{contact.email}</a>}
                      {property && <a className={textButton} href={property} target="_blank" rel="noopener noreferrer">Ver aviso</a>}
                    </div>
                  </div>
                  <div className="min-w-0 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-on-surface">{latest?.next_action === 'none' ? 'Seguimiento cerrado' : ACTIONS[latest?.next_action || 'call']}</p>
                      {contact.status !== 'closed' && <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{status}</span>}
                      {followUpLabel(latest) && <span className="text-on-surface-variant">{followUpLabel(latest)}</span>}
                    </div>
                    <p className="mt-1 text-on-surface-variant">
                      {latest ? <>{OUTCOMES[latest.outcome].label} · <time dateTime={latest.created_at}>{entryLabel.format(new Date(latest.created_at))}</time></> : 'Sin llamadas registradas'}
                    </p>
                    {latest?.note && <p className="mt-1 break-words text-on-surface-variant">{latest.note}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button className={primary} disabled={Boolean(editor)} onClick={() => open('interaction', contact.id)}>Registrar resultado</button>
                  <button className={`${textButton} disabled:opacity-50`} disabled={Boolean(editor)} onClick={() => open('contact', contact.id)}>Editar contacto</button>
                  <button className={textButton} aria-expanded={historyId === contact.id} onClick={() => setHistoryId(historyId === contact.id ? null : contact.id)}>{historyId === contact.id ? 'Ocultar historial' : 'Ver historial'}</button>
                </div>
                {editing && (editor.type === 'contact'
                  ? <ContactForm contact={contact} onSaved={savedContact} cancel={cancel} />
                  : <InteractionForm contact={contact} onSaved={entry => savedInteraction(contact, entry)} cancel={cancel} />)}
                {historyId === contact.id && <History contactId={contact.id} latestId={latest?.id} />}
              </article>
            );
          })}
        </div>
      </>}
    </section>
  );
}
