// Run the real published app and its handlers with DOM, canvas and audio stubs.
// These tests verify integration; they do not claim real Safari rendering.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const page = fs.readFileSync(new URL("../docs/pokemon_fight/index.html", import.meta.url), "utf8");
const bundle = fs.readFileSync(new URL("../docs/pokemon_fight/app.js", import.meta.url), "utf8");

async function browser(width = 390, height = 470, storage = new Map()) {
  const nodes = new Map(), all = [], handlers = new Map(), frames = [];
  const draws = new Map(), tones = [];
  let now = 0;
  const context = new Proxy({}, {
    get(target, name) {
      if (name in target) return target[name];
      return (..._args) => draws.set(name, (draws.get(name) ?? 0) + 1);
    },
    set(target, name, value) { target[name] = value; return true; }
  });
  class Element {
    constructor(tag = "div", id = "") {
      this.tag = tag; this.id = id; this.children = []; this.hidden = false;
      this.className = ""; this.dataset = {}; this.attributes = {}; this.handlers = new Map();
      this.style = { setProperty() {} }; this.value = ""; this.checked = false; this.disabled = false;
      this.width = 384; this.height = 256; this.offsetLeft = 0; this.offsetWidth = 270; this.clientWidth = width;
      this.captures = new Set(); this.textContent = "";
      all.push(this); if (id) nodes.set(id, this);
    }
    get classList() {
      const node = this;
      const change = (name, enabled) => {
        const names = new Set(node.className.split(" ").filter(Boolean));
        if (enabled) names.add(name); else names.delete(name);
        node.className = [...names].join(" ");
      };
      return { add: name => change(name, true), remove: name => change(name, false), toggle: (name, enabled) => change(name, enabled) };
    }
    set innerHTML(value) {
      this.html = value;
      for (const match of value.matchAll(/<canvas[^>]*id="([^"]+)"/g)) this.children.push(new Element("canvas", match[1]));
    }
    get innerHTML() { return this.html ?? ""; }
    append(child) { child.offsetLeft = this.children.length * 285; this.children.push(child); }
    replaceChildren(...children) { this.children = children; }
    addEventListener(name, handler) { if (!this.handlers.has(name)) this.handlers.set(name, []); this.handlers.get(name).push(handler); }
    dispatch(name, values = {}) {
      for (const handler of this.handlers.get(name) ?? []) handler({ target: this, preventDefault() {}, ...values });
    }
    click() { assert.equal(this.disabled, false); this.dispatch("click"); }
    setAttribute(name, value) { this.attributes[name] = value; }
    focus() { document.activeElement = this; }
    getContext() { return context; }
    getBoundingClientRect() { return { left: 0, top: 0, width: this.id === "joystick" ? 110 : width, height: this.id === "joystick" ? 110 : height }; }
    setPointerCapture(id) { this.captures.add(id); }
    hasPointerCapture(id) { return this.captures.has(id); }
    releasePointerCapture(id) { this.captures.delete(id); this.dispatch("lostpointercapture", { pointerId: id }); }
    querySelectorAll(selector) {
      if (selector !== "button") return [];
      if (this.id === "upgrade-panel") return nodes.get("upgrade-choices").children;
      if (this.id === "pause-panel") return ["resume", "restart", "pause-home"].map(id => nodes.get(id));
      if (this.id === "result-panel") return ["next-stage", "retry", "choose-again"].map(id => nodes.get(id));
      return this.children.filter(child => child.tag === "button");
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
  }
  for (const match of page.matchAll(/<([a-z][a-z0-9]*)\b[^>]*\bid="([^"]+)"[^>]*>/g)) {
    const node = new Element(match[1], match[2]);
    node.hidden = /\shidden[\s>]/.test(match[0]);
    node.disabled = /\sdisabled[\s>]/.test(match[0]);
  }
  const document = {
    body: new Element("body"), activeElement: null, hidden: false,
    getElementById: id => nodes.get(id) ?? null,
    createElement: tag => new Element(tag),
    querySelectorAll: selector => selector.startsWith(".") ? all.filter(node => node.className.split(" ").includes(selector.slice(1))) : [],
    addEventListener(name, handler) { handlers.set("document:" + name, handler); }
  };
  const window = {
    devicePixelRatio: 2,
    matchMedia: query => ({ matches: !query.includes("reduced-motion") }),
    addEventListener(name, handler) { handlers.set(name, handler); },
    setTimeout() { return 1; }
  };
  class Image {
    set src(value) { if (value) this.onload?.(); }
  }
  class AudioContext {
    state = "running";
    destination = {};
    get currentTime() { return now / 1000; }
    resume() { return Promise.resolve(); }
    createGain() { return { gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, disconnect() {} }; }
    createOscillator() {
      const record = { type: "", frequency: 0, end: 0 };
      const oscillator = {
        type: "sine", frequency: { setValueAtTime(value) { record.frequency = value; }, exponentialRampToValueAtTime(value) { record.end = value; } },
        connect() {}, disconnect() {}, start() { record.type = this.type; tones.push(record); }, stop() { this.onended?.(); }
      };
      return oscillator;
    }
  }
  const sandbox = {
    module: { exports: {} }, document, window, Image, AudioContext,
    localStorage: { getItem(key) { return storage.get(key) ?? null; }, setItem(key, value) { storage.set(key, value); } },
    ResizeObserver: class { constructor(callback) { this.callback = callback; } observe() { this.callback(); } },
    requestAnimationFrame(callback) { frames.push(callback); }, clearTimeout() {}, console
  };
  vm.runInNewContext(bundle, sandbox);
  const exported = sandbox.module.exports;
  for (let i = 0; i < 20; i++) await Promise.resolve();
  const frame = (count = 1) => {
    for (let i = 0; i < count; i++) { now += 1000 / 60; assert.ok(frames.length); frames.shift()(now); }
  };
  const key = (code, values = {}) => handlers.get("keydown")({ code, key: code, repeat: false, preventDefault() {}, ...values });
  const start = (id, buddy = null) => {
    if (exported.app.game) { nodes.get("pause").click(); nodes.get("pause-home").click(); }
    document.querySelectorAll(".character").find(node => node.dataset.character === id).click();
    nodes.get("companion").checked = !!buddy; nodes.get("companion").dispatch("change");
    if (buddy) { nodes.get("buddy-character").value = buddy; nodes.get("buddy-character").dispatch("change"); }
    nodes.get("start").click();
    if (exported.app.game.phase === "practice") nodes.get("skip-practice").click();
    frame();
    return exported.app.game;
  };
  return { nodes, document, exported, frame, key, start, draws, tones, storage };
}

