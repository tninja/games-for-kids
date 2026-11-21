"""Deterministic 4-role opponent AI and responsive teammate AI for 2D micro-sim."""

from .sim_model import (
    BUILD_OUT_Y,
    GOAL_LEFT,
    GOAL_RIGHT,
    SimAction,
    SimBall,
    SimPlayer,
    SimState,
    clamp,
    dist2,
    seg_dist,
    unit,
)


def _lane_clear(ax: float, ay: float, bx: float, by: float,
                opponents: list[SimPlayer], margin: float = 3.6) -> bool:
    for opp in opponents:
        if seg_dist(ax, ay, bx, by, opp.x, opp.y) < margin:
            return False
    return True


def _away_gk_target(gk: SimPlayer, ball: SimBall) -> tuple[float, float]:
    if ball.owner is None and ball.vy < -12.0 and ball.y < 32.0:
        t_goal = max(0.0, ball.y / max(1.0, -ball.vy))
        shot_x = clamp(ball.x + ball.vx * t_goal, GOAL_LEFT + 1.0, GOAL_RIGHT - 1.0)
        return (shot_x, 3.0)
    tx = clamp(50.0 + (ball.x - 50.0) * 0.34, 42.0, 58.0)
    ty = clamp(3.5 + max(0.0, 34.0 - ball.y) * 0.14, 3.0, 9.5)
    return (tx, ty)


def _home_gk_target(gk: SimPlayer, ball: SimBall) -> tuple[float, float]:
    tx = clamp(50.0 + (ball.x - 50.0) * 0.32, 42.0, 58.0)
    ty = clamp(96.0 - max(0.0, ball.y - 66.0) * 0.14, 90.0, 96.5)
    return (tx, ty)


def _away_attack_decision(carrier: SimPlayer, state: SimState, step: int) -> tuple[tuple[float, float], SimAction | None]:
    home_out = [p for p in state.players if p.team == "home" and p.role != "gk"]
    away_mates = [p for p in state.players if p.team == "away" and p.key != carrier.key and p.role != "gk"]
    if carrier.y >= 74.0 and step >= 10:
        aim_x = 43.0 if carrier.x >= 50.0 else 57.0
        return (carrier.x, carrier.y), SimAction("shoot", aim_x, 100.0)
    nearest_home = min((dist2(carrier.x, carrier.y, h.x, h.y) for h in home_out), default=50.0)
    if nearest_home < 8.5 and step >= 8:
        for mate in away_mates:
            if mate.y > carrier.y + 4.0 and _lane_clear(carrier.x, carrier.y, mate.x, mate.y, home_out, 3.5):
                return (carrier.x, carrier.y), SimAction("pass", mate.x, mate.y, False, mate.key)
    drift = -4.0 if carrier.x > 52.0 else 4.0 if carrier.x < 48.0 else 0.0
    return (clamp(carrier.x + drift, 10.0, 90.0), clamp(carrier.y + 18.0, 8.0, 92.0)), None


def _away_defend_targets(state: SimState) -> dict[str, tuple[float, float]]:
    ball = state.ball
    away_out = [p for p in state.players if p.team == "away" and p.role != "gk"]
    home_out = [p for p in state.players if p.team == "home" and p.role != "gk"]
    ordered = sorted(away_out, key=lambda p: dist2(p.x, p.y, ball.x, ball.y))
    targets: dict[str, tuple[float, float]] = {}
    press_bias = 1.0 if state.opponent_style == "high_press" else 0.72
    for idx, opp in enumerate(ordered):
        if idx == 0:
            side_push = -2.2 if ball.x < 50.0 else 2.2
            tx = clamp(ball.x + side_push * (1.0 - press_bias * 0.5), 6.0, 94.0)
            ty = clamp(ball.y - 1.5, 6.0, 94.0)
        elif idx == 1:
            tx = clamp(ball.x * 0.65 + 50.0 * 0.35, 14.0, 86.0)
            ty = clamp(ball.y - 11.0, 12.0, 88.0)
        else:
            runners = [h for h in home_out if h.key != ball.owner]
            mark = min(runners, key=lambda h: dist2(opp.x, opp.y, h.x, h.y)) if runners else None
            if mark is not None:
                tx = clamp(mark.x * 0.8 + 50.0 * 0.2, 8.0, 92.0)
                ty = clamp(mark.y - 3.5, 10.0, 90.0)
            else:
                tx, ty = opp.x, opp.y
        if state.build_out_active:
            ty = min(ty, BUILD_OUT_Y - 2.0)
        targets[opp.key] = (tx, ty)
    return targets


