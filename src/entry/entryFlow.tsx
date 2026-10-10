import { createContext, useContext, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import type { UserProfile } from '../pages/my/myData.ts';
import SignupPage from '../pages/SignupPage.tsx';

/**
 * 초기 진입 과정(01~04)에서 입력한 사용자 정보를 화면 사이에 넘겨 주는 곳
 * - 메모리(React 상태)에만 보관 — 새로 고침·앱 종료 시 사라짐 (영구 저장 없음, 2026-10-10 기준)
 * - 03 회원가입 → 04 원판 → (추후) 05 홈 · 09 마이 에서 같은 값을 읽도록 확장
 * ⚠️ 별자리 배정·운세 계산은 하지 않음 (규칙 미확정)
 */
interface EntryFlowValue {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
}

const EntryFlowContext = createContext<EntryFlowValue | null>(null);

export function EntryFlowProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  return <EntryFlowContext.Provider value={{ profile, setProfile }}>{children}</EntryFlowContext.Provider>;
}

export function useEntryFlow(): EntryFlowValue {
  const value = useContext(EntryFlowContext);
  if (!value) throw new Error('useEntryFlow 는 EntryFlowProvider 안에서만 사용');
  return value;
}

export const entryWheelPath = '/entry-wheel';

/** 03 회원가입 — 검증을 통과하면 정보를 넘겨 두고 04 원판으로 이동 */
export function SignupStep() {
  const navigate = useNavigate();
  const { profile, setProfile } = useEntryFlow();
  return (
    <SignupPage
      initial={profile}
      onComplete={(profile) => {
        setProfile(profile);
        navigate(entryWheelPath, { state: { fromSignup: true } });
      }}
    />
  );
}
