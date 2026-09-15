'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { globalShortcut } = (() => {
  try { return require('electron'); } catch { return {}; }
})();

const EVDEV_EVENT_SIZE = 24;
const EV_KEY = 0x01;
const KEY_RELEASE = 0;
const KEY_PRESS = 1;

const MODIFIERS = new Map([
  [29, 'Ctrl'], [97, 'Ctrl'],
  [56, 'Alt'], [100, 'Alt'],
  [42, 'Shift'], [54, 'Shift'],
  [125, 'Super'], [126, 'Super'],
]);

const KEY_NAMES = new Map([
  [1, 'Escape'], [2, '1'], [3, '2'], [4, '3'], [5, '4'], [6, '5'], [7, '6'], [8, '7'], [9, '8'], [10, '9'], [11, '0'],
  [12, 'Minus'], [13, 'Equal'], [14, 'Backspace'], [15, 'Tab'],
  [16, 'Q'], [17, 'W'], [18, 'E'], [19, 'R'], [20, 'T'], [21, 'Y'], [22, 'U'], [23, 'I'], [24, 'O'], [25, 'P'],
  [26, 'LeftBracket'], [27, 'RightBracket'], [28, 'Enter'],
  [29, 'ControlLeft'], [42, 'ShiftLeft'], [54, 'ShiftRight'], [56, 'AltLeft'],
  [30, 'A'], [31, 'S'], [32, 'D'], [33, 'F'], [34, 'G'], [35, 'H'], [36, 'J'], [37, 'K'], [38, 'L'],
  [39, 'Semicolon'], [40, 'Quote'], [41, 'BackQuote'], [43, 'Backslash'],
  [44, 'Z'], [45, 'X'], [46, 'C'], [47, 'V'], [48, 'B'], [49, 'N'], [50, 'M'],
  [51, 'Comma'], [52, 'Period'], [53, 'Slash'], [57, 'Space'],
  [102, 'Home'], [103, 'ArrowUp'], [104, 'PageUp'], [105, 'ArrowLeft'], [106, 'ArrowRight'], [107, 'End'], [108, 'ArrowDown'], [109, 'PageDown'], [111, 'Delete'],
  [97, 'ControlRight'], [100, 'AltRight'], [125, 'SuperLeft'], [126, 'SuperRight'],
  [59, 'F1'], [60, 'F2'], [61, 'F3'], [62, 'F4'], [63, 'F5'], [64, 'F6'], [65, 'F7'], [66, 'F8'], [67, 'F9'], [68, 'F10'], [87, 'F11'], [88, 'F12'],
]);

const MODIFIER_ORDER = ['Ctrl', 'Alt', 'Shift', 'Super'];

function capabilityCodes(text) {
  const words = String(text || '').trim().split(/\s+/u).filter(Boolean).reverse();
  const codes = new Set();
  for (let wordIndex = 0; wordIndex < words.length; wordIndex += 1) {
    let word;
    try { word = BigInt(`0x${words[wordIndex]}`); } catch { continue; }
    for (let bit = 0n; bit < 32n; bit += 1n) {
      if ((word & (1n << bit)) !== 0n) codes.add(wordIndex * 32 + Number(bit));
    }
  }
  return codes;
}

function isKeyboardDevice(device) {
  const name = path.basename(device);
  if (!/^event\d+$/u.test(name)) return false;
  const sysfs = `/sys/class/input/${name}/device/capabilities`;
  try {
    const hasAxis = ['rel', 'abs'].some((kind) => {
      try { return capabilityCodes(fs.readFileSync(path.join(sysfs, kind), 'utf8')).size > 0; }
      catch { return false; }
    });
    if (hasAxis) return false;
    const codes = capabilityCodes(fs.readFileSync(path.join(sysfs, 'key'), 'utf8'));
    return [1, 15, 28, 30, 57, 103, 105, 106, 108, 125, 126].some((code) => codes.has(code));
  } catch {
    return false;
  }
}

function discoverInputDevices() {
  const configured = String(process.env.KIMI_LINUX_INPUT_DEVICES || '').trim();
  const values = configured
    ? configured.split(path.delimiter).map((item) => item.trim()).filter(Boolean)
    : (() => {
      try { return fs.readdirSync('/dev/input').filter((item) => /^event\d+$/u.test(item)).sort().map((item) => `/dev/input/${item}`); }
      catch { return []; }
    })();
  return values.filter((device) => /^\/dev\/input\/event\d+$/u.test(device) && (configured || isKeyboardDevice(device)));
}

