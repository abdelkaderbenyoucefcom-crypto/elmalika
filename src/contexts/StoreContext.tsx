import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { SiteSetting } from '../lib/types';

interface StoreCtx {
  settings: Record<string, string>;
  loading: boolean;
  get: (k: string, fb: string) => string;
  refresh: () => Promise<void>;
}

const StoreContext = createContext<StoreCtx>({ settings: {}, loading: true, get: (_k, fb) => fb, refresh: async () => {} });

function toStr(v: unknown, fb: string): string {
  if (v == null) return fb;
  if (typeof v === 'string') return v;
  return String(v);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetch('/api/settings');
      const data: SiteSetting[] = await res.json();
      const map: Record<string, string> = {};
      (Array.isArray(data) ? data : []).forEach((s) => { map[s.key] = toStr(s.value, ''); });
      setSettings(map);
    } catch {
      /* keep defaults */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const get = (k: string, fb: string) => (settings[k] !== undefined && settings[k] !== '' ? settings[k] : fb);

  return (
    <StoreContext.Provider value={{ settings, loading, get, refresh: load }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
