"""Bright, code-drawn pictures with large icons and measured text."""

from dataclasses import dataclass
from math import cos, pi, sin

import pygame

from .model import Point
from .club import ClubEffects

WIDTH, HEIGHT = 1280, 880
INK = (33, 49, 74)
SKY = (211, 241, 255)
WHITE = (255, 253, 246)
GREEN = (68, 158, 91)
GOLD = (255, 193, 61)
PURPLE = (132, 88, 213)
BLUE = (54, 145, 230)
ORANGE = (241, 127, 66)
MUTED = (84, 105, 123)
PITCH = pygame.Rect(48, 180, 700, 585)
SIDE = pygame.Rect(790, 145, 458, 670)


@dataclass(frozen=True)
class Button:
    rect: pygame.Rect
    label: str
    action: str
    icon: str = ""
    number: str = ""
    caption: str = ""


class Painter:
    def __init__(self, surface: pygame.Surface):
        self.surface = surface
        self.fonts: dict[int, pygame.font.Font] = {}
        self.errors: list[str] = []

    def font(self, size: int) -> pygame.font.Font:
        if size not in self.fonts:
            self.fonts[size] = pygame.font.Font(None, size)
        return self.fonts[size]

    def text(self, message: str, rect: pygame.Rect, size: int = 32,
             color: tuple[int, int, int] = INK) -> None:
        font = self.font(size)
        lines = []
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
        if (len(lines) * font.get_linesize() > rect.height
                or any(font.size(line)[0] > rect.width for line in lines)):
            self.errors.append(message)
        for index, line in enumerate(lines):
            self.surface.blit(font.render(line, True, color), (rect.x, rect.y + index * font.get_linesize()))

    def button(self, button: Button, hovered: bool) -> None:
        color = (246, 234, 255) if hovered else (237, 245, 255)
        pygame.draw.rect(self.surface, color, button.rect, border_radius=20)
        pygame.draw.rect(self.surface, PURPLE if hovered else BLUE, button.rect, 3, border_radius=20)
        offset = 18
        if button.icon:
            draw_icon(self.surface, (button.rect.x + 66, button.rect.centery), button.icon)
            offset = 130
        if button.number:
            badge = (button.rect.right - 23, button.rect.y + 24)
            pygame.draw.circle(self.surface, GOLD, badge, 16)
            self.text(button.number, pygame.Rect(badge[0] - 5, badge[1] - 12, 20, 28), 26)
        padding = 30 if button.icon else 18
        height = button.rect.height - (padding + 32 if button.caption else 2 * padding)
        self.text(button.label, pygame.Rect(button.rect.x + offset, button.rect.y + padding,
                                            button.rect.width - offset - 30, height), 32 if button.caption else 34)
        if button.caption:
            self.text(button.caption, pygame.Rect(button.rect.x + offset, button.rect.bottom - 29,
                                                  button.rect.width - offset - 30, 25), 24, MUTED)


def toy_ball_center(fun: ClubEffects) -> tuple[int, int]:
    return (500, round(650 - fun.ball_height))


def draw_club_toy(painter: Painter, fun: ClubEffects) -> None:
    surface = painter.surface
    pose = "cheer" if fun.bounce_age < 1 else "ready"
    draw_keeper(surface, (190, 690), pose, step=fun.clock, scale=1.15)
    draw_ball(surface, (500, 650), fun.ball_height, 34)
    pygame.draw.rect(surface, PURPLE, pygame.Rect(325, 700, 410, 57), border_radius=16)
    painter.text("Tap the ball or press B!", pygame.Rect(335, 712, 390, 37), 32, WHITE)
    painter.text(f"Boing! {fun.pops}", pygame.Rect(80, 530, 230, 40), 36, WHITE)


def draw_club_party(surface: pygame.Surface, fun: ClubEffects) -> None:
    if fun.party_fraction >= 1:
        return
    colors = (GOLD, PURPLE, BLUE, ORANGE, GREEN)
    for index in range(18):
        x = 445 + index * 47 % 295
        y = 97 + (index * 19 + round(fun.party_fraction * 92)) % 35
        pygame.draw.circle(surface, colors[index % len(colors)], (x, y), 3 + index % 3)


def draw_club_badge(surface: pygame.Surface, center: tuple[int, int]) -> None:
    x, y = center
    points = [(x - 24, y - 23), (x + 24, y - 23), (x + 21, y + 12), (x, y + 27), (x - 21, y + 12)]
    pygame.draw.polygon(surface, PURPLE, points)
    pygame.draw.polygon(surface, GOLD, points, 3)
    for side in (-1, 1):
        glove = pygame.Rect(x + side * 9 - 6, y - 14, 13, 23)
        pygame.draw.rect(surface, WHITE, glove, border_radius=4)
        pygame.draw.line(surface, GOLD, glove.bottomleft, glove.bottomright, 3)