function keyName(code) {
  return KEY_NAMES.get(Number(code)) ?? `Key${Number(code)}`;
}

function composeHotkey(modifiers, key) {
  const prefix = MODIFIER_ORDER.filter((name) => modifiers.has(name));
  return [...prefix, key].join('+');
}

/*
 * The renderer's recorder consumes the same event contract as the upstream
 * native recorder: a `candidate` while a chord is being held and a single
 * `recorded` event when the chord is released.  Do not forward the internal
 * raw `down`/`up` events: the bundled main-process recorder treats any event
 * other than `candidate` or `recorded` as an explicit cancellation.  The
 * persistent activation binding maps the two recorder events back to its
 * down/up lifecycle below.
 */
function recordingEvents(event) {
  if (!event || typeof event !== 'object' || typeof event.hotkey !== 'string' || !event.hotkey) return [];
  // The bundled recorder consumes the normalized value as `shortcut`, while
  // the Linux activation path and validator use `hotkey`.  Carry both names
  // so a detected chord is not rendered as `undefined` and normalized back to
  // the Right Alt default when the setting is persisted.
  if (event.type === 'down') return [{ type: 'candidate', key: event.key, hotkey: event.hotkey, shortcut: event.hotkey }];
  if (event.type === 'up') return [{ type: 'recorded', key: event.key, hotkey: event.hotkey, shortcut: event.hotkey, heldForMs: event.heldForMs ?? 0 }];
  return [];
}

function traceRecordingEvent(event) {
  if (process.env.KIMI_LINUX_SHORTCUT_TRACE !== '1') return;
  const file = process.env.KIMI_LINUX_SHORTCUT_TRACE_FILE || '/tmp/kimi-linux-shortcut-trace.jsonl';
  try { fs.appendFileSync(file, `${JSON.stringify({ at: Date.now(), ...event })}\n`, { encoding: 'utf8', mode: 0o600 }); } catch { /* tracing must never affect input delivery */ }
}

function createRecordingState() {
  return {
    pending: Buffer.alloc(0),
    modifiers: new Set(),
    modifierCounts: new Map(),
    pressed: new Map(),
    chordModifiers: new Set(),
    chordHadNonModifier: false,
  };
}

function parseEvdevBuffer(chunk, state, emit) {
  if (!state || !Buffer.isBuffer(chunk) || typeof emit !== 'function') return;
  state.pending = state.pending.length === 0 ? Buffer.from(chunk) : Buffer.concat([state.pending, chunk]);
  while (state.pending.length >= EVDEV_EVENT_SIZE) {
    const record = state.pending.subarray(0, EVDEV_EVENT_SIZE);
    state.pending = state.pending.subarray(EVDEV_EVENT_SIZE);
    const type = record.readUInt16LE(16);
    const code = record.readUInt16LE(18);
    const kind = record.readInt32LE(20);
    if (type !== EV_KEY) continue;
    if (kind !== KEY_PRESS && kind !== KEY_RELEASE) continue;
    const tokenName = keyName(code);
    if (kind === KEY_PRESS) {
      if (state.pressed.has(code)) continue;
      state.pressed.set(code, { label: tokenName, time: Date.now() });
      const modifierName = MODIFIERS.get(code);
      if (modifierName) {
        const count = (state.modifierCounts.get(modifierName) || 0) + 1;
        state.modifierCounts.set(modifierName, count);
        state.modifiers.add(modifierName);
        state.chordModifiers.add(modifierName);
      }
      else state.chordHadNonModifier = true;
      emit({ type: 'down', key: tokenName, hotkey: modifierName ? tokenName : composeHotkey(state.modifiers, tokenName) });
      continue;
    }
    const started = state.pressed.get(code);
    state.pressed.delete(code);
    const heldForMs = started ? Math.max(0, Date.now() - started.time) : 0;
    if (code === 1) {
      emit({ type: 'up', key: tokenName, hotkey: 'Escape', heldForMs });
      continue;
    }
    const modifierName = MODIFIERS.get(code);
    if (modifierName) {
      const count = Math.max(0, (state.modifierCounts.get(modifierName) || 1) - 1);
      if (count === 0) {
        state.modifierCounts.delete(modifierName);
        state.modifiers.delete(modifierName);
      } else state.modifierCounts.set(modifierName, count);
      // A modifier by itself is a valid shortcut on Linux (for example the
      // default Right Alt binding). Emit its side-specific token on release;
      // combinations already emitted their complete key on the non-modifier
      // release above and must not fire a second time here.
      if (state.pressed.size === 0 && !state.chordHadNonModifier) {
        const modifierTokens = [...state.chordModifiers];
        emit({ type: 'up', key: tokenName, hotkey: modifierTokens.length === 1 ? tokenName : modifierTokens.join('+'), heldForMs });
      }
      if (state.pressed.size === 0) {
        state.chordModifiers.clear();
        state.chordHadNonModifier = false;
      }
      continue;
    }
    // Users do not have to release a chord in reverse order.  Keep the
    // modifiers captured when the non-modifier key went down so releasing a
    // modifier first cannot collapse `Ctrl+K` into the invalid plain `K`.
    const chordModifiers = state.chordHadNonModifier ? state.chordModifiers : state.modifiers;
    emit({ type: 'up', key: tokenName, hotkey: composeHotkey(chordModifiers, tokenName), heldForMs });
    if (state.pressed.size === 0) {
      state.chordModifiers.clear();
      state.chordHadNonModifier = false;
    }
  }
}