def _home_carrier_decision(carrier: SimPlayer, state: SimState, action: SimAction, step: int) -> tuple[tuple[float, float], SimAction | None]:
    away_out = [p for p in state.players if p.team == "away" and p.role != "gk"]
    release_step = 5 if carrier.trait == "playmaker" else 8
    if step != release_step:
        return (carrier.x, clamp(carrier.y - 4.0, 10.0, 92.0)), None
    you = next(p for p in state.players if p.key == "you")
    if action.kind == "run_call":
        lead_x = clamp((you.x + action.tx) * 0.5, 6.0, 94.0)
        lead_y = clamp((you.y + action.ty) * 0.5, 6.0, 94.0)
        if _lane_clear(carrier.x, carrier.y, lead_x, lead_y, away_out, 3.2):
            return (carrier.x, carrier.y), SimAction("pass", lead_x, lead_y, False, "you")
    if carrier.y <= 26.0:
        gk = next((p for p in state.players if p.team == "away" and p.role == "gk"), None)
        aim_x = 43.0 if (gk is not None and gk.x >= 50.0) else 57.0
        if _lane_clear(carrier.x, carrier.y, aim_x, 0.0, away_out, 3.0):
            return (carrier.x, carrier.y), SimAction("shoot", aim_x, 0.0)
    mates = [p for p in state.players if p.team == "home" and p.key not in (carrier.key, "you") and p.role != "gk"]
    best = sorted(mates, key=lambda m: m.y)
    for mate in best:
        lead_y = clamp(mate.y - (7.0 if mate.trait == "speed" else 2.0), 8.0, 90.0)
        if _lane_clear(carrier.x, carrier.y, mate.x, lead_y, away_out, 3.4):
            return (carrier.x, carrier.y), SimAction("pass", mate.x, lead_y, False, mate.key)
    return (carrier.x, clamp(carrier.y - 5.0, 10.0, 92.0)), None


def _home_support_target(mate: SimPlayer, state: SimState) -> tuple[float, float]:
    ball = state.ball
    if ball.owner is None and ball.target_key == mate.key:
        t_lead = 0.45
        return (clamp(ball.x + ball.vx * t_lead, 6.0, 94.0), clamp(ball.y + ball.vy * t_lead, 6.0, 94.0))
    if mate.trait == "speed":
        tx = 16.0 if mate.x < 50.0 else 84.0
        return (tx, clamp(min(mate.y, ball.y - 10.0), 12.0, 76.0))
    if mate.trait == "playmaker":
        return (clamp(50.0 + (ball.x - 50.0) * 0.25, 30.0, 70.0), clamp(ball.y - 8.0, 16.0, 78.0))
    return (clamp(mate.x * 0.7 + ball.x * 0.3, 18.0, 82.0), clamp(ball.y + 12.0, 22.0, 86.0))


def step_ai(state: SimState, action: SimAction, step: int) -> tuple[dict[str, tuple[float, float]], tuple[str, SimAction] | None]:
    targets: dict[str, tuple[float, float]] = {}
    ai_release: tuple[str, SimAction] | None = None
    ball = state.ball
    away_def = _away_defend_targets(state) if ball.owner is None or any(
        p.key == ball.owner and p.team == "home" for p in state.players) else {}
    for p in state.players:
        if p.key == "you":
            targets[p.key] = (action.tx, action.ty) if action.kind in ("dribble", "run_call", "run_decoy", "defend") else (p.x, p.y)
        elif p.role == "gk":
            targets[p.key] = _away_gk_target(p, ball) if p.team == "away" else _home_gk_target(p, ball)
        elif p.team == "away":
            if ball.owner == p.key:
                tgt, rel = _away_attack_decision(p, state, step)
                targets[p.key] = tgt
                if rel is not None and ai_release is None:
                    ai_release = (p.key, rel)
            elif p.key in away_def:
                targets[p.key] = away_def[p.key]
            else:
                targets[p.key] = (clamp(p.x, 12.0, 88.0), clamp(ball.y + 12.0, 14.0, 90.0))
        else:
            if ball.owner == p.key:
                tgt, rel = _home_carrier_decision(p, state, action, step)
                targets[p.key] = tgt
                if rel is not None and ai_release is None:
                    ai_release = (p.key, rel)
            else:
                targets[p.key] = _home_support_target(p, state)
    return targets, ai_release


def steer_player(p: SimPlayer, tx: float, ty: float, dt: float,
                 speed_scale: float = 1.0, ball_pos: tuple[float, float] | None = None) -> SimPlayer:
    dx, dy = tx - p.x, ty - p.y
    distance = dist2(p.x, p.y, tx, ty)
    cap = p.max_speed * speed_scale
    if distance < 0.6:
        vx, vy = 0.0, 0.0
    else:
        ux, uy = unit(dx, dy, p.hx, p.hy)
        speed = min(cap, distance / dt)
        vx, vy = ux * speed, uy * speed
    nx = clamp(p.x + vx * dt, 2.0, 98.0)
    ny = clamp(p.y + vy * dt, 2.0, 98.0)
    if distance >= 0.8:
        hx, hy = unit(dx, dy, p.hx, p.hy)
    elif ball_pos is not None:
        hx, hy = unit(ball_pos[0] - nx, ball_pos[1] - ny, p.hx, p.hy)
    else:
        hx, hy = p.hx, p.hy
    return SimPlayer(p.key, p.name, p.number, p.team, p.role, p.trait,
                     nx, ny, vx, vy, hx, hy, p.max_speed)
