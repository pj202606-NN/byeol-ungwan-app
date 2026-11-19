import assert from 'node:assert/strict';
import fs from 'node:fs';
import { after, test } from 'node:test';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom' });
after(() => server.close());
const service = await server.ssrLoadModule('/src/services/compatibility.ts');
const { selectorGroups } = await server.ssrLoadModule('/src/pages/compatibility/compatibilityData.ts');
const original = JSON.parse(fs.readFileSync(new URL('../public/data/byeolungwan_28su_compatibility_v2.json', import.meta.url), 'utf8'));

test('378쌍은 선택 순서와 무관하게 확정 관계·점수·문구를 그대로 사용한다', () => {
  for (const pair of original.pairs) {
    for (const [a, b] of [[pair.id_a, pair.id_b], [pair.id_b, pair.id_a]]) {
      const result = service.getCompatibility(a, b);
      assert.equal(result.me.starId, a);
      assert.equal(result.partner.starId, b);
      assert.equal(result.relation, pair.relation);
      assert.equal(result.score, pair.score);
      assert.equal(result.title, pair.title);
      assert.deepEqual(result.sections.map((section) => section.key), ['detail', 'advice', 'sky']);
      assert.equal(result.sections[0].body, pair.description);
      assert.equal(result.sections[1].body, pair.advice);
      assert.ok(result.sections[2].body.includes(result.me.name));
      assert.ok(result.sections[2].body.includes(result.partner.name));
    }
  }
});

test('동일 별자리 28개도 별도 확정 원고와 점수를 사용한다', () => {
  for (const source of original.same_constellation) {
    const result = service.getCompatibility(source.star_id, source.star_id);
    assert.equal(result.relation, '무난');
    assert.equal(result.score, source.score);
    assert.equal(result.title, source.title);
    assert.equal(result.sections[0].body, source.description);
    assert.equal(result.sections[1].body, source.advice);
    assert.ok(result.sections[2].body.includes('하나의 별자리'));
  }
});

test('legacy 관계와 현재 관계가 다를 때 현재 relation을 선택한다', () => {
  const result = service.getCompatibility(2, 3);
  assert.equal(result.relation, '보완');
  assert.equal(result.score, 88);
});

test('홈 추천 112건은 원본 파트너·관계·순위·점수·문구와 일치한다', () => {
  for (let id = 1; id <= 28; id++) {
    const featured = service.getFeaturedCompatibility(id);
    const rows = original.featured.filter((row) => row.star_id === id);
    assert.equal(featured.length, 4);
    featured.forEach((result, index) => {
      const row = rows[index];
      assert.equal(result.partner.starId, row.partner_id);
      assert.equal(result.partner.alias, row.partner);
      assert.equal(result.type, row.type);
      assert.equal(result.rank, row.rank);
      assert.equal(result.score, row.score);
      assert.equal(result.cardText, row.card_text);
      assert.equal(result.score, service.getCompatibility(id, row.partner_id).score);
    });
  }
});

test('선택 목록은 28개 고유 숫자 ID이며 위수 두 개를 구분한다', () => {
  const list = selectorGroups.flatMap((group) => group.items);
  assert.equal(new Set(list.map((star) => star.starId)).size, 28);
  assert.deepEqual(list.filter((star) => star.name === '위수').map((star) => [star.starId, star.hanja]), [[12, '危宿'], [17, '胃宿']]);
  assert.equal(selectorGroups.find((group) => group.key === 'west').items.find((star) => star.starId === 16).name, '루수');
});

test('하늘 위치는 같은 사신·다른 사신·동일 별자리를 구분하고 실제 방위를 사용한다', () => {
  assert.ok(service.getCompatibilitySky(3, 2).includes('청룡이 지키는 일곱 별자리'));
  assert.ok(service.getCompatibilitySky(3, 21).includes('동쪽(東) 봄'));
  assert.ok(service.getCompatibilitySky(3, 21).includes('서쪽(西) 가을'));
  assert.ok(service.getCompatibilitySky(12, 17).includes('북쪽(北) 겨울'));
  assert.ok(service.getCompatibilitySky(12, 17).includes('서쪽(西) 가을'));
  assert.ok(service.getCompatibilitySky(22, 22).includes('남쪽(南) 여름'));
  assert.ok(service.getCompatibilitySky(12, 12).includes('현무가 지키는'));
  assert.ok(service.getCompatibilitySky(21, 2).includes('백호와 청룡'));
});

test('잘못된 ID는 다른 별자리 결과로 대체하지 않는다', () => {
  for (const invalid of [0, 29, 1.5, '3', null]) {
    assert.throws(() => service.getCompatibility(invalid, 1), RangeError);
    assert.throws(() => service.getCompatibility(1, invalid), RangeError);
  }
});
