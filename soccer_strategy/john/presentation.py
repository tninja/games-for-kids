"""Deterministic animation geometry shared by tests and Pygame rendering."""

from .model import Choice, Point, Scenario, lerp

CONTACT_FRACTION = .45
BALL_CONTACT_FRACTIONS = {"clear": CONTACT_FRACTION, "slide": CONTACT_FRACTION,
                          "long": CONTACT_FRACTION, "pass": .16,
                          "pass_left": .16, "pass_center": .16,
                          "pass_right": .16, "pass_back": .16}


def route_destination(choice: Choice) -> Point:
    return choice.ball_end if choice.key.startswith("pass_") else choice.target


def outgoing_fraction(fraction: float, contact: float = CONTACT_FRACTION) -> float:
    return max(0., min(1., (fraction - contact) / (1 - contact)))


def keeper_observation(scene: Scenario, fraction: float) -> tuple[dict[str, Point], Point]:
    keeper = next(a for a in scene.actors if a.key == "keeper")
    if fraction < .45:
        actors = {a.key: (a.position[0], min(32., a.position[1]))
                  if a.team == "away" else a.position for a in scene.actors}
        return actors, lerp(keeper.position, scene.john.position, fraction / .45)
    t = (fraction - .45) / .55
    return ({a.key: lerp(a.approach, a.position, t) for a in scene.actors},
            lerp(scene.john.position, scene.ball, t))


def positions(scene: Scenario, phase: str, fraction: float,
              selected: int | None) -> tuple[dict[str, Point], Point]:
    actors = {a.key: a.position for a in scene.actors}
    ball = scene.ball
    if phase == "observe":
        if scene.keeper_distribution:
            return keeper_observation(scene, fraction)
        return ({a.key: lerp(a.approach, a.position, fraction) for a in scene.actors},
                lerp(scene.ball_from, scene.ball, fraction))
    if phase in ("outcome", "feedback") and selected is not None:
        choice = scene.choices[selected]
        t = 1.0 if phase == "feedback" else fraction
        ball_contact = BALL_CONTACT_FRACTIONS.get(choice.key)
        for actor in scene.actors:
            end = actor.position
            progress = t
            if actor.key == "john":
                end = choice.target
                if choice.key in ("clear", "slide", "long"):
                    progress = min(1., t / CONTACT_FRACTION)
            actors[actor.key] = lerp(actor.position, end, progress)
        if ball_contact is not None:
            t = outgoing_fraction(t, ball_contact)
        ball = lerp(scene.ball, choice.ball_end, t)
    return actors, ball
