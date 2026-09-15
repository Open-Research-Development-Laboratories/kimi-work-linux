'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');

const servers = new Map();
let nextId = 1;
const MAX_REQUEST_BYTES = 1 * 1024 * 1024;
const MAX_CONNECTIONS = 32;

function endpointFor(requested) {
  if (typeof requested === 'string' && requested.startsWith('/')) return { endpoint: requested, ownedDirectory: false };
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kimi-work-ipc-'));
  return { endpoint: path.join(dir, 'control.sock'), ownedDirectory: true };
}

function startServer(requestedEndpoint, onRequest) {
  const { endpoint, ownedDirectory } = endpointFor(requestedEndpoint);
  try {
    const existing = fs.lstatSync(endpoint);
    if (!existing.isSocket() || (typeof process.getuid === 'function' && existing.uid !== process.getuid())) {
      throw new Error(`refusing to replace non-owned IPC endpoint: ${endpoint}`);
    }
    fs.unlinkSync(endpoint);
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      if (ownedDirectory) {
        try { fs.rmSync(path.dirname(endpoint), { recursive: true, force: true }); } catch { /* best effort */ }
      }
      throw error;
    }
  }
  const id = nextId++;
  const sockets = new Map();
  const pending = new Map();
  const server = net.createServer((socket) => {
    if (sockets.size >= MAX_CONNECTIONS) {
      socket.end();
      return;
    }
    sockets.set(socket, socket);
    let buffered = '';
    socket.setEncoding('utf8');
    socket.on('data', (chunk) => {
      buffered += chunk;
      if (Buffer.byteLength(buffered, 'utf8') > MAX_REQUEST_BYTES) {
        buffered = '';
        socket.end();
        return;
      }
      let newline;
      while ((newline = buffered.indexOf('\n')) >= 0) {
        const line = buffered.slice(0, newline);
        buffered = buffered.slice(newline + 1);
        if (!line.trim()) continue;
        let payload;
        try { payload = JSON.parse(line); } catch { continue; }
        const requestId = payload?.requestId ?? payload?.id ?? null;
        if (requestId !== null) pending.set(String(requestId), socket);
        Promise.resolve(typeof onRequest === 'function' ? onRequest({ requestId, payload, socket }) : null)
          .then((response) => {
            if (response === undefined || socket.destroyed) return;
            if (requestId !== null) pending.delete(String(requestId));
            const encoded = typeof response === 'string' || Buffer.isBuffer(response) || response instanceof Uint8Array
              ? Buffer.from(response).toString('utf8')
              : JSON.stringify({ requestId, payload: response });
            socket.write(encoded.endsWith('\n') ? encoded : `${encoded}\n`);
          })
          .catch(() => {
            if (requestId !== null) pending.delete(String(requestId));
            if (!socket.destroyed) socket.write(`${JSON.stringify({ ok: false, code: 'internal_error' })}\n`);
          });
      }
    });
    socket.on('close', () => {
      sockets.delete(socket);
      for (const [requestId, pendingSocket] of pending) if (pendingSocket === socket) pending.delete(requestId);
    });
  });
  server.on('error', () => {});
  server.listen(endpoint, () => {
    try { fs.chmodSync(endpoint, 0o600); } catch { /* best effort */ }
  });
  servers.set(id, { endpoint, ownedDirectory, server, sockets, pending });
  return id;
}

function respond(id, requestId, data) {
  const entry = servers.get(id);
  if (!entry) return false;
  const key = requestId === null || requestId === undefined ? null : String(requestId);
  const socket = key === null ? null : entry.pending.get(key);
  if (!socket || socket.destroyed) return false;
  entry.pending.delete(key);
  const message = typeof data === 'string' || Buffer.isBuffer(data) || data instanceof Uint8Array
    ? Buffer.from(data).toString('utf8')
    : JSON.stringify(data);
  socket.write(message.endsWith('\n') ? message : `${message}\n`);
  return true;
}

function stopServer(id) {
  const entry = servers.get(id);
  if (!entry) return;
  servers.delete(id);
  entry.pending.clear();
  for (const socket of entry.sockets.values()) socket.destroy();
  entry.server.close(() => {
    try { fs.rmSync(entry.endpoint, { force: true }); } catch { /* best effort */ }
    if (entry.ownedDirectory) {
      try { fs.rmSync(path.dirname(entry.endpoint), { recursive: true, force: true }); } catch { /* best effort */ }
    }
  });
}

module.exports = { respond, startServer, stopServer };
