import { createClient } from '@supabase/supabase-js';

// La URL y la anon key vienen de variables de entorno.
// La anon key es PÚBLICA por diseño (va en el frontend); la seguridad real
// la dan las políticas RLS de la base. Nunca pongas acá la service_role key.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Helper para avisar en el admin si faltan las variables de entorno.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
