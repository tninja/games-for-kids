"""Desktop Pygame views for Match Day Cup, Pro Vision X-Ray, and pitch gestures."""

import pygame

from .campaign import all_matches
from .drawing import (
    CORAL,
    GOLD,
    GREEN,
    INK,
    MUTED,
    NAVY,
    PITCH,
    Button,
    Painter,
    arrow,
    dashed_arrow,
    draw_ball,
    draw_player,
    pitch_point,
)
from .match_session import MatchSession
from .sim_kernel import guided_anchors
from .sim_model import (
    BUILD_OUT_Y,
    SimAction,
    SimPlayer,
    SimState,
    clamp,
    cover_shadow_triangle,
    gk_coverage_fan,
    offside_line_y,
    open_pockets,
    player_by_key,
)
from .storage import ProgressStore

CYAN = (108, 224, 240)
BANNER_TEXT = {
    "goal": ("GOAL!!", GREEN),
    "won_ball": ("CLEAN REGAIN!", GREEN),
    "rebound": ("REBOUND!", GOLD),
    "corner": ("CORNER KICK!", GOLD),
    "saved": ("KEEPER SAVE!", GOLD),
    "offside": ("OFFSIDE FLAG!", CORAL),
    "intercepted": ("INTERCEPTED!", CORAL),
    "conceded": ("CONCEDED!", CORAL),
    "out_of_bounds": ("OUT OF PLAY", GOLD),
    "kept_ball": ("NICE PLAY!", GREEN),
}


def screen_to_pitch(pos: tuple[int, int]) -> tuple[float, float] | None:
    if not PITCH.collidepoint(pos):
        return None
    px = clamp((pos[0] - PITCH.x) * 100.0 / PITCH.width, 0.0, 100.0)
    py = clamp((pos[1] - PITCH.y) * 100.0 / PITCH.height, 0.0, 100.0)
    return (px, py)


class MatchBrowser:
    def __init__(self, store: ProgressStore):
        self.store = store
        self.matches = all_matches()

    def number_action(self, number: int) -> str | None:
        if 0 <= number < len(self.matches):
            return f"match_start:{self.matches[number].id}"
        return None

    def buttons(self) -> list[Button]:
        rows: list[Button] = []
        results = self.store.data["match_results"]
        for i, m in enumerate(self.matches):
            rec = results.get(m.id, {})
            stars = "*" * int(rec.get("stars", 0))
            tag = f"[{m.rules_mode}] {stars}".strip()
            rows.append(Button(pygame.Rect(814, 286 + i * 68, 410, 60),
                               f"{m.title}\n{tag} / {m.opponent_style.replace('_', ' ')}",
                               f"match_start:{m.id}", str(i + 1)))
        tier = self.store.data.get("rules_tier", "7v7")
        rows.append(Button(pygame.Rect(814, 704, 198, 48), f"Rules: {tier.upper()} / T", "match_tier"))
        rows.append(Button(pygame.Rect(1024, 704, 200, 48), "Main menu / Esc", "menu"))
        return rows

    def draw(self, p: Painter) -> None:
        p.text("MATCH DAY CUP", pygame.Rect(814, 158, 410, 44), 38, GREEN)
        p.text("Freeze-frame 2D tactics. Tap or drag the pitch to pass, run, loft, or shoot!",
               pygame.Rect(814, 206, 410, 72), 22, MUTED)
        radar = self.store.data["radar"]
        p.text("SOCCER IQ RADAR", pygame.Rect(80, 210, 420, 36), 30, GOLD)
        for i, (axis, val) in enumerate(radar.items()):
            y = 266 + i * 54
            p.text(f"{axis.upper()}: {val}", pygame.Rect(84, y, 180, 28), 23, INK)
            bar = pygame.Rect(264, y + 4, 340, 20)
            pygame.draw.rect(p.surface, NAVY, bar, border_radius=8)
            fill = pygame.Rect(264, y + 4, max(8, int(340 * val / 100)), 20)
            pygame.draw.rect(p.surface, GREEN if val >= 60 else GOLD, fill, border_radius=8)
        badges = self.store.data.get("badges", [])
        badge_line = ", ".join(badges[:6]) if badges else "Play Match Day to earn tactical badges!"
        p.text("TACTICAL BADGES", pygame.Rect(80, 504, 420, 32), 26, GOLD)
        p.text(badge_line, pygame.Rect(84, 544, 620, 90), 23, GREEN if badges else MUTED)
        p.text("Squad: YOU #8 / Maya #7 (Speed) / Leo #10 (Playmaker) / Sam #4 (Anchor)",
               pygame.Rect(74, 678, 646, 62), 22, INK)


