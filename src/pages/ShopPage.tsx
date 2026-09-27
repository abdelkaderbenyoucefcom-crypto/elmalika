import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import StoreHeader from '../components/StoreHeader';
import StoreFooter from '../components/StoreFooter';
import ProductCard from '../components/ProductCard';
import { Spinner, EmptyState } from '../components/Ui';
import type { Product } from '../lib/types';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('new');

  useEffect(() => {
    fetch('/api/products?active=true')
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d) ? d : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (q.trim()) list = list.filter((p) => p.title.includes(q.trim()));
    const priceOf = (p: Product) => (p.discount_price != null ? Number(p.discount_price) : Number(p.price));
    if (sort === 'cheap') list.sort((a, b) => priceOf(a) - priceOf(b));
    else if (sort === 'expensive') list.sort((a, b) => priceOf(b) - priceOf(a));
    return list;
  }, [products, q, sort]);

  return (
    <div className="min-h-screen bg-slate-50">
      <StoreHeader />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-black text-slate-900">جميع المنتجات</h1>
        <p className="mt-1 text-sm text-slate-500">{products.length} منتج متوفر — الدفع عند الاستلام</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={17} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن منتج..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm outline-none focus:border-teal-500" />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none">
            <option value="new">الأحدث أولاً</option>
            <option value="cheap">السعر: من الأقل</option>
            <option value="expensive">السعر: من الأعلى</option>
          </select>
        </div>
        <div className="mt-6">
          {loading ? (
            <div className="rounded-2xl bg-white py-16"><Spinner size={40} /></div>
          ) : filtered.length === 0 ? (
            <EmptyState title="لا توجد نتائج" desc="جرب كلمة بحث مختلفة" />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
      <StoreFooter />
    </div>
  );
}
