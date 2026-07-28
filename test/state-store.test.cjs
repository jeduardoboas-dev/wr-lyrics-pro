const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { loadState, normalizeState, saveState } = require("../electron/state-store.cjs");

test("normaliza dados incompletos sem perder a biblioteca", () => {
  const state = normalizeState({ library: [{ id: "1" }] });
  assert.equal(state.library.length, 1);
  assert.equal(state.playlists.length, 1);
  assert.equal(state.activePlaylistId, "initial");
});

test("salva e carrega o estado de forma íntegra", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "wr-lyrics-"));
  const filePath = path.join(directory, "state.json");
  await saveState(filePath, { library: [], playlists: [{ id: "p", entries: [] }] });
  const result = await loadState(filePath);
  assert.equal(result.state.activePlaylistId, "p");
  assert.equal(result.recovered, false);
});

test("recupera o backup quando o arquivo principal está corrompido", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "wr-lyrics-"));
  const filePath = path.join(directory, "state.json");
  await saveState(filePath, { library: [], playlists: [{ id: "p", entries: [] }] });
  await saveState(filePath, { library: [{ id: "backup" }], playlists: [{ id: "p", entries: [] }] });
  await fs.writeFile(filePath, "{arquivo-corrompido", "utf8");
  const result = await loadState(filePath);
  assert.equal(result.recovered, true);
  assert.ok(result.state);
});
