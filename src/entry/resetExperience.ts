import { PROFILE_SESSION_KEY } from './profileSession.ts';

type ExperienceStorage = Pick<Storage, 'length' | 'key' | 'removeItem'>;

/** 앱 체험용 입력과 기록만 삭제. 다른 저장소·PWA 캐시에는 접근하지 않는다. */
export function clearExperienceStorage(storage?: ExperienceStorage): void {
  try {
    const target = storage ?? window.sessionStorage;
    const keys = Array.from({ length: target.length }, (_, index) => target.key(index));
    for (const key of keys) {
      if (key === PROFILE_SESSION_KEY || key?.startsWith('byeolungwan.records.v1:')) target.removeItem(key);
    }
  } catch { /* 저장소가 차단되어도 메모리 상태 초기화는 계속 진행 */ }
}