def _draw_dashed_line(surface: pygame.Surface, y_val: float, color: tuple[int, int, int], label: str, p: Painter) -> None:
    y = pitch_point((0.0, y_val))[1]
    for x in range(PITCH.left + 6, PITCH.right - 12, 22):
        pygame.draw.line(surface, color, (x, y), (min(x + 12, PITCH.right - 4), y), 3)
    p.text(label, pygame.Rect(PITCH.left + 10, max(PITCH.top + 4, y - 22), 220, 22), 19, color)


def _draw_pro_vision(p: Painter, state: SimState) -> None:
    overlay = pygame.Surface(p.surface.get_size(), pygame.SRCALPHA)
    bx, by = state.ball.x, state.ball.y
    for actor in state.players:
        if actor.team == "away" and actor.role != "gk":
            tri = [pitch_point(pt) for pt in cover_shadow_triangle(bx, by, actor.x, actor.y)]
            pygame.draw.polygon(overlay, (249, 143, 121, 68), tri)
    fan = gk_coverage_fan(state)
    if fan is not None:
        pygame.draw.polygon(overlay, (255, 207, 107, 72), [pitch_point(pt) for pt in fan])
    for pocket in open_pockets(state):
        pygame.draw.circle(overlay, (159, 235, 164, 90), pitch_point(pocket), 22)
        pygame.draw.circle(overlay, (159, 235, 164, 210), pitch_point(pocket), 22, 2)
    p.surface.blit(overlay, (0, 0))


def _draw_preview(p: Painter, state: SimState, action: SimAction) -> None:
    you = player_by_key(state.players, "you")
    if you is None:
        return
    start = pitch_point((you.x, you.y))
    end = pitch_point((action.tx, action.ty))
    color = CYAN if action.kind == "run_decoy" else GREEN if action.kind == "run_call" else GOLD
    if action.loft or action.kind in ("run_call", "run_decoy", "defend"):
        dashed_arrow(p.surface, start, end, color)
    else:
        arrow(p.surface, start, end, color)
    if action.kind == "pass" and action.target_key:
        mate = player_by_key(state.players, action.target_key)
        if mate is not None and (abs(mate.x - action.tx) > 3.0 or abs(mate.y - action.ty) > 3.0):
            dashed_arrow(p.surface, pitch_point((mate.x, mate.y)), end, GREEN)


def _draw_anchors(p: Painter, session: MatchSession) -> None:
    if not session.moment.guided or session.phase != "freeze":
        return
    for i, (_, act) in enumerate(guided_anchors(session.state)):
        pt = pitch_point((act.tx, act.ty))
        pygame.draw.circle(p.surface, GOLD, pt, 16, 2)
        p.text(str(i + 1), pygame.Rect(pt[0] - 6, pt[1] - 10, 18, 22), 20, GOLD)


def _draw_trail(p: Painter, session: MatchSession) -> None:
    res = session.active_result
    if res is None or session.phase not in ("resolve", "coach", "review"):
        return
    pts = [pitch_point((f.ball[0], f.ball[1])) for f in res.frames]
    if len(pts) >= 2:
        pygame.draw.lines(p.surface, GOLD, False, pts, 3)


def _draw_pitch_entities(p: Painter, session: MatchSession) -> None:
    st = session.state
    frame = session.current_frame
    if st.rules_mode == "7v7" and frame.build_out_active:
        _draw_dashed_line(p.surface, BUILD_OUT_Y, CYAN, "BUILD-OUT LINE", p)
    line = frame.offside_line if frame.offside_line is not None else offside_line_y(st)
    if line is not None:
        _draw_dashed_line(p.surface, line, CORAL, "OFFSIDE LINE", p)
    if session.pro_vision:
        _draw_pro_vision(p, st)
    _draw_trail(p, session)
    _draw_anchors(p, session)
    by_key: dict[str, SimPlayer] = {pl.key: pl for pl in st.players}
    for key, x, y, hx, hy in frame.players:
        pl = by_key[key]
        team = "keeper" if pl.role == "gk" else pl.team
        tag = f"{pl.name} #{pl.number}" if pl.key != "you" else "JOHN"
        draw_player(p, (x, y), tag, team, (hx, hy))
    bx, by, bz = frame.ball
    draw_ball(p, (bx, by), bz * 1.4)
    if session.phase == "freeze" and session.preview_action is not None:
        _draw_preview(p, st, session.preview_action)
    if session.phase == "review" and session.active_result is not None:
        title, color = BANNER_TEXT.get(session.active_result.outcome, ("PLAY DONE", GOLD))
        box = pygame.Rect(PITCH.centerx - 160, PITCH.top + 28, 320, 48)
        pygame.draw.rect(p.surface, NAVY, box, border_radius=12)
        pygame.draw.rect(p.surface, color, box, 3, border_radius=12)
        p.text(title, box.move(28, 8), 34, color)


