"""Canonical sections and book theme groups for Soccer Smart Lab."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Section:
    id: int
    title: str
    description: str
    topics: tuple[int, ...]


@dataclass(frozen=True)
class ThemeGroup:
    id: str
    title: str
    locators: tuple[int, ...]
    evidence: str = "INDEX_ONLY"
    review_status: str = "FULL_TEXT_PENDING"


SECTIONS: tuple[Section, ...] = (
    Section(1, "Read and receive", "first touch, shielding, turning", (1, 2, 3)),
    Section(2, "Pass, carry, support", "open lanes, width, off-ball angles", (4, 5, 6)),
    Section(3, "Find attacking space", "wing carries, triangles, finishing", (7, 8, 9)),
    Section(4, "Defend and recover", "delay, cover teammates, loose passes", (10, 11, 12)),
)
SECTION_IDS: tuple[int, ...] = tuple(section.id for section in SECTIONS)
MIXED_STAGE = 5
CARDS_STAGE = 6
PLAYABLE_STAGES: tuple[int, ...] = (*SECTION_IDS, MIXED_STAGE)
BOOK_STAGE = 7
BOOK_TACTIC_PAGES = (67, 75, 86, 88, 90, 103, 118, 123, 127, 130, 133, 150, 153, 156)

GROUPS: tuple[ThemeGroup, ...] = (
    ThemeGroup("G01", "Control and first touch", (20, 22, 24)),
    ThemeGroup("G02", "Pass distance", (26, 29, 34)),
    ThemeGroup("G03", "Shaped delivery", (36, 39, 58)),
    ThemeGroup("G04", "Specialty finishes", (42, 44)),
    ThemeGroup("G05", "Protection and both-foot touch", (46, 48, 50)),
    ThemeGroup("G06", "Finishing windows", (52, 54)),
    ThemeGroup("G07", "Aerial heading", (61,)),
    ThemeGroup("G08", "Observation and patterns", (64, 67, 90)),
    ThemeGroup("G09", "Space, reception and width", (70, 73, 78)),
    ThemeGroup("G10", "Position legality", (75,)),
    ThemeGroup("G11", "Goal-side recovery", (81,)),
    ThemeGroup("G12", "Sideline restarts", (86, 88)),
    ThemeGroup("G13", "Carrying, bypass and selection", (93, 98, 103, 105)),
    ThemeGroup("G14", "Ball-carrier support", (109,)),
    ThemeGroup("G15", "Defensive unit cover", (113, 118, 150)),
    ThemeGroup("G16", "Wide delivery", (123, 127)),
    ThemeGroup("G17", "Space, lines and triangles", (130, 133, 138, 153)),
    ThemeGroup("G18", "Duels and regaining", (144, 147)),
    ThemeGroup("G19", "Scoring preparation", (156,)),
    ThemeGroup("G20", "Player features", (32, 56, 84, 96, 116, 142)),
    ThemeGroup("G21", "Parent material", (160, 162, 163, 164, 165)),
    ThemeGroup("G22", "Orientation", (8, 11)),
    ThemeGroup("G23", "Off-field preparation", (), evidence="OVERVIEW_ONLY"),
)
GROUP_IDS: tuple[str, ...] = tuple(group.id for group in GROUPS)


def section_for_topic(topic: int) -> int:
    for section in SECTIONS:
        if topic in section.topics:
            return section.id
    raise ValueError(f"Topic {topic} has no training section")


def group_for_id(group_id: str) -> ThemeGroup:
    for group in GROUPS:
        if group.id == group_id:
            return group
    raise ValueError(f"Unknown theme group: {group_id}")
