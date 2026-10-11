import { chromium } from 'playwright';
const b = await chromium.launch({executablePath:process.cwd()+'/.chrome/chromium',args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
const p = await (await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1.5})).newPage();
p.on('pageerror',e=>console.log('PAGEERROR',e.message));
await p.goto('http://127.0.0.1:8099/',{waitUntil:'load'});
await p.waitForTimeout(2200);
const info = await p.evaluate(()=>{
  document.documentElement.style.scrollBehavior='auto';
  const st = ScrollTrigger.getAll().find(s=>s.pin);
  return {start:Math.round(st.start), end:Math.round(st.end)};
});
console.log('pin range', info.start, '->', info.end);
const samples=[0.02,0.22,0.42,0.62,0.82,0.99];
let i=0;
for (const f of samples){
  await p.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}), Math.round(info.start + f*(info.end-info.start)));
  await p.waitForTimeout(850);
  const d = await p.evaluate(()=>{
    const card=[...document.querySelectorAll('[data-yr-card]')].find(c=>c.hasAttribute('data-active'));
    const pinEl=document.querySelector('[data-yr-pin]')||document.querySelector('.yr__pin');
    return {day:(document.querySelector('[data-yr-day]')||{}).textContent,
      fillW:(document.querySelector('[data-yr-fill]')||{}).getAttribute?.('width')||null,
      lit:[...document.querySelectorAll('[data-mark]')].filter(m=>m.classList.contains('is-on')).length,
      card:card?(card.textContent||'').replace(/\s+/g,' ').trim().slice(0,52):null,
      pinPos:pinEl?getComputedStyle(pinEl).position:null};
  });
  console.log(f.toFixed(2), JSON.stringify(d));
  await p.screenshot({path:`research/shots/yr-${i++}.png`});
}
await b.close();
