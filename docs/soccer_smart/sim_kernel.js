(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.SoccerSmartSim = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var DT = 0.04;
  var BEAT_STEPS = 35;
  var GOAL_LEFT = 39.0;
  var GOAL_RIGHT = 61.0;
  var BUILD_OUT_Y = 65.0;

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function dist2(ax, ay, bx, by) { return Math.hypot(bx - ax, by - ay); }
  function unit(dx, dy, fx, fy) {
    var m = Math.hypot(dx, dy);
    return m < 1e-6 ? [fx === undefined ? 0.0 : fx, fy === undefined ? -1.0 : fy] : [dx / m, dy / m];
  }
  function segDist(ax, ay, bx, by, px, py) {
    var dx = bx - ax, dy = by - ay, d = dx * dx + dy * dy;
    if (d < 1e-6) return Math.hypot(px - ax, py - ay);
    var t = clamp(((px - ax) * dx + (py - ay) * dy) / d, 0.0, 1.0);
    return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
  }
  function r3(v) { return Math.round(v * 1000) / 1000; }
  function cloneObj(o) { return Object.assign({}, o); }
  function playerByKey(players, key) {
    for (var i = 0; i < players.length; i++) if (players[i].key === key) return players[i];
    return null;
  }

  function offsideLineY(state) {
    if (!state.offside_on || state.set_piece === "throw_in" || state.set_piece === "corner" || state.set_piece === "goal_kick") {
      return null;
    }
    var ys = state.players.filter(function (p) { return p.team === "away"; }).map(function (p) { return p.y; }).sort(function (a, b) { return a - b; });
    var secondLast = ys.length >= 2 ? ys[1] : (ys.length ? ys[0] : 50.0);
    return Math.min(50.0, state.ball.y, secondLast);
  }

  function coverShadowTriangle(bx, by, dx, dy, length, halfW) {
    length = length || 22.0; halfW = halfW || 5.0;
    var u = unit(dx - bx, dy - by, 0.0, -1.0), px = -u[1], py = u[0];
    var ex = clamp(dx + u[0] * length, 0.0, 100.0), ey = clamp(dy + u[1] * length, 0.0, 100.0);
    return [[dx, dy], [clamp(ex + px * halfW, 0.0, 100.0), clamp(ey + py * halfW, 0.0, 100.0)],
            [clamp(ex - px * halfW, 0.0, 100.0), clamp(ey - py * halfW, 0.0, 100.0)]];
  }

  function gkCoverageFan(state) {
    var gk = null;
    for (var i = 0; i < state.players.length; i++) if (state.players[i].team === "away" && state.players[i].role === "gk") gk = state.players[i];
    if (!gk) return null;
    var u = unit(state.ball.x - gk.x, state.ball.y - gk.y, 0.0, 1.0), px = -u[1], py = u[0], reach = 6.5;
    return [[gk.x, gk.y],
      [clamp(gk.x + u[0] * 10.0 + px * reach, 28.0, 72.0), clamp(gk.y + u[1] * 10.0 + py * reach, 0.0, 35.0)],
      [clamp(gk.x + u[0] * 10.0 - px * reach, 28.0, 72.0), clamp(gk.y + u[1] * 10.0 - py * reach, 0.0, 35.0)]];
  }

  function openPockets(state) {
    var away = state.players.filter(function (p) { return p.team === "away" && p.role !== "gk"; });
    var bx = state.ball.x, by = state.ball.y;
    var cands = [[clamp(bx - 18.0, 12.0, 88.0), clamp(by - 14.0, 14.0, 86.0)],
      [clamp(bx + 18.0, 12.0, 88.0), clamp(by - 14.0, 14.0, 86.0)], [50.0, clamp(by - 18.0, 14.0, 84.0)],
      [22.0, clamp(by - 6.0, 16.0, 84.0)], [78.0, clamp(by - 6.0, 16.0, 84.0)]];
    var out = [];
    for (var i = 0; i < cands.length && out.length < 3; i++) {
      var ok = true;
      for (var j = 0; j < away.length; j++) if (dist2(cands[i][0], cands[i][1], away[j].x, away[j].y) < 11.0) ok = false;
      if (ok) out.push(cands[i]);
    }
    return out;
  }

  function laneClear(ax, ay, bx, by, opps, margin) {
    for (var i = 0; i < opps.length; i++) if (segDist(ax, ay, bx, by, opps[i].x, opps[i].y) < margin) return false;
    return true;
  }

  function awayGkTarget(gk, ball) {
    if (ball.owner === null && ball.vy < -12.0 && ball.y < 32.0) {
      var tGoal = Math.max(0.0, ball.y / Math.max(1.0, -ball.vy));
      return [clamp(ball.x + ball.vx * tGoal, GOAL_LEFT + 1.0, GOAL_RIGHT - 1.0), 3.0];
    }
    return [clamp(50.0 + (ball.x - 50.0) * 0.34, 42.0, 58.0), clamp(3.5 + Math.max(0.0, 34.0 - ball.y) * 0.14, 3.0, 9.5)];
  }

  function homeGkTarget(gk, ball) {
    return [clamp(50.0 + (ball.x - 50.0) * 0.32, 42.0, 58.0), clamp(96.0 - Math.max(0.0, ball.y - 66.0) * 0.14, 90.0, 96.5)];
  }

  function awayAttackDecision(carrier, state, step) {
    var homeOut = state.players.filter(function (p) { return p.team === "home" && p.role !== "gk"; });
    var mates = state.players.filter(function (p) { return p.team === "away" && p.key !== carrier.key && p.role !== "gk"; });
    if (carrier.y >= 74.0 && step >= 10) {
      return { tgt: [carrier.x, carrier.y], rel: { kind: "shoot", tx: carrier.x >= 50.0 ? 43.0 : 57.0, ty: 100.0, loft: false, target_key: "" } };
    }
    var nearH = 50.0;
    for (var i = 0; i < homeOut.length; i++) nearH = Math.min(nearH, dist2(carrier.x, carrier.y, homeOut[i].x, homeOut[i].y));
    if (nearH < 8.5 && step >= 8) {
      for (var j = 0; j < mates.length; j++) {
        var m = mates[j];
        if (m.y > carrier.y + 4.0 && laneClear(carrier.x, carrier.y, m.x, m.y, homeOut, 3.5)) {
          return { tgt: [carrier.x, carrier.y], rel: { kind: "pass", tx: m.x, ty: m.y, loft: false, target_key: m.key } };
        }
      }
    }
    var drift = carrier.x > 52.0 ? -4.0 : (carrier.x < 48.0 ? 4.0 : 0.0);
    return { tgt: [clamp(carrier.x + drift, 10.0, 90.0), clamp(carrier.y + 18.0, 8.0, 92.0)], rel: null };
  }

  function awayDefendTargets(state) {
    var ball = state.ball;
    var awayOut = state.players.filter(function (p) { return p.team === "away" && p.role !== "gk"; });
    var homeOut = state.players.filter(function (p) { return p.team === "home" && p.role !== "gk"; });
    var ordered = awayOut.slice().sort(function (a, b) { return dist2(a.x, a.y, ball.x, ball.y) - dist2(b.x, b.y, ball.x, ball.y); });
    var targets = {}, pressBias = state.opponent_style === "high_press" ? 1.0 : 0.72;
    for (var i = 0; i < ordered.length; i++) {
      var opp = ordered[i], tx, ty;
      if (i === 0) {
        var sp = ball.x < 50.0 ? -2.2 : 2.2;
        tx = clamp(ball.x + sp * (1.0 - pressBias * 0.5), 6.0, 94.0);
        ty = clamp(ball.y - 1.5, 6.0, 94.0);
      } else if (i === 1) {
        tx = clamp(ball.x * 0.65 + 50.0 * 0.35, 14.0, 86.0);
        ty = clamp(ball.y - 11.0, 12.0, 88.0);
      } else {
        var runners = homeOut.filter(function (h) { return h.key !== ball.owner; });
        var mark = null, bestD = 1e9;
        for (var r = 0; r < runners.length; r++) {
          var d = dist2(opp.x, opp.y, runners[r].x, runners[r].y);
          if (d < bestD) { bestD = d; mark = runners[r]; }
        }
        tx = mark ? clamp(mark.x * 0.8 + 50.0 * 0.2, 8.0, 92.0) : opp.x;
        ty = mark ? clamp(mark.y - 3.5, 10.0, 90.0) : opp.y;
      }
      if (state.build_out_active) ty = Math.min(ty, BUILD_OUT_Y - 2.0);
      targets[opp.key] = [tx, ty];
    }
    return targets;
  }

  function homeCarrierDecision(carrier, state, action, step) {
    var awayOut = state.players.filter(function (p) { return p.team === "away" && p.role !== "gk"; });
    var relStep = carrier.trait === "playmaker" ? 5 : 8;
    if (step !== relStep) return { tgt: [carrier.x, clamp(carrier.y - 4.0, 10.0, 92.0)], rel: null };
    var you = playerByKey(state.players, "you");
    if (action.kind === "run_call" && you) {
      var lx = clamp((you.x + action.tx) * 0.5, 6.0, 94.0), ly = clamp((you.y + action.ty) * 0.5, 6.0, 94.0);
      if (laneClear(carrier.x, carrier.y, lx, ly, awayOut, 3.2)) {
        return { tgt: [carrier.x, carrier.y], rel: { kind: "pass", tx: lx, ty: ly, loft: false, target_key: "you" } };
      }
    }
    if (carrier.y <= 26.0) {
      var gk = null;
      for (var i = 0; i < state.players.length; i++) if (state.players[i].team === "away" && state.players[i].role === "gk") gk = state.players[i];
      var ax = (gk && gk.x >= 50.0) ? 43.0 : 57.0;
      if (laneClear(carrier.x, carrier.y, ax, 0.0, awayOut, 3.0)) {
        return { tgt: [carrier.x, carrier.y], rel: { kind: "shoot", tx: ax, ty: 0.0, loft: false, target_key: "" } };
      }
    }
    var mates = state.players.filter(function (p) { return p.team === "home" && p.key !== carrier.key && p.key !== "you" && p.role !== "gk"; })
      .sort(function (a, b) { return a.y - b.y; });
    for (var j = 0; j < mates.length; j++) {
      var m = mates[j], leadY = clamp(m.y - (m.trait === "speed" ? 7.0 : 2.0), 8.0, 90.0);
      if (laneClear(carrier.x, carrier.y, m.x, leadY, awayOut, 3.4)) {
        return { tgt: [carrier.x, carrier.y], rel: { kind: "pass", tx: m.x, ty: leadY, loft: false, target_key: m.key } };
      }
    }
    return { tgt: [carrier.x, clamp(carrier.y - 5.0, 10.0, 92.0)], rel: null };
  }

  function homeSupportTarget(mate, state) {
    var ball = state.ball;
    if (ball.owner === null && ball.target_key === mate.key) {
      return [clamp(ball.x + ball.vx * 0.45, 6.0, 94.0), clamp(ball.y + ball.vy * 0.45, 6.0, 94.0)];
    }
    if (mate.trait === "speed") return [mate.x < 50.0 ? 16.0 : 84.0, clamp(Math.min(mate.y, ball.y - 10.0), 12.0, 76.0)];
    if (mate.trait === "playmaker") return [clamp(50.0 + (ball.x - 50.0) * 0.25, 30.0, 70.0), clamp(ball.y - 8.0, 16.0, 78.0)];
    return [clamp(mate.x * 0.7 + ball.x * 0.3, 18.0, 82.0), clamp(ball.y + 12.0, 22.0, 86.0)];
  }

  function stepAi(state, action, step) {
    var targets = {}, aiRel = null, ball = state.ball;
    var homeOwns = ball.owner === null || state.players.some(function (p) { return p.key === ball.owner && p.team === "home"; });
    var awayDef = homeOwns ? awayDefendTargets(state) : {};
    for (var i = 0; i < state.players.length; i++) {
      var p = state.players[i];
      if (p.key === "you") {
        targets[p.key] = (action.kind === "dribble" || action.kind === "run_call" || action.kind === "run_decoy" || action.kind === "defend")
          ? [action.tx, action.ty] : [p.x, p.y];
      } else if (p.role === "gk") {
        targets[p.key] = p.team === "away" ? awayGkTarget(p, ball) : homeGkTarget(p, ball);
      } else if (p.team === "away") {
        if (ball.owner === p.key) {
          var dec = awayAttackDecision(p, state, step);
          targets[p.key] = dec.tgt;
          if (dec.rel && !aiRel) aiRel = [p.key, dec.rel];
        } else if (awayDef[p.key]) {
          targets[p.key] = awayDef[p.key];
        } else {
          targets[p.key] = [clamp(p.x, 12.0, 88.0), clamp(ball.y + 12.0, 14.0, 90.0)];
        }
      } else if (ball.owner === p.key) {
        var hdec = homeCarrierDecision(p, state, action, step);
        targets[p.key] = hdec.tgt;
        if (hdec.rel && !aiRel) aiRel = [p.key, hdec.rel];
      } else {
        targets[p.key] = homeSupportTarget(p, state);
      }
    }
    return { targets: targets, aiRel: aiRel };
  }

  function steerPlayer(p, tx, ty, dt, scale, ballPos) {
    var dx = tx - p.x, dy = ty - p.y, d = dist2(p.x, p.y, tx, ty), cap = p.max_speed * scale;
    var vx = 0.0, vy = 0.0;
    if (d >= 0.6) {
      var u = unit(dx, dy, p.hx, p.hy), sp = Math.min(cap, d / dt);
      vx = u[0] * sp; vy = u[1] * sp;
    }
    var nx = clamp(p.x + vx * dt, 2.0, 98.0), ny = clamp(p.y + vy * dt, 2.0, 98.0);
    var h = d >= 0.8 ? unit(dx, dy, p.hx, p.hy) : (ballPos ? unit(ballPos[0] - nx, ballPos[1] - ny, p.hx, p.hy) : [p.hx, p.hy]);
    return { key: p.key, name: p.name, number: p.number, team: p.team, role: p.role, trait: p.trait,
      x: nx, y: ny, vx: vx, vy: vy, hx: h[0], hy: h[1], max_speed: p.max_speed };
  }

  function snapshot(st) {
    return {
      players: st.players.map(function (p) { return [p.key, r3(p.x), r3(p.y), r3(p.hx), r3(p.hy)]; }),
      ball: [r3(st.ball.x), r3(st.ball.y), r3(st.ball.z)],
      offside_line: offsideLineY(st),
      build_out_active: st.build_out_active,
      event: st.event
    };
  }

  function launchBall(st, passer, action) {
    var u = unit(action.tx - passer.x, action.ty - passer.y, passer.hx, passer.hy);
    var openBody = (u[0] * passer.hx + u[1] * passer.hy) >= -0.25;
    var d = Math.max(2.0, dist2(passer.x, passer.y, action.tx, action.ty)), sp, vz;
    if (action.kind === "shoot") { sp = action.loft ? 38.0 : 50.0; vz = action.loft ? 16.0 : 2.5; }
    else if (action.loft) { sp = clamp(d * 1.45, 24.0, 44.0); vz = clamp(d * 0.55, 16.0, 26.0); }
    else { sp = clamp(d * 1.85, 28.0, 46.0); vz = 0.0; }
    var line = offsideLineY(st), offKeys = [];
    if (line !== null && passer.team === "home") {
      for (var i = 0; i < st.players.length; i++) {
        var p = st.players[i];
        if (p.team === "home" && p.key !== passer.key && p.y < line - 0.4) offKeys.push(p.key);
      }
    }
    return {
      ball: { x: passer.x, y: passer.y, z: action.loft ? 2.5 : 0.0, vx: u[0] * sp, vy: u[1] * sp, vz: vz,
        owner: null, last_team: passer.team, lofted: !!action.loft, release_y: passer.y,
        offside_keys: offKeys, target_key: action.target_key || "", passer_key: passer.key },
      openBody: openBody
    };
  }

  function stepBallFlight(ball, dt) {
    var nx = ball.x + ball.vx * dt, ny = ball.y + ball.vy * dt, nz = ball.z + ball.vz * dt;
    var nvz = (ball.z > 0.0 || ball.vz > 0.0) ? ball.vz - 28.0 * dt : 0.0;
    if (nz <= 0.0) { nz = 0.0; nvz = 0.0; }
    var drag = nz > 0.5 ? 0.992 : 0.968;
    var b = cloneObj(ball);
    b.x = nx; b.y = ny; b.z = nz; b.vx = ball.vx * drag; b.vy = ball.vy * drag; b.vz = nvz;
    return b;
  }

  function checkBallContacts(st, ball, step, metrics) {
    if (ball.owner !== null) return { ball: ball, ev: null };
    for (var i = 0; i < st.players.length; i++) {
      var p = st.players[i], d = dist2(p.x, p.y, ball.x, ball.y);
      if (p.team !== ball.last_team && ball.z > 6.5 && d < 4.5) metrics.cleared_overhead = 1.0;
      if (ball.z > 6.5) continue;
      if (p.role === "gk" && p.team !== ball.last_team) {
        if (d <= 3.4) return { ball: Object.assign(cloneObj(ball), { x: p.x, y: p.y, z: 0.0, vx: 0.0, vy: 0.0, vz: 0.0, owner: p.key, last_team: p.team, passer_key: "" }), ev: "saved" };
        if (d <= 4.8 && ball.vy < -10.0) {
          metrics.rebound = 1.0;
          if (Math.abs(ball.x - 50.0) > 8.0) return { ball: Object.assign(cloneObj(ball), { x: clamp(ball.x, 4.0, 96.0), y: 1.0, vx: 0.0, vy: 0.0, vz: 0.0 }), ev: "corner" };
          return { ball: Object.assign(cloneObj(ball), { vx: -ball.vx * 0.25 + (ball.x < 50.0 ? 6.0 : -6.0), vy: 10.0, vz: 2.0 }), ev: "rebound" };
        }
      }
      if (p.team !== ball.last_team && p.role !== "gk") {
        var reach = p.trait !== "anchor" ? 2.2 : 2.8;
        if (d <= reach) return { ball: Object.assign(cloneObj(ball), { x: p.x, y: p.y, z: 0.0, vx: 0.0, vy: 0.0, vz: 0.0, owner: p.key, last_team: p.team, passer_key: "" }), ev: p.team === "home" ? "won_ball" : "intercepted" };
        if (d <= reach + 0.8 && step >= 4 && !metrics.deflected) {
          metrics.deflected = 1.0;
          return { ball: Object.assign(cloneObj(ball), { vx: ball.vx * 0.45 + (p.x < ball.x ? 4.0 : -4.0), vy: ball.vy * 0.45 }), ev: null };
        }
      }
      if (p.team === ball.last_team && p.key !== ball.passer_key && d <= 3.4) {
        if (ball.offside_keys.indexOf(p.key) !== -1) return { ball: Object.assign(cloneObj(ball), { x: p.x, y: p.y, z: 0.0, vx: 0.0, vy: 0.0, vz: 0.0, owner: p.key, passer_key: "" }), ev: "offside" };
        metrics.pass_completed = 1.0;
        return { ball: Object.assign(cloneObj(ball), { x: p.x, y: p.y, z: 0.0, vx: 0.0, vy: 0.0, vz: 0.0, owner: p.key, offside_keys: [], passer_key: "" }), ev: null };
      }
    }
    return { ball: ball, ev: null };
  }

  function checkTackleOrGoal(players, ball, metrics) {
    if (ball.owner === null) {
      if (ball.y <= 0.6 && ball.x >= GOAL_LEFT && ball.x <= GOAL_RIGHT) return { ball: Object.assign(cloneObj(ball), { y: 0.0, vx: 0.0, vy: 0.0, vz: 0.0 }), ev: "goal" };
      if (ball.y >= 99.4 && ball.x >= GOAL_LEFT && ball.x <= GOAL_RIGHT) return { ball: Object.assign(cloneObj(ball), { y: 100.0, vx: 0.0, vy: 0.0, vz: 0.0 }), ev: "conceded" };
      if (ball.x < 1.0 || ball.x > 99.0 || ball.y < 0.0 || ball.y > 100.0) return { ball: Object.assign(cloneObj(ball), { x: clamp(ball.x, 1.0, 99.0), y: clamp(ball.y, 1.0, 99.0), vx: 0.0, vy: 0.0, vz: 0.0 }), ev: "out_of_bounds" };
      return { ball: ball, ev: null };
    }
    var holder = playerByKey(players, ball.owner);
    if (!holder) return { ball: ball, ev: null };
    for (var i = 0; i < players.length; i++) {
      var opp = players[i];
      if (opp.team !== holder.team && opp.role !== "gk") {
        var reach = opp.team === "home" ? 2.8 : 2.1;
        if (dist2(opp.x, opp.y, holder.x, holder.y) <= reach) {
          if (holder.team === "away" && (holder.x < 18.0 || holder.x > 82.0)) metrics.forced_wide = 1.0;
          return { ball: Object.assign(cloneObj(ball), { x: opp.x, y: opp.y, z: 0.0, owner: opp.key, last_team: opp.team, passer_key: "" }), ev: opp.team === "home" ? "won_ball" : "intercepted" };
        }
      }
    }
    return { ball: ball, ev: null };
  }

  function detectBadges(start, end, action, outcome, m) {
    var b = [];
    if (outcome === "goal") b.push("Clutch Finisher");
    if ((m.defender_pulled || 0) >= 3.8 && (outcome === "kept_ball" || outcome === "goal" || outcome === "rebound")) b.push("Defender Fixer");
    if ((m.lines_broken || 0) >= 2.0 && (outcome === "kept_ball" || outcome === "goal")) b.push("Line Breaker");
    if ((m.through_distance || 0) >= 5.0 && (m.pass_completed || 0) > 0) b.push("Space Creator");
    if (action.kind === "run_decoy" && (m.defender_pulled || 0) >= 3.5 && (outcome === "goal" || outcome === "kept_ball" || outcome === "rebound")) b.push("Decoy Master");
    if ((m.cleared_overhead || 0) > 0 && (m.pass_completed || 0) > 0) b.push("Aerial Switch");
    if ((m.offside_margin === undefined ? 99.0 : m.offside_margin) <= 6.5 && (outcome === "kept_ball" || outcome === "goal")) b.push("Offside Razor");
    if ((m.forced_wide || 0) > 0 && (outcome === "won_ball" || outcome === "kept_ball")) b.push("Touchline Trap");
    if (start.home_score > start.away_score && start.minute >= 54 && (outcome === "kept_ball" || outcome === "won_ball")) b.push("Game Manager");
    return b;
  }

  function causalFeedback(outcome, action, m, badges, start) {
    if (outcome === "goal") {
      if (badges.indexOf("Decoy Master") !== -1) return "GOAL! Your decoy run dragged the marker and opened the finish.";
      if (badges.indexOf("Space Creator") !== -1) return "GOAL! Great through-ball weight into your runner's stride.";
      return "GOAL! Placed cleanly beyond the goalkeeper's reach.";
    }
    if (outcome === "offside") return "OFFSIDE! You crossed the last defender before the pass left the foot. Hold a split-second longer.";
    if (outcome === "conceded") return "Opponent scored on the counter. Recover goal-side earlier or protect central cover.";
    if (outcome === "intercepted") {
      if (action.loft) return "Lofted ball stayed in the air long enough for the marker to arrive. Try a quicker ground lane or wider target.";
      if ((m.deflected || 0) > 0) return "Clipped by a stretching defender at the edge of the lane. Shift the angle wider or pull them first.";
      return "Defender read that lane and stepped in. Check their cover shadow or switch the angle.";
    }
    if (outcome === "saved") return "Keeper closed down the angle and saved it. Aim for the far corner or square to an open teammate.";
    if (outcome === "rebound") return "Keeper parried into a live rebound! Attack the second ball immediately.";
    if (outcome === "corner") return "Tipped behind for a corner kick! Good pressure on the goalkeeper.";
    if (outcome === "won_ball") {
      if (badges.indexOf("Touchline Trap") !== -1) return "Brilliant defending! You used the touchline as an extra defender and won possession.";
      return "Clean regain! Now scan quickly for an early counter or calm outlet.";
    }
    if (outcome === "out_of_bounds") return "Ball rolled out of play. Dial back the pass weight or aim inside the touchline.";
    if (start.home_score > start.away_score && start.minute >= 54 && outcome === "kept_ball") return "Smart clock management! Keeping calm possession protects your late lead.";
    if (badges.indexOf("Line Breaker") !== -1) return "Line broken! That pass sliced past two defenders and opened the pitch.";
    if (badges.indexOf("Aerial Switch") !== -1) return "Clean loft over the press! You beat the closing defender into open space.";
    if (badges.indexOf("Space Creator") !== -1) return "Nice through-ball! Leading your teammate into space kept their full sprint speed.";
    if (badges.indexOf("Defender Fixer") !== -1) return "You pulled the defender out of shape before releasing. That creates a 2v1 advantage!";
    if (action.kind === "shield") return "You protected the ball while the presser closed in. Release into the newly opened space next.";
    return "Possession kept. Read how the defense shifted and plan your next beat.";
  }

  function evaluateBeat(start, end, action, outcome, m) {
    var badges = detectBadges(start, end, action, outcome, m);
    var fb = causalFeedback(outcome, action, m, badges, start);
    var radar = { vision: 0, spacing: 0, timing: 0, defending: 0 }, stars = 1;
    if (outcome === "goal" || outcome === "won_ball") { stars = 3; radar.timing += 4; radar.vision += 3; if (outcome === "won_ball") radar.defending += 5; }
    else if (outcome === "rebound" || outcome === "corner" || (outcome === "kept_ball" && badges.length)) { stars = 3; radar.vision += 3; radar.spacing += 3; }
    else if (outcome === "kept_ball") { stars = (start.home_score > start.away_score && start.minute >= 54) ? 3 : 2; radar.spacing += 2; }
    else if (outcome === "saved") { stars = 2; radar.timing += 1; }
    if (badges.indexOf("Line Breaker") !== -1 || badges.indexOf("Aerial Switch") !== -1) radar.vision += 3;
    if (badges.indexOf("Defender Fixer") !== -1 || badges.indexOf("Decoy Master") !== -1 || badges.indexOf("Space Creator") !== -1) radar.spacing += 3;
    if (badges.indexOf("Offside Razor") !== -1) radar.timing += 4;
    if (badges.indexOf("Touchline Trap") !== -1) radar.defending += 4;
    return { badges: badges, feedback: fb, stars: stars, radar_delta: radar };
  }

  function simulateBeat(state, action) {
    var cur = Object.assign(cloneObj(state), { event: "live", event_note: "", players: state.players.map(cloneObj), ball: cloneObj(state.ball) });
    cur.ball.offside_keys = (state.ball.offside_keys || []).slice();
    var frames = [snapshot(cur)], metrics = { defender_pulled: 0.0, lines_broken: 0.0, through_distance: 0.0 };
    var you = playerByKey(cur.players, "you"), delay = 2;
    if (you && cur.ball.owner === "you" && (action.kind === "pass" || action.kind === "shoot")) {
      var u = unit(action.tx - you.x, action.ty - you.y, you.hx, you.hy);
      delay = (u[0] * you.hx + u[1] * you.hy) >= -0.25 ? 2 : 5;
    }
    var terminal = null, stops = ["goal", "conceded", "saved", "offside", "out_of_bounds", "corner", "intercepted", "won_ball"];
    for (var step = 1; step <= BEAT_STEPS; step++) {
      var ball = cur.ball, ai = stepAi(cur, action, step);
      if (step === delay && ball.owner === "you" && (action.kind === "pass" || action.kind === "shoot")) {
        var yp = playerByKey(cur.players, "you");
        if (yp) { var lb = launchBall(cur, yp, action); ball = lb.ball; metrics.open_body = lb.openBody ? 1.0 : 0.0; }
      } else if (ai.aiRel && ball.owner === ai.aiRel[0]) {
        var ap = playerByKey(cur.players, ai.aiRel[0]);
        if (ap) ball = launchBall(cur, ap, ai.aiRel[1]).ball;
      }
      var nextPlayers = cur.players.map(function (p) {
        var t = ai.targets[p.key], sc = (p.key === ball.owner && (action.kind === "dribble" || p.team === "away")) ? 0.85 : 1.0;
        if (p.key === "you" && action.kind === "shield") sc = 0.2;
        if (p.team === "away" && cur.opponent_style === "high_press" && p.role !== "gk") sc *= 1.05;
        var mv = steerPlayer(p, t[0], t[1], DT, sc, [ball.x, ball.y]);
        if (cur.build_out_active && p.team === "away" && p.role !== "gk") mv.y = Math.min(mv.y, BUILD_OUT_Y - 1.5);
        return mv;
      });
      if (ball.owner !== null) {
        var h = playerByKey(nextPlayers, ball.owner);
        if (h) ball = Object.assign(cloneObj(ball), { x: h.x, y: h.y, z: 0.0, vx: h.vx, vy: h.vy, vz: 0.0 });
      } else {
        ball = stepBallFlight(ball, DT);
      }
      cur = Object.assign(cloneObj(cur), { players: nextPlayers, ball: ball, build_out_active: cur.build_out_active && step < 6 && ball.y > BUILD_OUT_Y });
      var c1 = checkBallContacts(cur, cur.ball, step, metrics);
      cur.ball = c1.ball;
      var cev = c1.ev;
      if (cev === null) { var c2 = checkTackleOrGoal(cur.players, cur.ball, metrics); cur.ball = c2.ball; cev = c2.ev; }
      if (cev !== null) {
        terminal = cev; cur.event = cev; frames.push(snapshot(cur));
        if (stops.indexOf(cev) !== -1) break;
      } else {
        frames.push(snapshot(cur));
      }
    }
    if (terminal === null) {
      var op = cur.ball.owner ? playerByKey(cur.players, cur.ball.owner) : null;
      terminal = (op && op.team === "home") ? "kept_ball" : (cur.ball.last_team === "home" ? "kept_ball" : "intercepted");
    }
    var endState = Object.assign(cloneObj(cur), {
      home_score: cur.home_score + (terminal === "goal" ? 1 : 0),
      away_score: cur.away_score + (terminal === "conceded" ? 1 : 0),
      beat: state.beat + 1, event: terminal
    });
    var away0 = {};
    state.players.forEach(function (p) { if (p.team === "away" && p.role !== "gk") away0[p.key] = p; });
    endState.players.forEach(function (p) { if (away0[p.key]) metrics.defender_pulled = Math.max(metrics.defender_pulled, dist2(away0[p.key].x, away0[p.key].y, p.x, p.y)); });
    if (endState.ball.owner !== null && endState.ball.last_team === "home") {
      var broken = 0;
      state.players.forEach(function (p) { if (p.team === "away" && p.role !== "gk" && endState.ball.y < p.y && p.y < state.ball.y) broken += 1; });
      metrics.lines_broken = broken;
      var rec0 = playerByKey(state.players, endState.ball.owner), rec1 = playerByKey(endState.players, endState.ball.owner);
      if (rec0 && rec1 && endState.ball.owner !== state.ball.owner) metrics.through_distance = dist2(rec0.x, rec0.y, rec1.x, rec1.y);
      var line = offsideLineY(state);
      if (line !== null && rec0 && rec1 && rec0.y >= line - 0.3 && rec1.y < line) metrics.offside_margin = Math.abs(rec0.y - line);
    }
    var ev = evaluateBeat(state, endState, action, terminal, metrics);
    endState.event_note = ev.feedback;
    return { end_state: endState, frames: frames, outcome: terminal, metrics: metrics,
      badges: ev.badges, feedback: ev.feedback, stars: ev.stars, radar_delta: ev.radar_delta };
  }

  function snapAction(state, rawX, rawY, loft, offballIntent) {
    var tx = clamp(rawX, 2.0, 98.0), ty = clamp(rawY, 0.0, 98.0), you = playerByKey(state.players, "you");
    loft = !!loft; offballIntent = offballIntent || "call";
    if (!you) return { kind: "shield", tx: tx, ty: ty, loft: false, target_key: "" };
    if (state.ball.owner === "you") {
      if (ty <= 9.0 && tx >= 33.0 && tx <= 67.0) return { kind: "shoot", tx: clamp(tx, GOAL_LEFT + 1.0, GOAL_RIGHT - 1.0), ty: 0.0, loft: loft, target_key: "" };
      if (dist2(you.x, you.y, tx, ty) <= 6.0) return { kind: "shield", tx: you.x, ty: you.y, loft: false, target_key: "" };
      var mates = state.players.filter(function (p) { return p.team === "home" && p.key !== "you"; }), near = null, bd = 1e9;
      for (var i = 0; i < mates.length; i++) { var d = dist2(mates[i].x, mates[i].y, tx, ty); if (d < bd) { bd = d; near = mates[i]; } }
      if (near && bd <= 8.0) return { kind: "pass", tx: near.x, ty: near.y, loft: loft, target_key: near.key };
      if (near && bd <= 28.0 && dist2(you.x, you.y, tx, ty) >= 12.0 && ty <= near.y + 4.0) return { kind: "pass", tx: tx, ty: ty, loft: loft, target_key: near.key };
      return { kind: "dribble", tx: clamp(tx, 4.0, 96.0), ty: clamp(ty, 4.0, 96.0), loft: false, target_key: "" };
    }
    var holder = state.ball.owner ? playerByKey(state.players, state.ball.owner) : null;
    if (holder && holder.team === "home") {
      return { kind: offballIntent === "call" ? "run_call" : "run_decoy", tx: clamp(tx, 4.0, 96.0), ty: clamp(ty, 4.0, 96.0), loft: false, target_key: "" };
    }
    return { kind: "defend", tx: clamp(tx, 4.0, 96.0), ty: clamp(ty, 4.0, 96.0), loft: false, target_key: "" };
  }

  function guidedAnchors(state) {
    var you = playerByKey(state.players, "you");
    if (!you) return [];
    var out = [];
    if (state.ball.owner === "you") {
      if (you.y <= 28.0) {
        out.push(["Shoot left", { kind: "shoot", tx: 42.5, ty: 0.0, loft: false, target_key: "" }]);
        out.push(["Shoot right", { kind: "shoot", tx: 57.5, ty: 0.0, loft: false, target_key: "" }]);
      }
      for (var i = 0; i < state.players.length && out.length < 3; i++) {
        var m = state.players[i];
        if (m.team === "home" && m.key !== "you") {
          var ly = clamp(m.y - (m.trait === "speed" ? 10.0 : 0.0), 8.0, 92.0);
          var lbl = (m.trait === "speed" && ly < m.y - 4.0) ? ("Through " + m.name) : ("Pass " + m.name);
          out.push([lbl, { kind: "pass", tx: m.x, ty: ly, loft: false, target_key: m.key }]);
        }
      }
      out.push(["Carry wide", { kind: "dribble", tx: clamp(you.x + (you.x > 50.0 ? -12.0 : 12.0), 10.0, 90.0), ty: clamp(you.y - 10.0, 8.0, 92.0), loft: false, target_key: "" }]);
      return out.slice(0, 4);
    }
    var holder = state.ball.owner ? playerByKey(state.players, state.ball.owner) : null;
    if (holder && holder.team === "home") {
      return [
        ["Call in pocket", { kind: "run_call", tx: clamp(you.x + (you.x > 50.0 ? -10.0 : 10.0), 14.0, 86.0), ty: clamp(you.y - 10.0, 12.0, 84.0), loft: false, target_key: "" }],
        ["Decoy near post", { kind: "run_decoy", tx: clamp(50.0 + (you.x < 50.0 ? -12.0 : 12.0), 20.0, 80.0), ty: clamp(you.y - 14.0, 10.0, 80.0), loft: false, target_key: "" }],
        ["Support behind", { kind: "run_call", tx: clamp(holder.x, 14.0, 86.0), ty: clamp(holder.y + 12.0, 18.0, 90.0), loft: false, target_key: "" }]
      ];
    }
    var bx = state.ball.x, by = state.ball.y;
    return [
      ["Force wide", { kind: "defend", tx: clamp(bx + (bx < 50.0 ? 4.0 : -4.0), 10.0, 90.0), ty: clamp(by + 5.0, 14.0, 92.0), loft: false, target_key: "" }],
      ["Cover center", { kind: "defend", tx: clamp(bx * 0.5 + 25.0, 20.0, 80.0), ty: clamp(by + 11.0, 18.0, 92.0), loft: false, target_key: "" }],
      ["Step to ball", { kind: "defend", tx: clamp(bx, 8.0, 92.0), ty: clamp(by + 1.0, 10.0, 92.0), loft: false, target_key: "" }]
    ];
  }

  return {
    DT: DT, BEAT_STEPS: BEAT_STEPS, GOAL_LEFT: GOAL_LEFT, GOAL_RIGHT: GOAL_RIGHT, BUILD_OUT_Y: BUILD_OUT_Y,
    simulateBeat: simulateBeat, snapAction: snapAction, guidedAnchors: guidedAnchors,
    offsideLineY: offsideLineY, coverShadowTriangle: coverShadowTriangle,
    gkCoverageFan: gkCoverageFan, openPockets: openPockets
  };
});
