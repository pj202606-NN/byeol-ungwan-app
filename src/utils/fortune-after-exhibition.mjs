/**
 * 별운관: 전시 종료 후 일일 운세 조회 모듈
 * 원본: byeolungwan_28su_fortunes_20261119_25_v6.json
 *
 * Modes:
 * - 'freeze': 2026-11-26부터 11/25의 검수된 원고 고정 (기본/권장)
 * - 'rotate': 7일치 검수 원고를 별자리별로 순환. 새 운세를 창작하지 않음.
 *
 * 원본 일일 운세/카테고리/초간략운세/조언을 한 날짜 단위로 함께 선택하여
 * 서로 다른 날의 문장을 임의로 뒤섞지 않습니다.
 */
export const EXHIBITION_START = '2026-11-19';
export const EXHIBITION_END = '2026-11-25';
export const CATEGORIES = ['종합', '인간관계', '학업·일', '금전·재물'];

function validISODate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new TypeError('날짜는 YYYY-MM-DD 문자열이어야 합니다.');
  }
  const t = Date.parse(value + 'T00:00:00.000Z');
  if (!Number.isFinite(t) || new Date(t).toISOString().slice(0, 10) !== value) {
    throw new RangeError('존재하지 않는 날짜입니다: ' + value);
  }
  return t;
}

function addDays(isoDate, days) {
  const t = validISODate(isoDate);
  return new Date(t + days * 86400000).toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  return Math.round((validISODate(b) - validISODate(a)) / 86400000);
}

/** 사용자 기기의 타임존과 무관하게 한국 날짜 획득 */
export function todayInKorea(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const field = (type) => parts.find((part) => part.type === type)?.value;
  return `${field('year')}-${field('month')}-${field('day')}`;
}

/**
 * @param {object} fortunes full v6 JSON
 * @param {number} starId 별자리 번호 1~28
 * @param {object} options
 * @param {string} [options.date] 한국 날짜 YYYY-MM-DD, 없으면 오늘
 * @param {'freeze'|'rotate'} [options.mode='freeze'] 전시 종료 후 표시 정책
 * @returns {null|object} 11/19 이전에는 null, 그 이후에는 4카테고리+요약+조언
 */
export function resolveDailyFortune(fortunes, starId, options = {}) {
  const date = options.date ?? todayInKorea();
  const mode = options.mode ?? 'freeze';
  validISODate(date);
  if (mode !== 'freeze' && mode !== 'rotate') throw new Error('지원하지 않는 mode: ' + mode);
  if (!Number.isInteger(starId) || starId < 1 || starId > 28) {
    throw new RangeError('별자리 번호는 1~28 정수여야 합니다.');
  }
  if (!fortunes || !Array.isArray(fortunes.today) || !Array.isArray(fortunes.compact_and_advice)) {
    throw new TypeError('올바른 전체 운세 v6 JSON을 제공해 주세요.');
  }
  if (date < EXHIBITION_START) return null;

  let sourceDate = date;
  let policy = 'original';
  if (date > EXHIBITION_END) {
    if (mode === 'freeze') {
      sourceDate = EXHIBITION_END;
      policy = 'frozen';
    } else {
      // 검수된 7일 중 하루의 4개 카테고리와 종합 요약을 통째로 선택합니다.
      // 별자리별 시작점을 달리하고 7일마다 순서를 옮겨 단순 날짜 일치 반복을 줄입니다.
      const elapsed = daysBetween(EXHIBITION_END, date) - 1; // 11/26 = 0
      const cycle = Math.floor(elapsed / 7);
      const withinWeek = elapsed % 7;
      const dayIndex = (withinWeek + cycle * 2 + (starId - 1) * 3) % 7;
      sourceDate = addDays(EXHIBITION_START, dayIndex);
      policy = 'rotated';
    }
  }

  const rows = fortunes.today.filter((row) => row['번호'] === starId && row['날짜'] === sourceDate);
  const byCategory = Object.fromEntries(rows.map((row) => [row['카테고리'], row]));
  if (CATEGORIES.some((category) => !byCategory[category])) {
    throw new Error(`${starId}번 ${sourceDate}: 일일 운세의 카테고리 데이터가 부족합니다.`);
  }
  const shortRow = fortunes.compact_and_advice.find((row) =>
    row['번호'] === starId && row['기간'] === '오늘' && row['날짜'] === sourceDate
  );
  if (!shortRow) throw new Error(`${starId}번 ${sourceDate}: 초간략 운세/조언이 없습니다.`);
  return {
    date,                  // 화면에 표시할 실제 날짜
    sourceDate,            // 실제 원고의 원본 날짜
    starId,
    starName: byCategory['종합']['별자리'],
    policy,                // original | frozen | rotated
    reused: policy !== 'original',
    categories: Object.fromEntries(CATEGORIES.map((category) => {
      const row = byCategory[category];
      return [category, {
        flow: row['운세 흐름'],
        brief: row['간략'],
        detail: row['상세'],
      }];
    })),
    compact: shortRow['초간략 종합운'],
    advice: shortRow['조언'],
  };
}
