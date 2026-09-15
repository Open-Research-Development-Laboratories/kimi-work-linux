#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(HERE, '..');
const REPO = path.resolve(PROJECT, '..');
const SOURCE_ARCHIVE = path.join(REPO, 'app-64.7z');
const SOURCE_APP = path.join(REPO, 'app-64', 'resources', 'app.asar');
const SOURCE_GATEWAY = path.join(REPO, 'app-64', 'resources', 'resources', 'gateway.asar');
const SOURCE_DAIMON = path.join(REPO, 'app-64', 'resources', 'resources', 'daimon-bundle.tar.gz');
const OUTPUT = path.resolve(process.env.KIMI_LINUX_OUTPUT || path.join(PROJECT, 'dist', 'kimi-work-linux-x64'));
const ASAR = process.env.ASAR_BIN || findOnPath('asar') || '/home/winsock/.local/share/codex-complete/tools/fd95365bfc7f42c7/node_modules/.bin/asar';
const ELECTRON_ROOT = path.resolve(process.env.ELECTRON_ROOT || findElectronRoot());
const NODE_VERSION = '24.15.0';
const NODE_URL = `https://nodejs.org/download/release/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz`;
const NODE_SHA256 = '472655581fb851559730c48763e0c9d3bc25975c59d518003fc0849d3e4ba0f6';
const PYTHON_VERSION = '3.12.14';
const KIMI_SLIDES_VERSION = '2.2.15';
const KIMI_SLIDES_RELEASE = '926985a4';
const KIMI_SLIDES_URL = `https://statics.moonshot.cn/kimi-ppt-cli-native-inside/${KIMI_SLIDES_VERSION}/${KIMI_SLIDES_RELEASE}/kimi-slides-linux-x64.zip`;
const KIMI_SLIDES_ZIP_SHA256 = 'cae4e8d60f50acf3e01c45608ccc4d04ecda079298474816d8b7d9da008d6562';
// The group-chat CLI is distributed as a platform-native executable at this
// stable Moonshot asset path. Pin the observed Linux ELF so a mutable CDN
// replacement cannot silently enter a release build.
const KIMIIM_URL = 'https://kimi-img.moonshot.cn/pub/claw/tmp/lihuaru/skills/kimiim/kimiim-cli';
const KIMIIM_SHA256 = '4bfd177762cab9f6e3fae38f0ee59cd4d97da98a584f68406fed7a4d28b0df26';
const KIMIIM_REVISION = '4ee856c34d15';
const WEBBRIDGE_VERSION = '1.11.6';
const WEBBRIDGE_EXTENSION_ID = 'fldmhceldgbpfpkbgopacenieobmligc';
const WEBBRIDGE_EXTENSION_SOURCE = path.join(REPO, 'app-64', 'resources', 'resources', 'webbridge-extension', `${WEBBRIDGE_EXTENSION_ID}.crx`);
const WEBBRIDGE_EXTENSION_SHA256 = '5f3ef9296fab74b02ab5bf9cba3d4cf8406763a1cbf341765a61c6bc2a34061c';
const WEBBRIDGE_SKILL_ARCHIVE_SOURCE = path.join(REPO, 'app-64', 'resources', 'resources', 'skills', 'kimi-webbridge-desktop.zip');
const WEBBRIDGE_SKILL_ARCHIVE_SHA256 = '93f84cb202bff3cdee0f9c5d2143995c1f70cb8f09afeed9861d3e3f3d3b703e';
const WEBBRIDGE_DAEMON_VERSION = '2.0.8';
const BUILD_CONFIG_SOURCE = path.join(REPO, 'app-64', 'resources', 'resources', 'build-config.json');
const WEBBRIDGE_BUNDLE_VERSION_SOURCE = path.join(REPO, 'app-64', 'resources', 'resources', 'kimi-webbridge.bundle-version');
const HOST_CONFIGURER = path.join(PROJECT, 'scripts', 'configure-linux-host.sh');
const HOST_CHECKER = path.join(PROJECT, 'scripts', 'check-linux-host.mjs');

const PLATFORM_PACKAGES = [
  '@img/sharp-linux-x64@0.34.5',
  '@img/sharp-libvips-linux-x64@1.2.4',
  '@lydell/node-pty-linux-x64@1.2.0-beta.3',
  '@mariozechner/clipboard-linux-x64-gnu@0.3.9',
  '@napi-rs/canvas-linux-x64-gnu@0.1.100',
  '@snazzah/davey-linux-x64-gnu@0.1.12',
  'sqlite-vec-linux-x64@0.1.7-alpha.2',
  'koffi@2.16.3',
];

function findOnPath(command) {
  for (const dir of String(process.env.PATH || '').split(path.delimiter)) {
    if (!dir) continue;
    const candidate = path.join(dir, command);
    try {
      if (fs.statSync(candidate).isFile() && (fs.statSync(candidate).mode & 0o111) !== 0) return candidate;
    } catch {
      // Keep searching.
    }
  }
  return null;
}

function findElectronRoot() {
  const candidates = ['/usr/lib/electron43', '/usr/lib/electron', '/opt/electron43', '/opt/electron'];
  for (const candidate of candidates) {
    try { if (fs.statSync(path.join(candidate, 'electron')).isFile()) return candidate; } catch { /* continue */ }
  }
  const executable = findOnPath('electron43') || findOnPath('electron');
  if (executable) return path.dirname(executable);
  return '/usr/lib/electron43';
}

function requireFile(file, label) {
  if (!fs.existsSync(file)) throw new Error(`${label} is missing: ${file}`);
}

function mkdir(dir) { fs.mkdirSync(dir, { recursive: true, mode: 0o755 }); }

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    env: options.env,
    stdio: options.stdio || 'inherit',
    timeout: options.timeoutMs,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} exited with ${result.status}`);
}

function npmEnvironment(base = process.env) {
  // Do not inherit host-specific npmrc keys such as the deprecated
  // `global-ignore-file`; release builds must resolve dependencies from the
  // pinned registry metadata rather than ambient workstation policy.
  const env = { ...base, npm_config_userconfig: '/dev/null' };
  for (const key of Object.keys(env)) if (key.toLowerCase() === 'npm_config_global_ignore_file') delete env[key];
  return env;
}

function copy(source, destination) {
  mkdir(path.dirname(destination));
  fs.cpSync(source, destination, { recursive: true, dereference: false, force: true });
}

function removeWindowsArtifacts(root) {
  const entries = fs.existsSync(root) ? fs.readdirSync(root, { withFileTypes: true }) : [];
  for (const entry of entries) {
    const full = path.join(root, entry.name);
    const lower = entry.name.toLowerCase();
    if (entry.isDirectory()) {
      if (/(^|[-_])(?:win32|windows)/u.test(lower)) {
        fs.rmSync(full, { recursive: true, force: true });
        continue;
      }
      removeWindowsArtifacts(full);
      continue;
    }
    if (/\.(?:exe|dll|pdb|lib|exp|cmd|ps1|bat)$/u.test(lower) || /^(?:win32|windows)/u.test(lower) || lower.includes('conpty') || lower.includes('winpty')) {
      fs.rmSync(full, { force: true });
    }
  }
}

function normalizeBinDirectory(root) {
  const bin = path.join(root, 'node_modules', '.bin');
  if (!fs.existsSync(bin)) return;
  for (const entry of fs.readdirSync(bin, { withFileTypes: true })) {
    if (!entry.isFile() && !entry.isSymbolicLink()) continue;
    const full = path.join(bin, entry.name);
    try {
      if (entry.isSymbolicLink() || fs.readFileSync(full, { encoding: 'utf8', flag: 'r' }).startsWith('#!')) fs.chmodSync(full, 0o755);
    } catch {
      // A broken optional bin link must not make the rest of the platform
      // package unusable; require-file checks cover mandatory launchers.
    }
  }
}

function normalizeReleasePermissions(root) {
  // ASAR/tar extraction commonly yields mode 0600 for files. That is safe for
  // a same-user diagnostic tree but makes a system-wide root-owned install
  // unreadable to the desktop user. Release payloads contain no credentials,
  // so publish immutable files as 0644 and retain 0755 for executables.
  const entries = fs.existsSync(root) ? fs.readdirSync(root, { withFileTypes: true }) : [];
  for (const entry of entries) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      try { fs.chmodSync(full, 0o755); } catch { /* best effort */ }
      normalizeReleasePermissions(full);
      continue;
    }
    if (entry.isSymbolicLink()) continue;
    try {
      const mode = fs.statSync(full).mode;
      fs.chmodSync(full, (mode & 0o111) !== 0 ? 0o755 : 0o644);
    } catch { /* best effort; required-file checks catch missing payloads */ }
  }
}

function patchDreamGate(mainFile) {
  // Moonwell/NLDA: the daimon memory-dream feature ships disabled because
  // getDreamEnabled() resolves false/undefined without hosted work-gateway
  // settings and the result overwrites daimon config.json at provision time.
  // Local builds ARE the deployment here: force the gate OPEN, no coalescing —
  // a resolver that says "false" out loud must not be able to close it.
  let source = fs.readFileSync(mainFile, 'utf8');
  if (source.includes('_0x144c7e = !0; // dream gate forced open')) return;
  const forms = [
    'const _0x1ba462 = _0xb5b38d, _0x144c7e = this.#opts["getDreamEnabled"]?.() ?? ![];',
    'const _0x1ba462 = _0xb5b38d, _0x144c7e = this.#opts["getDreamEnabled"]?.() ?? true;',
  ];
  const replacement = 'const _0x1ba462 = _0xb5b38d, _0x144c7e = !0; // dream gate forced open';
  let hit = false;
  for (const needle of forms) {
    if (source.includes(needle)) { source = source.split(needle).join(replacement); hit = true; }
  }
  if (!hit) throw new Error('cannot locate dream-enabled fallback in main bundle');
  fs.writeFileSync(mainFile, source, 'utf8');
}

function patchNativeLoader(mainFile) {
  const source = fs.readFileSync(mainFile, 'utf8');
  const start = source.indexOf('function _0x5391c8(');
  const end = source.indexOf('function _0x24edc9', start);
  if (start < 0 || end < 0 || end <= start) throw new Error('cannot locate native-loader boundary in main bundle');
  const replacement = `function _0x5391c8(_0x7b5a7c) {
  const _0x1a58ad = _0xb5b38d, _0xef5ba1 = process["platform"] + "-" + process[_0x1a58ad(9148)], _0x1b3f90 = resolve(import.meta.dirname, "..", _0x1a58ad(15710), _0xef5ba1), _0x4f14d0 = [_0x7b5a7c + _0x1a58ad(5003)];
  // Linux adapters are shipped as audited CommonJS modules. The original
  // Windows build only staged .node files; accepting a .cjs fallback keeps
  // this boundary synchronous while using standard POSIX APIs.
  if (process["platform"] === "linux") _0x4f14d0.push(_0x7b5a7c + ".cjs");
  let _0x2ae7b3 = null;
  for (const _0x290be5 of _0x4f14d0.map((_0x5e0d32) => resolve(_0x1b3f90, _0x5e0d32))) {
    try {
      if (!_0x2dbe65(_0x290be5)) continue;
      return _0x16ab6b(_0x290be5);
    } catch (_0x4f3e0a) {
      _0x2ae7b3 = _0x4f3e0a;
    }
  }
  return _0x509749["warn"](_0xa1ee94, _0x7b5a7c + _0x1a58ad(11574) + (_0x2ae7b3 instanceof Error ? _0x2ae7b3[_0x1a58ad(13811)] : "not staged for " + _0xef5ba1)), null;
}
`;
  fs.writeFileSync(mainFile, source.slice(0, start) + replacement + source.slice(end), 'utf8');
}

function patchLinuxPlatformSupport(mainFile) {
  let source = fs.readFileSync(mainFile, 'utf8');
  const hardwareStart = source.indexOf('function _0x2a956d()');
  const hardwareEnd = source.indexOf('function _0x81e744', hardwareStart);
  if (hardwareStart < 0 || hardwareEnd <= hardwareStart) throw new Error('cannot locate Linux hardware context function');
  source = source.slice(0, hardwareStart) + `function _0x2a956d() {
  return new Promise((_0x1a8425) => {
    if (process["platform"] !== "linux") { _0x1a8425({}); return; }
    const _0x4b5f1e = (_0x4a8cb7) => { try { return readFileSync(_0x4a8cb7, "utf8").trim(); } catch { return ""; } };
    const _0x3c7e12 = _0x4b5f1e("/sys/devices/virtual/dmi/id/sys_vendor") || _0x4b5f1e("/sys/devices/virtual/dmi/id/board_vendor");
    const _0x5de82b = _0x4b5f1e("/sys/devices/virtual/dmi/id/product_name") || _0x4b5f1e("/sys/devices/virtual/dmi/id/board_name") || _0x4b5f1e("/proc/device-tree/model");
    _0x1a8425(_0x3c7e12 || _0x5de82b ? { ..._0x3c7e12 ? { "manufacturer": _0x3c7e12 } : {}, ..._0x5de82b ? { "model": _0x5de82b } : {} } : {});
  });
}
` + source.slice(hardwareEnd);
  const removeGuards = [
    '  if (process[_0x11b2d1(16770)] === "linux") return null;\n',
    '  if (process[_0x1c871d(16770)] === _0x1c871d(17954)) return null;\n',
  ];
  for (const guard of removeGuards) {
    const count = source.split(guard).length - 1;
    if (count !== 1) throw new Error(`expected one Linux capture guard, found ${count}`);
    source = source.replace(guard, '  // Linux uses the POSIX/Electron capture adapter.\n');
  }

  const browserStart = source.indexOf('function _0x722a4a(');
  const browserEnd = source.indexOf('async function _0x579435', browserStart);
  if (browserStart < 0 || browserEnd <= browserStart) throw new Error('cannot locate Linux browser-root resolver');
  source = source.slice(0, browserStart) + `function _0x722a4a(_0x1d3824) {
  if (process["platform"] === "linux") {
    const _0x1d9fd1 = process.env["XDG_CONFIG_HOME"] || join(_0x1d3824, ".config");
    return [
      { "browser": "chrome", "root": join(_0x1d9fd1, "google-chrome") },
      { "browser": "chrome", "root": join(_0x1d9fd1, "chromium") },
      { "browser": "chrome", "root": join(_0x1d9fd1, "BraveSoftware", "Brave-Browser") },
      { "browser": "chrome", "root": join(_0x1d9fd1, "vivaldi") },
      { "browser": "edge", "root": join(_0x1d9fd1, "microsoft-edge") }
    ];
  }
  return [{ "browser": _0xb5b38d(11514), "root": join(_0x1d3824, _0xb5b38d(12213)) }];
}
` + source.slice(browserEnd);

  const installedStart = source.indexOf('async function _0x3d15c3(');
  const installedEnd = source.indexOf('async function _0xf19dfe', installedStart);
  if (installedStart < 0 || installedEnd <= installedStart) throw new Error('cannot locate Linux browser detection function');
  source = source.slice(0, installedStart) + `async function _0x3d15c3() {
  if (process["platform"] !== "linux") return [];
  const _0x4182df = [];
  for (const _0x550d3b of _0x722a4a(homedir())) {
    try {
      if (existsSync(_0x550d3b["root"])) _0x4182df.push(_0x550d3b["browser"]);
    } catch {
      // A disappearing profile must not make the settings page fail.
    }
  }
  const _0x4e7cc4 = {
    "chrome": ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "brave", "brave-browser", "vivaldi", "vivaldi-stable"],
    "edge": ["microsoft-edge", "microsoft-edge-stable"]
  };
  for (const [_0x1972ee, _0x2b9cf7] of Object["entries"](_0x4e7cc4)) {
    if (!_0x4182df.includes(_0x1972ee) && _0x2b9cf7.some((_0x4a6c0e) => (process.env["PATH"] || "").split(delimiter).some((_0x5d4e60) => existsSync(join(_0x5d4e60, _0x4a6c0e))))) _0x4182df.push(_0x1972ee);
  }
  return _0x4182df;
}
` + source.slice(installedEnd);

  const manageStart = source.indexOf('async function _0x34f75c(');
  const manageEnd = source.indexOf('async function _0x3d15c3', manageStart);
  if (manageStart < 0 || manageEnd <= manageStart) throw new Error('cannot locate Linux extension-manage opener');
  let manageBody = source.slice(manageStart, manageEnd);
  const manageMarker = '  return _0x509749[_0x7c863b(4009)](_0x3084c5, _0x7c863b(5758) + process[_0x7c863b(16770)]), ![];\n}\n';
  if (!manageBody.includes(manageMarker)) throw new Error('cannot locate WebBridge manage fallback');
  manageBody = manageBody.replace(manageMarker, `  if (process["platform"] === "linux") {
    const _0x4f4a2b = _0x51e575 === "edge" ? ["microsoft-edge", "microsoft-edge-stable"] : ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "brave", "brave-browser", "vivaldi", "vivaldi-stable"];
    for (const _0x4b2f75 of [..._0x4f4a2b, "xdg-open"]) {
      const _0x4d8f9c = await new Promise((_0x2e5af0) => {
        execFile(_0x4b2f75, [_0x5ec951], { "timeout": 5e3 }, (_0x4c3a4c) => _0x2e5af0(!_0x4c3a4c));
      });
      if (_0x4d8f9c) return !![];
    }
    return ![];
  }
