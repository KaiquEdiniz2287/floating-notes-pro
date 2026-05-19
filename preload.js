const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // =====================================
  // STORE
  // =====================================

  loadData: () => ipcRenderer.invoke("load-data"),

  saveData: (data) => ipcRenderer.invoke("save-data", data),

  // =====================================
  // VERSION
  // =====================================

  getVersion: () => ipcRenderer.invoke("get-version"),

  // =====================================
  // SHORTCUTS
  // =====================================

  onNewTabShortcut: (callback) => {
    ipcRenderer.on("shortcut-new-tab", () => callback());
  },
});
