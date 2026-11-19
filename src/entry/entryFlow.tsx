import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router';
import AppShell from '../layouts/AppShell.tsx';
import HomePage from '../pages/HomePage.tsx';
import type { UserProfile } from '../pages/my/myData.ts';
import SignupPage from '../pages/SignupPage.tsx';
import EntryWheelPage from '../pages/EntryWheelPage.tsx';
import { resolveBirthConstellation, type BirthConstellation } from '../services/birthConstellation.ts';
import { useFortuneDate } from '../utils/useFortuneDate.ts';
import { readSessionProfile, saveSessionProfile } from './profileSession.ts';
import { clearExperienceStorage } from './resetExperience.ts';

/**
 * 초기 진입 과정(01~04)에서 입력한 사용자 정보를 화면 사이에 넘겨 주는 곳
 * - 입력값을 탭 세션에 보관하여 새로고침 뒤에도 같은 별자리를 복원
 * - 입력한 양력 생일을 JSON의 생일범위와 대조하여 판정한 별자리를 앱 전체에서 공유
 * - 운세 날짜도 함께 공유하며 궁합 문구 연결은 별도 진행
 *
 * 앱 실행 흐름 (2026-10-10): 기본 주소(#/) → 01 시작 → 02 온보딩 → 03 회원가입 → 04 원판 → 05 홈
 * - '앱을 여는 것'과 '앱 안에서 홈으로 가는 것'을 구분하기 위해 introDone(메모리)을 둠
 *   · 저장된 입력값이 없으면 false → 기본 주소(#/)에서 시작 화면으로
 *   · 같은 탭을 새로고침하면 저장된 입력값을 복원하여 홈으로
 *   · 원판이 끝나거나 메인 앱 화면을 한 번이라도 보면 true → 이후 홈으로 가도 시작 화면이 다시 나오지 않음
 * - 시작 흐름(시작 → 온보딩 → 회원가입 → 원판 → 홈)은 뒤로 가기 기록을 '교체'하며 이동 (2026-10-10 결정)
 *   → 흐름 전체가 기록 한 칸만 차지, 홈에서 뒤로 가기로 회원가입·원판·온보딩이 나오지 않음 (여러 단계 되돌리기 없음)
 * - 입력값이 없는 탭은 시작 화면부터. 재설정하면 메모리와 탭 세션을 함께 삭제
 */
interface EntryFlowValue {
  profile: UserProfile | null;
  constellation: BirthConstellation | null;
  fortuneToday: string;
  fortuneDate: string;
  selectFortuneDate: (date: string) => void;
  setProfile: (profile: UserProfile | null) => void;
  introDone: boolean;
  markIntroDone: () => void;
  /** 04 원판이 끝났을 때: 시작 흐름 완료 표시 후 원판 자리를 홈으로 교체 */
  finishIntro: () => void;
  restartExperience: () => void;
}

const EntryFlowContext = createContext<EntryFlowValue | null>(null);

export function EntryFlowProvider({ children }: { children: ReactNode }) {
  const fortuneDateState = useFortuneDate();
  const [profile, updateProfile] = useState<UserProfile | null>(readSessionProfile);
  const setProfile = (next: UserProfile | null) => {
    saveSessionProfile(next);
    updateProfile(next);
  };
  useEffect(() => {
    saveSessionProfile(profile);
  }, [profile]);
  const constellation = profile ? resolveBirthConstellation(profile.birthDate) : null;
  const [introDone, setIntroDone] = useState(() => profile !== null);
  const markIntroDone = () => setIntroDone(true);
  const navigate = useNavigate();

  const finishIntro = () => {
    setIntroDone(true);
    navigate('/', { replace: true });
  };

  const restartExperience = () => {
    clearExperienceStorage();
    updateProfile(null);
    setIntroDone(false);
    fortuneDateState.selectFortuneDate(fortuneDateState.fortuneToday);
    // 시작 경로로 이동하며 이전 화면의 폼·선택·팝업도 언마운트된다.
    navigate('/splash', { replace: true });
  };

  return (
    <EntryFlowContext.Provider value={{ profile, constellation, setProfile, introDone, markIntroDone, finishIntro, restartExperience, ...fortuneDateState }}>
      {children}
    </EntryFlowContext.Provider>
  );
}

export function useEntryFlow(): EntryFlowValue {
  const value = useContext(EntryFlowContext);
  if (!value) throw new Error('useEntryFlow 는 EntryFlowProvider 안에서만 사용');
  return value;
}

/** 입력 검증을 통과한 화면에서만 사용. 예시 별자리로 대신 표시하지 않는다. */
export function useRequiredEntryFlow() {
  const value = useEntryFlow();
  const { profile, constellation } = value;
  if (!profile || !constellation) throw new Error('사용자 정보 입력 후 이용할 수 있습니다.');
  return { ...value, profile, constellation };
}

export const entryWheelPath = '/entry-wheel';
export const splashPath = '/splash';

/** 03 회원가입 — 검증을 통과하면 정보를 넘겨 두고 04 원판으로 (기록 교체) */
export function SignupStep() {
  const navigate = useNavigate();
  const { profile, setProfile, fortuneToday, selectFortuneDate } = useEntryFlow();
  return (
    <SignupPage
      initial={profile}
      onComplete={(profile) => {
        setProfile(profile);
        selectFortuneDate(fortuneToday);
        navigate(entryWheelPath, { replace: true });
      }}
    />
  );
}

export function EntryWheelStep() {
  const { profile } = useEntryFlow();
  return profile ? <EntryWheelPage /> : <Navigate to="/signup" replace />;
}

/** 메인 앱(하단 메뉴바 있는 화면)을 보여 주면 시작 흐름을 다시 띄우지 않도록 표시 */
export function MainShell() {
  const { profile, markIntroDone } = useEntryFlow();
  useEffect(() => {
    if (profile) markIntroDone();
  }, [profile]);
  if (!profile) return <Navigate to={splashPath} replace />;
  return <AppShell />;
}

/** 기본 주소(#/): 입력 정보가 복원되었거나 시작 흐름을 완료했으면 홈 */
export function HomeEntry() {
  const { introDone } = useEntryFlow();
  if (!introDone) return <Navigate to={splashPath} replace />;
  return <HomePage />;
}