` + manageMarker);
  source = source.slice(0, manageStart) + manageBody + source.slice(manageEnd);

  const policyHelper = `async function installLinuxWebBridgePolicy(_0x28d2c5, _0x55b816) {
  const _0x4e7cc4 = [
    { "browser": "chrome", "directories": ["/opt/google/chrome/extensions", "/usr/share/google-chrome/extensions", "/usr/share/chromium/extensions", "/opt/brave.com/brave/extensions", "/usr/share/brave/extensions", "/opt/vivaldi/extensions", "/usr/share/vivaldi/extensions", join(process.env["XDG_CONFIG_HOME"] || join(homedir(), ".config"), "google-chrome", "External Extensions"), join(process.env["XDG_CONFIG_HOME"] || join(homedir(), ".config"), "chromium", "External Extensions"), join(process.env["XDG_CONFIG_HOME"] || join(homedir(), ".config"), "BraveSoftware", "Brave-Browser", "External Extensions"), join(process.env["XDG_CONFIG_HOME"] || join(homedir(), ".config"), "vivaldi", "External Extensions")] },
    { "browser": "edge", "directories": ["/opt/microsoft/msedge/extensions", "/usr/share/microsoft-edge/extensions", join(process.env["XDG_CONFIG_HOME"] || join(homedir(), ".config"), "microsoft-edge", "External Extensions")] }
  ];
  const _0x324e89 = [];
  for (const _0x1371c2 of _0x4e7cc4) {
    for (const _0x35319a of _0x1371c2["directories"]) {
      const _0x57f604 = join(_0x35319a, _0x368ef7 + ".json");
      try {
        await _0x949fc2(_0x57f604, JSON["stringify"]({ "external_crx": _0x28d2c5, "external_version": _0x55b816 }) + "\\n", { "encoding": "utf8", "mode": 420 });
        await chmod(_0x57f604, 420);
        _0x324e89.push(_0x1371c2["browser"]);
        break;
      } catch {
        // A normal user cannot write system policy directories; continue to
        // the next installed browser and return an actionable manual path.
      }
    }
  }
  if (_0x324e89.length > 0) return { "ok": !![], "browsers": [...new Set(_0x324e89)], "version": _0x55b816, "source": "linux-system-policy" };
  return { "ok": ![], "message": "linux-browser-policy-required", "browsers": [], "version": _0x55b816, "crxPath": _0x28d2c5, "unpackedPath": join(_0x579daf(_0x28d2c5), "unpacked") };
}
`;
  const versionStart = source.indexOf('async function _0x1f4ed3(');
  const versionEnd = source.indexOf('async function _0x5d2208', versionStart);
  if (versionStart < 0 || versionEnd <= versionStart) throw new Error('cannot locate Linux extension-version resolver');
  source = source.slice(0, versionStart) + `async function _0x1f4ed3(_0x4810c7, _0x58e498 = {}) {
  const _0x582281 = _0xb5b38d, _0x3ba084 = _0x58e498["platform"] ?? process[_0x582281(16770)], _0x5f10e9 = _0x58e498[_0x582281(14259)] ?? homedir();
  try {
    if (_0x3ba084 === "linux") {
      const _0x1d9fd1 = process.env["XDG_CONFIG_HOME"] || join(_0x5f10e9, ".config");
      const _0x14f909 = _0x4810c7 === "edge" ? ["/opt/microsoft/msedge/extensions", "/usr/share/microsoft-edge/extensions", join(_0x1d9fd1, "microsoft-edge", "External Extensions")] : ["/opt/google/chrome/extensions", "/usr/share/google-chrome/extensions", "/usr/share/chromium/extensions", "/opt/brave.com/brave/extensions", "/usr/share/brave/extensions", "/opt/vivaldi/extensions", "/usr/share/vivaldi/extensions", join(_0x1d9fd1, "google-chrome", "External Extensions"), join(_0x1d9fd1, "chromium", "External Extensions"), join(_0x1d9fd1, "BraveSoftware", "Brave-Browser", "External Extensions"), join(_0x1d9fd1, "vivaldi", "External Extensions")];
      for (const _0x4a6c0e of _0x14f909) {
        const _0x4514d8 = join(_0x4a6c0e, _0x368ef7 + ".json");
        if (!_0x2dbe65(_0x4514d8)) continue;
        try {
          const _0x1965b1 = JSON[_0x582281(17364)](await _0x580504(_0x4514d8, _0x582281(13036)));
          if (typeof _0x1965b1[_0x582281(8937)] === _0x582281(15717)) return _0x1965b1["external_version"];
        } catch {
          // Continue to the next policy directory.
        }
      }
      for (const _0x8e1714 of _0x722a4a(_0x5f10e9).filter((_0x3faacc) => _0x3faacc["browser"] === _0x4810c7).map((_0x3faacc) => _0x3faacc["root"])) {
        const _0x4514d8 = join(_0x8e1714, "External Extensions", _0x368ef7 + _0x582281(16886));
        if (!_0x2dbe65(_0x4514d8)) continue;
        try {
          const _0x1965b1 = JSON[_0x582281(17364)](await _0x580504(_0x4514d8, _0x582281(13036)));
          if (typeof _0x1965b1[_0x582281(8937)] === _0x582281(15717)) return _0x1965b1["external_version"];
        } catch {
          // Continue through profiles when one policy file is stale.
        }
      }
      return null;
    }
    return null;
  } catch {
    return null;
  }
}
` + source.slice(versionEnd);

  const policyInsert = source.indexOf('async function _0x5d2208(');
  if (policyInsert < 0) throw new Error('cannot locate Linux WebBridge policy insertion point');
  source = source.slice(0, policyInsert) + policyHelper + source.slice(policyInsert);

  const installStart = source.indexOf('async function _0x5d2208(');
  const installEnd = source.indexOf('async function _0x44a388', installStart);
  if (installStart < 0 || installEnd <= installStart) throw new Error('cannot locate Linux extension installer');
  let installBody = source.slice(installStart, installEnd);
  const winBranch = '    if (platform === "win32") return await _0x3c4f82(_0x28d2c5, _0x1904a4[_0x3376e6(9401)], (_0x407c1e[_0x3376e6(10140)] ?? [])["filter"]((_0x504bf7) => _0x504bf7 === "chrome"), _0x407c1e[_0x3376e6(5428)] ?? join(userHome, _0x3376e6(609), _0x3376e6(3610), _0x3376e6(13584), "webbridge-extension"));\n';
  if (!installBody.includes(winBranch)) throw new Error('cannot locate WebBridge Windows install branch');
  installBody = installBody.replace(winBranch, '    if (platform === "linux") return await installLinuxWebBridgePolicy(_0x28d2c5, _0x1904a4[_0x3376e6(9401)]);\n' + winBranch);
  source = source.slice(0, installStart) + installBody + source.slice(installEnd);

  const updateGuard = '  if (_0x2d7e08 !== _0x596b17(8151) && _0x2d7e08 !== _0x596b17(669)) return;\n';
  const updateGuardCount = source.split(updateGuard).length - 1;
  if (updateGuardCount !== 1) throw new Error(`expected one WebBridge update platform guard, found ${updateGuardCount}`);
  source = source.replace(updateGuard, '  if (_0x2d7e08 !== _0x596b17(8151) && _0x2d7e08 !== _0x596b17(669) && _0x2d7e08 !== "linux") return;\n');

  // The desktop stores the daemon under ~/.kimi-webbridge/bin and normally
  // trusts a version stamp when deciding whether to copy the packaged helper.
  // A separately upgraded vendor daemon can leave that stamp behind while
  // replacing the file, so a Linux launch may silently run a different
  // implementation than the audited release.  Keep the upstream installer
  // behavior on Windows, but require byte-for-byte source/destination parity
  // before honoring the stamp on Linux.  This is intentionally content based
  // rather than mtime based: copied release trees commonly normalize mtimes.
  const installerStart = source.indexOf('function _0x31c695(');
  const installerEnd = source.indexOf('function _0x591982', installerStart);
  if (installerStart < 0 || installerEnd <= installerStart) throw new Error('cannot locate WebBridge installer parity boundary');
  const installer = `function _0x31c695(_0x571ae3) {
  const _0x3cca83 = _0xb5b38d;
  if (!_0x571ae3[_0x3cca83(9124)]) return !![];
  const _0x5168e2 = _0x1e108a(_0x571ae3[_0x3cca83(16625)], _0x571ae3["srcPath"]);
  const _0x49beac = _0x279780();
  let _0x31c1a1 = ![];
  if (process["platform"] === "linux") {
    try {
      _0x31c1a1 = existsSync(_0x571ae3["destPath"]) && readFileSync(_0x571ae3["destPath"]).equals(readFileSync(_0x571ae3["srcPath"]));
    } catch {
      _0x31c1a1 = ![];
    }
  }
  if (existsSync(_0x571ae3["destPath"]) && _0x49beac === _0x5168e2 && (process["platform"] !== "linux" || _0x31c1a1)) {
    _0x509749[_0x3cca83(12477)]("AgentExtension", "版本一致 (" + _0x5168e2 + ")，跳过复制");
    return !![];
  }
  if (process["platform"] !== "linux" && _0x591982(_0x571ae3[_0x3cca83(16625)], _0x571ae3["destPath"])) return !![];
  try {
    return copyFileSync(_0x571ae3["srcPath"], _0x571ae3["destPath"]), process["platform"] !== _0x3cca83(669) && _0x23828e(_0x571ae3["destPath"], 493), _0x162087(_0x5168e2), _0x147c67(), _0x509749[_0x3cca83(12477)]("AgentExtension", "已升级 " + (_0x49beac ?? "<none>") + " → " + _0x5168e2 + " at " + _0x571ae3["destPath"]), !![];
  } catch (_0x256834) {
    return _0x509749[_0x3cca83(14240)]("AgentExtension", "复制 WebBridge 失败: " + (_0x256834 instanceof Error ? _0x256834["message"] : String(_0x256834))), _0x398cb6(_0x3cca83(14240)), ![];
  }
}
`;
  source = source.slice(0, installerStart) + installer + source.slice(installerEnd);
  fs.writeFileSync(mainFile, source, 'utf8');
}

function patchWatermarkFallback(mainFile) {
  let source = fs.readFileSync(mainFile, 'utf8');
  const helperMarker = 'function _0x4c3dcb(';
  if (!source.includes(helperMarker)) throw new Error('cannot locate WatermarkService error classifier');
  if (source.includes('function __kimiLinuxWatermarkUnsupported(')) throw new Error('WatermarkService fallback patch already applied');
  const helper = `function __kimiLinuxWatermarkUnsupported(_0x3b6ef8) {
  if (!(_0x3b6ef8 instanceof Error)) return ![];
  const _0x4f5a1d = String(_0x3b6ef8["message"] ?? _0x3b6ef8);
  return /\\bHTTP\\s+404\\b|\\bunimplemented\\b|\\bnot[ -]found\\b/iu.test(_0x4f5a1d);
}
`;
  const catchStart = source.indexOf('  } catch (_0x5398dc) {\n    _0x509749["error"](_0xb99dec, "getWatermarkConfig failed, fail-closed to all-off: " + String(_0x5398dc));');
  const catchEnd = source.indexOf('function _0x4c3dcb', catchStart);
  if (catchStart < 0 || catchEnd <= catchStart) throw new Error('cannot locate WatermarkService fallback body');
  const replacement = `  } catch (_0x5398dc) {
    const _0x2597cd = { ..._0x236190 }, _0x5e3c2b = __kimiLinuxWatermarkUnsupported(_0x5398dc);
    if (_0x5e3c2b) _0x509749["warn"](_0xb99dec, "getWatermarkConfig unavailable upstream; staying fail-closed for this session: " + String(_0x5398dc));
    else _0x509749["error"](_0xb99dec, "getWatermarkConfig failed, fail-closed to all-off: " + String(_0x5398dc));
    if (_0x5e3c2b) _0x54b760 = { "value": _0x2597cd, "expiresAt": _0x10bb0b + 365 * 24 * 60 * 60 * 1000 };
    else if (!_0x4c3dcb(_0x5398dc)) _0x54b760 = { "value": _0x2597cd, "expiresAt": _0x10bb0b + _0x343066 };
    _0x5c2c8c(_0x2597cd);
    return _0x2597cd;
  }
  } };
`;
  source = source.slice(0, catchStart) + replacement + source.slice(catchEnd);
  source = source.replace(helperMarker, helper + helperMarker);
  fs.writeFileSync(mainFile, source, 'utf8');
}

function patchLinuxWorkbenchSettings(mainFile) {
  let source = fs.readFileSync(mainFile, 'utf8');
  const helperMarker = 'async function _0x28ae87() {';
  const helperInsert = source.indexOf(helperMarker);
  if (helperInsert < 0) throw new Error('cannot locate Linux Computer Use state boundary');
  if (source.includes('function __kimiLinuxWorkbench()')) throw new Error('Linux Workbench settings patch already applied');
  const helper = `function __kimiLinuxWorkbench() {
  const _0x4c3f31 = _0xa1745d("kimi-linux-workbench");
  if (!_0x4c3f31) throw new Error("Linux Workbench native adapter unavailable");
  return _0x4c3f31;
}
`;
  source = source.slice(0, helperInsert) + helper + source.slice(helperInsert);

  const insertBranch = (marker, branch, label) => {
    const index = source.indexOf(marker);
    if (index < 0) throw new Error(`cannot locate ${label} boundary`);
    source = source.slice(0, index + marker.length) + `\n${branch}` + source.slice(index + marker.length);
  };
  insertBranch('function _0x2d84bc() {', '  if (process["platform"] === "linux") return __kimiLinuxWorkbench().getAutostart();', 'Linux autostart getter');
  insertBranch('function _0x155718(_0x2b57b7) {', `  if (process["platform"] === "linux") {
    const _0x4f1e2c = __kimiLinuxWorkbench().setAutostart(Boolean(_0x2b57b7));
    if (!_0x4f1e2c.ok) _0x509749["warn"](_0x51225d, "Linux autostart update failed: " + (_0x4f1e2c.message ?? "unknown error"));
    return;
  }`, 'Linux autostart setter');
  insertBranch('async function _0x28ae87() {', '  if (process["platform"] === "linux") return __kimiLinuxWorkbench().computerUseState();', 'Linux Computer Use state');
  insertBranch('async function _0x329a35() {', '  if (process["platform"] === "linux") return { "installed": "native-posix", "expected": "native-posix" };', 'Linux Computer Use version');
  insertBranch('async function _0x276d63() {', '  if (process["platform"] === "linux") return __kimiLinuxWorkbench().readComputerUseState().enabled;', 'Linux Computer Use enabled getter');
  insertBranch('async function _0x6a8a07(_0x3c3bf1, _0x2b0b0a) {', '  if (process["platform"] === "linux") return __kimiLinuxWorkbench().setComputerUseEnabled(Boolean(_0x3c3bf1));', 'Linux Computer Use enabled setter');
  const shortcutFunctionMarker = 'function _0x1590df(_0x4f5005, _0x1865f) {\n';
  if ((source.split(shortcutFunctionMarker).length - 1) !== 1) throw new Error('cannot locate shortcut validator function');
  // The upstream parser returns null for some valid Linux tokens (notably a
  // side-specific modifier such as ControlLeft). Put the Linux acceptance
  // branch before parsing so those tokens cannot be rejected and silently
  // normalized back to the Right Alt default.
  source = source.replace(shortcutFunctionMarker, `${shortcutFunctionMarker}  if (process["platform"] === "linux" && _0x4f5005 !== "Delete") return { "ok": !![] };\n`);
  // Opening the local settings BrowserView is asynchronous.  On a cold
  // launch it can take a few seconds while the authenticated Work surface is
  // restored; the vendor's 3-second fallback otherwise navigates the main
  // view to an online route and closes the local pane before it can render.
  // Give the packaged Linux view a bounded 10-second readiness window so
  // custom `open-settings`/`open-shortcuts` actions remain deterministic.
  const settingsTimeoutMarker = 'const _0x15eebf = 120, _0xfbd66d = 80, _0x42925e = 1500, _0x2a8468 = 3e3, _0x36975e = 3e3, _0x387182';
  if (source.split(settingsTimeoutMarker).length - 1 !== 1) throw new Error('cannot locate settings open timeout constants');
  source = source.replace(settingsTimeoutMarker, settingsTimeoutMarker.replace('_0x36975e = 3e3', '_0x36975e = 10e3'));
  // Leave the vendor generic Settings router intact on Linux. Work-specific
  // actions use the native Work settings route below; ordinary account and
  // subscription settings continue to use the vendor router unchanged.
  const genericSettingsMarker = '  [_0xb5b38d(15949)](_0x4a5324, _0x4e12f1) {\n';
  if (source.split(genericSettingsMarker).length - 1 !== 1) throw new Error('cannot locate generic Settings-page router');
  // Do not add a second Linux-only redirect here; `openWorkSettingsPane`
  // below delegates to this original method without recursion.
  // The KimiAgent facade has its own Settings-page method which delegates to
  // the same router. Keep it untouched for the same reason.
  const agentFacadeSettingsMarker = '  [_0xb5b38d(15949)](_0x46ae6c, _0x251b67) {\n    const _0x3f2105 = _0xb5b38d;\n';
  if (source.split(agentFacadeSettingsMarker).length - 1 !== 1) throw new Error('cannot locate KimiAgent Settings facade');
  // The KimiAgent IPC entry point can supply an action target. Preserve the
  // vendor routing so subscription and ordinary Settings remain one surface.
  const agentOpenSettingsIpcMarker = 'ipcMain["on"](_0x18c405[_0x48df7d(17221)], (_0x26f1b9, _0x718514) => {\n    const _0x437e70 = _0x48df7d;\n';
  if (source.split(agentOpenSettingsIpcMarker).length - 1 !== 1) throw new Error('cannot locate KimiAgent Settings IPC entry point');
  // The manager callback is also used by direct in-process KimiAgent calls;
  // leave that callback on the same remote Settings route.
  const agentOpenSettingsMethodMarker = '"openSettings": (_0x4b1ca1) => {\n    const _0x230f22 = _0x434c7e;\n';
  if (source.split(agentOpenSettingsMethodMarker).length - 1 !== 1) throw new Error('cannot locate KimiAgent Settings callback');
  // The custom action below calls the vendor Settings router directly. This
  // opens the native Work settings BrowserView through the vendor's
  // /settings/work/<page> route, which keeps the remote shell and local view
  // synchronized without adding a second renderer owner.
  const paneStartMarker = '  [_0xb5b38d(6853)](_0x17e996) {';
  const paneEndMarker = '  [_0xb5b38d(5254)]() {';
  const paneStart = source.indexOf(paneStartMarker);
  const paneEnd = source.indexOf(paneEndMarker, paneStart);
  if (paneStart < 0 || paneEnd <= paneStart) throw new Error('cannot locate Work settings pane router');
  if (source.includes('Linux custom work pane routing')) throw new Error('Linux Work settings pane router patch already applied');
  const paneReplacement = `  ["openWorkSettingsPane"](_0x17e996 = "kimi") {
    // Linux custom settings actions belong to the native Work settings
    // surface. The remote Kimi shell owns the outer navigation, while the
    // /settings/work/<page> route asks it to show the local Work view.
    const _0x5b9a9d = _0xb5b38d;
    this["openOnlineSettingsRoute"](_0x5b9a9d(1690) + _0x17e996);
  }
