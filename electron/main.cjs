const { app, BrowserWindow, dialog, ipcMain, screen, shell } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { discoverLouvorJa, inspectLouvorJa, playLouvorJaSong, searchLouvorJa } = require("./louvor-ja.cjs");
const { loadState, saveState } = require("./state-store.cjs");

const DEV_URL = process.env.VITE_DEV_SERVER_URL || "http://127.0.0.1:5173";
const outputWindows = new Map();
let operatorWindow;

function rendererUrl(hash = "") {
  if (!app.isPackaged) return `${DEV_URL}/${hash}`;
  const file = path.join(__dirname, "..", "dist", "index.html");
  return `${file}${hash}`;
}

function secureWindow(options = {}) {
  return new BrowserWindow({
    backgroundColor: "#070b12",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    ...options,
  });
}

function createOperatorWindow() {
  operatorWindow = secureWindow({
    title: "Lyrics Pro",
    width: 1500,
    height: 940,
    minWidth: 1120,
    minHeight: 720,
  });
  operatorWindow.loadURL(rendererUrl(""));
  operatorWindow.once("ready-to-show", () => operatorWindow.show());
  operatorWindow.on("closed", () => {
    operatorWindow = null;
    for (const win of outputWindows.values()) win.close();
    outputWindows.clear();
  });
}

function statePath() {
  return path.join(app.getPath("userData"), "lyrics-state.json");
}

async function migrateLegacyState() {
  const targetPath = statePath();
  try {
    await fs.access(targetPath);
    return;
  } catch {
    // A migração é necessária apenas quando ainda não há dados no novo local.
  }
  const legacyDirectories = [
    path.join(app.getPath("appData"), "wr-lyrics-pro-windows"),
    path.join(app.getPath("appData"), "WR Lyrics Pro"),
  ];
  for (const directory of legacyDirectories) {
    const legacyPath = path.join(directory, "wr-lyrics-state.json");
    try {
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.copyFile(legacyPath, targetPath);
      try {
        await fs.copyFile(`${legacyPath}.bak`, `${targetPath}.bak`);
      } catch {
        // O backup antigo pode não existir.
      }
      return;
    } catch {
      // Tenta o próximo local usado por versões anteriores.
    }
  }
}

function getOperatorDisplay(displays = screen.getAllDisplays()) {
  if (operatorWindow && !operatorWindow.isDestroyed()) {
    return screen.getDisplayMatching(operatorWindow.getBounds());
  }
  return displays.find((display) => display.id === screen.getPrimaryDisplay().id) || displays[0];
}

function displayName(displays, displayId) {
  const index = displays.findIndex((display) => display.id === displayId);
  return index >= 0 ? `Tela ${index + 1}` : "Tela";
}

function previewBounds(display) {
  const area = display.workArea;
  let width = Math.min(960, Math.floor(area.width * 0.78));
  let height = Math.round(width * 9 / 16);
  const maximumHeight = Math.floor(area.height * 0.78);
  if (height > maximumHeight) {
    height = maximumHeight;
    width = Math.round(height * 16 / 9);
  }
  return {
    x: area.x + Math.round((area.width - width) / 2),
    y: area.y + Math.round((area.height - height) / 2),
    width,
    height,
  };
}

async function installerLouvorJaPaths() {
  const configurationFiles = [
    path.join(app.getPath("userData"), "louvor-ja-path.txt"),
    path.join(app.getPath("appData"), "lyrics-pro-windows", "louvor-ja-path.txt"),
    path.join(app.getPath("appData"), "wr-lyrics-pro-windows", "louvor-ja-path.txt"),
  ];
  const values = [];
  for (const filePath of configurationFiles) {
    try {
      values.push((await fs.readFile(filePath, "utf8")).trim());
    } catch {
      // A versão portátil ou a primeira execução podem não ter esse arquivo.
    }
  }
  return values;
}

ipcMain.handle("state:load", async () => {
  await migrateLegacyState();
  return loadState(statePath());
});

ipcMain.handle("state:save", async (_event, state) => {
  await saveState(statePath(), state);
  return true;
});

ipcMain.handle("display:list", () => {
  const displays = screen.getAllDisplays();
  const operatorDisplay = getOperatorDisplay(displays);
  return displays.map((display, index) => ({
    id: display.id,
    label: `Tela ${index + 1}`,
    primary: display.id === screen.getPrimaryDisplay().id,
    operator: display.id === operatorDisplay?.id,
    bounds: display.bounds,
    workArea: display.workArea,
    scaleFactor: display.scaleFactor,
  }));
});

