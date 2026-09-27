import supabase from './db-client.js';

// Real columns on public.products. The frontend also sends `category` and
// `image_layout` for convenience — those live inside generated_colors
// ({ category, layout }) and MUST be folded in here, otherwise PostgREST
// throws "Could not find the 'category' column ... in the schema cache".
const ALLOWED = new Set([
  'title', 'slug', 'price', 'discount_price', 'subtitle', 'description',
  'landing_type', 'manual_media_url', 'ai_generated', 'generated_colors',
  'features', 'testimonials', 'faqs', 'has_variants', 'variant_options',
  'variants_data', 'images', 'countdown_end', 'countdown_message',
  'countdown_active', 'is_active',
]);

// Merge duplicate option groups with the same name (legacy corruption:
// several "اللون" groups each holding one value). Keeps single group per name.
function dedupeOptions(opts) {
  if (!Array.isArray(opts)) return opts;
  const out = [];
  for (const o of opts) {
    if (!o || !o.name) continue;
    const values = Array.isArray(o.values) ? o.values.filter(Boolean) : [];
    const colors = Array.isArray(o.colors) ? o.colors : [];
    const ex = out.find((x) => x.name === o.name);
    if (ex) {
      ex.values = [...new Set([...ex.values, ...values])];
      ex.colors = [...(ex.colors || []), ...colors];
    } else {
      out.push({ ...o, name: o.name, values: [...new Set(values)], colors });
    }
  }
  return out;
}

function sanitize(body) {
  const src = body || {};
  const out = {};
  for (const k of Object.keys(src)) {
    if (k === 'id') continue;
    if (ALLOWED.has(k)) out[k] = src[k];
  }
  if (Array.isArray(out.variant_options)) out.variant_options = dedupeOptions(out.variant_options);
  if (src.category || src.image_layout) {
    out.generated_colors = {
      ...(out.generated_colors && typeof out.generated_colors === 'object' ? out.generated_colors : {}),
      ...(src.category ? { category: src.category } : {}),
      ...(src.image_layout ? { layout: src.image_layout } : {}),
    };
  }
  return out;
}

// Backfill virtual fields so the frontend always gets category / image_layout.
function withVirtual(row) {
  if (!row) return row;
  const gc = (row.generated_colors && typeof row.generated_colors === 'object') ? row.generated_colors : {};
  return {
    ...row,
    variant_options: dedupeOptions(row.variant_options),
    category: gc.category || 'general',
    image_layout: gc.layout || 'stacked',
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { slug, id, active } = req.query;
      let q = supabase.from('products').select('*').order('created_at', { ascending: false });
      if (slug) q = q.eq('slug', slug);
      if (id) q = q.eq('id', id);
      if (active === 'true') q = q.eq('is_active', true);
      const { data, error } = await q;
      if (error) throw error;
      if (slug || id) return res.status(200).json(withVirtual(data[0] || null));
      return res.status(200).json((data || []).map(withVirtual));
    }
    if (req.method === 'POST') {
      const body = req.body || {};
      if (!body.title || !body.slug || body.price == null) {
        return res.status(400).json({ error: 'title, slug and price are required' });
      }
      const { data, error } = await supabase.from('products').insert(sanitize(body)).select().single();
      if (error) throw error;
      return res.status(201).json(withVirtual(data));
    }
    if (req.method === 'PUT') {
      const { id, ...rest } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const { data, error } = await supabase.from('products').update({ ...sanitize(rest), updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(withVirtual(data));
    }
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('products API:', err);
    return res.status(500).json({ error: err.message });
  }
}
