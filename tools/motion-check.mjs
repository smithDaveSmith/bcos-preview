import { chromium } from 'playwright';
const EXE = process.cwd()+'/.chrome/chromium';
const B='http://127.0.0.1:8099';
const br = await chromium.launch({executablePath:EXE,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
const out = {};

// 1. Pin cleanup across a resize that crosses the matchMedia breakpoint
{
  const ctx = await br.newContext({viewport:{width:1440,height:900}});
  const p = await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(B+'/',{waitUntil:'load'}); await p.waitForTimeout(2200);
  const a = await p.evaluate(()=>ScrollTrigger.getAll().length);
  await p.setViewportSize({width:700,height:900}); await p.waitForTimeout(1400);
  const b2 = await p.evaluate(()=>ScrollTrigger.getAll().length);
  await p.setViewportSize({width:1440,height:900}); await p.waitForTimeout(1400);
  const c = await p.evaluate(()=>ScrollTrigger.getAll().length);
  const pinned = await p.evaluate(()=>ScrollTrigger.getAll().filter(t=>t.pin).length);
  const spacers = await p.evaluate(()=>document.querySelectorAll('.pin-spacer').length);
  out.resize = {desktop:a, mobile:b2, backToDesktop:c, pinnedTriggers:pinned, pinSpacers:spacers, errs};
  await ctx.close();
}

// 2. Scene reverse-scrubs correctly (scroll down then back up)
{
  const ctx = await br.newContext({viewport:{width:1440,height:900}});
  const p = await ctx.newPage();
  await p.goto(B+'/',{waitUntil:'load'}); await p.waitForTimeout(2000);
  const top = await p.evaluate(()=>document.querySelector('[data-year-scene]').getBoundingClientRect().top+scrollY);
  const read = ()=>p.evaluate(()=>({d:+document.querySelector('[data-yr-day]').textContent,
    lit:[...document.querySelectorAll('[data-mark].is-on')].length}));
  await p.evaluate(y=>{document.documentElement.style.scrollBehavior='auto';scrollTo({top:y,behavior:'instant'})}, top+2400);
  await p.waitForTimeout(900); const fwd = await read();
  await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}), top+200);
  await p.waitForTimeout(900); const back = await read();
  out.reverse = {forward:fwd, backward:back, reversesCorrectly: back.d < fwd.d && back.lit <= fwd.lit};
  await ctx.close();
}

// 3. Reduced motion: scene resolved, counters resolved, nothing hidden
{
  const ctx = await br.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  const p = await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(B+'/',{waitUntil:'load'}); await p.waitForTimeout(1800);
  out.reduced = await p.evaluate(()=>({
    hidden:[...document.querySelectorAll('[data-anim],.card,.yr__c,.reg__e')]
      .filter(e=>getComputedStyle(e).opacity==='0'&&e.getBoundingClientRect().height>0).length,
    litMarks:document.querySelectorAll('[data-mark].is-on').length,
    activeCards:document.querySelectorAll('[data-yr-card][data-active]').length,
    counters:[...document.querySelectorAll('[data-count]')].map(e=>e.textContent),
    pinned:ScrollTrigger.getAll().filter(t=>t.pin).length,
    scrollHeight:document.body.scrollHeight
  }));
  out.reducedErrs = errs;
  await ctx.close();
}

// 4. No JS at all — the scene must still be readable
{
  const ctx = await br.newContext({viewport:{width:1440,height:900},javaScriptEnabled:false});
  const p = await ctx.newPage();
  await p.goto(B+'/',{waitUntil:'load'}); await p.waitForTimeout(600);
  const t = await p.locator('[data-year-scene]').innerText();
  out.noJsScene = {words:t.trim().split(/\s+/).length, hasAllTitles:
    ['Incorporated','Beneficial ownership due','First annual return due','Financial year end','The filing deadline'].every(x=>t.includes(x))};
  await ctx.close();
}

// 5. Frame cost while scrubbing the pinned scene
{
  const ctx = await br.newContext({viewport:{width:1440,height:900}});
  const p = await ctx.newPage();
  await p.goto(B+'/',{waitUntil:'load'}); await p.waitForTimeout(2000);
  const top = await p.evaluate(()=>document.querySelector('[data-year-scene]').getBoundingClientRect().top+scrollY);
  const perf = await p.evaluate(async (t)=>{
    document.documentElement.style.scrollBehavior='auto';
    const frames=[]; let last=performance.now(); let stop=false;
    const tick=()=>{const n=performance.now();frames.push(n-last);last=n;if(!stop)requestAnimationFrame(tick);};
    requestAnimationFrame(tick);
    for(let i=0;i<=60;i++){ scrollTo({top:t+i*45,behavior:'instant'}); await new Promise(r=>requestAnimationFrame(r)); }
    stop=true;
    const f=frames.slice(3).sort((a,b)=>a-b);
    return {median:+f[Math.floor(f.length/2)].toFixed(1), p95:+f[Math.floor(f.length*.95)].toFixed(1), n:f.length};
  }, top);
  out.scrubPerf = perf;
  await ctx.close();
}
await br.close();
console.log(JSON.stringify(out,null,1));
