import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { useRequiredEntryFlow } from '../entry/entryFlow.tsx';
import { angleDelta, DRAG_THRESHOLD_DEG, DRAG_THRESHOLD_PX, spinDestination } from '../entry/wheelGesture.ts';
import './EntryWheelPage.css';

/**
 * 04 원판 돌리기 — 참고: figma-reference/04_01 ~ 04_03_entry-wheel_reference.png (하나의 연속 연출)
 *  04_01 대기: 천문도 + '천문도를 돌려 보세요.'
 *  04_02 회전: 원판을 아래로 드래그하면 해당 각도부터 자동 회전
 *  04_03 결과: 생일로 판정한 별자리 칸으로 확대하고 이름을 표시
 * 강조색 = 앱 금색, 결과는 기존 확대 연출 유지
 * 결과 뒤: 찾은 칸의 원이 두 번 깜빡이고 잠시 뒤 자동으로 메인 홈으로 이동 (기록 교체, 2026-10-10 요청)
 * JSON 번호 1~28에 대응하는 칸으로 3바퀴 회전 후 정지
 */

const SLOTS = 28; // 28수
const SLOT_DEG = 360 / SLOTS;
const TURNS = 3;
const SPIN_MS = 4200;
const PAUSE_MS = 600; // 멈춘 뒤 확대까지
const ZOOM_MS = 1200;
const BLINK_MS = 2400; // 확대가 끝난 뒤 원이 두 번 깜빡이는 시간 (CSS 1.2초 × 2 와 같은 값)
const HOLD_MS = 900; // 깜빡임 뒤 홈으로 넘어가기 전 머무는 시간

// 원판 치수 (viewBox -150 ~ 150, 393 폭에서 1 = 1px — 참고 이미지 730 폭 기준값 × 0.5384)
const R = {
  outer: 146.2,
  outer2: 140,
  band: 102, // 28칸 띠 안쪽 원
  dot: 120.6, // 칸 가운데 점
  dashed: 82.6,
  mid: 57.3,
  inner: 38.5,
};

type Phase = 'idle' | 'spinning' | 'stopped' | 'zooming' | 'zoomed';

interface EntryWheelPageProps {
  /**
   * 연출 미리보기용 멈출 칸. 생략하면 판정한 별자리 번호를 사용한다.
   */
  targetSlot?: number;
}

