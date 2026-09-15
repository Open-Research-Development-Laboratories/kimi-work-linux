'use strict';

/*
 * Extensible Linux hotkey registry.
 *
 * The desktop bundle historically owned one accelerator (the launcher) and
 * opened a native input reader for every binding.  This module is the single
 * registry for all future actions and user commands.  It subscribes to the
 * shared evdev reader, persists an atomic user-owned JSON document, rejects
 * conflicting shortcuts, and keeps command execution bounded.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { spawn } = require('node:child_process');
const globalInput = require('./kimi-global-input.cjs');

const SCHEMA_VERSION = 1;
const MAX_BINDINGS = 64;
const MAX_COMMANDS = 64;
const MAX_NAME_LENGTH = 160;
const MAX_COMMAND_LENGTH = 8192;
const MAX_CWD_LENGTH = 4096;
const MAX_CONCURRENT_COMMANDS = 4;
const RECORD_TIMEOUT_MS = 10_000;

// Keep this registry data-only.  Adding a future client action requires one
// entry here plus a dispatch case in the main/preload bridge; persistence and
// conflict handling do not need to change.
const ACTION_REGISTRY = Object.freeze([
  { id: 'open-launcher', label: 'Open launcher', description: 'Summon the Kimi launcher', kind: 'builtin', controlsExistingLauncher: true },
  { id: 'new-task', label: 'New task', description: 'Open a new Kimi Work task', kind: 'builtin' },
  { id: 'open-dashboard', label: 'Open dashboard', description: 'Show the Kimi Work dashboard', kind: 'builtin' },
  { id: 'open-plugins', label: 'Open plugins', description: 'Show installed plugins', kind: 'builtin' },
  { id: 'open-scheduled', label: 'Open scheduled tasks', description: 'Show scheduled work', kind: 'builtin' },
  { id: 'open-remote-control', label: 'Open remote control', description: 'Show phone/remote control pairing', kind: 'builtin' },
  { id: 'open-settings', label: 'Open settings', description: 'Open Kimi Work settings', kind: 'builtin' },
  { id: 'open-shortcuts', label: 'Open shortcuts settings', description: 'Open the current Kimi Work settings pane', kind: 'builtin' },
  { id: 'open-desktop-claw', label: 'Open Kimi Claw', description: 'Show the desktop automation panel', kind: 'builtin' },
  { id: 'open-terminal', label: 'Open terminal', description: 'Open a terminal in the Kimi workspace', kind: 'builtin' },
  // There is deliberately one visibility action.  Older Linux builds wrote
  // `hide-window`; normalize that legacy id to this action so an upgrade
  // cannot leave a second, conflicting row or a binding that can never be
  // cleared from the UI.
  { id: 'toggle-window', label: 'Show/hide Kimi', description: 'Toggle Kimi and its desktop pet', kind: 'builtin' },
  { id: 'quit-app', label: 'Quit Kimi', description: 'Exit Kimi Work', kind: 'builtin' },
]);

const ACTIONS_BY_ID = new Map(ACTION_REGISTRY.map((action) => [action.id, action]));
const LEGACY_ACTION_ALIASES = Object.freeze({ 'hide-window': 'toggle-window' });

function canonicalActionId(value) {
  return LEGACY_ACTION_ALIASES[value] || value;
}

function homeDirectory(home = os.homedir()) {
  return typeof home === 'string' && home.length > 0 ? home : os.homedir();
}

function configDirectory(env = process.env, home = os.homedir()) {
  const configured = typeof env?.XDG_CONFIG_HOME === 'string' ? env.XDG_CONFIG_HOME.trim() : '';
  return configured || path.join(homeDirectory(home), '.config');
}

function configPath(options = {}) {
  return path.join(configDirectory(options.env, options.home), 'kimi-desktop', 'custom-hotkeys.json');
}

function atomicWrite(file, contents, mode = 0o600) {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const temporary = `${file}.tmp-${process.pid}-${Date.now()}`;
  try {
    const fd = fs.openSync(temporary, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_TRUNC, mode);
    try {
      fs.writeFileSync(fd, contents, 'utf8');
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    fs.chmodSync(temporary, mode);
    fs.renameSync(temporary, file);
  } catch (error) {
    try { fs.unlinkSync(temporary); } catch { /* preserve original error */ }
    throw error;
  }
}

function emptyConfig() {
  return { schemaVersion: SCHEMA_VERSION, bindings: [], commands: [] };
}

