// 실행: PLAYWRIGHT_MODULE에 설치된 playwright/index.mjs의 file URL을 지정하거나 playwright 설치 후 node tests/experience-ui.mjs
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium, webkit } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const origin = process.env.TEST_ORIGIN ?? 'http://localhost:5173';
const isWebKit = process.env.TEST_BROWSER === 'webkit';
const browser = await (isWebKit ? webkit.launch({ headless: true }) : chromium.launch({ channel: 'chrome', headless: true }));
const errors = [];
const profile = { name: '이전관람객', birthDate: '2000-12-18', birthTime: '13:30' };
await mkdir('review/experience', { recursive: true });
const context = await browser.newContext({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true });
const page = await context.newPage();
page.on('pageerror', (error) => errors.push(error.message));
const go = async (path) => {
  await page.goto(`${origin}/#${path}`);
  await page.locator('.app-frame').waitFor();
  if (path === '/signup') await page.locator('.signup-intro__desc').waitFor();
  await page.evaluate(() => document.fonts.ready);
};
const seed = async () => {
  await page.evaluate((value) => {
  sessionStorage.setItem('byeolungwan.profile.v1', JSON.stringify(value));
  sessionStorage.setItem('byeolungwan.records.v1:old:2000-12-18', '{}');
  sessionStorage.setItem('unrelated', 'keep');
  }, profile);
  await page.reload();
};
const visible = async (selector) => page.locator(selector).waitFor({ state: 'visible' });

