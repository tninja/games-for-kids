"""Pure deterministic 2D tactical micro-simulator kernel (mirrored 1-to-1 in JS)."""

from dataclasses import replace

from .sim_ai import steer_player, step_ai
from .sim_eval import evaluate_beat
from .sim_model import (
    BEAT_STEPS,
    BUILD_OUT_Y,
    DT,
    GOAL_LEFT,
    GOAL_RIGHT,
    BeatResult,
    SimAction,
    SimBall,
    SimFrame,
    SimPlayer,
    SimState,
    clamp,
    dist2,
    offside_line_y,
    player_by_key,
    unit,
)


def _snapshot(state: SimState) -> SimFrame:
    pts = tuple((p.key, round(p.x, 3), round(p.y, 3), round(p.hx, 3), round(p.hy, 3)) for p in state.players)
    ball = (round(state.ball.x, 3), round(state.ball.y, 3), round(state.ball.z, 3))
    return SimFrame(pts, ball, offside_line_y(state), state.build_out_active, state.event)


def _launch_ball(state: SimState, passer: SimPlayer, action: SimAction) -> tuple[SimBall, bool]:
    ux, uy = unit(action.tx - passer.x, action.ty - passer.y, passer.hx, passer.hy)
    open_body = (ux * passer.hx + uy * passer.hy) >= -0.25
    distance = max(2.0, dist2(passer.x, passer.y, action.tx, action.ty))
    if action.kind == "shoot":
        speed = 50.0 if not action.loft else 38.0
        vz = 16.0 if action.loft else 2.5
    elif action.loft:
        speed = clamp(distance * 1.45, 24.0, 44.0)
        vz = clamp(distance * 0.55, 16.0, 26.0)
    else:
        speed = clamp(distance * 1.85, 28.0, 46.0)
        vz = 0.0
    line = offside_line_y(state)
    offside_keys: list[str] = []
    if line is not None and passer.team == "home":
        for p in state.players:
            if p.team == "home" and p.key != passer.key and p.y < line - 0.4:
                offside_keys.append(p.key)
    ball = SimBall(passer.x, passer.y, 2.5 if action.loft else 0.0, ux * speed, uy * speed, vz,
                   None, passer.team, action.loft, passer.y, tuple(offside_keys), action.target_key, passer.key)
    return ball, open_body


def _step_ball_flight(ball: SimBall, dt: float) -> SimBall:
    nx = ball.x + ball.vx * dt
    ny = ball.y + ball.vy * dt
    nz = ball.z + ball.vz * dt
    nvz = ball.vz - 28.0 * dt if (ball.z > 0.0 or ball.vz > 0.0) else 0.0
    if nz <= 0.0:
        nz, nvz = 0.0, 0.0
    drag = 0.992 if nz > 0.5 else 0.968
    return replace(ball, x=nx, y=ny, z=nz, vx=ball.vx * drag, vy=ball.vy * drag, vz=nvz)


def _check_gk_contact(p: SimPlayer, ball: SimBall, d: float,
                      metrics: dict[str, float]) -> tuple[SimBall, str | None] | None:
    if d <= 3.4:
        return replace(ball, x=p.x, y=p.y, z=0.0, vx=0.0, vy=0.0, vz=0.0, owner=p.key, last_team=p.team, passer_key=""), "saved"
    if d <= 4.8 and ball.vy < -10.0:
        metrics["rebound"] = 1.0
        if abs(ball.x - 50.0) > 8.0:
            return replace(ball, x=clamp(ball.x, 4.0, 96.0), y=1.0, vx=0.0, vy=0.0, vz=0.0), "corner"
        return replace(ball, vx=-ball.vx * 0.25 + (6.0 if ball.x < 50.0 else -6.0), vy=10.0, vz=2.0), "rebound"
    return None


