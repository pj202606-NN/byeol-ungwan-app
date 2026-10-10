import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router';
import './EntryWheelPage.css';

/**
 * 04 원판 돌리기 — 참고: figma-reference/04_01 ~ 04_03_entry-wheel_reference.png (하나의 연속 연출)
 *  04_01 대기: 천문도 + '천문도를 돌려 보세요.'
 *  04_02 회전: 화면을 누르면 원판이 자동으로 돌고, 맨 위에 고정 표시(바늘 · 원)가 나타남
 *  04_03 결과: 멈춘 칸으로 확대 + '당신의 별자리를 찾았습니다.' — 별자리 이름 · 도형은 비움 (배정 규칙 미확정)
 * 결정(2026-10-10): 강조색 = 앱 금색, 누르면 자동 회전, 결과는 확대 연출만
 * 결과 뒤: 찾은 칸의 원이 두 번 깜빡이고 잠시 뒤 자동으로 메인 홈으로 이동 (기록 교체, 2026-10-10 요청)
 * ⏳ 미확정: 회전 바퀴 수 · 멈출 칸 규칙 — 지금은 3바퀴 뒤 처음 맨 위에 가까웠던 칸(0번)에 멈춤 (결과 의미 없음)
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

type Phase = 'idle' | 'spinning' | 'stopped' | 'zoomed';

interface EntryWheelPageProps {
  /**
   * 멈출 칸 (0 ~ 27, 0 = 처음 맨 위 오른쪽 칸) — ⏳ 별자리 배정 규칙이 정해지면 회원가입 정보로 계산해 넘김
   * 지금은 0 고정 (무작위 · 계산 없음)
   */
  targetSlot?: number;
}

export default function EntryWheelPage({ targetSlot = 0 }: EntryWheelPageProps) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('idle');
  const timers = useRef<number[]>([]);
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const start = () => {
    if (phase !== 'idle') return;
    setPhase('spinning');
    const spin = reduced ? 0 : SPIN_MS;
    timers.current.push(
      window.setTimeout(() => setPhase('stopped'), spin),
      window.setTimeout(() => setPhase('zoomed'), spin + (reduced ? 300 : PAUSE_MS)),
      // 결과 → (깜빡임) → 메인 홈. 원판으로 다시 돌아오지 않도록 기록을 바꿔 이동
      window.setTimeout(
        () => navigate('/', { replace: true }),
        spin + (reduced ? 300 + 2000 : PAUSE_MS + ZOOM_MS + BLINK_MS + HOLD_MS),
      ),
    );
  };

  // 칸 k 의 가운데가 맨 위(바늘)에 오도록 — 시계 반대 방향으로 TURNS 바퀴 + 칸 위치
  const rotation = phase === 'idle' ? 0 : -(TURNS * 360 + (targetSlot + 0.5) * SLOT_DEG);

  return (
    <div className={`entry-wheel is-${phase}`}>
      {/* 화면 크기 기준 층 — 원판 · 문구 위치를 이 층의 폭·높이(cqw · cqh)로 계산 */}
      <div className="entry-wheel__frame">
        <button
          type="button"
          className="entry-wheel__stage"
          onClick={start}
          disabled={phase !== 'idle'}
          aria-label={phase === 'idle' ? '천문도 돌리기' : '천문도'}
        >
          {/* 확대(04_03) 는 이 층 전체를 멈춘 칸 쪽으로 키움 — 바늘·표시 원도 함께 */}
          <div className="entry-wheel__zoom" style={{ '--zoom-ms': `${reduced ? 0 : ZOOM_MS}ms` } as CSSProperties}>
            <svg className="entry-wheel__svg" viewBox="-150 -165 300 315" aria-hidden="true">
              {/* 회전하는 원판 */}
              <g
                className="entry-wheel__disc"
                style={{ transform: `rotate(${rotation}deg)`, transitionDuration: `${reduced ? 0 : SPIN_MS}ms` }}
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

              {/* 고정 표시 (04_02): 맨 위 바늘 + 칸 표시 원 — 회전 시작과 함께 나타남 */}
              <g className="entry-wheel__marker">
                <line x1={0} y1={-(R.outer + 12)} x2={0} y2={-(R.dot + 17.8)} className="ew-marker-line" />
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
              {/* 별자리 이름 자리 — 배정 규칙 미확정이라 비움 */}
              <p className="entry-wheel__name" aria-hidden="true" />
              <span className="entry-wheel__underline" aria-hidden="true" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
