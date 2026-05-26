const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  shell,
} = require("electron"); // Menu e MenuItem removidos

const path = require("path");
// https e fs removidos — não são mais usados

const Store = require("electron-store");
const { autoUpdater } = require("electron-updater");
const store = new Store();

const { dialog } = require("electron");
const fs = require("fs");

// =====================================
// WINDOW STATE
// =====================================

function getWindowState() {
  return (
    store.get("windowState") || {
      width: 1100,
      height: 750,
      x: undefined,
      y: undefined,
      isMaximized: false,
    }
  );
}

// =====================================
// CREATE WINDOW
// =====================================

function createWindow() {
  const windowState = getWindowState();

  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,

    x: windowState.x,
    y: windowState.y,

    frame: true,

    minWidth: 700,
    minHeight: 500,

    backgroundColor: "#111827",

    autoHideMenuBar: true,

    title: `Floating Notes v${app.getVersion()}`,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // RESTAURA MAXIMIZADO
  if (windowState.isMaximized) {
    mainWindow.maximize();
  }

  mainWindow.loadFile("popup.html");

  // =====================================
  // SAVE WINDOW STATE
  // =====================================

  const saveWindowState = () => {
    if (!mainWindow) return;

    // NÃO salva tamanho minimizado
    if (mainWindow.isMinimized()) return;

    const bounds = mainWindow.getBounds();

    store.set("windowState", {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
      isMaximized: mainWindow.isMaximized(),
    });
  };

  // salva ao mover/redimensionar
  mainWindow.on("resize", saveWindowState);
  mainWindow.on("move", saveWindowState);

  // salva ao maximizar/desmaximizar
  mainWindow.on("maximize", saveWindowState);
  mainWindow.on("unmaximize", saveWindowState);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // DEVTOOLS
  // mainWindow.webContents.openDevTools();
}

// =====================================
// APP READY
// =====================================
app.whenReady().then(() => {
  createWindow();

  // =====================================
  // GLOBAL SHORTCUTS
  // =====================================
  globalShortcut.register("CommandOrControl+Alt+N", () => {
    if (!mainWindow) {
      createWindow();
      return;
    }
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  });

  globalShortcut.register("CommandOrControl+Alt+T", () => {
    if (mainWindow) mainWindow.webContents.send("shortcut-new-tab");
  });

  globalShortcut.register("CommandOrControl+Alt+P", () => {
    if (!mainWindow) return;
    const current = mainWindow.isAlwaysOnTop();
    mainWindow.setAlwaysOnTop(!current);
  });

  // =====================================
  // AUTO UPDATE
  // =====================================
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("update-available", (info) => {
    console.log("Update available:", info.version);
    if (mainWindow)
      mainWindow.webContents.send("update-available", info.version);
  });

  autoUpdater.on("update-not-available", () => {
    console.log("No updates.");
  });

  autoUpdater.on("download-progress", (progress) => {
    const percent = Math.round(progress.percent);
    console.log(`Download: ${percent}%`);
    if (mainWindow) mainWindow.webContents.send("update-progress", percent);
  });

  autoUpdater.on("update-downloaded", () => {
    console.log("Update downloaded.");
    if (mainWindow) mainWindow.webContents.send("update-downloaded");
  });

  autoUpdater.on("error", (err) => {
    console.error("Updater error:", err == null ? "unknown" : err.stack || err);
  });

  // RESTART quando renderer pedir
  ipcMain.on("restart-app", () => {
    autoUpdater.quitAndInstall();
  });

  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 3000);
});

// =====================================
// IPC
// ===================================
/* ipcMain.handle("load-notes", () => store.get("notes"));
ipcMain.handle("save-notes", (event, notes) => {
  store.set("notes", notes);
  return true;
}); */
/* SALVA PDF */
ipcMain.handle("save-pdf", async (_, pdf) => {
  const result = await dialog.showSaveDialog({
    defaultPath: pdf.filename,
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  });
  if (result.canceled) return;
  fs.writeFileSync(result.filePath, Buffer.from(pdf.data));
  return result.filePath;
});
/* ABRE ARQUIVO */
ipcMain.handle("open-file", async (_, filePath) => {
  shell.openPath(filePath);
});
/* SALVA TXT */
ipcMain.handle("save-txt", async (_, txt) => {
  const result = await dialog.showSaveDialog({
    defaultPath: txt.filename,
    filters: [{ name: "Texto", extensions: ["txt"] }],
  });

  if (result.canceled) return;

  fs.writeFileSync(result.filePath, txt.content, "utf-8");

  return result.filePath;
});

// =====================================
// MACOS
// =====================================
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// =====================================
// STORE SAVE / LOAD
// =====================================
ipcMain.handle("save-data", async (_, data) => {
  store.set("floatingNotesData", data);
  return true;
});
ipcMain.handle("load-data", async () => store.get("floatingNotesData"));

// =====================================
// CLEAN SHORTCUTS
// =====================================
app.on("will-quit", () => globalShortcut.unregisterAll());

// =====================================
// APP VERSION
// =====================================
ipcMain.handle("get-version", () => app.getVersion());
