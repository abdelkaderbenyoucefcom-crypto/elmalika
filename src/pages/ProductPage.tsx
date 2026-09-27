import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import StoreHeader from '../components/StoreHeader';
import StoreFooter from '../components/StoreFooter';
import LandingPreview from '../components/LandingPreview';
import OrderForm from '../components/OrderForm';
import { Spinner, EmptyState } from '../components/Ui';
import { useStore } from '../contexts/StoreContext';
import type { Product, Wilaya } from '../lib/types';

export default function ProductPage() {
  const { slug } = useParams();
  const { get } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [variantImage, setVariantImage] = useState<string | undefined>(undefined);
  const storePrimary = get('primary_color', '#0d9488');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/products?slug=${encodeURIComponent(slug || '')}`).then((r) => r.json()),
      fetch('/api/wilayas').then((r) => r.json()).catch(() => []),
    ])
      .then(([p, w]) => {
        if (!p || !p.is_active) setNotFound(true);
        else setProduct(p);
        setWilayas(Array.isArray(w) ? w : []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const scrollToOrder = () => document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StoreHeader />
        <div className="mx-auto max-w-3xl px-4 py-20"><Spinner size={44} /></div>
        <StoreFooter />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StoreHeader />
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <EmptyState title="المنتج غير موجود" desc="ربما تم حذفه أو إيقافه مؤقتاً" />
          <Link to="/shop" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white">
            <ArrowRight size={16} /> العودة للمتجر
          </Link>
        </div>
        <StoreFooter />
      </div>
    );
  }

  const accent = product.generated_colors?.primary || storePrimary;

  // Manual landing (image / PDF designed in Canva / Photoshop)
  if (product.landing_type !== 'ai_generated') {
    const url = product.manual_media_url || (product.images?.[0] ?? '');
    return (
      <div className="min-h-screen bg-slate-100">
        <StoreHeader />
        <div className="mx-auto max-w-3xl px-3 py-4 sm:px-4">
          <div className="overflow-hidden rounded-2xl bg-white shadow">
            {product.landing_type === 'manual_pdf' ? (
              url ? <iframe src={url} title={product.title} className="h-[75vh] w-full" /> : <EmptyState title="لا يوجد ملف مرفوع" />
            ) : url ? (
              <img src={url} alt={product.title} className="w-full" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }} />
            ) : (
              <EmptyState title="لا توجد صورة مرفوعة" />
            )}
          </div>
          <div className="mt-4">
            <OrderForm product={product} wilayas={wilayas} accent={accent} />
          </div>
        </div>
        {/* sticky buy button */}
        <button
          onClick={scrollToOrder}
          className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-center gap-2 rounded-2xl py-4 text-lg font-black text-white shadow-2xl transition hover:opacity-95"
          style={{ background: `linear-gradient(135deg, ${accent}, #0f172a)` }}
        >
          <ShoppingBag size={20} /> اشتري الآن
        </button>
        <div className="h-20" />
        <StoreFooter />
      </div>
    );
  }

  // AI generated landing
  return (
    <div className="min-h-screen bg-slate-50">
      <StoreHeader />
      <div className="mx-auto max-w-3xl px-3 py-4 sm:px-4">
        <LandingPreview product={product} onOrder={scrollToOrder} heroImage={variantImage} />
        <div className="mt-4">
          <OrderForm product={product} wilayas={wilayas} accent={accent} onVariantImage={setVariantImage} />
        </div>
      </div>
      <StoreFooter />
    </div>
  );
}
