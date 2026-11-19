import type { StarPoint } from '../../components/ConstellationFigure.tsx';
import { birthConstellations } from '../../services/birthConstellation.ts';
import { compatibilityDirections } from '../../services/compatibility.ts';

export const COMPATIBILITY_READING_MS = 4200;

/** 표시 순서만 방위별로 묶고, 실제 선택값은 JSON의 숫자 ID를 사용한다. */
export const selectorGroups = compatibilityDirections.map((direction) => ({
  key: direction.id,
  label: direction.label,
  items: birthConstellations.filter((star) => star.direction === direction.id),
}));

/** 전용 SVG를 배치하는 공통 영역. 별자리 자체의 좌표·연결선은 원본 SVG를 사용한다. */
export const pairFigure = {
  viewBox: '0 0 100 100',
  stars: [{ x: 5, y: 5, r: 1 }, { x: 95, y: 95, r: 1 }] satisfies StarPoint[],
  lines: [] as [number, number][],
};

export const lockedNotice = {
  title: '궁합 풀이 보기',
  lines: ['상대 별자리를 선택하면', '궁합 상세 내용을 볼 수 있습니다.'],
};
