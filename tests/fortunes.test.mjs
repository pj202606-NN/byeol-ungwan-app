import assert from 'node:assert/strict';
import fs from 'node:fs';
import { after, test } from 'node:test';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom' });
after(() => server.close());
const service = await server.ssrLoadModule('/src/services/fortunes.ts');
const dates = await server.ssrLoadModule('/src/services/fortuneDates.ts');
const greeting = await server.ssrLoadModule('/src/utils/homeGreeting.ts');
const symbols = await server.ssrLoadModule('/src/pages/fortune/luckySymbols.ts');
const { resolveBirthConstellation, birthConstellations } = await server.ssrLoadModule('/src/services/birthConstellation.ts');
const source = fs.readFileSync(new URL('../public/data/byeolungwan_fortunes_2026-11-20_24.json', import.meta.url), 'utf8');
const original = JSON.parse(source);
const keys = ['각수', '항수', '저수', '방수', '심수', '미수', '기수', '두수', '우수', '여수', '허수', '위수(危)', '실수', '벽수', '규수', '루수', '위수(胃)', '묘수', '필수', '자수', '삼수', '정수', '귀수', '류수', '성수', '장수', '익수', '진수'];
const categories = [['total', '종합', '종합'], ['relation', '인간관계', '관계'], ['work', '학업 · 일', '학업·일'], ['money', '금전 · 재물', '금전']];

test('28수의 행운 상징은 별자리별 원본을 사용하고 모든 한자를 표시한다', () => {
  const catalog = JSON.parse(fs.readFileSync(new URL('../src/data/constellations/catalog.json', import.meta.url), 'utf8'));
  for (const star of catalog) {
    const lucky = symbols.getLuckySymbols(star.id);
    assert.deepEqual(lucky.map(({ label, value }) => ({ label, value })), star.luckySymbols);
    assert.deepEqual(lucky.map(symbol => symbol.kind), ['color', 'direction', 'weekday', 'planet']);
    assert.ok(lucky.every(symbol => symbols.luckyHanja(symbol.kind, symbol.value) !== '—'), star.id);
  }
  assert.deepEqual(symbols.getLuckySymbols('unknown'), []);
});

test('원고를 수정 없이 요청 경로에 복사하고 28수와 두 위수를 고유 ID에 연결한다', () => {
  assert.equal(fs.readFileSync(new URL('../src/data/fortunes/byeolungwan_fortunes_2026-11-20_24.json', import.meta.url), 'utf8'), source);
  assert.deepEqual(Object.keys(original.constellations), keys);
  assert.deepEqual(service.fortuneStarKeys, keys);
  for (let id = 1; id <= 28; id++) {
    assert.ok(original.constellations[keys[id - 1]].hanja.includes(birthConstellations[id - 1].hanja[0]));
    assert.equal(original.constellations[keys[id - 1]].name, birthConstellations[id - 1].alias);
  }
  assert.equal(resolveBirthConstellation('2000-12-18').starId, 21);
  assert.equal(birthConstellations[11].id, 'wi-north');
  assert.equal(birthConstellations[16].id, 'wi-west');
});

test('28수 × 5일의 초간략·간략·상세·조언·상태를 원문과 대조하고 네 카테고리만 표시한다', () => {
  assert.deepEqual(service.fortuneCategories.map(c => [c.key, c.label, c.source]), categories);
  for (let id = 1; id <= 28; id++) {
    const star = original.constellations[keys[id - 1]];
    assert.equal(Object.keys(star.daily).length, 5);
    for (let day = 20; day <= 24; day++) {
      const date = `2026-11-${day}`;
      const row = star.daily[date];
      const daily = service.getDailyFortune(id, date);
      const content = service.getFortuneContent(id, date, 'today');
      assert.equal(daily.sourceDate, date);
      assert.equal(daily.compact, row.종합.ultraShort);
      assert.equal(content.summary, row.종합.short);
      assert.equal(content.advice, row.종합.advice);
      assert.equal(content.sections.length, 4);
      for (const [key, label, sourceKey] of categories) {
        assert.deepEqual(content.sections.find(s => s.key === key), { key, label, body: row[sourceKey].detail });
        assert.deepEqual(daily.categories[sourceKey], { brief: row[sourceKey].short, detail: row[sourceKey].detail, flow: row[sourceKey].fortune });
      }
    }
  }
});

