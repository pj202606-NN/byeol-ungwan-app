import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
const { chromium, webkit } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const source = JSON.parse(await readFile(new URL('../src/data/fortunes/byeolungwan_fortunes_2026-11-20_24.json', import.meta.url), 'utf8'));
const samples = Object.values(source.constellations).flatMap(star => Object.values(star.daily).map(day => day.종합.ultraShort));
const isWebKit = process.env.TEST_BROWSER === 'webkit';
const engine = isWebKit ? 'webkit' : 'chrome';
const browser = await (isWebKit ? webkit.launch({ headless: true }) : chromium.launch({ channel: 'chrome', headless: true }));
const origin = process.env.TEST_ORIGIN ?? 'http://localhost:5173';
await mkdir('review/content', { recursive: true });
try {
  const context = await browser.newContext({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true });
  await context.addInitScript(() => sessionStorage.setItem('byeolungwan.profile.v1', JSON.stringify({ name: '관람객', birthDate: '2000-12-18' })));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const go = async (path, selector) => {
    await page.goto(`${origin}/#${path}`);
    await page.locator(selector).waitFor();
    await page.evaluate(() => document.fonts.ready);
  };
  for (const width of [320, 393, 430, 768]) {
    await page.setViewportSize({ width, height: 852 });
    await go('/', '.home-today__text');
    const result = await page.locator('.home-today__text').evaluate((element, sentences) => {
      const saved = element.textContent;
      const originalBox = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const failures = [];
      for (const sentence of sentences) {
        element.textContent = sentence;
        const node = element.firstChild;
        for (const match of sentence.matchAll(/\S+/g)) {
          const range = document.createRange();
          range.setStart(node, match.index); range.setEnd(node, match.index + match[0].length);
          const lines = new Set([...range.getClientRects()].map(r => Math.round(r.top)));
          if (lines.size > 1 && ctx.measureText(match[0]).width < element.clientWidth - 1) failures.push(match[0]);
        }
      }
      element.textContent = saved;
      const homeBox = element.closest('.home').getBoundingClientRect();
      return { failures, wordBreak: style.wordBreak, left: originalBox.left, width: originalBox.width,
        rootLeft: homeBox.left, rootWidth: homeBox.width,
        br: element.querySelectorAll('br').length, overflow: element.scrollWidth > element.clientWidth };
    }, samples);
    assert.deepEqual(result.failures, []);
    assert.equal(result.wordBreak, 'keep-all');
    assert.equal(result.left - result.rootLeft, 60);
    assert.ok(Math.abs(result.width - (result.rootWidth - 138)) < 1);
    assert.equal(result.br, 0); assert.equal(result.overflow, false);
    const card = await page.locator('.home-dict__card').first().boundingBox();
    assert.deepEqual([card.width, card.height], [96, 129]);
    assert.equal(await page.locator('.home-dict__card img').first().evaluate(e => getComputedStyle(e).transform), 'matrix(1.22, 0, 0, 1.22, 0, -24)');
  }
  await page.setViewportSize({ width: 393, height: 852 });
  await go('/', '.home');
  await page.locator('.home-today').screenshot({ path: `review/content/home-paragraph-${engine}.png`, animations: 'disabled' });
  await page.locator('.home-dict__card img').evaluateAll(images => Promise.all(images.map(async img => { img.loading = 'eager'; await img.decode(); })));
  await page.locator('.home-dict').screenshot({ path: `review/content/home-cards-${engine}.png`, animations: 'disabled' });
  await go('/constellations/dictionary', '.dictionary');
  await page.locator('.dict-card__image img').evaluateAll(images => Promise.all(images.map(async img => { img.loading = 'eager'; await img.decode(); })));
  assert.equal(await page.locator('.dict-card__image img').count(), 28);
  assert.ok(await page.locator('.dict-card__image img').evaluateAll(images => images.every(img => img.naturalWidth > 0)));
  await page.locator('.dictionary-grid').first().screenshot({ path: `review/content/dictionary-cards-${engine}.png`, animations: 'disabled' });
  await go('/constellations/dictionary/direction/east', '.direction');
  await page.locator('.dict-card__image img').evaluateAll(images => Promise.all(images.map(async img => { img.loading = 'eager'; await img.decode(); })));
  await page.locator('.direction-intro').screenshot({ path: `review/content/guardian-${engine}.png`, animations: 'disabled' });
  await go('/constellations/dictionary/constellation/jeo', '.constellation');
  await page.locator('.constellation-image img').evaluate(async img => { img.loading = 'eager'; await img.decode(); });
  assert.equal((await page.locator('.constellation-image').boundingBox()).height, 180);
  await page.locator('.constellation-image').screenshot({ path: `review/content/detail-art-${engine}.png`, animations: 'disabled' });
  for (const name of ['description', 'personality', 'tradition', 'folklore']) {
    const text = await page.locator(`#constellation-${name}`).textContent();
    assert.ok(text.trim().length >= 120 && text.trim().length <= 160);
  }
  await go('/constellations/explore', '.explore');
  assert.deepEqual(await page.locator('.explore-rows').first().locator('dt').allTextContents(), ['방위각', '고도', '관측 상태', '기준 위치']);
  assert.deepEqual(await page.locator('.explore-rows--observe dt').allTextContents(), ['기준 시각', '겉보기 등급', '최적 관측 시기', '관측 권장 위치', '관측 구역']);
  assert.ok(!/준비 중|계산 대기|자료 확인/.test(await page.locator('.explore').textContent()));
  await page.screenshot({ path: `review/content/explore-top-${engine}.png`, animations: 'disabled' });
  await page.locator('.explore-map__card').scrollIntoViewIfNeeded();
  await page.waitForTimeout(950);
  assert.match(await page.locator('.explore-map__card').getAttribute('class'), /is-revealed/);
  await page.screenshot({ path: `review/content/explore-map-${engine}.png`, animations: 'disabled' });
  await page.locator('.explore-rows--observe').screenshot({ path: `review/content/explore-info-${engine}.png`, animations: 'disabled' });
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  await desktop.addInitScript(() => sessionStorage.setItem('byeolungwan.profile.v1', JSON.stringify({ name: '관람객', birthDate: '2000-12-18' })));
  const pc = await desktop.newPage();
  await pc.goto(`${origin}/#/`); await pc.locator('.home-today__text').waitFor();
  const ratio = await pc.locator('.app-frame').evaluate(e => e.clientWidth / e.clientHeight);
  assert.ok(Math.abs(ratio - 393 / 852) < .005);
  assert.equal(await pc.locator('.home-today__text').evaluate(e => getComputedStyle(e).wordBreak), 'keep-all');
  await desktop.close();
  assert.deepEqual(errors, []);
  console.log(`PASS ${engine}: 140 original fortune sentences × 4 widths without in-word wrapping, fixed home box/scale/raised art, 28 shared card images/detail art, 4 concise sections, simple explore rows/example map/reveal, PC ratio.`);
} finally { await browser.close(); }
