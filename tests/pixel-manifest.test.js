import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PetPlayer } from '../runtime/player.js';

const manifest = JSON.parse(
  await readFile(new URL('../pets/crown-pixel-v2/manifest.json', import.meta.url), 'utf8'),
);

test('Crown Pixel manifest loads through PetPlayer', () => {
  const draws = [];
  const context = {
    clearRect() {},
    drawImage(...args) { draws.push(args); },
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => context,
  };
  const image = {
    naturalWidth: manifest.atlas.width,
    naturalHeight: manifest.atlas.height,
  };

  const previousDocument = globalThis.document;
  const previousRequestAnimationFrame = globalThis.requestAnimationFrame;
  const previousCancelAnimationFrame = globalThis.cancelAnimationFrame;
  globalThis.document = {
    hidden: false,
    addEventListener() {},
    removeEventListener() {},
  };
  globalThis.requestAnimationFrame = () => 1;
  globalThis.cancelAnimationFrame = () => {};

  try {
    const player = new PetPlayer(canvas, image, manifest, { reducedMotion: false });
    assert.equal(canvas.width, 192);
    assert.equal(canvas.height, 208);
    assert.equal(player.state, 'idle');
    assert.equal(draws.length, 1);
    assert.deepEqual(draws[0].slice(1, 5), [0, 0, 192, 208]);
    player.destroy();
  } finally {
    globalThis.document = previousDocument;
    globalThis.requestAnimationFrame = previousRequestAnimationFrame;
    globalThis.cancelAnimationFrame = previousCancelAnimationFrame;
  }
});
