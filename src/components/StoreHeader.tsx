import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Store, Menu, X, LockKeyhole, Truck, BadgeCheck, Home, ShoppingBag } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';

export default function StoreHeader() {
  const { get } = useStore();
  const [open, setOpen] = useState(false);
  const storeName = get('store_name', 'سوق الجزائر');
  const primary = get('primary_color', '#0d9488');
  const logoUrl = get('logo_url', '');
  const announcement = get('announcement_text', '');
  const announcementActive = get('announcement_active', 'true') === 'true';

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition ${isActive ? 'text-white' : 'text-slate-600 hover:bg-slate-100'}`;

  return (
    <header className="sticky top-0 z-40 shadow-sm">
      {announcementActive && announcement && (
        <div className="flex items-center justify-center gap-2 px-4 py-1.5 text-center text-xs font-bold text-white" style={{ background: primary }}>
          <Truck size={14} />
          <span>{announcement}</span>
        </div>
      )}
      <div className="relative bg-white/95 backdrop-blur">
        {/* hidden admin hover zone (left edge) */}
        <div className="group absolute left-0 top-0 flex h-full w-12 items-center justify-center">
          <Link to="/admin" title="دخول الإدارة" className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 opacity-0 transition-all duration-300 hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100">
            <LockKeyhole size={15} />
          </Link>
        </div>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="h-10 max-w-[120px] rounded-lg object-contain" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow" style={{ background: `linear-gradient(135deg, ${primary}, #0f766e)` }}>
                <Store size={20} />
              </span>
            )}
            <span className="leading-tight">
              <span className="block text-lg font-black text-slate-900">{storeName}</span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                <BadgeCheck size={12} className="text-emerald-500" /> الدفع عند الاستلام
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" className={linkCls} style={({ isActive }) => (isActive ? { background: primary } : {})}><Home size={15} /> الرئيسية</NavLink>
            <NavLink to="/shop" className={linkCls} style={({ isActive }) => (isActive ? { background: primary } : {})}><ShoppingBag size={15} /> المتجر</NavLink>
            <Link to="/shop" className="mr-2 rounded-xl px-5 py-2 text-sm font-black text-white shadow transition hover:opacity-90" style={{ background: primary }}>تسوق الآن</Link>
          </nav>
          <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden" onClick={() => setOpen(!open)} aria-label="القائمة">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {open && (
          <nav className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
            <NavLink to="/" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"><Home size={16} /> الرئيسية</NavLink>
            <NavLink to="/shop" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"><ShoppingBag size={16} /> المتجر</NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}
