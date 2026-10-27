"""Canonical training sections shared by content, sessions and the menu."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Section:
    id: int
    title: str
    description: str
    topics: tuple[int, ...]


SECTIONS = (
    Section(1, "1v1 basics", "patience and timing", (1, 2, 3, 5, 6)),
    Section(2, "Protect the goal", "shots, crosses, slides", (4, 15, 16, 17, 18, 28)),
    Section(3, "Recover and cover", "get back and help", (7, 8, 9, 10, 11)),
    Section(4, "Read passes and runs", "two attackers, one-twos", (12, 13, 14)),
    Section(5, "Use the ball", "throws, passes, long kicks", (19, 20, 21, 25, 26, 27, 29)),
    Section(6, "Defend restarts", "sidelines, corners, free kicks", (22, 23, 24)),
)
SECTION_IDS = tuple(section.id for section in SECTIONS)


def section_for_topic(topic: int) -> int:
    for section in SECTIONS:
        if topic in section.topics:
            return section.id
    raise ValueError(f"Topic {topic} has no training section")
