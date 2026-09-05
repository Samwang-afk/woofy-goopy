import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { clampBoundsToWorkArea } = require('../electron/window-bounds.cjs');

test('saved awake bounds are moved fully inside a smaller work area', () => {
  const bounds = { x: 1800, y: 900, width: 360, height: 430 };
  const workArea = { x: 0, y: 0, width: 1280, height: 720 };
  assert.deepEqual(
    clampBoundsToWorkArea(bounds, workArea),
    { x: 920, y: 290, width: 360, height: 430 }
  );
});

test('a window larger than the work area is resized to remain recoverable', () => {
  const bounds = { x: -200, y: -100, width: 1600, height: 900 };
  const workArea = { x: 0, y: 0, width: 1280, height: 720 };
  assert.deepEqual(
    clampBoundsToWorkArea(bounds, workArea),
    { x: 0, y: 0, width: 1280, height: 720 }
  );
});
