import { chromium } from 'playwright';
const b = await chromium.launch({executablePath:process.cwd()+'/.chrome/chromium',args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://127.0.0.1:8099/',{waitUntil:'load'});
await p.waitForTimeout(2500);
const r = await p.evaluate(()=>
  ScrollTrigger.getAll().filter(s=>s.pin).map(s=>({
    tag:s.trigger.tagName, cls:s.trigger.className, id:s.trigger.id,
    sameAsFy: s.trigger === document.querySelector('[data-fy]'),
    pinEl: s.pin ? (s.pin.tagName+'#'+s.pin.id+'.'+s.pin.className) : null,
    start:Math.round(s.start), end:Math.round(s.end)
  })));
console.log(JSON.stringify(r,null,1));
await b.close();
