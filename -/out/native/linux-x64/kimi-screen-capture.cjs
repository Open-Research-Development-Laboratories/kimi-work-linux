'use strict';

const { captureScreen, hasCaptureBackend } = require('./linux-common.cjs');

function available() {
  return hasCaptureBackend();
}

function captureRect(options = {}) {
  return captureScreen(options);
}

module.exports = {
  available,
  captureRect,
  captureScreen: captureRect,
};
