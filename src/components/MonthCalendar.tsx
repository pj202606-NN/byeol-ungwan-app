import Chevron from './Chevron.tsx';
import './MonthCalendar.css';

export interface CalendarDate {
  year: number;
  /** 1 ~ 12 */
  month: number;
  day: number;
}

interface MonthCalendarProps {
  year: number;
  /** 1 ~ 12 */
  month: number;
  /** 날짜별 표시 점 색 — 키: 'YYYY-MM-DD' */
  marks?: Record<string, string>;
  /** 오늘 (테두리 원) */
  today?: CalendarDate;
  /** 강조 날짜 (금색 원) */
  highlighted?: CalendarDate;
  onPrev?: () => void;
  onNext?: () => void;
  onSelect?: (date: CalendarDate) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export const dateKey = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const same = (a: CalendarDate | undefined, y: number, m: number, d: number) =>
  !!a && a.year === y && a.month === m && a.day === d;

/**
 * 월 달력 (07 기록) — ‹ YYYY년 M월 › + 요일 + 날짜, 날짜 위 점(기록 표시)
 * '오늘' 이후 날짜는 흐리게 표시
 */
export default function MonthCalendar({ year, month, marks = {}, today, highlighted, onPrev, onNext, onSelect }: MonthCalendarProps) {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayNum = today ? today.year * 10000 + today.month * 100 + today.day : Infinity;

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="month-calendar">
      <div className="month-calendar__nav">
        <button type="button" className="month-calendar__arrow" onClick={onPrev} aria-label="이전 달">
          <Chevron direction="left" size={7} />
        </button>
        <p className="month-calendar__title" aria-live="polite">
          {year}년 {month}월
        </p>
        <button type="button" className="month-calendar__arrow" onClick={onNext} aria-label="다음 달">
          <Chevron direction="right" size={7} />
        </button>
      </div>

      <div className="month-calendar__grid" role="grid" aria-label={`${year}년 ${month}월`}>
        {WEEKDAYS.map((w) => (
          <span key={w} className="month-calendar__weekday" role="columnheader">
            {w}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`e${i}`} aria-hidden="true" />;
          const mark = marks[dateKey(year, month, day)];
          const future = year * 10000 + month * 100 + day > todayNum;
          const cls = [
            'month-calendar__day',
            future && 'is-future',
            same(today, year, month, day) && 'is-today',
            same(highlighted, year, month, day) && 'is-highlighted',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button key={day} type="button" className={cls} role="gridcell" disabled={future}
              data-date={dateKey(year, month, day)} aria-selected={same(highlighted, year, month, day)}
              aria-current={same(today, year, month, day) ? 'date' : undefined}
              aria-label={`${year}년 ${month}월 ${day}일${mark ? ', 기분 기록 있음' : ''}`}
              onClick={() => onSelect?.({ year, month, day })}>
              {mark && <span className="month-calendar__dot" style={{ background: mark }} aria-hidden="true" />}
              <span className="month-calendar__num">{day}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
