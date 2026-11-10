"""Finite play graphs; links preserve the actual selected action's geometry."""

from dataclasses import dataclass

from .model import Scenario
from .presentation import positions


@dataclass(frozen=True)
class PlayNode:
    scene: Scenario
    exits: tuple[tuple[str, str | None], ...]


@dataclass(frozen=True)
class Play:
    id: str
    family: int
    title: str
    nodes: tuple[PlayNode, ...]

    def node(self, key: str) -> PlayNode:
        return {n.scene.id: n for n in self.nodes}[key]

    def validate(self) -> None:
        if (not self.id or not self.title or not 1 <= self.family <= 8 or not self.nodes
                or len({n.scene.id for n in self.nodes}) != len(self.nodes)):
            raise ValueError("Invalid play identity or nodes")
        for node in self.nodes:
            self._links(node)
        reached: set[str] = set()
        self._visit(self.nodes[0].scene.id, set(), reached, 1)
        if reached != {n.scene.id for n in self.nodes}:
            raise ValueError("Unreachable play node")

    def _links(self, node: PlayNode) -> None:
        scene = node.scene
        scene.validate()
        if (len(node.exits) != 3
                or {key for key, _ in node.exits} != {c.key for c in scene.choices}):
            raise ValueError("Every choice needs an explicit exit")
        for index, choice in enumerate(scene.choices):
            key = dict(node.exits)[choice.key]
            if key is None:
                continue
            if key not in {n.scene.id for n in self.nodes}:
                raise ValueError("Unknown play destination")
            successor = self.node(key).scene
            end = positions(scene, "outcome", 1, index)
            if (end != ({a.key: a.position for a in successor.actors}, successor.ball)
                    or end != positions(successor, "observe", 0, None)):
                raise ValueError("Play link teleports actors or ball")

    def _visit(self, key: str, active: set[str], reached: set[str], depth: int) -> None:
        if key in active or depth > 3:
            raise ValueError("Play cycle or more than three decisions")
        reached.add(key)
        for _, target in self.node(key).exits:
            if target is None:
                if depth < 2:
                    raise ValueError("Play ends before a second decision")
            else:
                self._visit(target, active | {key}, reached, depth + 1)