function text(value, max, field) {
  if (typeof value !== 'string') throw new TypeError(`${field} must be a string`);
  const result = value.trim();
  if (result.length > max) throw new RangeError(`${field} exceeds ${max} characters`);
  if (result.includes('\0')) throw new TypeError(`${field} contains NUL`);
  return result;
}

function normalizeId(value, field = 'id') {
  const id = text(value, 96, field);
  if (!/^[a-z0-9][a-z0-9._-]*$/u.test(id)) throw new TypeError(`${field} has invalid characters`);
  return id;
}

function normalizeShortcut(value, { allowEmpty = false } = {}) {
  if (value === null || value === undefined) return allowEmpty ? '' : null;
  const shortcut = text(value, 160, 'shortcut');
  if (!shortcut && allowEmpty) return '';
  // Linux evdev names (ControlRight, AltRight) and composed chords
  // (Ctrl+Shift+K) are intentionally kept in the same stable token format as
  // the existing launcher setting.
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]*(?:\+[A-Za-z0-9][A-Za-z0-9_-]*)*$/u.test(shortcut)) throw new TypeError('shortcut has invalid format');
  return shortcut;
}

function shortcutKey(value) {
  return normalizeShortcut(value, { allowEmpty: true }).toLowerCase();
}

function normalizeBinding(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new TypeError('binding must be an object');
  const id = canonicalActionId(normalizeId(raw.id, 'binding id'));
  if (!ACTIONS_BY_ID.has(id)) throw new TypeError(`unknown action: ${id}`);
  const shortcut = normalizeShortcut(raw.shortcut, { allowEmpty: true });
  return { id, shortcut, enabled: raw.enabled !== false };
}

function normalizeCommand(raw, { allowGeneratedId = false } = {}) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new TypeError('command must be an object');
  const generated = allowGeneratedId && (raw.id === undefined || raw.id === null || raw.id === '')
    ? `command-${randomUUID().slice(0, 12)}`
    : raw.id;
  const id = normalizeId(generated, 'command id');
  const name = text(raw.name, MAX_NAME_LENGTH, 'command name');
  const command = text(raw.command, MAX_COMMAND_LENGTH, 'command');
  const cwd = text(raw.cwd || homeDirectory(), MAX_CWD_LENGTH, 'command cwd');
  if (!name) throw new TypeError('command name is required');
  if (!command) throw new TypeError('command is required');
  if (!path.isAbsolute(cwd)) throw new TypeError('command cwd must be absolute');
  return { id, name, command, cwd, shortcut: normalizeShortcut(raw.shortcut, { allowEmpty: true }), enabled: raw.enabled !== false };
}

function normalizeConfig(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return emptyConfig();
  const bindings = [];
  const bindingIds = new Set();
  for (const candidate of Array.isArray(raw.bindings) ? raw.bindings.slice(0, MAX_BINDINGS) : []) {
    try {
      const binding = normalizeBinding(candidate);
      // `hide-window` is a legacy alias for `toggle-window`.  Keep the first
      // occurrence deterministic when both ids exist in an upgraded file.
      if (bindingIds.has(binding.id)) continue;
      bindingIds.add(binding.id);
      bindings.push(binding);
    } catch { /* invalid entries are fail-closed and omitted */ }
  }
  const commands = [];
  for (const candidate of Array.isArray(raw.commands) ? raw.commands.slice(0, MAX_COMMANDS) : []) {
    try { commands.push(normalizeCommand(candidate)); } catch { /* invalid entries are fail-closed and omitted */ }
  }
  const result = { schemaVersion: SCHEMA_VERSION, bindings, commands };
  // A hand-edited document with duplicate shortcuts must never make the
  // manager choose nondeterministically.  Disable all conflicting entries;
  // the UI then reports the conflict and lets the user repair it.
  const seen = new Map();
  for (const entry of [...bindings, ...commands]) {
    if (!entry.enabled || !entry.shortcut) continue;
    const key = shortcutKey(entry.shortcut);
    const ids = seen.get(key) || [];
    ids.push(entry.id);
    seen.set(key, ids);
  }
  for (const ids of seen.values()) {
    if (ids.length < 2) continue;
    for (const id of ids) {
      const entry = result.bindings.find((item) => item.id === id) || result.commands.find((item) => item.id === id);
      if (entry) entry.enabled = false;
    }
  }
  return result;
}

function readConfig(options = {}) {
  const file = configPath(options);
  try { return normalizeConfig(JSON.parse(fs.readFileSync(file, 'utf8'))); }
  catch { return emptyConfig(); }
}

