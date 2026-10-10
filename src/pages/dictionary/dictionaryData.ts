/**
 * 별자리 사전 데이터 — ⚠️ 디자인 시안(08_04_dictionary.png)의 예시 값 + 앱에서 이미 확정된 값
 * 28수 전체 데이터(한자·별칭·설명·도형 등)가 정해지면 이 파일만 채우거나 services/ 로 교체
 * 원본에 없는 설명·별칭·한자는 만들지 않음 — 비어 있는 값은 화면에서 표시하지 않음
 */
import type { StarPoint } from '../../components/ConstellationFigure.tsx';
import { todayHero } from '../home/homeData.ts';

/* ── 방위 ─────────────────────────────────────────────────────────────── */

export type DirectionId = 'east' | 'north' | 'west' | 'south';

export interface Direction {
  id: DirectionId;
  /** 사신 이름 (탭) */
  name: string;
  /** 섹션 제목 */
  title: string;
  /** 섹션 설명 */
  subtitle: string;
  /** 8번째 칸 '○방 7수 자세히 보러 가기' 의 앞부분 */
  moreLabel: string;
}

/** 앱 전체 통일 순서: 청룡 · 현무 · 백호 · 주작 (2026-10-10 확정) */
export const directions: Direction[] = [
  { id: 'east', name: '청룡', title: '동방 청룡', subtitle: '청룡이 수호하는 동쪽의 일곱 별자리', moreLabel: '동방 7수' },
  { id: 'north', name: '현무', title: '북방 현무', subtitle: '현무가 수호하는 북쪽의 일곱 별자리', moreLabel: '북방 7수' },
  { id: 'west', name: '백호', title: '서방 백호', subtitle: '백호가 수호하는 서쪽의 일곱 별자리', moreLabel: '서방 7수' },
  { id: 'south', name: '주작', title: '남방 주작', subtitle: '주작이 수호하는 남쪽의 일곱 별자리', moreLabel: '남방 7수' },
];

/** 방위 상세(08_04_01) 표시 내용 */
export interface DirectionDetail {
  /** 작은 제목 (예: 동방 7수) */
  label: string;
  name: string;
  /** 초안 표기 그대로 (청룡: '龍') */
  hanja?: string;
  meta: string[];
  /** 소개 문장 (줄 단위) */
  intro: string[];
  /** 방위 그림 — 에셋 미제공 */
  image?: string;
}

/**
 * 방위 상세 데이터 — 초안(08_04_01_direction-detail_draft.png)에 있는 청룡만
 * 현무·백호·주작은 초안 내용이 없어 비워 둠 → 상세 화면 연결 안 함 (2026-10-10 결정)
 */
export const directionDetails: Partial<Record<DirectionId, DirectionDetail>> = {
  east: {
    label: '동방 7수',
    name: '청룡',
    hanja: '龍',
    meta: ['봄', '동쪽', '청색', '결단과 정리'],
    intro: ['청룡이 수호하는 동쪽의 일곱 별자리.', '결단과 정리, 절제의 기운을 지닙니다.'],
  },
};

export const isDirectionId = (id: string | undefined): id is DirectionId =>
  id === 'east' || id === 'north' || id === 'west' || id === 'south';

/** 상단 탭 — '전체' + 방위 */
export type DictionaryTabId = 'all' | DirectionId;
export const dictionaryTabs: { id: DictionaryTabId; label: string }[] = [
  { id: 'all', label: '전체' },
  ...directions.map((d) => ({ id: d.id, label: d.name })),
];

/* ── 별자리 (28수) ────────────────────────────────────────────────────── */

export interface Constellation {
  /** 고유 ID — 상세 화면 주소·데이터 연결용 (같은 이름 '위수' 2개는 한자로 구분) */
  id: string;
  name: string;
  direction: DirectionId;
  /** 한자 (확인된 값만) */
  hanja?: string;
  /** 별칭 '○○자리' (확인된 값만) */
  alias?: string;
  /** 카드 이미지 — 에셋 미제공 */
  image?: string;
  /** 상세 화면용 (추후): 설명·도형 등 */
  description?: string;
  stars?: StarPoint[];
  lines?: [number, number][];
}