def _check_ball_contacts(state: SimState, ball: SimBall, step: int,
                         metrics: dict[str, float]) -> tuple[SimBall, str | None]:
    if ball.owner is not None:
        return ball, None
    for p in state.players:
        d = dist2(p.x, p.y, ball.x, ball.y)
        if p.team != ball.last_team and ball.z > 6.5 and d < 4.5:
            metrics["cleared_overhead"] = 1.0
        if ball.z > 6.5:
            continue
        if p.role == "gk" and p.team != ball.last_team:
            gk_hit = _check_gk_contact(p, ball, d, metrics)
            if gk_hit is not None:
                return gk_hit
        elif p.team != ball.last_team:
            reach = 2.2 if p.trait != "anchor" else 2.8
            if d <= reach:
                ev = "won_ball" if p.team == "home" else "intercepted"
                return replace(ball, x=p.x, y=p.y, z=0.0, vx=0.0, vy=0.0, vz=0.0, owner=p.key, last_team=p.team, passer_key=""), ev
            if d <= reach + 0.8 and step >= 4 and metrics.get("deflected", 0.0) == 0.0:
                metrics["deflected"] = 1.0
                return replace(ball, vx=ball.vx * 0.45 + (4.0 if p.x < ball.x else -4.0), vy=ball.vy * 0.45), None
        elif p.key != ball.passer_key and d <= 3.4:
            if p.key in ball.offside_keys:
                return replace(ball, x=p.x, y=p.y, z=0.0, vx=0.0, vy=0.0, vz=0.0, owner=p.key, passer_key=""), "offside"
            metrics["pass_completed"] = 1.0
            return replace(ball, x=p.x, y=p.y, z=0.0, vx=0.0, vy=0.0, vz=0.0, owner=p.key, offside_keys=(), passer_key=""), None
    return ball, None


def _check_tackle_or_goal(players: tuple[SimPlayer, ...], ball: SimBall,
                          metrics: dict[str, float]) -> tuple[SimBall, str | None]:
    if ball.owner is None:
        if ball.y <= 0.6 and GOAL_LEFT <= ball.x <= GOAL_RIGHT:
            return replace(ball, y=0.0, vx=0.0, vy=0.0, vz=0.0), "goal"
        if ball.y >= 99.4 and GOAL_LEFT <= ball.x <= GOAL_RIGHT:
            return replace(ball, y=100.0, vx=0.0, vy=0.0, vz=0.0), "conceded"
        if ball.x < 1.0 or ball.x > 99.0 or ball.y < 0.0 or ball.y > 100.0:
            return replace(ball, x=clamp(ball.x, 1.0, 99.0), y=clamp(ball.y, 1.0, 99.0), vx=0.0, vy=0.0, vz=0.0), "out_of_bounds"
        return ball, None
    holder = player_by_key(players, ball.owner)
    if holder is None:
        return ball, None
    for opp in players:
        if opp.team != holder.team and opp.role != "gk":
            reach = 2.8 if opp.team == "home" else 2.1
            if dist2(opp.x, opp.y, holder.x, holder.y) <= reach:
                if holder.team == "away" and (holder.x < 18.0 or holder.x > 82.0):
                    metrics["forced_wide"] = 1.0
                return replace(ball, x=opp.x, y=opp.y, z=0.0, owner=opp.key, last_team=opp.team, passer_key=""), (
                    "won_ball" if opp.team == "home" else "intercepted"
                )
    return ball, None


def _update_metrics(start: SimState, end: SimState, action: SimAction, metrics: dict[str, float]) -> None:
    away0 = {p.key: p for p in start.players if p.team == "away" and p.role != "gk"}
    for p in end.players:
        if p.key in away0:
            moved = dist2(away0[p.key].x, away0[p.key].y, p.x, p.y)
            metrics["defender_pulled"] = max(metrics.get("defender_pulled", 0.0), moved)
    if end.ball.owner is not None and end.ball.last_team == "home":
        start_y = start.ball.y
        end_y = end.ball.y
        broken = sum(1 for p in start.players if p.team == "away" and p.role != "gk" and end_y < p.y < start_y)
        metrics["lines_broken"] = float(broken)
        rec = player_by_key(start.players, end.ball.owner)
        rec_end = player_by_key(end.players, end.ball.owner)
        if rec is not None and rec_end is not None and end.ball.owner != start.ball.owner:
            metrics["through_distance"] = dist2(rec.x, rec.y, rec_end.x, rec_end.y)
        line = offside_line_y(start)
        if line is not None and rec is not None and rec.y >= line - 0.3 and rec_end is not None and rec_end.y < line:
            metrics["offside_margin"] = abs(rec.y - line)


