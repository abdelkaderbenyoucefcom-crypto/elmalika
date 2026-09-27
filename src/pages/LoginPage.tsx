import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail, KeyRound, Loader2, Store } from 'lucide-react';
import supabase from '../lib/supabase';
import { signInWithGoogle } from '../lib/googleAuth';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';

export default function LoginPage() {
  const { get } = useStore();
  const { user, staff, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const primary = get('primary_color', '#0d9488');

  useEffect(() => {
    if (!authLoading && user && staff?.is_active) navigate('/admin', { replace: true });
  }, [user, staff, authLoading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) { setError('يرجى إدخال البريد الإلكتروني وكلمة السر'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setError(error.message.includes('Invalid') ? 'بيانات الدخول غير صحيحة' : error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="p-8 text-center text-white" style={{ background: `linear-gradient(135deg, #0f172a, ${primary})` }}>
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur"><LockKeyhole size={26} /></span>
          <h1 className="mt-3 text-2xl font-black">دخول الإدارة</h1>
          <p className="mt-1 text-xs opacity-80">لوحة التحكم — للموظفين المصرح لهم فقط</p>
        </div>
        <form onSubmit={submit} className="space-y-4 p-6 sm:p-8">
          {error && <p className="rounded-xl bg-red-50 p-3 text-center text-sm font-bold text-red-600">{error}</p>}
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-slate-700">البريد الإلكتروني</span>
            <div className="relative">
              <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" dir="ltr" className="w-full rounded-xl border border-slate-200 py-2.5 pl-4 pr-9 text-left text-sm outline-none focus:border-teal-500" />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-slate-700">كلمة السر</span>
            <div className="relative">
              <KeyRound size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" dir="ltr" className="w-full rounded-xl border border-slate-200 py-2.5 pl-4 pr-9 text-left text-sm outline-none focus:border-teal-500" />
            </div>
          </label>
          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-black text-white transition hover:opacity-90 disabled:opacity-60" style={{ background: primary }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'تسجيل الدخول'}
          </button>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" /> أو <span className="h-px flex-1 bg-slate-200" />
          </div>
          <button type="button" onClick={() => signInWithGoogle(get('store_name', 'DZ Store'))} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" /><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" /></svg>
            الدخول عبر Google
          </button>
          <Link to="/" className="flex items-center justify-center gap-1.5 pt-1 text-xs font-bold text-slate-500 hover:text-slate-700">
            <Store size={14} /> العودة للمتجر
          </Link>
        </form>
      </div>
    </div>
  );
}
