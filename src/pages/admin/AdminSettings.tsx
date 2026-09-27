import { useEffect, useState } from 'react';
import { Save, Loader2, Type, Palette, Megaphone, ImagePlus, Trash2 } from 'lucide-react';
import { Spinner, Field, inputCls } from '../../components/Ui';
import { FONT_OPTIONS } from '../../lib/utils';
import { uploadImage } from '../../lib/upload';
import { useStore } from '../../contexts/StoreContext';

const DEFAULTS: Record<string, string> = {
  store_name: 'سوق الجزائر',
  primary_color: '#0d9488',
  site_font: 'Tajawal',
  hero_title: 'تسوّق بثقة — الدفع عند الاستلام',
  hero_subtitle: 'منتجات أصلية مختارة بعناية، توصيل سريع لـ 58 ولاية، ومعاينة قبل الدفع.',
  announcement_text: 'التوصيل متوفر لـ 58 ولاية — الدفع عند الاستلام',
  announcement_active: 'true',
  logo_url: '',
  favicon_url: '',
};

export default function AdminSettings() {
  const { refresh } = useStore();
  const [form, setForm] = useState<Record<string, string>>({ ...DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const pickBrand = async (key: 'logo_url' | 'favicon_url', file: File | null) => {
    if (!file) return;
    setUploadingKey(key);
    try {
      const url = await uploadImage(file, 'branding');
      setForm((f) => ({ ...f, [key]: url }));
      await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value: url }) });
      await refresh();
      setMsg(key === 'logo_url' ? 'تم تحديث الشعار' : 'تم تحديث أيقونة المتصفح');
    } catch {
      setMsg('فشل الرفع');
    } finally {
      setUploadingKey(null);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        const m = { ...DEFAULTS };
        (Array.isArray(d) ? d : []).forEach((s: { key: string; value: unknown }) => {
          m[s.key] = typeof s.value === 'string' ? s.value : String(s.value ?? '');
        });
        setForm(m);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      for (const [key, value] of Object.entries(form)) {
        await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) });
      }
      await refresh();
      setMsg('تم حفظ الإعدادات بنجاح');
    } catch {
      setMsg('فشل الحفظ');
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  if (loading) return <div className="rounded-2xl bg-white py-20"><Spinner size={40} /></div>;

  const fontStack = FONT_OPTIONS.find((f) => f.value === form.site_font)?.stack || "'Tajawal', sans-serif";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900 sm:text-2xl">إعدادات المتجر</h1>
        <p className="mt-1 text-sm text-slate-500">الاسم، الألوان، الخطوط، والنصوص العامة</p>
      </div>
      {msg && <p className="rounded-xl bg-emerald-50 p-2.5 text-center text-sm font-bold text-emerald-700">{msg}</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 font-black text-slate-900"><Megaphone size={17} className="text-teal-600" /> الهوية والنصوص</h3>
          <Field label="اسم المتجر">
            <input value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} className={inputCls} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="شعار المتجر (Logo)" hint="يظهر في الهيدر والفوتر">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                {form.logo_url ? (
                  <img src={form.logo_url} alt="logo" className="h-11 w-16 rounded-lg bg-white object-contain" />
                ) : (
                  <span className="flex h-11 w-16 items-center justify-center rounded-lg bg-slate-200 text-slate-400"><ImagePlus size={18} /></span>
                )}
                <label className="flex-1 cursor-pointer rounded-lg bg-slate-900 px-3 py-2 text-center text-xs font-black text-white hover:bg-slate-800">
                  {uploadingKey === 'logo_url' ? 'جاري الرفع...' : 'رفع شعار'}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => pickBrand('logo_url', e.target.files?.[0] || null)} />
                </label>
                {form.logo_url && (
                  <button onClick={() => setForm({ ...form, logo_url: '' })} className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500" title="إزالة"><Trash2 size={15} /></button>
                )}
              </div>
            </Field>
            <Field label="أيقونة المتصفح (Favicon)" hint="تظهر في تبويب المتصفح">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                {form.favicon_url ? (
                  <img src={form.favicon_url} alt="favicon" className="h-11 w-11 rounded-lg bg-white object-contain" />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-200 text-slate-400"><ImagePlus size={18} /></span>
                )}
                <label className="flex-1 cursor-pointer rounded-lg bg-slate-900 px-3 py-2 text-center text-xs font-black text-white hover:bg-slate-800">
                  {uploadingKey === 'favicon_url' ? 'جاري الرفع...' : 'رفع أيقونة'}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => pickBrand('favicon_url', e.target.files?.[0] || null)} />
                </label>
                {form.favicon_url && (
                  <button onClick={() => setForm({ ...form, favicon_url: '' })} className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500" title="إزالة"><Trash2 size={15} /></button>
                )}
              </div>
            </Field>
          </div>
          <Field label="العنوان الرئيسي (Hero)">
            <input value={form.hero_title} onChange={(e) => setForm({ ...form, hero_title: e.target.value })} className={inputCls} />
          </Field>
          <Field label="الوصف الرئيسي">
            <textarea value={form.hero_subtitle} onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })} rows={2} className={inputCls} />
          </Field>
          <Field label="شريط الإعلان العلوي">
            <input value={form.announcement_text} onChange={(e) => setForm({ ...form, announcement_text: e.target.value })} className={inputCls} />
          </Field>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 p-3">
            <input type="checkbox" checked={form.announcement_active === 'true'} onChange={(e) => setForm({ ...form, announcement_active: e.target.checked ? 'true' : 'false' })} className="h-5 w-5 accent-teal-600" />
            <span className="text-sm font-bold text-slate-700">إظهار شريط الإعلان</span>
          </label>
        </div>

        <div className="space-y-4">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 font-black text-slate-900"><Type size={17} className="text-teal-600" /> الخطوط</h3>
            <Field label="خط الموقع (الافتراضي Tajawal)">
              <select value={form.site_font} onChange={(e) => setForm({ ...form, site_font: e.target.value })} className={inputCls}>
                {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </Field>
            <div className="rounded-xl bg-slate-50 p-4" style={{ fontFamily: fontStack }}>
              <p className="text-lg font-black text-slate-900">معاينة الخط: تسوّق بثقة والدفع عند الاستلام</p>
              <p className="mt-1 text-sm text-slate-500">الأبجدية العربية 0123456789 — تجربة حية للخط المختار</p>
            </div>
          </div>
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 font-black text-slate-900"><Palette size={17} className="text-teal-600" /> اللون الرئيسي</h3>
            <div className="flex items-center gap-3">
              <input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="h-12 w-20 cursor-pointer rounded-lg border" />
              <input value={form.primary_color} dir="ltr" onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className={`${inputCls} text-left`} />
            </div>
            <div className="flex flex-wrap gap-2">
              {['#0d9488', '#2563eb', '#7c3aed', '#dc2626', '#ea580c', '#16a34a', '#0f172a', '#db2777'].map((c) => (
                <button key={c} onClick={() => setForm({ ...form, primary_color: c })} className={`h-9 w-9 rounded-full border-2 ${form.primary_color === c ? 'border-slate-900' : 'border-transparent'}`} style={{ background: c }} aria-label={c} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-xl bg-teal-600 px-8 py-3 text-sm font-black text-white shadow hover:bg-teal-700 disabled:opacity-50">
        {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />} حفظ جميع الإعدادات
      </button>
    </div>
  );
}
