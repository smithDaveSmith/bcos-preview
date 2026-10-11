import { chromium } from 'playwright';
const b = await chromium.launch({executablePath:process.cwd()+'/.chrome/chromium',args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://127.0.0.1:8099/'+(process.argv[2]||''),{waitUntil:'load'});
await p.waitForTimeout(2400);
console.log(JSON.stringify(await p.evaluate(()=>{
  const sel=['.hero','.hero__in','.hero__grid','.hero__copy','.hero h1','.hero__tail','.inst','.inst__stage','.inst__ctl'];
  const o={};
  sel.forEach(s=>{const e=document.querySelector(s); if(!e)return o[s]='-';
    const r=e.getBoundingClientRect(); o[s]=[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)];});
  const g=document.querySelector('.hero__grid');
  o.rows=getComputedStyle(g).gridTemplateRows; o.cols=getComputedStyle(g).gridTemplateColumns;
  o.rowGap=getComputedStyle(g).rowGap;
  return o;
})));
await b.close();
