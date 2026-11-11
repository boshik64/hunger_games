import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const manifest = readFileSync(join(root, 'src/assets/manifest.ts'), 'utf8');
const files = [
  ...new Set([
    ...[...manifest.matchAll(/'(assets\/final\/[^']+|og-cover\.jpg)'/g)].map((match) => match[1]),
    ...Array.from({ length: 12 }, (_, index) => `assets/final/district-${index + 1}.svg`),
  ]),
];

if (files.length < 20) {
  console.error(`expected the asset manifest to list the final files, found ${files.length}`);
  process.exit(1);
}

let total = 0;
for (const file of files) {
  const path = join(root, 'public', file);
  if (!existsSync(path)) {
    console.error(`missing ${file}`);
    process.exit(1);
  }
  const size = statSync(path).size;
  total += size;
  if (file.endsWith('.webp') && size > 300 * 1024) {
    console.error(`${file} is ${(size / 1024).toFixed(0)} KB, limit is 300 KB`);
    process.exit(1);
  }
}

if (manifest.includes("status: 'placeholder',")) {
  console.error('manifest still has placeholder assets');
  process.exit(1);
}

if (total > 1.5 * 1024 * 1024) {
  console.error(`assets total ${(total / 1024).toFixed(0)} KB, limit is 1500 KB`);
  process.exit(1);
}

console.log(`${files.length} assets, ${(total / 1024).toFixed(0)} KB`);
