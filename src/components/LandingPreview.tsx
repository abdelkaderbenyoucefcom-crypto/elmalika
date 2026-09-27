import { useState } from 'react';
import { Star, CheckCircle2, ChevronDown, ShieldCheck, Truck, Banknote } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import ProductGallery from './ProductGallery';
import { fmtPrice } from '../lib/utils';
import type { Product } from '../lib/types';

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} className={i <= n ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
      ))}
    </span>
  );
}

export default function LandingPreview({ product, onOrder, heroImage }: { product: Product; onOrder?: () => void; heroImage?: string }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const colors = product.generated_colors || { primary: '#0d9488', secondary: '#f0fdfa', accent: '#f59e0b' };
  const price = product.discount_price != null ? Number(product.discount_price) : Number(product.price);
  const images = product.images?.length ? product.images : ['/placeholder-product.svg'];
  const discountPct = product.discount_price != null ? Math.round((1 - Number(product.discount_price) / Number(product.price)) * 100) : 0;

  const scrollToOrder = () => {
    if (onOrder) { onOrder(); return; }
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* hero */}
      <div className="p-5 text-center sm:p-8" style={{ background: `linear-gradient(180deg, ${colors.secondary}, #ffffff)` }}>
        {product.countdown_active && product.countdown_end && (
          <div className="mb-4"><CountdownTimer end={product.countdown_end} message={product.countdown_message} variant="inline" /></div>
        )}
        <h1 className="text-2xl font-black leading-snug text-slate-900 sm:text-3xl">{product.title}</h1>
        {product.subtitle && <p className="mt-2 text-base font-bold" style={{ color: colors.primary }}>{product.subtitle}</p>}
        <div className="mx-auto mt-5 max-w-md">
          <ProductGallery product={product} images={images} heroImage={heroImage} discountPct={discountPct} />
        </div>
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="text-3xl font-black" style={{ color: colors.primary }}>{fmtPrice(price)}</span>
          {product.discount_price != null && <span className="text-lg text-slate-400 line-through">{fmtPrice(product.price)}</span>}
        </div>
        <button onClick={scrollToOrder} className="mt-4 w-full max-w-md rounded-2xl px-8 py-3.5 text-lg font-black text-white shadow-lg transition hover:opacity-90 sm:w-auto sm:min-w-[280px]" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}>
          اطلب الآن — الدفع عند الاستلام
        </button>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-bold text-slate-500">
          <span className="flex items-center gap-1"><Truck size={14} className="text-emerald-500" /> توصيل لـ 58 ولاية</span>
          <span className="flex items-center gap-1"><Banknote size={14} className="text-emerald-500" /> الدفع عند الاستلام</span>
          <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-500" /> معاينة قبل الدفع</span>
        </div>
      </div>

      {/* description */}
      {product.description && (
        <div className="border-t border-slate-100 px-5 py-7 sm:px-8">
          <h2 className="mb-3 text-xl font-black text-slate-900">لماذا ستحب هذا المنتج؟</h2>
          <p className="whitespace-pre-line text-sm leading-7 text-slate-600">{product.description}</p>
        </div>
      )}

      {/* features */}
      {product.features?.length > 0 && (
        <div className="px-5 py-7 sm:px-8" style={{ background: colors.secondary }}>
          <h2 className="mb-5 text-center text-xl font-black text-slate-900">المميزات الرئيسية</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {product.features.map((f, i) => (
              <div key={i} className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: colors.primary }}><CheckCircle2 size={18} /></span>
                <span>
                  <span className="block text-sm font-black text-slate-900">{f.title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-slate-500">{f.desc}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* countdown big */}
      {product.countdown_active && product.countdown_end && (
        <div className="px-5 py-7 sm:px-8">
          <CountdownTimer end={product.countdown_end} message={product.countdown_message} />
        </div>
      )}

      {/* testimonials */}
      {product.testimonials?.length > 0 && (
        <div className="border-t border-slate-100 px-5 py-7 sm:px-8">
          <h2 className="mb-5 text-center text-xl font-black text-slate-900">ماذا قال زبائننا؟</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {product.testimonials.map((t, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <Stars n={t.rating} />
                <p className="mt-2 text-sm leading-6 text-slate-600">"{t.text}"</p>
                <p className="mt-3 text-xs font-black text-slate-800">{t.name} <span className="font-bold text-slate-400">— {t.wilaya}</span></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* faqs */}
      {product.faqs?.length > 0 && (
        <div className="border-t border-slate-100 px-5 py-7 sm:px-8">
          <h2 className="mb-4 text-center text-xl font-black text-slate-900">الأسئلة الشائعة</h2>
          <div className="mx-auto max-w-2xl space-y-2">
            {product.faqs.map((f, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-slate-200">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-2 bg-white px-4 py-3 text-right text-sm font-black text-slate-800">
                  {f.q}
                  <ChevronDown size={16} className={`shrink-0 transition ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <p className="bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">{f.a}</p>}
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button onClick={scrollToOrder} className="rounded-2xl px-10 py-3.5 text-lg font-black text-white shadow-lg transition hover:opacity-90" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}>
              اطلب الآن — {fmtPrice(price)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
