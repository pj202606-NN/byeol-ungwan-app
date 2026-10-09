/**
 * 관측 지도 (방위 원 + 별자리 이동 궤적) — SVG
 * 홈 '별자리 탐색' 카드, 08_03 탐색 화면의 '관측 지도' 에서 같은 형태.
 * 좌표: Figma 2x PNG 의 카드 내부 픽셀 좌표 (카드 210×246 → viewBox 420×492)
 * ※ 현재 점 위치는 디자인 시안 값. 실제 천체 위치 계산은 추후 데이터 연결 시 교체.
 */

const C = { x: 210, y: 246 }; // 중심
const R = 155; // 바깥 원 반지름

/** 바깥 원 위의 작은 눈금 점 (북쪽 반원) */
const RIM_DOTS: [number, number][] = [
  [153, 100], [113, 123], [87, 152], [69, 177], [61, 202], [55, 223],
  [266, 100], [307, 125], [333, 153], [351, 178], [359, 203], [364, 223],
];

/** 별자리 이동 궤적 점 */
const TRACK_DOTS: [number, number][] = [
  [70, 264], [91, 280], [137, 299], [159, 305], [184, 309], [209, 310],
  [233, 309], [257, 305], [279, 299], [302, 291], [324, 280], [344, 265],
];

interface ObservationChartProps {
  /** 현재 위치 별자리 이름 (예: 각수) */
  label: string;
  /** 현재 위치 (viewBox 좌표) */
  point?: [number, number];
  className?: string;
}

export default function ObservationChart({ label, point = [113, 290], className }: ObservationChartProps) {
  const [px, py] = point;
  return (
    <svg className={className} viewBox="0 0 420 492" role="img" aria-label={`관측 지도: ${label}의 현재 위치`}>
      <g fill="none" stroke="#5b6b76" strokeWidth="1.6">
        <circle cx={C.x} cy={C.y} r={R} />
        <circle cx={C.x} cy={C.y} r={102} strokeDasharray="5 5" strokeOpacity="0.7" />
        <circle cx={C.x} cy={C.y} r={52} strokeDasharray="5 5" strokeOpacity="0.7" />
        <line x1={C.x - R} y1={C.y} x2={C.x + R} y2={C.y} />
        <line x1={C.x} y1={C.y - R} x2={C.x} y2={C.y + R} />
        <line x1={C.x} y1={C.y} x2={px} y2={py} stroke="#9fb3c2" />
      </g>

      <g fill="#9aa7b1">
        {RIM_DOTS.map(([x, y]) => <circle key={`r${x}-${y}`} cx={x} cy={y} r="2.5" />)}
        {[[C.x, C.y - R], [C.x, C.y + R], [C.x - R, C.y], [C.x + R, C.y]].map(([x, y]) => (
          <circle key={`m${x}-${y}`} cx={x} cy={y} r="3.5" fill="#c9d3da" />
        ))}
      </g>
      <g fill="#b9c3ca">
        {TRACK_DOTS.map(([x, y]) => <circle key={`t${x}-${y}`} cx={x} cy={y} r="4" />)}
      </g>

      {/* 현재 위치 */}
      <circle cx={px} cy={py} r="15" fill="#4f6577" fillOpacity="0.8" />
      <circle cx={px} cy={py} r="9" fill="#d7ecf2" />

      <g fill="#d2e1e8" fontSize="16" textAnchor="middle" fontFamily="var(--font-family)">
        <text x={C.x} y={C.y - R - 9}>북</text>
        <text x={C.x} y={C.y + R + 23}>남</text>
        <text x={C.x - R - 18} y={C.y + 6}>서</text>
        <text x={C.x + R + 18} y={C.y + 6}>동</text>
        <text x={px} y={py - 20} fontSize="16">{label}</text>
      </g>
    </svg>
  );
}
