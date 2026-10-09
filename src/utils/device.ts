import { APP_CONFIG } from '../app.config';

/**
 * 화면 유형
 * - pc:     마우스 환경의 데스크톱 브라우저 → 393:852 휴대폰 프레임으로 표시
 * - tablet: 터치 기반 큰 화면 → 전체 화면 (추후 태블릿 전용 레이아웃 적용 지점)
 * - mobile: 휴대폰 → 전체 화면 + Safe Area
 */
export type DeviceType = 'pc' | 'tablet' | 'mobile';

/** 홈 화면에 설치된 앱(standalone)으로 실행 중인지 */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari 전용 속성
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function detectDeviceType(): DeviceType {
  const shortSide = Math.min(window.innerWidth, window.innerHeight);
  const isLarge = shortSide >= APP_CONFIG.tabletMinShortSide;
  const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // 설치된 앱은 PC 프레임을 쓰지 않는다
  if (hasMouse && !isStandalone()) return 'pc';
  return isLarge ? 'tablet' : 'mobile';
}

/**
 * <html data-device="..."> 속성을 설정하고, 화면 크기·방향 변경 시 갱신합니다.
 * CSS 는 이 속성을 기준으로 PC / 태블릿 / 모바일 스타일을 나눕니다.
 */
export function applyDeviceAttribute(): void {
  const update = () => {
    const root = document.documentElement;
    root.dataset.device = detectDeviceType();
    root.dataset.standalone = String(isStandalone());
  };
  update();
  window.addEventListener('resize', update);
  window.addEventListener('orientationchange', update);
}
