(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.SoccerSmarterWeb = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var WIDTH = 1280;
  var HEIGHT = 880;
  var INK = "rgb(231, 241, 244)";
  var MUTED = "rgb(157, 181, 190)";
  var NAVY = "rgb(14, 29, 40)";
  var PANEL = "rgb(24, 44, 57)";
  var GREEN = "rgb(159, 235, 164)";
  var GOLD = "rgb(255, 207, 107)";
  var CORAL = "rgb(249, 143, 121)";
  var BLUE = "rgb(96, 190, 247)";
  var PITCH = { x: 52, y: 174, width: 694, height: 590 };
  var SIDE = { x: 790, y: 140, width: 458, height: 676 };
  var ANIMATION_SECONDS = 2.4;
  var ANIMATED = ["observe", "outcome", "coach"];
  var STORAGE_KEY = "soccer_smarter_progress_v1";

  function blend(a, b, t) {
    return [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t
    ];
  }

  function sampleTrack(track, fraction) {
    var contact = track.contact || 0.0;
    var t = Math.max(0.0, Math.min(1.0, (fraction - contact) / (1.0 - contact)));
    var pts = track.points;
    if (track.kind === "curve") {
      return blend(blend(pts[0], pts[1], t), blend(pts[1], pts[2], t), t);
    }
    var segment = t * (pts.length - 1);
    var index = Math.min(Math.floor(segment), pts.length - 2);
    return blend(pts[index], pts[index + 1], segment - index);
  }

  function statePositions(state) {
    var map = {};
    for (var i = 0; i < state.actors.length; i++) {
      var a = state.actors[i];
      map[a.key] = a.position.slice();
    }
    return map;
  }

  function frameMotion(motion, state, fraction) {
    var actors = statePositions(state);
    for (var i = 0; i < motion.actors.length; i++) {
      var pair = motion.actors[i];
      actors[pair[0]] = sampleTrack(pair[1], fraction);
    }
    return {
      actors: actors,
      ball: sampleTrack(motion.ball, fraction)
    };
  }

  function routeMotion(motion, state) {
    var pos = statePositions(state)[state.control];
    if (state.ball[0] !== pos[0] || state.ball[1] !== pos[1]) {
      for (var i = 0; i < motion.actors.length; i++) {
        if (motion.actors[i][0] === state.control) {
          return motion.actors[i][1];
        }
      }
      return { kind: "linear", points: [pos, pos], contact: 0.0 };
    }
    return motion.ball;
  }

  function previewChoice(choice, state) {
    return choice.intent ? choice.intent : routeMotion(choice.motion, state);
  }

  function findNode(episode, nodeId) {
    for (var i = 0; i < episode.nodes.length; i++) {
      if (episode.nodes[i].id === nodeId) {
        return episode.nodes[i];
      }
    }
    return episode.nodes[0];
  }

  function Notebook(notebookData) {
    this.data = notebookData;
    this.entries = { X01: {}, X02: {}, X03: {} };
    this.activity = null;
    this.index = 0;
    this.evidence = [];
  }

  Object.defineProperty(Notebook.prototype, "steps", {
    get: function () {
      var ev = {
        key: "evidence",
        title: "Use a real play as evidence",
        prompt: "Choose something you actually tried, or skip. Play a mission first if this list is empty.",
        options: this.evidence
      };
      if (this.activity === "X01") {
        return [this.data.X01[0], ev, this.data.X01[1]];
      }
      if (this.activity === "X03") {
        return [this.data.X03[0], ev, this.data.X03[1], this.data.X03[2]];
      }
      return this.activity === "X02" ? this.data.X02 : [];
    }
  });

  Object.defineProperty(Notebook.prototype, "step", {
    get: function () {
      var s = this.steps;
      return this.index < s.length ? s[this.index] : null;
    }
  });

  Notebook.prototype.start = function (activity, evidence) {
    this.activity = activity;
    this.index = 0;
    this.evidence = (evidence || []).slice(0, 3);
  };

  Notebook.prototype.choose = function (index) {
    var s = this.step;
    if (!this.activity || !s || index < 0 || index >= s.options.length) {
      return false;
    }
    this.entries[this.activity][s.key] = s.options[index];
    this.index += 1;
    return true;
  };

  Notebook.prototype.skip = function () {
    if (!this.step) {
      return false;
    }
    this.index += 1;
    return true;
  };

  Notebook.prototype.back = function () {
    if (this.index === 0) {
      return false;
    }
    this.index -= 1;
    return true;
  };

  function Session(data, mission, initialResults, onSave) {
    this.episodes = data.episodes.filter(function (e) {
      return e.id.indexOf(mission + ".") === 0;
    });
    this.mission = mission;
    this.index = 0;
    this.results = Object.assign({}, initialResults || {});
    this.onSave = onSave || function () {};
    this.practice = [];
    this.practiceOnly = false;
    this._root();
  }

  Object.defineProperty(Session.prototype, "episode", {
    get: function () {
      return this.episodes[this.index];
    }
  });

  Object.defineProperty(Session.prototype, "node", {
    get: function () {
      return findNode(this.episode, this.nodeId);
    }
  });

  Object.defineProperty(Session.prototype, "feedback", {
    get: function () {
      return this.selected === null ? null : this.node.choices[this.selected];
    }
  });

  Object.defineProperty(Session.prototype, "coachChoice", {
    get: function () {
      var sel = this.feedback;
      if (sel !== null && sel.rating === 2) {
        return sel;
      }
      var best = this.node.choices[0];
      for (var i = 1; i < this.node.choices.length; i++) {
        if (this.node.choices[i].rating > best.rating) {
          best = this.node.choices[i];
        }
      }
      return best;
    }
  });

  Object.defineProperty(Session.prototype, "activeChoice", {
    get: function () {
      if (this.phase === "coach") {
        return this.coachChoice;
      }
      return (this.phase === "outcome" || this.phase === "feedback") ? this.feedback : null;
    }
  });

  Object.defineProperty(Session.prototype, "duration", {
    get: function () {
      var c = this.activeChoice;
      return c === null ? ANIMATION_SECONDS : c.motion.duration;
    }
  });

  Object.defineProperty(Session.prototype, "fraction", {
    get: function () {
      return this.phase === "feedback" ? 1.0 : Math.min(1.0, this.elapsed / this.duration);
    }
  });

  Session.prototype._root = function () {
    this.nodeId = this.episode.nodes[0].id;
    this.prediction = null;
    this.selected = null;
    this.phase = this.episode.prediction ? "predict" : "observe";
    this.elapsed = 0.0;
    this.paused = false;
  };

  Session.prototype.predict = function (index) {
    if (this.phase !== "predict" || (index !== 0 && index !== 1)) {
      return false;
    }
    this.prediction = index;
    this.phase = "observe";
    return true;
  };

  Session.prototype.choose = function (index) {
    if (this.phase !== "decide" || index < 0 || index >= 3) {
      return false;
    }
    this.selected = index;
    var choice = this.node.choices[index];
    var key = this.episode.id + ":" + this.nodeId;
    if (!this.practiceOnly) {
      if (!(key in this.results)) {
        this.results[key] = choice.rating;
        this.onSave(this.results);
      }
    } else {
      this.practice.push([this.episode.id, this.nodeId, choice.key, choice.rating]);
    }
    this.phase = "outcome";
    this.elapsed = 0.0;
    return true;
  };

  Session.prototype.tick = function (seconds) {
    if (ANIMATED.indexOf(this.phase) !== -1 && !this.paused) {
      this.elapsed += seconds;
      this._finish();
    }
  };

  Session.prototype._finish = function () {
    if (this.elapsed >= this.duration) {
      this.phase = this.phase === "observe" ? "decide" : "feedback";
      this.elapsed = 0.0;
      this.paused = false;
    }
  };

  Session.prototype.togglePause = function () {
    if (ANIMATED.indexOf(this.phase) === -1) {
      return false;
    }
    this.paused = !this.paused;
    return true;
  };

  Session.prototype.step = function () {
    if (ANIMATED.indexOf(this.phase) !== -1) {
      this.paused = true;
      this.elapsed += 0.2;
      this._finish();
    }
  };

  Session.prototype.skip = function () {
    if (ANIMATED.indexOf(this.phase) !== -1) {
      this.elapsed = this.duration;
      this._finish();
    }
  };

  Session.prototype.compareCoach = function () {
    if (this.phase !== "feedback") {
      return false;
    }
    this.phase = "coach";
    this.elapsed = 0.0;
    return true;
  };

  Session.prototype.retry = function () {
    if (this.phase !== "feedback") {
      return false;
    }
    this.practiceOnly = true;
    this.selected = null;
    this.phase = "observe";
    this.elapsed = 0.0;
    this.paused = false;
    return true;
  };

  Session.prototype.restart = function () {
    this.practiceOnly = true;
    this._root();
  };

  Session.prototype.advance = function () {
    if (this.phase !== "feedback" || !this.feedback) {
      return false;
    }
    var dest = this.feedback.next_node;
    if (dest !== null && dest !== undefined) {
      this.nodeId = dest;
      this.phase = "observe";
      this.selected = null;
      this.elapsed = 0.0;
    } else if (this.index + 1 < this.episodes.length) {
      this.index += 1;
      this.practiceOnly = false;
      this._root();
    } else {
      this.phase = "summary";
    }
    return true;
  };

  Session.prototype.summary = function () {
    var self = this;
    var keys = Object.keys(this.results).filter(function (k) {
      return k.indexOf(self.mission + ".") === 0;
    });
    var good = keys.filter(function (k) {
      return self.results[k] > 0;
    }).length;
    return [good, keys.length, this.practice.length];
  };

  function makeButton(x, y, width, height, label, action, number) {
    return {
      rect: { x: x, y: y, width: width, height: height },
      label: label,
      action: action,
      number: number || ""
    };
  }

  function sideButton(label, action, y, number, height) {
    return makeButton(814, y, 410, height || 62, label, action, number || "");
  }

  function collidePoint(rect, pt) {
    return pt[0] >= rect.x && pt[0] <= rect.x + rect.width && pt[1] >= rect.y && pt[1] <= rect.y + rect.height;
  }

  function pitchPoint(point) {
    return [
      Math.round(PITCH.x + (point[0] / 100.0) * PITCH.width),
      Math.round(PITCH.y + (point[1] / 100.0) * PITCH.height)
    ];
  }

  function Painter(ctx) {
    this.ctx = ctx;
    this.errors = [];
  }

  Painter.prototype.setFont = function (size) {
    var px = Math.max(11, Math.round(size * 0.68));
    this.ctx.font = "600 " + px + 'px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    return Math.round(size * 0.75);
  };

  Painter.prototype.measureWidth = function (text, size) {
    this.setFont(size);
    return this.ctx.measureText(text).width;
  };

  Painter.prototype.text = function (message, rect, size, color) {
    var sz = size || 25;
    var fill = color || INK;
    var lineHeight = this.setFont(sz);
    var lines = [];
    var paragraphs = String(message).split("\n");
    for (var p = 0; p < paragraphs.length; p++) {
      var words = paragraphs[p].trim().length ? paragraphs[p].trim().split(/\s+/) : [];
      var line = "";
      for (var w = 0; w < words.length; w++) {
        var word = words[w];
        var candidate = (line ? line + " " + word : word).trim();
        if (line && this.ctx.measureText(candidate).width > rect.width) {
          lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      }
      lines.push(line);
    }
    var totalHeight = lines.length * lineHeight;
    var tooWide = false;
    for (var k = 0; k < lines.length; k++) {
      if (this.ctx.measureText(lines[k]).width > rect.width + 1) {
        tooWide = true;
      }
    }
    if (totalHeight > rect.height + 2 || tooWide) {
      this.errors.push(message);
    }
    this.ctx.fillStyle = fill;
    this.ctx.textBaseline = "top";
    for (var i = 0; i < lines.length; i++) {
      this.ctx.fillText(lines[i], rect.x, rect.y + i * lineHeight);
    }
    return totalHeight;
  };

  Painter.prototype.panel = function (rect, color, radius) {
    var r = radius === undefined ? 18 : radius;
    this.ctx.fillStyle = color || PANEL;
    this.ctx.beginPath();
    if (this.ctx.roundRect) {
      this.ctx.roundRect(rect.x, rect.y, rect.width, rect.height, r);
    } else {
      this.ctx.rect(rect.x, rect.y, rect.width, rect.height);
    }
    this.ctx.fill();
  };

  Painter.prototype.strokeRoundRect = function (rect, color, lineWidth, radius) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    if (this.ctx.roundRect) {
      this.ctx.roundRect(rect.x, rect.y, rect.width, rect.height, radius);
    } else {
      this.ctx.rect(rect.x, rect.y, rect.width, rect.height);
    }
    this.ctx.stroke();
  };

  Painter.prototype.button = function (button, hovered, touchPreviewed) {
    var active = hovered || touchPreviewed;
    this.panel(button.rect, active ? "rgb(48, 77, 86)" : "rgb(34, 59, 73)", 14);
    this.strokeRoundRect(button.rect, touchPreviewed ? GOLD : (active ? GREEN : "rgb(67, 95, 107)"), 2, 14);
    var offset = 16;
    if (button.number) {
      var cx = button.rect.x + 27;
      var cy = button.rect.y + 30;
      this.ctx.fillStyle = GOLD;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 15, 0, Math.PI * 2);
      this.ctx.fill();
      this.text(button.number, { x: button.rect.x + 21, y: button.rect.y + 21, width: 24, height: 24 }, 24, NAVY);
      offset = 54;
    }
    var box = {
      x: button.rect.x + offset,
      y: button.rect.y + 12,
      width: button.rect.width - offset - 16,
      height: button.rect.height - 16
    };
    this.text(button.label, box, 24, INK);
  };

  function drawCircle(ctx, pt, radius, color, lineWidth) {
    ctx.beginPath();
    ctx.arc(pt[0], pt[1], radius, 0, Math.PI * 2);
    if (lineWidth) {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    } else {
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  function drawLine(ctx, a, b, color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
  }

  function drawRoute(painter, track, color, dashed) {
    var ctx = painter.ctx;
    var points = [];
    for (var i = 0; i <= 40; i++) {
      points.push(pitchPoint(sampleTrack(track, i / 40.0)));
    }
    for (var j = 0; j < 40; j++) {
      if (!dashed || j % 4 < 2) {
        drawLine(ctx, points[j], points[j + 1], color, 4);
      }
    }
    drawCircle(ctx, points[40], 10, color, 2);
  }

  function drawPitch(painter, role) {
    var ctx = painter.ctx;
    painter.panel(PITCH, "rgb(31, 108, 66)", 18);
    for (var stripe = 0; stripe < 6; stripe++) {
      if (stripe % 2 === 0) {
        painter.panel(
          { x: PITCH.x + 8, y: PITCH.y + 10 + stripe * 96, width: PITCH.width - 16, height: 48 },
          "rgb(37, 121, 74)",
          12
        );
      }
    }
    var line = "rgb(218, 244, 224)";
    var inset = { x: PITCH.x + 18, y: PITCH.y + 18, width: PITCH.width - 36, height: PITCH.height - 36 };
    painter.strokeRoundRect(inset, line, 3, 12);
    var midY = inset.y + Math.floor(inset.height / 2);
    drawLine(ctx, [inset.x, midY], [inset.x + inset.width, midY], line, 2);
    var cx = inset.x + Math.floor(inset.width / 2);
    drawCircle(ctx, [cx, midY], 66, line, 2);
    ctx.strokeStyle = line;
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 140, inset.y, 280, 95);
    ctx.strokeRect(cx - 140, inset.y + inset.height - 95, 280, 95);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - 62, inset.y - 12, 124, 14);
    ctx.strokeStyle = line;
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 62, inset.y + inset.height - 2, 124, 14);
    painter.text("Attacking goal ^", { x: PITCH.x + 22, y: PITCH.y - 34, width: 220, height: 30 }, 22, GOLD);
    if (role) {
      painter.text("Your role: " + role, { x: PITCH.x + 430, y: PITCH.y - 34, width: 250, height: 30 }, 22, GREEN);
    }
  }

  function drawWindowMarker(ctx, center) {
    drawCircle(ctx, center, 16, NAVY, 4);
    drawCircle(ctx, center, 12, GOLD, 3);
    drawLine(ctx, [center[0] - 18, center[1]], [center[0] + 18, center[1]], GOLD, 3);
    drawLine(ctx, [center[0], center[1] - 18], [center[0], center[1] + 18], GOLD, 3);
  }

  function drawPlayer(painter, point, label, team) {
    var ctx = painter.ctx;
    var center = pitchPoint(point);
    var colors = { home: BLUE, away: CORAL, keeper: GOLD };
    drawCircle(ctx, center, 21, NAVY, 0);
    drawCircle(ctx, center, 18, colors[team] || BLUE, 0);
    var compact = label.length <= 2;
    var size = compact ? 18 : 14;
    var w = painter.measureWidth(label, size);
    var h = painter.setFont(size);
    painter.ctx.fillStyle = NAVY;
    painter.ctx.textBaseline = "top";
    painter.ctx.fillText(label, Math.round(center[0] - w / 2), Math.round(center[1] - h / 2));
  }

  function drawBall(painter, point) {
    var ctx = painter.ctx;
    var center = pitchPoint(point);
    ctx.fillStyle = "rgb(18, 52, 34)";
    ctx.beginPath();
    ctx.ellipse(center[0], center[1] + 8, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    drawCircle(ctx, center, 10, INK, 0);
    drawCircle(ctx, center, 10, NAVY, 2);
  }

  function drawWorld(painter, session, hovered) {
    var node = session.node;
    var choice = session.activeChoice;
    var frame = choice === null
      ? { actors: statePositions(node.state), ball: node.state.ball.slice() }
      : frameMotion(choice.motion, node.state, session.fraction);
    if (hovered !== null && hovered !== undefined && session.phase === "decide" && node.choices[hovered]) {
      drawRoute(painter, previewChoice(node.choices[hovered], node.state), GOLD, false);
    }
    if (node.shot_window !== null && node.shot_window !== undefined) {
      drawWindowMarker(painter.ctx, pitchPoint(node.shot_window));
    }
    if (choice !== null) {
      drawRoute(painter, routeMotion(choice.motion, node.state), GOLD, false);
      if (session.phase === "feedback") {
        var best = session.coachChoice;
        drawRoute(painter, routeMotion(best.motion, node.state), GREEN, true);
      }
    }
    for (var i = 0; i < node.state.actors.length; i++) {
      var actor = node.state.actors[i];
      var label = actor.key === node.state.control ? actor.label : actor.label.replace("YOU", "You");
      drawPlayer(painter, frame.actors[actor.key], label, actor.team);
    }
    drawCircle(painter.ctx, pitchPoint(frame.actors[node.state.control]), 25, GREEN, 2);
    drawBall(painter, frame.ball);
    var controlled = node.state.control.toUpperCase();
    for (var j = 0; j < node.state.actors.length; j++) {
      if (node.state.actors[j].key === node.state.control) {
        controlled = node.state.actors[j].label;
      }
    }
    painter.text("YOU: " + controlled, { x: 68, y: 196, width: 300, height: 28 }, 24, GREEN);
    painter.text(
      "Gold: intended hover / actual result; Green dashed: coach",
      { x: 68, y: 726, width: 650, height: 28 },
      21,
      MUTED
    );
    painter.text(
      "Schematic teaching routes; outcomes are authored.",
      { x: 68, y: 756, width: 650, height: 28 },
      21,
      MUTED
    );
  }

  function loadStoredResults(storage) {
    if (!storage || !storage.getItem) {
      return {};
    }
    try {
      var raw = storage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveStoredResults(storage, results) {
    if (!storage || !storage.setItem) {
      return;
    }
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(results));
    } catch (e) {}
  }

  function SoccerSmarterWebApp(data, canvas, storage) {
    this.data = data;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.storage = storage;
    this.page = "menu";
    this.session = null;
    this.notebook = new Notebook(data.notebook);
    this.observations = [];
    this.storedResults = loadStoredResults(storage);
    this.hover = [-1, -1];
    this.touchPreviewChoice = null;
    this.mobileMode = false;
    this.layoutErrors = [];
    this.menuItems = data.missions.map(function (m) {
      return [m.title, "mission:" + m.id];
    }).concat([
      ["My growth notebook", "notebook"],
      ["Review the basics", "basics"]
    ]);
  }

  SoccerSmarterWebApp.prototype.buttons = function () {
    if (this.page === "menu") {
      return this.menuItems.map(function (pair, i) {
        return sideButton(pair[0], pair[1], 238 + 63 * i, String(i + 1), 55);
      });
    }
    var top = [makeButton(1120, 27, 128, 58, "Menu", "menu", "")];
    if (this.page === "game") {
      return top.concat([makeButton(928, 27, 170, 58, "Notebook", "notebook", "")], this._gameButtons());
    }
    if (this.page === "notebook") {
      var resume = this.session === null ? [] : [makeButton(928, 27, 170, 58, "Resume play", "resume", "")];
      return top.concat(resume, this._noteButtons());
    }
    return top.concat([sideButton("Back to advanced practice", "menu", 720, "")]);
  };

  SoccerSmarterWebApp.prototype._gameButtons = function () {
    var s = this.session;
    if (s.phase === "decide") {
      return s.node.choices.map(function (c, i) {
        return sideButton(c.label, "choice:" + i, 424 + 78 * i, String(i + 1));
      });
    }
    if (s.phase === "predict") {
      return ["Follow the pass", "Hold the central lane"].map(function (label, i) {
        return sideButton(label, "predict:" + i, 448 + 84 * i, String(i + 1));
      });
    }
    if (s.phase === "feedback") {
      return [
        sideButton("Compare coach / C", "coach", 566),
        sideButton("Try another choice / R", "retry", 638),
        sideButton("Continue / N", "next", 710)
      ];
    }
    if (s.phase === "summary") {
      return [
        sideButton("Replay this contrast / R", "restart", 566),
        sideButton("My growth notebook", "notebook", 638),
        sideButton("Choose another mission", "menu", 710)
      ];
    }
    return [
      sideButton("Finish animation / SPACE", "skip", 638),
      makeButton(814, 710, 194, 62, s.paused ? "Resume / P" : "Pause / P", "pause", ""),
      makeButton(1024, 710, 200, 62, "Step / .", "step", "")
    ];
  };

  SoccerSmarterWebApp.prototype._noteButtons = function () {
    var book = this.notebook;
    if (book.activity === null) {
      return [
        sideButton("My playing principle", "journal:X01", 340, "1"),
        sideButton("My practice team", "journal:X02", 424, "2"),
        sideButton("Pro watch and Try It", "journal:X03", 508, "3")
      ];
    }
    var step = book.step;
    var options = !step ? [] : step.options.map(function (label, i) {
      var text = label.length < 78 ? label : label.slice(0, 74) + "...";
      return sideButton(text, "note:" + i, 350 + 74 * i, String(i + 1));
    });
    return options.concat([
      sideButton(step ? "Skip step / N" : "Growth activities", step ? "note_skip" : "growth_home", 666),
      sideButton("Edit previous step / R", "note_back", 738)
    ]);
  };

  SoccerSmarterWebApp.prototype.activate = function (action) {
    var self = this;
    this.touchPreviewChoice = null;
    if (action === "menu") {
      this.page = "menu";
    } else if (action.indexOf("mission:") === 0) {
      var mid = action.split(":")[1];
      this.session = new Session(this.data, mid, this.storedResults, function (res) {
        self.storedResults = Object.assign({}, res);
        saveStoredResults(self.storage, self.storedResults);
      });
      this.page = "game";
    } else if (action.indexOf("M0") === 0) {
      this.activate("mission:" + action);
    } else if (action === "notebook") {
      this.page = "notebook";
      this.notebook.activity = null;
    } else if (action.indexOf("X0") === 0) {
      this.page = "notebook";
      this.notebook.start(action, this.observations);
    } else if (action === "basics") {
      this.page = "basics";
    } else if (action === "resume" && this.session !== null) {
      this.page = "game";
    } else if (this.page === "game" && this.session !== null) {
      this._gameAction(action);
    } else if (this.page === "notebook") {
      this._noteAction(action);
    }
  };

  SoccerSmarterWebApp.prototype._gameAction = function (action) {
    var s = this.session;
    if (action.indexOf("choice:") === 0) {
      var idx = parseInt(action.split(":")[1], 10);
      if (s.choose(idx)) {
        this.observations.unshift(s.episode.id + "/" + s.node.id + ": " + s.node.choices[idx].label);
        this.observations = this.observations.slice(0, 3);
      }
    } else if (action.indexOf("predict:") === 0) {
      var raw = action.split(":")[1];
      var pIdx = raw === "0" || raw === "Follow the pass" ? 0 : 1;
      s.predict(pIdx);
    } else if (action === "coach") {
      s.compareCoach();
    } else if (action === "retry") {
      s.retry();
    } else if (action === "next" || action === "continue") {
      s.advance();
    } else if (action === "skip") {
      s.skip();
    } else if (action === "pause") {
      s.togglePause();
    } else if (action === "step") {
      s.step();
    } else if (action === "restart") {
      s.restart();
    }
  };

  SoccerSmarterWebApp.prototype._noteAction = function (action) {
    if (action.indexOf("journal:") === 0) {
      this.notebook.start(action.split(":")[1], this.observations);
    } else if (action.indexOf("note:") === 0) {
      this.notebook.choose(parseInt(action.split(":")[1], 10));
    } else if (action === "note_skip") {
      this.notebook.skip();
    } else if (action === "note_back") {
      this.notebook.back();
    } else if (action === "growth_home") {
      this.notebook.activity = null;
    }
  };

  SoccerSmarterWebApp.prototype.handlePointerMove = function (pt) {
    this.hover = pt;
  };

  SoccerSmarterWebApp.prototype.handlePointerDown = function (pt, pointerType) {
    this.hover = pt;
    var btns = this.buttons();
    for (var i = 0; i < btns.length; i++) {
      var item = btns[i];
      if (collidePoint(item.rect, pt)) {
        if (pointerType === "touch" && this.page === "game" && this.session && this.session.phase === "decide" && item.action.indexOf("choice:") === 0) {
          var idx = parseInt(item.action.split(":")[1], 10);
          if (this.touchPreviewChoice !== idx) {
            this.touchPreviewChoice = idx;
            return;
          }
        }
        this.activate(item.action);
        return;
      }
    }
    this.touchPreviewChoice = null;
  };

  SoccerSmarterWebApp.prototype.handleKeyDown = function (key) {
    if (key === "Escape") {
      this.activate("menu");
      return;
    }
    if (key >= "1" && key <= "9") {
      var num = parseInt(key, 10) - 1;
      if (this.page === "menu" && num < this.menuItems.length) {
        this.activate(this.menuItems[num][1]);
      } else if (this.page === "notebook") {
        this.activate(this.notebook.activity === null && num < 3 ? "journal:X0" + (num + 1) : "note:" + num);
      } else if (this.page === "game" && this.session !== null) {
        this.activate(this.session.phase === "predict" ? "predict:" + num : "choice:" + num);
      }
      return;
    }
    if (this.page === "game" && this.session !== null) {
      var replay = this.session.phase === "summary" ? "restart" : "retry";
      var map = { " ": "skip", p: "pause", P: "pause", ".": "step", c: "coach", C: "coach", r: replay, R: replay, n: "next", N: "next" };
      if (key in map) {
        this.activate(map[key]);
      }
    } else if (this.page === "notebook") {
      if (key === "n" || key === "N") {
        this.activate("note_skip");
      } else if (key === "r" || key === "R") {
        this.activate("note_back");
      }
    }
  };

  SoccerSmarterWebApp.prototype.setMobileMode = function (flag) {
    this.mobileMode = Boolean(flag);
  };

  SoccerSmarterWebApp.prototype.mobileState = function () {
    var self = this;
    var btns = this.buttons().map(function (b) {
      return {
        label: b.label,
        action: b.action,
        number: b.number,
        previewed: self.page === "game" && self.session !== null && self.session.phase === "decide" && self.touchPreviewChoice !== null && b.action === "choice:" + self.touchPreviewChoice
      };
    });
    if (this.page === "basics") {
      return {
        badge: "BASICS REVIEW",
        title: "The basics are already here",
        subtitle: "Soccer Smart Lab",
        body: "Soccer Smart Lab covers receiving, passing, space, support and defending.\nTap 'Soccer Smart Basics' in the top bar to open it.",
        note: "",
        buttons: btns
      };
    }
    if (this.page === "notebook") {
      var book = this.notebook;
      if (book.activity === null) {
        return {
          badge: "GROWTH NOTEBOOK / UNSCORED",
          title: "My growth notebook",
          subtitle: "Optional reflection and pro study",
          body: "Optional. Unscored. Saved only while this app stays open.",
          note: "",
          buttons: btns
        };
      }
      var step = book.step;
      var entries = book.entries[book.activity];
      var notes = Object.keys(entries).map(function (k) {
        return k.charAt(0).toUpperCase() + k.slice(1) + ": " + entries[k];
      }).join("\n");
      return {
        badge: book.activity + " / GROWTH NOTEBOOK",
        title: step ? step.title : "Activity complete",
        subtitle: step ? step.prompt : "Your next step is yours to choose. No stars added or removed.",
        body: notes || "No entries yet. You may skip any step.",
        note: "",
        buttons: btns
      };
    }
    if (this.page !== "game" || this.session === null) {
      return {
        badge: "SOCCER SMARTER LAB",
        title: "Advanced practice",
        subtitle: "7 missions / A and B contrasts",
        body: "Notice a cue. Choose. Watch what changes. Adapt.",
        note: "Blue = teammates / Coral = opponents / Green ring = player you control.",
        buttons: btns
      };
    }
    var s = this.session;
    if (s.phase === "summary") {
      var sum = s.summary();
      return {
        badge: s.mission + " COMPLETE",
        title: "Round complete!",
        subtitle: "First tries: " + sum[0] + " / " + sum[1] + " fit or workable (Practice choices: " + sum[2] + ")",
        body: "Only decisions on your initial path enter the total. New retry branches are practice.",
        note: "",
        buttons: btns
      };
    }
    if (s.phase === "feedback") {
      var ch = s.feedback;
      var titles = ["Notice the risk", "A workable option", "Fits this picture"];
      var note = s.practiceOnly ? "Practice choice. First attempts stay saved." : "First attempt saved for this decision.";
      var dest = ch.next_node ? "Next: a new cue in this play." : "This branch ends here. Continue for the next contrast or summary.";
      return {
        badge: s.episode.id + " / " + s.node.title,
        title: titles[ch.rating],
        subtitle: s.episode.title + " (Role: " + s.node.role + ")",
        body: ch.feedback,
        note: note + "\n" + dest,
        buttons: btns
      };
    }
    if (s.phase === "predict") {
      return {
        badge: s.episode.id + " / PREDICTION",
        title: "Your unscored prediction",
        subtitle: s.episode.title,
        body: "After the pass, will the defender follow it or hold the central lane?",
        note: "Either prediction advances. Watch for evidence before your second decision.",
        buttons: btns
      };
    }
    var bodyText = s.node.cue;
    if (s.episode.prediction && s.node.id === "adapt") {
      var predLabel = ["Follow the pass", "Hold the central lane"][s.prediction || 0];
      bodyText = "You predicted: " + predLabel + "\nObserved: " + s.episode.reveal + "\n\n" + s.node.cue;
    }
    var hint = s.phase === "decide"
      ? (this.touchPreviewChoice !== null
        ? "Route previewed on pitch. Tap the same choice again to confirm."
        : "Tap a choice once to preview its route on the pitch, then tap again to confirm.")
      : (s.paused ? "Paused" : (s.phase === "coach" ? "Watch the coach" : "Watch what changes"));
    return {
      badge: s.episode.id + " / " + s.node.title,
      title: s.episode.title,
      subtitle: "Your role: " + s.node.role,
      body: bodyText,
      note: hint,
      buttons: btns
    };
  };

  SoccerSmarterWebApp.prototype.draw = function () {
    var p = new Painter(this.ctx);
    this.ctx.fillStyle = NAVY;
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    if (this.mobileMode && this.ctx.save) {
      this.ctx.save();
      this.ctx.translate(-28, -130);
    }
    if (!this.mobileMode) {
      p.text("SOCCER SMARTER LAB", { x: 30, y: 27, width: 870, height: 54 }, 48, INK);
      p.text("Notice a cue. Choose. Watch what changes. Adapt.", { x: 32, y: 87, width: 850, height: 34 }, 27, MUTED);
    }
    var role = this.page === "game" && this.session !== null ? this.session.node.role : "";
    drawPitch(p, role);
    if (!this.mobileMode) {
      p.panel(SIDE, PANEL, 18);
    }
    if (this.page === "game" && this.session !== null) {
      this._drawGame(p);
    } else if (this.page === "notebook") {
      if (!this.mobileMode) {
        this._drawNotebook(p);
      } else {
        p.text("NOTICE\nREFLECT\nTRY AGAIN", { x: 110, y: 330, width: 570, height: 290 }, 64, GREEN);
      }
    } else if (this.page === "basics") {
      if (!this.mobileMode) {
        this._drawBasics(p);
      }
    } else {
      if (!this.mobileMode) {
        p.text("Advanced practice", { x: 814, y: 150, width: 410, height: 42 }, 35, GREEN);
        p.text("7 missions / A and B contrasts\nOptional growth and pro study", { x: 814, y: 188, width: 410, height: 50 }, 22, INK);
      }
      p.text("LOOK\nCHOOSE\nADAPT", { x: 130, y: 330, width: 540, height: 300 }, 80, GREEN);
    }
    if (!this.mobileMode) {
      var btns = this.buttons();
      for (var i = 0; i < btns.length; i++) {
        var item = btns[i];
        var isTouchPreview = (
          this.page === "game" &&
          this.session !== null &&
          this.session.phase === "decide" &&
          this.touchPreviewChoice !== null &&
          item.action === "choice:" + this.touchPreviewChoice
        );
        p.button(item, collidePoint(item.rect, this.hover), isTouchPreview);
      }
      p.text(
        "Blue: teammates / Coral: opponents / Gold: keeper\nGreen ring: the player you control",
        { x: 32, y: 827, width: 740, height: 50 },
        22,
        MUTED
      );
      p.text("Untimed choices. Practice is welcome.", { x: 814, y: 837, width: 430, height: 30 }, 22, MUTED);
    }
    if (this.mobileMode && this.ctx.restore) {
      this.ctx.restore();
    }
    this.layoutErrors = p.errors;
  };

  SoccerSmarterWebApp.prototype._drawGame = function (p) {
    var s = this.session;
    var hovered = null;
    var btns = this.buttons();
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].action.indexOf("choice:") === 0 && collidePoint(btns[i].rect, this.hover)) {
        hovered = parseInt(btns[i].action.split(":")[1], 10);
        break;
      }
    }
    if (hovered === null && this.touchPreviewChoice !== null) {
      hovered = this.touchPreviewChoice;
    }
    drawWorld(p, s, hovered);
    if (this.mobileMode) {
      return;
    }
    p.text(s.episode.title, { x: 814, y: 162, width: 410, height: 50 }, 36, GREEN);
    p.text(s.episode.id + " / " + s.node.title, { x: 814, y: 220, width: 410, height: 62 }, 24, INK);
    if (s.phase === "summary") {
      var sum = s.summary();
      p.text(
        "Round complete!\nFirst tries: " + sum[0] + " / " + sum[1] + " fit or workable\nPractice choices: " + sum[2],
        { x: 814, y: 306, width: 410, height: 146 },
        28,
        GOLD
      );
      p.text(
        "Only decisions on your initial path enter the total. New retry branches are practice.",
        { x: 814, y: 458, width: 410, height: 94 },
        23,
        MUTED
      );
    } else if (s.phase === "feedback") {
      this._drawFeedback(p);
    } else if (s.phase === "predict") {
      p.text("Your unscored prediction", { x: 814, y: 294, width: 410, height: 42 }, 29, GOLD);
      p.text("After the pass, will the defender follow it or hold the central lane?", { x: 814, y: 346, width: 410, height: 94 }, 25, INK);
      p.text("Either prediction advances. Watch for evidence before your second decision.", { x: 814, y: 636, width: 410, height: 110 }, 23, MUTED);
    } else {
      p.text(s.node.cue, { x: 814, y: 294, width: 410, height: 118 }, 24, INK);
      if (ANIMATED.indexOf(s.phase) !== -1) {
        var status = s.paused ? "Paused" : (s.phase === "coach" ? "Watch the coach" : "Watch what changes");
        p.text(status, { x: 814, y: 446, width: 410, height: 50 }, 31, GOLD);
        this.ctx.fillStyle = GREEN;
        this.ctx.fillRect(814, 522, Math.round(410 * s.fraction), 10);
      }
      if (s.phase === "decide") {
        p.text("Hover or tap once for the intended route. Choose 1, 2, 3 or tap again.", { x: 814, y: 672, width: 410, height: 82 }, 23, GOLD);
      }
    }
    if (s.episode.prediction && s.node.id === "adapt") {
      var predLabel = ["Follow the pass", "Hold the central lane"][s.prediction || 0];
      p.text("You predicted: " + predLabel + "\nObserved: " + s.episode.reveal, { x: 68, y: 242, width: 640, height: 84 }, 23, GOLD);
    }
  };

  SoccerSmarterWebApp.prototype._drawFeedback = function (p) {
    var s = this.session;
    var choice = s.feedback;
    var titles = ["Notice the risk", "A workable option", "Fits this picture"];
    var colors = [CORAL, GOLD, GREEN];
    p.text(titles[choice.rating], { x: 814, y: 296, width: 410, height: 48 }, 31, colors[choice.rating]);
    p.text(choice.feedback, { x: 814, y: 352, width: 410, height: 110 }, 25, INK);
    var note = s.practiceOnly ? "Practice choice. First attempts stay saved." : "First attempt saved for this decision.";
    p.text(note, { x: 814, y: 470, width: 410, height: 66 }, 22, GOLD);
    var dest = choice.next_node ? "Next: a new cue in this play." : "This branch ends here. Continue for the next contrast or summary.";
    p.text(dest, { x: 814, y: 522, width: 410, height: 40 }, 20, MUTED);
  };

  SoccerSmarterWebApp.prototype._drawNotebook = function (p) {
    var book = this.notebook;
    p.text("My growth notebook", { x: 814, y: 162, width: 410, height: 52 }, 35, GREEN);
    if (book.activity === null) {
      p.text("Optional. Unscored. Saved only while this app stays open.", { x: 814, y: 228, width: 410, height: 100 }, 25, INK);
      p.text("NOTICE\nREFLECT\nTRY AGAIN", { x: 110, y: 330, width: 570, height: 290 }, 64, GREEN);
      return;
    }
    var step = book.step;
    if (step !== null) {
      p.text(step.title, { x: 814, y: 228, width: 410, height: 54 }, 27, GOLD);
      p.text(step.prompt, { x: 814, y: 286, width: 410, height: 62 }, 22, INK);
    } else {
      p.text("Your next step is yours to choose.\nNo stars added or removed.", { x: 814, y: 242, width: 410, height: 132 }, 28, GOLD);
    }
    p.text(book.activity + " / My current notes", { x: 78, y: 236, width: 630, height: 48 }, 30, GREEN);
    var entries = book.entries[book.activity];
    var keys = Object.keys(entries);
    var notes = keys.map(function (k) {
      return k.charAt(0).toUpperCase() + k.slice(1) + ": " + entries[k];
    }).join("\n\n");
    p.text(notes || "No entries yet. You may skip any step.", { x: 78, y: 304, width: 630, height: 390 }, 25, INK);
  };

  SoccerSmarterWebApp.prototype._drawBasics = function (p) {
    p.text("The basics are already here", { x: 814, y: 166, width: 410, height: 100 }, 34, GREEN);
    p.text(
      "Soccer Smart Lab covers receiving, passing, space, support and defending.\n\nClick 'Soccer Smart Basics' in the top bar or run:\n\npython3 -m\nsoccer_strategy.soccer_smart",
      { x: 814, y: 296, width: 410, height: 390 },
      25,
      INK
    );
  };

  function canvasPoint(canvas, clientX, clientY, mobileMode) {
    var rect = canvas.getBoundingClientRect();
    var logW = mobileMode ? 740 : WIDTH;
    var logH = mobileMode ? 660 : HEIGHT;
    return [
      ((clientX - rect.left) / rect.width) * logW + (mobileMode ? 28 : 0),
      ((clientY - rect.top) / rect.height) * logH + (mobileMode ? 130 : 0)
    ];
  }

  function bootBrowser() {
    if (typeof document === "undefined" || typeof window === "undefined" || !window.SOCCER_SMARTER_DATA) {
      return;
    }
    var canvas = document.getElementById("game-canvas");
    if (!canvas) {
      return;
    }
    var app = new SoccerSmarterWebApp(window.SOCCER_SMARTER_DATA, canvas, window.localStorage);
    var mobileBadge = document.getElementById("mobile-badge");
    var mobileTitle = document.getElementById("mobile-title");
    var mobileSubtitle = document.getElementById("mobile-subtitle");
    var mobileBody = document.getElementById("mobile-body");
    var mobileNote = document.getElementById("mobile-note");
    var mobileButtons = document.getElementById("mobile-buttons");
    var mobileMenuBtn = document.getElementById("mobile-menu-btn");
    var lastMobileKey = "";

    function syncViewport() {
      var isMobile = window.innerWidth <= 900 || window.innerHeight > window.innerWidth;
      var dpr = Math.min(window.devicePixelRatio || 1, 3);
      var logW = isMobile ? 740 : WIDTH;
      var logH = isMobile ? 660 : HEIGHT;
      app.setMobileMode(isMobile);
      if (canvas.width !== Math.round(logW * dpr) || canvas.height !== Math.round(logH * dpr)) {
        canvas.width = Math.round(logW * dpr);
        canvas.height = Math.round(logH * dpr);
      }
      if (app.ctx.setTransform) {
        app.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }

    function syncMobileDom() {
      if (!app.mobileMode || !mobileButtons) {
        return;
      }
      var st = app.mobileState();
      var key = JSON.stringify(st);
      if (key === lastMobileKey) {
        return;
      }
      lastMobileKey = key;
      mobileBadge.textContent = st.badge || "";
      mobileTitle.textContent = st.title || "";
      mobileSubtitle.textContent = st.subtitle || "";
      mobileBody.textContent = st.body || "";
      mobileNote.textContent = st.note || "";
      mobileButtons.innerHTML = "";
      st.buttons.forEach(function (b) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mobile-btn" + (b.previewed ? " previewed" : "");
        if (b.number) {
          var num = document.createElement("span");
          num.className = "mobile-btn-num";
          num.textContent = b.number;
          btn.appendChild(num);
        }
        var txt = document.createElement("span");
        txt.className = "mobile-btn-text";
        txt.textContent = b.label;
        btn.appendChild(txt);
        if (b.previewed) {
          var pill = document.createElement("span");
          pill.className = "mobile-btn-pill";
          pill.textContent = "Tap to confirm";
          btn.appendChild(pill);
        }
        btn.addEventListener("click", function () {
          if (app.page === "game" && app.session !== null && app.session.phase === "decide" && b.action.indexOf("choice:") === 0) {
            var idx = parseInt(b.action.split(":")[1], 10);
            if (app.touchPreviewChoice !== idx) {
              app.touchPreviewChoice = idx;
              return;
            }
          }
          app.activate(b.action);
        });
        mobileButtons.appendChild(btn);
      });
    }

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("click", function () {
        app.activate("menu");
      });
    }
    window.addEventListener("resize", syncViewport);
    syncViewport();

    canvas.addEventListener("pointermove", function (ev) {
      if (ev.pointerType !== "touch") {
        app.handlePointerMove(canvasPoint(canvas, ev.clientX, ev.clientY, app.mobileMode));
      }
    });
    canvas.addEventListener("pointerdown", function (ev) {
      if (!app.mobileMode) {
        ev.preventDefault();
        app.handlePointerDown(canvasPoint(canvas, ev.clientX, ev.clientY, false), ev.pointerType || "mouse");
      }
    });
    window.addEventListener("keydown", function (ev) {
      if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(ev.key) !== -1) {
        ev.preventDefault();
      }
      app.handleKeyDown(ev.key);
    });
    var last = performance.now();
    function frame(now) {
      var dt = Math.min(0.1, Math.max(0.0, (now - last) / 1000.0));
      last = now;
      if (app.page === "game" && app.session !== null) {
        app.session.tick(dt);
      }
      app.draw();
      syncMobileDom();
      window.requestAnimationFrame(frame);
    }
    app.draw();
    syncMobileDom();
    window.requestAnimationFrame(frame);
  }

  bootBrowser();

  return {
    sampleTrack: sampleTrack,
    frameMotion: frameMotion,
    routeMotion: routeMotion,
    previewChoice: previewChoice,
    Session: Session,
    Notebook: Notebook,
    SoccerSmarterWebApp: SoccerSmarterWebApp
  };
});
