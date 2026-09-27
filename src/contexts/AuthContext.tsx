import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import supabase from '../lib/supabase';
import type { Staff } from '../lib/types';

export const SUPER_ADMIN_EMAIL = 'Abdelkaderbenyoucef.com@gmail.com';

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'أدمن رئيسي',
  store_manager: 'مسير متجر',
  confirmation_agent: 'مؤكد طلبات',
  accountant: 'محاسب',
};

const PERMS: Record<string, string[]> = {
  super_admin: ['*'],
  store_manager: ['dashboard', 'products', 'orders', 'wilayas', 'delivery'],
  confirmation_agent: ['dashboard', 'orders'],
  accountant: ['dashboard', 'orders'],
};

export function canDo(role: string | null, perm: string): boolean {
  if (!role) return false;
  const p = PERMS[role];
  if (!p) return false;
  return p.includes('*') || p.includes(perm);
}

interface AuthCtx {
  user: User | null;
  staff: Staff | null;
  role: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshStaff: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({ user: null, staff: null, role: null, loading: true, signOut: async () => {}, refreshStaff: async () => {} });

async function fetchStaff(email: string): Promise<Staff | null> {
  try {
    const res = await fetch(`/api/staff?email=${encodeURIComponent(email.toLowerCase())}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);

  const resolveStaff = async (u: User | null) => {
    if (!u?.email) { setStaff(null); return; }
    const row = await fetchStaff(u.email);
    if (row) { setStaff(row); return; }
    if (u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      setStaff({ id: 'super', email: u.email, display_name: 'المدير العام', role: 'super_admin', is_active: true, created_at: '' });
      return;
    }
    setStaff(null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      await resolveStaff(u);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      await resolveStaff(u);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setStaff(null);
  };

  const refreshStaff = async () => { await resolveStaff(user); };

  const role = staff && staff.is_active ? staff.role : null;

  return (
    <AuthContext.Provider value={{ user, staff, role, loading, signOut, refreshStaff }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
