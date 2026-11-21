"""Dual-dimension tactical evaluator: objective match outcomes + tactical process detectors."""

from .sim_model import SimAction, SimState


def detect_badges(start: SimState, end: SimState, action: SimAction,
                  outcome: str, metrics: dict[str, float]) -> tuple[str, ...]:
    badges: list[str] = []
    if outcome == "goal":
        badges.append("Clutch Finisher")
    if metrics.get("defender_pulled", 0.0) >= 3.8 and outcome in ("kept_ball", "goal", "rebound"):
        badges.append("Defender Fixer")
    if metrics.get("lines_broken", 0.0) >= 2.0 and outcome in ("kept_ball", "goal"):
        badges.append("Line Breaker")
    if metrics.get("through_distance", 0.0) >= 5.0 and metrics.get("pass_completed", 0.0) > 0:
        badges.append("Space Creator")
    if action.kind == "run_decoy" and metrics.get("defender_pulled", 0.0) >= 3.5 and outcome in ("goal", "kept_ball", "rebound"):
        badges.append("Decoy Master")
    if metrics.get("cleared_overhead", 0.0) > 0 and metrics.get("pass_completed", 0.0) > 0:
        badges.append("Aerial Switch")
    if metrics.get("offside_margin", 99.0) <= 6.5 and outcome in ("kept_ball", "goal"):
        badges.append("Offside Razor")
    if metrics.get("forced_wide", 0.0) > 0 and outcome in ("won_ball", "kept_ball"):
        badges.append("Touchline Trap")
    if start.home_score > start.away_score and start.minute >= 54 and outcome in ("kept_ball", "won_ball"):
        badges.append("Game Manager")
    return tuple(badges)


def _terminal_feedback(outcome: str, action: SimAction, metrics: dict[str, float],
                       badges: tuple[str, ...]) -> str | None:
    if outcome == "goal":
        if "Decoy Master" in badges:
            return "GOAL! Your decoy run dragged the marker and opened the finish."
        if "Space Creator" in badges:
            return "GOAL! Great through-ball weight into your runner's stride."
        return "GOAL! Placed cleanly beyond the goalkeeper's reach."
    if outcome == "intercepted":
        if action.loft:
            return "Lofted ball stayed in the air long enough for the marker to arrive. Try a quicker ground lane or wider target."
        if metrics.get("deflected", 0.0) > 0:
            return "Clipped by a stretching defender at the edge of the lane. Shift the angle wider or pull them first."
        return "Defender read that lane and stepped in. Check their cover shadow or switch the angle."
    if outcome == "won_ball":
        if "Touchline Trap" in badges:
            return "Brilliant defending! You used the touchline as an extra defender and won possession."
        return "Clean regain! Now scan quickly for an early counter or calm outlet."
    fixed = {
        "offside": "OFFSIDE! You crossed the last defender before the pass left the foot. Hold a split-second longer.",
        "conceded": "Opponent scored on the counter. Recover goal-side earlier or protect central cover.",
        "saved": "Keeper closed down the angle and saved it. Aim for the far corner or square to an open teammate.",
        "rebound": "Keeper parried into a live rebound! Attack the second ball immediately.",
        "corner": "Tipped behind for a corner kick! Good pressure on the goalkeeper.",
        "out_of_bounds": "Ball rolled out of play. Dial back the pass weight or aim inside the touchline.",
    }
    return fixed.get(outcome)


def _causal_feedback(outcome: str, action: SimAction, metrics: dict[str, float],
                     badges: tuple[str, ...], start: SimState) -> str:
    term = _terminal_feedback(outcome, action, metrics, badges)
    if term is not None:
        return term
    if start.home_score > start.away_score and start.minute >= 54 and outcome == "kept_ball":
        return "Smart clock management! Keeping calm possession protects your late lead."
    badge_lines = (
        ("Line Breaker", "Line broken! That pass sliced past two defenders and opened the pitch."),
        ("Aerial Switch", "Clean loft over the press! You beat the closing defender into open space."),
        ("Space Creator", "Nice through-ball! Leading your teammate into space kept their full sprint speed."),
        ("Defender Fixer", "You pulled the defender out of shape before releasing. That creates a 2v1 advantage!"),
    )
    for key, text in badge_lines:
        if key in badges:
            return text
    if action.kind == "shield":
        return "You protected the ball while the presser closed in. Release into the newly opened space next."
    return "Possession kept. Read how the defense shifted and plan your next beat."


def _score_beat(outcome: str, badges: tuple[str, ...], start: SimState) -> tuple[int, dict[str, int]]:
    radar = {"vision": 0, "spacing": 0, "timing": 0, "defending": 0}
    if outcome in ("goal", "won_ball"):
        stars = 3
        radar["timing"] += 4
        radar["vision"] += 3
        if outcome == "won_ball":
            radar["defending"] += 5
    elif outcome in ("rebound", "corner") or (outcome == "kept_ball" and badges):
        stars = 3
        radar["vision"] += 3
        radar["spacing"] += 3
    elif outcome == "kept_ball":
        stars = 3 if (start.home_score > start.away_score and start.minute >= 54) else 2
        radar["spacing"] += 2
    elif outcome == "saved":
        stars = 2
        radar["timing"] += 1
    else:
        stars = 1
    if "Line Breaker" in badges or "Aerial Switch" in badges:
        radar["vision"] += 3
    if "Defender Fixer" in badges or "Decoy Master" in badges or "Space Creator" in badges:
        radar["spacing"] += 3
    if "Offside Razor" in badges:
        radar["timing"] += 4
    if "Touchline Trap" in badges:
        radar["defending"] += 4
    return stars, radar


def evaluate_beat(start: SimState, end: SimState, action: SimAction,
                  outcome: str, metrics: dict[str, float]) -> tuple[tuple[str, ...], str, int, dict[str, int]]:
    badges = detect_badges(start, end, action, outcome, metrics)
    feedback = _causal_feedback(outcome, action, metrics, badges, start)
    stars, radar = _score_beat(outcome, badges, start)
    return badges, feedback, stars, radar
