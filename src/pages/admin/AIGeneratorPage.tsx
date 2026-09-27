import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Upload, Wand2, ArrowRight, Loader2, CheckCircle2, Palette, Type, MessageSquareQuote, RefreshCw, X } from 'lucide-react';
import LandingPreview from '../../components/LandingPreview';
import { Field, inputCls, btnPrimary } from '../../components/Ui';
import { generateContent, detectCategory, extractColorsMulti, regenerateSection, CATEGORY_LABELS, type RegenSection } from '../../lib/aiGenerator';
import { uploadImage } from '../../lib/upload';
import { slugify } from '../../lib/slug';
import type { ProductColors } from '../../lib/types';

type Step = 'input' | 'generating' | 'result';

export default function AIGeneratorPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('input');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<string[]>([]);
  const [colors, setColors] = useState<ProductColors>({ primary: '#0d9488', secondary: '#f0fdfa', accent: '#f59e0b' });
  const [content, setContent] = useState<ReturnType<typeof generateContent> | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState('');
  const [regenBusy, setRegenBusy] = useState<RegenSection | null>(null);

  const detected = useMemo(() => (title ? detectCategory(title) : ''), [title]);

  const pickFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const arr = Array.from(files).slice(0, 6 - imageFiles.length);
    if (!arr.length) return;
    setImageFiles((f) => [...f, ...arr]);
    setImagePreviews((p) => [...p, ...arr.map((f) => URL.createObjectURL(f))]);
  };

  const removePreview = (i: number) => {
    setImageFiles((f) => f.filter((_, j) => j !== i));
    setImagePreviews((p) => p.filter((_, j) => j !== i));
  };

  const push = (m: string) => setProgress((p) => [...p, m]);
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const run = async () => {
    setError('');
    if (!title.trim()) { setError('أدخل اسم المنتج'); return; }
    if (!price || Number(price) <= 0) { setError('أدخل سعراً صحيحاً'); return; }
    if (!imageFiles.length) { setError('ارفع صورة واحدة على الأقل للمنتج'); return; }
    setStep('generating');
    setProgress([]);
    try {
      push(`تحليل ${imagePreviews.length} صورة للمنتج...`);
      await wait(500);
      const extracted = await extractColorsMulti(imagePreviews);
      setColors(extracted);
      push(`تم استخراج لوحة الألوان من كل الصور: ${extracted.primary}`);
      await wait(400);
      push('توليد المحتوى التسويقي العربي...');
      await wait(600);
      const cat = detectCategory(title.trim());
      setCategory(cat);
      const c = generateContent({ title: title.trim(), price: Number(price) });
      setContent(c);
      push('تم توليد الوصف والمميزات وآراء العملاء والأسئلة الشائعة');
      await wait(400);
      push(`رفع ${imageFiles.length} صور إلى التخزين السحابي...`);
      const urls: string[] = [];
      for (const f of imageFiles) {
        urls.push(await uploadImage(f));
      }
      setImageUrls(urls);
      push('اكتمل التوليد بنجاح!');
      await wait(500);
      setStep('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل التوليد');
      setStep('input');
    }
  };

  const regen = async (section: RegenSection) => {
    if (!content || !title.trim()) return;
    setRegenBusy(section);
    await wait(450);
    const cat = category || detectCategory(title.trim());
    setContent(regenerateSection({ title: title.trim(), price: Number(price) || 0, category: cat, section, current: content }));
    setRegenBusy(null);
  };

  const save = async (publish: boolean) => {
    if (!content) return;
    setSaving(true);
    setError('');
    try {
      const countdown = new Date();
      countdown.setDate(countdown.getDate() + 3);
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slugify(title.trim()),
          price: Number(price),
          discount_price: discount ? Number(discount) : null,
          subtitle: content.subtitle,
          description: content.description,
          landing_type: 'ai_generated',
          ai_generated: true,
          generated_colors: { ...colors, layout: 'stacked', category: 'general' },
          features: content.features,
          testimonials: content.testimonials,
          faqs: content.faqs,
          images: imageUrls.length ? imageUrls : [],
          image_layout: 'stacked',
          category: 'general',
          countdown_end: countdown.toISOString(),
          countdown_message: 'عرض خاص ينتهي خلال:',
          countdown_active: true,
          is_active: publish,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الحفظ');
      navigate(`/admin/products/edit/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const previewProduct = content ? ({
    id: 'preview', title: title.trim(), slug: 'preview', price: Number(price) || 0,
    discount_price: discount ? Number(discount) : null,
    subtitle: content.subtitle, description: content.description,
    landing_type: 'ai_generated', manual_media_url: null, ai_generated: true,
    generated_colors: colors, features: content.features, testimonials: content.testimonials, faqs: content.faqs,
    has_variants: false, variant_options: [], variants_data: [],
    images: imagePreviews.length ? imagePreviews : ['/placeholder-product.svg'],
    image_layout: 'stacked', category: 'general',
    countdown_end: new Date(Date.now() + 3 * 864e5).toISOString(),
    countdown_message: 'عرض خاص ينتهي خلال:', countdown_active: true,
    is_active: true, created_at: new Date().toISOString(),
  } as never) : null;

  const regenBtn = (section: RegenSection, label: string) => (
    <button
      onClick={() => regen(section)}
      disabled={regenBusy != null}
      className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-black text-violet-700 shadow-sm transition hover:bg-violet-50 disabled:opacity-50"
    >
      <RefreshCw size={13} className={regenBusy === section ? 'animate-spin' : ''} />
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/products')} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm"><ArrowRight size={18} /></button>
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black text-slate-900"><Sparkles size={20} className="text-violet-600" /> مولّد صفحات الهبوط بالذكاء الاصطناعي</h1>
          <p className="mt-1 text-sm text-slate-500">ارفع صور المنتج + أدخل السعر ← واحصل على صفحة هبوط كاملة</p>
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-3 text-center text-sm font-bold text-red-600">{error}</p>}

      {step === 'input' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <Field label="اسم المنتج">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: ساعة ذكية Ultra X9 بشاشة أموليد" className={inputCls} />
            </Field>
            {detected && <p className="rounded-xl bg-violet-50 p-2.5 text-xs font-bold text-violet-700">التصنيف المكتشف: {CATEGORY_LABELS[detected]}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="السعر (دج)">
                <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="4500" className={inputCls} />
              </Field>
              <Field label="سعر الخصم (اختياري)">
                <input type="number" min={0} value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="3900" className={inputCls} />
              </Field>
            </div>
            <Field label="صور المنتج (حتى 6 صور)" hint="سيتم تحليل ألوانها جميعاً تلقائياً لتوليد لوحة متناسقة">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-violet-500">
                <Upload size={30} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-600">اضغط لرفع صور المنتج دفعة واحدة</span>
                <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => pickFiles(e.target.files)} />
              </label>
              {imagePreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {imagePreviews.map((u, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-xl border">
                      <img src={u} alt="" className="aspect-square w-full object-cover" />
                      <button onClick={() => removePreview(i)} className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-lg bg-red-600 text-white"><X size={13} /></button>
                      {i === 0 && <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">الرئيسية</span>}
                    </div>
                  ))}
                </div>
              )}
            </Field>
            <button onClick={run} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3.5 text-base font-black text-white shadow-lg transition hover:bg-violet-700">
              <Wand2 size={19} /> ولّد صفحة الهبوط الآن
            </button>
          </div>
          <div className="h-fit space-y-3 rounded-2xl border border-violet-200 bg-gradient-to-b from-violet-50 to-white p-5 shadow-sm sm:p-6">
            <h3 className="font-black text-slate-900">ماذا سيفعل المولّد؟</h3>
            {[
              { icon: Palette, t: 'استخراج الألوان تلقائياً', d: 'تحليل كل الصور المرفوعة وتوليد لوحة (رئيسي / ثانوي / تمييز) متناسقة.' },
              { icon: Type, t: 'محتوى عربي تسويقي ذكي', d: 'عنوان فرعي جذاب، وصف مقنع، و4 مميزات تفصيلية حسب نوع المنتج.' },
              { icon: MessageSquareQuote, t: 'آراء عملاء + أسئلة شائعة', d: 'شهادات بأسماء جزائرية وتقييمات، مع 4 أسئلة وأجوبة جاهزة.' },
              { icon: CheckCircle2, t: 'إعادة توليد لكل قسم', d: 'زر إعادة توليد مستقل للعنوان والوصف والمميزات والآراء والأسئلة.' },
            ].map((f, i) => (
              <div key={i} className="flex gap-3 rounded-xl bg-white p-3.5 shadow-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><f.icon size={18} /></span>
                <span><span className="block text-sm font-black text-slate-800">{f.t}</span><span className="text-xs leading-5 text-slate-500">{f.d}</span></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'generating' && (
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <span className="relative mx-auto flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-violet-200 opacity-60" />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-violet-600 text-white"><Sparkles size={32} /></span>
          </span>
          <h3 className="mt-4 text-lg font-black text-slate-900">جاري توليد صفحة الهبوط...</h3>
          <div className="mt-5 space-y-2 text-right">
            {progress.map((p, i) => (
              <p key={i} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                <CheckCircle2 size={14} className="shrink-0 text-emerald-500" /> {p}
              </p>
            ))}
          </div>
        </div>
      )}

      {step === 'result' && previewProduct && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="flex items-center gap-2 text-sm font-black text-emerald-800">
              <CheckCircle2 size={18} /> تم التوليد بنجاح! راجع المعاينة ثم احفظ.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex overflow-hidden rounded-lg border">
                {([colors.primary, colors.secondary, colors.accent]).map((c, i) => (
                  <span key={i} className="h-8 w-10" style={{ background: c }} title={c} />
                ))}
              </div>
              {category && <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-violet-700 shadow-sm">{CATEGORY_LABELS[category]}</span>}
            </div>
          </div>
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-3">
            <p className="mb-2 text-xs font-black text-violet-800">إعادة توليد قسم معين (اقتراح جديد فوراً):</p>
            <div className="flex flex-wrap gap-2">
              {regenBtn('subtitle', 'العنوان الفرعي')}
              {regenBtn('description', 'الوصف')}
              {regenBtn('features', 'المميزات')}
              {regenBtn('testimonials', 'آراء العملاء')}
              {regenBtn('faqs', 'الأسئلة الشائعة')}
            </div>
          </div>
          <div className="mx-auto max-w-3xl">
            <LandingPreview product={previewProduct} />
          </div>
          <div className="sticky bottom-4 flex flex-wrap justify-center gap-2 rounded-2xl border bg-white/95 p-3 shadow-xl backdrop-blur">
            <button onClick={() => setStep('input')} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">توليد جديد</button>
            <button onClick={() => save(false)} disabled={saving} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : 'حفظ كمسودة'}
            </button>
            <button onClick={() => save(true)} disabled={saving} className={btnPrimary}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : 'حفظ ونشر — ثم تخصيص'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
