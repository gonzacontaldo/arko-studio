// Endpoint de ingesta de leads automatizados (OpenClaw / ZonaProp).
// Corre como función serverless en Vercel. OpenClaw le hace POST con un token
// secreto; el endpoint valida e inserta en la tabla `leads` usando la
// service_role key (que vive SOLO acá, en el servidor — nunca en el frontend).
//
// Variables de entorno necesarias en Vercel (Settings → Environment Variables):
//   SUPABASE_URL                → https://vahaviqodryjczcxbtez.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY   → la service_role key (SECRETA)
//   INGEST_SECRET               → un token largo inventado, compartido con OpenClaw

const ALLOWED_FIELDS = ['nombre', 'contacto', 'propiedad', 'mensaje', 'url', 'metadata', 'notas'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Autenticación por token ───────────────────────────────────────────
  const token = req.headers['x-api-key'];
  if (!process.env.INGEST_SECRET || token !== process.env.INGEST_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  // ── Normalizar payload: acepta un lead o un array de leads ────────────
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const incoming = Array.isArray(body) ? body : Array.isArray(body?.leads) ? body.leads : [body];

  const rows = incoming
    .map((item) => {
      const row = {};
      for (const f of ALLOWED_FIELDS) if (item[f] !== undefined) row[f] = item[f];
      row.fuente = 'openclaw';
      row.estado = 'nuevo';
      return row;
    })
    .filter((r) => r.nombre); // el nombre (inmobiliaria) es obligatorio

  if (rows.length === 0) {
    return res.status(400).json({ error: 'No valid leads. Cada lead requiere al menos "nombre".' });
  }

  // ── Insertar en Supabase (ignora duplicados por url) ──────────────────
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/leads?on_conflict=url`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation,resolution=ignore-duplicates',
      },
      body: JSON.stringify(rows),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data });
    return res.status(200).json({ inserted: Array.isArray(data) ? data.length : 0, received: rows.length });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
