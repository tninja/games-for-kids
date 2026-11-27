import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
// Published JavaScript modules are ordinary browser ESM, even in this CommonJS repo.
const load = async name => import("data:text/javascript;base64," + Buffer.from(readFileSync(new URL("../docs/adventure_worlds/"+name+".js",import.meta.url))).toString("base64"));
const {worlds,normalClues,chapterRewards} = await load("content");
const {fresh,restore,tokens,complete,progressKey,heroLevel,heroRank} = await load("engine");
test("all worlds have twelve reachable scenes, one correct choice, translations and pinyin",()=>{
  assert.equal(worlds.length,4);
  for(const w of worlds) {
    assert.equal(w.scenes.length,12); assert.equal(chapterRewards[w.id].length,3);
    for(const [name,icon,story,clue,meaning,options] of w.scenes){
      assert.ok(name && icon && story && meaning);
      assert.equal(options.length,3); assert.equal(options.filter(o=>o[3]).length,1);
      for(const line of [clue,...options.map(o=>o[0])]){
        for(const t of tokens(line)) {
          assert.ok(t.zh);
          if (/\p{Script=Han}/u.test(t.zh)) assert.ok(t.py,t.zh);
        }
      }
    }
    assert.ok(tokens(w.scenes[0][3]).map(t=>t.zh).join("").length<=12);
  }
});
test("default pinyin, reward on completion, no duplicate XP on replay, help never blocks",()=>{
  const s=fresh();assert.equal(s.mode,"all");
  for(const w of worlds) {
    w.scenes.forEach((scene,i)=>{assert.equal(complete(s,w.id,i,scene[3],true,false),25);assert.equal(complete(s,w.id,i,scene[3],false,true),0);});
    assert.equal(s.progress[w.id],12);
  }
  assert.equal(s.xp,1200);assert.deepEqual(restore(JSON.stringify(s)),s);
});
test("only unassisted first-try hidden pinyin practice counts; invalid save is safe",()=>{
  const s=fresh();s.mode="tap";
  complete(s,"dragon",0,"保护|bǎo hù",false,true);
  complete(s,"soccer",0,"保护|bǎo hù",false,true);
  assert.equal(s.words["保护"],2);
  complete(s,"soccer",1,"保护|bǎo hù",true,true);
  assert.equal(s.words["保护"],2);
  assert.deepEqual(restore("{broken"),fresh());
  assert.equal(restore('{"xp":-1,"mode":"bad"}').xp,0);
});

test("Easy defaults, Normal is longer, and both difficulties save independently",()=>{
 const s=fresh(); assert.equal(s.difficulty,"easy");
 for(const w of worlds) {
   assert.equal(normalClues[w.id].length,w.scenes.length);
   for(let i=0;i<w.scenes.length;i++){
     const [line,meaning]=normalClues[w.id][i];
     assert.ok(meaning);
     assert.ok(tokens(line).map(t=>t.zh).join("").length>tokens(w.scenes[i][3]).map(t=>t.zh).join("").length);
     for(const t of tokens(line)) if(/\p{Script=Han}/u.test(t.zh)) assert.ok(t.py);
   }
 }
 complete(s,progressKey("dragon","easy"),0,"水|shuǐ",false,true);
 s.difficulty="normal";
 assert.equal(s.progress[progressKey("dragon","normal")],undefined);
 complete(s,progressKey("dragon","normal"),0,"水|shuǐ",true,false);
 assert.equal(s.progress.dragon,1);
 assert.equal(s.progress["dragon:normal"],1);
 assert.equal(restore(JSON.stringify(s)).difficulty,"normal");
});

test('help and retries earn equal XP; level increases each 100 XP',()=>{const s=fresh();for(let i=0;i<4;i++)assert.equal(complete(s,'dragon',i,'水|shuǐ',i%2===0,i%2!==0),25);assert.equal(heroLevel(s.xp),2);assert.equal(heroRank(3),'Pathfinder');assert.equal(complete(s,'dragon',3,'水|shuǐ',false,true),0);});

