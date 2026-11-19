/**
 * 공통 통합 카탈로그의 기본 정보·소개·최신 분석·관측 안내를 기존 UI에 연결한다.
 * 기존 앱 ID와 이미지/SVG 경로는 유지한다.
 */
import type { StarPoint } from '../../components/ConstellationFigure.tsx';
import { todayHero } from '../home/homeData.ts';
import { birthConstellations } from '../../services/birthConstellation.ts';
import { getConstellationCard } from '../../components/constellationCards.ts';
import { observationInfoRows } from '../../services/observationInformation.ts';
import guardianCopy from '../../data/constellations/guardianCopy.json';
import detailCopy from '../../data/constellations/detailCopy.json';

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

/** Reuse the existing direction page for the four source-backed guardians. */
export const directionDetails: Partial<Record<DirectionId, DirectionDetail>> = Object.fromEntries(
  directions.map(direction => {
    const source = guardianCopy.entries[direction.id];
    return [direction.id, {
      label: direction.moreLabel, name: direction.name, hanja: ({ east: '靑龍', north: '玄武', west: '白虎', south: '朱雀' } as const)[direction.id],
      meta: source.meta,
      intro: source.shortIntro.match(/[^.!?]+[.!?]+/g)!.map(sentence => sentence.trim()),
    }];
  }),
);

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
  /** 제공된 별자리 카드 이미지 */
  image?: string;
  period?: string;
  /** 상세 화면용 (추후): 설명·도형 등 */
  description?: string;
  stars?: StarPoint[];
  lines?: [number, number][];
}

/**
 * 28수 목록 — 확정 JSON 번호 순서, 방위별 7수. 홈과 사전이 같은 목록을 사용한다.
 */
export const constellations: Constellation[] = birthConstellations.map((star) => ({
  id: star.id,
  name: star.name,
  direction: star.direction,
  hanja: star.hanja,
  alias: star.alias,
  image: getConstellationCard(star.direction, star.graphicKey),
  period: star.period,
  description: star.description,
}));

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
 * 28개 공통 상세: 기본 JS·사전 소개·전통 메타데이터·최신 분석을 역할별로 연결.
 */
/** One shared detail template for all 28 IDs; authoritative sources come from the catalog. */
export const constellationDetails: Partial<Record<string, ConstellationDetail>> = Object.fromEntries(
  birthConstellations.map((star) => {
    const copy = detailCopy.entries[star.id as keyof typeof detailCopy.entries].sections;
    return [star.id, {
      meta: star.meta,
      period: star.period,
      stars: todayHero.stars,
      lines: todayHero.lines,
      basicInfo: [
        { label: '명칭', value: `${star.name} · ${star.alias}` },
        { label: '한자', value: star.hanja },
        { label: '특수 명칭', value: star.traditionalName },
        { label: '상징 동물', value: star.animal },
        { label: '상징물', value: star.traditionalSymbol },
        { label: '상징 신수', value: star.guardian },
        { label: '거성', value: star.observation.representativeStar },
      ],
      traits: star.keywords,
      zodiac: { title: '', text: '' },
      sections: [
        { key: 'description', title: '설명', paragraphs: [[copy.description]] },
        { key: 'personality', title: '성격과 특징', paragraphs: [[copy.personality]] },
        { key: 'tradition', title: '전통적 의미', paragraphs: [[copy.tradition]] },
        { key: 'folklore', title: `설화 · 역사 속의 ${star.animal}`, paragraphs: [[copy.folklore]] },
      ],
      observation: observationInfoRows(star.starId),
      lucky: star.luckySymbols,
    }];
  }),
);

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
