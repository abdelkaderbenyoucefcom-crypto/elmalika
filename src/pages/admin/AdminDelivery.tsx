import { useEffect, useState } from 'react';
import { Plus, Trash2, FlaskConical, Eye, EyeOff, Loader2, Truck } from 'lucide-react';
import { Spinner, EmptyState, Field, inputCls } from '../../components/Ui';
import type { DeliveryCompany } from '../../lib/types';

export default function AdminDelivery() {
  const [companies, setCompanies] = useState<DeliveryCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState<Record<number, boolean>>({});
  const [testing, setTesting] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<Record<number, string>>({});
  const [form, setForm] = useState({ company_name: '', api_url: '', api_key: '', api_token: '' });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Record<number, { api_url: string; api_key: string; api_token: string }>>({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/delivery');
      const d = await res.json();
      setCompanies(Array.isArray(d) ? d : []);
      const m: Record<number, { api_url: string; api_key: string; api_token: string }> = {};
      (Array.isArray(d) ? d : []).forEach((c: DeliveryCompany) => { m[c.id] = { api_url: c.api_url || '', api_key: c.api_key || '', api_token: c.api_token || '' }; });
      setEditing(m);
    } catch { setCompanies([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.company_name.trim()) return;
    setSaving(true);
    await fetch('/api/delivery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ company_name: '', api_url: '', api_key: '', api_token: '' });
    setSaving(false);
    load();
  };

  const save = async (id: number) => {
    const e = editing[id];
    if (!e) return;
    setSaving(true);
    await fetch('/api/delivery', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, api_url: e.api_url, api_key: e.api_key, api_token: e.api_token }) });
    setSaving(false);
    load();
  };

  const remove = async (id: number) => {
    if (!confirm('حذف هذه الشركة؟')) return;
    await fetch('/api/delivery', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    load();
  };

  const test = async (id: number) => {
    setTesting(id);
    try {
      const res = await fetch(`/api/delivery?action=test&id=${id}`);
      const d = await res.json();
      setTestResult({ ...testResult, [id]: d.ok ? `نجح الاتصال (status ${d.status})` : `فشل: ${d.error || 'status ' + d.status}` });
    } catch (e) {
      setTestResult({ ...testResult, [id]: e instanceof Error ? e.message : 'خطأ' });
    } finally {
      setTesting(null);
    }
  };

  if (loading) return <div className="rounded-2xl bg-white py-20"><Spinner size={40} /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900 sm:text-2xl">شركات التوصيل (API)</h1>
        <p className="mt-1 text-sm text-slate-500">أضف أي شركة توصيل (Yalidine، ZN Express، CAT...) بمفاتيح الربط الخاصة بها — تُرسل الطلبات مع الهيدرز X-API-Key و X-API-Token</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 font-black text-slate-900"><Plus size={17} /> إضافة شركة جديدة</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="اسم الشركة">
            <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="مثال: Yalidine" className={inputCls} />
          </Field>
          <Field label="رابط API (Endpoint)" hint="مثال: https://api.yalidine.app/v1/parcels">
            <input value={form.api_url} onChange={(e) => setForm({ ...form, api_url: e.target.value })} dir="ltr" placeholder="https://..." className={`${inputCls} text-left`} />
          </Field>
          <Field label="X-API-Key (المفتاح الثابت)">
            <input value={form.api_key} onChange={(e) => setForm({ ...form, api_key: e.target.value })} dir="ltr" placeholder="••••••" className={`${inputCls} text-left`} />
          </Field>
          <Field label="X-API-Token (التوكن القابل للتجديد)">
            <input value={form.api_token} onChange={(e) => setForm({ ...form, api_token: e.target.value })} dir="ltr" placeholder="••••••" className={`${inputCls} text-left`} />
          </Field>
        </div>
        <button onClick={add} disabled={saving || !form.company_name.trim()} className="mt-3 rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">
          {saving ? 'جاري الحفظ...' : 'إضافة الشركة'}
        </button>
      </div>

      {companies.length === 0 ? (
        <EmptyState title="لا توجد شركات مضافة" desc="أضف شركة التوصيل التي تتعامل معها من الأعلى" />
      ) : (
        <div className="space-y-3">
          {companies.map((c) => {
            const e = editing[c.id] || { api_url: '', api_key: '', api_token: '' };
            return (
              <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-black text-slate-900"><Truck size={18} className="text-teal-600" /> {c.company_name}</h3>
                  <div className="flex gap-1.5">
                    <button onClick={() => test(c.id)} disabled={testing === c.id} className="flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-black text-blue-700 hover:bg-blue-200 disabled:opacity-50">
                      {testing === c.id ? <Loader2 size={13} className="animate-spin" /> : <FlaskConical size={13} />} اختبار الاتصال
                    </button>
                    <button onClick={() => remove(c.id)} className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-black text-red-600 hover:bg-red-100"><Trash2 size={13} /></button>
                  </div>
                </div>
                {testResult[c.id] && <p className="mb-3 rounded-xl bg-slate-50 p-2.5 text-xs font-bold text-slate-600">{testResult[c.id]}</p>}
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="رابط API">
                    <input value={e.api_url} dir="ltr" onChange={(ev) => setEditing({ ...editing, [c.id]: { ...e, api_url: ev.target.value } })} placeholder="https://..." className={`${inputCls} text-left`} />
                  </Field>
                  <div className="grid grid-cols-1 gap-3">
                    <Field label="X-API-Key">
                      <div className="relative">
                        <input type={showKey[c.id] ? 'text' : 'password'} value={e.api_key} dir="ltr" onChange={(ev) => setEditing({ ...editing, [c.id]: { ...e, api_key: ev.target.value } })} className={`${inputCls} pl-10 text-left`} />
                        <button onClick={() => setShowKey({ ...showKey, [c.id]: !showKey[c.id] })} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">{showKey[c.id] ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                      </div>
                    </Field>
                  </div>
                  <Field label="X-API-Token">
                    <div className="relative">
                      <input type={showKey[c.id] ? 'text' : 'password'} value={e.api_token} dir="ltr" onChange={(ev) => setEditing({ ...editing, [c.id]: { ...e, api_token: ev.target.value } })} className={`${inputCls} pl-10 text-left`} />
                      <button onClick={() => setShowKey({ ...showKey, [c.id]: !showKey[c.id] })} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">{showKey[c.id] ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                  </Field>
                  <div className="flex items-end">
                    <button onClick={() => save(c.id)} disabled={saving} className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50">حفظ التعديلات</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
