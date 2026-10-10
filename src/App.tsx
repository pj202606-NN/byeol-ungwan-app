import { HashRouter, Navigate, Route, Routes } from 'react-router';
import AppShell from './layouts/AppShell.tsx';
import HomePage from './pages/HomePage.tsx';
import FortunePage from './pages/FortunePage.tsx';
import RecordsPage from './pages/RecordsPage.tsx';
import MyPage from './pages/MyPage.tsx';
import SplashPage from './pages/SplashPage.tsx';
import OnboardingPage from './pages/OnboardingPage.tsx';
import EntryWheelPage from './pages/EntryWheelPage.tsx';
import { EntryFlowProvider, HomeEntry, MainShell, SignupStep } from './entry/entryFlow.tsx';
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
      {/* 초기 진입 과정에서 입력한 사용자 정보 (메모리, 영구 저장 없음) */}
      <EntryFlowProvider>
        <Routes>
          {/* 초기 진입 과정(01~04) — 하단 메뉴바 없음. 기본 주소로 앱을 열면 01 부터 (각 주소로 직접 열기도 가능) */}
          <Route element={<AppShell showNav={false} />}>
            <Route path="splash" element={<SplashPage />} />
            {/* 02 온보딩 1~5단계 — 마지막 버튼 → 회원가입 */}
            <Route path="onboarding" element={<Navigate to="/onboarding/1" replace />} />
            <Route path="onboarding/:step" element={<OnboardingPage />} />
            {/* 03 회원가입(기본 정보 입력) — 검증 통과 → 04 원판 (입력 정보는 EntryFlowProvider 메모리에만) */}
            <Route path="signup" element={<SignupStep />} />
            {/* 04 원판 돌리기 — 회원가입 통과 후 진입, 연출이 끝나면 홈 */}
            <Route path="entry-wheel" element={<EntryWheelPage />} />
          </Route>
          {/* 메인 앱 — 이 화면들을 한 번 보면 이후 기본 주소(#/)는 시작 화면 없이 홈 */}
          <Route element={<MainShell />}>
            {/* 기본 주소: 앱을 막 열었으면 01 시작 화면부터, 앱 안에서 왔으면 홈 */}
            <Route index element={<HomeEntry />} />
            {/* 개발용: 시작 흐름 없이 홈을 바로 열기 */}
            <Route path="home" element={<HomePage />} />
            <Route path="fortune" element={<FortunePage />} />
            <Route path="records" element={<RecordsPage />} />
            <Route path="my" element={<MyPage />} />
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
      </EntryFlowProvider>
    </HashRouter>
  );
}
