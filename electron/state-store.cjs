const fs = require("node:fs/promises");

const SCHEMA_VERSION = 1;

function normalizeState(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const library = Array.isArray(value.library) ? value.library : [];
  const playlists = Array.isArray(value.playlists) && value.playlists.length
    ? value.playlists
    : [{ id: "initial", name: "Nova programação", entries: [] }];
  return {
    ...value,
    schemaVersion: SCHEMA_VERSION,
    library,
    playlists: playlists.map((playlist) => ({
      ...playlist,
      entries: Array.isArray(playlist.entries) ? playlist.entries : [],
    })),
    activePlaylistId: playlists.some((item) => item.id === value.activePlaylistId)
      ? value.activePlaylistId
      : playlists[0].id,
    settings: value.settings && typeof value.settings === "object"
      ? value.settings
      : {},
  };
}

async function readJson(filePath) {
  return normalizeState(JSON.parse(await fs.readFile(filePath, "utf8")));
}

async function loadState(filePath) {
  try {
    const state = await readJson(filePath);
    if (state) return { state, recovered: false };
  } catch {
    // O backup é tentado abaixo.
  }
  try {
    const state = await readJson(`${filePath}.bak`);
    return state ? { state, recovered: true } : { state: null, recovered: false };
  } catch {
    return { state: null, recovered: false };
  }
}

async function saveState(filePath, value) {
  const state = normalizeState(value);
  if (!state) throw new Error("Estado inválido");
  const temporaryPath = `${filePath}.tmp`;
  const backupPath = `${filePath}.bak`;
  await fs.mkdir(require("node:path").dirname(filePath), { recursive: true });
  try {
    await fs.copyFile(filePath, backupPath);
  } catch {
    // O primeiro salvamento ainda não possui arquivo para backup.
  }
  await fs.writeFile(temporaryPath, JSON.stringify(state, null, 2), "utf8");
  await fs.rename(temporaryPath, filePath);
  return state;
}

module.exports = { SCHEMA_VERSION, loadState, normalizeState, saveState };