test("The published phone UI opens a paused three-choice upgrade, traps focus, and clears held touch input", async () => {
  const ui = await browser();
  const game = ui.start("steelix");
  const joystick = ui.nodes.get("joystick");
  joystick.dispatch("pointerdown", { pointerId: 4, clientX: 95, clientY: 55 });
  ui.frame(2);
  assert.ok(game.player.x > 500);
  game.elapsed = 27.99;
  ui.frame(2);
  assert.equal(game.phase, "upgrade");
  assert.equal(ui.nodes.get("upgrade-panel").hidden, false);
  assert.equal(joystick.hasPointerCapture(4), false);
  const buttons = ui.nodes.get("upgrade-choices").children;
  assert.equal(buttons.length, 3);
  assert.equal(ui.document.activeElement, buttons[0]);
  const snapshot = JSON.stringify(game);
  ui.frame(120);
  assert.equal(JSON.stringify(game), snapshot);
  buttons[2].focus(); ui.key("Tab", { key: "Tab" });
  assert.equal(ui.document.activeElement, buttons[0]);
  ui.key("Digit2");
  assert.equal(game.phase, "playing");
  assert.equal(game.upgradesTaken.length, 1);
  assert.equal(ui.nodes.get("upgrade-panel").hidden, true);
  const x = game.player.x;
  ui.frame(5);
  assert.equal(game.player.x, x, "No stale thumbstick movement after choosing");
  game.elapsed = 57.99;
  ui.frame(2);
  ui.nodes.get("upgrade-choices").children[0].click();
  assert.equal(game.upgradesTaken.length, 2);
  ui.nodes.get("pause").click();
  assert.equal(game.phase, "paused");
  ui.nodes.get("resume").click();
  assert.equal(game.phase, "playing");
});

