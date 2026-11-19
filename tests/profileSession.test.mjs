import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom' });
after(() => server.close());
const { readSessionProfile, saveSessionProfile, PROFILE_SESSION_KEY } = await server.ssrLoadModule('/src/entry/profileSession.ts');
const { resolveBirthConstellation } = await server.ssrLoadModule('/src/services/birthConstellation.ts');
function storage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
}

test('입력한 생일을 복원하면 새로고침 이후에도 삵자리로 판정한다', () => {
  const session = storage();
  const profile = { name: '관람객', birthDate: '2000-12-18', birthTime: '13:30' };
  saveSessionProfile(profile, session);
  const restored = readSessionProfile(session);
  assert.deepEqual(restored, profile);
  assert.equal(resolveBirthConstellation(restored.birthDate).starId, 21);
});

test('재설정은 세션 입력값도 삭제하고 예시 사용자로 대체하지 않는다', () => {
  const session = storage();
  saveSessionProfile({ name: '관람객', birthDate: '2000-12-18' }, session);
  saveSessionProfile(null, session);
  assert.equal(session.getItem(PROFILE_SESSION_KEY), null);
  assert.equal(readSessionProfile(session), null);
});

test('깨진 JSON과 잘못된 생일·시각은 버리고 입력을 다시 받는다', () => {
  for (const saved of ['broken', 'null', '{}', JSON.stringify({ name: '관람객', birthDate: '2000-02-30' }), JSON.stringify({ name: '관람객', birthDate: '2999-01-01' }), JSON.stringify({ name: '관람객', birthDate: '2000-12-18', birthTime: '자시' })]) {
    const session = storage();
    session.setItem(PROFILE_SESSION_KEY, saved);
    assert.equal(readSessionProfile(session), null);
    assert.equal(session.getItem(PROFILE_SESSION_KEY), null);
  }
});

test('저장소를 사용할 수 없어도 읽기·저장은 예외 없이 처리한다', () => {
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };
  assert.equal(readSessionProfile(blocked), null);
  assert.doesNotThrow(() => saveSessionProfile({ name: '관람객', birthDate: '2000-12-18' }, blocked));
});