def _step_players(cur: SimState, targets: dict[str, tuple[float, float]],
                  action: SimAction, ball: SimBall) -> tuple[SimPlayer, ...]:
    next_players: list[SimPlayer] = []
    for p in cur.players:
        tx, ty = targets[p.key]
        scale = 0.85 if (p.key == ball.owner and (action.kind == "dribble" or p.team == "away")) else 1.0
        if p.key == "you" and action.kind == "shield":
            scale = 0.2
        if p.team == "away" and cur.opponent_style == "high_press" and p.role != "gk":
            scale *= 1.05
        moved = steer_player(p, tx, ty, DT, scale, (ball.x, ball.y))
        if cur.build_out_active and p.team == "away" and p.role != "gk":
            moved = replace(moved, y=min(moved.y, BUILD_OUT_Y - 1.5))
        next_players.append(moved)
    return tuple(next_players)


def _step_tick(cur: SimState, action: SimAction, step: int, delay: int,
               metrics: dict[str, float]) -> tuple[SimState, str | None]:
    ball = cur.ball
    targets, ai_rel = step_ai(cur, action, step)
    if step == delay and ball.owner == "you" and action.kind in ("pass", "shoot"):
        passer = player_by_key(cur.players, "you")
        if passer is not None:
            ball, open_body = _launch_ball(cur, passer, action)
            metrics["open_body"] = 1.0 if open_body else 0.0
    elif ai_rel is not None and ball.owner == ai_rel[0]:
        passer = player_by_key(cur.players, ai_rel[0])
        if passer is not None:
            ball, _ = _launch_ball(cur, passer, ai_rel[1])
    next_players = _step_players(cur, targets, action, ball)
    if ball.owner is not None:
        holder = player_by_key(next_players, ball.owner)
        if holder is not None:
            ball = replace(ball, x=holder.x, y=holder.y, z=0.0, vx=holder.vx, vy=holder.vy, vz=0.0)
    else:
        ball = _step_ball_flight(ball, DT)
    build_out = cur.build_out_active and step < 6 and ball.y > BUILD_OUT_Y
    nxt = replace(cur, players=next_players, ball=ball, build_out_active=build_out)
    ball, ev = _check_ball_contacts(nxt, nxt.ball, step, metrics)
    nxt = replace(nxt, ball=ball)
    if ev is None:
        ball, ev = _check_tackle_or_goal(nxt.players, nxt.ball, metrics)
        nxt = replace(nxt, ball=ball)
    return nxt, ev


def simulate_beat(state: SimState, action: SimAction) -> BeatResult:
    cur = replace(state, event="live", event_note="")
    frames: list[SimFrame] = [_snapshot(cur)]
    metrics: dict[str, float] = {"defender_pulled": 0.0, "lines_broken": 0.0, "through_distance": 0.0}
    you = player_by_key(cur.players, "you")
    delay = 2
    if you is not None and cur.ball.owner == "you" and action.kind in ("pass", "shoot"):
        ux, uy = unit(action.tx - you.x, action.ty - you.y, you.hx, you.hy)
        delay = 2 if (ux * you.hx + uy * you.hy) >= -0.25 else 5
    terminal: str | None = None
    stops = ("goal", "conceded", "saved", "offside", "out_of_bounds", "corner", "intercepted", "won_ball")
    for step in range(1, BEAT_STEPS + 1):
        cur, ev = _step_tick(cur, action, step, delay, metrics)
        if ev is not None:
            terminal = ev
            cur = replace(cur, event=ev)
            frames.append(_snapshot(cur))
            if ev in stops:
                break
        else:
            frames.append(_snapshot(cur))
    if terminal is None:
        owner_p = player_by_key(cur.players, cur.ball.owner) if cur.ball.owner else None
        terminal = "kept_ball" if ((owner_p is not None and owner_p.team == "home") or cur.ball.last_team == "home") else "intercepted"
    home_s = cur.home_score + (1 if terminal == "goal" else 0)
    away_s = cur.away_score + (1 if terminal == "conceded" else 0)
    end_state = replace(cur, home_score=home_s, away_score=away_s, beat=state.beat + 1, event=terminal)
    _update_metrics(state, end_state, action, metrics)
    badges, feedback, stars, radar = evaluate_beat(state, end_state, action, terminal, metrics)
    end_state = replace(end_state, event_note=feedback)
    return BeatResult(end_state, tuple(frames), terminal, metrics, badges, feedback, stars, radar)


