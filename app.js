import { PetPlayer } from './runtime/player.js';
import { STATE_GROUPS, animationDuration, withDesktopStates } from './runtime/desktop-states.js';

const canvas = document.querySelector('#pet');
const status = document.querySelector('#status');
const select = document.querySelector('#state');
const edition = document.querySelector('#edition');
const reduced = document.querySelector('#reduced');

const editions = {
  normal: { imageUrl: './assets/spritesheet.png', manifest: window.CROWN_MANIFEST },
  '8bit': { imageUrl: './pets/crown-pixel-v2/spritesheet.png', manifest: window.CROWN_PIXEL_MANIFEST }
};

reduced.checked = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

for (const group of STATE_GROUPS) {
  const options = document.createElement('optgroup');
  options.label = group.label;
  for (const state of group.states) options.append(new Option(state.label, state.id));
  select.append(options);
}

let player;
let removePointerListener;
let editionLoadToken = 0;
let stateTransitionToken = 0;

function setControlsLoading(loading) {
  edition.disabled = loading;
  select.disabled = loading;
  reduced.disabled = loading;
}

async function loadEdition(name) {
  const token = ++editionLoadToken;
  ++stateTransitionToken;
  removePointerListener?.();
  removePointerListener = undefined;
  const previousPlayer = player;
  player = undefined;
  window.crownPet = undefined;
  previousPlayer?.destroy();
  document.body.dataset.sleeping = 'false';
  window.crownDesktop?.setSleepMode(false);
  setControlsLoading(true);
  status.textContent = '正在加载…';

  let nextPlayer;
  try {
    const config = editions[name];
    if (!config?.manifest) throw new Error(`Missing bundled manifest: ${name}`);
    nextPlayer = await PetPlayer.load(canvas, {
      imageUrl: config.imageUrl,
      manifest: withDesktopStates(config.manifest),
      reducedMotion: reduced.checked
    });
    if (token !== editionLoadToken) return nextPlayer.destroy();
  } finally {
    if (token === editionLoadToken) setControlsLoading(false);
  }

  player = nextPlayer;
  window.crownPet = player;
  canvas.classList.toggle('pixel-art', name === '8bit');
  select.value = 'idle';
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
  const activePlayer = player;
  const token = ++stateTransitionToken;
  const sleeping = activePlayer.state === 'sleep' || activePlayer.state === 'sleep-enter';

  if (state === 'sleep') {
    document.body.dataset.sleeping = 'true';
    window.crownDesktop?.setSleepMode(true);
    activePlayer.setState(activePlayer.reducedMotion ? 'sleep' : 'sleep-enter', { restart: true });
    return;
  }

  if (sleeping) {
    document.body.dataset.sleeping = 'false';
    window.crownDesktop?.setSleepMode(false);
    activePlayer.setState('sleep-exit', { restart: true });
    const duration = activePlayer.reducedMotion
      ? 0
      : animationDuration(activePlayer.manifest.animations['sleep-exit']);
    await new Promise(resolve => setTimeout(resolve, duration));
    if (token !== stateTransitionToken || player !== activePlayer) return;
  }

  activePlayer.setState(state, { restart: true });
}

select.addEventListener('change', () => setSelectedState(select.value));
edition.addEventListener('change', async () => {
  try { await loadEdition(edition.value); }
  catch (error) { status.textContent = `无法加载：${error.message}`; }
});
reduced.addEventListener('change', () => player?.setReducedMotion(reduced.checked));
canvas.addEventListener('click', () => {
  if (!player) return;
  if (['sleep', 'sleep-enter', 'sleep-exit'].includes(player.state)) {
    select.value = 'idle';
    setSelectedState('idle');
  } else {
    select.value = 'idle';
    setSelectedState('jumping');
  }
});

try {
  await loadEdition(edition.value);
} catch (error) {
  status.textContent = `无法加载：${error.message}`;
}

window.addEventListener('pagehide', () => {
  removePointerListener?.();
  player?.destroy();
}, { once: true });

document.querySelector('#close').addEventListener('click', () => window.crownDesktop?.close());
