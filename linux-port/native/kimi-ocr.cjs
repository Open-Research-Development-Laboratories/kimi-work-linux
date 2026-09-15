'use strict';

const { run, hasCommand } = require('./linux-common.cjs');

function available() {
  return hasCommand('tesseract');
}

function languageCode(languages) {
  const values = Array.isArray(languages) ? languages : [];
  const mapped = values.map((value) => {
    const key = String(value || '').toLowerCase();
    if (key.startsWith('zh-hant') || key.startsWith('zh-tw') || key.startsWith('zh-hk') || key.startsWith('zh-mo')) return 'chi_tra';
    if (key.startsWith('zh')) return 'chi_sim';
    if (key.startsWith('ja')) return 'jpn';
    if (key.startsWith('ko')) return 'kor';
    if (key.startsWith('ar')) return 'ara';
    if (key.startsWith('cs')) return 'ces';
    if (key.startsWith('da')) return 'dan';
    if (key.startsWith('de')) return 'deu';
    if (key.startsWith('el')) return 'ell';
    if (key.startsWith('fr')) return 'fra';
    if (key.startsWith('he')) return 'heb';
    if (key.startsWith('hi')) return 'hin';
    if (key.startsWith('hu')) return 'hun';
    if (key.startsWith('id')) return 'ind';
    if (key.startsWith('it')) return 'ita';
    if (key.startsWith('nl')) return 'nld';
    if (key.startsWith('no')) return 'nor';
    if (key.startsWith('pl')) return 'pol';
    if (key.startsWith('pt')) return 'por';
    if (key.startsWith('ro')) return 'ron';
    if (key.startsWith('es')) return 'spa';
    if (key.startsWith('ru')) return 'rus';
    if (key.startsWith('sv')) return 'swe';
    if (key.startsWith('th')) return 'tha';
    if (key.startsWith('tr')) return 'tur';
    if (key.startsWith('uk')) return 'ukr';
    if (key.startsWith('vi')) return 'vie';
    return 'eng';
  });
  return [...new Set(mapped)].join('+') || 'eng';
}

function recognizeText({ image, languages } = {}) {
  if (!Buffer.isBuffer(image) && !(image instanceof Uint8Array)) throw new TypeError('image must be a PNG byte buffer');
  if (!available()) throw new Error('tesseract is not installed');
  const result = run('tesseract', ['stdin', 'stdout', '-l', languageCode(languages), '--psm', '3'], {
    input: Buffer.from(image),
    timeoutMs: 30_000,
    maxBuffer: 4 * 1024 * 1024,
  });
  if (!result.ok) throw new Error(`tesseract failed${result.stderr.length ? `: ${result.stderr.toString('utf8').trim().slice(0, 256)}` : ''}`);
  const lines = result.stdout.toString('utf8').split(/\r?\n/u).map((text) => text.trim()).filter(Boolean).map((text) => ({ text }));
  return { lines, language: languageCode(languages) };
}

module.exports = { available, languageCode, recognizeText };
