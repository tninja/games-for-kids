"""Match Day Cup campaign: 3 tiers (7v7 & 9v9), trait squad, and 18 playable moments."""

from dataclasses import dataclass

from .sim_model import SimAction, SimBall, SimPlayer, SimState


@dataclass(frozen=True)
class MomentSpec:
    id: str
    cup_id: str
    match_id: str
    title: str
    minute: int
    rules_mode: str
    guided: bool
    objective: str
    cue: str
    initial_state: SimState
    coach_actions: tuple[SimAction, ...]


@dataclass(frozen=True)
class MatchSpec:
    id: str
    cup_id: str
    title: str
    opponent: str
    opponent_style: str
    rules_mode: str
    guided: bool
    base_home: int
    base_away: int
    moments: tuple[MomentSpec, ...]


@dataclass(frozen=True)
class CupSpec:
    id: str
    title: str
    subtitle: str
    rules_mode: str
    matches: tuple[MatchSpec, ...]


def _home(you: tuple[float, float], maya: tuple[float, float], leo: tuple[float, float],
          sam: tuple[float, float], gk: tuple[float, float] = (50.0, 95.0),
          you_h: tuple[float, float] = (0.0, -1.0)) -> tuple[SimPlayer, ...]:
    return (
        SimPlayer("you", "YOU", 8, "home", "mid", "balanced", you[0], you[1], 0.0, 0.0, you_h[0], you_h[1], 17.5),
        SimPlayer("maya", "Maya", 7, "home", "wing", "speed", maya[0], maya[1], 0.0, 0.0, 0.0, -1.0, 19.5),
        SimPlayer("leo", "Leo", 10, "home", "mid", "playmaker", leo[0], leo[1], 0.0, 0.0, 0.0, -1.0, 17.2),
        SimPlayer("sam", "Sam", 4, "home", "def", "anchor", sam[0], sam[1], 0.0, 0.0, 0.0, -1.0, 16.5),
        SimPlayer("gk", "Alex", 1, "home", "gk", "sweeper", gk[0], gk[1], 0.0, 0.0, 0.0, -1.0, 15.0),
    )


def _away(pts: tuple[tuple[float, float], ...], gk: tuple[float, float] = (50.0, 5.0)) -> tuple[SimPlayer, ...]:
    out = [
        SimPlayer(f"d{i + 1}", f"#{i + 2}", i + 2, "away", "def" if i < 2 else "mid",
                  "press" if i == 0 else "cover", x, y, 0.0, 0.0, 0.0, 1.0, 13.8)
        for i, (x, y) in enumerate(pts)
    ]
    out.append(SimPlayer("opp_gk", "GK", 1, "away", "gk", "sweeper", gk[0], gk[1], 0.0, 0.0, 0.0, 1.0, 10.5))
    return tuple(out)


def _state(home: tuple[SimPlayer, ...], away: tuple[SimPlayer, ...], owner: str | None,
           ball_pos: tuple[float, float], rules: str = "7v7", build_out: bool = False,
           offside: bool = False, style: str = "balanced", minute: int = 12,
           h_score: int = 0, a_score: int = 0, set_piece: str = "") -> SimState:
    last = "away" if owner is not None and owner.startswith("d") else "home"
    ball = SimBall(ball_pos[0], ball_pos[1], 0.0, 0.0, 0.0, 0.0, owner, last, False, ball_pos[1])
    return SimState(home + away, ball, rules, build_out, offside, style, minute, h_score, a_score, 0, "live", "", set_piece)


