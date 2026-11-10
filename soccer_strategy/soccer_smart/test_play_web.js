"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname,"../..");
const web = require(path.join(root,"docs/soccer_smart/app.js"));
const data = JSON.parse(fs.readFileSync(path.join(root,"docs/soccer_smart/data.json"),"utf8"));
const ctx = {font:"16px sans-serif",measureText:s=>({width:s.length*7.2}),fillText(){},
  fillRect(){},strokeRect(){},beginPath(){},roundRect(){},rect(){},fill(){},stroke(){},
  arc(){},ellipse(){},moveTo(){},lineTo(){},closePath(){},save(){},restore(){},translate(){}};
const storage = {};
const app = new web.SoccerSmartWebApp(data,{getContext:()=>ctx},
  {getItem:k=>storage[k]||null,setItem:(k,v)=>{storage[k]=v;}});
function fits() {
  app.draw();
  assert.deepEqual(app.layoutErrors,[]);
}
assert.equal(app.buttons().length,8);
app.handleKeyDown("8");
assert.match(app.mobileState().badge,/CONTINUOUS/);
fits();
app.handleKeyDown("ArrowRight");
app.handleKeyDown("ArrowRight");
assert.equal(app.playBrowser.page,1);
app.handleKeyDown("6");
assert.equal(app.session,null);
fits();
app.handleKeyDown("ArrowLeft");
app.handleKeyDown("1");
assert.equal(app.session.plays.length,4);
assert.equal(new Set(app.session.plays.map(p=>p.family)).size,4);
app.handleKeyDown(" ");
const button = app.buttons().find(b=>b.action==="choice:0").rect;
const point = [button.x+10,button.y+10];
app.handlePointerDown(point,"touch");
assert.equal(app.session.phase,"decide");
app.handlePointerDown(point,"touch");
assert.equal(app.session.phase,"outcome");
app.handleKeyDown(" ");
const saved = JSON.stringify(app.session.results);
const persisted = JSON.stringify(storage);
app.handleKeyDown("c");
app.handleKeyDown(" ");
app.handleKeyDown("r");
app.handleKeyDown(" ");
app.handleKeyDown("2");
app.handleKeyDown(" ");
assert.equal(JSON.stringify(app.session.results),saved);
assert.equal(JSON.stringify(storage),persisted);
assert.match(app.mobileState().note,/Practice branch/);
app.handleKeyDown("n");
app.handleKeyDown(" ");
app.handleKeyDown("1");
assert.equal(JSON.stringify(app.session.results),saved);
app.handleKeyDown("b");
assert.equal(app.session,null);
assert.equal(app.playBrowser.page,0);
fits();
app.handlePointerDown([1150,45],"mouse");
assert.equal(app.playBrowser,null);
assert.throws(()=>new web.ContinuousSession(data,-1,0));
assert.throws(()=>new web.ContinuousSession(data,9,0));

let nodes = 0, choices = 0;
for (const play of data.plays) {
  app.activate("continuous");
  app.activate("play_family:"+play.family);
  const session = app.session;
  const playIndex = session.plays.findIndex(p=>p.id===play.id);
  for (const node of play.nodes) {
    nodes += 1;
    session.index = playIndex;
    session.nodeId = node.scene.id;
    for (const phase of ["observe","decide"]) {
      session.phase = phase;
      session.selected = null;
      fits();
    }
    for (const choice of node.scene.choices) {
      choices += 1;
      session.index = playIndex;
      session.nodeId = node.scene.id;
      session.phase = "decide";
      session.depth = 1;
      const index = session.scene.choices.findIndex(c=>c.key===choice.key);
      const end = web.positions(session.scene,"outcome",1,index);
      if (choice.rating === 2) {
        assert.deepEqual(web.positions(session.scene,"coach",1,index),end);
      }
      assert.equal(session.choose(index),true);
      for (const phase of ["outcome","feedback","coach"]) {
        session.phase = phase;
        session.elapsed = 1.2;
        fits();
        assert.match(app.mobileState().badge,/PLAY/);
      }
      session.phase = "feedback";
      const target = node.exits.find(e=>e[0]===choice.key)[1];
      session.advance();
      if (target !== null) {
        assert.equal(session.nodeId,target);
        assert.deepEqual(web.positions(session.scene,"observe",0,null),end);
      }
    }
  }
  session.phase = "summary";
  fits();
  assert.match(app.mobileState().subtitle,/visited steps only/);
}
app.activate("continuous");
app.activate("play_family:0");
while (app.session.phase !== "summary") {
  app.activate("skip");
  const best = app.session.scene.choices.findIndex(c=>c.rating===2);
  app.activate("choice:"+best);
  app.activate("skip");
  app.activate("next");
}
assert.equal(app.session.summary()[0],app.session.summary()[1]);
fits();
app.handleKeyDown("Escape");
app.activate("cards:0");
assert.equal(app.cards.length,7);
app.activate("book");
fits();
console.log(JSON.stringify({plays:data.plays.length,nodes:nodes,choices:choices}));
