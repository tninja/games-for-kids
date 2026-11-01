"""Beginner picture facts and geometry, without a rendering dependency."""

from dataclasses import dataclass
from math import isfinite

Point = tuple[float, float]
ACTIONS = {
    "left": "Move left", "right": "Move right", "ready": "Stay ready",
    "low": "Low hands", "chest": "Chest hands",
    "roll_left": "Roll left", "roll_right": "Roll right",
    "hold": "Wait and look", "collect": "Collect it",
    "set": "Set for shot", "rush": "Run to shooter", "jump": "Jump before shot",
    "forward": "Step toward ball", "back": "Back toward goal",
    "cover_left": "Cover left post", "cover_right": "Cover right post",
    "follow": "Follow the pass", "feet": "Kick it wide",
    "recover": "Get back ready", "support": "Make passing space",
    "roll_middle": "Roll middle", "celebrate": "Celebrate now",
}


def mix(a: Point, b: Point, fraction: float) -> Point:
    t = max(0., min(1., fraction))
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


def aligned_spot(source: Point) -> Point:
    if not 0 <= source[1] < 83:
        raise ValueError("Serve must start in front of the keeper")
    return mix(source, (50, 100), (83 - source[1]) / (100 - source[1]))


@dataclass(frozen=True)
class Skill:
    id: str
    title: str
    tip: str


@dataclass(frozen=True)
class Friend:
    label: str
    position: Point
    ready: bool = True


@dataclass(frozen=True)
class Frame:
    keeper: Point
    ball: Point
    height: float
    pose: str
    step: float = 0.
    opponents: tuple[Point, ...] = ()


@dataclass(frozen=True)
class Picture:
    id: str
    skill: str
    cue: str
    source: Point
    keeper: Point
    spot: Point
    ball_target: Point
    height: float
    choices: tuple[str, ...]
    answer: str
    note: str
    friends: tuple[Friend, ...] = ()
    blocker: Point | None = None
    serve_from: Point | None = None
    extra_blockers: tuple[Point, ...] = ()
    play: str = ""
    title: str = ""
    opponent_to: Point | None = None
    ball_start: Point | None = None

    @property
    def incoming_source(self) -> Point:
        return self.source if self.serve_from is None else self.serve_from

    @property
    def opponents(self) -> tuple[Point, ...]:
        return self.extra_blockers if self.blocker is None else (self.blocker, *self.extra_blockers)

    def validate(self) -> None:
        if not self.id or self.skill not in ("line", "hands", "roll", "loose", "match"):
            raise ValueError("Unknown picture or skill")
        count = 3 if self.skill == "match" else 2
        if (len(self.choices) != count or len(set(self.choices)) != count
                or self.answer not in self.choices or any(k not in ACTIONS for k in self.choices)):
            raise ValueError("Distinct known choices and an answer are required")
        if self.skill == "match" and (not self.title or self.play not in (
                "shot", "close", "collect", "recover", "feet", "distribute", "support")):
            raise ValueError("A match needs a title and a known play")
        points = [self.source, self.keeper, self.spot, self.ball_target]
        points.extend(friend.position for friend in self.friends)
        if self.blocker is not None:
            points.append(self.blocker)
        points.extend(self.extra_blockers)
        if self.serve_from is not None:
            points.append(self.serve_from)
        if self.opponent_to is not None:
            points.append(self.opponent_to)
        if self.ball_start is not None:
            points.append(self.ball_start)
        if not all(isfinite(x) and isfinite(y) and 0 <= x <= 100 and 0 <= y <= 100 for x, y in points):
            raise ValueError("Picture coordinates must be on the pitch")
        if not isfinite(self.height) or not 0 <= self.height <= 42:
            raise ValueError("Use a low or soft chest-height serve")
        for message, limit in ((self.cue, 10), (self.note, 12)):
            if not message or len(message.split()) > limit:
                raise ValueError("Keep beginner text short")
