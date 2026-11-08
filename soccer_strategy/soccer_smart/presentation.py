"""Deterministic animation geometry for scenes, coach demos, and practice cards."""

from math import pi, sin

from .model import Choice, Point, PracticeCard, Scenario, lerp

CONTACT_FRACTION = 0.25
RELEASE_KINDS = ("pass", "shoot", "clear")


def route_destination(choice: Choice) -> Point:
    if choice.aim is not None:
        return choice.aim
    return choice.ball_end if choice.action_kind in RELEASE_KINDS else choice.target


def outgoing_fraction(fraction: float, contact: float = CONTACT_FRACTION) -> float:
    return max(0.0, min(1.0, (fraction - contact) / (1.0 - contact)))


def _active_choice(scene: Scenario, phase: str, selected: int | None) -> Choice | None:
    if phase == "coach":
        return next(c for c in scene.choices if c.rating == 2)
    if phase in ("outcome", "feedback") and selected is not None:
        return scene.choices[selected]
    return None


def positions(scene: Scenario, phase: str, fraction: float,
              selected: int | None) -> tuple[dict[str, Point], Point]:
    if phase == "observe":
        return ({a.key: lerp(a.approach, a.position, fraction) for a in scene.actors},
                lerp(scene.ball_from, scene.ball, fraction))
    actors = {a.key: a.position for a in scene.actors}
    choice = _active_choice(scene, phase, selected)
    if choice is None:
        return actors, scene.ball
    t = 1.0 if phase == "feedback" else fraction
    john_t = outgoing_fraction(t) if choice.action_kind in RELEASE_KINDS else t
    actors["john"] = lerp(scene.john.position, choice.target, john_t)
    for key, target in choice.actor_targets:
        actors[key] = lerp(actors[key], target, t)
    ball_t = outgoing_fraction(t) if choice.action_kind in RELEASE_KINDS else t
    if choice.ball_via is not None:
        ball = (lerp(scene.ball, choice.ball_via, ball_t * 2) if ball_t <= .5 else
                lerp(choice.ball_via, choice.ball_end, (ball_t - .5) * 2))
        return actors, ball
    return actors, lerp(scene.ball, choice.ball_end, ball_t)


def card_positions(card: PracticeCard, fraction: float) -> tuple[dict[str, Point], Point]:
    actors = {a.key: lerp(a.approach, a.run_to, fraction) for a in card.actors}
    if card.waypoints:
        points = (card.ball_start, *card.waypoints, card.ball_end)
        step = max(0.0, min(1.0, fraction)) * (len(points) - 1)
        index = min(int(step), len(points) - 2)
        return actors, lerp(points[index], points[index + 1], step - index)
    if card.ball_control is not None:
        return actors, lerp(lerp(card.ball_start, card.ball_control, fraction),
                            lerp(card.ball_control, card.ball_end, fraction), fraction)
    return actors, lerp(card.ball_start, card.ball_end, fraction)


def ball_height(scene: Scenario, phase: str, fraction: float, selected: int | None) -> float:
    choice = _active_choice(scene, phase, selected)
    if choice is None or phase not in ("outcome", "coach"):
        return 0.0
    peak = choice.loft
    if not peak and choice.action_kind == "clear":
        peak = 32.0
    flight = fraction if choice.action_kind == "receive" else outgoing_fraction(fraction)
    return peak * sin(pi * flight)


def card_height(card: PracticeCard, fraction: float) -> float:
    t = max(0.0, min(1.0, fraction))
    if card.demo == "arc":
        return card.loft * sin(pi * t)
    if card.demo == "drop":
        return card.loft * (1 - t)
    if card.demo == "bounce":
        return card.loft * abs(sin(3 * pi * t))
    if card.demo == "volley":
        return card.loft * (1 - t * .5) if t <= .5 else card.loft * 1.5 * (1 - t)
    return 0.0
