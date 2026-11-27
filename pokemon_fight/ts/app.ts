import { HEROES, hero, type HeroId, type Point } from "./data";
import { ArenaGame, type Options, type Phase } from "./game";
import { Artwork } from "./artwork";
import { ArenaRenderer } from "./renderer";
import { Sounds } from "./audio";
import { UPGRADES } from "./upgrades";
import { STAGES, stage, type StageId } from "./stages";

import { DEFAULT_DIFFICULTY, difficulty, validDifficulty, type DifficultyId } from "./difficulty";

export { DIFFICULTIES, DEFAULT_DIFFICULTY } from "./difficulty";
export { ArenaGame } from "./game";
export { HEROES, ART, COVER, WIDTH, HEIGHT, RADIUS } from "./data";
export { move, blocked, walkable, segmentDistance, navigate } from "./physics";
export { UPGRADES } from "./upgrades";
export { arenaView } from "./view";
export { STAGES } from "./stages";

interface Preferences { character: HeroId; buddy: HeroId; companion: boolean; difficulty: DifficultyId; difficultyVersion: 2; practiced: boolean; sound: boolean; stage: StageId; cleared: StageId[]; bonuses: StageId[] }
const validHero = (id: unknown): id is HeroId => HEROES.some(item => item.id === id);
const validStage = (id: unknown): id is StageId => STAGES.some(item => item.id === id);
function preferences(): Preferences {
  const defaults: Preferences = { character: "steelix", buddy: "duskull", companion: true, difficulty: DEFAULT_DIFFICULTY, difficultyVersion: 2, practiced: false, sound: true, stage: 0, cleared: [], bonuses: [] };
  try {
    const saved = JSON.parse(localStorage.getItem("pocket-arena-v1") ?? "null") as Partial<Preferences> | null;
    if (!saved || typeof saved !== "object") return defaults;
    return {
      character: validHero(saved.character) ? saved.character : defaults.character,
      buddy: validHero(saved.buddy) ? saved.buddy : defaults.buddy,
      companion: typeof saved.companion === "boolean" ? saved.companion : true,
      // Earlier versions silently selected Easy. Upgrade that old default once;
      // every choice made with the new menu, including Easy, is remembered.
      difficulty: saved.difficultyVersion === 2 && validDifficulty(saved.difficulty) ? saved.difficulty : DEFAULT_DIFFICULTY,
      difficultyVersion: 2,
      practiced: saved.practiced === true,
      sound: saved.sound !== false,
      stage: validStage(saved.stage) ? saved.stage : 0,
      cleared: Array.isArray(saved.cleared) ? [...new Set(saved.cleared.filter(validStage))] : [],
      bonuses: Array.isArray(saved.bonuses) ? [...new Set(saved.bonuses.filter(validStage))] : []
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
    this.makeStages();
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
    text("difficulty-hint", difficulty(this.prefs.difficulty).description);
    this.refreshSelection();
  }
  private refreshSelection(): void {
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>(".character"));
    for (const node of buttons) node.setAttribute("aria-pressed", String(node.dataset.character === this.prefs.character));
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
    if (window.matchMedia("(pointer: coarse), (max-width: 520px)").matches) {
      const chosen = buttons.find(button => button.dataset.character === this.prefs.character);
      if (chosen) element("characters").scrollLeft = chosen.offsetLeft - (element("characters").clientWidth - chosen.offsetWidth) / 2;
    }
    this.updateStart();
  }
  private updateStart(): void {
    element<HTMLButtonElement>("start").disabled = !this.progressFinished && !this.art.pictures.has(this.prefs.character) && !this.art.failed.includes(this.prefs.character);
  }
  private makeStages(): void {
    for (const item of STAGES) {
      const button = document.createElement("button");
      button.type = "button"; button.className = "stage-card"; button.dataset.stage = String(item.id);
      button.style.setProperty("--stage-color", item.colors.accent);
      button.addEventListener("click", () => { this.prefs.stage = item.id; this.refreshStages(); this.save(); });
      element("stage-list").append(button);
    }
    this.refreshStages();
  }
  private refreshStages(): void {
    for (const button of Array.from(document.querySelectorAll<HTMLButtonElement>(".stage-card"))) {
      const item = stage(Number(button.dataset.stage));
      button.setAttribute("aria-pressed", String(this.prefs.stage === item.id));
      const done = this.prefs.cleared.includes(item.id);
      const bonus = this.prefs.bonuses.includes(item.id);
      button.innerHTML = '<span class="stage-symbol" aria-hidden="true">' + item.symbol + '</span><span class="stage-number">STAGE ' + (item.id + 1) + '</span><strong>' + item.name + '</strong><span class="stage-card-status">' + (done ? bonus ? "Badge + bonus earned" : "Badge earned" : "Ready to explore") + '</span>';
    }
    const selected = stage(this.prefs.stage);
    text("stage-hint", selected.subtitle + ". Leader: " + selected.boss.name + ". Bonus: " + selected.goal.label + ".");
    text("badge-count", this.prefs.cleared.length + " / " + STAGES.length + " badges");
  }
  private bindControls(): void {
    element("start").addEventListener("click", () => this.start());
    element("retry").addEventListener("click", () => this.start(false));
    element("next-stage").addEventListener("click", () => {
      if (!this.game || this.game.phase !== "won" || this.game.level.id >= STAGES.length - 1) return;
      this.prefs.stage = stage(this.game.level.id + 1).id;
      this.refreshStages(); this.save(); this.start(false);
    });
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
      const id = element<HTMLSelectElement>("difficulty").value;
      if (!validDifficulty(id)) return;
      this.prefs.difficulty = id;
      text("difficulty-hint", difficulty(id).description);
      this.save();
    });
    window.addEventListener("keydown", event => {
      const modal = !element("upgrade-panel").hidden ? element("upgrade-panel") : !element("pause-panel").hidden ? element("pause-panel") : !element("result-panel").hidden ? element("result-panel") : null;
      if (modal && event.key === "Tab") {
        const buttons = Array.from(modal.querySelectorAll<HTMLButtonElement>("button")).filter(button => !button.hidden && !button.disabled);
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
        if (event.shiftKey && index <= 0) { event.preventDefault(); buttons[buttons.length - 1].focus(); }
        else if (!event.shiftKey && (index < 0 || index === buttons.length - 1)) { event.preventDefault(); buttons[0].focus(); }
      }
      if (!this.game) return;
      if (this.game.phase === "upgrade") {
        if (!event.repeat && ["Digit1", "Digit2", "Digit3"].includes(event.code)) {
          event.preventDefault();
          const choice = this.game.upgradeChoices[Number(event.code.slice(-1)) - 1];
          if (choice) this.choosePower(choice.id);
        }
        return;
      }
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
    const options: Options = { character: this.prefs.character, buddy: this.prefs.companion ? this.prefs.buddy : null, difficulty: this.prefs.difficulty, stage: this.prefs.stage, practice };
    this.game = new ArenaGame(options);
    document.body.classList.add("in-battle");
    this.lastHp = -1; this.lastPhase = null; this.accumulator = 0; this.lastTime = 0;
    element("selection").hidden = true; element("battle").hidden = false;
    element("pause-panel").hidden = true; element("result-panel").hidden = true;
    element("upgrade-panel").hidden = true;
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
    element("upgrade-panel").hidden = true;
    this.refreshStages();
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
  private choosePower(id: string): void {
    if (!this.game?.chooseUpgrade(id)) return;
    this.clearInput(); this.accumulator = 0; this.lastTime = 0;
    element("upgrade-panel").hidden = true;
    element("arena").focus({ preventScroll: true });
  }
  private showUpgrade(): void {
    const game = this.game!;
    this.clearInput(); this.accumulator = 0;
    text("upgrade-count", "POWER-UP " + game.upgradeRound + " OF 2");
    element("buddy-upgrade-note").hidden = !game.buddy || !game.lastBuddyUpgrade;
    text("buddy-upgrade-note", game.buddy && game.lastBuddyUpgrade ? hero(game.buddy.art as HeroId).name + " reached Lv " + (game.buddyUpgrades.length + 1) + " and automatically learned " + game.lastBuddyUpgrade.name + "." : "");
    const choices = element("upgrade-choices");
    choices.replaceChildren();
    game.upgradeChoices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.type = "button"; button.className = "upgrade-choice";
      button.style.setProperty("--hero-color", hero(this.prefs.character).color);
      button.innerHTML = '<span class="upgrade-symbol" aria-hidden="true">' + choice.symbol + '</span><strong>' + choice.name + '</strong><span>' + choice.description + '</span><small>Choose ' + (index + 1) + '</small>';
      button.addEventListener("click", () => this.choosePower(choice.id));
      choices.append(button);
    });
    element("upgrade-panel").hidden = false;
    choices.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
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
      if (game.phase === "upgrade") this.showUpgrade();
      if (game.phase === "won" || game.phase === "lost") {
        this.clearInput();
        element("result-panel").hidden = false;
        element("result-medal").classList.toggle("victory", game.phase === "won");
        text("result-symbol", game.phase === "won" ? "\u2605" : "\u2665");
        if (game.phase === "won") {
          if (!this.prefs.cleared.includes(game.level.id)) this.prefs.cleared.push(game.level.id);
          if (game.objectiveComplete && !this.prefs.bonuses.includes(game.level.id)) this.prefs.bonuses.push(game.level.id);
          this.save(); this.refreshStages();
        }
        const next = STAGES[game.level.id + 1];
        element("next-stage").hidden = game.phase !== "won" || !next;
        text("next-stage", next ? "Next: " + next.name : "Adventure complete");
        text("result-title", game.phase === "won" ? this.prefs.cleared.length === STAGES.length ? "All five badges earned!" : game.level.name + " cleared!" : "A good try, trainer!");
        text("result-description", game.phase === "won" ? "You defeated " + game.level.boss.name + " with " + hero(this.prefs.character).name + ". " + (game.objectiveComplete ? "Bonus badge earned, too!" : "Try the bonus mission next time.") : "Every battle is practice. Try moving away from the glowing danger zones.");
        text("result-stats", game.defeated + " challengers cleared  /  " + this.clock(game.elapsed) + " played");
        text("result-powerups", game.upgradesTaken.map(id => UPGRADES.find(item => item.id === id)?.name ?? "").join(" + "));
        element("result-powerups").hidden = game.upgradesTaken.length === 0;
        element(game.phase === "won" && next ? "next-stage" : "retry").focus({ preventScroll: true });
      }
    }
    if (this.lastHp !== game.player.hp) {
      this.lastHp = game.player.hp;
      element("hearts").innerHTML = Array.from({ length: game.player.maxHp }, (_, index) => '<span class="' + (index < game.player.hp ? "" : "empty") + '">&#9829;</span>').join("");
      element("health").setAttribute("aria-label", "Health: " + game.player.hp + " of " + game.player.maxHp);
    }
    element<HTMLProgressElement>("energy").value = game.player.energy;
    text("stage", game.stage + " / " + game.challenge.name);
    text("clock", this.clock(game.elapsed));
    text("buddy-status", game.buddy ? game.buddy.hp > 0 ? "Buddy: " + hero(game.buddy.art as HeroId).name + " / Lv " + (game.buddyUpgrades.length + 1) : "Stand near your buddy to help!" : "Solo trainer");
    text("mission-name", (game.level.id + 1) + ". " + game.level.name);
    text("mission-progress", game.stage === "PRACTICE" ? "Practice first. Your adventure starts next." : (game.objectiveComplete ? "Bonus complete! " : "Bonus: ") + game.level.goal.label + " (" + game.objectiveProgress + "/" + game.level.goal.count + ")");
    text("powerup-status", "Power-ups " + game.upgradesTaken.length + " / 2");
    element("boss-hud").hidden = !game.bossArrived;
    element<HTMLProgressElement>("boss-health").value = game.boss ? game.boss.hp / game.boss.maxHp * 100 : 0;
    text("boss-name", game.level.boss.name.toUpperCase() + (game.bossEnraged ? " - PHASE 2" : ""));
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
