// Headless contract checks for both renderers (no browser or CDN required).
import { readFile } from "node:fs/promises";
const engine = await readFile(new URL("../docs/football_iq/engine.js", import.meta.url), "utf8");
const visual = await readFile(new URL("../docs/football_iq/visual.js", import.meta.url), "utf8");
const E = await import("data:text/javascript;base64," + Buffer.from(engine).toString("base64"));

const check=(ok,msg)=>{if(!ok)throw Error(msg)};
let draws=0,frames=0,sprites=0;
const ctx=new Proxy({}, {get:(_t,k)=>k==="drawImage"?()=>{draws++}:()=>{},set:()=>true});
function canvas(){return {width:672,height:440,getContext:()=>ctx,cloneNode:()=>canvas(),replaceWith:()=>{}};}
const document={createElement:tag=>tag==="canvas"?canvas():{},head:{appendChild:s=>s.onerror()}};
const window={Phaser:null,setTimeout:()=>1,clearTimeout:()=>{}};
const d=()=>{const item={};for(const k of ["setOrigin","setDepth","setPosition","setFrame","setVisible","setText","setScale","clear","fillStyle","fillEllipse","fillCircle","lineStyle","strokeCircle","lineBetween"])item[k]=()=>item;return item;};
const scene={textures:{addCanvas:(_key,_c)=>({add:()=>{frames++;}})},add:{image:d,sprite:()=>{sprites++;return d();},graphics:d,text:d}};
const mock={AUTO:0,Game:class{constructor(config){Promise.resolve().then(()=>config.scene.create.call(scene));}destroy(){}}};
async function exercise(make,E){
 const V=make(document,window,E);
 const s=E.createMatch(),before=JSON.stringify(s),tip={id:"cover",text:"Cover!",target:{x:100,y:150},freeze:true};
 for(const p of s.players)for(let a=0;a<8;a++)for(let t=0;t<20;t+=5){
   const f=V.spriteIndex({...p,vx:Math.cos(a*Math.PI/4)*90,vy:Math.sin(a*Math.PI/4)*90},t);
   check(f.x>=0&&f.x+f.w<=1600&&f.y>=0&&f.y+f.h<=600,"atlas bounds");
 }
 const fallback=await V.createVisual(canvas());check(fallback.name==="Canvas fallback","fallback renderer");
 fallback.draw(s,tip,true);check(draws>=12,"canvas draws");check(JSON.stringify(s)===before,"fallback mutated state");
 window.Phaser=mock;const phaser=await V.createVisual(canvas());check(phaser.name==="Phaser 3.90","Phaser renderer");
 phaser.draw(s,tip,true);check(frames===400&&sprites===10,"Phaser atlas/sprite count");check(JSON.stringify(s)===before,"Phaser mutated state");
 window.Phaser={AUTO:0,Game:class{constructor(){throw Error("boot failed");}}};
 const failed=await V.createVisual(canvas());check(failed.name==="Canvas fallback","boot failure fallback");failed.draw(s,null,false);
 const goal={...s,restart:.6};check(V.marks(goal,null,false).length>V.marks(s,null,false).length,"goal effect");
 return {frames,sprites,draws};
}

const make = new Function("document","window","E","const {W,H,GOAL}=E;\n"+visual.replace(/^import .*;\n/m,"").replace(/export /g,"")+"\nreturn {spriteIndex,marks,createVisual};");
console.log("Football IQ visual contracts:", await exercise(make,E));
