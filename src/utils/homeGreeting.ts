/** Device-local hours: dawn 00–05, morning 06–10, lunch 11–13,
 * afternoon 14–17, evening 18–20, night 21–23. */
export function homeGreeting(now: Date): string {
  const hour = now.getHours();
  return `좋은 ${hour < 6 ? '새벽' : hour < 11 ? '아침' : hour < 14 ? '점심' : hour < 18 ? '오후' : hour < 21 ? '저녁' : '밤'}입니다.`;
}

export function homeMessages(name: string | undefined, now = new Date()): string[] {
  return [`${now.getMonth() + 1}월 ${now.getDate()}일`, name?.trim() ? `${name.trim()}님의 하늘` : '당신의 하늘', homeGreeting(now)];
}
