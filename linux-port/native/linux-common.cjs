'use strict';

/*
 * Small, dependency-free POSIX helpers shared by the Linux adapters.  The
 * desktop bundle is an Electron application, but keeping these helpers free
 * of Electron imports makes the adapters unit-testable with plain Node too.
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

let electron = null;
try {
  // Electron is available when these modules are loaded by the Kimi main
  // process.  Plain Node tests intentionally exercise the fallback paths.
  electron = require('electron');
} catch {
  electron = null;
}

let desktopCapturer = null;
try {
  // Electron's portal-backed desktopCapturer is the preferred Wayland path.
  // It is loaded lazily here so plain Node tests and CLI utilities do not
  // require an Electron runtime.
  desktopCapturer = require('electron').desktopCapturer ?? null;
} catch {
  desktopCapturer = null;
}

const MAX_CAPTURE_BYTES = 64 * 1024 * 1024;
const MAX_BITMAP_PIXELS = 268_000_000;
const MAX_BITMAP_DIMENSION = 16_384;
const ELECTRON_CAPTURE_TIMEOUT_MS = 15_000;

function commandPath(command) {
  if (typeof command !== 'string' || command.length === 0) return null;
  if (path.isAbsolute(command)) {
    try {
      const stat = fs.statSync(command);
      if (stat.isFile()) {
        fs.accessSync(command, fs.constants.X_OK);
        return command;
      }
    } catch {
      return null;
    }
  }
  for (const dir of String(process.env.PATH || '').split(path.delimiter)) {
    if (!dir) continue;
    const candidate = path.join(dir, command);
    try {
      const stat = fs.statSync(candidate);
      if (stat.isFile()) {
        fs.accessSync(candidate, fs.constants.X_OK);
        return candidate;
      }
    } catch {
      // Keep searching all PATH entries.
    }
  }
  return null;
}

function hasCommand(command) {
  return commandPath(command) !== null;
}

function run(command, args = [], options = {}) {
  const executable = commandPath(command);
  if (!executable) return { ok: false, code: 'ENOENT', stdout: Buffer.alloc(0), stderr: Buffer.alloc(0) };
  const timeoutMs = Number.isSafeInteger(options.timeoutMs) && options.timeoutMs > 0 ? options.timeoutMs : 10_000;
  const maxBuffer = Number.isSafeInteger(options.maxBuffer) && options.maxBuffer > 0 ? options.maxBuffer : MAX_CAPTURE_BYTES;
  const result = spawnSync(executable, Array.isArray(args) ? args : [], {
    input: options.input,
    encoding: 'buffer',
    timeout: timeoutMs,
    maxBuffer,
    cwd: options.cwd,
    env: options.env,
    windowsHide: false,
  });
  const stdout = Buffer.isBuffer(result.stdout) ? result.stdout : Buffer.from(result.stdout || '');
  const stderr = Buffer.isBuffer(result.stderr) ? result.stderr : Buffer.from(result.stderr || '');
  if (result.error) return { ok: false, code: result.error.code || 'SPAWN_ERROR', error: result.error, stdout, stderr };
  return { ok: result.status === 0, code: result.status === 0 ? null : `EXIT_${result.status}`, stdout, stderr };
}

function pngDimensions(png) {
  if (!Buffer.isBuffer(png) || png.length < 24) return null;
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (!png.subarray(0, 8).equals(signature) || png.toString('ascii', 12, 16) !== 'IHDR') return null;
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  if (!width || !height || width > MAX_BITMAP_DIMENSION || height > MAX_BITMAP_DIMENSION || width * height > MAX_BITMAP_PIXELS) return null;
  return { width, height };
}

function bitmapFromPng(png) {
  const dimensions = pngDimensions(png);
  if (!dimensions) throw new Error('invalid PNG screenshot');

  // Electron's nativeImage decoder is present in the desktop process and
  // returns the BGRA bitmap format expected by the existing capture pipeline.
  if (electron?.nativeImage?.createFromBuffer) {
    const image = electron.nativeImage.createFromBuffer(png);
    if (image.isEmpty()) throw new Error('Electron rejected screenshot PNG');
    const size = image.getSize();
    const data = image.toBitmap();
    if (data.length !== size.width * size.height * 4) throw new Error('unexpected Electron bitmap length');
    return { width: size.width, height: size.height, data: new Uint8Array(data) };
  }

  // Plain Node fallback for tests and diagnostic tools.  ImageMagick is not a
  // runtime dependency of the application; it is used only when Electron is
  // intentionally absent.
  const converted = run('convert', ['png:-', 'rgba:-'], { input: png, timeoutMs: 10_000 });
  if (!converted.ok || converted.stdout.length !== dimensions.width * dimensions.height * 4) {
    throw new Error('no PNG decoder available (Electron nativeImage or ImageMagick convert required)');
  }
  return { width: dimensions.width, height: dimensions.height, data: new Uint8Array(converted.stdout) };
}

function captureScreenWithCommand(options = {}) {
  const x = Number.isFinite(options.x) ? Math.trunc(options.x) : 0;
  const y = Number.isFinite(options.y) ? Math.trunc(options.y) : 0;
  const width = Number.isFinite(options.width) ? Math.min(MAX_BITMAP_DIMENSION, Math.max(0, Math.trunc(options.width))) : 0;
  const height = Number.isFinite(options.height) ? Math.min(MAX_BITMAP_DIMENSION, Math.max(0, Math.trunc(options.height))) : 0;
  const hasRegion = width > 0 && height > 0;
  const geometry = `${x},${y} ${width}x${height}`;
  const attempts = [];
  // grim is the native Wayland screenshot portal and supports writing PNG to
  // stdout, avoiding temporary files and shell interpolation.  Some compositors
  // expose grim but reject the protocol; keep trying the X11 backends then.
  if (hasCommand('grim')) attempts.push({ capture: () => run('grim', hasRegion ? ['-g', geometry, '-'] : ['-'], { timeoutMs: 15_000 }), crop: false });
  if (hasCommand('gnome-screenshot')) attempts.push({ capture: () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kimi-screen-'));
    const output = path.join(tempDir, 'capture.png');
    try {
      // `gnome-screenshot -a` opens an interactive selection UI and cannot
      // represent the caller's coordinates. Capture the full desktop and crop
      // the decoded bitmap below instead.
      const result = run('gnome-screenshot', ['-f', output], { timeoutMs: 15_000 });
      if (result.ok) result.stdout = fs.readFileSync(output);
      return result;
    } finally {
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch { /* best effort */ }
    }
  }, crop: hasRegion });
  if (hasCommand('import')) attempts.push({ capture: () => run('import', hasRegion ? ['-window', 'root', '-crop', `${width}x${height}+${x}+${y}`, 'png:-'] : ['-window', 'root', 'png:-'], { timeoutMs: 15_000 }), crop: false });
  if (hasCommand('scrot')) attempts.push({ capture: () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kimi-screen-'));
    const output = path.join(tempDir, 'capture.png');
    try {
      const result = run('scrot', hasRegion ? ['-a', `${x},${y},${width},${height}`, output] : [output], { timeoutMs: 15_000 });
      if (result.ok) result.stdout = fs.readFileSync(output);
      return result;
    } finally {
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch { /* best effort */ }
    }
  }, crop: false });
  if (attempts.length === 0) throw new Error('no Linux screenshot backend found (grim, gnome-screenshot, ImageMagick import, or scrot)');
  let lastDetail = '';
  for (const attempt of attempts) {
    let result;
    try {
      result = attempt.capture();
    } catch (error) {
      lastDetail = error instanceof Error ? error.message : String(error);
      continue;
    }
    if (result?.ok && result.stdout?.length && result.stdout.length <= MAX_CAPTURE_BYTES) {
      try {
        const bitmap = bitmapFromPng(result.stdout);
        return attempt.crop ? cropBitmap(bitmap, x, y, width, height) : bitmap;
      } catch (error) { lastDetail = error instanceof Error ? error.message : String(error); }
    } else if (result?.stderr?.length) {
      lastDetail = result.stderr.toString('utf8').trim().slice(0, 256);
    }
  }
  throw new Error(`screen capture failed${lastDetail ? `: ${lastDetail}` : ''}`);
}

