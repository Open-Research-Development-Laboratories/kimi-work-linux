'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');
const { spawn } = require('node:child_process');

const common = require('../native/linux-common.cjs');
const keyboard = require('../native/kimi-keyboard-environment.cjs');
const globalInput = require('../native/kimi-global-input.cjs');
const ocr = require('../native/kimi-ocr.cjs');
const scroll = require('../native/kimi-scroll-input.cjs');
const screen = require('../native/kimi-screen-capture.cjs');
const namedPipe = require('../native/kimi-named-pipe.cjs');
const webBridge = require('../native/kimi-webbridge-daemon.cjs');
const linuxWorkbench = require('../native/kimi-linux-workbench.cjs');
const linuxHost = require('../native/linux-host.cjs');
const { EventEmitter } = require('node:events');
const hotkeys = require('../native/kimi-hotkeys.cjs');

test('keyboard environment has deterministic Linux default and override', () => {
  const previous = process.env.KIMI_LINUX_HOTKEY;
  delete process.env.KIMI_LINUX_HOTKEY;
  assert.equal(keyboard.evaluate(), 'AltRight');
  process.env.KIMI_LINUX_HOTKEY = 'Alt+Space';
  assert.equal(keyboard.evaluate(), 'Alt+Space');
  if (previous === undefined) delete process.env.KIMI_LINUX_HOTKEY;
  else process.env.KIMI_LINUX_HOTKEY = previous;
});

test('global accelerator mapping uses Electron POSIX names', () => {
  assert.equal(globalInput.toAccelerator('AltRight'), 'Alt+Right');
  assert.equal(globalInput.toAccelerator('Ctrl+Shift+K'), 'CommandOrControl+Shift+K');
  assert.equal(globalInput.toAccelerator('CommandOrControl+K'), 'CommandOrControl+K');
  assert.equal(globalInput.toAccelerator(''), null);
});

test('evdev parser emits a complete Linux chord lifecycle', () => {
  const state = globalInput.createRecordingState();
  const events = [];
  const emit = (code, kind) => {
    const record = Buffer.alloc(globalInput.EVDEV_EVENT_SIZE);
    record.writeUInt16LE(1, 16);
    record.writeUInt16LE(code, 18);
    record.writeInt32LE(kind, 20);
    globalInput.parseEvdevBuffer(record, state, (event) => events.push(event));
  };
  emit(29, 1); // left control
  emit(37, 1); // K
  emit(37, 0);
  emit(29, 0);
  emit(100, 1); // right Alt by itself
  emit(100, 0);
  assert.equal(events.length, 5);
  assert.equal(events[0].type, 'down');
  assert.equal(events[0].key, 'ControlLeft');
  assert.equal(events[1].key, 'K');
  assert.equal(events[1].hotkey, 'Ctrl+K');
  assert.equal(events[2].type, 'up');
  assert.equal(events[2].hotkey, 'Ctrl+K');
  assert.equal(events[3].hotkey, 'AltRight');
  assert.equal(events[4].type, 'up');
  assert.equal(events[4].hotkey, 'AltRight');
});

test('evdev parser preserves a chord when modifiers release first', () => {
  const state = globalInput.createRecordingState();
  const events = [];
  const emit = (code, kind) => {
    const record = Buffer.alloc(globalInput.EVDEV_EVENT_SIZE);
    record.writeUInt16LE(1, 16);
    record.writeUInt16LE(code, 18);
    record.writeInt32LE(kind, 20);
    globalInput.parseEvdevBuffer(record, state, (event) => events.push(event));
  };
  emit(29, 1); // left control
  emit(37, 1); // K
  emit(29, 0); // release modifier before the key
  emit(37, 0);
  assert.equal(events.at(-1).type, 'up');
  assert.equal(events.at(-1).hotkey, 'Ctrl+K');
});

