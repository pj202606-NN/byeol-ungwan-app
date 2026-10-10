/**
 * 03 회원가입(기본 정보 입력) — 입력 값 · 검증 규칙
 * 결과는 마이 화면과 같은 UserProfile 형식 (src/pages/my/myData.ts)
 * ⚠️ 저장하지 않음 (React 상태만) — 저장 방식 · 원판(04) · 마이와의 공유는 추후 연결
 */
import type { UserProfile } from '../my/myData.ts';

export interface SignupValues {
  name: string;
  /** YYYY-MM-DD (입력칸이 비었거나 잘못되면 '') */
  birthDate: string;
  /** HH:MM, 선택 */
  birthTime: string;
}

/** 브라우저 날짜·시각 입력칸이 '잘못된 값'을 들고 있는지 (값은 '' 로 넘어옴) */
export interface InputFlags {
  birthDateBadInput?: boolean;
  birthTimeBadInput?: boolean;
}

export type SignupErrors = Partial<Record<keyof SignupValues, string>>;

export const NAME_MAX = 20;
export const BIRTH_DATE_MIN = '1900-01-01';

/** 'YYYY-MM-DD' 가 실제로 있는 날짜인지 (2월 30일 등 거름) */
export function isRealDate(value: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

/** 'HH:MM' (00:00 ~ 23:59) */
export function isRealTime(value: string): boolean {
  const m = /^(\d{2}):(\d{2})$/.exec(value);
  return !!m && Number(m[1]) <= 23 && Number(m[2]) <= 59;
}

/** 오늘 날짜 'YYYY-MM-DD' (기기 시간 기준) */
export function todayString(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

export function validateSignup(values: SignupValues, flags: InputFlags = {}, today = todayString()): SignupErrors {
  const errors: SignupErrors = {};

  if (!values.name.trim()) errors.name = '이름 또는 별명을 입력해 주세요.';

  if (flags.birthDateBadInput || (values.birthDate && !isRealDate(values.birthDate))) {
    errors.birthDate = '연도·월·일을 모두 올바르게 입력해 주세요.';
  } else if (!values.birthDate) {
    errors.birthDate = '생년월일을 입력해 주세요.';
  } else if (values.birthDate > today) {
    errors.birthDate = '오늘 이후의 날짜는 입력할 수 없어요.';
  } else if (values.birthDate < BIRTH_DATE_MIN) {
    errors.birthDate = '1900년 1월 1일 이후의 날짜를 입력해 주세요.';
  }

  // 출생 시각은 선택 — 비워 두면 통과, 입력했다면 올바른 시각인지만 확인
  if (flags.birthTimeBadInput || (values.birthTime && !isRealTime(values.birthTime))) {
    errors.birthTime = '시각을 다시 확인해 주세요. 모르면 비워 두어도 괜찮아요.';
  }

  return errors;
}

/** 검증을 통과한 값 → 마이 화면과 같은 사용자 정보 형식 (출생 시각은 'HH:MM', 없으면 생략) */
export function toUserProfile(values: SignupValues): UserProfile {
  return {
    name: values.name.trim(),
    birthDate: values.birthDate,
    ...(values.birthTime ? { birthTime: values.birthTime } : {}),
  };
}

export const signupCopy = {
  label: '二十八宿',
  title: '당신의 별자리를 찾아서',
  intro:
    '이십팔수는 별이 하루에 한 자리씩 머무는 하늘의 스물여덟 구역입니다. 생년월일만 있어도 나의 자리를 찾을 수 있고, 태어난 시각을 더하면 그날의 결을 더 자세히 읽을 수 있습니다.',
  nameLabel: '이름 또는 별명',
  namePlaceholder: '예) 하람',
  birthDateLabel: '생년월일',
  birthTimeLabel: '태어난 시각',
  birthTimeHint: '태어난 시각을 입력하면 더 상세한 해석을 확인할 수 있어요. 입력하지 않아도 기본 별자리와 운세는 그대로 확인할 수 있습니다.',
  submit: '나의 별자리 찾기',
};
