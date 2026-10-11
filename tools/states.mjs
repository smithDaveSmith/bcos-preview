import { chromium } from 'playwright';
const EXE = process.cwd()+'/.chrome/chromium';
const B='http://127.0.0.1:8099';
const br = await chromium.launch({executablePath:EXE,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
const out = {};

// ---------- 1. The signature interaction: before / during / after ----------
{
  const ctx = await br.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});
  const p = await ctx.newPage();
  await p.goto(B+'/',{waitUntil:'load'}); await p.waitForTimeout(2600);
  const dial = p.locator('.inst__stage');
  await dial.screenshot({path:'research/shots/sig-1-before.png'});
  out.before = await p.evaluate(()=>({n:document.querySelector('[data-out="num"]').textContent,
    unit:document.querySelector('[data-out="unit"]').textContent,
    rule:document.querySelector('[data-out="rule"]').textContent.trim().slice(0,90),
    beam:document.querySelector('[data-beam]').getAttribute('transform')}));

  // change the ARD so the two rules diverge, then capture mid-sweep and settled
  await p.evaluate(()=>{const e=document.querySelector('#f-ard'); e.value='2026-11-30'; e.dispatchEvent(new Event('change',{bubbles:true}));});
  await p.waitForTimeout(380);
  await dial.screenshot({path:'research/shots/sig-2-during.png'});
  out.during = await p.evaluate(()=>({beam:document.querySelector('[data-beam]').getAttribute('transform')}));
  await p.waitForTimeout(1600);
  await dial.screenshot({path:'research/shots/sig-3-after.png'});
  out.after = await p.evaluate(()=>({n:document.querySelector('[data-out="num"]').textContent,
    unit:document.querySelector('[data-out="unit"]').textContent,
    rule:document.querySelector('[data-out="rule"]').textContent.replace(/\s+/g,' ').trim().slice(0,220),
    live:document.querySelector('[data-out="live"]').textContent.trim(),
    beam:document.querySelector('[data-beam]').getAttribute('transform'),
    altVisible:document.querySelector('[data-mk="alt"]').style.display!=='none'}));

  // an overdue company: the beam drops below the horizon and the penalty is live
  await p.evaluate(()=>{const a=document.querySelector('#f-ard'); a.value='2026-01-31'; a.dispatchEvent(new Event('change',{bubbles:true}));
    const f=document.querySelector('#f-fye'); f.value='2025-03-31'; f.dispatchEvent(new Event('change',{bubbles:true}));});
  await p.waitForTimeout(1700);
  await dial.screenshot({path:'research/shots/sig-4-overdue.png'});
  out.overdue = await p.evaluate(()=>({n:document.querySelector('[data-out="num"]').textContent,
    unit:document.querySelector('[data-out="unit"]').textContent,
    cost:document.querySelector('[data-out="cost"]').textContent,
    beam:document.querySelector('[data-beam]').getAttribute('transform')}));
  await ctx.close();
}

// ---------- 2. Reduced motion ----------
{
  const ctx = await br.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce',deviceScaleFactor:1.5});
  const p = await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(B+'/',{waitUntil:'load'}); await p.waitForTimeout(1800);
  out.reducedMotion = await p.evaluate(()=>{
    const hidden=[...document.querySelectorAll('[data-anim],.hl__l,.cons__i')].filter(e=>getComputedStyle(e).opacity==='0'&&e.getBoundingClientRect().height>0).length;
    return {hidden, num:document.querySelector('[data-out="num"]').textContent,
      beam:document.querySelector('[data-beam]').getAttribute('transform'),
      bodyClass:document.body.className};
  });
  await p.screenshot({path:'research/shots/reduced-motion.png'});
  out.reducedMotionErrors = errs;
  await ctx.close();
}

// ---------- 3. No JavaScript at all ----------
{
  const ctx = await br.newContext({viewport:{width:1440,height:900},javaScriptEnabled:false,deviceScaleFactor:1.5});
  const p = await ctx.newPage();
  await p.goto(B+'/',{waitUntil:'load'}); await p.waitForTimeout(700);
  out.noJS = await p.evaluate?undefined:undefined;
  const t = await p.locator('body').innerText();
  out.noJsWords = t.trim().split(/\s+/).length;
  out.noJsHasPhone = t.includes('+353 1 627 6627');
  out.noJsHasHeadline = t.includes('Every company');
  out.noJsHasRule = t.includes('56 days');
  await p.screenshot({path:'research/shots/no-js.png'});
  await ctx.close();
}

// ---------- 4. Dark mode ----------
{
  const ctx = await br.newContext({viewport:{width:1440,height:900},colorScheme:'dark',deviceScaleFactor:1.5});
  const p = await ctx.newPage();
  await p.goto(B+'/services/annual-return/',{waitUntil:'load'}); await p.waitForTimeout(1500);
  await p.screenshot({path:'research/shots/dark-entry.png'});
  await ctx.close();
}

// ---------- 5. Keyboard focus ----------
{
  const ctx = await br.newContext({viewport:{width:1440,height:900}});
  const p = await ctx.newPage();
  await p.goto(B+'/',{waitUntil:'load'}); await p.waitForTimeout(1600);
  const seq=[];
  for (let i=0;i<14;i++){
    await p.keyboard.press('Tab');
    seq.push(await p.evaluate(()=>{const a=document.activeElement; if(!a) return 'none';
      const s=getComputedStyle(a); const r=a.getBoundingClientRect();
      return {tag:a.tagName, txt:(a.textContent||a.value||'').replace(/\s+/g,' ').trim().slice(0,32),
        outline:s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0, inView:r.top>=-5&&r.top<innerHeight};}));
  }
  out.tabOrder = seq;
  out.focusVisibleAll = seq.every(s=>s==='none'||s.outline);
  await ctx.close();
}
await br.close();
console.log(JSON.stringify(out,null,1));
