import { chromium } from 'playwright';
const b = await chromium.launch({executablePath:process.cwd()+'/.chrome/chromium',args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://127.0.0.1:8099/',{waitUntil:'load'});
await p.waitForTimeout(2200);
const st = await p.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';
  const t=ScrollTrigger.getAll().find(s=>s.pin); return {s:Math.round(t.start),e:Math.round(t.end)};});
await p.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}), st.s + 900);
await p.waitForTimeout(900);
const r = await p.evaluate(()=>{
  const q=s=>{const e=document.querySelector(s); if(!e) return null; const b=e.getBoundingClientRect();
    const c=getComputedStyle(e); return {x:Math.round(b.x),w:Math.round(b.width),pos:c.position,
      cols:c.gridTemplateColumns,display:c.display};};
  return {pin:q('[data-yr-pin]'), wrap:q('.yr__pin .wrap'), head:q('.yr__head'),
    h2:q('#yr-h'), count:q('.yr__count'), spacer:q('.pin-spacer')?q('.pin-spacer'):null};
});
console.log(JSON.stringify(r,null,1));
await b.close();
