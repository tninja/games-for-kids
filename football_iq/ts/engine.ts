export type Team = 0 | 1;
export type Role = "keeper" | "defender" | "midfielder" | "forward";
export type Point = { x: number; y: number };
export type ActionKind = "pass" | "shoot" | "tackle" | "receive";
export type Action = { kind: ActionKind; elapsed: number; receiver: number | null; dx: number; dy: number };
export type Player = Point & { id: number; team: Team; role: Role; home: Point; vx: number; vy: number; face: number; cooldown: number; action: Action | null };
export type Ball = Point & { vx: number; vy: number; owner: number | null; lock: number; last: number | null; receiver: number | null };
export type State = { players: Player[]; ball: Ball; user: number; score: [number, number]; time: number; duration: number; tick: number; restart: number; kickoff: Team; event: string; eventTick: number };
export type Input = { x: number; y: number; pass: boolean; shoot: boolean; sprint: boolean };
export type Tip = { id: string; text: string; target?: Point; freeze: boolean };

export const W = 600, H = 360, GOAL = 92, DT = 1/60;
// Integer simulation ticks (60 Hz): [contact tick, total ticks].
export const ACTION_TIMING: Record<ActionKind, readonly [number, number]> = {
  pass: [9, 22], shoot: [15, 37], tackle: [6, 33], receive: [0, 13]
};
const clamp = (n:number, lo:number, hi:number) => Math.max(lo,Math.min(hi,n));
export const distance = (a:Point, b:Point) => Math.hypot(a.x-b.x,a.y-b.y);
const dir = (p:Player) => p.team===0?1:-1;
const goal = (team:Team) => ({x:team===0?W:0,y:H/2});
export const blank = ():Input => ({x:0,y:0,pass:false,shoot:false,sprint:false});
const slots: { x:number; y:number; role:Role }[] = [
  {x:30,y:180,role:"keeper"},{x:132,y:105,role:"defender"},
  {x:132,y:255,role:"defender"},{x:235,y:180,role:"midfielder"},
  {x:282,y:95,role:"forward"}
];
export function createMatch(role:Role="defender", duration=180):State {
  const players:Player[] = [];
  for (const team of [0,1] as Team[]) for (const slot of slots) {
    const home={x:team===0?slot.x:W-slot.x,y:team===0?slot.y:H-slot.y};
    players.push({...home,home,id:players.length,team,role:slot.role,vx:0,vy:0,face:team===0?1:-1,cooldown:0,action:null});
  }
  const user=players.find(p=>p.team===0&&p.role===role)?.id??1;
  const s:State={players,user,ball:{x:W/2,y:H/2,vx:0,vy:0,owner:null,lock:0,last:null,receiver:null},score:[0,0],time:0,duration,tick:0,restart:0,kickoff:0,event:"Kick off!",eventTick:0};
  kickoff(s,0);
  return s;
}
export function copyState(s:State):State {
  return {...s,score:[...s.score],ball:{...s.ball},players:s.players.map(p=>({...p,home:{...p.home},action:p.action?{...p.action}:null}))};
}
function event(s:State, text:string) { s.event=text; s.eventTick=s.tick; }
function possess(s:State, p:Player) {
  Object.assign(s.ball,{owner:p.id,last:p.id,receiver:null,lock:0.18,vx:0,vy:0,x:p.x+dir(p)*9,y:p.y});
}
function kickoff(s:State, team:Team) {
  for(const p of s.players) Object.assign(p,{...p.home,vx:0,vy:0,cooldown:0,action:null,face:dir(p)});
  const p=s.players[team*5+3]; p.x=W/2-dir(p)*10; p.y=H/2;
  possess(s,p); s.ball.lock=0.55; p.cooldown=0.55; s.restart=0;
}
function move(p:Player, target:Point, speed:number) {
  const dx=target.x-p.x,dy=target.y-p.y,n=Math.hypot(dx,dy);
  const v=Math.min(speed,n/DT);
  p.vx=n>0.01?dx/n*v:0; p.vy=n>0.01?dy/n*v:0;
  if(Math.abs(p.vx)>2)p.face=Math.sign(p.vx);
}
function segmentDistance(p:Point, a:Point, b:Point) {
  const dx=b.x-a.x,dy=b.y-a.y,t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);
  return distance(p,{x:a.x+t*dx,y:a.y+t*dy});
}
function lane(s:State, a:Player, b:Point) {
  return Math.min(...s.players.filter(p=>p.team!==a.team).map(p=>segmentDistance(p,a,b)));
}
function pressure(s:State, p:Player) {
  return Math.min(...s.players.filter(q=>q.team!==p.team).map(q=>distance(p,q)));
}
function passTarget(s:State, p:Player, input:Input=blank()) {
  const direction=Math.hypot(input.x,input.y)>0.2;
  return s.players.filter(q=>q.team===p.team&&q.id!==p.id).map(q=>{
    const d=distance(p,q), alignment=direction?((q.x-p.x)*input.x+(q.y-p.y)*input.y)/(d||1):0;
    return {q,score:Math.min(lane(s,p,q),45)*1.5+Math.min(pressure(s,q),65)*0.45+dir(p)*(q.x-p.x)*0.19-d*0.13+alignment*90-(q.role==="keeper"?22:0)};
  }).sort((a,b)=>b.score-a.score)[0].q;
}

