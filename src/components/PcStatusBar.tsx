import { APP_CONFIG } from '../app.config.ts';
import { detectDeviceType } from '../utils/device.ts';

/**
 * PC 프레임 전용 "연출용" 상태 표시줄 자리
 * - 실제 휴대폰에서는 OS 상태 표시줄을 사용하므로 절대 출력하지 않습니다.
 * - 현재는 APP_CONFIG.showPcStatusBar = false 이므로 아무것도 그리지 않습니다.
 * - Figma 상태 표시줄을 구현할 때 이 컴포넌트 내부만 채우면 됩니다.
 */
export default function PcStatusBar() {
  if (!APP_CONFIG.showPcStatusBar || detectDeviceType() !== 'pc') return null;

  return <div className="pc-status-bar" aria-hidden="true" />;
}
