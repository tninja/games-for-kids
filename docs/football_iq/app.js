import { DT,createMatch,copyState,step,coachingTip } from "./engine.js";
import { createVisual } from "./visual.js";

const get = (id) => document.getElementById(id);
const canvas=get("pitch");
let visual=null;
const role=get("role"), coach=get("coach");
const length=get("length");
let state=createMatch(), running=false, paused=false, finished=false;
let tip=null, tipUntil=0, lastTip=-9999, freezes=0, retryUsed=false;
let retry=null, history=[];
const seen={};
const keys=new Set(), actions=new Set();
let joy={x:0,y:0}, joyId=null, accumulator=0, previous=0;
const pad=get("pad"), knob=get("knob");
function clearInput(){
  keys.clear();actions.clear();document.querySelectorAll(".pressed").forEach(b=>b.classList.remove("pressed"));joy={x:0,y:0};joyId=null;knob.style.transform="translate(-50%,-50%)";
}
function hideTip(){
  tip=null; get("hint").hidden=true; get("continue").hidden=true;
}
function start(){
  if(!visual)return;prepareAudio();
  state=createMatch(role.value,Number(length.value)); running=true; paused=false; finished=false;
  lastTip=-9999;freezes=0;retryUsed=false;retry=null;history=[];tipUntil=0;accumulator=0;
  for(const k of Object.keys(seen))delete seen[k];
  hideTip();clearInput();get("menu").hidden=true;get("result").hidden=true;get("pause").textContent="Pause";get("retry").hidden=true;
}
function showTip(t){
  tip={...t,target:t.target?{x:t.target.x,y:t.target.y}:undefined};
  lastTip=state.tick;seen[t.id]=state.tick;tipUntil=state.tick+210;
  get("hintText").textContent=t.text;get("hint").hidden=false;
  if(t.freeze&&coach.value==="balanced"&&freezes<3){freezes++;paused=true;clearInput();get("continue").hidden=false;get("pause").textContent="Resume";}
}
function resume(){if(!running||finished)return;paused=false;clearInput();hideTip();get("pause").textContent="Pause";}
function togglePause(){
  if(!running||finished)return;
  if(paused){resume();return;}
  paused=true;clearInput();get("pause").textContent="Resume";
}
function restore(){
  if(!retry||!running||finished)return;
  state=copyState(retry);history=[];retry=null;retryUsed=true;get("retry").hidden=true;
  lastTip=state.tick;for(const k of Object.keys(seen))delete seen[k];resume();
}
function input(){
  const x=joy.x+Number(keys.has("arrowright")||keys.has("d"))-Number(keys.has("arrowleft")||keys.has("a"));
  const y=joy.y+Number(keys.has("arrowdown")||keys.has("s"))-Number(keys.has("arrowup")||keys.has("w"));
  return {x,y,pass:keys.has("z")||actions.has("pass"),shoot:keys.has("x")||actions.has("shoot"),sprint:keys.has("shift")||actions.has("sprint")};
}
function tick(){
  const oldBlue=state.score[0],oldRed=state.score[1],oldEvent=state.eventTick;
  if(state.tick%15===0){history.push(copyState(state));if(history.length>25)history.shift();}
  step(state,input());
  if(state.score[0]!==oldBlue||state.score[1]!==oldRed)playSound("goal");
  else if(state.eventTick!==oldEvent){if(state.event.includes("shot"))playSound("shot");else if(state.event.startsWith("Great"))playSound("win");else if(state.event==="Pass!")playSound("pass");}
  if(tip&&state.tick>=tipUntil)hideTip();
  if(coach.value!=="off"){
    if(state.tick-lastTip>=600){
      const t=coachingTip(state);
      if(t&&state.tick-(seen[t.id]??-9999)>1500){
        if(coach.value==="light")showTip({...t,target:undefined,freeze:false});
        else showTip(t);
      }
    }
    if(coach.value==="balanced"&&!retryUsed&&history.length>=8&&(state.score[1]>oldRed||(state.eventTick!==oldEvent&&state.event==="Pass intercepted"))){
      retry=copyState(history[Math.max(0,history.length-13)]);get("retry").hidden=false;
      showTip({id:"retry",text:"Try a different decision! You can rewind a few seconds, or keep playing.",freeze:false});
    }
  }
  if(retry&&state.tick-retry.tick>600){retry=null;get("retry").hidden=true;}
  if(state.time>=state.duration){
    running=false;finished=true;paused=false;clearInput();hideTip();get("retry").hidden=true;
    get("resultTitle").textContent=state.score[0]>state.score[1]?"Blue wins!":state.score[0]===state.score[1]?"A draw!":"Good effort!";
    get("resultText").textContent="Final score: "+state.score.join(" - ")+". "+(coach.value==="off"?"Ready for another match?":state.players[state.user].role==="defender"?"Next match: protect the middle and look up after winning the ball.":"Next match: move into space and look for teammates.");
    get("result").hidden=false;
  }
}

