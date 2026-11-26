(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ThanksgivingWeb = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
"use strict";
var __ThanksgivingBundle = (() => {
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

  // thanksgiving/ts/app.ts
  var app_exports = {};
  __export(app_exports, {
    DISH_SEQUENCE: () => DISH_SEQUENCE,
    DISH_SPECS: () => DISH_SPECS,
    EMPTY_INPUT: () => EMPTY_INPUT,
    LEAF_COLORS: () => LEAF_COLORS,
    MAX_CUSTOM_NOTE_LEN: () => MAX_CUSTOM_NOTE_LEN,
    MAX_LEAVES: () => MAX_LEAVES,
    SNACK_IDS: () => SNACK_IDS,
    SNACK_SPECS: () => SNACK_SPECS,
    STICKER_PRESETS: () => STICKER_PRESETS,
    applyAction: () => applyAction,
    createInitialState: () => createInitialState,
    drainPendingSounds: () => drainPendingSounds,
    drawSnackIcon: () => drawSnackIcon,
    drawStickerIcon: () => drawStickerIcon,
    getChefLabel: () => getChefLabel,
    getCurrentDishId: () => getCurrentDishId,
    getTablePrompt: () => getTablePrompt,
    mountApp: () => mountApp,
    renderPostcardCanvas: () => renderPostcardCanvas,
    renderStageCanvas: () => renderStageCanvas,
    stepGame: () => stepGame
  });

  // thanksgiving/ts/constants.ts
  var PALETTE = {
    parchment: "#FFF6E5",
    warmSky: "#FDE8C8",
    warmPanel: "#F7DEC0",
    mapleCrimson: "#D95D39",
    pumpkinGold: "#F2A541",
    toastedSienna: "#8C4A27",
    sageLeaf: "#6B8F71",
    ink: "#2D2420",
    butter: "#FFE58F",
    cream: "#FFFDF7",
    birdYellow: "#FFD447",
    tableclothRed: "#C94A38",
    skyBlue: "#AED4E6",
    berryPurple: "#A5406B"
  };
  var LEAF_COLORS = {
    crimson: { fill: "#D95D39", vein: "#8E2D15", label: "Crimson" },
    amber: { fill: "#E58A32", vein: "#995111", label: "Amber" },
    gold: { fill: "#F2C14E", vein: "#9C7516", label: "Gold" },
    russet: { fill: "#A85634", vein: "#5E2B14", label: "Russet" }
  };
  var DISH_SEQUENCE = [
    "golden_toast",
    "flying_popcorn",
    "folding_chair",
    "pretzel_platter",
    "pumpkin_pie"
  ];
  var DISH_SPECS = {
    golden_toast: {
      id: "golden_toast",
      title: "Golden Pop-Up Toast",
      shortTitle: "Pop-Up Toast",
      instruction: "Tap CATCH when the toast pops into the golden zone!",
      guestUnlocked: "Little Sister & Puppy Pal",
      cozyTarget: 5,
      bustlingTarget: 7,
      bustlingTimeSec: 32
    },
    flying_popcorn: {
      id: "flying_popcorn",
      title: "Flying Popcorn Bowl",
      shortTitle: "Flying Popcorn",
      instruction: "Slide the bowl to catch popcorn and dodge silly carrots!",
      guestUnlocked: "Grandma & Grandpa",
      cozyTarget: 10,
      bustlingTarget: 16,
      bustlingTimeSec: 34
    },
    folding_chair: {
      id: "folding_chair",
      title: "Runaway Folding Chair!",
      shortTitle: "Folding Chair",
      instruction: "Tap fast to fold and tame the bouncy backyard lawn chair!",
      guestUnlocked: "Neighborhood Friends",
      cozyTarget: 100,
      bustlingTarget: 100,
      bustlingTimeSec: 18
    },
    pretzel_platter: {
      id: "pretzel_platter",
      title: "Pretzel & Jelly Bean Platter",
      shortTitle: "Snack Platter",
      instruction: "Tap the matching snacks in order to fill each party platter!",
      guestUnlocked: "Cousins",
      cozyTarget: 4,
      bustlingTarget: 6,
      bustlingTimeSec: 34
    },
    pumpkin_pie: {
      id: "pumpkin_pie",
      title: "Swirl Pumpkin Pie",
      shortTitle: "Pumpkin Pie",
      instruction: "Swipe or tap to swirl whipped cream, then drop the maple cookie!",
      guestUnlocked: "Mom & Dad",
      cozyTarget: 2,
      bustlingTarget: 3,
      bustlingTimeSec: 32
    }
  };
  var SNACK_IDS = ["pretzel", "orange_bean", "berry_bean", "cider"];
  var SNACK_SPECS = [
    { id: "pretzel", label: "Pretzel", keyHint: "1", accent: "#C77D3A" },
    { id: "orange_bean", label: "Orange Bean", keyHint: "2", accent: "#F29132" },
    { id: "berry_bean", label: "Berry Bean", keyHint: "3", accent: "#A5406B" },
    { id: "cider", label: "Apple Cider", keyHint: "4", accent: "#B8472F" }
  ];
  var STICKER_PRESETS = [
    { id: "family", label: "Family", caption: "Thankful for my family!", accent: "#D95D39" },
    { id: "food", label: "Feast", caption: "Thankful for yummy food!", accent: "#E58A32" },
    { id: "play", label: "Play", caption: "Thankful for fun games together!", accent: "#5A8F7B" },
    { id: "pet", label: "Pets", caption: "Thankful for our furry friends!", accent: "#B06D3B" },
    { id: "home", label: "Home", caption: "Thankful for a cozy home!", accent: "#C95B48" },
    { id: "friend", label: "Friends", caption: "Thankful for kind friends!", accent: "#D49B2A" },
    { id: "laugh", label: "Laughs", caption: "Thankful for silly laughs!", accent: "#D16A47" },
    { id: "nature", label: "Autumn", caption: "Thankful for colorful autumn leaves!", accent: "#6B8F71" }
  ];
  var TABLE_PROMPTS = [
    "Turn to someone nearby and share one thing that made you laugh this year!",
    "What was the yummiest or funniest dish you wish Beagle Chef cooked today?",
    "Say thank you to one person in the room for a small kindness they showed you.",
    "If our family invented a silly Thanksgiving dish, what would we put in it?",
    "Name one cozy memory from this year you would hang on our Gratitude Tree!",
    "Give someone at the table a high-five and tell them one thing they are great at!"
  ];
  var TREE_LEAF_SLOTS = [
    { x: 0.24, y: 0.34, tilt: -0.35 },
    { x: 0.48, y: 0.22, tilt: 0.12 },
    { x: 0.72, y: 0.32, tilt: 0.38 },
    { x: 0.33, y: 0.52, tilt: -0.22 },
    { x: 0.62, y: 0.49, tilt: 0.24 },
    { x: 0.18, y: 0.54, tilt: -0.45 },
    { x: 0.8, y: 0.52, tilt: 0.42 },
    { x: 0.48, y: 0.42, tilt: -0.08 },
    { x: 0.36, y: 0.28, tilt: -0.18 },
    { x: 0.61, y: 0.27, tilt: 0.22 },
    { x: 0.28, y: 0.66, tilt: -0.28 },
    { x: 0.68, y: 0.65, tilt: 0.26 }
  ];
  var MAX_CUSTOM_NOTE_LEN = 48;
  var MAX_LEAVES = 12;
  var STAGE_LOGICAL_W = 420;
  var STAGE_LOGICAL_H = 440;

  // thanksgiving/ts/artwork.ts
  function drawRoundedRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
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
  function drawMapleLeaf(ctx, x, y, size, color, tilt = 0) {
    const spec = LEAF_COLORS[color];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.scale(size / 24, size / 24);
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(6, -10);
    ctx.lineTo(18, -12);
    ctx.lineTo(12, -1);
    ctx.lineTo(20, 7);
    ctx.lineTo(7, 9);
    ctx.lineTo(4, 15);
    ctx.lineTo(0, 12);
    ctx.lineTo(-4, 15);
    ctx.lineTo(-7, 9);
    ctx.lineTo(-20, 7);
    ctx.lineTo(-12, -1);
    ctx.lineTo(-18, -12);
    ctx.lineTo(-6, -10);
    ctx.closePath();
    ctx.fillStyle = spec.fill;
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "round";
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.lineTo(0, 22);
    ctx.moveTo(0, 10);
    ctx.lineTo(0, -14);
    ctx.moveTo(0, 2);
    ctx.lineTo(10, -4);
    ctx.moveTo(0, 2);
    ctx.lineTo(-10, -4);
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = spec.vein;
    ctx.stroke();
    ctx.restore();
  }
  function drawStar(ctx, cx, cy, outerR, fill, stroke = PALETTE.ink) {
    const innerR = outerR * 0.48;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = -Math.PI / 2 + Math.PI * i / 5;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
  function drawBeagleChef(ctx, x, y, scale = 1, mood = "happy", bob = 0) {
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(scale, scale);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const ink = "#1A1614";
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-13, 30);
    ctx.quadraticCurveTo(-24, 24, -22, 16);
    ctx.quadraticCurveTo(-18, 22, -11, 24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(-10, 8);
    ctx.bezierCurveTo(-19, 16, -20, 38, -11, 44);
    ctx.lineTo(12, 44);
    ctx.bezierCurveTo(20, 38, 18, 16, 8, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.ellipse(-11, 24, 5.5, 8.5, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(-6, 46, 9.5, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(9, 46, 10.5, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(15, 44);
    ctx.lineTo(18, 46);
    ctx.moveTo(13, 47);
    ctx.lineTo(17, 48);
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.ellipse(14, 24, 8, 5, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#D94130";
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.2;
    drawRoundedRect(ctx, -11, 5, 22, 6.5, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(7, 6);
    ctx.bezierCurveTo(18, 5, 27, 4, 32, -2);
    ctx.bezierCurveTo(37, -8, 34, -17, 24, -17);
    ctx.bezierCurveTo(16, -17, 13, -16, 10, -20);
    ctx.bezierCurveTo(7, -29, -4, -32, -13, -27);
    ctx.bezierCurveTo(-22, -22, -23, -8, -16, 2);
    ctx.bezierCurveTo(-13, 6, -4, 7, 7, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = ink;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-12, -15);
    ctx.bezierCurveTo(-22, -13, -24, 5, -14, 11);
    ctx.bezierCurveTo(-6, 14, -4, 2, -6, -9);
    ctx.bezierCurveTo(-7, -14, -9, -15, -12, -15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.ellipse(32, -13, 6.2, 5, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.ellipse(30.5, -15, 2, 1.2, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    if (mood === "excited") {
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(5, -16, 3.6, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(4, -22, 4.5, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    } else if (mood === "oops") {
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(5, -17, 3.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(5, -17, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(1, -24);
      ctx.lineTo(8, -26);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.ellipse(5.5, -16.5, 2.2, 3.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(2, -23);
      ctx.quadraticCurveTo(5.5, -25, 9, -23);
      ctx.stroke();
    }
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    if (mood === "oops") {
      ctx.arc(17, -4, 3.8, 0, Math.PI * 2);
    } else if (mood === "excited") {
      ctx.moveTo(8, -5);
      ctx.quadraticCurveTo(17, 2, 26, -5);
      ctx.moveTo(8, -6);
      ctx.lineTo(6, -3);
    } else {
      ctx.moveTo(9, -5);
      ctx.quadraticCurveTo(17, 0, 25, -5);
    }
    ctx.stroke();
    ctx.save();
    ctx.translate(-5, -28);
    ctx.rotate(-0.14);
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(-13, 0);
    ctx.quadraticCurveTo(-21, -13, -9, -17);
    ctx.quadraticCurveTo(-2, -29, 9, -18);
    ctx.quadraticCurveTo(21, -14, 13, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    drawRoundedRect(ctx, -13, -3, 26, 6.5, 2.5);
    ctx.fillStyle = PALETTE.cream;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.restore();
  }
  function drawLittleBird(ctx, x, y, scale = 1, flap = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const ink = "#1A1614";
    const yellow = "#FFE135";
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.moveTo(-3, 13);
    ctx.lineTo(-4, 21);
    ctx.moveTo(-7, 22);
    ctx.lineTo(-4, 21);
    ctx.lineTo(-1, 22);
    ctx.moveTo(2, 13);
    ctx.lineTo(3, 21);
    ctx.moveTo(0, 22);
    ctx.lineTo(3, 21);
    ctx.lineTo(6, 22);
    ctx.stroke();
    ctx.fillStyle = yellow;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-7, 7);
    ctx.lineTo(-15, 5);
    ctx.lineTo(-12, 11);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = yellow;
    ctx.beginPath();
    ctx.ellipse(-1, 6, 6.5, 8.2, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = yellow;
    ctx.beginPath();
    ctx.moveTo(-8, -6);
    ctx.bezierCurveTo(-10, -14, 2, -17, 7, -10);
    ctx.bezierCurveTo(13, -10, 20, -8, 22, -5);
    ctx.bezierCurveTo(20, -1, 13, 0, 7, -1);
    ctx.bezierCurveTo(3, 3, -7, 2, -8, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = yellow;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, -13);
    ctx.lineTo(-11, -21);
    ctx.lineTo(-4, -16);
    ctx.lineTo(-4, -25);
    ctx.lineTo(0, -16);
    ctx.lineTo(4, -24);
    ctx.lineTo(4, -15);
    ctx.lineTo(10, -19);
    ctx.lineTo(6, -12);
    ctx.stroke();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(9, -4);
    ctx.quadraticCurveTo(15, -3, 21, -5);
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(4.5, -8.5, 1.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFD12A";
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.ellipse(-3, 5 - flap * 3.5, 5.5, 3.2, -0.45 - flap * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  function drawToast(ctx, x, y, scale = 1, rotation = 0, buttered = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.fillStyle = PALETTE.toastedSienna;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-20, 22);
    ctx.lineTo(-20, -4);
    ctx.quadraticCurveTo(-28, -22, -10, -24);
    ctx.quadraticCurveTo(0, -27, 10, -24);
    ctx.quadraticCurveTo(28, -22, 20, -4);
    ctx.lineTo(20, 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = buttered ? "#F6C86E" : "#E8B769";
    ctx.beginPath();
    ctx.moveTo(-15, 17);
    ctx.lineTo(-15, -3);
    ctx.quadraticCurveTo(-20, -17, -7, -19);
    ctx.quadraticCurveTo(0, -21, 7, -19);
    ctx.quadraticCurveTo(20, -17, 15, -3);
    ctx.lineTo(15, 17);
    ctx.closePath();
    ctx.fill();
    if (buttered) {
      ctx.fillStyle = PALETTE.butter;
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 1.8;
      drawRoundedRect(ctx, -9, -8, 18, 16, 4);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawPopcornKernel(ctx, x, y, scale = 1, golden = false, rotation = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.fillStyle = golden ? PALETTE.butter : PALETTE.cream;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-5, -3, 7, 0, Math.PI * 2);
    ctx.arc(5, -4, 7, 0, Math.PI * 2);
    ctx.arc(0, 5, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = golden ? PALETTE.pumpkinGold : "#F5DF9B";
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function drawSillyCarrot(ctx, x, y, scale = 1, rotation = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.strokeStyle = PALETTE.sageLeaf;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(-6, -21);
    ctx.moveTo(0, -12);
    ctx.lineTo(0, -23);
    ctx.moveTo(0, -12);
    ctx.lineTo(6, -21);
    ctx.stroke();
    ctx.fillStyle = "#EB7A2D";
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-9, -12);
    ctx.lineTo(9, -12);
    ctx.lineTo(0, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  function drawPumpkinPie(ctx, cx, cy, radius, creamCount, hasCookie) {
    const safeR = Math.max(6, radius);
    const bumpR = Math.max(2, safeR * 0.12);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = "#D4C6B4";
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = Math.max(1.5, Math.min(3, safeR * 0.05));
    ctx.beginPath();
    ctx.arc(0, safeR * 0.04, safeR * 1.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#E0A458";
    const bumps = 18;
    ctx.beginPath();
    for (let i = 0; i < bumps; i++) {
      const a = Math.PI * 2 * i / bumps;
      const bx = Math.cos(a) * (safeR * 1.02);
      const by = Math.sin(a) * (safeR * 1.02);
      ctx.moveTo(bx + bumpR, by);
      ctx.arc(bx, by, bumpR, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, safeR * 1.07, 0, Math.PI * 2);
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = Math.max(1.4, Math.min(2.6, safeR * 0.045));
    ctx.stroke();
    ctx.fillStyle = "#D96F2B";
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(2, safeR * 0.93), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#ED954B";
    ctx.lineWidth = Math.max(1.2, Math.min(4, safeR * 0.05));
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(1, safeR * 0.78), -2.4, -1.2);
    ctx.stroke();
    const totalPuffs = Math.min(16, creamCount);
    for (let i = 0; i < totalPuffs; i++) {
      const a = Math.PI * 2 * i / 16 - Math.PI / 2;
      const r = safeR * 0.66;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      ctx.fillStyle = PALETTE.cream;
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = Math.max(1, Math.min(2, safeR * 0.03));
      ctx.beginPath();
      ctx.arc(px, py, Math.max(1.5, safeR * 0.145), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    if (hasCookie) {
      drawMapleLeaf(ctx, 0, 0, safeR * 0.42, "gold", -0.1);
    }
    ctx.restore();
  }
  function drawMapleTree(ctx, cx, bottomY, width, height, leaves, showEmptySlots = false) {
    ctx.save();
    const trunkW = width * 0.16;
    const trunkH = height * 0.42;
    ctx.fillStyle = PALETTE.toastedSienna;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(cx - trunkW * 0.7, bottomY);
    ctx.quadraticCurveTo(cx - trunkW * 0.45, bottomY - trunkH * 0.5, cx - trunkW * 0.35, bottomY - trunkH);
    ctx.lineTo(cx + trunkW * 0.35, bottomY - trunkH);
    ctx.quadraticCurveTo(cx + trunkW * 0.45, bottomY - trunkH * 0.5, cx + trunkW * 0.7, bottomY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    const canopyTop = bottomY - height;
    const canopyH = height * 0.66;
    const canopyLeft = cx - width * 0.5;
    const puffs = [
      { x: cx - width * 0.24, y: canopyTop + canopyH * 0.56, r: width * 0.23, c: "#E89B48" },
      { x: cx + width * 0.24, y: canopyTop + canopyH * 0.55, r: width * 0.23, c: "#DC7A3A" },
      { x: cx - width * 0.12, y: canopyTop + canopyH * 0.34, r: width * 0.24, c: "#F0B654" },
      { x: cx + width * 0.13, y: canopyTop + canopyH * 0.36, r: width * 0.22, c: "#E38A3E" },
      { x: cx, y: canopyTop + canopyH * 0.48, r: width * 0.26, c: "#EEAA4D" }
    ];
    for (let i = 0; i < puffs.length; i++) {
      const p = puffs[i];
      ctx.fillStyle = p.c;
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    if (showEmptySlots) {
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(45, 36, 32, 0.32)";
      ctx.lineWidth = 1.6;
      for (let i = leaves.length; i < Math.min(6, TREE_LEAF_SLOTS.length); i++) {
        const slot = TREE_LEAF_SLOTS[i];
        const sx = canopyLeft + slot.x * width;
        const sy = canopyTop + slot.y * canopyH;
        ctx.beginPath();
        ctx.arc(sx, sy, 12, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
    for (let i = 0; i < leaves.length; i++) {
      const leaf = leaves[i];
      const slot = TREE_LEAF_SLOTS[leaf.treeSlot % TREE_LEAF_SLOTS.length];
      const lx = canopyLeft + slot.x * width;
      const ly = canopyTop + slot.y * canopyH;
      drawMapleLeaf(ctx, lx, ly, Math.max(15, width * 0.085), leaf.leafColor, slot.tilt);
    }
    ctx.restore();
  }
  function drawGuestCharacter(ctx, x, y, shirtColor, hairColor, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = shirtColor;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 22, 16, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#FAD7B5";
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.arc(0, -3, 14, Math.PI * 1.05, Math.PI * 1.95);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = PALETTE.ink;
    ctx.beginPath();
    ctx.arc(-4.5, -1, 1.8, 0, Math.PI * 2);
    ctx.arc(4.5, -1, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 2, 5, 0.2, Math.PI - 0.2);
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();
  }
  function drawSnackIcon(ctx, id, cx, cy, size) {
    ctx.save();
    ctx.translate(cx, cy);
    const s = size / 28;
    ctx.scale(s, s);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    if (id === "pretzel") {
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 9.5;
      ctx.beginPath();
      ctx.moveTo(-12, 11);
      ctx.bezierCurveTo(-22, -4, -14, -18, 0, -10);
      ctx.bezierCurveTo(14, -18, 22, -4, 12, 11);
      ctx.bezierCurveTo(4, 2, -4, 2, -12, 11);
      ctx.stroke();
      ctx.strokeStyle = "#C77D3A";
      ctx.lineWidth = 5.6;
      ctx.stroke();
      ctx.fillStyle = PALETTE.cream;
      ctx.beginPath();
      ctx.arc(-9, -6, 1.5, 0, Math.PI * 2);
      ctx.arc(8, -7, 1.5, 0, Math.PI * 2);
      ctx.arc(0, 4, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === "orange_bean" || id === "berry_bean") {
      const fill = id === "orange_bean" ? "#F29132" : PALETTE.berryPurple;
      const shine = id === "orange_bean" ? "#FFD08A" : "#E598B8";
      ctx.fillStyle = fill;
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(-14, 4);
      ctx.bezierCurveTo(-18, -11, -3, -16, 4, -8);
      ctx.bezierCurveTo(14, -12, 20, 4, 10, 12);
      ctx.bezierCurveTo(0, 17, -11, 14, -14, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = shine;
      ctx.beginPath();
      ctx.ellipse(-5, -4, 4.5, 2.2, -0.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "#B8472F";
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 2.4;
      drawRoundedRect(ctx, -12, -6, 20, 20, 4);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(9, 4, 6, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();
      ctx.fillStyle = "#E59A3E";
      ctx.beginPath();
      ctx.ellipse(-2, -6, 9, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = PALETTE.toastedSienna;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(1, -6);
      ctx.lineTo(8, -16);
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawFoldingChair(ctx, x, y, scale = 1, tilt = 0, openAmount = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.scale(scale, scale);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const spread = 16 + openAmount * 22;
    ctx.strokeStyle = "#8C98A0";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-spread, 34);
    ctx.lineTo(spread * 0.7, -8);
    ctx.moveTo(spread, 34);
    ctx.lineTo(-spread * 0.7, -8);
    ctx.stroke();
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2;
    ctx.stroke();
    const backTilt = -0.35 + (1 - openAmount) * 0.3;
    ctx.save();
    ctx.translate(-spread * 0.45, -4);
    ctx.rotate(backTilt);
    drawRoundedRect(ctx, -10, -48, 22, 52, 6);
    ctx.fillStyle = PALETTE.cream;
    ctx.fill();
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    ctx.fillStyle = PALETTE.mapleCrimson;
    ctx.fillRect(-8, -42, 18, 9);
    ctx.fillRect(-8, -24, 18, 9);
    ctx.fillRect(-8, -8, 18, 8);
    ctx.restore();
    drawRoundedRect(ctx, -spread * 0.75, -8, spread * 1.55, 16, 6);
    ctx.fillStyle = PALETTE.sageLeaf;
    ctx.fill();
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    ctx.restore();
  }
  function drawBackyardTable(ctx, cx, y, width, guestCount, hasToast, hasPopcorn, hasPie, bob = 0, hasPlatter = false, hasChair = false) {
    ctx.save();
    if (hasChair) {
      drawFoldingChair(ctx, cx + width * 0.52, y + 26, 0.56, 0.04, 0.45);
    }
    const guestPalette = [
      { shirt: "#6B8F71", hair: "#4B3222" },
      { shirt: "#D95D39", hair: "#C9C0B5" },
      { shirt: "#5B85AA", hair: "#6B4423" },
      { shirt: "#E58A32", hair: "#3B281E" },
      { shirt: "#A5406B", hair: "#2D2420" }
    ];
    const visibleGuests = Math.min(5, Math.max(0, guestCount - 2));
    for (let i = 0; i < visibleGuests; i++) {
      const frac = (i + 1) / (visibleGuests + 1);
      const gx = cx - width * 0.44 + frac * width * 0.88;
      const gp = guestPalette[i % guestPalette.length];
      drawGuestCharacter(ctx, gx, y - 24 + (i % 2 === 0 ? bob : -bob), gp.shirt, gp.hair, 0.92);
    }
    ctx.strokeStyle = PALETTE.toastedSienna;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx - width * 0.38, y + 18);
    ctx.lineTo(cx - width * 0.42, y + 62);
    ctx.moveTo(cx + width * 0.38, y + 18);
    ctx.lineTo(cx + width * 0.42, y + 62);
    ctx.stroke();
    const left = cx - width / 2;
    drawRoundedRect(ctx, left, y - 6, width, 28, 8);
    ctx.fillStyle = PALETTE.cream;
    ctx.fill();
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    drawRoundedRect(ctx, left + 10, y + 3, width - 20, 12, 4);
    ctx.fillStyle = PALETTE.tableclothRed;
    ctx.fill();
    if (hasToast) {
      drawToast(ctx, cx - width * 0.33, y - 10, 0.52, -0.1, true);
    }
    if (hasPopcorn) {
      ctx.fillStyle = "#B86E39";
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx - width * 0.11, y - 6, 15, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      drawPopcornKernel(ctx, cx - width * 0.11 - 6, y - 12, 0.62, false);
      drawPopcornKernel(ctx, cx - width * 0.11 + 6, y - 13, 0.62, true);
      drawPopcornKernel(ctx, cx - width * 0.11, y - 17, 0.62, false);
    }
    if (hasPlatter) {
      drawSnackIcon(ctx, "pretzel", cx + width * 0.11, y - 11, 18);
      drawSnackIcon(ctx, "berry_bean", cx + width * 0.17, y - 8, 11);
    }
    if (hasPie) {
      drawPumpkinPie(ctx, cx + width * 0.34, y - 10, 17, 12, true);
    }
    ctx.restore();
  }
  function drawStickerIcon(ctx, id, cx, cy, size) {
    ctx.save();
    ctx.translate(cx, cy);
    const s = size / 24;
    ctx.scale(s, s);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.2;
    switch (id) {
      case "family":
        ctx.fillStyle = PALETTE.mapleCrimson;
        ctx.beginPath();
        ctx.moveTo(0, 13);
        ctx.bezierCurveTo(-18, 2, -16, -15, 0, -5);
        ctx.bezierCurveTo(16, -15, 18, 2, 0, 13);
        ctx.fill();
        ctx.stroke();
        break;
      case "food":
        drawPumpkinPie(ctx, 0, 0, 11, 8, false);
        break;
      case "play":
        drawStar(ctx, 0, 0, 14, PALETTE.pumpkinGold);
        break;
      case "pet":
        ctx.fillStyle = PALETTE.toastedSienna;
        ctx.beginPath();
        ctx.ellipse(0, 5, 8, 6.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-9, -4, 3.3, 0, Math.PI * 2);
        ctx.arc(-3, -9, 3.3, 0, Math.PI * 2);
        ctx.arc(3, -9, 3.3, 0, Math.PI * 2);
        ctx.arc(9, -4, 3.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      case "home":
        ctx.fillStyle = PALETTE.warmPanel;
        ctx.fillRect(-10, -2, 20, 14);
        ctx.strokeRect(-10, -2, 20, 14);
        ctx.fillStyle = PALETTE.mapleCrimson;
        ctx.beginPath();
        ctx.moveTo(-14, -2);
        ctx.lineTo(0, -14);
        ctx.lineTo(14, -2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      case "friend":
        ctx.fillStyle = PALETTE.butter;
        ctx.beginPath();
        ctx.arc(-6, 1, 8, 0, Math.PI * 2);
        ctx.arc(7, -1, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      case "laugh":
        ctx.fillStyle = PALETTE.birdYellow;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 2, 6, 0.1, Math.PI - 0.1);
        ctx.stroke();
        break;
      case "nature":
        drawMapleLeaf(ctx, 0, 0, 15, "crimson", -0.15);
        break;
    }
    ctx.restore();
  }

  // thanksgiving/ts/audio.ts
  var FeastAudio = class {
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
        case "toast_pop":
          this.tone(330, 520, 0.09, "triangle", 0.14, now);
          break;
        case "good_catch":
          this.tone(523.25, 659.25, 0.12, "sine", 0.18, now);
          this.tone(783.99, 783.99, 0.12, "sine", 0.14, now + 0.08);
          break;
        case "bird_rescue":
          this.tone(780, 1040, 0.08, "sine", 0.14, now);
          this.tone(920, 1180, 0.09, "sine", 0.13, now + 0.08);
          break;
        case "silly_bonk":
          this.tone(240, 140, 0.14, "sawtooth", 0.1, now);
          break;
        case "chair_boing":
          this.tone(175, 420, 0.12, "triangle", 0.16, now);
          this.tone(420, 210, 0.14, "sine", 0.13, now + 0.09);
          break;
        case "cream_swirl":
          this.tone(440, 580, 0.07, "sine", 0.1, now);
          break;
        case "dish_win":
          this.tone(523.25, 523.25, 0.11, "triangle", 0.17, now);
          this.tone(659.25, 659.25, 0.11, "triangle", 0.17, now + 0.1);
          this.tone(783.99, 783.99, 0.18, "triangle", 0.19, now + 0.2);
          break;
        case "leaf_hang":
          this.tone(587.33, 659.25, 0.14, "sine", 0.14, now);
          this.tone(880, 880, 0.18, "sine", 0.12, now + 0.09);
          break;
        case "feast_fanfare":
          this.tone(523.25, 523.25, 0.12, "triangle", 0.16, now);
          this.tone(659.25, 659.25, 0.12, "triangle", 0.16, now + 0.11);
          this.tone(783.99, 783.99, 0.14, "triangle", 0.17, now + 0.22);
          this.tone(1046.5, 1046.5, 0.3, "triangle", 0.2, now + 0.34);
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

  // thanksgiving/ts/gratitude.ts
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
  function createGratitudeLeaf(existingCount, stickerId, leafColor, customMessage, authorLabel) {
    if (existingCount >= MAX_LEAVES) {
      return null;
    }
    const preset = getStickerPreset(stickerId);
    const message = sanitizeNote(customMessage, preset.caption);
    const cleanAuthor = sanitizeNote(authorLabel, "Chef " + String(existingCount + 1));
    return {
      id: "leaf_" + String(existingCount + 1),
      authorLabel: cleanAuthor,
      stickerId,
      message,
      leafColor,
      treeSlot: existingCount % TREE_LEAF_SLOTS.length
    };
  }
  function getTablePrompt(index) {
    if (TABLE_PROMPTS.length === 0) {
      return "Share one happy moment from today!";
    }
    const safe = (index % TABLE_PROMPTS.length + TABLE_PROMPTS.length) % TABLE_PROMPTS.length;
    return TABLE_PROMPTS[safe];
  }

  // thanksgiving/ts/minigames.ts
  function makeOrder(length, rng) {
    const out = [];
    for (let i = 0; i < length; i++) {
      const idx = Math.floor(rng() * SNACK_IDS.length) % SNACK_IDS.length;
      out.push(SNACK_IDS[idx]);
    }
    return out;
  }
  function createDishState(dishId, difficulty, rng = () => 0.37) {
    const spec = DISH_SPECS[dishId];
    const isCozy = difficulty === "cozy";
    const target = isCozy ? spec.cozyTarget : spec.bustlingTarget;
    const timeLeftSec = isCozy ? null : spec.bustlingTimeSec;
    if (dishId === "golden_toast") {
      return {
        kind: "golden_toast",
        plated: 0,
        target,
        score: 0,
        streak: 0,
        timeLeftSec,
        spawnTimer: 0.4,
        nextId: 1,
        slices: [],
        toasterSquash: 0,
        birdAssistTimer: 0,
        feedbackText: "Ready to toast!",
        feedbackTimer: 1.2
      };
    }
    if (dishId === "flying_popcorn") {
      return {
        kind: "flying_popcorn",
        caught: 0,
        target,
        score: 0,
        streak: 0,
        timeLeftSec,
        bowlX: 0.5,
        bowlWobble: 0,
        spawnTimer: 0.35,
        nextId: 1,
        items: [],
        birdX: 0.28,
        birdAssistTimer: 0,
        feedbackText: "Slide bowl to catch!",
        feedbackTimer: 1.2
      };
    }
    if (dishId === "folding_chair") {
      return {
        kind: "folding_chair",
        tamedProgress: 0,
        target: 100,
        taps: 0,
        score: 0,
        timeLeftSec,
        chairAngle: 0.25,
        chairHopY: 0,
        springBackTimer: isCozy ? 2.4 : 1.5,
        tamedCelebrateTimer: 0,
        feedbackText: "Whoa! The lawn chair is bouncing!",
        feedbackTimer: 1.4
      };
    }
    if (dishId === "pretzel_platter") {
      const orderLen = isCozy ? 2 : 3;
      return {
        kind: "pretzel_platter",
        plattersDone: 0,
        target,
        score: 0,
        streak: 0,
        timeLeftSec,
        order: makeOrder(orderLen, rng),
        matchedCount: 0,
        wrongFlashTimer: 0,
        platterBounce: 0,
        birdHintTimer: 0,
        feedbackText: "Match the snack order!",
        feedbackTimer: 1.2
      };
    }
    return {
      kind: "pumpkin_pie",
      piesFinished: 0,
      target,
      score: 0,
      timeLeftSec,
      stage: "whipping",
      whipProgress: 0,
      creamDots: [],
      cookieDropY: 0,
      celebrateTimer: 0,
      lastPointerX: null,
      birdAssistTimer: 0,
      feedbackText: "Swirl whipped cream!",
      feedbackTimer: 1.2
    };
  }
  function makeBurst(x, y, color, count, shape, rng) {
    const out = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.PI * 2 * i / count + (rng() - 0.5) * 0.4;
      const speed = 60 + rng() * 110;
      out.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        color,
        size: 4 + rng() * 5,
        life: 0,
        maxLife: 0.45 + rng() * 0.35,
        shape
      });
    }
    return out;
  }
  function computeStars(difficulty, made, target, score) {
    if (difficulty === "cozy") {
      if (made >= target && score >= target * 110) {
        return 3;
      }
      if (made >= target) {
        return 2;
      }
      return 1;
    }
    if (made >= target && score >= target * 130) {
      return 3;
    }
    if (made >= Math.ceil(target * 0.7)) {
      return 2;
    }
    return 1;
  }
  function stepToastDish(dish, difficulty, dt, input, rng) {
    const particles = [];
    const sounds = [];
    const isCozy = difficulty === "cozy";
    dish.toasterSquash = Math.max(0, dish.toasterSquash - dt * 3.5);
    dish.birdAssistTimer = Math.max(0, dish.birdAssistTimer - dt);
    dish.feedbackTimer = Math.max(0, dish.feedbackTimer - dt);
    if (dish.timeLeftSec !== null) {
      dish.timeLeftSec = Math.max(0, dish.timeLeftSec - dt);
    }
    const activeFlying = dish.slices.filter((s) => s.state === "flying").length;
    dish.spawnTimer -= dt;
    const maxSimultaneous = isCozy ? 1 : 2;
    if (dish.spawnTimer <= 0 && activeFlying < maxSimultaneous && dish.plated < dish.target) {
      const startX = 0.42 + rng() * 0.16;
      const vy = isCozy ? -0.92 : -1.06;
      dish.slices.push({
        id: dish.nextId++,
        x: startX,
        y: 0.72,
        vx: (rng() - 0.5) * (isCozy ? 0.12 : 0.24),
        vy,
        rotation: (rng() - 0.5) * 0.25,
        state: "flying",
        age: 0
      });
      dish.toasterSquash = 1;
      dish.spawnTimer = isCozy ? 1.55 : 1.05;
      sounds.push("toast_pop");
    }
    const goldenMinY = isCozy ? 0.14 : 0.2;
    const goldenMaxY = isCozy ? 0.56 : 0.48;
    const anyTap = input.primaryTap || Boolean(input.secondaryTap);
    if (anyTap) {
      let bestIndex = -1;
      let bestDist = 999;
      const idealY = (goldenMinY + goldenMaxY) * 0.5;
      for (let i = 0; i < dish.slices.length; i++) {
        const s = dish.slices[i];
        if (s.state === "flying" && s.y >= goldenMinY && s.y <= goldenMaxY) {
          const d = Math.abs(s.y - idealY);
          if (d < bestDist) {
            bestDist = d;
            bestIndex = i;
          }
        }
      }
      if (bestIndex >= 0) {
        const caught = dish.slices[bestIndex];
        caught.state = input.secondaryTap && !input.primaryTap ? "rescued" : "caught";
        caught.age = 0;
        dish.plated += 1;
        dish.streak += 1;
        const bonus = bestDist < 0.08 ? 40 : 15;
        dish.score += 100 + bonus + Math.min(dish.streak - 1, 4) * 20;
        if (input.secondaryTap && !input.primaryTap) {
          dish.birdAssistTimer = 0.7;
          dish.feedbackText = "Little Bird Butter Catch!";
        } else {
          dish.feedbackText = bestDist < 0.08 ? "Golden Perfect!" : "Yummy Buttered!";
        }
        dish.feedbackTimer = 0.85;
        sounds.push("good_catch");
        particles.push(...makeBurst(caught.x * 420, caught.y * 440, PALETTE.butter, 10, "star", rng));
      } else if (activeFlying > 0) {
        dish.streak = 0;
        dish.feedbackText = "Wait for the golden glow!";
        dish.feedbackTimer = 0.65;
        sounds.push("silly_bonk");
      }
    }
    const gravity = isCozy ? 1.02 : 1.38;
    const kept = [];
    for (let i = 0; i < dish.slices.length; i++) {
      const s = dish.slices[i];
      s.age += dt;
      if (s.state === "flying") {
        s.x = Math.max(0.16, Math.min(0.84, s.x + s.vx * dt));
        s.y += s.vy * dt;
        s.vy += gravity * dt;
        s.rotation += s.vx * 2.2 * dt;
        if (s.y > 0.74 && s.vy > 0) {
          if (isCozy) {
            s.state = "rescued";
            s.age = 0;
            dish.plated += 1;
            dish.score += 80;
            dish.birdAssistTimer = 0.9;
            dish.feedbackText = "Little Bird caught it!";
            dish.feedbackTimer = 0.95;
            sounds.push("bird_rescue");
            particles.push(...makeBurst(s.x * 420, 310, PALETTE.birdYellow, 8, "star", rng));
          } else {
            s.state = "hat_bounce";
            s.age = 0;
            s.vy = -0.35;
            dish.streak = 0;
            dish.feedbackText = "Boing! Off Chef's hat!";
            dish.feedbackTimer = 0.75;
            sounds.push("silly_bonk");
            particles.push(...makeBurst(s.x * 420, 320, PALETTE.pumpkinGold, 6, "crumb", rng));
          }
        }
        kept.push(s);
      } else {
        if (s.state === "hat_bounce") {
          s.y += s.vy * dt;
          s.vy += 1.4 * dt;
          s.rotation += 4 * dt;
        }
        if (s.age < 0.45) {
          kept.push(s);
        }
      }
    }
    dish.slices = kept;
    const done = dish.plated >= dish.target || dish.timeLeftSec !== null && dish.timeLeftSec <= 0;
    if (done) {
      sounds.push("dish_win");
    }
    return {
      completed: done,
      stars: computeStars(difficulty, dish.plated, dish.target, dish.score),
      score: dish.score,
      dishesMade: dish.plated,
      particles,
      sounds
    };
  }
  function stepPopcornDish(dish, difficulty, playMode, dt, input, rng) {
    const particles = [];
    const sounds = [];
    const isCozy = difficulty === "cozy";
    const isCoop = playMode === "laptop_coop";
    dish.bowlWobble = Math.max(0, dish.bowlWobble - dt * 3.2);
    dish.birdAssistTimer = Math.max(0, dish.birdAssistTimer - dt);
    dish.feedbackTimer = Math.max(0, dish.feedbackTimer - dt);
    if (dish.timeLeftSec !== null) {
      dish.timeLeftSec = Math.max(0, dish.timeLeftSec - dt);
    }
    if (input.pointerXNorm !== null) {
      const targetX = Math.max(0.14, Math.min(0.86, input.pointerXNorm));
      dish.bowlX += (targetX - dish.bowlX) * Math.min(1, dt * 18);
    } else if (input.moveDir !== 0) {
      const speed = isCozy ? 0.72 : 0.88;
      dish.bowlX = Math.max(0.14, Math.min(0.86, dish.bowlX + input.moveDir * speed * dt));
    }
    const p2Dir = input.moveDirP2 ?? 0;
    if (isCoop && p2Dir !== 0) {
      const speedP2 = isCozy ? 0.78 : 0.94;
      dish.birdX = Math.max(0.12, Math.min(0.88, dish.birdX + p2Dir * speedP2 * dt));
    }
    dish.spawnTimer -= dt;
    if (dish.spawnTimer <= 0 && dish.caught < dish.target) {
      const roll = rng();
      const carrotChance = isCozy ? 0.14 : 0.24;
      const itemType = roll < carrotChance ? "carrot" : roll < carrotChance + 0.18 ? "golden_kernel" : "kernel";
      const targetLandX = 0.16 + rng() * 0.68;
      const startX = 0.5 + (rng() - 0.5) * 0.14;
      dish.items.push({
        id: dish.nextId++,
        x: startX,
        y: 0.26,
        vx: (targetLandX - startX) * (isCozy ? 0.68 : 0.85),
        vy: -(0.35 + rng() * 0.22),
        itemType,
        rotation: rng() * Math.PI * 2,
        rescued: false
      });
      dish.spawnTimer = isCozy ? 0.78 : 0.52;
      sounds.push("toast_pop");
    }
    const gravity = isCozy ? 0.82 : 1.15;
    const catchHalfW = isCozy ? 0.145 : 0.115;
    const kept = [];
    for (let i = 0; i < dish.items.length; i++) {
      const it = dish.items[i];
      it.x = Math.max(0.08, Math.min(0.92, it.x + it.vx * dt));
      it.y += it.vy * dt;
      it.vy += gravity * dt;
      it.rotation += 2.6 * dt;
      if (isCoop && it.itemType !== "carrot" && it.y >= 0.5 && it.y <= 0.68 && it.vy > 0 && Math.abs(it.x - dish.birdX) <= 0.11) {
        dish.caught += it.itemType === "golden_kernel" ? 2 : 1;
        dish.streak += 1;
        dish.score += (it.itemType === "golden_kernel" ? 180 : 120) + Math.min(dish.streak - 1, 5) * 15;
        dish.birdAssistTimer = 0.5;
        dish.feedbackText = "P2 Bird Air-Scoop!";
        dish.feedbackTimer = 0.7;
        sounds.push("bird_rescue");
        particles.push(...makeBurst(it.x * 420, it.y * 440, PALETTE.birdYellow, 8, "star", rng));
        continue;
      }
      if (it.y >= 0.74 && it.y <= 0.84 && it.vy > 0 && Math.abs(it.x - dish.bowlX) <= catchHalfW) {
        if (it.itemType === "carrot") {
          dish.bowlWobble = 1;
          dish.streak = 0;
          dish.feedbackText = "Oops! Silly carrot!";
          dish.feedbackTimer = 0.8;
          sounds.push("silly_bonk");
          particles.push(...makeBurst(it.x * 420, 340, PALETTE.mapleCrimson, 7, "crumb", rng));
        } else {
          const pts = it.itemType === "golden_kernel" ? 160 : 100;
          dish.caught += it.itemType === "golden_kernel" ? 2 : 1;
          dish.streak += 1;
          dish.score += pts + Math.min(dish.streak - 1, 5) * 15;
          dish.feedbackText = it.itemType === "golden_kernel" ? "Golden Butter Pop! +2" : "Pop! Nice catch!";
          dish.feedbackTimer = 0.7;
          sounds.push("good_catch");
          particles.push(
            ...makeBurst(
              it.x * 420,
              340,
              it.itemType === "golden_kernel" ? PALETTE.butter : PALETTE.cream,
              8,
              "star",
              rng
            )
          );
        }
        continue;
      }
      if (it.y > 0.88) {
        if (isCozy && it.itemType !== "carrot" && !it.rescued) {
          dish.birdX = it.x;
          dish.birdAssistTimer = 0.75;
          dish.caught += 1;
          dish.score += 75;
          dish.feedbackText = "Little Bird scooped it!";
          dish.feedbackTimer = 0.8;
          sounds.push("bird_rescue");
          particles.push(...makeBurst(it.x * 420, 360, PALETTE.birdYellow, 6, "star", rng));
        }
        continue;
      }
      kept.push(it);
    }
    dish.items = kept;
    if (!isCoop && dish.items.length > 0 && dish.birdAssistTimer <= 0) {
      dish.birdX += (dish.items[0].x - dish.birdX) * Math.min(1, dt * 3);
    }
    const done = dish.caught >= dish.target || dish.timeLeftSec !== null && dish.timeLeftSec <= 0;
    if (done) {
      sounds.push("dish_win");
    }
    return {
      completed: done,
      stars: computeStars(difficulty, dish.caught, dish.target, dish.score),
      score: dish.score,
      dishesMade: dish.caught,
      particles,
      sounds
    };
  }
  function stepChairDish(dish, difficulty, dt, input, rng) {
    const particles = [];
    const sounds = [];
    const isCozy = difficulty === "cozy";
    dish.feedbackTimer = Math.max(0, dish.feedbackTimer - dt);
    dish.chairHopY = Math.max(0, dish.chairHopY - dt * 120);
    if (dish.timeLeftSec !== null && dish.tamedProgress < 100) {
      dish.timeLeftSec = Math.max(0, dish.timeLeftSec - dt);
    }
    if (dish.tamedProgress < 100) {
      const tapPower = (input.primaryTap ? 1 : 0) + (input.secondaryTap ? 1 : 0);
      if (tapPower > 0) {
        const gainPerTap = isCozy ? 14 : 11;
        dish.taps += tapPower;
        dish.tamedProgress = Math.min(100, dish.tamedProgress + gainPerTap * tapPower);
        dish.score += 22 * tapPower;
        dish.chairAngle = (dish.taps % 2 === 0 ? 1 : -1) * Math.max(0.05, 0.35 * (1 - dish.tamedProgress / 110));
        dish.chairHopY = 14;
        dish.feedbackText = dish.tamedProgress >= 75 ? "Almost folded! Keep tapping!" : dish.tamedProgress >= 40 ? "Haha! Hold it down!" : "Fold that bouncy chair!";
        dish.feedbackTimer = 0.7;
        sounds.push("good_catch");
        particles.push(...makeBurst(210, 260, PALETTE.pumpkinGold, 5, "star", rng));
        if (dish.tamedProgress >= 100) {
          dish.chairAngle = 0;
          dish.chairHopY = 0;
          dish.tamedCelebrateTimer = 0.7;
          dish.score += 120;
          dish.feedbackText = "Tamed! Chair is ready for guests!";
          dish.feedbackTimer = 1;
          sounds.push("dish_win");
          particles.push(...makeBurst(210, 240, PALETTE.butter, 14, "star", rng));
        }
      } else {
        dish.springBackTimer -= dt;
        if (dish.springBackTimer <= 0) {
          dish.springBackTimer = isCozy ? 2.4 : 1.35;
          if (dish.tamedProgress > 12 && dish.tamedProgress < 94) {
            dish.tamedProgress = Math.max(8, dish.tamedProgress - (isCozy ? 4 : 9));
            dish.chairAngle = (rng() > 0.5 ? 1 : -1) * 0.42;
            dish.chairHopY = 24;
            dish.feedbackText = "BOING! It popped back open!";
            dish.feedbackTimer = 0.85;
            sounds.push("chair_boing");
            particles.push(...makeBurst(210, 250, PALETTE.mapleCrimson, 6, "crumb", rng));
          }
        } else {
          dish.chairAngle *= Math.pow(0.25, dt);
        }
      }
    } else {
      dish.tamedCelebrateTimer = Math.max(0, dish.tamedCelebrateTimer - dt);
    }
    const done = dish.tamedProgress >= 100 && dish.tamedCelebrateTimer <= 0 || dish.timeLeftSec !== null && dish.timeLeftSec <= 0;
    if (done && dish.tamedProgress < 100) {
      sounds.push("dish_win");
    }
    let stars = 1;
    if (dish.tamedProgress >= 100) {
      stars = dish.timeLeftSec === null || dish.timeLeftSec >= 6 ? 3 : 2;
    } else if (dish.tamedProgress >= 65) {
      stars = 2;
    }
    return {
      completed: done,
      stars,
      score: dish.score,
      dishesMade: Math.round(dish.tamedProgress),
      particles,
      sounds
    };
  }
  function stepPlatterDish(dish, difficulty, dt, input, rng) {
    const particles = [];
    const sounds = [];
    const isCozy = difficulty === "cozy";
    dish.wrongFlashTimer = Math.max(0, dish.wrongFlashTimer - dt);
    dish.platterBounce = Math.max(0, dish.platterBounce - dt * 4);
    dish.birdHintTimer = Math.max(0, dish.birdHintTimer - dt);
    dish.feedbackTimer = Math.max(0, dish.feedbackTimer - dt);
    if (dish.timeLeftSec !== null) {
      dish.timeLeftSec = Math.max(0, dish.timeLeftSec - dt);
    }
    if (input.snackPick && dish.plattersDone < dish.target) {
      const expected = dish.order[dish.matchedCount];
      if (input.snackPick === expected) {
        dish.matchedCount += 1;
        dish.platterBounce = 1;
        dish.streak += 1;
        dish.score += 55 + Math.min(dish.streak - 1, 5) * 10;
        sounds.push("good_catch");
        particles.push(...makeBurst(210, 265, PALETTE.butter, 7, "star", rng));
        if (dish.matchedCount >= dish.order.length) {
          dish.plattersDone += 1;
          dish.score += 80;
          dish.feedbackText = "Platter #" + String(dish.plattersDone) + " Delicious!";
          dish.feedbackTimer = 0.9;
          particles.push(...makeBurst(210, 250, PALETTE.pumpkinGold, 12, "star", rng));
          if (dish.plattersDone < dish.target) {
            const nextLen = isCozy ? 2 : dish.plattersDone >= dish.target - 2 ? 4 : 3;
            dish.order = makeOrder(nextLen, rng);
            dish.matchedCount = 0;
          }
        } else {
          dish.feedbackText = "Yum! Next snack!";
          dish.feedbackTimer = 0.6;
        }
      } else {
        dish.wrongFlashTimer = 0.45;
        dish.birdHintTimer = 0.9;
        dish.streak = 0;
        dish.feedbackText = "Check the highlighted snack!";
        dish.feedbackTimer = 0.85;
        sounds.push("silly_bonk");
      }
    }
    const done = dish.plattersDone >= dish.target || dish.timeLeftSec !== null && dish.timeLeftSec <= 0;
    if (done) {
      sounds.push("dish_win");
    }
    return {
      completed: done,
      stars: computeStars(difficulty, dish.plattersDone, dish.target, dish.score),
      score: dish.score,
      dishesMade: dish.plattersDone,
      particles,
      sounds
    };
  }
  function stepPieDish(dish, difficulty, dt, input, rng) {
    const particles = [];
    const sounds = [];
    const isCozy = difficulty === "cozy";
    dish.birdAssistTimer = Math.max(0, dish.birdAssistTimer - dt);
    dish.feedbackTimer = Math.max(0, dish.feedbackTimer - dt);
    if (dish.timeLeftSec !== null) {
      dish.timeLeftSec = Math.max(0, dish.timeLeftSec - dt);
    }
    const tapCount = (input.primaryTap ? 1 : 0) + (input.secondaryTap ? 1 : 0);
    if (dish.stage === "whipping") {
      let added = 0;
      if (input.swipeDelta > 0.01) {
        added += input.swipeDelta * (isCozy ? 0.95 : 0.72);
      }
      if (tapCount > 0) {
        added += (isCozy ? 0.24 : 0.17) * tapCount;
      }
      if (added > 0) {
        const prevDots = dish.creamDots.length;
        dish.whipProgress = Math.min(1, dish.whipProgress + added);
        const desiredDots = Math.floor(dish.whipProgress * 16);
        for (let d = prevDots; d < desiredDots; d++) {
          const angle = Math.PI * 2 * d / 16;
          dish.creamDots.push({
            angle,
            radius: 0.68 + d % 2 * 0.08,
            size: 13 + d % 3 * 2
          });
        }
        if (desiredDots > prevDots) {
          sounds.push("cream_swirl");
          particles.push(...makeBurst(210, 230, PALETTE.cream, 5, "circle", rng));
        }
        dish.feedbackText = "Swirl that cream!";
        dish.feedbackTimer = 0.6;
      }
      if (dish.whipProgress >= 1) {
        dish.stage = "cookie_drop";
        dish.cookieDropY = 0;
        dish.feedbackText = "Tap to drop the Maple Cookie!";
        dish.feedbackTimer = 1.5;
      }
    } else if (dish.stage === "cookie_drop") {
      if (tapCount > 0) {
        dish.stage = "pie_celebrate";
        dish.cookieDropY = 1;
        dish.celebrateTimer = 0.85;
        dish.piesFinished += 1;
        dish.score += isCozy ? 130 : 150;
        dish.feedbackText = "Ta-da! Sweet Pumpkin Pie!";
        dish.feedbackTimer = 0.9;
        sounds.push("good_catch");
        particles.push(...makeBurst(210, 230, PALETTE.pumpkinGold, 14, "star", rng));
      }
    } else if (dish.stage === "pie_celebrate") {
      dish.celebrateTimer -= dt;
      if (dish.celebrateTimer <= 0 && dish.piesFinished < dish.target) {
        dish.stage = "whipping";
        dish.whipProgress = 0;
        dish.creamDots = [];
        dish.cookieDropY = 0;
        dish.feedbackText = "Next pie! Swirl cream!";
        dish.feedbackTimer = 0.9;
      }
    }
    const done = dish.piesFinished >= dish.target && dish.celebrateTimer <= 0 || dish.timeLeftSec !== null && dish.timeLeftSec <= 0;
    if (done) {
      sounds.push("dish_win");
    }
    return {
      completed: done,
      stars: computeStars(difficulty, dish.piesFinished, dish.target, dish.score),
      score: dish.score,
      dishesMade: dish.piesFinished,
      particles,
      sounds
    };
  }
  function stepActiveDish(dish, difficulty, playMode, dt, input, rng) {
    if (dish.kind === "golden_toast") {
      return stepToastDish(dish, difficulty, dt, input, rng);
    }
    if (dish.kind === "flying_popcorn") {
      return stepPopcornDish(dish, difficulty, playMode, dt, input, rng);
    }
    if (dish.kind === "folding_chair") {
      return stepChairDish(dish, difficulty, dt, input, rng);
    }
    if (dish.kind === "pretzel_platter") {
      return stepPlatterDish(dish, difficulty, dt, input, rng);
    }
    return stepPieDish(dish, difficulty, dt, input, rng);
  }

  // thanksgiving/ts/game.ts
  var EMPTY_INPUT = {
    primaryTap: false,
    secondaryTap: false,
    moveDir: 0,
    moveDirP2: 0,
    pointerXNorm: null,
    swipeDelta: 0,
    snackPick: null
  };
  function nextRandom(state) {
    state.rngState = state.rngState + 1831565813 | 0;
    let t = Math.imul(state.rngState ^ state.rngState >>> 15, 1 | state.rngState);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  function createInitialState(config = {}) {
    const playMode = config.playMode ?? "pass_and_play";
    const rawCount = config.chefCount ?? (playMode === "solo" ? 1 : playMode === "laptop_coop" ? 2 : 2);
    const chefCount = playMode === "solo" ? 1 : playMode === "laptop_coop" ? 2 : Math.max(2, Math.min(4, rawCount));
    return {
      phase: "title",
      difficulty: config.difficulty ?? "cozy",
      playMode,
      chefCount,
      activeChefIndex: 0,
      stageIndex: 0,
      dishState: null,
      results: [],
      seatedGuests: ["Beagle Chef", "Little Bird"],
      leaves: [],
      gratitudeChefCursor: 0,
      tablePromptIndex: Math.abs((config.seed ?? 2026) % TABLE_PROMPTS.length),
      totalStars: 0,
      muted: false,
      elapsedSec: 0,
      particles: [],
      pendingSounds: [],
      rngState: (config.seed ?? 20261125) | 0
    };
  }
  function getCurrentDishId(state) {
    return DISH_SEQUENCE[Math.min(state.stageIndex, DISH_SEQUENCE.length - 1)];
  }
  function getChefLabel(chefIndex) {
    return "Chef " + String(chefIndex + 1);
  }
  function beginCurrentDish(state) {
    const dishId = getCurrentDishId(state);
    state.dishState = createDishState(dishId, state.difficulty, () => nextRandom(state));
    state.phase = "dish_play";
  }
  function applyAction(state, action) {
    switch (action.type) {
      case "SET_DIFFICULTY": {
        state.difficulty = action.difficulty;
        return state;
      }
      case "SET_PLAY_MODE": {
        state.playMode = action.playMode;
        if (action.playMode === "solo") {
          state.chefCount = 1;
        } else if (action.playMode === "laptop_coop") {
          state.chefCount = 2;
        } else {
          const count = action.chefCount ?? Math.max(2, state.chefCount);
          state.chefCount = Math.max(2, Math.min(4, count));
        }
        return state;
      }
      case "START_FEAST": {
        state.stageIndex = 0;
        state.activeChefIndex = 0;
        state.results = [];
        state.seatedGuests = ["Beagle Chef", "Little Bird"];
        state.leaves = [];
        state.gratitudeChefCursor = 0;
        state.totalStars = 0;
        state.particles = [];
        if (state.playMode === "pass_and_play" && state.chefCount > 1) {
          state.phase = "pass_banner";
          state.dishState = null;
        } else {
          beginCurrentDish(state);
        }
        return state;
      }
      case "CONFIRM_PASS": {
        if (state.phase === "pass_banner") {
          beginCurrentDish(state);
        }
        return state;
      }
      case "NEXT_STAGE": {
        if (state.phase !== "dish_complete") {
          return state;
        }
        const nextIdx = state.stageIndex + 1;
        if (nextIdx >= DISH_SEQUENCE.length) {
          state.phase = "gratitude_tree";
          state.dishState = null;
          state.gratitudeChefCursor = 0;
          return state;
        }
        state.stageIndex = nextIdx;
        state.activeChefIndex = nextIdx % state.chefCount;
        if (state.playMode === "pass_and_play" && state.chefCount > 1) {
          state.phase = "pass_banner";
          state.dishState = null;
        } else {
          beginCurrentDish(state);
        }
        return state;
      }
      case "ADD_LEAF": {
        if (state.phase !== "gratitude_tree") {
          return state;
        }
        const author = action.authorLabel && action.authorLabel.trim().length > 0 ? action.authorLabel : getChefLabel(state.gratitudeChefCursor % state.chefCount);
        const leaf = createGratitudeLeaf(
          state.leaves.length,
          action.stickerId,
          action.leafColor,
          action.customMessage,
          author
        );
        if (leaf) {
          state.leaves.push(leaf);
          state.gratitudeChefCursor += 1;
          state.pendingSounds.push("leaf_hang");
        }
        return state;
      }
      case "FINISH_GRATITUDE": {
        if (state.phase !== "gratitude_tree") {
          return state;
        }
        if (state.leaves.length === 0) {
          const fallback = createGratitudeLeaf(
            0,
            "family",
            "crimson",
            "Thankful for our Thanksgiving feast!",
            "Our Family"
          );
          if (fallback) {
            state.leaves.push(fallback);
          }
        }
        state.phase = "feast_finale";
        state.pendingSounds.push("feast_fanfare");
        return state;
      }
      case "SHUFFLE_PROMPT": {
        state.tablePromptIndex = (state.tablePromptIndex + 1) % TABLE_PROMPTS.length;
        return state;
      }
      case "TOGGLE_MUTE": {
        state.muted = !state.muted;
        return state;
      }
      case "PLAY_AGAIN": {
        const keepDifficulty = state.difficulty;
        const keepMode = state.playMode;
        const keepChefs = state.chefCount;
        const keepMuted = state.muted;
        const nextSeed = state.rngState + 7919 | 0;
        const fresh = createInitialState({
          difficulty: keepDifficulty,
          playMode: keepMode,
          chefCount: keepChefs,
          seed: nextSeed
        });
        fresh.muted = keepMuted;
        Object.assign(state, fresh);
        return state;
      }
    }
  }
  function stepGame(state, dtSec, input = EMPTY_INPUT) {
    const dt = Math.max(0, Math.min(0.05, dtSec));
    state.elapsedSec += dt;
    const nextParticles = [];
    for (let i = 0; i < state.particles.length; i++) {
      const p = state.particles[i];
      p.life += dt;
      if (p.life < p.maxLife) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 190 * dt;
        nextParticles.push(p);
      }
    }
    state.particles = nextParticles;
    if (state.phase === "dish_play" && state.dishState) {
      const res = stepActiveDish(
        state.dishState,
        state.difficulty,
        state.playMode,
        dt,
        input,
        () => nextRandom(state)
      );
      if (res.particles.length > 0) {
        state.particles.push(...res.particles);
      }
      if (res.sounds.length > 0) {
        state.pendingSounds.push(...res.sounds);
      }
      if (res.completed) {
        const dishId = state.dishState.kind;
        const spec = DISH_SPECS[dishId];
        state.results.push({
          dishId,
          chefIndex: state.activeChefIndex,
          stars: res.stars,
          score: res.score,
          dishesMade: res.dishesMade,
          guestUnlocked: spec.guestUnlocked
        });
        state.totalStars += res.stars;
        if (!state.seatedGuests.includes(spec.guestUnlocked)) {
          state.seatedGuests.push(spec.guestUnlocked);
        }
        state.phase = "dish_complete";
      }
    }
    return state;
  }
  function drainPendingSounds(state) {
    if (state.pendingSounds.length === 0) {
      return [];
    }
    const out = state.pendingSounds.slice();
    state.pendingSounds.length = 0;
    return out;
  }

  // thanksgiving/ts/postcard.ts
  function wrapText(ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let current = "";
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const candidate = current ? current + " " + word : word;
      if (ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else {
        if (current) {
          lines.push(current);
        }
        current = word;
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
    bg.addColorStop(0, "#FFF9EE");
    bg.addColorStop(1, "#F8E1BE");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    drawRoundedRect(ctx, 34, 34, W - 68, H - 68, 36);
    ctx.fillStyle = "rgba(255, 253, 247, 0.72)";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = PALETTE.toastedSienna;
    ctx.stroke();
    drawRoundedRect(ctx, 52, 52, W - 104, H - 104, 28);
    ctx.setLineDash([14, 10]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = PALETTE.mapleCrimson;
    ctx.stroke();
    ctx.restore();
    drawMapleLeaf(ctx, 102, 102, 34, "crimson", -0.4);
    drawMapleLeaf(ctx, W - 102, 102, 34, "amber", 0.4);
    drawMapleLeaf(ctx, 102, H - 102, 30, "gold", -2.5);
    drawMapleLeaf(ctx, W - 102, H - 102, 30, "russet", 2.5);
    ctx.fillStyle = PALETTE.ink;
    ctx.textAlign = "center";
    ctx.font = "800 58px system-ui, -apple-system, sans-serif";
    ctx.fillText("Happy Thanksgiving!", W / 2, 140);
    ctx.fillStyle = PALETTE.toastedSienna;
    ctx.font = "700 28px system-ui, -apple-system, sans-serif";
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    ctx.fillText("Beagle Chef's Backyard Feast  -  " + String(year), W / 2, 188);
    const displayedStars = 5;
    const starStartX = W / 2 - (displayedStars - 1) * 46 / 2;
    for (let i = 0; i < displayedStars; i++) {
      drawStar(ctx, starStartX + i * 46, 236, 17, PALETTE.pumpkinGold);
    }
    ctx.fillStyle = PALETTE.toastedSienna;
    ctx.font = "700 22px system-ui, -apple-system, sans-serif";
    ctx.fillText(
      "Feast Stars Earned: " + String(state.totalStars) + " / 15",
      W / 2,
      272
    );
    drawRoundedRect(ctx, 88, 290, W - 176, 502, 28);
    ctx.fillStyle = "#FCE5C0";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    ctx.save();
    ctx.beginPath();
    drawRoundedRect(ctx, 88, 290, W - 176, 502, 28);
    ctx.clip();
    ctx.fillStyle = "#B6C285";
    ctx.beginPath();
    ctx.ellipse(W / 2, 830, 580, 160, 0, Math.PI, 0);
    ctx.fill();
    drawMapleTree(ctx, W / 2, 705, 480, 404, state.leaves, false);
    drawBackyardTable(
      ctx,
      W / 2,
      718,
      580,
      state.seatedGuests.length,
      true,
      true,
      true,
      0,
      true,
      true
    );
    drawBeagleChef(ctx, 195, 725, 1.5, "excited", 0);
    drawLittleBird(ctx, 882, 626, 2, 0.3);
    ctx.restore();
    ctx.fillStyle = PALETTE.mapleCrimson;
    ctx.font = "800 34px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Our Gratitude Maple Leaves", W / 2, 856);
    const notes = state.leaves.slice(0, 8);
    const cols = notes.length > 4 ? 2 : 1;
    const colW = cols === 2 ? 430 : 840;
    const startX = cols === 2 ? 96 : 120;
    let yCursor = 900;
    for (let i = 0; i < notes.length; i++) {
      const leaf = notes[i];
      const col = cols === 2 ? i % 2 : 0;
      const row = cols === 2 ? Math.floor(i / 2) : i;
      const x = startX + col * (colW + 28);
      const y = yCursor + row * 108;
      drawRoundedRect(ctx, x, y, colW, 92, 18);
      ctx.fillStyle = PALETTE.cream;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = PALETTE.ink;
      ctx.stroke();
      drawMapleLeaf(ctx, x + 36, y + 46, 20, leaf.leafColor, -0.2);
      ctx.textAlign = "left";
      ctx.fillStyle = PALETTE.toastedSienna;
      ctx.font = "700 22px system-ui, -apple-system, sans-serif";
      ctx.fillText(leaf.authorLabel, x + 68, y + 32);
      ctx.fillStyle = PALETTE.ink;
      ctx.font = "600 23px system-ui, -apple-system, sans-serif";
      const lines = wrapText(ctx, leaf.message, colW - 84);
      ctx.fillText(lines[0], x + 68, y + 64);
      if (lines[1]) {
        ctx.font = "600 18px system-ui, -apple-system, sans-serif";
        ctx.fillText(lines[1], x + 68, y + 84);
      }
    }
    ctx.textAlign = "center";
    ctx.fillStyle = PALETTE.toastedSienna;
    ctx.font = "600 22px system-ui, -apple-system, sans-serif";
    ctx.fillText("Made together with gratitude  -  games-for-kids", W / 2, H - 82);
    return canvas;
  }
  async function exportPostcard(canvas) {
    const dataUrl = canvas.toDataURL("image/png");
    const blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/png");
    });
    if (blob && typeof navigator !== "undefined" && typeof File !== "undefined") {
      const file = new File([blob], "thanksgiving-feast-postcard.png", { type: "image/png" });
      const nav = navigator;
      if (typeof nav.share === "function" && (!nav.canShare || nav.canShare({ files: [file] }))) {
        try {
          await nav.share({
            files: [file],
            title: "Our Thanksgiving Feast Postcard",
            text: "Happy Thanksgiving from Beagle Chef's Backyard Feast!"
          });
          return { method: "share", dataUrl };
        } catch {
        }
      }
    }
    if (typeof document !== "undefined") {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "thanksgiving-feast-postcard.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { method: "download", dataUrl };
    }
    return { method: "preview", dataUrl };
  }

  // thanksgiving/ts/renderer.ts
  function drawWarmBackdrop(ctx, t, outdoor) {
    const grad = ctx.createLinearGradient(0, 0, 0, STAGE_LOGICAL_H);
    if (outdoor) {
      grad.addColorStop(0, "#FFE9C9");
      grad.addColorStop(0.65, "#F9D6A5");
      grad.addColorStop(1, "#D8BA85");
    } else {
      grad.addColorStop(0, PALETTE.parchment);
      grad.addColorStop(0.7, PALETTE.warmSky);
      grad.addColorStop(1, "#E8C396");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, STAGE_LOGICAL_W, STAGE_LOGICAL_H);
    const colors = ["crimson", "amber", "gold", "russet"];
    for (let i = 0; i < 6; i++) {
      const lx = (i * 83 + t * (16 + i * 3)) % (STAGE_LOGICAL_W + 40) - 20;
      const ly = (i * 77 + t * (20 + i * 4)) % (STAGE_LOGICAL_H + 40) - 20;
      ctx.save();
      ctx.globalAlpha = outdoor ? 0.45 : 0.22;
      drawMapleLeaf(ctx, lx, ly, 10, colors[i % colors.length], t * 0.6 + i);
      ctx.restore();
    }
    if (outdoor) {
      ctx.fillStyle = "#B6C285";
      ctx.beginPath();
      ctx.ellipse(STAGE_LOGICAL_W * 0.5, STAGE_LOGICAL_H + 30, 310, 120, 0, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 2.2;
      ctx.stroke();
    } else {
      ctx.fillStyle = "#D49B63";
      ctx.fillRect(0, 336, STAGE_LOGICAL_W, STAGE_LOGICAL_H - 336);
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 336);
      ctx.lineTo(STAGE_LOGICAL_W, 336);
      ctx.stroke();
    }
  }
  function drawParticles(ctx, state) {
    for (let i = 0; i < state.particles.length; i++) {
      const p = state.particles[i];
      const alpha = Math.max(0, 1 - p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      if (p.shape === "star") {
        drawStar(ctx, p.x, p.y, p.size, p.color);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
  function drawSpeechBubble(ctx, text, cx, y) {
    if (!text) {
      return;
    }
    ctx.save();
    ctx.font = "700 15px system-ui, -apple-system, sans-serif";
    const tw = ctx.measureText(text).width;
    const bw = Math.min(STAGE_LOGICAL_W - 24, tw + 28);
    const bx = cx - bw / 2;
    drawRoundedRect(ctx, bx, y - 18, bw, 34, 14);
    ctx.fillStyle = PALETTE.cream;
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    ctx.fillStyle = PALETTE.ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, cx, y - 1);
    ctx.restore();
  }
  function renderToastStage(ctx, state, dish) {
    drawWarmBackdrop(ctx, state.elapsedSec, false);
    const isCozy = state.difficulty === "cozy";
    const goldenMinY = (isCozy ? 0.14 : 0.2) * STAGE_LOGICAL_H;
    const goldenMaxY = (isCozy ? 0.56 : 0.48) * STAGE_LOGICAL_H;
    ctx.save();
    drawRoundedRect(ctx, 26, goldenMinY, STAGE_LOGICAL_W - 52, goldenMaxY - goldenMinY, 18);
    ctx.fillStyle = "rgba(255, 229, 143, 0.34)";
    ctx.fill();
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = PALETTE.mapleCrimson;
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = "700 13px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = PALETTE.toastedSienna;
    ctx.textAlign = "center";
    ctx.fillText("GOLDEN CATCH ZONE - TAP CATCH!", STAGE_LOGICAL_W / 2, goldenMinY + 18);
    ctx.restore();
    const bob = Math.sin(state.elapsedSec * 4) * 3;
    const mood = dish.slices.some((s) => s.state === "hat_bounce") ? "oops" : dish.feedbackTimer > 0.2 && dish.streak > 0 ? "excited" : "happy";
    drawBeagleChef(ctx, 78, 326, 1.05, mood, bob);
    const birdY = dish.birdAssistTimer > 0 ? 245 : 288 + Math.sin(state.elapsedSec * 6) * 6;
    drawLittleBird(ctx, 344, birdY, 1.25, Math.sin(state.elapsedSec * 14));
    for (let i = 0; i < dish.slices.length; i++) {
      const s = dish.slices[i];
      drawToast(
        ctx,
        s.x * STAGE_LOGICAL_W,
        s.y * STAGE_LOGICAL_H,
        1.12,
        s.rotation,
        s.state === "caught" || s.state === "rescued"
      );
    }
    const sq = dish.toasterSquash * 6;
    ctx.save();
    ctx.translate(STAGE_LOGICAL_W / 2, 340);
    drawRoundedRect(ctx, -48 - sq, -48 + sq, 96 + sq * 2, 54 - sq, 14);
    ctx.fillStyle = "#D96A47";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    ctx.fillStyle = "#F5A888";
    drawRoundedRect(ctx, -36, -38 + sq, 20, 28 - sq, 6);
    ctx.fill();
    ctx.fillStyle = PALETTE.ink;
    ctx.fillRect(48 + sq, -26 + sq, 12, 8);
    ctx.restore();
    for (let i = 0; i < Math.min(dish.plated, 7); i++) {
      drawToast(ctx, 134, 376 - i * 8, 0.52, i % 2 === 0 ? -0.06 : 0.06, true);
    }
    if (dish.feedbackTimer > 0) {
      drawSpeechBubble(ctx, dish.feedbackText, STAGE_LOGICAL_W / 2, 38);
    }
  }
  function renderPopcornStage(ctx, state, dish) {
    drawWarmBackdrop(ctx, state.elapsedSec, false);
    const isCoop = state.playMode === "laptop_coop";
    ctx.save();
    ctx.translate(STAGE_LOGICAL_W / 2, 108);
    ctx.fillStyle = "#4A4340";
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, -72, -14, 144, 30, 12);
    ctx.fill();
    ctx.stroke();
    drawRoundedRect(ctx, 68, -6, 46, 12, 5);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    for (let i = 0; i < dish.items.length; i++) {
      const it = dish.items[i];
      const px = it.x * STAGE_LOGICAL_W;
      const py = it.y * STAGE_LOGICAL_H;
      if (it.itemType === "carrot") {
        drawSillyCarrot(ctx, px, py, 1, it.rotation);
      } else {
        drawPopcornKernel(ctx, px, py, 1.15, it.itemType === "golden_kernel", it.rotation);
      }
    }
    const birdPx = dish.birdX * STAGE_LOGICAL_W;
    const birdPy = isCoop ? 258 + Math.sin(state.elapsedSec * 7) * 4 : dish.birdAssistTimer > 0 ? 344 : 292 + Math.sin(state.elapsedSec * 5) * 8;
    drawLittleBird(ctx, birdPx, birdPy, 1.18, Math.sin(state.elapsedSec * 14));
    if (isCoop) {
      ctx.save();
      ctx.translate(birdPx, birdPy + 18);
      ctx.fillStyle = PALETTE.pumpkinGold;
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.font = "800 11px system-ui, sans-serif";
      ctx.fillStyle = PALETTE.ink;
      ctx.textAlign = "center";
      ctx.fillText("P2", 0, -34);
      ctx.restore();
    }
    const bx = dish.bowlX * STAGE_LOGICAL_W;
    const wobble = Math.sin(state.elapsedSec * 36) * dish.bowlWobble * 7;
    drawBeagleChef(ctx, bx, 382, 0.9, dish.bowlWobble > 0.2 ? "oops" : "happy", 0);
    ctx.save();
    ctx.translate(bx + wobble, 342);
    ctx.fillStyle = "#B96C38";
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 44, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    const shown = Math.min(8, dish.caught);
    for (let i = 0; i < shown; i++) {
      drawPopcornKernel(ctx, -26 + i * 7.5, -4 - i % 2 * 5, 0.72, i % 3 === 0);
    }
    ctx.restore();
    if (dish.feedbackTimer > 0) {
      drawSpeechBubble(ctx, dish.feedbackText, STAGE_LOGICAL_W / 2, 38);
    }
  }
  function renderChairStage(ctx, state, dish) {
    drawWarmBackdrop(ctx, state.elapsedSec, true);
    const flap = Math.sin(state.elapsedSec * 9) * (1 - dish.tamedProgress / 100) * 6;
    drawBackyardTable(ctx, STAGE_LOGICAL_W / 2, 168 + flap * 0.2, 230, 3, true, true, false, flap * 0.3);
    const openAmount = Math.max(0.2, 1 - dish.tamedProgress / 100 * 0.75);
    const idleWobble = dish.tamedProgress >= 100 ? 0 : Math.sin(state.elapsedSec * 12) * 0.08;
    drawFoldingChair(
      ctx,
      STAGE_LOGICAL_W / 2,
      292 - dish.chairHopY,
      1.7,
      dish.chairAngle + idleWobble,
      openAmount
    );
    const chefMood = dish.tamedProgress >= 100 ? "excited" : dish.chairHopY > 15 ? "oops" : "happy";
    drawBeagleChef(ctx, 84, 342, 1, chefMood, Math.sin(state.elapsedSec * 8) * 3);
    drawLittleBird(
      ctx,
      340,
      264 - dish.chairHopY * 0.5 + Math.sin(state.elapsedSec * 10) * 5,
      1.3,
      Math.sin(state.elapsedSec * 18)
    );
    const barW = 290;
    const barX = (STAGE_LOGICAL_W - barW) / 2;
    const barY = 392;
    drawRoundedRect(ctx, barX, barY, barW, 24, 12);
    ctx.fillStyle = PALETTE.cream;
    ctx.fill();
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    const fillW = Math.max(0, (barW - 6) * dish.tamedProgress / 100);
    if (fillW > 4) {
      drawRoundedRect(ctx, barX + 3, barY + 3, fillW, 18, 9);
      ctx.fillStyle = dish.tamedProgress >= 100 ? PALETTE.sageLeaf : PALETTE.mapleCrimson;
      ctx.fill();
    }
    ctx.font = "800 12px system-ui, sans-serif";
    ctx.fillStyle = PALETTE.ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("CHAIR TAMED: " + String(Math.round(dish.tamedProgress)) + "%", STAGE_LOGICAL_W / 2, barY + 12);
    if (dish.feedbackTimer > 0) {
      drawSpeechBubble(ctx, dish.feedbackText, STAGE_LOGICAL_W / 2, 38);
    }
  }
  function renderPlatterStage(ctx, state, dish) {
    drawWarmBackdrop(ctx, state.elapsedSec, false);
    const count = dish.order.length;
    const slotGap = 62;
    const boxW = Math.max(190, count * slotGap + 44);
    const boxX = (STAGE_LOGICAL_W - boxW) / 2;
    const shakeX = dish.wrongFlashTimer > 0 ? Math.sin(state.elapsedSec * 55) * 6 : 0;
    ctx.save();
    ctx.translate(shakeX, 0);
    drawRoundedRect(ctx, boxX, 66, boxW, 84, 22);
    ctx.fillStyle = dish.wrongFlashTimer > 0 ? "#FFE1DA" : PALETTE.cream;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = dish.wrongFlashTimer > 0 ? PALETTE.mapleCrimson : PALETTE.ink;
    ctx.stroke();
    const startX = STAGE_LOGICAL_W / 2 - (count - 1) * slotGap / 2;
    for (let i = 0; i < count; i++) {
      const sx = startX + i * slotGap;
      const sy = 108;
      const isDone = i < dish.matchedCount;
      const isNext = i === dish.matchedCount;
      if (isNext) {
        ctx.fillStyle = "rgba(242, 165, 65, 0.35)";
        ctx.beginPath();
        ctx.arc(sx, sy, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = PALETTE.mapleCrimson;
        ctx.lineWidth = 2.4;
        ctx.stroke();
      } else if (isDone) {
        ctx.fillStyle = "rgba(107, 143, 113, 0.25)";
        ctx.beginPath();
        ctx.arc(sx, sy, 23, 0, Math.PI * 2);
        ctx.fill();
      }
      drawSnackIcon(ctx, dish.order[i], sx, sy, 32);
      if (isDone) {
        ctx.fillStyle = PALETTE.sageLeaf;
        ctx.strokeStyle = PALETTE.ink;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(sx + 16, sy - 16, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(sx + 12, sy - 16);
        ctx.lineTo(sx + 15, sy - 13);
        ctx.lineTo(sx + 20, sy - 19);
        ctx.stroke();
      }
    }
    ctx.restore();
    drawBeagleChef(
      ctx,
      82,
      244,
      0.96,
      dish.wrongFlashTimer > 0 ? "oops" : dish.platterBounce > 0.2 ? "excited" : "happy",
      Math.sin(state.elapsedSec * 5) * 2.5
    );
    drawLittleBird(ctx, 344, 214 + Math.sin(state.elapsedSec * 7) * 5, 1.25, Math.sin(state.elapsedSec * 14));
    const bounceY = -dish.platterBounce * 10;
    ctx.save();
    ctx.translate(STAGE_LOGICAL_W / 2, 338 + bounceY);
    ctx.fillStyle = "#C68642";
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 118, 42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#E6B87A";
    ctx.beginPath();
    ctx.ellipse(0, -2, 98, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < dish.matchedCount; i++) {
      const px = -((dish.order.length - 1) * 40) / 2 + i * 40;
      drawSnackIcon(ctx, dish.order[i], px, -6, 28);
    }
    ctx.restore();
    ctx.font = "700 14px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = PALETTE.ink;
    ctx.textAlign = "center";
    ctx.fillText(
      "Platter " + String(Math.min(dish.plattersDone + 1, dish.target)) + " of " + String(dish.target),
      STAGE_LOGICAL_W / 2,
      404
    );
    if (dish.feedbackTimer > 0) {
      drawSpeechBubble(ctx, dish.feedbackText, STAGE_LOGICAL_W / 2, 34);
    }
  }
  function renderPieStage(ctx, state, dish) {
    drawWarmBackdrop(ctx, state.elapsedSec, false);
    drawBeagleChef(
      ctx,
      66,
      112,
      0.88,
      dish.stage === "pie_celebrate" ? "excited" : "happy",
      Math.sin(state.elapsedSec * 5) * 3
    );
    drawLittleBird(ctx, 354, 110 + Math.sin(state.elapsedSec * 6) * 5, 1.25, Math.sin(state.elapsedSec * 12));
    drawPumpkinPie(
      ctx,
      STAGE_LOGICAL_W / 2,
      244,
      102,
      dish.creamDots.length,
      dish.stage === "pie_celebrate"
    );
    if (dish.stage === "cookie_drop") {
      const floatY = 120 + Math.sin(state.elapsedSec * 7) * 8;
      drawMapleLeaf(ctx, STAGE_LOGICAL_W / 2, floatY, 32, "gold", Math.sin(state.elapsedSec * 3) * 0.12);
    }
    ctx.font = "700 14px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = PALETTE.ink;
    ctx.textAlign = "center";
    ctx.fillText(
      "Pie " + String(Math.min(dish.piesFinished + 1, dish.target)) + " of " + String(dish.target),
      STAGE_LOGICAL_W / 2,
      396
    );
    if (dish.feedbackTimer > 0) {
      drawSpeechBubble(ctx, dish.feedbackText, STAGE_LOGICAL_W / 2, 38);
    }
  }
  function renderStageCanvas(ctx, state) {
    ctx.save();
    ctx.clearRect(0, 0, STAGE_LOGICAL_W, STAGE_LOGICAL_H);
    if (state.phase === "title") {
      drawWarmBackdrop(ctx, state.elapsedSec, true);
      drawMapleTree(ctx, STAGE_LOGICAL_W / 2, 330, 260, 260, state.leaves, false);
      drawBackyardTable(
        ctx,
        STAGE_LOGICAL_W / 2,
        344,
        290,
        6,
        true,
        true,
        true,
        Math.sin(state.elapsedSec * 3) * 2,
        true,
        true
      );
      drawBeagleChef(ctx, 88, 330, 1, "excited", Math.sin(state.elapsedSec * 4) * 3);
      drawLittleBird(ctx, 324, 282 + Math.sin(state.elapsedSec * 6) * 6, 1.3, Math.sin(state.elapsedSec * 14));
      drawSpeechBubble(ctx, "Happy Thanksgiving! Let's cook!", STAGE_LOGICAL_W / 2, 42);
    } else if (state.phase === "pass_banner") {
      drawWarmBackdrop(ctx, state.elapsedSec, true);
      drawMapleTree(ctx, STAGE_LOGICAL_W / 2, 320, 220, 220, state.leaves, false);
      drawBeagleChef(ctx, STAGE_LOGICAL_W / 2 - 42, 310, 1.15, "excited", Math.sin(state.elapsedSec * 4) * 4);
      drawLittleBird(ctx, STAGE_LOGICAL_W / 2 + 54, 270 + Math.sin(state.elapsedSec * 6) * 6, 1.4, Math.sin(state.elapsedSec * 12));
    } else if (state.phase === "dish_play" && state.dishState) {
      if (state.dishState.kind === "golden_toast") {
        renderToastStage(ctx, state, state.dishState);
      } else if (state.dishState.kind === "flying_popcorn") {
        renderPopcornStage(ctx, state, state.dishState);
      } else if (state.dishState.kind === "folding_chair") {
        renderChairStage(ctx, state, state.dishState);
      } else if (state.dishState.kind === "pretzel_platter") {
        renderPlatterStage(ctx, state, state.dishState);
      } else {
        renderPieStage(ctx, state, state.dishState);
      }
    } else if (state.phase === "dish_complete") {
      drawWarmBackdrop(ctx, state.elapsedSec, true);
      const hasToast = state.results.some((r) => r.dishId === "golden_toast");
      const hasPopcorn = state.results.some((r) => r.dishId === "flying_popcorn");
      const hasChair = state.results.some((r) => r.dishId === "folding_chair");
      const hasPlatter = state.results.some((r) => r.dishId === "pretzel_platter");
      const hasPie = state.results.some((r) => r.dishId === "pumpkin_pie");
      drawBackyardTable(
        ctx,
        STAGE_LOGICAL_W / 2,
        320,
        300,
        state.seatedGuests.length,
        hasToast,
        hasPopcorn,
        hasPie,
        Math.sin(state.elapsedSec * 4) * 2,
        hasPlatter,
        hasChair
      );
      drawBeagleChef(ctx, 64, 344, 0.92, "excited", Math.sin(state.elapsedSec * 5) * 3);
      drawLittleBird(ctx, 356, 270, 1.25, Math.sin(state.elapsedSec * 14));
      const last = state.results[state.results.length - 1];
      if (last) {
        const spec = DISH_SPECS[last.dishId];
        for (let i = 0; i < 3; i++) {
          drawStar(
            ctx,
            STAGE_LOGICAL_W / 2 - 52 + i * 52,
            112,
            24,
            i < last.stars ? PALETTE.pumpkinGold : "#E2D5C3"
          );
        }
        drawSpeechBubble(ctx, spec.shortTitle + " Done! +" + last.guestUnlocked, STAGE_LOGICAL_W / 2, 46);
      }
    } else if (state.phase === "gratitude_tree") {
      drawWarmBackdrop(ctx, state.elapsedSec, true);
      drawMapleTree(ctx, STAGE_LOGICAL_W / 2, 396, 320, 326, state.leaves, true);
      drawLittleBird(ctx, 348, 128 + Math.sin(state.elapsedSec * 5) * 5, 1.25, Math.sin(state.elapsedSec * 12));
      drawBeagleChef(ctx, 72, 366, 0.9, "happy", Math.sin(state.elapsedSec * 3) * 2);
      drawSpeechBubble(
        ctx,
        "Gratitude Maple Tree (" + String(state.leaves.length) + " leaves)",
        STAGE_LOGICAL_W / 2,
        36
      );
    } else if (state.phase === "feast_finale") {
      drawWarmBackdrop(ctx, state.elapsedSec, true);
      drawMapleTree(ctx, STAGE_LOGICAL_W / 2, 304, 260, 240, state.leaves, false);
      drawBackyardTable(
        ctx,
        STAGE_LOGICAL_W / 2,
        344,
        316,
        state.seatedGuests.length,
        true,
        true,
        true,
        Math.sin(state.elapsedSec * 4) * 2.5,
        true,
        true
      );
      drawBeagleChef(ctx, 56, 360, 0.92, "excited", Math.sin(state.elapsedSec * 6) * 3);
      drawLittleBird(ctx, 360, 282 + Math.sin(state.elapsedSec * 7) * 5, 1.25, Math.sin(state.elapsedSec * 15));
      drawSpeechBubble(ctx, "Happy Thanksgiving Feast!", STAGE_LOGICAL_W / 2, 38);
    }
    drawParticles(ctx, state);
    ctx.restore();
  }

  // thanksgiving/ts/app.ts
  function byId(id) {
    if (typeof document === "undefined") {
      return null;
    }
    return document.getElementById(id);
  }
  function mountApp() {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }
    const canvas = byId("stage-canvas");
    const deckEl = byId("control-deck");
    const hudTitleEl = byId("hud-title");
    const hudMeterEl = byId("hud-meter");
    const modePillEl = byId("mode-pill");
    const muteBtn = byId("mute-btn");
    const modalEl = byId("postcard-modal");
    const modalImg = byId("postcard-img");
    const modalStatus = byId("postcard-status");
    const modalCloseBtn = byId("postcard-close-btn");
    const modalShareBtn = byId("postcard-share-btn");
    if (!canvas || !deckEl) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    const audio = new FeastAudio();
    const state = createInitialState({
      difficulty: "cozy",
      playMode: "pass_and_play",
      chefCount: 2,
      seed: Date.now() & 2147483647
    });
    let selectedSticker = "family";
    let selectedLeafColor = "crimson";
    let customNoteDraft = "";
    let authorDraft = "";
    let lastRenderedPhaseKey = "";
    let lastPostcardCanvas = null;
    let pendingPrimaryTap = false;
    let pendingSecondaryTap = false;
    let pendingSnackPick = null;
    let heldLeftP1 = false;
    let heldRightP1 = false;
    let heldLeftP2 = false;
    let heldRightP2 = false;
    let activePointerXNorm = null;
    let pendingSwipeDelta = 0;
    let lastSwipeX = null;
    let lastSwipeY = null;
    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(STAGE_LOGICAL_W * dpr);
      canvas.height = Math.round(STAGE_LOGICAL_H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    function unlockAudio() {
      audio.unlock();
    }
    function clearInputs() {
      pendingPrimaryTap = false;
      pendingSecondaryTap = false;
      pendingSnackPick = null;
      heldLeftP1 = false;
      heldRightP1 = false;
      heldLeftP2 = false;
      heldRightP2 = false;
      activePointerXNorm = null;
      pendingSwipeDelta = 0;
      lastSwipeX = null;
      lastSwipeY = null;
    }
    if (muteBtn) {
      muteBtn.addEventListener("click", () => {
        unlockAudio();
        applyAction(state, { type: "TOGGLE_MUTE" });
        audio.setMuted(state.muted);
        muteBtn.textContent = state.muted ? "SFX: Off" : "SFX: On";
      });
    }
    if (modalCloseBtn && modalEl) {
      modalCloseBtn.addEventListener("click", () => {
        modalEl.classList.add("hidden");
      });
    }
    if (modalShareBtn && modalStatus) {
      modalShareBtn.addEventListener("click", async () => {
        unlockAudio();
        if (!lastPostcardCanvas) {
          lastPostcardCanvas = renderPostcardCanvas(state);
        }
        const res = await exportPostcard(lastPostcardCanvas);
        if (res.method === "share") {
          modalStatus.textContent = "Shared! You can save it right to Photos.";
        } else {
          modalStatus.textContent = "Downloaded PNG! On iPhone, press & hold the image to Save to Photos.";
        }
      });
    }
    canvas.addEventListener("pointerdown", (e) => {
      unlockAudio();
      if (state.phase !== "dish_play" || !state.dishState) {
        return;
      }
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / Math.max(1, rect.width);
      const ny = (e.clientY - rect.top) / Math.max(1, rect.height);
      if (state.dishState.kind === "golden_toast" || state.dishState.kind === "folding_chair") {
        pendingPrimaryTap = true;
      } else if (state.dishState.kind === "flying_popcorn") {
        activePointerXNorm = nx;
      } else if (state.dishState.kind === "pumpkin_pie") {
        if (state.dishState.stage === "cookie_drop") {
          pendingPrimaryTap = true;
        } else {
          lastSwipeX = nx;
          lastSwipeY = ny;
          pendingPrimaryTap = true;
        }
      }
    });
    canvas.addEventListener("pointermove", (e) => {
      if (state.phase !== "dish_play" || !state.dishState) {
        return;
      }
      if (e.buttons === 0 && e.pointerType === "mouse") {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / Math.max(1, rect.width);
      const ny = (e.clientY - rect.top) / Math.max(1, rect.height);
      if (state.dishState.kind === "flying_popcorn") {
        activePointerXNorm = nx;
      } else if (state.dishState.kind === "pumpkin_pie" && state.dishState.stage === "whipping") {
        if (lastSwipeX !== null && lastSwipeY !== null) {
          pendingSwipeDelta += Math.hypot(nx - lastSwipeX, ny - lastSwipeY);
        }
        lastSwipeX = nx;
        lastSwipeY = ny;
      }
    });
    const endCanvasPointer = () => {
      activePointerXNorm = null;
      lastSwipeX = null;
      lastSwipeY = null;
    };
    canvas.addEventListener("pointerup", endCanvasPointer);
    canvas.addEventListener("pointercancel", endCanvasPointer);
    window.addEventListener("keydown", (e) => {
      const target = e.target;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      unlockAudio();
      const isCoop = state.playMode === "laptop_coop";
      if (e.code === "KeyA") {
        heldLeftP1 = true;
      } else if (e.code === "KeyD") {
        heldRightP1 = true;
      } else if (e.code === "ArrowLeft") {
        if (isCoop) {
          heldLeftP2 = true;
        } else {
          heldLeftP1 = true;
        }
      } else if (e.code === "ArrowRight") {
        if (isCoop) {
          heldRightP2 = true;
        } else {
          heldRightP1 = true;
        }
      }
      if (state.phase === "dish_play" && state.dishState) {
        if (state.dishState.kind === "pretzel_platter") {
          if (e.code === "Digit1" || isCoop && e.code === "KeyA") {
            e.preventDefault();
            pendingSnackPick = "pretzel";
          } else if (e.code === "Digit2" || isCoop && e.code === "KeyS") {
            e.preventDefault();
            pendingSnackPick = "orange_bean";
          } else if (e.code === "Digit3" || isCoop && e.code === "ArrowLeft") {
            e.preventDefault();
            pendingSnackPick = "berry_bean";
          } else if (e.code === "Digit4" || isCoop && e.code === "ArrowRight") {
            e.preventDefault();
            pendingSnackPick = "cider";
          }
          return;
        }
        if (e.code === "Space" || e.code === "KeyW") {
          e.preventDefault();
          pendingPrimaryTap = true;
        } else if (e.code === "Enter" || e.code === "ArrowUp") {
          e.preventDefault();
          if (isCoop) {
            pendingSecondaryTap = true;
          } else {
            pendingPrimaryTap = true;
          }
        }
      } else if (e.code === "Space" || e.code === "Enter") {
        if (state.phase === "pass_banner") {
          e.preventDefault();
          applyAction(state, { type: "CONFIRM_PASS" });
        } else if (state.phase === "dish_complete") {
          e.preventDefault();
          applyAction(state, { type: "NEXT_STAGE" });
        }
      }
    });
    window.addEventListener("keyup", (e) => {
      const isCoop = state.playMode === "laptop_coop";
      if (e.code === "KeyA") {
        heldLeftP1 = false;
      } else if (e.code === "KeyD") {
        heldRightP1 = false;
      } else if (e.code === "ArrowLeft") {
        if (isCoop) {
          heldLeftP2 = false;
        } else {
          heldLeftP1 = false;
        }
      } else if (e.code === "ArrowRight") {
        if (isCoop) {
          heldRightP2 = false;
        } else {
          heldRightP1 = false;
        }
      }
    });
    function makeBtn(label, className, onClick) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = className;
      btn.textContent = label;
      btn.addEventListener("click", () => {
        unlockAudio();
        onClick();
      });
      return btn;
    }
    function makeInstantActionBtn(label, className, onTrigger) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = className;
      btn.textContent = label;
      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        unlockAudio();
        onTrigger();
      });
      btn.addEventListener("click", (e) => {
        if (e.detail === 0) {
          unlockAudio();
          onTrigger();
        }
      });
      return btn;
    }
    function renderDeck() {
      deckEl.innerHTML = "";
      if (state.phase === "title") {
        const wrap = document.createElement("div");
        wrap.className = "deck-stack";
        const intro = document.createElement("p");
        intro.className = "deck-note";
        intro.textContent = "Cook 4 Thanksgiving treats, tame the runaway lawn chair, hang leaves on the Gratitude Maple Tree, and save your Family Postcard!";
        wrap.appendChild(intro);
        const diffRow = document.createElement("div");
        diffRow.className = "seg-row";
        const modes = [
          { id: "cozy", label: "Cozy (Ages 5+, No Timer)" },
          { id: "bustling", label: "Bustling Chef (Timed)" }
        ];
        for (let i = 0; i < modes.length; i++) {
          const m = modes[i];
          diffRow.appendChild(
            makeBtn(m.label, "seg-btn" + (state.difficulty === m.id ? " active" : ""), () => {
              applyAction(state, { type: "SET_DIFFICULTY", difficulty: m.id });
              lastRenderedPhaseKey = "";
            })
          );
        }
        wrap.appendChild(diffRow);
        const playRow = document.createElement("div");
        playRow.className = "seg-row";
        const setups = [
          { mode: "solo", chefs: 1, label: "1 Chef" },
          { mode: "pass_and_play", chefs: 2, label: "2 Pass" },
          { mode: "pass_and_play", chefs: 3, label: "3 Pass" },
          { mode: "pass_and_play", chefs: 4, label: "4 Pass" }
        ];
        for (let i = 0; i < setups.length; i++) {
          const s = setups[i];
          const active = state.playMode === s.mode && state.chefCount === s.chefs;
          playRow.appendChild(
            makeBtn(s.label, "seg-btn" + (active ? " active" : ""), () => {
              applyAction(state, { type: "SET_PLAY_MODE", playMode: s.mode, chefCount: s.chefs });
              lastRenderedPhaseKey = "";
            })
          );
        }
        wrap.appendChild(playRow);
        const coopRow = document.createElement("div");
        coopRow.className = "seg-row";
        coopRow.appendChild(
          makeBtn(
            "Laptop 2P Co-op (P1: WASD/Space + P2: Arrows/Enter)",
            "seg-btn" + (state.playMode === "laptop_coop" ? " active" : ""),
            () => {
              applyAction(state, { type: "SET_PLAY_MODE", playMode: "laptop_coop", chefCount: 2 });
              lastRenderedPhaseKey = "";
            }
          )
        );
        wrap.appendChild(coopRow);
        wrap.appendChild(
          makeBtn("Start the Backyard Feast!", "primary-btn big-btn", () => {
            clearInputs();
            applyAction(state, { type: "START_FEAST" });
          })
        );
        deckEl.appendChild(wrap);
        return;
      }
      if (state.phase === "pass_banner") {
        const dishId = getCurrentDishId(state);
        const spec = DISH_SPECS[dishId];
        const wrap = document.createElement("div");
        wrap.className = "deck-stack center-stack";
        const badge = document.createElement("div");
        badge.className = "pass-badge";
        badge.textContent = "Pass the phone to " + getChefLabel(state.activeChefIndex) + "!";
        wrap.appendChild(badge);
        const sub = document.createElement("p");
        sub.className = "deck-note";
        sub.textContent = "Up next: " + spec.title + " - " + spec.instruction;
        wrap.appendChild(sub);
        wrap.appendChild(
          makeBtn("I'm Ready!", "primary-btn big-btn", () => {
            clearInputs();
            applyAction(state, { type: "CONFIRM_PASS" });
          })
        );
        deckEl.appendChild(wrap);
        return;
      }
      if (state.phase === "dish_play" && state.dishState) {
        const wrap = document.createElement("div");
        wrap.className = "deck-stack";
        const isCoop = state.playMode === "laptop_coop";
        if (state.dishState.kind === "golden_toast") {
          const tip = document.createElement("p");
          tip.className = "deck-note";
          tip.textContent = isCoop ? "P1 (Space) & P2 Bird (Enter): catch toast in the Golden Zone!" : "Tap when toast pops into the dashed Golden Zone!";
          wrap.appendChild(tip);
          wrap.appendChild(
            makeInstantActionBtn("CATCH & BUTTER!", "primary-btn giant-btn", () => {
              pendingPrimaryTap = true;
            })
          );
        } else if (state.dishState.kind === "flying_popcorn") {
          if (isCoop) {
            const coopTip = document.createElement("p");
            coopTip.className = "deck-note";
            coopTip.textContent = "P1: A / D moves Beagle Bowl | P2: Left / Right flies Bird Cup!";
            wrap.appendChild(coopTip);
          }
          const track = document.createElement("div");
          track.className = "slide-track";
          track.textContent = "<--  Slide thumb here to move the bowl  -->";
          track.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            unlockAudio();
            track.setPointerCapture(e.pointerId);
            const rect = track.getBoundingClientRect();
            activePointerXNorm = (e.clientX - rect.left) / Math.max(1, rect.width);
          });
          track.addEventListener("pointermove", (e) => {
            if (e.buttons === 0 && e.pointerType === "mouse") {
              return;
            }
            const rect = track.getBoundingClientRect();
            activePointerXNorm = (e.clientX - rect.left) / Math.max(1, rect.width);
          });
          const stopSlide = () => {
            activePointerXNorm = null;
          };
          track.addEventListener("pointerup", stopSlide);
          track.addEventListener("pointercancel", stopSlide);
          wrap.appendChild(track);
          const lrRow = document.createElement("div");
          lrRow.className = "seg-row";
          const leftBtn = document.createElement("button");
          leftBtn.type = "button";
          leftBtn.className = "secondary-btn big-btn";
          leftBtn.textContent = "<< LEFT";
          leftBtn.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            unlockAudio();
            heldLeftP1 = true;
          });
          const stopL = () => {
            heldLeftP1 = false;
          };
          leftBtn.addEventListener("pointerup", stopL);
          leftBtn.addEventListener("pointerleave", stopL);
          leftBtn.addEventListener("pointercancel", stopL);
          const rightBtn = document.createElement("button");
          rightBtn.type = "button";
          rightBtn.className = "secondary-btn big-btn";
          rightBtn.textContent = "RIGHT >>";
          rightBtn.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            unlockAudio();
            heldRightP1 = true;
          });
          const stopR = () => {
            heldRightP1 = false;
          };
          rightBtn.addEventListener("pointerup", stopR);
          rightBtn.addEventListener("pointerleave", stopR);
          rightBtn.addEventListener("pointercancel", stopR);
          lrRow.appendChild(leftBtn);
          lrRow.appendChild(rightBtn);
          wrap.appendChild(lrRow);
        } else if (state.dishState.kind === "folding_chair") {
          const tip = document.createElement("p");
          tip.className = "deck-note";
          tip.textContent = isCoop ? "Team up! P1 (Space/W) + P2 (Enter/Up) tap fast to fold the lawn chair!" : "Tap fast to fold and tame the runaway backyard lawn chair!";
          wrap.appendChild(tip);
          wrap.appendChild(
            makeInstantActionBtn("TAME THE CHAIR!", "primary-btn giant-btn", () => {
              pendingPrimaryTap = true;
            })
          );
        } else if (state.dishState.kind === "pretzel_platter") {
          const tip = document.createElement("p");
          tip.className = "deck-note";
          tip.textContent = isCoop ? "Tap snacks in order! (P1: 1/2 or A/S | P2: 3/4 or Left/Right)" : "Tap the highlighted snacks in order to fill the platter!";
          wrap.appendChild(tip);
          const grid = document.createElement("div");
          grid.className = "snack-grid";
          for (let i = 0; i < SNACK_SPECS.length; i++) {
            const sp = SNACK_SPECS[i];
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "snack-btn";
            const ic = document.createElement("canvas");
            ic.width = 48;
            ic.height = 48;
            const ictx = ic.getContext("2d");
            if (ictx) {
              drawSnackIcon(ictx, sp.id, 24, 24, 34);
            }
            const lbl = document.createElement("span");
            lbl.className = "snack-label";
            lbl.textContent = sp.label;
            const hint = document.createElement("span");
            hint.className = "key-hint";
            hint.textContent = "[" + sp.keyHint + "]";
            btn.appendChild(ic);
            btn.appendChild(lbl);
            btn.appendChild(hint);
            btn.addEventListener("pointerdown", (e) => {
              e.preventDefault();
              unlockAudio();
              pendingSnackPick = sp.id;
            });
            btn.addEventListener("click", (e) => {
              if (e.detail === 0) {
                unlockAudio();
                pendingSnackPick = sp.id;
              }
            });
            grid.appendChild(btn);
          }
          wrap.appendChild(grid);
        } else if (state.dishState.kind === "pumpkin_pie") {
          const isCookie = state.dishState.stage === "cookie_drop";
          if (isCookie) {
            wrap.appendChild(
              makeInstantActionBtn("DROP MAPLE COOKIE!", "primary-btn giant-btn", () => {
                pendingPrimaryTap = true;
              })
            );
          } else {
            const pad = document.createElement("div");
            pad.className = "slide-track pie-pad";
            pad.textContent = isCoop ? "Swipe here, or P1 (Space) + P2 (Enter) tap together to whip cream!" : "Rub back & forth here (or tap below) to whip cream!";
            pad.addEventListener("pointerdown", (e) => {
              e.preventDefault();
              unlockAudio();
              pad.setPointerCapture(e.pointerId);
              const rect = pad.getBoundingClientRect();
              lastSwipeX = (e.clientX - rect.left) / Math.max(1, rect.width);
              lastSwipeY = (e.clientY - rect.top) / Math.max(1, rect.height);
              pendingPrimaryTap = true;
            });
            pad.addEventListener("pointermove", (e) => {
              if (e.buttons === 0 && e.pointerType === "mouse") {
                return;
              }
              const rect = pad.getBoundingClientRect();
              const nx = (e.clientX - rect.left) / Math.max(1, rect.width);
              const ny = (e.clientY - rect.top) / Math.max(1, rect.height);
              if (lastSwipeX !== null && lastSwipeY !== null) {
                pendingSwipeDelta += Math.hypot(nx - lastSwipeX, ny - lastSwipeY);
              }
              lastSwipeX = nx;
              lastSwipeY = ny;
            });
            const endPad = () => {
              lastSwipeX = null;
              lastSwipeY = null;
            };
            pad.addEventListener("pointerup", endPad);
            pad.addEventListener("pointercancel", endPad);
            wrap.appendChild(pad);
            wrap.appendChild(
              makeInstantActionBtn("WHIP CREAM SWIRL!", "primary-btn big-btn", () => {
                pendingPrimaryTap = true;
              })
            );
          }
        }
        deckEl.appendChild(wrap);
        return;
      }
      if (state.phase === "dish_complete") {
        const last = state.results[state.results.length - 1];
        const wrap = document.createElement("div");
        wrap.className = "deck-stack center-stack";
        const msg = document.createElement("p");
        msg.className = "deck-note";
        msg.textContent = last ? last.guestUnlocked + " joined the backyard table! (" + String(last.stars) + " stars earned)" : "Stage complete!";
        wrap.appendChild(msg);
        const isFinalDish = state.stageIndex + 1 >= DISH_SEQUENCE.length;
        wrap.appendChild(
          makeBtn(
            isFinalDish ? "Visit the Gratitude Maple Tree!" : "Next Backyard Station!",
            "primary-btn big-btn",
            () => {
              clearInputs();
              applyAction(state, { type: "NEXT_STAGE" });
            }
          )
        );
        deckEl.appendChild(wrap);
        return;
      }
      if (state.phase === "gratitude_tree") {
        const wrap = document.createElement("div");
        wrap.className = "deck-stack gratitude-deck";
        const who = document.createElement("div");
        who.className = "gratitude-head";
        who.textContent = "Pick a sticker (or write a note) for " + getChefLabel(state.gratitudeChefCursor % state.chefCount) + ":";
        wrap.appendChild(who);
        const grid = document.createElement("div");
        grid.className = "sticker-grid";
        for (let i = 0; i < STICKER_PRESETS.length; i++) {
          const st = STICKER_PRESETS[i];
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "sticker-btn" + (selectedSticker === st.id ? " active" : "");
          const iconCanvas = document.createElement("canvas");
          iconCanvas.width = 40;
          iconCanvas.height = 40;
          const ictx = iconCanvas.getContext("2d");
          if (ictx) {
            drawStickerIcon(ictx, st.id, 20, 20, 26);
          }
          const lbl = document.createElement("span");
          lbl.textContent = st.label;
          btn.appendChild(iconCanvas);
          btn.appendChild(lbl);
          btn.addEventListener("click", () => {
            unlockAudio();
            selectedSticker = st.id;
            lastRenderedPhaseKey = "";
          });
          grid.appendChild(btn);
        }
        wrap.appendChild(grid);
        const colorRow = document.createElement("div");
        colorRow.className = "color-row";
        const colors = ["crimson", "amber", "gold", "russet"];
        for (let i = 0; i < colors.length; i++) {
          const c = colors[i];
          const swatch = document.createElement("button");
          swatch.type = "button";
          swatch.className = "color-dot" + (selectedLeafColor === c ? " active" : "");
          swatch.style.backgroundColor = LEAF_COLORS[c].fill;
          swatch.setAttribute("aria-label", LEAF_COLORS[c].label);
          swatch.addEventListener("click", () => {
            unlockAudio();
            selectedLeafColor = c;
            lastRenderedPhaseKey = "";
          });
          colorRow.appendChild(swatch);
        }
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.className = "note-input name-input";
        nameInput.maxLength = 16;
        nameInput.placeholder = "Name (optional)";
        nameInput.value = authorDraft;
        nameInput.addEventListener("input", () => {
          authorDraft = nameInput.value;
        });
        colorRow.appendChild(nameInput);
        wrap.appendChild(colorRow);
        const noteInput = document.createElement("input");
        noteInput.type = "text";
        noteInput.className = "note-input";
        noteInput.maxLength = MAX_CUSTOM_NOTE_LEN;
        noteInput.placeholder = "Optional: type your own thank-you note (any language)...";
        noteInput.value = customNoteDraft;
        noteInput.addEventListener("input", () => {
          customNoteDraft = noteInput.value;
        });
        wrap.appendChild(noteInput);
        const actionRow = document.createElement("div");
        actionRow.className = "seg-row";
        const addBtn = makeBtn(
          state.leaves.length >= MAX_LEAVES ? "Tree Full!" : "Hang Leaf on Tree",
          "primary-btn",
          () => {
            if (state.leaves.length >= MAX_LEAVES) {
              return;
            }
            applyAction(state, {
              type: "ADD_LEAF",
              stickerId: selectedSticker,
              leafColor: selectedLeafColor,
              customMessage: customNoteDraft,
              authorLabel: authorDraft
            });
            customNoteDraft = "";
            authorDraft = "";
            lastRenderedPhaseKey = "";
          }
        );
        if (state.leaves.length >= MAX_LEAVES) {
          addBtn.disabled = true;
        }
        const doneBtn = makeBtn(
          state.leaves.length > 0 ? "Let's Feast! (" + String(state.leaves.length) + ")" : "Let's Feast!",
          "secondary-btn",
          () => {
            applyAction(state, { type: "FINISH_GRATITUDE" });
          }
        );
        actionRow.appendChild(addBtn);
        actionRow.appendChild(doneBtn);
        wrap.appendChild(actionRow);
        deckEl.appendChild(wrap);
        return;
      }
      if (state.phase === "feast_finale") {
        const wrap = document.createElement("div");
        wrap.className = "deck-stack";
        const promptBox = document.createElement("div");
        promptBox.className = "prompt-card";
        const promptTitle = document.createElement("div");
        promptTitle.className = "prompt-kicker";
        promptTitle.textContent = "Table Talk Prompt";
        const promptText = document.createElement("p");
        promptText.className = "prompt-text";
        promptText.textContent = getTablePrompt(state.tablePromptIndex);
        promptBox.appendChild(promptTitle);
        promptBox.appendChild(promptText);
        wrap.appendChild(promptBox);
        const btnRow = document.createElement("div");
        btnRow.className = "seg-row";
        btnRow.appendChild(
          makeBtn("Save Family Postcard", "primary-btn", () => {
            lastPostcardCanvas = renderPostcardCanvas(state);
            if (modalImg && modalEl && modalStatus) {
              modalImg.src = lastPostcardCanvas.toDataURL("image/png");
              modalStatus.textContent = "Tap Share / Save below, or press & hold the postcard on iPhone to save to Photos.";
              modalEl.classList.remove("hidden");
            }
          })
        );
        btnRow.appendChild(
          makeBtn("New Table Prompt", "secondary-btn", () => {
            applyAction(state, { type: "SHUFFLE_PROMPT" });
            lastRenderedPhaseKey = "";
          })
        );
        wrap.appendChild(btnRow);
        wrap.appendChild(
          makeBtn("Cook Another Feast!", "ghost-btn", () => {
            clearInputs();
            applyAction(state, { type: "PLAY_AGAIN" });
          })
        );
        deckEl.appendChild(wrap);
      }
    }
    function updateHud() {
      if (modePillEl) {
        const diffTxt = state.difficulty === "cozy" ? "Cozy" : "Bustling";
        const playTxt = state.playMode === "laptop_coop" ? "2P Co-op" : diffTxt;
        modePillEl.textContent = state.playMode === "laptop_coop" ? diffTxt + " | " + playTxt : diffTxt + " Mode";
      }
      if (!hudTitleEl || !hudMeterEl) {
        return;
      }
      if (state.phase === "title") {
        hudTitleEl.textContent = "Beagle Chef's Backyard Feast";
        hudMeterEl.textContent = "5 Stages + Gratitude Tree";
      } else if (state.phase === "pass_banner") {
        hudTitleEl.textContent = getChefLabel(state.activeChefIndex) + "'s Turn";
        hudMeterEl.textContent = "Stage " + String(state.stageIndex + 1) + "/" + String(DISH_SEQUENCE.length);
      } else if (state.phase === "dish_play" && state.dishState) {
        const spec = DISH_SPECS[state.dishState.kind];
        hudTitleEl.textContent = spec.shortTitle;
        let progressTxt = "";
        if (state.dishState.kind === "golden_toast") {
          progressTxt = String(state.dishState.plated) + "/" + String(state.dishState.target);
        } else if (state.dishState.kind === "flying_popcorn") {
          progressTxt = String(state.dishState.caught) + "/" + String(state.dishState.target);
        } else if (state.dishState.kind === "folding_chair") {
          progressTxt = String(Math.round(state.dishState.tamedProgress)) + "%";
        } else if (state.dishState.kind === "pretzel_platter") {
          progressTxt = String(state.dishState.plattersDone) + "/" + String(state.dishState.target);
        } else {
          progressTxt = String(state.dishState.piesFinished) + "/" + String(state.dishState.target);
        }
        const timerTxt = state.dishState.timeLeftSec !== null ? " | " + String(Math.ceil(state.dishState.timeLeftSec)) + "s" : " | Cozy";
        hudMeterEl.textContent = progressTxt + timerTxt;
      } else if (state.phase === "dish_complete") {
        hudTitleEl.textContent = "Stage Complete!";
        hudMeterEl.textContent = "Stars: " + String(state.totalStars);
      } else if (state.phase === "gratitude_tree") {
        hudTitleEl.textContent = "Gratitude Maple Tree";
        hudMeterEl.textContent = "Leaves: " + String(state.leaves.length) + "/" + String(MAX_LEAVES);
      } else {
        hudTitleEl.textContent = "Happy Thanksgiving!";
        hudMeterEl.textContent = "Total Stars: " + String(state.totalStars) + "/15";
      }
    }
    function phaseKey() {
      const sub = state.phase === "dish_play" && state.dishState ? state.dishState.kind + ":" + (state.dishState.kind === "pumpkin_pie" ? state.dishState.stage : "play") : "";
      return [
        state.phase,
        sub,
        state.difficulty,
        state.playMode,
        state.chefCount,
        state.stageIndex,
        state.leaves.length,
        state.tablePromptIndex,
        selectedSticker,
        selectedLeafColor
      ].join("|");
    }
    let lastTs = performance.now();
    function loop(now) {
      const dt = Math.min(0.05, Math.max(1e-3, (now - lastTs) / 1e3));
      lastTs = now;
      const moveDir = heldLeftP1 && !heldRightP1 ? -1 : heldRightP1 && !heldLeftP1 ? 1 : 0;
      const moveDirP2 = heldLeftP2 && !heldRightP2 ? -1 : heldRightP2 && !heldLeftP2 ? 1 : 0;
      stepGame(state, dt, {
        primaryTap: pendingPrimaryTap,
        secondaryTap: pendingSecondaryTap,
        moveDir,
        moveDirP2,
        pointerXNorm: activePointerXNorm,
        swipeDelta: pendingSwipeDelta,
        snackPick: pendingSnackPick
      });
      pendingPrimaryTap = false;
      pendingSecondaryTap = false;
      pendingSwipeDelta = 0;
      pendingSnackPick = null;
      const sounds = drainPendingSounds(state);
      for (let i = 0; i < sounds.length; i++) {
        audio.play(sounds[i]);
      }
      const key = phaseKey();
      if (key !== lastRenderedPhaseKey) {
        lastRenderedPhaseKey = key;
        renderDeck();
      }
      updateHud();
      renderStageCanvas(ctx, state);
      window.requestAnimationFrame(loop);
    }
    renderDeck();
    updateHud();
    renderStageCanvas(ctx, state);
    window.requestAnimationFrame(loop);
  }
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => mountApp());
    } else {
      mountApp();
    }
  }
  return __toCommonJS(app_exports);
})();
  return __ThanksgivingBundle;
});
