import { PetPlayer } from './runtime/player.js';
const canvas = document.querySelector('#pet');
const status = document.querySelector('#status');
const select = document.querySelector('#state');
const reduced = document.querySelector('#reduced');
const labels = { idle:'待机', 'running-right':'向右奔跑', 'running-left':'向左奔跑', waving:'打招呼', jumping:'跳跃', failed:'失败', waiting:'等待输入', running:'思考工作', review:'检查结果' };
for (const [key, label] of Object.entries(labels)) select.add(new Option(label, key));
try {
  const player = await PetPlayer.load(canvas, { imageUrl: './assets/spritesheet.png', manifest: window.CROWN_MANIFEST });
  window.crownPet = player;
  reduced.checked = player.reducedMotion;
  status.textContent = '移动鼠标让它看向你';
  select.addEventListener('change', () => player.setState(select.value, { restart: true }));
  reduced.addEventListener('change', () => player.setReducedMotion(reduced.checked));
  canvas.addEventListener('click', () => { player.setState('jumping', { restart: true }); select.value = 'idle'; });
  const onPointer = ({ x, y }) => {
    const r = canvas.getBoundingClientRect();
    player.lookAt(x - r.left - r.width / 2, y - r.top - r.height * .4);
  };
  let off;
  if (window.crownDesktop) off = window.crownDesktop.onPointer(onPointer);
  else {
    document.addEventListener('pointermove', event => onPointer({ x: event.clientX, y: event.clientY }));
    document.addEventListener('pointerleave', () => player.clearLook());
  }
  window.addEventListener('pagehide', () => { off?.(); player.destroy(); }, { once: true });
} catch (error) {
  status.textContent = `无法加载：${error.message}`;
}
document.querySelector('#close').addEventListener('click', () => window.crownDesktop?.close());
