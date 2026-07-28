const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("wrDesktop", {
  loadState: () => ipcRenderer.invoke("state:load"),
  saveState: (state) => ipcRenderer.invoke("state:save", state),
  listDisplays: () => ipcRenderer.invoke("display:list"),
  openOutput: (mode, displayId) =>
    ipcRenderer.invoke("output:open", { mode, displayId }),
  closeOutput: (mode) => ipcRenderer.invoke("output:close", mode),
  sendOutput: (payload) => ipcRenderer.send("output:update", payload),
  chooseFiles: (filters) => ipcRenderer.invoke("dialog:files", filters),
  chooseDirectory: () => ipcRenderer.invoke("dialog:directory"),
  readTextFile: (filePath) => ipcRenderer.invoke("file:read-text", filePath),
  toFileUrl: (filePath) => ipcRenderer.invoke("file:to-url", filePath),
  openLouvorJa: () => ipcRenderer.invoke("external:louvorja"),
  onOutput: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on("output:update", listener);
    return () => ipcRenderer.removeListener("output:update", listener);
  },
});
