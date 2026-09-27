import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let url = envUrl || '';
let anon = envAnon || '';

if (!url || !anon) {
  try {
    const r = await fetch('/api/config');
    const cfg = await r.json();
    url = cfg.url || '';
    anon = cfg.anon || '';
  } catch {
    /* offline build */
  }
}

const supabase: SupabaseClient = createClient(url || 'https://placeholder.supabase.co', anon || 'placeholder');

export default supabase;
