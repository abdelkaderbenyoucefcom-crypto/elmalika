import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fmtPrice, DEFAULT_COLORS } from '../lib/utils';
import type { Product } from '../lib/types';

export default function ProductCard({ product }: { product: Product }) {
  const images = product.images?.length ? product.images : (product.manual_media_url && product.landing_type === 'manual_image' ? [product.manual_media_url] : ['/placeholder-product.svg']);
  const price = product.discount_price != null ? Number(product.discount_price) : Number(product.price);
  const primary = product.generated_colors?.primary || DEFAULT_COLORS.primary;
  return (
    <Link to={`/p/${product.slug}`} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative overflow-hidden">
        <img src={images[0]} alt={product.title} className="aspect-square w-full object-cover transition group-hover:scale-105" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }} />
        {product.discount_price != null && (
          <span className="absolute right-2 top-2 rounded-full bg-red-600 px-2.5 py-1 text-xs font-black text-white shadow">
            -{Math.round((1 - Number(product.discount_price) / Number(product.price)) * 100)}%
          </span>
        )}
      </div>
      <div className="p-3.5">
        <h3 className="line-clamp-2 min-h-[2.6rem] text-sm font-black leading-5 text-slate-900">{product.title}</h3>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <span className="text-lg font-black" style={{ color: primary }}>{fmtPrice(price)}</span>
            {product.discount_price != null && <span className="mr-2 text-xs text-slate-400 line-through">{fmtPrice(product.price)}</span>}
          </div>
        </div>
        <span className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-black text-white transition group-hover:opacity-90" style={{ background: primary }}>
          <ShoppingBag size={15} /> اطلب الآن
        </span>
      </div>
    </Link>
  );
}
