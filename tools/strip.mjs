import { chromium } from 'playwright';
const b = await chromium.launch({executablePath:process.cwd()+'/.chrome/chromium',args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
const route = process.argv[2]||'/'; const label=process.argv[3]||'strip';
const vp = process.argv[4]==='mobile'?{width:390,height:844}:{width:1440,height:900};
const p = await (await b.newContext({viewport:vp,deviceScaleFactor:1.5})).newPage();
await p.goto('http://127.0.0.1:8099'+route,{waitUntil:'load'});
await p.waitForTimeout(1200);
const h = await p.evaluate(()=>document.body.scrollHeight);
const step = vp.height;
let i=0;
for(let y=0;y<h;y+=step){
  await p.evaluate(yy=>window.scrollTo(0,yy),y);
  await p.waitForTimeout(950);
  await p.screenshot({path:`research/shots/${label}-${String(i).padStart(2,'0')}.png`});
  i++;
  if(i>9) break;
}
console.log('pageHeight',h,'frames',i);
await b.close();
