/**
 * 운세 화면의 도형 배치·행운의 상징·잠금 영역 표시값.
 * 실제 운세·조언·분석 원고는 services/fortunes.ts에서 조회한다.
 */
import { todayHero } from '../home/homeData.ts';

export const fortuneHero = {
  name: todayHero.name,
  hanja: todayHero.hanja,
  alias: '너구리자리',
  period: '4.30 - 5.17',
  // 홈과 같은 별자리 도형을 작게 표시 (홈 좌표를 viewBox 로 잘라 사용)
  stars: todayHero.stars,
  lines: todayHero.lines,
};

const sampleBody = [
  '평소보다 에너지 소모가 많을 수 있는 날입니다.',
  '적응력과 현실 감각이 오늘의 흐름과 다소 엇갈리니,',
  '잘 되던 일도 한 번 더 확인하고 지금 할 수 있는 것에만',
  '집중하십시오.',
];

/** 심화 운세 안내 (출생 시각 입력 시 제공 예정 — APP_SCREEN_STRUCTURE.md 2장) */
export const deepFortune = {
  title: '더 깊이 보기',
  lines: ['탄생시를 추가로 입력하면', '심화된 맞춤 운세를 볼 수 있습니다.'],
  link: '설정 바로가기',
  /** 흐림 처리된 뒤쪽 예시 문장 (디자인 시안의 흐린 텍스트 표현용) */
  blurredTitle: '심화 해석',
  blurredBody: [...sampleBody, ...sampleBody.slice(0, 3)],
};
