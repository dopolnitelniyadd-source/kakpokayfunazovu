import { WORDS } from './words.js';

export const STYLES = ['kebab', 'snake', 'camel', 'pascal', 'space'];
export const LANGS = Object.keys(WORDS);

// mulberry32: tiny deterministic PRNG so --seed gives reproducible output.
export function createRng(seed) {
  let a = hashSeed(seed) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(seed) {
  const str = String(seed);
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h;
}

const pick = (list, rng) => list[Math.floor(rng() * list.length)];
const capitalize = (w) => w.charAt(0).toUpperCase() + w.slice(1);

export function formatName(parts, style) {
  switch (style) {
    case 'kebab': return parts.join('-');
    case 'snake': return parts.join('_');
    case 'space': return parts.join(' ');
    case 'camel': return parts[0] + parts.slice(1).map(capitalize).join('');
    case 'pascal': return parts.map(capitalize).join('');
    default: throw new Error(`Unknown style "${style}". Use one of: ${STYLES.join(', ')}`);
  }
}

export function generateName({ lang = 'en', words = 2, style = 'kebab', suffix = false, rng = Math.random } = {}) {
  const dict = WORDS[lang];
  if (!dict) throw new Error(`Unknown lang "${lang}". Use one of: ${LANGS.join(', ')}`);
  if (!Number.isInteger(words) || words < 1 || words > 4) {
    throw new Error('words must be an integer from 1 to 4');
  }
  const parts = [];
  while (parts.length < words - 1) {
    const adj = pick(dict.adjectives, rng);
    if (!parts.includes(adj)) parts.push(adj);
  }
  parts.push(pick(dict.nouns, rng));
  if (suffix) parts.push(String(Math.floor(rng() * 9000) + 1000));
  return formatName(parts, style);
}

export function generateNames({ count = 1, rng = Math.random, ...opts } = {}) {
  if (!Number.isInteger(count) || count < 1) throw new Error('count must be a positive integer');
  const names = new Set();
  // Bounded retries: with words=1 the dictionary can't yield many unique names.
  let attempts = 0;
  while (names.size < count && attempts < count * 50) {
    names.add(generateName({ ...opts, rng }));
    attempts++;
  }
  return [...names];
}
