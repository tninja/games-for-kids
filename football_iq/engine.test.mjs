import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
// The repository is CommonJS by default; browser modules are loaded via a data URL.
const source = await readFile(new URL("../docs/football_iq/engine.js", import.meta.url), "utf8");
const { createMatch, copyState, step, blank, coachingTip, W, H, DT } = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
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
{
  const s=createMatch();
  const u=s.players[s.user], opponent=s.players[6];
  Object.assign(u,{x:180,y:180});Object.assign(opponent,{x:170,y:180});
  Object.assign(s.ball,{owner:opponent.id,lock:0,x:170,y:180});
  step(s,{...blank(),shoot:true});assert.equal(s.ball.owner,u.id);
  assert.equal(coachingTip(s)?.id,"win-ball");
}
{
  const s=createMatch();
  const u=s.players[s.user];Object.assign(u,{x:100,y:100,cooldown:0});
  Object.assign(s.ball,{owner:u.id,lock:0,x:100,y:100});
  step(s,{...blank(),pass:true});assert.equal(s.ball.owner,null);assert.equal(s.ball.last,u.id);
  assert.ok(s.ball.receiver!==null);
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
console.log("Football IQ: deterministic matches, snapshots, goals, tackle, pass and coaching tests passed.");
