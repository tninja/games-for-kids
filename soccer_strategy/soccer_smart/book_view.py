"""Book-topic navigation; existing sessions and cards provide the actual play."""

import pygame

from .book import Lesson, lessons
from .book_cards import build_book_cards
from .book_tactics import build_book_scenes
from .catalog import build_catalog, build_practice_cards
from .drawing import Button, GREEN, GOLD, MUTED, Painter

CATEGORIES = (("skills", "Skills"), ("tactics", "Tactics"), ("players", "Watch a player"),
              ("adults", "For adults"), ("start", "Getting started"))
PAGE_SIZE = 6


class BookBrowser:
    def __init__(self) -> None:
        self.entries = lessons()
        self.scenes = {s.id: s for s in (*build_catalog(), *build_book_scenes())}
        self.cards = {c.id: c for c in (*build_practice_cards(), *build_book_cards())}
        self.category: str | None = None
        self.page = 0
        self.selected: Lesson | None = None

    @property
    def items(self) -> tuple[Lesson, ...]:
        return tuple(e for e in self.entries if e.category == self.category)

    @property
    def visible(self) -> tuple[Lesson, ...]:
        return self.items[self.page * PAGE_SIZE:(self.page + 1) * PAGE_SIZE]

    def choose_category(self, category: str) -> None:
        if category not in dict(CATEGORIES):
            raise ValueError("Unknown book category")
        self.category, self.page = category, 0

    def select(self, page: int) -> Lesson:
        self.selected = next(e for e in self.entries if e.page == page)
        return self.selected

    def change_page(self, delta: int) -> None:
        last = max(0, (len(self.items) - 1) // PAGE_SIZE)
        self.page = max(0, min(last, self.page + delta))

    def number_action(self, number: int) -> str | None:
        actions = (["book_category:" + key for key, _ in CATEGORIES] if self.category is None else
                   [f"book_entry:{e.page}" for e in self.visible])
        return actions[number] if 0 <= number < len(actions) else None

    def buttons(self) -> list[Button]:
        if self.category is None:
            return [Button(pygame.Rect(814, 330 + i * 78, 410, 64),
                           f"{title} / {sum(e.category == key for e in self.entries)} topics",
                           "book_category:" + key, str(i+1)) for i, (key, title) in enumerate(CATEGORIES)]
        rows = [Button(pygame.Rect(814, 314 + i * 62, 410, 54), f"p.{e.page} / {e.title}",
                       f"book_entry:{e.page}", str(i+1)) for i, e in enumerate(self.visible)]
        return rows + [Button(pygame.Rect(814, 700, 195, 48), "Previous / Left", "book_prev"),
                       Button(pygame.Rect(1024, 700, 200, 48), "Next / Right", "book_next"),
                       Button(pygame.Rect(814, 758, 410, 48), "Topic categories", "book_categories")]

    def draw(self, painter: Painter) -> None:
        painter.text("Book companion", pygame.Rect(814, 162, 410, 50), 37, GREEN)
        if self.category is None:
            message = "Original practice for the indexed topics.\nChapter text has not been checked."
        else:
            pages = max(1, (len(self.items) + PAGE_SIZE - 1) // PAGE_SIZE)
            message = f"{dict(CATEGORIES)[self.category]} / page {self.page+1} of {pages}\nChoose 1-6 or click a topic."
        painter.text(message, pygame.Rect(814, 224, 410, 90), 24, MUTED)
        painter.text("EXPLORE\nTRY\nCOMPARE", pygame.Rect(120, 320, 560, 280), 70, GREEN)
        painter.text("Physical activities and observation cards are unscored.\nHeading practice is deferred in John's profile.",
                     pygame.Rect(78, 660, 630, 90), 23, GOLD)