try {
  for (const [width, height] of [[320, 568], [360, 740], [375, 667], [393, 852], [412, 915], [430, 932], [852, 393]]) {
    await page.setViewportSize({ width, height });
    await go('/signup');
    const measure = await page.evaluate(() => {
      const desc = document.querySelector('.signup-intro__desc').getBoundingClientRect();
      const sheet = document.querySelector('.signup-sheet').getBoundingClientRect();
      const label = document.querySelector('.signup-field__label').getBoundingClientRect();
      return { descBottom: desc.bottom, sheetTop: sheet.top, labelTop: label.top, width: document.querySelector('.signup').scrollWidth, viewport: innerWidth, font: getComputedStyle(document.querySelector('.signup-field__input')).fontFamily };
    });
    assert.ok(measure.descBottom < measure.sheetTop && measure.descBottom < measure.labelTop, JSON.stringify(measure));
    assert.ok(measure.width <= measure.viewport);
    assert.match(measure.font, /Pretendard/);
    await page.locator('.signup-submit').click();
    await visible('#signup-name-error');
    await page.screenshot({ path: `review/experience/signup-${width}x${height}.png` });
  }
  await page.setViewportSize({ width: 393, height: 852 });
  await go('/signup');
  await page.locator('#signup-name').fill('관람객');
  await page.locator('#signup-birth-date').fill('2000-12-18');
  await page.setViewportSize({ width: 393, height: 420 }); // 키보드로 가용 영역이 줄어드는 경우의 스크롤 검사
  await page.locator('#signup-birth-time').fill('13:30');
  await page.locator('.signup-submit').click();
  await page.waitForURL('**/#/entry-wheel');
  await page.setViewportSize({ width: 393, height: 852 });
  await page.locator('.entry-wheel').waitFor();
  const svg = await page.locator('.entry-wheel__svg').boundingBox();
  const center = { x: svg.x + svg.width / 2, y: svg.y + svg.height * 165 / 315 };
  const x = center.x + svg.width * 0.34;
  const y = center.y - 25;
  await page.locator('.entry-wheel__stage').tap({ position: { x, y } });
  await page.waitForTimeout(150);
  assert.match(await page.locator('.entry-wheel').getAttribute('class'), /is-idle/);
  // 실제 터치 이벤트를 통해 Pointer Events 경로를 확인한다.
  const cdp = isWebKit ? { send: async (_, event) => {
    const point = event.touchPoints[0];
    if (point) await page.mouse.move(point.x, point.y);
    if (event.type === 'touchStart') await page.mouse.down();
    if (event.type === 'touchEnd') await page.mouse.up();
  } } : await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + 5 }] });
  assert.match(await page.locator('.entry-wheel').getAttribute('class'), /is-idle/);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (const dy of [10, 20, 36]) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + dy }] });
    await page.waitForTimeout(30);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForSelector('.entry-wheel.is-spinning');
  assert.equal(await page.locator('.ew-marker-line').count(), 0);
  assert.equal(await page.locator('.entry-wheel__marker').evaluate((e) => getComputedStyle(e).opacity), '0');
  await page.locator('.entry-wheel__stage').tap({ force: true });
  await page.waitForSelector('.entry-wheel.is-zooming', { timeout: 6000 });
  assert.equal(await page.locator('.entry-wheel__marker').evaluate((e) => getComputedStyle(e).opacity), '0');
  await page.waitForSelector('.entry-wheel.is-zoomed', { timeout: 3000 });
  await page.waitForTimeout(550);
  await page.screenshot({ path: 'review/experience/wheel-zoomed.png' });
  await page.waitForURL('**/#/', { timeout: 7000 });
  await visible('.home');

  // 동일한 공통 프로필이 있는 화면의 팝업 / 취소 / Escape / 바깥 클릭 / 포커스 복귀
  for (const route of ['/', '/fortune', '/records', '/constellations/explore', '/constellations/dictionary']) {
    await go(route);
    const avatar = page.locator('.profile-avatar').first();
    await avatar.click();
    await visible('dialog[open]');
    assert.equal(await page.evaluate(() => document.querySelector('.app-scroll').style.overflow), 'hidden');
    assert.equal(await page.evaluate(() => document.activeElement.textContent), '취소');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('dialog').count(), 0);
    assert.equal(await avatar.evaluate((e) => document.activeElement === e), true);
  }
  await go('/');
  await page.locator('.profile-avatar').click();
  await page.getByRole('button', { name: '취소', exact: true }).click();
  assert.equal(await page.locator('dialog').count(), 0);
  await page.locator('.profile-avatar').click();
  await page.mouse.click(5, 5);
  assert.equal(await page.locator('dialog').count(), 0);
  await seed();
  await go('/fortune');
  await page.locator('.profile-avatar').click();
  await page.screenshot({ path: 'review/experience/reset-dialog.png' });
  // 포커스가 모달 내부에 순환하며 배경 링크로 빠지지 않는다.
  for (let i = 0; i < 5; i++) await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => !!document.activeElement.closest('dialog')), true);
  await page.getByRole('button', { name: '처음부터 시작하기', exact: true }).click();
  await page.waitForURL('**/#/splash');
  await visible('.splash');
  const saved = await page.evaluate(() => ({ profile: sessionStorage.getItem('byeolungwan.profile.v1'), records: Object.keys(sessionStorage).filter((k) => k.startsWith('byeolungwan.records.v1:')), unrelated: sessionStorage.getItem('unrelated') }));
  assert.deepEqual(saved, { profile: null, records: [], unrelated: 'keep' });
  await page.goBack();
  await visible('.splash');
  assert.equal(await page.locator('.home, .fortune, .records').count(), 0);
  await go('/fortune'); // 이전 기록/직접 주소도 입력값 없이는 노출하지 않음
  await page.waitForURL('**/#/splash');
  await go('/signup');
  for (const id of ['signup-name', 'signup-birth-date', 'signup-birth-time']) assert.equal(await page.locator(`#${id}`).inputValue(), '');
  await seed();
  await go('/my');
  await page.locator('.my-reset__button').click();
  await page.waitForURL('**/#/splash');
  assert.equal(await page.evaluate(() => sessionStorage.getItem('byeolungwan.profile.v1')), null);

  const desktop = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const pc = await desktop.newPage();
  pc.on('pageerror', (error) => errors.push(error.message));
  await pc.goto(`${origin}/#/signup`);
  const frame = await pc.locator('.app-frame').boundingBox();
  assert.ok(Math.abs(frame.width / frame.height - 393 / 852) < 0.002);
  await pc.locator('#signup-name').fill('마우스관람객');
  await pc.locator('#signup-birth-date').fill('2000-12-18');
  await pc.locator('.signup-submit').click();
  await pc.waitForSelector('.entry-wheel.is-idle');
  const disc = await pc.locator('.entry-wheel__svg').boundingBox();
  const px = disc.x + disc.width * 0.84;
  const py = disc.y + disc.height * 165 / 315 - 20;
  await pc.mouse.move(px, py);
  await pc.mouse.down();
  await pc.mouse.move(px, py + 40, { steps: 8 });
  await pc.mouse.up();
  await pc.waitForSelector('.entry-wheel.is-spinning');
  await desktop.close();
  assert.deepEqual(errors, []);
  console.log('PASS: 7 viewport layouts, validation, reduced viewport input, touch/mouse drag, ordered animation, modal close/focus/scroll, scoped reset, route guards, PC frame; no page errors.');
} catch (error) {
  console.error('Failure URL:', page.url(), 'Page errors:', errors);
  await page.screenshot({ path: `review/experience/failure-${isWebKit ? 'webkit' : 'chrome'}.png` });
  throw error;
} finally {
  await browser.close();
}
