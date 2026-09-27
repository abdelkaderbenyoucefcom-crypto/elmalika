import { useState, type SyntheticEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { productLayout } from '../lib/utils';
import type { Product } from '../lib/types';

interface Props {
  product: Product;
  images: string[];
  heroImage?: string;
  discountPct?: number;
}

const onErr = (e: SyntheticEvent<HTMLImageElement>) => {
  (e.target as HTMLImageElement).src = '/placeholder-product.svg';
};

export default function ProductGallery({ product, images, heroImage, discountPct = 0 }: Props) {
  const [img, setImg] = useState(0);
  const layout = productLayout(product);
  const colors = product.generated_colors || { primary: '#0d9488', accent: '#f59e0b' };
  const n = images.length;

  const badge = discountPct > 0 ? (
    <span className="absolute right-3 top-3 z-10 rounded-full px-3 py-1 text-sm font-black text-white shadow" style={{ background: colors.accent }}>
      خصم {discountPct}%
    </span>
  ) : null;

  if (layout === 'stacked') {
    return (
      <div className="space-y-3">
        {heroImage && (
          <div className="overflow-hidden rounded-2xl shadow-lg" style={{ boxShadow: `0 8px 24px -8px ${colors.primary}` }}>
            <img src={heroImage} alt={product.title} className="w-full object-cover" onError={onErr} />
          </div>
        )}
        {images.map((u, i) => (
          <div key={i} className="relative overflow-hidden rounded-2xl shadow">
            {i === 0 && badge}
            <img src={u} alt={`${product.title} ${i + 1}`} className="w-full object-cover" loading={i > 1 ? 'lazy' : 'eager'} onError={onErr} />
          </div>
        ))}
      </div>
    );
  }

  if (layout === 'grid') {
    return (
      <div className={`grid gap-2 ${n === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {heroImage && (
          <div className="col-span-full overflow-hidden rounded-2xl shadow-lg" style={{ boxShadow: `0 8px 24px -8px ${colors.primary}` }}>
            <img src={heroImage} alt={product.title} className="aspect-video w-full object-cover" onError={onErr} />
          </div>
        )}
        {images.map((u, i) => (
          <div key={i} className={`relative overflow-hidden rounded-2xl shadow ${i === 0 && n > 1 ? 'col-span-2' : ''}`}>
            {i === 0 && badge}
            <img src={u} alt={`${product.title} ${i + 1}`} className={`w-full object-cover ${i === 0 && n > 1 ? 'aspect-video' : 'aspect-square'}`} loading={i > 2 ? 'lazy' : 'eager'} onError={onErr} />
          </div>
        ))}
      </div>
    );
  }

  // gallery
  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl shadow-lg">
        {badge}
        <img src={heroImage || images[img]} alt={product.title} className="aspect-square w-full object-cover" onError={onErr} />
        {n > 1 && !heroImage && (
          <>
            <button onClick={() => setImg((img + 1) % n)} aria-label="التالي" className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/60">
              <ChevronRight size={20} />
            </button>
            <button onClick={() => setImg((img - 1 + n) % n)} aria-label="السابق" className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/60">
              <ChevronLeft size={20} />
            </button>
            <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-2.5 py-0.5 text-[11px] font-black text-white" dir="ltr">
              {img + 1} / {n}
            </span>
          </>
        )}
      </div>
      {n > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {images.map((u, i) => (
            <button key={i} onClick={() => setImg(i)} className={`h-14 w-14 overflow-hidden rounded-lg border-2 transition ${i === img && !heroImage ? 'border-current' : 'border-transparent opacity-60 hover:opacity-100'}`} style={{ color: colors.primary }}>
              <img src={u} alt="" className="h-full w-full object-cover" onError={onErr} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
