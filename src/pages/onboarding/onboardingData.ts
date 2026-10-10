/**
 * 02 온보딩 5단계 — figma-reference/02_01 ~ 02_05_onboarding.png 문구 그대로
 * 그림(illustration)은 에셋 미제공 → 이미지가 오면 image 에 경로를 넣으면 됨
 */
export interface OnboardingStep {
  /** 시안의 그림 종류 (4·5단계는 시안에서 1단계 그림을 그대로 사용 — 자리 채움인지 확인 필요) */
  illustration: 'gate' | 'scroll' | 'clock';
  image?: string;
  lines: [string, string];
  button: string;
}

export const onboardingSteps: OnboardingStep[] = [
  { illustration: 'gate', lines: ['한국의 옛 별자리,', '28수를 별운관에서 함께 만나 볼까요?'], button: '다음으로' },
  { illustration: 'scroll', lines: ['나의 별자리를 찾고,', '그 안에 담긴 이야기를 알아보세요.'], button: '다음으로' },
  { illustration: 'clock', lines: ['오늘의 운세를 확인해 보세요!', '매일 원하는 시간에 알림도 받을 수 있어요.'], button: '다음으로' },
  { illustration: 'gate', lines: ['궁금한 상대의 별자리를 고른 후,', '두 사람의 궁합을 살펴보세요!'], button: '다음으로' },
  { illustration: 'gate', lines: ['운세를 본 뒤에는', '나만의 기록도 남겨 보세요!'], button: '운세 보러 가기' },
];

export const onboardingPath = (step: number) => `/onboarding/${step}`;
