import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import PcStatusBar from '../components/PcStatusBar.tsx';
import BottomNav from '../components/BottomNav.tsx';
import celestialMap from '../assets/images/celestial-map/cheonsang-yeolcha.svg';
import './AppShell.css';

/**
 * 모든 화면을 감싸는 공통 컨테이너
 *
 *  .app-stage   브라우저 전체 (PC 에서는 바깥 배경 + 가운데 정렬)
 *  └ .app-frame 앱 화면 (PC·태블릿: 393:852 프레임 / 휴대폰: 전체 화면)
 *    ├ PcStatusBar   PC 전용 연출 상태 표시줄 자리 (현재 비활성)
 *    ├ .app-scroll   페이지 콘텐츠 — 이 안에서만 세로 스크롤
 *    └ BottomNav     하단 메뉴바 — 앱 프레임 하단에 고정, 본문 위에 겹쳐 표시 (반투명·흐림)
 */
interface AppShellProps {
  /** 하단 메뉴바 표시 — 초기 진입 과정(01~04)에서는 숨김 */
  showNav?: boolean;
}

export default function AppShell({ showNav = true }: AppShellProps) {
  const { pathname } = useLocation();
  const scrollRef = useRef<HTMLElement>(null);

  // 화면을 옮기면 본문 스크롤을 맨 위로
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app-stage">
      <div className="app-stage__map" aria-hidden="true">
        <img src={celestialMap} alt="" draggable={false} />
      </div>
      <div className={showNav ? 'app-frame app-frame--with-nav' : 'app-frame'}>
        <PcStatusBar />
        <main className="app-scroll" ref={scrollRef}>
          <div className="app-content">
            <Outlet />
          </div>
        </main>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