`;
  source = source.slice(0, paneStart) + paneReplacement + source.slice(paneEnd);
  // A legacy renderer can still request the local detail pane. Keep the
  // remote Settings shell visible for its navigation sidebar and constrain the
  // native Work view to the content rectangle before geometry is applied.
  const geometryMarker = '    this[_0x483f22(12516)] && !this[_0x483f22(12516)]["webContents"][_0x483f22(11737)]() && this["onlineSettingsView"]["setBounds"](_0x379648);\n';
  if (source.split(geometryMarker).length - 1 !== 1) throw new Error('cannot locate Settings geometry surface boundary');
  const geometryBranch = `    if (this["settingsMode"] === "pane") {
      // Pane bounds are explicit: retain the native 240px settings sidebar
      // owned by onlineSettingsView, and place the local Work surface only in
      // the content rectangle to its right. Never make the pane full-window;
      // doing so hides the sidebar while Shortcuts is loading.
      this["onlineSettingsView"]?.["setVisible"](!![]);
      if (this["settingsView"] && !this["settingsView"]["webContents"]["isDestroyed"]()) {
        const _0x1a3abc = _0x1faeb7(_0xff8a2b, _0x5b337c);
        this["settingsView"]["setBounds"](_0x312b77(_0xff8a2b, _0xd9c3b6, this[_0x483f22(6579)], _0x5b337c, _0x502f6d(process["platform"])));
        this["settingsView"]["setVisible"](!![]);
        this[_0x483f22(18402)] = _0x1a3abc;
      }
      return;
    }
`;
  source = source.replace(geometryMarker, geometryBranch + geometryMarker);
  // The stock bridge IPC handlers used obfuscated calls for Settings and
  // Shortcuts. Route both fixed channels through the native Work settings
  // method so the local BrowserView receives the selected page key.
  const openSettingsCall = '_0xeb3c8e[_0x458152(15949)](_0x458152(11364));';
  const openSettingsCallCount = source.split(openSettingsCall).length - 1;
  if (openSettingsCallCount !== 1) throw new Error(`expected one stock Settings bridge call, found ${openSettingsCallCount}`);
  source = source.replace(openSettingsCall, '_0xeb3c8e["openWorkSettingsPane"]("kimi");');
  const openShortcutsCall = '_0xeb3c8e[_0x7b88a5(15949)](_0x7b88a5(1865));';
  const openShortcutsCallCount = source.split(openShortcutsCall).length - 1;
  if (openShortcutsCallCount !== 1) throw new Error(`expected one stock Shortcuts bridge call, found ${openShortcutsCallCount}`);
  source = source.replace(openShortcutsCall, '_0xeb3c8e["openWorkSettingsPane"]("shortcuts");');
  // KimiAgent's ordinary Settings action used a separate `openSettingsPage
  // `("kimi")` path. Use the same native Work settings owner; subscription and
  // other explicitly online destinations remain unchanged.
  const agentSettingsCall = '_0xaeb064[_0x230f22(16466)]["openSettingsPage"]("kimi");';
  const agentSettingsCallCount = source.split(agentSettingsCall).length - 1;
  if (agentSettingsCallCount !== 1) throw new Error(`expected one KimiAgent Settings action, found ${agentSettingsCallCount}`);
  source = source.replace(agentSettingsCall, '_0xaeb064[_0x230f22(16466)]["openWorkSettingsPane"]();');
  // Switching from Agent back to Chat can recreate kimiView. Refresh the
  // online-settings sender identity before validating pane IPC so a renderer
  // from the current Settings page is not mistaken for a stale view and
  // ignored (which leaves the content pane blank).
  const onlineSenderMarker = '  ["isOnlineSettingsSender"](_0x5f0e4d) {\n    const _0x45f4f3 = _0xb5b38d, _0x5b0a54 = this[_0x45f4f3(12516)]?.[_0x45f4f3(15067)];\n';
  if (source.split(onlineSenderMarker).length - 1 !== 1) throw new Error('cannot locate online Settings sender validation boundary');
  source = source.replace(onlineSenderMarker, `${onlineSenderMarker}    const _0x3eb6d1 = this["deps"]?.["getKimiView"]?.()?.[_0x45f4f3(15067)];
    if (process["platform"] === "linux" && _0x3eb6d1 && _0x3eb6d1 !== _0x5b0a54) this[_0x45f4f3(12516)] = this["deps"]["getKimiView"]();
`);
  const onlineSenderEquality = '_0x5b0a54 === _0x5f0e4d && this[_0x45f4f3(17381)](_0x5b0a54[_0x45f4f3(10558)]())';
  if (source.split(onlineSenderEquality).length - 1 !== 1) throw new Error('cannot locate online Settings sender equality check');
  source = source.replace(onlineSenderEquality, '(_0x5b0a54 === _0x5f0e4d || _0x3eb6d1 === _0x5f0e4d) && this[_0x45f4f3(17381)](_0x5f0e4d[_0x45f4f3(10558)]())');
  // The remote Settings shell and the local Work detail view are a coordinated
  // pair on Linux: the shell owns the category sidebar, while work-specific
  // categories request a bounded local pane for their content.
  const workSettingsViewMarker = '  ["ensureWorkSettingsView"](_0x83140f = this["settingsGeneration"]) {\n    const _0x24c8b0 = _0xb5b38d;\n';
  if (source.split(workSettingsViewMarker).length - 1 !== 1) throw new Error('cannot locate Work settings view lifecycle boundary');
  source = source.replace(workSettingsViewMarker, workSettingsViewMarker);
  // `applyActiveTab("work")` normally hides the online Settings view. In the
  // Linux pane state both surfaces are intentional: the remote view owns the
  // category sidebar and the local Work view supplies the selected work pane.
  // Reassert both surfaces whenever the remote view finishes loading so the
  // sidebar cannot disappear during a pane transition.
  const paneActiveTabMarker = '  ["applyActiveTab"](_0x829229) {\n    const _0x3d9af1 = _0xb5b38d, _0x5b844d = this["deps"]["getBaseWindow"]();\n';
  if (source.split(paneActiveTabMarker).length - 1 !== 1) throw new Error('cannot locate active Settings tab boundary');
  const paneActiveTabBranch = `${paneActiveTabMarker}    if (process["platform"] === "linux" && this["settingsMode"] === "pane") {
      this["activeSettingsTab"] = "kimi";
      this["onlineSettingsView"]?.["setBounds"]({ "x": 0, "y": 0, "width": this["deps"]["getBaseWindow"]()["getContentSize"]()[0], "height": this["deps"]["getBaseWindow"]()["getContentSize"]()[1] });
      this["onlineSettingsView"]?.["setVisible"](!![]);
      this["settingsView"]?.["setVisible"](!![]);
      this["applyViewGeometry"]();
      this["focusSettingsView"](this["settingsView"]);
      return;
    }
`;
  source = source.replace(paneActiveTabMarker, paneActiveTabBranch);
  fs.writeFileSync(mainFile, source, 'utf8');
}

function patchLinuxShortcutRecording(mainFile) {
  let source = fs.readFileSync(mainFile, 'utf8');
  // The settings BrowserView can emit a transient blur while Linux starts
  // the evdev recorder (Wayland/XWayland focus negotiation). The upstream
  // macOS blur cancellation therefore aborts recording before the first key
  // arrives. Keep the destroyed/timeout cancellation paths, but do not treat
  // a transient Linux blur as an explicit user cancel.
  const marker = '    _0x11d28c[_0x29f83d(10362)](_0x29f83d(9292), _0x54d8a4), _0x11d28c[_0x29f83d(10362)]("destroyed", _0x54d8a4), _0x1afafe =';
  const count = source.split(marker).length - 1;
  if (count !== 1) throw new Error(`expected one Linux shortcut recording focus boundary, found ${count}`);
  const replacement = '    if (process["platform"] !== "linux") _0x11d28c[_0x29f83d(10362)](_0x29f83d(9292), _0x54d8a4);\n    _0x11d28c[_0x29f83d(10362)]("destroyed", _0x54d8a4), _0x1afafe =';
  source = source.replace(marker, replacement);
  // A successful one-shot recording otherwise clears its upstream reference
  // without stopping the Linux polling reader. Stop it before clearing the
  // reference so repeated assignments cannot leak evdev descriptors and
  // starve the persistent activation binding.
  const settleMarker = '      _0x1afafe = null, _0x11d28c[_0xa86967(2615)](_0xa86967(9292), _0x54d8a4),';
  const settleCount = source.split(settleMarker).length - 1;
  if (settleCount !== 1) throw new Error(`expected one Linux shortcut recorder settle boundary, found ${settleCount}`);
  const settleReplacement = '      try { _0x1afafe?.recording?.stop?.(); } catch {}\n      _0x1afafe = null, _0x11d28c[_0xa86967(2615)](_0xa86967(9292), _0x54d8a4),';
  source = source.replace(settleMarker, settleReplacement);
  fs.writeFileSync(mainFile, source, 'utf8');
}

function patchLinuxTerminalHandler(mainFile) {
  let source = fs.readFileSync(mainFile, 'utf8');
  const startMarker = '  }), ipcMain[_0x494f38(12955)]("desktopclaw:open-terminal", async () => {';
  const start = source.indexOf(startMarker);
  const endMarker = '  });\n}\nasync function _0x497590';
  const end = source.indexOf(endMarker, start);
  if (start < 0 || end <= start) throw new Error('cannot locate DesktopClaw terminal handler');
  if (source.includes('Linux terminal adapter unavailable')) throw new Error('Linux terminal handler patch already applied');
  const replacement = `  }), ipcMain.handle("desktopclaw:open-terminal", async () => {
    const _0x2bf930 = _0x41cbbb();
    try {
      mkdirSync(_0x2bf930, { "recursive": !![] });
      if (process["platform"] !== "linux") return { "success": ![], "message": "unsupported-platform" };
      const _0x4a3e0b = _0xa1745d("kimi-linux-workbench");
      if (!_0x4a3e0b || typeof _0x4a3e0b["openTerminal"] !== "function") return { "success": ![], "message": "Linux terminal adapter unavailable", "cwd": _0x2bf930 };
      return await _0x4a3e0b["openTerminal"]({ "cwd": _0x2bf930 });
    } catch (_0x194fa7) {
      const _0x379e28 = _0x194fa7 instanceof Error ? _0x194fa7["message"] : "Failed to open terminal";
      _0x509749["error"]("DesktopClaw", "Linux terminal launch failed: " + _0x379e28);
      return { "success": ![], "message": _0x379e28, "cwd": _0x2bf930 };
    }
  });`;
  const shiftedStart = source.indexOf(startMarker);
  const shiftedEnd = source.indexOf(endMarker, shiftedStart);
  if (shiftedStart < 0 || shiftedEnd <= shiftedStart) throw new Error('cannot re-locate shifted DesktopClaw terminal handler');
  source = source.slice(0, shiftedStart) + replacement + source.slice(shiftedEnd + '  });'.length);
  fs.writeFileSync(mainFile, source, 'utf8');
}

