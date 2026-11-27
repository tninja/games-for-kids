// Verify exact engine contact cues and audio lifecycle without a sound device.
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const read=path=>readFile(new URL("../docs/football_iq/"+path,import.meta.url),"utf8");
const E=await import("data:text/javascript;base64,"+Buffer.from(await read("engine.js")).toString("base64"));
function exercise(E,assert,createAudio){
  const {createMatch,step,blank,ACTION_TIMING,copyState,W,H}=E;
  function isolated(){
    const s=createMatch();
    for(const p of s.players)Object.assign(p,{x:p.team===0?50:550,y:30+p.id%5*24,vx:0,vy:0,cooldown:0,action:null});
    const u=s.players[s.user];Object.assign(u,{x:180,y:180,heading:0});
    return {s,u};
  }
  const has=(s,kind)=>s.sounds.some(e=>e.kind===kind);
  for(const kind of ["pass","shoot"]){
    const {s,u}=isolated();
    Object.assign(s.ball,{owner:u.id,x:189,y:180,lock:0,last:u.id});
    const cue=kind==="shoot"?"shot":"pass";
    step(s,{...blank(),[kind]:true});assert.ok(!has(s,cue));
    for(let i=1;i<ACTION_TIMING[kind][0];i++){step(s,blank());assert.ok(!has(s,cue));}
    step(s,blank());assert.ok(has(s,cue));assert.equal(s.ball.owner,null);
    const snapshot=copyState(s);assert.ok(snapshot.sounds!==s.sounds);
    step(s,blank());assert.ok(!has(s,cue));assert.ok(has(snapshot,cue));
  }
  {
    const {s,u}=isolated(),mate=s.players[2];
    Object.assign(s.ball,{owner:mate.id,x:mate.x,y:mate.y,lock:0});
    step(s,{...blank(),pass:true});
    for(let i=0;i<ACTION_TIMING.pass[0];i++)step(s,blank());
    assert.ok(has(s,"pass"));assert.equal(s.ball.last,mate.id);assert.equal(s.ball.receiver,u.id);
  }
  for(const [last,kind] of [[2,"receive"],[6,"intercept"]]){
    const {s,u}=isolated();
    Object.assign(s.ball,{owner:null,x:u.x-3,y:u.y,vx:120,vy:0,lock:0,last,receiver:u.id});
    step(s,blank());assert.ok(has(s,kind));
  }
  {
    const {s}=isolated(),keeper=s.players[0];
    Object.assign(s.ball,{owner:null,x:keeper.x+3,y:keeper.y,vx:-240,vy:0,lock:0,last:6,receiver:null});
    step(s,blank());assert.ok(has(s,"save"));
  }
  for(const [reachable,kind] of [[true,"tackle"],[false,"miss"]]){
    const {s,u}=isolated(),opponent=s.players[6];
    Object.assign(opponent,{x:195,y:180,heading:reachable?Math.PI:0,cooldown:10});
    Object.assign(s.ball,{owner:opponent.id,x:reachable?186:204,y:180,lock:0,last:opponent.id});
    u.action={kind:"tackle",elapsed:ACTION_TIMING.tackle[0]-1,receiver:null,dx:1,dy:0};
    step(s,blank());assert.ok(has(s,kind));
  }
  {
    const {s}=isolated();Object.assign(s.ball,{owner:null,x:W-2,y:40,vx:250,vy:0,lock:1});
    step(s,blank());assert.ok(has(s,"bounce"));
  }
  for(const [x,vx,kind] of [[W-2,350,"goalBlue"],[2,-350,"goalRed"]]){
    const {s}=isolated();Object.assign(s.ball,{owner:null,x,y:H/2,vx,vy:0,lock:1});
    step(s,blank());assert.ok(has(s,kind));
    let whistle=false;
    for(let i=0;i<90;i++){step(s,blank());if(has(s,"whistle"))whistle=true;}
    assert.ok(whistle);
  }
  // Web Audio mocks record scheduling, volume, voice count and stopping.
  let created=0,started=0,stopped=0,loopStarts=0,master;
  const param=()=>({value:0,setValueAtTime(v){this.value=v;},exponentialRampToValueAtTime(v){this.value=v;},cancelScheduledValues(){}});
  const node=()=>({connect(){},disconnect(){}});
  const source=()=>({...node(),frequency:param(),loop:false,start(){started++;if(this.loop)loopStarts++;},stop(){stopped++;}});
  class AudioContext {
    constructor(){created++;this.sampleRate=8000;this.state="running";this.currentTime=1;this.destination=node();}
    createGain(){const n={...node(),gain:param()};master??=n;return n;}
    createBuffer(_channels,n){const data=new Float32Array(n);return {getChannelData(){return data;}};}
    createOscillator(){return source();}
    createBufferSource(){return source();}
    createStereoPanner(){return {...node(),pan:param()};}
    createBiquadFilter(){return {...node(),frequency:param(),Q:param()};}
    resume(){return Promise.resolve();}
  }
  const audio=createAudio(AudioContext);
  audio.play("shot");assert.equal(created,0);
  audio.unlock();audio.unlock();assert.equal(created,1);
  audio.setCrowd(true);audio.setCrowd(true);assert.equal(loopStarts,1);
  audio.play("pass");assert.ok(started>=3);
  for(const kind of ["pass","shot","receive","intercept","save","tackle","miss","bounce","goalBlue","goalRed","whistle","fullTime","coach","retry","step","dribble","click"]){
    audio.stopEffects();const before=started;audio.play(kind);
    assert.ok(started>before,kind+" must schedule a sound");
  }
  audio.stopEffects();const before=started;
  for(let i=0;i<100;i++)audio.play("goalBlue");
  assert.ok(started-before<=24);
  audio.setEnabled(false);assert.equal(master.gain.value,0);
  const muted=started;audio.play("shot");audio.setCrowd(true);assert.equal(started,muted);
  audio.setEnabled(true);assert.ok(master.gain.value>0);
  audio.setCrowd(true);assert.equal(loopStarts,2);audio.setCrowd(false);assert.ok(stopped>0);
  // A browser without Web Audio must still be able to run a match.
  const unavailable=createAudio(undefined);unavailable.unlock();unavailable.play("shot");unavailable.setCrowd(true);
}
const code=await read("sound.js");
const createAudio=AudioContext=>new (new Function("AudioContext",code.replace("export class","class")+"\nreturn MatchAudio;")(AudioContext))();
exercise(E,assert,createAudio);
console.log("Football IQ sound: contact cues, AI pass, interception, saves, goals, ambience, mute and voice limit passed.");
