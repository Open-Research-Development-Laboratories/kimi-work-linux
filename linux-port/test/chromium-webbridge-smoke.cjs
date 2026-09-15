'use strict';

const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const project = path.resolve(__dirname, '..');
const output = path.resolve(process.env.KIMI_LINUX_OUTPUT || path.join(project, 'dist', 'kimi-work-linux-x64'));
const extensionId = 'fldmhceldgbpfpkbgopacenieobmligc';
const extensionVersion = '1.11.6';
const wrapper = path.join(output, 'resources', 'resources', 'kimi-webbridge');
const node = path.join(output, 'resources', 'resources', 'runtime', 'node');
const crx = path.join(output, 'resources', 'resources', 'webbridge-extension', `${extensionId}.crx`);
const unpacked = path.join(output, 'resources', 'resources', 'webbridge-extension', 'unpacked');

function browserPath() {
  const configured = process.env.KIMI_CHROMIUM_BIN;
  if (configured && fs.existsSync(configured)) return configured;
  for (const candidate of ['chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable', 'microsoft-edge', 'microsoft-edge-stable', 'brave', 'brave-browser', 'vivaldi', 'vivaldi-stable']) {
    for (const directory of String(process.env.PATH || '').split(path.delimiter)) {
      const value = path.join(directory, candidate);
      try { if (fs.statSync(value).isFile() && (fs.statSync(value).mode & 0o111) !== 0) return value; } catch { /* continue */ }
    }
  }
  return null;
}

function request(method, port, pathname, body) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? null : Buffer.from(JSON.stringify(body));
    const client = http.request({ host: '127.0.0.1', port, method, path: pathname, headers: payload ? { 'content-type': 'application/json', 'content-length': payload.length } : {} }, (response) => {
      let data = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        try { resolve({ status: response.statusCode, body: JSON.parse(data) }); }
        catch (error) { reject(error); }
      });
    });
    client.once('error', reject);
    client.setTimeout(1_000, () => client.destroy(new Error('request timeout')));
    if (payload) client.end(payload); else client.end();
  });
}

async function waitFor(check, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const result = await check();
      if (result) return result;
    } catch (error) { lastError = error; }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (lastError) throw lastError;
  throw new Error('timed out waiting for Chromium/WebBridge integration');
}

async function stop(child) {
  if (!child || child.exitCode !== null) return;
  child.kill('SIGTERM');
  await new Promise((resolve) => {
    const timer = setTimeout(() => { try { child.kill('SIGKILL'); } catch {} resolve(); }, 3_000);
    child.once('exit', () => { clearTimeout(timer); resolve(); });
  });
}

async function main() {
  const browser = browserPath();
  if (!browser) throw new Error('Chromium/Chrome/Edge is not installed; run configure-linux-host.sh and install a Chromium-family browser');
  for (const file of [wrapper, node, crx, unpacked]) if (!fs.existsSync(file)) throw new Error(`missing WebBridge release file: ${file}`);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'kimi-chromium-webbridge-'));
  const daemonHome = path.join(profile, 'daemon');
  fs.mkdirSync(daemonHome, { recursive: true });
  let daemon = null;
  let browserProcess = null;
  try {
    let running = false;
    try { running = (await request('GET', 10086, '/status')).body?.running === true; } catch { /* start an isolated daemon below */ }
    if (!running) {
      daemon = spawn(wrapper, ['start', '--foreground'], {
        cwd: output,
        env: { ...process.env, KIMI_WEBBRIDGE_ROOT: output, KIMI_WEBBRIDGE_NODE: node, KIMI_WEBBRIDGE_HOME: daemonHome, KIMI_WEBBRIDGE_PORT: '10086' },
        stdio: 'ignore',
      });
      await waitFor(async () => (await request('GET', 10086, '/status')).body?.running === true);
    }
    const browserArgs = [
      '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--no-first-run', '--no-default-browser-check',
      `--user-data-dir=${path.join(profile, 'browser')}`, 'about:blank',
    ];
    if (process.env.KIMI_CHROMIUM_UNPACKED === '1') {
      browserArgs.splice(browserArgs.length - 1, 0, `--disable-extensions-except=${unpacked}`, `--load-extension=${unpacked}`);
    }
    browserProcess = spawn(browser, browserArgs, { env: { ...process.env, DISPLAY: process.env.DISPLAY || ':0', WAYLAND_DISPLAY: process.env.WAYLAND_DISPLAY || 'wayland-0', XDG_RUNTIME_DIR: process.env.XDG_RUNTIME_DIR || `/run/user/${process.getuid?.() ?? 1000}` }, stdio: 'ignore' });
    const connected = await waitFor(async () => {
      const body = (await request('GET', 10086, '/status')).body;
      return body.extension_connected === true && body.extension_version === extensionVersion ? body : null;
    });
    const relay = await request('POST', 10086, '/command', { name: 'list_tabs', args: {} });
    if (relay.status !== 200 || relay.body?.ok !== true || relay.body?.data?.success !== true) throw new Error(`real Chromium WebBridge command relay failed: ${JSON.stringify(relay)}`);
    console.log(JSON.stringify({ ok: true, browser, extensionId, extensionVersion: connected.extension_version, command: relay.body.data }));
  } finally {
    await stop(browserProcess);
    await stop(daemon);
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* temporary evidence cleanup is best effort */ }
  }
}

main().catch((error) => { console.error(error.stack || error.message || String(error)); process.exitCode = 1; });
