'use strict';

/*
 * Windows uses a native keyboard-layout probe to select a safe accelerator.
 * Linux accelerators are interpreted by Electron/GTK and do not need that
 * probe.  Keep the same contract and choose the stable right-Alt key name
 * used by the renderer; callers may override it with KIMI_LINUX_HOTKEY.
 */
function evaluate() {
  const configured = String(process.env.KIMI_LINUX_HOTKEY || '').trim();
  return configured || 'AltRight';
}

module.exports = { evaluate };
