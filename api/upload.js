import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { fileName, fileBase64, contentType } = req.body || {};
      if (!fileName || !fileBase64) return res.status(400).json({ error: 'fileName and fileBase64 required' });
      const buffer = Buffer.from(fileBase64, 'base64');
      if (buffer.length > 8 * 1024 * 1024) return res.status(400).json({ error: 'File too large (max 8MB)' });
      const { error } = await supabase.storage.from('product-media').upload(fileName, buffer, { contentType: contentType || 'application/octet-stream', upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('product-media').getPublicUrl(fileName);
      return res.status(200).json({ url: urlData.publicUrl });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('upload API:', err);
    return res.status(500).json({ error: err.message });
  }
}
