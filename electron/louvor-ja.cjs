const fs = require("node:fs");
const childProcess = require("node:child_process");
const path = require("node:path");
const { promisify } = require("node:util");
const { DatabaseSync } = require("node:sqlite");

const DATABASE_RELATIVE_PATH = path.join("config", "database.db");
const execFile = promisify(childProcess.execFile);

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => path.resolve(value)))];
}

function candidateRoots(inputPath) {
  if (typeof inputPath !== "string" || !inputPath.trim()) return [];
  const cleanPath = inputPath.trim().replace(/^"|"$/g, "");
  let selectedPath = path.resolve(cleanPath);
  try {
    if (fs.statSync(selectedPath).isFile()) {
      selectedPath = path.extname(selectedPath).toLowerCase() === ".db"
        ? path.dirname(path.dirname(selectedPath))
        : path.dirname(selectedPath);
    }
  } catch {
    // O caminho ainda pode ser a pasta externa do LouvorJA.
  }
  return unique([
    selectedPath,
    path.join(selectedPath, "Louvor JA"),
    path.basename(selectedPath).toLowerCase() === "config" ? path.dirname(selectedPath) : "",
  ]);
}

function inspectLouvorJa(inputPath) {
  for (const rootPath of candidateRoots(inputPath)) {
    const databasePath = path.join(rootPath, DATABASE_RELATIVE_PATH);
    if (!fs.existsSync(databasePath)) continue;
    let database;
    try {
      database = new DatabaseSync(databasePath, { readOnly: true });
      const musicCount = Number(database.prepare("SELECT count(*) AS total FROM musics").get().total || 0);
      const lyricCount = Number(database.prepare("SELECT count(*) AS total FROM lyrics WHERE show_slide = 1").get().total || 0);
      return {
        valid: musicCount > 0,
        rootPath,
        databasePath,
        executablePath: path.join(rootPath, "LouvorJA.exe"),
        musicCount,
        lyricCount,
      };
    } catch (error) {
      return { valid: false, error: `Banco do LouvorJA inválido: ${error.message}` };
    } finally {
      database?.close();
    }
  }
  return {
    valid: false,
    error: "Não encontrei o banco do LouvorJA. Selecione o arquivo LouvorJA.exe original.",
  };
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function searchLouvorJa(inputPath, searchText, limit = 40) {
  const info = inspectLouvorJa(inputPath);
  if (!info.valid) throw new Error(info.error);

  const database = new DatabaseSync(info.databasePath, { readOnly: true });
  try {
    const musicRows = database.prepare(`
      WITH covers AS (
        SELECT
          MUSICA_ID,
          max(CASE WHEN trim(coalesce(URL_MUSICA, '')) <> '' THEN 1 ELSE 0 END) AS has_audio,
          max(CASE WHEN trim(coalesce(URL_MUSICA_PB, '')) <> '' THEN 1 ELSE 0 END) AS has_playback
        FROM MUSICAS_SLIDE
        WHERE TIPO = 'CAPA'
        GROUP BY MUSICA_ID
      )
      SELECT
        m.id_music AS id,
        trim(m.name) AS title,
        coalesce(min(a.name), '') AS album,
        coalesce(c.has_audio, 0) AS has_audio,
        coalesce(c.has_playback, 0) AS has_playback
      FROM musics m
      LEFT JOIN albums_musics am ON am.id_music = m.id_music
      LEFT JOIN albums a ON a.id_album = am.id_album
      LEFT JOIN covers c ON c.MUSICA_ID = m.id_music
      WHERE trim(coalesce(m.name, '')) <> ''
      GROUP BY m.id_music, m.name, c.has_audio, c.has_playback
      ORDER BY lower(m.name), m.id_music
    `).all();
    const words = normalizeSearchText(searchText).split(/\s+/).filter(Boolean);
    const results = musicRows.filter((music) => {
      const searchableText = normalizeSearchText(`${music.title} ${music.album}`);
      return words.every((word) => searchableText.includes(word));
    }).slice(0, Math.max(1, Math.min(Number(limit) || 40, 100)));
    return { info, results };
  } finally {
    database.close();
  }
}

async function ensureLouvorJaServer(configFilePath) {
  let content;
  try {
    content = await fs.promises.readFile(configFilePath, "utf8");
  } catch {
    throw new Error("Não encontrei a configuração do servidor do LouvorJA.");
  }
  const serverSection = content.match(/\[Servidor\]([\s\S]*?)(?=\r?\n\[|$)/i)?.[1] || "";
  const token = serverSection.match(/^Token\s*=\s*(.+)$/im)?.[1]?.trim() || "";
  const enabled = /^Conectar\s*=\s*1\s*$/im.test(serverSection);
  if (!token) throw new Error("Configure um token no servidor remoto do LouvorJA.");
  if (enabled) return { token, changed: false };

  const updatedContent = content.replace(
    /(\[Servidor\][\s\S]*?^Conectar\s*=\s*)0[ \t]*(?=\r?$)/im,
    (_match, prefix) => `${prefix}1`,
  );
  if (updatedContent === content) {
    throw new Error("Não foi possível ativar o servidor remoto do LouvorJA.");
  }
  const backupPath = `${configFilePath}.lyrics-pro-backup`;
  try {
    await fs.promises.copyFile(configFilePath, backupPath, fs.constants.COPYFILE_EXCL);
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
  }
  const temporaryPath = `${configFilePath}.lyrics-pro-tmp`;
  await fs.promises.writeFile(temporaryPath, updatedContent, "utf8");
  await fs.promises.rename(temporaryPath, configFilePath);
  return { token, changed: true, backupPath };
}

async function runningLouvorJaPids() {
  try {
    const { stdout } = await execFile("tasklist.exe", [
      "/FI", "IMAGENAME eq LouvorJA.exe", "/FO", "CSV", "/NH",
    ], { windowsHide: true });
    return [...stdout.matchAll(/^"[^"]+","(\d+)"/gm)].map((match) => Number(match[1]));
  } catch {
    return [];
  }
}

async function listenerPortsForPids(processIds) {
  if (!processIds.length) return [];
  const { stdout } = await execFile("netstat.exe", ["-ano", "-p", "tcp"], { windowsHide: true });
  const wantedProcessIds = new Set(processIds);
  const ports = [];
  for (const line of stdout.split(/\r?\n/)) {
    const match = line.match(/^\s*TCP\s+\S+:(\d+)\s+\S+\s+\S+\s+(\d+)\s*$/i);
    if (match && wantedProcessIds.has(Number(match[2]))) ports.push(Number(match[1]));
  }
  return [...new Set(ports)];
}

async function apiRequest(port, route, token) {
  const separator = route.includes("?") ? "&" : "?";
  const response = await fetch(`http://127.0.0.1:${port}/api/${route}${separator}token=${encodeURIComponent(token)}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(1500),
  });
  const data = await response.json();
  if (!response.ok || data?.status === "error") {
    throw new Error(data?.message || `LouvorJA respondeu com erro ${response.status}.`);
  }
  return data;
}

async function waitForLouvorJaApi(token, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const processIds = await runningLouvorJaPids();
    for (const port of await listenerPortsForPids(processIds)) {
      try {
        await apiRequest(port, "ping", token);
        return port;
      } catch {
        // Pode existir outro listener no processo; tenta a próxima porta.
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("O servidor do LouvorJA não iniciou. Feche o LouvorJA, abra novamente e tente reproduzir.");
}

async function playLouvorJaSong({ inputPath, configFilePath, songId, tag = 1 }) {
  const info = inspectLouvorJa(inputPath);
  if (!info.valid) throw new Error(info.error);
  const server = await ensureLouvorJaServer(configFilePath);
  const existingProcessIds = await runningLouvorJaPids();
  if (server.changed && existingProcessIds.length) {
    const error = new Error("O servidor foi ativado. Feche o LouvorJA original, abra novamente e clique na música outra vez.");
    error.code = "LOUVORJA_RESTART_REQUIRED";
    throw error;
  }
  if (!existingProcessIds.length) {
    const child = childProcess.spawn(info.executablePath, [], {
      detached: true,
      stdio: "ignore",
      windowsHide: false,
    });
    child.unref();
  }
  const port = await waitForLouvorJaApi(server.token);
  const result = await apiRequest(
    port,
    `open-song?id=${encodeURIComponent(songId)}&tag=${encodeURIComponent(tag)}`,
    server.token,
  );
  return { ok: true, port, result };
}

function defaultDiscoveryCandidates() {
  const candidates = [];
  for (const driveLetter of "CDEFGHIJKLMNOPQRSTUVWXYZ") {
    candidates.push(`${driveLetter}:\\Louvor JA`);
    candidates.push(`${driveLetter}:\\Program Files\\Louvor JA`);
    candidates.push(`${driveLetter}:\\Program Files (x86)\\Louvor JA`);
  }
  return candidates;
}

function discoverLouvorJa(preferredPaths = []) {
  for (const candidate of [...preferredPaths, ...defaultDiscoveryCandidates()]) {
    const info = inspectLouvorJa(candidate);
    if (info.valid) return info;
  }
  return { valid: false, rootPath: "" };
}

module.exports = {
  candidateRoots,
  discoverLouvorJa,
  ensureLouvorJaServer,
  inspectLouvorJa,
  normalizeSearchText,
  playLouvorJaSong,
  searchLouvorJa,
};