/**
 * 28수 목록 — 방위별 7수, 각 방위 안의 순서대로
 * 청룡: 사전 시안(이름·별칭) + 순위 화면(한자). '향수' → '항수' (2026-10-10 확정)
 * 현무·백호·주작: 사전 시안에는 청룡 카드가 그대로 반복되어 있어 사용하지 않고,
 *   궁합 선택 목록(2026-10-10 확정)의 이름·순서만 사용 — 한자·별칭은 미제공
 */
export const constellations: Constellation[] = [
  { id: 'gak', name: '각수', direction: 'east', hanja: '角宿', alias: '교룡자리' },
  { id: 'hang', name: '항수', direction: 'east', hanja: '亢宿', alias: '용자리' },
  { id: 'jeo', name: '저수', direction: 'east', hanja: '氐宿', alias: '너구리자리' },
  { id: 'bang', name: '방수', direction: 'east', hanja: '房宿', alias: '토끼자리' },
  { id: 'sim', name: '심수', direction: 'east', hanja: '心宿', alias: '여우자리' },
  { id: 'mi', name: '미수', direction: 'east', hanja: '尾宿', alias: '호랑이자리' },
  { id: 'gi', name: '기수', direction: 'east', hanja: '箕宿', alias: '표범자리' },

  { id: 'du', name: '두수', direction: 'north' },
  { id: 'u', name: '우수', direction: 'north' },
  { id: 'yeo', name: '여수', direction: 'north' },
  { id: 'heo', name: '허수', direction: 'north' },
  { id: 'wi-north', name: '위수', direction: 'north' },
  { id: 'sil', name: '실수', direction: 'north' },
  { id: 'byeok', name: '벽수', direction: 'north' },

  { id: 'gyu', name: '규수', direction: 'west' },
  { id: 'wi-west', name: '위수', direction: 'west' },
  { id: 'myo', name: '묘수', direction: 'west' },
  { id: 'pil', name: '필수', direction: 'west' },
  { id: 'ja', name: '자수', direction: 'west' },
  { id: 'sam', name: '삼수', direction: 'west' },
  { id: 'nu', name: '누수', direction: 'west' },

  { id: 'jeong', name: '정수', direction: 'south' },
  { id: 'gwi', name: '귀수', direction: 'south' },
  { id: 'yu', name: '유수', direction: 'south' },
  { id: 'seong', name: '성수', direction: 'south' },
  { id: 'jang', name: '장수', direction: 'south' },
  { id: 'ik', name: '익수', direction: 'south' },
  { id: 'jin', name: '진수', direction: 'south' },
];

export const constellationsOf = (direction: DirectionId) => constellations.filter((c) => c.direction === direction);
export const findConstellation = (id: string) => constellations.find((c) => c.id === id);

/**
 * 사전 주소 — 방위 상세(08_04_01) · 별자리 상세(08_04_02)
 * 상세 데이터(directionDetails · constellationDetails)가 있는 항목만 연결
 */
export const dictionaryPaths = {
  main: '/constellations/dictionary',
  direction: (id: DirectionId) => `/constellations/dictionary/direction/${id}`,
  constellation: (id: string) => `/constellations/dictionary/constellation/${id}`,
};

/* ── 상단: 내 별자리 ──────────────────────────────────────────────────── */

/** 내 별자리 (추후 사용자 정보와 연결). 도형은 홈과 같은 좌표 */
export const myConstellation = {
  id: 'jeo',
  label: '내 별자리',
  name: '저수',
  hanja: '氐宿',
  // ⚠️ 사전 시안 문구 그대로 — 홈 시안은 '너구리자리 · 백호 · 서쪽 · 가을'
  meta: ['너구리자리', '청룡', '동쪽', '초여름'],
  stars: todayHero.stars,
  lines: todayHero.lines,
};

/* ── 개별 별자리 상세 (08_04_02) ─────────────────────────────────────── */

export interface InfoRow {
  label: string;
  value: string;
  /** 값 옆 '?' (설명 내용·동작 미확정) */
  help?: boolean;
}

export interface DetailSection {
  key: string;
  title: string;
  /** 문단 → 줄 (초안의 줄바꿈 그대로, 좁은 화면에서는 자연스럽게 다시 줄바꿈) */
  paragraphs: string[][];
}

