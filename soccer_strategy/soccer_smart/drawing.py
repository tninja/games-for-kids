"""Small Pygame drawing primitives for the full-field Soccer Smart Lab."""

from dataclasses import dataclass
from math import hypot

import pygame

from .model import Point

WIDTH, HEIGHT = 1280, 880
INK = (231, 241, 244)
MUTED = (157, 181, 190)
NAVY = (14, 29, 40)
PANEL = (24, 44, 57)
GREEN = (159, 235, 164)
GOLD = (255, 207, 107)
CORAL = (249, 143, 121)
BLUE = (96, 190, 247)
PITCH = pygame.Rect(52, 174, 694, 590)
SIDE = pygame.Rect(790, 140, 458, 676)


@dataclass(frozen=True)
class Button:
    rect: pygame.Rect
    label: str
    action: str
    number: str = ""


class Painter:
    def __init__(self, surface: pygame.Surface):
        self.surface = surface
        self.fonts: dict[int, pygame.font.Font] = {}
        self.errors: list[str] = []

    def font(self, size: int) -> pygame.font.Font:
        if size not in self.fonts:
            self.fonts[size] = pygame.font.Font(None, size)
        return self.fonts[size]

    def text(self, message: str, rect: pygame.Rect, size: int = 25,
             color: tuple[int, int, int] = INK) -> int:
        font = self.font(size)
        lines: list[str] = []
        for paragraph in message.split("\n"):
            line = ""
            for word in paragraph.split():
                candidate = f"{line} {word}".strip()
                if line and font.size(candidate)[0] > rect.width:
                    lines.append(line)
                    line = word
                else:
                    line = candidate
            lines.append(line)
        height = len(lines) * font.get_linesize()
        if height > rect.height or any(font.size(line)[0] > rect.width for line in lines):
            self.errors.append(message)
        for i, line in enumerate(lines):
            self.surface.blit(font.render(line, True, color),
                              (rect.x, rect.y + i * font.get_linesize()))
        return height

    def panel(self, rect: pygame.Rect, color: tuple[int, int, int] = PANEL) -> None:
        pygame.draw.rect(self.surface, color, rect, border_radius=18)

    def button(self, button: Button, hovered: bool = False) -> None:
        self.panel(button.rect, (48, 77, 86) if hovered else (34, 59, 73))
        pygame.draw.rect(self.surface, GREEN if hovered else (67, 95, 107),
                         button.rect, 2, border_radius=14)
        offset = 16
        if button.number:
            badge = pygame.Rect(button.rect.x + 12, button.rect.y + 15, 30, 30)
            pygame.draw.circle(self.surface, GOLD, badge.center, 15)
            self.text(button.number, badge.move(9, 4), 24, NAVY)
            offset = 54
        box = pygame.Rect(button.rect.x + offset, button.rect.y + 12,
                          button.rect.width - offset - 16, button.rect.height - 16)
        self.text(button.label, box, 24)


def pitch_point(point: Point) -> tuple[int, int]:
    return (round(PITCH.x + point[0] / 100.0 * PITCH.width),
            round(PITCH.y + point[1] / 100.0 * PITCH.height))


def _arrow_head(surface: pygame.Surface, end: tuple[int, int],
                ux: float, uy: float, head: float,
                color: tuple[int, int, int]) -> None:
    px, py = -uy, ux
    base = (end[0] - ux * head, end[1] - uy * head)
    outer = [end, (base[0] + px * 10, base[1] + py * 10),
             (base[0] - px * 10, base[1] - py * 10)]
    inner_tip = (end[0] - ux * 2, end[1] - uy * 2)
    inner_base = (base[0] + ux * 2, base[1] + uy * 2)
    inner = [inner_tip, (inner_base[0] + px * 6, inner_base[1] + py * 6),
             (inner_base[0] - px * 6, inner_base[1] - py * 6)]
    pygame.draw.polygon(surface, NAVY, outer)
    pygame.draw.polygon(surface, color, inner)
    pygame.draw.circle(surface, NAVY, end, 12, 3)
    pygame.draw.circle(surface, color, end, 8, 3)


def arrow(surface: pygame.Surface, start: tuple[int, int], end: tuple[int, int],
          color: tuple[int, int, int]) -> None:
    dx, dy = end[0] - start[0], end[1] - start[1]
    length = hypot(dx, dy)
    if length < 38:
        pygame.draw.circle(surface, NAVY, end, 12, 4)
        pygame.draw.circle(surface, color, end, 8, 3)
        return
    ux, uy = dx / length, dy / length
    shaft_start = (start[0] + ux * 25, start[1] + uy * 25)
    head = min(20.0, length * 0.45)
    shaft_end = (end[0] - ux * head * 0.72, end[1] - uy * head * 0.72)
    pygame.draw.line(surface, NAVY, shaft_start, shaft_end, 9)
    pygame.draw.line(surface, color, shaft_start, shaft_end, 5)
    _arrow_head(surface, end, ux, uy, head, color)