function patchLinuxCustomHotkeys(mainFile) {
  let source = fs.readFileSync(mainFile, 'utf8');
  const helperMarker = 'function _0x83fe2e(_0x50a528) {';
  const callMarker = '  _0x2bfffa(_0x5a7ac8), _0x83fe2e(_0x5a7ac8),';
  if (!source.includes(helperMarker)) throw new Error('cannot locate BridgeIPC registration boundary for custom hotkeys');
  if (!source.includes(callMarker)) throw new Error('cannot locate BridgeIPC startup call for custom hotkeys');
  if (source.includes('function __kimiLinuxCustomHotkeysInstall(')) throw new Error('Linux custom hotkeys patch already applied');
  // The desktop-pet controller is created later during startup.  Publish only
  // its already-audited public pin/hide/list methods so the single visibility
  // action can keep the pet and the main window in the same state.
  const widgetPinMarker = '  _0x3a9cd9 = (_0x4d1023) => {\n';
  if (source.split(widgetPinMarker).length - 1 !== 1) throw new Error('cannot locate Desktop Pet controller boundary');
  source = source.replace(widgetPinMarker, '  globalThis.__kimiLinuxWidgetPin = _0x4d829c;\n' + widgetPinMarker);
  const helper = String.raw`function __kimiLinuxCustomHotkeysInstall(_0x50a528) {
  if (process["platform"] !== "linux" || globalThis.__kimiLinuxCustomHotkeysManager) return;
  const _0x4a3e0b = _0xa1745d("kimi-hotkeys");
  if (!_0x4a3e0b || typeof _0x4a3e0b["HotkeyManager"] !== "function") {
    _0x509749["warn"]("Hotkeys", "Linux custom hotkey adapter unavailable");
    return;
  }
  const _0x4c126a = _0x50a528?.["windowManager"];
  const _0x2d7a91 = new Set(["new-task", "open-dashboard", "open-plugins", "open-scheduled", "open-remote-control"]);
  const _0x1c7f20 = () => {
    const _0x3c9b4a = BrowserWindow["getFocusedWindow"]();
    if (_0x3c9b4a && !_0x3c9b4a["isDestroyed"]()) return _0x3c9b4a;
    return BrowserWindow["getAllWindows"]().find((_0x32aef0) => {
      if (!_0x32aef0 || _0x32aef0["isDestroyed"]()) return ![];
      try { return !_0x32aef0["isAlwaysOnTop"]?.(); } catch { return !![]; }
    }) || null;
  };
  const _0x3f4b82 = (_0xvisible) => {
    const _0xpin = globalThis.__kimiLinuxWidgetPin;
    if (!_0xpin || typeof _0xpin["listPets"] !== "function") return Promise.resolve();
    return Promise.resolve(_0xpin["listPets"]()).then((_0xstate) => {
      const _0xselected = _0xstate?.["selected"];
      if (!_0xselected?.["widgetId"] || _0xstate?.["enabled"] === _0xvisible) return;
      if (_0xvisible) _0xpin["pin"]({ "widgetId": _0xselected["widgetId"], "title": _0xselected["name"], "widgetKind": "pet", "contentScale": _0xselected["contentScale"] || 1 });
      else _0xpin["hide"]({ "widgetId": _0xselected["widgetId"] });
    }).catch((_0x4b7e0d) => _0x509749["warn"]("Hotkeys", "desktop pet visibility update failed: " + String(_0x4b7e0d)));
  };
  const _0x4e0c1a = (_0x53a8b2) => {
    // Work navigation belongs to the Kimi Agent surface, never whichever
    // BrowserWindow happened to have focus (that may be Settings, Claw, or a
    // temporary dialog).  Opening the surface first is idempotent; delivery is
    // retried for a bounded interval while its preload/DOM finishes loading.
    try { _0x4c126a?.["closeSettingsPage"]?.({ "restore": "entry" }); } catch {}
    try { _0x4c126a?.["showAndFocus"]?.(); } catch {}
    try { _0x4c126a?.["openKimiAgentPage"]?.(); } catch (_0x4f5d12) { _0x509749["warn"]("Hotkeys", "Kimi Agent surface open failed: " + String(_0x4f5d12)); }
    let _0x1c3d4f = 0;
    const _0x2a0e53 = () => {
      const _0x3d8b26 = _0x4c126a?.["getKimiAgentWebContents"]?.();
      if (_0x3d8b26 && !_0x3d8b26["isDestroyed"]()) {
        try {
          _0x3d8b26["send"]("kimi:custom-hotkey", _0x53a8b2);
          _0x509749["info"]("Hotkeys", "action delivered to Kimi Agent: " + String(_0x53a8b2?.["id"]));
          return;
        } catch (_0x47de9f) {
          _0x509749["warn"]("Hotkeys", "Kimi Agent action delivery failed: " + String(_0x47de9f));
        }
      }
      _0x1c3d4f += 1;
      if (_0x1c3d4f < 12) {
        const _0x4a7c62 = setTimeout(_0x2a0e53, 125);
        _0x4a7c62?.["unref"]?.();
      } else _0x509749["warn"]("Hotkeys", "Kimi Agent action delivery timed out: " + String(_0x53a8b2?.["id"]));
    };
    _0x2a0e53();
  };
  const _0x4d0c9f = (_0x53a8b2) => {
    const _0x5b1e4f = _0x53a8b2?.["id"];
    _0x509749["info"]("Hotkeys", "dispatch action: " + String(_0x5b1e4f));
    if (_0x5b1e4f === "quit-app") {
      app["quit"]();
      return;
    }
    if (_0x5b1e4f === "toggle-window" || _0x5b1e4f === "hide-window") {
      const _0x51d9c7 = _0x1c7f20();
      const _0x2b8c11 = !_0x51d9c7?.["isVisible"]();
      if (!_0x2b8c11) _0x51d9c7?.["hide"]();
      else {
        try { _0x4c126a?.["showAndFocus"]?.(); } catch {}
        _0x51d9c7?.["show"]();
        _0x51d9c7?.["focus"]();
      }
      _0x3f4b82(_0x2b8c11);
      return;
    }
    if (_0x5b1e4f === "open-terminal") {
      const _0x4a4f39 = _0xa1745d("kimi-linux-workbench");
      Promise.resolve(_0x4a4f39?.["openTerminal"]?.({ "cwd": _0x41cbbb() })).then((_0x3c3d79) => {
        !_0x3c3d79?.["success"] && _0x509749["warn"]("Hotkeys", "Open terminal action failed: " + (_0x3c3d79?.["message"] || "unknown error"));
      }).catch((_0x53a3e2) => _0x509749["warn"]("Hotkeys", "Open terminal action failed: " + String(_0x53a3e2)));
      return;
    }
    if (_0x5b1e4f === "open-launcher") {
      // The stock launcher control is hidden from the settings UI on Linux;
      // this action is now its single dispatch path.
      try { _0x1f06de?.["press"]?.(); } catch (_0x53a3e2) { _0x509749["warn"]("Hotkeys", "Open launcher action failed: " + String(_0x53a3e2)); }
      return;
    }
    if (_0x5b1e4f === "open-settings") {
      try { _0x4c126a?.["showAndFocus"]?.(); } catch {}
      try { _0x4c126a?.["openWorkSettingsPane"]("kimi"); } catch (_0x2bf0da) { _0x509749["warn"]("Hotkeys", "Settings action failed: " + String(_0x2bf0da)); }
      return;
    }
    if (_0x5b1e4f === "open-shortcuts") {
      try { _0x4c126a?.["showAndFocus"]?.(); } catch {}
      try { _0x4c126a?.["openWorkSettingsPane"]("shortcuts"); } catch (_0x2bf0da) { _0x509749["warn"]("Hotkeys", "Settings action failed: " + String(_0x2bf0da)); }
      return;
    }
    if (_0x5b1e4f === "open-desktop-claw") {
      try {
        // Kimi Claw is a companion surface of Chat.  Select Chat first so a
        // shortcut fired from Work/Settings cannot leave the claw view
        // layered over the wrong content surface.
        _0x4c126a?.["switchToKimiSurface"]?.();
        _0x4c126a?.["openDesktopClawPage"]?.();
      } catch (_0x2bf0da) { _0x509749["warn"]("Hotkeys", "Kimi Claw action failed: " + String(_0x2bf0da)); }
      return;
    }
    if (_0x2d7a91.has(_0x5b1e4f)) {
      _0x4e0c1a(_0x53a8b2);
      return;
    }
    _0x509749["warn"]("Hotkeys", "unsupported builtin action: " + String(_0x5b1e4f));
  };
  const _0x4f9c23 = new _0x4a3e0b["HotkeyManager"]({ "onAction": _0x4d0c9f });
  globalThis.__kimiLinuxCustomHotkeysManager = _0x4f9c23;
  if (!globalThis.__kimiLinuxCustomHotkeysIpc) {
    globalThis.__kimiLinuxCustomHotkeysIpc = !![];
    ipcMain["handle"]("kimi:custom-hotkeys:list", () => _0x4f9c23["list"]());
    ipcMain["handle"]("kimi:custom-hotkeys:set-binding", (_0x5c1eb2, _0x1f88ac) => {
      const _0x2894b3 = _0x4f9c23["setBinding"](_0x1f88ac || {});
      if (_0x2894b3?.["ok"] && _0x1f88ac?.["id"] === "open-launcher") {
        if (_0x2894b3["binding"]?.["shortcut"] && _0x2894b3["binding"]["enabled"] !== false) _0x45409e(_0x2894b3["binding"]["shortcut"]);
        else _0x244509();
      }
      return _0x2894b3;
    });
    ipcMain["handle"]("kimi:custom-hotkeys:upsert-command", (_0x5c1eb2, _0x1f88ac) => _0x4f9c23["upsertCommand"](_0x1f88ac || {}));
    ipcMain["handle"]("kimi:custom-hotkeys:delete-command", (_0x5c1eb2, _0x1f88ac) => _0x4f9c23["deleteCommand"](_0x1f88ac));
    ipcMain["handle"]("kimi:custom-hotkeys:record", (_0x5c1eb2, _0x1f88ac) => _0x4f9c23["recordShortcut"](_0x1f88ac, (_0x4b4c8a) => {
      if (!_0x5c1eb2?.["sender"] || _0x5c1eb2["sender"]["isDestroyed"]()) return;
      try { _0x5c1eb2["sender"]["send"]("kimi:custom-hotkeys:recording-progress", _0x4b4c8a); } catch {}
    }).then((_0x4b4c8a) => {
      if (_0x4b4c8a?.["ok"] && _0x1f88ac?.["kind"] === "binding" && _0x1f88ac?.["id"] === "open-launcher" && _0x4b4c8a["shortcut"]) _0x45409e(_0x4b4c8a["shortcut"]);
      return _0x4b4c8a;
    }));
    ipcMain["handle"]("kimi:custom-hotkeys:cancel-record", () => _0x4f9c23["cancelRecording"]());
    ipcMain["handle"]("kimi:custom-hotkeys:run", (_0x5c1eb2, _0x1f88ac) => _0x4f9c23["run"](_0x1f88ac));
    app["once"]("will-quit", () => _0x4f9c23["stop"]());
  }
  // Disable the vendor's original launcher accelerator.  A Linux launcher
  // shortcut is registered only when the custom registry has an explicit
  // open-launcher binding, so the two systems cannot fight over a stale
  // default or resurrect Right Alt after Clear.
  _0x244509();
  const _0x1f88ac = _0x4f9c23["list"]()["actions"]?.find((_0x2bf0da) => _0x2bf0da["id"] === "open-launcher");
  if (_0x1f88ac?.["enabled"] && _0x1f88ac["shortcut"]) _0x45409e(_0x1f88ac["shortcut"]);
  _0x4f9c23["start"]();
  _0x509749["info"]("Hotkeys", "Linux custom hotkey manager started");
  // The vendor launcher service is constructed later in the same startup
  // turn. Re-run ownership after that construction so its default accelerator
  // cannot survive this registry's startup unregister step.
  setImmediate(() => {
    if (process["platform"] !== "linux") return;
    _0x244509();
    const _0x2f5a1e = _0x4f9c23["list"]()["actions"]?.find((_0x2bf0da) => _0x2bf0da["id"] === "open-launcher");
    if (_0x2f5a1e?.["enabled"] && _0x2f5a1e["shortcut"]) _0x45409e(_0x2f5a1e["shortcut"]);
  });
}
`;
  source = source.replace(helperMarker, helper + helperMarker);
  source = source.replace(callMarker, `  _0x2bfffa(_0x5a7ac8), _0x83fe2e(_0x5a7ac8), __kimiLinuxCustomHotkeysInstall(_0x5a7ac8),`);
  fs.writeFileSync(mainFile, source, 'utf8');
}

