import { chromium } from 'playwright';
const br = await chromium.launch({executablePath:process.cwd()+'/.chrome/chromium',args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
const ctx = await br.newContext({viewport:{width:1100,height:900},deviceScaleFactor:2});
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8099/',{waitUntil:'load'}); await p.waitForTimeout(2600);
const stage = p.locator('.inst');
await stage.screenshot({path:'research/shots/sig-1-before.png'});
const read = ()=>p.evaluate(()=>({n:document.querySelector('[data-out="num"]').textContent,
  u:document.querySelector('[data-out="unit"]').textContent,
  rule:document.querySelector('[data-out="rule"]').innerText.replace(/\s+/g,' ').trim(),
  cost:document.querySelector('[data-out="cost"]').textContent,
  beam:document.querySelector('[data-beam]').getAttribute('transform')}));
console.log('BEFORE', JSON.stringify(await read()));
// a company already past its deadline: the beam crosses the horizon
await p.evaluate(()=>{const a=document.querySelector('#f-ard'); a.value='2026-01-31'; a.dispatchEvent(new Event('change',{bubbles:true}));
  const f=document.querySelector('#f-fye'); f.value='2025-03-31'; f.dispatchEvent(new Event('change',{bubbles:true}));});
await p.waitForTimeout(430);
await stage.screenshot({path:'research/shots/sig-2-during.png'});
console.log('DURING', JSON.stringify(await read()));
await p.waitForTimeout(1500);
await stage.screenshot({path:'research/shots/sig-3-after.png'});
console.log('AFTER', JSON.stringify(await read()));
// and the divergent-rules case
await p.evaluate(()=>{const a=document.querySelector('#f-ard'); a.value='2026-11-30'; a.dispatchEvent(new Event('change',{bubbles:true}));
  const f=document.querySelector('#f-fye'); f.value='2025-12-31'; f.dispatchEvent(new Event('change',{bubbles:true}));});
await p.waitForTimeout(1600);
await stage.screenshot({path:'research/shots/sig-4-diverge.png'});
console.log('DIVERGE', JSON.stringify(await read()));
await br.close();
