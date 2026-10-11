import { chromium } from 'playwright';
const b = await chromium.launch({executablePath:process.cwd()+'/.chrome/chromium',args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://127.0.0.1:8099/',{waitUntil:'domcontentloaded'});
for (const t of [300,800,1500,2200,3000]) {
  await p.waitForTimeout(t===300?300:700);
  const r = await p.evaluate(()=>({
    mk: getComputedStyle(document.querySelector('[data-mk="deadline"]')).opacity,
    read: getComputedStyle(document.querySelector('.inst__read > *')).opacity,
    ctl: getComputedStyle(document.querySelector('.inst__ctl')).opacity,
    beamOp: getComputedStyle(document.querySelector('[data-beam]')).opacity,
    tweens: gsap.globalTimeline.getChildren(true,true,false).length
  }));
  console.log(t, JSON.stringify(r));
}
await b.close();
