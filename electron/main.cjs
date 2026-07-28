const { app, BrowserWindow, dialog, ipcMain, screen, shell } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

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
    title: "WR Lyrics Pro",
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
  return path.join(app.getPath("userData"), "wr-lyrics-state.json");
}

ipcMain.handle("state:load", async () => {
  try {
    return JSON.parse(await fs.readFile(statePath(), "utf8"));
  } catch {
    return null;
  }
});

ipcMain.handle("state:save", async (_event, state) => {
  await fs.mkdir(path.dirname(statePath()), { recursive: true });
  await fs.writeFile(statePath(), JSON.stringify(state, null, 2), "utf8");
  return true;
});

ipcMain.handle("display:list", () =>
  screen.getAllDisplays().map((display, index) => ({
    id: display.id,
    label: `Tela ${index + 1}`,
    primary: display.id === screen.getPrimaryDisplay().id,
    bounds: display.bounds,
    scaleFactor: display.scaleFactor,
  })),
);

ipcMain.handle("output:open", (_event, { mode, displayId }) => {
  const existing = outputWindows.get(mode);
  if (existing && !existing.isDestroyed()) {
    existing.focus();
    return true;
  }
  const target =
    screen.getAllDisplays().find((display) => display.id === displayId) ||
    screen.getPrimaryDisplay();
  const win = secureWindow({
    title: mode === "stage" ? "WR Lyrics Pro · Retorno" : "WR Lyrics Pro · Projeção",
    x: target.bounds.x,
    y: target.bounds.y,
    width: target.bounds.width,
    height: target.bounds.height,
    frame: false,
    fullscreen: true,
    alwaysOnTop: mode === "audience",
  });
  outputWindows.set(mode, win);
  win.loadURL(rendererUrl(`#output=${mode}`));
  win.once("ready-to-show", () => win.show());
  win.on("closed", () => outputWindows.delete(mode));
  return true;
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

ipcMain.handle("dialog:files", async (_event, filters = []) => {
  const result = await dialog.showOpenDialog(operatorWindow, {
    properties: ["openFile", "multiSelections"],
    filters,
  });
  return result.canceled ? [] : result.filePaths;
});

ipcMain.handle("dialog:directory", async () => {
  const result = await dialog.showOpenDialog(operatorWindow, {
    properties: ["openDirectory"],
    title: "Selecione uma pasta de biblioteca externa",
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("file:read-text", async (_event, filePath) => {
  const extension = path.extname(filePath).toLowerCase();
  if (![".txt", ".json", ".xml", ".csv"].includes(extension)) {
    throw new Error("Formato de texto não permitido");
  }
  return fs.readFile(filePath, "utf8");
});

ipcMain.handle("file:to-url", (_event, filePath) =>
  pathToFileURL(filePath).toString());

ipcMain.handle("external:louvorja", () =>
  shell.openExternal("https://app.louvorja.com.br/"),
);

app.whenReady().then(() => {
  createOperatorWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createOperatorWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
