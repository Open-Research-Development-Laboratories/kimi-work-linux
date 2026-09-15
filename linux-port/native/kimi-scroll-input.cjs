'use strict';

const path = require('node:path');
const { commandPath, hasCommand, run } = require('./linux-common.cjs');

function x11Helper() {
  const configured = String(process.env.KIMI_X11_INPUT_HELPER || '').trim();
  const candidate = configured || path.join(__dirname, 'kimi-x11-input');
  return commandPath(candidate);
}

function backend() {
  // Both bundled XTest and xdotool require an authenticated X11/XWayland
  // display. Do not advertise them from a pure Wayland session where every
  // operation would fail.
  if (process.env.DISPLAY) {
    if (x11Helper()) return 'x11-helper';
    if (hasCommand('xdotool')) return 'xdotool';
  }
  // ydotool needs a configured uinput daemon and its wheel mapping varies by
  // distribution. An administrator may opt in after configuring that daemon;
  // it is never claimed as a default backend with unknown semantics.
  if (process.env.KIMI_ENABLE_YDOTOOL === '1' && hasCommand('ydotool')) return 'ydotool';
  return null;
}

function isScrollInputAvailable() {
  return backend() !== null;
}

function movePointer({ x, y } = {}) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
  const selected = backend();
  if (selected === 'x11-helper') return run(x11Helper(), ['move', String(Math.round(x)), String(Math.round(y))], { timeoutMs: 2_000 }).ok;
  if (selected === 'xdotool') return run('xdotool', ['mousemove', '--sync', String(Math.round(x)), String(Math.round(y))], { timeoutMs: 2_000 }).ok;
  if (selected === 'ydotool') return run('ydotool', ['mousemove', '--absolute', String(Math.round(x)), String(Math.round(y))], { timeoutMs: 2_000 }).ok;
  return false;
}

function postScrollWheel({ x, y, lines } = {}) {
  const amount = Number.isFinite(lines) ? Math.max(-12, Math.min(12, Math.trunc(lines))) : 0;
  if (!amount) return true;
  const selected = backend();
  if (selected === 'x11-helper') {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    return run(x11Helper(), ['scroll', String(Math.round(x)), String(Math.round(y)), String(amount)], { timeoutMs: 2_000 }).ok;
  }
  if (selected === 'xdotool') {
    if (Number.isFinite(x) && Number.isFinite(y)) movePointer({ x, y });
    const button = amount < 0 ? 5 : 4;
    return run('xdotool', ['click', '--repeat', String(Math.abs(amount)), '--delay', '10', String(button)], { timeoutMs: 2_000 }).ok;
  }
  // ydotool's button codes are compositor/configuration dependent. Avoid
  // sending an incorrectly scaled event when no known mapping is available.
  return false;
}

// The Windows implementation exposes this companion operation to restore a
// temporary scroll overlay. Linux has no overlay window to restore; keep the
// method in the ABI and report an explicit no-op rather than throwing when a
// shared caller probes it.
function restoreScrollOverlay() { return false; }

module.exports = { isScrollInputAvailable, movePointer, postScrollWheel, restoreScrollOverlay };
