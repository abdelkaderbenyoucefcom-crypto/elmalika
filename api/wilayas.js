import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('wilayas').select('*').order('code', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'PUT') {
      const { code, home_price, desk_price, is_active } = req.body || {};
      if (code == null) return res.status(400).json({ error: 'code required' });
      const patch = {};
      if (home_price != null) patch.home_price = home_price;
      if (desk_price != null) patch.desk_price = desk_price;
      if (is_active !== undefined) patch.is_active = is_active;
      const { data, error } = await supabase.from('wilayas').update(patch).eq('code', code).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('wilayas API:', err);
    return res.status(500).json({ error: err.message });
  }
}
