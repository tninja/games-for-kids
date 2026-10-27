"""Timed demonstrations and untimed decisions; score first attempts only."""

from dataclasses import replace
from math import isfinite
from random import Random

from .catalog import build_catalog
from .curriculum import SECTION_IDS
from .model import Choice, Scenario, transfer_scene

ANIMATION_SECONDS = 2.4


def make_playlist(stage: int, seed: int) -> tuple[Scenario, ...]:
    if stage not in SECTION_IDS:
        raise ValueError("Choose a training section from 1 to 6")
    rng = Random(seed)
    pool = [s for s in build_catalog() if s.stage == stage]
    topics = sorted({s.topic for s in pool})
    if stage != 1:
        rng.shuffle(topics)
    practice = [rng.choice([s for s in pool if s.topic == topic]) for topic in topics[:6]]
    selected = {s.id for s in practice}
    remaining = [s for s in pool if s.id not in selected]
    practice.extend(rng.sample(remaining, 6 - len(practice)))
    used = {s.id for s in practice}
    held_out = [s for s in pool if s.id not in used and s.topic in topics[:6]]
    transfer = [transfer_scene(s, rng.choice((.92, .96, 1.02)))
                for s in rng.sample(held_out, 2)]
    result = []
    for scene in practice + transfer:
        choices = list(scene.choices)
        rng.shuffle(choices)
        result.append(replace(scene, choices=tuple(choices)))
    return tuple(result)


class Session:
    def __init__(self, stage: int = 1, seed: int = 0):
        self.scenes = make_playlist(stage, seed)
        self.stage = stage
        self.index = 0
        self.phase = "observe"
        self.elapsed = 0.0
        self.selected: int | None = None
        self.results: dict[str, int] = {}

    @property
    def scene(self) -> Scenario:
        return self.scenes[self.index]

    @property
    def feedback(self) -> Choice | None:
        if self.selected is None:
            return None
        return self.scene.choices[self.selected]

    @property
    def fraction(self) -> float:
        return min(1.0, self.elapsed / ANIMATION_SECONDS)

    def tick(self, seconds: float) -> None:
        if not isfinite(seconds) or seconds < 0:
            raise ValueError("Elapsed time must be finite and nonnegative")
        if self.phase not in ("observe", "outcome"):
            return
        self.elapsed += seconds
        if self.elapsed >= ANIMATION_SECONDS:
            self.phase = "decide" if self.phase == "observe" else "feedback"
            self.elapsed = 0.0

    def choose(self, index: int) -> bool:
        if self.phase != "decide" or not 0 <= index < 3:
            return False
        self.selected = index
        self.results.setdefault(self.scene.id, self.scene.choices[index].rating)
        self.phase = "outcome"
        self.elapsed = 0.0
        return True

    def retry(self) -> bool:
        if self.phase != "feedback":
            return False
        self._observe()
        return True

    def advance(self) -> bool:
        if self.phase != "feedback":
            return False
        self.selected = None
        if self.index == len(self.scenes) - 1:
            self.phase = "summary"
        else:
            self.index += 1
            self._observe()
        return True

    def _observe(self) -> None:
        self.phase = "observe"
        self.elapsed = 0.0
        self.selected = None

    def summary(self) -> tuple[int, int, int, int]:
        practice = [s for s in self.scenes if not s.transfer and s.id in self.results]
        transfer = [s for s in self.scenes if s.transfer and s.id in self.results]
        return (sum(self.results[s.id] > 0 for s in practice), len(practice),
                sum(self.results[s.id] > 0 for s in transfer), len(transfer))