function hasCaptureBackend() {
  return Boolean(desktopCapturer?.getSources) || hasCommand('grim') || hasCommand('gnome-screenshot') || hasCommand('import') || hasCommand('scrot');
}

function cropBitmap(bitmap, x, y, width, height) {
  if (!bitmap || !Number.isSafeInteger(bitmap.width) || !Number.isSafeInteger(bitmap.height) || bitmap.width <= 0 || bitmap.height <= 0 || bitmap.width > MAX_BITMAP_DIMENSION || bitmap.height > MAX_BITMAP_DIMENSION || bitmap.width * bitmap.height > MAX_BITMAP_PIXELS || !bitmap.data || typeof bitmap.data.byteLength !== 'number') throw new Error('invalid desktop capture bitmap');
  const sourceWidth = bitmap.width;
  const sourceHeight = bitmap.height;
  if (bitmap.data.byteLength !== sourceWidth * sourceHeight * 4 || !Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) throw new Error('invalid desktop capture bitmap');
  const left = Math.max(0, Math.min(sourceWidth - 1, Math.trunc(x)));
  const top = Math.max(0, Math.min(sourceHeight - 1, Math.trunc(y)));
  const right = Math.max(left + 1, Math.min(sourceWidth, left + Math.max(1, Math.trunc(width))));
  const bottom = Math.max(top + 1, Math.min(sourceHeight, top + Math.max(1, Math.trunc(height))));
  const outWidth = right - left;
  const outHeight = bottom - top;
  const data = new Uint8Array(outWidth * outHeight * 4);
  for (let row = 0; row < outHeight; row++) {
    const sourceStart = ((top + row) * sourceWidth + left) * 4;
    data.set(bitmap.data.subarray(sourceStart, sourceStart + outWidth * 4), row * outWidth * 4);
  }
  return { width: outWidth, height: outHeight, data };
}

