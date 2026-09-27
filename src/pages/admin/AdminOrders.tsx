import { useEffect, useMemo, useState } from 'react';
import { Search, Phone, Trash2, Printer, Truck, X, CheckSquare, Square } from 'lucide-react';
import { Spinner, StatusBadge, EmptyState } from '../../components/Ui';
import { fmtPrice, fmtDate, shortId, STATUS_META } from '../../lib/utils';
import type { DeliveryCompany, Order, Wilaya } from '../../lib/types';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [companies, setCompanies] = useState<DeliveryCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<Order | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportCompany, setExportCompany] = useState('');
  const [exportResult, setExportResult] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [o, w, c] = await Promise.all([
        fetch('/api/orders').then((r) => r.json()),
        fetch('/api/wilayas').then((r) => r.json()).catch(() => []),
        fetch('/api/delivery').then((r) => r.json()).catch(() => []),
      ]);
      setOrders(Array.isArray(o) ? o : []);
      setWilayas(Array.isArray(w) ? w : []);
      setCompanies(Array.isArray(c) ? c : []);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const wilayaName = (code: number) => wilayas.find((w) => w.code === code)?.name_ar || `ولاية ${code}`;

  const filtered = useMemo(() => {
    let list = [...orders];
    if (filter) list = list.filter((o) => o.status === filter);
    if (q.trim()) {
      const t = q.trim();
      list = list.filter((o) => o.customer_name.includes(t) || o.customer_phone.includes(t) || o.id.includes(t) || o.commune_name.includes(t));
    }
    return list;
  }, [orders, filter, q]);

  const updateStatus = async (id: string, status: string) => {
    setBusy(true);
    await fetch('/api/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    setBusy(false);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    if (detail?.id === id) setDetail({ ...detail, status });
  };

  const remove = async (id: string) => {
    if (!confirm('حذف هذا الطلب نهائياً؟')) return;
    await fetch('/api/orders', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setDetail(null);
  };

  const toggleSel = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const doExport = async () => {
    if (!exportCompany || !selected.length) return;
    setBusy(true);
    setExportResult('');
    try {
      const res = await fetch('/api/delivery?action=export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: Number(exportCompany), order_ids: selected }),
      });
      const data = await res.json();
      setExportResult(data.attempted === false
        ? `تم تجهيز ${data.count} طلب (لا يوجد API URL — انسخ البيانات يدوياً)`
        : data.ok ? `تم إرسال ${data.count} طلب بنجاح (status ${data.status})` : `فشل الإرسال: ${data.error || data.response || 'خطأ'}`);
    } catch (e) {
      setExportResult(e instanceof Error ? e.message : 'خطأ');
    } finally {
      setBusy(false);
    }
  };

  const printBordereau = () => {
    const rows = orders.filter((o) => selected.includes(o.id));
    if (!rows.length) return;
    const html = `
      <html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>Bordereau</title>
      <style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #333;padding:6px;text-align:right}h2{text-align:center}</style>
      </head><body><h2>وصل التوصيل — Bordereau (${new Date().toLocaleDateString('ar-DZ')})</h2>
      <table><tr><th>#</th><th>الزبون</th><th>الهاتف</th><th>الولاية</th><th>البلدية</th><th>المنتج</th><th>الكمية</th><th>المبلغ (دج)</th></tr>
      ${rows.map((o, i) => `<tr><td>${i + 1}</td><td>${o.customer_name}</td><td>${o.customer_phone}</td><td>${wilayaName(o.wilaya_code)}</td><td>${o.commune_name}</td><td>${o.products?.title || ''}</td><td>${o.quantity}</td><td>${Number(o.total_price).toLocaleString()}</td></tr>`).join('')}
      </table><p><b>المجموع: ${rows.reduce((s, o) => s + Number(o.total_price), 0).toLocaleString()} دج</b> — عدد الطرود: ${rows.length}</p>
      <script>window.print()</script></body></html>`;
    const w = window.open('', '_blank', 'width=900,height=700');
    if (w) { w.document.write(html); w.document.close(); }
  };

  if (loading) return <div className="rounded-2xl bg-white py-20"><Spinner size={40} /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 sm:text-2xl">الطلبات</h1>
          <p className="mt-1 text-sm text-slate-500">{orders.length} طلب — {orders.filter((o) => o.status === 'pending').length} بانتظار التأكيد</p>
        </div>
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setExportOpen(true)} className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700">
              <Truck size={15} /> تصدير ({selected.length})
            </button>
            <button onClick={printBordereau} className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
              <Printer size={15} /> طباعة Bordereau
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={17} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث بالاسم، الهاتف، البلدية..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm outline-none focus:border-teal-500" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none">
          <option value="">كل الحالات</option>
          {Object.entries(STATUS_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="لا توجد طلبات" desc="ستظهر طلبات الزبائن هنا فور وصولها" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[36px_1fr_1fr_110px_130px_150px] gap-2 border-b bg-slate-50 px-4 py-2.5 text-xs font-black text-slate-500 lg:grid">
            <span />
            <span>الزبون</span><span>المنتج</span><span>المجموع</span><span>التاريخ</span><span>الحالة</span>
          </div>
          <div className="divide-y divide-slate-100">
            {filtered.map((o) => (
              <div key={o.id} className="flex cursor-pointer items-center gap-3 px-3 py-3 transition hover:bg-slate-50 sm:px-4" onClick={() => setDetail(o)}>
                <button onClick={(e) => { e.stopPropagation(); toggleSel(o.id); }} className="text-slate-400 hover:text-teal-600">
                  {selected.includes(o.id) ? <CheckSquare size={19} className="text-teal-600" /> : <Square size={19} />}
                </button>
                <div className="min-w-0 flex-1 lg:grid lg:grid-cols-[1fr_1fr_110px_130px_150px] lg:items-center lg:gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-800">{o.customer_name}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-500" dir="ltr"><Phone size={11} /> {o.customer_phone}</p>
                  </div>
                  <p className="truncate text-xs text-slate-500">{o.products?.title} × {o.quantity} — {wilayaName(o.wilaya_code)}</p>
                  <p className="text-sm font-black text-slate-800">{fmtPrice(o.total_price)}</p>
                  <p className="hidden text-xs text-slate-400 lg:block">{fmtDate(o.created_at)}</p>
                  <div className="mt-1 lg:mt-0" onClick={(e) => e.stopPropagation()}>
                    <select value={o.status} disabled={busy} onChange={(e) => updateStatus(o.id, e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold outline-none">
                      {Object.entries(STATUS_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
                    </select>
                  </div>
                </div>
                <StatusBadge status={o.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={() => setDetail(null)}>
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-black text-slate-900">تفاصيل الطلب <span className="text-slate-400" dir="ltr">#{shortId(detail.id)}</span></h3>
              <button onClick={() => setDetail(null)} className="rounded-lg p-1.5 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="space-y-2.5 text-sm">
              <Row k="الزبون" v={detail.customer_name} />
              <Row k="الهاتف" v={<a href={`tel:${detail.customer_phone}`} className="font-black text-teal-700" dir="ltr">{detail.customer_phone}</a>} />
              <Row k="الولاية" v={`${wilayaName(detail.wilaya_code)} (${detail.wilaya_code})`} />
              <Row k="البلدية" v={detail.commune_name} />
              {detail.address && <Row k="العنوان" v={detail.address} />}
              <Row k="التوصيل" v={detail.shipping_type === 'home' ? 'للمنزل' : 'للمكتب'} />
              <Row k="المنتج" v={`${detail.products?.title || ''} × ${detail.quantity}`} />
              {detail.selected_variant && <Row k="الخيارات" v={Object.entries(detail.selected_variant).map(([k, v]) => `${k}: ${v}`).join(' — ')} />}
              <Row k="سعر المنتج" v={fmtPrice(Number(detail.product_price) * detail.quantity)} />
              <Row k="سعر الشحن" v={fmtPrice(detail.shipping_price)} />
              <Row k="المجموع" v={<span className="text-base font-black text-teal-700">{fmtPrice(detail.total_price)}</span>} />
              <Row k="التاريخ" v={fmtDate(detail.created_at)} />
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span className="font-bold text-slate-500">الحالة</span>
                <select value={detail.status} disabled={busy} onChange={(e) => updateStatus(detail.id, e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold outline-none">
                  {Object.entries(STATUS_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <a href={`tel:${detail.customer_phone}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white hover:bg-teal-700">
                <Phone size={16} /> اتصال بالزبون
              </a>
              <button onClick={() => remove(detail.id)} className="flex items-center justify-center gap-1.5 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100">
                <Trash2 size={16} /> حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* export modal */}
      {exportOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={() => setExportOpen(false)}>
          <div className="w-full max-w-md rounded-t-3xl bg-white p-5 sm:rounded-3xl sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-black">تصدير {selected.length} طلب لشركة التوصيل</h3>
              <button onClick={() => setExportOpen(false)} className="rounded-lg p-1.5 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <select value={exportCompany} onChange={(e) => setExportCompany(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none">
              <option value="">— اختر الشركة —</option>
              {companies.filter((c) => c.is_active).map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
            {companies.length === 0 && <p className="mt-2 text-xs text-amber-600">لم تضف أي شركة توصيل بعد — أضفها من صفحة شركات التوصيل.</p>}
            {exportResult && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-bold leading-5 text-slate-700">{exportResult}</p>}
            <button onClick={doExport} disabled={busy || !exportCompany} className="mt-3 w-full rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50">
              {busy ? 'جاري الإرسال...' : 'إرسال عبر API'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
      <span className="shrink-0 font-bold text-slate-500">{k}</span>
      <span className="text-left font-bold text-slate-800">{v}</span>
    </div>
  );
}
