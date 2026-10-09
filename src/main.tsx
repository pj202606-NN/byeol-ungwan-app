import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { applyDeviceAttribute } from './utils/device.ts';
import { registerPwa } from './pwa/registerPwa.ts';
import './styles/tokens.css';
import './styles/global.css';

// 렌더링 전에 화면 유형(pc/tablet/mobile)을 결정해 깜빡임 방지
applyDeviceAttribute();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// 프로덕션 빌드에서만 Service Worker 등록
if (import.meta.env.PROD) {
  registerPwa();
}