export interface ConstellationDetail {
  /** 위쪽 정보 줄 */
  meta: string[];
  /** 위쪽 오른쪽 기간 */
  period: string;
  /** 큰 별자리 도형 (홈 좌표 기준) */
  stars: StarPoint[];
  lines: [number, number][];
  /** 기본 정보 이미지 — 에셋 미제공 */
  image?: string;
  basicInfo: InfoRow[];
  traits: string[];
  zodiac: { title: string; text: string };
  sections: DetailSection[];
  observation: InfoRow[];
  /** 행운의 상징 (이미지 에셋 미제공) */
  lucky: { label: string; value: string }[];
}

/**
 * 별자리 상세 데이터 — 초안(08_04_02_constellation-detail_draft.png)에 있는 저수만
 * 나머지 27수는 데이터가 없어 상세 화면을 열지 않음 (카드도 연결하지 않음)
 * ⚠️ 초안 문구 그대로 — '전통적 의미' 는 '성격과 특징' 과 같은 문장 (초안 그대로 표시, 2026-10-10 결정)
 */
export const constellationDetails: Partial<Record<string, ConstellationDetail>> = {
  jeo: {
    meta: myConstellation.meta,
    period: '4. 30 - 5. 17',
    stars: myConstellation.stars,
    lines: myConstellation.lines,
    basicInfo: [
      { label: '명칭', value: '저수 · 너구리자리' },
      { label: '한자', value: '氐宿 · 氐土貉' },
      { label: '특수 명칭', value: '저토학 · 氐土貉' },
      { label: '상징 동물', value: '너구리' },
      { label: '상징물', value: '용의 몸통' },
      { label: '상징 신수', value: '청룡' },
      { label: '학명', value: 'α Lib 주벤엘게누비' },
    ],
    traits: ['적응력', '현실 감각', '영리함', '관찰력'],
    zodiac: { title: '서양 황도 12궁', text: '생년월일 기준 황소자리 (4/20~5/20)에 해당합니다.' },
    sections: [
      {
        key: 'description',
        title: '설명',
        paragraphs: [['동방 청룡에 속한 별자리로 동쪽의 7수 중', '용의 몸통을 뜻하며, 단단한 중심과 현실적 판단을', '기반으로 한 강한 생존력을 상징합니다.']],
      },
      {
        key: 'personality',
        title: '성격과 특징',
        paragraphs: [['저수는 흐르는 물처럼 유연한 사고방식을 지닙니다.', '높은 적응력과 현실적 감각 덕에 임기응변에 능하며,', '지적 활동에서 두각을 드러냅니다.']],
      },
      {
        key: 'tradition',
        title: '전통적 의미',
        paragraphs: [['저수는 흐르는 물처럼 유연한 사고방식을 지닙니다.', '높은 적응력과 현실적 감각 덕에 임기응변에 능하며,', '지적 활동에서 두각을 드러냅니다.']],
      },
      {
        key: 'folklore',
        title: '설화 · 역사 속의 너구리',
        paragraphs: [
          ['저수의 상징인 너구리는 조선의 훈몽자회(1527년)에', "'넝우리'로 기록된, 오래 전부터 이 땅에서 서식한 친근한", '동물입니다.'],
          ["거창을 배경으로 한 '천년묵은 너구리와 감찰선생' 이라는", '설화가 전해지며, 여우 설화의 일부 판본에서 너구리는', '여우와 재주를 겨루는 영리한 존재로 등장합니다.'],
        ],
      },
    ],
    observation: [
      { label: '겉보기 등급', value: '2.8등급', help: true },
      { label: '최적 관측 시기', value: '초여름 6월' },
      { label: '관측 권장 위치', value: '남쪽 하늘' },
      { label: '관측 구역', value: '천칭자리 α Lib 구역' },
    ],
    lucky: [
      { label: '행운의 색', value: '황색' },
      { label: '행운의 방위', value: '중앙' },
      { label: '행운의 요일', value: '토요일' },
      { label: '행운의 행성', value: '토성' },
    ],
  },
};

/* ── 용어 사전 ────────────────────────────────────────────────────────── */

export const glossary = {
  title: '용어 사전',
  subtitle: '3원 28수와 사신수? 생소한 용어를 알려드려요',
  items: [
    { id: 'samwon-28su', term: '3원 28수', summary: '옛 천문 체계' },
    { id: 'sasinsu', term: '사신수', summary: '네 방위의 신수' },
    { id: '28su', term: '28수', summary: '한국의 별자리' },
    { id: 'byeolungwan', term: '별운관', summary: '한국형 별자리 운세' },
  ],
};

export const searchPlaceholder = '어떤 별자리가 궁금하신가요?';
