"""Choice-keyed play traversal using the existing untimed decision phases."""

from dataclasses import replace
from random import Random

from .model import Scenario
from .play_content import build_plays
from .play_model import Play
from .session import Session, _shuffle_choices


def make_play_round(family: int = 0, seed: int = 0) -> tuple[Play, ...]:
    if family not in range(9):
        raise ValueError("Choose a play family from zero through eight")
    rng = Random(seed)
    catalog = build_plays()
    if family:
        chosen = [p for p in catalog if p.family == family]
        rng.shuffle(chosen)
    else:
        chosen = [rng.choice([p for p in catalog if p.family == f]) for f in rng.sample(range(1,9),4)]
    result = []
    for play in chosen:
        scenes = _shuffle_choices(tuple(n.scene for n in play.nodes),rng)
        result.append(replace(play,nodes=tuple(replace(n,scene=s) for n,s in zip(play.nodes,scenes))))
    return tuple(result)


class ContinuousSession(Session):
    def __init__(self, family: int = 0, seed: int = 0):
        self.plays = make_play_round(family,seed)
        self.scenes = tuple(n.scene for p in self.plays for n in p.nodes)
        self.stage, self.index, self.depth = 8, 0, 1
        self.results: dict[str,int] = {}
        self.practice_only = False
        self.node_id = self.play.nodes[0].scene.id
        self._observe()

    @property
    def play(self) -> Play:
        return self.plays[self.index]

    @property
    def scene(self) -> Scenario:
        return self.play.node(self.node_id).scene

    @property
    def next_label(self) -> str:
        if self.feedback is not None and dict(self.play.node(self.node_id).exits)[self.feedback.key] is not None:
            return "Continue this play / N"
        return "Next play / N" if self.index+1 < len(self.plays) else "See round summary / N"

    def _record_choice(self, index: int) -> None:
        if not self.practice_only:
            self.results.setdefault(self.scene.id,self.scene.choices[index].rating)

    def retry(self) -> bool:
        if not super().retry():
            return False
        self.practice_only = True
        return True

    def advance(self) -> bool:
        if self.phase != "feedback" or self.feedback is None:
            return False
        destination = dict(self.play.node(self.node_id).exits)[self.feedback.key]
        if destination is not None:
            self.node_id = destination
            self.depth += 1
        elif self.index+1 < len(self.plays):
            self.index += 1
            self.node_id = self.play.nodes[0].scene.id
            self.depth, self.practice_only = 1, False
        else:
            self.phase = "summary"
            self.selected = None
            return True
        self._observe()
        return True

    def summary(self) -> tuple[int,int,int,int]:
        return sum(r > 0 for r in self.results.values()),len(self.results),0,0
