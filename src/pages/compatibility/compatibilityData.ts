/**
 * 궁합 화면 표시 데이터 — ⚠️ 디자인 시안(08_02_*.png)의 예시 값
 * 실제 궁합 계산·사용자별 결과는 미확정 — 데이터가 정해지면 services/ 에서 받아오도록 교체
 * 별 좌표: 화면 좌표(393 폭, 상태 표시줄 아래 콘텐츠 기준 CSS px) 그대로 — 디자인 PNG 에서 추출
 */
import type { StarPoint } from '../../components/ConstellationFigure.tsx';

export interface PairConstellation {
  name: string;
  hanja: string;
  alias: string;
  stars: StarPoint[];
  lines: [number, number][];
}

/** 나의 별자리 (홈의 오늘의 별자리와 같은 저수 — 추후 사용자 정보와 연결) */
export const myConstellation: PairConstellation = {
  name: '저수',
  hanja: '氐宿',
  alias: '너구리자리',
  // 홈 todayHero 와 같은 별·연결선 순서
  stars: [
    { x: 68.5, y: 172.5, r: 0.95 },
    { x: 127.9, y: 170, r: 0.9 },
    { x: 113.7, y: 184.5, r: 1.25 },
    { x: 83.2, y: 194.6, r: 1.8, glow: true },
    { x: 96, y: 213.8, r: 0.9 },
    { x: 116.6, y: 228, r: 1.45 },
  ],
  lines: [[0, 3], [3, 2], [2, 1], [3, 4], [4, 5]],
};

/**
 * 상대 별자리 선택 목록 — 디자인 시안(08_02_01) 기준
 * 시안 오기 수정 (2026-10-10 확정): 방위 한자(朱雀·白虎·玄武), 백호 '각수' → '누수', '향수' → '항수'
 * 묶음 순서는 앱 전체 통일 순서(청룡·현무·백호·주작, 2026-10-10 확정)를 따름
 */
export interface SelectorGroup {
  key: string;
  label: string;
  items: string[];
}

export const selectorGroups: SelectorGroup[] = [
  { key: 'east', label: '청룡 · 青龍', items: ['각수', '항수', '저수', '방수', '심수', '미수', '기수'] },
  { key: 'north', label: '현무 · 玄武', items: ['두수', '우수', '여수', '허수', '위수', '실수', '벽수'] },
  { key: 'west', label: '백호 · 白虎', items: ['규수', '위수', '묘수', '필수', '자수', '삼수', '누수'] },
  { key: 'south', label: '주작 · 朱雀', items: ['정수', '귀수', '유수', '성수', '장수', '익수', '진수'] },
];

/** 선택 항목 식별자 — 같은 이름(위수)이 두 묶음에 있으므로 묶음 키와 함께 사용 */
export const optionId = (groupKey: string, name: string) => `${groupKey}:${name}`;

export interface CompatibilityResult {
  partner: PairConstellation;
  quote: { label: string; lines: string[]; date: string };
  sections: { key: string; label: string; body?: string; bullets?: string[] }[];
}

/**
 * 궁합 결과 예시 — 디자인 시안(08_02_02)에 있는 '항수' 하나뿐
 * 다른 별자리를 고르면 결과를 만들지 않음 (임의 매핑 금지)
 * 시안 오기 수정 (2026-10-10 확정): '향수 氐宿' → '항수 亢宿', 하늘 위치 문장의 '누수' → '저수'
 */
export const exampleResults: Record<string, CompatibilityResult> = {
  [optionId('east', '항수')]: {
    partner: {
      name: '항수',
      hanja: '亢宿',
      alias: '용자리',
      stars: [
        { x: 331.6, y: 171.1, r: 1.8, glow: true },
        { x: 280.8, y: 186, r: 0.9 },
        { x: 312.3, y: 186, r: 1.3 },
        { x: 292.4, y: 200, r: 1.8, glow: true },
        { x: 327.7, y: 205.3, r: 1.3 },
        { x: 276.7, y: 214.3, r: 0.9 },
        { x: 260.1, y: 224.6, r: 1.8, glow: true },
      ],
      lines: [[6, 5], [5, 3], [1, 3], [3, 2], [2, 0], [2, 4]],
    },
    quote: {
      label: '항수자리와의 궁합',
      lines: ['닮은 점이 많아 편안하지만', '그만큼 조심할 부분도 있습니다.'],
      date: '9월 26일 · 토',
    },
    sections: [
      {
        key: 'detail',
        label: '상세 풀이',
        body: '계절이 이웃한 별자리끼리의 만남입니다. 변화의 시기를 함께 통과하는 인연으로, 각자의 시간을 인정할 때 관계가 깊어집니다.',
      },
      {
        key: 'good',
        label: '잘 맞는 점',
        bullets: [
          '한쪽이 벌이고 한쪽이 마무리하는 구조라 일의 완성도가 높습니다.',
          '생활의 기준이 비슷해 사소한 마찰이 잘 생기지 않습니다.',
        ],
      },
      {
        key: 'caution',
        label: '주의할 점',
        bullets: [
          '중요한 약속은 반드시 기록으로 남겨 두고 자주 확인해 주는 편이 좋습니다.',
          '결정의 속도가 달라 한쪽이 답답함을 느낄 수도 있습니다.',
        ],
      },
      {
        key: 'sky',
        label: '하늘 위치',
        body: '저수는 서쪽 (西) 가을의 자리이고, 항수는 동쪽 (東) 봄의 자리입니다. 두 별자리는 하늘에서 서로 다른 사신에 나뉘어 놓여 있습니다.',
      },
    ],
  },
};

/** 결과 화면 섹션 바로가기 키 (예시 결과와 같은 순서) */
export const resultSectionKeys = ['detail', 'good', 'caution', 'sky'] as const;

/** 선택 전 안내 (08_02 기본 상태) */
export const lockedNotice = {
  title: '궁합 풀이 보기',
  lines: ['상대 별자리를 선택하면', '궁합 상세 내용을 볼 수 있습니다.'],
};
