import type { UserProfile } from '../pages/my/myData.ts';
import { NAME_MAX, validateSignup } from '../pages/signup/signupForm.ts';

export const PROFILE_SESSION_KEY = 'byeolungwan.profile.v1';
type ProfileStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** 같은 탭의 새로고침에만 입력값을 복원한다. 잘못된 저장값은 사용하지 않는다. */
export function readSessionProfile(storage?: ProfileStorage): UserProfile | null {
  try {
    const target = storage ?? window.sessionStorage;
    const saved = target.getItem(PROFILE_SESSION_KEY);
    if (!saved) return null;
    const value: unknown = JSON.parse(saved);
    if (typeof value !== 'object' || value === null) throw new Error('잘못된 사용자 정보');
    const row = value as Record<string, unknown>;
    if (typeof row.name !== 'string' || typeof row.birthDate !== 'string'
      || row.name.length > NAME_MAX || (row.birthTime !== undefined && typeof row.birthTime !== 'string')) {
      throw new Error('잘못된 사용자 정보');
    }
    const values = { name: row.name, birthDate: row.birthDate, birthTime: (row.birthTime as string | undefined) ?? '' };
    if (Object.keys(validateSignup(values)).length) throw new Error('입력 검증 실패');
    return { name: row.name.trim(), birthDate: row.birthDate, ...(values.birthTime ? { birthTime: values.birthTime } : {}) };
  } catch {
    try { (storage ?? window.sessionStorage).removeItem(PROFILE_SESSION_KEY); } catch { /* 저장소가 차단되면 메모리만 사용 */ }
    return null;
  }
}

export function saveSessionProfile(profile: UserProfile | null, storage?: ProfileStorage): void {
  try {
    const target = storage ?? window.sessionStorage;
    if (profile) target.setItem(PROFILE_SESSION_KEY, JSON.stringify(profile));
    else target.removeItem(PROFILE_SESSION_KEY);
  } catch { /* 저장소가 차단되더라도 현재 탭의 입력·판정은 계속 동작 */ }
}
