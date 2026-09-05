const { app, BrowserWindow, ipcMain, screen, Menu } = require('electron');
const path = require('node:path');
const { clamp, clampBoundsToWorkArea } = require('./window-bounds.cjs');
let win;
let pointerTimer;
let sleeping = false;
let awakeBounds;
let handleDisplayMetricsChanged;

const SLEEP_WIDTH = 192;
const SLEEP_HEIGHT = 208;
const PET_BASELINE_Y = 203;

function revalidateAwakeBounds() {
  if (!awakeBounds) return;
  const display = screen.getDisplayMatching(awakeBounds);
  awakeBounds = clampBoundsToWorkArea(awakeBounds, display.workArea);
}

function sleepBounds() {
  const current = awakeBounds || win.getBounds();
  const display = screen.getDisplayMatching(current);
  const { bounds, workArea } = display;
  const screenBottom = bounds.y + bounds.height;
  const workBottom = workArea.y + workArea.height;
  const bottomInset = screenBottom - workBottom;
  const hasBottomSystemBar = bottomInset > 8;
  const ledge = hasBottomSystemBar ? workBottom : screenBottom;
  const centeredX = current.x + Math.round((current.width - SLEEP_WIDTH) / 2);
  return {
    x: clamp(centeredX, workArea.x, workArea.x + workArea.width - SLEEP_WIDTH),
    y: hasBottomSystemBar
      ? Math.round(ledge - PET_BASELINE_Y + 2)
      : screenBottom - SLEEP_HEIGHT,
    width: SLEEP_WIDTH,
    height: SLEEP_HEIGHT
  };
}

function setSleepMode(value) {
  if (!win || win.isDestroyed() || sleeping === value) return;
  sleeping = value;
  if (sleeping) {
    awakeBounds = win.getBounds();
    win.setBounds(sleepBounds(), true);
  } else if (awakeBounds) {
    revalidateAwakeBounds();
    win.setBounds(awakeBounds, true);
    awakeBounds = undefined;
  }
}

app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 300, height: 360, transparent: true, frame: false,
    resizable: false, alwaysOnTop: true, hasShadow: false, show: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true, nodeIntegration: false, sandbox: true
    }
  });
  Menu.setApplicationMenu(null);
  win.setSkipTaskbar(true);
  win.setAlwaysOnTop(true, 'floating');
  if (process.platform === 'darwin') {
    app.dock.hide();
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: false });
    win.setHiddenInMissionControl(true);
  }
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', event => event.preventDefault());
  win.loadFile(path.join(__dirname, '..', 'index.html'));
  win.once('ready-to-show', () => win.show());
  ipcMain.on('crown:close', event => {
    if (event.sender === win?.webContents) win.close();
  });
  ipcMain.on('crown:sleep-mode', (event, value) => {
    if (event.sender === win?.webContents) setSleepMode(Boolean(value));
  });
  handleDisplayMetricsChanged = (_event, _display, metrics) => {
    if (sleeping && metrics.some(metric => ['bounds', 'workArea', 'scaleFactor'].includes(metric))) {
      revalidateAwakeBounds();
      win.setBounds(sleepBounds(), false);
    }
  };
  screen.on('display-metrics-changed', handleDisplayMetricsChanged);
  // OS-level pointer comes from Electron; the portable player accepts only coordinates.
  pointerTimer = setInterval(() => {
    if (!win || win.isDestroyed() || !win.isVisible()) return;
    const p = screen.getCursorScreenPoint();
    const bounds = win.getContentBounds();
    win.webContents.send('crown:pointer', { x: p.x - bounds.x, y: p.y - bounds.y });
  }, 80);
  win.on('closed', () => {
    clearInterval(pointerTimer);
    screen.removeListener('display-metrics-changed', handleDisplayMetricsChanged);
    ipcMain.removeAllListeners('crown:close');
    ipcMain.removeAllListeners('crown:sleep-mode');
    win = null;
  });
});
app.on('window-all-closed', () => app.quit());
