'use strict';

/*
 * Linux replacement for the vendor kimi-webbridge.exe service.
 *
 * The browser extension speaks a deliberately small protocol: it opens a
 * loopback WebSocket, sends a hello message, and executes tool_call messages
 * using Chrome DevTools Protocol.  The desktop/agent side submits JSON
 * commands to POST /command and observes GET /status and GET /policy.  This
 * implementation keeps the same wire contract without Wine, Win32 APIs, or
 * third-party runtime dependencies.
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');

const VERSION = '2.0.8';
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 10086;
const MAX_HTTP_BODY = 1024 * 1024;
const MAX_WS_MESSAGE = 1024 * 1024;
const MAX_PENDING = 32;
const MAX_EXTENSION_PEERS = 8;
const COMMAND_TIMEOUT_MS = 120_000;
const MAX_LOG_BYTES = 5 * 1024 * 1024;
const PEER_HELLO_TIMEOUT_MS = 5_000;
const PEER_IDLE_TIMEOUT_MS = 60_000;
const EXTENSION_ID = 'fldmhceldgbpfpkbgopacenieobmligc';

const DEFAULT_POLICY = Object.freeze({
  version: 1,
  defaults: Object.freeze({ navigate: 'ask', history: 'ask', download: 'always', upload: 'ask' }),
  sites: Object.freeze({}),
  cdpFullAccess: false,
});

function finitePort(value, fallback = DEFAULT_PORT) {
  const port = Number(value ?? fallback);
  if (!Number.isInteger(port) || port < 0 || port > 65_535) throw new Error(`invalid WebBridge port: ${value}`);
  return port;
}

function loopbackAddress(address) {
  if (!address) return false;
  if (address === '::1' || address === '127.0.0.1') return true;
  return address.startsWith('::ffff:') && address.slice(7) === '127.0.0.1';
}

function jsonResponse(response, statusCode, value) {
  const body = Buffer.from(JSON.stringify(value));
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Length', body.length);
  response.end(body);
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function validName(name) {
  return typeof name === 'string' && name.length > 0 && name.length <= 128 && /^[A-Za-z0-9_.:-]+$/u.test(name);
}

function normalizeCommand(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('command body must be a JSON object');
  const source = value.command && typeof value.command === 'object' && !Array.isArray(value.command) ? value.command : value;
  const name = source.name ?? source.tool ?? source.commandName ?? (typeof value.command === 'string' ? value.command : undefined);
  if (!validName(name)) throw new Error('command name is required and must contain only identifier characters');
  const args = source.args ?? source.arguments ?? source.params ?? source.data ?? (source === value ? value.data : undefined) ?? {};
  if (args === null || typeof args !== 'object') throw new Error('command args must be an object or array');
  const requestId = typeof value.requestId === 'string' && /^[A-Za-z0-9._:-]{1,128}$/u.test(value.requestId)
    ? value.requestId
    : crypto.randomUUID();
  return { name, args, requestId };
}

function parsePolicy(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('policy must be an object');
  const defaults = value.defaults && typeof value.defaults === 'object' && !Array.isArray(value.defaults) ? value.defaults : {};
  const allowed = new Set(['ask', 'always', 'never']);
  const normalizedDefaults = {};
  for (const key of ['navigate', 'history', 'download', 'upload']) {
    const candidate = defaults[key] ?? DEFAULT_POLICY.defaults[key];
    if (typeof candidate !== 'string' || !allowed.has(candidate)) throw new Error(`invalid policy default: ${key}`);
    normalizedDefaults[key] = candidate;
  }
  const sites = value.sites && typeof value.sites === 'object' && !Array.isArray(value.sites) ? value.sites : {};
  const siteEntries = Object.entries(sites);
  if (siteEntries.length > 512) throw new Error('policy contains too many sites');
  const normalizedSites = {};
  for (const [host, entry] of siteEntries) {
    if (!/^[a-z0-9.-]{1,253}$/iu.test(host) || !entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
    const out = {};
    for (const key of ['navigate', 'history', 'download', 'upload']) {
      if (entry[key] !== undefined) {
        if (typeof entry[key] !== 'string' || !allowed.has(entry[key])) throw new Error(`invalid policy site rule: ${host}.${key}`);
        out[key] = entry[key];
      }
    }
    normalizedSites[host.toLowerCase()] = out;
  }
  return {
    version: 1,
    defaults: normalizedDefaults,
    sites: normalizedSites,
    cdpFullAccess: value.cdpFullAccess === true,
  };
}

function framePayload(opcode, payload) {
  const body = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
  if (body.length > MAX_WS_MESSAGE) throw new Error('WebBridge WebSocket message exceeds 1 MiB');
  let header;
  if (body.length < 126) {
    header = Buffer.from([0x80 | opcode, body.length]);
  } else if (body.length <= 0xffff) {
    header = Buffer.allocUnsafe(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(body.length, 2);
  } else {
    header = Buffer.allocUnsafe(10);
    header[0] = 0x80 | opcode;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(body.length), 2);
  }
  return Buffer.concat([header, body]);
}

class WebSocketPeer {
  constructor(socket, onMessage, onClose) {
    this.socket = socket;
    this.onMessage = onMessage;
    this.onClose = onClose;
    this.buffer = Buffer.alloc(0);
    this.fragmented = null;
    this.closed = false;
    this.helloReceived = false;
    this.helloTimer = null;
    this.lastSeenAt = Date.now();
    this.socket.setNoDelay(true);
    this.socket.on('data', (chunk) => {
      this.lastSeenAt = Date.now();
      this.#consume(chunk);
    });
    this.socket.on('error', () => this.close());
    this.socket.on('end', () => this.close());
    this.socket.on('close', () => this.close());
  }

  send(value) {
    if (this.closed || !this.socket.writable) return false;
    const text = typeof value === 'string' ? value : JSON.stringify(value);
    if (Buffer.byteLength(text) > MAX_WS_MESSAGE) throw new Error('WebBridge outbound message exceeds 1 MiB');
    this.socket.write(framePayload(0x1, text));
    return true;
  }

  accept(chunk) {
    if (chunk && chunk.length > 0) this.#consume(chunk);
  }

  close(code = 1000, reason = '') {
    if (this.closed) return;
    this.closed = true;
    if (this.helloTimer) {
      clearTimeout(this.helloTimer);
      this.helloTimer = null;
    }
    if (this.socket.writable) {
      const safeReason = Buffer.from(String(reason)).subarray(0, 123);
      const payload = Buffer.allocUnsafe(2 + safeReason.length);
      payload.writeUInt16BE(code, 0);
      safeReason.copy(payload, 2);
      try { this.socket.write(framePayload(0x8, payload)); } catch { /* peer may already be gone */ }
    }
    this.socket.destroy();
    try { this.onClose(this); } catch { /* lifecycle callback must not escape */ }
  }

  #consume(chunk) {
    if (this.closed) return;
    this.buffer = this.buffer.length === 0 ? Buffer.from(chunk) : Buffer.concat([this.buffer, chunk]);
    if (this.buffer.length > MAX_WS_MESSAGE * 2 + 64) {
      this.close(1009, 'frame buffer too large');
      return;
    }
    try {
      while (!this.closed) {
        const frame = this.#nextFrame();
        if (!frame) return;
        this.#handleFrame(frame);
      }
    } catch {
      this.close(1002, 'protocol error');
    }
  }

  #nextFrame() {
    if (this.buffer.length < 2) return null;
    const first = this.buffer[0];
    const second = this.buffer[1];
    const fin = (first & 0x80) !== 0;
    const rsv = first & 0x70;
    const opcode = first & 0x0f;
    const masked = (second & 0x80) !== 0;
    let length = second & 0x7f;
    let offset = 2;
    if (rsv !== 0 || !masked) throw new Error('masked, uncompressed client frame required');
    if (length === 126) {
      if (this.buffer.length < offset + 2) return null;
      length = this.buffer.readUInt16BE(offset);
      offset += 2;
    } else if (length === 127) {
      if (this.buffer.length < offset + 8) return null;
      const wide = this.buffer.readBigUInt64BE(offset);
      if (wide > BigInt(MAX_WS_MESSAGE)) throw new Error('frame too large');
      length = Number(wide);
      offset += 8;
    }
    if (length > MAX_WS_MESSAGE) throw new Error('frame too large');
    if (this.buffer.length < offset + 4 + length) return null;
    const mask = this.buffer.subarray(offset, offset + 4);
    offset += 4;
    const payload = Buffer.from(this.buffer.subarray(offset, offset + length));
    this.buffer = this.buffer.subarray(offset + length);
    for (let index = 0; index < payload.length; index += 1) payload[index] ^= mask[index & 3];
    return { fin, opcode, payload };
  }

  #handleFrame(frame) {
    const { fin, opcode, payload } = frame;
    if (opcode >= 0x8 && (!fin || payload.length > 125)) throw new Error('invalid WebSocket control frame');
    if (opcode === 0x8) {
      this.close(1000);
      return;
    }
    if (opcode === 0x9) {
      if (!this.closed && this.socket.writable) this.socket.write(framePayload(0xA, payload));
      return;
    }
    if (opcode === 0xA) return;
    if (opcode === 0x0) {
      if (!this.fragmented) throw new Error('unexpected continuation frame');
      this.fragmented.parts.push(payload);
      this.fragmented.length += payload.length;
      if (this.fragmented.length > MAX_WS_MESSAGE) throw new Error('fragmented message too large');
      if (fin) {
        const message = Buffer.concat(this.fragmented.parts);
        this.fragmented = null;
        this.#message(message);
      }
      return;
    }
    if (opcode !== 0x1 && opcode !== 0x2) throw new Error('unsupported WebSocket opcode');
    if (this.fragmented) throw new Error('nested fragmented message');
    if (fin) {
      this.#message(payload);
    } else {
      this.fragmented = { parts: [payload], length: payload.length };
    }
  }

  #message(payload) {
    if (payload.length > MAX_WS_MESSAGE) throw new Error('message too large');
    if (payload.length === 0) return;
    const text = payload.toString('utf8');
    let value;
    try { value = JSON.parse(text); } catch { throw new Error('WebBridge message is not JSON'); }
    this.onMessage(value, this);
  }
}

