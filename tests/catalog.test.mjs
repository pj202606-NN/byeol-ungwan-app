import assert from 'node:assert/strict';
import fs from 'node:fs';
import { after, test } from 'node:test';
import { createServer } from 'vite';
import { MANSIONS, getMansionByDate } from '../public/data/28su_database_final_updated_20261119.js';
const load = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url), 'utf8'));
const catalog = load('../src/data/constellations/catalog.json');
const dashboard = load('../src/data/constellations/dashboard.snapshot.json');
const descriptions = load('../public/data/byeolungwan_28su_descriptions_v3.json');
const detailCopy = load('../src/data/constellations/detailCopy.json');
const keyring = load('../public/data/byeolungwan_28su_keyring_descriptions.json');
const birth = load('../public/data/byeolungwan_28su_birthdate_reference.json');
const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom' });
after(() => server.close());
const service = await server.ssrLoadModule('/src/services/birthConstellation.ts');
const dictionary = await server.ssrLoadModule('/src/pages/dictionary/dictionaryData.ts');
const info = await server.ssrLoadModule('/src/services/observationInformation.ts');

test('28개 고유 ID·한자·사신·동물·생일과 네 방위 7수를 원본에 연결한다', () => {
  assert.equal(catalog.length, 28);
  assert.equal(new Set(catalog.map(s => s.id)).size, 28);
  for (const s of catalog) {
    const original = MANSIONS.find(r => r.id === s.starId);
    assert.equal(s.name, original.수이름);
    assert.equal(s.alias, original.별자리명);
    assert.equal(s.animal, original.상징동물);
    assert.equal(s.sashin, original.사신);
    assert.equal(s.period, birth.mansions.find(r => r.id === s.starId).date_range);
    assert.ok(original.수.includes(s.hanja[0]));
    assert.equal(s.traditionalDegrees, original.도수);
  }
  for (const direction of ['east', 'north', 'west', 'south']) assert.equal(dictionary.constellationsOf(direction).length, 7);
  assert.equal(Object.keys(dictionary.constellationDetails).length, 28);
});

test('류수·루수·두 위수는 올바른 한자·동물·기존 에셋 ID로 연결한다', () => {
  for (const [id, name, hanja, alias, direction] of [['yu', '류수', '柳宿', '노루자리', 'south'], ['nu', '루수', '婁宿', '개자리', 'west'], ['wi-north', '위수', '危宿', '제비자리', 'north'], ['wi-west', '위수', '胃宿', '꿩자리', 'west']]) {
    const s = catalog.find(r => r.id === id);
    assert.deepEqual([s.name, s.hanja, s.alias, s.direction], [name, hanja, alias, direction]);
    assert.ok(!/누수|유수/.test(s.description));
    assert.ok(!/누수|유수/.test(s.resultIntroduction));
  }
  assert.equal(catalog.find(r => r.id === 'yu').graphicKey, 'ryu');
  assert.equal(catalog.find(r => r.id === 'nu').graphicKey, 'nu');
  assert.equal(catalog.find(r => r.id === 'yeo').keyringId, 'nyeo');
});

test('소개는 원문을 보존하고 24번 柳宿의 확정 명칭만 표시 어댑터에서 교정한다', () => {
  for (const s of catalog) {
    const original = descriptions.find(r => r.번호 === s.starId);
    assert.equal(s.description, s.starId === 24 ? original.사전_소개.replaceAll('유수', '류수') : original.사전_소개);
    assert.equal(dictionary.findConstellation(s.id).description, s.description);
    assert.deepEqual(dictionary.constellationDetails[s.id].sections.find(section => section.key === 'description').paragraphs, [[detailCopy.entries[s.id].sections.description]]);
  }
});

test('대시보드 관측 등급·월·설명은 정확히 전사하고 천문 등급·적경·적위는 null이다', () => {
  for (const s of catalog) {
    const row = info.getObservationInformation(s.starId);
    const dash = dashboard.rows.find(r => r.starId === s.starId);
    assert.equal(row.representativeStar, MANSIONS.find(r => r.id === s.starId).거성);
    assert.equal(row.representativeStar, dash.representativeStar);
    assert.equal(row.dashboardMagnitude, dash.displayedMagnitude);
    assert.equal(row.recommendedMonth, dash.recommendedMonth);
    assert.equal(row.observationDescription, dash.observationDescription);
    assert.equal(row.apparentMagnitude, null);
    assert.equal(row.rightAscension, null);
    assert.equal(row.declination, null);
    assert.equal(row.verificationStatus.dashboardMagnitude, 'dashboard-transcribed-definition-unverified');
    assert.equal(row.dataSource.dashboardMagnitude, dashboard.source);
    const raw = keyring.stars.find(r => r.번호 === s.starId).문단.at(-1);
    assert.equal(row.keyringObservationDescription, raw);
    assert.ok(raw.includes(row.observationSeason));
    assert.ok(raw.includes(row.westernConstellation));
  }
  assert.throws(() => info.getObservationInformation(29), RangeError);
});

test('5개 연도의 모든 양력 날짜가 확정 JS·생일 JSON과 동일하게 판정된다', () => {
  for (const year of [2000, 2025, 2026, 2028, 2100]) {
    for (let date = new Date(Date.UTC(year, 0, 1)); date.getUTCFullYear() === year; date.setUTCDate(date.getUTCDate() + 1)) {
      assert.equal(service.resolveBirthConstellation(date.toISOString().slice(0, 10)).starId, getMansionByDate(date.getUTCMonth() + 1, date.getUTCDate(), year).id);
    }
  }
});
