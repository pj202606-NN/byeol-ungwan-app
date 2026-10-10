import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import logoSvg from '../assets/icons/site-logo.svg?raw';
import { onboardingPath } from './onboarding/onboardingData.ts';
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
 * 4.5초가 지나거나 화면을 누르면 온보딩 1단계로 넘어감 (2026-10-10 요청)
 *  - 기록을 바꿔 넘어가므로 온보딩에서 뒤로 가기를 눌러도 시작 화면이 다시 나오지 않음
 * ⏳ 미확정: 로고·별 지도 애니메이션
 */
const AUTO_NEXT_MS = 4500;

export default function SplashPage() {
  const navigate = useNavigate();
  const done = useRef(false);

  const goNext = () => {
    if (done.current) return; // 시간 초과와 누르기가 겹쳐도 한 번만 이동
    done.current = true;
    navigate(onboardingPath(1), { replace: true });
  };

  useEffect(() => {
    const timer = window.setTimeout(goNext, AUTO_NEXT_MS);
    return () => window.clearTimeout(timer);
    // 처음 한 번만 예약
  }, []);

  return (
    <div
      className="splash"
      role="button"
      tabIndex={0}
      aria-label="별운관 — 28수로 보는 별자리 운세. 누르면 시작합니다"
      onClick={goNext}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goNext();
        }
      }}
    >
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
