const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('crownDesktop', {
  close: () => ipcRenderer.send('crown:close'),
  onPointer: callback => {
    const listener = (_event, point) => callback(point);
    ipcRenderer.on('crown:pointer', listener);
    return () => ipcRenderer.removeListener('crown:pointer', listener);
  }
});
