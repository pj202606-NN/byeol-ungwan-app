import fortuneData from '../data/fortunes/byeolungwan_fortunes_2026-11-20_24.json';
import { koreanDate, selectFortuneSourceDate } from './fortuneDates.ts';
import { birthConstellations } from './birthConstellation.ts';

export const EXHIBITION_START = fortuneData.dailyStart;
export const EXHIBITION_END = fortuneData.dailyEnd;
export const INITIAL_FORTUNE_DATE = EXHIBITION_START;
export const fortuneCategories = [
  { key: 'total', label: '종합', source: '종합' },
  { key: 'relation', label: '인간관계', source: '관계' },
  { key: 'work', label: '학업 · 일', source: '학업·일' },
  { key: 'money', label: '금전 · 재물', source: '금전' },
] as const;
export const fortunePeriods = [
  { key: 'today', label: '오늘의 운세' },
  { key: 'month', label: '이달의 운세' },
  { key: 'year', label: '올해의 운세' },
  { key: 'analysis', label: '분석' },
] as const;
export type FortunePeriod = (typeof fortunePeriods)[number]['key'];
export type FortuneDirection = (typeof birthConstellations)[number]['direction'];
type Category = (typeof fortuneCategories)[number]['source'];
type FortuneText = { short: string; detail: string; ultraShort?: string; advice?: string; fortune?: string };
type FortuneStar = {
  name: string; hanja: string; direction: string;
  daily: Record<string, Record<Category, FortuneText>>;
  monthly: Record<Category, FortuneText>; yearly: Record<Category, FortuneText>;
  analysis: Record<string, string>;
};
/** Numeric IDs are independent of dictionary display order; distinguish both 위수. */
export const fortuneStarKeys = [
  '각수', '항수', '저수', '방수', '심수', '미수', '기수',
  '두수', '우수', '여수', '허수', '위수(危)', '실수', '벽수',
  '규수', '루수', '위수(胃)', '묘수', '필수', '자수', '삼수',
  '정수', '귀수', '류수', '성수', '장수', '익수', '진수',
] as const;

function starData(starId: number): FortuneStar {
  if (!Number.isInteger(starId) || !fortuneStarKeys[starId - 1]) throw new RangeError('별자리 ID를 확인해 주세요.');
  const key = fortuneStarKeys[starId - 1];
  const star = (fortuneData.constellations as Record<string, FortuneStar>)[key];
  if (!star || !star.hanja.includes(birthConstellations[starId - 1].hanja[0])) throw new Error(`별자리 원고가 없습니다: ${key}`);
  return star;
}

export const rankingDirections = [
  { id: 'east', label: '청룡', meta: '青龍 · 동방' },
  { id: 'north', label: '현무', meta: '玄武 · 북방' },
  { id: 'west', label: '백호', meta: '白虎 · 서방' },
  { id: 'south', label: '주작', meta: '朱雀 · 남방' },
] as const;

/** Keep the actual Korea date; clamp the manuscript date at the data boundary. */
export function getFortuneToday(now = new Date()): string {
  const today = koreanDate(now);
  return today < EXHIBITION_START ? EXHIBITION_START : today;
}
export function addFortuneDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
export function formatFortuneDate(date: string, weekday = false): string {
  const value = new Date(`${date}T00:00:00Z`);
  const label = `${value.getUTCMonth() + 1}월 ${value.getUTCDate()}일`;
  return weekday ? `${label} · ${'일월화수목금토'[value.getUTCDay()]}` : label;
}

export function getDailyFortune(starId: number, date: string) {
  const sourceDate = selectFortuneSourceDate(date, EXHIBITION_START, EXHIBITION_END);
  const rows = starData(starId).daily[sourceDate];
  if (!rows) throw new Error(`일별 운세 원고가 없습니다: ${starId} / ${sourceDate}`);
  const categories = Object.fromEntries(fortuneCategories.map(({ source }) => {
    const row = rows[source];
    if (!row?.short || !row.detail || !row.fortune) throw new Error(`운세 원고가 없습니다: ${source}`);
    return [source, { brief: row.short, detail: row.detail, flow: row.fortune }];
  })) as Record<Category, { brief: string; detail: string; flow: string }>;
  if (!rows.종합.ultraShort || !rows.종합.advice) throw new Error('초간략·조언 원고가 없습니다.');
  return { sourceDate, policy: date < EXHIBITION_START ? 'first' : date > EXHIBITION_END ? 'frozen' : 'daily',
    compact: rows.종합.ultraShort, advice: rows.종합.advice, categories };
}

export function getFortuneContent(starId: number, date: string, period: FortunePeriod) {
  const star = starData(starId);
  if (period === 'analysis') {
    if (!star.analysis['간략 총평']) throw new Error('별자리 분석 원고가 없습니다.');
    return { label: '별자리 분석', summary: star.analysis['간략 총평'], advice: '', footer: '',
      sections: Object.entries(star.analysis).filter(([label]) => label !== '간략 총평')
        .map(([label, body], index) => ({ key: `analysis-${index}`, label, body })) };
  }
  if (period === 'today') {
    const daily = getDailyFortune(starId, date);
    return { label: '오늘의 운세', summary: daily.categories.종합.brief, advice: daily.advice, footer: formatFortuneDate(date, true),
      sections: fortuneCategories.map(({ key, label, source }) => ({ key, label, body: daily.categories[source].detail })) };
  }
  const rows = period === 'month' ? star.monthly : star.yearly;
  if (!rows.종합.short || !rows.종합.advice) throw new Error('기간별 원고가 없습니다.');
  return { label: period === 'month' ? '이달의 운세' : '올해의 운세', summary: rows.종합.short, advice: rows.종합.advice,
    footer: period === 'month' ? '2026년 11월' : '2026년',
    sections: fortuneCategories.map(({ key, label, source }) => {
      if (!rows[source]?.detail) throw new Error(`기간별 원고가 없습니다: ${source}`);
      return { key, label, body: rows[source].detail };
    }) };
}

const flowOrder: Record<string, number> = { 길: 2, 보통: 1, 주의: 0 };
/** Preserve the existing ranking rule with the new manuscript's statuses. */
export function getDirectionRanking(direction: FortuneDirection, date: string) {
  return birthConstellations.filter((star) => star.direction === direction).map((star) => {
    const daily = getDailyFortune(star.starId, date);
    const flow = daily.categories.종합.flow;
    const secondary = fortuneCategories.slice(1).reduce((sum, category) => sum + flowOrder[daily.categories[category.source].flow], 0);
    return { ...star, flow, primary: flowOrder[flow], secondary, compact: daily.compact };
  }).sort((a, b) => b.primary - a.primary || b.secondary - a.secondary || a.starId - b.starId)
    .map((star, index) => ({ ...star, rank: String(index + 1).padStart(2, '0') }));
}
