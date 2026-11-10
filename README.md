# kakpokayfunazovu

`kakpokayfu` — CLI-генератор названий для проектов, веток, серверов и котов. Как по кайфу назову.

Без зависимостей, нужен Node.js ≥ 18.3.

## Установка

```sh
npm install -g github:dopolnitelniyadd-source/kakpokayfunazovu
# или без установки, из клона репозитория
node bin/kakpokayfu.js
```

## Примеры

```sh
kakpokayfu                       # sleepy-otter
kakpokayfu -n 5                  # пять уникальных названий
kakpokayfu -l ru -w 3            # shustry-kayfovy-pelmen
kakpokayfu -s pascal             # CosmicTeapot
kakpokayfu --suffix -s snake     # lazy_walrus_4821
kakpokayfu --seed 42             # одинаковый результат при каждом запуске
kakpokayfu --json -n 3           # ["...","...","..."]
```

## Опции

| Опция | Описание | По умолчанию |
|---|---|---|
| `-n, --count <N>` | сколько названий выдать | `1` |
| `-w, --words <N>` | слов в названии (1–4) | `2` |
| `-s, --style <S>` | `kebab`, `snake`, `camel`, `pascal`, `space` | `kebab` |
| `-l, --lang <L>` | `en` или `ru` (транслитом) | `en` |
| `--suffix` | добавить четырёхзначное число | выкл. |
| `--seed <S>` | сид для воспроизводимого результата | — |
| `--json` | вывод JSON-массивом | выкл. |

## Разработка

```sh
npm test
```
