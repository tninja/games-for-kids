import {forks} from "./forks.js";
import {sceneArt} from "./art.js";
import {worlds, normalClues, chapterRewards, storyDialogue} from "./content.js";
import {KEY, fresh, restore, complete, tokens, progressKey, heroLevel, heroRank, routeKey} from "./engine.js";
const root = document.querySelector("#game");
let save = fresh();
try { save = restore(localStorage.getItem(KEY)); } catch { /* private browsing */ }
let world;
let index = 0, helped = false, firstTry = true, solved = false, english = false, feedback = "", points = 0, levelBefore = 1, audioStatus = "";
let replaying = false;
let replayRoutes = {};
const revealed = new Set();
function el(tag, text = "", cls = "") {
  const e = document.createElement(tag); e.textContent = text; e.className = cls; return e;
}
function persist() { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch { /* game continues in memory */ } }
function btn(label, fn, cls = "") {
  const b = document.createElement("button"); b.type = "button"; b.textContent = label; b.className = cls; b.onclick = fn; return b;
}
function speak(line, slow = false) {
  helped = true;
  const status = document.querySelector("#audio-status");
  const report = (message) => { if (status && status.isConnected) { audioStatus = message; status.textContent = message; } };
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) { report("Audio unavailable. Use pinyin or English."); return; }
  const u = new SpeechSynthesisUtterance(tokens(line).map(t=>t.zh).join(""));
  u.lang = "zh-CN"; u.rate = slow ? 0.55 : 0.85;
  const voices = speechSynthesis.getVoices();
  const voice = voices.find(v=>v.lang.toLowerCase().startsWith("zh-cn")) ?? voices.find(v=>v.lang.toLowerCase().startsWith("zh"));
  if (voice) u.voice = voice;
  else if (voices.length) { report("No Mandarin voice found. Enable a Chinese voice on your device or use pinyin."); return; }
  u.onerror = event => { if (event.error !== "canceled" && event.error !== "interrupted") report("Audio unavailable. Use pinyin or English."); };
  u.onend = () => report("");
  speechSynthesis.cancel(); report(slow ? "Reading slowly…" : "Listening…"); speechSynthesis.speak(u);
}

