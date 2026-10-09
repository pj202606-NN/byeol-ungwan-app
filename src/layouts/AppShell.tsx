import { Outlet } from 'react-router';
import PcStatusBar from '../components/PcStatusBar.tsx';
import BottomNav from '../components/BottomNav.tsx';
import './AppShell.css';

/**
 * 모든 화면을 감싸는 공통 컨테이너
 *
 *  .app-stage   브라우저 전체 (PC 에서는 바깥 배경 + 가운데 정렬)
 *  └ .app-frame 앱 화면 (PC: 393:852 프레임 / 모바일·태블릿: 전체 화면)
 *    ├ PcStatusBar   PC 전용 연출 상태 표시줄 자리 (현재 비활성)
 *    ├ .app-scroll   페이지 콘텐츠 — 이 안에서만 세로 스크롤
 *    └ BottomNav     하단 메뉴바 — 앱 프레임 기준으로 하단 고정
 */
export default function AppShell() {
  return (
    <div className="app-stage">
      <div className="app-frame">
        <PcStatusBar />
        <main className="app-scroll">
          <div className="app-content">
            <Outlet />
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
