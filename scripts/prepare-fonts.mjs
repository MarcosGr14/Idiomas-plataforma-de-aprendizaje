import fs from 'node:fs';
import path from 'node:path';
const files=fs.readdirSync('src',{recursive:true}).filter(f=>/\.(tsx|ts)$/.test(f));
const text=files.map(f=>fs.readFileSync(path.join('src',f),'utf8')).join('');
const points=new Set([...text].map(c=>c.codePointAt(0)));
const root='node_modules/@fontsource/noto-serif-jp';let output='/* Local CJK subsets selected from the actual course content. Run npm run fonts when content changes. */\n';
for(const weight of [400,600]){const css=fs.readFileSync(`${root}/${weight}.css`,'utf8');for(const block of css.matchAll(/@font-face\s*\{[^}]+\}/g)){const range=block[0].match(/unicode-range:\s*([^;]+)/)?.[1];if(!range)continue;const intervals=range.split(',').map(r=>r.trim().replace('U+','').split('-').map(x=>parseInt(x,16)));if(!intervals.some(([lo,hi=lo])=>[...points].some(n=>n>=lo&&n<=hi)))continue;const font=block[0].match(/\.\/files\/([^')]+\.woff2)/)?.[1];if(!font)continue;fs.copyFileSync(`${root}/files/${font}`,`public/fonts/${font}`);output+=block[0].replace(/src:[\s\S]*?;/,`src: url('/fonts/${font}') format('woff2');`)+'\n';}}
fs.writeFileSync('src/fonts.css',output);fs.copyFileSync(`${root}/LICENSE`,'public/fonts/OFL-Noto-Serif-JP.txt');
