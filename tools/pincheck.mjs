import { chromium } from 'playwright';
const b = await chromium.launch({executablePath:process.cwd()+'/.chrome/chromium',args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});

// 1. Resize across the pin breakpoint: the pin must be torn down and rebuilt cleanly.
{
  const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8099/',{waitUntil:'load'});
  await p.waitForTimeout(2000);
  const a = await p.evaluate(()=>ScrollTrigger.getAll().filter(s=>s.pin).length);
  await p.setViewportSize({width:800,height:900}); await p.waitForTimeout(1200);
  const bb = await p.evaluate(()=>ScrollTrigger.getAll().filter(s=>s.pin).length);
  await p.setViewportSize({width:1440,height:900}); await p.waitForTimeout(1200);
  const c = await p.evaluate(()=>ScrollTrigger.getAll().filter(s=>s.pin).length);
  await p.setViewportSize({width:1440,height:900}); await p.waitForTimeout(800);
  const d = await p.evaluate(()=>({pins:ScrollTrigger.getAll().filter(s=>s.pin).length,
    total:ScrollTrigger.getAll().length, spacers:document.querySelectorAll('.pin-spacer').length}));
  console.log('pins desktop:',a,'| narrow:',bb,'| back to desktop:',c,'| after settle:',JSON.stringify(d));
  console.log('errors during resize:',errs.length, errs.slice(0,2));
}
// 2. Mobile: no pin, cards all readable.
{
  const p = await (await b.newContext({viewport:{width:390,height:844}})).newPage();
  await p.goto('http://127.0.0.1:8099/',{waitUntil:'load'});
  await p.waitForTimeout(1800);
  await p.evaluate(async()=>{document.documentElement.style.scrollBehavior='auto';
    const H=document.body.scrollHeight;
    for(let y=0;y<H;y+=innerHeight*0.6){window.scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,80));}});
  await p.waitForTimeout(600);
  console.log('mobile:', JSON.stringify(await p.evaluate(()=>({
    pins:ScrollTrigger.getAll().filter(s=>s.pin).length,
    cardsVisible:[...document.querySelectorAll('[data-yr-card]')].filter(c=>getComputedStyle(c).opacity!=='0').length,
    cardsTotal:document.querySelectorAll('[data-yr-card]').length}))));
}
// 3. Reduced motion: no pin, everything laid out.
{
  const p = await (await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'})).newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8099/',{waitUntil:'load'});
  await p.waitForTimeout(1800);
  console.log('reduced motion:', JSON.stringify(await p.evaluate(()=>({
    pins:ScrollTrigger.getAll().filter(s=>s.pin).length,
    cardsVisible:[...document.querySelectorAll('[data-yr-card]')].filter(c=>getComputedStyle(c).opacity!=='0').length,
    marksLit:[...document.querySelectorAll('[data-mark]')].filter(m=>m.classList.contains('is-on')).length,
    day:(document.querySelector('[data-yr-day]')||{}).textContent,
    hidden:[...document.querySelectorAll('[data-anim],.card,.yr__c')].filter(e=>getComputedStyle(e).opacity==='0'&&e.getBoundingClientRect().height>0).length
  }))), '| errors:', errs.length);
}
await b.close();