function createWebBridgeServer(options = {}) {
  const host = options.host ?? process.env.KIMI_WEBBRIDGE_HOST ?? DEFAULT_HOST;
  if (host !== DEFAULT_HOST && host !== '::1') throw new Error('WebBridge binds to loopback only');
  const port = finitePort(options.port ?? process.env.KIMI_WEBBRIDGE_PORT);
  const home = options.home ?? process.env.KIMI_WEBBRIDGE_HOME ?? path.join(os.homedir(), '.kimi-webbridge');
  const logsDir = path.join(home, 'logs');
  const pidFile = path.join(home, 'bin', 'daemon.pid');
  const logFile = options.logFile ?? path.join(logsDir, 'desktop-daemon.log');
  const policyFile = options.policyFile ?? path.join(home, 'policy.json');
  const pending = new Map();
  let extension = null;
  const extensionPeers = new Set();
  let policy = parsePolicy(DEFAULT_POLICY);
  let pidOwned = false;
  let started = false;
  let closing = false;
  let pingTimer = null;

  try {
    const storedPolicy = JSON.parse(fs.readFileSync(policyFile, 'utf8'));
    policy = parsePolicy(storedPolicy);
  } catch {
    // A first run or a corrupt policy falls back to the safe defaults.
  }

  function log(line) {
    const rendered = `${new Date().toISOString()} ${line}\n`;
    try {
      fs.mkdirSync(logsDir, { recursive: true, mode: 0o700 });
      try {
        if (fs.statSync(logFile).size > MAX_LOG_BYTES) {
          const previous = `${logFile}.prev`;
          try { fs.unlinkSync(previous); } catch { /* no previous receipt */ }
          fs.renameSync(logFile, previous);
        }
      } catch {
        // A concurrently rotated or newly-created log is harmless; append
        // below remains the source of truth for the current process.
      }
      fs.appendFileSync(logFile, rendered, { encoding: 'utf8', mode: 0o600 });
    } catch {
      // Logging must never take the daemon down; stderr remains useful when
      // the configured home is not writable.
      process.stderr.write(rendered);
    }
  }

  function selectExtension() {
    const live = [...extensionPeers].filter((peer) => peer && !peer.closed);
    live.sort((left, right) => (right.lastSeenAt || 0) - (left.lastSeenAt || 0));
    extension = live[0] ?? null;
    return extension;
  }

  function status() {
    const selected = selectExtension();
    const live = [...extensionPeers].filter((peer) => peer && !peer.closed);
    const heartbeatAge = live.length > 0 ? Math.min(...live.map((peer) => Math.max(0, Date.now() - peer.lastSeenAt))) : null;
    return {
      running: started && !closing,
      extension_connected: live.length > 0,
      extension_version: selected?.version ?? null,
      extension_heartbeat_age_ms: heartbeatAge,
      extension_connections: live.length,
      version: VERSION,
      daemon_version: VERSION,
      update_available: false,
      version_info: { current: VERSION, latest: VERSION, extension: selected?.version ?? null },
      policy,
    };
  }

  function persistPolicy() {
    fs.mkdirSync(path.dirname(policyFile), { recursive: true, mode: 0o700 });
    const temporary = `${policyFile}.tmp-${process.pid}`;
    fs.writeFileSync(temporary, `${JSON.stringify(policy, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
    fs.chmodSync(temporary, 0o600);
    fs.renameSync(temporary, policyFile);
  }

  function rejectPending(error) {
    for (const [requestId, item] of pending) {
      clearTimeout(item.timer);
      item.reject(error);
      pending.delete(requestId);
    }
  }

  function onPeerClose(peer) {
    if (peer.helloTimer) {
      clearTimeout(peer.helloTimer);
      peer.helloTimer = null;
    }
    extensionPeers.delete(peer);
    const wasSelected = extension === peer;
    if (wasSelected) selectExtension();
    log('[ws] extension disconnected');
    if (extensionPeers.size === 0) rejectPending(new Error('extension disconnected'));
  }

  function onPeerMessage(message, peer) {
    if (!message || typeof message !== 'object' || Array.isArray(message)) throw new Error('message must be an object');
    if (message.type === 'hello') {
      const version = message.payload?.extensionVersion ?? message.extensionVersion;
      if (version !== undefined && (typeof version !== 'string' || version.length > 64)) throw new Error('invalid extension version');
      if (!extensionPeers.has(peer) && extensionPeers.size >= MAX_EXTENSION_PEERS) {
        peer.close(1008, 'too many extension connections');
        return;
      }
      extensionPeers.add(peer);
      extension = peer;
      peer.helloReceived = true;
      if (peer.helloTimer) {
        clearTimeout(peer.helloTimer);
        peer.helloTimer = null;
      }
      extension.version = version ?? null;
      log('[ws] extension connected');
      log(`hello from extension v${extension.version ?? 'unknown'} (daemon v${VERSION})`);
      peer.send({ type: 'hello_ack', payload: { daemonVersion: VERSION, version: VERSION } });
      return;
    }
    if (!peer.helloReceived) {
      peer.close(1008, 'hello required');
      return;
    }
    if (message.type === 'pong' || message.type === 'ping') {
      if (message.type === 'ping') peer.send({ type: 'pong' });
      return;
    }
    if (message.type !== 'tool_result') return;
    const requestId = message.responseToRequestId ?? message.requestId;
    if (typeof requestId !== 'string') return;
    const item = pending.get(requestId);
    if (!item) return;
    pending.delete(requestId);
    clearTimeout(item.timer);
    const payload = message.payload;
    if (payload && typeof payload === 'object' && !Array.isArray(payload) && typeof payload.error === 'string') {
      item.reject(new Error(payload.error));
    } else if (payload && typeof payload === 'object' && !Array.isArray(payload) && Object.hasOwn(payload, 'data')) {
      item.resolve(payload.data);
    } else if (Object.hasOwn(message, 'result')) {
      item.resolve(message.result);
    } else {
      item.resolve(payload ?? null);
    }
  }

  function dispatch(name, args, requestId) {
    selectExtension();
    if (!extension || extension.closed) return Promise.reject(new Error('no extension connected'));
    if (pending.size >= MAX_PENDING) return Promise.reject(new Error('too many WebBridge commands in flight'));
    if (pending.has(requestId)) return Promise.reject(new Error(`duplicate WebBridge request id: ${requestId}`));
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error(`WebBridge command timed out after ${COMMAND_TIMEOUT_MS}ms`));
      }, COMMAND_TIMEOUT_MS);
      timer.unref?.();
      pending.set(requestId, { resolve, reject, timer });
      try {
        extension.send({ type: 'tool_call', requestId, payload: { name, args } });
      } catch (error) {
        clearTimeout(timer);
        pending.delete(requestId);
        reject(error);
      }
    });
  }

  async function readBody(request) {
    const declared = Number(request.headers['content-length'] ?? 0);
    if (Number.isFinite(declared) && declared > MAX_HTTP_BODY) throw new Error('request body exceeds 1 MiB');
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
      size += chunk.length;
      if (size > MAX_HTTP_BODY) throw new Error('request body exceeds 1 MiB');
      chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString('utf8');
  }

  async function handle(request, response) {
    if (!loopbackAddress(request.socket.remoteAddress)) {
      jsonResponse(response, 403, { error: 'loopback-only' });
      return;
    }
    const url = new URL(request.url ?? '/', `http://${host}`);
    if (request.method === 'GET' && url.pathname === '/status') {
      jsonResponse(response, 200, status());
      return;
    }
    if (request.method === 'GET' && (url.pathname === '/version' || url.pathname === '/version.json')) {
      const selected = selectExtension();
      jsonResponse(response, 200, { version: VERSION, extension_version: selected?.version ?? null });
      return;
    }
    if (request.method === 'GET' && url.pathname === '/policy') {
      jsonResponse(response, 200, policy);
      return;
    }
    if (request.method === 'POST' && url.pathname === '/policy') {
      try {
        const nextPolicy = parsePolicy(JSON.parse(await readBody(request)));
        const previousPolicy = policy;
        policy = nextPolicy;
        try { persistPolicy(); } catch (error) { policy = previousPolicy; throw error; }
        jsonResponse(response, 200, { ok: true, policy });
      } catch (error) {
        jsonResponse(response, 400, { ok: false, error: errorMessage(error) });
      }
      return;
    }
    if (request.method === 'POST' && url.pathname === '/command') {
      let command;
      try { command = normalizeCommand(JSON.parse(await readBody(request))); } catch (error) {
        jsonResponse(response, 400, { ok: false, error: errorMessage(error) });
        return;
      }
      try {
        const data = await dispatch(command.name, command.args, command.requestId);
        jsonResponse(response, 200, { ok: true, requestId: command.requestId, data });
      } catch (error) {
        jsonResponse(response, 502, { ok: false, requestId: command.requestId, error: errorMessage(error) });
      }
      return;
    }
    jsonResponse(response, 404, { error: 'not-found' });
  }

  function onUpgrade(request, socket, head) {
    const url = new URL(request.url ?? '/', `http://${host}`);
    const key = request.headers['sec-websocket-key'];
    const origin = request.headers.origin;
    const originAllowed = !origin || origin === `chrome-extension://${EXTENSION_ID}` || process.env.KIMI_WEBBRIDGE_ALLOW_ORIGIN === '1';
    if (!loopbackAddress(request.socket.remoteAddress) || request.method !== 'GET' || url.pathname !== '/ws' || request.headers['sec-websocket-version'] !== '13' || typeof key !== 'string' || !originAllowed) {
      socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
      socket.destroy();
      return;
    }
    const accept = crypto.createHash('sha1').update(`${key.trim()}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest('base64');
    socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
    const peer = new WebSocketPeer(socket, onPeerMessage, onPeerClose);
    peer.version = null;
    peer.helloTimer = setTimeout(() => {
      if (!peer.helloReceived && !peer.closed) peer.close(1008, 'hello timeout');
    }, PEER_HELLO_TIMEOUT_MS);
    peer.helloTimer.unref?.();
    peer.accept(head);
  }

  const server = http.createServer((request, response) => {
    handle(request, response).catch((error) => {
      if (!response.headersSent) jsonResponse(response, 500, { ok: false, error: errorMessage(error) });
      else response.destroy();
    });
  });
  server.maxConnections = 64;
  server.keepAliveTimeout = 5_000;
  server.headersTimeout = 10_000;
  server.requestTimeout = COMMAND_TIMEOUT_MS + 10_000;
  server.maxRequestsPerSocket = 100;
  server.on('upgrade', (request, socket, head) => {
    try { onUpgrade(request, socket, head); } catch { socket.destroy(); }
  });

  async function writePid() {
    fs.mkdirSync(path.dirname(pidFile), { recursive: true, mode: 0o700 });
    let existing = null;
    try { existing = Number.parseInt(fs.readFileSync(pidFile, 'utf8').trim(), 10); } catch { /* absent or stale */ }
    if (Number.isInteger(existing) && existing > 0 && existing !== process.pid) {
      try {
        process.kill(existing, 0);
        throw new Error(`another WebBridge daemon is running (pid ${existing})`);
      } catch (error) {
        if (error?.code !== 'ESRCH') throw error;
      }
    }
    fs.writeFileSync(pidFile, `${process.pid}\n`, { encoding: 'utf8', mode: 0o600 });
    try { fs.chmodSync(pidFile, 0o600); } catch { /* best effort */ }
    pidOwned = true;
  }

  async function listen() {
    if (started) return address();
    await writePid();
    await new Promise((resolve, reject) => {
      const onError = (error) => { server.removeListener('listening', onListening); reject(error); };
      const onListening = () => { server.removeListener('error', onError); resolve(); };
      server.once('error', onError);
      server.once('listening', onListening);
      server.listen({ host, port, exclusive: true });
    }).catch((error) => {
      if (pidOwned) {
        try {
          if (Number.parseInt(fs.readFileSync(pidFile, 'utf8').trim(), 10) === process.pid) fs.unlinkSync(pidFile);
        } catch { /* best effort */ }
        pidOwned = false;
      }
      throw error;
    });
    started = true;
    pingTimer = setInterval(() => {
      for (const peer of [...extensionPeers]) {
        if (peer.closed) {
          extensionPeers.delete(peer);
          continue;
        }
        if (Date.now() - peer.lastSeenAt > PEER_IDLE_TIMEOUT_MS) {
          peer.close(1001, 'extension heartbeat timeout');
          continue;
        }
        try { peer.send({ type: 'ping' }); } catch { peer.close(1011, 'send failure'); }
      }
      selectExtension();
    }, 15_000);
    pingTimer.unref?.();
    log(`daemon started version=${VERSION} addr=${host}:${port}`);
    return address();
  }

  function address() {
    const value = server.address();
    return value && typeof value === 'object' ? { host: value.address, port: value.port } : { host, port };
  }

  async function close() {
    if (closing) return;
    closing = true;
    clearInterval(pingTimer);
    pingTimer = null;
    rejectPending(new Error('daemon stopped'));
    for (const peer of [...extensionPeers]) peer.close(1001, 'daemon stopping');
    extensionPeers.clear();
    extension = null;
    await new Promise((resolve) => {
      if (!server.listening) resolve();
      else server.close(() => resolve());
    });
    if (pidOwned) {
      try {
        if (Number.parseInt(fs.readFileSync(pidFile, 'utf8').trim(), 10) === process.pid) fs.unlinkSync(pidFile);
      } catch { /* best effort */ }
      pidOwned = false;
    }
    started = false;
    log('daemon stopped');
  }

  return {
    server,
    listen,
    close,
    address,
    status,
    log,
    dispatch,
    get policy() { return policy; },
    set policy(value) { policy = parsePolicy(value); },
    paths: { home, logsDir, pidFile, logFile, policyFile },
  };
}

function parseAddress(value) {
  if (!value) return {};
  const match = /^(127\.0\.0\.1|localhost|\[::1\]):(\d+)$/u.exec(value);
  if (!match) throw new Error(`invalid --addr value: ${value}`);
  return { host: match[1] === 'localhost' ? DEFAULT_HOST : match[1].replace(/^\[|\]$/gu, ''), port: finitePort(match[2]) };
}

function queryStatus(options = {}) {
  const host = options.host ?? process.env.KIMI_WEBBRIDGE_HOST ?? DEFAULT_HOST;
  const port = finitePort(options.port ?? process.env.KIMI_WEBBRIDGE_PORT);
  if (host !== DEFAULT_HOST && host !== '::1') throw new Error('WebBridge binds to loopback only');
  return new Promise((resolve, reject) => {
    const request = http.get({ host, port, path: '/status', timeout: 2_000, headers: { Accept: 'application/json' } }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.once('end', () => {
        if (response.statusCode !== 200) return reject(new Error(`status endpoint returned HTTP ${response.statusCode}`));
        try { resolve(JSON.parse(body)); } catch { reject(new Error('status endpoint returned invalid JSON')); }
      });
    });
    request.once('timeout', () => request.destroy(new Error('status request timed out')));
    request.once('error', reject);
  });
}

async function main(argv = process.argv.slice(2)) {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write('kimi-webbridge (Linux POSIX)\nUsage: kimi-webbridge status | start [--foreground] [--addr 127.0.0.1:10086]\n');
    return;
  }
  if (argv.includes('--version') || argv.includes('-v') || argv[0] === 'version') {
    process.stdout.write(`${VERSION}\n`);
    return;
  }
  const command = argv[0] && !argv[0].startsWith('-') ? argv[0] : 'start';
  if (command === 'status') {
    const addrIndex = argv.findIndex((item) => item === '--addr');
    const address = addrIndex >= 0 ? parseAddress(argv[addrIndex + 1]) : {};
    try {
      process.stdout.write(`${JSON.stringify(await queryStatus(address))}\n`);
    } catch (error) {
      process.stdout.write(`${JSON.stringify({ running: false, version: VERSION, daemon_version: VERSION, error: errorMessage(error) })}\n`);
      process.exitCode = 1;
    }
    return;
  }
  if (command !== 'start' && command !== 'serve' && command !== 'run') {
    throw new Error(`unsupported WebBridge command: ${command}`);
  }
  const addrIndex = argv.findIndex((item) => item === '--addr');
  const address = addrIndex >= 0 ? parseAddress(argv[addrIndex + 1]) : {};
  const instance = createWebBridgeServer(address);
  await instance.listen();
  const stop = () => { instance.close().finally(() => process.exit(0)); };
  process.once('SIGTERM', stop);
  process.once('SIGINT', stop);
  await new Promise(() => {});
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`kimi-webbridge: ${errorMessage(error)}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  VERSION,
  DEFAULT_POLICY,
  EXTENSION_ID,
  MAX_HTTP_BODY,
  MAX_WS_MESSAGE,
  MAX_LOG_BYTES,
  PEER_HELLO_TIMEOUT_MS,
  PEER_IDLE_TIMEOUT_MS,
  createWebBridgeServer,
  normalizeCommand,
  parsePolicy,
};
