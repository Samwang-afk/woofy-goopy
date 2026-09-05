export function directionIndex(dx, dy) {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) throw new TypeError('Finite direction required');
  if (dx === 0 && dy === 0) return null;
  const degrees = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
  return Math.round(degrees / 22.5) % 16;
}

export function frameAt(durations, elapsed, loop = true) {
  if (!durations.length || durations.some(x => !Number.isFinite(x) || x <= 0)) throw new TypeError('Positive frame durations required');
  const total = durations.reduce((a, b) => a + b, 0);
  let t = Math.max(0, elapsed);
  if (!loop && t >= total) return { index: durations.length - 1, done: true };
  t %= total;
  for (let i = 0; i < durations.length; i++) {
    if (t < durations[i]) return { index: i, done: false };
    t -= durations[i];
  }
  return { index: 0, done: false };
}

export function animationColumn(animation, timingIndex) {
  const column = animation.frameIndices?.[timingIndex] ?? timingIndex;
  if (!Number.isInteger(column) || column < 0) throw new RangeError('Invalid animation frame column');
  return column;
}

export function cellRect(manifest, row, column) {
  if (!Number.isInteger(row) || !Number.isInteger(column) || row < 0 || row >= manifest.atlas.rows || column < 0 || column >= manifest.atlas.columns) throw new RangeError('Cell outside atlas');
  const { cellWidth: w, cellHeight: h } = manifest.atlas;
  return { x: column * w, y: row * h, width: w, height: h };
}
