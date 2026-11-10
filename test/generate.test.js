import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateName, generateNames, createRng, formatName } from '../src/generate.js';

test('formatName handles every style', () => {
  const parts = ['sleepy', 'otter'];
  assert.equal(formatName(parts, 'kebab'), 'sleepy-otter');
  assert.equal(formatName(parts, 'snake'), 'sleepy_otter');
  assert.equal(formatName(parts, 'space'), 'sleepy otter');
  assert.equal(formatName(parts, 'camel'), 'sleepyOtter');
  assert.equal(formatName(parts, 'pascal'), 'SleepyOtter');
  assert.throws(() => formatName(parts, 'yelling'), /Unknown style/);
});

test('same seed gives same names', () => {
  const a = generateNames({ count: 5, rng: createRng('kayf') });
  const b = generateNames({ count: 5, rng: createRng('kayf') });
  assert.deepEqual(a, b);
});

test('word count and suffix', () => {
  const rng = createRng(1);
  for (let i = 0; i < 50; i++) {
    assert.equal(generateName({ words: 3, rng }).split('-').length, 3);
    assert.match(generateName({ suffix: true, rng }), /^[a-z]+-[a-z]+-\d{4}$/);
  }
});

test('adjectives are not repeated within a name', () => {
  const rng = createRng(7);
  for (let i = 0; i < 200; i++) {
    const parts = generateName({ words: 4, rng }).split('-');
    assert.equal(new Set(parts.slice(0, 3)).size, 3);
  }
});

test('ru dictionary is ascii-only transliteration', () => {
  const names = generateNames({ count: 30, lang: 'ru', words: 3, rng: createRng(3) });
  for (const name of names) assert.match(name, /^[a-z-]+$/);
});

test('generateNames returns unique names', () => {
  const names = generateNames({ count: 100, rng: createRng(9) });
  assert.equal(names.length, 100);
  assert.equal(new Set(names).size, 100);
});

test('rejects bad input', () => {
  assert.throws(() => generateName({ lang: 'klingon' }), /Unknown lang/);
  assert.throws(() => generateName({ words: 0 }), /words must be/);
  assert.throws(() => generateNames({ count: 0 }), /count must be/);
});
