import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, ShieldCheck, Banknote, Headset, ArrowLeft, Flame } from 'lucide-react';
import StoreHeader from '../components/StoreHeader';
import StoreFooter from '../components/StoreFooter';
import ProductCard from '../components/ProductCard';
import { Spinner, EmptyState } from '../components/Ui';
import { useStore } from '../contexts/StoreContext';
import type { Product } from '../lib/types';

export default function HomePage() {
  const { get } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const primary = get('primary_color', '#0d9488');
  const heroTitle = get('hero_title', 'تسوّق بثقة — الدفع عند الاستلام');
  const heroSubtitle = get('hero_subtitle', 'منتجات أصلية مختارة بعناية، توصيل سريع لـ 58 ولاية، ومعاينة قبل الدفع.');

  useEffect(() => {
    fetch('/api/products?active=true')
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d) ? d : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <StoreHeader />
      {/* hero */}
      <section className="relative overflow-hidden text-white" style={{ background: `linear-gradient(135deg, #0f172a 0%, ${primary} 130%)` }}>
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-xs font-black backdrop-blur">
              <Flame size={14} /> عروض حصرية — الدفع عند الاستلام
            </span>
            <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">{heroTitle}</h1>
            <p className="mt-3 max-w-lg text-sm leading-7 text-white/85 sm:text-base">{heroSubtitle}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/shop" className="flex items-center gap-2 rounded-2xl bg-white px-7 py-3 text-sm font-black shadow-lg transition hover:opacity-90" style={{ color: primary }}>
                تسوق الآن <ArrowLeft size={16} />
              </Link>
            </div>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-3 text-center">
              {[
                { icon: Banknote, t: 'الدفع عند الاستلام' },
                { icon: Truck, t: 'توصيل 58 ولاية' },
                { icon: ShieldCheck, t: 'معاينة قبل الدفع' },
              ].map((f, i) => (
                <div key={i} className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  <f.icon size={22} className="mx-auto" />
                  <p className="mt-1.5 text-[11px] font-black leading-4">{f.t}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="relative hidden md:block">
            <img src="/hero-shopping.svg" alt="تسوق" className="mx-auto w-full max-w-md drop-shadow-2xl" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </motion.div>
        </div>
      </section>

      {/* trust strip */}
      <section className="mx-auto -mt-0 max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-3 py-8 md:grid-cols-4">
          {[
            { icon: Truck, t: 'توصيل سريع', d: '24 — 72 ساعة' },
            { icon: Banknote, t: 'الدفع عند الاستلام', d: 'ادفع بعد المعاينة' },
            { icon: ShieldCheck, t: 'جودة مضمونة', d: 'منتجات أصلية' },
            { icon: Headset, t: 'تأكيد هاتفي', d: 'نتواصل معك سريعاً' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: primary }}><f.icon size={20} /></span>
              <span><span className="block text-sm font-black text-slate-900">{f.t}</span><span className="text-xs text-slate-500">{f.d}</span></span>
            </div>
          ))}
        </div>
      </section>

      {/* products */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">منتجات مميزة</h2>
          <Link to="/shop" className="flex items-center gap-1 text-sm font-black" style={{ color: primary }}>عرض الكل <ArrowLeft size={15} /></Link>
        </div>
        {loading ? (
          <div className="rounded-2xl bg-white py-16"><Spinner size={40} /></div>
        ) : products.length === 0 ? (
          <EmptyState title="لا توجد منتجات بعد" desc="عد قريباً لاكتشاف عروضنا الجديدة" />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* how it works */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-5 text-center text-xl font-black text-slate-900 sm:text-2xl">كيف تطلب؟</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { n: '1', t: 'اختر منتجك', d: 'تصفح المتجر واختر المنتج والخيارات المناسبة (المقاس، اللون...).' },
            { n: '2', t: 'املأ معلوماتك', d: 'أدخل الاسم ورقم الهاتف واختر ولايتك وبلديتك ونوع التوصيل.' },
            { n: '3', t: 'استلم وادفع', d: 'نتصل بك للتأكيد، ثم يصلك طلبك لباب الدار وتدفع نقداً.' },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full text-lg font-black text-white" style={{ background: primary }}>{s.n}</span>
              <p className="mt-3 font-black text-slate-900">{s.t}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
      <StoreFooter />
    </div>
  );
}