function patchLinuxPreloads(appDir) {
  const preloadDir = path.join(appDir, 'out', 'preload');
  const clawFile = path.join(preloadDir, 'preload-claw.mjs');
  const kimiFile = path.join(preloadDir, 'preload-kimi.mjs');
  const agentFile = path.join(preloadDir, 'preload-kimi-agent.mjs');
  const eventListener = String.raw`// Linux custom-hotkey action bridge.  The main process emits a fixed action id;
// never evaluate renderer-provided code or arbitrary IPC channel names here.
ipcRenderer.on("kimi:custom-hotkey", (_0xevent, _0xpayload) => {
  if (!_0xpayload || _0xpayload["type"] !== "builtin") return;
  const _0xid = _0xpayload["id"];
  if (["open-launcher", "new-task", "open-dashboard", "open-plugins", "open-scheduled", "open-remote-control"].includes(_0xid)) {
    ipcRenderer.send("bridge:open-kimi-work-tab");
    return;
  }
  if (_0xid === "open-settings") {
    ipcRenderer.send("bridge:open-kimi-work-setting-page");
    return;
  }
  if (_0xid === "open-shortcuts") {
    ipcRenderer.send("bridge:open-kimi-work-setting-tab");
    return;
  }
  if (_0xid === "open-desktop-claw") ipcRenderer.send("bridge:open-desktop-claw-page");
});
`;
  const agentEventListener = String.raw`// Linux custom-hotkey navigation bridge for the Kimi Agent surface.
// Navigation is translated into clicks on the native sidebar controls so the
// renderer's own state manager remains the sole owner of activeView.
(() => {
  const _0xvisible = (_0xnode) => {
    if (!_0xnode || !_0xnode.isConnected) return false;
    const _0xrect = _0xnode.getBoundingClientRect?.();
    if (!_0xrect || _0xrect.width <= 0 || _0xrect.height <= 0) return false;
    const _0xstyle = typeof getComputedStyle === "function" ? getComputedStyle(_0xnode) : null;
    return _0xstyle?.display !== "none" && _0xstyle?.visibility !== "hidden" && _0xstyle?.opacity !== "0" && _0xnode.getAttribute?.("aria-hidden") !== "true";
  };
  const _0xpatterns = {
    "new-task": [/^new task$/iu, /new task/iu],
    "open-dashboard": [/^dashboard$/iu, /dashboard/iu],
    "open-plugins": [/^plugins?$/iu, /plugins?/iu],
    "open-scheduled": [/^scheduled(?: tasks?)?$/iu, /scheduled|cron/iu],
    "open-remote-control": [/^remote control$/iu, /remote control/iu],
  };
  const _0xclickNative = (_0xid) => {
    const _0xneedles = _0xpatterns[_0xid];
    if (!_0xneedles || !document.body) return false;
    const _0xnodes = document.querySelectorAll("button,[role=button]");
    for (const _0xnode of _0xnodes) {
      if (!_0xvisible(_0xnode) || _0xnode.disabled) continue;
      const _0xtext = String(_0xnode.getAttribute?.("aria-label") || "") + " " + String(_0xnode.getAttribute?.("title") || "") + " " + String(_0xnode.textContent || "");
      const _0xnormalized = _0xtext.replace(/\s+/gu, " ").trim();
      if (!_0xneedles.some((_0xneedle) => _0xneedle.test(_0xnormalized))) continue;
      try { _0xnode.click(); return true; } catch { return false; }
    }
    return false;
  };
  const _0xdispatch = (_0xid) => {
    let _0xattempt = 0;
    const _0xtry = () => {
      if (_0xclickNative(_0xid)) return;
      _0xattempt += 1;
      if (_0xattempt < 16) setTimeout(_0xtry, 100);
    };
    _0xtry();
  };
  ipcRenderer.on("kimi:custom-hotkey", (_0xevent, _0xpayload) => {
    if (!_0xpayload || _0xpayload["type"] !== "builtin") return;
    const _0xid = _0xpayload["id"];
    if (Object.prototype.hasOwnProperty.call(_0xpatterns, _0xid)) _0xdispatch(_0xid);
  });
})();
`;
  // The online Kimi settings route is rendered by kimiView with
  // preload-kimi.mjs, not by the local Work settings BrowserView.  Keep a
  // compact DOM panel in that route as well so the feature is visible at the
  // exact Settings -> Shortcuts screen users already use.  It talks only to
  // the fixed custom-hotkeys IPC channels; it never evaluates page data as
  // code or accepts an arbitrary channel name.
  const remotePanel = String.raw`// Linux custom hotkeys panel for the online Kimi settings route.
(() => {
  const selector = "[data-kimi-remote-custom-hotkeys]";
  const settingsPath = () => /\/settings(?:\/|$)/u.test(String(location.pathname || ""));
  const stickyProperties = ["position", "top", "align-self", "height", "max-height", "overflow-y", "overscroll-behavior"];
  const stickyOriginal = new WeakMap();
  const visibleSidebar = (_0xnode) => {
    if (!_0xnode || !_0xnode.isConnected) return false;
    const _0xrect = _0xnode.getBoundingClientRect?.();
    if (!_0xrect || _0xrect.left > Math.min(320, window.innerWidth * 0.25) || _0xrect.width < 120 || _0xrect.width > 360 || _0xrect.height < window.innerHeight * 0.35) return false;
    const _0xtext = String(_0xnode.textContent || "");
    return /Account & Security|Shortcuts|Appearance|Notifications/iu.test(_0xtext);
  };
  const restoreStickySidebar = () => document.querySelectorAll("[data-kimi-settings-sidebar-sticky]").forEach((_0xnode) => {
    const _0xoriginal = stickyOriginal.get(_0xnode) || {};
    for (const _0xproperty of stickyProperties) _0xnode.style.setProperty(_0xproperty, _0xoriginal[_0xproperty] || "");
    _0xnode.removeAttribute("data-kimi-settings-sidebar-sticky");
    stickyOriginal.delete(_0xnode);
  });
  const installStickySidebar = () => {
    if (!settingsPath()) {
      restoreStickySidebar();
      return;
    }
    const _0xcandidates = document.querySelectorAll("aside,nav,[role=navigation],[class*=sidebar i]");
    const _0xsidebar = Array.from(_0xcandidates).find(visibleSidebar);
    if (!_0xsidebar) return;
    if (!stickyOriginal.has(_0xsidebar)) stickyOriginal.set(_0xsidebar, Object.fromEntries(stickyProperties.map((_0xproperty) => [_0xproperty, _0xsidebar.style.getPropertyValue(_0xproperty)])));
    _0xsidebar.setAttribute("data-kimi-settings-sidebar-sticky", "1");
    _0xsidebar.style.setProperty("position", "sticky", "important");
    _0xsidebar.style.setProperty("top", "0px", "important");
    _0xsidebar.style.setProperty("align-self", "flex-start", "important");
    _0xsidebar.style.setProperty("height", "100vh", "important");
    _0xsidebar.style.setProperty("max-height", "100vh", "important");
    _0xsidebar.style.setProperty("overflow-y", "auto", "important");
    _0xsidebar.style.setProperty("overscroll-behavior", "contain", "important");
  };
  const shortcutPath = () => /\/shortcuts(?:\/|$)/u.test(String(location.pathname || "")) || /(?:^|[?&])(pane|page|tab|section)=shortcuts(?:&|$)/iu.test(String(location.search || ""));
  const shortcutHeading = () => {
    const nodes = document.querySelectorAll("h1,h2,h3,h4,[role=heading]");
    for (const node of nodes) {
      if (node.closest(selector) || node.closest("nav,aside,[aria-hidden='true']")) continue;
      if (String(node.textContent || "").trim() !== "Shortcuts") continue;
      const rect = node.getBoundingClientRect();
      const style = typeof getComputedStyle === "function" ? getComputedStyle(node) : null;
      if (rect.width > 0 && rect.height > 0 && rect.left > Math.min(320, window.innerWidth * 0.22) && style?.display !== "none" && style?.visibility !== "hidden" && style?.opacity !== "0") return node;
    }
    return null;
  };
  const isShortcutRoute = () => shortcutPath() || Boolean(shortcutHeading());
  const layoutHost = () => {
    const heading = shortcutHeading();
    if (!heading) return document.querySelector("main") || document.body;
    const nativeHost = heading.closest(".settings-page__body,.settings-page");
    if (nativeHost) return nativeHost;
    let current = heading;
    let best = heading.parentElement || heading;
    for (let depth = 0; current && depth < 8; depth += 1, current = current.parentElement) {
      const rect = current.getBoundingClientRect();
      if (rect.width >= 320 && rect.width <= window.innerWidth * 0.86 && rect.left >= 220 && rect.height < window.innerHeight * 0.9) best = current;
    }
    return best;
  };
  const restoreHiddenLaunchers = () => document.querySelectorAll("[data-kimi-custom-hotkeys-hidden-launcher]").forEach((node) => {
    node.style.removeProperty("display");
    node.removeAttribute("data-kimi-custom-hotkeys-hidden-launcher");
  });
  const removePanel = () => {
    document.querySelectorAll(selector).forEach((node) => node.remove());
    restoreHiddenLaunchers();
  };
  const invoke = (channel, payload) => ipcRenderer.invoke(channel, payload);
  const makeButton = (label, handler, danger = false) => {
    const node = document.createElement("button");
    node.type = "button";
    node.textContent = label;
    node.style.cssText = "border:1px solid rgba(255,255,255,.24);border-radius:7px;background:transparent;color:inherit;padding:5px 8px;cursor:pointer;font:12px system-ui,sans-serif" + (danger ? ";color:#f08080" : "");
    node.addEventListener("click", () => Promise.resolve(handler(node)).catch((error) => {
      const status = document.querySelector("[data-kimi-remote-hotkey-status]");
      if (status) status.textContent = error?.message || String(error);
    }));
    return node;
  };
  const mount = () => {
    if (!document.body) return;
    installStickySidebar();
    if (!isShortcutRoute()) {
      removePanel();
      return;
    }
    const existing = document.querySelector(selector);
    if (existing) {
      const host = layoutHost();
      if (host && host.insertBefore && existing.parentElement !== host) {
        const launcherBlock = Array.from(host.children || []).find((node) => node !== existing && /\bLauncher\b/u.test(String(node.textContent || "")));
        host.insertBefore(existing, launcherBlock || host.firstChild || null);
      }
      return;
    }
    const panel = document.createElement("section");
    panel.setAttribute("data-kimi-remote-custom-hotkeys", "1");
    // Keep this in the existing Shortcuts content column.  Do not create a
    // floating window, card, or opaque background that obscures the native
    // settings layout.
    // The stock Linux Shortcuts card is a 456px content column at the
    // reference desktop scale. Matching that width keeps these rows on the
    // same visual layer instead of stretching across the settings shell.
    panel.style.cssText = "display:block;box-sizing:border-box;width:min(100%,456px);max-width:456px;margin:18px auto 24px;padding:0;color:inherit;background:transparent;border:0;border-radius:0;box-shadow:none;font:inherit";
    const title = document.createElement("div");
    title.textContent = "Custom hotkeys";
    title.style.cssText = "font-weight:650;font-size:16px;margin:0 0 4px";
    panel.appendChild(title);
    const intro = document.createElement("div");
    intro.textContent = "Assign a shortcut to any Kimi action or run a trusted local command.";
    intro.style.cssText = "opacity:.7;margin:0 0 10px";
    panel.appendChild(intro);
    const status = document.createElement("div");
    status.setAttribute("data-kimi-remote-hotkey-status", "1");
    status.style.cssText = "min-height:18px;color:#e6b566;margin:0 0 8px";
    panel.appendChild(status);
    const list = document.createElement("div");
    panel.appendChild(list);
    const commandsTitle = document.createElement("div");
    commandsTitle.textContent = "Custom commands";
    commandsTitle.style.cssText = "font-weight:650;margin:16px 0 6px";
    panel.appendChild(commandsTitle);
    const commands = document.createElement("div");
    panel.appendChild(commands);
    const form = document.createElement("form");
    form.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px";
    form.innerHTML = '<input name="name" required maxlength="160" placeholder="Command name" style="box-sizing:border-box;width:100%;padding:6px;border:1px solid rgba(255,255,255,.24);border-radius:6px;background:transparent;color:inherit"><input name="cwd" maxlength="4096" placeholder="Working directory (optional)" style="box-sizing:border-box;width:100%;padding:6px;border:1px solid rgba(255,255,255,.24);border-radius:6px;background:transparent;color:inherit"><textarea name="command" required maxlength="8192" placeholder="Shell command" style="grid-column:1/-1;box-sizing:border-box;width:100%;min-height:44px;padding:6px;border:1px solid rgba(255,255,255,.24);border-radius:6px;background:transparent;color:inherit"></textarea><button type="submit" style="grid-column:1/-1;border:1px solid rgba(255,255,255,.24);border-radius:7px;background:transparent;color:inherit;padding:6px;cursor:pointer">Save command</button>';
    panel.appendChild(form);
    const host = layoutHost();
    if (!host || host === panel || !host.appendChild) return;
    const launcherBlock = Array.from(host.children || []).find((node) => node !== panel && /\bLauncher\b/u.test(String(node.textContent || "")));
    if (launcherBlock) {
      launcherBlock.setAttribute("data-kimi-custom-hotkeys-hidden-launcher", "1");
      launcherBlock.style.display = "none";
    }
    host.insertBefore(panel, launcherBlock || host.firstChild || null);
    let recordingLabel = null;
    const load = async () => {
      const data = await invoke("kimi:custom-hotkeys:list");
      status.textContent = data?.status?.inputStatus === "running" ? "Global keyboard reader ready" : "Global keyboard reader: " + (data?.status?.inputStatus || "unknown");
      list.replaceChildren();
      for (const action of Array.isArray(data?.actions) ? data.actions : []) {
        const row = document.createElement("div");
        row.style.cssText = "display:grid;grid-template-columns:minmax(0,1fr) auto auto auto;align-items:center;gap:8px;border-top:1px solid rgba(255,255,255,.14);padding:7px 0";
        const copy = document.createElement("div");
        copy.style.cssText = "flex:1;min-width:0";
        const label = document.createElement("strong");
        label.textContent = action.label || action.id;
        copy.appendChild(label);
        const desc = document.createElement("small");
        desc.textContent = action.description || action.id;
        desc.style.cssText = "display:block;opacity:.6";
        copy.appendChild(desc);
        row.appendChild(copy);
        const key = document.createElement("code");
        key.textContent = action.enabled && action.shortcut ? action.shortcut : "Unassigned";
        key.style.cssText = "min-width:92px;text-align:center;opacity:.8";
        row.appendChild(key);
        row.appendChild(makeButton(action.enabled && action.shortcut ? "Change" : "Assign", async (button) => {
          recordingLabel = button;
          button.textContent = "Press keys…";
          status.textContent = "Recording a shortcut…";
          const handler = (_event, payload) => { if (recordingLabel && payload?.type === "candidate") recordingLabel.textContent = payload.shortcut || "Press keys…"; };
          ipcRenderer.on("kimi:custom-hotkeys:recording-progress", handler);
          try {
            const result = await invoke("kimi:custom-hotkeys:record", { kind: "binding", id: action.id });
            status.textContent = result?.ok ? "Shortcut saved: " + result.shortcut : (result?.message || result?.reason || "Shortcut recording failed");
          } finally {
            ipcRenderer.removeListener("kimi:custom-hotkeys:recording-progress", handler);
            recordingLabel = null;
            await load();
          }
        }));
        row.appendChild(makeButton("Clear", async () => {
          const result = await invoke("kimi:custom-hotkeys:set-binding", { id: action.id, shortcut: "", enabled: false });
          if (!result?.ok) throw new Error(result?.message || "Unable to clear shortcut");
          status.textContent = "Shortcut cleared";
          await load();
        }, true));
        list.appendChild(row);
      }
      commands.replaceChildren();
      for (const command of Array.isArray(data?.commands) ? data.commands : []) {
        const row = document.createElement("div");
        row.style.cssText = "display:grid;grid-template-columns:minmax(0,1fr) auto auto auto auto;align-items:center;gap:8px;border-top:1px solid rgba(255,255,255,.14);padding:7px 0";
        const copy = document.createElement("div");
        copy.style.cssText = "flex:1;min-width:0";
        const label = document.createElement("strong"); label.textContent = command.name || command.id; copy.appendChild(label);
        const code = document.createElement("small"); code.textContent = command.command || ""; code.style.cssText = "display:block;opacity:.6;white-space:pre-wrap;word-break:break-word"; copy.appendChild(code);
        row.appendChild(copy);
        const key = document.createElement("code"); key.textContent = command.enabled && command.shortcut ? command.shortcut : "Unassigned"; key.style.cssText = "min-width:92px;text-align:center;opacity:.8"; row.appendChild(key);
        row.appendChild(makeButton(command.shortcut ? "Change" : "Assign", async (button) => {
          recordingLabel = button; button.textContent = "Press keys…"; status.textContent = "Recording a shortcut…";
          const result = await invoke("kimi:custom-hotkeys:record", { kind: "command", id: command.id });
          status.textContent = result?.ok ? "Shortcut saved: " + result.shortcut : (result?.message || result?.reason || "Shortcut recording failed"); recordingLabel = null; await load();
        }));
        row.appendChild(makeButton("Clear", async () => {
          const result = await invoke("kimi:custom-hotkeys:upsert-command", { id: command.id, name: command.name, cwd: command.cwd, command: command.command, shortcut: "", enabled: true });
          if (!result?.ok) throw new Error(result?.message || "Unable to clear shortcut");
          status.textContent = "Shortcut cleared";
          await load();
        }, true));
        row.appendChild(makeButton("Run", async () => { const result = await invoke("kimi:custom-hotkeys:run", command.id); status.textContent = result?.ok ? "Command started" : (result?.message || "Command failed"); }));
        row.appendChild(makeButton("Delete", async () => { const result = await invoke("kimi:custom-hotkeys:delete-command", command.id); if (!result?.ok) throw new Error(result?.message || "Unable to delete command"); await load(); }, true));
        commands.appendChild(row);
      }
    };
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const result = await invoke("kimi:custom-hotkeys:upsert-command", { name: form.elements.name.value, cwd: form.elements.cwd.value, command: form.elements.command.value, enabled: true });
      if (!result?.ok) { status.textContent = result?.message || "Unable to save command"; return; }
      form.reset(); status.textContent = "Command saved. Assign it a shortcut above."; await load();
    });
    load().catch((error) => { status.textContent = error?.message || String(error); });
  };
  let scheduled = false;
  const sync = () => {
    if (scheduled) return;
    scheduled = true;
    const run = () => { scheduled = false; mount(); };
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(run); else setTimeout(run, 0);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", sync, { once: true }); else sync();
  for (const method of ["pushState", "replaceState"]) {
    const original = history[method];
    if (typeof original !== "function") continue;
    history[method] = function (...args) { const result = original.apply(this, args); sync(); return result; };
  }
  window.addEventListener("popstate", sync);
  window.addEventListener("hashchange", sync);
  if (typeof MutationObserver === "function" && document.documentElement) new MutationObserver(sync).observe(document.documentElement, { childList: true, subtree: true });
})();
`;
  if (!fs.existsSync(clawFile) || !fs.existsSync(kimiFile) || !fs.existsSync(agentFile)) throw new Error('Linux custom hotkey preload sources are missing');
  let claw = fs.readFileSync(clawFile, 'utf8');
  const apiMarker = '"getWorkSettings":';
  if (!claw.includes(apiMarker)) throw new Error('cannot locate claw preload settings API');
  if (!claw.includes('"getCustomHotkeys":')) {
    const api = '"getCustomHotkeys": () => ipcRenderer.invoke("kimi:custom-hotkeys:list"), "setCustomHotkeyBinding": (_0xpayload) => ipcRenderer.invoke("kimi:custom-hotkeys:set-binding", _0xpayload), "upsertCustomHotkeyCommand": (_0xpayload) => ipcRenderer.invoke("kimi:custom-hotkeys:upsert-command", _0xpayload), "deleteCustomHotkeyCommand": (_0xid) => ipcRenderer.invoke("kimi:custom-hotkeys:delete-command", _0xid), "recordCustomHotkey": (_0xpayload) => ipcRenderer.invoke("kimi:custom-hotkeys:record", _0xpayload), "cancelCustomHotkeyRecording": () => ipcRenderer.invoke("kimi:custom-hotkeys:cancel-record"), "runCustomHotkey": (_0xid) => ipcRenderer.invoke("kimi:custom-hotkeys:run", _0xid), "onCustomHotkeyRecordingProgress": (_0xcallback) => { const _0xhandler = (_0xevent, _0xpayload) => _0xcallback(_0xpayload); ipcRenderer.on("kimi:custom-hotkeys:recording-progress", _0xhandler); return () => ipcRenderer.removeListener("kimi:custom-hotkeys:recording-progress", _0xhandler); }, ';
    claw = claw.replace(apiMarker, api + apiMarker);
  }
  if (!claw.includes('ipcRenderer.on("kimi:custom-hotkey"')) {
    const marker = '/*!__KIMI_OBFUSCATED__*/';
    const index = claw.lastIndexOf(marker);
    if (index < 0) throw new Error('cannot locate claw preload footer');
    claw = claw.slice(0, index) + eventListener + claw.slice(index);
  }
  fs.writeFileSync(clawFile, claw, 'utf8');

  let kimi = fs.readFileSync(kimiFile, 'utf8');
  const kimiApiMarker = '} }, _0x508cf5 = Object';
  if (!kimi.includes(kimiApiMarker)) throw new Error('cannot locate Kimi preload bridge API object');
  if (!kimi.includes('"getCustomHotkeys":')) {
    const api = '"getCustomHotkeys"() { return ipcRenderer.invoke("kimi:custom-hotkeys:list"); }, "setCustomHotkeyBinding"(_0xpayload) { return ipcRenderer.invoke("kimi:custom-hotkeys:set-binding", _0xpayload); }, "upsertCustomHotkeyCommand"(_0xpayload) { return ipcRenderer.invoke("kimi:custom-hotkeys:upsert-command", _0xpayload); }, "deleteCustomHotkeyCommand"(_0xid) { return ipcRenderer.invoke("kimi:custom-hotkeys:delete-command", _0xid); }, "recordCustomHotkey"(_0xpayload) { return ipcRenderer.invoke("kimi:custom-hotkeys:record", _0xpayload); }, "cancelCustomHotkeyRecording"() { return ipcRenderer.invoke("kimi:custom-hotkeys:cancel-record"); }, "runCustomHotkey"(_0xid) { return ipcRenderer.invoke("kimi:custom-hotkeys:run", _0xid); }, "onCustomHotkeyRecordingProgress"(_0xcallback) { const _0xhandler = (_0xevent, _0xpayload) => _0xcallback(_0xpayload); ipcRenderer.on("kimi:custom-hotkeys:recording-progress", _0xhandler); return () => ipcRenderer.removeListener("kimi:custom-hotkeys:recording-progress", _0xhandler); }';
    kimi = kimi.replace(kimiApiMarker, `}, ${api} }, _0x508cf5 = Object`);
  }
  if (!kimi.includes('ipcRenderer.on("kimi:custom-hotkey"')) {
    const marker = '/*!__KIMI_OBFUSCATED__*/';
    const index = kimi.lastIndexOf(marker);
    if (index < 0) throw new Error('cannot locate Kimi preload footer');
    kimi = kimi.slice(0, index) + eventListener + kimi.slice(index);
  }
  // Custom hotkeys are rendered by the native work-settings WebContentsView
  // using preload-claw.mjs. Do not create a second body-level owner in the
  // remote Kimi page; that path is only the outer settings shell.
  fs.writeFileSync(kimiFile, kimi, 'utf8');

  let agent = fs.readFileSync(agentFile, 'utf8');
  if (!agent.includes('ipcRenderer.on("kimi:custom-hotkey"')) {
    const marker = '/*!__KIMI_OBFUSCATED__*/';
    const index = agent.lastIndexOf(marker);
    if (index < 0) throw new Error('cannot locate Kimi Agent preload footer');
    agent = agent.slice(0, index) + agentEventListener + agent.slice(index);
  }
  fs.writeFileSync(agentFile, agent, 'utf8');
}

function patchLinuxWebBridgeBrowserRoots(mainFile) {
  let source = fs.readFileSync(mainFile, 'utf8');
  const start = source.indexOf('function _0x2e6ac3(');
  const end = source.indexOf('const _0xbb8261', start);
  if (start < 0 || end <= start) throw new Error('cannot locate Linux WebBridge browser-root resolver');
  const resolver = source.slice(start, end);
  const branch = resolver.match(/  if \(_0x5496d8 === _0xc73d5d\(17954\)\) return [^\n]*\n/u);
  if (!branch) throw new Error('cannot locate Linux WebBridge browser-root branch');
  const replacement = `  if (_0x5496d8 === _0xc73d5d(17954)) {
    const _0x1d9fd1 = _0x5b8235["XDG_CONFIG_HOME"] || join(_0xbd04fd, ".config");
    // Chromium-family profiles are user-owned state, not a system policy
    // directory. Include Vivaldi so the settings scanner can observe the
    // policy-installed extension instead of always returning "unsupported".
    return [
      join(_0x1d9fd1, "google-chrome"),
      join(_0x1d9fd1, "google-chrome-beta"),
      join(_0x1d9fd1, "google-chrome-unstable"),
      join(_0x1d9fd1, "chromium"),
      join(_0x1d9fd1, "BraveSoftware", "Brave-Browser"),
      join(_0x1d9fd1, "vivaldi"),
      join(_0x1d9fd1, "microsoft-edge"),
      join(_0x1d9fd1, "microsoft-edge-beta"),
      join(_0x1d9fd1, "microsoft-edge-dev"),
    ];
  }
`;
  source = source.slice(0, start) + resolver.replace(branch[0], replacement) + source.slice(end);
  fs.writeFileSync(mainFile, source, 'utf8');
}

