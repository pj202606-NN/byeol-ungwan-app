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
}

export default function ConstellationFigure({ stars, lines, viewBox, lineWidth = 0.8, halo = true, className }: ConstellationFigureProps) {
  return (
    <svg className={className} viewBox={viewBox} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="star-glow">
          <stop offset="0%" stopColor="#f8efe0" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#f8efe0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g stroke="#8fa3b5" strokeOpacity="0.7" strokeWidth={lineWidth}>
        {lines.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={stars[a].x} y1={stars[a].y} x2={stars[b].x} y2={stars[b].y} />
        ))}
      </g>
      {stars.map((s, i) => (
        <g key={i}>
          {halo && <circle cx={s.x} cy={s.y} r={s.r * (s.glow ? 3 : 2.2)} fill="url(#star-glow)" />}
          <circle cx={s.x} cy={s.y} r={s.r} fill="var(--color-star)" />
        </g>
      ))}
    </svg>
  );
}
