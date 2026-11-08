"""Immutable episode graphs and deterministic teaching tracks, without UI code."""

from dataclasses import dataclass
from math import isfinite

Point = tuple[float, float]


def valid_point(point: Point) -> bool:
    return len(point) == 2 and all(isfinite(v) and 0 <= v <= 100 for v in point)


def blend(a: Point, b: Point, t: float) -> Point:
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


@dataclass(frozen=True)
class Actor:
    key: str
    label: str
    team: str
    position: Point


@dataclass(frozen=True)
class State:
    actors: tuple[Actor, ...]
    ball: Point
    control: str

    def positions(self) -> dict[str, Point]:
        return {a.key: a.position for a in self.actors}

    def validate(self) -> None:
        keys = [a.key for a in self.actors]
        if (len(set(keys)) != len(keys) or self.control not in keys
                or not valid_point(self.ball)):
            raise ValueError("Invalid snapshot identities or ball")
        for actor in self.actors:
            if (not actor.key or not actor.label or actor.team not in ("home", "away", "keeper")
                    or not valid_point(actor.position)):
                raise ValueError("Invalid actor")


@dataclass(frozen=True)
class Track:
    kind: str
    points: tuple[Point, ...]
    contact: float = 0.0

    def validate(self) -> None:
        if (self.kind not in ("linear", "corner", "curve") or len(self.points) < 2
                or (self.kind == "linear" and len(self.points) != 2)
                or (self.kind == "curve" and len(self.points) != 3)
                or (self.kind == "corner" and len(self.points) < 3)
                or not isfinite(self.contact) or not 0 <= self.contact < 1
                or not all(valid_point(p) for p in self.points)):
            raise ValueError("Invalid track geometry or contact time")

    def sample(self, fraction: float) -> Point:
        if not isfinite(fraction):
            raise ValueError("Track fraction must be finite")
        t = max(0.0, min(1.0, (fraction - self.contact) / (1 - self.contact)))
        if self.kind == "curve":
            return blend(blend(self.points[0], self.points[1], t),
                         blend(self.points[1], self.points[2], t), t)
        segment = t * (len(self.points) - 1)
        index = min(int(segment), len(self.points) - 2)
        return blend(self.points[index], self.points[index + 1], segment - index)


@dataclass(frozen=True)
class Motion:
    ball: Track
    actors: tuple[tuple[str, Track], ...] = ()
    duration: float = 2.4

    def frame(self, state: State, fraction: float) -> tuple[dict[str, Point], Point]:
        positions = state.positions()
        positions.update((key, track.sample(fraction)) for key, track in self.actors)
        return positions, self.ball.sample(fraction)

    def route(self, state: State) -> Track:
        position = state.positions()[state.control]
        if state.ball != position:
            return dict(self.actors).get(state.control, Track("linear", (position, position)))
        return self.ball

    def validate(self, state: State) -> None:
        self.ball.validate()
        if (not isfinite(self.duration) or self.duration <= 0
                or self.ball.points[0] != state.ball
                or len(dict(self.actors)) != len(self.actors)):
            raise ValueError("Invalid motion timing, origin or duplicate actor")
        for key, track in self.actors:
            track.validate()
            if key not in state.positions() or track.points[0] != state.positions()[key]:
                raise ValueError("Actor track does not start in snapshot")


@dataclass(frozen=True)
class Choice:
    key: str
    label: str
    rating: int
    feedback: str
    motion: Motion
    next_node: str | None = None
    intent: Track | None = None

    def preview(self, state: State) -> Track:
        return self.motion.route(state) if self.intent is None else self.intent

    def validate(self, state: State) -> None:
        if (not self.key or self.rating not in (0, 1, 2)
                or not 1 <= len(self.label.split()) <= 12
                or not 1 <= len(self.feedback.split()) <= 24):
            raise ValueError("Invalid choice or reading budget")
        self.motion.validate(state)
        if self.intent is not None:
            self.intent.validate()
            if self.intent.points[0] != self.motion.route(state).points[0]:
                raise ValueError("Intended route does not start at the action origin")


@dataclass(frozen=True)
class Node:
    id: str
    title: str
    role: str
    cue: str
    state: State
    choices: tuple[Choice, ...]
    shot_window: Point | None = None

    def validate(self) -> None:
        self.state.validate()
        if (not self.id or not self.title or not self.role
                or not 1 <= len(self.cue.split()) <= 24
                or len(self.choices) != 3 or len({c.key for c in self.choices}) != 3
                or not any(c.rating == 2 for c in self.choices)):
            raise ValueError("Invalid decision node")
        for choice in self.choices:
            choice.validate(self.state)
        if self.shot_window is not None and (not valid_point(self.shot_window)
                or self.shot_window[1] != 0 or not 41 <= self.shot_window[0] <= 59):
            raise ValueError("Shot window must be inside the displayed attacking goal")


@dataclass(frozen=True)
class Episode:
    id: str
    title: str
    nodes: tuple[Node, ...]
    prediction: bool = False
    reveal: str = ""
    provenance: str = "ORIGINAL"
    source_status: str = "OVERVIEW_ONLY"
    review_status: str = "BOOK_BODY_PENDING"

    def node(self, key: str) -> Node:
        return {n.id: n for n in self.nodes}[key]

    def validate(self) -> None:
        if (not self.id or not self.title or not self.nodes
                or len({n.id for n in self.nodes}) != len(self.nodes)
                or self.provenance != "ORIGINAL" or self.source_status != "OVERVIEW_ONLY"
                or self.review_status != "BOOK_BODY_PENDING"
                or (self.prediction and not self.reveal)):
            raise ValueError("Invalid episode identity or provenance")
        for node in self.nodes:
            node.validate()
            for choice in node.choices:
                self._validate_edge(node, choice)
        reached: set[str] = set()
        self._visit(self.nodes[0].id, set(), reached)
        if reached != {n.id for n in self.nodes}:
            raise ValueError("Unreachable episode node")

    def _validate_edge(self, node: Node, choice: Choice) -> None:
        if choice.next_node is None:
            return
        if choice.next_node not in {n.id for n in self.nodes}:
            raise ValueError("Unknown destination")
        end = choice.motion.frame(node.state, 1)
        successor = self.node(choice.next_node).state
        if end != (successor.positions(), successor.ball):
            raise ValueError("Successor teleports away from motion endpoint")

    def _visit(self, key: str, active: set[str], reached: set[str]) -> None:
        if key in active:
            raise ValueError("Episode graph contains a cycle")
        if key in reached:
            return
        reached.add(key)
        for choice in self.node(key).choices:
            if choice.next_node is not None:
                self._visit(choice.next_node, active | {key}, reached)
