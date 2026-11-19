import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
const { chromium, webkit } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const isWebKit = process.env.TEST_BROWSER === 'webkit';
const engine = isWebKit ? 'webkit' : 'chrome';
const browser = await (isWebKit ? webkit.launch({ headless: true }) : chromium.launch({ channel: 'chrome', headless: true }));
const origin = process.env.TEST_ORIGIN ?? 'http://localhost:5173';
const copy = JSON.parse(await readFile(new URL('../src/data/constellations/guardianCopy.json', import.meta.url), 'utf8'));
await mkdir('review/design-polish', { recursive: true });
const errors = [];
try {
  for (const [width, height] of [[320, 568], [393, 852], [430, 932], [768, 1024], [1280, 1000]]) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: width < 1000, hasTouch: width < 1000 });
    await context.addInitScript(() => {
      if (!sessionStorage.getItem('byeolungwan.profile.v1')) sessionStorage.setItem('byeolungwan.profile.v1', JSON.stringify({ name: '관람객', birthDate: '2000-12-18' }));
    });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    const go = async (path, selector) => {
      await page.goto(`${origin}/#${path}`); await page.locator(selector).waitFor();
      await page.evaluate(() => document.fonts.ready);
    };
    const cardsFit = async selector => {
      const data = await page.locator(selector).evaluateAll(frames => frames.map(frame => {
        const image = frame.querySelector('img');
        const f = frame.getBoundingClientRect(), b = image.getBoundingClientRect();
        return { scale: b.width / f.width, higher: b.top < f.top + f.height * (1 - 1.32) / 2 - 14,
          covered: b.left <= f.left && b.right >= f.right && b.top <= f.top && b.bottom >= f.bottom - 1,
          overflow: getComputedStyle(frame).overflow };
      }));
      assert.ok(data.length);
      const expectedScale = selector.includes('home-dict') ? 1.22 : 1.25;
      assert.ok(data.every(d => Math.abs(d.scale - expectedScale) < .01 && d.higher && d.covered && d.overflow === 'hidden'), JSON.stringify(data));
    };
    for (const id of ['east', 'north', 'west', 'south']) {
      await go(`/constellations/dictionary/direction/${id}`, '.direction');
      assert.equal(await page.locator('.direction-top__image img').count(), 0);
      assert.equal((await page.locator('.direction-top__image').boundingBox()).height, 171.5);
      const intro = (await page.locator('.direction-intro span').allTextContents()).join(' ');
      assert.equal(intro.trim(), copy.entries[id].shortIntro);
      assert.equal(intro.split('.').filter(s => s.trim()).length, 2);
      const paragraphHeight = (await page.locator('.direction-intro span').first().boundingBox()).height;
      assert.ok(paragraphHeight <= 69.5, `${id} ${width}: ${paragraphHeight / 23} lines`);
      assert.equal(await page.locator('.dict-card').count(), 7);
      await cardsFit('.direction-grid .dict-card__image');
      assert.ok(await page.locator('.direction').evaluate(e => e.scrollWidth <= e.closest('.app-scroll').clientWidth));
      if (width === 393) {
        await page.locator('.dict-card__image img').evaluateAll(images => Promise.all(images.map(async img => { img.loading = 'eager'; await img.decode(); })));
        await page.screenshot({ path: `review/design-polish/guardian-${id}-${engine}.png`, animations: 'disabled' });
        await page.locator('.direction-intro').screenshot({ path: `review/design-polish/intro-${id}-${engine}.png` });
      }
    }
    await go('/', '.home');
    await cardsFit('.home-dict__card');
    const homeCard = await page.locator('.home-dict__card').first().boundingBox();
    assert.deepEqual([homeCard.width, homeCard.height], [96, 129]);
    await go('/constellations/dictionary', '.dictionary');
    await cardsFit('.dict-card__image');
    await go('/constellations/dictionary/constellation/jeo', '.constellation');
    assert.equal((await page.locator('.constellation-image').boundingBox()).height, 180);
    assert.equal(await page.locator('.constellation-image img').evaluate(e => getComputedStyle(e).transform), 'matrix(1.18, 0, 0, 1.18, 0, -4)');
    await go('/fortune', '.fortune');
    assert.deepEqual(await page.locator('.fortune-lucky__image').evaluateAll(images => images.map(e => {
      const s = getComputedStyle(e); return [s.fontSize, s.width, s.height, s.placeItems];
    })), Array.from({ length: 4 }, () => ['19px', '48px', '48px', 'center']));
    const blur = await page.locator('.fortune-deep__blurred').evaluate(e => {
      const s = getComputedStyle(e); return [s.filter, s.opacity, s.maskImage || s.webkitMaskImage];
    });
    await go('/my', '.my');
    assert.equal(await page.locator('.my-footer').count(), 0);
    assert.equal(await page.locator('.my-settings .feature-locked__content').evaluate(e => e.inert), true);
    assert.deepEqual(await page.locator('.my-settings .feature-locked__content').evaluate(e => {
      const s = getComputedStyle(e); return [s.filter, s.opacity, s.maskImage || s.webkitMaskImage];
    }), blur);
    assert.equal(await page.getByText('이 기능은 현재 지원하지 않습니다.', { exact: true }).count(), 1);
    assert.equal(await page.locator('.my-settings .my-list li').count(), 4);
    assert.equal(await page.locator('.my-settings .my-reset__button').count(), 0);
    assert.equal(await page.locator('.my-reset__button').evaluate(e => !!e.closest('[inert]')), false);
    const resetShift = await page.evaluate(() => {
      const reset = document.querySelector('.my-reset');
      const section = document.querySelector('.my-settings');
      const content = section.querySelector('.feature-locked__content');
      const before = reset.getBoundingClientRect().top;
      section.style.overflow = 'visible'; content.style.display = 'contents';
      const withoutLock = reset.getBoundingClientRect().top;
      section.style.overflow = ''; content.style.display = '';
      return before - withoutLock;
    });
    assert.ok(Math.abs(resetShift) < 1, `${width} reset shifted ${resetShift}`);
    if (width === 393) {
      await page.locator('.my-reset').scrollIntoViewIfNeeded();
      await page.screenshot({ path: `review/design-polish/settings-${engine}.png`, animations: 'disabled' });
    }
    if (width === 393) {
      await page.evaluate(() => { sessionStorage.setItem('byeolungwan.records.v1:test', '{}'); sessionStorage.setItem('unrelated', 'keep'); });
      await page.locator('.my-reset__button').click();
      await page.locator('.splash').waitFor();
      assert.deepEqual(await page.evaluate(() => ({ profile: sessionStorage.getItem('byeolungwan.profile.v1'), records: Object.keys(sessionStorage).filter(k => k.startsWith('byeolungwan.records.v1:')), unrelated: sessionStorage.getItem('unrelated') })), { profile: null, records: [], unrelated: 'keep' });
      await page.locator('.splash').click();
      for (let i = 1; i <= 5; i++) {
        await page.waitForURL(`**/#/onboarding/${i}`);
        await page.locator('.onboarding__button').click();
      }
      await page.locator('.signup').waitFor();
      assert.equal(await page.locator('#signup-name').inputValue(), '');
      await page.locator('#signup-name').fill('다음관람객');
      await page.locator('#signup-birth-date').fill('2000-12-18');
      await page.locator('.signup-submit').click();
      await page.locator('.entry-wheel').waitFor();
      await page.locator('.entry-wheel__stage').focus();
      await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown');
      await page.waitForURL('**/#/', { timeout: 15000 });
      await page.locator('.home').waitFor();
    }
    await context.close();
  }
  assert.deepEqual(errors, []);
  console.log(`PASS ${engine}: four intros and empty guardian regions, dictionary/home card sizes, 19px lucky glyphs, inert settings/reset flow; 5 viewports, no page errors.`);
} finally { await browser.close(); }
