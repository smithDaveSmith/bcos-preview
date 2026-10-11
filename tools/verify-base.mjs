import { chromium } from 'playwright';
const br = await chromium.launch({executablePath:process.cwd()+'/.chrome/chromium',args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
const p = await (await br.newContext({viewport:{width:1440,height:900}})).newPage();
const bad=[]; const errs=[];
p.on('pageerror',e=>errs.push(e.message));
p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,140));});
p.on('response',r=>{ if(r.status()>=400) bad.push(r.status()+' '+r.url()); });
for (const r of ['/bcos-preview/','/bcos-preview/services/','/bcos-preview/services/annual-return/','/bcos-preview/contact/']) {
  await p.goto('http://127.0.0.1:8098'+r,{waitUntil:'load'}); await p.waitForTimeout(1800);
}
const d = await p.evaluate(()=>({fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family), gsap:!!window.gsap}));
console.log('failed requests:', bad.length, bad.slice(0,6));
console.log('errors:', errs.length, errs.slice(0,4));
console.log('loaded fonts:', [...new Set(d.fonts)].join(', '), '| gsap:', d.gsap);
await br.close();
