"""Untimed choices and first-attempt encouragement."""


from dataclasses import dataclass, replace
from math import isfinite
from random import Random

from .content import CASES, SKILLS
from .match_content import MATCH_GROUPS
from .model import Picture, Skill

WATCH_SECONDS = 1.8
SHOW_SECONDS = 2.8
ATTEMPT_SECONDS = 2.4


def make_round(skill: str, seed: int) -> tuple[Picture, ...]:
    if skill not in ("all", *(s.id for s in SKILLS)):
        raise ValueError("Choose a skill from the menu")
    rng = Random(seed)
    if skill == "match":
        selected = [rng.choice([p for p in CASES if p.id in group]) for group in MATCH_GROUPS]
    elif skill == "all":
        selected = [rng.choice([p for p in CASES if p.skill == item.id]) for item in SKILLS]
        for item in rng.sample(SKILLS, 6 - len(SKILLS)):
            selected.append(rng.choice([p for p in CASES if p.skill == item.id and p not in selected]))
    else:
        selected = rng.sample([p for p in CASES if p.skill == skill], 6)
    rng.shuffle(selected)
    result = []
    for picture in selected:
        picture.validate()
        choices = list(picture.choices)
        rng.shuffle(choices)
        result.append(replace(picture, choices=tuple(choices)))
    return tuple(result)


@dataclass(frozen=True)
class Progress:
    skill: Skill
    correct: int
    total: int


class Session:
    def __init__(self, skill: str = "all", seed: int = 0):
        self.pictures = make_round(skill, seed)
        self.index = 0
        self.phase = "watch"
        self.elapsed = 0.
        self.selected: int | None = None
        self.results: dict[str, bool] = {}

    @property
    def picture(self) -> Picture:
        return self.pictures[self.index]

    @property
    def fraction(self) -> float:
        duration = {"watch": WATCH_SECONDS, "attempt": ATTEMPT_SECONDS}.get(self.phase, SHOW_SECONDS)
        return min(1., self.elapsed / duration)

    @property
    def selected_key(self) -> str | None:
        return self.picture.choices[self.selected] if self.selected is not None else None

    @property
    def stars(self) -> int:
        return sum(self.results.values())

    @property
    def chosen_good(self) -> bool:
        return self.selected is not None and self.picture.choices[self.selected] == self.picture.answer

    def tick(self, seconds: float) -> None:
        if not isfinite(seconds) or seconds < 0:
            raise ValueError("Time must be finite and nonnegative")
        if self.phase not in ("watch", "attempt", "show"):
            return
        self.elapsed += seconds
        if self.fraction >= 1:
            if self.phase == "attempt":
                self.phase = "show"
                self.elapsed = 0.
            else:
                self.phase = "choose" if self.phase == "watch" else "feedback"

    def choose(self, index: int) -> bool:
        if self.phase != "choose" or not isinstance(index, int) or not 0 <= index < len(self.picture.choices):
            return False
        key = self.picture.choices[index]
        good = key == self.picture.answer
        self.results.setdefault(self.picture.id, good)
        self.selected = index
        self.phase = "show" if good else "attempt"
        self.elapsed = 0.
        return True

    def replay(self) -> bool:
        if self.phase != "feedback":
            return False
        self.phase = "show"
        self.elapsed = 0.
        return True

    def retry(self) -> bool:
        if self.phase != "feedback":
            return False
        self.phase = "watch"
        self.elapsed = 0.
        self.selected = None
        return True

    def advance(self) -> bool:
        if self.phase != "feedback":
            return False
        if self.index == len(self.pictures) - 1:
            self.phase = "summary"
        else:
            self.index += 1
            self.phase = "watch"
        self.elapsed = 0.
        self.selected = None
        return True

    def progress(self) -> tuple[Progress, ...]:
        result = []
        for skill in SKILLS:
            done = [p for p in self.pictures if p.skill == skill.id and p.id in self.results]
            if done:
                result.append(Progress(skill, sum(self.results[p.id] for p in done), len(done)))
        return tuple(result)

    @property
    def practice_skill(self) -> Skill | None:
        needs_help = [p for p in self.progress() if p.correct < p.total]
        if not needs_help:
            return None
        return min(needs_help, key=lambda p: p.correct / p.total).skill