def snap_action(state: SimState, raw_x: float, raw_y: float,
                loft: bool = False, offball_intent: str = "call") -> SimAction:
    tx, ty = clamp(raw_x, 2.0, 98.0), clamp(raw_y, 0.0, 98.0)
    you = player_by_key(state.players, "you")
    if you is None:
        return SimAction("shield", tx, ty)
    if state.ball.owner == "you":
        if ty <= 9.0 and 33.0 <= tx <= 67.0:
            return SimAction("shoot", clamp(tx, GOAL_LEFT + 1.0, GOAL_RIGHT - 1.0), 0.0, loft)
        if dist2(you.x, you.y, tx, ty) <= 6.0:
            return SimAction("shield", you.x, you.y, False)
        mates = [p for p in state.players if p.team == "home" and p.key != "you"]
        near = min(mates, key=lambda m: dist2(m.x, m.y, tx, ty)) if mates else None
        if near is not None and dist2(near.x, near.y, tx, ty) <= 8.0:
            return SimAction("pass", near.x, near.y, loft, near.key)
        if near is not None and dist2(near.x, near.y, tx, ty) <= 28.0 and dist2(you.x, you.y, tx, ty) >= 12.0 and ty <= near.y + 4.0:
            return SimAction("pass", tx, ty, loft, near.key)
        return SimAction("dribble", clamp(tx, 4.0, 96.0), clamp(ty, 4.0, 96.0), False)
    holder = player_by_key(state.players, state.ball.owner) if state.ball.owner else None
    if holder is not None and holder.team == "home":
        kind = "run_call" if offball_intent == "call" else "run_decoy"
        return SimAction(kind, clamp(tx, 4.0, 96.0), clamp(ty, 4.0, 96.0), False)
    return SimAction("defend", clamp(tx, 4.0, 96.0), clamp(ty, 4.0, 96.0), False)


def guided_anchors(state: SimState) -> tuple[tuple[str, SimAction], ...]:
    you = player_by_key(state.players, "you")
    if you is None:
        return ()
    out: list[tuple[str, SimAction]] = []
    if state.ball.owner == "you":
        if you.y <= 28.0:
            out.append(("Shoot left", SimAction("shoot", 42.5, 0.0)))
            out.append(("Shoot right", SimAction("shoot", 57.5, 0.0)))
        for mate in state.players:
            if mate.team == "home" and mate.key != "you" and len(out) < 3:
                lead_y = clamp(mate.y - (10.0 if mate.trait == "speed" else 0.0), 8.0, 92.0)
                lbl = f"Through {mate.name}" if mate.trait == "speed" and lead_y < mate.y - 4.0 else f"Pass {mate.name}"
                out.append((lbl, SimAction("pass", mate.x, lead_y, False, mate.key)))
        carry_x = clamp(you.x + (-12.0 if you.x > 50.0 else 12.0), 10.0, 90.0)
        out.append(("Carry wide", SimAction("dribble", carry_x, clamp(you.y - 10.0, 8.0, 92.0))))
        return tuple(out[:4])
    holder = player_by_key(state.players, state.ball.owner) if state.ball.owner else None
    if holder is not None and holder.team == "home":
        return (
            ("Call in pocket", SimAction("run_call", clamp(you.x + (-10.0 if you.x > 50.0 else 10.0), 14.0, 86.0), clamp(you.y - 10.0, 12.0, 84.0))),
            ("Decoy near post", SimAction("run_decoy", clamp(50.0 + (-12.0 if you.x < 50.0 else 12.0), 20.0, 80.0), clamp(you.y - 14.0, 10.0, 80.0))),
            ("Support behind", SimAction("run_call", clamp(holder.x, 14.0, 86.0), clamp(holder.y + 12.0, 18.0, 90.0))),
        )
    bx, by = state.ball.x, state.ball.y
    return (
        ("Force wide", SimAction("defend", clamp(bx + (4.0 if bx < 50.0 else -4.0), 10.0, 90.0), clamp(by + 5.0, 14.0, 92.0))),
        ("Cover center", SimAction("defend", clamp(bx * 0.5 + 25.0, 20.0, 80.0), clamp(by + 11.0, 18.0, 92.0))),
        ("Step to ball", SimAction("defend", clamp(bx, 8.0, 92.0), clamp(by + 1.0, 10.0, 92.0))),
    )
