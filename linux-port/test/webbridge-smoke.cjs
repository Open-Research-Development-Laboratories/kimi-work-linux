'use strict';

/* End-to-end smoke for the packaged POSIX WebBridge replacement.  It does not
 * require a real browser: the small client below speaks the same masked
 * WebSocket frames that a Chromium extension emits. */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const wrapper = process.env.KIMI_WEBBRIDGE_WRAPPER;
const releaseRoot = process.env.KIMI_WEBBRIDGE_ROOT;
const nodeBinary = process.env.KIMI_WEBBRIDGE_NODE;
assert(wrapper && releaseRoot && nodeBinary, 'KIMI_WEBBRIDGE_* environment is required');

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const port = probe.address().port;
      probe.close(() => resolve(port));
    });
  });
}

function request(port, method, pathname, body) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, method, path: pathname, headers: body === undefined ? {} : { 'content-type': 'application/json' } }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let parsed;
        try { parsed = JSON.parse(text); } catch { parsed = null; }
        resolve({ status: res.statusCode, body: parsed, text });
      });
    });
    req.once('error', reject);
    if (body !== undefined) req.end(JSON.stringify(body));
    else req.end();
  });
}

function waitForStatus(port, predicate, timeoutMs = 5_000) {
  const deadline = Date.now() + timeoutMs;
  return (async () => {
    let lastError;
    while (Date.now() < deadline) {
      try {
        const response = await request(port, 'GET', '/status');
        if (response.status === 200 && predicate(response.body)) return response.body;
        lastError = new Error(`unexpected status response: ${response.text}`);
      } catch (error) {
        lastError = error;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    throw lastError || new Error('WebBridge status timeout');
  })();
}

function maskedFrame(value) {
  const payload = Buffer.from(JSON.stringify(value));
  assert(payload.length <= 0xffff, 'smoke payload too large');
  const mask = crypto.randomBytes(4);
  const header = payload.length < 126
    ? Buffer.from([0x81, 0x80 | payload.length])
    : (() => { const valueHeader = Buffer.allocUnsafe(4); valueHeader[0] = 0x81; valueHeader[1] = 0xfe; valueHeader.writeUInt16BE(payload.length, 2); return valueHeader; })();
  for (let index = 0; index < payload.length; index += 1) payload[index] ^= mask[index & 3];
  return Buffer.concat([header, mask, payload]);
}

function extractFrames(buffer) {
  const frames = [];
  let offset = 0;
  while (buffer.length - offset >= 2) {
    const first = buffer[offset];
    const second = buffer[offset + 1];
    let length = second & 0x7f;
    let headerLength = 2;
    if (length === 126) {
      if (buffer.length - offset < 4) break;
      length = buffer.readUInt16BE(offset + 2);
      headerLength = 4;
    } else if (length === 127) {
      if (buffer.length - offset < 10) break;
      const wide = buffer.readBigUInt64BE(offset + 2);
      assert(wide <= BigInt(1024 * 1024), 'server frame exceeds smoke bound');
      length = Number(wide);
      headerLength = 10;
    }
    if (buffer.length - offset < headerLength + length) break;
    frames.push({ opcode: first & 0x0f, payload: buffer.subarray(offset + headerLength, offset + headerLength + length) });
    offset += headerLength + length;
  }
  return [frames, buffer.subarray(offset)];
}

async function websocket(port) {
  const socket = net.createConnection(port, '127.0.0.1');
  await new Promise((resolve, reject) => {
    socket.once('connect', resolve);
    socket.once('error', reject);
  });
  const key = crypto.randomBytes(16).toString('base64');
  socket.write(`GET /ws HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nOrigin: chrome-extension://fldmhceldgbpfpkbgopacenieobmligc\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`);
  let buffer = Buffer.alloc(0);
  let handshake = false;
  const messages = [];
  const waiters = [];
  const push = (message) => {
    const waiter = waiters.shift();
    if (waiter) waiter(message);
    else messages.push(message);
  };
  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    if (!handshake) {
      const end = buffer.indexOf(Buffer.from('\r\n\r\n'));
      if (end < 0) return;
      const headers = buffer.subarray(0, end).toString('utf8');
      assert.match(headers, /^HTTP\/1\.1 101 /u);
      handshake = true;
      buffer = buffer.subarray(end + 4);
    }
    const [frames, rest] = extractFrames(buffer);
    buffer = rest;
    for (const frame of frames) if (frame.opcode === 0x1) push(JSON.parse(frame.payload.toString('utf8')));
  });
  const next = (timeoutMs = 2_000) => new Promise((resolve, reject) => {
    if (messages.length) { resolve(messages.shift()); return; }
    const timer = setTimeout(() => reject(new Error('WebBridge WebSocket message timeout')), timeoutMs);
    waiters.push((message) => { clearTimeout(timer); resolve(message); });
  });
  socket.write(maskedFrame({ type: 'hello', payload: { extensionVersion: '1.11.6' } }));
  const hello = await next();
  assert.equal(hello.type, 'hello_ack');
  return { socket, next };
}

