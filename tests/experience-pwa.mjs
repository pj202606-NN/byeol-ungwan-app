import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
const fortuneData = JSON.parse(await readFile(new URL('../src/data/fortunes/byeolungwan_fortunes_2026-11-20_24.json', import.meta.url), 'utf8'));
const catalog = JSON.parse(await readFile(new URL('../src/data/constellations/catalog.json', import.meta.url), 'utf8'));
const detailCopy = JSON.parse(await readFile(new URL('../src/data/constellations/detailCopy.json', import.meta.url), 'utf8'));
const { chromium, webkit } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const isWebKit = process.env.TEST_BROWSER === 'webkit';
const browser = await (isWebKit ? webkit.launch({ headless: true }) : chromium.launch({ channel: 'chrome', headless: true }));
const base = process.env.TEST_ORIGIN ?? 'http://127.0.0.1:4173/byeol-ungwan-app/';
try {
  await mkdir('review/experience', { recursive: true });
  const context = await browser.newContext({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(`${base}#/signup`);
  await page.locator('.signup').waitFor();
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  // 기존 clientsClaim:false 정책을 유지하므로 최초 설치 뒤 새 문서부터 제어한다.
  await page.reload();
  assert.equal(await page.evaluate(() => !!navigator.serviceWorker.controller), true);
  const fonts = await page.evaluate(async () => {
    const urls = [];
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) {
        if (/PretendardVariable|SourceHanSerifKR|ByeolungwanSerifSupplement/.test(request.url)) {
          const response = await cache.match(request);
          urls.push({ url: request.url, ok: response.ok, size: (await response.arrayBuffer()).byteLength });
        }
      }
    }
    return urls;
  });
  assert.equal(fonts.length, 3);
  assert.ok(fonts.every((font) => font.ok && font.size > 0));
  const cachesBefore = await page.evaluate(() => caches.keys());
  await context.setOffline(true);
  const offline = await context.newPage();
  await offline.goto(`${base}#/signup`);
  await offline.locator('.signup').waitFor();
  const loaded = await offline.evaluate(async () => {
    await Promise.all([
      document.fonts.load('400 16px "Pretendard Variable"', '한글 ABC 0123'),
      document.fonts.load('400 23px "Source Han Serif KR"', '한글 角亢氐房 ABC 0123'),
      document.fonts.load('700 23px "Source Han Serif KR"', '星'),
      document.fonts.load('400 16px "Byeolungwan Serif Supplement"', '貉'),
    ]);
    return [...document.fonts].filter((font) => /Pretendard|Source Han|Byeolungwan/.test(font.family)).map((font) => ({ family: font.family, status: font.status }));
  });
  assert.equal(loaded.length, 3);
  assert.ok(loaded.every((font) => font.status === 'loaded'));
  await offline.locator('#signup-name').fill('오프라인관람객');
  await offline.locator('#signup-birth-date').fill('2000-12-18');
  await offline.locator('.signup-submit').click();
  await offline.waitForSelector('.entry-wheel');
  await offline.goto(`${base}#/home`);
  await offline.locator('.home-today__text').waitFor();
  const actualDate = await offline.evaluate(() => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date()));
  const sourceDate = actualDate < fortuneData.dailyStart ? fortuneData.dailyStart : actualDate > fortuneData.dailyEnd ? fortuneData.dailyEnd : actualDate;
  const star = fortuneData.constellations.삼수;
  assert.equal(await offline.locator('.home-today__text').textContent(), star.daily[sourceDate].종합.ultraShort);
  await offline.goto(`${base}#/fortune`);
  await offline.locator('.fortune-quote').waitFor();
  for (const [tab, row] of [['오늘의 운세', star.daily[sourceDate]], ['이달의 운세', star.monthly], ['올해의 운세', star.yearly]]) {
    await offline.getByRole('tab', { name: tab, exact: true }).click();
    assert.ok((await offline.locator('.fortune-quote').textContent()).includes(row.종합.short));
    assert.deepEqual(await offline.locator('.fortune-category__body').allTextContents(), ['종합', '관계', '학업·일', '금전'].map(key => row[key].detail));
    assert.ok((await offline.locator('.fortune-advice').textContent()).includes(row.종합.advice));
  }
  await offline.getByRole('tab', { name: '분석', exact: true }).click();
  assert.deepEqual(await offline.locator('.fortune-category__body').allTextContents(), Object.entries(star.analysis).filter(([key]) => key !== '간략 총평').map(([, value]) => value));
  for (const entry of catalog) {
    await offline.goto(`${base}#/constellations/dictionary/constellation/${entry.id}`);
    await offline.locator('#constellation-description').waitFor();
    assert.equal((await offline.locator('#constellation-description').textContent()).trim(), detailCopy.entries[entry.id].sections.description);
    await offline.locator('.constellation-image img').evaluate(async image => { image.loading = 'eager'; await image.decode(); });
    assert.ok((await offline.locator('#constellation-observation').textContent()).includes(entry.observation.observationDescription));
  }
  for (const direction of ['east', 'north', 'west', 'south']) {
    await offline.goto(`${base}#/constellations/dictionary/direction/${direction}`);
    await offline.locator('.direction').waitFor();
    assert.equal(await offline.locator('.direction-top__image img').count(), 0);
    assert.equal(await offline.locator('.dict-card').count(), 7);
  }
  await offline.goto(`${base}#/constellations/explore`);
  await offline.locator('.explore').waitFor();
  assert.ok((await offline.locator('.explore-rows--observe').textContent()).includes(catalog.find(s => s.starId === 21).observation.representativeStar));
  // First visit to the dictionary is offline: every card must already be cached.
  // Decode explicitly because offscreen cards use lazy loading.
  await offline.goto(`${base}#/constellations/dictionary`);
  await offline.locator('.dictionary').waitFor();
  const cards = await offline.locator('.dict-card__image img').evaluateAll(async (images) => {
    return Promise.all(images.map(async (image) => {
      image.loading = 'eager';
      try {
        await image.decode();
        const cached = await caches.match(image.src);
        return { url: image.src, loaded: image.naturalWidth > 0, cached: !!cached?.ok };
      } catch {
        return { url: image.src, loaded: false, cached: false };
      }
    }));
  });
  assert.equal(cards.length, 28);
  assert.equal(new Set(cards.map((card) => card.url)).size, 28);
  assert.ok(cards.every((card) => card.loaded && card.cached), JSON.stringify(cards.filter((card) => !card.loaded || !card.cached)));
  await offline.screenshot({ path: `review/experience/dictionary-offline-${isWebKit ? 'webkit' : 'chrome'}.png` });
  await offline.goto(`${base}#/home`);
  await offline.locator('.profile-avatar').click();
  await offline.getByRole('button', { name: '처음부터 시작하기', exact: true }).click();
  await offline.locator('.splash').waitFor();
  assert.deepEqual(await offline.evaluate(() => caches.keys()), cachesBefore);
  assert.equal(await offline.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length), 1);
  await offline.screenshot({ path: `review/experience/pwa-offline-${isWebKit ? 'webkit' : 'chrome'}.png` });
  console.log(`PASS ${isWebKit ? 'WebKit' : 'Chrome'}: deployment base, service worker, 3 cached font files, fresh offline page and font weights, new daily/monthly/yearly/analysis manuscripts, 28 unique offline cards, offline signup/reset; cache and SW preserved.`);
} finally {
  await browser.close();
}
