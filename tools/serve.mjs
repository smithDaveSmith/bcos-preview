import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = process.argv[2] || 'docs'; const PORT = +(process.argv[3] || 8099);
const TYPES = {'.html':'text/html;charset=utf-8','.css':'text/css;charset=utf-8','.js':'text/javascript;charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2','.txt':'text/plain;charset=utf-8','.json':'application/json'};
http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]);
  let f = path.join(ROOT, p);
  try { if (fs.statSync(f).isDirectory()) f = path.join(f,'index.html'); } catch(e){}
  if (!fs.existsSync(f)) { const nf=path.join(ROOT,'404.html');
    res.writeHead(404,{'content-type':'text/html;charset=utf-8'});
    return res.end(fs.existsSync(nf)?fs.readFileSync(nf):'404'); }
  res.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});
  fs.createReadStream(f).pipe(res);
}).listen(PORT,()=>console.log('serving '+ROOT+' on http://127.0.0.1:'+PORT));
