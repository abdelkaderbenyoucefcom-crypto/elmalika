import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, MapPin, Truck, Users, Settings, LogOut, Menu, X, Store, Sparkles } from 'lucide-react';
import { useAuth, canDo, ROLE_LABELS } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';

export default function AdminLayout() {
  const { staff, role, signOut } = useAuth();
  const { get } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const primary = get('primary_color', '#0d9488');

  const items = [
    { to: '/admin', end: true, icon: LayoutDashboard, label: 'لوحة التحكم', perm: 'dashboard' },
    { to: '/admin/products', icon: Package, label: 'المنتجات', perm: 'products' },
    { to: '/admin/orders', icon: ShoppingCart, label: 'الطلبات', perm: 'orders' },
    { to: '/admin/wilayas', icon: MapPin, label: 'الولايات والشحن', perm: 'wilayas' },
    { to: '/admin/delivery', icon: Truck, label: 'شركات التوصيل', perm: 'delivery' },
    { to: '/admin/staff', icon: Users, label: 'الموظفون', perm: 'staff' },
    { to: '/admin/settings', icon: Settings, label: 'الإعدادات', perm: 'settings' },
  ].filter((i) => canDo(role, i.perm));

  const logout = async () => {
    await signOut();
    navigate('/login');
  };

  const nav = (
    <nav className="space-y-1 p-3">
      {items.map((i) => (
        <NavLink
          key={i.to}
          to={i.to}
          end={i.end}
          onClick={() => setOpen(false)}
          className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition ${isActive ? 'text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
          style={({ isActive }) => (isActive ? { background: primary } : {})}
        >
          <i.icon size={18} /> {i.label}
        </NavLink>
      ))}
      <div className="pt-2">
        <Link to="/" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100">
          <Store size={18} /> عرض المتجر
        </Link>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50">
          <LogOut size={18} /> تسجيل الخروج
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* top bar */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(!open)} aria-label="القائمة">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/admin" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: `linear-gradient(135deg, ${primary}, #0f172a)` }}>
                <Sparkles size={17} />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-black text-slate-900">لوحة التحكم</span>
                <span className="block text-[11px] font-bold text-slate-400">{get('store_name', 'سوق الجزائر')}</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 sm:inline">{ROLE_LABELS[role || ''] || ''}</span>
            {staff?.avatar_url ? (
              <img src={staff.avatar_url} alt={staff.display_name || ''} className="h-9 w-9 rounded-full border object-cover" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-black text-white" style={{ background: primary }}>
                {(staff?.display_name || staff?.email || '?').charAt(0)}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl gap-0 px-0 lg:gap-6 lg:px-4">
        <aside className="hidden w-60 shrink-0 py-6 lg:block">
          <div className="sticky top-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{nav}</div>
        </aside>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-72 overflow-y-auto bg-white shadow-2xl">{nav}</div>
          </div>
        )}
        <main className="min-w-0 flex-1 px-4 py-6 lg:px-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
