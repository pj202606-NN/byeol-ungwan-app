import { HashRouter, Navigate, Route, Routes } from 'react-router';
import AppShell from './layouts/AppShell.tsx';
import HomePage from './pages/HomePage.tsx';
import FortunePage from './pages/FortunePage.tsx';
import RecordsPage from './pages/RecordsPage.tsx';
import ExplorePage from './pages/ExplorePage.tsx';

/**
 * 라우팅 — GitHub Pages(정적 호스팅)에서 새로고침 404 를 막기 위해 HashRouter 사용
 * 주소 예: https://<사용자>.github.io/byeol-ungwan-app/#/
 * 새 화면은 pages/ 에 만들고 아래에 <Route> 를 추가합니다.
 */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="fortune" element={<FortunePage />} />
          <Route path="records" element={<RecordsPage />} />
          {/* 별자리 영역: 진입은 항상 '탐색' (APP_SCREEN_STRUCTURE.md 4장) */}
          <Route path="constellations">
            <Route path="explore" element={<ExplorePage />} />
            {/* 아직 구현하지 않은 순위·궁합·사전 등은 탐색으로 되돌림 (별자리 영역·메뉴바 유지) */}
            <Route index element={<Navigate to="explore" replace />} />
            <Route path="*" element={<Navigate to="/constellations/explore" replace />} />
          </Route>
          {/* 정의되지 않은 주소는 홈으로 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