function configConflicts(config) {
  const seen = new Map();
  for (const entry of [...config.bindings, ...config.commands]) {
    if (!entry.enabled || !entry.shortcut) continue;
    const key = shortcutKey(entry.shortcut);
    const ids = seen.get(key) || [];
    ids.push(entry.id);
    seen.set(key, ids);
  }
  return [...seen.entries()].filter(([, ids]) => ids.length > 1).map(([shortcut, ids]) => ({ shortcut, ids }));
}

function ensureNoConflicts(config) {
  const conflicts = configConflicts(config);
  if (conflicts.length > 0) {
    const error = new Error(`shortcut conflict: ${conflicts.map((item) => item.ids.join(', ')).join('; ')}`);
    error.code = 'shortcut-conflict';
    error.conflicts = conflicts;
    throw error;
  }
}

function writeConfig(config, options = {}) {
  // Check the caller's proposed entries before normalization can disable
  // duplicates.  Existing hand-edited files are repaired fail-closed by
  // normalizeConfig(), but an interactive update must be rejected atomically
  // so the user sees the conflict instead of silently losing a binding.
  ensureNoConflicts(config);
  const normalized = normalizeConfig(config);
  ensureNoConflicts(normalized);
  const file = configPath(options);
  atomicWrite(file, `${JSON.stringify(normalized, null, 2)}\n`);
  return { config: normalized, path: file };
}

function updateEntry(config, collection, value) {
  const index = config[collection].findIndex((entry) => entry.id === value.id);
  if (index < 0) config[collection].push(value);
  else config[collection][index] = value;
}

function executeCommand(command, options = {}) {
  const active = options.activeProcesses ?? new Set();
  if (active.size >= MAX_CONCURRENT_COMMANDS) return { ok: false, code: 'command-capacity', message: 'command concurrency limit reached' };
  const cwd = command.cwd || homeDirectory(options.home);
  try {
    const stat = fs.statSync(cwd);
    if (!stat.isDirectory()) return { ok: false, code: 'cwd-not-directory', message: 'command working directory is not a directory' };
  } catch {
    return { ok: false, code: 'cwd-not-found', message: 'command working directory does not exist' };
  }
  let child;
  try {
    child = (options.spawnImpl ?? spawn)('/bin/sh', ['-lc', command.command], {
      cwd,
      env: { ...(options.env ?? process.env), KIMI_HOTKEY_COMMAND_ID: command.id },
      detached: true,
      stdio: 'ignore',
    });
  } catch (error) {
    return { ok: false, code: 'spawn-failed', message: error instanceof Error ? error.message : String(error) };
  }
  if (!child || typeof child.once !== 'function') return { ok: false, code: 'spawn-failed', message: 'command launcher did not return a child process' };
  active.add(child);
  const release = () => active.delete(child);
  child.once('error', release);
  child.once('close', release);
  child.once('exit', release);
  try { child.unref?.(); } catch { /* best effort */ }
  return { ok: true, id: command.id, pid: Number.isInteger(child.pid) ? child.pid : null };
}

class HotkeyManager {
  #options;
  #config;
  #unsubscribe = null;
  #recording = null;
  #activeProcesses = new Set();
  #started = false;
  #inputStatus = 'stopped';

  constructor(options = {}) {
    this.#options = { ...options };
    this.#config = readConfig(this.#options);
    this.onAction = typeof options.onAction === 'function' ? options.onAction : () => {};
  }

