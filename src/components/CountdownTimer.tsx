import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

function diff(end: string) {
  const ms = new Date(end).getTime() - Date.now();
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
    done: ms <= 0,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function CountdownTimer({ end, message, color = '#dc2626', variant = 'full' }: { end: string; message?: string | null; color?: string; variant?: 'full' | 'inline' }) {
  const [t, setT] = useState(() => diff(end));
  useEffect(() => {
    setT(diff(end));
    const id = window.setInterval(() => setT(diff(end)), 1000);
    return () => window.clearInterval(id);
  }, [end]);

  if (variant === 'inline') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-black text-white" style={{ background: color }}>
        <Timer size={15} />
        {message || 'ينتهي العرض خلال'}: {pad(t.d)}:{pad(t.h)}:{pad(t.m)}:{pad(t.s)}
      </span>
    );
  }
  const cell = 'flex min-w-[64px] flex-col items-center rounded-xl bg-white/15 px-2 py-2 backdrop-blur';
  return (
    <div className="rounded-2xl p-5 text-center text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${color}, #7f1d1d)` }}>
      <p className="mb-3 flex items-center justify-center gap-2 text-sm font-black"><Timer size={16} />{message || 'عرض خاص ينتهي خلال:'}</p>
      <div className="flex items-center justify-center gap-2" dir="ltr">
        <div className={cell}><span className="text-2xl font-black tabular-nums">{pad(t.d)}</span><span className="text-[11px] opacity-80">يوم</span></div>
        <span className="text-xl font-black">:</span>
        <div className={cell}><span className="text-2xl font-black tabular-nums">{pad(t.h)}</span><span className="text-[11px] opacity-80">ساعة</span></div>
        <span className="text-xl font-black">:</span>
        <div className={cell}><span className="text-2xl font-black tabular-nums">{pad(t.m)}</span><span className="text-[11px] opacity-80">دقيقة</span></div>
        <span className="text-xl font-black">:</span>
        <div className={cell}><span className="text-2xl font-black tabular-nums">{pad(t.s)}</span><span className="text-[11px] opacity-80">ثانية</span></div>
      </div>
      {t.done && <p className="mt-2 text-xs font-bold opacity-90">انتهت مدة العرض — لكن يمكنك الطلب بالسعر الحالي</p>}
    </div>
  );
}
