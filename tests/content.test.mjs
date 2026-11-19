import assert from 'node:assert/strict';
import fs from 'node:fs';
import { after, test } from 'node:test';
import { createServer } from 'vite';
const load = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url), 'utf8'));
const catalog = load('../src/data/constellations/catalog.json');
const copy = load('../src/data/constellations/detailCopy.json');
const guardians = load('../src/data/constellations/guardianCopy.json');
const source = load('../src/data/fortunes/byeolungwan_fortunes_2026-11-20_24.json');
const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom' });
after(() => server.close());
const dictionary = await server.ssrLoadModule('/src/pages/dictionary/dictionaryData.ts');
const guide = await server.ssrLoadModule('/src/services/explorationGuide.ts');

test('28수 네 설명은 각각 120~160자의 한 문단으로 기존 ID에 연결된다', () => {
  assert.equal(Object.keys(copy.entries).length, 28);
  for (const s of catalog) {
    const row = copy.entries[s.id];
    assert.deepEqual([row.starId, row.name, row.hanja, row.alias], [s.starId, s.name, s.hanja, s.alias]);
    assert.deepEqual(Object.keys(row.sections), ['description', 'personality', 'tradition', 'folklore']);
    for (const [key, text] of Object.entries(row.sections)) {
      assert.ok([...text].length >= 120 && [...text].length <= 160, `${s.id}/${key}`);
      assert.ok(!/\r|\n|<br/.test(text));
      assert.ok(!/누수|유수|준비 중|계산 대기/.test(text));
      assert.deepEqual(dictionary.constellationDetails[s.id].sections.find(section => section.key === key).paragraphs, [[text]]);
    }
    assert.ok(row.sections.personality.startsWith('별운관은'));
  }
});

test('공식 웹사이트 사신수 소개와 확정 방위·계절·색을 사용한다', () => {
  assert.equal(guardians.source, 'https://www.dmd2026.com/byeol-ungwan/');
  for (const [id, meta] of [['east', ['봄', '동쪽', '청색']], ['north', ['겨울', '북쪽', '흑색']], ['west', ['가을', '서쪽', '백색']], ['south', ['여름', '남쪽', '적색']]]) {
    assert.deepEqual(guardians.entries[id].meta.slice(0, 3), meta);
    assert.equal(dictionary.directionDetails[id].intro.join(' '), guardians.entries[id].shortIntro);
    assert.equal(dictionary.directionDetails[id].intro.length, 2);
    assert.equal(guardians.entries[id].shortIntro.split('.').filter(s => s.trim()).length, 2);
    assert.ok(guardians.entries[id].shortIntro.length < guardians.entries[id].intro.length);
    assert.ok(guardians.entries[id].intro.length <= 130);
  }
});

test('탐색 위치는 기존 시안 예시로 구분하고 28수별 안내값을 연결한다', () => {
  for (const s of catalog) {
    const row = guide.getExplorationGuide(s.starId);
    assert.equal(row.position.kind, 'example');
    assert.deepEqual([row.position.azimuth, row.position.altitude, row.position.point], ['243°', '31°', [113, 290]]);
    assert.equal(row.magnitude.kind, 'static');
    assert.equal(row.magnitude.value, `${s.observation.dashboardMagnitude}등급`);
    assert.equal(row.timing.value, s.observation.recommendedMonth);
    assert.equal(row.recommendedLocation.kind, 'example');
    assert.ok(row.area.value.includes(s.observation.representativeStar));
    assert.ok(!/준비 중|확인 중/.test(row.area.value));
  }
});

test('일별·월간·연간·분석 원본을 편집 문구로 덮어쓰지 않는다', () => {
  assert.deepEqual(source, load('../public/data/byeolungwan_fortunes_2026-11-20_24.json'));
  for (const id of ['yu', 'nu', 'wi-north', 'wi-west']) assert.equal(copy.entries[id].hanja, catalog.find(s => s.id === id).hanja);
});
