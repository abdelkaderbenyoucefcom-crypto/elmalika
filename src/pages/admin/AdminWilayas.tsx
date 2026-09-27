import { useEffect, useState } from 'react';
import { Search, Save, Loader2 } from 'lucide-react';
import { Spinner, EmptyState } from '../../components/Ui';
import type { Wilaya } from '../../lib/types';

export default function AdminWilayas() {
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState<Record<number, { home: string; desk: string; active: boolean }>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/wilayas')
      .then((r) => r.json())
      .then((d) => {
        const list: Wilaya[] = Array.isArray(d) ? d : [];
        setWilayas(list);
        const m: Record<number, { home: string; desk: string; active: boolean }> = {};
        list.forEach((w) => { m[w.code] = { home: String(w.home_price), desk: String(w.desk_price), active: w.is_active }; });
        setDraft(m);
      })
      .catch(() => setWilayas([]))
      .finally(() => setLoading(false));
  }, []);

  const save = async (code: number) => {
    const d = draft[code];
    if (!d) return;
    setSaving(code);
    setMsg('');
    try {
      const res = await fetch('/api/wilayas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, home_price: Number(d.home), desk_price: Number(d.desk), is_active: d.active }),
      });
      if (!res.ok) throw new Error('فشل الحفظ');
      setWilayas((prev) => prev.map((w) => (w.code === code ? { ...w, home_price: Number(d.home), desk_price: Number(d.desk), is_active: d.active } : w)));
      setMsg(`تم حفظ ولاية ${code}`);
      setTimeout(() => setMsg(''), 2500);
    } catch {
      setMsg('فشل الحفظ');
    } finally {
      setSaving(null);
    }
  };

  const filtered = wilayas.filter((w) => !q.trim() || w.name_ar.includes(q.trim()) || String(w.code).includes(q.trim()));

  if (loading) return <div className="rounded-2xl bg-white py-20"><Spinner size={40} /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900 sm:text-2xl">الولايات وأسعار الشحن</h1>
        <p className="mt-1 text-sm text-slate-500">58 ولاية — عدّل سعر التوصيل للمنزل / للمكتب أو عطّل التوصيل لولاية معينة</p>
      </div>
      {msg && <p className="rounded-xl bg-emerald-50 p-2.5 text-center text-sm font-bold text-emerald-700">{msg}</p>}
      <div className="relative">
        <Search size={17} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث برقم أو اسم الولاية..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm outline-none focus:border-teal-500" />
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="لا توجد نتائج" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[70px_1fr_140px_140px_120px_90px] gap-2 border-b bg-slate-50 px-4 py-2.5 text-xs font-black text-slate-500 md:grid">
            <span>الرمز</span><span>الولاية</span><span>للمنزل (دج)</span><span>للمكتب (دج)</span><span>الحالة</span><span />
          </div>
          <div className="divide-y divide-slate-100">
            {filtered.map((w) => {
              const d = draft[w.code] || { home: String(w.home_price), desk: String(w.desk_price), active: w.is_active };
              const dirty = Number(d.home) !== Number(w.home_price) || Number(d.desk) !== Number(w.desk_price) || d.active !== w.is_active;
              return (
                <div key={w.code} className="grid grid-cols-[52px_1fr_auto] items-center gap-2 px-3 py-2.5 sm:px-4 md:grid-cols-[70px_1fr_140px_140px_120px_90px]">
                  <span className="flex h-9 w-12 items-center justify-center rounded-lg bg-slate-900 text-sm font-black text-white" dir="ltr">{String(w.code).padStart(2, '0')}</span>
                  <span className="truncate text-sm font-black text-slate-800">{w.name_ar}</span>
                  <div className="col-span-3 grid grid-cols-2 gap-2 md:col-span-1 md:grid-cols-[140px_140px_120px_90px] md:gap-2">
                    <input type="number" min={0} value={d.home} onChange={(e) => setDraft({ ...draft, [w.code]: { ...d, home: e.target.value } })} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none focus:border-teal-500" placeholder="للمنزل" />
                    <input type="number" min={0} value={d.desk} onChange={(e) => setDraft({ ...draft, [w.code]: { ...d, desk: e.target.value } })} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none focus:border-teal-500" placeholder="للمكتب" />
                    <button onClick={() => setDraft({ ...draft, [w.code]: { ...d, active: !d.active } })} className={`rounded-lg px-2 py-2 text-xs font-black ${d.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                      {d.active ? 'مفعّلة' : 'معطّلة'}
                    </button>
                    <button onClick={() => save(w.code)} disabled={saving === w.code || !dirty} className="flex items-center justify-center gap-1 rounded-lg bg-teal-600 px-2 py-2 text-xs font-black text-white hover:bg-teal-700 disabled:opacity-40">
                      {saving === w.code ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} حفظ
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
