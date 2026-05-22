const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  loadData: () => ipcRenderer.invoke("load-data"),
  saveData: (data) => ipcRenderer.invoke("save-data", data),
  getVersion: () => ipcRenderer.invoke("get-version"),
  onNewTabShortcut: (callback) => {
    ipcRenderer.on("shortcut-new-tab", () => callback());
  },
  onUpdateAvailable: (cb) =>
    ipcRenderer.on("update-available", (_, version) => cb(version)),
  onUpdateProgress: (cb) =>
    ipcRenderer.on("update-progress", (_, percent) => cb(percent)),
  onUpdateDownloaded: (cb) => ipcRenderer.on("update-downloaded", () => cb()),
  restartApp: () => ipcRenderer.send("restart-app"),
});
