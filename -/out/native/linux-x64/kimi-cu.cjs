#!/usr/bin/env node
'use strict';

/*
 * Small POSIX MCP bridge for the Linux Workbench permission surface.
 *
 * Kimi's upstream Computer Use helper is a macOS application.  Linux must
 * not display that .app path or silently launch a foreign binary, so this
 * bridge exposes the audited Linux adapters through the same stdio MCP shape
 * used by the settings' copyable configuration.  Input actions remain
 * fail-closed until the user enables Computer apps in Settings.
 */

const fs = require('node:fs');
const readline = require('node:readline');
const path = require('node:path');
const nativeRoot = fs.existsSync(path.join(__dirname, 'kimi-screen-capture.cjs'))
  ? __dirname
  : path.join(__dirname, '..', 'app.asar.unpacked', 'out', 'native', 'linux-x64');
const { captureScreen } = require(path.join(nativeRoot, 'kimi-screen-capture.cjs'));
const linuxWorkbench = require(path.join(nativeRoot, 'kimi-linux-workbench.cjs'));
const scrollInput = require(path.join(nativeRoot, 'kimi-scroll-input.cjs'));
const { commandPath, run } = require(path.join(nativeRoot, 'linux-common.cjs'));

const VERSION = 'native-posix-1';
const MAX_LINE_BYTES = 1024 * 1024;
const MAX_TEXT_BYTES = 16 * 1024;
const MAX_KEY_BYTES = 128;

function writeMessage(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function response(id, result) {
  return { jsonrpc: '2.0', id, result };
}

function errorResponse(id, code, message, data) {
  return { jsonrpc: '2.0', id, error: { code, message, ...(data === undefined ? {} : { data }) } };
}

function textContent(text) {
  return [{ type: 'text', text: String(text) }];
}

function capabilities() {
  return linuxWorkbench.capabilities({ env: process.env, platform: process.platform, arch: process.arch });
}

function enabled() {
  return linuxWorkbench.readComputerUseState({ env: process.env }).enabled === true;
}

function ensureInputEnabled() {
  if (!enabled()) throw new Error('computer-use-disabled: enable Computer apps in Kimi Work first');
}

function finiteCoordinate(value, name) {
  if (!Number.isFinite(value) || !Number.isSafeInteger(Math.trunc(value))) throw new Error(`invalid-${name}`);
  const result = Math.trunc(value);
  if (result < -32768 || result > 32768) throw new Error(`invalid-${name}`);
  return result;
}

function boundedText(value, name, maxBytes = MAX_TEXT_BYTES) {
  if (typeof value !== 'string' || !value || Buffer.byteLength(value, 'utf8') > maxBytes) throw new Error(`invalid-${name}`);
  return value;
}

function encodePng(bitmap) {
  if (!bitmap || !Number.isSafeInteger(bitmap.width) || !Number.isSafeInteger(bitmap.height) || !bitmap.data) throw new Error('invalid-screenshot');
  const converter = commandPath('convert') || commandPath('magick');
  if (!converter) throw new Error('screenshot-encoding-unavailable: ImageMagick convert is not installed');
  const args = converter.endsWith('/magick')
    ? ['-size', `${bitmap.width}x${bitmap.height}`, '-depth', '8', 'rgba:-', 'png:-']
    : ['-size', `${bitmap.width}x${bitmap.height}`, '-depth', '8', 'rgba:-', 'png:-'];
  const result = run(converter, args, { input: Buffer.from(bitmap.data), timeoutMs: 15_000, maxBuffer: 64 * 1024 * 1024 });
  if (!result.ok || result.stdout.length === 0) throw new Error(`screenshot-encoding-failed${result.stderr.length ? `: ${result.stderr.toString('utf8').slice(0, 200)}` : ''}`);
  return result.stdout;
}

function click(button = 1, x, y) {
  if (Number.isFinite(x) || Number.isFinite(y)) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('invalid-coordinate');
    if (!scrollInput.movePointer({ x: finiteCoordinate(x, 'x'), y: finiteCoordinate(y, 'y') })) throw new Error('pointer-backend-unavailable');
  }
  const numericButton = Number.isSafeInteger(button) ? button : Number.parseInt(String(button), 10);
  if (![1, 2, 3, 4, 5].includes(numericButton)) throw new Error('invalid-button');
  if (!commandPath('xdotool')) throw new Error('click-backend-unavailable: xdotool is not installed');
  const result = run('xdotool', ['click', String(numericButton)], { timeoutMs: 2_000, maxBuffer: 1024 });
  if (!result.ok) throw new Error('click-failed');
  return { ok: true, button: numericButton };
}

function typeText(value) {
  ensureInputEnabled();
  const text = boundedText(value, 'text');
  if (!commandPath('xdotool')) throw new Error('type-backend-unavailable: xdotool is not installed');
  const result = run('xdotool', ['type', '--clearmodifiers', '--delay', '0', '--', text], { timeoutMs: 5_000, maxBuffer: 1024 });
  if (!result.ok) throw new Error('type-failed');
  return { ok: true, bytes: Buffer.byteLength(text, 'utf8') };
}

function pressKey(value) {
  ensureInputEnabled();
  const key = boundedText(value, 'key', MAX_KEY_BYTES);
  if (!/^[A-Za-z0-9+_-]+$/u.test(key)) throw new Error('invalid-key');
  if (!commandPath('xdotool')) throw new Error('key-backend-unavailable: xdotool is not installed');
  const result = run('xdotool', ['key', '--clearmodifiers', '--', key], { timeoutMs: 2_000, maxBuffer: 1024 });
  if (!result.ok) throw new Error('key-failed');
  return { ok: true, key };
}

