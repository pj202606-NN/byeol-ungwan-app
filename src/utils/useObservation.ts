import { useEffect, useMemo, useState } from 'react';
import { getObservation } from '../services/observation.ts';

export function useObservation(starId: number) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const update = () => { if (!document.hidden) setNow(new Date()); };
    const timer = window.setInterval(update, 60000);
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', update);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', update); document.removeEventListener('visibilitychange', update); };
  }, []);
  const observation = useMemo(() => getObservation(starId, now), [starId, now]);
  return { ...observation, refresh: () => setNow(new Date()) };
}
