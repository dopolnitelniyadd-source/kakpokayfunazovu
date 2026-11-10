import { parseArgs } from 'node:util';
import { readFileSync } from 'node:fs';
import { generateNames, createRng, STYLES, LANGS } from './generate.js';

const HELP = `kakpokayfu — генератор названий, как по кайфу

Использование:
  kakpokayfu [опции]

Опции:
  -n, --count <N>     сколько названий выдать (по умолчанию 1)
  -w, --words <N>     слов в названии, 1–4 (по умолчанию 2)
  -s, --style <S>     ${STYLES.join(' | ')} (по умолчанию kebab)
  -l, --lang <L>      ${LANGS.join(' | ')} (по умолчанию en; ru — транслитом)
      --suffix        добавить четырёхзначное число в конец
      --seed <S>      фиксированный сид для воспроизводимого результата
      --json          вывести JSON-массив
  -h, --help          эта справка
  -v, --version       версия

Примеры:
  kakpokayfu                       # sleepy-otter
  kakpokayfu -l ru -n 3            # три названия транслитом
  kakpokayfu -s pascal -w 3        # SneakyCosmicTeapot
  kakpokayfu --seed 42 --suffix    # всегда один и тот же результат
`;

function toInt(value, name) {
  const n = Number(value);
  if (!Number.isInteger(n)) throw new Error(`--${name} must be an integer, got "${value}"`);
  return n;
}

export function run(argv, { stdout = process.stdout, stderr = process.stderr } = {}) {
  let values;
  try {
    ({ values } = parseArgs({
      args: argv,
      options: {
        count: { type: 'string', short: 'n', default: '1' },
        words: { type: 'string', short: 'w', default: '2' },
        style: { type: 'string', short: 's', default: 'kebab' },
        lang: { type: 'string', short: 'l', default: 'en' },
        suffix: { type: 'boolean', default: false },
        seed: { type: 'string' },
        json: { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
        version: { type: 'boolean', short: 'v', default: false },
      },
      strict: true,
      allowPositionals: false,
    }));
  } catch (err) {
    stderr.write(`kakpokayfu: ${err.message}\nСм. kakpokayfu --help\n`);
    return 2;
  }

  if (values.help) {
    stdout.write(HELP);
    return 0;
  }
  if (values.version) {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    stdout.write(`${pkg.version}\n`);
    return 0;
  }

  try {
    const names = generateNames({
      count: toInt(values.count, 'count'),
      words: toInt(values.words, 'words'),
      style: values.style,
      lang: values.lang,
      suffix: values.suffix,
      rng: values.seed !== undefined ? createRng(values.seed) : Math.random,
    });
    stdout.write(values.json ? `${JSON.stringify(names)}\n` : `${names.join('\n')}\n`);
    return 0;
  } catch (err) {
    stderr.write(`kakpokayfu: ${err.message}\n`);
    return 1;
  }
}
