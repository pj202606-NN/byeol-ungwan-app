import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/* ──────────────────────────────────────────────────────────────
   배포 설정 — 저장소 이름이 바뀌면 REPO_NAME 한 줄만 수정하세요.
   GitHub Pages 주소: https://<사용자이름>.github.io/<REPO_NAME>/
   (빌드 시 환경변수 BASE_PATH 가 있으면 그 값이 우선합니다)
   ────────────────────────────────────────────────────────────── */
const REPO_NAME = 'byeol-ungwan-app';

/* 설치 앱 정보 (아이콘 파일은 public/icons/ 에서 교체) */
const APP_NAME = '별운관';
const APP_SHORT_NAME = '별운관';
const APP_DESCRIPTION = '별운관 졸업전시 웹앱';
const THEME_COLOR = '#070e16'; // 상태 표시줄·주소창 색 (index.html 의 theme-color 와 맞출 것)
const BACKGROUND_COLOR = '#070e16'; // 설치 앱 실행 시 스플래시 배경색

export default defineConfig(({ command, isPreview }) => {
  // 로컬 개발(dev)은 '/', 프로덕션 빌드·미리보기(preview)는 '/byeol-ungwan-app/'
  const isDevServer = command === 'serve' && !isPreview;
  const base = isDevServer ? '/' : (process.env.BASE_PATH ?? `/${REPO_NAME}/`);

  // 빌드 시각(한국 시간) — 홈 화면에 표시해 기기에 새 버전이 반영됐는지 확인
  const buildTime = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).slice(0, 16);

  return {
    base,

    define: {
      __APP_BUILD_TIME__: JSON.stringify(command === 'build' ? buildTime : 'dev'),
    },

    plugins: [
      react(),
      VitePWA({
        /* 'prompt' = 새 버전을 백그라운드에서 받아두기만 하고,
           사용 중에는 절대 자동으로 교체·새로고침하지 않음 (src/pwa/registerPwa.ts 참고) */
        registerType: 'prompt',
        injectRegister: false, // 등록은 src/pwa/registerPwa.ts 에서 직접 수행
        includeAssets: ['icons/favicon.svg', 'icons/apple-touch-icon.png'],
        manifest: {
          id: base,
          name: APP_NAME,
          short_name: APP_SHORT_NAME,
          description: APP_DESCRIPTION,
          lang: 'ko',
          start_url: base,
          scope: base,
          display: 'standalone',
          orientation: 'portrait',
          theme_color: THEME_COLOR,
          background_color: BACKGROUND_COLOR,
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // 빌드 결과물 전체를 미리 캐시 → 오프라인에서도 앱 실행 가능
          globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff2,webmanifest}'],
          // 새 버전이 활성화될 때 이전 버전 캐시 정리
          cleanupOutdatedCaches: true,
          // 사용 중인 화면을 새 버전이 가로채지 않도록 둘 다 false (다음 실행 시 반영)
          skipWaiting: false,
          clientsClaim: false,
        },
        devOptions: {
          enabled: false, // 개발 서버에서는 SW 비활성화 (캐시로 인한 혼란 방지)
        },
      }),
    ],

    // 이전 작업물(OLD_PROJECT/**/*.html)을 의존성 분석 대상에서 제외
    optimizeDeps: {
      entries: ['index.html'],
    },
  };
});
