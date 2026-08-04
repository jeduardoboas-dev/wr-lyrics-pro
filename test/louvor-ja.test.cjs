const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { DatabaseSync } = require("node:sqlite");
const { ensureLouvorJaServer, inspectLouvorJa, searchLouvorJa } = require("../electron/louvor-ja.cjs");

function createLouvorJaFixture() {
  const outerPath = fs.mkdtempSync(path.join(os.tmpdir(), "lyrics-pro-louvorja-"));
  const rootPath = path.join(outerPath, "Louvor JA");
  const configPath = path.join(rootPath, "config");
  fs.mkdirSync(path.join(configPath, "musicas", "Album"), { recursive: true });
  fs.mkdirSync(path.join(configPath, "imagens"), { recursive: true });
  fs.writeFileSync(path.join(configPath, "musicas", "Album", "Teste.mp3"), "audio");
  fs.writeFileSync(path.join(configPath, "imagens", "capa.jpg"), "imagem");

  const database = new DatabaseSync(path.join(configPath, "database.db"));
  database.exec(`
    CREATE TABLE musics (id_music INTEGER, name TEXT);
    CREATE TABLE lyrics (id_music INTEGER, id_lyric INTEGER, lyric TEXT, aux_lyric TEXT, time TEXT, instrumental_time TEXT, show_slide INTEGER, "order" INTEGER);
    CREATE TABLE MUSICAS_SLIDE (MUSICA_ID INTEGER, TIPO TEXT, URL_MUSICA TEXT, URL_MUSICA_PB TEXT, IMAGEM TEXT);
    CREATE TABLE albums (id_album INTEGER, name TEXT);
    CREATE TABLE albums_musics (id_album INTEGER, id_music INTEGER, track INTEGER);
    INSERT INTO musics VALUES (7, 'Música de teste');
    INSERT INTO lyrics VALUES (7, 10, 'Primeiro verso', NULL, '00:00:03', '00:00:00', 1, 1);
    INSERT INTO MUSICAS_SLIDE VALUES (7, 'CAPA', 'Album/Teste.mp3', '', 'capa.jpg');
    INSERT INTO albums VALUES (2, 'Álbum de teste');
    INSERT INTO albums_musics VALUES (2, 7, 1);
  `);
  database.close();
  return { outerPath, rootPath };
}

test("localiza o banco mesmo quando a pasta externa do LouvorJA é selecionada", () => {
  const fixture = createLouvorJaFixture();
  const info = inspectLouvorJa(fixture.outerPath);
  assert.equal(info.valid, true);
  assert.equal(info.rootPath, fixture.rootPath);
  assert.equal(info.musicCount, 1);
});

test("pesquisa o catálogo sem importar o conteúdo para o aplicativo", () => {
  const fixture = createLouvorJaFixture();
  const result = searchLouvorJa(fixture.rootPath, "musica teste");
  assert.equal(result.results.length, 1);
  assert.equal(result.results[0].id, 7);
  assert.equal(result.results[0].title, "Música de teste");
  assert.equal(result.results[0].album, "Álbum de teste");
  assert.equal(result.results[0].has_audio, 1);
});

test("ativa o servidor do LouvorJA preservando um backup da configuração", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "lyrics-pro-louvorja-config-"));
  const configPath = path.join(directory, "configPT.ja");
  fs.writeFileSync(configPath, "[Servidor]\r\nToken=abc12\r\nConectar=0\r\nAltPortaIP=1\r\n", "utf8");
  const result = await ensureLouvorJaServer(configPath);
  assert.equal(result.token, "abc12");
  assert.equal(result.changed, true);
  assert.match(fs.readFileSync(configPath, "utf8"), /Conectar=1\r?\nAltPortaIP=1/);
  assert.equal(fs.existsSync(`${configPath}.lyrics-pro-backup`), true);
});
