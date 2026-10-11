import { chromium } from 'playwright';
const b = await chromium.launch({executablePath:process.cwd()+'/.chrome/chromium',args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
const p = await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8099/',{waitUntil:'load'}); await p.waitForTimeout(1800);
await p.locator('[data-year-scene]').scrollIntoViewIfNeeded(); await p.waitForTimeout(2600);
const st = await p.evaluate(()=>({
  pinned: ScrollTrigger.getAll().filter(t=>t.pin).length,
  cardsVisible: [...document.querySelectorAll('[data-yr-card]')].filter(c=>getComputedStyle(c).opacity!=='0').length,
  lit: document.querySelectorAll('[data-mark].is-on').length,
  day: document.querySelector('[data-yr-day]').textContent,
  docW: document.documentElement.scrollWidth, innerW: innerWidth
}));
console.log(JSON.stringify(st), 'errors:', errs.length?errs:'none');
await p.locator('[data-year-scene]').screenshot({path:'research/shots/scene-mobile.png'});
await b.close();
