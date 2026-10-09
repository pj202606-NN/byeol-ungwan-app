/**
 * 탐색 화면 표시 데이터 — ⚠️ 디자인 시안(08_03_explore.png)의 예시 값
 * 실제 천체 위치 계산·사용자 위치·관측 정보는 미확정 (APP_SCREEN_STRUCTURE.md 14장)
 */
import { todayHero } from '../home/homeData.ts';

export const exploreHero = {
  name: todayHero.name,
  // 홈과 같은 별자리 도형 (홈 좌표를 그대로 쓰고 보여 주는 영역만 위로 78 이동)
  stars: todayHero.stars,
  lines: todayHero.lines,
  direction: '남서쪽 하늘',
  datetime: '2026. 9.26. 오후 9:41',
};

export const positionRows = [
  { label: '방위각', value: '243°' },
  { label: '고도', value: '31°' },
  { label: '관측 상태', value: '지평선 위 (관측 가능)' },
  { label: '기준 위치', value: '충청북도 청주시 청원구 우암동' },
];

export const chartLabel = '각수';

export const observationRows: { label: string; value: string; help?: boolean }[] = [
  { label: '기준 시각', value: '2026. 9.26. 오후 9:41' },
  { label: '겉보기 등급', value: '2.8등급', help: true },
  { label: '최적 관측 시기', value: '초여름 6월' },
  { label: '관측 권장 위치', value: '남쪽 하늘' },
  { label: '관측 구역', value: '천칭자리 α Lib 구역' },
];
