import catalog from '../data/constellations/catalog.json';

export type ConstellationDirection = 'east' | 'north' | 'west' | 'south';

export const birthConstellations = catalog.map((row) => ({
  ...row,
  direction: row.direction as ConstellationDirection,
  meta: [row.alias, row.guardian, row.sashin.slice(0, 2)],
}));

export type BirthConstellation = (typeof birthConstellations)[number];

/** 양력 YYYY-MM-DD → JSON의 월·일 범위. 연도·출생 시각은 판정에 사용하지 않는다. */
export function resolveBirthConstellation(birthDate: string): BirthConstellation {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) throw new RangeError('올바른 생년월일이 필요합니다.');
  const date = new Date(`${birthDate}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== birthDate) {
    throw new RangeError('존재하지 않는 생년월일입니다.');
  }
  const monthDay = birthDate.slice(5).replace('-', '.');
  const matches = birthConstellations.filter(({ period }) => {
    const [start, end] = period.split('~');
    return start <= end ? monthDay >= start && monthDay <= end : monthDay >= start || monthDay <= end;
  });
  if (matches.length !== 1) throw new Error('생년월일에 해당하는 별자리를 확인할 수 없습니다.');
  return matches[0];
}
