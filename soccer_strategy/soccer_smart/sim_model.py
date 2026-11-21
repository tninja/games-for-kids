"""Pure deterministic data model and Pro Vision geometry for 2D tactical micro-sim."""

from dataclasses import dataclass, field
from math import hypot

DT = 0.04
BEAT_STEPS = 35
GOAL_LEFT = 39.0
GOAL_RIGHT = 61.0
BUILD_OUT_Y = 65.0


def clamp(value: float, lo: float, hi: float) -> float:
    return lo if value < lo else hi if value > hi else value


def dist2(ax: float, ay: float, bx: float, by: float) -> float:
    return hypot(bx - ax, by - ay)


def unit(dx: float, dy: float, fx: float = 0.0, fy: float = -1.0) -> tuple[float, float]:
    mag = hypot(dx, dy)
    return (fx, fy) if mag < 1e-6 else (dx / mag, dy / mag)


def seg_dist(ax: float, ay: float, bx: float, by: float, px: float, py: float) -> float:
    dx, dy = bx - ax, by - ay
    denom = dx * dx + dy * dy
    if denom < 1e-6:
        return hypot(px - ax, py - ay)
    t = clamp(((px - ax) * dx + (py - ay) * dy) / denom, 0.0, 1.0)
    return hypot(px - (ax + dx * t), py - (ay + dy * t))


@dataclass(frozen=True)
class SimPlayer:
    key: str
    name: str
    number: int
    team: str
    role: str
    trait: str
    x: float
    y: float
    vx: float = 0.0
    vy: float = 0.0
    hx: float = 0.0
    hy: float = -1.0
    max_speed: float = 17.5


@dataclass(frozen=True)
class SimBall:
    x: float
    y: float
    z: float = 0.0
    vx: float = 0.0
    vy: float = 0.0
    vz: float = 0.0
    owner: str | None = "you"
    last_team: str = "home"
    lofted: bool = False
    release_y: float = 50.0
    offside_keys: tuple[str, ...] = ()
    target_key: str = ""
    passer_key: str = ""


@dataclass(frozen=True)
class SimAction:
    kind: str
    tx: float
    ty: float
    loft: bool = False
    target_key: str = ""


@dataclass(frozen=True)
class SimState:
    players: tuple[SimPlayer, ...]
    ball: SimBall
    rules_mode: str = "7v7"
    build_out_active: bool = False
    offside_on: bool = False
    opponent_style: str = "balanced"
    minute: int = 12
    home_score: int = 0
    away_score: int = 0
    beat: int = 0
    event: str = "live"
    event_note: str = ""
    set_piece: str = ""


@dataclass(frozen=True)
class SimFrame:
    players: tuple[tuple[str, float, float, float, float], ...]
    ball: tuple[float, float, float]
    offside_line: float | None
    build_out_active: bool
    event: str


@dataclass(frozen=True)
class BeatResult:
    end_state: SimState
    frames: tuple[SimFrame, ...]
    outcome: str
    metrics: dict[str, float] = field(default_factory=dict)
    badges: tuple[str, ...] = ()
    feedback: str = ""
    stars: int = 2
    radar_delta: dict[str, int] = field(default_factory=dict)


def player_by_key(players: tuple[SimPlayer, ...], key: str) -> SimPlayer | None:
    for p in players:
        if p.key == key:
            return p
    return None


def offside_line_y(state: SimState) -> float | None:
    if not state.offside_on or state.set_piece in ("throw_in", "corner", "goal_kick"):
        return None
    away_ys = sorted(p.y for p in state.players if p.team == "away")
    second_last = away_ys[1] if len(away_ys) >= 2 else (away_ys[0] if away_ys else 50.0)
    return min(50.0, state.ball.y, second_last)


def cover_shadow_triangle(bx: float, by: float, dx: float, dy: float,
                          length: float = 22.0, half_w: float = 5.0) -> tuple[tuple[float, float], ...]:
    ux, uy = unit(dx - bx, dy - by, 0.0, -1.0)
    px, py = -uy, ux
    ex, ey = clamp(dx + ux * length, 0.0, 100.0), clamp(dy + uy * length, 0.0, 100.0)
    left = (clamp(ex + px * half_w, 0.0, 100.0), clamp(ey + py * half_w, 0.0, 100.0))
    right = (clamp(ex - px * half_w, 0.0, 100.0), clamp(ey - py * half_w, 0.0, 100.0))
    return ((dx, dy), left, right)


def gk_coverage_fan(state: SimState) -> tuple[tuple[float, float], ...] | None:
    gk = next((p for p in state.players if p.team == "away" and p.role == "gk"), None)
    if gk is None:
        return None
    bx, by = state.ball.x, state.ball.y
    ux, uy = unit(bx - gk.x, by - gk.y, 0.0, 1.0)
    px, py = -uy, ux
    reach = 6.5
    left = (clamp(gk.x + ux * 10.0 + px * reach, 28.0, 72.0), clamp(gk.y + uy * 10.0 + py * reach, 0.0, 35.0))
    right = (clamp(gk.x + ux * 10.0 - px * reach, 28.0, 72.0), clamp(gk.y + uy * 10.0 - py * reach, 0.0, 35.0))
    return ((gk.x, gk.y), left, right)


def open_pockets(state: SimState) -> tuple[tuple[float, float], ...]:
    away = [p for p in state.players if p.team == "away" and p.role != "gk"]
    bx, by = state.ball.x, state.ball.y
    candidates = [
        (clamp(bx - 18.0, 12.0, 88.0), clamp(by - 14.0, 14.0, 86.0)),
        (clamp(bx + 18.0, 12.0, 88.0), clamp(by - 14.0, 14.0, 86.0)),
        (50.0, clamp(by - 18.0, 14.0, 84.0)),
        (22.0, clamp(by - 6.0, 16.0, 84.0)),
        (78.0, clamp(by - 6.0, 16.0, 84.0)),
    ]
    result: list[tuple[float, float]] = []
    for cx, cy in candidates:
        if all(dist2(cx, cy, a.x, a.y) >= 11.0 for a in away):
            result.append((cx, cy))
        if len(result) >= 3:
            break
    return tuple(result)
