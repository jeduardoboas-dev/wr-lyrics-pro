const textEncoder = new TextEncoder();

function toBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function sha256Base64(value) {
  const hash = await crypto.subtle.digest("SHA-256", textEncoder.encode(value));
  return toBase64(new Uint8Array(hash));
}

async function createAuthentication(password, salt, challenge) {
  const secret = await sha256Base64(`${password}${salt}`);
  return sha256Base64(`${secret}${challenge}`);
}

export class ObsClient {
  constructor({ onEvent, onStatus } = {}) {
    this.onEvent = onEvent;
    this.onStatus = onStatus;
    this.socket = null;
    this.pending = new Map();
    this.connectPromise = null;
  }

  connect({ host = "127.0.0.1", port = 4455, password = "" }) {
    this.disconnect();
    this.onStatus?.("connecting");
    this.connectPromise = {};
    const promise = new Promise((resolve, reject) => {
      this.connectPromise.resolve = resolve;
      this.connectPromise.reject = reject;
    });
    const socket = new WebSocket(`ws://${host}:${port}`, "obswebsocket.json");
    this.socket = socket;
    socket.addEventListener("message", async (event) => {
      try {
        const message = JSON.parse(event.data);
        await this.handleMessage(message, password);
      } catch (error) {
        this.failConnection(error);
      }
    });
    socket.addEventListener("error", () => {
      if (this.socket === socket) this.failConnection(new Error("Não foi possível conectar ao OBS."));
    });
    socket.addEventListener("close", () => {
      if (this.socket !== socket) return;
      const wasConnecting = Boolean(this.connectPromise);
      if (wasConnecting) this.failConnection(new Error("O OBS encerrou a conexão."));
      this.onStatus?.("disconnected");
      for (const pending of this.pending.values()) pending.reject(new Error("Conexão OBS encerrada."));
      this.pending.clear();
      this.socket = null;
    });
    return promise;
  }

  async handleMessage(message, password) {
    if (message.op === 0) {
      const authentication = message.d.authentication
        ? await createAuthentication(password, message.d.authentication.salt, message.d.authentication.challenge)
        : undefined;
      this.send({
        op: 1,
        d: {
          rpcVersion: 1,
          eventSubscriptions: 21,
          ...(authentication ? { authentication } : {}),
        },
      });
      return;
    }
    if (message.op === 2) {
      this.onStatus?.("connected");
      this.connectPromise?.resolve();
      this.connectPromise = null;
      return;
    }
    if (message.op === 5) {
      this.onEvent?.(message.d.eventType, message.d.eventData || {});
      return;
    }
    if (message.op === 7) {
      const pending = this.pending.get(message.d.requestId);
      if (!pending) return;
      this.pending.delete(message.d.requestId);
      if (message.d.requestStatus?.result) pending.resolve(message.d.responseData || {});
      else pending.reject(new Error(message.d.requestStatus?.comment || "O OBS recusou a operação."));
    }
  }

  request(requestType, requestData = {}) {
    if (this.socket?.readyState !== WebSocket.OPEN) return Promise.reject(new Error("OBS não conectado."));
    const requestId = crypto.randomUUID();
    const promise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(requestId);
        reject(new Error("Tempo esgotado ao aguardar o OBS."));
      }, 8000);
      this.pending.set(requestId, {
        resolve: (value) => { clearTimeout(timeout); resolve(value); },
        reject: (error) => { clearTimeout(timeout); reject(error); },
      });
    });
    this.send({ op: 6, d: { requestType, requestId, requestData } });
    return promise;
  }

  send(payload) {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(payload));
  }

  failConnection(error) {
    if (!this.connectPromise) return;
    this.onStatus?.("error");
    this.connectPromise.reject(error);
    this.connectPromise = null;
  }

  disconnect() {
    const socket = this.socket;
    const connectPromise = this.connectPromise;
    this.socket = null;
    this.connectPromise = null;
    connectPromise?.reject(new Error("Conexão OBS cancelada."));
    if (socket && socket.readyState <= WebSocket.OPEN) socket.close();
  }
}

export { createAuthentication };
