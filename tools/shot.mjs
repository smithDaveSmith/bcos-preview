import { chromium } from 'playwright';
const EXE = process.cwd() + '/.chrome/chromium';
const BASE = 'http://127.0.0.1:8099';
const args = process.argv.slice(2);
const routes = (args[0] || '/').split(',');
const label = args[1] || 'shot';
const vps = (args[2] || 'desktop').split(',');
const full = args[3] === 'full';
const VP = { desktop:{width:1440,height:900}, laptop:{width:1280,height:820}, mobile:{width:390,height:844}, tablet:{width:834,height:1112} };
const b = await chromium.launch({executablePath:EXE,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--force-color-profile=srgb']});
for (const r of routes) {
  for (const v of vps) {
    const ctx = await b.newContext({viewport:VP[v],deviceScaleFactor:2,reducedMotion:'no-preference',colorScheme:'light'});
    const p = await ctx.newPage();
    const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200));});
    p.on('pageerror',e=>errs.push('PAGEERROR: '+e.message.slice(0,200)));
    await p.goto(BASE+r,{waitUntil:'load',timeout:45000});
    await p.waitForTimeout(2600);
    const name = `research/shots/${label}-${r.replace(/\//g,'_')||'home'}-${v}.png`;
    await p.screenshot({path:name, fullPage:full});
    if(errs.length) console.log('  !! '+r+' '+v+' console:', errs.join(' | '));
    await ctx.close();
  }
}
await b.close(); console.log('shots done');
