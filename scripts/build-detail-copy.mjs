import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
const catalog = JSON.parse(await readFile('src/data/constellations/catalog.json', 'utf8'));
const editorial = JSON.parse(await readFile('src/data/constellations/detailEditorial.json', 'utf8'));
const entries = {};
const counts = [];
const review = ['# 28수 상세 문구 검토본', '', '원문은 보존하고 앱의 네 설명 섹션에 적용한 편집본입니다. 성격은 별운관의 현대적 해석이며, 전통과 문화 소개는 제공 자료를 바탕으로 정리했습니다.', ''];
const titles = { description: '설명', personality: '성격과 특징', tradition: '전통적 의미', folklore: '설화 · 역사 속의 상징동물' };
for (const star of catalog) {
  const edits = editorial.entries[star.id];
  assert.ok(edits, `Missing copy ${star.id}`);
  const sections = { description: edits.description ?? star.description, personality: edits.personality, tradition: edits.tradition, folklore: edits.folklore };
  for (const [key, text] of Object.entries(sections)) {
    assert.equal(typeof text, 'string');
    assert.ok(text.length >= 120 && text.length <= 160, `${star.id} ${key}: ${text.length}`);
    assert.ok(!text.includes('\n'), `${star.id} ${key} must be one paragraph`);
  }
  entries[star.id] = { starId: star.starId, name: star.name, hanja: star.hanja, alias: star.alias, sections };
  counts.push(`| ${star.starId} / ${star.id} | ${star.name} ${star.hanja} | ${Object.values(sections).map(text => [...text].length).join(' | ')} |`);
  review.push(`## ${star.starId}. ${star.name}(${star.hanja}) · ${star.alias}`, '', `고유 ID: ${star.id}`, '');
  for (const [key, text] of Object.entries(sections)) review.push(`### ${titles[key]} · ${[...text].length}자`, '', text, '');
}
assert.equal(Object.keys(entries).length, 28);
await writeFile('src/data/constellations/detailCopy.json', JSON.stringify({ version: editorial.version,
  sources: { description: editorial.descriptionSource, personality: editorial.personalitySource,
    traditional: editorial.traditionalSources, supporting: editorial.supportingSource }, entries }, null, 2) + '\n');
await writeFile('reports/28su-detail-copy-lengths.md', [
  '# 28수 상세 문구 글자 수', '',
  '공백·문장부호를 포함한 Unicode 글자 수입니다. 원문 자료는 보존하고 별도 편집본을 사용합니다.', '',
  '| 번호 / ID | 명칭 | 설명 | 성격과 특징 | 전통적 의미 | 설화·문화 |',
  '|---|---|---:|---:|---:|---:|', ...counts, '',
  '28수 × 4개 섹션 모두 120~160자 범위입니다. 원문 JSON과 최신 운세·분석 문장은 덮어쓰지 않습니다.',
].join('\n') + '\n');
await writeFile('reports/28su-detail-copy-review.md', review.join('\n') + '\n');
console.log(`Built 28 × 4 editorial paragraphs; original descriptions and fortune JSONs preserved.`);
