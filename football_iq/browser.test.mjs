// Optional real-browser acceptance test; see README for installation.
import assert from "node:assert/strict";
import { readFile, mkdir } from "node:fs/promises";
import { createServer } from "node:http";
import { resolve, extname, sep } from "node:path";
import { chromium } from "playwright";

const docs = resolve("docs"), out = resolve("football_iq/screenshots");
await mkdir(out, { recursive: true });
const phaser = await readFile("node_modules/phaser/dist/phaser.min.js");
const types = { ".html":"text/html", ".js":"text/javascript" };
const server = createServer(async (req,res)=>{
  try {
    const path = resolve(docs, "." + new URL(req.url, "http://localhost").pathname);
    if (!path.startsWith(docs + sep)) {res.writeHead(403).end();return;}
    const file=await readFile(path);
    res.writeHead(200,{"content-type":types[extname(path)] || "application/octet-stream"}).end(file);
  } catch {res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
let browser;
try {
  browser=await chromium.launch({headless:true,args:["--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
  for(const [name,width,height,usePhaser] of [["portrait",390,844,true],["landscape",844,390,true],["offline",390,844,false]]){
    const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:1});
    const page=await context.newPage(),errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    page.on("console",msg=>{if(["warning","error"].includes(msg.type()))console.log(name,msg.type(),msg.text());});
    await page.route("https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js", route=>usePhaser
      ? route.fulfill({status:200,contentType:"text/javascript",body:phaser,headers:{"access-control-allow-origin":"*"}})
      : route.abort());
    // Observe the real engine input in the test only; production code
    // has no debug globals. The original simulation still runs unchanged.
    await page.route("**/football_iq/engine.js",async route=>{
      const response=await route.fetch();
      const source=(await response.text()).replace("export function step(", "function originalStep(");
      assert.ok(source.includes("function originalStep("));
      await route.fulfill({response,body:source+`
export function step(s,input){
  originalStep(s,input);
  const t=window.__footballIQInput??={pass:0,shoot:0,sprint:0,tick:0};
  for(const k of ["pass","shoot","sprint"])if(input[k])t[k]++;
  t.tick=s.tick;
}
`});
    });
    await page.goto("http://127.0.0.1:"+server.address().port+"/football_iq/index.html");
    await page.waitForFunction(()=>!document.querySelector("#start").disabled,{},{timeout:12000});
    if(usePhaser&&await page.locator("#renderer").textContent()!=="Phaser 3.90")await page.screenshot({path:resolve(out,name+"-boot-failure.png"),fullPage:true});
    assert.equal(await page.locator("#renderer").textContent(),usePhaser?"Phaser 3.90":"Canvas fallback");
    await page.selectOption("#length","60");await page.selectOption("#coach","off");
    await page.locator("#start").click();
    for(const [action,key] of [["pass","j"],["shoot","k"],["sprint","l"],["sprint","Shift"]]){
      const control=page.locator('[data-action="'+action+'"]');
      assert.equal(await control.locator("kbd").textContent(),action==="sprint"?"L":key.toUpperCase());
      const before=await page.evaluate(action=>window.__footballIQInput?.[action]??0,action);
      await page.keyboard.down(key);
      await page.waitForFunction(({action,before})=>(window.__footballIQInput?.[action]??0)>before,{action,before});
      await page.waitForFunction(action=>document.querySelector('[data-action="'+action+'"]').classList.contains("key-pressed"),action);
      await page.keyboard.up(key);
      await page.waitForFunction(action=>!document.querySelector('[data-action="'+action+'"]').classList.contains("key-pressed"),action);
    }
    const before=await page.evaluate(()=>({...window.__footballIQInput}));
    for(const key of ["z","x","c"]){await page.keyboard.down(key);await page.waitForTimeout(100);await page.keyboard.up(key);}
    const after=await page.evaluate(()=>({...window.__footballIQInput}));
    for(const action of ["pass","shoot","sprint"])assert.equal(after[action],before[action],action+" old shortcut");
    assert.ok(after.tick>before.tick);
    await page.waitForFunction(()=>document.querySelector("#clock").textContent!=="1:00");
    await page.locator("#pause").click();
    assert.equal(await page.locator("#pause").textContent(),"Resume");
    const clock=await page.locator("#clock").textContent();
    await page.waitForTimeout(1100);
    assert.equal(await page.locator("#clock").textContent(),clock);
    await page.locator("#pause").click();
    await page.locator("#pad").scrollIntoViewIfNeeded();
    const sizes=await page.evaluate(()=>{
      const b=document.querySelector("#pitch").getBoundingClientRect();
      return {width:b.width,height:b.height,overflow:document.documentElement.scrollWidth>innerWidth,
        action:document.querySelector("[data-action=shoot]").getBoundingClientRect().width};
    });
    assert.ok(sizes.width>200&&sizes.height>100&&sizes.action>=44&&!sizes.overflow,JSON.stringify(sizes));
    // Exercise simultaneous joystick + action using genuine touchscreen events.
    const pad=await page.locator("#pad").boundingBox(),button=await page.locator("[data-action=pass]").boundingBox();
    const session=await context.newCDPSession(page);
    const finger1={x:pad.x+pad.width*.8,y:pad.y+pad.height*.5,id:1};
    const finger2={x:button.x+button.width*.5,y:button.y+button.height*.5,id:2};
    await session.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[finger1]});
    await session.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[finger1,finger2]});
    await page.waitForTimeout(350);
    await session.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
    assert.equal(await page.locator(".actions .pressed").count(),0);
    await page.waitForTimeout(100);
    await page.selectOption("#coach","balanced");
    await page.screenshot({path:resolve(out,name+".png"),fullPage:true});
    assert.deepEqual(errors,[],name+" page errors");
    await context.close();
    console.log("Football IQ browser:",name,"passed");
  }
}finally{await browser?.close();server.close();}
