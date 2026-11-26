import { STAGE_SPECS } from "./constants";
import {
  ActiveStageState,
  AgeMode,
  DavidHarpStageState,
  FrameInput,
  LoavesStageState,
  RunBackStageState,
  SoundEvent,
  StageId,
  StageResult,
  VerseBuilderStageState
} from "./types";
import { ADVENTURER_QUIZ_ORDER, BUILDER_VERSE_QUEUE, QUIZ_QUESTIONS, getVerseTiles } from "./verses";

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function shuffleIds(ids: string[], rng: () => number): string[] {
  const arr = ids.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  // Ensure the shuffled list is not identical to the solved order when length > 1
  if (arr.length > 1) {
    let same = true;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] !== ids[i]) {
        same = false;
        break;
      }
    }
    if (same) {
      const tmp = arr[0];
      arr[0] = arr[arr.length - 1];
      arr[arr.length - 1] = tmp;
    }
  }
  return arr;
}

export function createStageState(
  stageId: StageId,
  ageMode: AgeMode,
  rng: () => number
): ActiveStageState {
  const spec = STAGE_SPECS[stageId];
  const isExplorer = ageMode === "explorer";

  if (stageId === "loaves_and_fish") {
    return {
      kind: "loaves_and_fish",
      prayedWithJesus: false,
      prayGlowTimer: 0,
      basketX: 0.5,
      sharedCount: 0,
      targetCount: isExplorer ? spec.explorerTarget : spec.adventurerTarget,
      blessingsCollected: 0,
      streak: 0,
      score: 0,
      timeLeftSec: isExplorer ? 999 : spec.adventurerTimeSec,
      spawnTimer: 0.35,
      nextItemId: 1,
      items: [],
      lastPopKey: "",
      lastPopTimer: 0
    };
  }

  if (stageId === "run_back_to_jesus") {
    return {
      kind: "run_back_to_jesus",
      subPhase: "road",
      lane: 1,
      sparklesCollected: 0,
      targetSparkles: isExplorer ? spec.explorerTarget : spec.adventurerTarget,
      roadProgress: 0,
      turnBackProgress: 0,
      wobbleTimer: 0,
      score: 0,
      timeLeftSec: isExplorer ? 999 : spec.adventurerTimeSec,
      spawnTimer: 0.3,
      nextItemId: 1,
      items: [],
      lastPopKey: "",
      lastPopTimer: 0
    };
  }

  if (stageId === "david_harp") {
    return {
      kind: "david_harp",
      notesPlayed: 0,
      targetNotes: isExplorer ? spec.explorerTarget : spec.adventurerTarget,
      streak: 0,
      score: 0,
      timeLeftSec: isExplorer ? 999 : spec.adventurerTimeSec,
      spawnTimer: 0.35,
      melodyStep: 0,
      missedCounter: 0,
      nextNoteId: 1,
      notes: [],
      stringGlow: [0, 0, 0, 0],
      lastPopKey: "",
      lastPopTimer: 0
    };
  }

  const firstVerse = BUILDER_VERSE_QUEUE[0];
  const tiles = getVerseTiles(firstVerse, ageMode);
  return {
    kind: "verse_builder",
    subPhase: "tiles",
    verseQueue: BUILDER_VERSE_QUEUE.slice(),
    verseCursor: 0,
    placedTileIds: [],
    shuffledTileIds: shuffleIds(
      tiles.map((t) => t.id),
      rng
    ),
    wrongShakeTileId: null,
    wrongShakeTimer: 0,
    mistakes: 0,
    versesCompleted: 0,
    quizQueue: isExplorer ? [] : ADVENTURER_QUIZ_ORDER.slice(),
    quizCursor: 0,
    quizFeedback: "none",
    quizFeedbackTimer: 0,
    score: 0
  };
}

