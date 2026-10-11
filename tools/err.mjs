import { chromium } from 'playwright';
const b = await chromium.launch({executablePath:process.cwd()+'/.chrome/chromium',args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
p.on('pageerror', e => console.log('PAGEERROR:', e.message, '\nSTACK:', (e.stack||'').split('\n').slice(0,6).join('\n')));
await p.goto('http://127.0.0.1:8099/'+(process.argv[2]||''), {waitUntil:'load'});
await p.waitForTimeout(2500);
await b.close();
