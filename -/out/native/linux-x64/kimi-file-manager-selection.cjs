'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { clipboardText, foregroundFileManager, parseFileList } = require('./linux-common.cjs');

async function captureSelection(_foreground, limit = 20) {
  const paths = parseFileList(clipboardText(), Math.max(1, Math.min(20, Number(limit) || 20)));
  let folder = null;
  if (paths.length > 0) {
    try { folder = fs.statSync(paths[0]).isDirectory() ? paths[0] : path.dirname(paths[0]); } catch { folder = path.dirname(paths[0]); }
  }
  return {
    diag: 'linux-clipboard-selection',
    paths,
    folder,
  };
}

module.exports = { captureSelection, foregroundFileManager };
