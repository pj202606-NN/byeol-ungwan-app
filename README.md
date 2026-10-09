# 별운관 (byeol-ungwan-app)

졸업전시용 모바일 PWA 웹앱 — React + Vite + TypeScript

> ## 📍 현재 개발 중인 앱 = 이 폴더(루트)의 `src/`
> - 앱 화면을 고치려면 **`src/` 폴더 안의 파일**을 수정합니다.
>
> **미리 보기:** VS Code 터미널(`Ctrl + ``)에서 `npm.cmd run dev` → 브라우저에서 **http://localhost:5173/**
> (Windows PowerShell 에서는 `npm` 대신 **`npm.cmd`** 사용 — 아래 2번 참고)

---

## 1. 주요 작업 파일

| 무엇을 고치나 | 파일 | 설명 |
|---|---|---|
| 웹앱 시작 HTML | [`index.html`](index.html) | 페이지 제목, 메타 태그(테마 색·iOS 설정). 보통 거의 수정하지 않음 |
| React 진입 파일 | [`src/main.tsx`](src/main.tsx) | React 실행, 화면 유형 판별, Service Worker 등록 |
| 라우팅(화면 주소) | [`src/App.tsx`](src/App.tsx) | 새 화면을 만들면 여기에 `<Route>` 추가 |
| 앱 전체 화면 틀 | [`src/layouts/AppShell.tsx`](src/layouts/AppShell.tsx) · [`AppShell.css`](src/layouts/AppShell.css) | PC 393:852 프레임 / 모바일·태블릿 전체 화면, 스크롤 영역, 하단 메뉴 배치 |
| **홈 화면 (첫 화면)** | [`src/pages/HomePage.tsx`](src/pages/HomePage.tsx) · [`HomePage.css`](src/pages/HomePage.css) | 현재는 임시 화면 → Figma 디자인으로 교체 예정 |
| **하단 메뉴바** | [`src/components/BottomNav.tsx`](src/components/BottomNav.tsx) · [`BottomNav.css`](src/components/BottomNav.css) | 메뉴 항목·아이콘 |
| PC 연출용 상태 표시줄 | [`src/components/PcStatusBar.tsx`](src/components/PcStatusBar.tsx) | 현재 비활성 (`app.config.ts` 의 `showPcStatusBar`) |
| **공통 스타일 (디자인 변수)** | [`src/styles/tokens.css`](src/styles/tokens.css) | 색상·간격·폰트, PC 프레임 테두리·그림자·곡률(`--frame-*`) |
| 공통 기본 스타일 | [`src/styles/global.css`](src/styles/global.css) | 리셋, body 기본값 |
| 앱 설정값 | [`src/app.config.ts`](src/app.config.ts) | 앱 이름, Figma 기준 크기, 태블릿 판별 기준 |
| 화면 유형 판별 | [`src/utils/device.ts`](src/utils/device.ts) | pc / tablet / mobile |
| **PWA 설정** | [`vite.config.ts`](vite.config.ts) | 설치 앱 이름·색·아이콘(manifest), 캐시, 배포 경로 |
| **PWA 업데이트** | [`src/pwa/registerPwa.ts`](src/pwa/registerPwa.ts) | 사용 중 강제 새로고침 없이 다음 실행 때 새 버전 반영 |
| PWA 아이콘 | [`public/icons/`](public/icons/) | 같은 파일명으로 교체 (192·512·maskable·apple-touch·favicon) |

새 화면 추가 순서: `src/pages/새화면.tsx` 작성 → `src/App.tsx` 에 `<Route path="주소" element={<새화면 />} />` 추가 → 이동 주소는 `#/주소`

## 2. 실행 · 미리 보기

모든 명령은 **프로젝트 루트 폴더(`package.json` 이 있는 곳)** 에서 실행합니다.
VS Code 에서 이 폴더를 연 상태라면 터미널(`Ctrl + ``)이 이미 이 위치입니다.

```bash
npm install          # 처음 한 번 (또는 node_modules 가 없을 때)
npm run dev          # 개발 서버 → http://localhost:5173/  (저장하면 화면 자동 갱신)
npm run dev:host     # 같은 Wi-Fi 의 휴대폰에서 접속 (터미널의 Network 주소 사용)
npm run build        # 타입 검사 + 프로덕션 빌드 → dist/
npm run preview      # 빌드 결과 확인 → http://localhost:4173/byeol-ungwan-app/
```

### Windows PowerShell 에서 실행할 때

PowerShell 에서 `npm run dev` 를 입력하면 `npm.ps1 ... 스크립트를 실행할 수 없으므로` 오류가 날 수 있습니다.
이 경우 **실행 정책을 바꾸지 말고** `npm` 대신 **`npm.cmd`** 를 사용하세요. 동작은 같습니다.

```powershell
npm.cmd install        # 패키지 설치
npm.cmd run dev        # 개발 서버 → http://localhost:5173/
npm.cmd run dev:host   # 휴대폰에서 접속
npm.cmd run build      # 프로덕션 빌드
npm.cmd run preview    # 빌드 결과 확인 → http://localhost:4173/byeol-ungwan-app/
```

(VS Code 터미널을 Command Prompt 나 Git Bash 로 바꾸면 `npm` 그대로 사용 가능)

- 개발 서버 종료: 터미널에서 `Ctrl + C`
- VS Code 안에서 보기: `Ctrl + Shift + P` → **Simple Browser: Show** → `http://localhost:5173/` 입력
- 휴대폰 화면 크기 확인: Chrome/Edge 에서 `F12` → 기기 툴바(`Ctrl + Shift + M`) → iPhone / Galaxy 선택 후 **새로고침**
  (화면 유형은 처음 열 때 판별되므로 기기를 바꾼 뒤 새로고침 필요)
- PWA(오프라인·업데이트)는 `npm run build` → `npm run preview` 에서만 동작합니다. 개발 서버에서는 꺼져 있습니다.

## 3. 폴더 구조

```
byeol-ungwan-app/
├─ src/                    ★ 현재 앱 소스
│  ├─ main.tsx  App.tsx  app.config.ts
│  ├─ layouts/             앱 화면 틀 (AppShell)
│  ├─ pages/               화면
│  ├─ components/          공통 UI (하단 메뉴 등)
│  ├─ styles/              tokens.css, global.css
│  ├─ pwa/                 Service Worker 등록·업데이트
│  ├─ utils/               공통 함수
│  ├─ services/            API·데이터 (예정)
│  └─ assets/              images / icons / fonts
├─ public/icons/           PWA 아이콘
├─ index.html              웹앱 시작 HTML
├─ package.json            (VS Code 에서 아래 설정 파일들이 묶여 표시됨)
│  ├ package-lock.json  tsconfig.json  tsconfig.node.json  vite.config.ts
├─ .github/workflows/      GitHub Pages 자동 배포
└─ .vscode/settings.json   VS Code 탐색기 파일 묶기 (실행·빌드와 무관)
```

`node_modules/`, `dist/` 는 자동 생성 폴더입니다 (Git 제외, 직접 수정하지 않음).

## 4. GitHub Pages 배포 관련 파일

| 파일 | 내용 |
|---|---|
| [`vite.config.ts`](vite.config.ts) 상단 `REPO_NAME` | 배포 경로 `/byeol-ungwan-app/` (저장소 이름이 바뀌면 여기 수정) |
| [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) | main 브랜치 push 시 자동 빌드·배포. `dist/` 만 공개 |

배포 주소(예정): `https://<사용자이름>.github.io/byeol-ungwan-app/`
사용 전 GitHub 저장소 Settings → Pages → Source 를 **GitHub Actions** 로 설정해야 합니다.