ipcMain.handle("output:open", (_event, { mode, displayId }) => {
  const displays = screen.getAllDisplays();
  const operatorDisplay = getOperatorDisplay(displays);
  const externalDisplays = displays.filter((display) => display.id !== operatorDisplay?.id);
  const preferred = displays.find((display) => display.id === displayId);
  const target = preferred ||
    (mode === "audience" ? externalDisplays[0] : externalDisplays[1]) ||
    operatorDisplay ||
    displays[0];
  const conflictingMode = [...outputWindows.entries()].find(([currentMode, currentWindow]) =>
    currentMode !== mode &&
    !currentWindow.isDestroyed() &&
    currentWindow.wrDisplayId === target.id &&
    target.id !== operatorDisplay?.id);
  if (conflictingMode) {
    return {
      ok: false,
      reason: "display-in-use",
      displayId: target.id,
      displayLabel: displayName(displays, target.id),
      conflictingMode: conflictingMode[0],
    };
  }

  const operatorPreview = target.id === operatorDisplay?.id;
  const existing = outputWindows.get(mode);
  if (existing && !existing.isDestroyed()) {
    if (existing.wrDisplayId === target.id && existing.wrOperatorPreview === operatorPreview) {
      existing.show();
      existing.focus();
      return {
        ok: true,
        displayId: target.id,
        displayLabel: displayName(displays, target.id),
        operatorPreview,
        automatic: !preferred,
      };
    }
    existing.close();
    outputWindows.delete(mode);
  }

  const bounds = operatorPreview ? previewBounds(target) : target.bounds;
  const win = secureWindow({
    title: mode === "stage" ? "Lyrics Pro · Retorno" : "Lyrics Pro · Projeção",
    ...bounds,
    frame: operatorPreview,
    fullscreen: !operatorPreview,
    alwaysOnTop: mode === "audience" && !operatorPreview,
    autoHideMenuBar: true,
  });
  win.wrDisplayId = target.id;
  win.wrOperatorPreview = operatorPreview;
  outputWindows.set(mode, win);
  win.loadURL(rendererUrl(`#output=${mode}`));
  win.once("ready-to-show", () => win.show());
  win.on("closed", () => {
    if (outputWindows.get(mode) === win) outputWindows.delete(mode);
  });
  return {
    ok: true,
    displayId: target.id,
    displayLabel: displayName(displays, target.id),
    operatorPreview,
    automatic: !preferred,
  };
});

ipcMain.handle("output:close", (_event, mode) => {
  outputWindows.get(mode)?.close();
  return true;
});

ipcMain.on("output:update", (_event, payload) => {
  for (const win of outputWindows.values()) {
    if (!win.isDestroyed()) win.webContents.send("output:update", payload);
  }
});

ipcMain.on("emergency:clear", () => {
  if (operatorWindow && !operatorWindow.isDestroyed()) operatorWindow.webContents.send("emergency:clear");
  for (const win of outputWindows.values()) {
    if (!win.isDestroyed()) win.close();
  }
  outputWindows.clear();
});

ipcMain.handle("dialog:files", async (_event, filters = []) => {
  const result = await dialog.showOpenDialog(operatorWindow, {
    properties: ["openFile", "multiSelections"],
    filters,
  });
  return result.canceled ? [] : result.filePaths;
});

ipcMain.handle("louvor-ja:setup", async () =>
  discoverLouvorJa(await installerLouvorJaPaths()));

ipcMain.handle("louvor-ja:inspect", (_event, selectedPath) =>
  inspectLouvorJa(selectedPath));

ipcMain.handle("louvor-ja:search", (_event, { selectedPath, searchText }) =>
  searchLouvorJa(selectedPath, searchText));

ipcMain.handle("louvor-ja:play", (_event, { selectedPath, songId, tag }) =>
  playLouvorJaSong({
    inputPath: selectedPath,
    configFilePath: path.join(app.getPath("appData"), "LouvorJA", "configPT.ja"),
    songId,
    tag,
  }));

ipcMain.handle("louvor-ja:open", async (_event, selectedPath) => {
  const info = inspectLouvorJa(selectedPath);
  if (!info.valid) throw new Error(info.error);
  try {
    await fs.access(info.executablePath);
  } catch {
    throw new Error("Não encontrei o LouvorJA.exe na pasta configurada.");
  }
  const errorMessage = await shell.openPath(info.executablePath);
  if (errorMessage) throw new Error(errorMessage);
  return true;
});

ipcMain.handle("file:read-text", async (_event, filePath) => {
  const extension = path.extname(filePath).toLowerCase();
  if (![".txt", ".md", ".json", ".xml", ".csv"].includes(extension)) {
    throw new Error("Formato de texto não permitido");
  }
  return fs.readFile(filePath, "utf8");
});

ipcMain.handle("file:to-url", (_event, filePath) =>
  pathToFileURL(filePath).toString());

const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) app.quit();

app.on("second-instance", () => {
  if (!operatorWindow) return;
  if (operatorWindow.isMinimized()) operatorWindow.restore();
  operatorWindow.show();
  operatorWindow.focus();
});

app.whenReady().then(() => {
  if (!hasSingleInstanceLock) return;
  createOperatorWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createOperatorWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