export function stepLoavesStage(
  stage: LoavesStageState,
  ageMode: AgeMode,
  dt: number,
  input: FrameInput,
  rng: () => number,
  sounds: SoundEvent[]
): boolean {
  const isExplorer = ageMode === "explorer";
  if (stage.lastPopTimer > 0) {
    stage.lastPopTimer = Math.max(0, stage.lastPopTimer - dt);
  }
  if (stage.prayGlowTimer > 0) {
    stage.prayGlowTimer = Math.max(0, stage.prayGlowTimer - dt);
  }

  if (!stage.prayedWithJesus) {
    if (input.primaryTap) {
      stage.prayedWithJesus = true;
      stage.prayGlowTimer = 1.6;
      stage.score += 100;
      stage.lastPopKey = "popAmen";
      stage.lastPopTimer = 1.1;
      sounds.push("pray_blessing");
    }
    return false;
  }

  if (!isExplorer) {
    stage.timeLeftSec = Math.max(0, stage.timeLeftSec - dt);
  }

  if (input.pointerXNorm !== null) {
    stage.basketX = clamp(input.pointerXNorm, 0.14, 0.86);
  } else if (input.moveDir !== 0) {
    stage.basketX = clamp(stage.basketX + input.moveDir * dt * 0.92, 0.14, 0.86);
  }

  stage.spawnTimer -= dt;
  if (stage.spawnTimer <= 0) {
    const r = rng();
    const itemType: "loaf" | "fish" | "blessing" =
      r < 0.24 ? "blessing" : r < 0.64 ? "loaf" : "fish";
    stage.items.push({
      id: stage.nextItemId++,
      x: 0.15 + rng() * 0.70,
      y: 0.10,
      vy: (isExplorer ? 0.30 : 0.42) + rng() * 0.10,
      itemType
    });
    stage.spawnTimer = isExplorer ? 0.78 : 0.56;
  }

  const catchRadius = isExplorer ? 0.165 : 0.125;
  const remaining = [];
  for (let i = 0; i < stage.items.length; i++) {
    const item = stage.items[i];
    item.y += item.vy * dt;
    // Gentle breeze in Explorer mode guides blessing baskets toward the child's basket
    if (isExplorer && item.itemType === "blessing" && item.y > 0.38) {
      item.x += (stage.basketX - item.x) * Math.min(1, dt * 2.2);
    }

    if (item.y >= 0.73 && item.y <= 0.88 && Math.abs(item.x - stage.basketX) <= catchRadius) {
      stage.sharedCount += 1;
      stage.streak += 1;
      if (item.itemType === "blessing") {
        stage.blessingsCollected += 1;
        stage.score += 120 + stage.streak * 15;
        stage.lastPopKey = "popBlessing";
        sounds.push("blessing_token");
      } else {
        stage.score += 65 + stage.streak * 10;
        stage.lastPopKey = "popShared";
        sounds.push("good_catch");
      }
      stage.lastPopTimer = 0.65;
      continue;
    }

    if (item.y > 1.02) {
      stage.streak = 0;
      continue;
    }
    remaining.push(item);
  }
  stage.items = remaining;

  if (stage.sharedCount >= stage.targetCount) {
    return true;
  }
  if (!isExplorer && stage.timeLeftSec <= 0) {
    return true;
  }
  return false;
}

