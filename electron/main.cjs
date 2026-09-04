const { app, BrowserWindow, ipcMain, screen, Menu } = require('electron');
const path = require('node:path');
let win;
let pointerTimer;

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
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', event => event.preventDefault());
  win.loadFile(path.join(__dirname, '..', 'index.html'));
  win.once('ready-to-show', () => win.show());
  ipcMain.on('crown:close', event => {
    if (event.sender === win?.webContents) win.close();
  });
  // OS-level pointer comes from Electron; the portable player accepts only coordinates.
  pointerTimer = setInterval(() => {
    if (!win || win.isDestroyed() || !win.isVisible()) return;
    const p = screen.getCursorScreenPoint();
    const bounds = win.getContentBounds();
    win.webContents.send('crown:pointer', { x: p.x - bounds.x, y: p.y - bounds.y });
  }, 80);
  win.on('closed', () => { clearInterval(pointerTimer); win = null; });
});
app.on('window-all-closed', () => app.quit());
