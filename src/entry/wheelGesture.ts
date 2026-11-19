export const DRAG_THRESHOLD_PX = 24;
export const DRAG_THRESHOLD_DEG = 8;

export function angleDelta(previous: number, next: number): number {
  return (((next - previous + 180) % 360 + 360) % 360) - 180;
}

/** 현재 손 회전 방향을 유지하면서 지정한 칸을 맨 위로 정렬한다. */
export function spinDestination(rotation: number, slot: number, turns = 3): number {
  const direction = rotation > 0 ? 1 : -1;
  const target = -(slot + 0.5) * 360 / 28;
  const remaining = direction > 0
    ? ((target - rotation) % 360 + 360) % 360
    : -(((rotation - target) % 360 + 360) % 360);
  return rotation + direction * turns * 360 + remaining;
}