test("All four published attacks render with their new shapes and distinct synthesized sound profiles", async () => {
  const ui = await browser(440, 300);
  const profiles = [];
  for (const [character, kind] of [["steelix", "metal"], ["duskull", "ghost"], ["greninja", "water"], ["darmanitan", "fire"]]) {
    const game = ui.start(character);
    game.player.energy = 0;
    game.enemies = [{ ...game.player, id: 777, x: 500, y: 365, kind: "shooter", art: "spewpa", hp: 10000, maxHp: 10000, radius: 17, timer: 100, turn: 0 }];
    ui.draws.clear(); ui.tones.length = 0;
    ui.frame(22);
    assert.ok(game.shots.some(shot => shot.kind === kind), character);
    assert.ok(ui.draws.get("drawImage") > 0, "Loaded illustration canvases are painted into the arena");
    assert.ok(ui.tones.length > 0);
    profiles.push(ui.tones.map(tone => tone.type + ":" + tone.frequency + ":" + tone.end).join(","));
    if (kind === "ghost" || kind === "fire") assert.ok(ui.draws.get("bezierCurveTo") > 0);
  }
  assert.equal(new Set(profiles).size, 4);
});

test("All five adventures are selectable, victory opens the next stage, and badges survive a reload", async () => {
  const ui = await browser();
  const cards = ui.document.querySelectorAll(".stage-card");
  assert.equal(cards.length, 5);
  assert.ok(cards.every(card => !card.disabled));
  cards[1].click();
  const game = ui.start("steelix");
  assert.equal(game.level.id, 1);
  assert.ok(ui.nodes.get("mission-name").textContent.includes("Moonlit Woods"));
  assert.ok(ui.nodes.get("mission-progress").textContent.includes("lost friends"));
  game.goalNodes.forEach(node => { node.done = true; });
  game.phase = "won";
  ui.frame(2);
  assert.equal(ui.nodes.get("next-stage").hidden, false);
  assert.equal(ui.document.activeElement, ui.nodes.get("next-stage"));
  assert.ok(cards[1].innerHTML.includes("Badge + bonus earned"));
  ui.nodes.get("next-stage").click();
  ui.frame();
  assert.equal(ui.exported.app.game.level.id, 2);
  assert.equal(ui.exported.app.game.upgradesTaken.length, 0);
  assert.equal(ui.exported.app.game.buddyUpgrades.length, 0);
  const restored = await browser(390, 470, ui.storage);
  const restoredCards = restored.document.querySelectorAll(".stage-card");
  assert.ok(restoredCards[1].innerHTML.includes("Badge + bonus earned"));
  assert.equal(restoredCards[2].attributes["aria-pressed"], "true");
  assert.equal(restored.nodes.get("badge-count").textContent, "1 / 5 badges");
  restoredCards[4].click();
  const final = restored.start("duskull");
  final.phase = "won"; restored.frame();
  assert.equal(restored.nodes.get("next-stage").hidden, true);
  assert.equal(restored.document.activeElement, restored.nodes.get("retry"));
  restored.key("Tab", { key: "Tab", shiftKey: true });
  assert.equal(restored.document.activeElement, restored.nodes.get("choose-again"), "Focus must skip the hidden next-stage button");
});

test("The phone upgrade dialog reports the buddy's automatic attack upgrade while leaving player selection untouched", async () => {
  const ui = await browser();
  const game = ui.start("steelix", "duskull");
  for (const time of [27.99, 57.99]) {
    game.elapsed = time; ui.frame(2);
    assert.equal(game.phase, "upgrade");
    assert.equal(game.buddyUpgrades.length, game.upgradeRound);
    assert.equal(ui.nodes.get("buddy-upgrade-note").hidden, false);
    assert.ok(ui.nodes.get("buddy-upgrade-note").textContent.includes("automatically learned"));
    assert.equal(ui.nodes.get("upgrade-choices").children.length, 3);
    ui.nodes.get("upgrade-choices").children[0].click();
    ui.frame();
    assert.ok(ui.nodes.get("buddy-status").textContent.includes("Lv " + (game.buddyUpgrades.length + 1)));
  }
  assert.ok(game.buddyUpgrades.every(id => ui.exported.UPGRADES.find(item => item.id === id).category === "attack"));
});