  start() {
    if (this.#started) return this.status();
    if ((this.#options.platform ?? process.platform) !== 'linux') {
      this.#inputStatus = 'unsupported';
      return this.status();
    }
    try {
      const shared = globalInput.subscribeShared((event) => this.#onEvent(event));
      this.#unsubscribe = shared.unsubscribe;
      this.#inputStatus = shared.status;
      this.#started = shared.status !== 'unavailable';
    } catch (error) {
      this.#inputStatus = 'unavailable';
      this.#started = false;
      this.lastError = error instanceof Error ? error.message : String(error);
    }
    return this.status();
  }

  stop() {
    if (this.#recording) {
      clearTimeout(this.#recording.timer);
      this.#recording.resolve({ ok: false, reason: 'stopped' });
      this.#recording = null;
    }
    try { this.#unsubscribe?.(); } catch { /* best effort */ }
    this.#unsubscribe = null;
    this.#started = false;
    this.#inputStatus = 'stopped';
    return this.status();
  }

  status() {
    return {
      schemaVersion: SCHEMA_VERSION,
      running: this.#started,
      inputStatus: this.#inputStatus,
      recording: Boolean(this.#recording),
      bindings: this.#config.bindings.filter((entry) => entry.enabled && entry.shortcut).length,
      commands: this.#config.commands.filter((entry) => entry.enabled && entry.shortcut).length,
      activeCommands: this.#activeProcesses.size,
      path: configPath(this.#options),
      lastError: this.lastError ?? null,
    };
  }

  reload() {
    this.#config = readConfig(this.#options);
    return this.list();
  }

  list() {
    return {
      schemaVersion: SCHEMA_VERSION,
      path: configPath(this.#options),
      status: this.status(),
      actions: ACTION_REGISTRY.map((action) => {
        const binding = this.#config.bindings.find((entry) => entry.id === action.id);
        return { ...action, shortcut: binding?.shortcut || '', enabled: binding?.enabled === true };
      }),
      commands: this.#config.commands.map((command) => ({ ...command })),
      conflicts: configConflicts(this.#config),
    };
  }

  setBinding(payload = {}) {
    const id = canonicalActionId(normalizeId(payload.id, 'binding id'));
    if (!ACTIONS_BY_ID.has(id)) return { ok: false, code: 'unknown-action', message: `unknown action: ${id}` };
    let shortcut;
    try { shortcut = normalizeShortcut(payload.shortcut, { allowEmpty: true }); }
    catch (error) { return { ok: false, code: 'invalid-shortcut', message: error.message }; }
    const next = { ...this.#config, bindings: this.#config.bindings.map((entry) => ({ ...entry })), commands: this.#config.commands.map((entry) => ({ ...entry })) };
    // Clearing is an actual unassignment, not a disabled binding that can
    // reappear after a reload.  Removing the entry also keeps the persisted
    // document canonical and makes a subsequent Assign start from a clean
    // state while `list()` still reports the action as Unassigned.
    if (!shortcut || payload.enabled === false) next.bindings = next.bindings.filter((entry) => entry.id !== id);
    else updateEntry(next, 'bindings', { id, shortcut, enabled: true });
    try {
      const written = writeConfig(next, this.#options);
      this.#config = written.config;
      return { ok: true, binding: this.#config.bindings.find((entry) => entry.id === id) || null, ...this.list() };
    } catch (error) {
      return { ok: false, code: error.code || 'write-failed', message: error.message, conflicts: error.conflicts || [] };
    }
  }

  upsertCommand(payload = {}) {
    // Editing a command from the settings form does not submit its existing
    // shortcut (the shortcut has its own Assign/Change control). Preserve it
    // when an id is supplied and the caller intentionally omitted `shortcut`;
    // otherwise an unrelated command edit would silently unbind the command.
    const existing = payload && typeof payload === 'object' && typeof payload.id === 'string'
      ? this.#config.commands.find((entry) => entry.id === payload.id)
      : null;
    const normalizedPayload = existing && !Object.prototype.hasOwnProperty.call(payload, 'shortcut')
      ? { ...payload, shortcut: existing.shortcut }
      : payload;
    let command;
    try { command = normalizeCommand(normalizedPayload, { allowGeneratedId: true }); }
    catch (error) { return { ok: false, code: 'invalid-command', message: error.message }; }
    const next = { ...this.#config, bindings: this.#config.bindings.map((entry) => ({ ...entry })), commands: this.#config.commands.map((entry) => ({ ...entry })) };
    updateEntry(next, 'commands', command);
    try {
      const written = writeConfig(next, this.#options);
      this.#config = written.config;
      return { ok: true, command, ...this.list() };
    } catch (error) {
      return { ok: false, code: error.code || 'write-failed', message: error.message, conflicts: error.conflicts || [] };
    }
  }

  deleteCommand(id) {
    try { id = normalizeId(id, 'command id'); }
    catch (error) { return { ok: false, code: 'invalid-command-id', message: error.message }; }
    const next = { ...this.#config, bindings: this.#config.bindings.map((entry) => ({ ...entry })), commands: this.#config.commands.filter((entry) => entry.id !== id).map((entry) => ({ ...entry })) };
    try {
      const written = writeConfig(next, this.#options);
      this.#config = written.config;
      return { ok: true, ...this.list() };
    } catch (error) {
      return { ok: false, code: error.code || 'write-failed', message: error.message };
    }
  }

  run(id) {
    if (typeof id !== 'string') return { ok: false, code: 'invalid-id', message: 'id is required' };
    const action = ACTIONS_BY_ID.get(canonicalActionId(id));
    if (action) {
      this.#dispatch({ type: 'builtin', id: action.id, source: 'manual' });
      return { ok: true, action: { ...action } };
    }
    const command = this.#config.commands.find((entry) => entry.id === id);
    if (!command) return { ok: false, code: 'not-found', message: `hotkey target not found: ${id}` };
    const result = executeCommand(command, { ...this.#options, activeProcesses: this.#activeProcesses });
    if (result.ok) this.#dispatch({ type: 'command', id: command.id, source: 'manual', pid: result.pid });
    return result;
  }

  recordShortcut(target, onProgress) {
    if (!target || typeof target !== 'object') return Promise.resolve({ ok: false, code: 'invalid-target', message: 'record target is required' });
    if (this.#recording) return Promise.resolve({ ok: false, code: 'recording-busy', message: 'another shortcut is already being recorded' });
    const kind = target.kind === 'command' ? 'command' : target.kind === 'binding' ? 'binding' : null;
    const id = typeof target.id === 'string' ? target.id : '';
    if (!kind || !id || (kind === 'binding' && !ACTIONS_BY_ID.has(id)) || (kind === 'command' && !this.#config.commands.some((entry) => entry.id === id))) {
      return Promise.resolve({ ok: false, code: 'invalid-target', message: 'record target does not exist' });
    }
    if (!this.#started || this.#inputStatus === 'unavailable') return Promise.resolve({ ok: false, code: 'input-unavailable', message: 'Linux keyboard input is unavailable' });
    return new Promise((resolve) => {
      const recording = {
        kind,
        id,
        resolve,
        onProgress: typeof onProgress === 'function' ? onProgress : () => {},
        timer: setTimeout(() => {
          if (this.#recording !== recording) return;
          this.#recording = null;
          resolve({ ok: false, code: 'recording-timeout', message: 'shortcut recording timed out' });
        }, RECORD_TIMEOUT_MS),
      };
      recording.timer.unref?.();
      this.#recording = recording;
    });
  }

  cancelRecording() {
    if (!this.#recording) return { ok: true, cancelled: false };
    const recording = this.#recording;
    this.#recording = null;
    clearTimeout(recording.timer);
    recording.resolve({ ok: false, reason: 'cancelled' });
    return { ok: true, cancelled: true };
  }

  #onEvent(event) {
    if (!event || (event.type !== 'candidate' && event.type !== 'recorded')) return;
    const recording = this.#recording;
    if (recording) {
      try { recording.onProgress({ type: event.type, shortcut: event.shortcut || event.hotkey || '' }); } catch { /* UI progress is advisory */ }
      if (event.type !== 'recorded') return;
      this.#recording = null;
      clearTimeout(recording.timer);
      const shortcut = event.shortcut || event.hotkey || '';
      const result = recording.kind === 'binding'
        ? this.setBinding({ id: recording.id, shortcut, enabled: true })
        : this.upsertCommand({ ...this.#config.commands.find((entry) => entry.id === recording.id), shortcut, enabled: true });
      recording.resolve(result.ok ? { ok: true, shortcut, ...result } : result);
      return;
    }
    if (event.type !== 'recorded') return;
    const shortcut = event.shortcut || event.hotkey || '';
    const key = shortcutKey(shortcut);
    const binding = this.#config.bindings.find((entry) => entry.enabled && entry.shortcut && shortcutKey(entry.shortcut) === key);
    if (binding) {
      this.#dispatch({ type: 'builtin', id: binding.id, shortcut: binding.shortcut, source: 'hotkey' });
      return;
    }
    const command = this.#config.commands.find((entry) => entry.enabled && entry.shortcut && shortcutKey(entry.shortcut) === key);
    if (!command) return;
    const result = executeCommand(command, { ...this.#options, activeProcesses: this.#activeProcesses });
    this.#dispatch({ type: 'command', id: command.id, shortcut: command.shortcut, source: 'hotkey', ok: result.ok, pid: result.pid, error: result.message });
  }

  #dispatch(event) {
    try { this.onAction(event); } catch (error) { this.lastError = error instanceof Error ? error.message : String(error); }
  }
}

module.exports = {
  SCHEMA_VERSION,
  ACTION_REGISTRY,
  MAX_CONCURRENT_COMMANDS,
  RECORD_TIMEOUT_MS,
  configDirectory,
  configPath,
  normalizeShortcut,
  shortcutKey,
  normalizeConfig,
  readConfig,
  configConflicts,
  writeConfig,
  executeCommand,
  HotkeyManager,
};
