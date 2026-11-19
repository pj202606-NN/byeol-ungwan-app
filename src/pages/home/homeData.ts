/**
 * 홈 화면 표시 데이터 — ⚠️ 디자인 시안(05_home.png)의 예시 값
 * 실제 운세·순위·궁합·위치 데이터와 계산 규칙은 미확정 (APP_SCREEN_STRUCTURE.md 14장)
 * 데이터가 정해지면 이 파일 대신 services/ 에서 받아오도록 교체
 */
import type { StarPoint } from '../../components/ConstellationFigure.tsx';

export const todayHero = {
  dateLabel: '9월 25일',
  name: '저수',
  hanja: '氐宿',
  meta: ['너구리자리', '백호', '서쪽', '가을'],
  /** 홈 상단 별자리 도형 (Figma 393 폭 기준, 상단 Safe Area 제외 좌표) */
  stars: [
    { x: 115.5, y: 242, r: 2.6 },
    { x: 278.5, y: 235, r: 2.4 },
    { x: 239.5, y: 275, r: 3.4 },
    { x: 156, y: 303, r: 5, glow: true },
    { x: 191, y: 355.5, r: 2.4 },
    { x: 247.5, y: 394.5, r: 4 },
  ] satisfies StarPoint[],
  lines: [[0, 3], [3, 2], [2, 1], [3, 4], [4, 5]] as [number, number][],
};

export const todayFortune = {
  lead: '오늘은,',
  lines: ['작은 균열이 보일 수 있습니다.', '미리 살피면 큰일이 되지 않습니다.'],
};

/** 지난 운세 — tone: dim(흐린 날짜) / normal / selected(선택된 날짜) */
export const pastDays = [
  { weekday: '일', day: 21, tone: 'dim' },
  { weekday: '월', day: 22, tone: 'normal' },
  { weekday: '화', day: 23, tone: 'selected' },
  { weekday: '수', day: 24, tone: 'normal' },
  { weekday: '목', day: 25, tone: 'dim' },
] as const;

/** 상단 바로가기 메뉴 — 누르면 아래 섹션으로 이동 */
export const homeTabs = [
  { key: 'ranking', label: '운세 순위' },
  { key: 'compat', label: '궁합' },
  { key: 'explore', label: '별자리 탐색' },
  { key: 'dict', label: '별자리 사전' },
] as const;

export const ranking = [
  { rank: '01', name: '각수', hanja: '角宿', score: 97 },
  { rank: '02', name: '각수', hanja: '角宿', score: 97 },
  { rank: '03', name: '각수', hanja: '角宿', score: 97 },
];

export const compatibilityLegend = ['천생연분', '보완', '주의'];
export const compatibilityPicks = ['각수', '각수', '각수'];

export const directions = ['청룡', '현무', '백호', '주작'];

export const dictionaryCards = [
  { name: '각수', alias: '교룡자리', period: '4.10 - 4.9' },
  { name: '향수', alias: '용자리', period: '4.20 - 4.29' },
  { name: '저수', alias: '담비자리', period: '4.30 - 5.17' },
  { name: '방수', alias: '', period: '' },
  // ⚠️ 더미 카드 3장 — 청룡 7수 구성(가로로 넘겨 보기) 확인용. 실제 데이터 확정 시 교체
  { name: '○○수', alias: '○○자리', period: '0.00 - 0.00' },
  { name: '○○수', alias: '○○자리', period: '0.00 - 0.00' },
  { name: '○○수', alias: '○○자리', period: '0.00 - 0.00' },
];
