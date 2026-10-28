import { bundle } from '@remotion/bundler';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rm } from 'node:fs/promises';
const base = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(base, '.cache/check-bundle');
try {
  await bundle({ entryPoint: resolve(base, 'src/index.tsx'), outDir, publicDir: null });
  console.log('Promo composition bundle passed (no video render).');
} finally {
  await rm(outDir, {recursive:true,force:true});
}