test('Linux recording emits renderer candidate and recorded events', () => {
  assert.deepEqual(globalInput.recordingEvents({ type: 'down', key: 'K', hotkey: 'Ctrl+K' }), [
    { type: 'candidate', key: 'K', hotkey: 'Ctrl+K', shortcut: 'Ctrl+K' },
  ]);
  assert.deepEqual(globalInput.recordingEvents({ type: 'up', key: 'K', hotkey: 'Ctrl+K', heldForMs: 42 }), [
    { type: 'recorded', key: 'K', hotkey: 'Ctrl+K', shortcut: 'Ctrl+K', heldForMs: 42 },
  ]);
  assert.deepEqual(globalInput.recordingEvents({ type: 'up', key: 'AltRight', hotkey: 'AltRight' }), [
    { type: 'recorded', key: 'AltRight', hotkey: 'AltRight', shortcut: 'AltRight', heldForMs: 0 },
  ]);
  assert.deepEqual(globalInput.recordingEvents({ type: 'repeat', key: 'K', hotkey: 'Ctrl+K' }), []);
});

test('Linux side-specific Ctrl recording is a stable token', () => {
  const state = globalInput.createRecordingState();
  const events = [];
  const emit = (code, kind) => {
    const record = Buffer.alloc(globalInput.EVDEV_EVENT_SIZE);
    record.writeUInt16LE(1, 16);
    record.writeUInt16LE(code, 18);
    record.writeInt32LE(kind, 20);
    globalInput.parseEvdevBuffer(record, state, (event) => events.push(...globalInput.recordingEvents(event)));
  };
  emit(97, 1); // Right Ctrl
  emit(97, 0);
  assert.equal(events.at(-1).type, 'recorded');
  assert.equal(events.at(-1).hotkey, 'ControlRight');
  assert.equal(events.at(-1).shortcut, 'ControlRight');
});

test('global input recording is fail-closed without evdev access', async () => {
  const previous = process.env.KIMI_LINUX_RECORD_HOTKEY;
  delete process.env.KIMI_LINUX_RECORD_HOTKEY;
  const events = [];
  const recording = new globalInput.Recording((event) => events.push(event));
  assert.ok(['running', 'unavailable'].includes(recording.status()));
  recording.stop();
  assert.equal(recording.status(), 'stopped');
  if (previous === undefined) delete process.env.KIMI_LINUX_RECORD_HOTKEY;
  else process.env.KIMI_LINUX_RECORD_HOTKEY = previous;
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(events, []);
});

test('nonblocking Linux recording closes its evdev descriptors on stop', async () => {
  const child = spawn(process.execPath, ['-e', `const m=require(${JSON.stringify(path.resolve(__dirname, '../native/kimi-global-input.cjs'))}); const r=new m.Recording(()=>{}); setTimeout(()=>r.stop(),50);`], {
    env: { ...process.env, KIMI_LINUX_RECORD_HOTKEY: '' },
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  const exit = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error('Recording child did not exit after stop')); }, 1500);
    child.once('error', reject);
    child.once('exit', (code, signal) => { clearTimeout(timer); resolve({ code, signal }); });
  });
  assert.equal(exit.code, 0);
});

test('deterministic Linux recording override settles the renderer contract', async () => {
  const previous = process.env.KIMI_LINUX_RECORD_HOTKEY;
  process.env.KIMI_LINUX_RECORD_HOTKEY = 'Ctrl+Shift+K';
  const events = [];
  const recording = new globalInput.Recording((event) => events.push(event));
  try {
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(events, [{ type: 'recorded', hotkey: 'Ctrl+Shift+K', shortcut: 'Ctrl+Shift+K' }]);
  } finally {
    recording.stop();
    if (previous === undefined) delete process.env.KIMI_LINUX_RECORD_HOTKEY;
    else process.env.KIMI_LINUX_RECORD_HOTKEY = previous;
  }
});

test('persistent Linux bindings fan out through one shared reader', async () => {
  const previous = process.env.KIMI_LINUX_RECORD_HOTKEY;
  process.env.KIMI_LINUX_RECORD_HOTKEY = 'Ctrl+Shift+K';
  const first = [];
  const second = [];
  globalInput.resetSharedForTests();
  try {
    const a = globalInput.subscribeShared((event) => first.push(event));
    const b = globalInput.subscribeShared((event) => second.push(event));
    assert.equal(a.status, 'running');
    assert.equal(b.status, 'running');
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(first, [{ type: 'recorded', hotkey: 'Ctrl+Shift+K', shortcut: 'Ctrl+Shift+K' }]);
    assert.deepEqual(second, first);
    a.unsubscribe();
    assert.equal(globalInput.sharedStatus(), 'running');
    b.unsubscribe();
    assert.equal(globalInput.sharedStatus(), 'stopped');
  } finally {
    globalInput.resetSharedForTests();
    if (previous === undefined) delete process.env.KIMI_LINUX_RECORD_HOTKEY;
    else process.env.KIMI_LINUX_RECORD_HOTKEY = previous;
  }
});