function reading(line, interactive = true) {
  const box = el("span","","reading"); box.lang = "zh-Hans";
  for (const {zh,py} of tokens(line)) {
    if (!py) { box.append(el("span",zh,"punct")); continue; }
    const r = document.createElement("ruby");
    r.append(document.createTextNode(zh));
    const rt = document.createElement("rt"); rt.textContent = py;
    const show = save.mode === "all" || revealed.has(zh) || (save.mode === "adaptive" && (save.words[zh] ?? 0) < 2);
    rt.classList.toggle("hidden-pinyin", !show); r.append(rt);
    if (interactive) {
      const b = btn("", () => { helped = true; revealed.add(zh); rt.classList.remove("hidden-pinyin"); speak(zh+"|"+py,true); }, "word");
      b.setAttribute("aria-label", zh + " – hear word and show pinyin"); b.append(r); box.append(b);
    } else box.append(r);
  }
  return box;
}
function resetScene() {
  helped = false; firstTry = true; solved = false; english = false; feedback = ""; points = 0; levelBefore = heroLevel(save.xp); audioStatus = ""; revealed.clear();
  if ("speechSynthesis" in window) speechSynthesis.cancel();
}
function open(w, replay = false) {
  world = w; replaying = replay; replayRoutes = {}; index = replay ? 0 : Math.min(save.progress[progressKey(w.id, save.difficulty)] ?? 0, w.scenes.length); resetScene(); render();
}
function modeControl() {
  const wrap = el("label","Pinyin / 拼音 ","setting");
  const select = document.createElement("select");
  for (const [value,label] of [["all","Always show"],["tap","Tap words"],["adaptive","Learning mode"]]) {
    const opt = document.createElement("option"); opt.value = value; opt.textContent = label; select.append(opt);
  }
  select.value = save.mode;
  select.onchange = () => { if (world && !solved) helped = true; save.mode = select.value; persist(); render(); };
  wrap.append(select); return wrap;
}
function difficultyControl() {
  const wrap = el("label","Difficulty / 难度 ","setting");
  const select = document.createElement("select");
  for (const [value,label] of [["easy","Easy · 简单"],["normal","Normal · 普通"]]) {
    const opt = document.createElement("option"); opt.value = value; opt.textContent = label; select.append(opt);
  }
  select.value = save.difficulty;
  select.onchange = () => { save.difficulty = select.value; persist(); render(); };
  wrap.append(select); return wrap;
}
function heroCard() {
  const level = heroLevel(save.xp);
  const hero = el("section","","hero");
  const details = el("div","","hero-details");
  details.append(el("strong","Level "+level+" · "+heroRank(level)),el("span",(save.xp % 100)+" / 100 XP to next level","progress"));
  const meter = document.createElement("progress"); meter.max=100; meter.value=save.xp%100; meter.setAttribute("aria-label","XP towards next level");
  details.append(meter); hero.append(el("div","🧭","hero-icon"),details); return hero;
}
function render() {
  root.replaceChildren();
  const bar = el("div","","bar");
  bar.append(btn("← Worlds",()=>{world=undefined; resetScene();render();},"secondary"),el("strong","✦ "+save.xp+" XP"),modeControl());
  root.append(bar,heroCard());
  if (!world) {
    root.append(difficultyControl());
    const intro = el("section","","intro");
    intro.append(el("div","✧ YOUR ADVENTURE BEGINS ✧","eyebrow"),el("h1","Adventure Worlds"),el("h2","中文奇幻之旅"),el("p","Choose a world. Read Chinese clues, work out what they mean, choose your own routes, use English whenever you need help, and collect chapter treasures as your hero grows. Every four scenes is a good place to take a break. No timer!"));
    root.append(intro);
    const grid = el("div","","worlds");
    for (const w of worlds) {
      const count = Math.min(save.progress[progressKey(w.id, save.difficulty)] ?? 0,w.scenes.length);
      const card = btn("",()=>open(w),"world");
      card.style.setProperty("--accent",w.color);
      card.append(sceneArt(w.id,0,w.scenes[0][1]),el("strong",w.title),el("span",w.zh,"zh"),el("span",w.subtitle),el("span",count+" / "+w.scenes.length+" scenes • "+Math.floor(count/4)+"/3 chapters","progress"));
      grid.append(card);
    }
    root.append(grid);
    const journal = el("section","","panel");
    journal.append(el("h2","My treasure journal · 宝物"),el("p","Treasure collection for this difficulty. Easy and Normal have separate progress; replays never award duplicate XP."));
    const rewards = worlds.flatMap(w=>chapterRewards[w.id].slice(0,Math.floor(Math.min(w.scenes.length,save.progress[progressKey(w.id, save.difficulty)] ?? 0)/4)));
    journal.append(el("p",rewards.length ? rewards.join("  •  ") : "Your collection is waiting!"));
    const words = Object.entries(save.words).filter(([,n])=>n>=2).map(([word])=>word);
    journal.append(el("h3","Reading practice · 阅读练习"),el("p",words.length ? "Words seen in at least two unassisted first-try Tap words scenes (not a mastery test): "+words.join("、") : "Pinyin is on by default. Try Tap words mode when ready; Learning mode hides only words practiced twice without help."));
    const routeNotes=worlds.flatMap(w=>Object.entries(forks[w.id]).flatMap(([at,f])=>{const choice=save.routes[routeKey(progressKey(w.id,save.difficulty),Number(at))];return choice===undefined?[]:[w.title+": "+f.paths[choice].title];}));
    if(routeNotes.length)journal.append(el("h3","My route journal · 路线"),el("p",routeNotes.join(" • ")));
    root.append(journal); return;
  }
  const w = world;
  const title = el("section","","chapter"); title.style.setProperty("--accent",w.color);
  title.append(el("span",w.icon,"chapter-icon"),el("div",w.title+" · "+w.zh+" · "+(save.difficulty==="easy"?"Easy":"Normal"),"eyebrow"));
  if (index >= w.scenes.length) {
    title.append(el("h1","Adventure complete!"),el("div",w.trophy,"world-icon"),el("h2",chapterRewards[w.id][2]),el("p","Replay the story and try the other routes, or visit another world."));
    root.append(title,btn("Replay & choose new routes",()=>open(w,true)),btn("Choose another world",()=>{world=undefined;resetScene();render();},"secondary")); return;
  }
  const key=progressKey(w.id,save.difficulty);
  const routes=replaying?replayRoutes:save.routes;
  const fork=forks[w.id]?.[index];
  const rk=routeKey(key,index);
  if(fork && routes[rk]===undefined) {
    title.append(el("h1","Choose your route · 选择路线"),sceneArt(w.id,index,w.scenes[index][1]),el("p","Both routes are real adventures. Neither is wrong; each has its own story and Chinese challenge."));
    root.append(title);
    const choices=el("section","","fork-grid");
    fork.paths.forEach((path,i)=>{
      const card=el("div","","panel fork-option");
      const go=btn("",()=>{routes[rk]=i;if(!replaying)persist();resetScene();render();window.scrollTo(0,0);},"action");
      go.append(reading(path.label,false));
      card.append(el("p",path.title),go,btn("🔊 Listen",()=>speak(path.label,true),"word-help"));
      choices.append(card);
    });
    root.append(choices);
    const status=el("p","","translation");status.id="audio-status";status.setAttribute("role","status");root.append(status);
    return;
  }
  const alternate=fork && routes[rk]===1;
  const [name,icon,story,easyLine,easyTranslation,options]=alternate?fork.alternate:w.scenes[index];
  const [line,translation]=save.difficulty==="normal"?(alternate?fork.normal:normalClues[w.id][index]):[easyLine,easyTranslation];
  const dialogue=alternate?fork.dialogue:storyDialogue[w.id][index];
  const previous=forks[w.id]?.[index-1];
  const previousRoute=routes[routeKey(key,index-1)];
  title.append(el("span","CHAPTER "+(Math.floor(index/4)+1)+" / 3 · SCENE "+(index+1)+" / "+w.scenes.length,"progress"),sceneArt(w.id,index,icon,alternate?1:0),el("h1",name),el("p",story));
  if(previous && previousRoute!==undefined)title.append(el("p",previous.follow[previousRoute],"route-memory"));
  title.append(el("p",dialogue,"dialogue"));
  root.append(title);
  const clue = el("section","","panel clue");
  clue.append(el("div","中文线索 · Chinese clue","eyebrow"),reading(line));
  const tools = el("div","","tools");
  tools.append(btn("🔊 Read aloud",()=>speak(line),"secondary"),btn("🐢 Slow reading",()=>speak(line,true),"secondary"),btn(english?"Hide English":"English help",()=>{english=!english;helped=true;render();},"secondary"));
  clue.append(tools,el("p","Tap any Chinese word to hear it and reveal its pinyin.","translation"));
  const status=el("p",audioStatus,"translation"); status.id="audio-status"; status.setAttribute("role","status"); clue.append(status);
  if (english) clue.append(el("p",translation,"translation"));
  root.append(clue);
  const actions=el("section","","actions");
  actions.append(el("h2","What will you do?"));
  const offset=(index+worlds.indexOf(w)+(alternate?1:0))%options.length;
  const ordered=options.slice(offset).concat(options.slice(0,offset));
  for (const [label,meaning,outcome,correct] of ordered) {
    const row=el("div","","choice");
    const b=btn("",()=>{
      if (solved) return;
      feedback=outcome;
      if (correct) { solved=true; levelBefore=heroLevel(save.xp); points=complete(save,progressKey(w.id, save.difficulty),index,line,helped,firstTry);persist(); }
      else firstTry=false;
      render();
    },"action");
    b.append(reading(label,false)); b.disabled=solved; row.append(b);
    row.append(btn("🔊 Listen to choice",()=>speak(label,true),"word-help"));
    if (english) row.append(el("p",meaning,"translation"));
    if (save.mode !== "all") {
      row.append(btn("Show pinyin",()=>{helped=true;for (const t of tokens(label)) revealed.add(t.zh);render();},"word-help"));
    }
    actions.append(row);
  }
  root.append(actions);
  if (feedback) {
    const result=el("section","","panel result"); result.setAttribute("role","status");
    result.append(el("h2",solved?"✨ Great adventure!":"Something unexpected happened…"),el("p",feedback));
    if (solved) {
      result.append(el("p",points ? "+"+points+" XP · Quest complete!" : "Replay complete — no extra XP.","progress"));
      if (heroLevel(save.xp)>levelBefore) result.append(el("h2","🎉 Level up! Level "+heroLevel(save.xp),"level-up"));
      if ((index+1)%4===0) result.append(el("h2","🎁 Chapter treasure: "+chapterRewards[w.id][Math.floor(index/4)],"level-up"));
      result.append(btn(index+1===w.scenes.length?"Finish adventure":(index+1)%4===0?"Next chapter →":"Continue →",()=>{index++;resetScene();render();}));
      if ((index+1)%4===0 && index+1<w.scenes.length) result.append(btn("Save & take a break",()=>{world=undefined;resetScene();render();},"secondary"));
    }
    else result.append(el("p","Read the clue again, or use help. Try another action."));
    root.insertBefore(result,actions);
    result.scrollIntoView({block:"nearest"});
  }
}
render();
