import { HashRouter, Navigate, Route, Routes } from 'react-router';
import AppShell from './layouts/AppShell.tsx';
import HomePage from './pages/HomePage.tsx';

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
          {/* 정의되지 않은 주소는 홈으로 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
