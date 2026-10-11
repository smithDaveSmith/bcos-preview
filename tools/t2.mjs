import { chromium } from 'playwright';
const b = await chromium.launch({executablePath:process.cwd()+'/.chrome/chromium',args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://127.0.0.1:8099/',{waitUntil:'load'});
await p.waitForTimeout(2000);
console.log(JSON.stringify(await p.evaluate(()=>{
  const r={};
  r.gsap=!!window.gsap; r.st=!!window.ScrollTrigger; r.split=!!window.SplitText;
  r.draw=!!window.DrawSVGPlugin; r.ce=!!window.CustomEase; r.flip=!!window.Flip;
  try{ const e=gsap.parseEase('sweep'); r.easeAt0=e(0); r.easeAt05=e(.5); r.easeAt1=e(1); }
  catch(err){ r.easeErr=err.message; }
  const tls=gsap.globalTimeline.getChildren(true,true,true);
  r.activeTweens=tls.length;
  r.tlProgress=tls.slice(0,6).map(t=>({p:+t.progress().toFixed(2),paused:t.paused(),dur:t.duration()}));
  return r;
},)));
await b.close();
