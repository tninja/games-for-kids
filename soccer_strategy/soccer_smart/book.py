"""Paraphrased public-index leaves and honest destinations in the companion."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Lesson:
    page: int
    title: str
    category: str
    group: str
    scene_ids: tuple[str, ...] = ()
    card_id: str = ""
    status: str = "ACTIVITY"
    review_status: str = "FULL_TEXT_PENDING"
    evidence: str = "INDEX_ONLY"


def activity(page: int, title: str, category: str, group: str,
             card: str = "", deferred: bool = False) -> Lesson:
    return Lesson(page, title, category, group, card_id=card or f"bk{page:03d}",
                  status="DEFERRED" if deferred else "ACTIVITY")


def legacy(topic: int, variants: str = "ABC") -> tuple[str, ...]:
    return tuple(f"T{topic:02d}.{v}" for v in variants)


def added(page: int) -> tuple[str, ...]:
    variants = "ABC" if page == 75 else "AB"
    return tuple(f"B{page:03d}.{v}" for v in variants)


def strategy(page: int, title: str, group: str, scenes: tuple[str, ...]) -> Lesson:
    return Lesson(page, title, "tactics", group, scenes, status="SCENES")


def lessons() -> tuple[Lesson, ...]:
    entries = (
        activity(8, "Getting started", "start", "G22"),
        activity(11, "Read the pitch", "start", "G22"),
        activity(20, "Ground control", "skills", "G01", "touch-and-look"),
        activity(22, "Cushion a pass", "skills", "G01", "touch-and-look"),
        activity(24, "Thigh and chest", "skills", "G01"),
        activity(26, "Short delivery", "skills", "G02"),
        activity(29, "Medium delivery", "skills", "G02"),
        activity(34, "Long delivery", "skills", "G02"),
        activity(36, "Inside bend", "skills", "G03"),
        activity(39, "Lifted chip", "skills", "G03"),
        activity(42, "Volley choice", "skills", "G04"),
        activity(44, "Penalty routine", "skills", "G04"),
        activity(46, "Body protection", "skills", "G05", "keep-it-close"),
        activity(48, "Ball familiarity", "skills", "G05"),
        activity(50, "Both feet", "skills", "G05", "two-foot-explorer"),
        activity(52, "Box finishing", "skills", "G06", "find-the-window"),
        activity(54, "Keeper picture", "skills", "G06", "find-the-window"),
        activity(58, "Outside bend", "skills", "G03"),
        activity(61, "Heading overview", "skills", "G07", deferred=True),
        activity(64, "Observe a match", "tactics", "G08", "watch-a-player"),
        strategy(67, "Anticipate a pattern", "G08", added(67)),
        strategy(70, "Use available space", "G09", legacy(4) + legacy(7)),
        strategy(73, "Prepare to receive", "G09", legacy(6) + legacy(1)),
        strategy(75, "Time the run", "G10", added(75)),
        strategy(78, "Play from width", "G09", legacy(7)),
        strategy(81, "Recover goal-side", "G11", legacy(10, "C")),
        strategy(86, "Choose a throw", "G12", added(86)),
        strategy(88, "Offer for a throw", "G12", added(88)),
        strategy(90, "Combine in a pattern", "G08", added(90)),
        strategy(93, "Carry or release", "G13", legacy(4)),
        strategy(98, "Progress past pressure", "G13", added(90) + added(133)),
        strategy(103, "Separate without the ball", "G13", added(103)),
        strategy(105, "Pick a delivery", "G13", legacy(5)),
        strategy(109, "Support the carrier", "G14", legacy(6)),
        strategy(113, "Defend with support", "G15", legacy(11)),
        strategy(118, "Read the defensive line", "G15", added(118)),
        strategy(123, "Deliver from width", "G16", added(123)),
        strategy(127, "Protect against delivery", "G16", added(127)),
        strategy(130, "Open space for others", "G17", added(130)),
        strategy(133, "Progress through a line", "G17", added(133)),
        strategy(138, "Use a triangle", "G17", legacy(8)),
        strategy(144, "Defend a duel", "G18", legacy(10, "AB")),
        strategy(147, "Regain possession", "G18", legacy(12)),
        strategy(150, "Move the line together", "G15", added(150)),
        strategy(153, "Re-form the triangle", "G17", added(153)),
        strategy(156, "Arrive for a chance", "G19", added(156)),
        activity(32, "Watch David Beckham", "players", "G20"),
        activity(56, "Watch Christine Sinclair", "players", "G20"),
        activity(84, "Watch Mia Hamm", "players", "G20"),
        activity(96, "Watch Lionel Messi", "players", "G20"),
        activity(116, "Watch Alex Morgan", "players", "G20"),
        activity(142, "Watch Cristiano Ronaldo", "players", "G20"),
        activity(160, "Notice progress", "adults", "G21"),
        activity(162, "Make practice inviting", "adults", "G21"),
        activity(163, "An adult's role", "adults", "G21"),
        activity(164, "Support on match day", "adults", "G21"),
        activity(165, "Listen after play", "adults", "G21"),
    )
    return tuple(sorted(entries, key=lambda entry: entry.page))