async function invoke(action, args = {}) {
  if (!action || typeof action !== 'string') throw new Error('missing-action');
  switch (action) {
    case 'status':
      return { ...capabilities(), enabled: enabled() };
    case 'screenshot': {
      ensureInputEnabled();
      const options = {};
      for (const name of ['x', 'y', 'width', 'height']) if (args[name] !== undefined) options[name] = finiteCoordinate(args[name], name);
      const bitmap = await captureScreen(options);
      const png = encodePng(bitmap);
      return { content: [{ type: 'image', data: png.toString('base64'), mimeType: 'image/png' }, ...textContent(`${bitmap.width}x${bitmap.height}`)] };
    }
    case 'move':
      ensureInputEnabled();
      if (!scrollInput.movePointer({ x: finiteCoordinate(args.x, 'x'), y: finiteCoordinate(args.y, 'y') })) throw new Error('pointer-backend-unavailable');
      return { ok: true, x: Math.trunc(args.x), y: Math.trunc(args.y) };
    case 'click':
      ensureInputEnabled();
      return click(args.button ?? 1, args.x, args.y);
    case 'scroll':
      ensureInputEnabled();
      if (!scrollInput.postScrollWheel({ x: finiteCoordinate(args.x, 'x'), y: finiteCoordinate(args.y, 'y'), lines: finiteCoordinate(args.lines, 'lines') })) throw new Error('scroll-backend-unavailable');
      return { ok: true, lines: Math.trunc(args.lines) };
    case 'type':
      return typeText(args.text);
    case 'key':
      return pressKey(args.key);
    default:
      throw new Error(`unsupported-action: ${action}`);
  }
}

const TOOL_SCHEMA = {
  type: 'object',
  properties: {
    action: { type: 'string', enum: ['status', 'screenshot', 'move', 'click', 'scroll', 'type', 'key'] },
    x: { type: 'integer', minimum: -32768, maximum: 32768 },
    y: { type: 'integer', minimum: -32768, maximum: 32768 },
    width: { type: 'integer', minimum: 1, maximum: 16384 },
    height: { type: 'integer', minimum: 1, maximum: 16384 },
    lines: { type: 'integer', minimum: -12, maximum: 12 },
    button: { type: 'integer', enum: [1, 2, 3, 4, 5] },
    text: { type: 'string', maxLength: 16384 },
    key: { type: 'string', maxLength: 128 },
  },
  required: ['action'],
  additionalProperties: false,
};

const TOOLS = [
  { name: 'computer', description: 'Use the native Linux desktop after Computer apps is enabled.', inputSchema: TOOL_SCHEMA },
  { name: 'computer_use', description: 'Alias for the native Linux desktop control tool.', inputSchema: TOOL_SCHEMA },
  { name: 'screenshot', description: 'Capture the native Linux desktop as a PNG image.', inputSchema: { type: 'object', properties: {}, additionalProperties: false } },
];

async function handle(message) {
  const id = message?.id;
  const method = message?.method;
  const params = message?.params ?? {};
  if (typeof method !== 'string') return id === undefined ? null : errorResponse(id, -32600, 'invalid request');
  if (method === 'notifications/initialized' || method === 'notifications/cancelled') return null;
  if (method === 'ping') return id === undefined ? null : response(id, {});
  if (method === 'initialize') {
    return id === undefined ? null : response(id, {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'kimi-cu-linux', version: VERSION },
    });
  }
  if (method === 'tools/list') return id === undefined ? null : response(id, { tools: TOOLS });
  if (method === 'tools/call') {
    const name = params?.name;
    const args = params?.arguments && typeof params.arguments === 'object' ? params.arguments : {};
    try {
      let result;
      if (name === 'screenshot') result = await invoke('screenshot', args);
      else if (name === 'computer' || name === 'computer_use') result = await invoke(args.action, args);
      else throw new Error(`unknown-tool: ${String(name)}`);
      if (result?.content) return id === undefined ? null : response(id, { content: result.content });
      return id === undefined ? null : response(id, { content: textContent(JSON.stringify(result)) });
    } catch (error) {
      const messageText = error instanceof Error ? error.message : String(error);
      return id === undefined ? null : response(id, { isError: true, content: textContent(messageText) });
    }
  }
  return id === undefined ? null : errorResponse(id, -32601, `method not found: ${method}`);
}

async function runServer() {
  const input = process.stdin;
  input.setEncoding('utf8');
  const rl = readline.createInterface({ input, crlfDelay: Infinity, terminal: false });
  for await (const line of rl) {
    if (Buffer.byteLength(line, 'utf8') > MAX_LINE_BYTES) {
      process.stderr.write('kimi-cu: request exceeds 1 MiB limit\n');
      continue;
    }
    let message;
    try { message = JSON.parse(line); } catch { continue; }
    try {
      const result = await handle(message);
      if (result) writeMessage(result);
    } catch (error) {
      if (message?.id !== undefined) writeMessage(errorResponse(message.id, -32000, error instanceof Error ? error.message : String(error)));
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--version') || args.includes('-v')) {
    process.stdout.write(`${VERSION}\n`);
    return;
  }
  if (args[0] === 'status') {
    process.stdout.write(`${JSON.stringify({ version: VERSION, ...capabilities(), enabled: enabled() })}\n`);
    return;
  }
  if (args[0] !== 'mcp') {
    process.stderr.write('Usage: kimi-cu mcp -s user | kimi-cu status\n');
    process.exitCode = 64;
    return;
  }
  runServer().catch((error) => {
    process.stderr.write(`kimi-cu: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}

main();