test('custom hotkey registry persists bindings, rejects conflicts, and runs commands', async () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'kimi-hotkeys-test-'));
  const previous = process.env.KIMI_LINUX_RECORD_HOTKEY;
  process.env.KIMI_LINUX_RECORD_HOTKEY = 'Ctrl+Shift+K';
  const actions = [];
  globalInput.resetSharedForTests();
  try {
    const manager = new hotkeys.HotkeyManager({ home, platform: 'linux', arch: 'x64', env: { ...process.env, XDG_CONFIG_HOME: path.join(home, '.config') }, onAction: (event) => actions.push(event) });
    assert.equal(manager.start().running, true);
    const binding = manager.setBinding({ id: 'open-settings', shortcut: 'Ctrl+Shift+K' });
    assert.equal(binding.ok, true);
    const cleared = manager.setBinding({ id: 'open-settings', shortcut: '', enabled: false });
    assert.equal(cleared.ok, true);
    assert.equal(cleared.binding, null);
    const afterClear = cleared.actions.find((entry) => entry.id === 'open-settings');
    assert.equal(afterClear.shortcut, '');
    assert.equal(afterClear.enabled, false);
    assert.equal(JSON.parse(fs.readFileSync(hotkeys.configPath({ home, env: { XDG_CONFIG_HOME: path.join(home, '.config') } }), 'utf8')).bindings.some((entry) => entry.id === 'open-settings'), false);
    const bindingAgain = manager.setBinding({ id: 'open-settings', shortcut: 'Ctrl+Shift+K' });
    assert.equal(bindingAgain.ok, true);
    const conflict = manager.setBinding({ id: 'open-dashboard', shortcut: 'Ctrl+Shift+K' });
    assert.equal(conflict.ok, false);
    assert.equal(conflict.code, 'shortcut-conflict');
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(actions.at(-1).id, 'open-settings');
    const command = manager.upsertCommand({ name: 'test command', command: 'true', cwd: home });
    assert.equal(command.ok, true);
    const listed = manager.list();
    assert.ok(listed.actions.some((entry) => entry.id === 'open-settings' && entry.shortcut === 'Ctrl+Shift+K'));
    assert.ok(listed.commands.some((entry) => entry.id === command.command.id));
    const edited = manager.upsertCommand({ id: command.command.id, name: 'edited command', command: 'true', cwd: home, enabled: true });
    assert.equal(edited.ok, true);
    assert.equal(edited.command.shortcut, '');
    const assignedCommand = manager.upsertCommand({ id: command.command.id, name: 'edited command', command: 'true', cwd: home, shortcut: 'Ctrl+Alt+K', enabled: true });
    assert.equal(assignedCommand.ok, true);
    const preserved = manager.upsertCommand({ id: command.command.id, name: 'renamed command', command: 'true', cwd: home, enabled: true });
    assert.equal(preserved.ok, true);
    assert.equal(preserved.command.shortcut, 'Ctrl+Alt+K');
    assert.equal(manager.run(command.command.id).ok, true);
    manager.stop();
    assert.deepEqual(JSON.parse(fs.readFileSync(hotkeys.configPath({ home, env: { XDG_CONFIG_HOME: path.join(home, '.config') } }), 'utf8')).commands[0].name, 'renamed command');
  } finally {
    globalInput.resetSharedForTests();
    if (previous === undefined) delete process.env.KIMI_LINUX_RECORD_HOTKEY;
    else process.env.KIMI_LINUX_RECORD_HOTKEY = previous;
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('legacy hide-window binding is a single toggle action and remains clearable', () => {
  const normalized = hotkeys.normalizeConfig({
    schemaVersion: 1,
    bindings: [
      { id: 'hide-window', shortcut: 'Ctrl+H', enabled: true },
      { id: 'toggle-window', shortcut: 'Ctrl+T', enabled: true },
    ],
    commands: [],
  });
  assert.deepEqual(normalized.bindings, [{ id: 'toggle-window', shortcut: 'Ctrl+H', enabled: true }]);
  assert.equal(hotkeys.ACTION_REGISTRY.filter((entry) => entry.id === 'toggle-window').length, 1);
  assert.equal(hotkeys.ACTION_REGISTRY.some((entry) => entry.id === 'hide-window'), false);
});

test('OCR language mapping preserves Traditional Chinese and common locales', () => {
  assert.equal(ocr.languageCode(['zh-TW', 'en-US']), 'chi_tra+eng');
  assert.equal(ocr.languageCode(['zh-Hans', 'pt-BR', 'de']), 'chi_sim+por+deu');
});

test('clipboard file parsing accepts existing POSIX paths and file URIs only', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kimi-adapter-test-'));
  const file = path.join(dir, 'hello.txt');
  fs.writeFileSync(file, 'ok');
  try {
    assert.deepEqual(common.parseFileList(`${file}\n${pathToFileURL(file).href}\n/tmp/not-present`), [file]);
    assert.deepEqual(common.parseFileList(`file://remote.example${file}`), []);
    assert.deepEqual(common.parseFileList(file, 0), []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('PNG decoder rejects malformed input without unsafe allocation', () => {
  assert.throws(() => common.bitmapFromPng(Buffer.from('not-a-png')), /invalid PNG/);
});

test('bitmap crops validate dimensions and preserve row order', () => {
  const source = { width: 2, height: 2, data: Uint8Array.from({ length: 16 }, (_, index) => index) };
  assert.deepEqual(common.cropBitmap(source, 1, 0, 1, 2), { width: 1, height: 2, data: Uint8Array.from([4, 5, 6, 7, 12, 13, 14, 15]) });
  assert.throws(() => common.cropBitmap({ width: 2, height: 2, data: new Uint8Array(3) }, 0, 0, 1, 1), /invalid desktop capture bitmap/);
  assert.throws(() => common.cropBitmap(source, 0, 0, 0, 1), /invalid desktop capture bitmap/);
});

test('Linux adapter contracts expose bounded availability probes', () => {
  assert.equal(typeof screen.available(), 'boolean');
  assert.equal(typeof ocr.available(), 'boolean');
  assert.equal(typeof scroll.isScrollInputAvailable(), 'boolean');
  assert.equal(scroll.restoreScrollOverlay(), false);
  assert.equal(typeof require('../native/kimi-win32.cjs').setToolWindow, 'function');
});

test('Linux host capability receipt is structured and distro-aware', () => {
  const report = linuxHost.hostReport();
  assert.equal(report.schemaVersion, 1);
  assert.equal(typeof report.distribution.id, 'string');
  assert.ok(['glibc', 'musl', 'unknown'].includes(report.libc.family));
  assert.ok(Array.isArray(report.packageManagers));
  assert.ok(Array.isArray(report.browsers));
  assert.equal(typeof report.capture.ready, 'boolean');
  assert.equal(typeof report.tesseract.ready, 'boolean');
  assert.equal(typeof report.electronDependencies.checked, 'boolean');
  assert.equal(typeof report.slidesDependencies.checked, 'boolean');
  assert.ok(Array.isArray(report.blockers));
  assert.ok(Array.isArray(report.warnings));
});

test('Linux WebBridge command and policy schemas are bounded', () => {
  const command = webBridge.normalizeCommand({ name: 'navigate', args: { url: 'https://example.test' }, requestId: 'smoke-1' });
  assert.deepEqual(command, { name: 'navigate', args: { url: 'https://example.test' }, requestId: 'smoke-1' });
  assert.deepEqual(webBridge.normalizeCommand({ command: 'list_tabs', data: { session: 'default' }, requestId: 'smoke-2' }), { name: 'list_tabs', args: { session: 'default' }, requestId: 'smoke-2' });
  assert.throws(() => webBridge.normalizeCommand({ name: 'bad name', args: {} }), /command name/);
  const policy = webBridge.parsePolicy({ defaults: { navigate: 'always' }, sites: { 'example.test': { download: 'never' } } });
  assert.deepEqual(policy.defaults, { navigate: 'always', history: 'ask', download: 'always', upload: 'ask' });
  assert.deepEqual(policy.sites, { 'example.test': { download: 'never' } });
  assert.throws(() => webBridge.parsePolicy({ defaults: { navigate: 'invalid' } }), /invalid policy default/);
});

test('Linux WebBridge policy persists across daemon restarts', async () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'kimi-webbridge-policy-test-'));
  const request = (port, value) => new Promise((resolve, reject) => {
    const client = http.request({ host: '127.0.0.1', port, method: 'POST', path: '/policy', headers: { 'content-type': 'application/json' } }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => resolve({ status: response.statusCode, body: JSON.parse(body) }));
    });
    client.once('error', reject);
    client.end(JSON.stringify(value));
  });
  const first = webBridge.createWebBridgeServer({ home, port: 0 });
  const secondPolicy = { defaults: { navigate: 'always' }, sites: {}, cdpFullAccess: false };
  try {
    await first.listen();
    const response = await request(first.address().port, secondPolicy);
    assert.equal(response.status, 200);
    await first.close();
    const second = webBridge.createWebBridgeServer({ home, port: 0 });
    try { assert.equal(second.policy.defaults.navigate, 'always'); }
    finally { await second.close(); }
  } finally {
    await first.close();
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('Linux WebBridge bounds log growth and reports heartbeat age', async () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'kimi-webbridge-log-test-'));
  const logFile = path.join(home, 'logs', 'desktop-daemon.log');
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
  fs.writeFileSync(logFile, Buffer.alloc(webBridge.MAX_LOG_BYTES + 1, 0x78));
  const daemon = webBridge.createWebBridgeServer({ home, logFile, port: 0 });
  try {
    await daemon.listen();
    assert.equal(daemon.status().extension_heartbeat_age_ms, null);
    assert.equal(fs.existsSync(`${logFile}.prev`), true);
    assert.ok(fs.statSync(logFile).size < 4096);
  } finally {
    await daemon.close();
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('Linux workbench exposes native automation and autostart state', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'kimi-linux-workbench-test-'));
  const env = { PATH: '/usr/bin', XDG_CONFIG_HOME: path.join(home, '.config'), WAYLAND_DISPLAY: 'wayland-0' };
  try {
    assert.equal(linuxWorkbench.capabilities({ platform: 'linux', arch: 'x64', env }).kind, 'ready');
    assert.equal(linuxWorkbench.capabilities({ platform: 'darwin', arch: 'x64', env }).kind, 'unsupported');
    assert.equal(linuxWorkbench.getAutostart({ home, env, platform: 'linux', arch: 'x64' }), false);
    const enabled = linuxWorkbench.setAutostart(true, { home, env, platform: 'linux', arch: 'x64', execPath: '/opt/kimi-work/electron' });
    assert.equal(enabled.ok, true);
    assert.equal(enabled.enabled, true);
    assert.match(fs.readFileSync(enabled.path, 'utf8'), /Exec="\/opt\/kimi-work\/electron" --hidden/u);
    assert.equal(linuxWorkbench.setAutostart(false, { home, env, platform: 'linux', arch: 'x64' }).enabled, false);
    assert.equal(linuxWorkbench.computerUseState({ home, env, platform: 'linux', arch: 'x64' }).enabled, false);
    const computerUse = linuxWorkbench.setComputerUseEnabled(true, { home, env, platform: 'linux', arch: 'x64' });
    assert.equal(computerUse.ok, true);
    assert.equal(computerUse.enabled, true);
    assert.equal(linuxWorkbench.computerUseState({ home, env, platform: 'linux', arch: 'x64' }).enabled, true);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('Linux terminal launcher skips missing candidates and reports the started executable', async () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'kimi-terminal-test-'));
  const bin = path.join(home, 'bin');
  const marker = path.join(home, 'spawned.json');
  fs.mkdirSync(bin, { recursive: true });
  const fake = path.join(bin, 'fake-terminal');
  fs.writeFileSync(fake, '#!/bin/sh\nexit 0\n', { mode: 0o755 });
  const calls = [];
  try {
    const result = await linuxWorkbench.openTerminal({
      platform: 'linux',
      env: { PATH: bin },
      cwd: path.join(home, 'workspace'),
      candidates: [
        { name: 'missing-terminal', args: () => [] },
        { name: 'fake-terminal', args: (cwd) => ['--working-directory', cwd] },
      ],
      spawnImpl: (command, args, options) => {
        calls.push({ command, args, options });
        const child = new EventEmitter();
        child.unref = () => {};
        process.nextTick(() => child.emit('spawn'));
        return child;
      },
    });
    assert.deepEqual(result, { success: true, command: fake, cwd: path.join(home, 'workspace') });
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0].args, ['--working-directory', path.join(home, 'workspace')]);
    assert.equal(calls[0].options.detached, true);
    assert.equal(calls[0].options.stdio, 'ignore');
    assert.equal(fs.existsSync(marker), false);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('POSIX named-pipe replacement serves newline-delimited JSON and cleans up', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kimi-ipc-test-'));
  const endpoint = path.join(dir, 'control.sock');
  const requests = [];
  const id = namedPipe.startServer(endpoint, async ({ requestId, payload }) => {
    requests.push({ requestId, payload });
    return { ok: true, method: payload.method };
  });
  try {
    const response = await new Promise((resolve, reject) => {
      const socket = net.createConnection(endpoint);
      let data = '';
      const timer = setTimeout(() => { socket.destroy(); reject(new Error('IPC response timeout')); }, 2_000);
      socket.setEncoding('utf8');
      socket.on('error', (error) => { clearTimeout(timer); reject(error); });
      socket.on('data', (chunk) => {
        data += chunk;
        const newline = data.indexOf('\n');
        if (newline < 0) return;
        clearTimeout(timer);
        socket.end();
        resolve(JSON.parse(data.slice(0, newline)));
      });
      socket.on('connect', () => socket.write(`${JSON.stringify({ requestId: 7, method: 'health' })}\n`));
    });
    assert.deepEqual(response, { requestId: 7, payload: { ok: true, method: 'health' } });
    assert.deepEqual(requests, [{ requestId: 7, payload: { requestId: 7, method: 'health' } }]);
    assert.equal((fs.statSync(endpoint).mode & 0o777), 0o600);
  } finally {
    namedPipe.stopServer(id);
    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.equal(fs.existsSync(dir), true, 'explicit IPC parent must remain caller-owned');
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('POSIX named-pipe respond routes the raw newline-delimited payload', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kimi-ipc-respond-test-'));
  const endpoint = path.join(dir, 'control.sock');
  let id;
  id = namedPipe.startServer(endpoint, ({ requestId }) => {
    setImmediate(() => { namedPipe.respond(id, requestId, JSON.stringify({ ok: true, requestId }) + '\n'); });
  });
  try {
    const response = await new Promise((resolve, reject) => {
      const socket = net.createConnection(endpoint);
      let data = '';
      const timer = setTimeout(() => { socket.destroy(); reject(new Error('IPC raw response timeout')); }, 2_000);
      socket.setEncoding('utf8');
      socket.on('error', (error) => { clearTimeout(timer); reject(error); });
      socket.on('data', (chunk) => {
        data += chunk;
        const newline = data.indexOf('\n');
        if (newline < 0) return;
        clearTimeout(timer);
        socket.end();
        resolve(JSON.parse(data.slice(0, newline)));
      });
      socket.on('connect', () => socket.write(`${JSON.stringify({ requestId: 'raw-1', method: 'health' })}\n`));
    });
    assert.deepEqual(response, { ok: true, requestId: 'raw-1' });
  } finally {
    namedPipe.stopServer(id);
    await new Promise((resolve) => setTimeout(resolve, 20));
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('POSIX named-pipe refuses to replace a caller-owned regular path', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kimi-ipc-owned-test-'));
  const endpoint = path.join(dir, 'not-a-socket');
  fs.writeFileSync(endpoint, 'keep me');
  try {
    assert.throws(() => namedPipe.startServer(endpoint, () => undefined), /refusing to replace/);
    assert.equal(fs.readFileSync(endpoint, 'utf8'), 'keep me');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