def draw_high_five(surface: pygame.Surface, center: tuple[int, int], fun: ClubEffects) -> None:
    if fun.tap_age >= 1:
        return
    x, y = center
    gap = round(28 * (1 - sin(pi * fun.tap_age)))
    for side in (-1, 1):
        glove = pygame.Rect(x + side * gap - 8, y - 12, 16, 24)
        pygame.draw.rect(surface, PURPLE, glove.inflate(4, 4), border_radius=5)
        pygame.draw.rect(surface, WHITE, glove, border_radius=5)
        pygame.draw.line(surface, GOLD, glove.bottomleft, glove.bottomright, 3)
    draw_star(surface, center, round(5 + 8 * sin(pi * fun.tap_age)), True)


def pitch_point(point: Point) -> tuple[int, int]:
    return (round(PITCH.x + point[0] * PITCH.width / 100),
            round(PITCH.y + point[1] * PITCH.height / 100))


def draw_pitch(painter: Painter) -> None:
    surface = painter.surface
    pygame.draw.rect(surface, (92, 180, 112), pygame.Rect(28, 145, 742, 670), border_radius=28)
    for index in range(9):
        color = (101, 194, 121) if index % 2 else (111, 203, 132)
        pygame.draw.rect(surface, color, pygame.Rect(PITCH.x, PITCH.y + index * 65, 700, 65))
    pygame.draw.rect(surface, WHITE, PITCH, 3)
    goal = pygame.Rect(pitch_point((24, 76)), (PITCH.width * .52, PITCH.height * .24))
    pygame.draw.rect(surface, (211, 237, 228), goal)
    for x in range(goal.left, goal.right, 22):
        pygame.draw.line(surface, (161, 199, 190), (x, goal.top), (x, goal.bottom), 2)
    for y in range(goal.top, goal.bottom, 20):
        pygame.draw.line(surface, (161, 199, 190), (goal.left, y), (goal.right, y), 2)
    pygame.draw.rect(surface, WHITE, goal, 7)
    painter.text("OUR GOAL", pygame.Rect(goal.centerx - 70, 779, 200, 30), 28, WHITE)


def draw_star(surface: pygame.Surface, center: tuple[int, int], radius: int, filled: bool) -> None:
    points = []
    for index in range(10):
        r = radius if index % 2 == 0 else radius * .45
        angle = -pi / 2 + index * pi / 5
        points.append((center[0] + r * cos(angle), center[1] + r * sin(angle)))
    pygame.draw.polygon(surface, GOLD if filled else (178, 203, 218), points)
    pygame.draw.polygon(surface, INK, points, 2)