function toAccelerator(value) {
  if (typeof value !== 'string') return null;
  const raw = value.trim();
  if (!raw) return null;
  if (raw === 'AltRight') return 'Alt+Right';
  // Match complete accelerator tokens. A plain substring replacement would
  // turn an already-normalized `CommandOrControl` into the invalid
  // `CommandOrCommandOrControl`.
  return raw.replace(/\b(?:Ctrl|Control)\b/gu, 'CommandOrControl').replaceAll('AltRight', 'Alt+Right');
}

class HotkeyBinding {
  #stopped = false;
  #accelerator;
  #callback;
  #unsubscribe = null;
  #registered = false;

  constructor(shortcut, _mode, callback) {
    this.shortcut = shortcut;
    this.#accelerator = toAccelerator(shortcut);
    this.#callback = typeof callback === 'function' ? callback : () => {};
    if (process.platform === 'linux') {
      try {
        const shared = subscribeShared((event) => {
          if (this.#stopped || !event || event.hotkey !== this.shortcut) return;
          if (event.type === 'candidate') this.#callback({ type: 'down', hotkey: this.shortcut, heldForMs: 0 });
          else if (event.type === 'recorded') this.#callback({ type: 'up', hotkey: this.shortcut, heldForMs: event.heldForMs ?? 0 });
        });
        this.#unsubscribe = shared.unsubscribe;
        if (shared.status !== 'unavailable') {
          this.#registered = true;
          return;
        }
        this.#unsubscribe?.();
        this.#unsubscribe = null;
      } catch {
        this.#unsubscribe = null;
      }
    }
    if (!this.#accelerator || typeof globalShortcut?.register !== 'function') return;
    try {
      this.#registered = globalShortcut.register(this.#accelerator, () => {
        if (this.#stopped) return;
        this.#callback({ type: 'down', hotkey: this.shortcut });
        // Electron's globalShortcut callback is edge-triggered.  Pair it with
        // an explicit release so the existing launcher service sees a complete
        // press lifecycle rather than a permanently held key.
        setTimeout(() => {
          if (!this.#stopped) this.#callback({ type: 'up', hotkey: this.shortcut });
        }, 40).unref?.();
      });
    } catch {
      this.#registered = false;
    }
  }

  get registered() { return this.#registered; }

  stop() {
    if (this.#stopped) return;
    this.#stopped = true;
    try { this.#unsubscribe?.(); } catch { /* best effort */ }
    this.#unsubscribe = null;
    if (this.#registered && typeof globalShortcut?.unregister === 'function') {
      try { globalShortcut.unregister(this.#accelerator); } catch { /* best effort */ }
    }
    this.#registered = false;
  }

  dispose() { this.stop(); }
}

class Recording {
  #stopped = false;
  #callback;
  #devices = [];
  #timers = new Set();
  #configured = false;
  #failed = 0;

  constructor(callback) {
    this.#callback = typeof callback === 'function' ? callback : () => {};
    // An explicit value remains useful for deterministic tests and for
    // administrators who intentionally delegate recording to another broker.
    const configured = String(process.env.KIMI_LINUX_RECORD_HOTKEY || '').trim();
    if (configured) {
      this.#configured = true;
      setImmediate(() => {
        if (!this.#stopped) this.#callback({ type: 'recorded', hotkey: configured, shortcut: configured });
      });
      return;
    }
    for (const device of discoverInputDevices()) {
      try {
        // Evdev character devices block when no key is pending. Open them
        // nonblocking and poll at a bounded cadence so stop() can close every
        // descriptor immediately; destroying a blocking ReadStream alone can
        // leave a kernel read alive indefinitely.
        const fd = fs.openSync(device, fs.constants.O_RDONLY | fs.constants.O_NONBLOCK, 0o400);
        const input = { device, fd, state: createRecordingState(), buffer: Buffer.allocUnsafe(EVDEV_EVENT_SIZE * 64), closed: false };
        this.#devices.push(input);
        this.#poll(input);
      } catch {
        this.#failed += 1;
      }
    }
  }

  #poll(input) {
    if (this.#stopped || !input || input.closed) return;
    try {
      const read = fs.readSync(input.fd, input.buffer, 0, input.buffer.length, null);
      if (read > 0) parseEvdevBuffer(input.buffer.subarray(0, read), input.state, (event) => {
        try {
          for (const emitted of recordingEvents(event)) {
            traceRecordingEvent(emitted);
            this.#callback(emitted);
          }
        } catch { /* callback failures must not kill input polling */ }
      });
    } catch (error) {
      const code = error?.code;
      if (code !== 'EAGAIN' && code !== 'EWOULDBLOCK' && code !== 'EINTR') {
        this.#failed += 1;
        this.#closeInput(input);
        return;
      }
    }
    if (this.#stopped || input.closed) return;
    const timer = setTimeout(() => {
      this.#timers.delete(timer);
      this.#poll(input);
    }, 16);
    this.#timers.add(timer);
  }

  #closeInput(input) {
    if (!input || input.closed) return;
    input.closed = true;
    try { fs.closeSync(input.fd); } catch { /* already closed */ }
    this.#devices = this.#devices.filter((item) => item !== input);
  }

  status() {
    if (this.#stopped) return 'stopped';
    if (this.#configured || this.#devices.length > 0) return 'running';
    if (this.#failed > 0) return 'unavailable';
    if (discoverInputDevices().length === 0) return 'unavailable';
    return 'running';
  }

  cancel() {
    if (this.#stopped) return;
    this.#stopped = true;
    for (const timer of this.#timers) clearTimeout(timer);
    this.#timers.clear();
    for (const input of this.#devices) this.#closeInput(input);
    this.#devices = [];
  }
  stop() { this.cancel(); }
  dispose() { this.cancel(); }
}

// All persistent Linux bindings share one evdev reader.  The upstream bundle
// creates a HotkeyBinding per feature; without this fan-out every binding opens
// every keyboard device again, eventually exhausting descriptors and causing
// reconnect/degradation loops.  Subscribers are reference-counted and the
// reader is stopped as soon as the last binding is removed.
let sharedRecording = null;
const sharedSubscribers = new Set();

function ensureSharedRecording() {
  if (sharedRecording && sharedRecording.status() !== 'stopped') return sharedRecording;
  sharedRecording = new Recording((event) => {
    for (const subscriber of [...sharedSubscribers]) {
      try { subscriber(event); } catch { /* one binding must not kill peers */ }
    }
  });
  return sharedRecording;
}

function subscribeShared(callback) {
  const subscriber = typeof callback === 'function' ? callback : () => {};
  if (process.platform !== 'linux') return { status: 'unavailable', unsubscribe: () => {} };
  const recording = ensureSharedRecording();
  sharedSubscribers.add(subscriber);
  let active = true;
  const unsubscribe = () => {
    if (!active) return;
    active = false;
    sharedSubscribers.delete(subscriber);
    if (sharedSubscribers.size === 0 && sharedRecording) {
      try { sharedRecording.stop(); } catch { /* best effort */ }
      sharedRecording = null;
    }
  };
  return { status: recording.status(), unsubscribe };
}

function sharedStatus() {
  return sharedRecording ? sharedRecording.status() : 'stopped';
}

function resetSharedForTests() {
  for (const subscriber of [...sharedSubscribers]) sharedSubscribers.delete(subscriber);
  try { sharedRecording?.stop(); } catch { /* best effort */ }
  sharedRecording = null;
}

module.exports = {
  EVDEV_EVENT_SIZE,
  HotkeyBinding,
  Recording,
  toAccelerator,
  subscribeShared,
  sharedStatus,
  resetSharedForTests,
  capabilityCodes,
  discoverInputDevices,
  keyName,
  composeHotkey,
  recordingEvents,
  createRecordingState,
  parseEvdevBuffer,
};
