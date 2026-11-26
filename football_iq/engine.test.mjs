import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
// The repository is CommonJS by default; browser modules are loaded via a data URL.
const source = await readFile(new URL("../docs/football_iq/engine.js", import.meta.url), "utf8");
const { createMatch, copyState, step, blank, coachingTip, W, H, DT, ACTION_TIMING } = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
for (const role of ["defender", "midfielder", "forward"]) {
  const a = createMatch(role, 180), b = copyState(a);
  assert.equal(a.players.length, 10);
  assert.equal(a.players[a.user].role, role);
  for (let i = 0; i < 10800; i++) {
    const input = { ...blank(), x: Math.sin(i/60), y: Math.cos(i/60), pass: i%120===0, shoot:i%95===0 };
    step(a,input); step(b,input);
    assert.ok(a.players.every(p => Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.x <= W && p.y >= 0 && p.y <= H));
    assert.ok(a.ball.owner===null || a.players[a.ball.owner]);
  }
  assert.deepEqual(a,b);
  assert.equal(a.time,180);
  step(a,blank()); assert.deepEqual(a,b);
}
{
  const s=createMatch();
  const saved=copyState(s);s.players[0].home.x=99;s.score[0]=2;
  assert.notEqual(s.players[0].home.x,saved.players[0].home.x);
  assert.equal(saved.score[0],0);
}
{
  const s=createMatch();
  Object.assign(s.ball,{owner:null,x:W-2,y:H/2,vx:350,vy:0,lock:1});
  step(s,blank());assert.equal(s.score[0],1);assert.ok(s.restart>0);
  for(let i=0;i<90;i++)step(s,blank());
  assert.equal(s.score[0],1);assert.equal(s.restart,0);
}
// Isolate the controlled player and an intended receiver/opponent.
function isolated(){
  const s=createMatch();
  for(const p of s.players)Object.assign(p,{x:p.team===0?50:550,y:30+p.id%5*24,vx:0,vy:0,cooldown:0,action:null});
  const u=s.players[s.user];Object.assign(u,{x:180,y:180});
  return {s,u};
}
{
  const {s,u}=isolated(),opponent=s.players[6];
  Object.assign(opponent,{x:170,y:180});Object.assign(s.ball,{owner:opponent.id,lock:0,x:170,y:180});
  step(s,{...blank(),shoot:true,x:1,sprint:true});
  assert.equal(s.ball.owner,opponent.id);assert.equal(u.action.kind,"tackle");
  for(let i=1;i<ACTION_TIMING.tackle[0];i++){
    Object.assign(opponent,{x:170,y:180});step(s,blank());assert.equal(s.ball.owner,opponent.id);
  }
  Object.assign(opponent,{x:170,y:180});step(s,blank());assert.equal(s.ball.owner,u.id);
  assert.equal(u.action.kind,"tackle");assert.equal(u.action.elapsed,ACTION_TIMING.tackle[0]);
  for(let i=ACTION_TIMING.tackle[0];i<ACTION_TIMING.tackle[1];i++)step(s,blank());
  assert.equal(u.action,null);
}
for(const kind of ["pass","shoot"]){
  const {s,u}=isolated();
  Object.assign(s.ball,{owner:u.id,lock:0,x:u.x,y:u.y});
  const input={...blank(),[kind]:true,x:1,sprint:true};
  const [contact,total]=ACTION_TIMING[kind],x=u.x,y=u.y;
  step(s,input);assert.equal(s.ball.owner,u.id);assert.equal(u.action.elapsed,0);
  const snapshot=copyState(s);assert.notEqual(snapshot.players[s.user].action,u.action);
  for(let i=1;i<contact;i++){
    step(s,input);assert.equal(s.ball.owner,u.id);assert.equal(u.x,x);assert.equal(u.y,y);
  }
  step(s,input);assert.equal(s.ball.owner,null);assert.equal(s.ball.last,u.id);
  assert.equal(u.action.kind,kind);assert.equal(u.action.elapsed,contact);
  if(kind==="pass")assert.ok(s.ball.receiver!==null);
  const releaseX=u.x;
  for(let i=contact+1;i<total;i++){step(s,input);assert.equal(u.action.kind,kind);}
  assert.ok(u.x-releaseX<=113*.20*(total-contact)*DT+1);
  step(s,blank());assert.equal(u.action,null);
  assert.equal(snapshot.players[s.user].action.elapsed,0);
}
{
  const {s,u}=isolated();Object.assign(s.ball,{owner:null,x:u.x-3,y:u.y,vx:120,vy:0,lock:0,last:2,receiver:u.id});
  step(s,blank());assert.equal(s.ball.owner,u.id);assert.equal(u.action.kind,"receive");
  assert.equal(s.ball.lock,0); // first-touch recovery must not make a player invulnerable
  const x=u.x;
  for(let i=1;i<ACTION_TIMING.receive[1];i++){
    step(s,{...blank(),pass:true,x:1,sprint:true});
    assert.equal(u.action.kind,"receive");assert.equal(s.ball.owner,u.id);
  }
  assert.ok(u.x-x<=113*.30*ACTION_TIMING.receive[1]*DT+1);
  step(s,{...blank(),pass:true});assert.equal(u.action.kind,"pass");assert.equal(s.ball.owner,u.id);
}
{
  const {s,u}=isolated();Object.assign(s.ball,{owner:u.id,lock:0,x:u.x,y:u.y});
  step(s,{...blank(),pass:true});
  const opponent=s.players[6];Object.assign(opponent,{x:170,y:180,action:{kind:"tackle",elapsed:5,receiver:null,dx:1,dy:0}});
  // Opponent makes contact during windup; original pass must never fire.
  step(s,blank());assert.equal(s.ball.owner,opponent.id);
  for(let i=1;i<ACTION_TIMING.pass[0];i++)step(s,blank());
  assert.notEqual(s.ball.last,u.id);
}
{
  const {s,u}=isolated();const owner=s.players[2];
  Object.assign(s.ball,{owner:owner.id,lock:0,x:owner.x,y:owner.y});
  step(s,{...blank(),pass:true});
  assert.equal(owner.action.kind,"pass");assert.equal(owner.action.receiver,u.id);
  assert.equal(s.ball.owner,owner.id);
  for(let i=0;i<ACTION_TIMING.pass[0];i++)step(s,blank());
  assert.equal(s.ball.owner,null);assert.equal(s.ball.receiver,u.id);
}
{
  const s=createMatch();
  const u=s.players[s.user], other=s.players[2], opponent=s.players[6];
  Object.assign(u,{x:240,y:280});Object.assign(other,{x:210,y:100});
  Object.assign(opponent,{x:150,y:85});Object.assign(s.ball,{owner:opponent.id,x:150,y:85});
  assert.equal(coachingTip(s)?.id,"cover");
  assert.equal(coachingTip(s)?.freeze,true);
}
assert.equal(DT,1/60);
console.log("Football IQ: deterministic matches, snapshots, goals, action timing, first touch, interrupted passes and coaching tests passed.");
