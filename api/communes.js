import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { wilaya_code } = req.query;
      let q = supabase.from('communes').select('*').order('id', { ascending: true });
      if (wilaya_code) q = q.eq('wilaya_code', parseInt(wilaya_code, 10));
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('communes API:', err);
    return res.status(500).json({ error: err.message });
  }
}
