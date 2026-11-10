(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.SoccerSmartWeb = factory();
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
  var CONTACT_FRACTION = 0.25;
  var RELEASE_KINDS = ["pass", "shoot", "clear"];
  var TRANSFER_SCALES = [0.92, 0.96, 1.04];
  var STORAGE_KEY = "soccer_smart_progress_v1";

  function makeRng(seed) {
    var state = (seed >>> 0) + 0x6d2b79f5;
    return {
      next: function () {
        state = (state + 0x6d2b79f5) >>> 0;
        var t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      },
      choice: function (items) {
        return items[Math.floor(this.next() * items.length)];
      },
      shuffle: function (items) {
        for (var i = items.length - 1; i > 0; i--) {
          var j = Math.floor(this.next() * (i + 1));
          var tmp = items[i];
          items[i] = items[j];
          items[j] = tmp;
        }
        return items;
      },
      sample: function (items, count) {
        var copy = items.slice();
        this.shuffle(copy);
        return copy.slice(0, count);
      }
    };
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function lerp(start, end, fraction) {
    var t = Math.max(0.0, Math.min(1.0, fraction));
    return [
      start[0] + (end[0] - start[0]) * t,
      start[1] + (end[1] - start[1]) * t
    ];
  }

  function outgoingFraction(fraction, contact) {
    var c = contact === undefined ? CONTACT_FRACTION : contact;
    return Math.max(0.0, Math.min(1.0, (fraction - c) / (1.0 - c)));
  }

  function routeDestination(choice) {
    if (choice.aim !== null && choice.aim !== undefined) {
      return choice.aim;
    }
    return RELEASE_KINDS.indexOf(choice.action_kind) !== -1 ? choice.ball_end : choice.target;
  }

  function coachChoice(scene, selected) {
    if (scene.stage === 8 && selected !== null && selected !== undefined && scene.choices[selected].rating === 2) {
      return scene.choices[selected];
    }
    for (var i = 0; i < scene.choices.length; i++) {
      if (scene.choices[i].rating === 2) {
        return scene.choices[i];
      }
    }
    throw new Error("Coach comparison requires a strong option");
  }

  function activeChoice(scene, phase, selected) {
    if (phase === "coach") {
      return coachChoice(scene,selected);
    }
    if ((phase === "outcome" || phase === "feedback") && selected !== null && selected !== undefined) {
      return scene.choices[selected];
    }
    return null;
  }

  function findYou(scene) {
    for (var i = 0; i < scene.actors.length; i++) {
      if (scene.actors[i].key === "you") {
        return scene.actors[i];
      }
    }
    return scene.actors[0];
  }

  function positions(scene, phase, fraction, selected) {
    var actors = {};
    var i;
    if (phase === "observe") {
      for (i = 0; i < scene.actors.length; i++) {
        var a = scene.actors[i];
        actors[a.key] = lerp(a.approach, a.position, fraction);
      }
      return { actors: actors, ball: lerp(scene.ball_from, scene.ball, fraction) };
    }
    for (i = 0; i < scene.actors.length; i++) {
      actors[scene.actors[i].key] = scene.actors[i].position.slice();
    }
    var choice = activeChoice(scene, phase, selected);
    if (!choice) {
      return { actors: actors, ball: scene.ball.slice() };
    }
    var t = phase === "feedback" ? 1.0 : fraction;
    var isRelease = RELEASE_KINDS.indexOf(choice.action_kind) !== -1;
    var youT = isRelease ? outgoingFraction(t) : t;
    var you = findYou(scene);
    actors.you = lerp(you.position, choice.target, youT);
    for (i = 0; i < choice.actor_targets.length; i++) {
      var track = choice.actor_targets[i];
      actors[track[0]] = lerp(actors[track[0]], track[1], t);
    }
    var ballT = isRelease ? outgoingFraction(t) : t;
    if (choice.ball_via !== null && choice.ball_via !== undefined) {
      var viaBall = ballT <= 0.5
        ? lerp(scene.ball, choice.ball_via, ballT * 2.0)
        : lerp(choice.ball_via, choice.ball_end, (ballT - 0.5) * 2.0);
      return { actors: actors, ball: viaBall };
    }
    return { actors: actors, ball: lerp(scene.ball, choice.ball_end, ballT) };
  }

  function cardPositions(card, fraction) {
    var actors = {};
    for (var i = 0; i < card.actors.length; i++) {
      var a = card.actors[i];
      actors[a.key] = lerp(a.approach, a.run_to, fraction);
    }
    if (card.waypoints && card.waypoints.length > 0) {
      var points = [card.ball_start].concat(card.waypoints, [card.ball_end]);
      var step = Math.max(0.0, Math.min(1.0, fraction)) * (points.length - 1);
      var idx = Math.min(Math.floor(step), points.length - 2);
      return { actors: actors, ball: lerp(points[idx], points[idx + 1], step - idx) };
    }
    if (card.ball_control !== null && card.ball_control !== undefined) {
      return {
        actors: actors,
        ball: lerp(
          lerp(card.ball_start, card.ball_control, fraction),
          lerp(card.ball_control, card.ball_end, fraction),
          fraction
        )
      };
    }
    return { actors: actors, ball: lerp(card.ball_start, card.ball_end, fraction) };
  }

  function ballHeight(scene, phase, fraction, selected) {
    var choice = activeChoice(scene, phase, selected);
    if (!choice || (phase !== "outcome" && phase !== "coach")) {
      return 0.0;
    }
    var peak = choice.loft || 0.0;
    if (!peak && choice.action_kind === "clear") {
      peak = 32.0;
    }
    var flight = choice.action_kind === "receive" ? fraction : outgoingFraction(fraction);
    return peak * Math.sin(Math.PI * flight);
  }

  function cardHeight(card, fraction) {
    var t = Math.max(0.0, Math.min(1.0, fraction));
    var loft = card.loft || 0.0;
    if (card.demo === "arc") {
      return loft * Math.sin(Math.PI * t);
    }
    if (card.demo === "drop") {
      return loft * (1.0 - t);
    }
    if (card.demo === "bounce") {
      return loft * Math.abs(Math.sin(3.0 * Math.PI * t));
    }
    if (card.demo === "volley") {
      return t <= 0.5 ? loft * (1.0 - t * 0.5) : loft * 1.5 * (1.0 - t);
    }
    return 0.0;
  }

  function baseId(scene) {
    return scene.id.split(":")[0];
  }

  function transferScene(scene, scale) {
    var anchorY = scene.shot_window ? 0.0 : 50.0;
    function shift(pt) {
      return [50.0 + (pt[0] - 50.0) * scale, anchorY + (pt[1] - anchorY) * scale];
    }
    var copy = clone(scene);
    copy.id = baseId(scene) + ":transfer:" + scale;
    copy.transfer = true;
    copy.ball = shift(scene.ball);
    copy.ball_from = shift(scene.ball_from);
    copy.shot_window = scene.shot_window ? shift(scene.shot_window) : null;
    copy.actors = scene.actors.map(function (a) {
      var ac = clone(a);
      ac.position = shift(a.position);
      ac.approach = shift(a.approach);
      ac.run_to = shift(a.run_to);
      return ac;
    });
    copy.choices = scene.choices.map(function (c) {
      var cc = clone(c);
      cc.target = shift(c.target);
      cc.ball_end = shift(c.ball_end);
      return cc;
    });
    return copy;
  }

  function shuffleChoices(scenes, rng) {
    return scenes.map(function (scene) {
      var copy = clone(scene);
      rng.shuffle(copy.choices);
      return copy;
    });
  }

  function makePlaylist(data, stage, seed) {
    var rng = makeRng(seed);
    var catalog = data.starter_scenes;
    var practice = [];
    var heldOut = [];
    if (stage === 5) {
      var chosenTopics = data.sections.map(function (sec) {
        return rng.choice(sec.topics);
      });
      var remaining = [];
      data.sections.forEach(function (sec) {
        sec.topics.forEach(function (t) {
          if (chosenTopics.indexOf(t) === -1) {
            remaining.push(t);
          }
        });
      });
      chosenTopics = chosenTopics.concat(rng.sample(remaining, 2));
      rng.shuffle(chosenTopics);
      chosenTopics.forEach(function (topic) {
        var variants = catalog.filter(function (s) { return s.topic === topic; });
        rng.shuffle(variants);
        practice.push(variants[0]);
        heldOut.push(variants[1]);
      });
    } else {
      var pool = catalog.filter(function (s) { return s.stage === stage; });
      var topicSet = [];
      pool.forEach(function (s) {
        if (topicSet.indexOf(s.topic) === -1) {
          topicSet.push(s.topic);
        }
      });
      topicSet.sort(function (a, b) { return a - b; });
      rng.shuffle(topicSet);
      topicSet.forEach(function (topic) {
        var variants = pool.filter(function (s) { return s.topic === topic; });
        rng.shuffle(variants);
        practice.push(variants[0], variants[1]);
        heldOut.push(variants[2]);
      });
      rng.shuffle(practice);
    }
    var transfer = rng.sample(heldOut, 2).map(function (s) {
      return transferScene(s, rng.choice(TRANSFER_SCALES));
    });
    return shuffleChoices(practice.concat(transfer), rng);
  }

  function Session(data, stage, seed, customScenes) {
    var rng = makeRng(seed);
    this.scenes = customScenes ? shuffleChoices(customScenes, rng) : makePlaylist(data, stage, seed);
    this.stage = stage;
    this.index = 0;
    this.phase = "observe";
    this.elapsed = 0.0;
    this.selected = null;
    this.results = {};
  }

  Object.defineProperty(Session.prototype, "scene", {
    get: function () {
      return this.scenes[this.index];
    }
  });

  Object.defineProperty(Session.prototype, "feedback", {
    get: function () {
      if (this.selected === null || this.selected === undefined) {
        return null;
      }
      return this.scene.choices[this.selected];
    }
  });

  Object.defineProperty(Session.prototype, "fraction", {
    get: function () {
      return Math.min(1.0, this.elapsed / ANIMATION_SECONDS);
    }
  });

  Session.prototype.tick = function (seconds) {
    if (!isFinite(seconds) || seconds < 0.0) {
      throw new Error("Elapsed time must be finite and nonnegative");
    }
    if (this.phase !== "observe" && this.phase !== "outcome" && this.phase !== "coach") {
      return;
    }
    this.elapsed += seconds;
    if (this.elapsed >= ANIMATION_SECONDS) {
      this.phase = this.phase === "observe" ? "decide" : "feedback";
      this.elapsed = 0.0;
    }
  };

  Session.prototype.choose = function (index) {
    if (this.phase !== "decide" || index < 0 || index >= 3) {
      return false;
    }
    this.selected = index;
    if (!this.practiceOnly && !(this.scene.id in this.results)) {
      this.results[this.scene.id] = this.scene.choices[index].rating;
    }
    this.phase = "outcome";
    this.elapsed = 0.0;
    return true;
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
    this.phase = "observe";
    this.elapsed = 0.0;
    this.selected = null;
    return true;
  };

  Session.prototype.advance = function () {
    if (this.phase !== "feedback") {
      return false;
    }
    this.selected = null;
    if (this.index === this.scenes.length - 1) {
      this.phase = "summary";
    } else {
      this.index += 1;
      this.phase = "observe";
      this.elapsed = 0.0;
    }
    return true;
  };

  Session.prototype.summary = function () {
    var self = this;
    var practice = this.scenes.filter(function (s) { return !s.transfer && (s.id in self.results); });
    var transfer = this.scenes.filter(function (s) { return s.transfer && (s.id in self.results); });
    var pGood = practice.filter(function (s) { return self.results[s.id] > 0; }).length;
    var tGood = transfer.filter(function (s) { return self.results[s.id] > 0; }).length;
    return [pGood, practice.length, tGood, transfer.length];
  };

  function playExit(node, key) {
    var edge = node.exits.find(function (pair) { return pair[0] === key; });
    if (!edge) { throw new Error("Missing play exit"); }
    return edge[1];
  }

  function ContinuousSession(data, family, seed) {
    if (!Number.isInteger(family) || family < 0 || family > 8) {
      throw new Error("Choose a play family from zero through eight");
    }
    var rng = makeRng(seed), catalog = data.plays;
    if (family) {
      this.plays = catalog.filter(function (p) { return p.family === family; });
      rng.shuffle(this.plays);
    } else {
      this.plays = rng.sample([1,2,3,4,5,6,7,8],4).map(function (f) {
        return rng.choice(catalog.filter(function (p) { return p.family === f; }));
      });
    }
    this.plays = this.plays.map(function (p) {
      var copy = clone(p);
      copy.nodes.forEach(function (n) { rng.shuffle(n.scene.choices); });
      return copy;
    });
    this.scenes = this.plays.reduce(function (all,p) {
      return all.concat(p.nodes.map(function (n) { return n.scene; }));
    },[]);
    this.stage = 8;
    this.index = 0;
    this.depth = 1;
    this.results = {};
    this.practiceOnly = false;
    this.nodeId = this.play.nodes[0].scene.id;
    this._observe();
  }
  ContinuousSession.prototype = Object.create(Session.prototype);
  ContinuousSession.prototype.constructor = ContinuousSession;
  Object.defineProperty(ContinuousSession.prototype,"play", {
    get: function () { return this.plays[this.index]; }
  });
  Object.defineProperty(ContinuousSession.prototype,"currentNode", {
    get: function () {
      var key = this.nodeId;
      return this.play.nodes.find(function (n) { return n.scene.id === key; });
    }
  });
  Object.defineProperty(ContinuousSession.prototype,"scene", {
    get: function () { return this.currentNode.scene; }
  });
  Object.defineProperty(ContinuousSession.prototype,"nextLabel", {
    get: function () {
      if (this.feedback && playExit(this.currentNode,this.feedback.key) !== null) {
        return "Continue this play / N";
      }
      return this.index+1 < this.plays.length ? "Next play / N" : "See round summary / N";
    }
  });
  ContinuousSession.prototype._observe = function () {
    this.phase = "observe";
    this.elapsed = 0;
    this.selected = null;
  };
  ContinuousSession.prototype.retry = function () {
    if (!Session.prototype.retry.call(this)) { return false; }
    this.practiceOnly = true;
    return true;
  };
  ContinuousSession.prototype.advance = function () {
    if (this.phase !== "feedback") { return false; }
    var target = playExit(this.currentNode,this.feedback.key);
    if (target !== null) {
      this.nodeId = target;
      this.depth += 1;
    } else if (this.index+1 < this.plays.length) {
      this.index += 1;
      this.nodeId = this.play.nodes[0].scene.id;
      this.depth = 1;
      this.practiceOnly = false;
    } else {
      this.phase = "summary";
      this.selected = null;
      return true;
    }
    this._observe();
    return true;
  };
  ContinuousSession.prototype.summary = function () {
    var ratings = Object.values(this.results);
    return [ratings.filter(function (r) { return r > 0; }).length,ratings.length,0,0];
  };

  function PlayBrowser(data) {
    this.page = 0;
    this.families = data.play_families;
  }
  Object.defineProperty(PlayBrowser.prototype,"visible", {
    get: function () { return [0,1,2,3,4,5,6,7,8].slice(this.page*6,(this.page+1)*6); }
  });
  PlayBrowser.prototype.changePage = function (delta) {
    this.page = Math.max(0,Math.min(1,this.page+delta));
  };
  PlayBrowser.prototype.numberAction = function (number) {
    return number >= 0 && number < this.visible.length ? "play_family:"+this.visible[number] : null;
  };
  PlayBrowser.prototype.buttons = function () {
    var titles = ["Mixed round / four different tasks"].concat(this.families);
    return this.visible.map(function (f,i) {
      return makeButton(814,314+i*62,410,54,titles[f],"play_family:"+f,String(i+1));
    }).concat([
      makeButton(814,700,195,48,"Previous / Left","play_prev",""),
      makeButton(1024,700,200,48,"Next / Right","play_next",""),
      makeButton(814,758,410,48,"Main menu / Esc","menu","")
    ]);
  };
  PlayBrowser.prototype.draw = function (p) {
    p.text("Continuous Play",{x:814,y:162,width:410,height:50},37,GREEN);
    p.text("8 tasks / 24 openings / page "+(this.page+1)+" of 2\nEach play has 2-3 linked decisions.",
      {x:814,y:224,width:410,height:90},24,MUTED);
    p.text("PLAY\nLOOK AGAIN\nADAPT",{x:100,y:320,width:630,height:280},64,GREEN);
    p.text("Pass, support, recover: your choice changes what comes next.\nRetry is practice; first-run scores stay saved.",
      {x:78,y:660,width:630,height:90},23,GOLD);
  };

  function BookBrowser(data) {
    var self = this;
    this.entries = data.lessons.slice();
    this.categories = data.categories;
    this.scenes = {};
    data.starter_scenes.concat(data.book_scenes).forEach(function (s) {
      self.scenes[s.id] = s;
    });
    this.cards = {};
    data.starter_cards.concat(data.book_cards).forEach(function (c) {
      self.cards[c.id] = c;
    });
    this.category = null;
    this.page = 0;
    this.selected = null;
  }

  Object.defineProperty(BookBrowser.prototype, "items", {
    get: function () {
      var cat = this.category;
      return this.entries.filter(function (e) { return e.category === cat; });
    }
  });

  Object.defineProperty(BookBrowser.prototype, "visible", {
    get: function () {
      return this.items.slice(this.page * 6, (this.page + 1) * 6);
    }
  });

  BookBrowser.prototype.chooseCategory = function (category) {
    var valid = this.categories.some(function (pair) { return pair[0] === category; });
    if (!valid) {
      throw new Error("Unknown book category");
    }
    this.category = category;
    this.page = 0;
  };

  BookBrowser.prototype.select = function (page) {
    for (var i = 0; i < this.entries.length; i++) {
      if (this.entries[i].page === page) {
        this.selected = this.entries[i];
        return this.selected;
      }
    }
    throw new Error("Unknown lesson page: " + page);
  };

  BookBrowser.prototype.changePage = function (delta) {
    var last = Math.max(0, Math.floor((this.items.length - 1) / 6));
    this.page = Math.max(0, Math.min(last, this.page + delta));
  };

  BookBrowser.prototype.numberAction = function (number) {
    var actions;
    if (this.category === null) {
      actions = this.categories.map(function (pair) { return "book_category:" + pair[0]; });
    } else {
      actions = this.visible.map(function (e) { return "book_entry:" + e.page; });
    }
    return number >= 0 && number < actions.length ? actions[number] : null;
  };

  BookBrowser.prototype.buttons = function () {
    var self = this;
    if (this.category === null) {
      return this.categories.map(function (pair, i) {
        var key = pair[0];
        var title = pair[1];
        var count = self.entries.filter(function (e) { return e.category === key; }).length;
        return makeButton(814, 330 + i * 78, 410, 64, title + " / " + count + " topics", "book_category:" + key, String(i + 1));
      });
    }
    var rows = this.visible.map(function (e, i) {
      return makeButton(814, 314 + i * 62, 410, 54, "p." + e.page + " / " + e.title, "book_entry:" + e.page, String(i + 1));
    });
    return rows.concat([
      makeButton(814, 700, 195, 48, "Previous / Left", "book_prev", ""),
      makeButton(1024, 700, 200, 48, "Next / Right", "book_next", ""),
      makeButton(814, 758, 410, 48, "Topic categories", "book_categories", "")
    ]);
  };

  BookBrowser.prototype.draw = function (painter) {
    painter.text("Book companion", { x: 814, y: 162, width: 410, height: 50 }, 37, GREEN);
    var message;
    if (this.category === null) {
      message = "Original practice for the indexed topics.\nChapter text has not been checked.";
    } else {
      var pages = Math.max(1, Math.floor((this.items.length + 5) / 6));
      var catTitle = this.category;
      this.categories.forEach(function (pair) {
        if (pair[0] === catTitle) {
          catTitle = pair[1];
        }
      });
      message = catTitle + " / page " + (this.page + 1) + " of " + pages + "\nChoose 1-6 or click a topic.";
    }
    painter.text(message, { x: 814, y: 224, width: 410, height: 90 }, 24, MUTED);
    painter.text("EXPLORE\nTRY\nCOMPARE", { x: 120, y: 320, width: 560, height: 280 }, 70, GREEN);
    painter.text(
      "Physical activities and observation cards are unscored.\nHeading practice is deferred in your profile.",
      { x: 78, y: 660, width: 630, height: 90 },
      23,
      GOLD
    );
  };

  function makeButton(x, y, width, height, label, action, number) {
    return {
      rect: { x: x, y: y, width: width, height: height },
      label: label,
      action: action,
      number: number || ""
    };
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
    var measured = this.ctx.measureText(text).width;
    return measured;
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

  function drawPolygon(ctx, pts, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i][0], pts[i][1]);
    }
    ctx.closePath();
    ctx.fill();
  }

  function arrowHead(ctx, end, ux, uy, head, color) {
    var px = -uy;
    var py = ux;
    var base = [end[0] - ux * head, end[1] - uy * head];
    var outer = [
      end,
      [base[0] + px * 10, base[1] + py * 10],
      [base[0] - px * 10, base[1] - py * 10]
    ];
    var innerTip = [end[0] - ux * 2, end[1] - uy * 2];
    var innerBase = [base[0] + ux * 2, base[1] + uy * 2];
    var inner = [
      innerTip,
      [innerBase[0] + px * 6, innerBase[1] + py * 6],
      [innerBase[0] - px * 6, innerBase[1] - py * 6]
    ];
    drawPolygon(ctx, outer, NAVY);
    drawPolygon(ctx, inner, color);
    drawCircle(ctx, end, 12, NAVY, 3);
    drawCircle(ctx, end, 8, color, 3);
  }

  function arrow(ctx, start, end, color) {
    var dx = end[0] - start[0];
    var dy = end[1] - start[1];
    var length = Math.hypot(dx, dy);
    if (length < 38) {
      drawCircle(ctx, end, 12, NAVY, 4);
      drawCircle(ctx, end, 8, color, 3);
      return;
    }
    var ux = dx / length;
    var uy = dy / length;
    var shaftStart = [start[0] + ux * 25, start[1] + uy * 25];
    var head = Math.min(20.0, length * 0.45);
    var shaftEnd = [end[0] - ux * head * 0.72, end[1] - uy * head * 0.72];
    drawLine(ctx, shaftStart, shaftEnd, NAVY, 9);
    drawLine(ctx, shaftStart, shaftEnd, color, 5);
    arrowHead(ctx, end, ux, uy, head, color);
  }

  function dashedArrow(ctx, start, end, color) {
    var dx = end[0] - start[0];
    var dy = end[1] - start[1];
    var length = Math.hypot(dx, dy);
    if (length < 38) {
      drawCircle(ctx, end, 12, NAVY, 4);
      drawCircle(ctx, end, 8, color, 3);
      return;
    }
    var ux = dx / length;
    var uy = dy / length;
    var head = Math.min(20.0, length * 0.45);
    var stop = Math.max(25, Math.floor(length - head * 0.75));
    for (var offset = 25; offset < stop; offset += 20) {
      var tail = [start[0] + ux * offset, start[1] + uy * offset];
      var tipOffset = Math.min(offset + 12, stop);
      var tip = [start[0] + ux * tipOffset, start[1] + uy * tipOffset];
      drawLine(ctx, tail, tip, NAVY, 9);
      drawLine(ctx, tail, tip, color, 5);
    }
    arrowHead(ctx, end, ux, uy, head, color);
  }

  function drawWindowMarker(ctx, point) {
    drawCircle(ctx, point, 24, NAVY, 7);
    drawCircle(ctx, point, 21, BLUE, 3);
  }

  function drawPitch(painter, role) {
    var ctx = painter.ctx;
    painter.panel({ x: 28, y: 140, width: 742, height: 676 }, "rgb(24, 61, 52)", 18);
    for (var i = 0; i < 10; i++) {
      ctx.fillStyle = i % 2 ? "rgb(43, 116, 82)" : "rgb(48, 128, 90)";
      ctx.fillRect(PITCH.x, PITCH.y + i * 59, PITCH.width, 59);
    }
    var white = "rgb(190, 222, 191)";
    ctx.strokeStyle = white;
    ctx.lineWidth = 2;
    ctx.strokeRect(PITCH.x, PITCH.y, PITCH.width, PITCH.height);
    var midY = pitchPoint([50.0, 50.0])[1];
    drawLine(ctx, [PITCH.x, midY], [PITCH.x + PITCH.width, midY], white, 2);
    drawCircle(ctx, pitchPoint([50.0, 50.0]), 52, white, 2);
    [0.0, 82.0].forEach(function (topY) {
      var tl = pitchPoint([22.0, topY]);
      ctx.strokeStyle = white;
      ctx.lineWidth = 2;
      ctx.strokeRect(tl[0], tl[1], Math.round(PITCH.width * 0.56), Math.round(PITCH.height * 0.18));
    });
    var centerX = PITCH.x + PITCH.width / 2;
    ctx.strokeStyle = "rgb(210, 228, 224)";
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - 65, PITCH.y - 18, 130, 18);
    ctx.strokeRect(centerX - 65, PITCH.y + PITCH.height, 130, 18);
    var roleText = role ? "ROLE: " + role.toUpperCase() : "FULL PITCH  /  ATTACK UP";
    painter.text(roleText, { x: 52, y: 146, width: 310, height: 24 }, 21, GOLD);
    painter.text("ATTACK GOAL", { x: centerX + 76, y: 146, width: 170, height: 24 }, 21, GREEN);
    painter.text("OUR GOAL", { x: centerX - 45, y: 792, width: 150, height: 22 }, 21, GREEN);
  }

  function drawPlayer(painter, point, label, team, heading) {
    var ctx = painter.ctx;
    var pt = pitchPoint(point);
    var x = pt[0];
    var y = pt[1];
    var color = team === "home" ? BLUE : (team === "away" ? CORAL : GOLD);
    var hd = heading || [0.0, -1.0];
    ctx.fillStyle = "rgb(30, 75, 55)";
    ctx.beginPath();
    ctx.ellipse(x + 1, y + 15, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    drawCircle(ctx, [x, y], 18, NAVY);
    drawCircle(ctx, [x, y], 15, color);
    var len = Math.max(Math.hypot(hd[0], hd[1]), 1.0);
    var dx = hd[0] / len;
    var dy = hd[1] / len;
    [-1, 1].forEach(function (side) {
      var foot = [Math.round(x - dx * 18 + side * dy * 8), Math.round(y - dy * 18 - side * dx * 8)];
      drawLine(ctx, [x, y], foot, "rgb(25, 49, 62)", 4);
    });
    drawCircle(ctx, [Math.round(x + dx * 13), Math.round(y + dy * 13)], 7, "rgb(245, 208, 163)");
    var labelWidth = Math.ceil(painter.measureWidth(label, 21)) + 14;
    var box = { x: Math.round(x - labelWidth / 2), y: y - 46, width: labelWidth, height: 22 };
    painter.panel(box, NAVY, 5);
    painter.text(label, { x: box.x + 6, y: box.y + 2, width: box.width - 6, height: 20 }, 21, color);
    if (label === "YOU") {
      drawCircle(ctx, [x, y], 23, GREEN, 2);
    }
  }

  function drawBall(painter, point, height) {
    var ctx = painter.ctx;
    var pt = pitchPoint(point);
    var x = pt[0];
    var y = pt[1];
    drawCircle(ctx, [x + 2, y + 3], 9, NAVY);
    var liftedY = y - Math.round(height || 0.0);
    drawCircle(ctx, [x, liftedY], 8, "rgb(250, 248, 233)");
    drawCircle(ctx, [x, liftedY], 3, NAVY);
  }

  function choiceRoute(painter, scene, choice, color, dashed) {
    var draw = dashed ? dashedArrow : arrow;
    var ctx = painter.ctx;
    if (choice.ball_via !== null && choice.ball_via !== undefined) {
      draw(ctx, pitchPoint(scene.ball), pitchPoint(choice.ball_via), color);
      draw(ctx, pitchPoint(choice.ball_via), pitchPoint(choice.ball_end), color);
    } else {
      var you = findYou(scene);
      draw(ctx, pitchPoint(you.position), pitchPoint(routeDestination(choice)), color);
    }
  }

  function SoccerSmartWebApp(data, canvas, storage) {
    this.data = data;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.painter = new Painter(this.ctx);
    this.storage = storage || null;
    this.cards = data.starter_cards.slice();
    this.session = null;
    this.cardIndex = null;
    this.cardElapsed = 0.0;
    this.seed = 0;
    this.hover = [-1, -1];
    this.touchPreviewChoice = null;
    this.mobileMode = false;
    this.history = {};
    this.book = null;
    this.playBrowser = null;
    this.savedResults = this._loadProgress();
    this.menuCards = data.sections.map(function (section) {
      var idStr = (section.id < 10 ? "0" : "") + section.id;
      return [idStr + " / " + section.title, "3 topics: " + section.description, "stage:" + section.id];
    }).concat([
      ["05 / Mixed round", "All 4 sections: 6 practice + 2 transfer", "stage:5"],
      ["06 / Practice cards", "7 technique demos & adult activities", "cards:0"],
      ["07 / Book companion", "57 topics / original practice", "book"],
      ["08 / Continuous Play", "24 openings / linked decisions", "continuous"]
    ]);
  }

  Object.defineProperty(SoccerSmartWebApp.prototype, "layoutErrors", {
    get: function () {
      return this.painter.errors;
    }
  });

  SoccerSmartWebApp.prototype._loadProgress = function () {
    if (!this.storage) {
      return {};
    }
    try {
      var raw = this.storage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_e) {
      return {};
    }
  };

  SoccerSmartWebApp.prototype._saveProgress = function (sceneId, rating) {
    if (!(sceneId in this.savedResults) || rating > this.savedResults[sceneId]) {
      this.savedResults[sceneId] = rating;
    }
    if (!this.storage) {
      return;
    }
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(this.savedResults));
    } catch (_e) {
      // Ignore storage quota errors
    }
  };

  SoccerSmartWebApp.prototype.buttons = function () {
    if (this.playBrowser !== null && this.session === null) {
      return this.playBrowser.buttons();
    }
    if (this.book !== null && this.session === null && this.cardIndex === null) {
      return this.book.buttons();
    }
    var result = this._contentButtons();
    if (this.book !== null) {
      result.push(makeButton(910, 30, 190, 50, "Book topics / B", "book_back", ""));
    }
    if (this.playBrowser !== null) {
      result.push(makeButton(910,30,190,50,"Play tasks / B","play_back",""));
    }
    return result;
  };

  SoccerSmartWebApp.prototype._contentButtons = function () {
    if (this.cardIndex !== null) {
      return [
        makeButton(814, 608, 410, 56, "Replay demo  /  R", "card_replay", ""),
        makeButton(814, 672, 410, 56, this.book ? "Book topics / N" : "Next card  /  N", "card_next", ""),
        makeButton(814, 736, 410, 56, "Back to menu  /  ESC", "menu", "")
      ];
    }
    var s = this.session;
    if (s === null) {
      return this.menuCards.map(function (item, i) {
        return makeButton(814, 264 + i * 62, 410, 58, item[0] + "\n" + item[1], item[2], "");
      });
    }
    if (s.phase === "decide") {
      return s.scene.choices.map(function (c, i) {
        return makeButton(814, 420 + i * 76, 410, 66, c.label, "choice:" + i, String(i + 1));
      });
    }
    if (s.phase === "feedback") {
      return [
        makeButton(814, 612, 410, 54, "Compare coach demo  /  C", "coach", ""),
        makeButton(814, 674, 410, 54, "Try another choice  /  R", "retry", ""),
        makeButton(814, 736, 410, 54, s instanceof ContinuousSession ? s.nextLabel : "Next situation  /  N", "next", "")
      ];
    }
    if (s.phase === "summary") {
      return [makeButton(814, 732, 410, 58, "Choose another section", "menu", "")];
    }
    var label = s.phase === "observe" ? "Pause and decide  /  SPACE" : "Show feedback  /  SPACE";
    return [makeButton(814, 732, 410, 58, label, "skip", "")];
  };

  SoccerSmartWebApp.prototype.activate = function (action) {
    this.touchPreviewChoice = null;
    if (action === "continuous") {
      this.playBrowser = new PlayBrowser(this.data);
      this.book = null;
      this.session = null;
      this.cardIndex = null;
    } else if (action.indexOf("play_") === 0 && this.playBrowser !== null) {
      this._playAction(action);
    } else if (action === "book") {
      this.playBrowser = null;
      this.book = new BookBrowser(this.data);
      this.session = null;
      this.cardIndex = null;
    } else if (action.indexOf("book_") === 0 && this.book !== null) {
      this._bookAction(action);
    } else if (action.indexOf("stage:") === 0) {
      this.playBrowser = null;
      this.book = null;
      this.session = new Session(this.data, parseInt(action.split(":")[1], 10), this.seed);
      this.cardIndex = null;
      this.seed += 1;
      this.history = {};
    } else if (action.indexOf("cards:") === 0) {
      this.playBrowser = null;
      this.book = null;
      this.cards = this.data.starter_cards.slice();
      this.session = null;
      this.cardIndex = parseInt(action.split(":")[1], 10) % this.cards.length;
      this.cardElapsed = 0.0;
    } else if (action === "menu") {
      this.playBrowser = null;
      this.book = null;
      this.session = null;
      this.cardIndex = null;
    } else if (this.cardIndex !== null) {
      this._cardAction(action);
    } else if (this.session !== null) {
      this._sessionAction(action);
    }
  };

  SoccerSmartWebApp.prototype._playAction = function (action) {
    if (action === "play_back") {
      this.session = null;
    } else if (action === "play_next" || action === "play_prev") {
      this.playBrowser.changePage(action === "play_next" ? 1 : -1);
    } else if (action.indexOf("play_family:") === 0) {
      this.session = new ContinuousSession(this.data,parseInt(action.split(":")[1],10),this.seed);
      this.seed += 1;
      this.history = {};
    }
  };

  SoccerSmartWebApp.prototype._bookAction = function (action) {
    var book = this.book;
    if (action === "book_back") {
      this.session = null;
      this.cardIndex = null;
    } else if (action === "book_categories") {
      book.category = null;
      book.page = 0;
    } else if (action === "book_prev") {
      book.changePage(-1);
    } else if (action === "book_next") {
      book.changePage(1);
    } else if (action.indexOf("book_category:") === 0) {
      book.chooseCategory(action.split(":")[1]);
    } else if (action.indexOf("book_entry:") === 0) {
      var entry = book.select(parseInt(action.split(":")[1], 10));
      this.history = {};
      if (entry.scene_ids && entry.scene_ids.length > 0) {
        var scenes = entry.scene_ids.map(function (id) { return book.scenes[id]; });
        this.session = new Session(this.data, 7, this.seed, scenes);
        this.cardIndex = null;
      } else {
        this.cards = [book.cards[entry.card_id]];
        this.cardIndex = 0;
        this.cardElapsed = 0.0;
        this.session = null;
      }
    }
  };

  SoccerSmartWebApp.prototype._cardAction = function (action) {
    if (action === "card_replay") {
      this.cardElapsed = 0.0;
    } else if (action === "card_next") {
      if (this.book !== null) {
        this.activate("book_back");
      } else {
        this.cardIndex = (this.cardIndex + 1) % this.cards.length;
        this.cardElapsed = 0.0;
      }
    }
  };

  SoccerSmartWebApp.prototype._sessionAction = function (action) {
    var s = this.session;
    if (action.indexOf("choice:") === 0) {
      var index = parseInt(action.split(":")[1], 10);
      if (s.choose(index)) {
        if (!this.history[s.scene.id]) {
          this.history[s.scene.id] = [];
        }
        this.history[s.scene.id].push(s.scene.choices[index].label);
        if (!s.practiceOnly) { this._saveProgress(baseId(s.scene), s.results[s.scene.id]); }
      }
    } else if (action === "coach") {
      s.compareCoach();
    } else if (action === "retry") {
      s.retry();
    } else if (action === "next") {
      s.advance();
    } else if (action === "skip") {
      s.tick(ANIMATION_SECONDS);
    }
  };

  SoccerSmartWebApp.prototype.handlePointerMove = function (logicalPos, pointerType) {
    if (pointerType === "touch") {
      return;
    }
    this.hover = logicalPos;
  };

  SoccerSmartWebApp.prototype.handlePointerDown = function (logicalPos, pointerType) {
    var menuRect = { x: 1120, y: 35, width: 125, height: 40 };
    if ((this.session !== null || this.cardIndex !== null || this.book !== null || this.playBrowser !== null) && collidePoint(menuRect, logicalPos)) {
      this.activate("menu");
      return;
    }
    var btns = this.buttons();
    for (var i = 0; i < btns.length; i++) {
      var button = btns[i];
      if (collidePoint(button.rect, logicalPos)) {
        if (pointerType === "touch" && this.session !== null && this.session.phase === "decide" && button.action.indexOf("choice:") === 0) {
          var choiceIdx = parseInt(button.action.split(":")[1], 10);
          if (this.touchPreviewChoice !== choiceIdx) {
            this.touchPreviewChoice = choiceIdx;
            this.hover = [button.rect.x + button.rect.width / 2, button.rect.y + button.rect.height / 2];
            return;
          }
        }
        this.activate(button.action);
        return;
      }
    }
    if (pointerType === "touch") {
      this.touchPreviewChoice = null;
      this.hover = [-1, -1];
    }
  };

  SoccerSmartWebApp.prototype.handleKeyDown = function (key) {
    if (this._playKey(key)) { return; }
    if (this._bookKey(key)) {
      return;
    }
    if (key === "Escape") {
      this.activate("menu");
    } else if (key >= "1" && key <= "8") {
      var number = parseInt(key, 10) - 1;
      if (this.session === null && this.cardIndex === null) {
        this.activate(this.menuCards[number][2]);
      } else if (this.session !== null && this.session.phase === "decide" && number < 3) {
        this.activate("choice:" + number);
      }
    } else if ((key === " " || key === "Spacebar") && this.session !== null) {
      this.activate("skip");
    } else if (key === "c" || key === "C") {
      this.activate("coach");
    } else if (key === "r" || key === "R") {
      this.activate(this.cardIndex !== null ? "card_replay" : "retry");
    } else if (key === "n" || key === "N") {
      this.activate(this.cardIndex !== null ? "card_next" : "next");
    }
  };

  SoccerSmartWebApp.prototype._playKey = function (key) {
    if (this.playBrowser === null) { return false; }
    if (key === "b" || key === "B") {
      this.activate("play_back");
      return true;
    }
    if (this.session === null && key >= "1" && key <= "8") {
      var action = this.playBrowser.numberAction(parseInt(key,10)-1);
      if (action !== null) { this.activate(action); }
      return true;
    }
    if (this.session === null && (key === "ArrowLeft" || key === "ArrowRight")) {
      this.activate(key === "ArrowLeft" ? "play_prev" : "play_next");
      return true;
    }
    return false;
  };

  SoccerSmartWebApp.prototype._bookKey = function (key) {
    if (this.book === null) {
      return false;
    }
    if (key === "b" || key === "B") {
      this.activate("book_back");
      return true;
    }
    var browsing = this.session === null && this.cardIndex === null;
    if (browsing && key >= "1" && key <= "7") {
      var action = this.book.numberAction(parseInt(key, 10) - 1);
      if (action !== null) {
        this.activate(action);
      }
      return true;
    }
    if (browsing && (key === "ArrowLeft" || key === "ArrowRight")) {
      this.activate(key === "ArrowLeft" ? "book_prev" : "book_next");
      return true;
    }
    return false;
  };

  SoccerSmartWebApp.prototype.tick = function (seconds) {
    if (this.session !== null) {
      this.session.tick(seconds);
    }
    if (this.cardIndex !== null) {
      this.cardElapsed += seconds;
    }
  };

  SoccerSmartWebApp.prototype.setMobileMode = function (flag) {
    this.mobileMode = Boolean(flag);
  };

  SoccerSmartWebApp.prototype.mobileState = function () {
    var self = this;
    var btns = this.buttons().map(function (b) {
      return {
        label: b.label,
        action: b.action,
        number: b.number,
        previewed: self.touchPreviewChoice !== null && b.action === "choice:" + self.touchPreviewChoice
      };
    });
    if (this.playBrowser !== null && this.session === null) {
      return {badge:"CONTINUOUS PLAY",title:"Choose a match task",subtitle:"8 tasks / 24 openings",
        body:"Each play has 2-3 linked decisions. Pass, support and recover as the picture changes.",
        note:"Page "+(this.playBrowser.page+1)+" of 2. Retry is practice; first-run scores stay saved.",buttons:btns};
    }
    if (this.cardIndex !== null) {
      var card = this.cards[this.cardIndex];
      var loc = card.groups.map(function (gid) {
        var grp = self.data.groups[gid];
        var pages = grp && grp.locators && grp.locators.length ? grp.locators.join("/") : "overview";
        return gid + " (p. " + pages + ")";
      }).join(", ");
      if (this.book !== null && this.book.selected !== null) {
        loc = "index p. " + this.book.selected.page + " / original activity";
      }
      return {
        badge: "PRACTICE CARD " + (this.cardIndex + 1) + "/" + this.cards.length + " / UNSCORED",
        title: card.title,
        subtitle: "Book themes: " + loc,
        body: card.summary,
        note: "Adult-led activity:\n" + card.adult_prompt,
        buttons: btns
      };
    }
    if (this.book !== null && this.session === null) {
      var pages = Math.max(1, Math.floor((this.book.items.length + 5) / 6));
      var catTitle = this.book.category;
      if (catTitle !== null) {
        this.book.categories.forEach(function (pair) {
          if (pair[0] === catTitle) {
            catTitle = pair[1];
          }
        });
      }
      return {
        badge: "BOOK COMPANION",
        title: "Book companion",
        subtitle: catTitle ? (catTitle + " / page " + (this.book.page + 1) + " of " + pages) : "57 indexed topics",
        body: catTitle
          ? "Tap a topic below to open its practice play or card."
          : "Original practice for the indexed topics. Physical activities and observation cards are unscored.",
        note: "",
        buttons: btns
      };
    }
    if (this.session === null) {
      var savedCount = Object.keys(this.savedResults).length;
      return {
        badge: "SOCCER SMART LAB",
        title: "Choose a tactical section.",
        subtitle: "6 practice plays + 2 transfer layouts",
        body: "Scan space, pressure, and teammates before you act. Multiple roles attacking the top goal.",
        note: savedCount > 0
          ? "Starter: 12 topics / 36 scenes / 7 cards (" + savedCount + " scenes practiced)"
          : "Starter: 12 topics / 36 scenes / 7 cards.",
        buttons: btns
      };
    }
    var s = this.session;
    if (s.phase === "summary") {
      var counts = s.summary();
      var progress = this.book !== null
        ? "Practice: " + counts[0] + " / " + counts[1] + " (Book topic round)"
        : "Practice: " + counts[0] + " / " + counts[1] + " | New layouts: " + counts[2] + " / " + counts[3];
      if (s instanceof ContinuousSession) {
        progress = "First-run decisions: "+counts[0]+" / "+counts[1]+" (visited steps only)";
      }
      return {
        badge: "SESSION COMPLETE",
        title: "Session complete!",
        subtitle: progress,
        body: "Soccer Smarts checklist:\n- Where is the pressure?\n- Where is the open space?\n- Who has a clear passing lane?",
        note: "Great scanning across roles! Try another section or Practice Cards.",
        buttons: btns
      };
    }
    var mode = s.scene.transfer ? "NEW LAYOUT" : "PRACTICE";
    var badge = mode + " " + (s.index + 1) + "/" + s.scenes.length + " / " + baseId(s.scene);
    if (s instanceof ContinuousSession) { badge = "PLAY "+(s.index+1)+"/"+s.plays.length+" / STEP "+s.depth; }
    var sub = "Role: " + s.scene.role + " (" + s.scene.groups.join(", ") + ")";
    if (s.phase === "feedback") {
      var c = s.feedback;
      var ratingLabel = ["Notice the risk", "A reasonable option", "Good fit for this picture"][c.rating];
      return {
        badge: badge + " - " + ratingLabel.toUpperCase(),
        title: s instanceof ContinuousSession ? s.play.title : s.scene.title,
        subtitle: ratingLabel + " (" + sub + ")",
        body: c.outcome + "\n\n" + c.explanation,
        note: s.practiceOnly ? "Practice branch: first-run scores stay saved." : s.scene.coach_note,
        buttons: btns
      };
    }
    var statusMap = {
      observe: "Watch the build-up...",
      outcome: "Watch your chosen action...",
      coach: "Watch the coach demonstration...",
      decide: this.touchPreviewChoice !== null
        ? "Route previewed on pitch. Tap the same choice again to confirm."
        : "Tap a choice once to preview its route on the pitch, then tap again to confirm."
    };
    return {
      badge: badge,
      title: s instanceof ContinuousSession ? s.play.title : s.scene.title,
      subtitle: sub,
      body: s.scene.cue,
      note: (statusMap[s.phase] || "") + "\n" + s.scene.rules,
      buttons: btns
    };
  };

  SoccerSmartWebApp.prototype.draw = function () {
    var p = this.painter;
    p.errors = [];
    this.ctx.fillStyle = NAVY;
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    if (this.mobileMode && this.ctx.save) {
      this.ctx.save();
      this.ctx.translate(-28, -130);
    }
    if (!this.mobileMode) {
      p.text("SOCCER SMART LAB", { x: 30, y: 27, width: 680, height: 48 }, 49, INK);
      p.text("Scan space, pressure, and teammates before you act.", { x: 32, y: 83, width: 720, height: 30 }, 26, MUTED);
    }
    var role = "";
    if (this.session !== null && this.session.phase !== "summary") {
      role = this.session.scene.role;
    }
    drawPitch(p, role);
    if (!this.mobileMode) {
      p.panel(SIDE, PANEL, 18);
    }
    if (this.playBrowser !== null && this.session === null) {
      p.text("MENU / ESC",{x:1120,y:43,width:128,height:35},23,GREEN);
      this.playBrowser.draw(p);
    } else if (this.cardIndex !== null) {
      if (!this.mobileMode) {
        p.text("MENU / ESC", { x: 1120, y: 43, width: 128, height: 35 }, 23, GREEN);
      }
      this._drawCard();
    } else if (this.book !== null && this.session === null) {
      if (!this.mobileMode) {
        p.text("MENU / ESC", { x: 1120, y: 43, width: 128, height: 35 }, 23, GREEN);
      }
      this.book.draw(p);
    } else if (this.session === null) {
      this._menu();
    } else {
      if (!this.mobileMode) {
        p.text("MENU / ESC", { x: 1120, y: 43, width: 128, height: 35 }, 23, GREEN);
      }
      this._scene();
    }
    if (!this.mobileMode) {
      var self = this;
      this.buttons().forEach(function (btn) {
        var isTouchPreview = self.touchPreviewChoice !== null && btn.action === "choice:" + self.touchPreviewChoice;
        p.button(btn, collidePoint(btn.rect, self.hover), isTouchPreview);
      });
      p.text(
        "YOU = your player / BACK, CM, LW, RW, M, N = teammates / A, A2, R = opponents\nBlue = your team / Coral = opponents / Gold = keeper",
        { x: 32, y: 829, width: 740, height: 45 },
        21,
        MUTED
      );
      p.text("No countdown. Think it through.", { x: 850, y: 835, width: 390, height: 28 }, 23, MUTED);
    } else {
      p.text(
        "YOU (gold) / Blue = teammates / Coral = opponents",
        { x: 52, y: 766, width: 694, height: 24 },
        19,
        MUTED
      );
    }
    if (this.mobileMode && this.ctx.restore) {
      this.ctx.restore();
    }
  };

  SoccerSmartWebApp.prototype._menu = function () {
    var p = this.painter;
    var demoPlayers = [
      [[44.0, 56.0], "YOU", "home"],
      [[52.0, 46.0], "A", "away"],
      [[28.0, 40.0], "LW", "home"],
      [[50.0, 93.0], "GK", "keeper"]
    ];
    demoPlayers.forEach(function (item) {
      drawPlayer(p, item[0], item[1], item[2], [0.0, -1.0]);
    });
    drawBall(p, [44.0, 55.0], 0.0);
    p.text("Choose a tactical section.", { x: 814, y: 160, width: 410, height: 46 }, 34, INK);
    p.text("6 practice plays + 2 transfer layouts.\nMultiple roles attacking the top goal.", { x: 814, y: 212, width: 410, height: 64 }, 24, MUTED);
    var savedCount = Object.keys(this.savedResults).length;
    var footer = savedCount > 0
      ? "Starter: 12 topics / 36 scenes / 7 cards (" + savedCount + " scenes practiced)"
      : "Starter: 12 topics / 36 scenes / 7 cards.";
    p.text(footer, { x: 814, y: 780, width: 410, height: 28 }, 22, GREEN);
  };

  SoccerSmartWebApp.prototype._drawCard = function () {
    var card = this.cards[this.cardIndex];
    var p = this.painter;
    var fraction = Math.min(1.0, (this.cardElapsed % ANIMATION_SECONDS) / ANIMATION_SECONDS);
    var pos = cardPositions(card, fraction);
    card.actors.forEach(function (actor) {
      drawPlayer(p, pos.actors[actor.key], actor.label, actor.team, actor.heading);
    });
    drawBall(p, pos.ball, cardHeight(card, fraction));
    if ((card.ball_control !== null && card.ball_control !== undefined) || (card.waypoints && card.waypoints.length > 0)) {
      this.ctx.strokeStyle = GOLD;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      for (var i = 0; i <= 40; i++) {
        var pt = pitchPoint(cardPositions(card, i / 40.0).ball);
        if (i === 0) {
          this.ctx.moveTo(pt[0], pt[1]);
        } else {
          this.ctx.lineTo(pt[0], pt[1]);
        }
      }
      this.ctx.stroke();
    } else {
      arrow(this.ctx, pitchPoint(card.ball_start), pitchPoint(card.ball_end), GOLD);
    }
    var self = this;
    var locators = card.groups.map(function (gid) {
      var grp = self.data.groups[gid];
      var pages = grp && grp.locators && grp.locators.length ? grp.locators.join("/") : "overview";
      return gid + " (p. " + pages + ")";
    }).join(", ");
    if (this.book !== null && this.book.selected !== null) {
      locators = "index p. " + this.book.selected.page + " / original activity";
    }
    p.text("PRACTICE CARD  " + (this.cardIndex + 1) + "/" + this.cards.length + "  /  UNSCORED", { x: 814, y: 162, width: 410, height: 28 }, 23, GREEN);
    p.text(card.title, { x: 814, y: 198, width: 410, height: 52 }, 34, INK);
    p.text("Book themes: " + locators, { x: 814, y: 254, width: 410, height: 48 }, 22, GOLD);
    p.text(card.summary, { x: 814, y: 312, width: 410, height: 120 }, 25, INK);
    p.text("Adult-led activity:\n" + card.adult_prompt, { x: 814, y: 442, width: 410, height: 150 }, 23, MUTED);
  };

  SoccerSmartWebApp.prototype._scene = function () {
    var s = this.session;
    if (s.phase === "summary") {
      this._summary();
      return;
    }
    var scene = s.scene;
    if (scene.reference_line !== null && scene.reference_line !== undefined) {
      var y = pitchPoint([0.0, scene.reference_line])[1];
      drawLine(this.ctx, [52, y], [746, y], GOLD, 2);
    }
    var pos = positions(scene, s.phase, s.fraction, s.selected);
    var p = this.painter;
    scene.actors.forEach(function (actor) {
      drawPlayer(p, pos.actors[actor.key], actor.label, actor.team, actor.heading);
    });
    drawBall(p, pos.ball, ballHeight(scene, s.phase, s.fraction, s.selected));
    if (s.phase === "decide") {
      var btns = this.buttons();
      for (var i = 0; i < btns.length; i++) {
        var btn = btns[i];
        var isHovered = collidePoint(btn.rect, this.hover) || this.touchPreviewChoice === i;
        if (btn.action.indexOf("choice:") === 0 && isHovered) {
          choiceRoute(p, scene, scene.choices[i], GOLD, false);
        }
      }
    } else if (s.phase === "feedback" || s.phase === "coach") {
      this._feedbackOverlay();
    }
    this._instructions();
  };

  SoccerSmartWebApp.prototype._instructions = function () {
    var s = this.session;
    var p = this.painter;
    var mode = s.scene.transfer ? "NEW LAYOUT" : "PRACTICE";
    var progress = s instanceof ContinuousSession ? "PLAY "+(s.index+1)+"/"+s.plays.length+" / STEP "+s.depth
      : mode + "  " + (s.index + 1) + "/" + s.scenes.length + "  /  " + baseId(s.scene);
    p.text(progress, { x: 814, y: 158, width: 410, height: 26 }, 23, GREEN);
    p.text(s instanceof ContinuousSession ? s.play.title : s.scene.title, { x: 814, y: 190, width: 410, height: 72 }, 33, INK);
    p.text("Role: " + s.scene.role + "  (" + s.scene.groups.join(", ") + ")", { x: 814, y: 266, width: 410, height: 34 }, 23, GOLD);
    if (s.phase === "feedback") {
      this._feedbackText();
    } else {
      p.text(s.scene.cue, { x: 814, y: 310, width: 410, height: 96 }, 25, INK);
      if (s.phase === "observe" || s.phase === "outcome" || s.phase === "coach") {
        var labels = {
          observe: "Watch the build-up...",
          outcome: "Watch your chosen action...",
          coach: "Watch the coach demonstration..."
        };
        p.text(labels[s.phase], { x: 814, y: 440, width: 410, height: 64 }, 28, GOLD);
      }
      if (s.phase === "decide") {
        var hint = this.touchPreviewChoice !== null
          ? "Route previewed. Tap the same choice again to confirm."
          : "Hover or tap to preview your move or pass destination.";
        p.text(hint, { x: 814, y: 658, width: 410, height: 48 }, 22, GOLD);
      }
      p.text(s.scene.rules, { x: 814, y: s.phase === "decide" ? 712 : 610, width: 410, height: 68 }, 22, MUTED);
    }
  };

  SoccerSmartWebApp.prototype._feedbackText = function () {
    var s = this.session;
    var c = s.feedback;
    var color = [CORAL, GOLD, GREEN][c.rating];
    var label = ["Notice the risk", "A reasonable option", "Good fit for this picture"][c.rating];
    var p = this.painter;
    p.text(label, { x: 814, y: 306, width: 410, height: 36 }, 30, color);
    p.text(c.outcome, { x: 814, y: 346, width: 410, height: 58 }, 23, INK);
    p.text(c.explanation, { x: 814, y: 408, width: 410, height: 108 }, 23, MUTED);
    p.text(s.scene.coach_note, { x: 814, y: 520, width: 410, height: 52 }, 21, GREEN);
    var prior = this.history[s.scene.id] || [];
    var note = "First-try result saved. Press C for coach or R to retry.";
    if (prior.length > 1) {
      note = "Compared with: " + prior[prior.length - 2];
    }
    if (s.practiceOnly) { note = "Practice branch: first-run scores stay saved."; }
    p.text(note, { x: 814, y: 574, width: 410, height: 34 }, 20, GOLD);
  };

  SoccerSmartWebApp.prototype._feedbackOverlay = function () {
    var s = this.session;
    var p = this.painter;
    choiceRoute(p, s.scene, s.feedback, GOLD, false);
    var best = coachChoice(s.scene,s.selected);
    var fbDest = routeDestination(s.feedback);
    var bestDest = routeDestination(best);
    var distinct = fbDest[0] !== bestDest[0] || fbDest[1] !== bestDest[1];
    if (distinct || s.phase === "coach") {
      choiceRoute(p, s.scene, best, GREEN, true);
    }
    if (s.scene.shot_window !== null && s.scene.shot_window !== undefined) {
      drawWindowMarker(this.ctx, pitchPoint(s.scene.shot_window));
    }
    var legend = distinct
      ? "Gold solid: your choice / Green dashed: coach route"
      : "Your choice matches the coach destination";
    var legendY = s.scene.ball[1] < 35.0 ? 700 : 184;
    p.text(legend, { x: 64, y: legendY, width: 650, height: 26 }, 22, INK);
    p.text("Illustrated routes, not guaranteed outcomes.", { x: 64, y: legendY + 26, width: 650, height: 26 }, 20, MUTED);
  };

  SoccerSmartWebApp.prototype._summary = function () {
    var s = this.session;
    var p = this.painter;
    var counts = s.summary();
    p.text("Session complete!", { x: 814, y: 172, width: 410, height: 55 }, 42, GREEN);
    p.text("Strong or reasonable first tries", { x: 814, y: 240, width: 410, height: 34 }, 26, INK);
    var progress = this.book !== null
      ? "Practice: " + counts[0] + " / " + counts[1] + "\nBook topic round"
      : "Practice: " + counts[0] + " / " + counts[1] + "\nNew layouts: " + counts[2] + " / " + counts[3];
    if (s instanceof ContinuousSession) {
      progress = "Decisions: "+counts[0]+" / "+counts[1]+"\nFirst run / visited steps only";
    }
    p.text(progress, { x: 814, y: 294, width: 410, height: 96 }, 36, GOLD);
    p.text(
      "Soccer Smarts checklist:\nWhere is the pressure?\nWhere is the open space?\nWho has a clear passing lane?",
      { x: 814, y: 414, width: 410, height: 150 },
      25,
      INK
    );
    var weak = [];
    s.scenes.forEach(function (scene) {
      if (s.results[scene.id] === 0 && weak.indexOf(scene.title) === -1) {
        weak.push(scene.title);
      }
    });
    var message = weak.length > 0
      ? ("Review next: " + weak.join("; ")).slice(0, 117)
      : "Great scanning across roles! Try another section or Practice Cards.";
    p.text(message, { x: 814, y: 588, width: 410, height: 120 }, 24, MUTED);
    p.text("SCAN\nDECIDE\nSUPPORT", { x: 150, y: 330, width: 520, height: 260 }, 78, GREEN);
  };

  function bootBrowser() {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }
    var canvas = document.getElementById("game-canvas");
    if (!canvas || !window.SOCCER_SMART_DATA) {
      return;
    }
    var app = new SoccerSmartWebApp(window.SOCCER_SMART_DATA, canvas, window.localStorage);
    window.soccerSmartApp = app;

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
          if (app.session !== null && app.session.phase === "decide" && b.action.indexOf("choice:") === 0) {
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

    function logicalFromEvent(evt) {
      var rect = canvas.getBoundingClientRect();
      var logW = app.mobileMode ? 740 : WIDTH;
      var logH = app.mobileMode ? 660 : HEIGHT;
      var x = Math.round(((evt.clientX - rect.left) * logW) / rect.width) + (app.mobileMode ? 28 : 0);
      var y = Math.round(((evt.clientY - rect.top) * logH) / rect.height) + (app.mobileMode ? 130 : 0);
      return [x, y];
    }

    canvas.addEventListener("pointermove", function (evt) {
      app.handlePointerMove(logicalFromEvent(evt), evt.pointerType || "mouse");
    });

    canvas.addEventListener("pointerdown", function (evt) {
      if (!app.mobileMode) {
        evt.preventDefault();
        app.handlePointerDown(logicalFromEvent(evt), evt.pointerType || "mouse");
      }
    });

    window.addEventListener("keydown", function (evt) {
      if (evt.key === " " || evt.key === "ArrowLeft" || evt.key === "ArrowRight") {
        evt.preventDefault();
      }
      app.handleKeyDown(evt.key);
    });

    var lastTime = performance.now();
    function frame(now) {
      var dt = Math.min((now - lastTime) / 1000.0, 0.1);
      lastTime = now;
      app.tick(dt);
      app.draw();
      syncMobileDom();
      window.requestAnimationFrame(frame);
    }
    app.draw();
    syncMobileDom();
    window.requestAnimationFrame(frame);
  }

  if (typeof window !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bootBrowser);
    } else {
      bootBrowser();
    }
  }

  return {
    WIDTH: WIDTH,
    HEIGHT: HEIGHT,
    ANIMATION_SECONDS: ANIMATION_SECONDS,
    SoccerSmartWebApp: SoccerSmartWebApp,
    Session: Session,
    ContinuousSession: ContinuousSession,
    PlayBrowser: PlayBrowser,
    BookBrowser: BookBrowser,
    positions: positions,
    cardPositions: cardPositions,
    ballHeight: ballHeight,
    cardHeight: cardHeight,
    routeDestination: routeDestination,
    transferScene: transferScene,
    pitchPoint: pitchPoint
  };
});
