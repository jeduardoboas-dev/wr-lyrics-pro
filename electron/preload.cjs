const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("wrDesktop", {
  loadState: () => ipcRenderer.invoke("state:load"),
  saveState: (state) => ipcRenderer.invoke("state:save", state),
  listDisplays: () => ipcRenderer.invoke("display:list"),
  openOutput: (mode, displayId) =>
    ipcRenderer.invoke("output:open", { mode, displayId }),
  closeOutput: (mode) => ipcRenderer.invoke("output:close", mode),
  requestEmergencyClear: () => ipcRenderer.send("emergency:clear"),
  sendOutput: (payload) => ipcRenderer.send("output:update", payload),
  chooseFiles: (filters) => ipcRenderer.invoke("dialog:files", filters),
  readTextFile: (filePath) => ipcRenderer.invoke("file:read-text", filePath),
  toFileUrl: (filePath) => ipcRenderer.invoke("file:to-url", filePath),
  getLouvorJaSetup: () => ipcRenderer.invoke("louvor-ja:setup"),
  inspectLouvorJa: (selectedPath) => ipcRenderer.invoke("louvor-ja:inspect", selectedPath),
  searchLouvorJa: (selectedPath, searchText) => ipcRenderer.invoke("louvor-ja:search", { selectedPath, searchText }),
  playLouvorJa: (selectedPath, songId, tag) => ipcRenderer.invoke("louvor-ja:play", { selectedPath, songId, tag }),
  openLouvorJa: (selectedPath) => ipcRenderer.invoke("louvor-ja:open", selectedPath),
  onOutput: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on("output:update", listener);
    return () => ipcRenderer.removeListener("output:update", listener);
  },
  onEmergencyClear: (callback) => {
    const listener = () => callback();
    ipcRenderer.on("emergency:clear", listener);
    return () => ipcRenderer.removeListener("emergency:clear", listener);
  },
});
