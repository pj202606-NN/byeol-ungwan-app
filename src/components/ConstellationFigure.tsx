import { useId } from 'react';
import { constellationGraphics } from './constellationGraphics.ts';
import './ConstellationFigure.css';

/**
 * 별자리 도형 (별 + 연결선) — SVG
 * 홈 상단·탐색·마이 등에서 같은 형태로 반복 사용됨.
 * 좌표는 viewBox 기준 (홈: Figma 393 폭 좌표 그대로)
 */
export interface StarPoint {
  x: number;
  y: number;
  /** 별 반지름 */
  r: number;
  /** 밝은 별(빛 번짐 표시) */
  glow?: boolean;
}

interface ConstellationFigureProps {
  stars: StarPoint[];
  /** 연결선: stars 배열의 인덱스 쌍 */
  lines: [number, number][];
  viewBox: string;
  /** 연결선 굵기 (viewBox 단위, 기본 0.8) — 작게 축소해 쓸 때 굵게 */
  lineWidth?: number;
  /** 별 주변 빛 번짐 (기본 표시) — 아주 작은 도형(08_01 순위)에서는 끔 */
  halo?: boolean;
  className?: string;
  /** 판정한 별자리의 SVG. 기존 좌표 영역에 맞춰 표시한다. */
  graphicKey?: string;
  /** 도형 중심 기준 확대율. 제목 등 주변 레이아웃은 유지한다. */
  scale?: number;
  /** Local placement adjustment when enlarging a page's graphic. */
  offsetY?: number;
}

export default function ConstellationFigure({ stars, lines, viewBox, lineWidth = 0.8, halo = true, className, graphicKey, scale = 1, offsetY = 0 }: ConstellationFigureProps) {
  const glowId = useId();
  const graphic = graphicKey ? constellationGraphics[graphicKey] : undefined;
  const centerX = stars.length ? (Math.min(...stars.map((star) => star.x)) + Math.max(...stars.map((star) => star.x))) / 2 : 0;
  const centerY = stars.length ? (Math.min(...stars.map((star) => star.y)) + Math.max(...stars.map((star) => star.y))) / 2 : 0;
  const transform = `translate(0 ${offsetY}) translate(${centerX} ${centerY}) scale(${scale}) translate(${-centerX} ${-centerY})`;
  const glowDefinition = (
    <defs>
      <radialGradient id={glowId}>
        <stop offset="0%" stopColor="#f8efe0" stopOpacity="0.55" />
        <stop offset="35%" stopColor="#f8efe0" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#f8efe0" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
  // 양끝보다 도형의 중심에 가까운 세 별에 빛을 모은다.
  const sourcePoints = graphic?.stars ?? stars;
  const averageX = sourcePoints.reduce((sum, star) => sum + star.x, 0) / sourcePoints.length;
  const averageY = sourcePoints.reduce((sum, star) => sum + star.y, 0) / sourcePoints.length;
  const centerOrder = sourcePoints.map((star, index) => ({ index, distance: Math.hypot(star.x - averageX, star.y - averageY) }))
    .sort((a, b) => a.distance - b.distance);
  const mainIndex = centerOrder[0]?.index ?? 0;
  const brightIndices = new Set(centerOrder.slice(0, 3).map((star) => star.index));
  const displayPoints = graphic ? sourcePoints.map((star, index) => ({
    ...star, r: star.r * (index === mainIndex ? 1 : brightIndices.has(index) ? 0.82 : 0.6), glow: brightIndices.has(index),
  })) : stars;
  const halos = (points: StarPoint[]) => halo && points.map((star, index) => (
    <circle key={index} className={`constellation-figure__halo${brightIndices.has(index) ? ' constellation-figure__halo--main' : ''}`} cx={star.x} cy={star.y}
      r={star.r * (brightIndices.has(index) ? 3 : 2)} fill={`url(#${glowId})`} style={{ animationDelay: `${-index * 1.7}s` }} />
  ));
  if (graphic && stars.length) {
    const minX = Math.min(...stars.map((star) => star.x)) - 5;
    const minY = Math.min(...stars.map((star) => star.y)) - 5;
    const width = Math.max(...stars.map((star) => star.x)) - minX + 5;
    const height = Math.max(...stars.map((star) => star.y)) - minY + 5;
    return (
      <svg className={className} viewBox={viewBox} aria-hidden="true" focusable="false">
        {glowDefinition}
        <g transform={transform}>
          <svg x={minX} y={minY} width={width} height={height} viewBox={graphic.viewBox} overflow="visible">
            <image href={graphic.linesUrl} x="0" y="0" width="250" height="250" opacity="0.85" />
            {halos(displayPoints)}
            {displayPoints.map((star, index) => <circle key={index} cx={star.x} cy={star.y} r={star.r} fill="var(--color-star)" />)}
          </svg>
        </g>
      </svg>
    );
  }
  return (
    <svg className={className} viewBox={viewBox} aria-hidden="true" focusable="false">
      {glowDefinition}
      <g transform={transform}>
      <g stroke="#8fa3b5" strokeOpacity="0.6" strokeWidth={lineWidth}>
        {lines.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={stars[a].x} y1={stars[a].y} x2={stars[b].x} y2={stars[b].y} />
        ))}
      </g>
      {halos(stars)}
      {stars.map((s, i) => (
        <g key={i}>
          <circle cx={s.x} cy={s.y} r={s.r} fill="var(--color-star)" />
        </g>
      ))}
      </g>
    </svg>
  );
}
