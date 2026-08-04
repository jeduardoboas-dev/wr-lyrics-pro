import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { createAuthentication } from "../src/obs-client.js";

function sha256Base64(value) {
  return createHash("sha256").update(value).digest("base64");
}

test("gera autenticação compatível com o protocolo OBS WebSocket 5", async () => {
  const password = "senha-segura";
  const salt = "salt-do-obs";
  const challenge = "challenge-do-obs";
  const expected = sha256Base64(`${sha256Base64(`${password}${salt}`)}${challenge}`);
  assert.equal(await createAuthentication(password, salt, challenge), expected);
});
