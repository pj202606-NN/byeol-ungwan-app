import { Navigate, useNavigate, useParams } from 'react-router';
import { onboardingPath, onboardingSteps, signupPath } from './onboarding/onboardingData.ts';
import './OnboardingPage.css';

/**
 * 02 온보딩 — figma-reference/02_01 ~ 02_05_onboarding.png (393 × 852, 콘텐츠 798)
 * 하나의 화면에서 단계(1~5)에 따라 내용만 바뀜. 주소 #/onboarding/1 ~ 5 (개발 중 확인용, 앱 실행 흐름 미연결)
 * - '다음으로' → 다음 단계 (기록에 남아 브라우저·안드로이드 뒤로 가기로 이전 단계)
 * - 위치 표시(점)는 표시만. 시안에 이전 버튼·건너뛰기·밀어서 넘기기 없음
 * ⏳ 미확정: 단계 전환 애니메이션, 조작 방식(스와이프 등)
 */
export default function OnboardingPage() {
  const { step: stepParam } = useParams();
  const navigate = useNavigate();
  const step = Number(stepParam);
  const total = onboardingSteps.length;

  if (!Number.isInteger(step) || step < 1 || step > total) return <Navigate to={onboardingPath(1)} replace />;

  const current = onboardingSteps[step - 1];
  const isLast = step === total;
  const next = () => {
    // 마지막 단계 → 03 회원가입 (2026-10-10 연결). 회원가입의 ‹ 는 이 단계로 돌아옴
    if (isLast) navigate(signupPath, { state: { fromOnboarding: true } });
    else navigate(onboardingPath(step + 1));
  };

  return (
    <div className="onboarding">
      <div className="onboarding__content">
        {/* 그림 자리 — 에셋 미제공 (시안: 단계별 선 그림) */}
        <div className={`onboarding__illustration onboarding__illustration--${current.illustration}`} aria-hidden="true">
          {current.image && <img src={current.image} alt="" />}
        </div>

        {/* 단계가 바뀌면 문구를 새로 그려 살짝 나타나게 (페이드) */}
        <p key={step} className="onboarding__text" aria-live="polite">
          <span>{current.lines[0]}</span>
          <span>{current.lines[1]}</span>
        </p>

        <div className="onboarding__dots" role="img" aria-label={`${total}단계 중 ${step}단계`}>
          {onboardingSteps.map((_, i) => (
            <span key={i} className={i + 1 === step ? 'is-current' : undefined} />
          ))}
        </div>
      </div>

      <button type="button" className="onboarding__button" onClick={next}>
        {current.button}
      </button>
    </div>
  );
}
