export function fileToResizedBase64(file: File, maxDim = 1200, quality = 0.85): Promise<{ base64: string; contentType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        const scale = Math.min(1, maxDim / Math.max(w, h));
        w = Math.max(1, Math.round(w * scale));
        h = Math.max(1, Math.round(h * scale));
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d');
        if (!ctx) { reject(new Error('canvas')); return; }
        ctx.drawImage(img, 0, 0, w, h);
        const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const url = c.toDataURL(type, quality);
        resolve({ base64: url.split(',')[1], contentType: type });
      };
      img.onerror = () => reject(new Error('bad image'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('read error'));
    reader.readAsDataURL(file);
  });
}

async function postUpload(fileName: string, fileBase64: string, contentType: string): Promise<string> {
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName, fileBase64, contentType }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || 'upload failed');
  }
  const data = await res.json();
  return data.url as string;
}

export async function uploadImage(file: File, folder = 'products'): Promise<string> {
  const { base64, contentType } = await fileToResizedBase64(file);
  const ext = contentType === 'image/png' ? 'png' : 'jpg';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  return postUpload(fileName, base64, contentType);
}

export async function uploadRaw(file: File, folder = 'landing'): Promise<string> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve((r.result as string).split(',')[1]);
    r.onerror = () => reject(new Error('read error'));
    r.readAsDataURL(file);
  });
  const safe = file.name.replace(/\s+/g, '_');
  const fileName = `${folder}/${Date.now()}-${safe}`;
  return postUpload(fileName, base64, file.type || 'application/octet-stream');
}
