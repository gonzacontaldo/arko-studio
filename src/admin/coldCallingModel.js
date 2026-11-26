export const CHANNELS = {
  call: 'Llamada',
  email: 'Mail',
  whatsapp: 'WhatsApp',
  other: 'Otro',
};

export const ACTIONS = {
  call: 'Llamar',
  email: 'Mandar un mail',
  whatsapp: 'Escribir por WhatsApp',
  other: 'Otro seguimiento',
  none: 'Cerrar seguimiento',
};

export const OUTCOMES = {
  no_answer: { label: 'No atendió', action: 'call' },
  call_back: { label: 'Pidió que lo vuelva a llamar', action: 'call' },
  travelling: { label: 'Está de viaje', action: 'call' },
  asked_email: { label: 'Pidió un mail', action: 'email' },
  asked_whatsapp: { label: 'Pidió WhatsApp', action: 'whatsapp' },
  interested: { label: 'Mostró interés', action: 'call' },
  not_interested: { label: 'Sin interés', action: 'none' },
  followed_up: { label: 'Seguimiento realizado', action: 'none' },
  other: { label: 'Otro', action: 'other' },
};

const TIME_ZONE = 'America/Argentina/Buenos_Aires';
const clock = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});
const dayLabel = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeZone: 'UTC' });
export const entryLabel = new Intl.DateTimeFormat('es-AR', {
  timeZone: TIME_ZONE, dateStyle: 'medium', timeStyle: 'short',
});

export function buenosAiresClock(instant = new Date()) {
  const parts = Object.fromEntries(clock.formatToParts(instant).map(({ type, value }) => [type, value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

export function followUpPreset(preset, instant = new Date()) {
  if (preset === 'soon') return buenosAiresClock(new Date(instant.getTime() + 30 * 60_000));

  const date = new Date(`${buenosAiresClock(instant).date}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + (preset === 'tomorrow' ? 1 : 7));
  return { date: date.toISOString().slice(0, 10), time: '' };
}

export function followUpStatus(entry, now) {
  if (entry?.next_action === 'none') return 'closed';
  const date = entry?.follow_up_date;
  if (!date) return 'undated';
  const time = entry.follow_up_time?.slice(0, 5);
  if (date < now.date || (date === now.date && time && time < now.time)) return 'overdue';
  return date === now.date ? 'today' : 'upcoming';
}

export function followUpLabel(entry) {
  if (!entry?.follow_up_date) return '';
  const date = dayLabel.format(new Date(`${entry.follow_up_date}T00:00:00Z`));
  return entry.follow_up_time ? `${date}, ${entry.follow_up_time.slice(0, 5)}` : date;
}

export function contactUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}
