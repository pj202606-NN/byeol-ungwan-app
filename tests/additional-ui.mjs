import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
const { chromium, webkit } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const isWebKit = process.env.TEST_BROWSER === 'webkit';
const browser = await (isWebKit ? webkit.launch({ headless: true }) : chromium.launch({ channel: 'chrome', headless: true }));
const origin = process.env.TEST_ORIGIN ?? 'http://localhost:5173';
const engine = isWebKit ? 'webkit' : 'chrome';
const data = JSON.parse(await readFile(new URL('../src/data/fortunes/byeolungwan_fortunes_2026-11-20_24.json', import.meta.url), 'utf8'));
const errors = [];
await mkdir('review/additional', { recursive: true });
const seed = async (context) => {
  await context.addInitScript(() => sessionStorage.setItem('byeolungwan.profile.v1', JSON.stringify({ name: '너구', birthDate: '2000-12-18' })));
};
const go = async (page, route, selector) => {
  await page.goto(`${origin}/#${route}`);
  await page.locator(selector).first().waitFor();
  await page.evaluate(() => document.fonts.ready);
};

try {
  const context = await browser.newContext({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true, timezoneId: 'Asia/Seoul' });
  await seed(context);
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  await page.clock.install({ time: new Date('2026-11-20T14:59:50Z') });
  await page.clock.pauseAt(new Date('2026-11-20T14:59:50Z'));
  await go(page, '/', '.home-message');
  assert.equal(await page.locator('.home-message').getAttribute('aria-label'), '11월 20일');
  assert.equal(await page.locator('.home-today__text').textContent(), data.constellations.삼수.daily['2026-11-20'].종합.ultraShort);
  const initial = await page.locator('.home-hero__title').boundingBox();
  await page.clock.runFor(4900);
  assert.equal(await page.locator('.home-message').getAttribute('aria-label'), '너구님의 하늘');
  await page.clock.runFor(4900);
  assert.equal(await page.locator('.home-message').getAttribute('aria-label'), '좋은 밤입니다.');
  await page.clock.runFor(4900);
  assert.equal(await page.locator('.home-message').getAttribute('aria-label'), '11월 21일');
  assert.equal(await page.locator('.home-today__text').textContent(), data.constellations.삼수.daily['2026-11-21'].종합.ultraShort);
  assert.deepEqual(await page.locator('.home-hero__title').boundingBox(), initial);
  await page.clock.setSystemTime(new Date('2026-11-22T00:00:00Z'));
  await page.evaluate(() => { document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('focus')); });
  await page.clock.runFor(100);
  assert.equal(await page.locator('.home-message').getAttribute('aria-label'), '11월 22일');
  assert.equal(await page.locator('.home-today__text').textContent(), data.constellations.삼수.daily['2026-11-22'].종합.ultraShort);
  await page.clock.runFor(8900);
  assert.equal(await page.locator('.home-message').getAttribute('aria-label'), '좋은 아침입니다.');
  await page.screenshot({ path: `review/additional/home-${engine}.png`, animations: 'disabled' });

  // Popup keeps the menu border; the requested refinement uses darker glass and less rounding.
  const navStyle = await page.locator('.bottom-nav').evaluate(e => {
    const s = getComputedStyle(e); return [s.backgroundColor, s.borderColor, s.borderRadius, s.backdropFilter || s.webkitBackdropFilter];
  });
  await page.locator('.profile-avatar').click();
  const popupStyle = await page.locator('dialog[open]').evaluate(e => {
    const s = getComputedStyle(e); return [s.backgroundColor, s.borderColor, s.borderRadius, s.backdropFilter || s.webkitBackdropFilter];
  });
  assert.deepEqual(popupStyle, ['rgba(3, 10, 17, 0.62)', navStyle[1], '20px', 'blur(14px)']);
  await page.screenshot({ path: `review/additional/dialog-${engine}.png`, animations: 'disabled' });
  await page.keyboard.press('Escape');
  const imageMetrics = await page.locator('.home-dict__card').first().evaluate(card => {
    const img = card.querySelector('img');
    const a = card.getBoundingClientRect(), b = img.getBoundingClientRect();
    return { width: a.width, height: a.height, scale: b.width / a.width, overflow: getComputedStyle(card).overflow };
  });
  assert.equal(imageMetrics.width, 96);
  assert.equal(imageMetrics.height, 129);
  assert.ok(Math.abs(imageMetrics.scale - 1.22) < .01);
  assert.equal(imageMetrics.overflow, 'hidden');
  await page.locator('.home-dict__card img').evaluateAll(images => Promise.all(images.map(async image => {
    image.loading = 'eager';
    await image.decode();
  })));
  await page.locator('.home-dict').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `review/additional/dictionary-home-${engine}.png`, animations: 'disabled' });
  await context.close();

  const layout = await browser.newContext({ viewport: { width: 393, height: 568 }, isMobile: true, hasTouch: true, timezoneId: 'Asia/Seoul' });
  await seed(layout);
  const ui = await layout.newPage();
  ui.on('pageerror', e => errors.push(e.message));
  await go(ui, '/constellations/explore', '.explore-map__card');
  const time = await ui.locator('.explore-where__time').textContent();
  await ui.waitForTimeout(1100);
  await ui.locator('.explore-where__ring').click();
  assert.notEqual(await ui.locator('.explore-where__time').textContent(), time);
  for (let i = 0; i < 4; i++) await ui.locator('.explore-where__ring').click();
  assert.equal(await ui.getByText('전시장 위치 기준', { exact: true }).count(), 0);
  assert.equal(await ui.getByText('관측 상태', { exact: true }).count(), 1);
  assert.equal(await ui.locator('.explore-rows dd').nth(2).textContent(), '지평선 위');
  assert.equal(await ui.getByText('겉보기 등급', { exact: true }).count(), 1);
  assert.equal(await ui.locator('.explore-map__chart circle[r="9"]').count(), 1);
  assert.ok(!(await ui.locator('.explore-map__card').getAttribute('class')).includes('is-revealed'));
  await ui.locator('.explore-map__card').evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await ui.waitForFunction(() => document.querySelector('.explore-map__card').classList.contains('is-revealed'));
  await ui.waitForTimeout(950);
  const mapStyle = await ui.locator('.explore-map__content').evaluate(e => ({ clip: getComputedStyle(e).clipPath, background: getComputedStyle(e).backgroundImage }));
  assert.match(mapStyle.clip, /75%/);
  assert.match(mapStyle.background, /default-profile/);
  await ui.screenshot({ path: `review/additional/explore-${engine}.png` });
  await ui.locator('.app-scroll').evaluate(e => e.scrollTo(0, 0));
  await ui.locator('.explore-map__card').evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
  assert.match(await ui.locator('.explore-map__card').getAttribute('class'), /is-revealed/);

  await go(ui, '/fortune', '.fortune-lucky__image');
  assert.deepEqual(await ui.locator('.fortune-lucky__image').allTextContents(), ['黃', '中', '土', '土']);
  for (const tab of ['이달의 운세', '올해의 운세']) {
    await ui.getByRole('tab', { name: tab, exact: true }).click();
    assert.equal(await ui.locator('.fortune-category').count(), 4);
    assert.equal(await ui.locator('.fortune-lucky__image').count(), 4);
  }
  await ui.locator('.fortune-lucky').scrollIntoViewIfNeeded();
  await ui.screenshot({ path: `review/additional/lucky-${engine}.png`, animations: 'disabled' });
  await ui.getByRole('tab', { name: '분석', exact: true }).click();
  assert.equal(await ui.locator('.fortune-category').count(), 6);
  assert.equal(await ui.locator('.fortune-lucky').count(), 0);

  for (const [width, height] of [[320, 568], [375, 667], [393, 852], [430, 932], [852, 393], [768, 1024], [1280, 1000]]) {
    await ui.setViewportSize({ width, height });
    for (let step = 1; step <= 5; step++) {
      await go(ui, `/onboarding/${step}`, '.onboarding__text');
      const metrics = await ui.evaluate(() => {
        const text = document.querySelector('.onboarding__text');
        const dots = document.querySelector('.onboarding__dots');
        const button = document.querySelector('.onboarding__button');
        const a = text.getBoundingClientRect(), d = dots.getBoundingClientRect(), b = button.getBoundingClientRect();
        const lift = parseFloat(getComputedStyle(text).top);
        text.style.top = '0px';
        const originalText = text.getBoundingClientRect(), originalDots = dots.getBoundingClientRect(), originalButton = button.getBoundingClientRect();
        text.style.top = '';
        return { top: a.top, bottom: a.bottom, dotTop: d.top, buttonTop: b.top, lift, difference: a.top - originalText.top,
          dotsUnchanged: d.top === originalDots.top, buttonUnchanged: b.top === originalButton.top,
          width: document.querySelector('.onboarding').scrollWidth, available: document.querySelector('.app-scroll').clientWidth };
      });
      assert.ok(metrics.top >= 0 && metrics.bottom < metrics.dotTop && metrics.bottom < metrics.buttonTop, JSON.stringify(metrics));
      assert.ok(metrics.lift < 0 && Math.abs(metrics.difference - metrics.lift) < 1);
      assert.ok(metrics.dotsUnchanged && metrics.buttonUnchanged);
      assert.ok(metrics.width <= metrics.available);
    }
    for (const [route, selector] of [['/', '.home'], ['/fortune', '.fortune'], ['/constellations/explore', '.explore']]) {
      await go(ui, route, selector);
      assert.ok(await ui.locator(selector).evaluate(e => e.scrollWidth <= e.closest('.app-scroll').clientWidth), `${width} ${route} overflow`);
    }
  }
  await ui.setViewportSize({ width: 393, height: 852 });
  await go(ui, '/onboarding/1', '.onboarding__text');
  await ui.screenshot({ path: `review/additional/onboarding-${engine}.png`, animations: 'disabled' });
  await ui.emulateMedia({ reducedMotion: 'reduce' });
  await go(ui, '/constellations/explore', '.explore-map__card');
  assert.equal(await ui.locator('.explore-map__content').evaluate(e => getComputedStyle(e).clipPath), 'none');
  await go(ui, '/', '.home-message');
  await ui.waitForTimeout(4600);
  assert.equal(await ui.locator('.home-message__track').evaluate(e => getComputedStyle(e).animationName), 'none');
  assert.deepEqual(errors, []);
  await layout.close();
  console.log(`PASS ${engine}: message cycle/local dates/greetings/layout/midnight/resume, popup styles, home-only image scale, refresh/static fields/map reveal/reduced motion, lucky badges, 5 onboarding steps × 7 viewports and home/fortune/explore overflow.`);
} finally { await browser.close(); }
