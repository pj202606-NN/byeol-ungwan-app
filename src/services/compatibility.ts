import data from '../../public/data/byeolungwan_28su_compatibility_v2.json';
import { birthConstellations } from './birthConstellation.ts';

export const compatibilityDirections = [
  { id: 'east', label: '청룡 · 青龍', cardinal: '동쪽', hanja: '東', season: '봄' },
  { id: 'north', label: '현무 · 玄武', cardinal: '북쪽', hanja: '北', season: '겨울' },
  { id: 'west', label: '백호 · 白虎', cardinal: '서쪽', hanja: '西', season: '가을' },
  { id: 'south', label: '주작 · 朱雀', cardinal: '남쪽', hanja: '南', season: '여름' },
] as const;

export const compatibilitySectionKeys = ['detail', 'advice', 'sky'] as const;
const stars = new Map(birthConstellations.map((star) => [star.starId, star]));
const pairKey = (a: number, b: number) => `${Math.min(a, b)}:${Math.max(a, b)}`;
const pairs = new Map(data.pairs.map((pair) => [pairKey(pair.id_a, pair.id_b), pair]));
const same = new Map(data.same_constellation.map((pair) => [pair.star_id, pair]));

export function getCompatibilityStar(id: number) {
  const star = Number.isInteger(id) ? stars.get(id) : undefined;
  if (!star) throw new RangeError('별자리 번호는 1~28 정수여야 합니다.');
  return star;
}

/** 전통 사신의 방위·계절 구역으로 설명한다. 현재 시각의 관측 좌표를 뜻하지 않는다. */
export function getCompatibilitySky(myId: number, partnerId: number): string {
  const me = getCompatibilityStar(myId);
  const partner = getCompatibilityStar(partnerId);
  const a = compatibilityDirections.find((direction) => direction.id === me.direction)!;
  const b = compatibilityDirections.find((direction) => direction.id === partner.direction)!;
  const hasFinal = (me.guardian.charCodeAt(me.guardian.length - 1) - 0xac00) % 28 !== 0;
  const subject = me.guardian + (hasFinal ? '이' : '가');
  const together = me.guardian + (hasFinal ? '과' : '와');
  if (myId === partnerId) {
    return `두 사람의 별자리는 모두 ${me.name}로, ${a.cardinal}(${a.hanja}) ${a.season}의 자리에 속합니다. ${subject} 지키는 같은 하늘 아래, 하나의 별자리를 나누는 인연입니다.`;
  }
  if (me.direction === partner.direction) {
    return `${me.name}와 ${partner.name}는 모두 ${a.cardinal}(${a.hanja}) ${a.season}의 자리입니다. 두 별자리는 ${subject} 지키는 일곱 별자리 안에서 서로 다른 자리에 놓여 있습니다.`;
  }
  return `${me.name}는 ${a.cardinal}(${a.hanja}) ${a.season}의 자리이고, ${partner.name}는 ${b.cardinal}(${b.hanja}) ${b.season}의 자리입니다. 두 별자리는 하늘에서 서로 다른 사신인 ${together} ${partner.guardian}에 나뉘어 놓여 있습니다.`;
}

/** 선택 순서와 무관하게 같은 확정 원고·점수를 사용한다. legacy 관계는 사용하지 않는다. */
export function getCompatibility(myId: number, partnerId: number) {
  const me = getCompatibilityStar(myId);
  const partner = getCompatibilityStar(partnerId);
  const source = myId === partnerId ? same.get(myId) : pairs.get(pairKey(myId, partnerId));
  if (!source) throw new Error('해당 궁합의 확정 데이터가 없습니다.');
  return {
    me, partner, relation: source.relation, score: source.score, title: source.title,
    sections: [
      { key: 'detail' as const, label: '상세 풀이', body: source.description },
      { key: 'advice' as const, label: '조언', body: source.advice },
      { key: 'sky' as const, label: '하늘 위치', body: getCompatibilitySky(myId, partnerId) },
    ],
  };
}

export type CompatibilityResult = ReturnType<typeof getCompatibility>;

export function getFeaturedCompatibility(starId: number) {
  getCompatibilityStar(starId);
  return data.featured.filter((row) => row.star_id === starId).map((row) => ({
    partner: getCompatibilityStar(row.partner_id), type: row.type, rank: row.rank,
    score: row.score, cardText: row.card_text,
  }));
}