def dashed_arrow(surface: pygame.Surface, start: tuple[int, int], end: tuple[int, int],
                 color: tuple[int, int, int]) -> None:
    dx, dy = end[0] - start[0], end[1] - start[1]
    length = hypot(dx, dy)
    if length < 38:
        pygame.draw.circle(surface, NAVY, end, 12, 4)
        pygame.draw.circle(surface, color, end, 8, 3)
        return
    ux, uy = dx / length, dy / length
    head = min(20.0, length * 0.45)
    stop = max(25, int(length - head * 0.75))
    for offset in range(25, stop, 20):
        tail = (start[0] + ux * offset, start[1] + uy * offset)
        tip = (start[0] + ux * min(offset + 12, stop),
               start[1] + uy * min(offset + 12, stop))
        pygame.draw.line(surface, NAVY, tail, tip, 9)
        pygame.draw.line(surface, color, tail, tip, 5)
    _arrow_head(surface, end, ux, uy, head, color)


def draw_window_marker(surface: pygame.Surface, point: tuple[int, int]) -> None:
    pygame.draw.circle(surface, NAVY, point, 24, 7)
    pygame.draw.circle(surface, BLUE, point, 21, 3)


def draw_pitch(p: Painter, role: str = "") -> None:
    p.panel(pygame.Rect(28, 140, 742, 676), (24, 61, 52))
    for i in range(10):
        stripe = pygame.Rect(PITCH.x, PITCH.y + i * 59, PITCH.width, 59)
        pygame.draw.rect(p.surface, (43, 116, 82) if i % 2 else (48, 128, 90), stripe)
    white = (190, 222, 191)
    pygame.draw.rect(p.surface, white, PITCH, 2)
    mid_y = pitch_point((50.0, 50.0))[1]
    pygame.draw.line(p.surface, white, (PITCH.left, mid_y), (PITCH.right, mid_y), 2)
    pygame.draw.circle(p.surface, white, pitch_point((50.0, 50.0)), 52, 2)
    for top_y, height in ((0.0, 18.0), (82.0, 18.0)):
        box = pygame.Rect(pitch_point((22.0, top_y)),
                          (round(PITCH.width * 0.56), round(PITCH.height * height / 100.0)))
        pygame.draw.rect(p.surface, white, box, 2)
    top_goal = pygame.Rect(PITCH.centerx - 65, PITCH.top - 18, 130, 18)
    bot_goal = pygame.Rect(PITCH.centerx - 65, PITCH.bottom, 130, 18)
    for goal in (top_goal, bot_goal):
        pygame.draw.rect(p.surface, (210, 228, 224), goal, 2)
    role_text = f"ROLE: {role.upper()}" if role else "FULL PITCH  /  ATTACK UP"
    p.text(role_text, pygame.Rect(52, 146, 310, 24), 21, GOLD)
    p.text("ATTACK GOAL", pygame.Rect(PITCH.centerx + 76, 146, 170, 24), 21, GREEN)
    p.text("OUR GOAL", pygame.Rect(PITCH.centerx - 45, 792, 150, 22), 21, GREEN)


def draw_player(p: Painter, point: Point, label: str, team: str,
                heading: Point = (0.0, -1.0)) -> None:
    x, y = pitch_point(point)
    color = {"home": BLUE, "away": CORAL, "keeper": GOLD}[team]
    pygame.draw.ellipse(p.surface, (30, 75, 55), (x - 17, y + 9, 36, 12))
    pygame.draw.circle(p.surface, NAVY, (x, y), 18)
    pygame.draw.circle(p.surface, color, (x, y), 15)
    length = max(hypot(*heading), 1.0)
    dx, dy = heading[0] / length, heading[1] / length
    for side in (-1, 1):
        foot = (round(x - dx * 18 + side * dy * 8), round(y - dy * 18 - side * dx * 8))
        pygame.draw.line(p.surface, (25, 49, 62), (x, y), foot, 4)
    pygame.draw.circle(p.surface, (245, 208, 163), (round(x + dx * 13), round(y + dy * 13)), 7)
    label_width = p.font(21).size(label)[0] + 12
    box = pygame.Rect(x - label_width // 2, y - 46, label_width, 22)
    pygame.draw.rect(p.surface, NAVY, box, border_radius=5)
    p.text(label, box.move(6, 2), 21, color)
    if label == "JOHN":
        pygame.draw.circle(p.surface, GREEN, (x, y), 23, 2)


def draw_ball(p: Painter, point: Point, height: float = 0.0) -> None:
    x, y = pitch_point(point)
    pygame.draw.circle(p.surface, NAVY, (x + 2, y + 3), 9)
    y -= round(height)
    pygame.draw.circle(p.surface, (250, 248, 233), (x, y), 8)
    pygame.draw.circle(p.surface, NAVY, (x, y), 3)
