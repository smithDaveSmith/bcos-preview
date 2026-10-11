import { chromium } from 'playwright';
const b = await chromium.launch({executablePath:process.cwd()+'/.chrome/chromium',args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
p.on('pageerror',e=>console.log('PAGEERROR',e.message));
p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text().slice(0,200));});
await p.goto('http://127.0.0.1:8099/',{waitUntil:'load'});
await p.waitForTimeout(2500);
console.log(JSON.stringify(await p.evaluate(()=>{
  const out={};
  ['deadline','alt','today'].forEach(id=>{
    const g=document.querySelector(`[data-mk="${id}"]`);
    if(!g){out[id]='MISSING';return;}
    const t=g.querySelector('text'); const r=g.getBoundingClientRect();
    out[id]={transform:g.getAttribute('transform'),display:getComputedStyle(g).display,
      opacity:getComputedStyle(g).opacity,
      tspans:[...t.querySelectorAll('tspan')].map(s=>s.textContent),
      rect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],
      fontSize:getComputedStyle(t).fontSize, fill:getComputedStyle(t).fill};
  });
  const svg=document.querySelector('.inst svg'); const sr=svg.getBoundingClientRect();
  out.svgRect=[Math.round(sr.x),Math.round(sr.y),Math.round(sr.width),Math.round(sr.height)];
  out.remain=document.querySelector('[data-arc="remain"]').getAttribute('d');
  out.beam=document.querySelector('[data-beam]').getAttribute('transform');
  out.num=document.querySelector('[data-out="num"]').textContent;
  out.numSize=getComputedStyle(document.querySelector('[data-out="num"]')).fontSize;
  const h1=document.querySelector('.hero h1');
  out.h1Lines=[...h1.querySelectorAll('.hl__l')].map(l=>({t:l.textContent.trim().slice(0,30),w:Math.round(l.getBoundingClientRect().width)}));
  out.h1Width=Math.round(h1.getBoundingClientRect().width);
  out.heroH=Math.round(document.querySelector('.hero').getBoundingClientRect().height);
  out.docW=document.documentElement.scrollWidth; out.innerW=innerWidth;
  return out;
},)));
await b.close();
