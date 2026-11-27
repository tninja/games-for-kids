import { HEROES, hero, type HeroId, type Point } from "./data";
import { ArenaGame, type Options, type Phase } from "./game";
import { Artwork } from "./artwork";
import { ArenaRenderer } from "./renderer";
import { Sounds } from "./audio";

export { ArenaGame } from "./game";
export { HEROES, ART, COVER, WIDTH, HEIGHT, RADIUS } from "./data";
export { move, blocked, walkable, segmentDistance, navigate } from "./physics";

interface Preferences { character: HeroId; buddy: HeroId; companion: boolean; difficulty: "relaxed" | "standard"; practiced: boolean; sound: boolean }
const validHero = (id: unknown): id is HeroId => HEROES.some(item => item.id === id);
function preferences(): Preferences {
  const defaults: Preferences = { character: "steelix", buddy: "duskull", companion: true, difficulty: "relaxed", practiced: false, sound: true };
  try {
    const saved = JSON.parse(localStorage.getItem("pocket-arena-v1") ?? "null") as Partial<Preferences> | null;
    if (!saved || typeof saved !== "object") return defaults;
    return {
      character: validHero(saved.character) ? saved.character : defaults.character,
      buddy: validHero(saved.buddy) ? saved.buddy : defaults.buddy,
      companion: typeof saved.companion === "boolean" ? saved.companion : true,
      difficulty: saved.difficulty === "standard" ? "standard" : "relaxed",
      practiced: saved.practiced === true,
      sound: saved.sound !== false
    };
  } catch { return defaults; }
}
function element<T extends HTMLElement>(id: string): T { return document.getElementById(id) as T; }
function text(id: string, value: string): void { const node = element(id); if (node.textContent !== value) node.textContent = value; }

export class PocketArenaApp {
  game: ArenaGame | null = null;
  readonly art = new Artwork();
  readonly renderer: ArenaRenderer;
  readonly sound = new Sounds();
  private prefs = preferences();
  private keys = new Set<string>();
  private stick: Point = { x: 0, y: 0 };
  private pointer: number | null = null;
  private lastTime = 0;
  private accumulator = 0;
  private lastPhase: Phase | null = null;
  private lastHp = -1;
  private progressFinished = false;

