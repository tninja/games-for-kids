"""Pygame rendering adapter; geometry remains in the UI-independent model."""

import pygame

from ..soccer_smart.drawing import (
    GOLD, GREEN, MUTED, Painter, draw_ball, draw_player, draw_window_marker, pitch_point,
)
from .model import Track
from .session import Session


def draw_route(painter: Painter, track: Track, color: tuple[int, int, int],
               dashed: bool = False) -> None:
    points = [pitch_point(track.sample(i / 40)) for i in range(41)]
    for i in range(40):
        if not dashed or i % 4 < 2:
            pygame.draw.line(painter.surface, color, points[i], points[i + 1], 4)
    pygame.draw.circle(painter.surface, color, points[-1], 10, 2)


def draw_world(painter: Painter, session: Session, hovered: int | None = None) -> None:
    node = session.node
    choice = session.active_choice
    positions, ball = (node.state.positions(), node.state.ball) if choice is None else choice.motion.frame(
        node.state, session.fraction)
    if hovered is not None and session.phase == "decide":
        draw_route(painter, node.choices[hovered].preview(node.state), GOLD)
    if node.shot_window is not None:
        draw_window_marker(painter.surface, pitch_point(node.shot_window))
    if choice is not None:
        draw_route(painter, choice.motion.route(node.state), GOLD)
        if session.phase == "feedback":
            best = session.coach_choice
            draw_route(painter, best.motion.route(node.state), GREEN, True)
    for actor in node.state.actors:
        label = actor.label if actor.key == node.state.control else actor.label.replace("JOHN", "John")
        draw_player(painter, positions[actor.key], label, actor.team)
    pygame.draw.circle(painter.surface, GREEN, pitch_point(positions[node.state.control]), 25, 2)
    draw_ball(painter, ball)
    controlled = {a.key: a.label for a in node.state.actors}[node.state.control]
    painter.text("YOU: " + controlled, pygame.Rect(68, 196, 300, 28), 24, GREEN)
    painter.text("Gold: intended hover / actual result; Green dashed: coach",
                 pygame.Rect(68, 726, 650, 28), 21, MUTED)
    painter.text("Schematic teaching routes; outcomes are authored.",
                 pygame.Rect(68, 756, 650, 28), 21, MUTED)
