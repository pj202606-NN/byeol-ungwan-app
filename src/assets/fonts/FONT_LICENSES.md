# 폰트 출처 및 라이선스

## 확정 글꼴 (2026-11-19)

- UI·본문: 기존 Pretendard Variable WOFF2, `font-weight: 45 920`.
- 기존 명조 영역: **본명조 Source Han Serif KR 2.003**, `font-weight: 250 900`.
- Adobe 공식 배포 파일을 변환·수정 없이 사용: `source-han-serif/SourceHanSerifKR-VF.otf.woff2` (4,751,636 bytes).
- 공식 출처: https://github.com/adobe-fonts/source-han-serif/tree/release/Variable/WOFF2/OTF/Subset
- 고정 원본 revision: `7889f11bf31170b5d092a083b357c8c8130f89e0`.
- SHA-256: `cd5c29b1e9fbe1374f809d2ebe46df3a0f0d33e9891407432183a7e0c03ee735`.
- 라이선스: 공식 `source-han-serif/LICENSE.txt` (SIL OFL 1.1).
- Pretendard에 없는 한자는 로컬 본명조로 보완. 두 파일을 preload하고 Workbox precache에 포함하며 외부 CDN을 호출하지 않음.
- 기존 후보 파일 및 등록은 보존. 아래 목록은 기존 후보 출처 기록.

### 한국어 축소판 미수록 한자 보완

- 앱의 `氐土貉`에서 사용하는 `貉` (U+8C89)은 공식 KR 축소판에 없어 동일 revision의 공식 Pan-CJK 한국어판 `Variable/WOFF2/OTF/SourceHanSerifK-VF.otf.woff2`에서 이 글자만 추출함.
- 배포 파일: `source-han-serif/ByeolungwanSerifSupplement.woff2`. 동일 SIL OFL 1.1을 적용하며 원본 저작권 및 라이선스 레코드를 보존.
- 수정본 내부 family/unique/PostScript 이름은 `Byeolungwan Serif Supplement` / `ByeolungwanSerifSupplement`로 변경하여 예약 이름 `Source`를 사용하지 않음.
- 재현 스크립트: `scripts/build-serif-supplement.py` (fontTools). 전체판 원본은 로컬 `review/`에만 보관하며 앱에는 작은 보완 파일만 배포.
- CSS `unicode-range: U+8C89`로 해당 한자에만 사용. 본명조의 글자 모양·가변 굵기를 그대로 보존하고 precache에 포함.

확인일: 2026-10-10 · 4종 모두 **SIL Open Font License 1.1 (OFL)**

| 폰트 | 용도 | 포함 파일 (형식 · 용량) | 출처 (공식 배포처) | 라이선스 파일 |
|---|---|---|---|---|
| **Pretendard** v1.3.9 | 기본 폰트 (UI·본문·버튼·입력창) | `pretendard/PretendardVariable.woff2` (가변 45~920 · 2.06MB) | https://github.com/orioncactus/pretendard (Release v1.3.9 `Pretendard-1.3.9.zip` → `web/variable/woff2/`) | `pretendard/LICENSE.txt` |
| **Hahmlet** (함렡) v1.131 | 포인트 후보 | `hahmlet/Hahmlet-Regular.woff2` (400 · 363KB), `Hahmlet-Bold.woff2` (700 · 436KB) | https://github.com/hyper-type/hahmlet (`fonts/webfonts/`) | `hahmlet/OFL.txt` |
| **Song Myung** (송명) v1.00 | 포인트 후보 | `song-myung/SongMyung-Regular.ttf` (400 · 2.04MB) — 공식 배포 형식이 TTF뿐 (Regular 1종) | https://fonts.google.com/specimen/Song+Myung (원본: https://github.com/google/fonts/tree/main/ofl/songmyung) | `song-myung/OFL.txt` |
| **Maru Buri** (마루 부리) v2.000 | 포인트 후보 | `maru-buri/MaruBuri-Regular.woff2` (400 · 430KB), `MaruBuri-Bold.woff2` (700 · 460KB) | https://hangeul.naver.com/font (정식 zip: OTF/TTF, 웹폰트 WOFF2: 네이버 공식 사이트 제공 `hangeul.pstatic.net/0/hangeul/2023/fonts/`) | `maru-buri/LICENSE.txt` ¹ |

¹ 공식 zip에 라이선스 파일이 없어, 네이버 고객센터의 공식 라이선스 안내 문구와 OFL 1.1 전문을 함께 보관했습니다.
  안내: https://help.naver.com/support/contents/contents.help?serviceNo=1074&categoryNo=3497
  — "네이버 마루 부리 글꼴도 나눔 글꼴과 같은 오픈라이센스 폰트로 동일한 저작권 규정을 적용받습니다."

## OFL 1.1 주요 조건 (상용 출시 기준)

- ✅ 상업적 사용 가능 (앱·웹사이트·인쇄물 등)
- ✅ 웹폰트로 임베딩, 앱(PWA·Android·iOS) 번들 포함 가능
- ✅ 재배포 가능 — 단, **저작권 고지와 라이선스 전문을 함께 포함**해야 함 (이 폴더의 라이선스 파일 유지)
- ❌ 폰트 파일 **자체를 단독으로 판매** 금지
- ⚠️ **Reserved Font Name**: 폰트를 수정(서브셋·형식 변환 포함)해서 배포하면 예약된 이름을 쓸 수 없음
  - 예약 이름: Pretendard(및 Source, Inter, M PLUS 1), 마루 부리(네이버 소유)
  - 현재는 공식 배포 파일을 **수정 없이** 사용 중 → 문제 없음
  - 추후 용량 절감을 위해 직접 서브셋/변환을 할 경우 폰트 이름 변경 필요 여부를 다시 확인할 것

## 사용하지 않는 폰트

- 빛의 계승자체 (Regular·Bold OTF) — **라이선스 문제로 별운관에서 사용하지 않음.**
  2026-10-10 로컬 전용 보관 폴더로 이동 (Git·빌드·PWA 캐시 모두 제외, 원본 보존).

## 알려진 제약

- **Song Myung 은 현재 오프라인에서 표시되지 않음.** 공식 형식이 TTF 인데, PWA 미리 캐시 대상(`vite.config.ts` 의 `globPatterns`)에
  `ttf` 가 없기 때문. 최종 포인트 폰트로 송명을 선택하면 WOFF2 변환 또는 캐시 설정 변경 중 하나를 검토할 것
  (변환 시 Reserved Font Name 조건 재확인 — 송명은 예약 이름 없음).
