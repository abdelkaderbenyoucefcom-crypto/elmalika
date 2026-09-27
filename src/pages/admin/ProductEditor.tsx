import { useEffect, useMemo, useState } from 'react';import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowRight, Loader2, Upload, X, Trash2, Plus, Eye, Pencil, Palette, ListChecks, MessageSquareQuote, HelpCircle, Timer, Image as ImageIcon } from 'lucide-react';
import LandingPreview from '../../components/LandingPreview';
import { Spinner, Field, inputCls, btnPrimary } from '../../components/Ui';
import { uploadImage, uploadRaw } from '../../lib/upload';
import { generateContent, detectCategory } from '../../lib/aiGenerator';
import { slugify } from '../../lib/slug';
import { PRODUCT_CATEGORIES, IMAGE_LAYOUTS, productCategory } from '../../lib/utils';
import type { ColorMeta, Faq, Feature, ImageLayout, LandingType, Product, ProductCategory, Testimonial, VariantItem, VariantOption } from '../../lib/types';

const EMPTY: Partial<Product> = {
  title: '', slug: '', price: 0, discount_price: null, description: '', subtitle: '',
  landing_type: 'ai_generated', manual_media_url: null, ai_generated: false,
  generated_colors: { primary: '#0d9488', secondary: '#f0fdfa', accent: '#f59e0b' },
  features: [], testimonials: [], faqs: [],
  has_variants: false, variant_options: [], variants_data: [],
  images: [], image_layout: 'stacked' as ImageLayout, category: 'general' as ProductCategory,
  countdown_end: null, countdown_message: 'عرض خاص ينتهي خلال:', countdown_active: false,
  is_active: true,
};

