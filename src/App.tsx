import { HashRouter, Navigate, Route, Routes } from 'react-router';
import AppShell from './layouts/AppShell.tsx';
import HomePage from './pages/HomePage.tsx';
import FortunePage from './pages/FortunePage.tsx';
import RecordsPage from './pages/RecordsPage.tsx';
import ExplorePage from './pages/ExplorePage.tsx';
import RankingPage from './pages/RankingPage.tsx';
import CompatibilityPage from './pages/CompatibilityPage.tsx';
import DictionaryPage from './pages/DictionaryPage.tsx';
import DirectionDetailPage from './pages/DirectionDetailPage.tsx';
import ConstellationDetailPage from './pages/ConstellationDetailPage.tsx';

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
            <Route path="ranking" element={<RankingPage />} />
            <Route path="compatibility" element={<CompatibilityPage />} />
            <Route path="dictionary" element={<DictionaryPage />} />
            {/* 방위 상세 — 상세 데이터가 없는 방위는 페이지 안에서 사전 메인으로 되돌림 */}
            <Route path="dictionary/direction/:id" element={<DirectionDetailPage />} />
            {/* 별자리 상세 — 상세 데이터가 없는 별자리는 페이지 안에서 사전 메인으로 되돌림 */}
            <Route path="dictionary/constellation/:id" element={<ConstellationDetailPage />} />
            {/* 그 밖의 주소는 탐색으로 되돌림 (별자리 영역·메뉴바 유지) */}
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
