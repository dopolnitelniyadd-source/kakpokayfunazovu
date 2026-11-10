import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { emptyBoard, winner, play, bestMove, freeCells, other } from '../src/tictactoe.js';

const bin = fileURLToPath(new URL('../bin/krestiki.js', import.meta.url));
const game = (input, ...args) => spawnSync(process.execPath, [bin, ...args], { input, encoding: 'utf8' });
const b = (s) => [...s].map((ch) => (ch === '.' ? null : ch));

test('winner detects rows, diagonals and draws', () => {
  assert.equal(winner(b('XXX......')), 'X');
  assert.equal(winner(b('O...O...O')), 'O');
  assert.equal(winner(b('XOXXOOOXX')), 'draw');
  assert.equal(winner(emptyBoard()), null);
});

test('play rejects occupied and out-of-range cells', () => {
  assert.throws(() => play(b('X........'), 0, 'O'), /занята/);
  assert.throws(() => play(emptyBoard(), 9, 'X'), /от 1 до 9/);
  assert.throws(() => play(emptyBoard(), NaN, 'X'), /от 1 до 9/);
});

test('bot takes a win and blocks a loss', () => {
  assert.equal(bestMove(b('OO.XX....'), 'O'), 2);
  assert.equal(bestMove(b('XX..O....'), 'O'), 2);
});

test('bot never loses against any line of play', () => {
  const explore = (board, turn, botSide) => {
    const w = winner(board);
    if (w) return assert.notEqual(w, other(botSide));
    if (turn === botSide) return explore(play(board, bestMove(board, botSide, () => 0), turn), other(turn), botSide);
    for (const c of freeCells(board)) explore(play(board, c, turn), other(turn), botSide);
  };
  explore(emptyBoard(), 'X', 'O');
  explore(emptyBoard(), 'X', 'X');
});

test('two-player game over stdin', () => {
  const res = game('1\n4\n2\n5\n3\n', '--2p');
  assert.equal(res.status, 0);
  assert.match(res.stdout, /X победил/);
});

test('invalid input is re-asked, q quits', () => {
  const res = game('abc\n1\n1\nq\n', '--2p');
  assert.equal(res.status, 0);
  assert.match(res.stdout, /от 1 до 9, давай ещё раз/);
  assert.match(res.stdout, /занята, давай ещё раз/);
  assert.match(res.stdout, /давай, брат/);
});

test('help and bad flags', () => {
  assert.match(game('', '--help').stdout, /крестики-нолики/);
  assert.equal(game('', '--nope').status, 2);
});