  constructor() {
    this.renderer = new ArenaRenderer(element<HTMLCanvasElement>("arena"), this.art);
    this.sound.enabled = this.prefs.sound;
    this.makeSelection();
    this.bindControls();
    this.updateSound();
    void this.art.load(() => {
      for (const item of HEROES) this.renderer.portrait(element<HTMLCanvasElement>("portrait-" + item.id), item.id);
      this.progressFinished = this.art.loaded === 7;
      text("art-status", this.progressFinished ? this.art.failed.length ? "Some card pictures could not load. Color badges will stand in." : "Your real card pictures. Ready to play." : "Opening your card pictures... " + this.art.loaded + " / 7");
      this.updateStart();
    });
    if (typeof ResizeObserver !== "undefined") new ResizeObserver(() => this.renderer.resize()).observe(element("arena-wrap"));
    else window.addEventListener("resize", () => this.renderer.resize());
    requestAnimationFrame(time => this.frame(time));
  }
  private save(): void {
    try { localStorage.setItem("pocket-arena-v1", JSON.stringify(this.prefs)); }
    catch { /* Saving is a convenience, never a requirement to play. */ }
  }
  private makeSelection(): void {
    const list = element("characters");
    for (const item of HEROES) {
      const button = document.createElement("button");
      button.type = "button"; button.className = "character";
      button.dataset.character = item.id;
      button.style.setProperty("--hero-color", item.color);
      button.innerHTML = '<span class="portrait-frame"><canvas id="portrait-' + item.id + '" width="384" height="256" aria-hidden="true"></canvas><span class="selected-mark" aria-hidden="true">&#10003;</span></span><span class="character-name">' + item.name + '</span><span class="character-title">' + item.title + '</span>';
      button.addEventListener("click", () => {
        this.prefs.character = item.id;
        if (this.prefs.buddy === item.id) this.prefs.buddy = HEROES.find(other => other.id !== item.id)!.id;
        this.refreshSelection(); this.save();
      });
      list.append(button);
      this.renderer.portrait(element<HTMLCanvasElement>("portrait-" + item.id), item.id);
    }
    element<HTMLInputElement>("companion").checked = this.prefs.companion;
    element<HTMLSelectElement>("difficulty").value = this.prefs.difficulty;
    this.refreshSelection();
  }
  private refreshSelection(): void {
    for (const node of Array.from(document.querySelectorAll<HTMLButtonElement>(".character"))) node.setAttribute("aria-pressed", String(node.dataset.character === this.prefs.character));
    const selected = hero(this.prefs.character);
    element("selection-description").style.setProperty("--hero-color", selected.color);
    text("selection-description", selected.description + " Special: " + selected.special + ".");
    const select = element<HTMLSelectElement>("buddy-character");
    select.replaceChildren();
    for (const item of HEROES.filter(item => item.id !== this.prefs.character)) {
      const option = document.createElement("option"); option.value = item.id; option.textContent = item.name; select.append(option);
    }
    select.value = this.prefs.buddy;
    element("buddy-choice").hidden = !this.prefs.companion;
    this.updateStart();
  }
  private updateStart(): void {
    element<HTMLButtonElement>("start").disabled = !this.progressFinished && !this.art.pictures.has(this.prefs.character) && !this.art.failed.includes(this.prefs.character);
  }
  private bindControls(): void {
    element("start").addEventListener("click", () => this.start());
    element("retry").addEventListener("click", () => this.start(false));
    element("choose-again").addEventListener("click", () => this.home());
    element("pause-home").addEventListener("click", () => this.home());
    element("pause").addEventListener("click", () => this.pause());
    element("resume").addEventListener("click", () => this.resume());
    element("restart").addEventListener("click", () => this.start(false));
    element("skip-practice").addEventListener("click", () => {
      this.game?.finishPractice(); this.prefs.practiced = true; this.save(); this.clearInput();
    });
    element("practice-again").addEventListener("click", () => { this.prefs.practiced = false; this.start(true); });
    element("sound").addEventListener("click", () => {
      this.sound.enabled = !this.sound.enabled; this.prefs.sound = this.sound.enabled;
      this.sound.unlock(); this.updateSound(); this.save();
    });
    element("companion").addEventListener("change", () => {
      this.prefs.companion = element<HTMLInputElement>("companion").checked;
      this.refreshSelection(); this.save();
    });
    element("buddy-character").addEventListener("change", () => {
      this.prefs.buddy = element<HTMLSelectElement>("buddy-character").value as HeroId; this.save();
    });
    element("difficulty").addEventListener("change", () => {
      this.prefs.difficulty = element<HTMLSelectElement>("difficulty").value as Preferences["difficulty"]; this.save();
    });
    window.addEventListener("keydown", event => {
      const modal = !element("pause-panel").hidden ? element("pause-panel") : !element("result-panel").hidden ? element("result-panel") : null;
      if (modal && event.key === "Tab") {
        const buttons = Array.from(modal.querySelectorAll<HTMLButtonElement>("button"));
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
        if (event.shiftKey && index <= 0) { event.preventDefault(); buttons[buttons.length - 1].focus(); }
        else if (!event.shiftKey && (index < 0 || index === buttons.length - 1)) { event.preventDefault(); buttons[0].focus(); }
      }
      if (!this.game) return;
      const movement = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"];
      if (movement.includes(event.code) && (this.game.phase === "playing" || this.game.phase === "practice")) {
        event.preventDefault(); this.keys.add(event.code);
      }
      if ((event.code === "Escape" || event.code === "KeyP") && !event.repeat) {
        if (this.game.phase === "paused") this.resume(); else this.pause();
      }
    });
    window.addEventListener("keyup", event => this.keys.delete(event.code));
    window.addEventListener("blur", () => this.pause());
    document.addEventListener("visibilitychange", () => { if (document.hidden) this.pause(); });
    const joystick = element("joystick");
    const update = (event: PointerEvent): void => {
      const bounds = joystick.getBoundingClientRect();
      const radius = bounds.width / 2 - 20;
      let x = (event.clientX - bounds.left - bounds.width / 2) / radius;
      let y = (event.clientY - bounds.top - bounds.height / 2) / radius;
      const magnitude = Math.hypot(x, y);
      if (magnitude > 1) { x /= magnitude; y /= magnitude; }
      this.stick = magnitude < 0.1 ? { x: 0, y: 0 } : { x, y };
      element("stick-knob").style.transform = "translate(" + (this.stick.x * radius) + "px," + (this.stick.y * radius) + "px)";
    };
    joystick.addEventListener("pointerdown", event => {
      if (!this.game || !["playing", "practice"].includes(this.game.phase) || this.pointer !== null) return;
      event.preventDefault(); this.pointer = event.pointerId; joystick.setPointerCapture(event.pointerId); update(event); this.sound.unlock();
    });
    joystick.addEventListener("pointermove", event => { if (event.pointerId === this.pointer) { event.preventDefault(); update(event); } });
    for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) joystick.addEventListener(name, event => {
      if ((event as PointerEvent).pointerId === this.pointer) this.clearInput();
    });
  }
  private updateSound(): void {
    text("sound", this.sound.enabled ? "Sound on" : "Sound off");
    element("sound").setAttribute("aria-pressed", String(this.sound.enabled));
  }
  private clearInput(): void {
    this.keys.clear(); this.stick = { x: 0, y: 0 };
    const joystick = element("joystick");
    const previous = this.pointer; this.pointer = null;
    if (previous !== null && joystick.hasPointerCapture(previous)) joystick.releasePointerCapture(previous);
    element("stick-knob").style.transform = "translate(0,0)";
  }
  private start(practice = !this.prefs.practiced): void {
    this.sound.unlock(); this.save(); this.clearInput();
    const options: Options = { character: this.prefs.character, buddy: this.prefs.companion ? this.prefs.buddy : null, difficulty: this.prefs.difficulty, practice };
    this.game = new ArenaGame(options);
    document.body.classList.add("in-battle");
    this.lastHp = -1; this.lastPhase = null; this.accumulator = 0; this.lastTime = 0;
    element("selection").hidden = true; element("battle").hidden = false;
    element("pause-panel").hidden = true; element("result-panel").hidden = true;
    element("health").style.setProperty("--hero-color", hero(this.prefs.character).color);
    text("player-name", hero(this.prefs.character).name);
    this.renderer.resize();
    element("arena").focus({ preventScroll: true });
  }
  private home(): void {
    this.game = null; this.clearInput();
    document.body.classList.remove("in-battle");
    element("battle").hidden = true; element("selection").hidden = false;
    element("pause-panel").hidden = true; element("result-panel").hidden = true;
    element("start").focus({ preventScroll: true });
  }
  private pause(): void {
    this.clearInput();
    if (!this.game || !["practice", "playing"].includes(this.game.phase)) return;
    this.game.pause(); element("pause-panel").hidden = false;
    element("resume").focus({ preventScroll: true });
  }
  private resume(): void {
    if (!this.game || this.game.phase !== "paused") return;
    this.game.resume(); this.clearInput(); this.lastTime = 0; this.accumulator = 0;
    element("pause-panel").hidden = true;
    element("arena").focus({ preventScroll: true });
  }
  private input(): Point {
    if (Math.hypot(this.stick.x, this.stick.y) > 0.05) return this.stick;
    return {
      x: Number(this.keys.has("ArrowRight") || this.keys.has("KeyD")) - Number(this.keys.has("ArrowLeft") || this.keys.has("KeyA")),
      y: Number(this.keys.has("ArrowDown") || this.keys.has("KeyS")) - Number(this.keys.has("ArrowUp") || this.keys.has("KeyW"))
    };
  }
  private frame(time: number): void {
    const delta = this.lastTime === 0 ? 0 : Math.min(0.08, (time - this.lastTime) / 1000);
    this.lastTime = time;
    if (this.game) {
      this.accumulator += delta;
      while (this.accumulator >= 1 / 60) { this.game.step(1 / 60, this.input()); this.accumulator -= 1 / 60; }
      for (const event of this.game.events.splice(0)) this.sound.play(event);
      this.renderer.draw(this.game, time / 1000);
      this.hud();
    }
    requestAnimationFrame(next => this.frame(next));
  }
  private hud(): void {
    const game = this.game!;
    if (game.phase !== this.lastPhase) {
      if (this.lastPhase === "practice" && game.phase === "playing") { this.prefs.practiced = true; this.save(); }
      this.lastPhase = game.phase;
      if (game.phase === "won" || game.phase === "lost") {
        this.clearInput();
        element("result-panel").hidden = false;
        element("result-medal").classList.toggle("victory", game.phase === "won");
        text("result-symbol", game.phase === "won" ? "\u2605" : "\u2665");
        text("result-title", game.phase === "won" ? "Training badge earned!" : "A good try, trainer!");
        text("result-description", game.phase === "won" ? "You defeated Machamp with " + hero(this.prefs.character).name + ". Ready for another adventure?" : "Every battle is practice. Try moving away from the glowing danger zones.");
        text("result-stats", game.defeated + " challengers cleared  /  " + this.clock(game.elapsed) + " played");
        element("retry").focus({ preventScroll: true });
      }
    }
    if (this.lastHp !== game.player.hp) {
      this.lastHp = game.player.hp;
      element("hearts").innerHTML = Array.from({ length: game.player.maxHp }, (_, index) => '<span class="' + (index < game.player.hp ? "" : "empty") + '">&#9829;</span>').join("");
      element("health").setAttribute("aria-label", "Health: " + game.player.hp + " of " + game.player.maxHp);
    }
    element<HTMLProgressElement>("energy").value = game.player.energy;
    text("stage", game.stage);
    text("clock", this.clock(game.elapsed));
    text("buddy-status", game.buddy ? game.buddy.hp > 0 ? "Buddy: " + hero(game.buddy.art as HeroId).name : "Stand near your buddy to help!" : "Solo trainer");
    element("boss-hud").hidden = !game.bossArrived;
    element<HTMLProgressElement>("boss-health").value = game.boss ? game.boss.hp / game.boss.maxHp * 100 : 0;
    const warning = game.hazards.find(hazard => !hazard.fired);
    text("boss-tip", warning ? warning.kind === "line" ? "Dodge the stripe!" : "Leave the circle!" : "Find an opening!");
    element("practice-tip").hidden = game.stage !== "PRACTICE";
    text("toast", game.announcementTime > 0 ? game.announcement : "");
    element("toast").hidden = game.announcementTime <= 0;
  }
  private clock(seconds: number): string { return Math.floor(seconds / 60) + ":" + String(Math.floor(seconds % 60)).padStart(2, "0"); }
}

export let app: PocketArenaApp | undefined;
if (typeof document !== "undefined" && document.getElementById("arena")) app = new PocketArenaApp();
