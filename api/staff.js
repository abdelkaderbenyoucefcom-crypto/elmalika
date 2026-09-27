import supabase from './db-client.js';

async function attachAvatars(rows) {
  const list = Array.isArray(rows) ? rows : (rows ? [rows] : []);
  if (!list.length) return rows;
  const emails = [...new Set(list.map((r) => String(r.email || '').toLowerCase()))];
  const { data: avs } = await supabase.from('staff_avatars').select('email, avatar_url').in('email', emails);
  const map = {};
  (avs || []).forEach((a) => { map[String(a.email).toLowerCase()] = a.avatar_url; });
  return list.map((r) => ({ ...r, avatar_url: map[String(r.email || '').toLowerCase()] || null }));
}

async function saveAvatar(email, avatarUrl) {
  const key = String(email).toLowerCase().trim();
  if (!key) return;
  if (!avatarUrl) {
    await supabase.from('staff_avatars').delete().eq('email', key);
    return;
  }
  const { data: existing } = await supabase.from('staff_avatars').select('email').eq('email', key).single();
  if (existing) {
    await supabase.from('staff_avatars').update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() }).eq('email', key);
  } else {
    await supabase.from('staff_avatars').insert({ email: key, avatar_url: avatarUrl });
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { email } = req.query;
      let q = supabase.from('staff_roles').select('*').order('created_at', { ascending: true });
      if (email) q = q.eq('email', String(email).toLowerCase());
      const { data, error } = await q;
      if (error) throw error;
      const withAv = await attachAvatars(data);
      if (email) return res.status(200).json(withAv[0] || null);
      return res.status(200).json(withAv);
    }
    if (req.method === 'POST') {
      const { email, display_name, role, avatar_url } = req.body || {};
      if (!email || !role) return res.status(400).json({ error: 'email and role required' });
      const { data, error } = await supabase.from('staff_roles').insert({
        email: String(email).toLowerCase().trim(),
        display_name: display_name || String(email).split('@')[0],
        role,
        is_active: true,
      }).select().single();
      if (error) throw error;
      if (avatar_url) await saveAvatar(data.email, avatar_url);
      const [row] = await attachAvatars([data]);
      return res.status(201).json(row);
    }
    if (req.method === 'PUT') {
      const { id, display_name, role, is_active, avatar_url } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const patch = {};
      if (display_name !== undefined) patch.display_name = display_name;
      if (role !== undefined) patch.role = role;
      if (is_active !== undefined) patch.is_active = is_active;
      const { data, error } = await supabase.from('staff_roles').update(patch).eq('id', id).select().single();
      if (error) throw error;
      if (avatar_url !== undefined) await saveAvatar(data.email, avatar_url || null);
      const [row] = await attachAvatars([data]);
      return res.status(200).json(row);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const { data: row } = await supabase.from('staff_roles').select('email').eq('id', id).single();
      const { error } = await supabase.from('staff_roles').delete().eq('id', id);
      if (error) throw error;
      if (row?.email) await supabase.from('staff_avatars').delete().eq('email', String(row.email).toLowerCase());
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('staff API:', err);
    return res.status(500).json({ error: err.message });
  }
}
