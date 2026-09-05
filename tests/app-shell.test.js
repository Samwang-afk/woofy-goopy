import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);

test('Electron shell bundles both manifests before the module app', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');
  const normalManifest = html.indexOf('<script src="manifest.js"></script>');
  const pixelManifest = html.indexOf('<script src="pets/crown-pixel-v2/manifest.js"></script>');
  const app = html.indexOf('<script type="module" src="app.js"></script>');

  assert.ok(normalManifest >= 0);
  assert.ok(pixelManifest > normalManifest);
  assert.ok(app > pixelManifest);
});

test('renderer does not fetch manifests from file URLs', async () => {
  const source = await readFile(new URL('app.js', root), 'utf8');
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.match(source, /editionLoadToken/);
  assert.match(source, /stateTransitionToken/);
});

test('8-bit bundled manifest exposes the player schema', async () => {
  const source = await readFile(new URL('pets/crown-pixel-v2/manifest.js', root), 'utf8');
  const context = { window: {} };
  vm.runInNewContext(source, context);

  const manifest = context.window.CROWN_PIXEL_MANIFEST;
  assert.equal(manifest.atlas.cellWidth, 192);
  assert.equal(manifest.atlas.cellHeight, 208);
  assert.equal(manifest.rendering.scaleMode, 'nearest-neighbor');
  assert.ok(manifest.animations.idle);
  assert.ok(manifest.animations.failed);
});
