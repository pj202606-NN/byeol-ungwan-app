export type LuckySymbolKind = 'color' | 'direction' | 'weekday' | 'planet';
const characters: Record<LuckySymbolKind, Record<string, string>> = {
  color: { 황색: '黃', 노랑: '黃', 청색: '靑', 파랑: '靑', 적색: '赤', 빨강: '赤', 백색: '白', 흰색: '白', 흑색: '黑', 검정: '黑', 녹색: '綠', 초록: '綠', 자색: '紫', 보라: '紫' },
  direction: { 중앙: '中', 동쪽: '東', 동: '東', 서쪽: '西', 서: '西', 남쪽: '南', 남: '南', 북쪽: '北', 북: '北', 북동: '北東', 북서: '北西', 남동: '南東', 남서: '南西' },
  weekday: { 일요일: '日', 월요일: '月', 화요일: '火', 수요일: '水', 목요일: '木', 금요일: '金', 토요일: '土' },
  planet: { 태양: '日', 달: '月', 수성: '水', 금성: '金', 지구: '地', 화성: '火', 목성: '木', 토성: '土', 천왕성: '天王', 해왕성: '海王' },
};
export function luckyHanja(kind: LuckySymbolKind, value?: string): string {
  return value ? characters[kind][value.trim()] ?? '—' : '—';
}