export default function EntryWheelPage({ targetSlot }: EntryWheelPageProps) {
  const { finishIntro, constellation } = useRequiredEntryFlow();
  const resolvedSlot = targetSlot ?? constellation.starId - 1;
  const [phase, setPhase] = useState<Phase>('idle');
  const [rotation, setRotation] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const started = useRef(false);
  const drag = useRef<{
    id: number; startY: number; centerX: number; centerY: number;
    previous: number; rotation: number; radius: number; vertical: boolean; direction: number;
  } | null>(null);
  const timers = useRef<number[]>([]);
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const start = (from: number) => {
    if (started.current) return;
    started.current = true;
    drag.current = null;
    setRotation(spinDestination(from, resolvedSlot, TURNS));
    setPhase('spinning');
    const spin = reduced ? 0 : SPIN_MS;
    timers.current.push(
      window.setTimeout(() => setPhase('stopped'), spin),
      window.setTimeout(() => setPhase('zooming'), spin + (reduced ? 300 : PAUSE_MS)),
      window.setTimeout(() => setPhase('zoomed'), spin + (reduced ? 300 : PAUSE_MS + ZOOM_MS)),
      // 결과 → (깜빡임) → 메인 홈. 원판으로 다시 돌아오지 않도록 기록을 바꿔 이동
      window.setTimeout(
        // 시작 흐름 완료 → 원판 자리를 홈으로 교체 (홈이 다시 시작 화면으로 돌아가지 않음)
        finishIntro,
        spin + (reduced ? 300 + 2000 : PAUSE_MS + ZOOM_MS + BLINK_MS + HOLD_MS),
      ),
    );
  };

  const pointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (started.current || drag.current || !event.isPrimary || event.button !== 0) return;
    const svg = svgRef.current;
    if (!svg) return;
    const bounds = svg.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height * 165 / 315;
    const radius = bounds.width * R.outer / 300;
    const x = event.clientX - centerX;
    const y = event.clientY - centerY;
    if (Math.hypot(x, y) > radius) return; // 원판 밖 터치는 시작하지 않음
    drag.current = {
      id: event.pointerId, startY: event.clientY, centerX, centerY, radius,
      previous: Math.atan2(y, x) * 180 / Math.PI, rotation,
      vertical: Math.abs(x) < radius * 0.2, direction: x < 0 ? -1 : 1,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const pointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const gesture = drag.current;
    if (!gesture || gesture.id !== event.pointerId || started.current) return;
    const downward = event.clientY - gesture.startY;
    const angle = Math.atan2(event.clientY - gesture.centerY, event.clientX - gesture.centerX) * 180 / Math.PI;
    // 중심축 부근의 세로 당김도 회전으로 반응. 그 외에는 중심 기준 실제 각도 사용.
    gesture.rotation = gesture.vertical
      ? downward / gesture.radius * 90 * gesture.direction
      : gesture.rotation + angleDelta(gesture.previous, angle);
    gesture.previous = angle;
    setRotation(gesture.rotation);
    if (downward >= DRAG_THRESHOLD_PX && Math.abs(gesture.rotation) >= DRAG_THRESHOLD_DEG) start(gesture.rotation);
  };

  const pointerEnd = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    setRotation(0);
  };

  return (
    <div className={`entry-wheel is-${phase}`}>
      {/* 화면 크기 기준 층 — 원판 · 문구 위치를 이 층의 폭·높이(cqw · cqh)로 계산 */}
      <div className="entry-wheel__frame">
        <button
          type="button"
          className="entry-wheel__stage"
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerEnd}
          onPointerCancel={pointerEnd}
          onLostPointerCapture={pointerEnd}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' && !started.current) {
              event.preventDefault();
              setRotation((value) => value - 12);
              if (rotation <= -12) start(rotation);
            }
          }}
          aria-disabled={phase !== 'idle'}
          aria-label="천문도를 아래로 끌어 돌리기. 키보드는 아래 방향키를 두 번 누르세요."
        >
          {/* 확대(04_03) 는 이 층 전체를 멈춘 칸 쪽으로 키움 — 바늘·표시 원도 함께 */}
          <div className="entry-wheel__zoom" style={{ '--zoom-ms': `${reduced ? 0 : ZOOM_MS}ms` } as CSSProperties}>
            <svg ref={svgRef} className="entry-wheel__svg" viewBox="-150 -165 300 315" aria-hidden="true">
              {/* 회전하는 원판 */}
              <g
                className="entry-wheel__disc"
                style={{ transform: `rotate(${rotation}deg)`, transitionDuration: `${phase === 'idle' || reduced ? 0 : SPIN_MS}ms` }}
              >
                <circle r={R.outer} className="ew-ring ew-ring--outer" />
                <circle r={R.outer2} className="ew-ring ew-ring--outer2" />
                <circle r={R.band} className="ew-ring" />
                <circle r={R.dashed} className="ew-ring ew-ring--dashed" />
                {/* 안쪽 궤도 — 확대(04_03) 때는 흐려져 문구와 겹치지 않음 */}
                <g className="entry-wheel__core">
                  <circle r={R.mid} className="ew-ring ew-ring--faint" />
                  <circle r={R.inner} className="ew-ring ew-ring--faint" />
                  <ellipse rx={74} ry={42} transform="rotate(-20)" className="ew-ring ew-ring--faint" />
                  <circle r={2} className="ew-center" />
                </g>
                {Array.from({ length: SLOTS }, (_, k) => {
                  const a = ((k * SLOT_DEG - 90) * Math.PI) / 180;
                  const b = (((k + 0.5) * SLOT_DEG - 90) * Math.PI) / 180;
                  return (
                    <g key={k}>
                      <line x1={R.band * Math.cos(a)} y1={R.band * Math.sin(a)} x2={R.outer2 * Math.cos(a)} y2={R.outer2 * Math.sin(a)} className="ew-tick" />
                      <circle cx={R.dot * Math.cos(b)} cy={R.dot * Math.sin(b)} r={1.4} className="ew-dot" />
                    </g>
                  );
                })}
              </g>

              {/* 원형 표시는 확대 완료 후 나타남. 세로 바늘은 제거. */}
              <g className="entry-wheel__marker">
                <circle cy={-R.dot} r={17.8} className="ew-marker-ring ew-marker-ring--found" />
                <circle cy={-R.dot} r={6.5} className="ew-marker-ring" />
                <circle cy={-R.dot} r={4.3} className="ew-marker-dot" />
                {/* 결과 별자리 도형 자리 (04_03) — 배정 규칙 · 데이터 미확정이라 비움 */}
              </g>
            </svg>
          </div>
        </button>

        {/* 안내 (04_01) → 결과 (04_03) — 같은 자리에서 바뀜 */}
        <p className="entry-wheel__hint" aria-hidden={phase !== 'idle'}>
          천문도를 돌려 보세요.
        </p>
        <div className="entry-wheel__result" aria-live="polite">
          {phase === 'zoomed' && (
            <>
              <p className="entry-wheel__found">당신의 별자리를 찾았습니다.</p>
              <p className="entry-wheel__name">
                {constellation && `${constellation.name} · ${constellation.alias}`}
              </p>
              <span className="entry-wheel__underline" aria-hidden="true" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
