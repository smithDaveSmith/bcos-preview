import { chromium } from 'playwright';
const br = await chromium.launch({executablePath:process.cwd()+'/.chrome/chromium',args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
const B='http://127.0.0.1:8099';
const out={};

const CONTRAST = `(() => {
  const toRGB = c => { const m = c.match(/[\\d.]+/g); return m ? m.slice(0,3).map(Number) : null; };
  const lin = v => { v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); };
  const lum = ([r,g,b]) => 0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b);
  const bgOf = el => { let n=el; while(n && n!==document.documentElement){ const c=getComputedStyle(n).backgroundColor; const v=toRGB(c); if(v && !/rgba\\(.*,\\s*0\\)/.test(c) && getComputedStyle(n).backgroundColor!=='rgba(0, 0, 0, 0)') return v; n=n.parentElement; } return [255,255,255]; };
  const bad=[];
  document.querySelectorAll('p,span,a,li,h1,h2,h3,h4,h5,h6,dt,dd,label,button,th,td,em,b,address').forEach(el=>{
    if(!el.textContent.trim()) return;
    const r = el.getBoundingClientRect(); if(r.width<2||r.height<2) return;
    const s = getComputedStyle(el);
    if (s.visibility==='hidden'||s.display==='none'||+s.opacity===0) return;
    if ([...el.children].some(c=>c.textContent.trim()===el.textContent.trim())) return;
    if (el.closest('[aria-hidden="true"]')) return;   // decorative: exempt from WCAG contrast
    const fg = toRGB(s.color); if(!fg) return;
    const bg = bgOf(el);
    const L1 = lum(fg), L2 = lum(bg);
    const ratio = (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
    const size = parseFloat(s.fontSize); const bold = parseInt(s.fontWeight,10)>=700;
    const large = size>=24 || (size>=18.66 && bold);
    const need = large?3:4.5;
    if (ratio < need) bad.push({t:el.tagName+'.'+String(el.className).slice(0,26), txt:el.textContent.trim().slice(0,32), ratio:+ratio.toFixed(2), need, size, fg:s.color, bg:'rgb('+bg.join(',')+')'});
  });
  const seen=new Set(); return bad.filter(b=>{const k=b.t+b.ratio; if(seen.has(k))return false; seen.add(k); return true;}).slice(0,24);
})()`;

for (const [name, route, scheme] of [['home','/','light'],['home-dark','/','dark'],['entry','/services/annual-return/','light'],['entry-dark','/services/annual-return/','dark'],['contact','/contact/','light'],['register','/services/','light'],['incorporate','/incorporate/','light'],['notices','/news-and-events/','light'],['firm','/firm/','light']]) {
  const ctx = await br.newContext({viewport:{width:1440,height:900},colorScheme:scheme});
  const p = await ctx.newPage();
  await p.goto(B+route,{waitUntil:'load'}); await p.waitForTimeout(1900);
  await p.evaluate(async()=>{document.documentElement.style.scrollBehavior='auto';const H=document.body.scrollHeight;for(let y=0;y<H;y+=innerHeight*0.6){window.scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,90));}window.scrollTo({top:0,behavior:'instant'});});
  await p.waitForTimeout(400);
  out[name] = await p.evaluate(CONTRAST);
  await ctx.close();
}

// ---- Flip filter + form behaviour ----
{
  const ctx = await br.newContext({viewport:{width:1440,height:900}});
  const p = await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(B+'/services/',{waitUntil:'load'}); await p.waitForTimeout(1800);
  const before = await p.evaluate(()=>({count:document.querySelector('[data-regcount]').textContent, visible:[...document.querySelectorAll('.reg__e')].filter(e=>e.offsetParent).length}));
  await p.click('[data-filter="standing"]'); await p.waitForTimeout(1100);
  const after = await p.evaluate(()=>({count:document.querySelector('[data-regcount]').textContent, visible:[...document.querySelectorAll('.reg__e')].filter(e=>e.offsetParent).length,
    pressed:[...document.querySelectorAll('.regbar__b')].map(b=>b.getAttribute('data-filter')+':'+b.getAttribute('aria-pressed')).join(' ')}));
  await p.screenshot({path:'research/shots/filter-standing.png'});
  await p.click('[data-filter="all"]'); await p.waitForTimeout(1000);
  const back = await p.evaluate(()=>({count:document.querySelector('[data-regcount]').textContent, visible:[...document.querySelectorAll('.reg__e')].filter(e=>e.offsetParent).length}));
  out.filter = {before, after, back, flip: await p.evaluate(()=>!!window.Flip), errs};
  await ctx.close();
}
{
  const ctx = await br.newContext({viewport:{width:1440,height:900}});
  const p = await ctx.newPage();
  await p.goto(B+'/contact/',{waitUntil:'load'}); await p.waitForTimeout(1500);
  await p.click('button[type=submit]'); await p.waitForTimeout(350);
  const empty = await p.evaluate(()=>({errs:[...document.querySelectorAll('.f__err')].map(e=>e.textContent).filter(Boolean),
    outHidden:document.querySelector('[data-form-out]').hidden, focus:document.activeElement.id}));
  await p.fill('#c-name','Test Person'); await p.fill('#c-email','not-an-email'); await p.fill('#c-msg','Hello');
  await p.click('button[type=submit]'); await p.waitForTimeout(300);
  const badEmail = await p.evaluate(()=>({errs:[...document.querySelectorAll('.f__err')].map(e=>e.textContent).filter(Boolean), outHidden:document.querySelector('[data-form-out]').hidden}));
  await p.fill('#c-email','test@example.com');
  await p.click('button[type=submit]'); await p.waitForTimeout(400);
  const good = await p.evaluate(()=>({outHidden:document.querySelector('[data-form-out]').hidden,
    text:document.querySelector('[data-form-out]').innerText.replace(/\s+/g,' ').slice(0,150),
    hasMailto:!!document.querySelector('[data-form-out] a[href^="mailto:"]'),
    claimsSent:/sent successfully|thank you|we.ll be in touch|message sent/i.test(document.querySelector('[data-form-out]').innerText)}));
  out.form = {empty, badEmail, good};
  await ctx.close();
}
await br.close();
console.log(JSON.stringify(out,null,1));
