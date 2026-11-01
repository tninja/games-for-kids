"""Canonical training sections shared by content, sessions and the menu."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Section:
    id: int
    title: str
    description: str
    topics: tuple[int, ...]


SECTIONS = (
    Section(1, "1v1 basics", "patience and timing", (1, 2, 3, 5, 6, 28)),
    Section(2, "Defend shooting", "shot lines, angles, distance", (4, 31, 32, 33, 34)),
    Section(3, "Recover and cover", "get back and help", (7, 8, 9, 10, 11, 30)),
    Section(4, "Read passes and runs", "combinations and crosses", (12, 13, 14, 15, 16, 17)),
    Section(5, "Use the ball", "throws, passes, long kicks", (18, 19, 20, 21, 25, 26, 27, 29)),
    Section(6, "Defend restarts", "sidelines, corners, free kicks", (22, 23, 24)),
    Section(7, "Receive and decide", "keeper, backfield, midfield", (35, 36, 37, 38)),
)
SECTION_IDS = tuple(section.id for section in SECTIONS)


def section_for_topic(topic: int) -> int:
    for section in SECTIONS:
        if topic in section.topics:
            return section.id
    raise ValueError(f"Topic {topic} has no training section")
