import { chromium } from 'playwright';
const b = await chromium.launch({executablePath:process.cwd()+'/.chrome/chromium',args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.addInitScript(()=>{
  window.__log=[];
  const mo = ()=>{
    const g=document.querySelector('[data-mk="deadline"]');
    if(!g) return setTimeout(mo,50);
    new MutationObserver(ms=>{
      ms.forEach(m=>window.__log.push({t:Math.round(performance.now()),attr:m.attributeName,v:g.getAttribute(m.attributeName)}));
    }).observe(g,{attributes:true,attributeFilter:['style','opacity']});
  };
  mo();
});
await p.goto('http://127.0.0.1:8099/',{waitUntil:'load'});
await p.waitForTimeout(3000);
const log = await p.evaluate(()=>window.__log.slice(0,8).concat(window.__log.slice(-8)));
console.log(JSON.stringify(log,null,0));
console.log('final:', await p.evaluate(()=>document.querySelector('[data-mk="deadline"]').getAttribute('style')));
await b.close();
