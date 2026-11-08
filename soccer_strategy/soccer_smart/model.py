"""Immutable full-field scene geometry, choices, and practice cards."""

from dataclasses import dataclass, replace
from math import isfinite

from .curriculum import BOOK_STAGE, BOOK_TACTIC_PAGES, GROUP_IDS, SECTION_IDS

Point = tuple[float, float]
ACTION_KINDS = ("dribble", "pass", "shoot", "shield", "move", "intercept", "tackle", "clear", "receive")


def bounded(point: Point) -> Point:
    return (max(4.0, min(96.0, point[0])), max(3.0, min(97.0, point[1])))


def lerp(start: Point, end: Point, fraction: float) -> Point:
    t = max(0.0, min(1.0, fraction))
    return (start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t)


def _valid_points(points: list[Point]) -> bool:
    return all(isfinite(x) and isfinite(y) and 0.0 <= x <= 100.0 and 0.0 <= y <= 100.0
               for x, y in points)


@dataclass(frozen=True)
class Actor:
    key: str
    label: str
    team: str
    position: Point
    approach: Point
    run_to: Point
    heading: Point = (0.0, -1.0)


@dataclass(frozen=True)
class Choice:
    key: str
    label: str
    target: Point
    rating: int
    explanation: str
    outcome: str
    ball_end: Point
    action_kind: str = "move"
    actor_targets: tuple[tuple[str, Point], ...] = ()
    loft: float = 0.0
    aim: Point | None = None
    ball_via: Point | None = None

    def validate(self) -> None:
        if (self.rating not in (0, 1, 2) or not self.outcome
                or self.action_kind not in ACTION_KINDS):
            raise ValueError("Invalid choice rating, outcome, or action_kind")
        if not 1 <= len(self.label.split()) <= 12 or not 1 <= len(self.explanation.split()) <= 24:
            raise ValueError("Choice label or explanation exceeds reading budget")
        if (not isfinite(self.loft) or self.loft < 0
                or len(dict(self.actor_targets)) != len(self.actor_targets)):
            raise ValueError("Invalid extra actor tracks or loft")


def _validate_actors(actors: tuple[Actor, ...]) -> list[Point]:
    keys = [actor.key for actor in actors]
    if len(keys) != len(set(keys)) or keys.count("john") != 1:
        raise ValueError("Actor identities must be unique with one John")
    points: list[Point] = []
    for actor in actors:
        if actor.team not in ("home", "away", "keeper"):
            raise ValueError("Unknown actor team")
        points.extend((actor.position, actor.approach, actor.run_to))
    return points


@dataclass(frozen=True)
class Scenario:
    id: str
    topic: int
    variant: str
    title: str
    stage: int
    role: str
    groups: tuple[str, ...]
    focus: str
    cue: str
    actors: tuple[Actor, ...]
    ball: Point
    ball_from: Point
    choices: tuple[Choice, ...]
    rules: str
    coach_note: str
    transfer: bool = False
    ball_state: str = "controlled"
    shot_window: Point | None = None
    provenance: str = "ORIGINAL"
    reference_line: float | None = None

    @property
    def base_id(self) -> str:
        return self.id.split(":")[0]

    @property
    def john(self) -> Actor:
        return next(actor for actor in self.actors if actor.key == "john")

    def validate(self) -> None:
        classic = 1 <= self.topic <= 12 and self.stage in SECTION_IDS
        book = self.topic in BOOK_TACTIC_PAGES and self.stage == BOOK_STAGE
        if (not self.id or not (classic or book) or self.variant not in ("A", "B", "C") or not self.role):
            raise ValueError("Invalid scenario identity, variant, stage, or role")
        if (not self.groups or any(g not in GROUP_IDS for g in self.groups)
                or self.provenance != "ORIGINAL"):
            raise ValueError("Invalid curriculum groups or provenance")
        if not 1 <= len(self.cue.split()) <= 24:
            raise ValueError("Cue exceeds reading budget")
        if len(self.choices) != 3 or len({c.key for c in self.choices}) != 3:
            raise ValueError("Exactly three distinct choices are required")
        if not any(c.rating == 2 for c in self.choices):
            raise ValueError("A scene requires at least one rating-2 choice")
        points = [self.ball, self.ball_from, *_validate_actors(self.actors), *self._choice_points()]
        if self.reference_line is not None and (not isfinite(self.reference_line) or not 0 <= self.reference_line <= 100):
            raise ValueError("Invalid diagram reference line")
        if self.shot_window is not None:
            if not (36.0 <= self.shot_window[0] <= 64.0 and self.shot_window[1] == 0.0):
                raise ValueError("Shot window must lie on the attacking goal line")
            points.append(self.shot_window)
        if not _valid_points(points):
            raise ValueError("Coordinates must be finite and inside [0, 100]")

    def _choice_points(self) -> list[Point]:
        points = []
        for choice in self.choices:
            choice.validate()
            points.extend((choice.target, choice.ball_end))
            for optional in (choice.aim, choice.ball_via):
                if optional is not None:
                    points.append(optional)
            for key, target in choice.actor_targets:
                if key == "john" or key not in {a.key for a in self.actors}:
                    raise ValueError("Unknown extra actor track")
                points.append(target)
        return points


@dataclass(frozen=True)
class PracticeCard:
    id: str
    title: str
    groups: tuple[str, ...]
    summary: str
    adult_prompt: str
    actors: tuple[Actor, ...]
    ball_start: Point
    ball_end: Point
    provenance: str = "ORIGINAL"
    ball_control: Point | None = None
    waypoints: tuple[Point, ...] = ()
    loft: float = 0.0
    demo: str = "ground"

    def validate(self) -> None:
        if (not self.id or not self.groups or any(g not in GROUP_IDS for g in self.groups)
                or self.provenance != "ORIGINAL"):
            raise ValueError("Invalid practice card metadata")
        points = [self.ball_start, self.ball_end, *_validate_actors(self.actors)]
        points.extend(self.waypoints)
        if self.ball_control is not None:
            points.append(self.ball_control)
        if (self.demo not in ("ground", "arc", "drop", "bounce", "volley")
                or not isfinite(self.loft) or self.loft < 0):
            raise ValueError("Invalid card demonstration")
        if not _valid_points(points):
            raise ValueError("Card coordinates must be finite and inside [0, 100]")


def transfer_scene(scene: Scenario, scale: float) -> Scenario:
    """Scale around the pitch centerline while preserving goal-window alignment."""
    if scene.stage == BOOK_STAGE:
        raise ValueError("Book pictures keep authored rule and touchline geometry")
    if not isfinite(scale) or not 0.85 <= scale <= 1.05:
        raise ValueError("Transfer scale must be between 0.85 and 1.05")
    anchor_y = 0.0 if scene.shot_window is not None else 50.0

    def shift(point: Point) -> Point:
        return (50.0 + (point[0] - 50.0) * scale, anchor_y + (point[1] - anchor_y) * scale)

    actors = tuple(replace(a, position=shift(a.position), approach=shift(a.approach),
                           run_to=shift(a.run_to)) for a in scene.actors)
    choices = tuple(replace(c, target=shift(c.target), ball_end=shift(c.ball_end))
                    for c in scene.choices)
    window = shift(scene.shot_window) if scene.shot_window is not None else None
    result = replace(scene, id=f"{scene.base_id}:transfer:{scale}", transfer=True,
                     actors=actors, choices=choices, ball=shift(scene.ball),
                     ball_from=shift(scene.ball_from), shot_window=window)
    result.validate()
    return result
