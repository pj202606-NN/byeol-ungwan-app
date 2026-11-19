// Read-only capture of the public dashboard. No account, forms, or updates are used.
import { mkdir, writeFile } from 'node:fs/promises';
import { MANSIONS } from '../public/data/28su_database_final_updated_20261119.js';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const source = 'https://28su-dashboard.vercel.app/result/overview';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  await page.goto(source, { timeout: 30000, waitUntil: 'domcontentloaded' });
  const rows = [];
  for (const star of MANSIONS) {
    await page.getByText(star.수, { exact: true }).click();
    await page.getByRole('button', { name: '닫기', exact: true }).waitFor();
    const body = await page.locator('body').innerText();
    const start = body.lastIndexOf(`${star.수} ·`);
    if (start < 0) throw Error(`Cannot identify modal ${star.id}`);
    const rawText = body.slice(start);
    const magnitude = /겉보기 등급\n([\d.]+)등급/.exec(rawText);
    const timing = /최적 관측 시기\n([^\n]+)\n\n([\s\S]*?)\n\n행운의 색/.exec(rawText);
    const representative = /거성\n([^\n]+)/.exec(rawText);
    if (!magnitude || !timing || !representative) throw Error(`Incomplete dashboard fields ${star.id}`);
    rows.push({ starId: star.id, mansion: star.수, representativeStar: representative[1],
      displayedMagnitude: Number(magnitude[1]), magnitudeLabel: '겉보기 등급',
      recommendedMonth: timing[1], observationDescription: timing[2], rawText });
    await page.getByRole('button', { name: '닫기', exact: true }).click();
  }
  await mkdir('src/data/constellations', { recursive: true });
  await writeFile('src/data/constellations/dashboard.snapshot.json', JSON.stringify({ source,
    capturedAt: new Date().toISOString(), verificationStatus: 'dashboard-transcribed-not-astronomically-verified', rows }, null, 2) + '\n');
  console.log(`Captured ${rows.length} public dashboard observation records.`);
} finally { await browser.close(); }
