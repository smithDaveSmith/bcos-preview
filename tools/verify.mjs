import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const EXE = process.cwd() + '/.chrome/chromium';
const BASE = 'http://127.0.0.1:8099';

function routes(dir='docs', prefix='') {
  const out = [];
  for (const e of fs.readdirSync(dir, {withFileTypes:true})) {
    if (e.isDirectory()) out.push(...routes(path.join(dir,e.name), prefix+'/'+e.name));
    else if (e.name === 'index.html') out.push((prefix||'')+'/');
  }
  return out.sort();
}
const ROUTES = routes();
const VPS = [['desktop',1440,900],['laptop',1280,800],['tablet',834,1112],['mobile',390,844],['small',360,740]];

const b = await chromium.launch({executablePath:EXE,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const report = { routes: ROUTES.length, overflow: [], console: [], broken: [], a11y: [], meta: [], contrast: [], ok: 0 };
const seenLinks = new Map();

for (const r of ROUTES) {
  for (const [vn,w,h] of VPS) {
    const ctx = await b.newContext({viewport:{width:w,height:h}});
    const p = await ctx.newPage();
    const errs = [];
    p.on('console', m => { if (m.type()==='error') errs.push(m.text().slice(0,180)); });
    p.on('pageerror', e => errs.push('pageerror: '+e.message.slice(0,180)));
    await p.goto(BASE+r, {waitUntil:'load', timeout:45000});
    await p.waitForTimeout(vn==='desktop'?2200:900);
    // scroll through to fire every ScrollTrigger
    await p.evaluate(async () => {
      const prev = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      const H = document.body.scrollHeight;
      for (let y=0; y<H; y+=Math.round(innerHeight*0.6)) { window.scrollTo({top:y,behavior:'instant'}); await new Promise(r=>setTimeout(r,110)); }
      window.scrollTo({top:0,behavior:'instant'}); await new Promise(r=>setTimeout(r,200));
      document.documentElement.style.scrollBehavior = prev;
    });
    const d = await p.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      // Only a real document overflow counts; decorative elements inside a
      // clipping ancestor are not a horizontal-scroll problem.
      const clipped = e => { let n=e.parentElement; while(n && n!==document.body){ const s=getComputedStyle(n); if(s.overflowX!=='visible'||s.overflow!=='visible') return true; n=n.parentElement; } return false; };
      const realOverflow = docW > innerWidth + 1;
      const over = !realOverflow ? [] : [...document.querySelectorAll('body *')].filter(e=>{
        const r = e.getBoundingClientRect();
        return r.width>0 && r.height>0 && (r.right > innerWidth + 1.5 || r.left < -1.5) &&
               getComputedStyle(e).position !== 'fixed' && !clipped(e);
      }).slice(0,5).map(e=>e.tagName+'.'+String(e.className).slice(0,34)+' r='+Math.round(e.getBoundingClientRect().right));
      const invisible = [...document.querySelectorAll('[data-anim], .hl__l, .reg__t, h1, h2')]
        .filter(e=>{const s=getComputedStyle(e); return s.opacity==='0' && e.getBoundingClientRect().height>0;})
        .slice(0,5).map(e=>e.tagName+'.'+String(e.className).slice(0,30));
      return {
        docW, innerW: innerWidth, over, invisible,
        title: document.title, titleLen: document.title.length,
        desc: (document.querySelector('meta[name=description]')||{}).content||'',
        h1: document.querySelectorAll('h1').length,
        h1text: (document.querySelector('h1')||{}).textContent||'',
        lang: document.documentElement.lang,
        imgNoAlt: [...document.images].filter(i=>!i.alt && !i.getAttribute('aria-hidden')).length,
        emptyLinks: [...document.querySelectorAll('a')].filter(a=>!a.textContent.trim() && !a.getAttribute('aria-label') && !a.querySelector('[alt]:not([alt=""])')).length,
        svgNoTitle: [...document.querySelectorAll('svg[role=img]')].filter(s=>!s.querySelector('title')&&!s.getAttribute('aria-label')).length,
        links: [...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')),
        labels: [...document.querySelectorAll('input,select,textarea')].filter(e=>e.type!=='hidden')
          .filter(e=>!(e.id && document.querySelector('label[for="'+CSS.escape(e.id)+'"]')) && !e.closest('label') && !e.getAttribute('aria-label')).length,
        jsonldCount: document.querySelectorAll('script[type="application/ld+json"]').length,
        noindex: !!document.querySelector('meta[name=robots][content*=noindex]')
      };
    });
    if (d.over.length) report.overflow.push({r,vn,docW:d.docW,innerW:d.innerW,over:d.over});
    if (d.invisible.length) report.a11y.push({r,vn,issue:'stuck at opacity 0',els:d.invisible});
    if (errs.length) report.console.push({r,vn,errs});
    if (vn==='desktop') {
      if (d.h1 !== 1) report.a11y.push({r,issue:'h1 count '+d.h1});
      if (!d.desc) report.meta.push({r,issue:'no meta description'});
      if (d.titleLen > 65) report.meta.push({r,issue:'title '+d.titleLen+' chars'});
      if (d.imgNoAlt) report.a11y.push({r,issue:d.imgNoAlt+' images without alt'});
      if (d.emptyLinks) report.a11y.push({r,issue:d.emptyLinks+' empty links'});
      if (d.svgNoTitle) report.a11y.push({r,issue:d.svgNoTitle+' role=img svg without title'});
      if (d.labels) report.a11y.push({r,issue:d.labels+' unlabelled form fields'});
      if (!d.noindex) report.meta.push({r,issue:'NOT noindexed'});
      d.links.forEach(h=>{ if(!seenLinks.has(h)) seenLinks.set(h,r); });
    }
    report.ok++;
    await ctx.close();
  }
}

// internal link check
const internal = [...seenLinks.keys()].filter(h=>h.startsWith('/'));
const bad = [];
for (const h of internal) {
  const res = await fetch(BASE+h).catch(()=>null);
  if (!res || res.status !== 200) bad.push({href:h, from:seenLinks.get(h), status:res?res.status:'ERR'});
}
report.broken = bad;
await b.close();
console.log(JSON.stringify(report,null,1));
