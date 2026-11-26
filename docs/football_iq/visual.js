import { W,H,GOAL } from "./engine.js";

export const WIDTH=672, HEIGHT=440, OX=36, OY=40;
const CW=44, CH=68, FOOT=44, FRAMES=7, COLS=4*FRAMES, ROWS=20;
const color=(n)=>"#"+n.toString(16).padStart(6,"0");
function surface(w,h) {
  const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext("2d");ctx.imageSmoothingEnabled=false;return {canvas,ctx};
}
function box(c,x,y,w,h,fill){
  c.fillStyle=fill;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
}
function path(c,points,fill){
  c.fillStyle=fill;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();
}
function line(c,x,y,a,b,stroke,w=1){
  c.strokeStyle=stroke;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();
}
function ellipse(c,x,y,rx,ry,fill){
  c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();
}
function seeded(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
export function stadium() {
  const {canvas,ctx:c}=surface(WIDTH,HEIGHT),rand=seeded(37);
  box(c,0,0,WIDTH,HEIGHT,"#101f32");
  // Stadium tiers: alternating crowd silhouettes, stairs and railings.
  for(const base of [0,408]){
    box(c,0,base,WIDTH,32,"#26364a");
    for(let row=0;row<4;row++){
      const yy=base+row*8;box(c,0,yy+5,WIDTH,3,"#14283c");
      for(let x=4;x<WIDTH-4;x+=8){
        if(x%112<12){box(c,x,yy,7,7,"#526575");continue;}
        const shirts=["#3d73aa","#edbd68","#f1e1b2","#cb675d","#659b8e","#435b7b"];
        box(c,x+1,yy+3,5,4,shirts[Math.floor(rand()*shirts.length)]);
        box(c,x+2,yy,3,3,rand()<.5?"#e8b98c":"#9b684e");
      }
    }
  }
  box(c,0,31,WIDTH,6,"#0e2530");box(c,0,402,WIDTH,6,"#0e2530");
  for(let i=0;i<12;i++){
    const x=i*56+3,ad=i%3===0?"#345b82":i%3===1?"#deaa4f":"#cbded1";
    for(const y of [31,401]){box(c,x,y,51,7,ad);box(c,x+3,y+2,18,1,"#142f40");box(c,x+24,y+2,15,1,"#142f40");}
  }
  box(c,12,38,648,364,"#174a36");
  box(c,OX-5,OY-3,W+10,H+6,"#266f43");
  for(let i=0;i<10;i++)box(c,OX+i*60,OY,60,H,i%2?"#33884c":"#409e55");
  // Thousands of fixed, cached turf pixels; no per-frame random work.
  for(let i=0;i<7200;i++){
    const x=Math.floor(rand()*W),y=Math.floor(rand()*H);
    box(c,OX+x,OY+y,1+Math.floor(rand()*3),1,i%3===0?"#66ad59":i%3===1?"#2d7b44":"#46994e");
  }
  for(const side of [0,1]){
    const x=side?OX+W:OX;
    for(let j=0;j<5;j++)box(c,side?x-j-1:x+j,OY,1,H,["#286e40","#2c7845","#35854b","#3b9050","#409852"][j]);
  }
  const white="#e6efcd";c.strokeStyle=white;c.lineWidth=2;c.strokeRect(OX,OY,W,H);
  line(c,OX+W/2,OY,OX+W/2,OY+H,white,2);
  c.beginPath();c.arc(OX+W/2,OY+H/2,48,0,Math.PI*2);c.stroke();ellipse(c,OX+W/2,OY+H/2,2,2,white);
  for(const side of [0,1]){
    const x=side?OX+W:OX,d=side?-1:1,y=OY+H/2,gy=y-GOAL/2,gx=x-d*18;
    c.strokeStyle=white;c.lineWidth=2;c.strokeRect(side?x-93:x,y-91,93,182);c.strokeRect(side?x-31:x,y-49,31,98);
    ellipse(c,x+d*66,y,2,2,white);
    c.beginPath();c.arc(x+d*66,y,44,side?-.97:Math.PI-.97,side?.97:Math.PI+.97);c.stroke();
    path(c,[[x,gy],[gx,gy-9],[gx,gy+GOAL-9],[x,gy+GOAL]],"#507e66");
    for(let k=0;k<=GOAL;k+=8)line(c,x,gy+k,gx,gy+k-9,"#c8d9c4");
    for(let k=0;k<=18;k+=6)line(c,x-d*k,gy-k/2,x-d*k,gy+GOAL-k/2,"#91b59d");
    line(c,gx,gy-9,gx,gy+GOAL-9,"#a8bfb5",2);
    box(c,x-2,gy-2,4,5,"#fff4dd");box(c,x-2,gy+GOAL-2,4,5,"#fff4dd");line(c,x,gy,gx,gy-9,"#fff4dd",3);line(c,x,gy+GOAL,gx,gy+GOAL-9,"#e1e6d2",3);
  }
  for(const x of [OX+2,OX+W-2])for(const y of [OY+2,OY+H-2]){
    box(c,x-1,y-13,2,14,"#f4f2d4");path(c,[[x,y-14],[x+9,y-10],[x,y-7]],"#f7c750");
  }
  return canvas;
}
const kits=[["#153f91","#257bdc","#63bbff","#e9f4ff"],["#842d36","#d74648","#fa8b70","#fff1ce"],["#815a20","#e5b33e","#ffdc72","#fff1c4"]];
const skins=[["#6a4032","#bd8059","#e7a873"],["#996449","#e3a57b","#ffd5a6"],["#4c302d","#8a5540","#bb7d59"],["#a46c50","#ecc39d","#ffe0b7"]];
function spriteFrame(c,id,direction,frame){
  const kit=kits[id%5===0?2:id<5?0:1],skin=skins[id%4],hair=["#352b29","#201d25","#7d4a2d","#d6a45b"][id%4];
  const [dx,dy]=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]][direction];
  const kicking=frame===5, tackling=frame===6;
  const phase=frame===0?0:[0,-3,3,-2,4,0,0][frame],bob=frame===2||frame===4?-1:0;
  c.save();c.translate(CW/2,FOOT+bob+(tackling?6:0));
  // Dark outline, staggered cleats, shorts and two-shade socks.
  for(const side of [-1,1]){
    const reach=side===1&&(kicking||tackling)?(tackling?12:10):0;
    const lx=side*4+Math.round(dx*(phase*side*.5+reach)),ly=2+Math.round(dy*(phase*side*.5+reach*.55))+phase*side-(kicking&&side===1?5:0);
    box(c,lx-2,-7,5,12+ly,"#172737");
    box(c,lx-1,-4,3,7+ly,kit[3]);box(c,lx-1,-4,3,3,kit[0]);
    box(c,lx-3,3+ly,7,4,"#172737");box(c,lx-2,3+ly,5,2,"#ecf1d9");
  }
  box(c,-8,-12,16,7,"#152b43");box(c,-6,-11,12,4,kit[0]);box(c,-6,-10,3,4,kit[2]);
  for(const side of [-1,1]){
    const ax=side*(kicking||tackling?12:9)+Math.round(dx*2),ay=-19+side*phase+(tackling?2:0);
    box(c,ax-2,ay,5,12,"#172737");box(c,ax-1,ay+1,3,6,kit[1]);box(c,ax-1,ay+7,3,4,skin[1]);
  }
  path(c,[[-9,-24],[-5,-27],[5,-27],[9,-24],[8,-12],[-8,-12]],"#142a3e");
  path(c,[[-7,-23],[-4,-25],[4,-25],[7,-23],[6,-13],[-6,-13]],kit[1]);
  box(c,-6,-23,3,10,kit[2]);box(c,4,-22,2,9,kit[0]);
  if(dy<0){box(c,-2,-22,4,7,kit[3]);box(c,-1,-21,2,5,kit[1]);}
  else {box(c,-2,-25,4,2,kit[3]);box(c,-5,-15,10,2,kit[0]);}
  // Distinct chest badge and jersey stripe, readable at native pixel size.
  box(c,-4,-22,2,3,kit[3]);box(c,2,-23,3,2,kit[3]);
  // Four skin palettes, distinct hair, face/eyes and direction-aware details.
  const hx=Math.round(dx*2),hy=-31+Math.round(dy*1);
  box(c,hx-7,hy-6,14,12,"#24272c");box(c,hx-6,hy-7,12,12,skin[0]);
  box(c,hx-5,hy-5,10,9,skin[1]);box(c,hx-4,hy-4,4,7,skin[2]);
  box(c,hx-6,hy-8,12,5,hair);box(c,hx-6,hy-6,3,6,hair);
  if(id%3===0)box(c,hx-4,hy-9,8,2,hair);
  if(dy<0){box(c,hx-5,hy-5,10,9,hair);box(c,hx-4,hy-4,7,2,"#533d33");}
  else if(dx===0){box(c,hx-3,hy,2,2,"#202631");box(c,hx+2,hy,2,2,"#202631");box(c,hx-1,hy+3,3,1,skin[0]);}
  else {box(c,hx+dx*3-1,hy,2,2,"#202631");box(c,hx+dx*5-1,hy+2,3,2,skin[2]);}
  c.restore();
}
function atlas(){
  const {canvas,ctx}=surface(CW*COLS,CH*ROWS);
  for(let id=0;id<10;id++)for(let d=0;d<8;d++)for(let f=0;f<FRAMES;f++){
    ctx.save();ctx.translate(((d%4)*FRAMES+f)*CW,(id*2+Math.floor(d/4))*CH);spriteFrame(ctx,id,d,f);ctx.restore();
  }
  return canvas;
}
function ballArt(){
  const {canvas,ctx:c}=surface(16,16);
  path(c,[[5,1],[11,1],[15,5],[15,11],[11,15],[5,15],[1,11],[1,5]],"#203544");
  path(c,[[5,2],[10,2],[14,6],[14,10],[10,14],[6,14],[2,10],[2,6]],"#f6f2db");
  path(c,[[6,5],[10,5],[12,8],[9,11],[5,9]],"#3e5057");box(c,3,4,2,2,"#ffffff");box(c,11,11,2,2,"#9baaad");
  return canvas;
}
export function spriteIndex(p,tick,s){
  const moving=Math.hypot(p.vx,p.vy)>3;
  const kicking=!!s&&s.ball.owner===null&&s.ball.last===p.id&&p.cooldown>.16&&Math.hypot(s.ball.vx,s.ball.vy)>60;
  const tackling=!!s&&p.id===s.user&&s.event==="Great tackle!"&&tick-s.eventTick<12;
  const dx=kicking&&s?s.ball.vx:p.vx,dy=kicking&&s?s.ball.vy:p.vy;
  const d=moving||kicking?(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8:p.face<0?4:0;
  const f=kicking?5:tackling?6:moving?1+Math.floor(tick/(Math.hypot(p.vx,p.vy)>95?3:5))%4:0;
  return {x:((d%4)*FRAMES+f)*CW,y:(p.id*2+Math.floor(d/4))*CH,w:CW,h:CH};
}
const frameName=(f)=>f.x/CW+":"+f.y/CH;
export function marks(s,tip,paused){
  const out=[];
  const add=(kind,x,y,a,b,color,alpha=1,width=2)=>out.push({kind,x,y,a,b,color,alpha,width});
  const u=s.players[s.user];
  for(const p of s.players){
    add("ellipse",OX+p.x+3,OY+p.y+6,24,10,0x12332a,.48);
    if(Math.hypot(p.vx,p.vy)>95)for(let j=0;j<3;j++)add("dot",OX+p.x-p.vx*.11*(j+1),OY+p.y-p.vy*.11*(j+1)+6,1.5,0,0xe6ce9d,.55-j*.12);
  }
  add("ring",OX+u.x,OY+u.y+2,16,0,0xffe078,1,3);
  const b=s.ball, speed=Math.hypot(b.vx,b.vy);
  if(b.owner!==null){
    const owner=s.players[b.owner];
    add("ring",OX+owner.x,OY+owner.y+3,12,0,owner.team===0?0xa2d9ff:0xffaa95,.85,2);
  }
  if(s.tick-s.eventTick<12&&(s.event==="Great tackle!"||s.event.includes("shot"))){
    for(let j=0;j<7;j++){
      const a=j*Math.PI*2/7,d=5+(s.tick-s.eventTick)*1.4;
      add("dot",OX+b.x+Math.cos(a)*d,OY+b.y+Math.sin(a)*d,2,0,0xffe9a0,.8);
    }
  }
  add("ellipse",OX+b.x+2,OY+b.y+4,13,6,0x12332a,.5);
  if(speed>220)for(let j=1;j<=5;j++)add("dot",OX+b.x-b.vx*.017*j,OY+b.y-b.vy*.017*j,4-j*.52,0,0xfff1ba,.8-j*.12);
  if(tip?.target){
    const a={x:OX+u.x,y:OY+u.y},t={x:OX+tip.target.x,y:OY+tip.target.y},ang=Math.atan2(t.y-a.y,t.x-a.x),d=Math.hypot(t.x-a.x,t.y-a.y);
    add("ellipse",t.x,t.y,paused?88:46,paused?58:32,0xffe078,.19);
    for(let n=15;n<d-10;n+=13){const m=Math.min(n+7,d-8);add("line",a.x+Math.cos(ang)*n,a.y+Math.sin(ang)*n,a.x+Math.cos(ang)*m,a.y+Math.sin(ang)*m,0xffe078,1,3);}
    for(const delta of [-.55,.55])add("line",t.x,t.y,t.x-Math.cos(ang+delta)*14,t.y-Math.sin(ang+delta)*14,0xffe078,1,3);
    add("ring",t.x,t.y,12,0,0xffe078,1,2);
  }
  if(s.restart>0){
    const elapsed=1.15-s.restart;
    for(let j=0;j<44;j++){
      const ang=j*2.39996,dist=(24+j%9*7)*elapsed*2;
      add("dot",WIDTH/2+Math.cos(ang)*dist,HEIGHT/2+Math.sin(ang)*dist+elapsed*elapsed*30,2+j%3,0,[0xffdb70,0x7fbcff,0xfaf0d2,0xf28368][j%4],Math.max(0,s.restart/1.15));
    }
  }
  return out;
}
function foreground(m){return m.kind==="line"||m.kind==="ring"&&m.color===0xffe078||m.kind==="dot"&&m.color!==0xe6ce9d;}
function caption(s,tip,paused){
  return s.restart>0?(s.kickoff===1?"BLUE SCORES!":"RED SCORES!"):paused&&tip?"COACH • THINK": "";
}
function canvasVisual(canvas,field,players,ball) {
  const c=canvas.getContext("2d");c.imageSmoothingEnabled=false;
  return {name:"Canvas fallback",draw(s,tip,paused){
    c.clearRect(0,0,WIDTH,HEIGHT);c.drawImage(field,0,0);
    const all=marks(s,tip,paused);
    const drawMark=(m)=>{
      c.globalAlpha=m.alpha;const col=color(m.color);
      if(m.kind==="ellipse")ellipse(c,m.x,m.y,m.a/2,m.b/2,col);
      else if(m.kind==="dot")ellipse(c,m.x,m.y,m.a,m.a,col);
      else if(m.kind==="line")line(c,m.x,m.y,m.a,m.b,col,m.width);
      else {c.strokeStyle=col;c.lineWidth=m.width;c.beginPath();c.arc(m.x,m.y,m.a,0,Math.PI*2);c.stroke();}
    };
    all.filter(m=>!foreground(m)).forEach(drawMark);
    c.globalAlpha=1;
    for(const p of [...s.players].sort((a,b)=>a.y-b.y)){
      const f=spriteIndex(p,s.tick,s);c.drawImage(players,f.x,f.y,f.w,f.h,Math.round(OX+p.x-CW/2),Math.round(OY+p.y-FOOT),CW,CH);
    }
    c.drawImage(ball,Math.round(OX+s.ball.x-6),Math.round(OY+s.ball.y-6),12,12);
    all.filter(foreground).forEach(drawMark);c.globalAlpha=1;
    const u=s.players[s.user];c.textAlign="center";c.font="bold 11px monospace";c.lineWidth=3;c.strokeStyle="#192e38";c.fillStyle="#ffe078";
    c.strokeText("YOU",OX+u.x,OY+u.y-44);c.fillText("YOU",OX+u.x,OY+u.y-44);
    const text=caption(s,tip,paused);
    if(text){c.font="bold 28px monospace";c.lineWidth=6;c.strokeText(text,WIDTH/2,30);c.fillText(text,WIDTH/2,30);}
  }};
}
function loadPhaser(){
  const current=()=> (window).Phaser??null;
  if(current())return Promise.resolve(current());
  return new Promise(resolve=>{
    const script=document.createElement("script");let settled=false;
    const done=()=>{if(settled)return;settled=true;window.clearTimeout(timer);resolve(current());};
    const timer=window.setTimeout(done,3000);
    script.src="https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js";
    script.async=true;script.crossOrigin="anonymous";script.onload=done;script.onerror=done;document.head.appendChild(script);
  });
}
export async function createVisual(canvas){
  const field=stadium(),players=atlas(),ball=ballArt();
  const phaser=await loadPhaser();
  if(!phaser)return canvasVisual(canvas,field,players,ball);
  try{
    return await new Promise((resolve,reject)=>{
      let game;
      const timeout=window.setTimeout(()=>{game?.destroy(false);reject(new Error("Phaser scene timeout"));},3000);
      game=new phaser.Game({type:phaser.AUTO,canvas,width:WIDTH,height:HEIGHT,pixelArt:true,roundPixels:true,transparent:false,
        banner:false,audio:{noAudio:true},input:{keyboard:false,mouse:false,touch:false,gamepad:false},
        scene:{create(){
          try{
            this.textures.addCanvas("stadium",field);this.textures.addCanvas("football",ball);
            const texture=this.textures.addCanvas("players",players);
            if(!texture)throw new Error("Sprite atlas unavailable");
            for(let row=0;row<ROWS;row++)for(let col=0;col<COLS;col++)texture.add(col+":"+row,0,col*CW,row*CH,CW,CH);
            this.add.image(0,0,"stadium").setOrigin(0,0).setDepth(0);
            const gfx=this.add.graphics(); gfx.setDepth(1);
            const overlay=this.add.graphics();overlay.setDepth(1000);
            const sprites=Array.from({length:10},(_,id)=>this.add.sprite(0,0,"players","0:"+(id*2)).setOrigin(.5,FOOT/CH).setDepth(10));
            const football=this.add.image(0,0,"football").setOrigin(.5).setDepth(1000).setScale(.75);
            const style={fontFamily:"monospace",fontSize:"11px",fontStyle:"bold",color:"#ffe078",stroke:"#192e38",strokeThickness:3};
            const label=this.add.text(0,0,"YOU",style).setOrigin(.5).setDepth(1001);
            const banner=this.add.text(WIDTH/2,20,"",{...style,fontSize:"28px",strokeThickness:6}).setOrigin(.5).setDepth(1002);
            window.clearTimeout(timeout);
            resolve({name:"Phaser 3.90",draw(s,tip,paused){
              gfx.clear();overlay.clear();
              for(const m of marks(s,tip,paused)){
                const layer=foreground(m)?overlay:gfx;
                if(m.kind==="ellipse")layer.fillStyle(m.color,m.alpha).fillEllipse(m.x,m.y,m.a,m.b);
                else if(m.kind==="dot")layer.fillStyle(m.color,m.alpha).fillCircle(m.x,m.y,m.a);
                else if(m.kind==="ring")layer.lineStyle(m.width,m.color,m.alpha).strokeCircle(m.x,m.y,m.a);
                else layer.lineStyle(m.width,m.color,m.alpha).lineBetween(m.x,m.y,m.a,m.b);
              }
              for(const p of s.players)sprites[p.id].setFrame(frameName(spriteIndex(p,s.tick,s))).setPosition(Math.round(OX+p.x),Math.round(OY+p.y)).setDepth(10+p.y);
              football.setPosition(OX+s.ball.x,OY+s.ball.y);
              const u=s.players[s.user];label.setPosition(OX+u.x,OY+u.y-44);
              const text=caption(s,tip,paused);banner.setText(text).setVisible(Boolean(text));
            }});
          }catch(err){window.clearTimeout(timeout);game?.destroy(false);reject(err);}
        }}
      });
    });
  }catch{
    // A WebGL canvas cannot be reused as 2D, so replace the element on failure.
    const replacement=canvas.cloneNode(false);canvas.replaceWith(replacement);
    return canvasVisual(replacement,field,players,ball);
  }
}
