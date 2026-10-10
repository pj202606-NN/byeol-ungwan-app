import { Navigate, useNavigate, useParams } from 'react-router';
import { onboardingPath, onboardingSteps } from './onboarding/onboardingData.ts';
import './OnboardingPage.css';

interface OnboardingPageProps {
  /**
   * 마지막 단계 버튼('운세 보러 가기')을 눌렀을 때 — 03 회원가입으로 이어질 예정
   * ⏳ 회원가입 미구현이라 아직 연결하지 않음 (생략 시 아무 동작 없음)
   */
  onFinish?: () => void;
}

/**
 * 02 온보딩 — figma-reference/02_01 ~ 02_05_onboarding.png (393 × 852, 콘텐츠 798)
 * 하나의 화면에서 단계(1~5)에 따라 내용만 바뀜. 주소 #/onboarding/1 ~ 5 (개발 중 확인용, 앱 실행 흐름 미연결)
 * - '다음으로' → 다음 단계 (기록에 남아 브라우저·안드로이드 뒤로 가기로 이전 단계)
 * - 위치 표시(점)는 표시만. 시안에 이전 버튼·건너뛰기·밀어서 넘기기 없음
 * ⏳ 미확정: 단계 전환 애니메이션, 조작 방식(스와이프 등)
 */
export default function OnboardingPage({ onFinish }: OnboardingPageProps) {
  const { step: stepParam } = useParams();
  const navigate = useNavigate();
  const step = Number(stepParam);
  const total = onboardingSteps.length;

  if (!Number.isInteger(step) || step < 1 || step > total) return <Navigate to={onboardingPath(1)} replace />;

  const current = onboardingSteps[step - 1];
  const isLast = step === total;
  const next = () => {
    if (isLast) onFinish?.();
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
