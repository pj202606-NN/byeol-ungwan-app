import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom' });
after(() => server.close());
const records = await server.ssrLoadModule('/src/services/records.ts');
const fortunes = await server.ssrLoadModule('/src/services/fortunes.ts');
const sky = await server.ssrLoadModule('/src/services/observation.ts');

test('11월 예시 10일은 기분·메모가 있고, 3일은 맑음이며 19일은 사용자 확정 운세다', () => {
  const rows = records.readRecords('test', 21, { getItem: () => null });
  assert.equal(Object.keys(rows).length, 10);
  assert.equal(rows['2026-11-03'].mood, 'clear');
  assert.ok(Object.values(rows).every(row => row.note && row.fortune));
  assert.equal(rows['2026-11-03'].example, true);
  assert.equal(rows['2026-11-19'].example, false);
  assert.equal(rows['2026-11-19'].fortune, fortunes.getDailyFortune(21, '2026-11-19').compact);
});

test('28수 모두 기록의 11월 20일 운세가 홈 초간략과 일치한다', () => {
  for (let id = 1; id <= 28; id++) {
    assert.deepEqual(records.recordFortune(id, '2026-11-20'), { text: fortunes.getDailyFortune(id, '2026-11-20').compact, example: false });
  }
});

test('기분·메모·당일 운세를 저장한 뒤 복원하고 사용자별 저장 키를 분리한다', () => {
  const entries = new Map();
  const storage = { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) };
  const key = records.recordStorageKey('관람객', '2000-12-18');
  const rows = records.readRecords(key, 21, storage);
  rows['2026-11-20'] = { mood: 'calm', note: '전시를 보고 편안해졌다.', fortune: '저장한 운세 원문', example: false };
  assert.equal(records.saveRecords(key, rows, storage), true);
  assert.deepEqual(records.readRecords(key, 21, storage)['2026-11-20'], { ...rows['2026-11-20'], fortune: fortunes.getDailyFortune(21, '2026-11-20').compact });
  assert.equal(records.readRecords(records.recordStorageKey('다른 관람객', '2000-12-18'), 21, storage)['2026-11-20'], undefined);
  assert.equal(records.saveRecords(key, rows, { setItem: () => { throw Error('blocked'); } }), false);
  assert.equal(Object.keys(records.readRecords(key, 21, { getItem: () => '{bad' })).length, 10);
});

test('수거성 28개는 고유 HIP이며 각·삼·류수의 실제 대표별과 전시장 위치를 사용한다', () => {
  assert.equal(sky.mansionStars.length, 28);
  assert.equal(new Set(sky.mansionStars.map(s => s.hip)).size, 28);
  assert.equal(sky.mansionStars[0].hip, 65474);
  assert.equal(sky.mansionStars[20].hip, 26727);
  assert.equal(sky.mansionStars[23].hip, 42313);
  assert.equal(sky.exhibitionObserver.name, '청주 동부창고');
  assert.ok(Math.abs(sky.exhibitionObserver.latitude - 36.655) < .001);
});

test('지평좌표의 남중·동쪽·서쪽 방향과 세차 기준일이 일치한다', () => {
  const epoch = new Date('2000-01-01T12:00:00Z');
  const south = sky.horizontalPosition(280.46061837, 0, epoch, 45, 0);
  assert.ok(Math.abs(south.azimuth - 180) < 1e-8);
  assert.ok(Math.abs(south.altitude - 45) < 1e-8);
  const east = sky.horizontalPosition((280.46061837 + 90) % 360, 0, epoch, 45, 0);
  const west = sky.horizontalPosition(280.46061837 - 90, 0, epoch, 45, 0);
  assert.ok(Math.abs(east.azimuth - 90) < 1e-8);
  assert.ok(Math.abs(west.azimuth - 270) < 1e-8);
  const original = sky.precessJ2000(201.298247, -11.161319, epoch);
  assert.ok(Math.abs(original.ra - 201.298247) < 1e-8);
  assert.ok(Math.abs(original.dec + 11.161319) < 1e-8);
});

test('28수 관측값·지도는 실제 시각에 따라 변하고 한국 날짜로 표기된다', () => {
  for (let id = 1; id <= 28; id++) {
    const a = sky.getObservation(id, new Date('2026-11-19T15:00:00Z'));
    const b = sky.getObservation(id, new Date('2026-11-19T16:00:00Z'));
    assert.ok(a.azimuth >= 0 && a.azimuth < 360 && a.altitude >= -90 && a.altitude <= 90);
    assert.ok(a.track.flat().every(Number.isFinite));
    assert.notDeepEqual(a.point, b.point);
    assert.match(a.datetime, /2026\. 11\. 20\./);
  }
  assert.throws(() => sky.getObservation(0, new Date()), RangeError);
});
