export type Team = 0 | 1;
export type Role = "keeper" | "defender" | "midfielder" | "forward";
export type Point = { x: number; y: number };
export type ActionKind = "pass" | "shoot" | "tackle" | "receive";
export type Action = { kind: ActionKind; elapsed: number; receiver: number | null; dx: number; dy: number; total?: number };
export type Player = Point & { id: number; team: Team; role: Role; home: Point; vx: number; vy: number; face: number; heading: number; cooldown: number; action: Action | null; blockedOpponent: number | null };
export type Ball = Point & { vx: number; vy: number; owner: number | null; lock: number; last: number | null; receiver: number | null };
export type State = { players: Player[]; ball: Ball; user: number; score: [number, number]; time: number; duration: number; tick: number; restart: number; kickoff: Team; event: string; eventTick: number };
export type Input = { x: number; y: number; pass: boolean; shoot: boolean; sprint: boolean };
export type Tip = { id: string; text: string; target?: Point; freeze: boolean };

export const W = 600, H = 360, GOAL = 92, DT = 1/60;
// Integer simulation ticks (60 Hz): [contact tick, total ticks].
export const ACTION_TIMING: Record<ActionKind, readonly [number, number]> = {
  pass: [9, 22], shoot: [15, 37], tackle: [6, 33], receive: [0, 13]
};
// Arcade units per second; angular speed is radians per second.
// A lost challenge is not a fresh tackle opportunity until the pair separates.
export const DUEL = { reach: 18, bodyReach: 25, resetDistance: 34, containDistance: 27 };
export const MOVEMENT = { acceleration: 380, braking: 540, turn: Math.PI*3, dribble: .76 };
export function actionDuration(a:Action) { return a.total??ACTION_TIMING[a.kind][1]; }
export function turnToward(from:number,to:number,limit:number) {
  const delta=Math.atan2(Math.sin(to-from),Math.cos(to-from));
  return from+Math.max(-limit,Math.min(limit,delta));
}
export function firstTouchTicks(speed:number, alignment:number) {
  if(speed<60)return 9;
  return Math.min(25,9+(speed>240?9:speed>150?4:0)+(alignment<-.35?7:alignment<.35?4:0));
}
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
    players.push({...home,home,id:players.length,team,role:slot.role,vx:0,vy:0,face:team===0?1:-1,heading:team===0?0:Math.PI,cooldown:0,action:null,blockedOpponent:null});
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
  Object.assign(s.ball,{owner:p.id,last:p.id,receiver:null,lock:0.18,vx:0,vy:0,x:p.x+Math.cos(p.heading)*9,y:p.y+Math.sin(p.heading)*9});
}
function kickoff(s:State, team:Team) {
  for(const p of s.players) Object.assign(p,{...p.home,vx:0,vy:0,cooldown:0,action:null,blockedOpponent:null,face:dir(p),heading:p.team===0?0:Math.PI});
  const p=s.players[team*5+3]; p.x=W/2-dir(p)*10; p.y=H/2;
  possess(s,p); s.ball.lock=0.55; p.cooldown=0.55; s.restart=0;
}
function move(p:Player, target:Point, speed:number) {
  const dx=target.x-p.x,dy=target.y-p.y,n=Math.hypot(dx,dy);
  const v=Math.min(speed,n/DT);
  p.vx=n>0.01?dx/n*v:0; p.vy=n>0.01?dy/n*v:0;

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
  p.vx=0;p.vy=0;
}
function shoot(s:State, p:Player) { begin(p,"shoot",aimShot(s,p)); }
function pass(p:Player, q:Player) { begin(p,"pass",q,q.id); }
function canChallenge(p:Player,owner:Player) {
  return p.team!==owner.team&&p.blockedOpponent!==owner.id;
}
function tackle(s:State, p:Player) {
  if(s.ball.owner!==null){
    const owner=s.players[s.ball.owner];
    if(!canChallenge(p,owner))return;
  }
  begin(p,"tackle",s.ball);
}
function resetChallenges(s:State) {
  for(const p of s.players){
    if(p.blockedOpponent!==null&&(s.ball.owner!==p.blockedOpponent||
      distance(p,s.players[p.blockedOpponent])>=DUEL.resetDistance))p.blockedOpponent=null;
  }
}
function receive(p:Player, dx:number,dy:number) {
  // Trap the incoming ball: slow movement and lock new actions, not immunity.
  const n=Math.hypot(dx,dy)||1;
  const alignment=(Math.cos(p.heading)*dx+Math.sin(p.heading)*dy)/n;
  p.action={kind:"receive",elapsed:0,receiver:null,dx:dx/n,dy:dy/n,total:firstTouchTicks(Math.hypot(dx,dy),alignment)};
  p.cooldown=0;

}
function advanceAction(s:State, p:Player) {
  const a=p.action;if(!a)return;
  const [contact]=ACTION_TIMING[a.kind],total=actionDuration(a);
  // Turn toward the committed action during windup, rather than snapping.
  a.elapsed++;
  if(a.elapsed>=total){p.action=null;return;}
  if(a.elapsed!==contact)return;
  if(a.kind==="tackle"){
    const owner=s.ball.owner===null?null:s.players[s.ball.owner];
    if(owner&&canChallenge(p,owner)&&s.ball.lock<=0&&
      distance(p,owner)<=DUEL.bodyReach&&distance(p,s.ball)<=DUEL.reach){
      // Only the dispossessed player is barred from an immediate repeat duel.
      // Other defenders can still challenge; a pass or real separation resets it.
      owner.blockedOpponent=p.id;
      possess(s,p);if(p.id===s.user)event(s,"Great tackle!");
    }
  } else if(s.ball.owner===p.id){
    if(a.kind==="shoot"){
      const target=aimShot(s,p);kick(s,p,target,355*kickingPower(p,target));event(s,p.team===0?"Blue shot!":"Red shot!");
    } else if(a.kind==="pass"&&a.receiver!==null){
      const q=s.players[a.receiver],d=distance(p,q);
      const target={x:q.x+q.vx*.18,y:q.y+q.vy*.18};
      kick(s,p,target,clamp(d*2.5,180,320)*kickingPower(p,target),q.id);
      if(p.id===s.user)event(s,"Pass!");
    }
  }
}
function kickingPower(p:Player,target:Point) {
  const angle=Math.atan2(target.y-p.y,target.x-p.x);
  return .65+.35*Math.max(0,Math.cos(angle-p.heading));
}
function actionSpeed(p:Player) {
  if(!p.action)return 1;
  if(p.action.kind==="receive")return .30;
  return p.action.elapsed<ACTION_TIMING[p.action.kind][0]?0:.20;
}
// vx/vy are actual velocity outside decision collection. Desired velocity
// is produced by the same user/AI code, then resolved once per fixed step.
function applyMovement(p:Player, old:Point, carries:boolean) {
  const desired=Math.hypot(p.vx,p.vy), scale=actionSpeed(p)*(carries?MOVEMENT.dribble:1);
  const a=p.action;
  const heading=a&&Math.hypot(a.dx,a.dy)>.1?Math.atan2(a.dy,a.dx):desired>.01?Math.atan2(p.vy,p.vx):p.heading;
  p.heading=turnToward(p.heading,heading,MOVEMENT.turn*DT);
  if(Math.abs(Math.cos(p.heading))>.12)p.face=Math.cos(p.heading)>0?1:-1;
  if(scale===0){p.vx=0;p.vy=0;return;}
  const alignment=desired>.01?Math.max(0,Math.cos(heading-p.heading)):0;
  // During an action, movement remains capped but the action's aim is not changed.
  const speed=desired*scale*(a?1:alignment);
  const targetX=desired>.01?p.vx/desired*speed:0,targetY=desired>.01?p.vy/desired*speed:0;
  const dx=targetX-old.x,dy=targetY-old.y,d=Math.hypot(dx,dy);
  const braking=old.x*targetX+old.y*targetY<0||speed<Math.hypot(old.x,old.y);
  const k=Math.min(1,(braking?MOVEMENT.braking:MOVEMENT.acceleration)*DT/(d||1));
  p.vx=old.x+dx*k;p.vy=old.y+dy*k;
  // An action hard cap takes priority over inertia; normal movement decelerates.
  const cap=a?113*scale:Infinity,v=Math.hypot(p.vx,p.vy);
  if(v>cap){p.vx*=cap/v;p.vy*=cap/v;}
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
    // If the forward route is blocked, carry into space instead of
    // repeatedly walking into the same opponent's collision radius.
    const blocker=s.players.filter(q=>q.team!==p.team&&distance(p,q)<38&&d*(q.x-p.x)>-8)
      .sort((a,b)=>distance(a,p)-distance(b,p)||a.id-b.id)[0];
    if(blocker){
      const side=p.y<45?1:p.y>H-45?-1:p.y<blocker.y?-1:p.y>blocker.y?1:p.y<H/2?-1:1;
      move(p,{x:p.x+d*22,y:clamp(p.y+side*62,15,H-15)},62);return;
    }
    move(p,{x:p.x+d*65,y:H/2+(p.y-H/2)*0.74},62);return;
  }
  if(p.role==="keeper") {
    move(p,{x:ownGoal.x+d*27,y:clamp(s.ball.y,H/2-45,H/2+45)},70);
    if(owner&&canChallenge(p,owner)&&s.ball.lock<=0&&distance(p,s.ball)<=DUEL.reach)tackle(s,p);
    return;
  }
  if(s.ball.receiver===p.id || ((!owner||owner.team!==p.team)&&chase===p.id)) {
    if(owner&&p.blockedOpponent===owner.id){
      // Contain after losing a duel; do not chase into the same body.
      const dx=p.x-owner.x,dy=p.y-owner.y,n=Math.hypot(dx,dy)||1;
      move(p,{x:owner.x+(dx/n||(!dx&&!dy?-d:0))*DUEL.containDistance,
        y:owner.y+dy/n*DUEL.containDistance},65);return;
    }
    move(p,{x:s.ball.x+s.ball.vx*0.07,y:s.ball.y+s.ball.vy*0.07},82);
    if(owner&&canChallenge(p,owner)&&s.ball.lock<=0&&distance(p,s.ball)<=DUEL.reach&&distance(p,owner)<=DUEL.bodyReach)tackle(s,p);
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
    const p=s.players[b.owner]; b.x=clamp(p.x+Math.cos(p.heading)*9,1,W-1); b.y=clamp(p.y+Math.sin(p.heading)*9,1,H-1);return;
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
  const nearest=s.players.filter(p=>b.lock<=0&&!p.action&&(p.id!==b.last||p.cooldown<=0)).sort((a,c)=>distance(a,b)-distance(c,b))[0];
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
  resetChallenges(s);
  // Resolve contacts in stable player-id order, before new decisions.
  for(const p of s.players)advanceAction(s,p);
  const oldVelocity=s.players.map(p=>({x:p.vx,y:p.vy}));
  const user=s.players[s.user], owner=s.ball.owner===null?undefined:s.players[s.ball.owner];
  const n=Math.max(1,Math.hypot(input.x,input.y)), speed=input.sprint?113:88;
  user.vx=input.x/n*speed; user.vy=input.y/n*speed;

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
  for(const p of s.players){applyMovement(p,oldVelocity[p.id],s.ball.owner===p.id);p.x=clamp(p.x+p.vx*DT,9,W-9);p.y=clamp(p.y+p.vy*DT,9,H-9);
    if((p.x===9&&p.vx<0)||(p.x===W-9&&p.vx>0))p.vx=0;
    if((p.y===9&&p.vy<0)||(p.y===H-9&&p.vy>0))p.vy=0;
  }
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