test('한국 자정 경계와 JSON first/last 정책에 따라 20일 이전·24일 이후 원고를 선택한다', () => {
  assert.equal(original.timezone, 'Asia/Seoul');
  assert.equal(original.beforeStart, 'first');
  assert.equal(original.afterEnd, 'last');
  assert.equal(service.EXHIBITION_START, '2026-11-20');
  assert.equal(service.EXHIBITION_END, '2026-11-24');
  assert.equal(service.getFortuneToday(new Date('2026-11-10T00:00Z')), '2026-11-20');
  assert.equal(service.getFortuneToday(new Date('2026-11-20T14:59:59.999Z')), '2026-11-20');
  assert.equal(service.getFortuneToday(new Date('2026-11-20T15:00Z')), '2026-11-21');
  assert.equal(service.getFortuneToday(new Date('2026-11-25T00:00Z')), '2026-11-25');
  for (let id = 1; id <= 28; id++) {
    for (const [date, selected] of [['2025-01-01', '2026-11-20'], ['2026-11-19', '2026-11-20'], ['2026-11-25', '2026-11-24'], ['2027-01-01', '2026-11-24']]) {
      const actual = service.getDailyFortune(id, date);
      const expected = service.getDailyFortune(id, selected);
      assert.equal(actual.sourceDate, selected);
      assert.equal(actual.compact, expected.compact);
      assert.equal(actual.advice, expected.advice);
      assert.deepEqual(actual.categories, expected.categories);
    }
  }
  for (const invalid of ['2026-02-30', 'garbage', '2026-1-01']) assert.throws(() => dates.selectFortuneSourceDate(invalid, service.EXHIBITION_START, service.EXHIBITION_END), RangeError);
});

test('28수의 월간·연간 네 항목과 분석의 제목·문구·순서를 원문 그대로 적용한다', () => {
  for (let id = 1; id <= 28; id++) {
    const star = original.constellations[keys[id - 1]];
    for (const [period, field] of [['month', 'monthly'], ['year', 'yearly']]) {
      const content = service.getFortuneContent(id, '2026-11-20', period);
      assert.equal(content.summary, star[field].종합.short);
      assert.equal(content.advice, star[field].종합.advice);
      assert.deepEqual(content.sections, categories.map(([key, label, sourceKey]) => ({ key, label, body: star[field][sourceKey].detail })));
    }
    const analysis = service.getFortuneContent(id, '2026-11-20', 'analysis');
    assert.equal(analysis.summary, star.analysis['간략 총평']);
    assert.deepEqual(analysis.sections.map(s => [s.label, s.body]), Object.entries(star.analysis).filter(([label]) => label !== '간략 총평'));
  }
});

test('방위별 7수 순위는 새 원고의 종합 상태·나머지 상태 합·번호 순서를 따른다', () => {
  const score = { 길: 2, 보통: 1, 주의: 0 };
  for (let day = 20; day <= 24; day++) {
    for (const direction of service.rankingDirections) {
      const expected = birthConstellations.filter(s => s.direction === direction.id).map(s => {
        const row = original.constellations[keys[s.starId - 1]].daily[`2026-11-${day}`];
        return { id: s.starId, primary: score[row.종합.fortune], secondary: ['관계', '학업·일', '금전'].reduce((sum, k) => sum + score[row[k].fortune], 0) };
      }).sort((a, b) => b.primary - a.primary || b.secondary - a.secondary || a.id - b.id);
      assert.deepEqual(service.getDirectionRanking(direction.id, `2026-11-${day}`).map(s => s.starId), expected.map(s => s.id));
    }
  }
});

test('잘못된 별자리 ID에 다른 원고를 대신 표시하지 않는다', () => {
  for (const id of [0, -1, 29, 1.5, NaN]) assert.throws(() => service.getDailyFortune(id, '2026-11-20'), RangeError);
});

test('기기 시간대의 여섯 인사 경계와 닉네임·기본값·실제 날짜를 표시한다', () => {
  for (const [hour, phrase] of [[0, '새벽'], [5, '새벽'], [6, '아침'], [10, '아침'], [11, '점심'], [13, '점심'], [14, '오후'], [17, '오후'], [18, '저녁'], [20, '저녁'], [21, '밤'], [23, '밤']]) {
    const now = new Date(2026, 10, 19, hour);
    assert.equal(greeting.homeGreeting(now), `좋은 ${phrase}입니다.`);
  }
  assert.deepEqual(greeting.homeMessages('너구', new Date(2026, 10, 19, 23)), ['11월 19일', '너구님의 하늘', '좋은 밤입니다.']);
  assert.equal(greeting.homeMessages(undefined, new Date(2026, 10, 20))[1], '당신의 하늘');
});

test('행운 배지는 항목별 한자를 매핑하고 없는 값은 자리표시자를 사용한다', () => {
  for (const [kind, value, character] of [['color', '청색', '靑'], ['direction', '중앙', '中'], ['direction', '동쪽', '東'], ['weekday', '화요일', '火'], ['planet', '토성', '土']]) assert.equal(symbols.luckyHanja(kind, value), character);
  assert.equal(symbols.luckyHanja('planet'), '—');
  assert.equal(symbols.luckyHanja('color', '알 수 없음'), '—');
});
