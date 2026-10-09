import { useEffect, useState } from 'react';
import { APP_CONFIG } from '../app.config.ts';
import { detectDeviceType, isStandalone } from '../utils/device.ts';
import './HomePage.css';

/**
 * 임시 홈 화면 — 개발 환경 확인용
 * Figma 디자인 구현 시 이 파일의 내용을 전부 교체합니다.
 */
export default function HomePage() {
  const [info, setInfo] = useState(readScreenInfo);

  useEffect(() => {
    const update = () => setInfo(readScreenInfo());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div className="home">
      <section className="home__intro">
        <p className="home__label">임시 홈 화면</p>
        <h1 className="home__title">{APP_CONFIG.name}</h1>
        <p className="home__desc">PWA 개발 환경이 정상적으로 실행되었습니다.</p>
      </section>

      <dl className="home__info">
        <div><dt>화면 유형</dt><dd>{info.device}</dd></div>
        <div><dt>설치 앱 실행</dt><dd>{info.standalone ? '예 (standalone)' : '아니요 (브라우저)'}</dd></div>
        <div><dt>브라우저 크기</dt><dd>{info.viewport}</dd></div>
        <div><dt>앱 버전</dt><dd>{__APP_BUILD_TIME__}</dd></div>
      </dl>

      {/* 앱 내부 스크롤 확인용 블록 */}
      <ul className="home__scroll-test" aria-label="스크롤 테스트">
        {Array.from({ length: 12 }, (_, i) => (
          <li key={i}>스크롤 테스트 {i + 1}</li>
        ))}
      </ul>
    </div>
  );
}

function readScreenInfo() {
  return {
    device: detectDeviceType(),
    standalone: isStandalone(),
    viewport: `${window.innerWidth} × ${window.innerHeight}`,
  };
}
