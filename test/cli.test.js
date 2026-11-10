import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const bin = fileURLToPath(new URL('../bin/kakpokayfu.js', import.meta.url));
const cli = (...args) => spawnSync(process.execPath, [bin, ...args], { encoding: 'utf8' });

test('prints requested number of names', () => {
  const res = cli('-n', '4');
  assert.equal(res.status, 0);
  assert.equal(res.stdout.trim().split('\n').length, 4);
});

test('seeded output is stable across runs', () => {
  assert.equal(cli('--seed', '42', '-n', '3').stdout, cli('--seed', '42', '-n', '3').stdout);
});

test('--json outputs an array', () => {
  const names = JSON.parse(cli('--json', '-n', '2', '-s', 'pascal').stdout);
  assert.equal(names.length, 2);
  for (const n of names) assert.match(n, /^[A-Z][a-z]+[A-Z][a-z]+$/);
});

test('help and version', () => {
  assert.match(cli('--help').stdout, /kakpokayfu/);
  assert.match(cli('-v').stdout, /^\d+\.\d+\.\d+\n$/);
});

test('bad flags exit non-zero with a message', () => {
  const unknown = cli('--nope');
  assert.equal(unknown.status, 2);
  assert.match(unknown.stderr, /kakpokayfu:/);
  const badStyle = cli('-s', 'yelling');
  assert.equal(badStyle.status, 1);
  assert.match(badStyle.stderr, /Unknown style/);
  assert.equal(cli('-n', 'many').status, 1);
});
