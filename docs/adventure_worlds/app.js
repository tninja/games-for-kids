import {worlds, normalClues} from "./content.js";
import {KEY, fresh, restore, complete, tokens, progressKey} from "./engine.js";
const root = document.querySelector("#game");
let save = fresh();
try { save = restore(localStorage.getItem(KEY)); } catch { /* private browsing */ }
let world;
let index = 0, helped = false, firstTry = true, solved = false, english = false, feedback = "", points = 0;
const revealed = new Set();
function el(tag, text = "", cls = "") {
  const e = document.createElement(tag); e.textContent = text; e.className = cls; return e;
}
function persist() { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch { /* game continues in memory */ } }
function btn(label, fn, cls = "") {
  const b = document.createElement("button"); b.type = "button"; b.textContent = label; b.className = cls; b.onclick = fn; return b;
}
function speak(line) {
  helped = true;
  if (!("speechSynthesis" in window)) { feedback = "Audio unavailable. Try pinyin or English help."; render(); return; }
  const u = new SpeechSynthesisUtterance(tokens(line).map(t=>t.zh).join(""));
  u.lang = "zh-CN"; u.rate = 0.8;
  const voice = speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith("zh-cn")) ?? speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith("zh"));
  if (voice) u.voice = voice;
  u.onerror = () => { if (world && !solved) { feedback = "Audio unavailable. Try pinyin or English help."; render(); } };
  speechSynthesis.cancel(); speechSynthesis.speak(u);
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
    if (interactive && !show) {
      const b = btn("", () => { helped = true; revealed.add(zh); render(); }, "word");
      b.setAttribute("aria-label", zh + " – show pinyin"); b.append(r); box.append(b);
    } else box.append(r);
  }
  return box;
}
function resetScene() {
  helped = false; firstTry = true; solved = false; english = false; feedback = ""; points = 0; revealed.clear();
  if ("speechSynthesis" in window) speechSynthesis.cancel();
}
function open(w, replay = false) {
  world = w; index = replay ? 0 : Math.min(save.progress[progressKey(w.id, save.difficulty)] ?? 0, w.scenes.length); resetScene(); render();
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
function render() {
  root.replaceChildren();
  const bar = el("div","","bar");
  bar.append(btn("← Worlds",()=>{world=undefined; resetScene();render();},"secondary"),el("strong","✦ "+save.xp+" XP"),modeControl());
  root.append(bar);
  if (!world) {
    root.append(difficultyControl());
    const intro = el("section","","intro");
    intro.append(el("div","✧ YOUR ADVENTURE BEGINS ✧","eyebrow"),el("h1","Adventure Worlds"),el("h2","中文奇幻之旅"),el("p","Choose a world. Read the Chinese clues with pinyin, use English whenever you need help, and collect four treasures. No timer!"));
    root.append(intro);
    const grid = el("div","","worlds");
    for (const w of worlds) {
      const count = Math.min(save.progress[progressKey(w.id, save.difficulty)] ?? 0,w.scenes.length);
      const card = btn("",()=>open(w),"world");
      card.style.setProperty("--accent",w.color);
      card.append(el("span",w.icon,"world-icon"),el("strong",w.title),el("span",w.zh,"zh"),el("span",w.subtitle),el("span",count+" / "+w.scenes.length+" scenes "+(count===w.scenes.length ? " • "+w.trophy : ""),"progress"));
      grid.append(card);
    }
    root.append(grid);
    const journal = el("section","","panel");
    journal.append(el("h2","My treasure journal · 宝物"),el("p","Treasure collection for this difficulty. Easy and Normal have separate progress; replays never award duplicate XP."));
    const rewards = worlds.filter(w=>(save.progress[progressKey(w.id, save.difficulty)] ?? 0)>=w.scenes.length);
    journal.append(el("p",rewards.length ? rewards.map(w=>w.trophy+" "+w.reward).join("  •  ") : "Your collection is waiting!"));
    const words = Object.entries(save.words).filter(([,n])=>n>=2).map(([word])=>word);
    journal.append(el("h3","Reading practice · 阅读练习"),el("p",words.length ? "Words seen in at least two unassisted first-try Tap words scenes (not a mastery test): "+words.join("、") : "Pinyin is on by default. Try Tap words mode when ready; Learning mode hides only words practiced twice without help."));
    root.append(journal); return;
  }
  const w = world;
  const title = el("section","","chapter"); title.style.setProperty("--accent",w.color);
  title.append(el("span",w.icon,"chapter-icon"),el("div",w.title+" · "+w.zh+" · "+(save.difficulty==="easy"?"Easy":"Normal"),"eyebrow"));
  if (index >= w.scenes.length) {
    title.append(el("h1","Adventure complete!"),el("div",w.trophy,"world-icon"),el("h2",w.reward),el("p","Replay the story or visit another world."));
    root.append(title,btn("Play again",()=>open(w,true)),btn("Choose another world",()=>{world=undefined;resetScene();render();},"secondary")); return;
  }
  const [name,icon,story,easyLine,easyTranslation,options] = w.scenes[index];
  const [line,translation] = save.difficulty === "normal" ? normalClues[w.id][index] : [easyLine,easyTranslation];
  title.append(el("span","SCENE "+(index+1)+" / "+w.scenes.length,"progress"),el("div",icon,"scene-icon"),el("h1",name),el("p",story));
  root.append(title);
  const clue = el("section","","panel clue");
  clue.append(el("div","中文线索 · Chinese clue","eyebrow"),reading(line));
  const tools = el("div","","tools");
  tools.append(btn("🔊 Read aloud",()=>speak(line),"secondary"),btn(english?"Hide English":"English help",()=>{english=!english;helped=true;render();},"secondary"));
  clue.append(tools);
  if (english) clue.append(el("p",translation,"translation"));
  root.append(clue);
  const actions=el("section","","actions");
  actions.append(el("h2","What will you do?"));
  for (const [label,meaning,outcome,correct] of options) {
    const row=el("div","","choice");
    const b=btn("",()=>{
      if (solved) return;
      feedback=outcome;
      if (correct) { solved=true; points=complete(save,progressKey(w.id, save.difficulty),index,line,helped,firstTry);persist(); }
      else firstTry=false;
      render();
    },"action");
    b.append(reading(label,false)); b.disabled=solved; row.append(b);
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
    if (solved) result.append(el("p",points ? "+"+points+" XP" : "Replay complete — no extra XP.","progress"),btn(index+1===w.scenes.length?"Collect treasure":"Continue →",()=>{index++;resetScene();render();}));
    else result.append(el("p","Read the clue again, or use help. Try another action."));
    root.append(result);
  }
}
render();
