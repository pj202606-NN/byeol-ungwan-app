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
 * 사전 주소 — 방위 상세(08_04_01)는 라우트 있음
 * ⚠️ 별자리 상세(08_04_02)는 아직 라우트 없음 — 구현할 때 라우트를 추가하고 카드를 연결
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
