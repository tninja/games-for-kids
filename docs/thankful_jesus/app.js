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
    UI_TEXT: () => UI_TEXT,
    VERSES: () => VERSES,
    VERSE_ORDER: () => VERSE_ORDER,
    applyAction: () => applyAction,
    createInitialState: () => createInitialState,
    createPrayerLeaf: () => createPrayerLeaf,
    drainSounds: () => drainSounds,
    drawStickerIcon: () => drawStickerIcon,
    drawTileIcon: () => drawTileIcon,
    exportPostcard: () => exportPostcard,
    formatLocalized: () => formatLocalized,
    formatPrimary: () => formatPrimary,
    formatSecondary: () => formatSecondary,
    getChurchPrompt: () => getChurchPrompt,
    getStickerPreset: () => getStickerPreset,
    getVerseById: () => getVerseById,
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
    "verse_builder"
  ];
  var STAGE_SPECS = {
    loaves_and_fish: {
      id: "loaves_and_fish",
      verseId: "john_6_11",
      explorerTarget: 10,
      adventurerTarget: 16,
      adventurerTimeSec: 36
    },
    run_back_to_jesus: {
      id: "run_back_to_jesus",
      verseId: "luke_17_15_16",
      explorerTarget: 8,
      adventurerTarget: 12,
      adventurerTimeSec: 34
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
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, rOut * 0.11);
    ctx.strokeStyle = stroke;
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();
  }
  function drawHeart(ctx, cx, cy, size, fill) {
    const s = safeR(size);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    ctx.moveTo(0, s * 0.65);
    ctx.bezierCurveTo(-s * 1.1, -s * 0.05, -s * 0.85, -s * 0.9, 0, -s * 0.32);
    ctx.bezierCurveTo(s * 0.85, -s * 0.9, s * 1.1, -s * 0.05, 0, s * 0.65);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, s * 0.14);
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    ctx.restore();
  }
  function drawCross(ctx, cx, cy, size, fill = PALETTE.sunGold) {
    const s = safeR(size);
    const bar = s * 0.34;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = fill;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = Math.max(1.5, s * 0.12);
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
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(s * 0.85, -s * 0.25, 0, s);
    ctx.quadraticCurveTo(-s * 0.85, -s * 0.25, 0, -s);
    ctx.closePath();
    ctx.fillStyle = spec.fill;
    ctx.fill();
    ctx.lineWidth = Math.max(1.4, s * 0.12);
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.65);
    ctx.lineTo(0, s * 1.15);
    ctx.strokeStyle = spec.vein;
    ctx.lineWidth = Math.max(1.2, s * 0.1);
    ctx.stroke();
    ctx.restore();
  }
  function drawSunRays(ctx, cx, cy, radius, timeSec, alpha = 0.28) {
    const r = safeR(radius);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(timeSec * 0.15);
    ctx.fillStyle = "rgba(246, 196, 83, " + String(alpha) + ")";
    const rays = 12;
    for (let i = 0; i < rays; i++) {
      const a = i * Math.PI * 2 / rays;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a - 0.12) * r, Math.sin(a - 0.12) * r);
      ctx.lineTo(Math.cos(a + 0.12) * r, Math.sin(a + 0.12) * r);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
  function drawGalileeBackdrop(ctx, w, h, timeSec) {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
    sky.addColorStop(0, "#D8EEF7");
    sky.addColorStop(0.55, "#F9ECCE");
    sky.addColorStop(1, "#FBE1B8");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    drawSunRays(ctx, w * 0.82, h * 0.16, 95, timeSec, 0.22);
    ctx.save();
    ctx.beginPath();
    safeArc(ctx, w * 0.82, h * 0.16, 28, 0, Math.PI * 2);
    ctx.fillStyle = "#FFE394";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#E5A93B";
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "#B6C9A4";
    ctx.beginPath();
    ctx.moveTo(0, h * 0.56);
    ctx.quadraticCurveTo(w * 0.25, h * 0.43, w * 0.55, h * 0.54);
    ctx.quadraticCurveTo(w * 0.82, h * 0.46, w, h * 0.55);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#9ACCE0";
    ctx.fillRect(0, h * 0.55, w, h * 0.12);
    ctx.strokeStyle = "rgba(255, 253, 247, 0.55)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const y = h * (0.58 + i * 0.025);
      const shift = Math.sin(timeSec * 1.4 + i) * 8;
      ctx.beginPath();
      ctx.moveTo(w * (0.12 + i * 0.16) + shift, y);
      ctx.lineTo(w * (0.28 + i * 0.16) + shift, y);
      ctx.stroke();
    }
    ctx.fillStyle = "#A9C17D";
    ctx.beginPath();
    ctx.moveTo(0, h * 0.65);
    ctx.quadraticCurveTo(w * 0.5, h * 0.59, w, h * 0.66);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
  }
  function drawJesus(ctx, cx, baseY, scale, pose, timeSec) {
    const s = safeR(scale);
    const bob = Math.sin(timeSec * 2.2) * 1.6 * s;
    ctx.save();
    ctx.translate(cx, baseY + bob);
    ctx.scale(s, s);
    ctx.save();
    ctx.beginPath();
    safeArc(ctx, 0, -68, 25 + Math.sin(timeSec * 3) * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(246, 196, 83, 0.34)";
    ctx.fill();
    ctx.beginPath();
    safeArc(ctx, 0, -68, 19, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(229, 169, 59, 0.72)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(-18, -44);
    ctx.lineTo(18, -44);
    ctx.lineTo(25, 0);
    ctx.quadraticCurveTo(0, 6, -25, 0);
    ctx.closePath();
    ctx.fillStyle = PALETTE.robeCream;
    ctx.fill();
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-16, -44);
    ctx.lineTo(-4, -44);
    ctx.lineTo(18, -2);
    ctx.lineTo(4, -2);
    ctx.closePath();
    ctx.fillStyle = PALETTE.sashCrimson;
    ctx.fill();
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (pose === "bless") {
      ctx.beginPath();
      ctx.moveTo(-16, -36);
      ctx.quadraticCurveTo(-30, -44, -20, -56);
      ctx.moveTo(16, -36);
      ctx.quadraticCurveTo(30, -44, 20, -56);
      ctx.strokeStyle = PALETTE.robeCream;
      ctx.lineWidth = 10;
      ctx.stroke();
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.fillStyle = "#F0C39B";
      ctx.beginPath();
      safeArc(ctx, -20, -58, 4.5, 0, Math.PI * 2);
      safeArc(ctx, 20, -58, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      const handY = pose === "celebrate" ? -50 : -34;
      ctx.beginPath();
      ctx.moveTo(-16, -36);
      ctx.lineTo(-32, handY);
      ctx.moveTo(16, -36);
      ctx.lineTo(32, handY);
      ctx.strokeStyle = PALETTE.robeCream;
      ctx.lineWidth = 9.5;
      ctx.stroke();
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.fillStyle = "#F0C39B";
      ctx.beginPath();
      safeArc(ctx, -33, handY, 4.5, 0, Math.PI * 2);
      safeArc(ctx, 33, handY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = "#5B3B24";
    ctx.beginPath();
    safeEllipse(ctx, 0, -64, 17, 19, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.fillStyle = "#F3C79F";
    ctx.beginPath();
    safeArc(ctx, 0, -66, 13.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#5B3B24";
    ctx.beginPath();
    safeArc(ctx, 0, -62, 11, 0.2, Math.PI - 0.2);
    ctx.quadraticCurveTo(0, -49, -10.5, -60);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = PALETTE.ink;
    ctx.beginPath();
    safeArc(ctx, -4.5, -68, 1.8, 0, Math.PI * 2);
    safeArc(ctx, 4.5, -68, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#FFF8EB";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    safeArc(ctx, 0, -63, 4.2, 0.25, Math.PI - 0.25);
    ctx.stroke();
    ctx.restore();
  }
  function drawChildFriend(ctx, cx, baseY, scale, tunicColor, happy, timeSec) {
    const s = safeR(scale);
    const hop = happy ? Math.abs(Math.sin(timeSec * 6)) * 5 * s : Math.sin(timeSec * 2.5) * 1.2 * s;
    ctx.save();
    ctx.translate(cx, baseY - hop);
    ctx.scale(s, s);
    ctx.fillStyle = tunicColor;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-12, -32);
    ctx.lineTo(12, -32);
    ctx.lineTo(16, 0);
    ctx.lineTo(-16, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    const armY = happy ? -40 : -20;
    ctx.beginPath();
    ctx.moveTo(-11, -26);
    ctx.lineTo(-22, armY);
    ctx.moveTo(11, -26);
    ctx.lineTo(22, armY);
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.fillStyle = "#F5CAA3";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    safeArc(ctx, 0, -44, 11.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#4A3222";
    ctx.beginPath();
    safeArc(ctx, 0, -46, 11.5, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.ink;
    ctx.beginPath();
    safeArc(ctx, -3.8, -44, 1.6, 0, Math.PI * 2);
    safeArc(ctx, 3.8, -44, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    safeArc(ctx, 0, -41, 4, 0.2, Math.PI - 0.2);
    ctx.lineWidth = 1.7;
    ctx.stroke();
    ctx.restore();
  }
  function drawBarleyLoaf(ctx, cx, cy, scale = 1) {
    const s = safeR(scale);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    ctx.fillStyle = "#DF9D4B";
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    safeEllipse(ctx, 0, 0, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#9C5B1D";
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
    ctx.fillStyle = "#7AB5CE";
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    safeEllipse(ctx, -2, 0, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(19, -7);
    ctx.lineTo(19, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = PALETTE.ink;
    ctx.beginPath();
    safeArc(ctx, -8, -1.5, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function drawWovenBasket(ctx, cx, cy, scale = 1, filledCount = 0) {
    const s = safeR(scale);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    if (filledCount > 0) {
      drawBarleyLoaf(ctx, -12, -10, 0.72);
      drawBarleyLoaf(ctx, 11, -10, 0.72);
      if (filledCount > 2) {
        drawFish(ctx, 0, -14, 0.7);
      }
    }
    ctx.fillStyle = "#C98B4B";
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-34, -8);
    ctx.lineTo(34, -8);
    ctx.lineTo(25, 18);
    ctx.quadraticCurveTo(0, 23, -25, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    drawRoundedRect(ctx, -37, -12, 74, 8, 4);
    ctx.fillStyle = "#A86C32";
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#7D4C1E";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-26, 4);
    ctx.lineTo(26, 4);
    ctx.moveTo(-14, -4);
    ctx.lineTo(-10, 17);
    ctx.moveTo(0, -4);
    ctx.lineTo(0, 19);
    ctx.moveTo(14, -4);
    ctx.lineTo(10, 17);
    ctx.stroke();
    ctx.restore();
  }
  function drawBlessingToken(ctx, cx, cy, scale = 1, timeSec = 0) {
    const s = safeR(scale);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    ctx.beginPath();
    safeArc(ctx, 0, 0, 18 + Math.sin(timeSec * 6) * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(246, 196, 83, 0.45)";
    ctx.fill();
    drawStar(ctx, 0, 0, 14, PALETTE.sunGold);
    ctx.restore();
  }
  function drawMarketCart(ctx, cx, cy, scale = 1) {
    const s = safeR(scale);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    drawRoundedRect(ctx, -20, -12, 40, 20, 5);
    ctx.fillStyle = "#B67346";
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = PALETTE.ink;
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
    ctx.fillStyle = "#E0846C";
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    ctx.fillStyle = "#FFF8EB";
    ctx.beginPath();
    safeArc(ctx, 0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function drawGratitudeOliveTree(ctx, cx, baseY, width, height, prayers, timeSec) {
    const w = safeR(width);
    const h = safeR(height);
    const trunkW = w * 0.16;
    const trunkH = h * 0.42;
    ctx.save();
    ctx.fillStyle = "#8C5A37";
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - trunkW * 0.7, baseY);
    ctx.quadraticCurveTo(cx - trunkW * 0.4, baseY - trunkH * 0.5, cx - trunkW * 0.45, baseY - trunkH);
    ctx.lineTo(cx + trunkW * 0.45, baseY - trunkH);
    ctx.quadraticCurveTo(cx + trunkW * 0.4, baseY - trunkH * 0.5, cx + trunkW * 0.7, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    const canopyTop = baseY - h;
    const canopyCenterY = baseY - h * 0.62;
    const puffs = [
      { dx: -w * 0.26, dy: h * 0.04, rx: w * 0.25, ry: h * 0.22, fill: "#6D9361" },
      { dx: w * 0.26, dy: h * 0.04, rx: w * 0.25, ry: h * 0.22, fill: "#7FA56E" },
      { dx: 0, dy: -h * 0.08, rx: w * 0.34, ry: h * 0.27, fill: "#8BB174" },
      { dx: -w * 0.12, dy: h * 0.11, rx: w * 0.22, ry: h * 0.18, fill: "#789E68" },
      { dx: w * 0.14, dy: h * 0.11, rx: w * 0.22, ry: h * 0.18, fill: "#86AB70" }
    ];
    for (let i = 0; i < puffs.length; i++) {
      const p = puffs[i];
      ctx.beginPath();
      safeEllipse(ctx, cx + p.dx, canopyCenterY + p.dy, p.rx, p.ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = p.fill;
      ctx.fill();
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = PALETTE.ink;
      ctx.stroke();
    }
    const boxLeft = cx - w * 0.46;
    const boxTop = canopyTop + h * 0.06;
    const boxW = w * 0.92;
    const boxH = h * 0.62;
    for (let i = 0; i < prayers.length; i++) {
      const leaf = prayers[i];
      const slot = TREE_LEAF_SLOTS[leaf.treeSlot % TREE_LEAF_SLOTS.length];
      const sway = Math.sin(timeSec * 2.1 + i * 0.9) * 0.08;
      const lx = boxLeft + slot.x * boxW;
      const ly = boxTop + slot.y * boxH;
      drawLeaf(ctx, lx, ly, Math.max(10, w * 0.055), leaf.leafColor, slot.tilt + sway);
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
    }
  };
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
      ]
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
      ]
    }
  };
  var BUILDER_VERSE_QUEUE = ["psalm_107_1", "thess_5_18"];
  var ADVENTURER_QUIZ_ORDER = ["q_loaves", "q_leper"];
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
    }
  };
  function getVerseById(id) {
    return VERSES[id];
  }
  function getVerseTiles(verseId, ageMode) {
    const verse = VERSES[verseId];
    return ageMode === "adventurer" ? verse.adventurerTiles : verse.explorerTiles;
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
        spawnTimer: 0.35,
        nextItemId: 1,
        items: [],
        lastPopText: "",
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
        lastPopText: "",
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
  function stepLoavesStage(stage, ageMode, dt, input, rng, sounds) {
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
        stage.lastPopText = "Amen!";
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
      const itemType = r < 0.24 ? "blessing" : r < 0.64 ? "loaf" : "fish";
      stage.items.push({
        id: stage.nextItemId++,
        x: 0.15 + rng() * 0.7,
        y: 0.1,
        vy: (isExplorer ? 0.3 : 0.42) + rng() * 0.1,
        itemType
      });
      stage.spawnTimer = isExplorer ? 0.78 : 0.56;
    }
    const catchRadius = isExplorer ? 0.165 : 0.125;
    const remaining = [];
    for (let i = 0; i < stage.items.length; i++) {
      const item = stage.items[i];
      item.y += item.vy * dt;
      if (isExplorer && item.itemType === "blessing" && item.y > 0.38) {
        item.x += (stage.basketX - item.x) * Math.min(1, dt * 2.2);
      }
      if (item.y >= 0.73 && item.y <= 0.88 && Math.abs(item.x - stage.basketX) <= catchRadius) {
        stage.sharedCount += 1;
        stage.streak += 1;
        if (item.itemType === "blessing") {
          stage.blessingsCollected += 1;
          stage.score += 120 + stage.streak * 15;
          stage.lastPopText = "+Blessing!";
          sounds.push("blessing_token");
        } else {
          stage.score += 65 + stage.streak * 10;
          stage.lastPopText = "+Shared!";
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
      stage.roadProgress = clamp(stage.roadProgress + dt * (isExplorer ? 0.048 : 0.056), 0, 1);
      stage.spawnTimer -= dt;
      if (stage.spawnTimer <= 0) {
        const r = rng();
        const lane = Math.floor(rng() * 3) % 3;
        const itemType = r < (isExplorer ? 0.72 : 0.62) ? "sparkle" : r < 0.84 ? "cart" : "toy";
        stage.items.push({
          id: stage.nextItemId++,
          lane,
          y: 0.08,
          itemType
        });
        stage.spawnTimer = isExplorer ? 0.8 : 0.56;
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
            stage.lastPopText = "+Grace!";
            stage.lastPopTimer = 0.6;
            sounds.push("blessing_token");
          } else {
            stage.wobbleTimer = 0.45;
            stage.lastPopText = "Oops!";
            stage.lastPopTimer = 0.55;
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
      if (stage.sparklesCollected >= stage.targetSparkles || stage.roadProgress >= 1 || !isExplorer && stage.timeLeftSec <= 8) {
        stage.subPhase = "turn_back";
        stage.items = [];
        stage.lastPopText = "Turn Back!";
        stage.lastPopTimer = 1;
        sounds.push("pray_blessing");
      }
      return false;
    }
    const tapped = input.primaryTap || input.lanePick !== null;
    if (tapped) {
      const step = isExplorer ? 18 : 14;
      stage.turnBackProgress = clamp(stage.turnBackProgress + step, 0, 100);
      stage.score += 45;
      stage.lastPopText = "Thank You Jesus!";
      stage.lastPopTimer = 0.5;
      sounds.push("turn_step");
    } else if (stage.turnBackProgress > 12) {
      stage.turnBackProgress = Math.max(12, stage.turnBackProgress - dt * (isExplorer ? 2.5 : 5));
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
  function stepVerseBuilderStage(stage, dt) {
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
      const stars2 = stage.turnBackProgress >= 100 && (isExplorer || ratio >= 0.8) ? 3 : stage.turnBackProgress >= 80 ? 2 : 1;
      return {
        stageId: stage.kind,
        playerIndex,
        stars: stars2,
        score: stage.score,
        tokensCollected: stage.sparklesCollected,
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
    lanePick: null
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
    const playMode = config.playMode || "solo";
    const requestedCount = config.playerCount ?? (playMode === "pass_and_play" ? 2 : 1);
    const playerCount = playMode === "solo" ? 1 : Math.max(2, Math.min(4, requestedCount));
    return {
      phase: "title",
      ageMode: config.ageMode || "explorer",
      langMode: config.langMode || "dual",
      playMode,
      playerCount,
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
      pendingSounds: []
    };
  }
  function stepGame(state, dtSec, input = EMPTY_INPUT) {
    const dt = Math.max(0, Math.min(0.08, dtSec));
    state.elapsedSec += dt;
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
        if (state.playMode === "pass_and_play" && state.playerCount > 1) {
          state.stageState = null;
          state.phase = "pass_banner";
        } else {
          enterCurrentStage(state);
        }
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
          state.stageState.lastPopText = "Amen!";
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
            if (state.playMode === "pass_and_play" && state.playerCount > 1) {
              state.activePlayerIndex = (state.activePlayerIndex + 1) % state.playerCount;
              state.stageState = null;
              state.phase = "pass_banner";
            } else {
              enterCurrentStage(state);
            }
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
    bg.addColorStop(0, "#FFFBF2");
    bg.addColorStop(1, "#F7E3BE");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    drawRoundedRect(ctx, 32, 32, W - 64, H - 64, 34);
    ctx.fillStyle = "rgba(255, 253, 248, 0.78)";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = PALETTE.sandalwood;
    ctx.stroke();
    drawRoundedRect(ctx, 50, 50, W - 100, H - 100, 26);
    ctx.setLineDash([14, 10]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = PALETTE.terracotta;
    ctx.stroke();
    ctx.restore();
    drawLeaf(ctx, 98, 98, 30, "gold", -0.4);
    drawLeaf(ctx, W - 98, 98, 30, "olive", 0.4);
    drawLeaf(ctx, 98, H - 98, 28, "crimson", -2.5);
    drawLeaf(ctx, W - 98, H - 98, 28, "sky", 2.5);
    ctx.textAlign = "center";
    ctx.fillStyle = PALETTE.ink;
    ctx.font = "800 54px system-ui, -apple-system, sans-serif";
    ctx.fillText(formatPrimary(UI_TEXT.pcTitle, state.langMode), W / 2, 134);
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
    drawRoundedRect(ctx, 22, 18, w - 44, 78, 18);
    ctx.fillStyle = "rgba(255, 248, 235, 0.92)";
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = PALETTE.ink;
    ctx.font = "800 22px system-ui, -apple-system, sans-serif";
    ctx.fillText(formatPrimary(UI_TEXT.gameTitle, state.langMode), w / 2, 50);
    const sub = formatSecondary(UI_TEXT.gameTitle, state.langMode) || formatPrimary(UI_TEXT.gameSubtitle, state.langMode);
    ctx.fillStyle = PALETTE.terracottaDark;
    ctx.font = "700 15px system-ui, -apple-system, sans-serif";
    ctx.fillText(sub, w / 2, 78);
  }
  function renderLoavesPlay(ctx, stage, w, h, timeSec) {
    drawGalileeBackdrop(ctx, w, h, timeSec);
    if (stage.prayGlowTimer > 0 || !stage.prayedWithJesus) {
      drawSunRays(ctx, w * 0.5, 118, stage.prayedWithJesus ? 165 : 105, timeSec, 0.34);
    }
    drawJesus(ctx, w * 0.5, 162, 1.05, stage.prayedWithJesus ? "celebrate" : "bless", timeSec);
    if (!stage.prayedWithJesus) {
      drawChildFriend(ctx, w * 0.25, 186, 0.92, "#6BA8C9", true, timeSec);
      drawWovenBasket(ctx, w * 0.5, 212, 1, 3);
      drawRoundedRect(ctx, 56, 260, w - 112, 66, 16);
      ctx.fillStyle = "rgba(255, 248, 235, 0.94)";
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = PALETTE.ink;
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillStyle = PALETTE.terracottaDark;
      ctx.font = "800 17px system-ui, -apple-system, sans-serif";
      ctx.fillText("John 6:11", w / 2, 286);
      ctx.fillStyle = PALETTE.ink;
      ctx.font = "700 14px system-ui, -apple-system, sans-serif";
      ctx.fillText("Tap below to give thanks with Jesus!", w / 2, 310);
      return;
    }
    const seats = [0.14, 0.3, 0.7, 0.86];
    const tunics = ["#D46A43", "#6BA8C9", "#6F9463", "#E5A93B"];
    for (let i = 0; i < seats.length; i++) {
      drawChildFriend(ctx, w * seats[i], h - 18, 0.65, tunics[i], stage.sharedCount > i * 2, timeSec + i);
    }
    for (let i = 0; i < stage.items.length; i++) {
      const it = stage.items[i];
      const ix = it.x * w;
      const iy = it.y * h;
      if (it.itemType === "loaf") {
        drawBarleyLoaf(ctx, ix, iy, 1.05);
      } else if (it.itemType === "fish") {
        drawFish(ctx, ix, iy, 1.05);
      } else {
        drawBlessingToken(ctx, ix, iy, 1, timeSec);
      }
    }
    drawWovenBasket(ctx, stage.basketX * w, h * 0.81, 1.15, stage.sharedCount);
    if (stage.lastPopTimer > 0 && stage.lastPopText) {
      ctx.textAlign = "center";
      ctx.fillStyle = PALETTE.terracottaDark;
      ctx.font = "800 19px system-ui, -apple-system, sans-serif";
      ctx.fillText(stage.lastPopText, stage.basketX * w, h * 0.7);
    }
  }
  function renderRunBackPlay(ctx, stage, w, h, timeSec) {
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
      drawJesus(ctx, w * 0.5, 176, 1.18, "welcome", timeSec);
      const p = stage.turnBackProgress / 100;
      const ty = h - 38 - p * (h - 236);
      const tScale = 1.15 - p * 0.22;
      drawChildFriend(ctx, w * 0.5, ty, tScale, "#D46A43", true, timeSec * 1.6);
      drawRoundedRect(ctx, 52, 22, w - 104, 24, 12);
      ctx.fillStyle = "#FFF8EB";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = PALETTE.ink;
      ctx.stroke();
      drawRoundedRect(ctx, 56, 26, Math.max(12, (w - 112) * p), 16, 8);
      ctx.fillStyle = PALETTE.sunGold;
      ctx.fill();
      if (stage.lastPopTimer > 0 && stage.lastPopText) {
        ctx.textAlign = "center";
        ctx.fillStyle = PALETTE.terracottaDark;
        ctx.font = "800 18px system-ui, -apple-system, sans-serif";
        ctx.fillText(stage.lastPopText, w * 0.5, Math.max(76, ty - 70));
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
    if (stage.lastPopTimer > 0 && stage.lastPopText) {
      ctx.textAlign = "center";
      ctx.fillStyle = PALETTE.terracottaDark;
      ctx.font = "800 18px system-ui, -apple-system, sans-serif";
      ctx.fillText(stage.lastPopText, laneX[stage.lane], h - 104);
    }
  }
  function renderVerseBuilderPlay(ctx, state, stage, w, h, timeSec) {
    drawGalileeBackdrop(ctx, w, h, timeSec);
    drawJesus(ctx, w * 0.2, 178, 0.88, "welcome", timeSec);
    drawGratitudeOliveTree(ctx, w * 0.82, 200, 128, 126, [], timeSec);
    drawRoundedRect(ctx, 22, 186, w - 44, h - 208, 22);
    ctx.fillStyle = "#FFF9EC";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = PALETTE.ink;
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
      drawGratitudeOliveTree(ctx, w * 0.77, h - 34, 175, 175, [], t);
      drawJesus(ctx, w * 0.34, h - 36, 1.32, "welcome", t);
      drawChildFriend(ctx, w * 0.56, h - 32, 0.92, "#D46A43", true, t);
      drawWovenBasket(ctx, w * 0.16, h - 38, 0.78, 3);
      drawFloatingLeaves(ctx, w, h, t);
      drawTitleBanner(ctx, state, w);
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
        renderLoavesPlay(ctx, state.stageState, w, h, t);
      } else if (state.stageState.kind === "run_back_to_jesus") {
        renderRunBackPlay(ctx, state.stageState, w, h, t);
      } else {
        renderVerseBuilderPlay(ctx, state, state.stageState, w, h, t);
      }
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
    drawGratitudeOliveTree(ctx, w * 0.62, h - 30, 224, 248, state.prayers, t);
    drawJesus(
      ctx,
      w * 0.24,
      h - 32,
      1.28,
      state.phase === "journey_finale" ? "celebrate" : "welcome",
      t
    );
    drawChildFriend(ctx, w * 0.42, h - 26, 0.85, "#D46A43", true, t);
    if (state.phase === "journey_finale") {
      for (let i = 0; i < 3; i++) {
        const a = t * 1.4 + i * 2.1;
        ctx.beginPath();
        safeArc(ctx, w * 0.5 + Math.cos(a) * 145, 58 + Math.sin(a) * 16, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = PALETTE.sunGold;
        ctx.fill();
      }
    }
  }

  // thankful_jesus/ts/speech.ts
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
      if (this.muted || !this.host.synth || !this.host.createUtterance) {
        return false;
      }
      const clean = text.trim();
      if (!clean) {
        return false;
      }
      this.refreshVoices();
      this.stop();
      const token = this.generation;
      const rate = langTag === "zh-CN" ? 0.9 : 0.92;
      return this.speakSingle(clean, langTag, rate, 1.04, token, null);
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
      if (state.phase === "pass_banner" || state.phase === "stage_intro") {
        const stageId = STAGE_SEQUENCE[state.stageIndex];
        hudTitle.textContent = String(state.stageIndex + 1) + "/3 " + formatPrimary(STAGE_TEXT[stageId].shortTitle, state.langMode);
        hudMeter.textContent = formatPrimary(UI_TEXT.friendPrefix, state.langMode) + " " + String(state.activePlayerIndex + 1);
        return;
      }
      if (state.phase === "stage_play" && state.stageState) {
        const stageId = state.stageState.kind;
        hudTitle.textContent = formatPrimary(STAGE_TEXT[stageId].shortTitle, state.langMode);
        if (state.stageState.kind === "loaves_and_fish") {
          const timerStr = state.ageMode === "adventurer" ? " | " + String(Math.ceil(state.stageState.timeLeftSec)) + "s" : "";
          hudMeter.textContent = formatPrimary(UI_TEXT.s1HudUnit, state.langMode) + " " + String(state.stageState.sharedCount) + "/" + String(state.stageState.targetCount) + timerStr;
        } else if (state.stageState.kind === "run_back_to_jesus") {
          if (state.stageState.subPhase === "turn_back") {
            hudMeter.textContent = formatPrimary(UI_TEXT.s2HudTurn, state.langMode) + " " + String(Math.round(state.stageState.turnBackProgress)) + "%";
          } else {
            hudMeter.textContent = formatPrimary(UI_TEXT.s2HudRoad, state.langMode) + " " + String(state.stageState.sparklesCollected) + "/" + String(state.stageState.targetSparkles);
          }
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
      hudMeter.textContent = formatPrimary(UI_TEXT.starsEarned, state.langMode) + ": " + String(state.totalStars) + "/9";
    }
    function computeDeckKey() {
      let extra = "";
      if (state.stageState) {
        if (state.stageState.kind === "loaves_and_fish") {
          extra = state.stageState.prayedWithJesus ? "prayed" : "wait_pray";
        } else if (state.stageState.kind === "run_back_to_jesus") {
          extra = state.stageState.subPhase;
        } else {
          extra = state.stageState.subPhase + ":" + String(state.stageState.verseCursor) + ":" + String(state.stageState.placedTileIds.length) + ":" + String(state.stageState.wrongShakeTileId || "") + ":" + String(state.stageState.quizCursor) + ":" + state.stageState.quizFeedback;
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
        const playerRow = document.createElement("div");
        playerRow.className = "seg-row";
        const playerOptions = [
          { count: 1, text: UI_TEXT.soloLabel },
          { count: 2, text: UI_TEXT.pass2Label },
          { count: 3, text: UI_TEXT.pass3Label },
          { count: 4, text: UI_TEXT.pass4Label }
        ];
        for (let i = 0; i < playerOptions.length; i++) {
          const opt = playerOptions[i];
          const btn = document.createElement("button");
          btn.type = "button";
          const active = opt.count === 1 && state.playMode === "solo" || opt.count > 1 && state.playMode === "pass_and_play" && state.playerCount === opt.count;
          btn.className = "seg-btn" + (active ? " active" : "");
          btn.textContent = formatPrimary(opt.text, state.langMode);
          btn.addEventListener("click", () => {
            unlockAudio();
            applyAction(state, {
              type: "SET_PLAY_MODE",
              playMode: opt.count === 1 ? "solo" : "pass_and_play",
              playerCount: opt.count
            });
            syncAll(true);
          });
          playerRow.appendChild(btn);
        }
        stack.appendChild(playerRow);
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
        hint.className = "deck-note";
        hint.textContent = formatPrimary(UI_TEXT.s3Hint, state.langMode);
        stack.appendChild(hint);
        const verseId = vb.verseQueue[vb.verseCursor];
        const allTiles = getVerseTiles(verseId, state.ageMode);
        const nextExpected = allTiles[vb.placedTileIds.length];
        const tileGrid = document.createElement("div");
        tileGrid.className = "tile-grid";
        for (let i = 0; i < vb.shuffledTileIds.length; i++) {
          const tid = vb.shuffledTileIds[i];
          const def = allTiles.find((t) => t.id === tid);
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
        lanePick: pendingLanePick
      };
      pendingPrimaryTap = false;
      pendingLanePick = null;
      const prevPhase = state.phase;
      stepGame(state, dt, frameInput);
      flushSounds();
      updateHud();
      buildDeck(false);
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
