'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function commandPath(name) {
  if (typeof name !== 'string' || !/^[A-Za-z0-9._+-]+$/u.test(name)) return null;
  for (const directory of String(process.env.PATH || '').split(path.delimiter)) {
    if (!directory) continue;
    const candidate = path.join(directory, name);
    try {
      const stat = fs.statSync(candidate);
      if (stat.isFile() && (stat.mode & 0o111) !== 0) return candidate;
    } catch { /* continue */ }
  }
  return null;
}

function readText(file) {
  try { return fs.readFileSync(file, 'utf8'); } catch { return ''; }
}

function detectDistribution() {
  const fields = {};
  for (const line of readText('/etc/os-release').split(/\r?\n/u)) {
    const match = /^([A-Z0-9_]+)=(.*)$/u.exec(line);
    if (!match) continue;
    fields[match[1]] = match[2].replace(/^"|"$/gu, '');
  }
  return { id: fields.ID || 'unknown', name: fields.PRETTY_NAME || fields.NAME || 'unknown', version: fields.VERSION_ID || null, like: fields.ID_LIKE || null };
}

function detectLibc() {
  let glibc = null;
  try { glibc = process.report?.getReport?.().header?.glibcVersionRuntime ?? null; } catch { /* report is optional */ }
  if (glibc) return { family: 'glibc', version: glibc, source: 'node-report' };
  try {
    const musl = fs.readdirSync('/lib').find((entry) => /^ld-musl-[^/]+\.so\.1$/u.test(entry));
    if (musl) return { family: 'musl', version: null, source: `/lib/${musl}` };
  } catch { /* continue */ }
  return { family: 'unknown', version: null, source: null };
}

function readNumber(file) {
  const value = Number.parseInt(readText(file).trim(), 10);
  return Number.isFinite(value) ? value : null;
}

function browserRecord(name, executables, profiles, policyDirectories) {
  const executable = executables.map(commandPath).find(Boolean) ?? null;
  const profile = profiles.find((candidate) => fs.existsSync(candidate)) ?? null;
  const policy = policyDirectories.find((candidate) => fs.existsSync(candidate)) ?? null;
  return { name, executable, profile, policyDirectory: policy };
}

function tesseractState() {
  const executable = commandPath('tesseract');
  if (!executable) return { executable: null, languages: [] };
  const result = spawnSync(executable, ['--list-langs'], { encoding: 'utf8', timeout: 5_000 });
  const languages = `${result.stdout || ''}\n${result.stderr || ''}`.split(/\r?\n/u).map((line) => line.trim()).filter((line) => /^[a-z][a-z0-9_]+$/u.test(line) && line !== 'List of available languages in "/usr/share/tessdata/"');
  return { executable, languages: [...new Set(languages)] };
}

function packageManagers() {
  return ['pacman', 'apt-get', 'dnf', 'zypper', 'apk', 'xbps-install'].filter((name) => commandPath(name));
}

function dynamicDependencies(file) {
  if (!file || !fs.existsSync(file) || !commandPath('ldd')) return { checked: false, missing: [] };
  const result = spawnSync('ldd', [file], { encoding: 'utf8', timeout: 10_000 });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  const missing = output.split(/\r?\n/u).map((line) => line.trim()).filter((line) => /=>\s+not found$/u.test(line) || /^not a dynamic executable$/u.test(line));
  if (result.status !== 0 && missing.length === 0) missing.push(`ldd exited ${result.status}`);
  return { checked: result.status === 0, missing };
}

