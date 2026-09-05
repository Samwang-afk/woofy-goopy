const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('crownDesktop', {
  close: () => ipcRenderer.send('crown:close'),
  setSleepMode: sleeping => ipcRenderer.send('crown:sleep-mode', Boolean(sleeping)),
  onPointer: callback => {
    const listener = (_event, point) => callback(point);
    ipcRenderer.on('crown:pointer', listener);
    return () => ipcRenderer.removeListener('crown:pointer', listener);
  }
});
