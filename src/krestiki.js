import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline';
import { emptyBoard, winner, play, bestMove, render, other } from './tictactoe.js';

const HELP = `krestiki — крестики-нолики в терминале, по-братски

Использование:
  krestiki [опции]

Опции:
      --2p        игра вдвоём за одним терминалом
  -o, --nolik     играть за нолики (бот ходит первым)
  -h, --help      эта справка

Ходы — цифры 1–9:
  1 │ 2 │ 3
  4 │ 5 │ 6
  7 │ 8 │ 9
q — выйти.
`;

export async function run(argv, { input = process.stdin, stdout = process.stdout, stderr = process.stderr } = {}) {
  let values;
  try {
    ({ values } = parseArgs({
      args: argv,
      options: {
        '2p': { type: 'boolean', default: false },
        nolik: { type: 'boolean', short: 'o', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
      strict: true,
      allowPositionals: false,
    }));
  } catch (err) {
    stderr.write(`krestiki: ${err.message}\nСм. krestiki --help\n`);
    return 2;
  }
  if (values.help) {
    stdout.write(HELP);
    return 0;
  }

  const human = values.nolik ? 'O' : 'X';
  const bot = values['2p'] ? null : other(human);
  const rl = createInterface({ input, terminal: false });
  const lines = rl[Symbol.asyncIterator]();
  const ask = async (q) => {
    stdout.write(q);
    const { value, done } = await lines.next();
    return done ? null : value.trim();
  };

  let board = emptyBoard();
  let turn = 'X';
  stdout.write(`${render(board)}\n\n`);

  try {
    while (!winner(board)) {
      if (turn === bot) {
        const c = bestMove(board, bot);
        board = play(board, c, bot);
        stdout.write(`Бот ставит ${bot} в ${c + 1}\n`);
      } else {
        const ans = await ask(`Ход ${turn} (1–9): `);
        if (ans === null || ans === 'q') {
          stdout.write('\nНу ладно, давай, брат.\n');
          return 0;
        }
        try {
          board = play(board, Number(ans) - 1, turn);
        } catch (err) {
          stdout.write(`${err.message}, давай ещё раз.\n`);
          continue;
        }
      }
      stdout.write(`\n${render(board)}\n\n`);
      turn = other(turn);
    }
  } finally {
    rl.close();
  }

  const w = winner(board);
  if (w === 'draw') stdout.write('Ничья, по-братски разошлись.\n');
  else if (w === bot) stdout.write('Бот победил. Не грусти, брат, его не обыграть.\n');
  else stdout.write(`${w} победил! Красава.\n`);
  return 0;
}
