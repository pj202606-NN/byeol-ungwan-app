import type { CalendarDate } from '../../components/MonthCalendar.tsx';

export const moods = [
  { key: 'clear', label: '맑음', color: '#dfd5bb' },
  { key: 'excited', label: '설렘', color: '#80c6ff' },
  { key: 'calm', label: '잔잔함', color: '#416f95' },
  { key: 'tired', label: '지침', color: '#475e71' },
  { key: 'cloudy', label: '흐림', color: '#142a3d' },
] as const;
export type MoodKey = (typeof moods)[number]['key'];
export const recordsToday: CalendarDate = { year: 2026, month: 11, day: 20 };
export const RECORDS_TODAY = '2026-11-20';
export const selectionLegend = ['선택', '오늘'];
export const shortRecordPlaceholder = '오늘 하루를 한두 줄로 하늘에 남겨 보세요!';

export interface DayRecord { mood: MoodKey; note: string; fortune: string; example: boolean }
export type DayRecords = Record<string, DayRecord>;

/** 전시 체험용 과거 기록. 확정 운세 JSON은 변경하지 않는다. */
export const exhibitionRecords: DayRecords = {
  '2026-11-03': { mood: 'clear', note: '미뤄 두었던 일을 하나 끝냈다. 돌아오는 길의 하늘이 유난히 맑아서 마음도 가벼워졌다.', fortune: '차근차근 쌓아 온 노력이 작은 결실로 돌아옵니다. 끝낸 일을 돌아보며 스스로를 칭찬해 주세요.', example: true },
  '2026-11-05': { mood: 'excited', note: '오랜만에 친구와 약속을 잡았다. 달력에 적어 두니 기다릴 일이 생겨서 좋다.', fortune: '익숙한 사람과의 대화에서 새로운 즐거움을 찾습니다. 먼저 건네는 안부가 반가운 약속으로 이어질 수 있어요.', example: true },
  '2026-11-07': { mood: 'calm', note: '따뜻한 차를 마시면서 책을 읽었다. 특별한 일 없이도 충분히 괜찮은 하루였다.', fortune: '속도를 조금 늦추면 지나쳤던 편안함이 보입니다. 혼자 쉬는 시간을 충분히 누려도 좋겠습니다.', example: true },
  '2026-11-09': { mood: 'tired', note: '계획한 일이 많아서 조금 지쳤다. 남은 일은 내일로 넘기고 일찍 쉬기로 했다.', fortune: '해야 할 일의 순서를 다시 정리해 보세요. 모든 것을 한 번에 끝내기보다 한 가지를 덜어 내는 편이 도움이 됩니다.', example: true },
  '2026-11-11': { mood: 'clear', note: '막혀 있던 작업의 방향을 찾았다. 작은 진전이지만 끝까지 해 볼 용기가 났다.', fortune: '오래 붙잡고 있던 문제에 실마리가 생깁니다. 처음 떠오른 생각을 메모해 두면 다음 걸음이 한결 수월해져요.', example: true },
  '2026-11-13': { mood: 'cloudy', note: '별일 아닌 말에도 마음이 쓰였다. 산책하면서 생각을 정리하니 조금 나아졌다.', fortune: '마음이 복잡할 때는 대답을 서두르지 않아도 됩니다. 잠깐 거리를 두고 나면 자신의 생각을 더 차분히 전할 수 있어요.', example: true },
  '2026-11-15': { mood: 'excited', note: '준비한 결과물을 함께 살펴봤다. 서로 응원해 주는 말 덕분에 다시 힘이 났다.', fortune: '함께 준비하는 사람에게서 든든한 응원을 얻습니다. 잘된 부분을 나누면 남은 과정에도 활기가 더해집니다.', example: true },
  '2026-11-17': { mood: 'calm', note: '서두르지 않고 준비물을 하나씩 챙겼다. 체크 표시가 늘어날수록 마음이 편안해졌다.', fortune: '평소의 리듬을 지키는 것이 큰 힘이 됩니다. 익숙한 순서대로 준비하면 중요한 것도 빠짐없이 챙길 수 있어요.', example: true },
  '2026-11-18': { mood: 'excited', note: '마지막 준비를 마쳤다. 긴장되지만 내일 어떤 사람들을 만나게 될지 기대된다.', fortune: '새로운 시작을 앞두고 기대와 긴장이 함께 찾아옵니다. 충분히 준비한 자신을 믿고 첫걸음을 가볍게 내디뎌 보세요.', example: true },
  '2026-11-19': { mood: 'clear', note: '첫날을 무사히 마쳤다. 찾아와 준 사람들과 이야기를 나누며 준비한 시간이 보람 있게 느껴졌다.', fortune: '', example: false },
};
