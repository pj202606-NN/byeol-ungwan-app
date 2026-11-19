import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { MANSIONS, CHILYO, SASHIN } from '../public/data/28su_database_final_updated_20261119.js';
const read = async path => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const birth = await read('../public/data/byeolungwan_28su_birthdate_reference.json');
const descriptions = await read('../public/data/byeolungwan_28su_descriptions_v3.json');
const keyring = await read('../public/data/byeolungwan_28su_keyring_descriptions.json');
const legacy = await read('../public/data/byeolungwan_28su_fortunes_20261119_25_v6.json');
const fortunes = await read('../src/data/fortunes/byeolungwan_fortunes_2026-11-20_24.json');
const dashboard = await read('../src/data/constellations/dashboard.snapshot.json');
const ids = ['gak', 'hang', 'jeo', 'bang', 'sim', 'mi', 'gi', 'du', 'u', 'yeo', 'heo', 'wi-north', 'sil', 'byeok', 'gyu', 'nu', 'wi-west', 'myo', 'pil', 'ja', 'sam', 'jeong', 'gwi', 'yu', 'seong', 'jang', 'ik', 'jin'];
const sources = {
  basic: 'public/data/28su_database_final_updated_20261119.js',
  birth: 'public/data/byeolungwan_28su_birthdate_reference.json',
  description: 'public/data/byeolungwan_28su_descriptions_v3.json',
  keyring: 'public/data/byeolungwan_28su_keyring_descriptions.json',
  tradition: 'public/data/byeolungwan_28su_fortunes_20261119_25_v6.json',
  analysis: 'src/data/fortunes/byeolungwan_fortunes_2026-11-20_24.json',
  dashboard: dashboard.source,
};
const conflicts = [];
assert.equal(MANSIONS.length, 28);
assert.equal(new Set(MANSIONS.map(s => s.id)).size, 28);
const one = (rows, predicate) => { const found = rows.filter(predicate); assert.equal(found.length, 1); return found[0]; };
const rows = MANSIONS.map(s => {
  const b = one(birth.mansions, r => r.id === s.id);
  const d = one(descriptions, r => r.번호 === s.id);
  const k = one(keyring.stars, r => r.번호 === s.id);
  const v = one(legacy.metadata, r => r.번호 === s.id);
  const dash = one(dashboard.rows, r => r.starId === s.id);
  const hanjaCharacter = /\((.)\)/.exec(s.수)[1];
  for (const item of [b.mansion, d['28수'], k['28수'], v['28수'], dash.mansion]) assert.ok(item.includes(hanjaCharacter), `Mismatched hanja: ${s.id}`);
  for (const item of [b.sashin, d.사신, k.사신, v.사신]) assert.equal(s.사신, item);
  assert.equal(s.생일범위, b.date_range);
  assert.equal(s.별자리명, b.name);
  const fortuneKey = s.id === 12 ? '위수(危)' : s.id === 17 ? '위수(胃)' : s.수이름;
  const final = fortunes.constellations[fortuneKey];
  assert.ok(final?.hanja.includes(hanjaCharacter));
  const normalizeMansionName = text => {
    if (s.id === 24 && hanjaCharacter === '柳') return text.replaceAll('유수', '류수');
    if (s.id === 16 && hanjaCharacter === '婁') return text.replaceAll('누수', '루수');
    return text;
  };
  const description = normalizeMansionName(d.사전_소개);
  const resultIntroduction = normalizeMansionName(d.결과_소개);
  if (description !== d.사전_소개 || resultIntroduction !== d.결과_소개) conflicts.push({ starId: s.id, field: 'displayNameInDescription', source: sources.description, resolution: `${s.수이름} 명칭만 교정; 원본 보존`, original: d.사전_소개, selected: description });
  const observationText = k.문단.at(-1);
  const match = /^(.+?) 밤하늘, (.+?) 부근에서/.exec(observationText);
  assert.ok(match, `Cannot extract explicit season/constellation: ${s.id}`);
  const westernConflict = match[2] === '양자자리' && dash.observationDescription.includes('양자리');
  if (westernConflict) conflicts.push({ starId: s.id, field: 'westernConstellation', keyring: match[2], dashboard: '양자리', resolution: '원문 보존; 화면은 자료 확인 중; 정정 확인 필요' });
  if (dash.representativeStar !== s.거성) conflicts.push({ starId: s.id, field: 'representativeStar', local: s.거성, dashboard: dash.representativeStar, resolution: 'final JS priority' });
  if (d.사전_소개 !== k.문단[0]) conflicts.push({ starId: s.id, field: 'introduction', resolution: '사전 소개는 descriptions_v3, 관측 설명은 keyring 별도 보존', description: d.사전_소개, keyring: k.문단[0] });
  const oldAnalysis = /운세 특성\n\n([\s\S]*?)\n\n관측 정보/.exec(dash.rawText)?.[1] ?? null;
  if (oldAnalysis !== final.analysis['간략 총평']) conflicts.push({ starId: s.id, field: 'analysis', dashboard: oldAnalysis, selected: final.analysis['간략 총평'], resolution: '최종 운세 JSON 우선; 대시보드 성격 문구 미사용' });
  return {
    starId: s.id, id: ids[s.id - 1], name: s.수이름, hanja: `${hanjaCharacter}宿`, formalName: s.정식표기,
    alias: s.별자리명, animal: s.상징동물, guardian: s.사신.slice(2),
    direction: ({ 동방청룡: 'east', 북방현무: 'north', 서방백호: 'west', 남방주작: 'south' })[s.사신],
    sashin: s.사신, period: b.date_range, start: b.start, end: b.end, element: s.오행,
    graphicKey: ids[s.id - 1] === 'yu' ? 'ryu' : ids[s.id - 1], keyringId: k.id,
    description, resultIntroduction, keyringParagraphs: k.문단.map(normalizeMansionName),
    keywords: s.키워드, folklore: s.설화요약, traditionalName: s.칠요포함명칭,
    luckySymbols: [
      { label: '행운의 색', value: s.행운색 }, { label: '행운의 방위', value: s.행운방위 },
      { label: '행운의 요일', value: CHILYO[s.칠요].이름 }, { label: '행운의 행성', value: s.행운행성 },
    ],
    traditionalSymbol: v['천관 상징(내부)'], traditionalDegrees: s.도수,
    summary: final.analysis['간략 총평'],
    observation: {
      representativeStar: s.거성, rightAscension: null, declination: null, apparentMagnitude: null,
      dashboardMagnitude: dash.displayedMagnitude, dashboardMagnitudeLabel: dash.magnitudeLabel,
      observationSeason: match[1], recommendedMonth: dash.recommendedMonth, westernConstellation: match[2],
      observationDescription: dash.observationDescription, keyringObservationDescription: normalizeMansionName(observationText),
      dataSource: { representativeStar: sources.basic, coordinates: null, apparentMagnitude: null,
        dashboardMagnitude: sources.dashboard, recommendedMonth: sources.dashboard, observationDescription: sources.dashboard,
        observationSeason: sources.keyring, westernConstellation: sources.keyring },
      verificationStatus: { representativeStar: 'project-source-unverified', coordinates: 'not-verified', apparentMagnitude: 'not-verified',
        dashboardMagnitude: 'dashboard-transcribed-definition-unverified', recommendedMonth: 'dashboard-transcribed',
        observationDescription: 'dashboard-transcribed-not-astronomically-verified', observationSeason: 'keyring-transcribed', westernConstellation: westernConflict ? 'source-conflict-needs-review' : 'keyring-transcribed' },
    },
    dataSource: sources,
  };
});
await mkdir('src/data/constellations', { recursive: true });
await writeFile('src/data/constellations/catalog.json', JSON.stringify(rows, null, 2) + '\n');
await writeFile('src/data/constellations/guardians.json', JSON.stringify(SASHIN, null, 2) + '\n');
await writeFile('src/data/constellations/integration-audit.json', JSON.stringify({ sources, conflicts }, null, 2) + '\n');
await mkdir('reports', { recursive: true });
const inventory = [
  '# 28수 1단계 관측 정보 확보 목록', '',
  '등급·최적 월·관측 설명은 [대시보드](https://28su-dashboard.vercel.app/result/overview)에서 전사한 프로젝트 안내입니다. 실제 천문 등급으로 검증한 값이 아닙니다. 거성은 최종 JS, 계절·서양 별자리는 키링 원문입니다.', '',
  '| 번호 / 앱 ID | 명칭·한자 / 동물 | 사신 | 거성 (프로젝트 원문) | 계절 (키링 원문) | 서양 별자리 (키링 원문) | 최적 월 | 대시보드 등급 | 대시보드 관측 설명 |',
  '|---|---|---|---|---|---|---|---|---|',
  ...rows.map(s => `| ${s.starId} / ${s.id} | ${s.name} ${s.hanja} / ${s.animal} | ${s.sashin} | ${s.observation.representativeStar} | ${s.observation.observationSeason} | ${s.observation.westernConstellation}${s.observation.verificationStatus.westernConstellation === 'source-conflict-needs-review' ? ' ※ 표기 확인 중' : ''} | ${s.observation.recommendedMonth} | ${s.observation.dashboardMagnitude} | ${s.observation.observationDescription} |`), '',
  '모든 별자리의 rightAscension, declination, apparentMagnitude는 null입니다. 전통 도수는 별도 traditionalDegrees 필드에 보존하며 실제 고도나 적경으로 사용하지 않습니다.', '',
  '16·17번 키링 원문의 양자자리는 대시보드의 양자리와 불일치합니다. 원문을 임의로 수정하지 않고, 화면에는 해당 서양 별자리 항목을 자료 확인 중으로 표시합니다.', '',
  `대시보드 수집 시각: ${dashboard.capturedAt}. 원문과 출처별 검증 상태는 src/data/constellations/catalog.json 및 dashboard.snapshot.json에 보관합니다.`,
];
await writeFile('reports/28su-observation-inventory.md', inventory.join('\n') + '\n');
console.log(`Integrated ${rows.length} mansions. Recorded ${conflicts.length} source comparisons/corrections. Astronomical fields remain null.`);
