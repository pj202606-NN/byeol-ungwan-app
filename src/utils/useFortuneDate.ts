import { useEffect, useState } from 'react';
import { EXHIBITION_START, getFortuneToday } from '../services/fortunes.ts';

/** 앱이 열린 동안에도 한국 날짜 변경 및 백그라운드 복귀를 확인한다. */
export function useFortuneDate() {
  const [today, setToday] = useState(getFortuneToday);
  const [date, setDate] = useState(today);
  useEffect(() => {
    const check = () => {
      const next = getFortuneToday();
      if (next !== today) {
        setToday(next);
        setDate(next);
      }
    };
    const timer = window.setInterval(check, 1000);
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    check();
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, [today]);
  const selectDate = (value: string) => {
    if (value >= EXHIBITION_START && value <= today) setDate(value);
  };
  return { fortuneToday: today, fortuneDate: date, selectFortuneDate: selectDate };
}
