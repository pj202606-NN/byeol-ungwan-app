import { useEffect, useState } from 'react';

/** Updates only the reference clock; no astronomy or simulated positions. */
export function useReferenceTime(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  const refresh = () => setNow(new Date());
  useEffect(() => {
    const update = () => { if (!document.hidden) setNow(new Date()); };
    const timer = window.setInterval(update, intervalMs);
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', update);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', update); document.removeEventListener('visibilitychange', update); };
  }, [intervalMs]);
  return { refresh, datetime: new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(now) };
}