(async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kimi-webbridge-smoke-'));
  const port = await freePort();
  const child = spawn(wrapper, ['start', '--foreground', '--addr', `127.0.0.1:${port}`], {
    cwd: releaseRoot,
    env: { ...process.env, HOME: path.join(root, 'home'), KIMI_WEBBRIDGE_ROOT: releaseRoot, KIMI_WEBBRIDGE_NODE: nodeBinary, KIMI_WEBBRIDGE_HOME: path.join(root, 'home', '.kimi-webbridge') },
    stdio: 'ignore',
  });
  let childError = null;
  child.once('error', (error) => { childError = error; });
  try {
    if (childError) throw childError;
    const initial = await waitForStatus(port, (body) => body?.running === true && body?.extension_connected === false);
    assert.equal(initial.version, '2.0.8');
    const bridge = await websocket(port);
    const connected = await waitForStatus(port, (body) => body?.extension_connected === true && body?.extension_version === '1.11.6');
    assert.equal(connected.extension_version, '1.11.6');
    const secondBridge = await websocket(port);
    const multiConnected = await waitForStatus(port, (body) => body?.extension_connected === true && body?.extension_connections === 2);
    assert.equal(multiConnected.extension_connections, 2);
    // Two browser profiles/contexts are allowed to share the daemon. Closing
    // one must not evict the healthy peer or make the daemon report a false
    // disconnected state.
    bridge.socket.destroy();
    const failover = await waitForStatus(port, (body) => body?.extension_connected === true && body?.extension_connections === 1);
    assert.equal(failover.extension_connections, 1);
    const command = request(port, 'POST', '/command', { name: 'navigate', args: { url: 'https://example.test' } });
    const call = await secondBridge.next();
    assert.equal(call.type, 'tool_call');
    secondBridge.socket.write(maskedFrame({ type: 'tool_result', responseToRequestId: call.requestId, payload: { data: { success: true, echoed: call.payload } } }));
    const commandResult = await command;
    assert.equal(commandResult.status, 200);
    assert.deepEqual(commandResult.body.data.echoed, { name: 'navigate', args: { url: 'https://example.test' } });
    const policy = await request(port, 'POST', '/policy', { version: 1, defaults: { navigate: 'always' }, sites: {}, cdpFullAccess: false });
    assert.equal(policy.status, 200);
    assert.equal(policy.body.policy.defaults.navigate, 'always');
    secondBridge.socket.destroy();
    await new Promise((resolve) => setTimeout(resolve, 50));
    const logFile = path.join(root, 'home', '.kimi-webbridge', 'logs', 'desktop-daemon.log');
    const log = fs.readFileSync(logFile, 'utf8');
    assert.match(log, /\[ws\] extension connected/u);
    assert.match(log, /hello from extension v1\.11\.6 \(daemon v2\.0\.8\)/u);
    console.log(JSON.stringify({ ok: true, port, extension: connected.extension_version, command: commandResult.body.data }));
  } finally {
    if (!child.killed) child.kill('SIGTERM');
    await new Promise((resolve) => {
      const timer = setTimeout(() => { child.kill('SIGKILL'); resolve(); }, 3_000);
      child.once('exit', () => { clearTimeout(timer); resolve(); });
    });
    fs.rmSync(root, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
