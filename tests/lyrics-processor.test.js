// Loads the Apps Script sources into one shared sandbox scope, the way Apps Script runs them.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function cleanLyrics(lyrics) {
  const context = vm.createContext({ Logger: { log() {} } });
  for (const file of ['reference-data.js', 'translations-data.js', 'lyrics-processor.js']) {
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', file), 'utf8');
    vm.runInContext(source, context, { filename: file });
  }
  const LyricsProcessor = vm.runInContext('LyricsProcessor', context);
  return new LyricsProcessor().cleanLyrics(lyrics);
}

test('keeps two empty lines after an empty INTRO', () => {
  const chart = 'INTRO\n\n\nVERSE\nLaat heel de wereld het zien,';
  assert.equal(cleanLyrics(chart), chart);
});

test('keeps two empty lines after an empty INSTRUMENTAL between sections', () => {
  const chart = 'CHORUS\nMaak groot onze God\n\nINSTRUMENTAL\n\n\nBRIDGE\nAllerhoogste Heer';
  assert.equal(cleanLyrics(chart), chart);
});

test('collapses several empty lines between sections with lyrics to one', () => {
  assert.equal(
    cleanLyrics('VERSE\nIk wil heel dicht bij U zijn\n\n\n\nCHORUS\nTil mij op, neem mij'),
    'VERSE\nIk wil heel dicht bij U zijn\n\nCHORUS\nTil mij op, neem mij',
  );
});

test('numbers every section of a repeated type, starting at 1', () => {
  assert.equal(
    cleanLyrics('BRIDGE\nDraag mij door\n\nBRIDGE 2\nEn mijn hart roept'),
    'BRIDGE 1\nDraag mij door\n\nBRIDGE 2\nEn mijn hart roept',
  );
});

test('gives the same chart when run twice', () => {
  const once = cleanLyrics('INTRO\n\n\n\nVERSE\nLaat heel de wereld het zien,\n\nINSTRUMENTAL\n\nCHORUS\nLiefde en recht zal Hij brengen');
  assert.equal(cleanLyrics(once), once);
});