function hostReport(options = {}) {
  const releaseRoot = options.releaseRoot ? path.resolve(options.releaseRoot) : null;
  const configHome = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
  const browsers = [
    browserRecord('chromium', ['chromium', 'chromium-browser'], [path.join(configHome, 'chromium')], ['/usr/share/chromium/extensions', '/usr/share/chromium-browser/extensions']),
    browserRecord('chrome', ['google-chrome', 'google-chrome-stable'], [path.join(configHome, 'google-chrome')], ['/opt/google/chrome/extensions', '/usr/share/google-chrome/extensions']),
    browserRecord('edge', ['microsoft-edge', 'microsoft-edge-stable'], [path.join(configHome, 'microsoft-edge')], ['/opt/microsoft/msedge/extensions', '/usr/share/microsoft-edge/extensions']),
    browserRecord('brave', ['brave', 'brave-browser'], [path.join(configHome, 'BraveSoftware', 'Brave-Browser')], ['/opt/brave.com/brave/extensions', '/usr/share/brave/extensions']),
    browserRecord('vivaldi', ['vivaldi', 'vivaldi-stable'], [path.join(configHome, 'vivaldi')], ['/usr/share/vivaldi/extensions', '/opt/vivaldi/extensions']),
  ];
  const tess = tesseractState();
  const requiredLanguages = ['eng', 'chi_sim', 'chi_tra'];
  const inputDevices = (() => {
    try {
      const discover = require('./kimi-global-input.cjs').discoverInputDevices;
      return typeof discover === 'function' ? discover() : [];
    } catch { return []; }
  })();
  const portals = ['xdg-desktop-portal', 'xdg-desktop-portal-gnome', 'xdg-desktop-portal-wlr', 'xdg-desktop-portal-kde'].filter((name) => commandPath(name) || fs.existsSync(`/usr/lib/${name}`));
  const captureBackends = ['grim', 'gnome-screenshot', 'import', 'scrot'].filter((name) => commandPath(name));
  const packageManagerList = packageManagers();
  const blockers = [];
  const warnings = [];
  const libc = detectLibc();
  if (libc.family === 'musl') blockers.push('bundled Electron 43 runtime is glibc-linked; build/use a musl Electron target or a glibc compatibility layer for this distribution');
  if (libc.family === 'unknown') warnings.push('libc family could not be identified; run the target binary check before deployment');
  if (browsers.every((browser) => !browser.executable)) warnings.push('no Chromium-family browser executable detected; WebBridge cannot attach until one is installed');
  if (!tess.executable || requiredLanguages.some((language) => !tess.languages.includes(language))) warnings.push('OCR requires tesseract plus eng/chi_sim/chi_tra traineddata');
  if (inputDevices.length === 0) warnings.push('no readable evdev keyboard node; shortcut recording will remain unavailable until input permissions are granted');
  if (portals.length === 0 && process.env.XDG_SESSION_TYPE === 'wayland') warnings.push('Wayland session has no detected xdg-desktop-portal backend; screen capture may be unavailable');
  let sandbox = null;
  let electronDependencies = { checked: false, missing: [] };
  let slidesDependencies = { checked: false, missing: [] };
  if (releaseRoot) {
    const file = path.join(releaseRoot, 'chrome-sandbox');
    try { const stat = fs.statSync(file); sandbox = { path: file, mode: stat.mode & 0o7777, uid: stat.uid, gid: stat.gid, ready: (stat.mode & 0o7777) === 0o4755 && stat.uid === 0 && stat.gid === 0 }; if (!sandbox.ready) blockers.push('chrome-sandbox must be root-owned mode 4755; run configure-linux-host.sh'); }
    catch { blockers.push('chrome-sandbox is missing from the release'); }
    electronDependencies = dynamicDependencies(path.join(releaseRoot, 'electron'));
    if (electronDependencies.missing.length > 0) blockers.push(`Electron runtime dependencies are missing: ${electronDependencies.missing.join('; ')}`);
    slidesDependencies = dynamicDependencies(path.join(releaseRoot, 'resources', 'resources', 'kimi-slides'));
    if (slidesDependencies.missing.length > 0) blockers.push(`Kimi Slides runtime dependencies are missing: ${slidesDependencies.missing.join('; ')}`);
  }
  return {
    schemaVersion: 1,
    distribution: detectDistribution(),
    arch: process.arch,
    libc,
    session: { type: process.env.XDG_SESSION_TYPE || null, wayland: Boolean(process.env.WAYLAND_DISPLAY), x11: Boolean(process.env.DISPLAY), runtimeDir: process.env.XDG_RUNTIME_DIR || null },
    packageManagers: packageManagerList,
    browsers,
    tesseract: { ...tess, requiredLanguages, ready: Boolean(tess.executable) && requiredLanguages.every((language) => tess.languages.includes(language)) },
    portals,
    capture: { commands: captureBackends, electronPortal: true, ready: captureBackends.length > 0 || portals.length > 0 },
    input: { devices: inputDevices, readable: inputDevices.length > 0, user: typeof os.userInfo === 'function' ? os.userInfo().username : null, groups: (() => { const result = spawnSync('id', ['-nG'], { encoding: 'utf8', timeout: 2_000 }); return result.status === 0 ? result.stdout.trim().split(/\s+/u).filter(Boolean) : []; })() },
    kernel: { unprivilegedUsernsClone: readNumber('/proc/sys/kernel/unprivileged_userns_clone'), maxUserNamespaces: readNumber('/proc/sys/user/max_user_namespaces') },
    sandbox,
    electronDependencies,
    slidesDependencies,
    blockers,
    warnings,
    ok: blockers.length === 0,
  };
}

module.exports = { commandPath, detectDistribution, detectLibc, hostReport };
