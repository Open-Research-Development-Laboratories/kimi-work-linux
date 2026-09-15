'use strict';

/* Linux replacement for the tiny Windows z-order/focus shim.  Electron owns
 * focus on POSIX; these no-op methods keep the feature boundary explicit and
 * let callers report an unavailable native focus operation without throwing.
 */
function forceForegroundWindow() { return false; }
function setToolWindow() { return false; }
function available() { return false; }

module.exports = {
  available,
  forceForegroundWindow,
  setToolWindow,
  window: { forceForegroundWindow, setToolWindow },
};