test("All stage scenery, objectives, boss portraits, and hostile spell shapes execute their real drawing paths", async () => {
  const ui = await browser(440, 300);
  for (const stage of ui.exported.STAGES) {
    ui.document.querySelectorAll(".stage-card")[stage.id].click();
    const game = ui.start("steelix");
    ui.draws.clear(); ui.frame(3);
    assert.ok(ui.draws.get("fill") > 0);
    game.upgradeRound = 2; game.elapsed = 89.99;
    game.player.cooldown = 10; game.player.energy = 0;
    ui.frame(3);
    assert.equal(game.boss.art, stage.boss.art);
    assert.ok(ui.nodes.get("boss-name").textContent.includes(stage.boss.name.toUpperCase()));
    game.boss.timer = 0;
    ui.frame(150);
    assert.ok(ui.draws.get("drawImage") > 0);
  }
});


test("Normal is the new default and all four menu choices drive gameplay and survive reloads", async () => {
  const ui = await browser();
  assert.equal(ui.nodes.get("difficulty").value, "standard");
  assert.ok(ui.nodes.get("difficulty-hint").textContent.includes("Start here"));
  const menu = page.match(/<select id="difficulty"[^>]*>([\s\S]*?)<\/select>/)[1];
  assert.equal([...menu.matchAll(/<option /g)].length, 4);
  for (const setting of ui.exported.DIFFICULTIES) {
    assert.ok(menu.includes('value="' + setting.id + '"'));
    ui.nodes.get("difficulty").value = setting.id;
    ui.nodes.get("difficulty").dispatch("change");
    assert.equal(ui.nodes.get("difficulty-hint").textContent, setting.description);
    const game = ui.start("steelix", "duskull");
    assert.equal(game.options.difficulty, setting.id);
    assert.equal(game.challenge.name, setting.name);
    assert.ok(ui.nodes.get("stage").textContent.includes(setting.name));
    const restored = await browser(390, 470, ui.storage);
    assert.equal(restored.nodes.get("difficulty").value, setting.id);
    assert.equal(restored.start("duskull").options.difficulty, setting.id);
  }
});

test("Legacy Easy defaults migrate once without losing badges, and choosing Easy again stays saved", async () => {
  const storage = new Map([["pocket-arena-v1", JSON.stringify({
    character: "duskull", buddy: "steelix", companion: true, difficulty: "relaxed", practiced: true,
    stage: 2, cleared: [0, 1], bonuses: [1], sound: false
  })]]);
  const ui = await browser(390, 470, storage);
  assert.equal(ui.nodes.get("difficulty").value, "standard");
  assert.equal(ui.nodes.get("badge-count").textContent, "2 / 5 badges");
  assert.equal(ui.document.querySelectorAll(".stage-card")[2].attributes["aria-pressed"], "true");
  assert.ok(ui.document.querySelectorAll(".character").find(node => node.dataset.character === "duskull").attributes["aria-pressed"] === "true");
  ui.nodes.get("difficulty").value = "relaxed"; ui.nodes.get("difficulty").dispatch("change");
  const saved = JSON.parse(storage.get("pocket-arena-v1"));
  assert.deepEqual(saved.cleared, [0, 1]); assert.deepEqual(saved.bonuses, [1]);
  assert.equal(saved.sound, false);
  const restored = await browser(390, 470, storage);
  assert.equal(restored.nodes.get("difficulty").value, "relaxed");
  assert.equal(restored.start("duskull").challenge.name, "Easy");
});

test("Invalid saved difficulty falls back to Normal while a valid new choice remains usable", async () => {
  const storage = new Map([["pocket-arena-v1", JSON.stringify({ difficultyVersion: 2, difficulty: "missing-level" })]]);
  const ui = await browser(390, 470, storage);
  assert.equal(ui.nodes.get("difficulty").value, "standard");
  assert.equal(ui.start("steelix").options.difficulty, "standard");
  ui.nodes.get("difficulty").value = "expert"; ui.nodes.get("difficulty").dispatch("change");
  assert.equal(ui.start("steelix").options.difficulty, "expert");
});