export default function ProductEditor() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<Product>>({ ...EMPTY });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [section, setSection] = useState('basic');

  useEffect(() => {
    if (isNew) return;
    fetch(`/api/products?id=${id}`)
      .then((r) => r.json())
      .then((p) => {
        if (!p) { setError('المنتج غير موجود'); return; }
        setForm({ ...p });
      })
      .catch(() => setError('تعذر تحميل المنتج'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const set = (k: keyof Product, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const autoContent = () => {
    if (!form.title?.trim()) { setError('أدخل اسم المنتج أولاً لتوليد المحتوى'); return; }
    setError('');
    const c = generateContent({ title: form.title.trim(), price: Number(form.price) || 0 });
    setForm((f) => ({ ...f, subtitle: c.subtitle, description: c.description, features: c.features, testimonials: c.testimonials, faqs: c.faqs, ai_generated: true }));
  };

  const pickImage = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError('');
    try {
      for (const file of Array.from(files)) {
        const url = await uploadImage(file);
        setForm((f) => ({ ...f, images: [...(f.images || []), url] }));
      }
    } catch (e) {
      setError(e instanceof Error ? `فشل الرفع: ${e.message}` : 'فشل الرفع');
    } finally {
      setUploading(false);
    }
  };

  const pickManual = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError('');
    try {
      const url = await uploadRaw(files[0]);
      const isPdf = files[0].type === 'application/pdf' || files[0].name.toLowerCase().endsWith('.pdf');
      setForm((f) => ({ ...f, manual_media_url: url, landing_type: (isPdf ? 'manual_pdf' : 'manual_image') as LandingType }));
    } catch (e) {
      setError(e instanceof Error ? `فشل الرفع: ${e.message}` : 'فشل الرفع');
    } finally {
      setUploading(false);
    }
  };

  const previewProduct = useMemo(() => ({
    ...EMPTY, ...form,
    id: 'preview', created_at: new Date().toISOString(),
    price: Number(form.price) || 0,
  } as Product), [form]);

  const save = async () => {
    setError('');
    if (!form.title?.trim()) { setError('اسم المنتج مطلوب'); return; }
    const slug = (form.slug?.trim() || slugify(form.title)) as string;
    if (!slug) { setError('الرابط (slug) مطلوب'); return; }
    if (form.price == null || Number(form.price) <= 0) { setError('السعر يجب أن يكون أكبر من صفر'); return; }
    if (form.discount_price != null && Number(form.discount_price) >= Number(form.price)) { setError('سعر الخصم يجب أن يكون أقل من السعر الأصلي'); return; }
    if (form.landing_type !== 'ai_generated' && !form.manual_media_url) { setError('ارفع ملف صفحة الهبوط اليدوية (صورة أو PDF)'); return; }
    if (form.has_variants && (!form.variant_options?.length || !form.variants_data?.length)) { setError('أضف خيارات وتركيبات المنتج متعدد الخيارات'); return; }
    setSaving(true);
    try {
      const gc = { ...(form.generated_colors as object || {}) } as Record<string, unknown>;
      gc.layout = form.image_layout || 'stacked';
      gc.category = form.category || 'general';
      const payload = {
        ...(isNew ? {} : { id }),
        title: form.title.trim(), slug,
        price: Number(form.price),
        discount_price: form.discount_price != null ? Number(form.discount_price) : null,
        description: form.description || null, subtitle: form.subtitle || null,
        landing_type: form.landing_type, manual_media_url: form.manual_media_url || null,
        ai_generated: !!form.ai_generated, generated_colors: gc,
        features: form.features || [], testimonials: form.testimonials || [], faqs: form.faqs || [],
        has_variants: !!form.has_variants, variant_options: form.variant_options || [], variants_data: form.variants_data || [],
        images: form.images || [], image_layout: form.image_layout || 'stacked', category: form.category || 'general',
        countdown_end: form.countdown_end || null,
        countdown_message: form.countdown_message || null, countdown_active: !!form.countdown_active,
        is_active: form.is_active !== false,
      };
      const res = await fetch('/api/products', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الحفظ');
      navigate('/admin/products');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="rounded-2xl bg-white py-20"><Spinner size={40} /></div>;

  const sections = [
    { id: 'basic', label: 'أساسي', icon: Pencil },
    { id: 'images', label: 'الصور', icon: ImageIcon },
    { id: 'content', label: 'المحتوى', icon: ListChecks },
    { id: 'social', label: 'آراء و FAQs', icon: MessageSquareQuote },
    { id: 'variants', label: 'الخيارات', icon: ListChecks },
    { id: 'design', label: 'التصميم', icon: Palette },
    { id: 'countdown', label: 'العد التنازلي', icon: Timer },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/products')} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm hover:bg-slate-50"><ArrowRight size={18} /></button>
          <div>
            <h1 className="text-xl font-black text-slate-900">{isNew ? 'منتج جديد' : 'تعديل المنتج'}</h1>
            <p className="text-xs text-slate-500">{form.title ? `التصنيف المقترح: ${detectCategory(form.title)}` : 'املأ بيانات المنتج'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-xl bg-white p-1 shadow-sm">
            <button onClick={() => setTab('edit')} className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold ${tab === 'edit' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}><Pencil size={15} /> تحرير</button>
            <button onClick={() => setTab('preview')} className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold ${tab === 'preview' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}><Eye size={15} /> معاينة حية</button>
          </div>
          <button onClick={save} disabled={saving} className={btnPrimary}>{saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />} حفظ</button>
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-3 text-center text-sm font-bold text-red-600">{error}</p>}

      {tab === 'preview' ? (
        <div className="mx-auto max-w-3xl">
          {previewProduct.landing_type === 'ai_generated' ? (
            <LandingPreview product={previewProduct} />
          ) : (
            <div className="overflow-hidden rounded-2xl border bg-white">
              {previewProduct.manual_media_url ? (
                previewProduct.landing_type === 'manual_pdf'
                  ? <iframe src={previewProduct.manual_media_url} title="preview" className="h-[70vh] w-full" />
                  : <img src={previewProduct.manual_media_url} alt="" className="w-full" />
              ) : <p className="p-10 text-center text-sm text-slate-400">ارفع ملف التصميم اليدوي للمعاينة</p>}
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {sections.map((s) => (
              <button key={s.id} onClick={() => setSection(s.id)} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition lg:w-full ${section === s.id ? 'bg-slate-900 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                <s.icon size={16} /> {s.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            {section === 'basic' && (
              <div className="space-y-4">
                <Field label="اسم المنتج">
                  <input value={form.title || ''} onChange={(e) => { set('title', e.target.value); if (isNew) set('slug', slugify(e.target.value)); }} placeholder="مثال: ساعة ذكية Ultra X9" className={inputCls} />
                </Field>                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="الرابط (slug)" hint="يظهر في رابط الصفحة: /p/slug">
                    <input value={form.slug || ''} onChange={(e) => set('slug', e.target.value)} dir="ltr" placeholder="smart-watch-x9" className={`${inputCls} text-left`} />
                  </Field>
                  <Field label="العنوان الفرعي">
                    <input value={form.subtitle || ''} onChange={(e) => set('subtitle', e.target.value)} placeholder="عنوان تسويقي قصير" className={inputCls} />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="السعر الأصلي (دج)">
                    <input type="number" min={0} value={form.price ?? ''} onChange={(e) => set('price', Number(e.target.value))} className={inputCls} />
                  </Field>
                  <Field label="سعر الخصم (دج) — اختياري">
                    <input type="number" min={0} value={form.discount_price ?? ''} onChange={(e) => set('discount_price', e.target.value === '' ? null : Number(e.target.value))} placeholder="اتركه فارغاً بدون خصم" className={inputCls} />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="صنف المنتج" hint="يحدد نظام الخيارات المناسب">
                    <select value={form.category || 'general'} onChange={(e) => set('category', e.target.value as ProductCategory)} className={inputCls}>
                      {PRODUCT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label} — {c.hint}</option>)}
                    </select>
                  </Field>
                  <Field label="طريقة عرض الصور">
                    <select value={form.image_layout || 'stacked'} onChange={(e) => set('image_layout', e.target.value as ImageLayout)} className={inputCls}>
                      {IMAGE_LAYOUTS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="نوع صفحة الهبوط">                  <div className="grid grid-cols-3 gap-2">
                    {([['ai_generated', 'صفحة AI'], ['manual_image', 'صورة يدوية'], ['manual_pdf', 'PDF يدوي']] as Array<[LandingType, string]>).map(([v, l]) => (
                      <button key={v} type="button" onClick={() => set('landing_type', v)} className={`rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition ${form.landing_type === v ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-slate-200 text-slate-500'}`}>{l}</button>
                    ))}
                  </div>
                </Field>
                {form.landing_type !== 'ai_generated' && (
                  <Field label={form.landing_type === 'manual_pdf' ? 'ملف PDF (تصميم Canva / Photoshop)' : 'صورة التصميم عالية الدقة (PNG/JPG)'}>
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-teal-500">
                      <Upload size={24} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-600">{uploading ? 'جاري الرفع...' : 'اضغط لاختيار الملف'}</span>
                      <input type="file" className="hidden" accept={form.landing_type === 'manual_pdf' ? 'application/pdf' : 'image/*'} onChange={(e) => pickManual(e.target.files)} />
                    </label>
                    {form.manual_media_url && (
                      <a href={form.manual_media_url} target="_blank" rel="noreferrer" className="mt-2 block truncate text-xs font-bold text-teal-700 hover:underline" dir="ltr">{form.manual_media_url}</a>
                    )}
                  </Field>
                )}
                <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <input type="checkbox" checked={form.is_active !== false} onChange={(e) => set('is_active', e.target.checked)} className="h-5 w-5 accent-teal-600" />
                  <span className="text-sm font-bold text-slate-700">المنتج مفعّل وظاهر في المتجر</span>
                </label>
              </div>
            )}

            {section === 'images' && (
              <div className="space-y-4">
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center hover:border-teal-500">
                  <Upload size={28} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-600">{uploading ? 'جاري الرفع...' : 'اضغط لرفع صور المنتج (يمكن اختيار عدة صور)'}</span>
                  <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => pickImage(e.target.files)} />
                </label>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {(form.images || []).map((u, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-xl border">
                      <img src={u} alt="" className="aspect-square w-full object-cover" />
                      <button onClick={() => set('images', (form.images || []).filter((_, j) => j !== i))} className="absolute left-1 top-1 hidden h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white group-hover:flex"><X size={15} /></button>
                      {i === 0 && <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">الرئيسية</span>}
                    </div>
                  ))}
                </div>
                {!(form.images || []).length && <p className="text-center text-xs text-slate-400">لم يتم رفع أي صور بعد</p>}
              </div>
            )}

            {section === 'content' && (
              <div className="space-y-4">
                <button onClick={autoContent} className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-black text-white hover:bg-violet-700">
                  توليد تلقائي للمحتوى العربي (عنوان، وصف، مميزات، آراء، FAQs)
                </button>
                <Field label="الوصف التسويقي">
                  <textarea value={form.description || ''} onChange={(e) => set('description', e.target.value)} rows={6} className={inputCls} placeholder="وصف مقنع للمنتج..." />
                </Field>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">المميزات</span>
                    <button onClick={() => set('features', [...(form.features || []), { title: '', desc: '' }])} className="flex items-center gap-1 text-xs font-black text-teal-700"><Plus size={14} /> إضافة</button>
                  </div>
                  <div className="space-y-2">
                    {(form.features || []).map((f: Feature, i: number) => (
                      <div key={i} className="flex gap-2">
                        <input value={f.title} onChange={(e) => { const a = [...(form.features || [])]; a[i] = { ...a[i], title: e.target.value }; set('features', a); }} placeholder="عنوان الميزة" className={`${inputCls} w-1/3`} />
                        <input value={f.desc} onChange={(e) => { const a = [...(form.features || [])]; a[i] = { ...a[i], desc: e.target.value }; set('features', a); }} placeholder="شرح الميزة" className={`${inputCls} flex-1`} />
                        <button onClick={() => set('features', (form.features || []).filter((_: Feature, j: number) => j !== i))} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {section === 'social' && (
              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700"><MessageSquareQuote size={16} /> آراء العملاء</span>
                    <button onClick={() => set('testimonials', [...(form.testimonials || []), { name: '', wilaya: '', rating: 5, text: '' }])} className="flex items-center gap-1 text-xs font-black text-teal-700"><Plus size={14} /> إضافة</button>
                  </div>
                  <div className="space-y-3">
                    {(form.testimonials || []).map((t: Testimonial, i: number) => (
                      <div key={i} className="space-y-2 rounded-xl bg-slate-50 p-3">
                        <div className="grid grid-cols-3 gap-2">
                          <input value={t.name} onChange={(e) => { const a = [...(form.testimonials || [])]; a[i] = { ...a[i], name: e.target.value }; set('testimonials', a); }} placeholder="الاسم" className={inputCls} />
                          <input value={t.wilaya} onChange={(e) => { const a = [...(form.testimonials || [])]; a[i] = { ...a[i], wilaya: e.target.value }; set('testimonials', a); }} placeholder="الولاية" className={inputCls} />
                          <select value={t.rating} onChange={(e) => { const a = [...(form.testimonials || [])]; a[i] = { ...a[i], rating: Number(e.target.value) }; set('testimonials', a); }} className={inputCls}>
                            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} نجوم</option>)}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <textarea value={t.text} onChange={(e) => { const a = [...(form.testimonials || [])]; a[i] = { ...a[i], text: e.target.value }; set('testimonials', a); }} rows={2} placeholder="نص الرأي" className={`${inputCls} flex-1`} />
                          <button onClick={() => set('testimonials', (form.testimonials || []).filter((_: Testimonial, j: number) => j !== i))} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700"><HelpCircle size={16} /> الأسئلة الشائعة</span>
                    <button onClick={() => set('faqs', [...(form.faqs || []), { q: '', a: '' }])} className="flex items-center gap-1 text-xs font-black text-teal-700"><Plus size={14} /> إضافة</button>
                  </div>
                  <div className="space-y-2">
                    {(form.faqs || []).map((f: Faq, i: number) => (
                      <div key={i} className="flex gap-2">
                        <div className="flex-1 space-y-2">
                          <input value={f.q} onChange={(e) => { const a = [...(form.faqs || [])]; a[i] = { ...a[i], q: e.target.value }; set('faqs', a); }} placeholder="السؤال" className={inputCls} />
                          <textarea value={f.a} onChange={(e) => { const a = [...(form.faqs || [])]; a[i] = { ...a[i], a: e.target.value }; set('faqs', a); }} rows={2} placeholder="الإجابة" className={inputCls} />
                        </div>
                        <button onClick={() => set('faqs', (form.faqs || []).filter((_: Faq, j: number) => j !== i))} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {section === 'variants' && (
              <VariantEditor form={form} setForm={setForm} />
            )}

            {section === 'design' && (
              <div className="space-y-4">
                <p className="text-xs leading-5 text-slate-500">ألوان صفحة الهبوط. يتم استخراجها تلقائياً من صورة المنتج عند التوليد بالذكاء الاصطناعي، ويمكنك تعديلها يدوياً هنا.</p>
                {(['primary', 'secondary', 'accent'] as const).map((k) => (
                  <Field key={k} label={k === 'primary' ? 'اللون الرئيسي' : k === 'secondary' ? 'اللون الثانوي (الخلفية)' : 'لون التمييز'}>
                    <div className="flex items-center gap-3">
                      <input type="color" value={(form.generated_colors?.[k] as string) || '#0d9488'} onChange={(e) => set('generated_colors', { ...(form.generated_colors as object), [k]: e.target.value })} className="h-11 w-16 cursor-pointer rounded-lg border" />
                      <input value={(form.generated_colors?.[k] as string) || ''} onChange={(e) => set('generated_colors', { ...(form.generated_colors as object), [k]: e.target.value })} dir="ltr" className={`${inputCls} text-left`} />
                    </div>
                  </Field>
                ))}
                <div className="flex gap-2 rounded-xl p-4" style={{ background: form.generated_colors?.secondary }}>
                  <span className="rounded-lg px-4 py-2 text-sm font-black text-white" style={{ background: form.generated_colors?.primary }}>زر رئيسي</span>
                  <span className="rounded-lg px-4 py-2 text-sm font-black text-white" style={{ background: form.generated_colors?.accent }}>تمييز / خصم</span>
                </div>
              </div>
            )}

            {section === 'countdown' && (
              <div className="space-y-4">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <input type="checkbox" checked={!!form.countdown_active} onChange={(e) => set('countdown_active', e.target.checked)} className="h-5 w-5 accent-red-600" />
                  <span className="text-sm font-bold text-slate-700">تفعيل العداد التنازلي للاستعجال</span>
                </label>
                <Field label="تاريخ انتهاء العرض">
                  <input type="datetime-local" value={form.countdown_end ? form.countdown_end.slice(0, 16) : ''} onChange={(e) => set('countdown_end', e.target.value ? new Date(e.target.value).toISOString() : null)} className={inputCls} />
                </Field>
                <Field label="رسالة العداد">
                  <input value={form.countdown_message || ''} onChange={(e) => set('countdown_message', e.target.value)} placeholder="عرض خاص ينتهي خلال:" className={inputCls} />
                </Field>
                <div className="flex gap-2">
                  {[1, 3, 7].map((d) => (
                    <button key={d} onClick={() => { const dt = new Date(); dt.setDate(dt.getDate() + d); set('countdown_end', dt.toISOString()); set('countdown_active', true); }} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-200">بعد {d} {d === 1 ? 'يوم' : 'أيام'}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function VariantEditor({ form, setForm }: { form: Partial<Product>; setForm: React.Dispatch<React.SetStateAction<Partial<Product>>> }) {
  const [optName, setOptName] = useState('');
  const [optValues, setOptValues] = useState('');
  const [colorName, setColorName] = useState('');
  const [colorCode, setColorCode] = useState('#dc2626');
  const [colorImg, setColorImg] = useState('');
  const [uploadingColor, setUploadingColor] = useState(false);
  const [sizesText, setSizesText] = useState('S, M, L, XL');
  const cat = productCategory(form as Product);

  const ensureVariants = (patch: Partial<Product>) => {
    setForm((f) => {
      const next: Partial<Product> = { ...f, ...patch, has_variants: true };
      if (!next.variant_options?.length) {
        return { ...next, variants_data: [] };
      }
      let acc: Record<string, string>[] = [{}];
      for (const o of next.variant_options) {
        const nx: Record<string, string>[] = [];
        for (const a of acc) for (const v of o.values) nx.push({ ...a, [o.name]: v });
        acc = nx;
      }
      const prev = f.variants_data || [];
      const base = Number(f.price) || 0;
      const data: VariantItem[] = acc.map((c) => {
        const found = prev.find((p) => JSON.stringify(p.options) === JSON.stringify(c));
        if (found) return found;
        return { label: Object.values(c).join(' / '), options: c, price: base, stock: 10 };
      });
      return { ...next, variants_data: data };
    });
  };

  const addOption = () => {
    if (!optName.trim() || !optValues.trim()) return;
    const values = optValues.split(',').map((v) => v.trim()).filter(Boolean);
    if (!values.length) return;
    ensureVariants({ variant_options: [...(form.variant_options || []), { name: optName.trim(), values }] });
    setOptName(''); setOptValues('');
  };

  const removeOption = (i: number) => {
    ensureVariants({ variant_options: (form.variant_options || []).filter((_: VariantOption, j: number) => j !== i) });
  };

  const pickColorImage = async (file: File | null) => {
    if (!file) return;
    setUploadingColor(true);
    try {
      const url = await uploadImage(file, 'variant-colors');
      setColorImg(url);
    } catch { /* noop */ }
    finally { setUploadingColor(false); }
  };

  const addColor = () => {
    if (!colorName.trim()) return;
    const opts = [...(form.variant_options || [])];
    const existing = opts.find((o) => o.name === 'اللون');
    const merged: VariantOption = {
      name: 'اللون',
      values: [...(existing?.values || [])],
      colors: [...(existing?.colors || [])],
    };
    if (merged.values.includes(colorName.trim())) return;
    merged.values = [...merged.values, colorName.trim()];
    merged.colors = [...(merged.colors || []), { value: colorName.trim(), code: colorCode, image: colorImg || undefined }];
    const nextOpts = existing ? opts.map((o) => (o.name === 'اللون' ? merged : o)) : [merged, ...opts];
    ensureVariants({ variant_options: nextOpts });
    setColorName(''); setColorImg('');
  };

  const removeColor = (value: string) => {
    const opts = (form.variant_options || []).flatMap((o) => {
      if (o.name !== 'اللون') return [o];
      const nv = o.values.filter((v) => v !== value);
      const nc = (o.colors || []).filter((c) => c.value !== value);
      return nv.length ? [{ ...o, values: nv, colors: nc }] : [];
    });
    ensureVariants({ variant_options: opts });
  };

  const applySizes = () => {
    const sizes = sizesText.split(',').map((v) => v.trim()).filter(Boolean);
    const opts = (form.variant_options || []).filter((o) => o.name !== 'المقاس');
    if (sizes.length) opts.push({ name: 'المقاس', values: sizes });
    ensureVariants({ variant_options: opts });
  };

  const updItem = (i: number, patch: Partial<VariantItem>) => {
    setForm((f) => {
      const a = [...(f.variants_data || [])];
      a[i] = { ...a[i], ...patch };
      return { ...f, variants_data: a };
    });
  };

  const colorOpt = (form.variant_options || []).find((o) => o.name === 'اللون');
  const sizeOpt = (form.variant_options || []).find((o) => o.name === 'المقاس');

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 p-3">
        <input type="checkbox" checked={!!form.has_variants} onChange={(e) => setForm((f) => ({ ...f, has_variants: e.target.checked }))} className="h-5 w-5 accent-teal-600" />
        <span className="text-sm font-bold text-slate-700">منتج متعدد الخيارات (مقاسات / ألوان / موديلات...)</span>
      </label>
      {!form.has_variants && <p className="text-xs text-slate-400">منتج عادي بسعر موحد بدون خيارات.</p>}
      {form.has_variants && cat === 'fashion' && (
        <>
          {/* colors with picker + image */}
          <div className="space-y-3 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-700">ألوان المنتج <span className="font-bold text-slate-400">(اختر اللون بصرياً + ارفع صورة لكل لون)</span></p>
            <div className="flex flex-wrap items-center gap-2">
              <input type="color" value={colorCode} onChange={(e) => setColorCode(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border bg-white" />
              <input value={colorName} onChange={(e) => setColorName(e.target.value)} placeholder="اسم اللون: أحمر" className={`${inputCls} !w-36`} />
              <label className="cursor-pointer rounded-xl bg-white px-3 py-2.5 text-xs font-black text-slate-600 shadow-sm hover:bg-slate-100">
                {uploadingColor ? 'جاري الرفع...' : colorImg ? 'تم رفع الصورة ✓' : 'صورة اللون'}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => pickColorImage(e.target.files?.[0] || null)} />
              </label>
              {colorImg && <img src={colorImg} alt="" className="h-11 w-11 rounded-lg object-cover" />}
              <button onClick={addColor} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"><Plus size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(colorOpt?.colors || []).map((c: ColorMeta) => (
                <span key={c.value} className="flex items-center gap-2 rounded-xl bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
                  {c.image ? <img src={c.image} alt="" className="h-7 w-7 rounded-lg object-cover" /> : <span className="h-6 w-6 rounded-full border" style={{ background: c.code }} />}
                  {c.value}
                  <button onClick={() => removeColor(c.value)} className="text-red-500"><X size={13} /></button>
                </span>
              ))}
              {!(colorOpt?.colors || []).length && <span className="text-xs text-slate-400">لم تضف أي لون بعد</span>}
            </div>
          </div>
          {/* sizes */}
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="mb-2 text-sm font-black text-slate-700">المقاسات المتاحة <span className="font-bold text-slate-400">(S, M, L أو 38، 39...)</span></p>
            <div className="flex gap-2">
              <input value={sizesText} onChange={(e) => setSizesText(e.target.value)} placeholder="S, M, L, XL" className={`${inputCls} flex-1`} />
              <button onClick={applySizes} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">تطبيق</button>
            </div>
            {sizeOpt && <p className="mt-2 text-xs font-bold text-teal-700">المقاسات الحالية: {sizeOpt.values.join('، ')}</p>}
          </div>
        </>
      )}
      {form.has_variants && cat !== 'fashion' && (
        <>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="mb-2 text-sm font-black text-slate-700">
              {cat === 'accessories' ? 'خيارات مخصصة' : 'خصائص اختيارية'}{' '}
              <span className="font-bold text-slate-400">(حدد الاسم والقيم بنفسك — مثال: الموديل، الحجم، النوع)</span>
            </p>
            <div className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
              <input value={optName} onChange={(e) => setOptName(e.target.value)} placeholder="اسم الخاصية" className={inputCls} />
              <input value={optValues} onChange={(e) => setOptValues(e.target.value)} placeholder="القيم مفصولة بفاصلة: S, M, L, XL" className={inputCls} />
              <button onClick={addOption} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"><Plus size={16} /></button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(form.variant_options || []).map((o: VariantOption, i: number) => (
              <span key={i} className="flex items-center gap-2 rounded-xl bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
                {o.name}: {o.values.join('، ')}
                <button onClick={() => removeOption(i)} className="text-red-500"><X size={13} /></button>
              </span>
            ))}
          </div>
        </>
      )}
      {form.has_variants && (form.variants_data || []).length > 0 && (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[420px] text-sm">
            <thead><tr className="bg-slate-50 text-xs text-slate-500"><th className="p-2 text-right">التركيبة</th><th className="w-28 p-2">السعر</th><th className="w-24 p-2">المخزون</th></tr></thead>
            <tbody>
              {(form.variants_data || []).map((v: VariantItem, i: number) => (
                <tr key={i} className="border-t">
                  <td className="p-2 font-bold">{v.label}</td>
                  <td className="p-2"><input type="number" min={0} value={v.price ?? ''} onChange={(e) => updItem(i, { price: e.target.value === '' ? null : Number(e.target.value) })} className={`${inputCls} !py-1.5`} /></td>
                  <td className="p-2"><input type="number" min={0} value={v.stock} onChange={(e) => updItem(i, { stock: Number(e.target.value) })} className={`${inputCls} !py-1.5`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
