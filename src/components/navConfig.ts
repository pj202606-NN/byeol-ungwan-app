/**
 * 하단 메뉴바 구성 (APP_SCREEN_STRUCTURE.md 3·4장)
 *
 * - 기본 메뉴바:   홈 / 운세 / 기록 / 별자리 / 마이
 * - 별자리 메뉴바: ← / 순위 / 궁합 / 탐색 / 사전
 * - '별자리' 는 독립 페이지가 아니라 별자리 영역 진입 버튼 → 항상 '탐색' 으로 진입
 * - 별자리 메뉴의 ← 는 직전 화면과 관계없이 항상 '홈' 으로 복귀
 *
 * 아이콘: src/assets/icons/icon-*.svg (components/Icon.tsx)
 */
import type { IconName } from './Icon.tsx';

export interface NavItem {
  key: string;
  label: string;
  icon: IconName;
  /** 이동할 주소 (HashRouter 기준) */
  to: string;
  /** 이 항목을 '활성' 으로 볼 주소 접두어 */
  matchPrefix: string;
}

/** 별자리 영역 주소 접두어 — 이 주소 아래에서는 별자리 전용 메뉴바 표시 */
export const CONSTELLATION_PREFIX = '/constellations';

export const MAIN_NAV: NavItem[] = [
  { key: 'home', label: '홈', icon: 'home', to: '/', matchPrefix: '/' },
  { key: 'fortune', label: '운세', icon: 'fortune', to: '/fortune', matchPrefix: '/fortune' },
  { key: 'records', label: '기록', icon: 'record', to: '/records', matchPrefix: '/records' },
  { key: 'constellations', label: '별자리', icon: 'constellation', to: `${CONSTELLATION_PREFIX}/explore`, matchPrefix: CONSTELLATION_PREFIX },
  { key: 'my', label: '마이', icon: 'my', to: '/my', matchPrefix: '/my' },
];

export const CONSTELLATION_NAV: NavItem[] = [
  { key: 'ranking', label: '순위', icon: 'ranking', to: `${CONSTELLATION_PREFIX}/ranking`, matchPrefix: `${CONSTELLATION_PREFIX}/ranking` },
  { key: 'compatibility', label: '궁합', icon: 'compatibility', to: `${CONSTELLATION_PREFIX}/compatibility`, matchPrefix: `${CONSTELLATION_PREFIX}/compatibility` },
  { key: 'explore', label: '탐색', icon: 'explore', to: `${CONSTELLATION_PREFIX}/explore`, matchPrefix: `${CONSTELLATION_PREFIX}/explore` },
  { key: 'dictionary', label: '사전', icon: 'dictionary', to: `${CONSTELLATION_PREFIX}/dictionary`, matchPrefix: `${CONSTELLATION_PREFIX}/dictionary` },
];

/** 별자리 메뉴바 ← 버튼의 이동 위치 (항상 홈) */
export const CONSTELLATION_BACK_TO = '/';

export function isActive(item: NavItem, pathname: string): boolean {
  if (item.matchPrefix === '/') return pathname === '/';
  return pathname === item.matchPrefix || pathname.startsWith(`${item.matchPrefix}/`);
}