async function captureScreenWithElectron(options = {}) {
  if (!desktopCapturer?.getSources || !electron?.nativeImage?.createFromBuffer) {
    throw new Error('Electron desktop capture API unavailable');
  }
  const displayId = options.displayId == null ? null : String(options.displayId);
  let displayWidth = Number.isFinite(options.displayWidth) ? Math.trunc(options.displayWidth) : 0;
  let displayHeight = Number.isFinite(options.displayHeight) ? Math.trunc(options.displayHeight) : 0;
  if (displayWidth <= 0 || displayHeight <= 0) {
    try {
      const primary = electron?.screen?.getPrimaryDisplay?.();
      const scale = Number.isFinite(primary?.scaleFactor) && primary.scaleFactor > 0 ? primary.scaleFactor : 1;
      displayWidth = displayWidth > 0 ? displayWidth : Math.trunc((primary?.size?.width || primary?.bounds?.width || 0) * scale);
      displayHeight = displayHeight > 0 ? displayHeight : Math.trunc((primary?.size?.height || primary?.bounds?.height || 0) * scale);
    } catch { /* use conservative defaults below */ }
  }
  displayWidth = Math.min(MAX_BITMAP_DIMENSION, Math.max(1, displayWidth || 3840));
  displayHeight = Math.min(MAX_BITMAP_DIMENSION, Math.max(1, displayHeight || 2160));
  let captureTimer;
  const sourcePromise = desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width: Math.min(displayWidth, MAX_BITMAP_DIMENSION), height: Math.min(displayHeight, MAX_BITMAP_DIMENSION) },
    fetchWindowIcons: false,
  });
  const sources = await Promise.race([
    sourcePromise,
    new Promise((_, reject) => {
      captureTimer = setTimeout(() => reject(new Error(`Electron desktop capture timed out after ${ELECTRON_CAPTURE_TIMEOUT_MS}ms`)), ELECTRON_CAPTURE_TIMEOUT_MS);
      captureTimer.unref?.();
    }),
  ]).finally(() => clearTimeout(captureTimer));
  const source = (displayId && sources.find((candidate) => String(candidate.display_id) === displayId)) || sources[0];
  if (!source?.thumbnail || source.thumbnail.isEmpty()) throw new Error(`no desktop capture source${displayId ? ` for display ${displayId}` : ''}`);
  const image = source.thumbnail;
  const size = image.getSize();
  const raw = image.toBitmap();
  if (!size?.width || !size?.height || raw.length !== size.width * size.height * 4) throw new Error('desktop capture returned an invalid bitmap');
  const requestedX = Number.isFinite(options.x) ? Math.trunc(options.x) : 0;
  const requestedY = Number.isFinite(options.y) ? Math.trunc(options.y) : 0;
  const requestedWidth = Number.isFinite(options.width) ? Math.trunc(options.width) : size.width;
  const requestedHeight = Number.isFinite(options.height) ? Math.trunc(options.height) : size.height;
  // Chromium may return a thumbnail smaller than the requested display. Scale
  // the crop into the returned bitmap rather than returning an out-of-bounds
  // region or silently exposing pixels from a neighbouring display.
  const scaleX = size.width / displayWidth;
  const scaleY = size.height / displayHeight;
  return cropBitmap({ width: size.width, height: size.height, data: new Uint8Array(raw) }, requestedX * scaleX, requestedY * scaleY, requestedWidth * scaleX, requestedHeight * scaleY);
}

async function captureScreen(options = {}) {
  let commandError = null;
  try {
    return captureScreenWithCommand(options);
  } catch (error) {
    commandError = error;
  }
  try {
    return await captureScreenWithElectron(options);
  } catch (electronError) {
    const commandMessage = commandError instanceof Error ? commandError.message : '';
    const electronMessage = electronError instanceof Error ? electronError.message : String(electronError);
    throw new Error(`screen capture failed${commandMessage ? ` (${commandMessage})` : ''}: ${electronMessage}`);
  }
}

