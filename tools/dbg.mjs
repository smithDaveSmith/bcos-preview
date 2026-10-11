import { chromium } from 'playwright';
const b = await chromium.launch({executablePath:process.cwd()+'/.chrome/chromium',args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
p.on('pageerror',e=>console.log('PAGEERROR',e.message));
await p.goto('http://127.0.0.1:8099/',{waitUntil:'load'});
await p.waitForTimeout(2500);
console.log(JSON.stringify(await p.evaluate(()=>{
  const sts = ScrollTrigger.getAll().map(s=>({
    trig: s.trigger ? s.trigger.tagName+'.'+String(s.trigger.className).slice(0,22) : null,
    pin: !!s.pin, scrub: !!s.vars.scrub, start: Math.round(s.start), end: Math.round(s.end)
  })).filter(s=>s.pin || s.scrub);
  const body=getComputedStyle(document.body), html=getComputedStyle(document.documentElement);
  const fy=document.querySelector('[data-fy]');
  // any clipping ancestor breaks position:fixed pinning
  let n=fy.parentElement, clip=[];
  while(n && n!==document.documentElement){const s=getComputedStyle(n);
    if(s.overflow!=='visible'||s.overflowX!=='visible'||s.overflowY!=='visible'||s.transform!=='none'||s.filter!=='none'||s.contain!=='none')
      clip.push(n.tagName+'.'+String(n.className).slice(0,20)+' ovf:'+s.overflow+'/'+s.overflowX+' tf:'+s.transform.slice(0,12)+' contain:'+s.contain);
    n=n.parentElement;}
  return {pinOrScrubTriggers:sts, bodyOverflow:body.overflow+'/'+body.overflowX,
    htmlOverflow:html.overflow+'/'+html.overflowX, fyOverflow:getComputedStyle(fy).overflow,
    clippingAncestors:clip, bodyClass:document.body.className};
})));
await b.close();
