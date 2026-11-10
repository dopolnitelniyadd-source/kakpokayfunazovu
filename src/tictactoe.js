export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export const emptyBoard = () => Array(9).fill(null);

export const other = (p) => (p === 'X' ? 'O' : 'X');

/** 'X' | 'O' | 'draw' | null */
export function winner(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return board.every(Boolean) ? 'draw' : null;
}

export function freeCells(board) {
  return board.flatMap((v, i) => (v ? [] : [i]));
}

export function play(board, cell, player) {
  if (!Number.isInteger(cell) || cell < 0 || cell > 8) throw new Error('Клетка должна быть от 1 до 9');
  if (board[cell]) throw new Error('Клетка занята');
  const next = board.slice();
  next[cell] = player;
  return next;
}

// Depth-adjusted score so the bot wins fast and loses slow.
function minimax(board, toMove, me, depth) {
  const w = winner(board);
  if (w === me) return 10 - depth;
  if (w === 'draw') return 0;
  if (w) return depth - 10;
  const scores = freeCells(board).map((c) => minimax(play(board, c, toMove), other(toMove), me, depth + 1));
  return toMove === me ? Math.max(...scores) : Math.min(...scores);
}

export function bestMove(board, me, rng = Math.random) {
  let best = -Infinity;
  let moves = [];
  for (const c of freeCells(board)) {
    const s = minimax(play(board, c, me), other(me), me, 1);
    if (s > best) [best, moves] = [s, [c]];
    else if (s === best) moves.push(c);
  }
  return moves[Math.floor(rng() * moves.length)];
}

export function render(board) {
  const cell = (i) => board[i] ?? String(i + 1);
  const row = (r) => ` ${cell(r * 3)} │ ${cell(r * 3 + 1)} │ ${cell(r * 3 + 2)} `;
  return [row(0), '───┼───┼───', row(1), '───┼───┼───', row(2)].join('\n');
}
