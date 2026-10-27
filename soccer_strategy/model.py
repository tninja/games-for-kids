"""Immutable scene geometry and learning choices; no rendering dependencies."""

from dataclasses import dataclass, replace
from math import isfinite
from .curriculum import SECTION_IDS

Point = tuple[float, float]


def bounded(point: Point) -> Point:
    return (max(4.0, min(96.0, point[0])), max(5.0, min(94.0, point[1])))


def lerp(start: Point, end: Point, fraction: float) -> Point:
    t = max(0.0, min(1.0, fraction))
    return (start[0] + (end[0] - start[0]) * t,
            start[1] + (end[1] - start[1]) * t)


@dataclass(frozen=True)
class Actor:
    key: str
    label: str
    team: str
    position: Point
    approach: Point
    run_to: Point
    heading: Point = (0, 1)


@dataclass(frozen=True)
class Choice:
    key: str
    label: str
    target: Point
    rating: int
    explanation: str
    outcome: str
    ball_end: Point


@dataclass(frozen=True)
class Scenario:
    id: str
    topic: int
    title: str
    stage: int
    focus: str
    cue: str
    actors: tuple[Actor, ...]
    ball: Point
    ball_from: Point
    choices: tuple[Choice, ...]
    rules: str
    transfer: bool = False
    ball_state: str = "controlled"
    keeper_distribution: bool = False
    assigned_zone: Point | None = None

    @property
    def john(self) -> Actor:
        return next(actor for actor in self.actors if actor.key == "john")

    def validate(self) -> None:
        if not self.id or not 1 <= self.topic <= 29 or self.stage not in SECTION_IDS:
            raise ValueError("Invalid scenario identity or stage")
        keys = [actor.key for actor in self.actors]
        if len(keys) != len(set(keys)) or keys.count("john") != 1:
            raise ValueError("Actor identities must be unique with one John")
        if len(self.choices) != 3 or len({c.key for c in self.choices}) != 3:
            raise ValueError("Exactly three distinct choices are required")
        if not any(c.rating == 2 for c in self.choices):
            raise ValueError("A scene needs a strong choice")
        points = [self.ball, self.ball_from]
        if self.assigned_zone is not None:
            points.append(self.assigned_zone)
        for actor in self.actors:
            if actor.team not in ("home", "away", "keeper"):
                raise ValueError("Unknown team")
            points.extend((actor.position, actor.approach, actor.run_to))
        for choice in self.choices:
            if choice.rating not in (0, 1, 2) or not choice.explanation or not choice.outcome:
                raise ValueError("Invalid choice feedback")
            points.extend((choice.target, choice.ball_end))
        if not all(isfinite(x) and isfinite(y) and 0 <= x <= 100 and 0 <= y <= 100
                   for x, y in points):
            raise ValueError("Coordinates must be finite and inside the pitch")


def transfer_scene(scene: Scenario, scale: float) -> Scenario:
    """Scale around our fixed goal, preserving angles and relative distances."""
    if not isfinite(scale) or not .8 <= scale <= 1.05:
        raise ValueError("Transfer scale must be between 0.8 and 1.05")

    def shift(point: Point) -> Point:
        return (50 + (point[0] - 50) * scale, 100 + (point[1] - 100) * scale)

    actors = tuple(replace(a, position=shift(a.position), approach=shift(a.approach),
                           run_to=shift(a.run_to)) for a in scene.actors)
    choices = tuple(replace(c, target=shift(c.target), ball_end=shift(c.ball_end))
                    for c in scene.choices)
    result = replace(scene, id=f"{scene.id}:transfer:{scale}", transfer=True,
                     actors=actors, choices=choices, ball=shift(scene.ball),
                     ball_from=shift(scene.ball_from),
                     assigned_zone=shift(scene.assigned_zone) if scene.assigned_zone is not None else None)
    result.validate()
    return result