function clipboardText() {
  if (electron?.clipboard?.readText) {
    try { return electron.clipboard.readText(); } catch { /* fall through */ }
  }
  for (const command of ['wl-paste', 'xclip', 'xsel']) {
    if (!hasCommand(command)) continue;
    const args = command === 'xclip' ? ['-selection', 'clipboard', '-o'] : command === 'xsel' ? ['--clipboard', '--output'] : [];
    const result = run(command, args, { timeoutMs: 2_000, maxBuffer: 2 * 1024 * 1024 });
    if (result.ok) return result.stdout.toString('utf8');
  }
  return '';
}

function parseFileList(text, limit = 20) {
  if (typeof text !== 'string') return [];
  const maxItems = Number.isFinite(limit) ? Math.max(0, Math.min(20, Math.trunc(limit))) : 20;
  if (maxItems === 0) return [];
  const paths = [];
  for (const raw of text.replaceAll('\r', '').split('\n')) {
    const trimmed = raw.trim();
    const value = trimmed.startsWith('file://') ? (() => { try { const uri = new URL(trimmed); return uri.protocol === 'file:' && (!uri.hostname || uri.hostname === 'localhost') ? decodeURIComponent(uri.pathname) : ''; } catch { return ''; } })() : trimmed;
    if (!value || !path.isAbsolute(value) || paths.includes(value) || paths.length >= maxItems) continue;
    try {
      const stat = fs.statSync(value);
      if (stat.isFile() || stat.isDirectory()) paths.push(value);
    } catch {
      // Clipboard text is untrusted; ignore non-existent paths.
    }
  }
  return paths;
}

function foregroundFileManager() {
  let pid = null;
  let title = '';
  if (hasCommand('xdotool')) {
    const active = run('xdotool', ['getactivewindow'], { timeoutMs: 1_000 });
    if (active.ok) {
      const rawPid = run('xdotool', ['getwindowpid', active.stdout.toString('utf8').trim()], { timeoutMs: 1_000 });
      pid = Number.parseInt(rawPid.stdout.toString('utf8').trim(), 10);
      const rawTitle = run('xdotool', ['getwindowname', active.stdout.toString('utf8').trim()], { timeoutMs: 1_000 });
      title = rawTitle.stdout.toString('utf8').trim();
    }
  }
  // XWayland/X11 environments often do not ship xdotool.  xprop is part of
  // the small, widely available X11 utilities set and exposes the same
  // EWMH active-window/PID metadata without shell interpolation.
  if ((!Number.isInteger(pid) || pid <= 0) && hasCommand('xprop')) {
    const active = run('xprop', ['-root', '_NET_ACTIVE_WINDOW'], { timeoutMs: 1_000 });
    const activeId = active.ok ? /#\s*(0x[0-9a-f]+|[0-9]+)/iu.exec(active.stdout.toString('utf8'))?.[1] : null;
    if (activeId) {
      const properties = run('xprop', ['-id', activeId, '_NET_WM_PID', 'WM_NAME'], { timeoutMs: 1_000 });
      if (properties.ok) {
        const text = properties.stdout.toString('utf8');
        pid = Number.parseInt(/_NET_WM_PID\([^)]*\)\s*=\s*(\d+)/u.exec(text)?.[1] || '', 10);
        const titleMatch = /WM_NAME\([^)]*\)\s*=\s*(?:"((?:\\.|[^"\\])*)"|(.+))/u.exec(text);
        title = titleMatch?.[1] ?? titleMatch?.[2] ?? '';
        if (titleMatch?.[1]) {
          try { title = JSON.parse(`"${titleMatch[1]}"`); } catch { /* retain raw title */ }
        }
      }
    }
  }
  if (!Number.isInteger(pid) || pid <= 0) return null;
  let executable = '';
  try { executable = fs.realpathSync(`/proc/${pid}/exe`); } catch { return null; }
  const name = path.basename(executable).toLowerCase();
  const known = new Set(['nautilus', 'nemo', 'dolphin', 'thunar', 'pcmanfm', 'pcmanfm-qt', 'caja', 'konqueror', 'spacefm', 'marlin']);
  if (!known.has(name)) return null;
  return { pid, executable, title, needsKeylessPresent: false, readDeadlineMs: 500 };
}

module.exports = {
  bitmapFromPng,
  captureScreen,
  clipboardText,
  commandPath,
  cropBitmap,
  foregroundFileManager,
  hasCaptureBackend,
  hasCommand,
  parseFileList,
  run,
};
