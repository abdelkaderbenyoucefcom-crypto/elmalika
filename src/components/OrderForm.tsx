import { useEffect, useMemo, useState } from 'react';
import { Minus, Plus, CheckCircle2, Truck, Home, Building2, Phone, User, MapPin, Loader2 } from 'lucide-react';
import { fmtPrice, shortId } from '../lib/utils';
import { Field, inputCls } from './Ui';
import type { ColorMeta, Commune, Order, Product, Wilaya } from '../lib/types';

interface Props {
  product: Product;
  wilayas: Wilaya[];
  accent?: string;
  onVariantImage?: (img: string | undefined) => void;
}

const PHONE_RE = /^0(5|6|7)[0-9]{8}$/;

function isColorOption(name: string): boolean {
  return /لون|color|couleur/i.test(name);
}

export default function OrderForm({ product, wilayas, accent, onVariantImage }: Props) {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilayaCode, setWilayaCode] = useState('');
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [shipType, setShipType] = useState<'home' | 'desk'>('home');
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Order | null>(null);
  const [serverError, setServerError] = useState('');

  const color = accent || product.generated_colors?.primary || '#0d9488';

  // Dedupe option groups by name (legacy rows may contain duplicate group
  // entries, e.g. several "اللون" groups each holding one value).
  const variantOptions = useMemo(() => {
    const out: { name: string; values: string[]; colors?: ColorMeta[] }[] = [];
    for (const o of product.variant_options || []) {
      const name = String(o?.name || '').trim();
      if (!name) continue;
      const values = Array.isArray(o.values) ? o.values.filter(Boolean) : [];
      const colors = Array.isArray(o.colors) ? o.colors : [];
      const ex = out.find((x) => x.name === name);
      if (ex) {
        ex.values = [...new Set([...ex.values, ...values])];
        ex.colors = [...(ex.colors || []), ...colors];
      } else {
        out.push({ name, values: [...new Set(values)], colors });
      }
    }
    return out;
  }, [product.variant_options]);

  const matchedVariant = useMemo(() => {
    if (!product.has_variants || !product.variants_data?.length) return null;
    const exact = product.variants_data.find((v) => {
      const keys = Object.keys(v.options || {});
      return keys.length > 0 && keys.every((k) => options[k] === v.options[k]);
    });
    if (exact) return exact;
    // Fallback: match by the single selected value when legacy rows store
    // partial combination data.
    const sel = Object.values(options).filter(Boolean).map(String);
    if (sel.length === 0) return null;
    return product.variants_data.find((v) => {
      const vals = Object.values(v.options || {}).map(String);
      return sel.every((s) => vals.includes(s));
    }) || null;
  }, [options, product]);

  const activeVariantImage = useMemo(() => {
    if (matchedVariant?.image_url) return matchedVariant.image_url;
    for (const o of variantOptions) {
      const sel = options[o.name];
      if (!sel) continue;
      const meta = (o.colors || []).find((c: ColorMeta) => c.value === sel);
      if (meta?.image) return meta.image;
    }
    return undefined;
  }, [matchedVariant, options, variantOptions]);

  useEffect(() => {
    onVariantImage?.(activeVariantImage);
  }, [activeVariantImage, onVariantImage]);

  const unitPrice = matchedVariant?.price != null ? Number(matchedVariant.price) : (product.discount_price != null ? Number(product.discount_price) : Number(product.price));
  const wilaya = wilayas.find((w) => String(w.code) === String(wilayaCode));
  const shipPrice = wilaya ? (shipType === 'desk' ? Number(wilaya.desk_price) : Number(wilaya.home_price)) : 0;
  const total = unitPrice * qty + (wilaya ? shipPrice : 0);
  const outOfStock = matchedVariant != null && Number(matchedVariant.stock) <= 0;

  useEffect(() => {
    setCommune('');
    if (!wilayaCode) { setCommunes([]); return; }
    setLoadingCommunes(true);
    fetch(`/api/communes?wilaya_code=${wilayaCode}`)
      .then((r) => r.json())
      .then((d) => setCommunes(Array.isArray(d) ? d : []))
      .catch(() => setCommunes([]))
      .finally(() => setLoadingCommunes(false));
  }, [wilayaCode]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 3) e.name = 'يرجى إدخال الاسم الكامل';
    if (!PHONE_RE.test(phone.trim())) e.phone = 'رقم الهاتف غير صحيح (مثال: 0550123456)';
    if (!wilayaCode) e.wilaya = 'اختر الولاية';
    else if (wilaya && !wilaya.is_active) e.wilaya = 'التوصيل غير متوفر لهذه الولاية حالياً';
    if (!commune) e.commune = 'اختر البلدية';
    if (product.has_variants && variantOptions.length) {
      for (const o of variantOptions) {
        if (!options[o.name]) e[`opt_${o.name}`] = `اختر ${o.name}`;
      }
    }
    if (outOfStock) e.variant = 'هذه التركيبة نفدت من المخزون، اختر تركيبة أخرى';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    setServerError('');
    if (!validate()) {
      document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          wilaya_code: Number(wilayaCode),
          commune_name: commune,
          address: address.trim() || null,
          shipping_type: shipType,
          selected_variant: Object.keys(options).length ? options : null,
          quantity: qty,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'حدث خطأ أثناء إرسال الطلب');
      setDone(data);
      window.scrollTo({ top: document.getElementById('order-form')?.offsetTop || 0, behavior: 'smooth' });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div id="order-form" className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6 text-center sm:p-10">
        <CheckCircle2 size={56} className="mx-auto text-emerald-500" />
        <h3 className="mt-3 text-2xl font-black text-emerald-800">تم استلام طلبك بنجاح!</h3>
        <p className="mt-2 text-sm text-emerald-700">رقم الطلب: <span className="font-black" dir="ltr">#{shortId(done.id)}</span></p>
        <div className="mx-auto mt-5 max-w-sm rounded-xl bg-white p-4 text-right text-sm shadow-sm">
          <div className="flex justify-between py-1"><span className="text-slate-500">المنتج</span><span className="font-bold">{product.title}</span></div>
          {done.selected_variant && <div className="flex justify-between py-1"><span className="text-slate-500">الخيارات</span><span className="font-bold">{Object.values(done.selected_variant).join(' / ')}</span></div>}
          <div className="flex justify-between py-1"><span className="text-slate-500">الكمية</span><span className="font-bold">{done.quantity}</span></div>
          <div className="flex justify-between py-1"><span className="text-slate-500">التوصيل</span><span className="font-bold">{fmtPrice(done.shipping_price)}</span></div>
          <div className="mt-1 flex justify-between border-t border-slate-100 pt-2 text-base"><span className="font-black">المجموع</span><span className="font-black text-emerald-700">{fmtPrice(done.total_price)}</span></div>
        </div>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-emerald-700">سيتصل بك فريقنا قريباً لتأكيد الطلب. الدفع نقداً عند الاستلام بعد معاينة طلبك.</p>
      </div>
    );
  }

  return (
    <div id="order-form" className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      <div className="px-5 py-4 text-center text-white" style={{ background: `linear-gradient(135deg, ${color}, #0f172a)` }}>
        <h3 className="text-xl font-black">املأ معلوماتك لإتمام الطلب</h3>
        <p className="mt-1 text-xs opacity-90">الدفع عند الاستلام — التوصيل لجميع الولايات</p>
      </div>
      <div className="space-y-5 p-5 sm:p-7">
        {/* variants */}
        {product.has_variants && variantOptions.length > 0 && (
          <div className="space-y-4 rounded-xl bg-slate-50 p-4">
            {variantOptions.map((o) => {
              const isColor = isColorOption(o.name) && (o.colors?.length || 0) > 0;
              return (
                <div key={o.name}>
                  <p className="mb-2 text-sm font-black text-slate-700">{o.name}: {options[o.name] && <span style={{ color }}>{options[o.name]}</span>}</p>
                  {isColor ? (
                    <div className="flex flex-wrap gap-2.5">
                      {o.values.map((v) => {
                        const meta = (o.colors || []).find((c: ColorMeta) => c.value === v);
                        const sel = options[o.name] === v;
                        return (
                          <button
                            key={v}
                            type="button"
                            title={v}
                            onClick={() => setOptions({ ...options, [o.name]: v })}
                            className={`flex items-center gap-2 rounded-xl border-2 px-2.5 py-1.5 text-xs font-black transition ${sel ? '' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                            style={sel ? { borderColor: color, background: '#fff', color } : {}}
                          >
                            {meta?.image ? (
                              <img src={meta.image} alt={v} className="h-9 w-9 rounded-lg object-cover" />
                            ) : (
                              <span className="h-8 w-8 rounded-full border border-slate-200 shadow-inner" style={{ background: meta?.code || '#e2e8f0' }} />
                            )}
                            {v}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {o.values.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setOptions({ ...options, [o.name]: v })}
                          className={`rounded-xl border-2 px-4 py-2 text-sm font-bold transition ${options[o.name] === v ? 'text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                          style={options[o.name] === v ? { background: color, borderColor: color } : {}}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors[`opt_${o.name}`] && <p className="mt-1 text-xs font-bold text-red-600">{errors[`opt_${o.name}`]}</p>}
                </div>
              );
            })}
            {errors.variant && <p className="text-xs font-bold text-red-600">{errors.variant}</p>}
            {matchedVariant && !outOfStock && matchedVariant.price != null && (
              <p className="text-xs font-bold text-slate-500">سعر هذه التركيبة: {fmtPrice(matchedVariant.price)} {Number(matchedVariant.stock) <= 5 && <span className="text-red-600">(بقي {matchedVariant.stock} فقط!)</span>}</p>
            )}
            {product.has_variants && Object.keys(options).length > 0 && !matchedVariant && (
              <p className="text-xs font-bold text-amber-600">هذه التركيبة غير متوفرة حالياً — سيُحتسب السعر الافتراضي للمنتج.</p>
            )}
          </div>
        )}

        {/* quantity */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
          <span className="text-sm font-black text-slate-700">الكمية</span>
          <div className="flex items-center gap-3" dir="ltr">
            <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 font-black text-slate-700 hover:bg-slate-200" aria-label="إنقاص"><Minus size={16} /></button>
            <span className="w-8 text-center text-lg font-black">{qty}</span>
            <button type="button" onClick={() => setQty(Math.min(10, qty + 1))} className="flex h-9 w-9 items-center justify-center rounded-lg font-black text-white" style={{ background: color }} aria-label="زيادة"><Plus size={16} /></button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="الاسم الكامل" error={errors.name}>
            <div className="relative">
              <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: محمد بن أحمد" className={`${inputCls} pr-9`} />
            </div>
          </Field>
          <Field label="رقم الهاتف" error={errors.phone}>
            <div className="relative">
              <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))} placeholder="05 / 06 / 07 ××××××××" dir="ltr" className={`${inputCls} pr-9 text-left`} inputMode="numeric" />
            </div>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="الولاية" error={errors.wilaya}>
            <select value={wilayaCode} onChange={(e) => setWilayaCode(e.target.value)} className={inputCls}>
              <option value="">— اختر الولاية —</option>
              {wilayas.map((w) => (
                <option key={w.code} value={w.code} disabled={!w.is_active}>
                  {String(w.code).padStart(2, '0')} — {w.name_ar}{!w.is_active ? ' (غير متوفر)' : ''}
                </option>
              ))}
            </select>
          </Field>
          <Field label="البلدية" error={errors.commune}>
            <select value={commune} onChange={(e) => setCommune(e.target.value)} className={inputCls} disabled={!wilayaCode || loadingCommunes}>
              <option value="">{loadingCommunes ? 'جاري التحميل...' : '— اختر البلدية —'}</option>
              {communes.map((c) => <option key={c.id} value={c.name_ar}>{c.name_ar}</option>)}
            </select>
          </Field>
        </div>

        <Field label="العنوان الكامل (اختياري)" hint="الحي، الشارع، أو نقطة معروفة لتسهيل التوصيل للمنزل">
          <div className="relative">
            <MapPin size={16} className="absolute right-3 top-3.5 text-slate-400" />
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} placeholder="مثال: حي 200 مسكن، عمارة 5، بجانب المسجد" className={`${inputCls} pr-9`} />
          </div>
        </Field>

        {/* shipping type */}
        <div>
          <p className="mb-2 text-sm font-black text-slate-700">نوع التوصيل</p>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setShipType('home')} className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-black transition ${shipType === 'home' ? 'text-white' : 'border-slate-200 text-slate-600'}`} style={shipType === 'home' ? { background: color, borderColor: color } : {}}>
              <Home size={17} /> للمنزل {wilaya && <span className="text-xs opacity-90">({fmtPrice(wilaya.home_price)})</span>}
            </button>
            <button type="button" onClick={() => setShipType('desk')} className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-black transition ${shipType === 'desk' ? 'text-white' : 'border-slate-200 text-slate-600'}`} style={shipType === 'desk' ? { background: color, borderColor: color } : {}}>
              <Building2 size={17} /> للمكتب {wilaya && <span className="text-xs opacity-90">({fmtPrice(wilaya.desk_price)})</span>}
            </button>
          </div>
        </div>

        {/* summary */}
        <div className="rounded-xl bg-slate-50 p-4 text-sm">
          <div className="flex justify-between py-1 text-slate-600"><span>سعر المنتج × {qty}</span><span className="font-bold">{fmtPrice(unitPrice * qty)}</span></div>
          <div className="flex justify-between py-1 text-slate-600"><span className="flex items-center gap-1"><Truck size={14} /> سعر التوصيل {wilaya ? (shipType === 'home' ? '(للمنزل)' : '(للمكتب)') : ''}</span><span className="font-bold">{wilaya ? fmtPrice(shipPrice) : '—'}</span></div>
          <div className="mt-1 flex justify-between border-t border-slate-200 pt-2 text-lg"><span className="font-black">المجموع الكلي</span><span className="font-black" style={{ color }}>{wilaya ? fmtPrice(total) : fmtPrice(unitPrice * qty)}</span></div>
        </div>

        {serverError && <p className="rounded-xl bg-red-50 p-3 text-center text-sm font-bold text-red-600">{serverError}</p>}

        <button onClick={submit} disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-black text-white shadow-lg transition hover:opacity-90 disabled:opacity-60" style={{ background: `linear-gradient(135deg, ${color}, #0f172a)` }}>
          {submitting ? <><Loader2 size={20} className="animate-spin" /> جاري إرسال الطلب...</> : 'تأكيد الطلب الآن'}
        </button>
        <p className="text-center text-xs text-slate-400">بالضغط على تأكيد الطلب، سيتصل بك فريقنا لتأكيد معلومات التوصيل.</p>
      </div>
    </div>
  );
}
