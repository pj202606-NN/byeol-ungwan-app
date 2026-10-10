import { useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import PageHeader from '../components/PageHeader.tsx';
import type { UserProfile } from './my/myData.ts';
import { onboardingPath } from './onboarding/onboardingData.ts';
import {
  BIRTH_DATE_MIN,
  NAME_MAX,
  signupCopy,
  todayString,
  toUserProfile,
  validateSignup,
  type SignupErrors,
  type SignupValues,
} from './signup/signupForm.ts';
import './SignupPage.css';

interface SignupPageProps {
  /**
   * 검증을 통과했을 때 — 앱에서는 SignupStep(src/entry/entryFlow.tsx)이 정보를 메모리에 넘겨 두고 04 원판으로 이동
   * (생략 시 화면 변화 없음)
   */
  onComplete?: (profile: UserProfile) => void;
  /** 이미 입력한 정보 (원판에서 뒤로 돌아왔을 때 다시 채움 — 메모리에 있는 값만) */
  initial?: UserProfile | null;
}

const fields = ['name', 'birthDate', 'birthTime'] as const;

/**
 * 03 회원가입(기본 정보 입력) — 참고: figma-reference/03_signup_reference.png (내용만 참고)
 * 디자인은 기존 화면 규칙으로 새로 구성: 위쪽 소개 + 둥근 본문 판, 좌우 20, 입력칸 = 앱 카드색, 버튼 = 온보딩 버튼
 * 주소 #/signup (온보딩 마지막 단계에서 진입). 하단 메뉴바 없음
 * 이름 · 생년월일 필수, 출생 시각 선택. 입력 값은 이 화면의 상태로만 관리 (저장 없음)
 */
export default function SignupPage({ onComplete, initial }: SignupPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState<SignupValues>({
    name: initial?.name ?? '',
    birthDate: initial?.birthDate ?? '',
    birthTime: initial?.birthTime ?? '',
  });
  const [errors, setErrors] = useState<SignupErrors>({});
  const [submitted, setSubmitted] = useState(false); // 한 번 '찾기'를 누른 뒤부터는 입력할 때마다 다시 검사
  const refs = {
    name: useRef<HTMLInputElement>(null),
    birthDate: useRef<HTMLInputElement>(null),
    birthTime: useRef<HTMLInputElement>(null),
  };
  const today = todayString();

  const check = (next: SignupValues) =>
    validateSignup(next, {
      birthDateBadInput: refs.birthDate.current?.validity.badInput,
      birthTimeBadInput: refs.birthTime.current?.validity.badInput,
    });

  const update = (key: keyof SignupValues) => (e: { target: HTMLInputElement }) => {
    const next = { ...values, [key]: e.target.value };
    setValues(next);
    if (submitted) setErrors(check(next));
  };

  // 온보딩에서 들어왔으면 뒤로(온보딩 5단계), 직접 접속이면 온보딩 5단계로 교체
  const goBack = () => {
    if ((location.state as { fromOnboarding?: boolean } | null)?.fromOnboarding) navigate(-1);
    else navigate(onboardingPath(5), { replace: true });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const found = check(values);
    setErrors(found);
    const firstInvalid = fields.find((f) => found[f]);
    if (firstInvalid) {
      refs[firstInvalid].current?.focus();
      return;
    }
    onComplete?.(toUserProfile(values));
  };

  const describe = (key: keyof SignupValues, hint?: boolean) =>
    [errors[key] && `signup-${key}-error`, hint && `signup-${key}-hint`].filter(Boolean).join(' ') || undefined;

  return (
    <div className="signup">
      <div className="signup-top">
        <PageHeader title="" onBack={goBack} right={<span aria-hidden="true" />} />
        <section className="signup-intro">
          <p className="signup-intro__label">{signupCopy.label}</p>
          <h1 className="signup-intro__title">{signupCopy.title}</h1>
          <p className="signup-intro__desc">{signupCopy.intro}</p>
        </section>
      </div>

      <form className="signup-sheet" onSubmit={submit} noValidate>
        <div className="signup-fields">
          {/* 이름 (필수) */}
          <div className={`signup-field${errors.name ? ' is-invalid' : ''}`}>
            <label className="signup-field__label" htmlFor="signup-name">
              {signupCopy.nameLabel}
            </label>
            <input
              ref={refs.name}
              id="signup-name"
              className="signup-field__input"
              type="text"
              value={values.name}
              onChange={update('name')}
              placeholder={signupCopy.namePlaceholder}
              maxLength={NAME_MAX}
              autoComplete="nickname"
              enterKeyHint="next"
              required
              aria-invalid={!!errors.name}
              aria-describedby={describe('name')}
            />
            {errors.name && (
              <p id="signup-name-error" className="signup-field__error" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          {/* 생년월일 (필수) — 휴대폰에서는 기기의 날짜 선택기가 열림 */}
          <div className={`signup-field${errors.birthDate ? ' is-invalid' : ''}`}>
            <label className="signup-field__label" htmlFor="signup-birth-date">
              {signupCopy.birthDateLabel}
            </label>
            <input
              ref={refs.birthDate}
              id="signup-birth-date"
              className={`signup-field__input signup-field__input--picker${values.birthDate ? '' : ' is-empty'}`}
              type="date"
              value={values.birthDate}
              onChange={update('birthDate')}
              onBlur={() => submitted && setErrors(check(values))}
              min={BIRTH_DATE_MIN}
              max={today}
              autoComplete="bday"
              required
              aria-invalid={!!errors.birthDate}
              aria-describedby={describe('birthDate')}
            />
            {errors.birthDate && (
              <p id="signup-birthDate-error" className="signup-field__error" role="alert">
                {errors.birthDate}
              </p>
            )}
          </div>

          {/* 태어난 시각 (선택) */}
          <div className={`signup-field${errors.birthTime ? ' is-invalid' : ''}`}>
            <label className="signup-field__label" htmlFor="signup-birth-time">
              {signupCopy.birthTimeLabel}
              <span className="signup-field__optional">선택</span>
            </label>
            <input
              ref={refs.birthTime}
              id="signup-birth-time"
              className={`signup-field__input signup-field__input--picker${values.birthTime ? '' : ' is-empty'}`}
              type="time"
              value={values.birthTime}
              onChange={update('birthTime')}
              onBlur={() => submitted && setErrors(check(values))}
              aria-invalid={!!errors.birthTime}
              aria-describedby={describe('birthTime', true)}
            />
            {errors.birthTime && (
              <p id="signup-birthTime-error" className="signup-field__error" role="alert">
                {errors.birthTime}
              </p>
            )}
            <p id="signup-birthTime-hint" className="signup-field__hint">
              {signupCopy.birthTimeHint}
            </p>
          </div>
        </div>

        <button type="submit" className="signup-submit">
          {signupCopy.submit}
        </button>
      </form>
    </div>
  );
}
