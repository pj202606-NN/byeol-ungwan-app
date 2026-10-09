/**
 * 기록 화면 표시 데이터 — ⚠️ 디자인 시안(07_records.png)의 예시 값
 * 실제 기록 저장·불러오기 방식은 미확정 (APP_SCREEN_STRUCTURE.md 14장)
 * 데이터가 정해지면 services/ 에서 받아오도록 교체
 */
import type { CalendarDate } from '../../components/MonthCalendar.tsx';

/** 기분 5종 (범례 순서 = 칩 순서) */
export const moods = [
  { key: 'clear', label: '맑음', color: '#dfd5bb' },
  { key: 'excited', label: '설렘', color: '#80c6ff' },
  { key: 'calm', label: '잔잔함', color: '#416f95' },
  { key: 'tired', label: '지침', color: '#475e71' },
  { key: 'cloudy', label: '흐림', color: '#142a3d' },
] as const;

export type MoodKey = (typeof moods)[number]['key'];

/** 오늘 — 달력 테두리 원 (확정). 디자인 시안 날짜이며 실제 날짜가 아님 — 데이터 연결 시 new Date() 기준으로 교체 */
export const sampleToday: CalendarDate = { year: 2026, month: 9, day: 26 };

/** 현재 선택한 날짜 — 달력 금색 원 (확정). 날짜 선택 동작은 추후 구현 */
export const sampleHighlighted: CalendarDate = { year: 2026, month: 9, day: 24 };

/** 날짜별 기분 기록 예시 (2026년 9월만) */
export const sampleRecords: Record<string, MoodKey> = {
  '2026-09-04': 'excited',
  '2026-09-05': 'tired',
  '2026-09-09': 'excited',
  '2026-09-17': 'clear',
  '2026-09-21': 'cloudy',
  '2026-09-22': 'calm',
};

/** 오른쪽 위 범례 — ● 금색 원 = 선택한 날짜, ○ 테두리 원 = 오늘 (확정) */
export const selectionLegend = ['선택', '오늘'];

/** 선택한 날의 기록 (디자인 시안: 오늘 9월 26일) */
export const sampleDayDetail = {
  weekday: '토요일',
  isToday: true,
  dateLabel: '2026년 9월 26일',
  quote: ['작은 균열이 보일 수 있습니다.', '미리 살피면 큰일이 되지 않습니다.'],
  source: '누수자리 · 角宿',
};

export const shortRecordPlaceholder = '오늘 하루를 한두 줄로 하늘에 남겨 보세요!';
