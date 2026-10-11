import { chromium } from 'playwright';
const EXE = process.cwd() + '/.chrome/chromium';
const pages = [
  ['home','https://www.bcos.ie/'],
  ['services','https://www.bcos.ie/services/'],
  ['about','https://www.bcos.ie/newaboutus/'],
  ['contact','https://www.bcos.ie/contact/'],
  ['news','https://www.bcos.ie/news-and-events/'],
];
const b = await chromium.launch({executablePath:EXE,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const out = [];
for (const [name,url] of pages){
  const ctx = await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
  const p = await ctx.newPage();
  const errs=[]; const reqs=[];
  p.on('console', m=>{ if(m.type()==='error') errs.push(m.text().slice(0,160)); });
  p.on('pageerror', e=>errs.push('pageerror: '+e.message.slice(0,160)));
  p.on('request', r=>reqs.push(r));
  let t0=Date.now(), status=null;
  try { const r = await p.goto(url,{waitUntil:'load',timeout:60000}); status = r && r.status(); } catch(e){ out.push({name,error:e.message}); await ctx.close(); continue; }
  const loadMs = Date.now()-t0;
  await p.waitForTimeout(3500);
  const data = await p.evaluate(()=>{
    const vis = el => { const s=getComputedStyle(el); return s.display!=='none'&&s.visibility!=='hidden'&&el.offsetParent!==null; };
    const main = document.querySelector('main')||document.body;
    const imgs=[...document.images];
    const h1=[...document.querySelectorAll('h1')].map(e=>e.textContent.trim().slice(0,80));
    const hs=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(vis).map(e=>e.tagName+': '+e.textContent.trim().slice(0,60));
    const docW=document.documentElement.scrollWidth;
    const over=[...document.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect(); return r.width>0&&r.right>docW+2;}).slice(0,6).map(e=>e.tagName+'.'+(e.className||'').toString().slice(0,40));
    const inputs=[...document.querySelectorAll('input,textarea,select')].filter(vis).map(e=>({t:e.type||e.tagName, name:e.name, aria:e.getAttribute('aria-label')||'', labelled: !!(e.id&&document.querySelector(`label[for="${CSS.escape(e.id)}"]`)) || !!e.closest('label'), ph:e.placeholder||''}));
    return {
      title: document.title,
      titleLen: document.title.length,
      metaDesc: (document.querySelector('meta[name=description]')||{}).content || null,
      lang: document.documentElement.lang,
      h1count: document.querySelectorAll('h1').length, h1, headings: hs.slice(0,40),
      imgCount: imgs.length,
      imgNoAlt: imgs.filter(i=>!i.alt).length,
      imgFilenameAlt: imgs.filter(i=>i.alt && /\.(png|jpe?g|webp|gif|svg)$/i.test(i.alt)).map(i=>i.alt).slice(0,8),
      imgNoDims: imgs.filter(i=>!i.getAttribute('width')||!i.getAttribute('height')).length,
      scripts: document.scripts.length,
      stylesheets: document.querySelectorAll('link[rel=stylesheet]').length,
      jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].length,
      skipLink: !!document.querySelector('a[href^="#"]'),
      mainWords: (main.innerText||'').trim().split(/\s+/).length,
      docScrollW: docW, innerW: innerWidth,
      overflow: over,
      inputs,
      iframes: [...document.querySelectorAll('iframe')].map(f=>({src:(f.src||'').slice(0,90), title:f.title||null})),
      emptyLinks: [...document.querySelectorAll('a')].filter(a=>!a.textContent.trim()&&!a.querySelector('img')&&!a.getAttribute('aria-label')).length,
      loremCount: ((document.body.innerText.match(/lorem ipsum/gi)||[]).length),
      placeholderText: /Some stuff here/i.test(document.body.innerText),
      danglingContact: (document.body.innerText.match(/contact (?:either )?[A-Z][a-z]+ [A-Z][a-z]+ at,|at, [A-Z][a-z]+ [A-Z][a-z]+ at /g)||[]).slice(0,4),
    };
  });
  const bytes = {};
  let total=0;
  for (const r of reqs){ try{ const resp=r.response&&await r.response(); }catch(e){} }
  data.requests = reqs.length;
  data.loadMs = loadMs; data.status=status; data.consoleErrors=errs.slice(0,8); data.url=url;
  out.push({name, ...data});
  await p.screenshot({path:`research/shots/live-${name}-desktop.png`, fullPage:false});
  await p.setViewportSize({width:390,height:844});
  await p.waitForTimeout(1200);
  const mob = await p.evaluate(()=>{const d=document.documentElement.scrollWidth; return {docScrollW:d, innerW:innerWidth, overflow: d>innerWidth+2};});
  out[out.length-1].mobile = mob;
  await p.screenshot({path:`research/shots/live-${name}-mobile.png`, fullPage:false});
  await ctx.close();
}
await b.close();
console.log(JSON.stringify(out,null,1));
