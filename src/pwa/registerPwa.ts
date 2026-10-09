import { registerSW } from 'virtual:pwa-register';

/* ==========================================================================
   Service Worker 등록 및 "안전한 업데이트" 구조

   전시 중 관람객이 사용하는 도중 화면이 갑자기 새로고침되지 않도록 설계했습니다.

   1. 새 버전 확인     앱이 다시 화면에 보일 때 + 일정 간격마다 자동 확인
   2. 백그라운드 준비  새 버전 파일을 미리 내려받아 '대기(waiting)' 상태로 둠
                       → 이때 현재 화면·입력값은 그대로 유지 (자동 새로고침 없음)
   3. 반영 시점        ① 앱을 완전히 닫았다가 다시 실행할 때 (브라우저 기본 동작)
                       ② 추후 만들 "앱 초기화" 기능에서 applyPendingUpdate() 호출 시

   캐시 안전성
   - 대기 중인 새 버전은 활성화되기 전까지 현재 앱의 캐시를 건드리지 않습니다.
   - 빌드 파일 이름에 해시가 붙어 있어 구버전·신버전 파일이 섞이지 않습니다.
   - 새 버전이 활성화되는 순간 이전 버전 캐시만 정리합니다(cleanupOutdatedCaches).
   - 업데이트 확인/다운로드가 실패해도 현재 버전은 그대로 계속 동작합니다.
   ========================================================================== */

/** 새 버전 확인 간격 */
const UPDATE_CHECK_INTERVAL_MS = 30 * 60 * 1000; // 30분

let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined;
let updateReady = false;
const listeners = new Set<() => void>();

export function registerPwa(): void {
  if (!('serviceWorker' in navigator)) return;

  updateSW = registerSW({
    immediate: true,

    // 새 버전 준비 완료 → 알림만 기록하고 자동으로 교체하지 않음
    onNeedRefresh() {
      updateReady = true;
      listeners.forEach((fn) => fn());
    },

    onOfflineReady() {
      console.info('[PWA] 오프라인 실행 준비 완료');
    },

    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;

      const check = () => void checkForUpdate(registration);
      setInterval(check, UPDATE_CHECK_INTERVAL_MS);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
      });
    },

    onRegisterError(error) {
      // 등록 실패 시에도 일반 웹사이트로는 정상 동작
      console.warn('[PWA] Service Worker 등록 실패', error);
    },
  });
}

async function checkForUpdate(registration: ServiceWorkerRegistration): Promise<void> {
  // 이미 다운로드 중이거나 오프라인이면 건너뜀
  if (registration.installing || !navigator.onLine) return;
  try {
    await registration.update();
  } catch (error) {
    console.warn('[PWA] 업데이트 확인 실패 — 현재 버전 유지', error);
  }
}

/** 새 버전이 받아져 대기 중인지 */
export function isUpdateReady(): boolean {
  return updateReady;
}

/** 새 버전 대기 상태 변화 구독 (추후 "업데이트 있음" 표시 등에 사용) */
export function onUpdateReady(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * 대기 중인 새 버전을 즉시 반영하고 새로고침합니다.
 * ⚠ 사용자 데이터가 사라져도 되는 "안전한 시점"에서만 호출하세요.
 *    (예: 전시용 앱 초기화 버튼, 처음 화면으로 돌아갈 때)
 */
export async function applyPendingUpdate(): Promise<void> {
  if (!updateReady || !updateSW) return;
  await updateSW(true);
}