def match_buttons(session: MatchSession) -> list[Button]:
    if session.phase == "match_summary":
        return [
            Button(pygame.Rect(814, 672, 410, 56), "Play Match Again / R", "match_replay"),
            Button(pygame.Rect(814, 738, 410, 56), "Cup Select / B", "match_back"),
        ]
    if session.phase == "freeze":
        loft_txt = "Loft: ON / L" if session.loft else "Loft: OFF / L"
        intent_txt = f"Off-ball: {session.offball_intent.upper()} / D"
        vision_txt = "Pro Vision: ON / V" if session.pro_vision else "Pro Vision: OFF / V"
        btns = [
            Button(pygame.Rect(814, 540, 198, 48), loft_txt, "match_loft"),
            Button(pygame.Rect(1026, 540, 198, 48), intent_txt, "match_intent"),
            Button(pygame.Rect(814, 600, 198, 48), vision_txt, "match_vision"),
            Button(pygame.Rect(1026, 600, 198, 48), "Rewind 1 Beat / Z", "match_rewind"),
        ]
        if session.moment.guided:
            for i, (lbl, _) in enumerate(guided_anchors(session.state)[:3]):
                btns.append(Button(pygame.Rect(814, 344 + i * 60, 410, 52), lbl, f"match_anchor:{i}", str(i + 1)))
        btns.append(Button(pygame.Rect(814, 668, 410, 50), "Coach Demo / C", "match_coach"))
        btns.append(Button(pygame.Rect(814, 730, 410, 50), "Cup Select / B", "match_back"))
        return btns
    if session.phase == "review":
        return [
            Button(pygame.Rect(814, 558, 198, 48), "Rewind 1 Beat / Z", "match_rewind"),
            Button(pygame.Rect(1026, 558, 198, 48), "Pro Vision / V", "match_vision"),
            Button(pygame.Rect(814, 618, 410, 50), "Watch Coach Demo / C", "match_coach"),
            Button(pygame.Rect(814, 678, 410, 50), "Next Moment / N", "match_next"),
            Button(pygame.Rect(814, 738, 410, 46), "Cup Select / B", "match_back"),
        ]
    return [Button(pygame.Rect(814, 730, 410, 54), "Skip Animation / SPACE", "match_skip")]


def draw_match_screen(p: Painter, session: MatchSession) -> None:
    if session.phase == "match_summary":
        avg_stars, won, hg, ag = session.summary()
        p.text("MATCH COMPLETE!", pygame.Rect(814, 162, 410, 48), 40, GREEN if won else GOLD)
        p.text(f"YOU {hg} - {ag} {session.match.opponent}", pygame.Rect(814, 218, 410, 44), 34, GOLD)
        p.text(f"Rating: {'*' * avg_stars} ({avg_stars}/3 stars)", pygame.Rect(814, 272, 410, 36), 28, INK)
        badges = ", ".join(session.earned_badges) if session.earned_badges else "Keep experimenting with Rewind!"
        p.text("Badges earned:\n" + badges, pygame.Rect(814, 326, 410, 120), 24, GREEN)
        p.text("VICTORY!" if won else "GREAT FIGHT!", pygame.Rect(150, 340, 520, 160), 82, GREEN if won else GOLD)
        return
    _draw_pitch_entities(p, session)
    st = session.state
    hdr = f"YOU {st.home_score}-{st.away_score} {session.match.opponent}  |  {st.minute}'  |  {st.rules_mode.upper()}"
    p.text(hdr, pygame.Rect(814, 156, 410, 28), 22, GREEN)
    p.text(session.moment.title, pygame.Rect(814, 188, 410, 42), 31, INK)
    p.text(f"Moment {session.moment_index + 1}/{len(session.match.moments)}  |  Beat {st.beat + 1}/4",
           pygame.Rect(814, 232, 410, 26), 22, GOLD)
    if session.phase == "review" and session.active_result is not None:
        res = session.active_result
        p.text(f"Stars: {'*' * res.stars}  ({res.outcome.replace('_', ' ').upper()})",
               pygame.Rect(814, 270, 410, 34), 27, GREEN if res.stars >= 3 else GOLD if res.stars == 2 else CORAL)
        p.text(res.feedback, pygame.Rect(814, 314, 410, 120), 24, INK)
        b_txt = "Badges: " + ", ".join(res.badges) if res.badges else "Tip: Press Z to rewind 1 beat and try another route!"
        p.text(b_txt, pygame.Rect(814, 444, 410, 96), 22, GOLD)
    else:
        p.text(session.moment.cue, pygame.Rect(814, 264, 410, 76), 22, INK)
        if session.phase == "freeze" and not session.moment.guided:
            p.text("9v9 Free Read: Click/drag directly on the pitch!\nTap mate=pass, ahead=through, goal=shoot, self=shield.",
                   pygame.Rect(814, 360, 410, 150), 23, MUTED)
        elif session.phase in ("intro", "resolve", "coach"):
            lbl = {"intro": "Live play rolling...", "resolve": "Simulating beat...", "coach": "Coach Demo running..."}[session.phase]
            p.text(lbl, pygame.Rect(814, 420, 410, 50), 28, GOLD)
