/**
 * 마이 화면 데이터 — ⚠️ 디자인 시안(09_my-page.png)의 예시 값
 * 회원가입(03)·계정 저장 방식이 정해지면 exampleUser 대신 실제 사용자 정보를 넘겨주면 됨
 * (화면은 UserProfile 형식만 알면 되도록 분리)
 */
import type { IconName } from '../../components/Icon.tsx';
import type { StarPoint } from '../../components/ConstellationFigure.tsx';
import { todayHero, todayFortune } from '../home/homeData.ts';

/* ── 사용자 정보 (회원가입 03 과 같은 항목) ───────────────────────────── */

export interface UserProfile {
  /** 이름 (필수) */
  name: string;
  /** 생년월일 (필수) — YYYY-MM-DD */
  birthDate: string;
  /**
   * 출생 시각 (선택) — 시안은 시진('자시')으로 표시
   * 회원가입에서 입력하지 않았으면 비어 있음 → 마이 > 계정 설정에서 추가 (⏳ 추후 구현)
   */
  birthTime?: string;
}

/** ⚠️ 예시 사용자 — 실제 계정 데이터 아님 */
export const exampleUser: UserProfile = {
  name: '주예진',
  birthDate: '2004-05-03',
  birthTime: '자시',
};

/** '2004. 05. 03' */
export const formatBirthDate = (iso: string) => iso.split('-').join('. ');

/** 프로필 왼쪽 작은 별자리 — 홈 todayHero 좌표를 0.2423 배로 줄여 화면 좌표(x 32~72, y 91~129)로 옮김 */
const scale = 0.2423;
export const profileFigure = {
  stars: todayHero.stars.map((s): StarPoint => ({
    x: 32 + (s.x - 115.5) * scale,
    y: 92.5 + (s.y - 242) * scale,
    r: s.glow ? 1.6 : 1.1,
  })),
  lines: todayHero.lines,
};

/** 오늘의 운세 한 줄 — 홈 '오늘은,' 문장과 같은 값 */
export const todayFortuneLines = todayFortune.lines;

/* ── 메뉴 ──────────────────────────────────────────────────────────────── */

export interface MyMenuItem {
  label: string;
  icon: IconName;
  to: string;
}

export const myMenuSections: { title: string; items: MyMenuItem[] }[] = [
  {
    title: '별자리',
    items: [
      { label: '오늘의 순위', icon: 'ranking', to: '/constellations/ranking' },
      { label: '오늘의 궁합', icon: 'compatibility', to: '/constellations/compatibility' },
      { label: '별자리 탐색', icon: 'explore', to: '/constellations/explore' },
      { label: '별자리 사전', icon: 'dictionary', to: '/constellations/dictionary' },
    ],
  },
  {
    title: '운세',
    items: [
      // 시안은 별 모양 아이콘 — 별 아이콘 에셋이 없어 앱의 '운세' 아이콘 사용
      { label: '오늘의 운세', icon: 'fortune', to: '/fortune' },
      { label: '운세 기록', icon: 'record', to: '/records' },
    ],
  },
];

/* ── 설정 (⏳ 모두 표시만 — 동작·저장 미확정) ──────────────────────────── */

export const settings = {
  theme: { title: '화면 모드', desc: '밝은 종이빛과 깊은 밤하늘 중 선택', options: ['라이트', '다크'], current: '다크' },
  notification: { title: '알림 설정', desc: '매일 아침 7시, 오늘의 운세 알림', on: true },
  links: ['공지사항', '약관'],
  reset: {
    title: '처음부터 다시 시작하기',
    desc: '이름, 생년월일, 태어난 시간과 저장된 운세 기록이 모두 삭제됩니다.',
    button: '재설정',
  },
};
