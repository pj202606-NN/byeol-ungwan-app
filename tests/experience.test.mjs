import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom' });
after(() => server.close());
const { clearExperienceStorage } = await server.ssrLoadModule('/src/entry/resetExperience.ts');
const { spinDestination, angleDelta } = await server.ssrLoadModule('/src/entry/wheelGesture.ts');

test('초기화는 모든 앱 체험 입력·기록만 지우고 다른 세션 키를 보존한다', () => {
  const entries = new Map([
    ['byeolungwan.profile.v1', 'profile'],
    ['byeolungwan.records.v1:a:2000-01-01', 'a'],
    ['byeolungwan.records.v1:b:2000-01-02', 'b'],
    ['another-app', 'keep'],
  ]);
  clearExperienceStorage({ get length() { return entries.size; }, key: (i) => [...entries.keys()][i], removeItem: (key) => entries.delete(key) });
  assert.deepEqual([...entries], [['another-app', 'keep']]);
  assert.doesNotThrow(() => clearExperienceStorage({ get length() { throw Error('blocked'); } }));
});

test('드래그 각도와 회전 방향을 유지하고 28개 칸 모두 정확히 정렬한다', () => {
  for (const rotation of [-179, -20, 16, 179, 400, -400]) {
    for (let slot = 0; slot < 28; slot++) {
      const destination = spinDestination(rotation, slot);
      assert.equal(Math.sign(destination - rotation), Math.sign(rotation));
      assert.ok(Math.abs(destination - rotation) >= 1080);
      assert.ok(Math.abs(destination - rotation) < 1440);
      const target = -(slot + 0.5) * 360 / 28;
      assert.ok(Math.abs(angleDelta(target, destination)) < 1e-9);
    }
  }
});

test('각도 경계 ±180도를 넘어도 손가락 움직임만큼 회전한다', () => {
  assert.equal(angleDelta(179, -179), 2);
  assert.equal(angleDelta(-179, 179), -2);
});
