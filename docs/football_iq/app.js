import { W,H,GOAL,DT,createMatch,copyState,step,blank,coachingTip } from "./engine.js";

const get = (id) => document.getElementById(id);
const canvas=get("pitch"), ctx=canvas.getContext("2d");
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
  keys.clear();actions.clear();joy={x:0,y:0};joyId=null;knob.style.transform="translate(-50%,-50%)";
}
function hideTip(){
  tip=null; get("hint").hidden=true; get("continue").hidden=true;
}
function start(){
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
  const oldRed=state.score[1],oldEvent=state.eventTick;
  if(state.tick%15===0){history.push(copyState(state));if(history.length>25)history.shift();}
  step(state,input());
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
const ox=36,oy=40;
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function line(x,y,a,b,c,width=2){ctx.strokeStyle=c;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(a,b);ctx.stroke();}
function circle(x,y,r,c,fill=true){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=c;ctx.fill();}else{ctx.strokeStyle=c;ctx.lineWidth=2;ctx.stroke();}}
function field(){
  rect(0,0,canvas.width,canvas.height,"#162c34");
  rect(10,10,652,420,"#233e46");rect(16,16,640,408,"#52656a");
  // Original procedural pixel-art stands, railings, advertising and turf.
  for(let row=0;row<3;row++)for(let x=24;x<648;x+=8){
    const colors=["#f0c56c","#759bba","#dfe6d3","#d66b5f","#314c61"];
    rect(x,8+row*7,5,5,colors[(x*3+row*7)%colors.length]);
    rect(x,416+row*6,5,4,colors[(x+row*3)%colors.length]);
  }
  rect(20,29,632,382,"#1a553d");rect(ox-6,oy-6,W+12,H+12,"#246d47");
  for(let i=0;i<10;i++)rect(ox+i*60,oy,60,H,i%2?"#388951":"#439858");
  for(let i=0;i<500;i++){const x=(i*79+17)%W,y=(i*113+31)%H;rect(ox+x,oy+y,2,1,i%2?"#39884e":"#4ba05d");}
  const white="#d6e7be";ctx.strokeStyle=white;ctx.lineWidth=2;ctx.strokeRect(ox,oy,W,H);
  line(ox+W/2,oy,ox+W/2,oy+H,white);circle(ox+W/2,oy+H/2,48,white,false);circle(ox+W/2,oy+H/2,3,white);
  for(const side of [0,1]){
    const x=side?ox+W:ox,d=side?-1:1;
    ctx.strokeStyle=white;ctx.lineWidth=2;ctx.strokeRect(side?x-93:x,oy+H/2-91,93,182);
    ctx.strokeRect(side?x-31:x,oy+H/2-49,31,98);circle(x+d*66,oy+H/2,2,white);
    const gx=side?x:x-17,gy=oy+(H-GOAL)/2;
    rect(gx,gy,17,GOAL,"#a1c6b5");
    for(let y=gy;y<gy+GOAL;y+=7)line(gx,y,gx+17,y,"#688f89",1);
    for(let k=0;k<17;k+=5)line(gx+k,gy,gx+k,gy+GOAL,"#688f89",1);
    rect(gx,gy,17,3,"#f3f5de");rect(gx,gy+GOAL-3,17,3,"#f3f5de");
  }
}
function arrow(a,b){
  const x=ox+a.x,y=oy+a.y,X=ox+b.x,Y=oy+b.y,ang=Math.atan2(Y-y,X-x);
  ctx.setLineDash([6,5]);line(x,y,X,Y,"#ffe37b",3);ctx.setLineDash([]);
  line(X,Y,X-13*Math.cos(ang-.5),Y-13*Math.sin(ang-.5),"#ffe37b",3);
  line(X,Y,X-13*Math.cos(ang+.5),Y-13*Math.sin(ang+.5),"#ffe37b",3);circle(X,Y,10,"#ffe37b",false);
}
function render(){
  field();
  const user=state.players[state.user];
  if(tip?.target)arrow(user,tip.target);
  for(const p of [...state.players].sort((a,b)=>a.y-b.y)){
    const x=Math.round(ox+p.x),y=Math.round(oy+p.y),moving=Math.hypot(p.vx,p.vy)>3;
    const stride=moving?(Math.floor(state.tick/5)%2?3:-3):0;
    const shirt=p.role==="keeper"?"#e4b74e":p.team===0?"#438ff1":"#ed6658";
    ctx.globalAlpha=.35;circle(x+4,y+7,9,"#16392c");ctx.globalAlpha=1;
    if(p.id===state.user){circle(x,y+4,15,"#ffe278",false);rect(x-2,y-25,5,4,"#ffe278");}
    rect(x-6,y+2,5,9+stride,"#243748");rect(x+2,y+2,5,9-stride,"#243748");
    rect(x-7,y+10+stride,6,3,"#e9f0e8");rect(x+2,y+10-stride,6,3,"#e9f0e8");
    rect(x-8,y-9,16,14,"#233748");rect(x-7,y-8,14,11,shirt);rect(x-6,y-7,3,9,"#ffffff");
    rect(x-11,y-6,4,8,shirt);rect(x+8,y-6,4,8,shirt);
    const skin=["#e7b88d","#b97c55","#f0c6a2","#8e5b46"][p.id%4];
    rect(x-5,y-17,10,9,skin);rect(x-5,y-19,10,4,p.id%3===0?"#d2a14f":"#43352e");
    rect(x+(p.face>0?2:-4),y-14,2,2,"#1f3038");
    if(p.id===state.user){ctx.font="bold 10px monospace";ctx.textAlign="center";ctx.fillStyle="#fff3b4";ctx.fillText("YOU",x,y-29);}
  }
  const b=state.ball,x=ox+b.x,y=oy+b.y;
  circle(x+2,y+3,5,"#315c3b");circle(x,y,5,"#fffbea");rect(x-2,y-2,4,4,"#32404a");rect(x+2,y+2,2,2,"#32404a");
  if(state.restart>0){ctx.font="bold 34px monospace";ctx.textAlign="center";ctx.strokeStyle="#142c34";ctx.lineWidth=7;ctx.strokeText("GOAL!",canvas.width/2,canvas.height/2);ctx.fillStyle="#ffe278";ctx.fillText("GOAL!",canvas.width/2,canvas.height/2);}
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
  if(e.target instanceof HTMLSelectElement||e.target instanceof HTMLButtonElement)return;
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
for(const button of document.querySelectorAll("[data-action]")){
  const action=button.dataset.action;
  button.addEventListener("pointerdown",e=>{e.preventDefault();button.setPointerCapture(e.pointerId);actions.add(action);button.classList.add("pressed");});
  for(const name of ["pointerup","pointercancel","lostpointercapture"])button.addEventListener(name,()=>{actions.delete(action);button.classList.remove("pressed");});
}
requestAnimationFrame(frame);
