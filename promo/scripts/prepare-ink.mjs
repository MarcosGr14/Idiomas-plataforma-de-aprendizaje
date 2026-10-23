import {chromium} from 'playwright';
import {readFile,writeFile} from 'node:fs/promises';
import {browserPath} from './browser.mjs';
const browser=await chromium.launch({executablePath:await browserPath(),headless:true,args:['--no-sandbox']});
try{const page=await browser.newPage();const glyphs={};
 for(const [char,code] of [['日','065e5'],['本','0672c'],['語','08a9e'],['い','03044']]){
 const xml=await readFile(`content/kanjivg/${code}.svg`,'utf8');
 glyphs[char]=await page.evaluate(xml=>{const doc=new DOMParser().parseFromString(xml,'image/svg+xml');return [...doc.querySelectorAll('path')].filter(p=>/-s\d+$/.test(p.id)).map(p=>{const el=document.createElementNS('http://www.w3.org/2000/svg','path');el.setAttribute('d',p.getAttribute('d'));const length=el.getTotalLength(),n=Math.max(16,Math.ceil(length));return {d:p.getAttribute('d'),points:Array.from({length:n+1},(_,i)=>{const q=el.getPointAtLength(i/n*length);return [+q.x.toFixed(3),+q.y.toFixed(3)]})}})},xml);
 }
 await writeFile('src/design/kanjivg.json',JSON.stringify({attribution:'Ulrich Apel / KanjiVG; CC BY-SA 3.0. Derived samples from committed content/kanjivg SVG files.',glyphs}));
}finally{await browser.close()}
