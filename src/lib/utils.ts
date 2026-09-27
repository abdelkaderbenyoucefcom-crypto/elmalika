import type { ImageLayout, ProductCategory, ProductColors } from './types';

export function fmtPrice(n: number | string | null | undefined): string {
  const v = Number(n || 0);
  return `${v.toLocaleString('en-US')} دج`;
}

export function shortId(id: string): string {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

export function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ar-DZ', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export const STATUS_META: Record<string, { label: string; classes: string; dot: string }> = {
  pending: { label: 'قيد الانتظار', classes: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  confirmed: { label: 'مؤكد', classes: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
  shipped: { label: 'تم الشحن', classes: 'bg-violet-100 text-violet-800 border-violet-200', dot: 'bg-violet-500' },
  delivered: { label: 'تم التوصيل', classes: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
  returned: { label: 'مرتجع', classes: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500' },
  cancelled: { label: 'ملغي', classes: 'bg-slate-200 text-slate-700 border-slate-300', dot: 'bg-slate-500' },
};

export function statusLabel(s: string): string {
  return STATUS_META[s]?.label || s;
}

export const DEFAULT_COLORS = { primary: '#0d9488', secondary: '#f0fdfa', accent: '#f59e0b' };

export const FONT_OPTIONS = [
  { value: 'Tajawal', label: 'Tajawal (الافتراضي)', stack: "'Tajawal', sans-serif" },
  { value: 'Cairo', label: 'Cairo', stack: "'Cairo', sans-serif" },
  { value: 'Almarai', label: 'Almarai', stack: "'Almarai', sans-serif" },
  { value: 'IBM Plex Sans Arabic', label: 'IBM Plex Sans Arabic', stack: "'IBM Plex Sans Arabic', sans-serif" },
];

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string; hint: string }[] = [
  { value: 'fashion', label: 'ألبسة وأحذية', hint: 'ألوان مع صور + مقاسات' },
  { value: 'accessories', label: 'إكسسوارات', hint: 'خيارات مخصصة لكل منتج' },
  { value: 'home', label: 'منزلية وعامة', hint: 'الخصائص اختيارية' },
  { value: 'general', label: 'عام', hint: 'بدون خيارات افتراضياً' },
];

export const IMAGE_LAYOUTS: { value: ImageLayout; label: string }[] = [
  { value: 'gallery', label: 'معرض تفاعلي' },
  { value: 'stacked', label: 'متتالي عمودي' },
  { value: 'grid', label: 'شبكي' },
];

export function productLayout(p: { image_layout?: ImageLayout | null; generated_colors?: ProductColors | null }): ImageLayout {
  return p.image_layout || p.generated_colors?.layout || 'stacked';
}

export function productCategory(p: { category?: ProductCategory | null; generated_colors?: ProductColors | null }): ProductCategory {
  return p.category || p.generated_colors?.category || 'general';
}

export function categoryLabel(v: string): string {
  return PRODUCT_CATEGORIES.find((c) => c.value === v)?.label || v;
}
