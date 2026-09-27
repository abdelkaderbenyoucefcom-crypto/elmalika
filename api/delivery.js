import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { action, id } = req.query;
      if (action === 'test' && id) {
        const { data: company, error } = await supabase.from('delivery_settings').select('*').eq('id', id).single();
        if (error || !company) return res.status(404).json({ error: 'Company not found' });
        if (!company.api_url) return res.status(400).json({ error: 'No API URL configured' });
        try {
          const r = await fetch(company.api_url, {
            method: 'GET',
            headers: { 'X-API-Key': company.api_key || '', 'X-API-Token': company.api_token || '' },
          });
          const text = await r.text().catch(() => '');
          return res.status(200).json({ ok: r.ok, status: r.status, snippet: text.slice(0, 300) });
        } catch (e) {
          return res.status(200).json({ ok: false, error: e.message });
        }
      }
      const { data, error } = await supabase.from('delivery_settings').select('*').order('id', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { action } = req.query;
      if (action === 'export') {
        const { company_id, order_ids } = req.body || {};
        if (!company_id || !Array.isArray(order_ids) || order_ids.length === 0) {
          return res.status(400).json({ error: 'company_id and order_ids required' });
        }
        const { data: company, error: cErr } = await supabase.from('delivery_settings').select('*').eq('id', company_id).single();
        if (cErr || !company) return res.status(404).json({ error: 'Company not found' });
        const { data: orders, error: oErr } = await supabase.from('orders').select('*, products(title)').in('id', order_ids);
        if (oErr) throw oErr;
        const payload = (orders || []).map((o) => ({
          order_id: o.id,
          product: o.products?.title || '',
          customer_name: o.customer_name,
          customer_phone: o.customer_phone,
          wilaya_code: o.wilaya_code,
          commune: o.commune_name,
          address: o.address,
          shipping_type: o.shipping_type,
          quantity: o.quantity,
          cod_amount: Number(o.total_price),
          variant: o.selected_variant,
        }));
        if (!company.api_url) {
          return res.status(200).json({ attempted: false, message: 'No API URL configured — payload prepared only', count: payload.length, payload });
        }
        try {
          const r = await fetch(company.api_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-API-Key': company.api_key || '', 'X-API-Token': company.api_token || '' },
            body: JSON.stringify({ orders: payload }),
          });
          const text = await r.text().catch(() => '');
          return res.status(200).json({ attempted: true, ok: r.ok, status: r.status, count: payload.length, response: text.slice(0, 500) });
        } catch (e) {
          return res.status(200).json({ attempted: true, ok: false, error: e.message, count: payload.length, payload });
        }
      }
      const { company_name, api_url, api_key, api_token } = req.body || {};
      if (!company_name) return res.status(400).json({ error: 'company_name required' });
      const { data, error } = await supabase.from('delivery_settings').insert({
        company_name, api_url: api_url || null, api_key: api_key || null, api_token: api_token || null, is_active: true,
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, company_name, api_url, api_key, api_token, is_active } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const patch = {};
      if (company_name !== undefined) patch.company_name = company_name;
      if (api_url !== undefined) patch.api_url = api_url || null;
      if (api_key !== undefined) patch.api_key = api_key || null;
      if (api_token !== undefined) patch.api_token = api_token || null;
      if (is_active !== undefined) patch.is_active = is_active;
      const { data, error } = await supabase.from('delivery_settings').update(patch).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const { error } = await supabase.from('delivery_settings').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('delivery API:', err);
    return res.status(500).json({ error: err.message });
  }
}
