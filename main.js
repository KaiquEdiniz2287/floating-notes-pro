const { app, BrowserWindow, globalShortcut, ipcMain } = require("electron");

const path = require("path");

const Store = require("electron-store");

const { autoUpdater } = require("electron-updater");

const store = new Store();

// =====================================
// CREATE WINDOW
// =====================================

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,

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

  mainWindow.loadFile("popup.html");

  // DEVTOOLS
  // mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// =====================================
// APP READY
// =====================================

app.whenReady().then(() => {
  createWindow();

  // =====================================
  // GLOBAL SHORTCUTS
  // =====================================

  // OPEN APP
  globalShortcut.register("CommandOrControl+Alt+N", () => {
    if (!mainWindow) {
      createWindow();
      return;
    }

    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    mainWindow.show();

    mainWindow.focus();
  });

  // NEW TAB
  globalShortcut.register("CommandOrControl+Alt+T", () => {
    if (mainWindow) {
      mainWindow.webContents.send("shortcut-new-tab");
    }
  });

  // ALWAYS ON TOP
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

  autoUpdater.on("checking-for-update", () => {
    console.log("Checking for update...");
  });

  autoUpdater.on("update-available", (info) => {
    console.log("Update available:", info.version);
  });

  autoUpdater.on("update-not-available", () => {
    console.log("No updates.");
  });

  autoUpdater.on("download-progress", (progress) => {
    console.log(`Download: ${Math.round(progress.percent)}%`);
  });

  autoUpdater.on("update-downloaded", () => {
    console.log("Update downloaded.");

    autoUpdater.quitAndInstall();
  });

  autoUpdater.on("error", (err) => {
    console.error("Updater error:", err == null ? "unknown" : err.stack || err);
  });

  // CHECK

  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 3000);
});

// =====================================
// STORE IPC
// =====================================

// LOAD NOTES
ipcMain.handle("load-notes", () => {
  return store.get("notes");
});

// SAVE NOTES
ipcMain.handle("save-notes", (event, notes) => {
  store.set("notes", notes);

  return true;
});

// =====================================
// MACOS
// =====================================

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// =====================================
// CLOSE ALL WINDOWS
// =====================================

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// =====================================
// STORE SAVE
// =====================================

ipcMain.handle("save-data", async (_, data) => {
  store.set("floatingNotesData", data);

  return true;
});

// =====================================
// STORE LOAD
// =====================================

ipcMain.handle("load-data", async () => {
  return store.get("floatingNotesData");
});

// =====================================
// CLEAN SHORTCUTS
// =====================================

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

// =====================================
// APP VERSION
// =====================================

ipcMain.handle("get-version", () => {
  return app.getVersion();
});