def draw_ball(surface: pygame.Surface, point: tuple[int, int], height: float = 0,
              radius: int = 13) -> None:
    x, ground_y = point
    pygame.draw.ellipse(surface, (57, 137, 81), (x - radius, ground_y + 3, radius * 2, 9))
    y = round(ground_y - height)
    pygame.draw.circle(surface, INK, (x, y), radius + 2)
    pygame.draw.circle(surface, WHITE, (x, y), radius)
    pygame.draw.circle(surface, INK, (x, y), max(3, radius // 3))
    for dx, dy in ((-8, -5), (8, -5), (0, 9)):
        pygame.draw.circle(surface, INK, (x + dx * radius // 13, y + dy * radius // 13), 2)


def _hands(x: float, y: float, pose: str, height: float, scale: float) -> tuple[Point, Point]:
    if pose == "cheer":
        return ((x - 31 * scale, y - 74 * scale), (x + 31 * scale, y - 74 * scale))
    if pose in ("hug", "roll"):
        return ((x - 10 * scale, y - height * scale), (x + 10 * scale, y - height * scale))
    if pose == "low":
        return ((x - 10 * scale, y - 6 * scale), (x + 10 * scale, y - 6 * scale))
    if pose == "chest":
        return ((x - 11 * scale, y - 42 * scale), (x + 11 * scale, y - 42 * scale))
    return ((x - 31 * scale, y - 31 * scale), (x + 31 * scale, y - 31 * scale))


def draw_face(surface: pygame.Surface, center: tuple[int, int], radius: int) -> None:
    x, y = center
    scale = radius / 17
    pygame.draw.circle(surface, (245, 199, 151), center, radius)
    pygame.draw.arc(surface, INK, (x - 8 * scale, y - 2 * scale, 16 * scale, 13 * scale), pi, 2 * pi, 2)
    for side in (-1, 1):
        pygame.draw.circle(surface, INK, (round(x + side * 6 * scale), round(y - 3 * scale)),
                           max(1, round(2 * scale)))


def draw_keeper(surface: pygame.Surface, point: tuple[int, int], pose: str = "ready",
                height: float = 35, step: float = 0, scale: float = 1.) -> None:
    x, y = point
    ground_y = y
    if pose == "jump":
        y -= round(max(0., sin(step * pi)) * 22 * scale)
    bend = 12 if pose in ("low", "roll") else max(0., 12 * (1 - height / 35)) if pose == "hug" else 0
    body_y = y - (45 - bend) * scale
    footstep = sin(step * pi) * 4 * scale
    pygame.draw.ellipse(surface, (57, 137, 81), (x - 30 * scale, ground_y - 2, 60 * scale, 14 * scale))
    for side in (-1, 1):
        knee = (x + side * 17 * scale, y - 16 * scale)
        foot = (x + side * 19 * scale, y + side * footstep)
        if pose == "kick" and side == 1:
            foot = (x + 4 * scale, y - 7 * scale)
        pygame.draw.line(surface, INK, (x + side * 12 * scale, body_y + 20 * scale), knee, max(2, round(10 * scale)))
        pygame.draw.line(surface, INK, knee, foot, max(2, round(9 * scale)))
        pygame.draw.ellipse(surface, BLUE, (foot[0] - 10 * scale, foot[1] - 4 * scale, 21 * scale, 9 * scale))
    pygame.draw.rect(surface, PURPLE, (x - 21 * scale, body_y - 8 * scale, 42 * scale, 33 * scale), border_radius=8)
    draw_face(surface, (round(x), round(body_y - 26 * scale)), max(2, round(17 * scale)))
    for hand, side in zip(_hands(x, y, pose, height, scale), (-1, 1)):
        pygame.draw.line(surface, PURPLE, (x + side * 19 * scale, body_y), hand, max(2, round(9 * scale)))
        glove = pygame.Rect(hand[0] - 9 * scale, hand[1] - 9 * scale, 18 * scale, 19 * scale)
        pygame.draw.rect(surface, INK, glove.inflate(3, 3), border_radius=5)
        pygame.draw.rect(surface, WHITE, glove, border_radius=5)
        pygame.draw.line(surface, GOLD, (glove.left, glove.bottom - 3), (glove.right, glove.bottom - 3), 3)


def draw_person(painter: Painter, point: Point, label: str, color: tuple[int, int, int],
                ready: bool = True) -> None:
    x, y = pitch_point(point)
    surface = painter.surface
    draw_face(surface, (x, y - 40), 12)
    pygame.draw.rect(surface, color, (x - 15, y - 28, 30, 27), border_radius=7)
    for side in (-1, 1):
        pygame.draw.line(surface, INK, (x + side * 8, y - 2), (x + side * 11, y + 10), 7)
        arm_y = y - 37 if color == BLUE and side == -1 and ready else y - 12
        pygame.draw.line(surface, color, (x + side * 13, y - 22), (x + side * 25, arm_y), 6)
    box = pygame.Rect(x - 45, y - 75, 90, 25)
    pygame.draw.rect(surface, WHITE, box, border_radius=7)
    painter.text(label, box.move(8, 2), 23)


def draw_icon(surface: pygame.Surface, center: tuple[int, int], key: str) -> None:
    x, y = center
    if key == "celebrate":
        draw_keeper(surface, (x, y + 33), "cheer", scale=.7)
        return
    aliases = {"set": "ready", "jump": "chest", "cover_left": "left", "cover_right": "right",
               "follow": "right", "feet": "roll_right", "support": "left"}
    key = aliases.get(key, key)
    if key in ("forward", "rush", "back", "recover", "roll_middle"):
        direction = 1 if key in ("back", "recover") else -1
        points = [(-9, 26), (-9, -1), (-23, -1), (0, -28), (23, -1), (9, -1), (9, 26)]
        pygame.draw.polygon(surface, BLUE, [(x + px, y - direction * py) for px, py in points])
        if key == "roll_middle":
            draw_ball(surface, (x, y + 36), radius=9)
        return
    if key in ("left", "right", "roll_left", "roll_right"):
        direction = -1 if key in ("left", "roll_left") else 1
        points = [(-26, -9), (1, -9), (1, -23), (28, 0), (1, 23), (1, 9), (-26, 9)]
        pygame.draw.polygon(surface, BLUE, [(x + direction * px, y + py) for px, py in points])
        if key.startswith("roll"):
            draw_ball(surface, (x, y + 36), radius=9)
    else:
        pose = {"ready": "ready", "low": "low", "chest": "chest", "collect": "low", "hold": "hug"}[key]
        draw_keeper(surface, (x, y + 33), pose, scale=.7)
        if key != "ready":
            height = 5 if key in ("low", "collect") else 25 if key == "hold" else 30
            draw_ball(surface, (x, y + 33), height, 9)
