import { animationColumn, directionIndex, frameAt, cellRect } from './geometry.js';

/** Framework-independent sprite renderer. It draws supplied pixels; it never redraws the character. */
export class PetPlayer {
  constructor(canvas, image, manifest, { reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches } = {}) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    if (!this.context) throw new Error('Canvas 2D unavailable');
    this.image = image;
    this.manifest = manifest;
    if (image.naturalWidth !== manifest.atlas.width || image.naturalHeight !== manifest.atlas.height) throw new Error('Atlas dimensions do not match manifest');
    canvas.width = manifest.atlas.cellWidth;
    canvas.height = manifest.atlas.cellHeight;
    this.context.imageSmoothingEnabled = manifest.rendering?.scaleMode !== 'nearest-neighbor';
    this.reducedMotion = reducedMotion;
    this.state = 'idle';
    this.started = performance.now();
    this.look = null;
    this.destroyed = false;
    this.handleVisibility = () => {
      cancelAnimationFrame(this.raf);
      if (!document.hidden && !this.destroyed) {
        this.started = performance.now();
        this.tick(this.started);
      }
    };
    document.addEventListener('visibilitychange', this.handleVisibility);
    this.tick(this.started);
  }

  static async load(canvas, { imageUrl, manifest, ...options }) {
    const image = new Image();
    image.src = imageUrl;
    await image.decode();
    return new PetPlayer(canvas, image, manifest, options);
  }

  setState(state, { restart = false } = {}) {
    if (!Object.hasOwn(this.manifest.animations, state)) throw new RangeError(`Unknown pet state: ${state}`);
    if (state === this.state && !restart) return;
    this.state = state;
    this.started = performance.now();
    this.look = null;
  }

  /** Screen coordinates: dx positive right, dy positive down. Only idle follows the pointer. */
  lookAt(dx, dy) {
    this.look = this.state === 'idle' && Math.hypot(dx, dy) >= 18 ? directionIndex(dx, dy) : null;
  }

  clearLook() { this.look = null; }

  setReducedMotion(value) { this.reducedMotion = Boolean(value); }

  draw(row, column) {
    const key = `${row}:${column}`;
    if (this.lastCell === key) return;
    this.lastCell = key;
    const r = cellRect(this.manifest, row, column);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(this.image, r.x, r.y, r.width, r.height, 0, 0, r.width, r.height);
  }

  tick = now => {
    if (this.destroyed || document.hidden) return;
    const animation = this.manifest.animations[this.state];
    if (this.reducedMotion) {
      this.draw(animation.row, animationColumn(animation, 0));
    } else if (this.look !== null && this.state === 'idle') {
      this.draw(9 + Math.floor(this.look / 8), this.look % 8);
    } else {
      const frame = frameAt(animation.durationsMs, now - this.started, animation.loop);
      if (frame.done && animation.next) {
        this.setState(animation.next);
        const nextAnimation = this.manifest.animations[this.state];
        this.draw(nextAnimation.row, animationColumn(nextAnimation, 0));
      } else this.draw(animation.row, animationColumn(animation, frame.index));
    }
    this.raf = requestAnimationFrame(this.tick);
  };

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    document.removeEventListener('visibilitychange', this.handleVisibility);
  }
}
