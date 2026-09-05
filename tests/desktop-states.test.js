import test from 'node:test';
import assert from 'node:assert/strict';
import { DESKTOP_ANIMATIONS, STATE_GROUPS, animationDuration, withDesktopStates } from '../runtime/desktop-states.js';

test('sleep is exposed as one desktop state backed by three internal phases', () => {
  const desktop = STATE_GROUPS.find(group => group.id === 'desktop');
  assert.deepEqual(desktop.states.map(state => state.id), ['sleep']);
  assert.deepEqual(Object.keys(DESKTOP_ANIMATIONS), ['sleep-enter', 'sleep', 'sleep-exit']);
});

test('desktop state extension works for normal and 8-bit manifests without mutation', () => {
  for (const name of ['normal', '8bit']) {
    const base = { name, animations: { idle: { row: 0 } } };
    const extended = withDesktopStates(base);
    assert.equal(base.animations.sleep, undefined);
    assert.equal(extended.animations['sleep-enter'].next, 'sleep');
    assert.equal(extended.animations['sleep-exit'].next, 'idle');
  }
});

test('sleep frame sequences stay within the eight-column v2 atlas', () => {
  for (const animation of Object.values(DESKTOP_ANIMATIONS)) {
    assert.equal(animation.frameIndices.length, animation.durationsMs.length);
    assert.ok(animation.frameIndices.every(column => column >= 0 && column < 8));
    assert.ok(animationDuration(animation) > 0);
  }
});