function patchLinuxWorkbenchRenderer(appDir) {
  const assetsDir = path.join(appDir, 'out', 'renderer', 'assets');
  const candidates = fs.existsSync(assetsDir)
    ? fs.readdirSync(assetsDir).filter((name) => /^work-settings-[^/]+\.js$/u.test(name))
    : [];
  if (candidates.length !== 1) throw new Error(`expected one work-settings renderer bundle, found ${candidates.length}`);
  const file = path.join(assetsDir, candidates[0]);
  let source = fs.readFileSync(file, 'utf8');
  const platformGuard = 'function ql(e,t){const l=n;return e===l(1124)?"arm64"===t||t===l(624):"win32"===e&&t===l(624)}';
  if (!source.includes(platformGuard)) throw new Error('cannot locate WebBridge renderer platform guard');
  source = source.replace(platformGuard, 'function ql(e,t){const l=n;return "linux"===e&&(t==="x64"||t==="arm64")||e===l(1124)&&("arm64"===t||t===l(624))||"win32"===e&&t===l(624)}');
  const computerUseGuard = 'L===n(1124)&&("arm64"===C||"x64"===C)';
  if (!source.includes(computerUseGuard)) throw new Error('cannot locate Computer Use renderer platform guard');
  source = source.replace(computerUseGuard, '("linux"===L&&(C==="x64"||C==="arm64")||L===n(1124)&&("arm64"===C||"x64"===C))');
  const mcpCommand = 'command:i(991)';
  if (!source.includes(mcpCommand)) throw new Error('cannot locate Computer Use MCP command expression');
  source = source.replace(mcpCommand, 'command:window[i(791)]?.platform==="linux"?"kimi-cu":i(991)');
  if (source.includes('const Hk=t({__name:"Hk"')) throw new Error('Linux custom hotkey renderer patch already applied');

  // Custom hotkeys as a first-class Vue component using the bundle's
  // minified aliases (t=defineComponent, c=ref, d=onMounted, k=onUnmounted,
  // g=createVNode, y=createCommentVNode).  The render function returns a
  // single VNode; all DOM construction happens inside onMounted so the
  // panel is a proper child of the Vue-managed tree and is removed
  // deterministically when the Shortcuts pane unmounts.
  const hkComponent = String.raw`const Hk=t({__name:"Hk",setup(e){
  const api=window.clawBridgeAPI;
  if(!api||typeof api.getCustomHotkeys!=="function")return()=>y("",!0);
  const panelRef=c(null);
  let stopProgress=()=>{};
  let disposed=false;
  const setStatus=(message)=>{
    const node=panelRef.value?.querySelector("[data-kimi-hotkey-status]");
    if(node)node.textContent=message||"";
  };
  const button=(label,className,handler)=>{
    const node=document.createElement("button");
    node.type="button";
    node.className="settings-button settings-button--secondary kimi-hk-btn"+(className?" "+className:"");
    node.textContent=label;
    node.addEventListener("click",()=>Promise.resolve(handler(node)).catch((error)=>setStatus(error?.message||String(error))));
    return node;
  };
  const record=async(target,node)=>{
    node.setAttribute("data-recording","1");
    node.textContent="Press a key…";
    setStatus("Recording a shortcut. Press the complete chord, or wait for timeout.");
    const result=await api.recordCustomHotkey(target);
    node.removeAttribute("data-recording");
    if(!result||!result.ok){
      node.textContent=target.kind==="binding"?(target.shortcut?"Change":"Assign"):(target.shortcut?"Change":"Assign");
      setStatus(result?.message||result?.reason||"Shortcut recording failed");
      return;
    }
    setStatus("Shortcut saved: "+(result.shortcut||""));
    await load();
  };
  const renderPanel=(data)=>{
    if(disposed)return;
    const panel=panelRef.value;
    if(!panel)return;
    panel.innerHTML="";
    panel.className="settings-section";
    const title=document.createElement("div");
    title.className="settings-section__label";
    title.textContent="Custom hotkeys";
    panel.appendChild(title);
    const card=document.createElement("div");
    card.className="settings-section__card settings-section__card--allow-overflow";
    panel.appendChild(card);
    const intro=document.createElement("p");
    intro.textContent="Assign one global shortcut to any Kimi action, or create a command that runs locally. Conflicts are rejected before saving.";
    card.appendChild(intro);
    const status=document.createElement("div");
    status.className="kimi-hk-status";
    status.setAttribute("data-kimi-hotkey-status","1");
    const inputStatus=data?.status?.inputStatus||"unknown";
    status.textContent=inputStatus==="running"?"Global keyboard reader ready":"Global keyboard reader: "+inputStatus;
    card.appendChild(status);
    const actionHeading=document.createElement("h3");
    actionHeading.textContent="Available Kimi actions";
    card.appendChild(actionHeading);
    for(const action of Array.isArray(data?.actions)?data.actions:[]){
      const row=document.createElement("div");
      row.className="settings-row kimi-hk-row";
      const copy=document.createElement("div");
      copy.className="settings-row__text kimi-hk-copy";
      const label=document.createElement("span");
      label.className="settings-row__label kimi-hk-label";
      label.textContent=action.label||action.id;
      copy.appendChild(label);
      const desc=document.createElement("span");
      desc.className="settings-row__desc kimi-hk-desc";
      desc.textContent=action.description||action.id;
      copy.appendChild(desc);
      if(action.controlsExistingLauncher){
        const note=document.createElement("span");
        note.className="settings-row__desc kimi-hk-desc";
        note.textContent="Controls the Kimi launcher shortcut";
        copy.appendChild(note);
      }
      row.appendChild(copy);
      const key=document.createElement("span");
      key.className="settings-row__value kimi-hk-key";
      key.textContent=action.enabled&&action.shortcut?action.shortcut:"Unassigned";
      row.appendChild(key);
      row.appendChild(button(action.enabled&&action.shortcut?"Change":"Assign","",(node)=>record({kind:"binding",id:action.id},node)));
      row.appendChild(button("Clear","kimi-hk-btn--danger",async()=>{
        const result=await api.setCustomHotkeyBinding({id:action.id,shortcut:"",enabled:false});
        if(!result?.ok)return setStatus(result?.message||"Unable to clear shortcut");
        await load();
      }));
      card.appendChild(row);
    }
    const commandHeading=document.createElement("h3");
    commandHeading.textContent="Custom commands";
    card.appendChild(commandHeading);
    const commands=Array.isArray(data?.commands)?data.commands:[];
    if(commands.length===0){
      const empty=document.createElement("p");
      empty.textContent="No custom commands yet.";
      card.appendChild(empty);
    }
    for(const command of commands){
      const row=document.createElement("div");
      row.className="settings-row kimi-hk-row";
      const copy=document.createElement("div");
      copy.className="settings-row__text kimi-hk-copy";
      const label=document.createElement("span");
      label.className="settings-row__label kimi-hk-label";
      label.textContent=command.name||command.id;
      copy.appendChild(label);
      const code=document.createElement("span");
      code.className="settings-row__desc kimi-hk-code";
      code.textContent=command.command||"";
      copy.appendChild(code);
      row.appendChild(copy);
      const key=document.createElement("span");
      key.className="settings-row__value kimi-hk-key";
      key.textContent=command.enabled&&command.shortcut?command.shortcut:"Unassigned";
      row.appendChild(key);
      row.appendChild(button(command.shortcut?"Change":"Assign","",(node)=>record({kind:"command",id:command.id},node)));
      row.appendChild(button("Clear","kimi-hk-btn--danger",async()=>{
        const result=await api.upsertCustomHotkeyCommand({id:command.id,name:command.name,command:command.command,cwd:command.cwd,shortcut:"",enabled:true});
        if(!result?.ok)return setStatus(result?.message||"Unable to clear shortcut");
        setStatus("Shortcut cleared");
        await load();
      }));
      row.appendChild(button("Run","",async()=>{
        const result=await api.runCustomHotkey(command.id);
        setStatus(result?.ok?"Command started":(result?.message||"Command failed"));
      }));
      row.appendChild(button("Edit","",()=>{
        form.elements.namedItem("id").value=command.id;
        form.elements.namedItem("name").value=command.name||"";
        form.elements.namedItem("command").value=command.command||"";
        form.elements.namedItem("cwd").value=command.cwd||"";
        form.scrollIntoView({block:"nearest"});
      }));
      row.appendChild(button("Delete","kimi-hk-btn--danger",async()=>{
        const result=await api.deleteCustomHotkeyCommand(command.id);
        if(!result?.ok)return setStatus(result?.message||"Unable to delete command");
        await load();
      }));
      card.appendChild(row);
    }
    const form=document.createElement("form");
    form.className="kimi-hk-form";
    form.innerHTML='<input type="hidden" name="id"><input name="name" required maxlength="160" placeholder="Command name"><input name="cwd" maxlength="4096" placeholder="Working directory (optional)"><textarea name="command" required maxlength="8192" placeholder="Shell command, for example: notify-send Kimi"></textarea><div class="kimi-hk-form-actions"><button class="settings-button settings-button--secondary" type="submit">Save command</button><button class="settings-button settings-button--secondary" type="button" data-kimi-hk-reset>New command</button></div>';
    form.addEventListener("submit",async(event)=>{
      event.preventDefault();
      const result=await api.upsertCustomHotkeyCommand({id:form.elements.namedItem("id").value||undefined,name:form.elements.namedItem("name").value,command:form.elements.namedItem("command").value,cwd:form.elements.namedItem("cwd").value,enabled:true});
      if(!result?.ok)return setStatus(result?.message||"Unable to save command");
      form.reset();
      setStatus("Command saved. Assign a shortcut from the list above.");
      await load();
    });
    form.querySelector("[data-kimi-hk-reset]").addEventListener("click",()=>form.reset());
    card.appendChild(form);
    const note=document.createElement("div");
    note.className="kimi-hk-note";
    note.textContent="Commands run as your user through /bin/sh with a bounded concurrency limit. Keep this list to trusted local commands.";
    card.appendChild(note);
  };
  const load=async()=>{
    try{renderPanel(await api.getCustomHotkeys());}
    catch(error){setStatus(error?.message||String(error));}
  };
  d(()=>{
    const styleId="kimi-custom-hotkeys-style";
    if(!document.getElementById(styleId)){
      const style=document.createElement("style");
      style.id=styleId;
      style.textContent=[
        "[data-kimi-custom-hotkeys]{display:flex;flex-direction:column;gap:8px;width:100%;max-width:100%;margin:0 0 24px;padding:0;background:transparent;border:0;font:inherit;color:inherit}",
        "",
        "[data-kimi-custom-hotkeys]>.settings-section__label{padding:0 8px;font-size:var(--ui-B2-font-size,14px);font-weight:400;line-height:var(--ui-B2-line-height,20px);color:var(--Labels-Secondary)}",
        "[data-kimi-custom-hotkeys]>.settings-section__card{display:flex;flex-direction:column;border-radius:16px;background:var(--Fills-F1);overflow:hidden}",
        "[data-kimi-custom-hotkeys]>.settings-section__card--allow-overflow{overflow:visible}",
        "[data-kimi-custom-hotkeys] h3{margin:18px 0 8px;padding:0 16px;font-size:14px;font-weight:400;color:var(--Labels-Secondary)}",
        "[data-kimi-custom-hotkeys] p{margin:0;padding:14px 16px 0;opacity:.7}",
        ".kimi-hk-row{display:flex;align-items:center;gap:8px;padding:14px 16px;border-top:.5px solid var(--Separators-S1)}",
        ".kimi-hk-copy{flex:1;min-width:0}.kimi-hk-label{font-weight:400}.kimi-hk-desc{display:block;opacity:.7;font-size:var(--ui-B2-font-size,14px)}",
        ".kimi-hk-key{min-width:0;padding:0;border:0;border-radius:0;background:transparent;color:var(--Labels-Tertiary);text-align:right;font:inherit}",
        "[data-kimi-custom-hotkeys] .settings-button{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;min-width:62px;padding:6px 10px;border:0;border-radius:10px;background:var(--Fills-F1);color:var(--Labels-Primary);font:inherit;font-size:var(--ui-B2-font-size,14px);font-weight:500;line-height:var(--ui-B2-line-height,20px);white-space:nowrap;cursor:pointer}",
        "[data-kimi-custom-hotkeys] .settings-button:hover{background:var(--Fills-F2)}",
        ".kimi-hk-btn--danger{color:var(--Colors-Red)!important}.kimi-hk-code{display:block;white-space:pre-wrap;word-break:break-word;opacity:.72;font:var(--ui-C1-font-size,12px) ui-monospace,monospace;margin-top:3px}",
        ".kimi-hk-form{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 16px 16px}.kimi-hk-form input,.kimi-hk-form textarea{box-sizing:border-box;width:100%;padding:7px 8px;border:1px solid var(--Separators-S1);border-radius:10px;background:transparent;color:inherit;font:inherit}.kimi-hk-form textarea{grid-column:1/-1;min-height:54px;resize:vertical}.kimi-hk-form .kimi-hk-form-actions{grid-column:1/-1;display:flex;gap:8px}.kimi-hk-status{min-height:18px;padding:0 16px;color:#e6b566}.kimi-hk-note{font-size:11px;opacity:.58;margin:0 16px 16px}",
      ].join("");
      document.head.appendChild(style);
    }
    load();
    stopProgress=typeof api.onCustomHotkeyRecordingProgress==="function"?api.onCustomHotkeyRecordingProgress((event)=>{
      if(event&&event.type==="candidate"){
        const nodes=panelRef.value?.querySelectorAll("[data-recording]");
        nodes?.forEach(n=>n.textContent=event.shortcut||"Press a key…");
      }
    }):()=>{};
  });
  k(()=>{disposed=true;stopProgress();if(panelRef.value)panelRef.value.innerHTML="";});
  return(n,e)=>g("section",{ref:panelRef,class:"settings-section","data-kimi-custom-hotkeys":"1"});
}});`;

  const mdWrapper = String.raw`const KimiShortcutsWithHotkeys=t({__name:"KimiShortcutsWithHotkeys",setup(e){return(n,e)=>{const l=n;return a(),s(z,null,[g(md),g(Hk)])}}});`;

  const shortcutsMarker = 'md=t({__name:n(855),setup(e){';
  if (!source.includes(shortcutsMarker)) throw new Error('cannot locate Shortcuts pane renderer boundary');
  const shortcutsIndex = source.indexOf(shortcutsMarker);

  // Find end of md component: it is followed by Bd=t({ or zd=t({
  const mdEndMarker1 = '}),Bd=t({';
  const mdEndMarker2 = '}),zd=t({';
  let mdEnd = source.indexOf(mdEndMarker1, shortcutsIndex);
  if (mdEnd < 0) mdEnd = source.indexOf(mdEndMarker2, shortcutsIndex);
  if (mdEnd < 0) throw new Error('cannot locate end of md component');
  mdEnd += 2; // include the `)` that closes t({...})

  // Insert Hk and the wrapper immediately after the md definition
  source = source.slice(0, mdEnd) + ';' + hkComponent + mdWrapper + 'const ' + source.slice(mdEnd + 1);

  // Replace shortcuts:md with shortcuts:KimiShortcutsWithHotkeys so the router uses our wrapper
  const shortcutsMapMarker = 'shortcuts:md';
  if (!source.includes(shortcutsMapMarker)) throw new Error('cannot locate shortcuts:md mapping');
  source = source.replace(shortcutsMapMarker, 'shortcuts:KimiShortcutsWithHotkeys');

  fs.writeFileSync(file, source, 'utf8');
  const settingsHtmlPath = path.join(appDir, 'out', 'renderer', 'work-settings.html');
  let settingsHtml = fs.readFileSync(settingsHtmlPath, 'utf8');
  const bootstrapMarker = 'id="kimi-custom-hotkeys-bootstrap"';
  const bootstrapStart = settingsHtml.indexOf('<script ' + bootstrapMarker);
  if (bootstrapStart >= 0) {
    const bootstrapEnd = settingsHtml.indexOf('</script>', bootstrapStart);
    if (bootstrapEnd < 0) throw new Error('cannot locate custom hotkey bootstrap footer');
    settingsHtml = settingsHtml.slice(0, bootstrapStart) + settingsHtml.slice(bootstrapEnd + '</script>'.length);
  }
  if (settingsHtml.includes(bootstrapMarker)) throw new Error('custom hotkey bootstrap was not removed');
  fs.writeFileSync(settingsHtmlPath, settingsHtml, 'utf8');
}

function writeExecutable(file, contents) {
  mkdir(path.dirname(file));
  fs.writeFileSync(file, contents, { encoding: 'utf8', mode: 0o755 });
  fs.chmodSync(file, 0o755);
}

function buildX11InputHelper(destination) {
  const source = path.join(PROJECT, 'native', 'kimi-x11-input.c');
  const compiler = findOnPath('cc') || findOnPath('gcc') || findOnPath('clang');
  const pkgConfig = findOnPath('pkg-config');
  if (!fs.existsSync(source) || !compiler || !pkgConfig) return { status: 'unavailable', reason: 'compiler-or-pkg-config-missing' };
  let flags;
  try {
    flags = execFileSync(pkgConfig, ['--cflags', '--libs', 'xtst', 'x11'], { encoding: 'utf8', timeout: 30_000 }).trim().split(/\s+/u).filter(Boolean);
  } catch (error) {
    return { status: 'unavailable', reason: `X11 development libraries unavailable: ${error instanceof Error ? error.message : String(error)}` };
  }
  try {
    run(compiler, ['-std=c11', '-O2', '-Wall', '-Wextra', '-Werror', source, ...flags, '-o', destination], { timeoutMs: 60_000 });
    fs.chmodSync(destination, 0o755);
    return { status: 'built', compiler: path.basename(compiler), flags };
  } catch (error) {
    try { fs.rmSync(destination, { force: true }); } catch { /* best effort */ }
    return { status: 'unavailable', reason: `X11 helper build failed: ${error instanceof Error ? error.message : String(error)}` };
  }
}

const KIMI_DAIMON = `#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
NODE=\${DAIMON_BUNDLE_NODE_BIN:-\${DAIMON_NODE_BIN:-\$ROOT/runtime/node}}
if [ "\${1:-}" = "--node" ] || [ "\${1:-}" = "--node-bin" ]; then
  [ "\$#" -ge 2 ] || { printf '%s\\n' 'Daimon bundle launcher expected a value after --node.' >&2; exit 64; }
  NODE=\$2; shift 2
elif [ "\${1:-}" != "" ] && printf '%s' "\${1:-}" | grep -q '^--node-bin='; then
  NODE=\${1#--node-bin=}; shift
elif [ "\${1:-}" != "" ] && printf '%s' "\${1:-}" | grep -q '^--node='; then
  NODE=\${1#--node=}; shift
fi
if [ "\${1:-}" != "" ] && [ -f "\${1:-}" ] && [ -x "\${1:-}" ] && [ "\${1:-}" != "\$ROOT/app/daimon/dist/src/runner/cli.js" ]; then
  NODE=\$1; shift
fi
[ -x "\$NODE" ] || { printf 'Daimon requires executable Node v${NODE_VERSION}: %s\\n' "\$NODE" >&2; exit 127; }
export DAIMON_BUNDLE_NODE_BIN="\$NODE"
export DAIMON_ADAPTER_PACKAGE_ROOT="\${DAIMON_ADAPTER_PACKAGE_ROOT:-\$ROOT/app/daimon}"
PYTHON_BUNDLED="\$ROOT/runtime/python/cpython-3.12/bin/python3.12"
export DAIMON_PYTHON_BASE_PATH="\${DAIMON_PYTHON_BASE_PATH:-\${PYTHON_BUNDLED}}"
export DAIMON_UV_PATH="\${DAIMON_UV_PATH:-\$(command -v uv || true)}"
export DAIMON_RUNTIME_BINARY_PATH="\$ROOT/bin/kimi-daimon"
export PATH="\$(dirname -- "\$NODE"):\${PATH:-}"
exec "\$NODE" "\$ROOT/app/daimon/dist/src/runner/cli.js" "\$@"
`;

const DAIMON = `#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
NODE=
case "\${1:-}" in
  --node|--node-bin|--node=*|--node-bin=*)
    case "\${1:-}" in --node|--node-bin) [ "\$#" -ge 2 ] || exit 64; NODE="\$2"; shift 2;; --node=*) NODE=\${1#--node=}; shift;; --node-bin=*) NODE=\${1#--node-bin=}; shift;; esac;;
esac
NODE=\${NODE:-\${DAIMON_BUNDLE_NODE_BIN:-\${DAIMON_NODE_BIN:-\$ROOT/runtime/node}}}
if [ "\${1:-}" != "" ] && [ -f "\${1:-}" ] && [ -x "\${1:-}" ]; then NODE=\$1; shift; fi
export DAIMON_BUNDLE_NODE_BIN="\$NODE"
command=\${1:-start}; [ "\$#" -gt 0 ] && shift || true
case "\$command" in
  prepare) exec "\$ROOT/bin/kimi-daimon" --node "\$NODE" setup --release "\$ROOT/release/manifest.json" --no-daemon --skip-webbridge --skip-system-tools "\$@";;
  start|serve) exec "\$ROOT/bin/kimi-daimon" --node "\$NODE" start --control "\$@";;
  control) exec "\$ROOT/bin/kimi-daimon" --node "\$NODE" control serve "\$@";;
  runtime) exec "\$ROOT/bin/kimi-daimon" --node "\$NODE" start --control "\$@";;
  cli) exec "\$ROOT/bin/kimi-daimon" --node "\$NODE" "\$@";;
  *) exec "\$ROOT/bin/kimi-daimon" --node "\$NODE" "\$command" "\$@";;
esac
`;

