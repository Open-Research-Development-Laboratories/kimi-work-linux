'use strict';

/*
 * Linux-only state and capability bridge for the Work settings surface.
 *
 * The upstream desktop bundle only exposes its Computer Use and autostart
 * controls on macOS/Windows.  Linux already has audited POSIX input, capture,
 * and WebBridge adapters in this release, so keep the state machine native
 * and explicit instead of reporting a false "unsupported" result.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const SCHEMA_VERSION = 1;
const DESKTOP_ID = 'kimi-work';
const DESKTOP_FILE = `${DESKTOP_ID}.desktop`;
const CU_STATE_FILE = 'linux-computer-use.json';
const TERMINAL_CANDIDATES = [
  { name: 'x-terminal-emulator', args: (cwd) => ['--working-directory', cwd] },
  { name: 'kgx', args: (cwd) => ['--working-directory', cwd] },
  { name: 'gnome-terminal', args: (cwd) => ['--working-directory', cwd] },
  { name: 'konsole', args: (cwd) => ['--workdir', cwd] },
  { name: 'xfce4-terminal', args: (cwd) => ['--working-directory', cwd] },
  { name: 'kitty', args: (cwd) => ['--directory', cwd] },
  { name: 'alacritty', args: (cwd) => ['--working-directory', cwd] },
  { name: 'xterm', args: (cwd) => ['-e', '/bin/sh', '-lc', 'cd -- "$1" && exec "${SHELL:-/bin/sh}"', 'kimi-work-terminal', cwd] },
];

function homeDirectory(home = os.homedir()) {
  return typeof home === 'string' && home.length > 0 ? home : os.homedir();
}

function configDirectory(env = process.env, home = os.homedir()) {
  const configured = typeof env?.XDG_CONFIG_HOME === 'string' ? env.XDG_CONFIG_HOME.trim() : '';
  return configured || path.join(homeDirectory(home), '.config');
}

function autostartPath(options = {}) {
  return path.join(configDirectory(options.env, options.home), 'autostart', DESKTOP_FILE);
}

function computerUseStatePath(options = {}) {
  return path.join(configDirectory(options.env, options.home), DESKTOP_ID, CU_STATE_FILE);
}

function readJson(file) {
  try {
    const value = JSON.parse(fs.readFileSync(file, 'utf8'));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

function atomicWrite(file, contents, mode = 0o600) {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const temporary = `${file}.tmp-${process.pid}-${Date.now()}`;
  try {
    fs.writeFileSync(temporary, contents, { encoding: 'utf8', mode });
    fs.chmodSync(temporary, mode);
    fs.renameSync(temporary, file);
  } catch (error) {
    try { fs.unlinkSync(temporary); } catch { /* preserve the original error */ }
    throw error;
  }
}

function isLinux(options = {}) {
  const platform = options.platform ?? process.platform;
  const architecture = options.arch ?? process.arch;
  return platform === 'linux' && (architecture === 'x64' || architecture === 'arm64');
}

function executableOnPath(name, env = process.env) {
  for (const directory of String(env?.PATH || '').split(path.delimiter)) {
    if (!directory) continue;
    const candidate = path.join(directory, name);
    try {
      if (fs.statSync(candidate).isFile() && (fs.statSync(candidate).mode & 0o111) !== 0) return candidate;
    } catch {
      // Keep searching.
    }
  }
  return null;
}

function terminalCandidates(options = {}) {
  if (Array.isArray(options.candidates) && options.candidates.length > 0) return options.candidates;
  return TERMINAL_CANDIDATES;
}

function launchTerminal(executable, args, options = {}) {
  const spawnImpl = options.spawnImpl ?? require('node:child_process').spawn;
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    let child;
    try {
      child = spawnImpl(executable, args, {
        detached: true,
        stdio: 'ignore',
        env: options.env ?? process.env,
      });
    } catch (error) {
      finish({ ok: false, error });
      return;
    }
    if (!child || typeof child.once !== 'function') {
      finish({ ok: false, error: new Error('terminal launcher did not return a child process') });
      return;
    }
    child.once('error', (error) => finish({ ok: false, error }));
    child.once('spawn', () => {
      try { child.unref?.(); } catch { /* best effort */ }
      finish({ ok: true, child });
    });
    // Test doubles and unusual launchers may not emit `spawn`; do not leave
    // the IPC request hanging forever.  A real child emits it immediately.
    const timer = setTimeout(() => finish({ ok: false, error: new Error('terminal launcher timed out') }), 1500);
    timer.unref?.();
  });
}

async function openTerminal(options = {}) {
  const platform = options.platform ?? process.platform;
  if (platform !== 'linux') return { success: false, message: 'unsupported-platform' };
  const cwd = typeof options.cwd === 'string' && path.isAbsolute(options.cwd) ? options.cwd : os.homedir();
  try { fs.mkdirSync(cwd, { recursive: true, mode: 0o700 }); }
  catch (error) { return { success: false, message: error instanceof Error ? error.message : String(error) }; }
  const env = options.env ?? process.env;
  const failures = [];
  for (const candidate of terminalCandidates(options)) {
    if (!candidate || typeof candidate.name !== 'string') continue;
    const executable = path.isAbsolute(candidate.name) ? candidate.name : executableOnPath(candidate.name, env);
    if (!executable) continue;
    const args = typeof candidate.args === 'function' ? candidate.args(cwd) : [];
    const result = await launchTerminal(executable, args, options);
    if (result.ok) return { success: true, command: executable, cwd };
    failures.push(`${candidate.name}: ${result.error instanceof Error ? result.error.message : String(result.error)}`);
  }
  return {
    success: false,
    message: failures.length > 0 ? `No terminal could be started (${failures.join('; ')})` : 'No supported terminal emulator was found on PATH',
    cwd,
  };
}

