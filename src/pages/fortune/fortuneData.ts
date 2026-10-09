/**
 * 운세 화면 표시 데이터 — ⚠️ 디자인 시안(06_fortune.png)의 예시 값
 * 실제 운세 계산 규칙·데이터는 미확정 (APP_SCREEN_STRUCTURE.md 14장)
 */
import { todayHero } from '../home/homeData.ts';

export const fortuneTabs = ['오늘의 운세', '이달의 운세', '올해의 운세', '분석'];

export const fortuneHero = {
  name: todayHero.name,
  hanja: todayHero.hanja,
  alias: '너구리자리',
  period: '4.30 - 5.17',
  // 홈과 같은 별자리 도형을 작게 표시 (홈 좌표를 viewBox 로 잘라 사용)
  stars: todayHero.stars,
  lines: todayHero.lines,
};

export const todayQuote = {
  label: '오늘의 운세',
  lines: ['작은 균열이 보일 수 있습니다.', '미리 살피면 큰일이 되지 않습니다.'],
  date: '9월 26일 · 토',
};

const sampleBody = [
  '평소보다 에너지 소모가 많을 수 있는 날입니다.',
  '적응력과 현실 감각이 오늘의 흐름과 다소 엇갈리니,',
  '잘 되던 일도 한 번 더 확인하고 지금 할 수 있는 것에만',
  '집중하십시오.',
];

/** 분류별 운세 (디자인 시안은 네 항목 모두 같은 예시 문장) */
export const fortuneCategories = [
  { key: 'total', label: '종합', body: sampleBody },
  { key: 'relation', label: '인간관계', body: sampleBody },
  { key: 'work', label: '학업 · 일', body: sampleBody },
  { key: 'money', label: '금전 · 재물', body: sampleBody },
];

export const luckySymbols = [
  { label: '행운의 색', value: '황색' },
  { label: '행운의 방위', value: '중앙' },
  { label: '행운의 요일', value: '토요일' },
  { label: '행운의 행성', value: '토성' },
];

export const adviceQuote = {
  label: '오늘의 조언',
  lines: ['가장 하기 싫은 일을 가장 먼저 끝내면', '하루가 넉넉해집니다.'],
};

/** 심화 운세 안내 (출생 시각 입력 시 제공 예정 — APP_SCREEN_STRUCTURE.md 2장) */
export const deepFortune = {
  title: '더 깊이 보기',
  lines: ['탄생시를 추가로 입력하면', '심화된 맞춤 운세를 볼 수 있습니다.'],
  link: '설정 바로가기',
  /** 흐림 처리된 뒤쪽 예시 문장 (디자인 시안의 흐린 텍스트 표현용) */
  blurredTitle: '심화 해석',
  blurredBody: [...sampleBody, ...sampleBody.slice(0, 3)],
};
