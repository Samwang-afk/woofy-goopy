import { PetPlayer } from './runtime/player.js';
import { STATE_GROUPS, animationDuration, withDesktopStates } from './runtime/desktop-states.js';

const canvas = document.querySelector('#pet');
const status = document.querySelector('#status');
const select = document.querySelector('#state');
const edition = document.querySelector('#edition');
const reduced = document.querySelector('#reduced');

const editions = {
  normal: { imageUrl: './assets/spritesheet.png', manifestUrl: './manifest.json' },
  '8bit': { imageUrl: './pets/crown-pixel-v2/spritesheet.png', manifestUrl: './pets/crown-pixel-v2/manifest.json' }
};

for (const group of STATE_GROUPS) {
  const options = document.createElement('optgroup');
  options.label = group.label;
  for (const state of group.states) options.append(new Option(state.label, state.id));
  select.append(options);
}

let player;
let removePointerListener;
let transitionToken = 0;

async function loadEdition(name) {
  const token = ++transitionToken;
  removePointerListener?.();
  player?.destroy();

  const config = editions[name];
  const response = await fetch(config.manifestUrl);
  if (!response.ok) throw new Error(`Manifest request failed: ${response.status}`);
  const manifest = withDesktopStates(await response.json());
  const nextPlayer = await PetPlayer.load(canvas, {
    imageUrl: config.imageUrl,
    manifest,
    reducedMotion: reduced.checked
  });
  if (token !== transitionToken) return nextPlayer.destroy();

  player = nextPlayer;
  window.crownPet = player;
  canvas.classList.toggle('pixel-art', name === '8bit');
  select.value = 'idle';
  document.body.dataset.sleeping = 'false';
  window.crownDesktop?.setSleepMode(false);
  status.textContent = `${name === '8bit' ? '8-bit' : 'Normal'} · 移动鼠标让它看向你`;

  const onPointer = ({ x, y }) => {
    const r = canvas.getBoundingClientRect();
    player.lookAt(x - r.left - r.width / 2, y - r.top - r.height * .4);
  };
  if (window.crownDesktop) removePointerListener = window.crownDesktop.onPointer(onPointer);
  else {
    const handlePointerMove = event => onPointer({ x: event.clientX, y: event.clientY });
    document.addEventListener('pointermove', handlePointerMove);
    removePointerListener = () => document.removeEventListener('pointermove', handlePointerMove);
  }
}

async function setSelectedState(state) {
  if (!player) return;
  const token = ++transitionToken;
  const sleeping = player.state === 'sleep' || player.state === 'sleep-enter';

  if (state === 'sleep') {
    document.body.dataset.sleeping = 'true';
    window.crownDesktop?.setSleepMode(true);
    player.setState(player.reducedMotion ? 'sleep' : 'sleep-enter', { restart: true });
    return;
  }

  if (sleeping) {
    document.body.dataset.sleeping = 'false';
    window.crownDesktop?.setSleepMode(false);
    player.setState('sleep-exit', { restart: true });
    const duration = animationDuration(player.manifest.animations['sleep-exit']);
    await new Promise(resolve => setTimeout(resolve, duration));
    if (token !== transitionToken || !player) return;
  }

  player.setState(state, { restart: true });
}

select.addEventListener('change', () => setSelectedState(select.value));
edition.addEventListener('change', async () => {
  try { await loadEdition(edition.value); }
  catch (error) { status.textContent = `无法加载：${error.message}`; }
});
reduced.addEventListener('change', () => player?.setReducedMotion(reduced.checked));
canvas.addEventListener('click', () => {
  if (!player) return;
  if (player.state === 'sleep' || player.state === 'sleep-enter') {
    select.value = 'idle';
    setSelectedState('idle');
  } else {
    player.setState('jumping', { restart: true });
    select.value = 'idle';
  }
});

try {
  await loadEdition(edition.value);
  reduced.checked = player.reducedMotion;
} catch (error) {
  status.textContent = `无法加载：${error.message}`;
}

window.addEventListener('pagehide', () => {
  removePointerListener?.();
  player?.destroy();
}, { once: true });

document.querySelector('#close').addEventListener('click', () => window.crownDesktop?.close());
