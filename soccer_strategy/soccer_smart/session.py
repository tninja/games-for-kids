"""Timed demonstrations, untimed decisions, coach comparison, and round scheduling."""

from dataclasses import replace
from math import isfinite
from random import Random

from .catalog import build_catalog
from .curriculum import MIXED_STAGE, PLAYABLE_STAGES, SECTIONS
from .model import Choice, Scenario, transfer_scene

ANIMATION_SECONDS = 2.4
TRANSFER_SCALES = (0.92, 0.96, 1.04)


def _section_round(catalog: tuple[Scenario, ...], stage: int, rng: Random) -> list[Scenario]:
    pool = [s for s in catalog if s.stage == stage]
    topics = sorted({s.topic for s in pool})
    rng.shuffle(topics)
    practice: list[Scenario] = []
    held_out: list[Scenario] = []
    for topic in topics:
        variants = [s for s in pool if s.topic == topic]
        rng.shuffle(variants)
        practice.extend(variants[:2])
        held_out.append(variants[2])
    rng.shuffle(practice)
    transfer = [transfer_scene(s, rng.choice(TRANSFER_SCALES))
                for s in rng.sample(held_out, 2)]
    return practice + transfer


def _mixed_round(catalog: tuple[Scenario, ...], rng: Random) -> list[Scenario]:
    chosen_topics = [rng.choice(section.topics) for section in SECTIONS]
    remaining_topics = [t for s in SECTIONS for t in s.topics if t not in chosen_topics]
    chosen_topics.extend(rng.sample(remaining_topics, 2))
    rng.shuffle(chosen_topics)
    practice: list[Scenario] = []
    held_out: list[Scenario] = []
    for topic in chosen_topics:
        variants = [s for s in catalog if s.topic == topic]
        rng.shuffle(variants)
        practice.append(variants[0])
        held_out.append(variants[1])
    transfer = [transfer_scene(s, rng.choice(TRANSFER_SCALES))
                for s in rng.sample(held_out, 2)]
    return practice + transfer


def make_playlist(stage: int, seed: int) -> tuple[Scenario, ...]:
    if stage not in PLAYABLE_STAGES:
        raise ValueError(f"Choose a playable stage from {PLAYABLE_STAGES}")
    rng = Random(seed)
    catalog = build_catalog()
    scenes = (_mixed_round(catalog, rng) if stage == MIXED_STAGE
              else _section_round(catalog, stage, rng))
    return _shuffle_choices(scenes, rng)


def _shuffle_choices(scenes: list[Scenario] | tuple[Scenario, ...], rng: Random) -> tuple[Scenario, ...]:
    result: list[Scenario] = []
    for scene in scenes:
        choices = list(scene.choices)
        rng.shuffle(choices)
        result.append(replace(scene, choices=tuple(choices)))
    return tuple(result)


class Session:
    def __init__(self, stage: int = 1, seed: int = 0, scenes: tuple[Scenario, ...] | None = None):
        if scenes is not None:
            if not scenes:
                raise ValueError("A lesson round requires at least one scene")
            for scene in scenes:
                scene.validate()
        self.scenes = make_playlist(stage, seed) if scenes is None else _shuffle_choices(scenes, Random(seed))
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
        if not isfinite(seconds) or seconds < 0.0:
            raise ValueError("Elapsed time must be finite and nonnegative")
        if self.phase not in ("observe", "outcome", "coach"):
            return
        self.elapsed += seconds
        if self.elapsed >= ANIMATION_SECONDS:
            self.phase = "decide" if self.phase == "observe" else "feedback"
            self.elapsed = 0.0

    def choose(self, index: int) -> bool:
        if self.phase != "decide" or not 0 <= index < 3:
            return False
        self.selected = index
        self._record_choice(index)
        self.phase = "outcome"
        self.elapsed = 0.0
        return True

    def _record_choice(self, index: int) -> None:
        self.results.setdefault(self.scene.id, self.scene.choices[index].rating)

    def compare_coach(self) -> bool:
        if self.phase != "feedback":
            return False
        self.phase = "coach"
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