function readableKeyboardDevice() {
  try {
    return fs.readdirSync('/dev/input').some((name) => {
      if (!/^event\d+$/u.test(name)) return false;
      try { fs.accessSync(path.join('/dev/input', name), fs.constants.R_OK); return true; }
      catch { return false; }
    });
  } catch {
    return false;
  }
}

function desktopSessionAvailable(env = process.env) {
  if (env?.WAYLAND_DISPLAY || env?.DISPLAY) return true;
  const runtime = typeof env?.XDG_RUNTIME_DIR === 'string' ? env.XDG_RUNTIME_DIR : '';
  try {
    return Boolean(runtime && fs.readdirSync(runtime).some((name) => /^wayland-\d+$/u.test(name)));
  } catch {
    return false;
  }
}

function browserAvailable(env = process.env) {
  return ['vivaldi', 'vivaldi-stable', 'chromium', 'google-chrome', 'brave', 'firefox', 'zen-browser']
    .map((name) => executableOnPath(name, env))
    .find(Boolean) ?? null;
}

function capabilities(options = {}) {
  const env = options.env ?? process.env;
  const supported = isLinux(options);
  return {
    kind: supported ? 'ready' : 'unsupported',
    platform: options.platform ?? process.platform,
    arch: options.arch ?? process.arch,
    backend: supported ? 'native-posix' : null,
    serviceInstalled: supported,
    accessibility: supported && readableKeyboardDevice(),
    screenRecording: supported && desktopSessionAvailable(env),
    nativeInput: supported && readableKeyboardDevice(),
    nativeCapture: supported && desktopSessionAvailable(env),
    browser: supported ? browserAvailable(env) : null,
  };
}

function readComputerUseState(options = {}) {
  const file = computerUseStatePath(options);
  const stored = readJson(file);
  return {
    schemaVersion: SCHEMA_VERSION,
    enabled: stored?.enabled === true,
    path: file,
  };
}

function computerUseState(options = {}) {
  const state = readComputerUseState(options);
  return {
    ...capabilities(options),
    enabled: state.enabled,
    statePath: state.path,
  };
}

function setComputerUseEnabled(enabled, options = {}) {
  if (!isLinux(options)) return { ok: false, enabled: false, kind: 'unsupported', message: 'unsupported-platform' };
  if (typeof enabled !== 'boolean') return { ok: false, enabled: readComputerUseState(options).enabled, kind: 'ready', message: 'invalid-enabled-payload' };
  const file = computerUseStatePath(options);
  atomicWrite(file, `${JSON.stringify({ schemaVersion: SCHEMA_VERSION, enabled }, null, 2)}\n`);
  return { ok: true, enabled, ...capabilities(options), statePath: file };
}

function launcherPath(options = {}) {
  const execPath = options.execPath ?? process.execPath;
  const sibling = path.join(path.dirname(execPath), DESKTOP_ID);
  try {
    if (fs.statSync(sibling).isFile() && (fs.statSync(sibling).mode & 0o111) !== 0) return sibling;
  } catch {
    // Fall back to Electron's executable for development installs.
  }
  return execPath;
}

function desktopQuote(value) {
  return `"${String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"').replaceAll('`', '\\`').replaceAll('$', '\\$')}"`;
}

function autostartContents(options = {}) {
  const executable = launcherPath(options);
  return [
    '[Desktop Entry]',
    'Type=Application',
    'Version=1.0',
    'Name=Kimi Work',
    'Comment=Start Kimi Work in the background',
    `Exec=${desktopQuote(executable)} --hidden`,
    `TryExec=${desktopQuote(executable)}`,
    'Terminal=false',
    'StartupNotify=false',
    'X-GNOME-Autostart-enabled=true',
    'X-KDE-autostart-after=panel',
    '',
  ].join('\n');
}

function getAutostart(options = {}) {
  const file = autostartPath(options);
  const text = (() => {
    try { return fs.readFileSync(file, 'utf8'); } catch { return ''; }
  })();
  return Boolean(text && /^Type=Application$/mu.test(text) && !/^Hidden=true$/mi.test(text) && !/^X-GNOME-Autostart-enabled=false$/mi.test(text));
}

function setAutostart(enabled, options = {}) {
  if (!isLinux(options)) return { ok: false, enabled: false, message: 'unsupported-platform' };
  const file = autostartPath(options);
  try {
    if (enabled) atomicWrite(file, autostartContents(options), 0o644);
    else {
      try { fs.unlinkSync(file); } catch (error) { if (error?.code !== 'ENOENT') throw error; }
    }
    return { ok: true, enabled: getAutostart(options), path: file };
  } catch (error) {
    return { ok: false, enabled: getAutostart(options), path: file, message: error instanceof Error ? error.message : String(error) };
  }
}

module.exports = {
  SCHEMA_VERSION,
  DESKTOP_ID,
  DESKTOP_FILE,
  configDirectory,
  autostartPath,
  computerUseStatePath,
  capabilities,
  readComputerUseState,
  computerUseState,
  setComputerUseEnabled,
  launcherPath,
  autostartContents,
  getAutostart,
  setAutostart,
  TERMINAL_CANDIDATES,
  executableOnPath,
  openTerminal,
};
