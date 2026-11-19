import { exhibitionRecords, type DayRecords, type MoodKey, moods } from '../pages/records/recordsData.ts';
import { getDailyFortune } from './fortunes.ts';

type RecordStorage = Pick<Storage, 'getItem' | 'setItem'>;
export const recordStorageKey = (name: string, birthDate: string) => `byeolungwan.records.v1:${encodeURIComponent(name)}:${birthDate}`;

export function recordFortune(starId: number, date: string): { text: string; example: boolean } {
  if (date >= '2026-11-19') return { text: getDailyFortune(starId, date).compact, example: false };
  const seed = exhibitionRecords[date];
  return seed ? { text: seed.fortune, example: true } : { text: '이 날짜에 등록된 운세가 없습니다.', example: false };
}

export function readRecords(key: string, starId: number, storage?: RecordStorage): DayRecords {
  const records: DayRecords = Object.fromEntries(Object.entries(exhibitionRecords).map(([date, record]) => [date, {
    ...record, fortune: recordFortune(starId, date).text,
  }]));
  try {
    const saved: unknown = JSON.parse((storage ?? window.sessionStorage).getItem(key) ?? '{}');
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return records;
    for (const [date, value] of Object.entries(saved)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !value || typeof value !== 'object') continue;
      const row = value as Record<string, unknown>;
      if (!moods.some((m) => m.key === row.mood) || typeof row.note !== 'string' || typeof row.fortune !== 'string' || typeof row.example !== 'boolean') continue;
      const current = recordFortune(starId, date);
      records[date] = { mood: row.mood as MoodKey, note: row.note, fortune: current.text, example: current.example };
    }
  } catch { /* 저장소가 차단되거나 손상되면 전시 예시 기록으로 시작한다. */ }
  return records;
}

export function saveRecords(key: string, records: DayRecords, storage?: RecordStorage): boolean {
  try { (storage ?? window.sessionStorage).setItem(key, JSON.stringify(records)); return true; }
  catch { return false; }
}
