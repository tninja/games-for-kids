"""Continuous branches with an immutable first-traversal score ledger."""

from math import isfinite

from .content import episodes
from .model import Choice, Episode, Node

ANIMATION_SECONDS = 2.4
ANIMATED = ("observe", "outcome", "coach")


class Session:
    def __init__(self, mission: str = "M01", run_id: int = 0):
        self.episodes = tuple(e for e in episodes() if e.id.startswith(mission + "."))
        if not self.episodes:
            raise ValueError("Unknown mission")
        self.run_id = run_id
        self.index = 0
        self.results: dict[tuple[int, str, str], int] = {}
        self.practice: list[tuple[str, str, str, int]] = []
        self.practice_only = False
        self._root()

    @property
    def episode(self) -> Episode:
        return self.episodes[self.index]

    @property
    def node(self) -> Node:
        return self.episode.node(self.node_id)

    @property
    def feedback(self) -> Choice | None:
        return None if self.selected is None else self.node.choices[self.selected]

    @property
    def coach_choice(self) -> Choice:
        selected = self.feedback
        if selected is not None and selected.rating == 2:
            return selected
        return max(self.node.choices, key=lambda c: c.rating)

    @property
    def active_choice(self) -> Choice | None:
        if self.phase == "coach":
            return self.coach_choice
        return self.feedback if self.phase in ("outcome", "feedback") else None

    @property
    def duration(self) -> float:
        choice = self.active_choice
        return ANIMATION_SECONDS if choice is None else choice.motion.duration

    @property
    def fraction(self) -> float:
        return 1.0 if self.phase == "feedback" else min(1.0, self.elapsed / self.duration)

    def _root(self) -> None:
        self.node_id = self.episode.nodes[0].id
        self.prediction: int | None = None
        self.selected: int | None = None
        self.phase = "predict" if self.episode.prediction else "observe"
        self.elapsed = 0.0
        self.paused = False

    def predict(self, index: int) -> bool:
        if self.phase != "predict" or index not in (0, 1):
            return False
        self.prediction = index
        self.phase = "observe"
        return True

    def choose(self, index: int) -> bool:
        if self.phase != "decide" or not 0 <= index < 3:
            return False
        self.selected = index
        choice = self.node.choices[index]
        if not self.practice_only:
            self.results.setdefault((self.run_id, self.episode.id, self.node_id), choice.rating)
        else:
            self.practice.append((self.episode.id, self.node_id, choice.key, choice.rating))
        self.phase = "outcome"
        self.elapsed = 0.0
        return True

    def tick(self, seconds: float) -> None:
        if not isfinite(seconds) or seconds < 0:
            raise ValueError("Elapsed time must be finite and nonnegative")
        if self.phase in ANIMATED and not self.paused:
            self.elapsed += seconds
            self._finish()

    def _finish(self) -> None:
        if self.elapsed >= self.duration:
            self.phase = "decide" if self.phase == "observe" else "feedback"
            self.elapsed = 0.0
            self.paused = False

    def toggle_pause(self) -> bool:
        if self.phase not in ANIMATED:
            return False
        self.paused = not self.paused
        return True

    def step(self) -> None:
        if self.phase in ANIMATED:
            self.paused = True
            self.elapsed += .2
            self._finish()

    def skip(self) -> None:
        if self.phase in ANIMATED:
            self.elapsed = self.duration
            self._finish()

    def compare_coach(self) -> bool:
        if self.phase != "feedback":
            return False
        self.phase = "coach"
        self.elapsed = 0.0
        return True

    def retry(self) -> bool:
        if self.phase != "feedback":
            return False
        self.practice_only = True
        self.selected = None
        self.phase = "observe"
        self.elapsed = 0.0
        self.paused = False
        return True

    def restart(self) -> None:
        self.practice_only = True
        self._root()

    def advance(self) -> bool:
        if self.phase != "feedback":
            return False
        assert self.feedback is not None
        destination = self.feedback.next_node
        if destination is not None:
            self.node_id = destination
            self.phase = "observe"
            self.selected = None
            self.elapsed = 0.0
        elif self.index + 1 < len(self.episodes):
            self.index += 1
            self.practice_only = False
            self._root()
        else:
            self.phase = "summary"
        return True

    def summary(self) -> tuple[int, int, int]:
        return (sum(r > 0 for r in self.results.values()), len(self.results), len(self.practice))