export function stepRunBackStage(
  stage: RunBackStageState,
  ageMode: AgeMode,
  dt: number,
  input: FrameInput,
  rng: () => number,
  sounds: SoundEvent[]
): boolean {
  const isExplorer = ageMode === "explorer";
  if (stage.lastPopTimer > 0) {
    stage.lastPopTimer = Math.max(0, stage.lastPopTimer - dt);
  }
  if (stage.wobbleTimer > 0) {
    stage.wobbleTimer = Math.max(0, stage.wobbleTimer - dt);
  }
  if (!isExplorer) {
    stage.timeLeftSec = Math.max(0, stage.timeLeftSec - dt);
  }

  if (stage.subPhase === "road") {
    if (input.lanePick !== null) {
      stage.lane = input.lanePick;
    } else if (input.pointerXNorm !== null) {
      stage.lane = input.pointerXNorm < 0.36 ? 0 : input.pointerXNorm > 0.64 ? 2 : 1;
    } else if (input.moveDir < 0) {
      stage.lane = stage.lane === 2 ? 1 : 0;
    } else if (input.moveDir > 0) {
      stage.lane = stage.lane === 0 ? 1 : 2;
    }

    stage.roadProgress = clamp(stage.roadProgress + dt * (isExplorer ? 0.048 : 0.056), 0, 1);

    stage.spawnTimer -= dt;
    if (stage.spawnTimer <= 0) {
      const r = rng();
      const lane = (Math.floor(rng() * 3) % 3) as 0 | 1 | 2;
      const itemType: "sparkle" | "cart" | "toy" =
        r < (isExplorer ? 0.72 : 0.62) ? "sparkle" : r < 0.84 ? "cart" : "toy";
      stage.items.push({
        id: stage.nextItemId++,
        lane,
        y: 0.08,
        itemType
      });
      stage.spawnTimer = isExplorer ? 0.80 : 0.56;
    }

    const speed = isExplorer ? 0.42 : 0.56;
    const remaining = [];
    for (let i = 0; i < stage.items.length; i++) {
      const it = stage.items[i];
      it.y += speed * dt;
      if (it.y >= 0.72 && it.y <= 0.87 && it.lane === stage.lane) {
        if (it.itemType === "sparkle") {
          stage.sparklesCollected += 1;
          stage.roadProgress = clamp(stage.roadProgress + 0.09, 0, 1);
          stage.score += 80;
          stage.lastPopKey = "popGrace";
          stage.lastPopTimer = 0.7;
          sounds.push("blessing_token");
        } else {
          stage.wobbleTimer = 0.45;
          stage.lastPopKey = "popOops";
          stage.lastPopTimer = 0.65;
          sounds.push("gentle_bump");
        }
        continue;
      }
      if (it.y > 1.04) {
        continue;
      }
      remaining.push(it);
    }
    stage.items = remaining;

    if (
      stage.sparklesCollected >= stage.targetSparkles ||
      stage.roadProgress >= 1 ||
      (!isExplorer && stage.timeLeftSec <= 8)
    ) {
      stage.subPhase = "turn_back";
      stage.items = [];
      stage.lastPopKey = "popTurnBack";
      stage.lastPopTimer = 1.1;
      sounds.push("pray_blessing");
    }
    return false;
  }

  // Turn-back climax: tap to run joyfully back to Jesus' feet!
  const tapped = input.primaryTap || input.lanePick !== null;
  if (tapped) {
    const step = isExplorer ? 18 : 14;
    stage.turnBackProgress = clamp(stage.turnBackProgress + step, 0, 100);
    stage.score += 45;
    stage.lastPopKey = "popThankJesus";
    stage.lastPopTimer = 0.65;
    sounds.push("turn_step");
  } else if (stage.turnBackProgress > 12) {
    stage.turnBackProgress = Math.max(12, stage.turnBackProgress - dt * (isExplorer ? 2.5 : 5.0));
  }

  if (stage.turnBackProgress >= 100) {
    stage.score += 180;
    return true;
  }
  if (!isExplorer && stage.timeLeftSec <= 0) {
    stage.turnBackProgress = 100;
    return true;
  }
  return false;
}

const HARP_MELODY_PATTERN: (0 | 1 | 2 | 3)[] = [0, 1, 2, 3, 2, 1, 2, 3, 1, 2, 0, 3];
const HARP_SOUND_BY_STRING: SoundEvent[] = ["harp_0", "harp_1", "harp_2", "harp_3"];

