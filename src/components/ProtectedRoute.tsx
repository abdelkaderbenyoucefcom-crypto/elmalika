import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth, canDo } from '../contexts/AuthContext';
import { Spinner } from './Ui';
import supabase from '../lib/supabase';

export default function ProtectedRoute({ children, perm }: { children: ReactNode; perm?: string }) {
  const { user, staff, role, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><Spinner size={40} /></div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!staff || !staff.is_active) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <ShieldAlert size={48} className="text-red-500" />
        <h2 className="text-xl font-bold">حسابك غير مصرح له بالدخول</h2>
        <p className="text-slate-500">تواصل مع المدير الرئيسي لمنحك الصلاحيات اللازمة.</p>
        <button onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')} className="rounded-lg bg-slate-900 px-6 py-2 text-white">تسجيل الخروج</button>
      </div>
    );
  }
  if (perm && !canDo(role, perm)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
        <ShieldAlert size={44} className="text-amber-500" />
        <h2 className="text-xl font-bold">لا تملك صلاحية الوصول لهذه الصفحة</h2>
        <p className="text-slate-500">دورك الحالي لا يسمح بعرض هذا القسم.</p>
      </div>
    );
  }
  return <>{children}</>;
}