def _tier1_cups() -> CupSpec:
    m1_moments = (
        MomentSpec(
            "C1M1.1", "cup1", "C1M1", "Build-Out from Keeper", 8, "7v7", True, "break_press",
            "Build-out line is active! Pass wide to Maya or carry into open space before pressers cross.",
            _state(_home((36.0, 78.0), (16.0, 58.0), (62.0, 62.0), (52.0, 86.0)),
                   _away(((42.0, 62.0), (62.0, 58.0), (48.0, 44.0))),
                   "you", (36.0, 78.0), "7v7", True, False, "balanced", 8, 0, 0, "goal_kick"),
            (SimAction("pass", 16.0, 52.0, False, "maya"),),
        ),
        MomentSpec(
            "C1M1.2", "cup1", "C1M1", "Fix the Defender 2v1", 24, "7v7", True, "score",
            "Maya (#7) is blazing fast on the left. Pull the defender or lead her into space behind!",
            _state(_home((48.0, 38.0), (22.0, 30.0), (70.0, 42.0), (46.0, 58.0)),
                   _away(((44.0, 26.0), (64.0, 28.0), (50.0, 46.0))),
                   "you", (48.0, 38.0), "7v7", False, False, "balanced", 24, 0, 0),
            (SimAction("pass", 22.0, 18.0, False, "maya"), SimAction("run_call", 44.0, 16.0)),
        ),
        MomentSpec(
            "C1M1.3", "cup1", "C1M1", "Track the Counter Wide", 41, "7v7", True, "defend",
            "Opponent broke down the left. Force the carrier toward the touchline and win it back!",
            _state(_home((24.0, 66.0), (32.0, 48.0), (52.0, 62.0), (46.0, 78.0)),
                   _away(((16.0, 60.0), (54.0, 64.0), (42.0, 46.0))),
                   "d1", (16.0, 60.0), "7v7", False, False, "balanced", 41, 1, 0),
            (SimAction("defend", 16.0, 61.0),),
        ),
    )
    m2_moments = (
        MomentSpec(
            "C1M2.1", "cup1", "C1M2", "Loft Over the High Press", 11, "7v7", True, "break_press",
            "High press closes every ground lane! Toggle Loft (L) to chip over them to Maya.",
            _state(_home((46.0, 70.0), (78.0, 44.0), (34.0, 64.0), (46.0, 82.0)),
                   _away(((56.0, 62.0), (42.0, 58.0), (65.0, 54.0))),
                   "you", (46.0, 70.0), "7v7", False, False, "high_press", 11, 0, 0),
            (SimAction("pass", 78.0, 44.0, True, "maya"),),
        ),
        MomentSpec(
            "C1M2.2", "cup1", "C1M2", "Give-and-Go with Leo", 31, "7v7", True, "score",
            "Leo (#10) plays one-touch wall passes. Bounce it to Leo, then call into space!",
            _state(_home((38.0, 38.0), (76.0, 28.0), (58.0, 28.0), (44.0, 58.0)),
                   _away(((42.0, 24.0), (72.0, 22.0), (50.0, 48.0))),
                   "you", (38.0, 38.0), "7v7", False, False, "balanced", 31, 0, 0),
            (SimAction("pass", 58.0, 28.0, False, "leo"), SimAction("run_call", 36.0, 22.0)),
        ),
        MomentSpec(
            "C1M2.3", "cup1", "C1M2", "1v1 Finish Reading Keeper", 52, "7v7", True, "score",
            "Keeper shades right post! Place your shot into the open left corner.",
            _state(_home((47.0, 19.0), (24.0, 22.0), (66.0, 24.0), (48.0, 44.0)),
                   _away(((36.0, 26.0), (60.0, 28.0), (48.0, 36.0)), (55.5, 6.0)),
                   "you", (47.0, 19.0), "7v7", False, False, "high_press", 52, 1, 1),
            (SimAction("shoot", 41.5, 0.0),),
        ),
    )
    return CupSpec(
        "cup1", "Neighborhood 7v7 Cup", "Build-out line, 2v1 timing, lofted switches & finishing", "7v7",
        (
            MatchSpec("C1M1", "cup1", "Semifinal vs Park Rovers", "Park Rovers", "balanced", "7v7", True, 0, 0, m1_moments),
            MatchSpec("C1M2", "cup1", "Final vs Sunset Strikers", "Sunset Strikers", "high_press", "7v7", True, 0, 1, m2_moments),
        ),
    )


