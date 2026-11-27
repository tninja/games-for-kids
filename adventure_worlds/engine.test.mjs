import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
// Published JavaScript modules are ordinary browser ESM, even in this CommonJS repo.
const load = async name => import("data:text/javascript;base64," + Buffer.from(readFileSync(new URL("../docs/adventure_worlds/"+name+".js",import.meta.url))).toString("base64"));
const {worlds,normalClues} = await load("content");
const {fresh,restore,tokens,complete,progressKey} = await load("engine");
test("all worlds have twelve reachable scenes, one correct choice, translations and pinyin",()=>{
  assert.equal(worlds.length,4);
  for(const w of worlds) {
    assert.equal(w.scenes.length,12);
    for(const [name,icon,story,clue,meaning,options] of w.scenes){
      assert.ok(name && icon && story && meaning);
      assert.equal(options.filter(o=>o[3]).length,1);
      for(const line of [clue,...options.map(o=>o[0])]){
        for(const t of tokens(line)) {
          assert.ok(t.zh);
          if (/\p{Script=Han}/u.test(t.zh)) assert.ok(t.py,t.zh);
        }
      }
    }
    assert.ok(tokens(w.scenes[0][3]).map(t=>t.zh).join("").length<=10);
  }
});
test("default pinyin, reward on completion, no duplicate XP on replay, help never blocks",()=>{
  const s=fresh();assert.equal(s.mode,"all");
  for(const w of worlds) {
    w.scenes.forEach((scene,i)=>{assert.equal(complete(s,w.id,i,scene[3],true,false),20);assert.equal(complete(s,w.id,i,scene[3],false,true),0);});
    assert.equal(s.progress[w.id],12);
  }
  assert.equal(s.xp,960);assert.deepEqual(restore(JSON.stringify(s)),s);
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
