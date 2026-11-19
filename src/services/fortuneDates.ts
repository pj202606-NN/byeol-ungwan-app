/** Date selection is separate from the JSON-to-UI adapter. */
export function koreanDate(now = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(now);
}

export function selectFortuneSourceDate(date: string, start: string, end: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new RangeError('운세 날짜를 확인해 주세요.');
  }
  return date < start ? start : date > end ? end : date;
}
