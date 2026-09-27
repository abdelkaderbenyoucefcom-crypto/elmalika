import { useEffect, useState } from 'react';
import { Plus, Trash2, ShieldCheck, Camera, Loader2, X } from 'lucide-react';
import { Spinner, EmptyState, Field, inputCls } from '../../components/Ui';
import { ROLE_LABELS, SUPER_ADMIN_EMAIL } from '../../contexts/AuthContext';
import { uploadImage } from '../../lib/upload';
import type { Staff } from '../../lib/types';

export default function AdminStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: '', display_name: '', role: 'confirmation_agent', avatar_url: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff');
      setStaff(await res.json());
    } catch { setStaff([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.email.trim() || !form.email.includes('@')) { setMsg('أدخل بريداً إلكترونياً صحيحاً'); return; }
    setSaving(true);
    setMsg('');
    const res = await fetch('/api/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, avatar_url: form.avatar_url || undefined }) });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setMsg(d.error?.includes('duplicate') ? 'هذا البريد مسجل مسبقاً' : 'فشل الإضافة');
    } else {
      setForm({ email: '', display_name: '', role: 'confirmation_agent', avatar_url: '' });
      setMsg('تمت إضافة الموظف بنجاح');
      load();
    }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const pickAvatar = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 'staff-avatars');
      setForm((f) => ({ ...f, avatar_url: url }));
    } catch {
      setMsg('فشل رفع الصورة');
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  const changeAvatar = async (s: Staff, file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 'staff-avatars');
      await update(s.id, { avatar_url: url });
    } catch {
      setMsg('فشل رفع الصورة');
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  const update = async (id: string, patch: Partial<Staff>) => {
    await fetch('/api/staff', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...patch }) });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('حذف هذا الموظف وإلغاء صلاحياته؟')) return;
    await fetch('/api/staff', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    load();
  };

  if (loading) return <div className="rounded-2xl bg-white py-20"><Spinner size={40} /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900 sm:text-2xl">الموظفون والصلاحيات</h1>
        <p className="mt-1 text-sm text-slate-500">أضف حسابات الموظفين وحدد دور كل واحد — يجب أن يسجل الموظف الدخول بنفس البريد</p>
      </div>
      {msg && <p className="rounded-xl bg-teal-50 p-2.5 text-center text-sm font-bold text-teal-700">{msg}</p>}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 font-black text-slate-900"><Plus size={17} /> إضافة موظف جديد</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="البريد الإلكتروني">
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} dir="ltr" placeholder="agent@example.com" className={`${inputCls} text-left`} />
          </Field>
          <Field label="الاسم المعروض">
            <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="مثال: أمين" className={inputCls} />
          </Field>
          <Field label="الدور">
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>
              <option value="confirmation_agent">مؤكد طلبات (الطلبات فقط)</option>
              <option value="store_manager">مسير متجر (منتجات + طلبات + شحن)</option>
              <option value="accountant">محاسب (تقارير وإحصائيات)</option>
              <option value="super_admin">أدمن رئيسي (صلاحيات كاملة)</option>
            </select>
          </Field>
          <Field label="صورة الموظف (اختياري)">
            <div className="flex items-center gap-2">
              {form.avatar_url ? (
                <span className="relative shrink-0">
                  <img src={form.avatar_url} alt="" className="h-10 w-10 rounded-full border object-cover" />
                  <button type="button" onClick={() => setForm({ ...form, avatar_url: '' })} className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white"><X size={11} /></button>
                </span>
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Camera size={16} /></span>
              )}
              <label className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-xs font-bold text-slate-600 transition hover:bg-slate-50">
                {uploading ? 'جاري الرفع...' : 'اختر صورة'}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => pickAvatar(e.target.files?.[0] || null)} />
              </label>
            </div>
          </Field>
          <div className="flex items-end">
            <button onClick={add} disabled={saving || uploading} className="w-full rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">
              {saving ? 'جاري الإضافة...' : 'إضافة'}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b bg-violet-50 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-black text-violet-800"><ShieldCheck size={16} /> المدير الرئيسي: <span dir="ltr">{SUPER_ADMIN_EMAIL}</span> (صلاحيات كاملة دائماً)</p>
        </div>
        {staff.length === 0 ? (
          <div className="p-4"><EmptyState title="لا يوجد موظفون بعد" desc="أضف أول موظف من الأعلى" /></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {staff.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <label className="group relative shrink-0 cursor-pointer" title="تغيير الصورة">
                  {s.avatar_url ? (
                    <img src={s.avatar_url} alt={s.display_name} className="h-10 w-10 rounded-full border object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">{(s.display_name || s.email).charAt(0)}</span>
                  )}
                  <span className="absolute inset-0 hidden items-center justify-center rounded-full bg-black/50 text-white group-hover:flex">
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                  </span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => changeAvatar(s, e.target.files?.[0] || null)} />
                </label>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-800">{s.display_name}</p>
                  <p className="truncate text-xs text-slate-400" dir="ltr">{s.email}</p>
                </div>
                <select value={s.role} onChange={(e) => update(s.id, { role: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold outline-none">
                  {Object.entries(ROLE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
                <button onClick={() => update(s.id, { is_active: !s.is_active })} className={`rounded-lg px-3 py-1.5 text-xs font-black ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                  {s.is_active ? 'نشط' : 'موقوف'}
                </button>
                <button onClick={() => remove(s.id)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-800">
        <b>ملاحظة:</b> بعد إضافة الموظف هنا، يجب أن ينشئ حساب دخول بنفس البريد الإلكتروني (يسجل الدخول لأول مرة من صفحة الدخول). صلاحيات الأدوار: مؤكد الطلبات يرى الطلبات فقط — مسير المتجر يدير المنتجات والطلبات والشحن — المحاسب يرى الإحصائيات والطلبات — الأدمن الرئيسي يتحكم في كل شيء بما فيه الموظفون والإعدادات.
      </div>
    </div>
  );
}