export function stepDavidHarpStage(
  stage: DavidHarpStageState,
  ageMode: AgeMode,
  dt: number,
  input: FrameInput,
  rng: () => number,
  sounds: SoundEvent[]
): boolean {
  const isExplorer = ageMode === "explorer";
  if (stage.lastPopTimer > 0) {
    stage.lastPopTimer = Math.max(0, stage.lastPopTimer - dt);
  }
  for (let i = 0; i < 4; i++) {
    if (stage.stringGlow[i] > 0) {
      stage.stringGlow[i] = Math.max(0, stage.stringGlow[i] - dt);
    }
  }
  if (!isExplorer) {
    stage.timeLeftSec = Math.max(0, stage.timeLeftSec - dt);
  }

  // Spawn joyful musical praise notes along a pentatonic contour
  stage.spawnTimer -= dt;
  if (stage.spawnTimer <= 0) {
    const baseStr = HARP_MELODY_PATTERN[stage.melodyStep % HARP_MELODY_PATTERN.length];
    stage.melodyStep += 1;
    const stringIndex: 0 | 1 | 2 | 3 =
      rng() < 0.72 ? baseStr : ((Math.floor(rng() * 4) % 4) as 0 | 1 | 2 | 3);
    stage.notes.push({
      id: stage.nextNoteId++,
      stringIndex,
      y: 0.12,
      golden: stage.melodyStep % 4 === 0
    });
    stage.spawnTimer = isExplorer ? 0.92 : 0.64;
  }

  const fallSpeed = isExplorer ? 0.34 : 0.48;
  const zoneMin = isExplorer ? 0.56 : 0.65;
  const zoneMax = isExplorer ? 0.96 : 0.92;

  // Handle player plucking one of the 4 harp strings
  if (input.harpString !== null) {
    const s = input.harpString;
    stage.stringGlow[s] = 0.45;
    sounds.push(HARP_SOUND_BY_STRING[s]);

    let bestIdx = -1;
    let bestDist = 999;
    for (let i = 0; i < stage.notes.length; i++) {
      const n = stage.notes[i];
      if (n.stringIndex === s && n.y >= zoneMin && n.y <= zoneMax) {
        const dist = Math.abs(n.y - 0.79);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }
    }

    if (bestIdx >= 0) {
      const hit = stage.notes[bestIdx];
      stage.notes.splice(bestIdx, 1);
      stage.notesPlayed += 1;
      stage.streak += 1;
      stage.score += (hit.golden ? 120 : 75) + stage.streak * 12;
      stage.lastPopKey = hit.golden || stage.streak >= 3 ? "popHarmony" : "popPraise";
      stage.lastPopTimer = 0.72;
      if (hit.golden) {
        sounds.push("blessing_token");
      }
    } else if (!isExplorer) {
      stage.streak = 0;
    }
  }

  // Advance falling notes; in Explorer mode, a singing dove gently rescues every 3rd missed note
  const remaining = [];
  for (let i = 0; i < stage.notes.length; i++) {
    const n = stage.notes[i];
    n.y += fallSpeed * dt;
    if (n.y > 0.98) {
      stage.missedCounter += 1;
      stage.streak = 0;
      if (isExplorer && stage.missedCounter % 3 === 0) {
        stage.notesPlayed += 1;
        stage.score += 50;
        stage.stringGlow[n.stringIndex] = 0.35;
        stage.lastPopKey = "popPraise";
        stage.lastPopTimer = 0.6;
        sounds.push(HARP_SOUND_BY_STRING[n.stringIndex]);
      }
      continue;
    }
    remaining.push(n);
  }
  stage.notes = remaining;

  if (stage.notesPlayed >= stage.targetNotes) {
    return true;
  }
  if (!isExplorer && stage.timeLeftSec <= 0) {
    return true;
  }
  return false;
}

export function stepVerseBuilderStage(stage: VerseBuilderStageState, dt: number): void {
  if (stage.wrongShakeTimer > 0) {
    stage.wrongShakeTimer = Math.max(0, stage.wrongShakeTimer - dt);
    if (stage.wrongShakeTimer === 0) {
      stage.wrongShakeTileId = null;
    }
  }
  if (stage.quizFeedbackTimer > 0) {
    stage.quizFeedbackTimer = Math.max(0, stage.quizFeedbackTimer - dt);
    if (stage.quizFeedbackTimer === 0 && stage.quizFeedback === "retry") {
      stage.quizFeedback = "none";
    }
  }
}