function installDaimon(stage, nodeBinary, pythonRoot) {
  const extracted = path.join(stage, 'daimon-source');
  mkdir(extracted);
  run('tar', ['-xzf', SOURCE_DAIMON, '-C', extracted], { timeoutMs: 180_000 });
  // The vendor layout (and the packaged provider's process.resourcesPath
  // resolver) uses a nested resources/resources directory.  Keeping Daimon
  // there is what makes app.isPackaged Linux launches resolve the same bundle
  // that the Windows artifact referenced.
  const root = path.join(stage, 'resources', 'resources', 'daimon-bundle');
  mkdir(root);
  copy(path.join(extracted, 'app', 'daimon'), path.join(root, 'app', 'daimon'));
  copy(path.join(extracted, 'release', 'manifest.json'), path.join(root, 'release', 'manifest.json'));
  const bundle = JSON.parse(fs.readFileSync(path.join(extracted, 'bundle.json'), 'utf8'));
  bundle.platform = 'linux-x64';
  bundle.entrypoints = { directStart: 'bin/daimon', cli: 'bin/kimi-daimon' };
  bundle.runtimes = {
    node: { version: `v${NODE_VERSION}`, bundled: true, path: 'runtime/node', launchArgument: '--node <path>', env: 'DAIMON_BUNDLE_NODE_BIN' },
    python: { target: '3.12', version: PYTHON_VERSION, dependencyMode: 'online_uv_sync', path: 'runtime/python/cpython-3.12' },
    uv: { bundled: false, path: 'runtime/uv/uv' },
    git: { bundled: false, path: 'system', shellPath: 'system', gitPath: 'system' },
  };
  if (bundle.dependencyBundling?.nodePty) bundle.dependencyBundling.nodePty.targetPlatform = 'linux-x64';
  fs.writeFileSync(path.join(root, 'bundle.json'), `${JSON.stringify(bundle, null, 2)}\n`);
  copy(path.join(extracted, 'README.md'), path.join(root, 'README.md'));
  // The Windows tarball contains the full first-party JavaScript tree but also
  // Windows-only native payloads. Remove those before adding Linux builds.
  removeWindowsArtifacts(path.join(root, 'app', 'daimon'));
  mkdir(path.join(root, 'runtime'));
  copy(nodeBinary, path.join(root, 'runtime', 'node'));
  fs.chmodSync(path.join(root, 'runtime', 'node'), 0o755);
  copy(pythonRoot, path.join(root, 'runtime', 'python', 'cpython-3.12'));
  removeWindowsArtifacts(path.join(root, 'runtime', 'python', 'cpython-3.12'));
  const pythonBinary = path.join(root, 'runtime', 'python', 'cpython-3.12', 'bin', 'python3.12');
  requireFile(pythonBinary, 'bundled Linux Python 3.12 runtime');
  fs.chmodSync(pythonBinary, 0o755);
  writeExecutable(path.join(root, 'bin', 'kimi-daimon'), KIMI_DAIMON);
  writeExecutable(path.join(root, 'bin', 'daimon'), DAIMON);

  // The bundle's better-sqlite3 source is retained, so rebuild against the
  // pinned Node 24 ABI instead of shipping the Windows v137 PE module.
  const env = npmEnvironment({ ...process.env, PATH: `${path.dirname(nodeBinary)}${path.delimiter}${process.env.PATH || ''}` });
  run('npm', ['rebuild', 'better-sqlite3', '--foreground-scripts'], { cwd: path.join(root, 'app', 'daimon'), env, timeoutMs: 600_000 });
  requireFile(path.join(root, 'app', 'daimon', 'node_modules', 'better-sqlite3', 'build', 'Release', 'better_sqlite3.node'), 'Linux better-sqlite3 build');

  const npmStage = fs.mkdtempSync(path.join(os.tmpdir(), 'kimi-node-pty-'));
  run('npm', ['--prefix', npmStage, 'install', '--no-save', 'node-pty@1.1.0'], { env, timeoutMs: 300_000 });
  const pty = path.join(npmStage, 'node_modules', 'node-pty', 'build', 'Release', 'pty.node');
  requireFile(pty, 'Linux node-pty build');
  copy(pty, path.join(root, 'app', 'daimon', 'node_modules', 'node-pty', 'build', 'Release', 'pty.node'));
  removeWindowsArtifacts(path.join(root, 'app', 'daimon', 'node_modules'));
  normalizeBinDirectory(path.join(root, 'app', 'daimon'));
  return root;
}

function installPlatformPackages(stage) {
  const gatewayRoot = path.join(stage, 'gateway-source');
  mkdir(gatewayRoot);
  run(ASAR, ['extract', SOURCE_GATEWAY, gatewayRoot], { timeoutMs: 300_000 });
  const npmStage = fs.mkdtempSync(path.join(os.tmpdir(), 'kimi-gateway-platform-'));
  const npmEnv = npmEnvironment();
  run('npm', ['--prefix', npmStage, 'init', '-y'], { timeoutMs: 60_000, stdio: 'ignore', env: npmEnv });
  run('npm', ['--prefix', npmStage, 'install', '--no-save', '--ignore-scripts', ...PLATFORM_PACKAGES], { timeoutMs: 300_000, env: npmEnv });
  const destination = path.join(stage, 'resources', 'resources', 'gateway.asar.unpacked', 'node_modules');
  mkdir(destination);
  // Keep all unpacked JS/native modules outside the archive. This mirrors the
  // vendor layout and avoids process.dlopen attempting to load from ASAR.
  const sourceModules = path.join(gatewayRoot, 'node_modules');
  removeWindowsArtifacts(sourceModules);
  copy(sourceModules, destination);
  const platformModules = path.join(npmStage, 'node_modules');
  for (const packageName of PLATFORM_PACKAGES.map((spec) => spec.slice(0, spec.lastIndexOf('@')))) {
    const source = path.join(platformModules, ...packageName.split('/'));
    if (fs.existsSync(source)) copy(source, path.join(destination, ...packageName.split('/')));
  }
  // Koffi ships several architectures in one package; retain only glibc
  // linux-x64 to keep the release deterministic and free of Windows payloads.
  const koffiBuild = path.join(destination, 'koffi', 'build', 'koffi');
  if (fs.existsSync(koffiBuild)) {
    for (const entry of fs.readdirSync(koffiBuild)) if (entry !== 'linux_x64') fs.rmSync(path.join(koffiBuild, entry), { recursive: true, force: true });
  }
  removeWindowsArtifacts(destination);
  normalizeBinDirectory(path.join(stage, 'resources', 'resources', 'gateway.asar.unpacked'));
  // The archive metadata is consumed by the gateway supervisor and must not
  // continue to advertise the source Windows build after native replacement.
  const buildInfoPath = path.join(gatewayRoot, 'build-info.json');
  if (fs.existsSync(buildInfoPath)) {
    const buildInfo = JSON.parse(fs.readFileSync(buildInfoPath, 'utf8'));
    buildInfo.platform = 'linux';
    buildInfo.arch = 'x64';
    buildInfo.port = 'kimi-work-linux-posix';
    fs.writeFileSync(buildInfoPath, `${JSON.stringify(buildInfo, null, 2)}\n`);
  }
  const stampPath = path.join(gatewayRoot, '.gateway-stamp');
  if (fs.existsSync(stampPath)) {
    const stamp = fs.readFileSync(stampPath, 'utf8').trim();
    fs.writeFileSync(stampPath, `${stamp.replace(/^win32-x64/u, 'linux-x64')}\n`);
  }
  const archiveSource = path.join(stage, 'gateway-archive-source');
  mkdir(archiveSource);
  copy(gatewayRoot, archiveSource);
  // Native packages are all unpacked; the archive still contains openclaw's
  // JavaScript and package metadata.
  const archivePath = path.join(stage, 'resources', 'resources', 'gateway.asar');
  run(ASAR, ['pack', archiveSource, archivePath, '--unpack-dir', 'node_modules'], { timeoutMs: 300_000 });
  // asar may materialize the archive's node_modules over the pre-created
  // unpacked tree; restore executable bits on its POSIX bin shims after pack.
  normalizeBinDirectory(path.join(stage, 'resources', 'resources', 'gateway.asar.unpacked'));
  const lockPath = fs.existsSync(path.join(npmStage, 'package-lock.json'))
    ? path.join(npmStage, 'package-lock.json')
    : path.join(npmStage, 'node_modules', '.package-lock.json');
  const receipt = {
    packageLockSha256: fs.existsSync(lockPath) ? sha256(lockPath) : null,
    packages: [...PLATFORM_PACKAGES],
  };
  fs.writeFileSync(path.join(stage, 'resources', 'resources', 'gateway-linux-port-meta.json'), `${JSON.stringify({ schemaVersion: 1, platform: 'linux-x64', archive: 'gateway.asar', unpackedNodeModules: 'gateway.asar.unpacked/node_modules', buildInfo: { platform: 'linux', arch: 'x64' }, packageReceipt: receipt }, null, 2)}\n`);
  return receipt;
}

function fetchNode(stage) {
  const archive = path.join(stage, `node-v${NODE_VERSION}-linux-x64.tar.xz`);
  run('curl', ['-fsSL', NODE_URL, '-o', archive], { timeoutMs: 300_000 });
  if (sha256(archive) !== NODE_SHA256) throw new Error(`Node ${NODE_VERSION} archive sha256 mismatch`);
  const extract = path.join(stage, 'node-runtime');
  mkdir(extract);
  run('tar', ['-xJf', archive, '-C', extract], { timeoutMs: 180_000 });
  const node = path.join(extract, `node-v${NODE_VERSION}-linux-x64`, 'bin', 'node');
  requireFile(node, 'downloaded Node runtime');
  return node;
}

function fetchPython(stage) {
  const uv = findOnPath('uv');
  if (!uv) throw new Error('uv is required to fetch the pinned Linux Python runtime');
  const installDir = path.join(stage, 'python-runtime-download');
  mkdir(installDir);
  run(uv, ['python', 'install', PYTHON_VERSION, '--install-dir', installDir, '--no-bin'], { timeoutMs: 300_000 });
  const candidates = fs.readdirSync(installDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith(`cpython-${PYTHON_VERSION}-linux-`))
    .map((entry) => path.join(installDir, entry.name));
  if (candidates.length !== 1) throw new Error(`expected one cpython-${PYTHON_VERSION} Linux runtime, found ${candidates.length}`);
  return candidates[0];
}

function fetchKimiSlides(stage) {
  const curl = findOnPath('curl');
  const unzip = findOnPath('unzip');
  if (!curl || !unzip) throw new Error('curl and unzip are required to fetch the pinned Linux kimi-slides runtime');
  const archive = path.join(stage, `kimi-slides-${KIMI_SLIDES_VERSION}-linux-x64.zip`);
  run(curl, ['-fsSL', KIMI_SLIDES_URL, '-o', archive], { timeoutMs: 300_000 });
  const archiveSha256 = sha256(archive);
  if (archiveSha256 !== KIMI_SLIDES_ZIP_SHA256) throw new Error(`kimi-slides archive sha256 mismatch: ${archiveSha256}`);
  const binary = path.join(stage, 'kimi-slides-linux-x64');
  const payload = execFileSync(unzip, ['-p', archive, 'kimi-slides'], { maxBuffer: 64 * 1024 * 1024, timeout: 60_000 });
  if (!Buffer.isBuffer(payload) || payload.length < 1_000_000) throw new Error('kimi-slides archive contained an unexpectedly small binary');
  fs.writeFileSync(binary, payload, { mode: 0o755 });
  fs.chmodSync(binary, 0o755);
  const binarySha256 = sha256(binary);
  return { version: KIMI_SLIDES_VERSION, release: KIMI_SLIDES_RELEASE, url: KIMI_SLIDES_URL, archiveSha256, binarySha256, binary };
}

function fetchKimiim(stage) {
  const curl = findOnPath('curl');
  if (!curl) throw new Error('curl is required to fetch the pinned Linux kimiim CLI');
  const binary = path.join(stage, 'kimiim-linux-x64');
  run(curl, ['-fsSL', '--proto', '=https', '--proto-redir', '=https', '--max-redirs', '5', KIMIIM_URL, '-o', binary], { timeoutMs: 300_000 });
  const header = fs.readFileSync(binary).subarray(0, 4);
  if (!header.equals(Buffer.from([0x7f, 0x45, 0x4c, 0x46]))) throw new Error('kimiim CDN payload is not a Linux ELF');
  const binarySha256 = sha256(binary);
  if (binarySha256 !== KIMIIM_SHA256) throw new Error(`kimiim Linux binary sha256 mismatch: ${binarySha256}`);
  fs.chmodSync(binary, 0o755);
  return { url: KIMIIM_URL, revision: KIMIIM_REVISION, binarySha256, binary };
}

function crxPublicKey(payload, headerLength) {
  const header = payload.subarray(12, 12 + headerLength);
  const candidates = [];
  for (let offset = 0; offset + 4 < header.length; offset += 1) {
    if (header[offset] !== 0x0a) continue;
    let length = 0;
    let shift = 0;
    let cursor = offset + 1;
    while (cursor < header.length && shift < 35) {
      const byte = header[cursor++];
      length |= (byte & 0x7f) << shift;
      if ((byte & 0x80) === 0) break;
      shift += 7;
    }
    if (length < 32 || cursor + length > header.length) continue;
    const candidate = header.subarray(cursor, cursor + length);
    // The signed-header public key is a DER SubjectPublicKeyInfo. Restrict the
    // match to the RSA OID prefix so a signature or opaque proof cannot become
    // an extension identity by accident.
    if (candidate.length >= 18 && candidate[0] === 0x30 && candidate[1] === 0x82 && candidate[4] === 0x30 && candidate[5] === 0x0d && candidate[6] === 0x06 && candidate[7] === 0x09 && candidate.subarray(8, 17).equals(Buffer.from([0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01]))) candidates.push(candidate);
  }
  const extensionId = (candidate) => {
    const digest = crypto.createHash('sha256').update(candidate).digest();
    let value = '';
    for (const byte of digest.subarray(0, 16)) value += String.fromCharCode(97 + (byte >> 4), 97 + (byte & 15));
    return value;
  };
  const matching = candidates.find((candidate) => extensionId(candidate) === WEBBRIDGE_EXTENSION_ID);
  if (matching) return matching.toString('base64');
  if (candidates.length > 0) return candidates[0].toString('base64');
  throw new Error('Kimi Browser Extension CRX public key is missing');
}

function unpackWebBridgeExtension(stage, destination) {
  const archive = path.join(stage, 'webbridge-extension.zip');
  const payload = fs.readFileSync(WEBBRIDGE_EXTENSION_SOURCE);
  const sourceHash = sha256(WEBBRIDGE_EXTENSION_SOURCE);
  if (sourceHash !== WEBBRIDGE_EXTENSION_SHA256) throw new Error(`Kimi Browser Extension sha256 mismatch: ${sourceHash}`);
  if (payload.subarray(0, 4).toString('ascii') !== 'Cr24' || payload.readUInt32LE(4) !== 3) throw new Error('Kimi Browser Extension is not a CRX3 payload');
  const headerLength = payload.readUInt32LE(8);
  const zipOffset = 12 + headerLength;
  if (zipOffset < 16 || zipOffset >= payload.length || payload.subarray(zipOffset, zipOffset + 2).toString('ascii') !== 'PK') throw new Error('Kimi Browser Extension CRX header is malformed');
  fs.writeFileSync(archive, payload.subarray(zipOffset));
  const unpacked = path.join(destination, 'unpacked');
  mkdir(unpacked);
  run('unzip', ['-q', archive, '-d', unpacked], { timeoutMs: 60_000 });
  requireFile(path.join(unpacked, 'manifest.json'), 'unpacked Kimi Browser Extension manifest');
  const manifest = JSON.parse(fs.readFileSync(path.join(unpacked, 'manifest.json'), 'utf8'));
  if (manifest.manifest_version !== 3 || manifest.version !== WEBBRIDGE_VERSION || manifest.name !== 'Kimi WebBridge') throw new Error('unexpected unpacked Kimi Browser Extension manifest');
  const publicKey = crxPublicKey(payload, headerLength);
  manifest.key = publicKey;
  fs.writeFileSync(path.join(unpacked, 'manifest.json'), `${JSON.stringify(manifest)}\n`, { encoding: 'utf8', mode: 0o644 });
  const identityKeySha256 = crypto.createHash('sha256').update(Buffer.from(publicKey, 'base64')).digest('hex');
  return { unpacked: 'resources/resources/webbridge-extension/unpacked', manifest: 'manifest.json', identityKeySha256 };
}

function copyElectron(stage) {
  requireFile(path.join(ELECTRON_ROOT, 'electron'), 'Electron runtime');
  const destination = path.join(stage);
  copy(ELECTRON_ROOT, destination);
  const version = fs.readFileSync(path.join(destination, 'version'), 'utf8').trim();
  if (version !== '43.6.0') throw new Error(`Electron 43.6.0 required, found ${version}`);
  mkdir(path.join(destination, 'resources'));
  return destination;
}

