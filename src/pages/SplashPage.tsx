import logoSvg from '../assets/icons/site-logo.svg?raw';
import './SplashPage.css';

/**
 * 원본 세로 로고(site-logo.svg)를 그대로 쓰되
 * - 글자만 보이도록 viewBox 를 글자 영역(99 176.2 145.4 402)으로 맞추고
 * - 파란 채움색 대신 CSS color(currentColor)를 따르도록 바꿈 (파일 자체는 수정하지 않음)
 */
const logo = logoSvg
  .replace(/<\?xml[^>]*>\s*/, '')
  .replace(/<defs>[\s\S]*?<\/defs>\s*/, '')
  .replace(/\sclass="cls-1"/g, '')
  .replace(/\sid="[^"]*"/, '')
  .replace(/viewBox="[^"]*"/, 'viewBox="99 176.2 145.4 402" fill="currentColor" aria-hidden="true" focusable="false"');

/**
 * 01 시작 화면(Splash) — figma-reference/01_splash.png (393 × 852, 콘텐츠 798)
 * 하단 메뉴바 없음. 개발 중 확인용 주소: #/splash (앱 실행 경로는 아직 연결하지 않음)
 * ⏳ 미확정: 표시 시간, 온보딩으로의 자동 전환, 로고·별 지도 애니메이션
 */
export default function SplashPage() {
  return (
    <div className="splash" role="img" aria-label="별운관 — 28수로 보는 별자리 운세">
      {/* 시안 높이(798)의 화면을 가운데에 두고, 화면이 짧거나 길면 위아래가 잘리거나 배경이 이어짐 */}
      <div className="splash__stage">
        {/* 별 지도 원 — 원 안쪽의 별자리 지도 그림은 에셋 미제공 (원 모양 · 테두리만) */}
        <div className="splash__dome" aria-hidden="true" />
        <div className="splash__logo" dangerouslySetInnerHTML={{ __html: logo }} />
        <p className="splash__tagline">28수로 보는 별자리 운세</p>
      </div>
    </div>
  );
}
