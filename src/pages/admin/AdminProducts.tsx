import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, Sparkles, Search } from 'lucide-react';
import { Spinner, EmptyState } from '../../components/Ui';
import { fmtPrice, DEFAULT_COLORS } from '../../lib/utils';
import type { Product } from '../../lib/types';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      setProducts(await res.json());
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (p: Product) => {
    setBusy(p.id);
    await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, is_active: !p.is_active }) });
    setBusy('');
    load();
  };

  const remove = async (p: Product) => {
    if (!confirm(`حذف المنتج "${p.title}" نهائياً؟`)) return;
    setBusy(p.id);
    await fetch('/api/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id }) });
    setBusy('');
    load();
  };

  const filtered = products.filter((p) => !q.trim() || p.title.includes(q.trim()));

  if (loading) return <div className="rounded-2xl bg-white py-20"><Spinner size={40} /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 sm:text-2xl">المنتجات</h1>
          <p className="mt-1 text-sm text-slate-500">{products.length} منتج</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/products/ai-new" className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow transition hover:bg-violet-700">
            <Sparkles size={16} /> توليد بالذكاء الاصطناعي
          </Link>
          <Link to="/admin/products/new" className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow transition hover:bg-teal-700">
            <Plus size={16} /> منتج جديد
          </Link>
        </div>
      </div>

      <div className="relative">
        <Search size={17} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث في المنتجات..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm outline-none focus:border-teal-500" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="لا توجد منتجات" desc="أضف منتجك الأول عبر الزر أعلاه" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {filtered.map((p) => {
              const img = p.images?.[0] || (p.landing_type === 'manual_image' ? p.manual_media_url : null) || '/placeholder-product.svg';
              return (
                <div key={p.id} className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
                  <img src={img} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover sm:h-20 sm:w-20" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-slate-900 sm:text-base">{p.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400" dir="ltr">/p/{p.slug}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-black" style={{ color: p.generated_colors?.primary || DEFAULT_COLORS.primary }}>{fmtPrice(p.discount_price ?? p.price)}</span>
                      {p.discount_price != null && <span className="text-xs text-slate-400 line-through">{fmtPrice(p.price)}</span>}
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${p.landing_type === 'ai_generated' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
                        {p.landing_type === 'ai_generated' ? 'صفحة AI' : p.landing_type === 'manual_pdf' ? 'PDF يدوي' : 'صورة يدوية'}
                      </span>
                      {p.has_variants && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">متعدد الخيارات</span>}
                      {!p.is_active && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">موقوف</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
                    <Link to={`/p/${p.slug}`} target="_blank" title="معاينة" className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"><ExternalLink size={16} /></Link>
                    <Link to={`/admin/products/edit/${p.id}`} title="تعديل" className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"><Pencil size={16} /></Link>
                    <button onClick={() => toggleActive(p)} disabled={busy === p.id} title={p.is_active ? 'إيقاف' : 'تفعيل'} className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 disabled:opacity-50">
                      {p.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button onClick={() => remove(p)} disabled={busy === p.id} title="حذف" className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50"><Trash2 size={16} /></button>
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