function build() {
  for (const file of [SOURCE_ARCHIVE, SOURCE_APP, SOURCE_GATEWAY, SOURCE_DAIMON, HOST_CONFIGURER, HOST_CHECKER, WEBBRIDGE_SKILL_ARCHIVE_SOURCE]) requireFile(file, 'source artifact');
  requireFile(ASAR, 'asar CLI');
  let previousOutput = null;
  if (fs.existsSync(OUTPUT)) {
    if (process.argv.includes('--force')) {
      // Keep the last known-good release addressable while the replacement is
      // built. A failed build restores it instead of leaving the user with no
      // runnable client; the temporary backup is removed only after the new
      // tree is atomically installed.
      previousOutput = `${OUTPUT}.backup-${process.pid}-${Date.now()}`;
      fs.renameSync(OUTPUT, previousOutput);
    }
    else throw new Error(`output exists: ${OUTPUT}; pass --force to replace it`);
  }
  const parent = path.dirname(OUTPUT);
  mkdir(parent);
  const stage = fs.mkdtempSync(path.join(parent, '.kimi-linux-stage-'));
  try {
    const electronStage = copyElectron(stage);
    const appDir = path.join(electronStage, 'resources', 'app');
    run(ASAR, ['extract', SOURCE_APP, appDir], { timeoutMs: 300_000 });
    const appPackage = JSON.parse(fs.readFileSync(path.join(appDir, 'package.json'), 'utf8'));
    patchNativeLoader(path.join(appDir, 'out', 'main', 'index.js'));
    patchLinuxPlatformSupport(path.join(appDir, 'out', 'main', 'index.js'));
    patchWatermarkFallback(path.join(appDir, 'out', 'main', 'index.js'));
    patchLinuxWebBridgeBrowserRoots(path.join(appDir, 'out', 'main', 'index.js'));
    patchLinuxWorkbenchSettings(path.join(appDir, 'out', 'main', 'index.js'));
    patchLinuxShortcutRecording(path.join(appDir, 'out', 'main', 'index.js'));
    patchLinuxTerminalHandler(path.join(appDir, 'out', 'main', 'index.js'));
    patchLinuxCustomHotkeys(path.join(appDir, 'out', 'main', 'index.js'));
    patchDreamGate(path.join(appDir, 'out', 'main', 'index.js'));
    patchLinuxPreloads(appDir);
    patchLinuxWorkbenchRenderer(appDir);
    // The ASAR itself contains the original PE native payloads and helper
    // prebuilds.  Remove every Windows artifact from the extracted app before
    // adding the audited Linux adapters; leaving these files in the release
    // would both violate the platform boundary and allow accidental fallback
    // to a PE module.
    removeWindowsArtifacts(appDir);
    const nativeDestination = path.join(appDir, 'out', 'native', 'linux-x64');
    mkdir(nativeDestination);
    for (const file of fs.readdirSync(path.join(PROJECT, 'native'))) copy(path.join(PROJECT, 'native', file), path.join(nativeDestination, file));
    const x11Helper = buildX11InputHelper(path.join(nativeDestination, 'kimi-x11-input'));
    const nativeAdapterNames = fs.readdirSync(nativeDestination).filter((name) => name.endsWith('.cjs')).sort();
    // Keep the target path used by development and packaged builds. Optional
    // Windows-only helpers are intentionally not copied; callers get a clear
    // unavailable status rather than executing a PE binary through Wine.
    const targetsDir = path.join(appDir, 'resources', 'targets', 'linux-x64');
    mkdir(targetsDir);
    const kimiSlides = fetchKimiSlides(stage);
    const kimiim = fetchKimiim(stage);
    copy(kimiSlides.binary, path.join(targetsDir, 'kimi-slides'));
    // Kimiim's first-run installer resolves its platform binary from the
    // packaged resources root and its three SKILL.md sources from the sibling
    // `skills/kimiim` tree. Keep both paths available in the packed release.
    const resourceRoot = path.join(electronStage, 'resources', 'resources');
    // Desktop-managed built-in skills are a separate injection channel from
    // the Daimon bundle. The macOS release carries these files beside the
    // bundle; keep the same channel on Linux so WebMCP and 3D annotation
    // workflows are not silently omitted by the platform port.
    const builtinSkillsSource = path.join(REPO, 'app-64', 'resources', 'resources', 'builtin-skills');
    const builtinSkillFiles = [
      'README.md',
      'kimi-webmcp/SKILL.md',
      'kimi-model-annotations/SKILL.md',
      'kimi-model-annotations/references/data-format.md',
    ];
    requireFile(builtinSkillsSource, 'desktop built-in skills source');
    copy(builtinSkillsSource, path.join(resourceRoot, 'builtin-skills'));
    removeWindowsArtifacts(path.join(resourceRoot, 'builtin-skills'));
    for (const relative of builtinSkillFiles) requireFile(path.join(resourceRoot, 'builtin-skills', relative), `built-in skill ${relative}`);
    requireFile(BUILD_CONFIG_SOURCE, 'desktop build configuration');
    requireFile(WEBBRIDGE_BUNDLE_VERSION_SOURCE, 'WebBridge bundle version marker');
    copy(BUILD_CONFIG_SOURCE, path.join(resourceRoot, 'build-config.json'));
    copy(WEBBRIDGE_BUNDLE_VERSION_SOURCE, path.join(resourceRoot, 'kimi-webbridge.bundle-version'));
    if (fs.readFileSync(path.join(resourceRoot, 'kimi-webbridge.bundle-version'), 'utf8').trim() !== `v${WEBBRIDGE_DAEMON_VERSION}`) throw new Error('WebBridge bundle version marker does not match the Linux daemon');
    copy(kimiim.binary, path.join(resourceRoot, 'kimiim'));
    // The vendor first-run installer still looks for the historical
    // `kimiim-cli` basename on every platform. Keep the audited Linux ELF at
    // both names so a fresh Linux profile receives the CLI instead of logging
    // a misleading "source file missing" warning.
    copy(kimiim.binary, path.join(resourceRoot, 'kimiim-cli'));
    copy(path.join(REPO, 'app-64', 'resources', 'resources', 'skills', 'kimiim'), path.join(resourceRoot, 'skills', 'kimiim'));
    removeWindowsArtifacts(path.join(resourceRoot, 'skills', 'kimiim'));
    requireFile(WEBBRIDGE_EXTENSION_SOURCE, 'pinned Kimi Browser Extension CRX');
    if (sha256(WEBBRIDGE_SKILL_ARCHIVE_SOURCE) !== WEBBRIDGE_SKILL_ARCHIVE_SHA256) throw new Error('Kimi WebBridge skill archive sha256 mismatch');
    copy(WEBBRIDGE_SKILL_ARCHIVE_SOURCE, path.join(resourceRoot, 'skills', 'kimi-webbridge-desktop.zip'));
    copy(WEBBRIDGE_EXTENSION_SOURCE, path.join(resourceRoot, 'webbridge-extension', `${WEBBRIDGE_EXTENSION_ID}.crx`));
    copy(path.join(PROJECT, 'native', 'kimi-webbridge'), path.join(resourceRoot, 'kimi-webbridge'));
    copy(path.join(PROJECT, 'native', 'kimi-webbridge-daemon.cjs'), path.join(resourceRoot, 'kimi-webbridge-daemon.cjs'));
    copy(path.join(PROJECT, 'native', 'kimi-cu'), path.join(resourceRoot, 'kimi-cu'));
    copy(path.join(PROJECT, 'native', 'kimi-cu.cjs'), path.join(resourceRoot, 'kimi-cu.cjs'));
    fs.chmodSync(path.join(resourceRoot, 'kimi-webbridge'), 0o755);
    fs.chmodSync(path.join(resourceRoot, 'kimi-cu'), 0o755);
    const webBridgeExtensionTree = unpackWebBridgeExtension(stage, path.join(resourceRoot, 'webbridge-extension'));
    // The packaged KimiSlides installer resolves the bundled binary from the
    // Electron resources root (process.resourcesPath/kimi-slides), not from
    // the development target tree under app.asar.  Keep one audited copy at
    // that exact POSIX path so startup release and version checks succeed.
    copy(kimiSlides.binary, path.join(electronStage, 'resources', 'resources', 'kimi-slides'));
    copy(HOST_CONFIGURER, path.join(electronStage, 'configure-linux-host.sh'));
    fs.chmodSync(path.join(electronStage, 'configure-linux-host.sh'), 0o755);
    copy(HOST_CHECKER, path.join(electronStage, 'check-linux-host.mjs'));
    fs.chmodSync(path.join(electronStage, 'check-linux-host.mjs'), 0o755);
    // An unpacked `resources/app` is treated as a development application by
    // Electron.  That forces the original provider into its development target
    // tree (`app/resources/targets/...`) and is exactly the path that failed in
    // the supplied run log.  Pack the patched app so Electron reports
    // `app.isPackaged=true`; the provider then resolves the bundled Linux
    // Daimon from `process.resourcesPath/resources/daimon-bundle`.  Keep native
    // CommonJS adapters and the X11 helper outside ASAR so require() and
    // process execution both use real POSIX filesystem paths.
    const appAsar = path.join(electronStage, 'resources', 'app.asar');
    run(ASAR, ['pack', appDir, appAsar, '--unpack-dir', 'out/native', '--unpack', 'resources/targets/**'], { timeoutMs: 300_000 });
    fs.rmSync(appDir, { recursive: true, force: true });
    const node = fetchNode(stage);
    // Gateway startup resolves its Node launcher from
    // `process.resourcesPath/runtime/node` (the vendor Windows tree shipped
    // this sibling runtime). Keep the same POSIX path in addition to the
    // Daimon-owned copy so the desktop supervisor can start OpenClaw.
    const gatewayRuntimeNode = path.join(electronStage, 'resources', 'resources', 'runtime', 'node');
    copy(node, gatewayRuntimeNode);
    fs.chmodSync(gatewayRuntimeNode, 0o755);
    const pythonRoot = fetchPython(stage);
    installDaimon(stage, node, pythonRoot);
    const platformPackages = installPlatformPackages(stage);
    const manifest = {
      schemaVersion: 1,
      product: 'kimi-work',
      version: appPackage.version,
      platform: 'linux-x64',
      electron: '43.6.0',
      node: `v${NODE_VERSION}`,
      python: `v${PYTHON_VERSION}`,
      kimiSlides: { version: kimiSlides.version, release: kimiSlides.release, url: kimiSlides.url, archiveSha256: kimiSlides.archiveSha256, binarySha256: kimiSlides.binarySha256 },
      kimiim: { url: kimiim.url, revision: kimiim.revision, binarySha256: kimiim.binarySha256, cliBinarySha256: sha256(path.join(resourceRoot, 'kimiim-cli')), skillsRoot: 'resources/resources/skills/kimiim' },
      builtinSkills: {
        root: 'resources/resources/builtin-skills',
        files: Object.fromEntries(builtinSkillFiles.map((relative) => [relative, sha256(path.join(resourceRoot, 'builtin-skills', relative))])),
      },
      buildConfigSha256: sha256(path.join(resourceRoot, 'build-config.json')),
      webBridge: {
        daemonVersion: WEBBRIDGE_DAEMON_VERSION,
        bundleVersion: fs.readFileSync(path.join(resourceRoot, 'kimi-webbridge.bundle-version'), 'utf8').trim(),
        daemonPath: 'resources/resources/kimi-webbridge',
        daemonSha256: sha256(path.join(resourceRoot, 'kimi-webbridge')),
        daemonSourceSha256: sha256(path.join(resourceRoot, 'kimi-webbridge-daemon.cjs')),
        extension: {
          id: WEBBRIDGE_EXTENSION_ID,
          version: WEBBRIDGE_VERSION,
          path: `resources/resources/webbridge-extension/${WEBBRIDGE_EXTENSION_ID}.crx`,
          sha256: sha256(path.join(resourceRoot, 'webbridge-extension', `${WEBBRIDGE_EXTENSION_ID}.crx`)),
          unpackedPath: webBridgeExtensionTree.unpacked,
          identityKeySha256: webBridgeExtensionTree.identityKeySha256,
        },
        skillArchiveSha256: WEBBRIDGE_SKILL_ARCHIVE_SHA256,
      },
      computerUse: {
        bridgePath: 'resources/resources/kimi-cu',
        bridgeSha256: sha256(path.join(resourceRoot, 'kimi-cu')),
        bridgeSourceSha256: sha256(path.join(resourceRoot, 'kimi-cu.cjs')),
        version: 'native-posix-1',
      },
      runtimeHashes: {
        node: sha256(path.join(electronStage, 'resources', 'resources', 'daimon-bundle', 'runtime', 'node')),
        gatewayNode: sha256(gatewayRuntimeNode),
        python: sha256(path.join(electronStage, 'resources', 'resources', 'daimon-bundle', 'runtime', 'python', 'cpython-3.12', 'bin', 'python3.12')),
      },
      sources: {
        archiveSha256: sha256(SOURCE_ARCHIVE),
        appAsarSha256: sha256(SOURCE_APP),
        gatewayAsarSha256: sha256(SOURCE_GATEWAY),
        daimonBundleSha256: sha256(SOURCE_DAIMON),
        webBridgeExtensionSha256: WEBBRIDGE_EXTENSION_SHA256,
      },
      builtArtifacts: { appAsarSha256: sha256(appAsar), gatewayAsarSha256: sha256(path.join(electronStage, 'resources', 'resources', 'gateway.asar')) },
      nativeAdapters: nativeAdapterNames,
      nativeHelpers: { 'kimi-x11-input': x11Helper },
      gatewayPlatformPackages: platformPackages,
      hostConfigurerSha256: sha256(path.join(electronStage, 'configure-linux-host.sh')),
      hostCheckerSha256: sha256(path.join(electronStage, 'check-linux-host.mjs')),
      generatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(path.join(electronStage, 'resources', 'linux-port-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
    writeExecutable(path.join(electronStage, 'kimi-work'), `#!/bin/sh
set -eu
ROOT=\$(CDPATH= cd -- "\$(dirname -- "\$0")" && pwd)
if [ ! -x "\$ROOT/electron" ]; then printf '%s\\n' 'Kimi Work Electron runtime is missing.' >&2; exit 127; fi
# Electron's stock binary sets process.defaultApp when it is invoked as a
# development runtime.  This release is already packed (resources/app.asar),
# so force the packaged mode that the original Daimon provider requires.
export ELECTRON_FORCE_IS_PACKAGED="\${ELECTRON_FORCE_IS_PACKAGED:-1}"
if [ "\${KIMI_ALLOW_NO_SANDBOX:-0}" != 1 ] && [ "\$(stat -c '%a' "\$ROOT/chrome-sandbox" 2>/dev/null || printf 0)" != 4755 ]; then
  printf '%s\\n' 'chrome-sandbox must be owned by root and mode 4755 (or set KIMI_ALLOW_NO_SANDBOX=1 for an explicitly sandboxless diagnostic run).' >&2
  exit 78
fi
# This Electron/Chromium build can abort the whole process when the host GPU
# sandbox is unavailable (the observed failure is "GPU process isn't usable").
# Prefer deterministic software rendering on Linux; operators can opt into
# hardware acceleration with KIMI_DISABLE_GPU=0 or an explicit GPU flag.
if [ "\${KIMI_DISABLE_GPU:-1}" = 1 ]; then
  _kimi_gpu_flag=0
  for _kimi_arg in "\$@"; do
    case "\$_kimi_arg" in
      --disable-gpu|--enable-gpu|--in-process-gpu|--use-gl=*) _kimi_gpu_flag=1;;
    esac
  done
  if [ "\$_kimi_gpu_flag" = 0 ]; then set -- --disable-gpu "\$@"; fi
fi
# Prefer the active Wayland socket when one is available.  The generic
# Electron binary otherwise defaults to X11 even in a Wayland session, which
# fails for launchers without an Xauthority-backed DISPLAY.  An explicit
# --ozone-platform argument always wins.
_kimi_ozone_flag=0
for _kimi_arg in "\$@"; do
  case "\$_kimi_arg" in --ozone-platform=*|--ozone-platform) _kimi_ozone_flag=1;; esac
done
_kimi_runtime_dir="\${XDG_RUNTIME_DIR:-/run/user/\$(id -u)}"
if [ "\$_kimi_ozone_flag" = 0 ] && [ -n "\${WAYLAND_DISPLAY:-}" ] && [ -S "\$_kimi_runtime_dir/\${WAYLAND_DISPLAY}" ]; then
  set -- --ozone-platform=wayland "\$@"
fi
# The generic Electron runtime resolves its application root relative to the
# current working directory.  A launcher invoked from linux-port (or a
# desktop-file manager) otherwise starts the archive as a development app,
# making app.isPackaged=false and sending the Daimon resolver into the missing
# app.asar/resources/targets tree.  Anchor the process to the release root so
# every launch path selects resources/app.asar and the sibling POSIX runtime.
cd "\$ROOT"
exec "\$ROOT/electron" "\$@"
`);
    // Do not leak build inputs (the original Windows tarball, downloaded Node
    // archive, or temporary ASAR trees) into the release directory.
    for (const transient of ['daimon-source', 'gateway-source', 'gateway-archive-source', 'node-runtime', 'python-runtime-download', 'webbridge-extension.zip', `kimi-slides-${KIMI_SLIDES_VERSION}-linux-x64.zip`, 'kimi-slides-linux-x64', 'kimiim-linux-x64']) {
      fs.rmSync(path.join(electronStage, transient), { recursive: true, force: true });
    }
    for (const entry of fs.readdirSync(electronStage)) {
      if (entry.startsWith('node-v') && entry.endsWith('.tar.xz')) fs.rmSync(path.join(electronStage, entry), { force: true });
    }
    normalizeReleasePermissions(electronStage);
    fs.renameSync(stage, OUTPUT);
    if (previousOutput) {
      try { fs.rmSync(previousOutput, { recursive: true, force: true }); } catch (cleanupError) {
        console.warn(`old release backup cleanup deferred: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`);
      }
      previousOutput = null;
    }
    console.log(JSON.stringify({ ok: true, output: OUTPUT, manifest }));
  } catch (error) {
    try { fs.rmSync(stage, { recursive: true, force: true }); } catch { /* preserve original error */ }
    if (previousOutput && !fs.existsSync(OUTPUT)) {
      try { fs.renameSync(previousOutput, OUTPUT); } catch (restoreError) {
        console.error(`failed to restore previous release ${previousOutput}: ${restoreError instanceof Error ? restoreError.message : String(restoreError)}`);
      }
    }
    throw error;
  }
}

build();
