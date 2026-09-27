import supabase from './db-client.js';

const PHONE_RE = /^0(5|6|7)[0-9]{8}$/;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { status, id, limit } = req.query;
      let q = supabase.from('orders').select('*, products(title, slug)').order('created_at', { ascending: false });
      if (status) q = q.eq('status', status);
      if (id) q = q.eq('id', id);
      if (limit) q = q.limit(parseInt(limit, 10));
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const b = req.body || {};
      const { product_id, customer_name, customer_phone, wilaya_code, commune_name, address, shipping_type, selected_variant, quantity } = b;
      if (!product_id || !customer_name || !customer_phone || !wilaya_code || !commune_name || !shipping_type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      if (!PHONE_RE.test(String(customer_phone).trim())) {
        return res.status(400).json({ error: 'Invalid Algerian phone number' });
      }
      const qty = Math.max(1, Math.min(20, parseInt(quantity, 10) || 1));
      const { data: product, error: pErr } = await supabase.from('products').select('*').eq('id', product_id).single();
      if (pErr || !product) return res.status(400).json({ error: 'Product not found' });
      if (!product.is_active) return res.status(400).json({ error: 'Product not available' });
      const { data: wilaya, error: wErr } = await supabase.from('wilayas').select('*').eq('code', parseInt(wilaya_code, 10)).single();
      if (wErr || !wilaya) return res.status(400).json({ error: 'Wilaya not found' });
      if (!wilaya.is_active) return res.status(400).json({ error: 'Delivery unavailable for this wilaya' });
      let unit = product.discount_price != null ? Number(product.discount_price) : Number(product.price);
      if (selected_variant && Array.isArray(product.variants_data)) {
        const match = product.variants_data.find((v) => {
          const opts = v.options || {};
          return Object.keys(opts).length > 0 && Object.keys(opts).every((k) => String(selected_variant[k]) === String(opts[k]));
        });
        if (match && match.price != null) unit = Number(match.price);
      }
      const ship = shipping_type === 'desk' ? Number(wilaya.desk_price) : Number(wilaya.home_price);
      const total = unit * qty + ship;
      const { data, error } = await supabase.from('orders').insert({
        product_id,
        customer_name: String(customer_name).trim(),
        customer_phone: String(customer_phone).trim(),
        wilaya_code: parseInt(wilaya_code, 10),
        commune_name: String(commune_name).trim(),
        address: address ? String(address).trim() : null,
        shipping_type,
        selected_variant: selected_variant || null,
        quantity: qty,
        product_price: unit,
        shipping_price: ship,
        total_price: total,
        status: 'pending',
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, status, notes } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const patch = {};
      if (status) patch.status = status;
      if (notes !== undefined) patch.notes = notes;
      const { data, error } = await supabase.from('orders').update(patch).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('orders API:', err);
    return res.status(500).json({ error: err.message });
  }
}