def _tier2_cups() -> CupSpec:
    m3_moments = (
        MomentSpec(
            "C2M1.1", "cup2", "C2M1", "Switch Against Mid-Block", 16, "7v7", True, "break_press",
            "Defense packed the left side. Switch wide to Maya on the open right flank!",
            _state(_home((26.0, 52.0), (80.0, 42.0), (42.0, 46.0), (34.0, 68.0)),
                   _away(((32.0, 44.0), (46.0, 42.0), (26.0, 38.0))),
                   "you", (26.0, 52.0), "7v7", False, False, "mid_block", 16, 0, 0),
            (SimAction("pass", 80.0, 42.0, True, "maya"),),
        ),
        MomentSpec(
            "C2M1.2", "cup2", "C2M1", "Decoy Run Opens the Box", 36, "7v7", True, "score",
            "Leo has the ball. Toggle Decoy (D) and sprint near-post to drag the defender away!",
            _state(_home((38.0, 28.0), (68.0, 22.0), (48.0, 34.0), (46.0, 56.0)),
                   _away(((42.0, 22.0), (60.0, 24.0), (54.0, 40.0))),
                   "leo", (48.0, 34.0), "7v7", False, False, "mid_block", 36, 0, 0),
            (SimAction("run_decoy", 26.0, 16.0),),
        ),
        MomentSpec(
            "C2M1.3", "cup2", "C2M1", "Protect a 1-0 Lead (58')", 58, "7v7", True, "keep_lead",
            "Minute 58, leading 1-0! Recycle calmly to Sam (#4) or keep possession instead of forcing it.",
            _state(_home((44.0, 48.0), (76.0, 26.0), (58.0, 36.0), (36.0, 64.0)),
                   _away(((48.0, 38.0), (62.0, 34.0), (42.0, 30.0))),
                   "you", (44.0, 48.0), "7v7", False, False, "high_press", 58, 1, 0),
            (SimAction("pass", 36.0, 64.0, False, "sam"),),
        ),
    )
    m4_moments = (
        MomentSpec(
            "C2M2.1", "cup2", "C2M2", "Back-to-Goal Under Press", 14, "7v7", True, "break_press",
            "Facing backward with a presser tight on your back! Lay off to Leo or turn into open grass.",
            _state(_home((48.0, 56.0), (22.0, 38.0), (34.0, 64.0), (52.0, 74.0), you_h=(0.0, 1.0)),
                   _away(((48.0, 48.0), (60.0, 50.0), (38.0, 42.0))),
                   "you", (48.0, 56.0), "7v7", False, False, "high_press", 14, 0, 1),
            (SimAction("pass", 34.0, 64.0, False, "leo"),),
        ),
        MomentSpec(
            "C2M2.2", "cup2", "C2M2", "Quick Throw-In Triangle", 38, "7v7", True, "break_press",
            "Throw-in on the left touchline (no offside!). Launch ahead into Maya's open lane.",
            _state(_home((4.0, 46.0), (18.0, 28.0), (22.0, 54.0), (28.0, 66.0)),
                   _away(((20.0, 48.0), (34.0, 36.0), (44.0, 44.0))),
                   "you", (4.0, 46.0), "7v7", False, False, "high_press", 38, 0, 1, "throw_in"),
            (SimAction("pass", 18.0, 28.0, True, "maya"),),
        ),
        MomentSpec(
            "C2M2.3", "cup2", "C2M2", "Chasing an Equalizer (59')", 59, "7v7", True, "score",
            "Down 0-1 in the final minute! Drive or slip Maya through to finish!",
            _state(_home((50.0, 34.0), (74.0, 26.0), (30.0, 32.0), (50.0, 56.0)),
                   _away(((48.0, 24.0), (38.0, 26.0), (56.0, 42.0)), (46.0, 5.0)),
                   "you", (50.0, 34.0), "7v7", False, False, "high_press", 59, 0, 1),
            (SimAction("pass", 74.0, 16.0, False, "maya"),),
        ),
    )
    return CupSpec(
        "cup2", "Regional 7v7 Challenge", "Switches, decoy runs, throw-ins & late-game decisions", "7v7",
        (
            MatchSpec("C2M1", "cup2", "Match 1 vs River City", "River City", "mid_block", "7v7", True, 0, 0, m3_moments),
            MatchSpec("C2M2", "cup2", "Final vs Metro Press", "Metro Press", "high_press", "7v7", True, 0, 1, m4_moments),
        ),
    )


