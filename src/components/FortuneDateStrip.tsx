import { useEffect, useLayoutEffect, useRef, type PointerEvent } from 'react';
import { addFortuneDays, EXHIBITION_START, formatFortuneDate } from '../services/fortunes.ts';
import './FortuneDateStrip.css';

interface Props {
  today: string;
  date: string;
  onSelect: (date: string) => void;
}

/** 앞뒤 두 칸 여백을 두어 첫날·오늘도 항상 가운데에 맞출 수 있다. */
export default function FortuneDateStrip({ today, date, onSelect }: Props) {
  const rowRef = useRef<HTMLOListElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const drag = useRef<{ pointerId: number; x: number; left: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const dates: string[] = [];
  for (let day = addFortuneDays(EXHIBITION_START, -2); day <= addFortuneDays(today, 2); day = addFortuneDays(day, 1)) dates.push(day);

  const center = () => {
    const row = rowRef.current;
    if (!row) return;
    const selected = dates[Math.round(row.scrollLeft / (row.clientWidth / 5)) + 2];
    if (selected && selected >= EXHIBITION_START && selected <= today) onSelect(selected);
  };

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const align = () => { row.scrollLeft = (dates.indexOf(date) - 2) * row.clientWidth / 5; };
    align();
    const observer = new ResizeObserver(align);
    observer.observe(row);
    return () => observer.disconnect();
  }, [date, today]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const finishDrag = (event: PointerEvent<HTMLOListElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    const moved = drag.current.moved;
    drag.current = null;
    event.currentTarget.classList.remove('is-dragging');
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (moved) {
      suppressClick.current = true;
      center();
      const row = event.currentTarget;
      row.scrollTo({ left: Math.round(row.scrollLeft / (row.clientWidth / 5)) * row.clientWidth / 5, behavior: 'smooth' });
    }
  };

  return (
    <ol
      ref={rowRef}
      className="fortune-date-strip"
      aria-label="운세 날짜 선택"
      onScroll={() => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => { if (!drag.current) center(); }, 120);
      }}
      onPointerDown={(event) => {
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        suppressClick.current = false;
        drag.current = { pointerId: event.pointerId, x: event.clientX, left: event.currentTarget.scrollLeft, moved: false };
      }}
      onPointerMove={(event) => {
        const current = drag.current;
        if (!current) return;
        const delta = event.clientX - current.x;
        if (Math.abs(delta) > 5) {
          current.moved = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.classList.add('is-dragging');
        }
        if (current.moved) event.currentTarget.scrollLeft = current.left - delta;
      }}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onClickCapture={(event) => {
        if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; }
      }}
      onKeyDown={(event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const next = addFortuneDays(date, event.key === 'ArrowLeft' ? -1 : 1);
        if (next >= EXHIBITION_START && next <= today) onSelect(next);
      }}
    >
      {dates.map((day) => {
        const unavailable = day < EXHIBITION_START || day > today;
        const value = new Date(`${day}T00:00:00Z`);
        return (
          <li key={day}>
            <button
              type="button"
              className={`home-past__day home-past__day--${day === date ? 'selected' : unavailable ? 'dim' : 'normal'}`}
              disabled={unavailable}
              aria-label={`${formatFortuneDate(day)}${day === today ? ', 오늘' : ''} 운세`}
              aria-pressed={day === date}
              aria-current={day === today ? 'date' : undefined}
              onClick={() => onSelect(day)}
            >
              <span className="home-past__weekday">{'일월화수목금토'[value.getUTCDay()]}</span>
              <span className="home-past__num">{value.getUTCDate()}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