export function handleVerseTileTap(
  stage: VerseBuilderStageState,
  ageMode: AgeMode,
  tileId: string,
  rng: () => number,
  sounds: SoundEvent[]
): boolean {
  if (stage.subPhase !== "tiles") {
    return false;
  }
  if (stage.placedTileIds.indexOf(tileId) >= 0) {
    return false;
  }
  const verseId = stage.verseQueue[stage.verseCursor];
  const expectedTiles = getVerseTiles(verseId, ageMode);
  const nextExpected = expectedTiles[stage.placedTileIds.length];
  if (!nextExpected) {
    return false;
  }

  if (tileId === nextExpected.id) {
    stage.placedTileIds.push(tileId);
    stage.wrongShakeTileId = null;
    stage.wrongShakeTimer = 0;
    stage.score += 90;
    sounds.push("tile_place");

    if (stage.placedTileIds.length >= expectedTiles.length) {
      stage.versesCompleted += 1;
      stage.score += 150;
      if (stage.verseCursor + 1 < stage.verseQueue.length) {
        stage.verseCursor += 1;
        const nextVerseId = stage.verseQueue[stage.verseCursor];
        const nextDefs = getVerseTiles(nextVerseId, ageMode);
        stage.placedTileIds = [];
        stage.shuffledTileIds = shuffleIds(
          nextDefs.map((t) => t.id),
          rng
        );
      } else if (stage.quizQueue.length > 0) {
        stage.subPhase = "quiz";
        stage.quizCursor = 0;
        stage.quizFeedback = "none";
      } else {
        return true;
      }
    }
    return false;
  }

  stage.mistakes += 1;
  stage.wrongShakeTileId = tileId;
  stage.wrongShakeTimer = 0.55;
  sounds.push("tile_hint");
  return false;
}

export function handleQuizAnswer(
  stage: VerseBuilderStageState,
  choiceIndex: number,
  sounds: SoundEvent[]
): boolean {
  if (stage.subPhase !== "quiz") {
    return false;
  }
  const qId = stage.quizQueue[stage.quizCursor];
  const q = QUIZ_QUESTIONS[qId];
  if (!q) {
    return true;
  }
  if (choiceIndex === q.correctIndex) {
    stage.score += 140;
    stage.quizFeedback = "correct";
    stage.quizFeedbackTimer = 0.8;
    sounds.push("tile_place");
    stage.quizCursor += 1;
    if (stage.quizCursor >= stage.quizQueue.length) {
      return true;
    }
    return false;
  }
  stage.mistakes += 1;
  stage.quizFeedback = "retry";
  stage.quizFeedbackTimer = 1.2;
  sounds.push("tile_hint");
  return false;
}

export function computeStageResult(
  stage: ActiveStageState,
  ageMode: AgeMode,
  playerIndex: number
): StageResult {
  const isExplorer = ageMode === "explorer";
  const spec = STAGE_SPECS[stage.kind];

  if (stage.kind === "loaves_and_fish") {
    const ratio = stage.targetCount > 0 ? stage.sharedCount / stage.targetCount : 1;
    const stars: 1 | 2 | 3 =
      ratio >= 1 && (isExplorer || stage.blessingsCollected >= 2)
        ? 3
        : ratio >= 0.65
          ? 2
          : 1;
    return {
      stageId: stage.kind,
      playerIndex,
      stars,
      score: stage.score,
      tokensCollected: stage.blessingsCollected,
      verseUnlocked: spec.verseId
    };
  }

  if (stage.kind === "run_back_to_jesus") {
    const ratio = stage.targetSparkles > 0 ? stage.sparklesCollected / stage.targetSparkles : 1;
    const stars: 1 | 2 | 3 =
      stage.turnBackProgress >= 100 && (isExplorer || ratio >= 0.8)
        ? 3
        : stage.turnBackProgress >= 80
          ? 2
          : 1;
    return {
      stageId: stage.kind,
      playerIndex,
      stars,
      score: stage.score,
      tokensCollected: stage.sparklesCollected,
      verseUnlocked: spec.verseId
    };
  }

  if (stage.kind === "david_harp") {
    const ratio = stage.targetNotes > 0 ? stage.notesPlayed / stage.targetNotes : 1;
    const stars: 1 | 2 | 3 = ratio >= 1 ? 3 : ratio >= 0.65 ? 2 : 1;
    return {
      stageId: stage.kind,
      playerIndex,
      stars,
      score: stage.score,
      tokensCollected: stage.notesPlayed,
      verseUnlocked: spec.verseId
    };
  }

  const stars: 1 | 2 | 3 = stage.mistakes <= 2 ? 3 : stage.mistakes <= 5 ? 2 : 1;
  return {
    stageId: stage.kind,
    playerIndex,
    stars,
    score: stage.score,
    tokensCollected: stage.versesCompleted,
    verseUnlocked: spec.verseId
  };
}