function kick(s:State, p:Player, target:Point, speed:number, receiver:number|null=null) {
  const dx=target.x-p.x,dy=target.y-p.y,n=Math.hypot(dx,dy)||1;
  Object.assign(s.ball,{x:p.x+dx/n*11,y:p.y+dy/n*11,vx:dx/n*speed,vy:dy/n*speed,owner:null,lock:0.04,last:p.id,receiver});
}
function aimShot(s:State,p:Player) {
  const g=goal(p.team),keeper=s.players.find(q=>q.team!==p.team&&q.role==="keeper");
  g.y+=keeper&&keeper.y>H/2?-GOAL*0.34:GOAL*0.34;
  return g;
}
function begin(p:Player, kind:ActionKind, target:Point, receiver:number|null=null) {
  if(p.action||p.cooldown>0)return;
  const dx=target.x-p.x,dy=target.y-p.y,n=Math.hypot(dx,dy)||1;
  p.action={kind,elapsed:0,receiver,dx:dx/n,dy:dy/n};
  p.vx=0;p.vy=0;if(Math.abs(dx)>1)p.face=Math.sign(dx);
}
function shoot(s:State, p:Player) { begin(p,"shoot",aimShot(s,p)); }
function pass(p:Player, q:Player) { begin(p,"pass",q,q.id); }
function tackle(s:State, p:Player) {
  if(s.ball.owner===p.id)return;
  begin(p,"tackle",s.ball);
}
function receive(p:Player, dx:number,dy:number) {
  // Trap the incoming ball: slow movement and lock new actions, not immunity.
  const n=Math.hypot(dx,dy)||1;
  p.action={kind:"receive",elapsed:0,receiver:null,dx:dx/n,dy:dy/n};
  p.cooldown=0;
  if(Math.abs(dx)>1)p.face=Math.sign(dx);
}
function advanceAction(s:State, p:Player) {
  const a=p.action;if(!a)return;
  const [contact,total]=ACTION_TIMING[a.kind];
  a.elapsed++;
  if(a.elapsed>=total){p.action=null;return;}
  if(a.elapsed!==contact)return;
  if(a.kind==="tackle"){
    const owner=s.ball.owner===null?null:s.players[s.ball.owner];
    if(owner&&owner.team!==p.team&&s.ball.lock<=0&&distance(p,owner)<21){
      possess(s,p);if(p.id===s.user)event(s,"Great tackle!");
    }
  } else if(s.ball.owner===p.id){
    if(a.kind==="shoot"){
      kick(s,p,aimShot(s,p),355);event(s,p.team===0?"Blue shot!":"Red shot!");
    } else if(a.kind==="pass"&&a.receiver!==null){
      const q=s.players[a.receiver],d=distance(p,q);
      kick(s,p,{x:q.x+q.vx*0.18,y:q.y+q.vy*0.18},clamp(d*2.5,180,320),q.id);
      if(p.id===s.user)event(s,"Pass!");
    }
  }
}
function actionSpeed(p:Player) {
  if(!p.action)return 1;
  if(p.action.kind==="receive")return .30;
  return p.action.elapsed<ACTION_TIMING[p.action.kind][0]?0:.20;
}
function chaser(s:State, team:Team) {
  const list=s.players.filter(p=>p.team===team&&p.role!=="keeper");
  return list.reduce((a,b)=>distance(a,s.ball)<=distance(b,s.ball)?a:b).id;
}
function ai(s:State, p:Player, chase:number, owner:Player|undefined) {
  const d=dir(p), ownGoal=goal(p.team===0?1:0);
  if(owner?.id===p.id) {
    if(!p.action&&p.cooldown<=0) {
      if(p.role!=="keeper"&&Math.abs(goal(p.team).x-p.x)<128&&lane(s,p,goal(p.team))>8) {shoot(s,p);return;}
      const q=passTarget(s,p);
      if(p.role==="keeper" || (pressure(s,p)<42 && lane(s,p,q)>12 && pressure(s,q)>20) || (p.role==="defender"&&d*(q.x-p.x)>65&&lane(s,p,q)>20)) {pass(p,q);return;}
    }
    move(p,{x:p.x+d*65,y:H/2+(p.y-H/2)*0.74},62);return;
  }
  if(p.role==="keeper") {
    move(p,{x:ownGoal.x+d*27,y:clamp(s.ball.y,H/2-45,H/2+45)},70);
    if(owner&&owner.team!==p.team&&distance(p,owner)<20)tackle(s,p);
    return;
  }
  if(s.ball.receiver===p.id || ((!owner||owner.team!==p.team)&&chase===p.id)) {
    move(p,{x:s.ball.x+s.ball.vx*0.07,y:s.ball.y+s.ball.vy*0.07},82);
    if(owner&&owner.team!==p.team&&distance(p,owner)<19)tackle(s,p);
    return;
  }
  const attacking=owner?.team===p.team;
  const shift=clamp((s.ball.x-W/2)*0.42+(attacking?d*42:-d*24),-100,100);
  const yShift=(s.ball.y-H/2)*0.28;
  move(p,{x:clamp(p.home.x+shift,50,W-50),y:clamp(p.home.y+yShift,30,H-30)},65);
}
function updateBall(s:State) {
  const b=s.ball;
  b.lock=Math.max(0,b.lock-DT);
  if(b.owner!==null) {
    const p=s.players[b.owner]; b.x=clamp(p.x+p.face*9,1,W-1); b.y=p.y+3;return;
  }
  b.x+=b.vx*DT;b.y+=b.vy*DT;b.vx*=0.993;b.vy*=0.993;
  if(b.x<=0||b.x>=W) {
    if(Math.abs(b.y-H/2)<GOAL/2) {
      const team:Team=b.x>=W?0:1;s.score[team]++;s.kickoff=team===0?1:0;
      s.restart=1.15;b.vx=0;b.vy=0;event(s,team===0?"GOAL! Blue scores!":"Red scores!");return;
    }
    b.x=clamp(b.x,1,W-1);b.vx*=-0.65;
  }
  if(b.y<=0||b.y>=H){b.y=clamp(b.y,1,H-1);b.vy*=-0.65;}
  const nearest=s.players.filter(p=>b.lock<=0&&(p.id!==b.last||(!p.action&&p.cooldown<=0))).sort((a,c)=>distance(a,b)-distance(c,b))[0];
  if(nearest&&distance(nearest,b)<(nearest.role==="keeper"?13:10)) {
    const previous=b.last===null?null:s.players[b.last];
    if(previous?.team!==nearest.team&&nearest.id===s.user)event(s,"Great interception!");
    if(previous?.id===s.user&&nearest.team===1)event(s,"Pass intercepted");
    const dx=-b.vx,dy=-b.vy;
    possess(s,nearest);b.lock=0;receive(nearest,dx,dy);
  }
}
export function step(s:State, input:Input) {
  if(s.time>=s.duration)return;
  s.tick++; s.time=Math.min(s.duration,s.tick*DT);
  if(s.restart>0) {s.restart-=DT;if(s.restart<=0)kickoff(s,s.kickoff);return;}
  for(const p of s.players)p.cooldown=Math.max(0,p.cooldown-DT);
  // Resolve contacts in stable player-id order, before new decisions.
  for(const p of s.players)advanceAction(s,p);
  const user=s.players[s.user], owner=s.ball.owner===null?undefined:s.players[s.ball.owner];
  const n=Math.max(1,Math.hypot(input.x,input.y)), speed=input.sprint?113:88;
  user.vx=input.x/n*speed; user.vy=input.y/n*speed;
  if(!user.action&&Math.abs(user.vx)>2)user.face=Math.sign(user.vx);
  if(!user.action&&user.cooldown<=0){
    if(owner?.id===user.id){if(input.shoot)shoot(s,user);else if(input.pass)pass(user,passTarget(s,user,input));}
    else if(input.pass&&owner?.team===0&&!owner.action&&owner.cooldown<=0)pass(owner,user);
    else if(input.shoot)tackle(s,user);
  }
  const c0=chaser(s,0),c1=chaser(s,1);
  for(const p of s.players)if(p.id!==s.user){
    if(p.action&&p.action.kind!=="receive"){p.vx=p.action.dx*32;p.vy=p.action.dy*32;}
    else ai(s,p,p.team===0?c0:c1,s.ball.owner===null?undefined:s.players[s.ball.owner]);
  }
  for(const p of s.players){const scale=actionSpeed(p);p.vx*=scale;p.vy*=scale;p.x=clamp(p.x+p.vx*DT,9,W-9);p.y=clamp(p.y+p.vy*DT,9,H-9);}
  for(let i=0;i<s.players.length;i++)for(let j=i+1;j<s.players.length;j++){
    const a=s.players[i],b=s.players[j],d=distance(a,b);
    if(d<15){const dx=d>0.01?(b.x-a.x)/d:1,dy=d>0.01?(b.y-a.y)/d:0,k=(15-d)/2;
      a.x=clamp(a.x-dx*k,9,W-9);a.y=clamp(a.y-dy*k,9,H-9);b.x=clamp(b.x+dx*k,9,W-9);b.y=clamp(b.y+dy*k,9,H-9);}
  }
  updateBall(s);
}
export function coachingTip(s:State):Tip|null {
  const u=s.players[s.user], b=s.ball, owner=b.owner===null?null:s.players[b.owner];
  if(s.restart>0||u.action)return null;
  if(s.tick-s.eventTick<40&&s.event.startsWith("Great"))return {id:"win-ball",text:s.event+" Look up for a teammate.",freeze:false};
  if(owner?.id===u.id&&pressure(s,u)<50){
    const q=passTarget(s,u);
    if(lane(s,u,q)>16&&pressure(s,q)>24)return {id:"pass",text:"Look up! A teammate has space. Try a pass.",target:q,freeze:false};
  }
  if(u.role==="defender"&&owner?.team===1&&owner.x<250){
    const other=s.players.find(p=>p.team===0&&p.role==="defender"&&p.id!==u.id);
    const target={x:clamp(owner.x-42,40,210),y:clamp((owner.y+H/2)/2,90,270)};
    if(other&&other.x>owner.x+10&&distance(u,target)>36)return {id:"cover",text:"Your teammate is behind the play. Protect the middle and slow them down.",target,freeze:true};
    if(u.x>owner.x+12)return {id:"goal-side",text:"Get goal-side! Stay between the attacker and your goal.",target,freeze:false};
  }
  if(u.role!=="defender"&&owner?.team===0&&owner.id!==u.id&&distance(u,owner)<42){
    return {id:"space",text:"Find space away from the ball. Give your teammate a passing option.",target:{x:clamp(u.x+35,40,W-35),y:u.y<H/2?65:H-65},freeze:false};
  }
  return null;
}