def _tier3_cups() -> CupSpec:
    m5_moments = (
        MomentSpec(
            "C3M1.1", "cup3", "C3M1", "Beat the 9v9 Offside Trap", 19, "9v9", False, "score",
            "9v9 Offside ON! Stay level with the laser line before Leo releases, then burst behind!",
            _state(_home((64.0, 34.0), (22.0, 36.0), (46.0, 44.0), (48.0, 62.0)),
                   _away(((36.0, 31.0), (50.0, 31.0), (78.0, 36.0), (40.0, 52.0))),
                   "leo", (46.0, 44.0), "9v9", False, True, "balanced", 19, 0, 0),
            (SimAction("run_call", 64.0, 22.0),),
        ),
        MomentSpec(
            "C3M1.2", "cup3", "C3M1", "Corner Kick Back-Post Play", 37, "9v9", False, "score",
            "Corner kick from the right! Loft to Maya at the back post or play short to Leo.",
            _state(_home((96.0, 4.0), (38.0, 15.0), (80.0, 18.0), (56.0, 34.0)),
                   _away(((56.0, 12.0), (66.0, 14.0), (48.0, 18.0), (74.0, 22.0)), (52.0, 4.0)),
                   "you", (96.0, 4.0), "9v9", False, False, "balanced", 37, 0, 0, "corner"),
            (SimAction("pass", 38.0, 15.0, True, "maya"),),
        ),
        MomentSpec(
            "C3M1.3", "cup3", "C3M1", "9v9 Counter: Cover Center", 51, "9v9", False, "defend",
            "Sam presses wide while central runners surge! Protect the central passing lane and win it.",
            _state(_home((28.0, 65.0), (24.0, 48.0), (62.0, 58.0), (36.0, 66.0)),
                   _away(((20.0, 58.0), (48.0, 62.0), (68.0, 60.0), (36.0, 46.0))),
                   "d1", (20.0, 58.0), "9v9", False, True, "balanced", 51, 1, 0),
            (SimAction("defend", 22.0, 64.0),),
        ),
    )
    m6_moments = (
        MomentSpec(
            "C3M2.1", "cup3", "C3M2", "Break Two Midfield Lines", 15, "9v9", False, "break_press",
            "Academy Final (9v9, Offside ON). Slice cleanly between the midfielders into Leo's feet!",
            _state(_home((48.0, 64.0), (80.0, 36.0), (48.0, 38.0), (36.0, 74.0)),
                   _away(((30.0, 52.0), (66.0, 52.0), (36.0, 30.0), (64.0, 30.0))),
                   "you", (48.0, 64.0), "9v9", False, True, "balanced", 15, 0, 0),
            (SimAction("pass", 48.0, 38.0, False, "leo"),),
        ),
        MomentSpec(
            "C3M2.2", "cup3", "C3M2", "Free-Kick Wall Combination", 42, "9v9", False, "score",
            "Wall blocks the direct near-post strike! Slip Maya wide right or loft over the wall.",
            _state(_home((46.0, 28.0), (70.0, 18.0), (28.0, 24.0), (48.0, 48.0)),
                   _away(((42.0, 18.0), (49.0, 18.0), (36.0, 20.0), (60.0, 14.0)), (52.0, 4.5)),
                   "you", (46.0, 28.0), "9v9", False, True, "mid_block", 42, 1, 1, "free_kick"),
            (SimAction("pass", 70.0, 18.0, False, "maya"),),
        ),
        MomentSpec(
            "C3M2.3", "cup3", "C3M2", "Cup-Winning Attack (58')", 58, "9v9", False, "score",
            "Tied 1-1 in the Final! Combine through space and bury the Cup winner!",
            _state(_home((44.0, 34.0), (74.0, 26.0), (30.0, 26.0), (48.0, 54.0)),
                   _away(((40.0, 20.0), (54.0, 18.0), (30.0, 34.0), (54.0, 44.0)), (45.0, 4.5)),
                   "you", (44.0, 34.0), "9v9", False, True, "balanced", 58, 1, 1),
            (SimAction("pass", 74.0, 22.0, False, "maya"), SimAction("run_call", 54.0, 16.0)),
        ),
    )
    return CupSpec(
        "cup3", "Academy 9v9 Cup", "Live offside line, set pieces, 5v4 shapes & free pitch reading", "9v9",
        (
            MatchSpec("C3M1", "cup3", "Semifinal vs Academy North", "Academy North", "balanced", "9v9", False, 0, 0, m5_moments),
            MatchSpec("C3M2", "cup3", "Cup Final vs Champions Utd", "Champions Utd", "high_press", "9v9", False, 1, 1, m6_moments),
        ),
    )


def build_cups() -> tuple[CupSpec, ...]:
    return (_tier1_cups(), _tier2_cups(), _tier3_cups())


def all_matches() -> tuple[MatchSpec, ...]:
    return tuple(m for cup in build_cups() for m in cup.matches)


def match_by_id(match_id: str) -> MatchSpec:
    for match in all_matches():
        if match.id == match_id:
            return match
    raise ValueError(f"Unknown match id: {match_id}")
