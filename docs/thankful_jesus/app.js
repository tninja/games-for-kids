(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ThankfulJesusWeb = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
"use strict";
var __ThankfulJesusBundle = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // thankful_jesus/ts/app.ts
  var app_exports = {};
  __export(app_exports, {
    ADVENTURER_QUIZ_ORDER: () => ADVENTURER_QUIZ_ORDER,
    BUILDER_VERSE_QUEUE: () => BUILDER_VERSE_QUEUE,
    CHURCH_PROMPTS: () => CHURCH_PROMPTS,
    EMPTY_INPUT: () => EMPTY_INPUT,
    FRIEND_EASTER_LINES: () => FRIEND_EASTER_LINES,
    HARP_STRING_SPECS: () => HARP_STRING_SPECS,
    JESUS_EASTER_LINES: () => JESUS_EASTER_LINES,
    JourneyAudio: () => JourneyAudio,
    JourneySpeech: () => JourneySpeech,
    LEAF_COLORS: () => LEAF_COLORS,
    LEAF_COLOR_ORDER: () => LEAF_COLOR_ORDER,
    MAX_CUSTOM_NOTE_LEN: () => MAX_CUSTOM_NOTE_LEN,
    MAX_PRAYERS: () => MAX_PRAYERS,
    QUIZ_QUESTIONS: () => QUIZ_QUESTIONS,
    STAGE_SEQUENCE: () => STAGE_SEQUENCE,
    STAGE_TEXT: () => STAGE_TEXT,
    STICKER_PRESETS: () => STICKER_PRESETS,
    TREE_EASTER_LINES: () => TREE_EASTER_LINES,
    UI_TEXT: () => UI_TEXT,
    VERSES: () => VERSES,
    VERSE_ORDER: () => VERSE_ORDER,
    applyAction: () => applyAction,
    buildPrayerTreeSegments: () => buildPrayerTreeSegments,
    createInitialState: () => createInitialState,
    createPrayerLeaf: () => createPrayerLeaf,
    detectLangTag: () => detectLangTag,
    drainSounds: () => drainSounds,
    drawStickerIcon: () => drawStickerIcon,
    drawTileIcon: () => drawTileIcon,
    exportPostcard: () => exportPostcard,
    formatLocalized: () => formatLocalized,
    formatPrimary: () => formatPrimary,
    formatSecondary: () => formatSecondary,
    getChurchPrompt: () => getChurchPrompt,
    getEasterLine: () => getEasterLine,
    getStickerPreset: () => getStickerPreset,
    getVerseById: () => getVerseById,
    getVerseDecoyTile: () => getVerseDecoyTile,
    getVerseTiles: () => getVerseTiles,
    mountThankfulJesusApp: () => mountThankfulJesusApp,
    renderPostcardCanvas: () => renderPostcardCanvas,
    renderStageCanvas: () => renderStageCanvas,
    sanitizeNote: () => sanitizeNote,
    stepGame: () => stepGame
  });

  // thankful_jesus/ts/constants.ts
  var PALETTE = {
    parchment: "#FFF8EB",
    warmSky: "#E8F4FA",
    galileeBlue: "#AED9E8",
    warmPanel: "#F9EBD3",
    sunGold: "#F6C453",
    warmGold: "#E5A93B",
    oliveGreen: "#6F9463",
    oliveDark: "#4B6A42",
    terracotta: "#D46A43",
    terracottaDark: "#A94A27",
    sandalwood: "#B87A4B",
    robeCream: "#FFFDF7",
    sashCrimson: "#C64B3B",
    ink: "#2E241E",
    mutedInk: "#665042",
    skyAccent: "#5A95B8"
  };
  var LEAF_COLORS = {
    gold: { fill: "#F2C14E", vein: "#9C7516" },
    olive: { fill: "#6F9463", vein: "#3F5D37" },
    crimson: { fill: "#D46A43", vein: "#8C381A" },
    sky: { fill: "#6BA8C9", vein: "#3B6A85" }
  };
  var LEAF_COLOR_ORDER = ["gold", "olive", "crimson", "sky"];
  var STAGE_SEQUENCE = [
    "loaves_and_fish",
    "run_back_to_jesus",
    "david_harp",
    "verse_builder"
  ];
  var HARP_STRING_SPECS = [
    { index: 0, noteLabel: "Do", keyHint: "1", color: "#D46A43" },
    { index: 1, noteLabel: "Re", keyHint: "2", color: "#E5A93B" },
    { index: 2, noteLabel: "Mi", keyHint: "3", color: "#6F9463" },
    { index: 3, noteLabel: "Sol", keyHint: "4", color: "#5A95B8" }
  ];
  var STAGE_SPECS = {
    loaves_and_fish: {
      id: "loaves_and_fish",
      verseId: "john_6_11",
      explorerTarget: 8,
      adventurerTarget: 18,
      adventurerTimeSec: 28
    },
    run_back_to_jesus: {
      id: "run_back_to_jesus",
      verseId: "luke_17_15_16",
      explorerTarget: 6,
      adventurerTarget: 14,
      adventurerTimeSec: 26
    },
    david_harp: {
      id: "david_harp",
      verseId: "psalm_100_4",
      explorerTarget: 8,
      adventurerTarget: 18,
      adventurerTimeSec: 28
    },
    verse_builder: {
      id: "verse_builder",
      verseId: "thess_5_18",
      explorerTarget: 2,
      adventurerTarget: 2,
      adventurerTimeSec: 60
    }
  };
  var TREE_LEAF_SLOTS = [
    { x: 0.24, y: 0.34, tilt: -0.32 },
    { x: 0.5, y: 0.22, tilt: 0.1 },
    { x: 0.74, y: 0.34, tilt: 0.36 },
    { x: 0.34, y: 0.5, tilt: -0.2 },
    { x: 0.64, y: 0.49, tilt: 0.22 },
    { x: 0.19, y: 0.55, tilt: -0.4 },
    { x: 0.8, y: 0.53, tilt: 0.38 },
    { x: 0.49, y: 0.41, tilt: -0.08 },
    { x: 0.37, y: 0.29, tilt: -0.16 },
    { x: 0.62, y: 0.28, tilt: 0.19 },
    { x: 0.29, y: 0.66, tilt: -0.26 },
    { x: 0.69, y: 0.65, tilt: 0.25 }
  ];
  var MAX_CUSTOM_NOTE_LEN = 56;
  var MAX_PRAYERS = 12;
  var STAGE_LOGICAL_W = 420;
  var STAGE_LOGICAL_H = 440;

  // thankful_jesus/ts/artwork.ts
  function safeR(val) {
    return Number.isFinite(val) ? Math.max(0.5, val) : 0.5;
  }
  function safeArc(ctx, x, y, r, start, end, ccw = false) {
    ctx.arc(x, y, safeR(r), start, end, ccw);
  }
  function safeEllipse(ctx, x, y, rx, ry, rot, start, end) {
    ctx.ellipse(x, y, safeR(rx), safeR(ry), rot, start, end);
  }
  function safeRadialGradient(ctx, x0, y0, r0, x1, y1, r1) {
    return ctx.createRadialGradient(x0, y0, Math.max(0, safeR(r0)), x1, y1, safeR(r1));
  }
  function drawRoundedRect(ctx, x, y, w, h, r) {
    const rr = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }
  function drawGroundShadow(ctx, cx, cy, rx, ry) {
    ctx.save();
    ctx.fillStyle = "rgba(58, 40, 24, 0.16)";
    ctx.beginPath();
    safeEllipse(ctx, cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function drawStar(ctx, cx, cy, outerR, fill, stroke = PALETTE.ink) {
    const rOut = safeR(outerR);
    const rIn = safeR(rOut * 0.46);
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? rOut : rIn;
      const angle = -Math.PI / 2 + i * Math.PI / 5;
      const px = cx + Math.cos(angle) * rad;
      const py = cy + Math.sin(angle) * rad;
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    const grad = ctx.createLinearGradient(cx, cy - rOut, cx, cy + rOut);
    grad.addColorStop(0, "#FFF3B0");
    grad.addColorStop(0.45, fill);
    grad.addColorStop(1, fill);
    ctx.fillStyle = fill === "#E4D7C5" ? fill : grad;
    ctx.fill();
    ctx.lineWidth = Math.max(1.4, rOut * 0.1);
    ctx.strokeStyle = stroke;
    ctx.lineJoin = "round";
    ctx.stroke();
    if (fill !== "#E4D7C5") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.beginPath();
      safeArc(ctx, cx - rOut * 0.16, cy - rOut * 0.22, rOut * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  function drawHeart(ctx, cx, cy, size, fill) {
    const s = safeR(size);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    ctx.moveTo(0, s * 0.68);
    ctx.bezierCurveTo(-s * 1.12, -s * 0.05, -s * 0.85, -s * 0.92, 0, -s * 0.32);
    ctx.bezierCurveTo(s * 0.85, -s * 0.92, s * 1.12, -s * 0.05, 0, s * 0.68);
    ctx.closePath();
    const g = ctx.createLinearGradient(-s, -s, s, s);
    g.addColorStop(0, "#FFAD99");
    g.addColorStop(0.35, fill);
    g.addColorStop(1, fill);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = Math.max(1.4, s * 0.13);
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.beginPath();
    safeEllipse(ctx, -s * 0.32, -s * 0.26, s * 0.18, s * 0.11, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function drawCross(ctx, cx, cy, size, fill = PALETTE.sunGold) {
    const s = safeR(size);
    const bar = s * 0.34;
    ctx.save();
    ctx.translate(cx, cy);
    const grad = ctx.createLinearGradient(-s * 0.5, -s, s * 0.5, s);
    grad.addColorStop(0, "#FFF3BD");
    grad.addColorStop(0.45, fill);
    grad.addColorStop(1, fill);
    ctx.fillStyle = grad;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = Math.max(1.4, s * 0.11);
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(-bar / 2, -s);
    ctx.lineTo(bar / 2, -s);
    ctx.lineTo(bar / 2, -bar / 2 - s * 0.12);
    ctx.lineTo(s * 0.72, -bar / 2 - s * 0.12);
    ctx.lineTo(s * 0.72, bar / 2 - s * 0.12);
    ctx.lineTo(bar / 2, bar / 2 - s * 0.12);
    ctx.lineTo(bar / 2, s);
    ctx.lineTo(-bar / 2, s);
    ctx.lineTo(-bar / 2, bar / 2 - s * 0.12);
    ctx.lineTo(-s * 0.72, bar / 2 - s * 0.12);
    ctx.lineTo(-s * 0.72, -bar / 2 - s * 0.12);
    ctx.lineTo(-bar / 2, -bar / 2 - s * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  function drawLeaf(ctx, cx, cy, size, color, tilt = 0) {
    const s = safeR(size);
    const spec = LEAF_COLORS[color];
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tilt);
    const grad = ctx.createLinearGradient(-s * 0.6, -s, s * 0.6, s);
    grad.addColorStop(0, "#FFF3CC");
    grad.addColorStop(0.28, spec.fill);
    grad.addColorStop(1, spec.vein);
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.85, -s * 0.45, s * 0.72, s * 0.45, 0, s);
    ctx.bezierCurveTo(-s * 0.72, s * 0.45, -s * 0.85, -s * 0.45, 0, -s);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = Math.max(1.2, s * 0.11);
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 251, 236, 0.55)";
    ctx.lineWidth = Math.max(1, s * 0.08);
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.68);
    ctx.lineTo(0, s * 1.15);
    ctx.moveTo(0, -s * 0.15);
    ctx.lineTo(s * 0.32, -s * 0.35);
    ctx.moveTo(0, s * 0.22);
    ctx.lineTo(-s * 0.32, 0);
    ctx.stroke();
    ctx.restore();
  }
  function drawSunRays(ctx, cx, cy, radius, timeSec, alpha = 0.28) {
    const r = safeR(radius);
    ctx.save();
    ctx.translate(cx, cy);
    const aura = safeRadialGradient(ctx, 0, 0, 4, 0, 0, r);
    aura.addColorStop(0, "rgba(255, 238, 168, " + String(Math.min(0.65, alpha * 1.6)) + ")");
    aura.addColorStop(0.55, "rgba(246, 196, 83, " + String(alpha * 0.7) + ")");
    aura.addColorStop(1, "rgba(246, 196, 83, 0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    safeArc(ctx, 0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.rotate(timeSec * 0.12);
    ctx.fillStyle = "rgba(255, 230, 145, " + String(alpha * 0.72) + ")";
    const rays = 12;
    for (let i = 0; i < rays; i++) {
      const a = i * Math.PI * 2 / rays;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a - 0.1) * r, Math.sin(a - 0.1) * r);
      ctx.lineTo(Math.cos(a + 0.1) * r, Math.sin(a + 0.1) * r);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
  function drawLightMotes(ctx, w, h, timeSec) {
    ctx.save();
    for (let i = 0; i < 10; i++) {
      const px = (i * 53 + timeSec * (7 + i % 3 * 3)) % (w - 24) + 12;
      const py = 24 + (i * 47 + Math.sin(timeSec * 1.4 + i) * 18) % (h * 0.65);
      const pulse = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(timeSec * 3.1 + i * 1.7));
      const r = 2 + i % 3 * 1.1;
      ctx.fillStyle = "rgba(255, 245, 196, " + String(pulse.toFixed(2)) + ")";
      ctx.beginPath();
      safeArc(ctx, px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  function drawSoftCloud(ctx, cx, cy, scale = 1) {
    const s = safeR(scale);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    ctx.fillStyle = "rgba(244, 212, 184, 0.45)";
    ctx.beginPath();
    safeEllipse(ctx, 2, 10, 32, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    const grad = ctx.createLinearGradient(0, -20, 0, 14);
    grad.addColorStop(0, "rgba(255, 254, 250, 0.95)");
    grad.addColorStop(1, "rgba(255, 239, 216, 0.85)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    safeArc(ctx, -20, 5, 13, 0, Math.PI * 2);
    safeArc(ctx, -6, -4, 17, 0, Math.PI * 2);
    safeArc(ctx, 11, -2, 15, 0, Math.PI * 2);
    safeArc(ctx, 24, 6, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function drawWhiteDove(ctx, cx, cy, scale = 1, timeSec = 0) {
    const s = safeR(scale);
    const flap = Math.sin(timeSec * 5) * 6.5;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    const glow = safeRadialGradient(ctx, 0, 0, 2, 0, 0, 22);
    glow.addColorStop(0, "rgba(255, 250, 225, 0.55)");
    glow.addColorStop(1, "rgba(255, 250, 225, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    safeArc(ctx, 0, 0, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFFDF9";
    ctx.strokeStyle = "#4A3A31";
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(-9, 1);
    ctx.lineTo(-18, -3);
    ctx.lineTo(-17, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    safeEllipse(ctx, 0, 0, 11, 5.5, -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(1, -2);
    ctx.quadraticCurveTo(6, -15 - flap * 0.45, 13, -7 - flap * 0.35);
    ctx.quadraticCurveTo(6, -3, 2, 1);
    ctx.closePath();
    ctx.fillStyle = "#F5EFE6";
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-2, -1);
    ctx.quadraticCurveTo(-8, -15 + flap, -18, -6 + flap * 0.7);
    ctx.quadraticCurveTo(-7, -2, -2, 2);
    ctx.closePath();
    ctx.fillStyle = "#FFFDF9";
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = PALETTE.ink;
    ctx.beginPath();
    safeArc(ctx, 7, -1.5, 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PALETTE.oliveDark;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(10, -1);
    ctx.lineTo(18, 2);
    ctx.stroke();
    ctx.fillStyle = "#7BA86C";
    ctx.beginPath();
    safeEllipse(ctx, 15, -0.5, 2.5, 1.3, -0.5, 0, Math.PI * 2);
    safeEllipse(ctx, 17, 3, 2.5, 1.3, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function drawGalileeBoat(ctx, cx, cy, scale = 1, timeSec = 0) {
    const s = safeR(scale);
    const bob = Math.sin(timeSec * 2.1) * 1.8;
    const tilt = Math.sin(timeSec * 1.7) * 0.045;
    ctx.save();
    ctx.translate(cx, cy + bob);
    ctx.fillStyle = "rgba(85, 132, 160, 0.25)";
    ctx.beginPath();
    safeEllipse(ctx, 0, 11 * s, 18 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.rotate(tilt);
    ctx.scale(s, s);
    const sailGrad = ctx.createLinearGradient(0, -26, 16, -2);
    sailGrad.addColorStop(0, "#FFFDF7");
    sailGrad.addColorStop(1, "#F7DFB9");
    ctx.fillStyle = sailGrad;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -26);
    ctx.quadraticCurveTo(18, -15, 14, -3);
    ctx.lineTo(0, -3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#D46A43";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(1, -13);
    ctx.quadraticCurveTo(9, -12, 13, -11);
    ctx.stroke();
    ctx.strokeStyle = "#7D4C1E";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, -27);
    ctx.lineTo(0, 0);
    ctx.stroke();
    const hullGrad = ctx.createLinearGradient(0, -2, 0, 9);
    hullGrad.addColorStop(0, "#C9854E");
    hullGrad.addColorStop(1, "#8C5229");
    ctx.fillStyle = hullGrad;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(-20, -2);
    ctx.quadraticCurveTo(0, 1, 20, -2);
    ctx.lineTo(13, 8);
    ctx.quadraticCurveTo(0, 10, -13, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  function drawDistantVillage(ctx, x, y, scale) {
    const s = safeR(scale);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    const houses = [
      { dx: -16, dy: -8, w: 12, h: 9, c: "#F7E6CE" },
      { dx: -2, dy: -11, w: 14, h: 12, c: "#FFF2DF" },
      { dx: 14, dy: -7, w: 10, h: 8, c: "#EDD5B8" }
    ];
    for (let i = 0; i < houses.length; i++) {
      const hs = houses[i];
      ctx.fillStyle = hs.c;
      ctx.fillRect(hs.dx, hs.dy, hs.w, hs.h);
      ctx.fillStyle = "#C78D60";
      ctx.fillRect(hs.dx - 1, hs.dy - 2, hs.w + 2, 2.5);
      ctx.fillStyle = "#7E604C";
      ctx.fillRect(hs.dx + hs.w * 0.4, hs.dy + hs.h * 0.42, 2.5, 4);
    }
    const trees = [-24, 11, 28];
    ctx.fillStyle = "#5F7E58";
    for (let i = 0; i < trees.length; i++) {
      ctx.beginPath();
      safeEllipse(ctx, trees[i], -9, 3, 9, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  function drawWildflower(ctx, cx, cy, scale = 1, petalColor = "#FFF2A6", timeSec = 0) {
    const s = safeR(scale);
    const sway = Math.sin(timeSec * 2.2 + cx * 0.05) * 0.12;
    ctx.save();
    ctx.translate(cx, cy + 10 * s);
    ctx.rotate(sway);
    ctx.translate(0, -10 * s);
    ctx.scale(s, s);
    ctx.strokeStyle = PALETTE.oliveDark;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(2, 5, 0, 11);
    ctx.stroke();
    ctx.fillStyle = "#7EA569";
    ctx.beginPath();
    safeEllipse(ctx, 3.5, 6, 3.5, 1.5, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = petalColor;
    ctx.strokeStyle = "rgba(46, 36, 30, 0.35)";
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5;
      ctx.beginPath();
      safeArc(ctx, Math.cos(a) * 4.2, Math.sin(a) * 4.2, 3.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = PALETTE.sunGold;
    ctx.beginPath();
    safeArc(ctx, 0, 0, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function drawWheatStalk(ctx, cx, baseY, scale, timeSec) {
    const s = safeR(scale);
    const sway = Math.sin(timeSec * 1.9 + cx * 0.04) * 0.14;
    ctx.save();
    ctx.translate(cx, baseY);
    ctx.rotate(sway);
    ctx.scale(s, s);
    ctx.strokeStyle = "#C9963B";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(3, -12, 1, -24);
    ctx.stroke();
    ctx.fillStyle = "#F2C45A";
    for (let i = 0; i < 4; i++) {
      const gy = -12 - i * 3.5;
      ctx.beginPath();
      safeEllipse(ctx, -2.5, gy, 2.6, 1.4, -0.6, 0, Math.PI * 2);
      safeEllipse(ctx, 3.5, gy - 1, 2.6, 1.4, 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  function drawGoldenFootprint(ctx, cx, cy, scale = 1, tilt = 0) {
    const s = safeR(scale);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tilt);
    ctx.scale(s, s);
    ctx.fillStyle = "rgba(246, 196, 83, 0.88)";
    ctx.strokeStyle = PALETTE.terracottaDark;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    safeEllipse(ctx, 0, -4, 4.5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    safeArc(ctx, 0, 6, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  function drawHeartBurst(ctx, cx, cy, progress, timeSec) {
    const p = Math.max(0, Math.min(1, progress));
    const spread = 24 + (1 - p) * 48;
    const items = 5;
    for (let i = 0; i < items; i++) {
      const a = -Math.PI * 0.85 + i / (items - 1) * Math.PI * 0.7 + Math.sin(timeSec * 4 + i) * 0.08;
      const px = cx + Math.cos(a) * spread;
      const py = cy + Math.sin(a) * spread;
      if (i % 2 === 0) {
        drawHeart(ctx, px, py, 6.8, "#E06D53");
      } else {
        drawStar(ctx, px, py, 6.8, PALETTE.sunGold);
      }
    }
  }
  function drawSpeechBubble(ctx, cx, topY, primary, secondary, canvasWidth, tailX) {
    ctx.save();
    ctx.font = "800 13px system-ui, -apple-system, sans-serif";
    const w1 = ctx.measureText(primary).width;
    let w2 = 0;
    if (secondary) {
      ctx.font = "700 12px system-ui, -apple-system, sans-serif";
      w2 = ctx.measureText(secondary).width;
    }
    const boxW = Math.min(canvasWidth - 28, Math.max(130, Math.max(w1, w2) + 30));
    const boxH = secondary ? 48 : 32;
    const x = Math.max(14, Math.min(canvasWidth - 14 - boxW, cx - boxW / 2));
    const y = Math.max(10, topY);
    drawRoundedRect(ctx, x + 2, y + 3, boxW, boxH, 14);
    ctx.fillStyle = "rgba(56, 38, 24, 0.14)";
    ctx.fill();
    drawRoundedRect(ctx, x, y, boxW, boxH, 14);
    const bg = ctx.createLinearGradient(x, y, x, y + boxH);
    bg.addColorStop(0, "#FFFEFA");
    bg.addColorStop(1, "#FFF2D9");
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    if (typeof tailX === "number") {
      const tx = Math.max(x + 18, Math.min(x + boxW - 18, tailX));
      ctx.beginPath();
      ctx.moveTo(tx - 7, y + boxH - 1);
      ctx.lineTo(tx, y + boxH + 9);
      ctx.lineTo(tx + 7, y + boxH - 1);
      ctx.closePath();
      ctx.fillStyle = "#FFF2D9";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(tx - 7, y + boxH);
      ctx.lineTo(tx, y + boxH + 9);
      ctx.lineTo(tx + 7, y + boxH);
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 2.2;
      ctx.stroke();
    }
    ctx.textAlign = "center";
    ctx.fillStyle = PALETTE.ink;
    ctx.font = "800 13px system-ui, -apple-system, sans-serif";
    const trimPrimary = primary.length > 36 ? primary.slice(0, 35) + "..." : primary;
    ctx.fillText(trimPrimary, x + boxW / 2, secondary ? y + 19 : y + 21);
    if (secondary) {
      ctx.fillStyle = PALETTE.terracottaDark;
      ctx.font = "700 12px system-ui, -apple-system, sans-serif";
      const trimSec = secondary.length > 26 ? secondary.slice(0, 25) + "..." : secondary;
      ctx.fillText(trimSec, x + boxW / 2, y + 38);
    }
    ctx.restore();
  }
  function drawWindGustLeaf(ctx, cx, cy, scale = 1, timeSec = 0) {
    const s = safeR(scale);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.sin(timeSec * 8 + cy * 0.05) * 0.45);
    ctx.scale(s, s);
    ctx.strokeStyle = "rgba(110, 146, 168, 0.85)";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-16, -6);
    ctx.quadraticCurveTo(0, -14, 14, -4);
    ctx.moveTo(-14, 8);
    ctx.quadraticCurveTo(2, 14, 16, 4);
    ctx.stroke();
    ctx.fillStyle = "#8C5835";
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    safeEllipse(ctx, 0, 0, 11, 5.5, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  function drawAdventurerTimerAndCombo(ctx, w, timeLeftSec, totalTimeSec, streak) {
    const ratio = Math.max(0, Math.min(1, totalTimeSec > 0 ? timeLeftSec / totalTimeSec : 1));
    const barX = 16;
    const barY = 12;
    const barW = w - 32;
    const barH = 12;
    ctx.save();
    drawRoundedRect(ctx, barX, barY, barW, barH, 6);
    ctx.fillStyle = "rgba(46, 36, 30, 0.25)";
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    const fillW = Math.max(8, (barW - 4) * ratio);
    drawRoundedRect(ctx, barX + 2, barY + 2, fillW, barH - 4, 4);
    ctx.fillStyle = timeLeftSec <= 7 ? "#D94A38" : timeLeftSec <= 14 ? "#E89B2D" : "#F6C453";
    ctx.fill();
    if (streak >= 3) {
      const mult = streak >= 6 ? "x3" : "x2";
      const bx = w - 76;
      const by = 29;
      drawRoundedRect(ctx, bx, by, 60, 24, 12);
      ctx.fillStyle = streak >= 6 ? "#D46A43" : "#E5A93B";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = PALETTE.ink;
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFDF8";
      ctx.font = "800 13px system-ui, -apple-system, sans-serif";
      ctx.fillText(mult + "!", bx + 30, by + 16);
    }
    ctx.restore();
  }
  function drawStorybookFrame(ctx, w, h) {
    ctx.save();
    drawRoundedRect(ctx, 5, 5, w - 10, h - 10, 14);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(184, 122, 75, 0.36)";
    ctx.stroke();
    ctx.restore();
  }
  function drawGalileeBackdrop(ctx, w, h, timeSec) {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62);
    sky.addColorStop(0, "#97CBE3");
    sky.addColorStop(0.36, "#CBE6F0");
    sky.addColorStop(0.68, "#FCE7C3");
    sky.addColorStop(1, "#FAD29F");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    const sunX = w * 0.82;
    const sunY = h * 0.16;
    drawSunRays(ctx, sunX, sunY, 118, timeSec, 0.25);
    const cloud1X = (timeSec * 7 + w * 0.22) % (w + 96) - 48;
    const cloud2X = (timeSec * 4.5 + w * 0.62) % (w + 96) - 48;
    drawSoftCloud(ctx, cloud1X, h * 0.14, 0.96);
    drawSoftCloud(ctx, cloud2X, h * 0.24, 0.78);
    ctx.save();
    const sunGrad = safeRadialGradient(ctx, sunX - 5, sunY - 5, 4, sunX, sunY, 30);
    sunGrad.addColorStop(0, "#FFFDF0");
    sunGrad.addColorStop(0.6, "#FFE38C");
    sunGrad.addColorStop(1, "#F5B84B");
    ctx.beginPath();
    safeArc(ctx, sunX, sunY, 27, 0, Math.PI * 2);
    ctx.fillStyle = sunGrad;
    ctx.fill();
    ctx.restore();
    const doveX = (timeSec * 15 + w * 0.15) % (w + 60) - 30;
    const doveY = h * 0.29 + Math.sin(timeSec * 1.8) * 6;
    drawWhiteDove(ctx, doveX, doveY, 0.84, timeSec);
    const farHill = ctx.createLinearGradient(0, h * 0.38, 0, h * 0.56);
    farHill.addColorStop(0, "#C3B9C7");
    farHill.addColorStop(1, "#D9CCB8");
    ctx.fillStyle = farHill;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.54);
    ctx.quadraticCurveTo(w * 0.18, h * 0.39, w * 0.44, h * 0.51);
    ctx.quadraticCurveTo(w * 0.72, h * 0.37, w, h * 0.5);
    ctx.lineTo(w, h * 0.62);
    ctx.lineTo(0, h * 0.62);
    ctx.closePath();
    ctx.fill();
    const midHill = ctx.createLinearGradient(0, h * 0.44, 0, h * 0.58);
    midHill.addColorStop(0, "#A9BF8E");
    midHill.addColorStop(1, "#7F9F72");
    ctx.fillStyle = midHill;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.56);
    ctx.quadraticCurveTo(w * 0.26, h * 0.44, w * 0.56, h * 0.54);
    ctx.quadraticCurveTo(w * 0.82, h * 0.47, w, h * 0.55);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    drawDistantVillage(ctx, w * 0.22, h * 0.515, 0.88);
    const waterGrad = ctx.createLinearGradient(0, h * 0.54, 0, h * 0.68);
    waterGrad.addColorStop(0, "#75B5CF");
    waterGrad.addColorStop(0.5, "#92C9DD");
    waterGrad.addColorStop(1, "#6DA7C2");
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, h * 0.545, w, h * 0.13);
    ctx.save();
    for (let i = 0; i < 6; i++) {
      const wy = h * (0.558 + i * 0.017);
      const rw = (22 + i * 7) * (0.85 + 0.15 * Math.sin(timeSec * 3 + i));
      ctx.fillStyle = "rgba(255, 232, 165, " + String((0.46 - i * 0.05).toFixed(2)) + ")";
      ctx.beginPath();
      safeEllipse(ctx, sunX - 10 + Math.sin(timeSec * 2 + i) * 5, wy, rw, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(255, 253, 247, 0.48)";
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 4; i++) {
      const y = h * (0.575 + i * 0.022);
      const shift = Math.sin(timeSec * 1.4 + i) * 8;
      ctx.beginPath();
      ctx.moveTo(w * (0.1 + i * 0.15) + shift, y);
      ctx.lineTo(w * (0.24 + i * 0.15) + shift, y);
      ctx.stroke();
    }
    drawGalileeBoat(ctx, w * 0.7 + Math.sin(timeSec * 0.35) * 14, h * 0.578, 0.74, timeSec);
    const meadowGrad = ctx.createLinearGradient(0, h * 0.62, 0, h);
    meadowGrad.addColorStop(0, "#BDD186");
    meadowGrad.addColorStop(0.45, "#9BB86B");
    meadowGrad.addColorStop(1, "#7B9B54");
    ctx.fillStyle = meadowGrad;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.65);
    ctx.quadraticCurveTo(w * 0.5, h * 0.59, w, h * 0.655);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 244, 196, 0.45)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.652);
    ctx.quadraticCurveTo(w * 0.5, h * 0.592, w, h * 0.657);
    ctx.stroke();
    drawWheatStalk(ctx, w * 0.06, h * 0.94, 0.9, timeSec);
    drawWheatStalk(ctx, w * 0.11, h * 0.96, 0.78, timeSec + 0.5);
    drawWheatStalk(ctx, w * 0.94, h * 0.95, 0.88, timeSec + 1.1);
    const flowers = [
      { x: 0.09, y: 0.85, c: "#FFF5B8" },
      { x: 0.21, y: 0.91, c: "#FFD5C2" },
      { x: 0.88, y: 0.84, c: "#FFF5B8" },
      { x: 0.92, y: 0.92, c: "#E8F6FF" }
    ];
    for (let i = 0; i < flowers.length; i++) {
      drawWildflower(ctx, w * flowers[i].x, h * flowers[i].y, 0.85, flowers[i].c, timeSec);
    }
    drawLightMotes(ctx, w, h, timeSec);
  }
  function drawJesus(ctx, cx, baseY, scale, pose, timeSec) {
    const s = safeR(scale);
    const bob = Math.sin(timeSec * 2.2) * 1.5 * s;
    ctx.save();
    drawGroundShadow(ctx, cx, baseY + 3 * s, 26 * s, 6.5 * s);
    ctx.translate(cx, baseY + bob);
    ctx.scale(s, s);
    const haloR = 30 + Math.sin(timeSec * 2.8) * 1.8;
    const haloGrad = safeRadialGradient(ctx, 0, -68, 4, 0, -68, haloR);
    haloGrad.addColorStop(0, "rgba(255, 245, 194, 0.82)");
    haloGrad.addColorStop(0.55, "rgba(246, 196, 83, 0.42)");
    haloGrad.addColorStop(1, "rgba(246, 196, 83, 0)");
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    safeArc(ctx, 0, -68, haloR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    safeArc(ctx, 0, -68, 20, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(235, 180, 68, 0.65)";
    ctx.lineWidth = 1.8;
    ctx.stroke();
    const robeGrad = ctx.createLinearGradient(-24, -44, 24, 4);
    robeGrad.addColorStop(0, "#FFFDF9");
    robeGrad.addColorStop(0.6, "#FAF0DC");
    robeGrad.addColorStop(1, "#EAD6B5");
    ctx.beginPath();
    ctx.moveTo(-18, -44);
    ctx.lineTo(18, -44);
    ctx.quadraticCurveTo(23, -20, 26, 0);
    ctx.quadraticCurveTo(0, 7, -26, 0);
    ctx.quadraticCurveTo(-23, -20, -18, -44);
    ctx.closePath();
    ctx.fillStyle = robeGrad;
    ctx.fill();
    ctx.lineWidth = 2.3;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    ctx.strokeStyle = "rgba(165, 128, 92, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-8, -32);
    ctx.quadraticCurveTo(-11, -14, -12, 1);
    ctx.moveTo(6, -26);
    ctx.quadraticCurveTo(9, -12, 10, 1);
    ctx.stroke();
    const sashGrad = ctx.createLinearGradient(-16, -44, 18, 0);
    sashGrad.addColorStop(0, "#DA5E49");
    sashGrad.addColorStop(0.55, PALETTE.sashCrimson);
    sashGrad.addColorStop(1, "#9B3325");
    ctx.beginPath();
    ctx.moveTo(-16, -44);
    ctx.lineTo(-3, -44);
    ctx.quadraticCurveTo(10, -22, 18, -1);
    ctx.lineTo(4, -1);
    ctx.quadraticCurveTo(-5, -22, -16, -44);
    ctx.closePath();
    ctx.fillStyle = sashGrad;
    ctx.fill();
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = "#F6C453";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-14, -41);
    ctx.quadraticCurveTo(-3, -20, 6, -3);
    ctx.stroke();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (pose === "bless") {
      ctx.beginPath();
      ctx.moveTo(-16, -36);
      ctx.quadraticCurveTo(-31, -44, -20, -56);
      ctx.moveTo(16, -36);
      ctx.quadraticCurveTo(31, -44, 20, -56);
      ctx.strokeStyle = "#FAF0DC";
      ctx.lineWidth = 10.5;
      ctx.stroke();
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 2.1;
      ctx.stroke();
      ctx.fillStyle = "#F3C79F";
      ctx.beginPath();
      safeArc(ctx, -20, -58, 4.6, 0, Math.PI * 2);
      safeArc(ctx, 20, -58, 4.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      const handY = pose === "celebrate" ? -51 : -34;
      ctx.beginPath();
      ctx.moveTo(-16, -36);
      ctx.lineTo(-32, handY);
      ctx.moveTo(16, -36);
      ctx.lineTo(32, handY);
      ctx.strokeStyle = "#FAF0DC";
      ctx.lineWidth = 10;
      ctx.stroke();
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 2.1;
      ctx.stroke();
      ctx.fillStyle = "#F3C79F";
      ctx.beginPath();
      safeArc(ctx, -33, handY, 4.6, 0, Math.PI * 2);
      safeArc(ctx, 33, handY, 4.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    const hairGrad = ctx.createLinearGradient(-16, -82, 16, -46);
    hairGrad.addColorStop(0, "#754C2E");
    hairGrad.addColorStop(1, "#4B2E1A");
    ctx.fillStyle = hairGrad;
    ctx.beginPath();
    safeEllipse(ctx, 0, -64, 17.5, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.1;
    ctx.stroke();
    const faceGrad = safeRadialGradient(ctx, -3, -70, 2, 0, -66, 15);
    faceGrad.addColorStop(0, "#FADAC0");
    faceGrad.addColorStop(1, "#EBB88C");
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    safeArc(ctx, 0, -66, 13.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#5F3C23";
    ctx.beginPath();
    ctx.moveTo(-13, -68);
    ctx.quadraticCurveTo(-8, -81, 0, -78);
    ctx.quadraticCurveTo(8, -81, 13, -68);
    ctx.quadraticCurveTo(6, -75, 0, -73);
    ctx.quadraticCurveTo(-6, -75, -13, -68);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(229, 128, 108, 0.32)";
    ctx.beginPath();
    safeEllipse(ctx, -7.2, -64, 3, 1.9, 0, 0, Math.PI * 2);
    safeEllipse(ctx, 7.2, -64, 3, 1.9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5B3B24";
    ctx.beginPath();
    safeArc(ctx, 0, -62, 11.2, 0.18, Math.PI - 0.18);
    ctx.quadraticCurveTo(0, -48.5, -10.8, -60);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = PALETTE.ink;
    ctx.beginPath();
    safeArc(ctx, -4.5, -68, 2, 0, Math.PI * 2);
    safeArc(ctx, 4.5, -68, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    safeArc(ctx, -5, -68.7, 0.7, 0, Math.PI * 2);
    safeArc(ctx, 4, -68.7, 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#FFF8EB";
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    safeArc(ctx, 0, -63, 4.2, 0.22, Math.PI - 0.22);
    ctx.stroke();
    ctx.restore();
  }
  function drawChildFriend(ctx, cx, baseY, scale, tunicColor, happy, timeSec) {
    const s = safeR(scale);
    const hop = happy ? Math.abs(Math.sin(timeSec * 5.8)) * 5 * s : Math.sin(timeSec * 2.5) * 1.2 * s;
    ctx.save();
    drawGroundShadow(ctx, cx, baseY + 3 * s, 17 * s, 4.5 * s);
    ctx.translate(cx, baseY - hop);
    ctx.scale(s, s);
    const tunicGrad = ctx.createLinearGradient(-14, -32, 16, 0);
    tunicGrad.addColorStop(0, tunicColor);
    tunicGrad.addColorStop(1, tunicColor);
    ctx.fillStyle = tunicGrad;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(-12, -32);
    ctx.lineTo(12, -32);
    ctx.lineTo(16, 0);
    ctx.quadraticCurveTo(0, 4, -16, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#F6C453";
    ctx.fillRect(-12, -16, 24, 4);
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-12, -16, 24, 4);
    const armY = happy ? -40 : -20;
    ctx.beginPath();
    ctx.moveTo(-11, -26);
    ctx.lineTo(-22, armY);
    ctx.moveTo(11, -26);
    ctx.lineTo(22, armY);
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.fillStyle = "#F5CAA3";
    ctx.beginPath();
    safeArc(ctx, -22, armY, 3.2, 0, Math.PI * 2);
    safeArc(ctx, 22, armY, 3.2, 0, Math.PI * 2);
    ctx.fill();
    const headGrad = safeRadialGradient(ctx, -3, -47, 2, 0, -44, 12);
    headGrad.addColorStop(0, "#FCE0C6");
    headGrad.addColorStop(1, "#EEBE93");
    ctx.fillStyle = headGrad;
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    safeArc(ctx, 0, -44, 11.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#4A3222";
    ctx.beginPath();
    safeArc(ctx, 0, -46, 11.5, Math.PI * 0.96, Math.PI * 2.04);
    ctx.fill();
    ctx.beginPath();
    safeArc(ctx, -6, -52, 4.2, 0, Math.PI * 2);
    safeArc(ctx, 2, -54, 4.5, 0, Math.PI * 2);
    safeArc(ctx, 8, -51, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(232, 128, 106, 0.36)";
    ctx.beginPath();
    safeEllipse(ctx, -6.2, -41.5, 2.5, 1.6, 0, 0, Math.PI * 2);
    safeEllipse(ctx, 6.2, -41.5, 2.5, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.ink;
    ctx.beginPath();
    safeArc(ctx, -3.8, -44.2, 1.8, 0, Math.PI * 2);
    safeArc(ctx, 3.8, -44.2, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    safeArc(ctx, -4.3, -44.8, 0.65, 0, Math.PI * 2);
    safeArc(ctx, 3.3, -44.8, 0.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PALETTE.ink;
    ctx.beginPath();
    safeArc(ctx, 0, -41, 4.1, 0.18, Math.PI - 0.18);
    ctx.lineWidth = 1.7;
    ctx.stroke();
    ctx.restore();
  }
  function drawBarleyLoaf(ctx, cx, cy, scale = 1) {
    const s = safeR(scale);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    const grad = safeRadialGradient(ctx, -5, -4, 2, 0, 0, 17);
    grad.addColorStop(0, "#F8D184");
    grad.addColorStop(0.55, "#DF9D4B");
    grad.addColorStop(1, "#AE6B26");
    ctx.fillStyle = grad;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    safeEllipse(ctx, 0, 0, 16.5, 10.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#8C4E18";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-7, -5);
    ctx.lineTo(-3, 4);
    ctx.moveTo(2, -6);
    ctx.lineTo(6, 4);
    ctx.stroke();
    ctx.restore();
  }
  function drawFish(ctx, cx, cy, scale = 1) {
    const s = safeR(scale);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    const grad = ctx.createLinearGradient(0, -9, 0, 9);
    grad.addColorStop(0, "#B8E4F5");
    grad.addColorStop(0.5, "#74B4CE");
    grad.addColorStop(1, "#4C87A4");
    ctx.fillStyle = grad;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    safeEllipse(ctx, -2, 0, 14.5, 8.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(19, -7.5);
    ctx.lineTo(19, 7.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    safeArc(ctx, 0, 0, 5, -0.8, 0.8);
    ctx.stroke();
    ctx.fillStyle = PALETTE.ink;
    ctx.beginPath();
    safeArc(ctx, -8.5, -1.5, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    safeArc(ctx, -9, -2, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function drawWovenBasket(ctx, cx, cy, scale = 1, filledCount = 0) {
    const s = safeR(scale);
    ctx.save();
    drawGroundShadow(ctx, cx, cy + 20 * s, 28 * s, 5 * s);
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    if (filledCount > 0) {
      drawBarleyLoaf(ctx, -12, -10, 0.74);
      drawBarleyLoaf(ctx, 11, -10, 0.74);
      if (filledCount > 2) {
        drawFish(ctx, 0, -14, 0.72);
      }
    }
    const bGrad = ctx.createLinearGradient(-34, -8, 34, 22);
    bGrad.addColorStop(0, "#DEA05D");
    bGrad.addColorStop(0.5, "#C78747");
    bGrad.addColorStop(1, "#9B622A");
    ctx.fillStyle = bGrad;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(-34, -8);
    ctx.lineTo(34, -8);
    ctx.lineTo(25, 18);
    ctx.quadraticCurveTo(0, 24, -25, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    drawRoundedRect(ctx, -37, -12, 74, 8.5, 4);
    ctx.fillStyle = "#B37436";
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(92, 52, 18, 0.65)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-27, 2);
    ctx.lineTo(27, 2);
    ctx.moveTo(-23, 10);
    ctx.lineTo(23, 10);
    ctx.moveTo(-15, -4);
    ctx.lineTo(-10, 18);
    ctx.moveTo(0, -4);
    ctx.lineTo(0, 20);
    ctx.moveTo(15, -4);
    ctx.lineTo(10, 18);
    ctx.stroke();
    ctx.restore();
  }
  function drawBlessingToken(ctx, cx, cy, scale = 1, timeSec = 0) {
    const s = safeR(scale);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    const pulse = 19 + Math.sin(timeSec * 6) * 2;
    const g = safeRadialGradient(ctx, 0, 0, 3, 0, 0, pulse);
    g.addColorStop(0, "rgba(255, 244, 178, 0.85)");
    g.addColorStop(0.6, "rgba(246, 196, 83, 0.42)");
    g.addColorStop(1, "rgba(246, 196, 83, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    safeArc(ctx, 0, 0, pulse, 0, Math.PI * 2);
    ctx.fill();
    drawStar(ctx, 0, 0, 14, PALETTE.sunGold);
    ctx.restore();
  }
  function drawMarketCart(ctx, cx, cy, scale = 1) {
    const s = safeR(scale);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    ctx.fillStyle = "#D46A43";
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-22, -12);
    ctx.lineTo(22, -12);
    ctx.lineTo(17, -20);
    ctx.lineTo(-17, -20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    drawRoundedRect(ctx, -20, -12, 40, 20, 5);
    ctx.fillStyle = "#C38050";
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#6E4427";
    ctx.beginPath();
    safeArc(ctx, -11, 12, 6, 0, Math.PI * 2);
    safeArc(ctx, 11, 12, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  function drawToyBlock(ctx, cx, cy, scale = 1) {
    const s = safeR(scale);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    drawRoundedRect(ctx, -14, -14, 28, 28, 6);
    const g = ctx.createLinearGradient(-14, -14, 14, 14);
    g.addColorStop(0, "#F39D82");
    g.addColorStop(1, "#D26B52");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    drawStar(ctx, 0, 0, 7.5, "#FFF6CC");
    ctx.restore();
  }
  function drawGoldenHarp(ctx, cx, cy, scale = 1, timeSec = 0) {
    const s = safeR(scale);
    const shimmer = Math.sin(timeSec * 4) * 1.2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    const glow = safeRadialGradient(ctx, 0, 0, 4, 0, 0, 28);
    glow.addColorStop(0, "rgba(255, 236, 155, 0.45)");
    glow.addColorStop(1, "rgba(255, 236, 155, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    safeArc(ctx, 0, 0, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#F8CD5C";
    ctx.lineWidth = 1.7;
    for (let i = 0; i < 4; i++) {
      const sx = -9 + i * 6;
      ctx.beginPath();
      ctx.moveTo(sx, -16 + i * 1.4);
      ctx.lineTo(sx, 14);
      ctx.stroke();
    }
    ctx.strokeStyle = "#B87A24";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-16, 15);
    ctx.quadraticCurveTo(-20, -14, -10, -22);
    ctx.quadraticCurveTo(4, -26 + shimmer * 0.3, 18, -12);
    ctx.lineTo(14, 15);
    ctx.stroke();
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 1.8;
    ctx.stroke();
    drawRoundedRect(ctx, -18, 12, 36, 9, 4);
    const boxG = ctx.createLinearGradient(-18, 12, 18, 21);
    boxG.addColorStop(0, "#D89A56");
    boxG.addColorStop(1, "#9B602B");
    ctx.fillStyle = boxG;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  function drawMusicNote(ctx, cx, cy, scale = 1, color = "#D46A43", golden = false) {
    const s = safeR(scale);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    if (golden) {
      const g = safeRadialGradient(ctx, 0, 0, 3, 0, 0, 22);
      g.addColorStop(0, "rgba(255, 242, 168, 0.85)");
      g.addColorStop(1, "rgba(246, 196, 83, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      safeArc(ctx, 0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
    }
    const badgeG = safeRadialGradient(ctx, -4, -5, 2, 0, 0, 15);
    badgeG.addColorStop(0, "#FFF6D1");
    badgeG.addColorStop(0.38, golden ? PALETTE.sunGold : color);
    badgeG.addColorStop(1, golden ? "#D68E23" : color);
    ctx.beginPath();
    safeArc(ctx, 0, 0, 14.5, 0, Math.PI * 2);
    ctx.fillStyle = badgeG;
    ctx.fill();
    ctx.lineWidth = 2.1;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    ctx.fillStyle = "#FFFDF8";
    ctx.strokeStyle = "#FFFDF8";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    safeEllipse(ctx, -2.5, 4, 4.2, 3.2, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(1.5, 3);
    ctx.lineTo(1.5, -7);
    ctx.quadraticCurveTo(7.5, -6, 7.5, -1);
    ctx.stroke();
    ctx.restore();
  }
  function drawLittleSheep(ctx, cx, baseY, scale = 1, timeSec = 0) {
    const s = safeR(scale);
    const bob = Math.abs(Math.sin(timeSec * 3.2)) * 2 * s;
    ctx.save();
    drawGroundShadow(ctx, cx, baseY + 4 * s, 14 * s, 3.5 * s);
    ctx.translate(cx, baseY - bob);
    ctx.scale(s, s);
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-8, -4);
    ctx.lineTo(-8, 4);
    ctx.moveTo(6, -4);
    ctx.lineTo(6, 4);
    ctx.stroke();
    ctx.fillStyle = "#FFFDF6";
    ctx.lineWidth = 1.9;
    const puffs = [
      { x: -8, y: -12, r: 8 },
      { x: 0, y: -15.5, r: 9.2 },
      { x: 8.5, y: -12, r: 8 },
      { x: 0, y: -9, r: 8 }
    ];
    for (let i = 0; i < puffs.length; i++) {
      ctx.beginPath();
      safeArc(ctx, puffs[i].x, puffs[i].y, puffs[i].r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = "#4A3A31";
    ctx.beginPath();
    safeArc(ctx, -14, -14, 5.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    safeEllipse(ctx, -11, -17, 3.5, 1.8, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFFDF8";
    ctx.beginPath();
    safeArc(ctx, -15.5, -15, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function drawGratitudeOliveTree(ctx, cx, baseY, width, height, prayers, timeSec, rustleTimer = 0) {
    const w = safeR(width);
    const h = safeR(height);
    const trunkW = w * 0.16;
    const trunkH = h * 0.44;
    const rustleShift = rustleTimer > 0 ? Math.sin(timeSec * 22) * 3.5 * Math.min(1, rustleTimer) : 0;
    ctx.save();
    drawGroundShadow(ctx, cx, baseY + 4, w * 0.38, h * 0.06);
    const trunkGrad = ctx.createLinearGradient(cx - trunkW, baseY - trunkH, cx + trunkW, baseY);
    trunkGrad.addColorStop(0, "#A97149");
    trunkGrad.addColorStop(0.55, "#825231");
    trunkGrad.addColorStop(1, "#5F3920");
    ctx.fillStyle = trunkGrad;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(cx - trunkW * 0.85, baseY);
    ctx.quadraticCurveTo(cx - trunkW * 0.42, baseY - trunkH * 0.45, cx - trunkW * 0.46, baseY - trunkH);
    ctx.lineTo(cx + trunkW * 0.46, baseY - trunkH);
    ctx.quadraticCurveTo(cx + trunkW * 0.42, baseY - trunkH * 0.45, cx + trunkW * 0.85, baseY);
    ctx.quadraticCurveTo(cx, baseY + 5, cx - trunkW * 0.85, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 232, 200, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - trunkW * 0.15, baseY - trunkH * 0.8);
    ctx.quadraticCurveTo(cx - trunkW * 0.25, baseY - trunkH * 0.4, cx - trunkW * 0.12, baseY - 8);
    ctx.stroke();
    const canopyTop = baseY - h;
    const canopyCenterY = baseY - h * 0.62;
    const puffs = [
      { dx: -w * 0.26, dy: h * 0.06, rx: w * 0.26, ry: h * 0.22, top: "#89B071", bot: "#517347" },
      { dx: w * 0.26, dy: h * 0.06, rx: w * 0.26, ry: h * 0.22, top: "#95BC7A", bot: "#597B4E" },
      { dx: -w * 0.12, dy: h * 0.12, rx: w * 0.23, ry: h * 0.18, top: "#83AA6B", bot: "#55764A" },
      { dx: w * 0.14, dy: h * 0.12, rx: w * 0.23, ry: h * 0.18, top: "#8FB675", bot: "#5B7D50" },
      { dx: 0, dy: -h * 0.08, rx: w * 0.35, ry: h * 0.28, top: "#B4CF84", bot: "#648957" }
    ];
    for (let i = 0; i < puffs.length; i++) {
      const p = puffs[i];
      const px = cx + p.dx + rustleShift;
      const py = canopyCenterY + p.dy;
      const g = ctx.createLinearGradient(px, py - p.ry, px, py + p.ry);
      g.addColorStop(0, p.top);
      g.addColorStop(1, p.bot);
      ctx.beginPath();
      safeEllipse(ctx, px, py, p.rx, p.ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = PALETTE.ink;
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(255, 245, 190, 0.24)";
    ctx.beginPath();
    safeEllipse(ctx, cx + w * 0.06 + rustleShift, canopyCenterY - h * 0.17, w * 0.19, h * 0.11, -0.15, 0, Math.PI * 2);
    ctx.fill();
    const boxLeft = cx - w * 0.46 + rustleShift;
    const boxTop = canopyTop + h * 0.06;
    const boxW = w * 0.92;
    const boxH = h * 0.62;
    for (let i = 0; i < prayers.length; i++) {
      const leaf = prayers[i];
      const slot = TREE_LEAF_SLOTS[leaf.treeSlot % TREE_LEAF_SLOTS.length];
      const sway = Math.sin(timeSec * (rustleTimer > 0 ? 10 : 2.1) + i * 0.9) * (rustleTimer > 0 ? 0.22 : 0.08);
      const lx = boxLeft + slot.x * boxW;
      const ly = boxTop + slot.y * boxH;
      drawLeaf(ctx, lx, ly, Math.max(10.5, w * 0.058), leaf.leafColor, slot.tilt + sway);
    }
    if (rustleTimer > 0) {
      const burstColors = ["gold", "crimson", "olive", "sky"];
      const fall = 2.2 - rustleTimer;
      for (let i = 0; i < 4; i++) {
        const lx = cx + (i - 1.5) * (w * 0.22) + Math.sin(timeSec * 6 + i) * 10;
        const ly = canopyCenterY + fall * 42 + i * 8;
        drawLeaf(ctx, lx, ly, 9, burstColors[i], timeSec * 2 + i);
      }
    }
    ctx.restore();
  }
  function drawStickerIcon(ctx, stickerId, cx, cy, size) {
    const s = safeR(size * 0.44);
    ctx.save();
    switch (stickerId) {
      case "jesus_love":
        drawHeart(ctx, cx, cy, s, "#D46A43");
        drawCross(ctx, cx, cy - s * 0.05, s * 0.45, "#FFF8EB");
        break;
      case "bible":
        drawRoundedRect(ctx, cx - s, cy - s * 0.85, s * 2, s * 1.7, s * 0.25);
        ctx.fillStyle = "#8E5A3C";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = PALETTE.ink;
        ctx.stroke();
        drawCross(ctx, cx, cy, s * 0.52, PALETTE.sunGold);
        break;
      case "family":
        ctx.fillStyle = "#D46A43";
        ctx.strokeStyle = PALETTE.ink;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        safeArc(ctx, cx - s * 0.45, cy - s * 0.35, s * 0.32, 0, Math.PI * 2);
        safeArc(ctx, cx + s * 0.45, cy - s * 0.35, s * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#F6C453";
        ctx.beginPath();
        safeArc(ctx, cx, cy + s * 0.1, s * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      case "church":
        ctx.fillStyle = "#FFFDF7";
        ctx.strokeStyle = PALETTE.ink;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(cx, cy - s * 0.9);
        ctx.lineTo(cx + s * 0.95, cy - s * 0.1);
        ctx.lineTo(cx + s * 0.95, cy + s * 0.85);
        ctx.lineTo(cx - s * 0.95, cy + s * 0.85);
        ctx.lineTo(cx - s * 0.95, cy - s * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        drawCross(ctx, cx, cy + s * 0.2, s * 0.42, "#D46A43");
        break;
      case "food":
        drawBarleyLoaf(ctx, cx, cy - s * 0.25, s / 16);
        drawFish(ctx, cx, cy + s * 0.45, s / 17);
        break;
      case "healing":
        drawCross(ctx, cx, cy, s * 0.9, "#6F9463");
        break;
      case "creation":
        drawLeaf(ctx, cx, cy, s * 0.95, "olive", -0.2);
        break;
      case "joy":
        drawStar(ctx, cx, cy, s * 0.95, PALETTE.sunGold);
        break;
    }
    ctx.restore();
  }
  function drawTileIcon(ctx, icon, cx, cy, size) {
    const s = safeR(size * 0.45);
    switch (icon) {
      case "bread":
        drawBarleyLoaf(ctx, cx, cy, s / 15);
        break;
      case "fish":
        drawFish(ctx, cx, cy, s / 16);
        break;
      case "heart":
        drawHeart(ctx, cx, cy, s, "#D46A43");
        break;
      case "cross":
        drawCross(ctx, cx, cy, s * 0.88, PALETTE.sunGold);
        break;
      case "sun":
        ctx.save();
        ctx.beginPath();
        safeArc(ctx, cx, cy, s * 0.72, 0, Math.PI * 2);
        ctx.fillStyle = PALETTE.sunGold;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = PALETTE.ink;
        ctx.stroke();
        ctx.restore();
        break;
      case "star":
        drawStar(ctx, cx, cy, s * 0.9, PALETTE.sunGold);
        break;
      case "scroll":
        drawRoundedRect(ctx, cx - s * 0.9, cy - s * 0.65, s * 1.8, s * 1.3, s * 0.25);
        ctx.fillStyle = "#FFF3D4";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = PALETTE.ink;
        ctx.stroke();
        break;
      case "hands":
        drawHeart(ctx, cx, cy, s * 0.85, "#F6C453");
        break;
    }
  }

  // thankful_jesus/ts/audio.ts
  var JourneyAudio = class {
    constructor() {
      this.ctx = null;
      this.muted = false;
    }
    unlock() {
      if (typeof window === "undefined") {
        return;
      }
      if (!this.ctx) {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (Ctor) {
          this.ctx = new Ctor();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {
        });
      }
    }
    setMuted(muted) {
      this.muted = muted;
    }
    play(event) {
      if (this.muted || !this.ctx || this.ctx.state !== "running") {
        return;
      }
      const now = this.ctx.currentTime;
      switch (event) {
        case "pray_blessing":
          this.tone(392, 392, 0.16, "sine", 0.13, now);
          this.tone(493.88, 493.88, 0.16, "sine", 0.13, now + 0.09);
          this.tone(587.33, 587.33, 0.2, "sine", 0.14, now + 0.18);
          this.tone(783.99, 783.99, 0.28, "sine", 0.15, now + 0.28);
          break;
        case "good_catch":
          this.tone(523.25, 659.25, 0.11, "sine", 0.15, now);
          break;
        case "blessing_token":
          this.tone(587.33, 659.25, 0.1, "triangle", 0.15, now);
          this.tone(880, 880, 0.16, "sine", 0.15, now + 0.08);
          break;
        case "gentle_bump":
          this.tone(240, 175, 0.12, "triangle", 0.1, now);
          break;
        case "turn_step":
          this.tone(440, 587.33, 0.09, "triangle", 0.14, now);
          break;
        case "tile_place":
          this.tone(523.25, 659.25, 0.11, "sine", 0.14, now);
          this.tone(783.99, 783.99, 0.13, "sine", 0.13, now + 0.07);
          break;
        case "tile_hint":
          this.tone(320, 280, 0.1, "sine", 0.09, now);
          break;
        case "stage_win":
          this.tone(523.25, 523.25, 0.11, "triangle", 0.15, now);
          this.tone(659.25, 659.25, 0.11, "triangle", 0.15, now + 0.1);
          this.tone(783.99, 783.99, 0.2, "triangle", 0.17, now + 0.2);
          break;
        case "prayer_hang":
          this.tone(587.33, 659.25, 0.14, "sine", 0.13, now);
          this.tone(880, 880, 0.2, "sine", 0.13, now + 0.09);
          break;
        case "journey_fanfare":
          this.tone(523.25, 523.25, 0.12, "triangle", 0.14, now);
          this.tone(659.25, 659.25, 0.12, "triangle", 0.14, now + 0.11);
          this.tone(783.99, 783.99, 0.15, "triangle", 0.15, now + 0.22);
          this.tone(1046.5, 1046.5, 0.34, "sine", 0.17, now + 0.34);
          break;
        case "jesus_chime":
          this.tone(523.25, 523.25, 0.14, "sine", 0.12, now);
          this.tone(659.25, 659.25, 0.14, "sine", 0.12, now + 0.08);
          this.tone(783.99, 783.99, 0.18, "sine", 0.13, now + 0.16);
          this.tone(1046.5, 1046.5, 0.26, "sine", 0.12, now + 0.24);
          break;
        case "tree_rustle":
          this.tone(698.46, 880, 0.1, "sine", 0.1, now);
          this.tone(880, 1046.5, 0.12, "sine", 0.09, now + 0.07);
          break;
        case "harp_0":
          this.tone(523.25, 523.25, 0.24, "triangle", 0.16, now);
          this.tone(1046.5, 1046.5, 0.14, "sine", 0.06, now);
          break;
        case "harp_1":
          this.tone(587.33, 587.33, 0.24, "triangle", 0.16, now);
          this.tone(1174.66, 1174.66, 0.14, "sine", 0.06, now);
          break;
        case "harp_2":
          this.tone(659.25, 659.25, 0.24, "triangle", 0.16, now);
          this.tone(1318.51, 1318.51, 0.14, "sine", 0.06, now);
          break;
        case "harp_3":
          this.tone(783.99, 783.99, 0.26, "triangle", 0.16, now);
          this.tone(1567.98, 1567.98, 0.14, "sine", 0.06, now);
          break;
      }
    }
    tone(freqStart, freqEnd, duration, type, volume, startTime) {
      if (!this.ctx) {
        return;
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, startTime);
      if (freqEnd !== freqStart) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), startTime + duration);
      }
      gain.gain.setValueAtTime(1e-3, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(1e-3, startTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
    }
  };

  // thankful_jesus/ts/i18n.ts
  var UI_TEXT = {
    gameTitle: {
      en: "Thankful Journey with Jesus",
      zh: "\u8DDF\u968F\u8036\u7A23\u7684\u611F\u6069\u4E4B\u65C5"
    },
    gameSubtitle: {
      en: "Church Thanksgiving Game for Ages 6-9",
      zh: "\u4E3B\u65E5\u5B66\u611F\u6069\u8282\u53CC\u8BED\u4E92\u52A8\u6E38\u620F"
    },
    backGames: {
      en: "Games",
      zh: "\u8FD4\u56DE\u6E38\u620F"
    },
    langEn: { en: "EN", zh: "EN" },
    langZh: { en: "ZH", zh: "\u4E2D\u6587" },
    langDual: { en: "Dual", zh: "\u53CC\u8BED" },
    sfxOn: {
      en: "Sound: On",
      zh: "\u58F0\u97F3:\u5F00"
    },
    sfxOff: {
      en: "Muted",
      zh: "\u9759\u97F3"
    },
    autoReadOn: {
      en: "Auto-Read: On",
      zh: "\u81EA\u52A8\u6717\u8BFB:\u5F00"
    },
    autoReadOff: {
      en: "Tap to Read",
      zh: "\u6717\u8BFB:\u624B\u52A8"
    },
    listenBtn: {
      en: "Listen",
      zh: "\u542C\u4E00\u542C\u6717\u8BFB"
    },
    listenVerseBtn: {
      en: "Read Bible Verse",
      zh: "\u6717\u8BFB\u5723\u7ECF\u91D1\u53E5"
    },
    listenPrayerBtn: {
      en: "Read Verse & Prayers",
      zh: "\u6717\u8BFB\u91D1\u53E5\u4E0E\u7977\u544A"
    },
    explorerLabel: {
      en: "Explorer (6-7)",
      zh: "\u5C0F\u5C0F\u63A2\u7D22\u5BB6 (6-7\u5C81)"
    },
    adventurerLabel: {
      en: "Adventurer (8-9)",
      zh: "\u5723\u7ECF\u5C0F\u52C7\u58EB (8-9\u5C81)"
    },
    soloLabel: {
      en: "1P Solo",
      zh: "1\u4EBA\u6E38\u73A9"
    },
    pass2Label: {
      en: "2P Pass",
      zh: "2\u4EBA\u8F6E\u6D41"
    },
    pass3Label: {
      en: "3P Pass",
      zh: "3\u4EBA\u8F6E\u6D41"
    },
    pass4Label: {
      en: "4P Pass",
      zh: "4\u4EBA\u8F6E\u6D41"
    },
    startJourney: {
      en: "Start Thankful Journey!",
      zh: "\u5F00\u59CB\u611F\u6069\u4E4B\u65C5\uFF01"
    },
    readyBtn: {
      en: "I'm Ready!",
      zh: "\u6211\u51C6\u5907\u597D\u5566\uFF01"
    },
    beginStageBtn: {
      en: "Play This Stage!",
      zh: "\u5F00\u59CB\u8FD9\u4E00\u5173\uFF01"
    },
    nextStageBtn: {
      en: "Next Stage!",
      zh: "\u4E0B\u4E00\u5173\uFF01"
    },
    goPrayerBtn: {
      en: "Make Thank-You Card!",
      zh: "\u5199\u7ED9\u8036\u7A23\u7684\u611F\u6069\u5361\uFF01"
    },
    friendPrefix: {
      en: "Friend",
      zh: "\u5C0F\u670B\u53CB"
    },
    passTitlePrefix: {
      en: "Pass the iPhone to",
      zh: "\u8BF7\u628A\u624B\u673A\u4F20\u7ED9"
    },
    s1PrayBtn: {
      en: "Give Thanks with Jesus!",
      zh: "\u4E0E\u8036\u7A23\u4E00\u8D77\u795D\u8C22\uFF01"
    },
    s1SlideHint: {
      en: "Slide the basket to share loaves & fish!",
      zh: "\u5DE6\u53F3\u6ED1\u52A8\u7F16\u7EC7\u7BEE\uFF0C\u5206\u997C\u5206\u9C7C\u5E76\u6536\u96C6\u91D1\u53E5\u7BEE\uFF01"
    },
    s1HudUnit: {
      en: "Shared",
      zh: "\u4EFD\u5206\u4EAB"
    },
    s2TurnPrompt: {
      en: "Crossroads! Tap fast to run back to Jesus!",
      zh: "\u5230\u5C94\u8DEF\u53E3\u5566\uFF01\u5FEB\u70B9\u6309\u94AE\u8F6C\u8EAB\u8DD1\u56DE\u8036\u7A23\u8EAB\u8FB9\uFF01"
    },
    s2TurnBtn: {
      en: "Turn Back to Thank Jesus!",
      zh: "\u8F6C\u8EAB\u8DD1\u56DE\u8C22\u8C22\u8036\u7A23\uFF01"
    },
    s2LaneLeft: {
      en: "Left",
      zh: "\u5DE6\u8DEF"
    },
    s2LaneMid: {
      en: "Middle",
      zh: "\u4E2D\u8DEF"
    },
    s2LaneRight: {
      en: "Right",
      zh: "\u53F3\u8DEF"
    },
    s2HudRoad: {
      en: "Sparkles",
      zh: "\u6069\u5178\u5149\u70B9"
    },
    s2HudTurn: {
      en: "Run to Jesus",
      zh: "\u56DE\u5230\u8036\u7A23\u811A\u524D"
    },
    s3Hint: {
      en: "Tap tiles in order to build the verse (tapping reads aloud!)",
      zh: "\u6309\u987A\u5E8F\u8F7B\u70B9\u8BCD\u5757\u62FC\u51FA\u7ECF\u6587\uFF08\u70B9\u51FB\u53EF\u542C\u8BFB\u97F3\uFF09"
    },
    s3QuizKicker: {
      en: "Bible Story Question",
      zh: "\u5723\u7ECF\u5C0F\u601D\u8003"
    },
    s3QuizRetry: {
      en: "Good try! Think about the Gospel story and try again!",
      zh: "\u518D\u60F3\u60F3\u770B\uFF0C\u4F60\u53EF\u4EE5\u7684\uFF01"
    },
    s3QuizCorrect: {
      en: "Awesome answer!",
      zh: "\u7B54\u5BF9\u5566\uFF01\u771F\u68D2\uFF01"
    },
    stageCompletePrefix: {
      en: "Wonderful! Verse Unlocked:",
      zh: "\u592A\u68D2\u5566\uFF01\u89E3\u9501\u7ECF\u6587\uFF1A"
    },
    starsEarned: {
      en: "Stars",
      zh: "\u83B7\u5F97\u661F\u661F"
    },
    prayerHeader: {
      en: "Hang a Thankful Prayer Leaf beside Jesus",
      zh: "\u628A\u611F\u6069\u53F6\u5B50\u6302\u5728\u8036\u7A23\u65C1\u7684\u6811\u4E0A"
    },
    prayerNamePh: {
      en: "Name (optional)",
      zh: "\u540D\u5B57\uFF08\u53EF\u9009\uFF09"
    },
    prayerNotePh: {
      en: "Or type your own thank-you prayer to Jesus...",
      zh: "\u6216\u5199\u4E00\u53E5\u7ED9\u8036\u7A23\u7684\u611F\u6069\u7977\u544A..."
    },
    hangPrayerBtn: {
      en: "Hang Prayer Leaf!",
      zh: "\u6302\u4E0A\u611F\u6069\u7977\u544A\uFF01"
    },
    finishJourneyBtn: {
      en: "Celebrate & View Keepsake!",
      zh: "\u5B8C\u6210\u65C5\u7A0B\uFF0C\u770B\u7EAA\u5FF5\u5361\uFF01"
    },
    finaleKicker: {
      en: "Church & Table Sharing Prompt",
      zh: "\u6559\u4F1A / \u9910\u684C\u611F\u6069\u5206\u4EAB\u63D0\u95EE"
    },
    newPromptBtn: {
      en: "New Question",
      zh: "\u6362\u4E00\u4E2A\u5206\u4EAB\u63D0\u95EE"
    },
    saveCardBtn: {
      en: "Save / Share Bilingual Card PNG",
      zh: "\u4FDD\u5B58/\u5206\u4EAB\u53CC\u8BED\u611F\u6069\u7EAA\u5FF5\u5361 PNG"
    },
    playAgainBtn: {
      en: "Play Again!",
      zh: "\u518D\u73A9\u4E00\u6B21\uFF01"
    },
    modalClose: {
      en: "Close",
      zh: "\u5173\u95ED"
    },
    modalShare: {
      en: "Share / Save PNG",
      zh: "\u5206\u4EAB / \u4FDD\u5B58\u56FE\u7247"
    },
    modalTipIos: {
      en: "Tip: On iPhone, press and hold the image to Save to Photos.",
      zh: "\u63D0\u793A\uFF1A\u5728 iPhone \u4E0A\u4E5F\u53EF\u957F\u6309\u56FE\u7247\u9009\u62E9\u4FDD\u5B58\u5230\u76F8\u518C\u3002"
    },
    modalShared: {
      en: "Opened native Share Sheet!",
      zh: "\u5DF2\u6253\u5F00\u7CFB\u7EDF\u5206\u4EAB\u9762\u677F\uFF01"
    },
    modalDownloaded: {
      en: "Downloaded your bilingual Thank-You Card PNG!",
      zh: "\u5DF2\u4E0B\u8F7D\u53CC\u8BED\u611F\u6069\u7EAA\u5FF5\u5361 PNG\uFF01"
    },
    pcTitle: {
      en: "Happy Thanksgiving!",
      zh: "\u611F\u6069\u8282\u5FEB\u4E50\uFF01"
    },
    pcSubtitle: {
      en: "Thankful Journey with Jesus",
      zh: "\u8DDF\u968F\u8036\u7A23\u7684\u611F\u6069\u4E4B\u65C5"
    },
    pcPrayerSection: {
      en: "Our Thank-You Prayers to Jesus",
      zh: "\u6211\u4EEC\u732E\u7ED9\u8036\u7A23\u7684\u611F\u6069\u7977\u544A"
    },
    pcFooter: {
      en: "Give thanks in Christ Jesus - games-for-kids",
      zh: "\u5728\u57FA\u7763\u8036\u7A23\u91CC\u51E1\u4E8B\u8C22\u6069"
    },
    s1TapPrayCanvas: {
      en: "Tap below to give thanks with Jesus!",
      zh: "\u70B9\u51FB\u4E0B\u65B9\uFF0C\u5148\u4E0E\u8036\u7A23\u4E00\u8D77\u795D\u8C22\uFF01"
    },
    popAmen: {
      en: "Amen! Thank You!",
      zh: "\u963F\u4EEC\uFF01\u795D\u8C22\uFF01"
    },
    popShared: {
      en: "+1 Shared!",
      zh: "+1 \u5206\u4EAB\u7ED9\u670B\u53CB\uFF01"
    },
    popBlessing: {
      en: "+1 Blessing Basket!",
      zh: "+1 \u5341\u4E8C\u7BEE\u6069\u5178\uFF01"
    },
    popGrace: {
      en: "+1 Grace Sparkle!",
      zh: "+1 \u6069\u5178\u5149\u70B9\uFF01"
    },
    popOops: {
      en: "Stay focused!",
      zh: "\u5C0F\u5FC3\u522B\u5206\u5FC3\u54E6\uFF01"
    },
    popTurnBack: {
      en: "Run back to Jesus!",
      zh: "\u8F6C\u8EAB\u8DD1\u5411\u8036\u7A23\uFF01"
    },
    popThankJesus: {
      en: "Thank You Jesus!",
      zh: "\u8C22\u8C22\u8036\u7A23\uFF01"
    },
    easterHint: {
      en: "Tip: Tap Jesus or the Olive Tree!",
      zh: "\u5C0F\u5F69\u86CB\uFF1A\u70B9\u4E00\u70B9\u753B\u9762\u91CC\u7684\u8036\u7A23\u6216\u6A44\u6984\u6811\uFF01"
    },
    readTreeBtn: {
      en: "Read All Tree Prayers",
      zh: "\u6717\u8BFB\u611F\u6069\u6811\u4E0A\u7684\u7977\u544A"
    },
    sHarpHint: {
      en: "Tap each harp string when notes enter the golden glow!",
      zh: "\u97F3\u7B26\u843D\u8FDB\u53D1\u5149\u533A\u65F6\u8F7B\u70B9\u5BF9\u5E94\u7434\u5F26\uFF08\u7434\u5F26\u53EF\u81EA\u7531\u5F39\u54CD\u54E6\uFF01\uFF09"
    },
    sHarpHudUnit: {
      en: "Praise Notes",
      zh: "\u4E32\u97F3\u7B26"
    },
    popPraise: {
      en: "+1 Praise Song!",
      zh: "+1 \u8D5E\u7F8E\u4E4B\u6B4C\uFF01"
    },
    popHarmony: {
      en: "+1 Joyful Harmony!",
      zh: "+1 \u548C\u8C10\u611F\u6069\uFF01"
    },
    explorerDesc: {
      en: "Relaxed: Dove Helper rescues misses, glowing harp keys, verse hints, no timer!",
      zh: "\u8F7B\u677E\u6A21\u5F0F\uFF1A\u767D\u9E3D\u5E2E\u624B\u81EA\u52A8\u6551\u63F4\u3001\u7AD6\u7434\u7434\u5F26\u4EAE\u706F\u5F15\u5BFC\u3001\u7ECF\u6587\u9AD8\u4EAE\u63D0\u793A\u3001\u65E0\u5012\u8BA1\u65F6\uFF01"
    },
    adventurerDesc: {
      en: "Challenge: Countdown bar, Galilee wind & 2-lane dodges, double-beat harp, decoy word + 3 Bible quizzes!",
      zh: "\u6311\u6218\u6A21\u5F0F\uFF1A\u9876\u90E8\u5012\u8BA1\u65F6\u6761\u3001\u52A0\u5229\u5229\u6D77\u98CE\u4E0E\u53CC\u9053\u969C\u788D\u3001\u5FEB\u62CD\u53CC\u8FDE\u97F3\u7AD6\u7434\u3001\u5E72\u6270\u8BCD\u5757 + 3\u9053\u5723\u7ECF\u95EE\u7B54\uFF01"
    },
    popDoveHelp: {
      en: "Dove Helped!",
      zh: "\u767D\u9E3D\u5E2E\u624B\u63A5\u4F4F\u5566\uFF01"
    },
    popWindGust: {
      en: "Wind Gust! Dodge!",
      zh: "\u6D77\u98CE\u5439\u6765\u843D\u53F6\uFF0C\u5FEB\u8EB2\u5F00\uFF01"
    },
    s3DecoyHint: {
      en: "Oops! That's an extra decoy word!",
      zh: "\u54CE\u5440\uFF0C\u8FD9\u662F\u591A\u51FA\u6765\u7684\u5E72\u6270\u8BCD\u5757\u54E6\uFF01"
    }
  };
  var JESUS_EASTER_LINES = [
    {
      en: "Jesus loves you and watches over you every day!",
      zh: "\u8036\u7A23\u597D\u7231\u4F60\uFF0C\u5929\u5929\u770B\u987E\u4F60\uFF01"
    },
    {
      en: "Praise our Father with a joyful, thankful heart!",
      zh: "\u7528\u559C\u4E50\u611F\u6069\u7684\u5FC3\uFF0C\u8D5E\u7F8E\u5929\u7236\u5427\uFF01"
    },
    {
      en: "Give thanks in all things! Jesus is always with you!",
      zh: "\u51E1\u4E8B\u8C22\u6069\uFF0C\u8036\u7A23\u4E00\u76F4\u4E0E\u4F60\u540C\u5728\uFF01"
    },
    {
      en: "Jesus sees every loving gift you share!",
      zh: "\u4F60\u5206\u4EAB\u7684\u6BCF\u4E00\u4EFD\u7231\uFF0C\u8036\u7A23\u90FD\u770B\u89C1\u5566\uFF01"
    }
  ];
  var TREE_EASTER_LINES = [
    {
      en: "Rustling leaves! Count Jesus' wonderful blessings!",
      zh: "\u79CB\u53F6\u98D8\u5440\u98D8\uFF0C\u6570\u7B97\u8036\u7A23\u6EE1\u6EE1\u7684\u6069\u5178\uFF01"
    },
    {
      en: "Look! Our Gratitude Olive Tree is shining bright!",
      zh: "\u54C7\uFF01\u611F\u6069\u6811\u53C8\u95EA\u95EA\u53D1\u5149\u5566\uFF01"
    },
    {
      en: "Thank You God for blue skies, Galilee water, and olive trees!",
      zh: "\u8C22\u8C22\u795E\u521B\u9020\u84DD\u5929\u3001\u6E56\u6C34\u548C\u6A44\u6984\u6811\uFF01"
    }
  ];
  var FRIEND_EASTER_LINES = [
    {
      en: "Yay! Let's run and say thank you to Jesus together!",
      zh: "\u8036\uFF01\u4E00\u8D77\u53BB\u5411\u8036\u7A23\u8BF4\u8C22\u8C22\uFF01"
    },
    {
      en: "Hallelujah! What a joyful Thanksgiving Day!",
      zh: "\u54C8\u5229\u8DEF\u4E9A\uFF01\u4ECA\u5929\u771F\u662F\u611F\u6069\u7684\u4E00\u5929\uFF01"
    }
  ];
  function getEasterLine(source, index) {
    if (source === "jesus") {
      return JESUS_EASTER_LINES[index % JESUS_EASTER_LINES.length];
    }
    if (source === "tree") {
      return TREE_EASTER_LINES[index % TREE_EASTER_LINES.length];
    }
    if (source === "friend") {
      return FRIEND_EASTER_LINES[index % FRIEND_EASTER_LINES.length];
    }
    return null;
  }
  var STAGE_TEXT = {
    loaves_and_fish: {
      title: {
        en: "Loaves & Fish Feast",
        zh: "\u4E94\u997C\u4E8C\u9C7C\uFF1A\u5148\u5411\u8036\u7A23\u795D\u8C22"
      },
      shortTitle: {
        en: "Loaves & Fish",
        zh: "\u4E94\u997C\u4E8C\u9C7C"
      },
      story: {
        en: "By the Sea of Galilee, a boy offers five loaves and two fish. Tap to give thanks with Jesus, then slide your basket to share with everyone!",
        zh: "\u5728\u52A0\u5229\u5229\u6E56\u8FB9\uFF0C\u5C0F\u7537\u5B69\u732E\u51FA\u4E94\u4E2A\u997C\u548C\u4E24\u6761\u9C7C\u3002\u6211\u4EEC\u5148\u548C\u8036\u7A23\u4E00\u8D77\u795D\u8C22\uFF0C\u518D\u628A\u6EE1\u6EE1\u7684\u6069\u5178\u5206\u7ED9\u5927\u5BB6\uFF01"
      }
    },
    run_back_to_jesus: {
      title: {
        en: "Run Back to Thank Jesus",
        zh: "\u8F6C\u8EAB\u8DD1\u56DE\u8C22\u8C22\u8036\u7A23"
      },
      shortTitle: {
        en: "Run Back",
        zh: "\u56DE\u5934\u611F\u6069"
      },
      story: {
        en: "Jesus healed ten men, and one paused to run back and thank Him! Dodge busy distractions, then turn back at the crossroads to praise Jesus!",
        zh: "\u8036\u7A23\u533B\u6CBB\u4E86\u5341\u4E2A\u4EBA\uFF0C\u53EA\u6709\u4E00\u4E2A\u4EBA\u505C\u4E0B\u811A\u6B65\u8DD1\u56DE\u8036\u7A23\u811A\u524D\u8BF4\u8C22\u8C22\uFF01\u907F\u5F00\u5206\u5FC3\u6742\u7269\uFF0C\u5230\u5C94\u8DEF\u53E3\u5FEB\u8F6C\u8EAB\u8C22\u8C22\u8036\u7A23\uFF01"
      }
    },
    david_harp: {
      title: {
        en: "David's Thankful Harp",
        zh: "\u5927\u536B\u7684\u611F\u6069\u7AD6\u7434"
      },
      shortTitle: {
        en: "Thankful Harp",
        zh: "\u611F\u6069\u7AD6\u7434"
      },
      story: {
        en: "David loved playing his harp to thank and praise God! Tap the glowing harp strings as golden notes float down to play a joyful song for Jesus!",
        zh: "\u5927\u536B\u7231\u5F39\u594F\u7AD6\u7434\u5411\u795E\u732E\u4E0A\u611F\u6069\u548C\u8D5E\u7F8E\uFF01\u5F53\u91D1\u8272\u97F3\u7B26\u98D8\u8FDB\u53D1\u5149\u533A\u65F6\uFF0C\u8F7B\u70B9\u5BF9\u5E94\u7684\u7434\u5F26\uFF0C\u594F\u54CD\u7ED9\u8036\u7A23\u7684\u611F\u6069\u4E4B\u6B4C\uFF01"
      }
    },
    verse_builder: {
      title: {
        en: "Thankful Verse Builder",
        zh: "\u611F\u6069\u91D1\u53E5\u5B9D\u85CF\u62FC\u62FC\u4E50"
      },
      shortTitle: {
        en: "Verse Builder",
        zh: "\u62FC\u51FA\u91D1\u53E5"
      },
      story: {
        en: "Open the blessing scroll and tap the Bible verse tiles in order! Every tile reads aloud when you tap it.",
        zh: "\u628A\u6536\u96C6\u5230\u7684\u5723\u7ECF\u8BCD\u5757\u6309\u987A\u5E8F\u62FC\u6210\u611F\u6069\u91D1\u53E5\uFF01\u70B9\u51FB\u4EFB\u610F\u8BCD\u5757\u90FD\u53EF\u4EE5\u542C\u6717\u8BFB\u54E6\uFF01"
      }
    }
  };
  var STICKER_PRESETS = [
    {
      id: "jesus_love",
      label: { en: "Jesus' Love", zh: "\u8036\u7A23\u7684\u7231" },
      caption: {
        en: "Thank You Jesus for loving me!",
        zh: "\u8C22\u8C22\u8036\u7A23\u8FD9\u4E48\u7231\u6211\uFF01"
      },
      accent: "#D46A43"
    },
    {
      id: "bible",
      label: { en: "Bible", zh: "\u5723\u7ECF\u8BDD\u8BED" },
      caption: {
        en: "Thank You God for the Bible!",
        zh: "\u8C22\u8C22\u795E\u8D50\u7ED9\u6211\u4EEC\u5723\u7ECF\uFF01"
      },
      accent: "#8E5A3C"
    },
    {
      id: "family",
      label: { en: "Family", zh: "\u6211\u7684\u5BB6\u4EBA" },
      caption: {
        en: "Thank You Jesus for my family!",
        zh: "\u8C22\u8C22\u8036\u7A23\u8D50\u7ED9\u6211\u6E29\u6696\u7684\u5BB6\u4EBA\uFF01"
      },
      accent: "#C64B3B"
    },
    {
      id: "church",
      label: { en: "Church", zh: "\u6559\u4F1A\u670B\u53CB" },
      caption: {
        en: "Thank You for our church friends!",
        zh: "\u8C22\u8C22\u4E3B\u65E5\u5B66\u8001\u5E08\u548C\u6559\u4F1A\u597D\u670B\u53CB\uFF01"
      },
      accent: "#5A95B8"
    },
    {
      id: "food",
      label: { en: "Food", zh: "\u6BCF\u65E5\u996E\u98DF" },
      caption: {
        en: "Thank You Jesus for our daily food!",
        zh: "\u8C22\u8C22\u8036\u7A23\u8D50\u7ED9\u6211\u4EEC\u7F8E\u5473\u7684\u98DF\u7269\uFF01"
      },
      accent: "#E5A93B"
    },
    {
      id: "healing",
      label: { en: "Care", zh: "\u770B\u987E\u533B\u6CBB" },
      caption: {
        en: "Thank You Jesus for helping and healing us!",
        zh: "\u8C22\u8C22\u8036\u7A23\u770B\u987E\u5E76\u533B\u6CBB\u6211\u4EEC\uFF01"
      },
      accent: "#6F9463"
    },
    {
      id: "creation",
      label: { en: "World", zh: "\u5947\u5999\u4E16\u754C" },
      caption: {
        en: "Thank You God for Your wonderful world!",
        zh: "\u8C22\u8C22\u795E\u521B\u9020\u7F8E\u4E3D\u7684\u79CB\u53F6\u4E0E\u4E16\u754C\uFF01"
      },
      accent: "#5D8A5A"
    },
    {
      id: "joy",
      label: { en: "Joy", zh: "\u559C\u4E50\u7684\u5FC3" },
      caption: {
        en: "Thank You Jesus for filling my heart with joy!",
        zh: "\u8C22\u8C22\u8036\u7A23\u8BA9\u6211\u5FC3\u91CC\u5145\u6EE1\u559C\u4E50\uFF01"
      },
      accent: "#D98A2B"
    }
  ];
  var CHURCH_PROMPTS = [
    {
      en: "Turn to a friend or parent and share one way Jesus helped or blessed you this week!",
      zh: "\u8F6C\u5411\u8EAB\u8FB9\u4E00\u4F4D\u670B\u53CB\u6216\u5BB6\u4EBA\uFF0C\u5206\u4EAB\u4E00\u4EF6\u8FD9\u5468\u8036\u7A23\u5E2E\u52A9\u4F60\u6216\u795D\u798F\u4F60\u7684\u4E8B\uFF01"
    },
    {
      en: "If you were by the Sea of Galilee today, what gift would you love to share with Jesus?",
      zh: "\u5982\u679C\u4ECA\u5929\u4F60\u5728\u52A0\u5229\u5229\u6E56\u8FB9\uFF0C\u4F60\u6700\u60F3\u628A\u4EC0\u4E48\u793C\u7269\u732E\u7ED9\u8036\u7A23\uFF1F"
    },
    {
      en: "Say 1 Thessalonians 5:18 together out loud: Give thanks in all circumstances!",
      zh: "\u5927\u58F0\u4E00\u8D77\u80CC\u4E00\u904D\uFF1A\u51E1\u4E8B\u8C22\u6069\uFF0C\u56E0\u4E3A\u8FD9\u662F\u795E\u5728\u57FA\u7763\u8036\u7A23\u91CC\u5411\u4F60\u4EEC\u6240\u5B9A\u7684\u65E8\u610F\uFF01"
    },
    {
      en: "Just like the thankful man in Luke 17, who is one person you can run over and thank today?",
      zh: "\u60F3\u60F3\u90A3\u4F4D\u56DE\u5934\u8C22\u8C22\u8036\u7A23\u7684\u65C5\u4EBA\uFF0C\u4ECA\u5929\u4F60\u60F3\u4E3B\u52A8\u5411\u8C01\u8BF4\u4E00\u58F0\u8C22\u8C22\uFF1F"
    },
    {
      en: "Say a short one-sentence prayer thanking Jesus for food, church, and kind friends!",
      zh: "\u7528\u4E00\u53E5\u7B80\u77ED\u7684\u7977\u544A\uFF0C\u8C22\u8C22\u8036\u7A23\u4ECA\u5929\u8D50\u7ED9\u6211\u4EEC\u7F8E\u98DF\u3001\u6559\u4F1A\u548C\u597D\u670B\u53CB\uFF01"
    },
    {
      en: "Which story about Jesus was your favorite today, and why?",
      zh: "\u4ECA\u5929\u4E09\u5173\u91CC\uFF0C\u4F60\u6700\u559C\u6B22\u54EA\u4E00\u4E2A\u5173\u4E8E\u8036\u7A23\u7684\u6545\u4E8B\uFF1F\u4E3A\u4EC0\u4E48\uFF1F"
    }
  ];
  function formatLocalized(text, langMode, separator = " / ") {
    if (langMode === "en") {
      return text.en;
    }
    if (langMode === "zh") {
      return text.zh;
    }
    return text.en + separator + text.zh;
  }
  function formatPrimary(text, langMode) {
    return langMode === "zh" ? text.zh : text.en;
  }
  function formatSecondary(text, langMode) {
    return langMode === "dual" ? text.zh : null;
  }

  // thankful_jesus/ts/gratitude.ts
  function getStickerPreset(id) {
    for (let i = 0; i < STICKER_PRESETS.length; i++) {
      if (STICKER_PRESETS[i].id === id) {
        return STICKER_PRESETS[i];
      }
    }
    return STICKER_PRESETS[0];
  }
  function sanitizeNote(raw, fallback) {
    const collapsed = raw.replace(/\s+/g, " ").trim();
    if (!collapsed) {
      return fallback;
    }
    const chars = Array.from(collapsed);
    if (chars.length <= MAX_CUSTOM_NOTE_LEN) {
      return collapsed;
    }
    return chars.slice(0, MAX_CUSTOM_NOTE_LEN).join("").trim();
  }
  function createPrayerLeaf(existingCount, stickerId, leafColor, customMessage, authorLabel, langMode) {
    if (existingCount >= MAX_PRAYERS) {
      return null;
    }
    const preset = getStickerPreset(stickerId);
    const defaultMsg = formatLocalized(preset.caption, langMode, " / ");
    const message = sanitizeNote(customMessage, defaultMsg);
    const defaultAuthor = formatPrimary(UI_TEXT.friendPrefix, langMode) + " " + String(existingCount + 1);
    const cleanAuthor = sanitizeNote(authorLabel, defaultAuthor);
    return {
      id: "prayer_" + String(existingCount + 1),
      authorLabel: cleanAuthor,
      stickerId,
      message,
      leafColor,
      treeSlot: existingCount % TREE_LEAF_SLOTS.length
    };
  }
  function getChurchPrompt(index) {
    if (CHURCH_PROMPTS.length === 0) {
      return { en: "Say thank you to Jesus today!", zh: "\u4ECA\u5929\u5411\u8036\u7A23\u8BF4\u4E00\u58F0\u8C22\u8C22\uFF01" };
    }
    const safe = (index % CHURCH_PROMPTS.length + CHURCH_PROMPTS.length) % CHURCH_PROMPTS.length;
    return CHURCH_PROMPTS[safe];
  }

  // thankful_jesus/ts/verses.ts
  var VERSE_ORDER = [
    "john_6_11",
    "luke_17_15_16",
    "psalm_100_4",
    "psalm_107_1",
    "thess_5_18"
  ];
  var VERSES = {
    john_6_11: {
      id: "john_6_11",
      reference: {
        en: "John 6:11 (NIV)",
        zh: "\u7EA6\u7FF0\u798F\u97F3 6:11"
      },
      text: {
        en: "Jesus then took the loaves, gave thanks, and distributed to those who were seated as much as they wanted.",
        zh: "\u8036\u7A23\u62FF\u8D77\u997C\u6765\uFF0C\u795D\u8C22\u4E86\uFF0C\u5C31\u5206\u7ED9\u90A3\u5750\u7740\u7684\u4EBA\uFF1B\u5206\u9C7C\u4E5F\u662F\u8FD9\u6837\uFF0C\u90FD\u968F\u7740\u4ED6\u4EEC\u6240\u8981\u7684\u3002"
      },
      explorerTiles: [
        { id: "j1", icon: "bread", text: { en: "Jesus took the loaves,", zh: "\u8036\u7A23\u62FF\u8D77\u997C\u6765\uFF0C" } },
        { id: "j2", icon: "hands", text: { en: "gave thanks,", zh: "\u795D\u8C22\u4E86\uFF0C" } },
        { id: "j3", icon: "fish", text: { en: "and shared with everyone", zh: "\u5C31\u5206\u7ED9\u90A3\u5750\u7740\u7684\u4EBA" } },
        { id: "j4", icon: "heart", text: { en: "as much as they wanted.", zh: "\u90FD\u968F\u7740\u4ED6\u4EEC\u6240\u8981\u7684\u3002" } }
      ],
      adventurerTiles: [
        { id: "j1", icon: "bread", text: { en: "Jesus took the loaves,", zh: "\u8036\u7A23\u62FF\u8D77\u997C\u6765\uFF0C" } },
        { id: "j2", icon: "hands", text: { en: "gave thanks,", zh: "\u795D\u8C22\u4E86\uFF0C" } },
        { id: "j3", icon: "fish", text: { en: "and shared with everyone", zh: "\u5C31\u5206\u7ED9\u90A3\u5750\u7740\u7684\u4EBA" } },
        { id: "j4", icon: "heart", text: { en: "as much as they wanted.", zh: "\u90FD\u968F\u7740\u4ED6\u4EEC\u6240\u8981\u7684\u3002" } }
      ]
    },
    luke_17_15_16: {
      id: "luke_17_15_16",
      reference: {
        en: "Luke 17:15-16 (NIV)",
        zh: "\u8DEF\u52A0\u798F\u97F3 17:15-16"
      },
      text: {
        en: "One of them, when he saw he was healed, came back, praising God in a loud voice. He threw himself at Jesus' feet and thanked him.",
        zh: "\u5185\u4E2D\u6709\u4E00\u4E2A\u89C1\u81EA\u5DF1\u5DF2\u7ECF\u597D\u4E86\uFF0C\u5C31\u56DE\u6765\u5927\u58F0\u5F52\u8363\u8000\u4E0E\u795E\uFF0C\u53C8\u4FEF\u4F0F\u5728\u8036\u7A23\u811A\u524D\u611F\u8C22\u4ED6\u3002"
      },
      explorerTiles: [
        { id: "l1", icon: "star", text: { en: "One saw he was healed,", zh: "\u5185\u4E2D\u6709\u4E00\u4E2A\u89C1\u81EA\u5DF1\u597D\u4E86\uFF0C" } },
        { id: "l2", icon: "sun", text: { en: "came back praising God,", zh: "\u5C31\u56DE\u6765\u5927\u58F0\u5F52\u8363\u8000\u4E0E\u795E\uFF0C" } },
        { id: "l3", icon: "cross", text: { en: "fell at Jesus' feet", zh: "\u53C8\u4FEF\u4F0F\u5728\u8036\u7A23\u811A\u524D" } },
        { id: "l4", icon: "hands", text: { en: "and thanked him.", zh: "\u611F\u8C22\u4ED6\u3002" } }
      ],
      adventurerTiles: [
        { id: "l1", icon: "star", text: { en: "One saw he was healed,", zh: "\u5185\u4E2D\u6709\u4E00\u4E2A\u89C1\u81EA\u5DF1\u597D\u4E86\uFF0C" } },
        { id: "l2", icon: "sun", text: { en: "came back praising God,", zh: "\u5C31\u56DE\u6765\u5927\u58F0\u5F52\u8363\u8000\u4E0E\u795E\uFF0C" } },
        { id: "l3", icon: "cross", text: { en: "fell at Jesus' feet", zh: "\u53C8\u4FEF\u4F0F\u5728\u8036\u7A23\u811A\u524D" } },
        { id: "l4", icon: "hands", text: { en: "and thanked him.", zh: "\u611F\u8C22\u4ED6\u3002" } }
      ]
    },
    psalm_100_4: {
      id: "psalm_100_4",
      reference: {
        en: "Psalm 100:4 (NIV)",
        zh: "\u8BD7\u7BC7 100:4"
      },
      text: {
        en: "Enter his gates with thanksgiving and his courts with praise; give thanks to him and praise his name.",
        zh: "\u5F53\u79F0\u8C22\u8FDB\u5165\u4ED6\u7684\u95E8\uFF0C\u5F53\u8D5E\u7F8E\u8FDB\u5165\u4ED6\u7684\u9662\uFF1B\u5F53\u611F\u8C22\u4ED6\uFF0C\u79F0\u9882\u4ED6\u7684\u540D\uFF01"
      },
      explorerTiles: [
        { id: "h1", icon: "hands", text: { en: "Enter his gates with thanksgiving", zh: "\u5F53\u79F0\u8C22\u8FDB\u5165\u4ED6\u7684\u95E8\uFF0C" } },
        { id: "h2", icon: "sun", text: { en: "and his courts with praise;", zh: "\u5F53\u8D5E\u7F8E\u8FDB\u5165\u4ED6\u7684\u9662\uFF1B" } },
        { id: "h3", icon: "heart", text: { en: "give thanks to him", zh: "\u5F53\u611F\u8C22\u4ED6\uFF0C" } },
        { id: "h4", icon: "star", text: { en: "and praise his name.", zh: "\u79F0\u9882\u4ED6\u7684\u540D\uFF01" } }
      ],
      adventurerTiles: [
        { id: "h1", icon: "hands", text: { en: "Enter his gates with thanksgiving", zh: "\u5F53\u79F0\u8C22\u8FDB\u5165\u4ED6\u7684\u95E8\uFF0C" } },
        { id: "h2", icon: "sun", text: { en: "and his courts with praise;", zh: "\u5F53\u8D5E\u7F8E\u8FDB\u5165\u4ED6\u7684\u9662\uFF1B" } },
        { id: "h3", icon: "heart", text: { en: "give thanks to him", zh: "\u5F53\u611F\u8C22\u4ED6\uFF0C" } },
        { id: "h4", icon: "star", text: { en: "and praise his name.", zh: "\u79F0\u9882\u4ED6\u7684\u540D\uFF01" } }
      ]
    },
    psalm_107_1: {
      id: "psalm_107_1",
      reference: {
        en: "Psalm 107:1 (NIV)",
        zh: "\u8BD7\u7BC7 107:1"
      },
      text: {
        en: "Give thanks to the LORD, for he is good; his love endures forever.",
        zh: "\u4F60\u4EEC\u8981\u79F0\u8C22\u8036\u548C\u534E\uFF0C\u56E0\u4ED6\u672C\u4E3A\u5584\uFF0C\u4ED6\u7684\u6148\u7231\u6C38\u8FDC\u957F\u5B58\uFF01"
      },
      explorerTiles: [
        { id: "p1", icon: "hands", text: { en: "Give thanks to the LORD,", zh: "\u4F60\u4EEC\u8981\u79F0\u8C22\u8036\u548C\u534E\uFF0C" } },
        { id: "p2", icon: "sun", text: { en: "for he is good;", zh: "\u56E0\u4ED6\u672C\u4E3A\u5584\uFF0C" } },
        { id: "p3", icon: "heart", text: { en: "his love", zh: "\u4ED6\u7684\u6148\u7231" } },
        { id: "p4", icon: "star", text: { en: "endures forever.", zh: "\u6C38\u8FDC\u957F\u5B58\uFF01" } }
      ],
      adventurerTiles: [
        { id: "pa1", icon: "hands", text: { en: "Give thanks", zh: "\u4F60\u4EEC\u8981" } },
        { id: "pa2", icon: "cross", text: { en: "to the LORD,", zh: "\u79F0\u8C22\u8036\u548C\u534E\uFF0C" } },
        { id: "pa3", icon: "sun", text: { en: "for he is good;", zh: "\u56E0\u4ED6\u672C\u4E3A\u5584\uFF0C" } },
        { id: "pa4", icon: "heart", text: { en: "his love", zh: "\u4ED6\u7684\u6148\u7231" } },
        { id: "pa5", icon: "scroll", text: { en: "endures", zh: "\u6C38\u8FDC" } },
        { id: "pa6", icon: "star", text: { en: "forever.", zh: "\u957F\u5B58\uFF01" } }
      ],
      adventurerDecoy: {
        id: "pa_decoy",
        icon: "sun",
        text: { en: "tall mountains", zh: "\u9AD8\u9AD8\u5C71\u4E18" }
      }
    },
    thess_5_18: {
      id: "thess_5_18",
      reference: {
        en: "1 Thessalonians 5:18 (NIV)",
        zh: "\u5E16\u6492\u7F57\u5C3C\u8FE6\u524D\u4E66 5:18"
      },
      text: {
        en: "Give thanks in all circumstances; for this is God's will for you in Christ Jesus.",
        zh: "\u51E1\u4E8B\u8C22\u6069\uFF0C\u56E0\u4E3A\u8FD9\u662F\u795E\u5728\u57FA\u7763\u8036\u7A23\u91CC\u5411\u4F60\u4EEC\u6240\u5B9A\u7684\u65E8\u610F\u3002"
      },
      explorerTiles: [
        { id: "t1", icon: "hands", text: { en: "Give thanks in all circumstances;", zh: "\u51E1\u4E8B\u8C22\u6069\uFF0C" } },
        { id: "t2", icon: "scroll", text: { en: "for this is God's will", zh: "\u56E0\u4E3A\u8FD9\u662F\u795E" } },
        { id: "t3", icon: "cross", text: { en: "in Christ Jesus", zh: "\u5728\u57FA\u7763\u8036\u7A23\u91CC" } },
        { id: "t4", icon: "heart", text: { en: "for you.", zh: "\u5411\u4F60\u4EEC\u6240\u5B9A\u7684\u65E8\u610F\u3002" } }
      ],
      adventurerTiles: [
        { id: "ta1", icon: "hands", text: { en: "Give thanks", zh: "\u51E1\u4E8B" } },
        { id: "ta2", icon: "sun", text: { en: "in all circumstances;", zh: "\u8C22\u6069\uFF0C" } },
        { id: "ta3", icon: "scroll", text: { en: "for this is God's", zh: "\u56E0\u4E3A\u8FD9\u662F\u795E" } },
        { id: "ta4", icon: "cross", text: { en: "in Christ Jesus", zh: "\u5728\u57FA\u7763\u8036\u7A23\u91CC" } },
        { id: "ta5", icon: "heart", text: { en: "will for you", zh: "\u5411\u4F60\u4EEC\u6240\u5B9A\u7684" } },
        { id: "ta6", icon: "star", text: { en: "always.", zh: "\u65E8\u610F\u3002" } }
      ],
      adventurerDecoy: {
        id: "ta_decoy",
        icon: "scroll",
        text: { en: "maybe tomorrow", zh: "\u660E\u5929\u518D\u8BF4" }
      }
    }
  };
  var BUILDER_VERSE_QUEUE = ["psalm_107_1", "thess_5_18"];
  var ADVENTURER_QUIZ_ORDER = ["q_loaves", "q_leper", "q_harp"];
  var QUIZ_QUESTIONS = {
    q_loaves: {
      id: "q_loaves",
      verseId: "john_6_11",
      question: {
        en: "In John 6, what did Jesus do first before sharing the loaves and fish?",
        zh: "\u5728\u4E94\u997C\u4E8C\u9C7C\u7684\u6545\u4E8B\u91CC\uFF0C\u8036\u7A23\u5206\u997C\u4E4B\u524D\u5148\u505A\u4E86\u4EC0\u4E48\uFF1F"
      },
      choices: [
        {
          en: "Took the loaves and gave thanks to God",
          zh: "\u5148\u62FF\u8D77\u997C\u5411\u5929\u7236\u795D\u8C22"
        },
        {
          en: "Asked everyone to go home and nap",
          zh: "\u8BF7\u5927\u5BB6\u5148\u56DE\u5BB6\u7761\u89C9"
        },
        {
          en: "Hid the basket inside a cave",
          zh: "\u628A\u98DF\u7269\u85CF\u8FDB\u5C71\u6D1E\u91CC"
        }
      ],
      correctIndex: 0,
      encouragement: {
        en: "Yes! Jesus gave thanks first before sharing, reminding us to thank God too!",
        zh: "\u662F\u7684\uFF01\u8036\u7A23\u5148\u795D\u8C22\u518D\u5206\u4EAB\uFF0C\u63D0\u9192\u6211\u4EEC\u5403\u996D\u524D\u4E5F\u8981\u611F\u8C22\u795E\uFF01"
      }
    },
    q_leper: {
      id: "q_leper",
      verseId: "luke_17_15_16",
      question: {
        en: "In Luke 17, what did the one thankful man do after Jesus healed him?",
        zh: "\u8DEF\u52A0\u798F\u97F317\u7AE0\u91CC\uFF0C\u90A3\u4F4D\u5FC3\u6000\u611F\u6069\u7684\u4EBA\u5F97\u533B\u6CBB\u540E\u505A\u4E86\u4EC0\u4E48\uFF1F"
      },
      choices: [
        {
          en: "Rushed to the market to buy toys",
          zh: "\u6025\u5FD9\u8DD1\u53BB\u96C6\u5E02\u4E70\u73A9\u5177"
        },
        {
          en: "Praised God loudly and ran back to Jesus' feet to thank Him",
          zh: "\u5927\u58F0\u8D5E\u7F8E\u795E\u5E76\u8DD1\u56DE\u8036\u7A23\u811A\u524D\u8BF4\u8C22\u8C22"
        },
        {
          en: "Forgot who had helped him",
          zh: "\u5FD8\u8BB0\u662F\u8C01\u5E2E\u52A9\u4E86\u4ED6"
        }
      ],
      correctIndex: 1,
      encouragement: {
        en: "Wonderful! He turned right around and thanked Jesus with a joyful heart!",
        zh: "\u771F\u68D2\uFF01\u4ED6\u7ACB\u523B\u8F6C\u8EAB\u56DE\u6765\u4FEF\u4F0F\u5728\u8036\u7A23\u811A\u524D\u732E\u4E0A\u611F\u8C22\uFF01"
      }
    },
    q_harp: {
      id: "q_harp",
      verseId: "psalm_100_4",
      question: {
        en: "In Psalm 100:4, how should we enter God's gates and courts?",
        zh: "\u8BD7\u7BC7100\u7BC74\u8282\u63D0\u9192\u6211\u4EEC\uFF0C\u8FDB\u5165\u795E\u7684\u95E8\u548C\u9662\u65F6\u8981\u5E26\u7740\u4EC0\u4E48\u5FC3\uFF1F"
      },
      choices: [
        {
          en: "With thanksgiving and joyful praise to God",
          zh: "\u5E26\u7740\u79F0\u8C22\u548C\u8D5E\u7F8E\u7684\u5FC3\u611F\u8C22\u795E"
        },
        {
          en: "With a grumpy face and no words",
          zh: "\u6101\u7709\u82E6\u8138\u4E00\u53E5\u8BDD\u4E5F\u4E0D\u8BF4"
        },
        {
          en: "Pretending we never noticed His blessings",
          zh: "\u5047\u88C5\u4EC0\u4E48\u90FD\u6CA1\u770B\u89C1"
        }
      ],
      correctIndex: 0,
      encouragement: {
        en: "Yes! God loves when we come to Him and Jesus with thanksgiving and praise!",
        zh: "\u7B54\u5BF9\u5566\uFF01\u5E26\u7740\u79F0\u8C22\u548C\u8D5E\u7F8E\u6765\u5230\u795E\u548C\u8036\u7A23\u9762\u524D\uFF0C\u5929\u7236\u6700\u559C\u60A6\uFF01"
      }
    }
  };
  function getVerseById(id) {
    return VERSES[id];
  }
  function getVerseTiles(verseId, ageMode) {
    const verse = VERSES[verseId];
    return ageMode === "adventurer" ? verse.adventurerTiles : verse.explorerTiles;
  }
  function getVerseDecoyTile(verseId, ageMode) {
    if (ageMode !== "adventurer") {
      return null;
    }
    return VERSES[verseId].adventurerDecoy || null;
  }

  // thankful_jesus/ts/minigames.ts
  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }
  function shuffleIds(ids, rng) {
    const arr = ids.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
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
  function buildShuffledVerseIds(verseId, ageMode, rng) {
    const tiles = getVerseTiles(verseId, ageMode);
    const ids = tiles.map((t) => t.id);
    const decoy = getVerseDecoyTile(verseId, ageMode);
    if (decoy) {
      ids.push(decoy.id);
    }
    return {
      shuffledTileIds: shuffleIds(ids, rng),
      decoyTileId: decoy ? decoy.id : null
    };
  }
  function createStageState(stageId, ageMode, rng) {
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
        totalTimeSec: spec.adventurerTimeSec,
        wobbleTimer: 0,
        doveRescueTimer: 0,
        doveRescueX: 0.5,
        spawnTimer: 0.3,
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
        streak: 0,
        wobbleTimer: 0,
        score: 0,
        timeLeftSec: isExplorer ? 999 : spec.adventurerTimeSec,
        totalTimeSec: spec.adventurerTimeSec,
        spawnTimer: 0.28,
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
        totalTimeSec: spec.adventurerTimeSec,
        spawnTimer: 0.35,
        doubleBeatPending: false,
        melodyStep: 0,
        missedCounter: 0,
        doveRescueTimer: 0,
        doveRescueX: 0.5,
        nextNoteId: 1,
        notes: [],
        stringGlow: [0, 0, 0, 0],
        lastPopKey: "",
        lastPopTimer: 0
      };
    }
    const firstVerse = BUILDER_VERSE_QUEUE[0];
    const initialTiles = buildShuffledVerseIds(firstVerse, ageMode, rng);
    return {
      kind: "verse_builder",
      subPhase: "tiles",
      verseQueue: BUILDER_VERSE_QUEUE.slice(),
      verseCursor: 0,
      placedTileIds: [],
      shuffledTileIds: initialTiles.shuffledTileIds,
      decoyTileId: initialTiles.decoyTileId,
      wrongShakeTileId: null,
      wrongShakeWasDecoy: false,
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
  function stepLoavesStage(stage, ageMode, dt, input, rng, sounds) {
    const isExplorer = ageMode === "explorer";
    if (stage.lastPopTimer > 0) {
      stage.lastPopTimer = Math.max(0, stage.lastPopTimer - dt);
    }
    if (stage.prayGlowTimer > 0) {
      stage.prayGlowTimer = Math.max(0, stage.prayGlowTimer - dt);
    }
    if (stage.wobbleTimer > 0) {
      stage.wobbleTimer = Math.max(0, stage.wobbleTimer - dt);
    }
    if (stage.doveRescueTimer > 0) {
      stage.doveRescueTimer = Math.max(0, stage.doveRescueTimer - dt);
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
      stage.basketX = clamp(stage.basketX + input.moveDir * dt * 0.96, 0.14, 0.86);
    }
    stage.spawnTimer -= dt;
    if (stage.spawnTimer <= 0) {
      const r = rng();
      let itemType;
      if (isExplorer) {
        itemType = r < 0.28 ? "blessing" : r < 0.66 ? "loaf" : "fish";
      } else {
        itemType = r < 0.22 ? "gust" : r < 0.42 ? "blessing" : r < 0.72 ? "loaf" : "fish";
      }
      stage.items.push({
        id: stage.nextItemId++,
        x: 0.16 + rng() * 0.68,
        y: 0.1,
        vy: isExplorer ? 0.25 + rng() * 0.07 : 0.44 + rng() * 0.12,
        swayPhase: rng() * Math.PI * 2,
        itemType
      });
      stage.spawnTimer = isExplorer ? 0.88 : 0.48;
    }
    const catchRadius = isExplorer ? 0.18 : 0.12;
    const remaining = [];
    for (let i = 0; i < stage.items.length; i++) {
      const item = stage.items[i];
      item.y += item.vy * dt;
      if (isExplorer) {
        if (item.itemType === "blessing" && item.y > 0.34) {
          item.x += (stage.basketX - item.x) * Math.min(1, dt * 2.5);
        }
      } else {
        item.x = clamp(item.x + Math.sin(item.swayPhase + item.y * 8.5) * dt * 0.24, 0.12, 0.88);
      }
      if (item.y >= 0.72 && item.y <= 0.88 && Math.abs(item.x - stage.basketX) <= catchRadius) {
        if (item.itemType === "gust") {
          stage.wobbleTimer = 0.6;
          stage.streak = 0;
          stage.lastPopKey = "popWindGust";
          stage.lastPopTimer = 0.75;
          sounds.push("gentle_bump");
          continue;
        }
        stage.sharedCount += 1;
        stage.streak += 1;
        const mult = !isExplorer && stage.streak >= 6 ? 3 : !isExplorer && stage.streak >= 3 ? 2 : 1;
        if (item.itemType === "blessing") {
          stage.blessingsCollected += 1;
          stage.score += 120 * mult;
          stage.lastPopKey = "popBlessing";
          sounds.push("blessing_token");
        } else {
          stage.score += 65 * mult;
          stage.lastPopKey = "popShared";
          sounds.push("good_catch");
        }
        stage.lastPopTimer = 0.65;
        continue;
      }
      if (item.y > 0.92) {
        if (isExplorer && item.itemType !== "gust") {
          stage.sharedCount += 1;
          stage.score += 55;
          stage.doveRescueTimer = 0.95;
          stage.doveRescueX = item.x;
          stage.lastPopKey = "popDoveHelp";
          stage.lastPopTimer = 0.75;
          sounds.push("blessing_token");
        } else if (item.itemType !== "gust") {
          stage.streak = 0;
        }
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
  function stepRunBackStage(stage, ageMode, dt, input, rng, sounds) {
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
      if (isExplorer || stage.wobbleTimer <= 0) {
        stage.roadProgress = clamp(stage.roadProgress + dt * (isExplorer ? 0.055 : 0.042), 0, 1);
      }
      stage.spawnTimer -= dt;
      if (stage.spawnTimer <= 0) {
        if (isExplorer) {
          const r = rng();
          const lane = Math.floor(rng() * 3) % 3;
          const itemType = r < 0.78 ? "sparkle" : r < 0.9 ? "cart" : "toy";
          stage.items.push({ id: stage.nextItemId++, lane, y: 0.08, itemType });
          stage.spawnTimer = 0.86;
        } else {
          const safeLane = Math.floor(rng() * 3) % 3;
          if (rng() < 0.52) {
            stage.items.push({ id: stage.nextItemId++, lane: safeLane, y: 0.08, itemType: "sparkle" });
            const lanes = [0, 1, 2];
            for (let li = 0; li < lanes.length; li++) {
              const ln = lanes[li];
              if (ln !== safeLane) {
                stage.items.push({
                  id: stage.nextItemId++,
                  lane: ln,
                  y: 0.08,
                  itemType: ln % 2 === 0 ? "cart" : "toy"
                });
              }
            }
            stage.spawnTimer = 0.68;
          } else {
            stage.items.push({
              id: stage.nextItemId++,
              lane: safeLane,
              y: 0.08,
              itemType: rng() < 0.65 ? "sparkle" : "cart"
            });
            stage.spawnTimer = 0.48;
          }
        }
      }
      const speed = isExplorer ? 0.34 : 0.6;
      const remaining = [];
      for (let i = 0; i < stage.items.length; i++) {
        const it = stage.items[i];
        it.y += speed * dt;
        if (it.y >= 0.72 && it.y <= 0.87 && it.lane === stage.lane) {
          if (it.itemType === "sparkle") {
            stage.sparklesCollected += 1;
            stage.streak += 1;
            stage.roadProgress = clamp(stage.roadProgress + (isExplorer ? 0.12 : 0.075), 0, 1);
            const mult = !isExplorer && stage.streak >= 5 ? 3 : !isExplorer && stage.streak >= 3 ? 2 : 1;
            stage.score += 80 * mult;
            stage.lastPopKey = "popGrace";
            stage.lastPopTimer = 0.7;
            sounds.push("blessing_token");
          } else {
            stage.wobbleTimer = isExplorer ? 0.35 : 0.75;
            stage.streak = 0;
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
      if (stage.sparklesCollected >= stage.targetSparkles || stage.roadProgress >= 1 || !isExplorer && stage.timeLeftSec <= 7.5) {
        stage.subPhase = "turn_back";
        stage.items = [];
        stage.lastPopKey = "popTurnBack";
        stage.lastPopTimer = 1.1;
        sounds.push("pray_blessing");
      }
      return false;
    }
    const tapped = input.primaryTap || input.lanePick !== null;
    if (tapped) {
      const step = isExplorer ? 22 : 11;
      stage.turnBackProgress = clamp(stage.turnBackProgress + step, 0, 100);
      stage.score += 45;
      stage.lastPopKey = "popThankJesus";
      stage.lastPopTimer = 0.65;
      sounds.push("turn_step");
    } else if (!isExplorer && stage.turnBackProgress > 10) {
      stage.turnBackProgress = Math.max(10, stage.turnBackProgress - dt * 12);
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
  var HARP_MELODY_PATTERN = [0, 1, 2, 3, 2, 1, 2, 3, 1, 2, 0, 3];
  var HARP_SOUND_BY_STRING = ["harp_0", "harp_1", "harp_2", "harp_3"];
  function stepDavidHarpStage(stage, ageMode, dt, input, rng, sounds) {
    const isExplorer = ageMode === "explorer";
    if (stage.lastPopTimer > 0) {
      stage.lastPopTimer = Math.max(0, stage.lastPopTimer - dt);
    }
    if (stage.doveRescueTimer > 0) {
      stage.doveRescueTimer = Math.max(0, stage.doveRescueTimer - dt);
    }
    for (let i = 0; i < 4; i++) {
      if (stage.stringGlow[i] > 0) {
        stage.stringGlow[i] = Math.max(0, stage.stringGlow[i] - dt);
      }
    }
    if (!isExplorer) {
      stage.timeLeftSec = Math.max(0, stage.timeLeftSec - dt);
    }
    stage.spawnTimer -= dt;
    if (stage.spawnTimer <= 0) {
      const baseStr = HARP_MELODY_PATTERN[stage.melodyStep % HARP_MELODY_PATTERN.length];
      stage.melodyStep += 1;
      const stringIndex = rng() < 0.74 ? baseStr : Math.floor(rng() * 4) % 4;
      stage.notes.push({
        id: stage.nextNoteId++,
        stringIndex,
        y: 0.12,
        golden: stage.melodyStep % 4 === 0
      });
      if (isExplorer) {
        stage.spawnTimer = 0.98;
      } else if (stage.doubleBeatPending) {
        stage.doubleBeatPending = false;
        stage.spawnTimer = 0.62;
      } else if (rng() < 0.36) {
        stage.doubleBeatPending = true;
        stage.spawnTimer = 0.28;
      } else {
        stage.spawnTimer = 0.56;
      }
    }
    const fallSpeed = isExplorer ? 0.28 : 0.54;
    const zoneMin = isExplorer ? 0.54 : 0.66;
    const zoneMax = isExplorer ? 0.96 : 0.9;
    if (input.harpString !== null) {
      const s = input.harpString;
      stage.stringGlow[s] = 0.45;
      sounds.push(HARP_SOUND_BY_STRING[s]);
      let bestIdx = -1;
      let bestDist = 999;
      for (let i = 0; i < stage.notes.length; i++) {
        const n = stage.notes[i];
        if (n.stringIndex === s && n.y >= zoneMin && n.y <= zoneMax) {
          const dist = Math.abs(n.y - 0.78);
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
        const mult = !isExplorer && stage.streak >= 6 ? 3 : !isExplorer && stage.streak >= 3 ? 2 : 1;
        stage.score += (hit.golden ? 120 : 75) * mult;
        stage.lastPopKey = hit.golden || stage.streak >= 3 ? "popHarmony" : "popPraise";
        stage.lastPopTimer = 0.72;
        if (hit.golden) {
          sounds.push("blessing_token");
        }
      } else if (!isExplorer) {
        stage.streak = 0;
      }
    }
    const remaining = [];
    for (let i = 0; i < stage.notes.length; i++) {
      const n = stage.notes[i];
      n.y += fallSpeed * dt;
      if (n.y > 0.98) {
        stage.missedCounter += 1;
        stage.streak = 0;
        if (isExplorer && stage.missedCounter % 2 === 0) {
          stage.notesPlayed += 1;
          stage.score += 55;
          stage.stringGlow[n.stringIndex] = 0.4;
          stage.doveRescueTimer = 0.85;
          stage.doveRescueX = 0.16 + n.stringIndex * 0.22;
          stage.lastPopKey = "popDoveHelp";
          stage.lastPopTimer = 0.7;
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
  function stepVerseBuilderStage(stage, dt) {
    if (stage.wrongShakeTimer > 0) {
      stage.wrongShakeTimer = Math.max(0, stage.wrongShakeTimer - dt);
      if (stage.wrongShakeTimer === 0) {
        stage.wrongShakeTileId = null;
        stage.wrongShakeWasDecoy = false;
      }
    }
    if (stage.quizFeedbackTimer > 0) {
      stage.quizFeedbackTimer = Math.max(0, stage.quizFeedbackTimer - dt);
      if (stage.quizFeedbackTimer === 0 && stage.quizFeedback === "retry") {
        stage.quizFeedback = "none";
      }
    }
  }
  function handleVerseTileTap(stage, ageMode, tileId, rng, sounds) {
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
      stage.wrongShakeWasDecoy = false;
      stage.wrongShakeTimer = 0;
      stage.score += 90;
      sounds.push("tile_place");
      if (stage.placedTileIds.length >= expectedTiles.length) {
        stage.versesCompleted += 1;
        stage.score += 150;
        if (stage.verseCursor + 1 < stage.verseQueue.length) {
          stage.verseCursor += 1;
          const nextVerseId = stage.verseQueue[stage.verseCursor];
          const nextPack = buildShuffledVerseIds(nextVerseId, ageMode, rng);
          stage.placedTileIds = [];
          stage.shuffledTileIds = nextPack.shuffledTileIds;
          stage.decoyTileId = nextPack.decoyTileId;
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
    stage.wrongShakeWasDecoy = tileId === stage.decoyTileId;
    stage.wrongShakeTimer = stage.wrongShakeWasDecoy ? 1.1 : 0.55;
    sounds.push("tile_hint");
    return false;
  }
  function handleQuizAnswer(stage, choiceIndex, sounds) {
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
  function computeStageResult(stage, ageMode, playerIndex) {
    const isExplorer = ageMode === "explorer";
    const spec = STAGE_SPECS[stage.kind];
    if (stage.kind === "loaves_and_fish") {
      const ratio = stage.targetCount > 0 ? stage.sharedCount / stage.targetCount : 1;
      const stars2 = ratio >= 1 && (isExplorer || stage.blessingsCollected >= 2) ? 3 : ratio >= 0.65 ? 2 : 1;
      return {
        stageId: stage.kind,
        playerIndex,
        stars: stars2,
        score: stage.score,
        tokensCollected: stage.blessingsCollected,
        verseUnlocked: spec.verseId
      };
    }
    if (stage.kind === "run_back_to_jesus") {
      const ratio = stage.targetSparkles > 0 ? stage.sparklesCollected / stage.targetSparkles : 1;
      const stars2 = stage.turnBackProgress >= 100 && (isExplorer || ratio >= 0.75) ? 3 : stage.turnBackProgress >= 80 ? 2 : 1;
      return {
        stageId: stage.kind,
        playerIndex,
        stars: stars2,
        score: stage.score,
        tokensCollected: stage.sparklesCollected,
        verseUnlocked: spec.verseId
      };
    }
    if (stage.kind === "david_harp") {
      const ratio = stage.targetNotes > 0 ? stage.notesPlayed / stage.targetNotes : 1;
      const stars2 = ratio >= 1 ? 3 : ratio >= 0.65 ? 2 : 1;
      return {
        stageId: stage.kind,
        playerIndex,
        stars: stars2,
        score: stage.score,
        tokensCollected: stage.notesPlayed,
        verseUnlocked: spec.verseId
      };
    }
    const stars = stage.mistakes <= 2 ? 3 : stage.mistakes <= 5 ? 2 : 1;
    return {
      stageId: stage.kind,
      playerIndex,
      stars,
      score: stage.score,
      tokensCollected: stage.versesCompleted,
      verseUnlocked: spec.verseId
    };
  }

  // thankful_jesus/ts/game.ts
  var EMPTY_INPUT = {
    primaryTap: false,
    moveDir: 0,
    pointerXNorm: null,
    lanePick: null,
    harpString: null
  };
  function nextRng(state) {
    state.rngState = Math.imul(state.rngState, 1664525) + 1013904223 >>> 0;
    return state.rngState / 4294967296;
  }
  function addUnlockedVerse(state, verseId) {
    if (state.unlockedVerses.indexOf(verseId) < 0) {
      state.unlockedVerses.push(verseId);
    }
  }
  function finishActiveStage(state) {
    if (!state.stageState) {
      return;
    }
    const res = computeStageResult(state.stageState, state.ageMode, state.activePlayerIndex);
    state.results.push(res);
    state.totalStars += res.stars;
    addUnlockedVerse(state, res.verseUnlocked);
    if (state.stageState.kind === "verse_builder") {
      for (let i = 0; i < BUILDER_VERSE_QUEUE.length; i++) {
        addUnlockedVerse(state, BUILDER_VERSE_QUEUE[i]);
      }
    }
    state.phase = "stage_complete";
    state.pendingSounds.push("stage_win");
  }
  function enterCurrentStage(state) {
    const stageId = STAGE_SEQUENCE[state.stageIndex];
    state.stageState = createStageState(stageId, state.ageMode, () => nextRng(state));
    state.phase = "stage_intro";
  }
  function createInitialState(config = {}) {
    return {
      phase: "title",
      ageMode: config.ageMode || "explorer",
      langMode: config.langMode || "dual",
      playMode: "solo",
      playerCount: 1,
      activePlayerIndex: 0,
      stageIndex: 0,
      stageState: null,
      results: [],
      unlockedVerses: [],
      prayers: [],
      promptIndex: 0,
      totalStars: 0,
      muted: false,
      autoRead: false,
      elapsedSec: 0,
      rngState: (config.seed ?? 20261125) >>> 0,
      pendingSounds: [],
      easterSource: "none",
      easterLineIndex: 0,
      easterTimer: 0,
      jesusGlowTimer: 0,
      treeRustleTimer: 0,
      friendHopTimer: 0
    };
  }
  function stepGame(state, dtSec, input = EMPTY_INPUT) {
    const dt = Math.max(0, Math.min(0.08, dtSec));
    state.elapsedSec += dt;
    if (state.easterTimer > 0) {
      state.easterTimer = Math.max(0, state.easterTimer - dt);
      if (state.easterTimer === 0) {
        state.easterSource = "none";
      }
    }
    if (state.jesusGlowTimer > 0) {
      state.jesusGlowTimer = Math.max(0, state.jesusGlowTimer - dt);
    }
    if (state.treeRustleTimer > 0) {
      state.treeRustleTimer = Math.max(0, state.treeRustleTimer - dt);
    }
    if (state.friendHopTimer > 0) {
      state.friendHopTimer = Math.max(0, state.friendHopTimer - dt);
    }
    if (state.phase !== "stage_play" || !state.stageState) {
      return state;
    }
    let finished = false;
    if (state.stageState.kind === "loaves_and_fish") {
      finished = stepLoavesStage(
        state.stageState,
        state.ageMode,
        dt,
        input,
        () => nextRng(state),
        state.pendingSounds
      );
    } else if (state.stageState.kind === "run_back_to_jesus") {
      finished = stepRunBackStage(
        state.stageState,
        state.ageMode,
        dt,
        input,
        () => nextRng(state),
        state.pendingSounds
      );
    } else if (state.stageState.kind === "david_harp") {
      finished = stepDavidHarpStage(
        state.stageState,
        state.ageMode,
        dt,
        input,
        () => nextRng(state),
        state.pendingSounds
      );
    } else {
      stepVerseBuilderStage(state.stageState, dt);
    }
    if (finished) {
      finishActiveStage(state);
    }
    return state;
  }
  function applyAction(state, action) {
    switch (action.type) {
      case "SET_AGE_MODE":
        state.ageMode = action.ageMode;
        break;
      case "SET_LANG_MODE":
        state.langMode = action.langMode;
        break;
      case "SET_PLAY_MODE":
        state.playMode = action.playMode;
        if (action.playMode === "solo") {
          state.playerCount = 1;
        } else {
          const count = action.playerCount ?? Math.max(2, state.playerCount);
          state.playerCount = Math.max(2, Math.min(4, count));
        }
        break;
      case "START_JOURNEY":
        state.stageIndex = 0;
        state.activePlayerIndex = 0;
        state.results = [];
        state.unlockedVerses = [];
        state.prayers = [];
        state.totalStars = 0;
        enterCurrentStage(state);
        break;
      case "CONFIRM_PASS":
        if (state.phase === "pass_banner") {
          enterCurrentStage(state);
        }
        break;
      case "BEGIN_STAGE":
        if (state.phase === "stage_intro") {
          state.phase = "stage_play";
        }
        break;
      case "PRAY_WITH_JESUS":
        if (state.phase === "stage_play" && state.stageState && state.stageState.kind === "loaves_and_fish" && !state.stageState.prayedWithJesus) {
          state.stageState.prayedWithJesus = true;
          state.stageState.prayGlowTimer = 1.6;
          state.stageState.score += 100;
          state.stageState.lastPopKey = "popAmen";
          state.stageState.lastPopTimer = 1.1;
          state.pendingSounds.push("pray_blessing");
        }
        break;
      case "TAP_VERSE_TILE":
        if (state.phase === "stage_play" && state.stageState && state.stageState.kind === "verse_builder") {
          const done = handleVerseTileTap(
            state.stageState,
            state.ageMode,
            action.tileId,
            () => nextRng(state),
            state.pendingSounds
          );
          if (done) {
            finishActiveStage(state);
          }
        }
        break;
      case "ANSWER_QUIZ":
        if (state.phase === "stage_play" && state.stageState && state.stageState.kind === "verse_builder") {
          const done = handleQuizAnswer(state.stageState, action.choiceIndex, state.pendingSounds);
          if (done) {
            finishActiveStage(state);
          }
        }
        break;
      case "NEXT_STAGE":
        if (state.phase === "stage_complete") {
          if (state.stageIndex + 1 < STAGE_SEQUENCE.length) {
            state.stageIndex += 1;
            enterCurrentStage(state);
          } else {
            state.stageState = null;
            state.phase = "prayer_card";
          }
        }
        break;
      case "ADD_PRAYER":
        if (state.phase === "prayer_card") {
          const leaf = createPrayerLeaf(
            state.prayers.length,
            action.stickerId,
            action.leafColor,
            action.customMessage,
            action.authorLabel,
            state.langMode
          );
          if (leaf) {
            state.prayers.push(leaf);
            state.pendingSounds.push("prayer_hang");
          }
        }
        break;
      case "FINISH_PRAYERS":
        if (state.phase === "prayer_card") {
          if (state.prayers.length === 0) {
            const fallback = createPrayerLeaf(0, "jesus_love", "gold", "", "", state.langMode);
            if (fallback) {
              state.prayers.push(fallback);
            }
          }
          state.phase = "journey_finale";
          state.pendingSounds.push("journey_fanfare");
        }
        break;
      case "SHUFFLE_PROMPT":
        state.promptIndex += 1;
        break;
      case "POKE_JESUS":
        state.easterSource = "jesus";
        state.easterLineIndex += 1;
        state.easterTimer = 3.2;
        state.jesusGlowTimer = 2.4;
        state.pendingSounds.push("jesus_chime");
        break;
      case "POKE_TREE":
        state.easterSource = "tree";
        state.easterLineIndex += 1;
        state.easterTimer = 3;
        state.treeRustleTimer = 2.2;
        state.pendingSounds.push("tree_rustle");
        break;
      case "POKE_FRIEND":
        state.easterSource = "friend";
        state.easterLineIndex += 1;
        state.easterTimer = 3;
        state.friendHopTimer = 2.2;
        state.pendingSounds.push("blessing_token");
        break;
      case "TOGGLE_MUTE":
        state.muted = !state.muted;
        break;
      case "TOGGLE_AUTO_READ":
        state.autoRead = !state.autoRead;
        break;
      case "PLAY_AGAIN":
        state.phase = "title";
        state.stageIndex = 0;
        state.activePlayerIndex = 0;
        state.stageState = null;
        state.results = [];
        state.unlockedVerses = [];
        state.prayers = [];
        state.totalStars = 0;
        break;
    }
    return state;
  }
  function drainSounds(state) {
    if (state.pendingSounds.length === 0) {
      return [];
    }
    const out = state.pendingSounds.slice();
    state.pendingSounds.length = 0;
    return out;
  }

  // thankful_jesus/ts/postcard.ts
  function wrapBilingualText(ctx, text, maxWidth) {
    const chars = Array.from(text);
    const hasSpaces = text.indexOf(" ") >= 0 && chars.every((c) => c.charCodeAt(0) < 256);
    const lines = [];
    if (hasSpaces) {
      const words = text.split(" ");
      let current2 = "";
      for (let i = 0; i < words.length; i++) {
        const candidate = current2 ? current2 + " " + words[i] : words[i];
        if (ctx.measureText(candidate).width <= maxWidth) {
          current2 = candidate;
        } else {
          if (current2) {
            lines.push(current2);
          }
          current2 = words[i];
        }
      }
      if (current2) {
        lines.push(current2);
      }
      return lines.length > 0 ? lines : [text];
    }
    let current = "";
    for (let i = 0; i < chars.length; i++) {
      const candidate = current + chars[i];
      if (ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else {
        if (current) {
          lines.push(current);
        }
        current = chars[i];
      }
    }
    if (current) {
      lines.push(current);
    }
    return lines.length > 0 ? lines : [text];
  }
  function renderPostcardCanvas(state) {
    const W = 1080;
    const H = 1440;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return canvas;
    }
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#FFFDF6");
    bg.addColorStop(0.5, "#FCEFD6");
    bg.addColorStop(1, "#F4D5A3");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    drawRoundedRect(ctx, 32, 32, W - 64, H - 64, 34);
    ctx.fillStyle = "rgba(255, 253, 248, 0.84)";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = PALETTE.sandalwood;
    ctx.stroke();
    drawRoundedRect(ctx, 48, 48, W - 96, H - 96, 26);
    ctx.lineWidth = 3;
    ctx.strokeStyle = PALETTE.warmGold;
    ctx.stroke();
    drawRoundedRect(ctx, 60, 60, W - 120, H - 120, 22);
    ctx.setLineDash([14, 10]);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = PALETTE.terracotta;
    ctx.stroke();
    ctx.restore();
    drawLeaf(ctx, 98, 98, 30, "gold", -0.4);
    drawLeaf(ctx, 134, 92, 20, "olive", 0.35);
    drawLeaf(ctx, W - 98, 98, 30, "olive", 0.4);
    drawLeaf(ctx, W - 134, 92, 20, "gold", -0.35);
    drawLeaf(ctx, 98, H - 98, 28, "crimson", -2.5);
    drawLeaf(ctx, W - 98, H - 98, 28, "sky", 2.5);
    ctx.textAlign = "center";
    ctx.fillStyle = PALETTE.ink;
    ctx.font = "800 56px Georgia, serif";
    ctx.fillText(formatPrimary(UI_TEXT.pcTitle, state.langMode), W / 2, 136);
    const secTitle = formatSecondary(UI_TEXT.pcTitle, state.langMode);
    ctx.fillStyle = PALETTE.terracottaDark;
    ctx.font = "700 28px system-ui, -apple-system, sans-serif";
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const subLine = (secTitle ? secTitle + "  -  " : "") + formatPrimary(UI_TEXT.pcSubtitle, state.langMode) + " " + String(year);
    ctx.fillText(subLine, W / 2, 184);
    for (let i = 0; i < 3; i++) {
      drawStar(ctx, W / 2 + (i - 1) * 52, 228, 17, PALETTE.sunGold);
    }
    ctx.save();
    drawRoundedRect(ctx, 84, 264, W - 168, 396, 26);
    ctx.clip();
    ctx.translate(84, 264);
    drawGalileeBackdrop(ctx, W - 168, 396, 0.8);
    drawGratitudeOliveTree(ctx, (W - 168) * 0.64, 376, 360, 326, state.prayers, 0.6);
    drawJesus(ctx, (W - 168) * 0.25, 372, 2.05, "celebrate", 0.4);
    drawChildFriend(ctx, (W - 168) * 0.43, 378, 1.35, "#D46A43", true, 0.4);
    ctx.restore();
    drawRoundedRect(ctx, 84, 264, W - 168, 396, 26);
    ctx.lineWidth = 4;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    const verse = getVerseById("thess_5_18");
    drawRoundedRect(ctx, 84, 684, W - 168, 184, 22);
    ctx.fillStyle = "#FFF5DF";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = PALETTE.sandalwood;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = PALETTE.terracottaDark;
    ctx.font = "800 26px system-ui, -apple-system, sans-serif";
    const refSec = formatSecondary(verse.reference, state.langMode);
    ctx.fillText(
      formatPrimary(verse.reference, state.langMode) + (refSec ? "  |  " + refSec : ""),
      W / 2,
      724
    );
    ctx.fillStyle = PALETTE.ink;
    ctx.font = "700 24px system-ui, -apple-system, sans-serif";
    const primaryLines = wrapBilingualText(ctx, formatPrimary(verse.text, state.langMode), W - 230);
    ctx.fillText(primaryLines[0], W / 2, 764);
    if (primaryLines[1]) {
      ctx.fillText(primaryLines[1], W / 2, 796);
    }
    const verseZh = formatSecondary(verse.text, state.langMode);
    if (verseZh) {
      ctx.fillStyle = PALETTE.mutedInk;
      ctx.font = "700 23px system-ui, -apple-system, sans-serif";
      const zhLines = wrapBilingualText(ctx, verseZh, W - 230);
      ctx.fillText(zhLines[0], W / 2, 838);
    }
    ctx.fillStyle = PALETTE.terracotta;
    ctx.font = "800 32px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    const prayerHeadSec = formatSecondary(UI_TEXT.pcPrayerSection, state.langMode);
    ctx.fillText(
      formatPrimary(UI_TEXT.pcPrayerSection, state.langMode) + (prayerHeadSec ? "  /  " + prayerHeadSec : ""),
      W / 2,
      924
    );
    const notes = state.prayers.slice(0, 6);
    const cols = notes.length > 3 ? 2 : 1;
    const colW = cols === 2 ? 438 : 880;
    const startX = cols === 2 ? 90 : 100;
    const yStart = 954;
    for (let i = 0; i < notes.length; i++) {
      const leaf = notes[i];
      const col = cols === 2 ? i % 2 : 0;
      const row = cols === 2 ? Math.floor(i / 2) : i;
      const x = startX + col * (colW + 24);
      const y = yStart + row * 116;
      drawRoundedRect(ctx, x, y, colW, 100, 18);
      ctx.fillStyle = PALETTE.robeCream;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = PALETTE.ink;
      ctx.stroke();
      drawLeaf(ctx, x + 36, y + 50, 18, leaf.leafColor, -0.2);
      ctx.textAlign = "left";
      ctx.fillStyle = PALETTE.sandalwood;
      ctx.font = "700 21px system-ui, -apple-system, sans-serif";
      ctx.fillText(leaf.authorLabel, x + 68, y + 32);
      ctx.fillStyle = PALETTE.ink;
      ctx.font = "600 22px system-ui, -apple-system, sans-serif";
      const lines = wrapBilingualText(ctx, leaf.message, colW - 86);
      ctx.fillText(lines[0], x + 68, y + 64);
      if (lines[1]) {
        ctx.font = "600 18px system-ui, -apple-system, sans-serif";
        ctx.fillText(lines[1], x + 68, y + 88);
      }
    }
    ctx.textAlign = "center";
    ctx.fillStyle = PALETTE.sandalwood;
    ctx.font = "700 22px system-ui, -apple-system, sans-serif";
    const footSec = formatSecondary(UI_TEXT.pcFooter, state.langMode);
    ctx.fillText(
      formatPrimary(UI_TEXT.pcFooter, state.langMode) + (footSec ? "  -  " + footSec : ""),
      W / 2,
      H - 80
    );
    return canvas;
  }
  async function exportPostcard(canvas) {
    const dataUrl = canvas.toDataURL("image/png");
    const blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/png");
    });
    if (blob && typeof navigator !== "undefined" && typeof File !== "undefined") {
      const file = new File([blob], "thankful-journey-with-jesus-card.png", { type: "image/png" });
      const nav = navigator;
      if (typeof nav.share === "function" && (!nav.canShare || nav.canShare({ files: [file] }))) {
        try {
          await nav.share({
            files: [file],
            title: "Thankful Journey with Jesus",
            text: "Happy Thanksgiving! Give thanks in all circumstances in Christ Jesus."
          });
          return { method: "share", dataUrl };
        } catch {
        }
      }
    }
    if (typeof document !== "undefined") {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "thankful-journey-with-jesus-card.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { method: "download", dataUrl };
    }
    return { method: "preview", dataUrl };
  }

  // thankful_jesus/ts/renderer.ts
  function drawFloatingLeaves(ctx, w, h, timeSec) {
    const colors = ["gold", "olive", "crimson", "sky"];
    for (let i = 0; i < 6; i++) {
      const x = (i * 83 + timeSec * 22) % (w + 40) - 20;
      const y = (i * 71 + timeSec * 30) % (h * 0.72) + 16;
      drawLeaf(ctx, x, y, 8, colors[i % colors.length], Math.sin(timeSec * 2 + i) * 0.6);
    }
  }
  function drawTitleBanner(ctx, state, w) {
    drawRoundedRect(ctx, 22, 19, w - 40, 80, 18);
    ctx.fillStyle = "rgba(58, 38, 22, 0.14)";
    ctx.fill();
    drawRoundedRect(ctx, 20, 16, w - 40, 80, 18);
    const bg = ctx.createLinearGradient(0, 16, 0, 96);
    bg.addColorStop(0, "#FFFEFA");
    bg.addColorStop(1, "#FBEAD0");
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    drawRoundedRect(ctx, 25, 21, w - 50, 70, 14);
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = "rgba(229, 169, 59, 0.72)";
    ctx.stroke();
    drawStar(ctx, 42, 56, 10, PALETTE.sunGold);
    drawStar(ctx, w - 42, 56, 10, PALETTE.sunGold);
    ctx.textAlign = "center";
    ctx.fillStyle = PALETTE.ink;
    ctx.font = "800 20px Georgia, serif";
    ctx.fillText(formatPrimary(UI_TEXT.gameTitle, state.langMode), w / 2, 50);
    const sub = formatSecondary(UI_TEXT.gameTitle, state.langMode) || formatPrimary(UI_TEXT.gameSubtitle, state.langMode);
    ctx.fillStyle = PALETTE.terracottaDark;
    ctx.font = "700 15px system-ui, -apple-system, sans-serif";
    ctx.fillText(sub, w / 2, 78);
  }
  function drawEasterOverlay(ctx, state, w, jesusX, treeX, friendX, topY) {
    if (state.easterTimer <= 0 || state.easterSource === "none") {
      return;
    }
    const line = getEasterLine(state.easterSource, state.easterLineIndex);
    if (!line) {
      return;
    }
    const anchorX = state.easterSource === "jesus" ? jesusX : state.easterSource === "tree" ? treeX : friendX;
    drawSpeechBubble(
      ctx,
      anchorX,
      topY,
      formatPrimary(line, state.langMode),
      formatSecondary(line, state.langMode),
      w,
      anchorX
    );
  }
  function renderLoavesPlay(ctx, state, stage, w, h, timeSec) {
    drawGalileeBackdrop(ctx, w, h, timeSec);
    if (stage.prayGlowTimer > 0 || !stage.prayedWithJesus) {
      drawSunRays(ctx, w * 0.5, 118, stage.prayedWithJesus ? 165 : 105, timeSec, 0.34);
    }
    drawJesus(ctx, w * 0.5, 162, 1.05, stage.prayedWithJesus ? "celebrate" : "bless", timeSec);
    if (stage.prayGlowTimer > 0) {
      drawHeartBurst(ctx, w * 0.5, 106, stage.prayGlowTimer / 1.6, timeSec);
    }
    if (!stage.prayedWithJesus) {
      drawChildFriend(ctx, w * 0.25, 186, 0.92, "#6BA8C9", true, timeSec);
      drawWovenBasket(ctx, w * 0.5, 212, 1, 3);
      const johnRef = getVerseById("john_6_11").reference;
      drawRoundedRect(ctx, 32, 256, w - 64, 82, 16);
      ctx.fillStyle = "rgba(255, 248, 235, 0.95)";
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = PALETTE.ink;
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillStyle = PALETTE.terracottaDark;
      ctx.font = "800 16px system-ui, -apple-system, sans-serif";
      ctx.fillText(formatPrimary(johnRef, state.langMode), w / 2, 282);
      ctx.fillStyle = PALETTE.ink;
      ctx.font = "700 14px system-ui, -apple-system, sans-serif";
      ctx.fillText(formatPrimary(UI_TEXT.s1TapPrayCanvas, state.langMode), w / 2, 306);
      const secHint = formatSecondary(UI_TEXT.s1TapPrayCanvas, state.langMode);
      if (secHint) {
        ctx.fillStyle = PALETTE.mutedInk;
        ctx.font = "700 12px system-ui, -apple-system, sans-serif";
        ctx.fillText(secHint, w / 2, 326);
      }
      return;
    }
    const seats = [0.14, 0.3, 0.7, 0.86];
    const tunics = ["#D46A43", "#6BA8C9", "#6F9463", "#E5A93B"];
    for (let i = 0; i < seats.length; i++) {
      drawChildFriend(ctx, w * seats[i], h - 18, 0.65, tunics[i], stage.sharedCount > i * 2, timeSec + i);
    }
    if (state.ageMode === "adventurer") {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 253, 245, 0.45)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const wx = (timeSec * 90 + i * 140) % (w + 60) - 30;
        const wy = 195 + i * 58;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.quadraticCurveTo(wx + 22, wy - 7, wx + 44, wy);
        ctx.stroke();
      }
      ctx.restore();
    }
    for (let i = 0; i < stage.items.length; i++) {
      const it = stage.items[i];
      const ix = it.x * w;
      const iy = it.y * h;
      if (it.itemType === "loaf") {
        drawBarleyLoaf(ctx, ix, iy, 1.05);
      } else if (it.itemType === "fish") {
        drawFish(ctx, ix, iy, 1.05);
      } else if (it.itemType === "gust") {
        drawWindGustLeaf(ctx, ix, iy, 1.05, timeSec);
      } else {
        drawBlessingToken(ctx, ix, iy, 1, timeSec);
      }
    }
    if (stage.doveRescueTimer > 0) {
      const p = 1 - stage.doveRescueTimer / 0.95;
      const dx = stage.doveRescueX * w + (stage.basketX * w - stage.doveRescueX * w) * p;
      const dy = h * (0.86 - Math.sin(p * Math.PI) * 0.16);
      drawWhiteDove(ctx, dx, dy, 1.15, timeSec * 1.8);
    }
    const wobbleX = stage.wobbleTimer > 0 ? Math.sin(timeSec * 44) * 7 : 0;
    drawWovenBasket(ctx, stage.basketX * w + wobbleX, h * 0.81, 1.15, stage.sharedCount);
    if (state.ageMode === "adventurer") {
      drawAdventurerTimerAndCombo(ctx, w, stage.timeLeftSec, stage.totalTimeSec, stage.streak);
    }
    if (stage.lastPopTimer > 0 && stage.lastPopKey) {
      const pop = UI_TEXT[stage.lastPopKey];
      drawSpeechBubble(
        ctx,
        stage.basketX * w,
        h * 0.56,
        formatPrimary(pop, state.langMode),
        formatSecondary(pop, state.langMode),
        w,
        stage.basketX * w
      );
    }
  }
  function renderRunBackPlay(ctx, state, stage, w, h, timeSec) {
    drawGalileeBackdrop(ctx, w, h, timeSec);
    if (stage.subPhase === "turn_back") {
      drawSunRays(ctx, w * 0.5, 130, 180, timeSec, 0.34);
      ctx.fillStyle = "#EAD1A6";
      ctx.beginPath();
      ctx.moveTo(w * 0.38, 175);
      ctx.lineTo(w * 0.62, 175);
      ctx.lineTo(w * 0.84, h);
      ctx.lineTo(w * 0.16, h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = PALETTE.sandalwood;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      const p = stage.turnBackProgress / 100;
      const ty = h - 38 - p * (h - 236);
      const stepCount = Math.min(7, Math.floor(p * 8));
      for (let i = 0; i < stepCount; i++) {
        const fy = h - 24 - i * 26;
        if (fy > ty + 14) {
          const fx = w * 0.5 + (i % 2 === 0 ? -13 : 13);
          drawGoldenFootprint(ctx, fx, fy, 1, i % 2 === 0 ? -0.15 : 0.15);
        }
      }
      drawJesus(ctx, w * 0.5, 176, 1.18, "welcome", timeSec);
      if (p > 0.55) {
        drawHeartBurst(ctx, w * 0.5, 118, 1 - Math.min(1, (p - 0.55) * 2), timeSec);
      }
      const tScale = 1.15 - p * 0.22;
      drawChildFriend(ctx, w * 0.5, ty, tScale, "#D46A43", true, timeSec * 1.6);
      drawRoundedRect(ctx, 52, 28, w - 104, 24, 12);
      ctx.fillStyle = "#FFF8EB";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = PALETTE.ink;
      ctx.stroke();
      drawRoundedRect(ctx, 56, 32, Math.max(12, (w - 112) * p), 16, 8);
      ctx.fillStyle = PALETTE.sunGold;
      ctx.fill();
      if (state.ageMode === "adventurer") {
        drawAdventurerTimerAndCombo(ctx, w, stage.timeLeftSec, stage.totalTimeSec, stage.streak);
      }
      if (stage.lastPopTimer > 0 && stage.lastPopKey) {
        const pop = UI_TEXT[stage.lastPopKey];
        drawSpeechBubble(
          ctx,
          w * 0.5,
          Math.max(54, ty - 116),
          formatPrimary(pop, state.langMode),
          formatSecondary(pop, state.langMode),
          w,
          w * 0.5
        );
      }
      return;
    }
    ctx.fillStyle = "#EAD1A6";
    ctx.beginPath();
    ctx.moveTo(w * 0.28, 105);
    ctx.lineTo(w * 0.72, 105);
    ctx.lineTo(w * 0.92, h);
    ctx.lineTo(w * 0.08, h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = PALETTE.sandalwood;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.save();
    ctx.setLineDash([12, 12]);
    ctx.strokeStyle = "#C59D6B";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.43, 110);
    ctx.lineTo(w * 0.36, h);
    ctx.moveTo(w * 0.57, 110);
    ctx.lineTo(w * 0.64, h);
    ctx.stroke();
    ctx.restore();
    drawCross(ctx, w * 0.5, 86, 15, PALETTE.sunGold);
    const laneX = [w * 0.24, w * 0.5, w * 0.76];
    for (let i = 0; i < stage.items.length; i++) {
      const it = stage.items[i];
      const x = laneX[it.lane];
      const y = 100 + it.y * (h - 115);
      if (it.itemType === "sparkle") {
        drawBlessingToken(ctx, x, y, 0.95, timeSec + i);
      } else if (it.itemType === "cart") {
        drawMarketCart(ctx, x, y, 0.95);
      } else {
        drawToyBlock(ctx, x, y, 0.95);
      }
    }
    const wobbleX = stage.wobbleTimer > 0 ? Math.sin(timeSec * 42) * 7 : 0;
    drawChildFriend(ctx, laneX[stage.lane] + wobbleX, h - 26, 1.05, "#D46A43", stage.wobbleTimer === 0, timeSec);
    if (state.ageMode === "adventurer") {
      drawAdventurerTimerAndCombo(ctx, w, stage.timeLeftSec, stage.totalTimeSec, stage.streak);
    }
    if (stage.lastPopTimer > 0 && stage.lastPopKey) {
      const pop = UI_TEXT[stage.lastPopKey];
      drawSpeechBubble(
        ctx,
        laneX[stage.lane],
        h - 156,
        formatPrimary(pop, state.langMode),
        formatSecondary(pop, state.langMode),
        w,
        laneX[stage.lane]
      );
    }
  }
  function renderDavidHarpPlay(ctx, state, stage, w, h, timeSec) {
    drawGalileeBackdrop(ctx, w, h, timeSec);
    drawSunRays(ctx, w * 0.5, 92, 130, timeSec, 0.24);
    drawJesus(ctx, w * 0.19, 136, 0.86, "welcome", timeSec);
    drawChildFriend(ctx, w * 0.5, 136, 0.82, "#6BA8C9", true, timeSec);
    drawGoldenHarp(ctx, w * 0.61, 114, 0.88, timeSec);
    drawLittleSheep(ctx, w * 0.84, 134, 1, timeSec);
    const boardX = 28;
    const boardY = 148;
    const boardW = w - 56;
    const boardH = h - 164;
    drawRoundedRect(ctx, boardX + 2, boardY + 4, boardW, boardH, 20);
    ctx.fillStyle = "rgba(56, 36, 20, 0.16)";
    ctx.fill();
    drawRoundedRect(ctx, boardX, boardY, boardW, boardH, 20);
    const boardGrad = ctx.createLinearGradient(boardX, boardY, boardX, boardY + boardH);
    boardGrad.addColorStop(0, "#FFFDF7");
    boardGrad.addColorStop(1, "#F9E7C4");
    ctx.fillStyle = boardGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    drawRoundedRect(ctx, boardX - 4, boardY - 4, boardW + 8, 16, 8);
    const barGrad = ctx.createLinearGradient(boardX, boardY - 4, boardX, boardY + 12);
    barGrad.addColorStop(0, "#E7B454");
    barGrad.addColorStop(1, "#B0732C");
    ctx.fillStyle = barGrad;
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    const zoneCenterY = boardY + boardH * 0.78;
    const zoneH = state.ageMode === "explorer" ? 62 : 36;
    drawRoundedRect(ctx, boardX + 10, zoneCenterY - zoneH / 2, boardW - 20, zoneH, 14);
    const zoneGrad = ctx.createLinearGradient(boardX, zoneCenterY - zoneH / 2, boardX, zoneCenterY + zoneH / 2);
    zoneGrad.addColorStop(0, "rgba(255, 236, 158, 0.52)");
    zoneGrad.addColorStop(1, "rgba(246, 196, 83, 0.28)");
    ctx.fillStyle = zoneGrad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = PALETTE.warmGold;
    ctx.stroke();
    const colW = boardW / 4;
    for (let i = 0; i < 4; i++) {
      const spec = HARP_STRING_SPECS[i];
      const sx = boardX + colW * (i + 0.5);
      const glow = stage.stringGlow[i];
      const vibrate = glow > 0 ? Math.sin(timeSec * 55) * 4 * (glow / 0.45) : 0;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(sx, boardY + 14);
      ctx.quadraticCurveTo(sx + vibrate, boardY + boardH * 0.5, sx, boardY + boardH - 26);
      ctx.strokeStyle = glow > 0 ? PALETTE.sunGold : spec.color;
      ctx.lineWidth = glow > 0 ? 5.5 : 3;
      ctx.stroke();
      ctx.beginPath();
      safeArc(ctx, sx, zoneCenterY, glow > 0 ? 18 : 13, 0, Math.PI * 2);
      ctx.fillStyle = glow > 0 ? "rgba(246, 196, 83, 0.75)" : "rgba(255, 253, 247, 0.9)";
      ctx.fill();
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = spec.color;
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillStyle = PALETTE.ink;
      ctx.font = "800 12px system-ui, -apple-system, sans-serif";
      ctx.fillText(spec.noteLabel, sx, boardY + boardH - 8);
      ctx.restore();
    }
    for (let i = 0; i < stage.notes.length; i++) {
      const n = stage.notes[i];
      const spec = HARP_STRING_SPECS[n.stringIndex];
      const nx = boardX + colW * (n.stringIndex + 0.5);
      const ny = boardY + 14 + n.y * (boardH - 40);
      drawMusicNote(ctx, nx, ny, 1, spec.color, n.golden);
    }
    if (stage.doveRescueTimer > 0) {
      drawWhiteDove(ctx, stage.doveRescueX * w, zoneCenterY - 18, 1.08, timeSec * 2);
    }
    if (state.ageMode === "adventurer") {
      drawAdventurerTimerAndCombo(ctx, w, stage.timeLeftSec, stage.totalTimeSec, stage.streak);
    }
    if (stage.lastPopTimer > 0 && stage.lastPopKey) {
      const pop = UI_TEXT[stage.lastPopKey];
      drawSpeechBubble(
        ctx,
        w * 0.5,
        154,
        formatPrimary(pop, state.langMode),
        formatSecondary(pop, state.langMode),
        w
      );
    }
  }
  function renderVerseBuilderPlay(ctx, state, stage, w, h, timeSec) {
    drawGalileeBackdrop(ctx, w, h, timeSec);
    drawJesus(ctx, w * 0.2, 178, 0.88, "welcome", timeSec);
    drawGratitudeOliveTree(ctx, w * 0.82, 200, 128, 126, [], timeSec);
    drawRoundedRect(ctx, 24, 188, w - 44, h - 208, 18);
    ctx.fillStyle = "rgba(56, 36, 20, 0.14)";
    ctx.fill();
    drawRoundedRect(ctx, 22, 184, w - 44, h - 208, 18);
    const scrollGrad = ctx.createLinearGradient(22, 184, 22, h - 24);
    scrollGrad.addColorStop(0, "#FFFDF7");
    scrollGrad.addColorStop(0.5, "#FFF6E0");
    scrollGrad.addColorStop(1, "#F5DFB6");
    ctx.fillStyle = scrollGrad;
    ctx.fill();
    ctx.lineWidth = 2.8;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    drawRoundedRect(ctx, 13, 178, 12, h - 196, 6);
    ctx.fillStyle = "#B87A4B";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    drawRoundedRect(ctx, w - 25, 178, 12, h - 196, 6);
    ctx.fillStyle = "#B87A4B";
    ctx.fill();
    ctx.stroke();
    drawRoundedRect(ctx, 30, 191, w - 60, h - 222, 12);
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = "rgba(229, 169, 59, 0.65)";
    ctx.stroke();
    if (stage.subPhase === "quiz") {
      ctx.textAlign = "center";
      ctx.fillStyle = PALETTE.terracottaDark;
      ctx.font = "800 18px system-ui, -apple-system, sans-serif";
      ctx.fillText(formatPrimary(UI_TEXT.s3QuizKicker, state.langMode), w / 2, 224);
      drawStar(ctx, w / 2 - 48, 286, 18, PALETTE.sunGold);
      drawStar(ctx, w / 2, 274, 24, PALETTE.sunGold);
      drawStar(ctx, w / 2 + 48, 286, 18, PALETTE.sunGold);
      ctx.fillStyle = PALETTE.ink;
      ctx.font = "700 15px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        String(stage.quizCursor + 1) + " / " + String(stage.quizQueue.length),
        w / 2,
        344
      );
      return;
    }
    const verseId = stage.verseQueue[stage.verseCursor];
    const verse = getVerseById(verseId);
    const tiles = getVerseTiles(verseId, state.ageMode);
    ctx.textAlign = "center";
    ctx.fillStyle = PALETTE.terracottaDark;
    ctx.font = "800 17px system-ui, -apple-system, sans-serif";
    ctx.fillText(formatPrimary(verse.reference, state.langMode), w / 2, 218);
    const secRef = formatSecondary(verse.reference, state.langMode);
    if (secRef) {
      ctx.fillStyle = PALETTE.mutedInk;
      ctx.font = "700 13px system-ui, -apple-system, sans-serif";
      ctx.fillText(secRef, w / 2, 236);
    }
    const slotCols = 2;
    const slotW = (w - 84) / slotCols;
    const slotH = tiles.length > 4 ? 46 : 62;
    const startY = secRef ? 250 : 242;
    for (let i = 0; i < tiles.length; i++) {
      const col = i % slotCols;
      const row = Math.floor(i / slotCols);
      const sx = 36 + col * (slotW + 12);
      const sy = startY + row * (slotH + 10);
      const isPlaced = i < stage.placedTileIds.length;
      const isNext = i === stage.placedTileIds.length;
      drawRoundedRect(ctx, sx, sy, slotW, slotH, 12);
      ctx.fillStyle = isPlaced ? "#FCE7B2" : isNext && state.ageMode === "explorer" ? "#FFF2CC" : "#F6EBDC";
      ctx.fill();
      ctx.lineWidth = isNext && state.ageMode === "explorer" ? 2.8 : 2;
      ctx.strokeStyle = isNext && state.ageMode === "explorer" ? PALETTE.terracotta : PALETTE.sandalwood;
      ctx.stroke();
      ctx.textAlign = "center";
      if (isPlaced) {
        const t = tiles[i];
        ctx.fillStyle = PALETTE.ink;
        ctx.font = "700 12px system-ui, -apple-system, sans-serif";
        const label = formatPrimary(t.text, state.langMode);
        ctx.fillText(label.length > 22 ? label.slice(0, 21) + "..." : label, sx + slotW / 2, sy + slotH * 0.44);
        const sec = formatSecondary(t.text, state.langMode);
        if (sec) {
          ctx.fillStyle = PALETTE.mutedInk;
          ctx.font = "600 11px system-ui, -apple-system, sans-serif";
          ctx.fillText(sec.length > 14 ? sec.slice(0, 13) + "..." : sec, sx + slotW / 2, sy + slotH * 0.78);
        }
      } else {
        ctx.fillStyle = PALETTE.mutedInk;
        ctx.font = "800 14px system-ui, -apple-system, sans-serif";
        ctx.fillText("#" + String(i + 1), sx + slotW / 2, sy + slotH * 0.58);
      }
    }
  }
  function renderStageCanvas(ctx, state) {
    const w = STAGE_LOGICAL_W;
    const h = STAGE_LOGICAL_H;
    const t = state.elapsedSec;
    ctx.clearRect(0, 0, w, h);
    if (state.phase === "title") {
      drawGalileeBackdrop(ctx, w, h, t);
      drawGratitudeOliveTree(ctx, w * 0.77, h - 34, 175, 175, [], t, state.treeRustleTimer);
      if (state.jesusGlowTimer > 0) {
        drawSunRays(ctx, w * 0.34, h - 120, 120, t, 0.36);
        drawHeartBurst(ctx, w * 0.34, h - 122, state.jesusGlowTimer / 2.4, t);
      }
      drawJesus(
        ctx,
        w * 0.34,
        h - 36,
        1.32,
        state.jesusGlowTimer > 0 ? "celebrate" : "welcome",
        t
      );
      drawChildFriend(
        ctx,
        w * 0.56,
        h - 32,
        0.92,
        "#D46A43",
        true,
        state.friendHopTimer > 0 ? t * 2.4 : t
      );
      if (state.friendHopTimer > 0) {
        drawStar(ctx, w * 0.56 - 20, h - 98, 8, PALETTE.sunGold);
        drawStar(ctx, w * 0.56 + 20, h - 94, 8, PALETTE.sunGold);
      }
      drawWovenBasket(ctx, w * 0.16, h - 38, 0.78, 3);
      drawFloatingLeaves(ctx, w, h, t);
      drawTitleBanner(ctx, state, w);
      drawEasterOverlay(ctx, state, w, w * 0.34, w * 0.77, w * 0.56, 106);
      drawStorybookFrame(ctx, w, h);
      return;
    }
    if (state.phase === "pass_banner") {
      drawGalileeBackdrop(ctx, w, h, t);
      drawSunRays(ctx, w * 0.5, 165, 140, t, 0.28);
      drawJesus(ctx, w * 0.5, 250, 1.3, "welcome", t);
      drawFloatingLeaves(ctx, w, h, t);
      drawRoundedRect(ctx, 36, 286, w - 72, 110, 20);
      ctx.fillStyle = "rgba(255, 248, 235, 0.94)";
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = PALETTE.ink;
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillStyle = PALETTE.terracottaDark;
      ctx.font = "800 20px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        formatPrimary(UI_TEXT.friendPrefix, state.langMode) + " " + String(state.activePlayerIndex + 1),
        w / 2,
        332
      );
      const nextStageId = STAGE_SEQUENCE[state.stageIndex];
      ctx.fillStyle = PALETTE.ink;
      ctx.font = "700 16px system-ui, -apple-system, sans-serif";
      ctx.fillText(formatPrimary(STAGE_TEXT[nextStageId].title, state.langMode), w / 2, 368);
      return;
    }
    if (state.phase === "stage_intro") {
      drawGalileeBackdrop(ctx, w, h, t);
      const stageId = STAGE_SEQUENCE[state.stageIndex];
      drawSunRays(ctx, w * 0.5, 175, 145, t, 0.25);
      if (stageId === "loaves_and_fish") {
        drawJesus(ctx, w * 0.5, 275, 1.32, "bless", t);
        drawWovenBasket(ctx, w * 0.5, 336, 1.2, 3);
        drawChildFriend(ctx, w * 0.24, 305, 0.95, "#6BA8C9", true, t);
      } else if (stageId === "run_back_to_jesus") {
        drawJesus(ctx, w * 0.34, 286, 1.28, "welcome", t);
        drawChildFriend(ctx, w * 0.68, 294, 1.05, "#D46A43", true, t);
        drawBlessingToken(ctx, w * 0.52, 192, 1.15, t);
      } else if (stageId === "david_harp") {
        drawJesus(ctx, w * 0.25, 288, 1.22, "welcome", t);
        drawChildFriend(ctx, w * 0.55, 292, 1.02, "#6BA8C9", true, t);
        drawGoldenHarp(ctx, w * 0.68, 266, 1.15, t);
        drawLittleSheep(ctx, w * 0.84, 300, 1.1, t);
        drawMusicNote(ctx, w * 0.56, 178, 1, "#D46A43", true);
        drawMusicNote(ctx, w * 0.72, 162, 0.9, "#6F9463", false);
      } else {
        drawJesus(ctx, w * 0.3, 288, 1.2, "celebrate", t);
        drawGratitudeOliveTree(ctx, w * 0.72, 298, 155, 155, [], t);
        drawStar(ctx, w * 0.5, 146, 22, PALETTE.sunGold);
      }
      drawRoundedRect(ctx, 24, 18, w - 48, 66, 16);
      ctx.fillStyle = "rgba(255, 248, 235, 0.94)";
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = PALETTE.ink;
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillStyle = PALETTE.ink;
      ctx.font = "800 19px system-ui, -apple-system, sans-serif";
      ctx.fillText(formatPrimary(STAGE_TEXT[stageId].title, state.langMode), w / 2, 46);
      const sec = formatSecondary(STAGE_TEXT[stageId].title, state.langMode);
      if (sec) {
        ctx.fillStyle = PALETTE.terracottaDark;
        ctx.font = "700 14px system-ui, -apple-system, sans-serif";
        ctx.fillText(sec, w / 2, 70);
      }
      return;
    }
    if (state.phase === "stage_play" && state.stageState) {
      if (state.stageState.kind === "loaves_and_fish") {
        renderLoavesPlay(ctx, state, state.stageState, w, h, t);
      } else if (state.stageState.kind === "run_back_to_jesus") {
        renderRunBackPlay(ctx, state, state.stageState, w, h, t);
      } else if (state.stageState.kind === "david_harp") {
        renderDavidHarpPlay(ctx, state, state.stageState, w, h, t);
      } else {
        renderVerseBuilderPlay(ctx, state, state.stageState, w, h, t);
      }
      drawStorybookFrame(ctx, w, h);
      return;
    }
    if (state.phase === "stage_complete") {
      drawGalileeBackdrop(ctx, w, h, t);
      drawSunRays(ctx, w * 0.5, 150, 170, t, 0.34);
      drawJesus(ctx, w * 0.5, 266, 1.32, "celebrate", t);
      drawFloatingLeaves(ctx, w, h, t);
      const lastRes = state.results[state.results.length - 1];
      const stars = lastRes ? lastRes.stars : 3;
      for (let i = 0; i < 3; i++) {
        drawStar(
          ctx,
          w * 0.5 + (i - 1) * 56,
          74,
          22,
          i < stars ? PALETTE.sunGold : "#E4D7C5"
        );
      }
      if (lastRes) {
        const verse = getVerseById(lastRes.verseUnlocked);
        drawRoundedRect(ctx, 26, 294, w - 52, 118, 18);
        ctx.fillStyle = "rgba(255, 248, 235, 0.95)";
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = PALETTE.ink;
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.fillStyle = PALETTE.terracottaDark;
        ctx.font = "800 17px system-ui, -apple-system, sans-serif";
        ctx.fillText(formatPrimary(verse.reference, state.langMode), w / 2, 326);
        const sec = formatSecondary(verse.reference, state.langMode);
        if (sec) {
          ctx.fillStyle = PALETTE.mutedInk;
          ctx.font = "700 14px system-ui, -apple-system, sans-serif";
          ctx.fillText(sec, w / 2, 350);
        }
        ctx.fillStyle = PALETTE.ink;
        ctx.font = "700 13px system-ui, -apple-system, sans-serif";
        ctx.fillText(
          formatPrimary(UI_TEXT.starsEarned, state.langMode) + ": " + String(stars) + " / 3",
          w / 2,
          388
        );
      }
      return;
    }
    drawGalileeBackdrop(ctx, w, h, t);
    if (state.phase === "journey_finale") {
      drawSunRays(ctx, w * 0.5, 128, 185, t, 0.3);
      drawFloatingLeaves(ctx, w, h, t);
    }
    drawGratitudeOliveTree(ctx, w * 0.64, h - 30, 224, 248, state.prayers, t, state.treeRustleTimer);
    if (state.jesusGlowTimer > 0) {
      drawSunRays(ctx, w * 0.24, h - 118, 115, t, 0.35);
      drawHeartBurst(ctx, w * 0.24, h - 120, state.jesusGlowTimer / 2.4, t);
    }
    drawJesus(
      ctx,
      w * 0.24,
      h - 32,
      1.28,
      state.phase === "journey_finale" || state.jesusGlowTimer > 0 ? "celebrate" : "welcome",
      t
    );
    drawChildFriend(
      ctx,
      w * 0.42,
      h - 26,
      0.85,
      "#D46A43",
      true,
      state.friendHopTimer > 0 ? t * 2.4 : t
    );
    if (state.friendHopTimer > 0) {
      drawStar(ctx, w * 0.42 - 18, h - 88, 7.5, PALETTE.sunGold);
      drawStar(ctx, w * 0.42 + 18, h - 84, 7.5, PALETTE.sunGold);
    }
    if (state.phase === "journey_finale") {
      for (let i = 0; i < 3; i++) {
        const a = t * 1.4 + i * 2.1;
        ctx.beginPath();
        safeArc(ctx, w * 0.5 + Math.cos(a) * 145, 58 + Math.sin(a) * 16, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = PALETTE.sunGold;
        ctx.fill();
      }
    }
    drawEasterOverlay(ctx, state, w, w * 0.24, w * 0.64, w * 0.42, 18);
    drawStorybookFrame(ctx, w, h);
  }

  // thankful_jesus/ts/speech.ts
  function detectLangTag(text, fallback) {
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code >= 19968 && code <= 40959) {
        return "zh-CN";
      }
    }
    return fallback;
  }
  function buildPrayerTreeSegments(prayers, langMode, featuredVerse) {
    const segments = [];
    if (featuredVerse) {
      if (langMode === "en" || langMode === "dual") {
        segments.push({ text: featuredVerse.en, langTag: "en-US" });
      }
      if (langMode === "zh" || langMode === "dual") {
        segments.push({ text: featuredVerse.zh, langTag: "zh-CN" });
      }
    }
    const fallbackTag = langMode === "zh" ? "zh-CN" : "en-US";
    for (let i = 0; i < prayers.length; i++) {
      const p = prayers[i];
      const parts = p.message.split(" / ").map((s) => s.trim()).filter(Boolean);
      if (parts.length === 2) {
        if (langMode === "en" || langMode === "dual") {
          segments.push({ text: p.authorLabel + ": " + parts[0], langTag: detectLangTag(parts[0], "en-US") });
        }
        if (langMode === "zh" || langMode === "dual") {
          segments.push({ text: parts[1], langTag: detectLangTag(parts[1], "zh-CN") });
        }
      } else {
        const combined = p.authorLabel ? p.authorLabel + ": " + p.message : p.message;
        segments.push({ text: combined, langTag: detectLangTag(combined, fallbackTag) });
      }
    }
    return segments;
  }
  function getDefaultHost() {
    if (typeof window === "undefined") {
      return { synth: null, createUtterance: null };
    }
    const win = window;
    if (!win.speechSynthesis || !win.SpeechSynthesisUtterance) {
      return { synth: null, createUtterance: null };
    }
    const UtteranceCtor = win.SpeechSynthesisUtterance;
    return {
      synth: win.speechSynthesis,
      createUtterance: (text) => new UtteranceCtor(text)
    };
  }
  var JourneySpeech = class {
    constructor(host) {
      this.muted = false;
      this.voices = [];
      this.generation = 0;
      this.host = host || getDefaultHost();
      this.refreshVoices();
      if (this.host.synth && "onvoiceschanged" in this.host.synth) {
        this.host.synth.onvoiceschanged = () => {
          this.refreshVoices();
        };
      }
    }
    isSupported() {
      return Boolean(this.host.synth && this.host.createUtterance);
    }
    setMuted(muted) {
      this.muted = muted;
      if (muted) {
        this.stop();
      }
    }
    stop() {
      this.generation += 1;
      if (this.host.synth) {
        try {
          this.host.synth.cancel();
        } catch {
        }
      }
    }
    refreshVoices() {
      if (!this.host.synth || typeof this.host.synth.getVoices !== "function") {
        return;
      }
      try {
        const list = this.host.synth.getVoices();
        if (Array.isArray(list)) {
          this.voices = list;
        }
      } catch {
      }
    }
    speakLocalized(content, langMode) {
      if (this.muted || !this.host.synth || !this.host.createUtterance) {
        return false;
      }
      this.refreshVoices();
      this.stop();
      const token = this.generation;
      if (langMode === "en") {
        return this.speakSingle(content.en, "en-US", 0.92, 1.04, token, null);
      }
      if (langMode === "zh") {
        return this.speakSingle(content.zh, "zh-CN", 0.9, 1.03, token, null);
      }
      return this.speakSingle(content.en, "en-US", 0.92, 1.04, token, () => {
        if (this.muted || this.generation !== token) {
          return;
        }
        this.speakSingle(content.zh, "zh-CN", 0.9, 1.03, token, null);
      });
    }
    speakPlain(text, langTag) {
      return this.speakSequence([{ text, langTag }]);
    }
    speakSequence(segments) {
      if (this.muted || !this.host.synth || !this.host.createUtterance) {
        return false;
      }
      const cleaned = segments.map((s) => ({ text: s.text.trim(), langTag: s.langTag })).filter((s) => s.text.length > 0);
      if (cleaned.length === 0) {
        return false;
      }
      this.refreshVoices();
      this.stop();
      const token = this.generation;
      const runIndex = (idx) => {
        if (this.muted || this.generation !== token || idx >= cleaned.length) {
          return false;
        }
        const seg = cleaned[idx];
        const rate = seg.langTag === "zh-CN" ? 0.9 : 0.92;
        const pitch = seg.langTag === "zh-CN" ? 1.03 : 1.04;
        const hasNext = idx + 1 < cleaned.length;
        return this.speakSingle(
          seg.text,
          seg.langTag,
          rate,
          pitch,
          token,
          hasNext ? () => {
            runIndex(idx + 1);
          } : null
        );
      };
      return runIndex(0);
    }
    pickVoice(langPrefix) {
      if (this.voices.length === 0) {
        return null;
      }
      const preferred = langPrefix === "en" ? ["en-us", "en-gb", "en"] : ["zh-cn", "zh-tw", "zh-hk", "zh"];
      for (let p = 0; p < preferred.length; p++) {
        const prefix = preferred[p];
        let fallbackMatch = null;
        for (let i = 0; i < this.voices.length; i++) {
          const v = this.voices[i];
          const lower = (v.lang || "").toLowerCase();
          if (lower === prefix || lower.startsWith(prefix + "-") || lower.startsWith(prefix + "_")) {
            if (v.localService) {
              return v;
            }
            if (!fallbackMatch) {
              fallbackMatch = v;
            }
          }
        }
        if (fallbackMatch) {
          return fallbackMatch;
        }
      }
      return null;
    }
    speakSingle(text, langTag, rate, pitch, token, onDone) {
      if (!this.host.synth || !this.host.createUtterance) {
        return false;
      }
      const clean = text.trim();
      if (!clean) {
        if (onDone) {
          onDone();
        }
        return false;
      }
      try {
        const utt = this.host.createUtterance(clean);
        utt.lang = langTag;
        utt.rate = rate;
        utt.pitch = pitch;
        const voice = this.pickVoice(langTag === "zh-CN" ? "zh" : "en");
        if (voice) {
          utt.voice = voice;
        }
        utt.onend = () => {
          if (this.generation === token && onDone) {
            onDone();
          }
        };
        utt.onerror = () => {
          if (this.generation === token && onDone) {
            onDone();
          }
        };
        this.host.synth.speak(utt);
        return true;
      } catch {
        return false;
      }
    }
  };

  // thankful_jesus/ts/app.ts
  function makeDualButtonContent(text, langMode) {
    const wrap = document.createElement("span");
    wrap.className = "btn-label";
    const main = document.createElement("span");
    main.className = "btn-main";
    main.textContent = formatPrimary(text, langMode);
    wrap.appendChild(main);
    const sec = formatSecondary(text, langMode);
    if (sec) {
      const sub = document.createElement("span");
      sub.className = "btn-sub";
      sub.textContent = sec;
      wrap.appendChild(sub);
    }
    return wrap;
  }
  function makeBilingualBlock(text, langMode, primaryClass = "bi-primary", secondaryClass = "bi-secondary") {
    const box = document.createElement("div");
    box.className = "bi-block";
    const p = document.createElement("div");
    p.className = primaryClass;
    p.textContent = formatPrimary(text, langMode);
    box.appendChild(p);
    const sec = formatSecondary(text, langMode);
    if (sec) {
      const s = document.createElement("div");
      s.className = secondaryClass;
      s.textContent = sec;
      box.appendChild(s);
    }
    return box;
  }
  function mountThankfulJesusApp() {
    if (typeof document === "undefined") {
      return;
    }
    const canvas = document.getElementById("stage-canvas");
    const deck = document.getElementById("control-deck");
    const hudTitle = document.getElementById("hud-title");
    const hudMeter = document.getElementById("hud-meter");
    const hudListenBtn = document.getElementById("hud-listen-btn");
    const backLink = document.getElementById("back-link");
    const muteBtn = document.getElementById("mute-btn");
    const langEnBtn = document.getElementById("lang-en-btn");
    const langZhBtn = document.getElementById("lang-zh-btn");
    const langDualBtn = document.getElementById("lang-dual-btn");
    const modal = document.getElementById("postcard-modal");
    const modalImg = document.getElementById("postcard-img");
    const modalStatus = document.getElementById("postcard-status");
    const modalShareBtn = document.getElementById("postcard-share-btn");
    const modalCloseBtn = document.getElementById("postcard-close-btn");
    if (!canvas || !deck) {
      return;
    }
    const stageCanvas = canvas;
    const controlDeck = deck;
    const ctx = stageCanvas.getContext("2d");
    if (!ctx) {
      return;
    }
    const stageCtx = ctx;
    const state = createInitialState({
      ageMode: "explorer",
      langMode: "dual",
      playMode: "solo",
      seed: Date.now() & 268435455
    });
    const audio = new JourneyAudio();
    const speech = new JourneySpeech();
    let selectedSticker = "jesus_love";
    let selectedLeafColor = "gold";
    let draftAuthor = "";
    let draftPrayer = "";
    let cachedPostcardCanvas = null;
    let lastDeckKey = "";
    let lastSpokenAutoKey = "";
    const keysHeld = /* @__PURE__ */ new Set();
    let pendingPrimaryTap = false;
    let pendingLanePick = null;
    let pendingHarpString = null;
    let activePointerXNorm = null;
    function unlockAudio() {
      audio.unlock();
    }
    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.round(STAGE_LOGICAL_W * dpr);
      const targetH = Math.round(STAGE_LOGICAL_H * dpr);
      if (stageCanvas.width !== targetW || stageCanvas.height !== targetH) {
        stageCanvas.width = targetW;
        stageCanvas.height = targetH;
      }
      stageCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function getCurrentSpeechPayload() {
      if (state.phase === "title") {
        return {
          en: UI_TEXT.gameTitle.en + ". " + UI_TEXT.gameSubtitle.en,
          zh: UI_TEXT.gameTitle.zh + "\u3002" + UI_TEXT.gameSubtitle.zh
        };
      }
      if (state.phase === "stage_intro") {
        const id = STAGE_SEQUENCE[state.stageIndex];
        return {
          en: STAGE_TEXT[id].title.en + ". " + STAGE_TEXT[id].story.en,
          zh: STAGE_TEXT[id].title.zh + "\u3002" + STAGE_TEXT[id].story.zh
        };
      }
      if (state.phase === "stage_play" && state.stageState) {
        if (state.stageState.kind === "loaves_and_fish") {
          const v = getVerseById("john_6_11");
          return v.text;
        }
        if (state.stageState.kind === "run_back_to_jesus") {
          const v = getVerseById("luke_17_15_16");
          return v.text;
        }
        if (state.stageState.kind === "david_harp") {
          const v = getVerseById("psalm_100_4");
          return v.text;
        }
        if (state.stageState.subPhase === "quiz") {
          const q = QUIZ_QUESTIONS[state.stageState.quizQueue[state.stageState.quizCursor]];
          return q ? q.question : null;
        }
        const vId = state.stageState.verseQueue[state.stageState.verseCursor];
        return getVerseById(vId).text;
      }
      if (state.phase === "stage_complete") {
        const last = state.results[state.results.length - 1];
        if (last) {
          const v = getVerseById(last.verseUnlocked);
          return {
            en: v.reference.en + ". " + v.text.en,
            zh: v.reference.zh + "\u3002" + v.text.zh
          };
        }
      }
      if (state.phase === "journey_finale") {
        const v = getVerseById("thess_5_18");
        const prayerEn = state.prayers.map((p) => p.message).join(". ");
        return {
          en: v.text.en + (prayerEn ? " " + prayerEn : ""),
          zh: v.text.zh + (prayerEn ? " " + prayerEn : "")
        };
      }
      if (state.phase === "prayer_card") {
        return UI_TEXT.prayerHeader;
      }
      return null;
    }
    function speakCurrentScreen() {
      unlockAudio();
      if (state.phase === "journey_finale") {
        const segs = buildPrayerTreeSegments(
          state.prayers,
          state.langMode,
          getVerseById("thess_5_18").text
        );
        speech.speakSequence(segs);
        return;
      }
      if (state.phase === "prayer_card" && state.prayers.length > 0) {
        const segs = buildPrayerTreeSegments(state.prayers, state.langMode);
        speech.speakSequence(segs);
        return;
      }
      const payload = getCurrentSpeechPayload();
      if (payload) {
        speech.speakLocalized(payload, state.langMode);
      }
    }
    function maybeAutoRead() {
      if (!state.autoRead || state.muted || !speech.isSupported()) {
        return;
      }
      const key = state.phase + ":" + String(state.stageIndex) + ":" + (state.stageState && state.stageState.kind === "verse_builder" ? state.stageState.subPhase + ":" + String(state.stageState.quizCursor) : "");
      if (key === lastSpokenAutoKey) {
        return;
      }
      if (state.phase === "stage_intro" || state.phase === "stage_complete" || state.phase === "journey_finale") {
        lastSpokenAutoKey = key;
        const payload = getCurrentSpeechPayload();
        if (payload) {
          speech.speakLocalized(payload, state.langMode);
        }
      }
    }
    function updateTopBar() {
      if (backLink) {
        backLink.textContent = "<- " + formatPrimary(UI_TEXT.backGames, state.langMode);
      }
      if (langEnBtn) {
        langEnBtn.classList.toggle("active", state.langMode === "en");
      }
      if (langZhBtn) {
        langZhBtn.classList.toggle("active", state.langMode === "zh");
      }
      if (langDualBtn) {
        langDualBtn.classList.toggle("active", state.langMode === "dual");
      }
      if (muteBtn) {
        muteBtn.textContent = state.muted ? formatPrimary(UI_TEXT.sfxOff, state.langMode) : formatPrimary(UI_TEXT.sfxOn, state.langMode);
      }
      if (modalShareBtn) {
        modalShareBtn.textContent = formatPrimary(UI_TEXT.modalShare, state.langMode);
      }
      if (modalCloseBtn) {
        modalCloseBtn.textContent = formatPrimary(UI_TEXT.modalClose, state.langMode);
      }
    }
    function updateHud() {
      if (!hudTitle || !hudMeter) {
        return;
      }
      if (hudListenBtn) {
        hudListenBtn.style.display = speech.isSupported() ? "inline-flex" : "none";
        hudListenBtn.textContent = formatPrimary(UI_TEXT.listenBtn, state.langMode);
      }
      if (state.phase === "title") {
        hudTitle.textContent = formatPrimary(UI_TEXT.gameTitle, state.langMode);
        hudMeter.textContent = formatPrimary(
          state.ageMode === "explorer" ? UI_TEXT.explorerLabel : UI_TEXT.adventurerLabel,
          state.langMode
        );
        return;
      }
      if (state.phase === "stage_intro") {
        const stageId = STAGE_SEQUENCE[state.stageIndex];
        hudTitle.textContent = String(state.stageIndex + 1) + "/" + String(STAGE_SEQUENCE.length) + " " + formatPrimary(STAGE_TEXT[stageId].shortTitle, state.langMode);
        hudMeter.textContent = formatPrimary(
          state.ageMode === "explorer" ? UI_TEXT.explorerLabel : UI_TEXT.adventurerLabel,
          state.langMode
        );
        return;
      }
      if (state.phase === "stage_play" && state.stageState) {
        const stageId = state.stageState.kind;
        hudTitle.textContent = formatPrimary(STAGE_TEXT[stageId].shortTitle, state.langMode);
        if (state.stageState.kind === "loaves_and_fish") {
          const timerStr = state.ageMode === "adventurer" ? " | " + String(Math.ceil(state.stageState.timeLeftSec)) + "s" : "";
          hudMeter.textContent = formatPrimary(UI_TEXT.s1HudUnit, state.langMode) + " " + String(state.stageState.sharedCount) + "/" + String(state.stageState.targetCount) + timerStr;
        } else if (state.stageState.kind === "run_back_to_jesus") {
          const timerStr = state.ageMode === "adventurer" ? " | " + String(Math.ceil(state.stageState.timeLeftSec)) + "s" : "";
          if (state.stageState.subPhase === "turn_back") {
            hudMeter.textContent = formatPrimary(UI_TEXT.s2HudTurn, state.langMode) + " " + String(Math.round(state.stageState.turnBackProgress)) + "%" + timerStr;
          } else {
            hudMeter.textContent = formatPrimary(UI_TEXT.s2HudRoad, state.langMode) + " " + String(state.stageState.sparklesCollected) + "/" + String(state.stageState.targetSparkles) + timerStr;
          }
        } else if (state.stageState.kind === "david_harp") {
          const timerStr = state.ageMode === "adventurer" ? " | " + String(Math.ceil(state.stageState.timeLeftSec)) + "s" : "";
          hudMeter.textContent = formatPrimary(UI_TEXT.sHarpHudUnit, state.langMode) + " " + String(state.stageState.notesPlayed) + "/" + String(state.stageState.targetNotes) + timerStr;
        } else {
          if (state.stageState.subPhase === "quiz") {
            hudMeter.textContent = formatPrimary(UI_TEXT.s3QuizKicker, state.langMode) + " " + String(state.stageState.quizCursor + 1) + "/" + String(state.stageState.quizQueue.length);
          } else {
            hudMeter.textContent = String(state.stageState.verseCursor + 1) + "/" + String(state.stageState.verseQueue.length);
          }
        }
        return;
      }
      if (state.phase === "stage_complete") {
        const last = state.results[state.results.length - 1];
        hudTitle.textContent = formatPrimary(UI_TEXT.starsEarned, state.langMode);
        hudMeter.textContent = String(last ? last.stars : 3) + " / 3";
        return;
      }
      if (state.phase === "prayer_card") {
        hudTitle.textContent = formatPrimary(UI_TEXT.pcPrayerSection, state.langMode);
        hudMeter.textContent = String(state.prayers.length) + "/" + String(MAX_PRAYERS);
        return;
      }
      hudTitle.textContent = formatPrimary(UI_TEXT.pcTitle, state.langMode);
      hudMeter.textContent = formatPrimary(UI_TEXT.starsEarned, state.langMode) + ": " + String(state.totalStars) + "/" + String(STAGE_SEQUENCE.length * 3);
    }
    function computeDeckKey() {
      let extra = "";
      if (state.stageState) {
        if (state.stageState.kind === "loaves_and_fish") {
          extra = state.stageState.prayedWithJesus ? "prayed" : "wait_pray";
        } else if (state.stageState.kind === "run_back_to_jesus") {
          extra = state.stageState.subPhase;
        } else if (state.stageState.kind === "david_harp") {
          extra = "harp";
        } else {
          extra = state.stageState.subPhase + ":" + String(state.stageState.verseCursor) + ":" + String(state.stageState.placedTileIds.length) + ":" + String(state.stageState.wrongShakeTileId || "") + ":" + String(state.stageState.wrongShakeWasDecoy) + ":" + String(state.stageState.quizCursor) + ":" + state.stageState.quizFeedback;
        }
      }
      return [
        state.phase,
        state.langMode,
        state.ageMode,
        state.playMode,
        String(state.playerCount),
        String(state.activePlayerIndex),
        String(state.stageIndex),
        String(state.prayers.length),
        String(state.promptIndex),
        String(state.autoRead),
        selectedSticker,
        selectedLeafColor,
        extra
      ].join("|");
    }
    function buildDeck(force = false) {
      const key = computeDeckKey();
      if (!force && key === lastDeckKey) {
        return;
      }
      lastDeckKey = key;
      controlDeck.innerHTML = "";
      const stack = document.createElement("div");
      stack.className = "deck-stack";
      if (state.phase === "title") {
        const ageRow = document.createElement("div");
        ageRow.className = "seg-row";
        const ageModes = [
          { mode: "explorer", text: UI_TEXT.explorerLabel },
          { mode: "adventurer", text: UI_TEXT.adventurerLabel }
        ];
        for (let i = 0; i < ageModes.length; i++) {
          const item = ageModes[i];
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "seg-btn" + (state.ageMode === item.mode ? " active" : "");
          btn.appendChild(makeDualButtonContent(item.text, state.langMode));
          btn.addEventListener("click", () => {
            unlockAudio();
            applyAction(state, { type: "SET_AGE_MODE", ageMode: item.mode });
            syncAll(true);
          });
          ageRow.appendChild(btn);
        }
        stack.appendChild(ageRow);
        const modeDesc = document.createElement("div");
        modeDesc.className = "mode-desc " + (state.ageMode === "adventurer" ? "adventurer" : "explorer");
        modeDesc.appendChild(
          makeBilingualBlock(
            state.ageMode === "explorer" ? UI_TEXT.explorerDesc : UI_TEXT.adventurerDesc,
            state.langMode
          )
        );
        stack.appendChild(modeDesc);
        if (speech.isSupported()) {
          const speechRow = document.createElement("div");
          speechRow.className = "seg-row";
          const autoBtn = document.createElement("button");
          autoBtn.type = "button";
          autoBtn.className = "ghost-btn";
          autoBtn.appendChild(
            makeDualButtonContent(
              state.autoRead ? UI_TEXT.autoReadOn : UI_TEXT.autoReadOff,
              state.langMode
            )
          );
          autoBtn.addEventListener("click", () => {
            unlockAudio();
            applyAction(state, { type: "TOGGLE_AUTO_READ" });
            syncAll(true);
          });
          speechRow.appendChild(autoBtn);
          stack.appendChild(speechRow);
        }
        const startBtn = document.createElement("button");
        startBtn.type = "button";
        startBtn.className = "primary-btn giant-btn";
        startBtn.appendChild(makeDualButtonContent(UI_TEXT.startJourney, state.langMode));
        startBtn.addEventListener("click", () => {
          unlockAudio();
          applyAction(state, { type: "START_JOURNEY" });
          syncAll(true);
          maybeAutoRead();
        });
        stack.appendChild(startBtn);
        const easterHint = document.createElement("div");
        easterHint.className = "deck-note";
        easterHint.textContent = formatLocalized(UI_TEXT.easterHint, state.langMode, " / ");
        stack.appendChild(easterHint);
        controlDeck.appendChild(stack);
        return;
      }
      if (state.phase === "pass_banner") {
        stack.classList.add("center-stack");
        const badge = document.createElement("div");
        badge.className = "pass-badge";
        badge.textContent = formatPrimary(UI_TEXT.passTitlePrefix, state.langMode) + " " + formatPrimary(UI_TEXT.friendPrefix, state.langMode) + " " + String(state.activePlayerIndex + 1) + "!";
        stack.appendChild(badge);
        const readyBtn = document.createElement("button");
        readyBtn.type = "button";
        readyBtn.className = "primary-btn giant-btn";
        readyBtn.appendChild(makeDualButtonContent(UI_TEXT.readyBtn, state.langMode));
        readyBtn.addEventListener("click", () => {
          unlockAudio();
          applyAction(state, { type: "CONFIRM_PASS" });
          syncAll(true);
          maybeAutoRead();
        });
        stack.appendChild(readyBtn);
        controlDeck.appendChild(stack);
        return;
      }
      if (state.phase === "stage_intro") {
        const stageId = STAGE_SEQUENCE[state.stageIndex];
        const card = document.createElement("div");
        card.className = "story-card";
        card.appendChild(makeBilingualBlock(STAGE_TEXT[stageId].story, state.langMode));
        stack.appendChild(card);
        if (speech.isSupported()) {
          const listenBtn = document.createElement("button");
          listenBtn.type = "button";
          listenBtn.className = "secondary-btn";
          listenBtn.appendChild(makeDualButtonContent(UI_TEXT.listenBtn, state.langMode));
          listenBtn.addEventListener("click", () => {
            speakCurrentScreen();
          });
          stack.appendChild(listenBtn);
        }
        const goBtn = document.createElement("button");
        goBtn.type = "button";
        goBtn.className = "primary-btn big-btn";
        goBtn.appendChild(makeDualButtonContent(UI_TEXT.beginStageBtn, state.langMode));
        goBtn.addEventListener("click", () => {
          unlockAudio();
          speech.stop();
          applyAction(state, { type: "BEGIN_STAGE" });
          syncAll(true);
        });
        stack.appendChild(goBtn);
        controlDeck.appendChild(stack);
        return;
      }
      if (state.phase === "stage_play" && state.stageState) {
        if (state.stageState.kind === "loaves_and_fish") {
          if (!state.stageState.prayedWithJesus) {
            const prayBtn = document.createElement("button");
            prayBtn.type = "button";
            prayBtn.className = "primary-btn giant-btn";
            prayBtn.appendChild(makeDualButtonContent(UI_TEXT.s1PrayBtn, state.langMode));
            prayBtn.addEventListener("click", () => {
              unlockAudio();
              applyAction(state, { type: "PRAY_WITH_JESUS" });
              syncAll(true);
            });
            stack.appendChild(prayBtn);
          } else {
            const track = document.createElement("div");
            track.className = "slide-track";
            track.appendChild(makeBilingualBlock(UI_TEXT.s1SlideHint, state.langMode));
            const updateTrackPointer = (ev) => {
              const rect = track.getBoundingClientRect();
              if (rect.width > 0) {
                activePointerXNorm = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
              }
            };
            track.addEventListener("pointerdown", (ev) => {
              unlockAudio();
              try {
                track.setPointerCapture(ev.pointerId);
              } catch {
              }
              updateTrackPointer(ev);
            });
            track.addEventListener("pointermove", (ev) => {
              if (ev.buttons > 0 || ev.pointerType === "touch") {
                updateTrackPointer(ev);
              }
            });
            track.addEventListener("pointerup", () => {
              activePointerXNorm = null;
            });
            track.addEventListener("pointercancel", () => {
              activePointerXNorm = null;
            });
            stack.appendChild(track);
            const btnRow = document.createElement("div");
            btnRow.className = "seg-row";
            const leftBtn = document.createElement("button");
            leftBtn.type = "button";
            leftBtn.className = "secondary-btn";
            leftBtn.textContent = "<- " + formatPrimary(UI_TEXT.s2LaneLeft, state.langMode);
            leftBtn.addEventListener("pointerdown", () => {
              unlockAudio();
              keysHeld.add("ArrowLeft");
            });
            leftBtn.addEventListener("pointerup", () => keysHeld.delete("ArrowLeft"));
            leftBtn.addEventListener("pointerleave", () => keysHeld.delete("ArrowLeft"));
            const rightBtn = document.createElement("button");
            rightBtn.type = "button";
            rightBtn.className = "secondary-btn";
            rightBtn.textContent = formatPrimary(UI_TEXT.s2LaneRight, state.langMode) + " ->";
            rightBtn.addEventListener("pointerdown", () => {
              unlockAudio();
              keysHeld.add("ArrowRight");
            });
            rightBtn.addEventListener("pointerup", () => keysHeld.delete("ArrowRight"));
            rightBtn.addEventListener("pointerleave", () => keysHeld.delete("ArrowRight"));
            btnRow.appendChild(leftBtn);
            btnRow.appendChild(rightBtn);
            stack.appendChild(btnRow);
          }
          controlDeck.appendChild(stack);
          return;
        }
        if (state.stageState.kind === "run_back_to_jesus") {
          if (state.stageState.subPhase === "turn_back") {
            const note = document.createElement("div");
            note.className = "story-card";
            note.appendChild(makeBilingualBlock(UI_TEXT.s2TurnPrompt, state.langMode));
            stack.appendChild(note);
            const turnBtn = document.createElement("button");
            turnBtn.type = "button";
            turnBtn.className = "primary-btn giant-btn pulse-btn";
            turnBtn.appendChild(makeDualButtonContent(UI_TEXT.s2TurnBtn, state.langMode));
            turnBtn.addEventListener("pointerdown", () => {
              unlockAudio();
              pendingPrimaryTap = true;
            });
            stack.appendChild(turnBtn);
          } else {
            const laneRow = document.createElement("div");
            laneRow.className = "seg-row";
            const lanes = [
              { idx: 0, text: UI_TEXT.s2LaneLeft },
              { idx: 1, text: UI_TEXT.s2LaneMid },
              { idx: 2, text: UI_TEXT.s2LaneRight }
            ];
            for (let i = 0; i < lanes.length; i++) {
              const ln = lanes[i];
              const btn = document.createElement("button");
              btn.type = "button";
              btn.className = "primary-btn lane-btn";
              btn.appendChild(makeDualButtonContent(ln.text, state.langMode));
              btn.addEventListener("pointerdown", () => {
                unlockAudio();
                pendingLanePick = ln.idx;
              });
              laneRow.appendChild(btn);
            }
            stack.appendChild(laneRow);
          }
          controlDeck.appendChild(stack);
          return;
        }
        if (state.stageState.kind === "david_harp") {
          const hint2 = document.createElement("div");
          hint2.className = "deck-note";
          hint2.textContent = formatLocalized(UI_TEXT.sHarpHint, state.langMode, " / ");
          stack.appendChild(hint2);
          const harpRow = document.createElement("div");
          harpRow.className = "harp-grid";
          for (let i = 0; i < HARP_STRING_SPECS.length; i++) {
            const spec = HARP_STRING_SPECS[i];
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "harp-btn";
            btn.dataset.harpString = String(spec.index);
            btn.style.background = spec.color;
            const noteSpan = document.createElement("span");
            noteSpan.className = "harp-note";
            noteSpan.textContent = spec.noteLabel;
            const keySpan = document.createElement("span");
            keySpan.className = "harp-key";
            keySpan.textContent = spec.keyHint;
            btn.appendChild(noteSpan);
            btn.appendChild(keySpan);
            btn.addEventListener("pointerdown", () => {
              unlockAudio();
              pendingHarpString = spec.index;
            });
            harpRow.appendChild(btn);
          }
          stack.appendChild(harpRow);
          controlDeck.appendChild(stack);
          return;
        }
        const vb = state.stageState;
        if (vb.subPhase === "quiz") {
          const qId = vb.quizQueue[vb.quizCursor];
          const q = QUIZ_QUESTIONS[qId];
          if (q) {
            const qCard = document.createElement("div");
            qCard.className = "story-card";
            qCard.appendChild(makeBilingualBlock(q.question, state.langMode));
            stack.appendChild(qCard);
            if (vb.quizFeedback === "retry") {
              const fb = document.createElement("div");
              fb.className = "deck-note retry-note";
              fb.textContent = formatLocalized(UI_TEXT.s3QuizRetry, state.langMode, " / ");
              stack.appendChild(fb);
            }
            for (let i = 0; i < q.choices.length; i++) {
              const choiceIdx = i;
              const cBtn = document.createElement("button");
              cBtn.type = "button";
              cBtn.className = "choice-btn";
              cBtn.appendChild(makeDualButtonContent(q.choices[i], state.langMode));
              cBtn.addEventListener("click", () => {
                unlockAudio();
                if (choiceIdx === q.correctIndex) {
                  speech.speakLocalized(q.encouragement, state.langMode);
                }
                applyAction(state, { type: "ANSWER_QUIZ", choiceIndex: choiceIdx });
                syncAll(true);
              });
              stack.appendChild(cBtn);
            }
          }
          controlDeck.appendChild(stack);
          return;
        }
        const hint = document.createElement("div");
        hint.className = "deck-note" + (vb.wrongShakeWasDecoy && vb.wrongShakeTimer > 0 ? " retry-note" : "");
        hint.textContent = vb.wrongShakeWasDecoy && vb.wrongShakeTimer > 0 ? formatLocalized(UI_TEXT.s3DecoyHint, state.langMode, " / ") : formatPrimary(UI_TEXT.s3Hint, state.langMode);
        stack.appendChild(hint);
        const verseId = vb.verseQueue[vb.verseCursor];
        const allTiles = getVerseTiles(verseId, state.ageMode);
        const decoyDef = getVerseDecoyTile(verseId, state.ageMode);
        const nextExpected = allTiles[vb.placedTileIds.length];
        const tileGrid = document.createElement("div");
        tileGrid.className = "tile-grid";
        for (let i = 0; i < vb.shuffledTileIds.length; i++) {
          const tid = vb.shuffledTileIds[i];
          const def = allTiles.find((t) => t.id === tid) || (decoyDef && decoyDef.id === tid ? decoyDef : void 0);
          if (!def) {
            continue;
          }
          const alreadyPlaced = vb.placedTileIds.indexOf(tid) >= 0;
          const isExplorerHint = !alreadyPlaced && state.ageMode === "explorer" && nextExpected && nextExpected.id === tid;
          const isShaking = vb.wrongShakeTileId === tid && vb.wrongShakeTimer > 0;
          const btn = document.createElement("button");
          btn.type = "button";
          btn.disabled = alreadyPlaced;
          btn.className = "tile-btn" + (alreadyPlaced ? " placed" : "") + (isExplorerHint ? " hint-glow" : "") + (isShaking ? " shake" : "");
          const iconCanvas = document.createElement("canvas");
          iconCanvas.width = 28;
          iconCanvas.height = 28;
          const ictx = iconCanvas.getContext("2d");
          if (ictx) {
            drawTileIcon(ictx, def.icon, 14, 14, 24);
          }
          btn.appendChild(iconCanvas);
          btn.appendChild(makeDualButtonContent(def.text, state.langMode));
          btn.addEventListener("click", () => {
            unlockAudio();
            speech.speakLocalized(def.text, state.langMode);
            applyAction(state, { type: "TAP_VERSE_TILE", tileId: def.id });
            syncAll(true);
          });
          tileGrid.appendChild(btn);
        }
        stack.appendChild(tileGrid);
        controlDeck.appendChild(stack);
        return;
      }
      if (state.phase === "stage_complete") {
        const last = state.results[state.results.length - 1];
        const verse = getVerseById(last ? last.verseUnlocked : "john_6_11");
        const verseBox = document.createElement("div");
        verseBox.className = "verse-card";
        const refEl = document.createElement("div");
        refEl.className = "verse-ref";
        refEl.textContent = formatLocalized(verse.reference, state.langMode, " | ");
        verseBox.appendChild(refEl);
        verseBox.appendChild(makeBilingualBlock(verse.text, state.langMode, "verse-main", "verse-sub"));
        stack.appendChild(verseBox);
        if (speech.isSupported()) {
          const readBtn = document.createElement("button");
          readBtn.type = "button";
          readBtn.className = "secondary-btn";
          readBtn.appendChild(makeDualButtonContent(UI_TEXT.listenVerseBtn, state.langMode));
          readBtn.addEventListener("click", () => {
            speakCurrentScreen();
          });
          stack.appendChild(readBtn);
        }
        const hasMore = state.stageIndex + 1 < STAGE_SEQUENCE.length;
        const nextBtn = document.createElement("button");
        nextBtn.type = "button";
        nextBtn.className = "primary-btn big-btn";
        nextBtn.appendChild(
          makeDualButtonContent(hasMore ? UI_TEXT.nextStageBtn : UI_TEXT.goPrayerBtn, state.langMode)
        );
        nextBtn.addEventListener("click", () => {
          unlockAudio();
          speech.stop();
          applyAction(state, { type: "NEXT_STAGE" });
          syncAll(true);
          maybeAutoRead();
        });
        stack.appendChild(nextBtn);
        controlDeck.appendChild(stack);
        return;
      }
      if (state.phase === "prayer_card") {
        const head = document.createElement("div");
        head.className = "gratitude-head";
        head.appendChild(makeBilingualBlock(UI_TEXT.prayerHeader, state.langMode));
        stack.appendChild(head);
        const colorRow = document.createElement("div");
        colorRow.className = "color-row";
        for (let i = 0; i < LEAF_COLOR_ORDER.length; i++) {
          const color = LEAF_COLOR_ORDER[i];
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = "color-dot" + (selectedLeafColor === color ? " active" : "");
          dot.style.background = LEAF_COLORS[color].fill;
          dot.setAttribute("aria-label", color);
          dot.addEventListener("click", () => {
            selectedLeafColor = color;
            buildDeck(true);
          });
          colorRow.appendChild(dot);
        }
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.maxLength = 20;
        nameInput.className = "note-input name-input";
        nameInput.placeholder = formatPrimary(UI_TEXT.prayerNamePh, state.langMode);
        nameInput.value = draftAuthor;
        nameInput.addEventListener("input", () => {
          draftAuthor = nameInput.value;
        });
        colorRow.appendChild(nameInput);
        stack.appendChild(colorRow);
        const stickerGrid = document.createElement("div");
        stickerGrid.className = "sticker-grid";
        for (let i = 0; i < STICKER_PRESETS.length; i++) {
          const st = STICKER_PRESETS[i];
          const sBtn = document.createElement("button");
          sBtn.type = "button";
          sBtn.className = "sticker-btn" + (selectedSticker === st.id ? " active" : "");
          const ic = document.createElement("canvas");
          ic.width = 30;
          ic.height = 30;
          const ictx = ic.getContext("2d");
          if (ictx) {
            drawStickerIcon(ictx, st.id, 15, 15, 26);
          }
          sBtn.appendChild(ic);
          const lbl = document.createElement("span");
          lbl.textContent = formatPrimary(st.label, state.langMode);
          sBtn.appendChild(lbl);
          sBtn.addEventListener("click", () => {
            unlockAudio();
            selectedSticker = st.id;
            speech.speakLocalized(st.caption, state.langMode);
            buildDeck(true);
          });
          stickerGrid.appendChild(sBtn);
        }
        stack.appendChild(stickerGrid);
        const noteInput = document.createElement("input");
        noteInput.type = "text";
        noteInput.maxLength = MAX_CUSTOM_NOTE_LEN;
        noteInput.className = "note-input";
        noteInput.placeholder = formatPrimary(UI_TEXT.prayerNotePh, state.langMode);
        noteInput.value = draftPrayer;
        noteInput.addEventListener("input", () => {
          draftPrayer = noteInput.value;
        });
        stack.appendChild(noteInput);
        const actionRow = document.createElement("div");
        actionRow.className = "seg-row";
        const hangBtn = document.createElement("button");
        hangBtn.type = "button";
        hangBtn.className = "secondary-btn";
        hangBtn.disabled = state.prayers.length >= MAX_PRAYERS;
        hangBtn.appendChild(makeDualButtonContent(UI_TEXT.hangPrayerBtn, state.langMode));
        hangBtn.addEventListener("click", () => {
          unlockAudio();
          applyAction(state, {
            type: "ADD_PRAYER",
            stickerId: selectedSticker,
            leafColor: selectedLeafColor,
            customMessage: draftPrayer,
            authorLabel: draftAuthor
          });
          draftPrayer = "";
          draftAuthor = "";
          syncAll(true);
        });
        const doneBtn = document.createElement("button");
        doneBtn.type = "button";
        doneBtn.className = "primary-btn";
        doneBtn.appendChild(makeDualButtonContent(UI_TEXT.finishJourneyBtn, state.langMode));
        doneBtn.addEventListener("click", () => {
          unlockAudio();
          applyAction(state, { type: "FINISH_PRAYERS" });
          syncAll(true);
          maybeAutoRead();
        });
        actionRow.appendChild(hangBtn);
        actionRow.appendChild(doneBtn);
        stack.appendChild(actionRow);
        if (speech.isSupported() && state.prayers.length > 0) {
          const readTreeBtn = document.createElement("button");
          readTreeBtn.type = "button";
          readTreeBtn.className = "ghost-btn";
          readTreeBtn.appendChild(makeDualButtonContent(UI_TEXT.readTreeBtn, state.langMode));
          readTreeBtn.addEventListener("click", () => {
            unlockAudio();
            const segs = buildPrayerTreeSegments(state.prayers, state.langMode);
            speech.speakSequence(segs);
          });
          stack.appendChild(readTreeBtn);
        }
        controlDeck.appendChild(stack);
        return;
      }
      const promptCard = document.createElement("div");
      promptCard.className = "prompt-card";
      const kicker = document.createElement("div");
      kicker.className = "prompt-kicker";
      kicker.textContent = formatLocalized(UI_TEXT.finaleKicker, state.langMode, " | ");
      promptCard.appendChild(kicker);
      promptCard.appendChild(
        makeBilingualBlock(getChurchPrompt(state.promptIndex), state.langMode, "prompt-text", "prompt-sub")
      );
      stack.appendChild(promptCard);
      if (speech.isSupported()) {
        const readBtn = document.createElement("button");
        readBtn.type = "button";
        readBtn.className = "secondary-btn";
        readBtn.appendChild(makeDualButtonContent(UI_TEXT.listenPrayerBtn, state.langMode));
        readBtn.addEventListener("click", () => {
          speakCurrentScreen();
        });
        stack.appendChild(readBtn);
      }
      const saveBtn = document.createElement("button");
      saveBtn.type = "button";
      saveBtn.className = "primary-btn big-btn";
      saveBtn.appendChild(makeDualButtonContent(UI_TEXT.saveCardBtn, state.langMode));
      saveBtn.addEventListener("click", async () => {
        unlockAudio();
        cachedPostcardCanvas = renderPostcardCanvas(state);
        const res = await exportPostcard(cachedPostcardCanvas);
        if (modal && modalImg && modalStatus) {
          modalImg.src = res.dataUrl;
          if (res.method === "share") {
            modalStatus.textContent = formatLocalized(UI_TEXT.modalShared, state.langMode, " / ");
          } else if (res.method === "download") {
            modalStatus.textContent = formatLocalized(UI_TEXT.modalDownloaded, state.langMode, " / ");
          } else {
            modalStatus.textContent = formatLocalized(UI_TEXT.modalTipIos, state.langMode, " / ");
          }
          modal.classList.remove("hidden");
        }
      });
      stack.appendChild(saveBtn);
      const bottomRow = document.createElement("div");
      bottomRow.className = "seg-row";
      const shuffleBtn = document.createElement("button");
      shuffleBtn.type = "button";
      shuffleBtn.className = "ghost-btn";
      shuffleBtn.textContent = formatPrimary(UI_TEXT.newPromptBtn, state.langMode);
      shuffleBtn.addEventListener("click", () => {
        unlockAudio();
        applyAction(state, { type: "SHUFFLE_PROMPT" });
        syncAll(true);
      });
      const replayBtn = document.createElement("button");
      replayBtn.type = "button";
      replayBtn.className = "ghost-btn";
      replayBtn.textContent = formatPrimary(UI_TEXT.playAgainBtn, state.langMode);
      replayBtn.addEventListener("click", () => {
        unlockAudio();
        speech.stop();
        applyAction(state, { type: "PLAY_AGAIN" });
        syncAll(true);
      });
      bottomRow.appendChild(shuffleBtn);
      bottomRow.appendChild(replayBtn);
      stack.appendChild(bottomRow);
      controlDeck.appendChild(stack);
    }
    function flushSounds() {
      const sounds = drainSounds(state);
      for (let i = 0; i < sounds.length; i++) {
        audio.play(sounds[i]);
      }
    }
    function syncAll(forceDeck = false) {
      audio.setMuted(state.muted);
      speech.setMuted(state.muted);
      flushSounds();
      updateTopBar();
      updateHud();
      buildDeck(forceDeck);
      renderStageCanvas(stageCtx, state);
    }
    function bindLangBtn(btn, mode) {
      if (!btn) {
        return;
      }
      btn.addEventListener("click", () => {
        unlockAudio();
        applyAction(state, { type: "SET_LANG_MODE", langMode: mode });
        syncAll(true);
      });
    }
    bindLangBtn(langEnBtn, "en");
    bindLangBtn(langZhBtn, "zh");
    bindLangBtn(langDualBtn, "dual");
    if (muteBtn) {
      muteBtn.addEventListener("click", () => {
        unlockAudio();
        applyAction(state, { type: "TOGGLE_MUTE" });
        syncAll(true);
      });
    }
    if (hudListenBtn) {
      hudListenBtn.addEventListener("click", () => {
        speakCurrentScreen();
      });
    }
    if (modalCloseBtn && modal) {
      modalCloseBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
      });
    }
    if (modalShareBtn && modalStatus) {
      modalShareBtn.addEventListener("click", async () => {
        if (!cachedPostcardCanvas) {
          cachedPostcardCanvas = renderPostcardCanvas(state);
        }
        const res = await exportPostcard(cachedPostcardCanvas);
        modalStatus.textContent = res.method === "share" ? formatLocalized(UI_TEXT.modalShared, state.langMode, " / ") : formatLocalized(UI_TEXT.modalTipIos, state.langMode, " / ");
      });
    }
    stageCanvas.addEventListener("pointerdown", (ev) => {
      unlockAudio();
      const rect = stageCanvas.getBoundingClientRect();
      const xNorm = rect.width > 0 ? Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width)) : 0.5;
      const yNorm = rect.height > 0 ? Math.max(0, Math.min(1, (ev.clientY - rect.top) / rect.height)) : 0.5;
      if (state.phase === "title" || state.phase === "prayer_card" || state.phase === "journey_finale") {
        const jesusCutoff = state.phase === "title" ? 0.44 : 0.35;
        const friendCutoff = state.phase === "title" ? 0.62 : 0.5;
        if (yNorm > 0.24) {
          if (xNorm < jesusCutoff) {
            applyAction(state, { type: "POKE_JESUS" });
          } else if (xNorm < friendCutoff && yNorm > 0.52) {
            applyAction(state, { type: "POKE_FRIEND" });
          } else {
            applyAction(state, { type: "POKE_TREE" });
          }
          const line = getEasterLine(state.easterSource, state.easterLineIndex);
          if (line) {
            speech.speakLocalized(line, state.langMode);
          }
          syncAll(false);
        }
        return;
      }
      if (state.phase === "stage_play" && state.stageState) {
        if (state.stageState.kind === "loaves_and_fish") {
          if (!state.stageState.prayedWithJesus) {
            applyAction(state, { type: "PRAY_WITH_JESUS" });
            syncAll(true);
          } else {
            activePointerXNorm = xNorm;
          }
        } else if (state.stageState.kind === "run_back_to_jesus") {
          if (state.stageState.subPhase === "turn_back") {
            pendingPrimaryTap = true;
          } else {
            pendingLanePick = xNorm < 0.36 ? 0 : xNorm > 0.64 ? 2 : 1;
          }
        } else if (state.stageState.kind === "david_harp") {
          const idx = Math.min(3, Math.max(0, Math.floor(xNorm * 4)));
          pendingHarpString = idx;
        }
      }
    });
    stageCanvas.addEventListener("pointermove", (ev) => {
      if ((ev.buttons > 0 || ev.pointerType === "touch") && state.phase === "stage_play" && state.stageState && state.stageState.kind === "loaves_and_fish" && state.stageState.prayedWithJesus) {
        const rect = stageCanvas.getBoundingClientRect();
        if (rect.width > 0) {
          activePointerXNorm = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
        }
      }
    });
    stageCanvas.addEventListener("pointerup", () => {
      activePointerXNorm = null;
    });
    stageCanvas.addEventListener("pointercancel", () => {
      activePointerXNorm = null;
    });
    window.addEventListener("keydown", (ev) => {
      if (document.activeElement && document.activeElement.tagName === "INPUT") {
        return;
      }
      if (ev.key === "ArrowLeft" || ev.key === "a" || ev.key === "A") {
        keysHeld.add("ArrowLeft");
        if (state.phase === "stage_play" && state.stageState && state.stageState.kind === "run_back_to_jesus" && state.stageState.subPhase === "road") {
          pendingLanePick = state.stageState.lane === 2 ? 1 : 0;
        }
      } else if (ev.key === "ArrowRight" || ev.key === "d" || ev.key === "D") {
        keysHeld.add("ArrowRight");
        if (state.phase === "stage_play" && state.stageState && state.stageState.kind === "run_back_to_jesus" && state.stageState.subPhase === "road") {
          pendingLanePick = state.stageState.lane === 0 ? 1 : 2;
        }
      } else if (ev.key === " " || ev.key === "Enter") {
        ev.preventDefault();
        unlockAudio();
        pendingPrimaryTap = true;
      } else if (ev.key === "l" || ev.key === "L") {
        speakCurrentScreen();
      } else if (ev.key === "1" || ev.key === "2" || ev.key === "3" || ev.key === "4") {
        if (state.phase === "stage_play" && state.stageState && state.stageState.kind === "david_harp") {
          unlockAudio();
          pendingHarpString = Number(ev.key) - 1;
        }
      }
    });
    window.addEventListener("keyup", (ev) => {
      if (ev.key === "ArrowLeft" || ev.key === "a" || ev.key === "A") {
        keysHeld.delete("ArrowLeft");
      } else if (ev.key === "ArrowRight" || ev.key === "d" || ev.key === "D") {
        keysHeld.delete("ArrowRight");
      }
    });
    window.addEventListener("resize", () => {
      resizeCanvas();
      renderStageCanvas(stageCtx, state);
    });
    resizeCanvas();
    syncAll(true);
    let lastTs = performance.now();
    function tick(now) {
      const dt = Math.min(0.05, Math.max(0, (now - lastTs) / 1e3));
      lastTs = now;
      const moveDir = (keysHeld.has("ArrowRight") ? 1 : 0) - (keysHeld.has("ArrowLeft") ? 1 : 0);
      const frameInput = {
        primaryTap: pendingPrimaryTap,
        moveDir,
        pointerXNorm: activePointerXNorm,
        lanePick: pendingLanePick,
        harpString: pendingHarpString
      };
      pendingPrimaryTap = false;
      pendingLanePick = null;
      pendingHarpString = null;
      const prevPhase = state.phase;
      stepGame(state, dt, frameInput);
      flushSounds();
      updateHud();
      buildDeck(false);
      if (state.phase === "stage_play" && state.stageState && state.stageState.kind === "david_harp") {
        const harpButtons = controlDeck.querySelectorAll(".harp-btn[data-harp-string]");
        for (let i = 0; i < harpButtons.length; i++) {
          const idx = Number(harpButtons[i].dataset.harpString);
          const shouldGlow = state.ageMode === "explorer" && state.stageState.notes.some(
            (n) => n.stringIndex === idx && n.y >= 0.5 && n.y <= 0.96
          );
          harpButtons[i].classList.toggle("guide-glow", shouldGlow);
        }
      }
      if (state.phase !== prevPhase) {
        maybeAutoRead();
      }
      renderStageCanvas(stageCtx, state);
      window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => mountThankfulJesusApp());
    } else {
      mountThankfulJesusApp();
    }
  }
  return __toCommonJS(app_exports);
})();
  return __ThankfulJesusBundle;
});
