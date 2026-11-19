import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const origin = process.env.TEST_ORIGIN ?? 'http://localhost:5173';
try {
  for (const scenario of [
    { name: 'phone', width: 393, height: 852, touch: true, device: 'mobile' },
    { name: 'phone landscape', width: 852, height: 393, touch: true, device: 'mobile' },
    { name: 'iPad', width: 768, height: 1024, touch: true, device: 'tablet' },
    { name: 'iPad standalone', width: 1024, height: 1366, touch: true, device: 'tablet', standalone: true },
    { name: 'iPad split view', width: 393, height: 852, touch: true, device: 'tablet', iPad: true },
    { name: 'desktop', width: 1280, height: 1000, touch: false, device: 'pc' },
  ]) {
    const context = await browser.newContext({ viewport: { width: scenario.width, height: scenario.height }, isMobile: scenario.touch, hasTouch: scenario.touch });
    await context.addInitScript(({ standalone, iPad }) => {
      if (standalone) Object.defineProperty(navigator, 'standalone', { get: () => true });
      if (iPad) {
        Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' });
        Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 5 });
      }
      sessionStorage.setItem('byeolungwan.profile.v1', JSON.stringify({ name: '관람객', birthDate: '2000-12-18' }));
    }, scenario);
    const page = await context.newPage();
    await page.goto(`${origin}/#/`);
    await page.locator('.home').waitFor();
    const layout = await page.evaluate(() => {
      const frame = document.querySelector('.app-frame').getBoundingClientRect();
      return { device: document.documentElement.dataset.device, width: frame.width, height: frame.height, background: getComputedStyle(document.querySelector('.app-stage__map')).display };
    });
    assert.equal(layout.device, scenario.device, scenario.name);
    if (scenario.device === 'mobile') {
      assert.equal(layout.width, scenario.width, scenario.name);
      assert.equal(layout.background, 'none', scenario.name);
    } else {
      assert.ok(layout.width < scenario.width, scenario.name);
      assert.ok(Math.abs(layout.width / layout.height - 393 / 852) < .003, scenario.name);
      assert.equal(layout.background, 'block', scenario.name);
    }
    if (scenario.name === 'iPad') await page.screenshot({ path: 'review/design-polish/tablet-frame.png' });
    await context.close();
    console.log(`PASS ${scenario.name}`);
  }
} finally { await browser.close(); }