let audio=null, soundEnabled=true;
function prepareAudio(){
  if(!soundEnabled)return;
  try{audio??=new AudioContext();if(audio.state==="suspended")void audio.resume().catch(()=>{});}catch{/* Sound is optional. */}
}
function playSound(kind){
  if(!soundEnabled||!audio||audio.state!=="running")return;
  const notes=kind==="goal"?[392,523,659,784]:kind==="shot"?[155,95]:kind==="win"?[480,640]:[260];
  for(let i=0;i<notes.length;i++){
    const osc=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime+i*.085;
    osc.type=kind==="shot"?"triangle":"sine";osc.frequency.setValueAtTime(notes[i],t);
    gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.075,t+.012);gain.gain.exponentialRampToValueAtTime(.0001,t+.11);
    osc.connect(gain);gain.connect(audio.destination);osc.start(t);osc.stop(t+.12);
  }
}
get("sound").addEventListener("click",()=>{
  soundEnabled=!soundEnabled;get("sound").textContent=soundEnabled?"Sound on":"Sound off";
  get("sound").setAttribute("aria-pressed",String(soundEnabled));if(soundEnabled){prepareAudio();playSound("pass");}
});
function render(){
  visual?.draw(state,tip,paused);
  get("score").textContent=state.score.join(" : ");
  const remaining=Math.ceil(state.duration-state.time);
  get("clock").textContent=Math.floor(remaining/60)+":"+String(remaining%60).padStart(2,"0");
  get("status").textContent=paused?"Paused":state.ball.owner===state.user?"Your ball - pass or shoot!":state.tick-state.eventTick<110?state.event:"Stay in position. Blue attacks right.";
}
function frame(now){
  const elapsed=previous?Math.min((now-previous)/1000,.1):0;previous=now;
  if(running&&!paused){accumulator+=elapsed;while(accumulator>=DT&&running&&!paused){tick();accumulator-=DT;}}
  else accumulator=0;
  render();requestAnimationFrame(frame);
}
get("start").addEventListener("click",start);
get("again").addEventListener("click",start);
get("settings").addEventListener("click",()=>{running=false;paused=false;clearInput();hideTip();get("retry").hidden=true;get("result").hidden=true;get("menu").hidden=false;});
get("pause").addEventListener("click",togglePause);
get("continue").addEventListener("click",resume);
get("retry").addEventListener("click",restore);
coach.addEventListener("change",()=>{if(coach.value==="off"){if(paused&&tip)resume();hideTip();retry=null;get("retry").hidden=true;}});
window.addEventListener("keydown",e=>{
  if(e.target instanceof HTMLSelectElement||(e.target instanceof HTMLButtonElement&&e.key===" "))return;
  const k=e.key.toLowerCase();
  if(["arrowup","arrowdown","arrowleft","arrowright","w","a","s","d","z","x","shift"," "].includes(k)){
    e.preventDefault();if(k===" "){if(!e.repeat)togglePause();}else keys.add(k);
  }
});
window.addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));
window.addEventListener("blur",()=>{clearInput();if(running&&!paused)togglePause();});
document.addEventListener("visibilitychange",()=>{if(document.hidden){clearInput();if(running&&!paused)togglePause();}});
function updateJoy(e){
  const r=pad.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/(r.width*.34),y=(e.clientY-r.top-r.height/2)/(r.height*.34),n=Math.max(1,Math.hypot(x,y));
  joy={x:x/n,y:y/n};knob.style.transform="translate(calc(-50% + "+(joy.x*r.width*.29)+"px),calc(-50% + "+(joy.y*r.height*.29)+"px))";
}
pad.addEventListener("pointerdown",e=>{if(joyId!==null)return;e.preventDefault();joyId=e.pointerId;pad.setPointerCapture(e.pointerId);updateJoy(e);});
pad.addEventListener("pointermove",e=>{if(e.pointerId===joyId)updateJoy(e);});
for(const name of ["pointerup","pointercancel","lostpointercapture"])pad.addEventListener(name,e=>{
  if((e).pointerId!==joyId)return;joyId=null;joy={x:0,y:0};knob.style.transform="translate(-50%,-50%)";
});
for(const button of Array.from(document.querySelectorAll("[data-action]"))){
  const action=button.dataset.action;
  button.addEventListener("pointerdown",e=>{e.preventDefault();button.setPointerCapture(e.pointerId);actions.add(action);button.classList.add("pressed");});
  for(const name of ["pointerup","pointercancel","lostpointercapture"])button.addEventListener(name,()=>{actions.delete(action);button.classList.remove("pressed");});
}
void createVisual(canvas).then(v=>{
  visual=v;get("renderer").textContent=v.name;get("start").disabled=false;
  requestAnimationFrame(frame);
}).catch(err=>{
  console.error(err);get("status").textContent="Could not start the game. Please reload.";
});
