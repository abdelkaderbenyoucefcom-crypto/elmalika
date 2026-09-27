import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, Banknote, TrendingUp, Clock, ArrowLeft } from 'lucide-react';
import { Spinner, StatusBadge, EmptyState } from '../../components/Ui';
import { fmtPrice, fmtDate, shortId } from '../../lib/utils';
import type { Order } from '../../lib/types';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/orders?limit=200').then((r) => r.json()).catch(() => []),
      fetch('/api/products').then((r) => r.json()).catch(() => []),
    ]).then(([o, p]) => {
      setOrders(Array.isArray(o) ? o : []);
      setProductCount(Array.isArray(p) ? p.length : 0);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'pending').length;
    const confirmed = orders.filter((o) => ['confirmed', 'shipped', 'delivered'].includes(o.status)).length;
    const delivered = orders.filter((o) => o.status === 'delivered');
    const revenue = delivered.reduce((s, o) => s + Number(o.total_price), 0);
    const rate = total ? Math.round((confirmed / total) * 100) : 0;
    const byDay: Record<string, number> = {};
    orders.forEach((o) => {
      const d = new Date(o.created_at).toLocaleDateString('en-CA');
      byDay[d] = (byDay[d] || 0) + 1;
    });
    const days = Object.entries(byDay).sort().slice(-7);
    const maxDay = Math.max(1, ...days.map(([, v]) => v));
    return { total, pending, revenue, rate, days, maxDay, delivered: delivered.length };
  }, [orders]);

  if (loading) return <div className="rounded-2xl bg-white py-20"><Spinner size={40} /></div>;

  const cards = [
    { icon: ShoppingCart, label: 'إجمالي الطلبات', value: String(stats.total), bg: 'bg-blue-500' },
    { icon: Clock, label: 'بانتظار التأكيد', value: String(stats.pending), bg: 'bg-amber-500' },
    { icon: Banknote, label: 'إيراد الموصلة', value: fmtPrice(stats.revenue), bg: 'bg-emerald-500' },
    { icon: Package, label: 'المنتجات', value: String(productCount), bg: 'bg-violet-500' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 sm:text-2xl">لوحة التحكم</h1>
          <p className="mt-1 text-sm text-slate-500">نظرة شاملة على نشاط متجرك</p>
        </div>
        <Link to="/admin/orders" className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
          إدارة الطلبات <ArrowLeft size={15} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${c.bg}`}><c.icon size={19} /></span>
            <p className="mt-3 text-xl font-black text-slate-900 sm:text-2xl">{c.value}</p>
            <p className="text-xs font-bold text-slate-500 sm:text-sm">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 font-black text-slate-900"><TrendingUp size={18} className="text-teal-600" /> الطلبات — آخر 7 أيام نشطة</h3>
          {stats.days.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">لا توجد طلبات بعد</p>
          ) : (
            <div className="mt-5 flex h-40 items-end justify-around gap-2" dir="ltr">
              {stats.days.map(([d, v]) => (
                <div key={d} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-xs font-black text-slate-700">{v}</span>
                  <div className="w-full max-w-[44px] rounded-t-lg bg-gradient-to-t from-teal-600 to-teal-400" style={{ height: `${Math.max(8, (v / stats.maxDay) * 110)}px` }} />
                  <span className="text-[10px] font-bold text-slate-400">{d.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-center text-sm font-bold text-slate-600">
            نسبة التأكيد: <span className="text-teal-700">{stats.rate}%</span> — طلبات موصلة: <span className="text-teal-700">{stats.delivered}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-black text-slate-900">أحدث الطلبات</h3>
            <Link to="/admin/orders" className="text-xs font-black text-teal-700 hover:underline">عرض الكل</Link>
          </div>
          {orders.length === 0 ? (
            <EmptyState title="لا توجد طلبات" />
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 6).map((o) => (
                <Link key={o.id} to="/admin/orders" className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 p-3 transition hover:bg-slate-50">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-800">{o.customer_name} <span className="font-bold text-slate-400" dir="ltr">#{shortId(o.id)}</span></p>
                    <p className="truncate text-xs text-slate-500">{o.products?.title} — {fmtDate(o.created_at)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusBadge status={o.status} />
                    <span className="text-xs font-black text-slate-700">{fmtPrice(o.total_price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
