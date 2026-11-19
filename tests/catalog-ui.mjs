import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
const { chromium, webkit } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const catalog = JSON.parse(await readFile(new URL('../src/data/constellations/catalog.json', import.meta.url), 'utf8'));
const copy = JSON.parse(await readFile(new URL('../src/data/constellations/detailCopy.json', import.meta.url), 'utf8'));
const isWebKit = process.env.TEST_BROWSER === 'webkit';
const engine = isWebKit ? 'webkit' : 'chrome';
const browser = await (isWebKit ? webkit.launch({ headless: true }) : chromium.launch({ channel: 'chrome', headless: true }));
const origin = process.env.TEST_ORIGIN ?? 'http://localhost:5173';
await mkdir('review/catalog', { recursive: true });
try {
  const context = await browser.newContext({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true, timezoneId: 'America/Los_Angeles' });
  await context.addInitScript(() => {
    if (!sessionStorage.getItem('byeolungwan.profile.v1')) sessionStorage.setItem('byeolungwan.profile.v1', JSON.stringify({ name: '관람객', birthDate: '2000-12-18' }));
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const go = async (path, selector) => {
    await page.goto(`${origin}/#${path}`);
    try { await page.locator(selector).waitFor(); }
    catch (error) { console.error('Failed route', page.url(), 'Page errors', errors, 'Body', (await page.locator('body').innerText()).slice(0, 1000)); throw error; }
    await page.evaluate(() => document.fonts.ready);
  };
  const checkFigure = async (selector, topSelector, bottomSelector) => {
    const bounds = await page.locator(selector).evaluate((svg, selectors) => {
      const top = document.querySelector(selectors[0]).getBoundingClientRect().bottom;
      const bottom = document.querySelector(selectors[1]).getBoundingClientRect().top;
      const points = [...svg.querySelectorAll('svg > circle:not(.constellation-figure__halo)')].map(circle => {
        const b = circle.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
      });
      return { top, bottom, points, left: svg.getBoundingClientRect().left, right: svg.getBoundingClientRect().right };
    }, [topSelector, bottomSelector]);
    assert.ok(bounds.points.length > 0);
    assert.ok(bounds.points.every(p => p.y > bounds.top && p.y < bounds.bottom && p.x >= bounds.left && p.x <= bounds.right), JSON.stringify(bounds));
  };
  await go('/constellations/dictionary', '.dictionary');
  assert.equal(await page.locator('.dict-card--link').count(), 28);
  assert.equal(await page.locator('.dict-card__name').filter({ hasText: '류수' }).count(), 1);
  assert.equal(await page.locator('.dict-card__name').filter({ hasText: '루수' }).count(), 1);
  assert.equal(await page.locator('.dict-card__name').filter({ hasText: '위수' }).count(), 2);
  await page.locator('.dictionary-more').first().click();
  await page.waitForURL('**/constellation/sam');
  for (const star of catalog) {
    await go(`/constellations/dictionary/constellation/${star.id}`, '.constellation');
    assert.ok((await page.locator('.dict-hero__name').textContent()).includes(star.name));
    assert.ok((await page.locator('.dict-hero__name').textContent()).includes(star.hanja));
    assert.equal((await page.locator('#constellation-description').textContent()).trim(), copy.entries[star.id].sections.description);
    await checkFigure('.constellation-top__figure', '.dict-tabs', '.dict-hero');
    assert.equal(await page.locator('.constellation-top__figure > g').getAttribute('transform').then(value => value.startsWith('translate(0 -15)')), true);
    const luckyValues = star.luckySymbols.map(symbol => symbol.value);
    assert.deepEqual(await page.locator('.constellation-lucky__value').allTextContents(), luckyValues);
    const luckyGlyphs = await page.locator('.constellation-lucky__image').allTextContents();
    assert.ok(luckyGlyphs.every(glyph => glyph && glyph !== '—'), star.id);
    await page.locator('.constellation-image img').evaluate(async image => { image.loading = 'eager'; await image.decode(); });
    assert.ok((await page.locator('.constellation-image img').getAttribute('src')).split('/').at(-1).startsWith(`${star.graphicKey}-`));
    assert.ok((await page.locator('#constellation-observation').textContent()).includes(star.observation.representativeStar));
    assert.ok((await page.locator('#constellation-observation').textContent()).includes(`${star.observation.dashboardMagnitude}등급`));
    assert.equal(await page.locator('.constellation').evaluate(e => e.scrollWidth <= e.closest('.app-scroll').clientWidth), true);
    await page.evaluate(value => sessionStorage.setItem('byeolungwan.profile.v1', JSON.stringify(value)), {
      name: '관람객', birthDate: `2000-${String(star.start.month).padStart(2, '0')}-${String(star.start.day).padStart(2, '0')}`,
    });
    await page.reload();
    await go('/fortune', '.fortune');
    assert.deepEqual(await page.locator('.fortune-lucky__value').allTextContents(), luckyValues);
    assert.deepEqual(await page.locator('.fortune-lucky__image').allTextContents(), luckyGlyphs);
    await go('/constellations/explore', '.explore');
    assert.equal(await page.locator('.explore-where__label strong').textContent(), star.name);
    await checkFigure('.explore-top__figure', '.page-header', '.explore-where');
    const rows = await page.locator('.explore-rows--observe').textContent();
    assert.ok(rows.includes(star.observation.representativeStar));
    assert.ok(rows.includes(star.observation.recommendedMonth));
    if (star.observation.verificationStatus.westernConstellation !== 'source-conflict-needs-review') assert.ok(rows.includes(star.observation.westernConstellation));
    assert.equal(await page.locator('.explore-map__chart circle[r="9"]').count(), 1);
    assert.equal(await page.getByText(/계산 준비|계산 대기|자료 준비|자료 확인 중/).count(), 0);
    assert.deepEqual(await page.locator('.explore-rows--observe dt').allTextContents(), ['기준 시각', '겉보기 등급', '최적 관측 시기', '관측 권장 위치', '관측 구역']);
    assert.equal(await page.locator('.explore').evaluate(e => e.scrollWidth <= e.closest('.app-scroll').clientWidth), true);
  }
  const before = await page.locator('.explore-rows--observe').textContent();
  const oldTime = await page.locator('.explore-where__time').textContent();
  await page.waitForTimeout(1100);
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: '기준 시각 새로고침' }).click();
  assert.notEqual(await page.locator('.explore-where__time').textContent(), oldTime);
  const after = await page.locator('.explore-rows--observe').textContent();
  assert.equal(after.slice(after.indexOf('겉보기 등급')), before.slice(before.indexOf('겉보기 등급')));
  const koreanDate = await page.evaluate(() => new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'numeric', day: 'numeric' }).format(new Date()));
  assert.ok((await page.locator('.explore-where__time').textContent()).startsWith(koreanDate));
  for (const [width, height] of [[320, 568], [393, 852], [430, 932], [768, 1024], [1280, 1000]]) {
    await page.setViewportSize({ width, height });
    for (const [path, selector] of [['/constellations/dictionary', '.dictionary'], ['/constellations/dictionary/constellation/wi-north', '.constellation'], ['/constellations/dictionary/constellation/wi-west', '.constellation'], ['/constellations/explore', '.explore']]) {
      await go(path, selector);
      assert.equal(await page.locator(selector).evaluate(e => e.scrollWidth <= e.closest('.app-scroll').clientWidth), true, `${path} ${width}`);
    }
    await page.locator('.explore-map__card').scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    await page.screenshot({ path: `review/catalog/explore-${engine}-${width}.png`, animations: 'disabled' });
  }
  await page.setViewportSize({ width: 393, height: 852 });
  await go('/constellations/dictionary/constellation/yu', '.constellation');
  await page.screenshot({ path: `review/catalog/ryu-${engine}.png`, animations: 'disabled' });
  for (const direction of ['east', 'north', 'west', 'south']) {
    await go(`/constellations/dictionary/direction/${direction}`, '.direction');
    assert.equal(await page.locator('.dict-card').count(), 7);
  }
  assert.deepEqual(errors, []);
  console.log(`PASS ${engine}: 28 dictionary details + 28 explore profiles, editorial text/IDs, four directions, example map and simple rows, clock-only refresh/Korea timezone, 5 viewports, no page errors.`);
} finally { await browser.close(); }
