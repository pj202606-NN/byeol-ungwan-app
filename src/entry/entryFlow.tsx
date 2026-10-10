import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router';
import AppShell from '../layouts/AppShell.tsx';
import HomePage from '../pages/HomePage.tsx';
import type { UserProfile } from '../pages/my/myData.ts';
import SignupPage from '../pages/SignupPage.tsx';

/**
 * 초기 진입 과정(01~04)에서 입력한 사용자 정보를 화면 사이에 넘겨 주는 곳
 * - 메모리(React 상태)에만 보관 — 새로 고침·앱 종료 시 사라짐 (영구 저장 없음, 2026-10-10 기준)
 * - 03 회원가입 → 04 원판 → (추후) 05 홈 · 09 마이 에서 같은 값을 읽도록 확장
 * ⚠️ 별자리 배정·운세 계산은 하지 않음 (규칙 미확정)
 *
 * 앱 실행 흐름 (2026-10-10): 기본 주소(#/) → 01 시작 → 02 온보딩 → 03 회원가입 → 04 원판 → 05 홈
 * - '앱을 여는 것'과 '앱 안에서 홈으로 가는 것'을 구분하기 위해 introDone(메모리)을 둠
 *   · 앱을 열었을 때(새로 고침 포함)는 false → 기본 주소(#/)에서 시작 화면으로
 *   · 원판이 끝나거나 메인 앱 화면을 한 번이라도 보면 true → 이후 홈으로 가도 시작 화면이 다시 나오지 않음
 * - 시작 흐름(시작 → 온보딩 → 회원가입 → 원판 → 홈)은 뒤로 가기 기록을 '교체'하며 이동 (2026-10-10 결정)
 *   → 흐름 전체가 기록 한 칸만 차지, 홈에서 뒤로 가기로 회원가입·원판·온보딩이 나오지 않음 (여러 단계 되돌리기 없음)
 * - 최초 실행 여부 · 사용자 정보는 저장하지 않음 (앱을 다시 열면 항상 시작 화면부터)
 */
interface EntryFlowValue {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  introDone: boolean;
  markIntroDone: () => void;
  /** 04 원판이 끝났을 때: 시작 흐름 완료 표시 후 원판 자리를 홈으로 교체 */
  finishIntro: () => void;
}

const EntryFlowContext = createContext<EntryFlowValue | null>(null);

export function EntryFlowProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [introDone, setIntroDone] = useState(false);
  const markIntroDone = () => setIntroDone(true);
  const navigate = useNavigate();

  const finishIntro = () => {
    setIntroDone(true);
    navigate('/', { replace: true });
  };

  return (
    <EntryFlowContext.Provider value={{ profile, setProfile, introDone, markIntroDone, finishIntro }}>
      {children}
    </EntryFlowContext.Provider>
  );
}

export function useEntryFlow(): EntryFlowValue {
  const value = useContext(EntryFlowContext);
  if (!value) throw new Error('useEntryFlow 는 EntryFlowProvider 안에서만 사용');
  return value;
}

export const entryWheelPath = '/entry-wheel';
export const splashPath = '/splash';

/** 03 회원가입 — 검증을 통과하면 정보를 넘겨 두고 04 원판으로 (기록 교체) */
export function SignupStep() {
  const navigate = useNavigate();
  const { profile, setProfile } = useEntryFlow();
  return (
    <SignupPage
      initial={profile}
      onComplete={(profile) => {
        setProfile(profile);
        navigate(entryWheelPath, { replace: true });
      }}
    />
  );
}

/** 메인 앱(하단 메뉴바 있는 화면)을 보여 주면 시작 흐름을 다시 띄우지 않도록 표시 */
export function MainShell() {
  const { markIntroDone } = useEntryFlow();
  useEffect(() => {
    markIntroDone();
    // 처음 한 번만
  }, []);
  return <AppShell />;
}

/** 기본 주소(#/): 앱을 막 열었으면 01 시작 화면으로, 앱 안에서 이동해 왔으면 홈 */
export function HomeEntry() {
  const { introDone } = useEntryFlow();
  if (!introDone) return <Navigate to={splashPath} replace />;
  return <HomePage />;
}
