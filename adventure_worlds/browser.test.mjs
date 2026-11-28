import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const dir=resolve('docs');
const server=createServer(async(req,res)=>{
 try{
  const path=resolve(dir,'.'+new URL(req.url,'http://localhost').pathname);
  if(!path.startsWith(dir+'/')){res.writeHead(403).end();return;}
  const file=await readFile(path);
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[extname(path)]||'application/octet-stream');
  res.end(file);
 }catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try {
 browser=await chromium.launch();
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/adventure_worlds/index.html');
 await page.getByRole('button',{name:/Dragon Kingdom/}).click();
 assert.equal(await page.locator('.actions .action').count(),3);
 assert.ok(await page.locator('.chapter .dialogue').isVisible());
 assert.ok(await page.locator('.scene-art svg .scene-prop').count());
 await page.getByRole('button',{name:'English help'}).click();
 assert.ok(await page.locator('.clue .translation').filter({hasText:"I'm hungry, not thirsty. I don't eat fish."}).isVisible());
 // Seed a real v1 save just before a fork, then play the alternate branch and reload.
 await page.evaluate(()=>localStorage.setItem('adventure-worlds-v1',JSON.stringify({xp:100,progress:{dragon:4},words:{},mode:'all',difficulty:'easy'})));
 await page.reload();await page.getByRole('button',{name:/Dragon Kingdom/}).click();
 assert.ok(await page.getByRole('heading',{name:/Choose your route/}).isVisible());
 await page.locator('.fork-option .action').nth(1).click();
 assert.ok(await page.getByRole('heading',{name:'A trail of silver scales'}).isVisible());
 await page.reload();await page.getByRole('button',{name:/Dragon Kingdom/}).click();
 assert.ok(await page.getByRole('heading',{name:'A trail of silver scales'}).isVisible());
 await page.getByRole('button',{name:'English help'}).click();
 const correct=page.locator('.choice').filter({hasText:'I ride; the dragon flies'}).locator('.action');
 await correct.click();assert.ok(await page.getByText('+25 XP · Quest complete!').isVisible());assert.ok(await page.locator('.reading-reason').isVisible());
 await page.getByRole('button',{name:'Continue →'}).click();
 assert.ok(await page.locator('.route-memory').filter({hasText:"river merchant"}).isVisible());
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('adventure-worlds-v1')).progress.dragon),5);
 assert.deepEqual(errors,[]);
}finally{await browser?.close();server.close();}
