import { Link } from 'react-router-dom';
import { Store, Truck, ShieldCheck, Banknote, LockKeyhole, Phone } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';

export default function StoreFooter() {
  const { get } = useStore();
  const storeName = get('store_name', 'سوق الجزائر');
  const primary = get('primary_color', '#0d9488');
  const logoUrl = get('logo_url', '');

  return (
    <footer className="mt-14 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 text-white">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="h-9 max-w-[110px] rounded-lg object-contain" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: primary }}><Store size={18} /></span>
            )}
            <span className="text-lg font-black">{storeName}</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">متجر جزائري موثوق: منتجات أصلية مختارة بعناية، الدفع عند الاستلام، والتوصيل السريع لـ 58 ولاية.</p>
        </div>
        <div>
          <h4 className="mb-3 font-black text-white">روابط سريعة</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white">الرئيسية</Link></li>
            <li><Link to="/shop" className="hover:text-white">جميع المنتجات</Link></li>
            <li><Link to="/login" className="hover:text-white">دخول الموظفين</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-black text-white">لماذا نحن؟</h4>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-center gap-2"><Banknote size={15} className="text-emerald-400" /> الدفع عند الاستلام</li>
            <li className="flex items-center gap-2"><Truck size={15} className="text-emerald-400" /> توصيل لـ 58 ولاية</li>
            <li className="flex items-center gap-2"><ShieldCheck size={15} className="text-emerald-400" /> معاينة قبل الدفع</li>
            <li className="flex items-center gap-2"><Phone size={15} className="text-emerald-400" /> تأكيد هاتفي لكل طلب</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-black text-white">التوصيل</h4>
          <p className="text-sm leading-6 text-slate-400">نتعامل مع أفضل شركات التوصيل في الجزائر. اختر التوصيل للمنزل أو للمكتب حسب ولايتك، وادفع فقط عند وصول طلبك.</p>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="group mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-xs text-slate-500">
          <span>© 2026 {storeName} — جميع الحقوق محفوظة</span>
          <Link to="/admin" className="flex items-center gap-1 opacity-0 transition-opacity duration-300 hover:text-slate-300 group-hover:opacity-100">
            <LockKeyhole size={12} /> دخول الإدارة
          </Link>
        </div>
      </div>
    </footer>
  );
}
