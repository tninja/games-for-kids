// Exercise the published app's actual keyboard event handlers and engine,
// with DOM/rendering stubs. Unlike a keycap test, verify action state and speed.
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const engine=await readFile(new URL("../docs/football_iq/engine.js",import.meta.url),"utf8");
const app=await readFile(new URL("../docs/football_iq/app.js",import.meta.url),"utf8");
const E=await import("data:text/javascript;base64,"+Buffer.from(engine).toString("base64"));
async function exercise(E,app,assert){
  const handlers=new Map(), nodes=new Map();
  class Element {
    constructor(){this.value="";this.style={};this.hidden=false;this.classList={remove(){},toggle(){}};}
    addEventListener(){} setAttribute(){} focus(){} blur(){}
  }
  class Select extends Element {}
  class Button extends Element {}
  const document={
    getElementById(id){
      if(!nodes.has(id))nodes.set(id,["role","length","coach"].includes(id)?new Select():new Element());
      return nodes.get(id);
    },
    querySelectorAll(){return [];},querySelector(){return null;},addEventListener(){}
  };
  document.getElementById("role").value="defender";
  document.getElementById("length").value="60";
  document.getElementById("coach").value="off";
  const window={addEventListener(name,fn){handlers.set(name,fn);}};
  const program=new Function("E","document","window","HTMLSelectElement","HTMLButtonElement","requestAnimationFrame",
    "const {DT,createMatch,copyState,step,coachingTip}=E;const createVisual=async()=>({name:'test',draw(){}});\n"+
    app.replace(/^import .*;\n/gm,"")+"\nreturn {start,tick,input,state:()=>state};");
  const C=program(E,document,window,Select,Button,()=>{});
  await Promise.resolve();
  function setup(own=true){
    C.start();
    const s=C.state();
    for(const p of s.players)Object.assign(p,{x:p.team===0?50:550,y:30+p.id%5*24,vx:0,vy:0,cooldown:0,action:null});
    const u=s.players[s.user];Object.assign(u,{x:180,y:180,heading:0});
    Object.assign(s.ball,{owner:own?u.id:2,lock:10,x:own?189:50,y:own?180:78,last:own?u.id:2});
    return {s,u};
  }
  function key(name,k,code,target=new Element()){
    handlers.get(name)({key:k,code,target,preventDefault(){},repeat:false});
  }
  // A quick press/release must still reach one fixed simulation tick.
  for(const [k,kind] of [["j","pass"],["k","shoot"]]){
    const {s,u}=setup();
    key("keydown",k,"Key"+k.toUpperCase());key("keyup",k,"Key"+k.toUpperCase());
    C.tick();assert.equal(u.action?.kind,kind);
    assert.equal(s.ball.owner,u.id);
    for(let i=0;i<E.ACTION_TIMING[kind][0];i++)C.tick();
    assert.equal(s.ball.owner,null);assert.equal(s.ball.last,u.id);
  }
  // L actually increases movement speed, even when a select retained focus.
  for(const [sprint,expected] of [[false,88],[true,113]]){
    const {u}=setup(false);
    key("keydown","d","KeyD");
    if(sprint)key("keydown","l","KeyL",new Select());
    for(let i=0;i<25;i++)C.tick();
    assert.ok(Math.abs(u.vx-expected)<1e-8);
    key("keyup","l","KeyL");key("keyup","d","KeyD");
    assert.equal(C.input().sprint,false);
  }
  const {u}=setup();
  for(const [k,code] of [["z","KeyZ"],["x","KeyX"],["c","KeyC"]]){
    key("keydown",k,code);C.tick();key("keyup",k,code);
    assert.equal(u.action,null);
    assert.equal(C.input().sprint,false);
  }
}
await exercise(E,app,assert);
console.log("Football IQ: J passes, K shoots, L sprints, old keys inactive.");
