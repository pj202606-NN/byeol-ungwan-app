/**
 * 앱 전역 설정값 — 자주 바꾸는 값은 여기서 관리합니다.
 * (배포 경로/저장소 이름은 vite.config.ts 상단의 REPO_NAME 에서 관리)
 */
export const APP_CONFIG = {
  /** 앱 이름 (화면 표시용). 설치 아이콘 아래 이름은 vite.config.ts 의 manifest 에서 변경 */
  name: '별운관',

  /** Figma 디자인 기준 크기 (iPhone 15 Pro) — PC 프레임 비율 계산에 사용 */
  designWidth: 393,
  designHeight: 852,

  /** PC 프레임 안에 연출용 상태 표시줄을 보여줄지 여부 (현재 미구현 → false) */
  showPcStatusBar: false,

  /** 이 너비(px, 화면의 짧은 쪽 기준) 이상이면 태블릿/PC 로 분류 */
  tabletMinShortSide: 600,
} as const;
