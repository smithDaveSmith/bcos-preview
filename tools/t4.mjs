import { chromium } from 'playwright';
const b = await chromium.launch({executablePath:process.cwd()+'/.chrome/chromium',args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
const ctx = await b.newContext({viewport:{width:1440,height:900}});
const p = await ctx.newPage();
// Block SplitText to test whether autoSplit's revert is clearing the intro timeline
await p.route('**/SplitText.min.js', r=>r.fulfill({status:200,contentType:'text/javascript',body:'/* blocked */'}));
await p.goto('http://127.0.0.1:8099/',{waitUntil:'load'});
await p.waitForTimeout(2500);
console.log('without SplitText -> mk opacity:', await p.evaluate(()=>getComputedStyle(document.querySelector('[data-mk="deadline"]')).opacity));
await b.close();