test("every scene renders an original SVG illustration", async()=>{
 const original=globalThis.document;
 globalThis.document={createElement:()=>({className:"",innerHTML:""})};
 try{
  const {sceneArt}=await load("art");
  for(const w of worlds) {
    const illustrations=new Set();
    w.scenes.forEach((scene,i)=>{
      const art=sceneArt(w.id,i,scene[1]);
      assert.equal(art.className,"scene-art");
      assert.match(art.innerHTML,/<svg[^>]*viewBox="0 0 600 280"/);
      assert.ok(art.innerHTML.includes(scene[1]));
      illustrations.add(art.innerHTML);
    });
    assert.equal(illustrations.size,w.scenes.length);
  }
 }finally{if(original===undefined)delete globalThis.document;else globalThis.document=original;}
});

test("clues never contain the entire correct action; dialogue is authored for every scene",async()=>{
 const {storyDialogue}=await load("content");
 const han=line=>tokens(line).map(t=>t.zh).join("").replace(/[，。！？、\s]/g,"");
 for(const w of worlds){
  assert.equal(storyDialogue[w.id].length,w.scenes.length);
  w.scenes.forEach((s,i)=>{
   const answer=han(s[5].find(o=>o[3])[0]);
   assert.ok(!han(s[3]).includes(answer),w.id+" easy "+i);
   assert.ok(!han(normalClues[w.id][i][0]).includes(answer),w.id+" normal "+i);
   assert.ok(storyDialogue[w.id][i].length>10);
  });
 }
});

test("routes persist separately for each difficulty, old saves default to no routes",async()=>{
 const {routeKey}=await load("engine");
 const s=restore('{"xp":25,"progress":{"dragon":1},"mode":"all"}');
 assert.deepEqual(s.routes,{});
 s.routes[routeKey(progressKey("dragon","easy"),4)]=1;
 s.routes[routeKey(progressKey("dragon","normal"),4)]=0;
 assert.deepEqual(restore(JSON.stringify(s)),s);
 assert.deepEqual(restore('{"routes":{"dragon:4":7}}').routes,{});
});
test("all eight alternate routes have valid independent reading challenges",async()=>{
 const {forks}=await load("forks");
 const han=line=>tokens(line).map(t=>t.zh).join("").replace(/[，。！？、\s]/g,"");
 for(const w of worlds){
  assert.deepEqual(Object.keys(forks[w.id]),["4","8"]);
  for(const fork of Object.values(forks[w.id])){
   assert.equal(fork.paths.length,2);assert.equal(fork.follow.length,2);
   const s=fork.alternate;assert.equal(s[5].length,3);assert.equal(s[5].filter(o=>o[3]).length,1);
   const correct=han(s[5].find(o=>o[3])[0]);
   assert.ok(!han(s[3]).includes(correct));assert.ok(!han(fork.normal[0]).includes(correct));
   for(const line of [s[3],fork.normal[0],...s[5].map(o=>o[0]),...fork.paths.map(p=>p.label)])for(const t of tokens(line))if(/\p{Script=Han}/u.test(t.zh))assert.ok(t.py);
  }
 }
});

test("alternate-route illustrations differ from the main route",async()=>{
 const original=globalThis.document;
 globalThis.document={createElement:()=>({className:"",innerHTML:""})};
 try{
  const {sceneArt}=await load("art");const {forks}=await load("forks");
  for(const w of worlds)for(const i of [4,8]){
   const a=sceneArt(w.id,i,w.scenes[i][1],0).innerHTML;
   const b=sceneArt(w.id,i,forks[w.id][i].alternate[1],1).innerHTML;
   assert.notEqual(a,b);assert.match(b,/data-variant="1"/);
  }
 }finally{if(original===undefined)delete globalThis.document;else globalThis.document=original;}
});
