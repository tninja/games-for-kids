"""Pygame screens and event handling for the offline decision trainer."""

import pygame
from math import pi, sin

from .drawing import (BLUE, CORAL, GOLD, GREEN, HEIGHT, MUTED, NAVY, SIDE,
                      WIDTH, Button, Painter, arrow, draw_ball, draw_block_point, draw_pitch,
                      draw_player, draw_shot_line, pitch_point)
from .presentation import outgoing_fraction, positions, route_destination
from .content import LESSONS
from .curriculum import SECTIONS
from .session import ANIMATION_SECONDS, Session

STAGES = tuple((f"{section.id:02d} / {section.title}",
                f"{len(section.topics)} topics: {section.description}") for section in SECTIONS)


class App:
    def __init__(self, seed: int = 0):
        pygame.display.init()
        pygame.font.init()
        self.window = pygame.display.set_mode((WIDTH, HEIGHT), pygame.RESIZABLE)
        pygame.display.set_caption("Left Back Lab - John's soccer decisions")
        self.canvas = pygame.Surface((WIDTH, HEIGHT))
        self.painter = Painter(self.canvas)
        self.session: Session | None = None
        self.running = True
        self.seed = seed
        self.hover: tuple[int, int] = (-1, -1)
        self.history: dict[str, list[str]] = {}

    @property
    def layout_errors(self) -> list[str]:
        return self.painter.errors

    def buttons(self) -> list[Button]:
        s = self.session
        if s is None:
            return [Button(pygame.Rect(814, 300 + i * 68, 410, 60),
                           title + "\n" + subtitle, f"stage:{i + 1}")
                    for i, (title, subtitle) in enumerate(STAGES)]
        if s.phase == "decide":
            return [Button(pygame.Rect(814, 420 + i * 77, 410, 67), c.label,
                           f"choice:{i}", str(i + 1)) for i, c in enumerate(s.scene.choices)]
        if s.phase == "feedback":
            return [Button(pygame.Rect(814, 660, 410, 58), "Try another choice  /  R", "retry"),
                    Button(pygame.Rect(814, 732, 410, 58), "Next situation  /  N", "next")]
        if s.phase == "summary":
            return [Button(pygame.Rect(814, 732, 410, 58), "Choose another section", "menu")]
        label = "Pause and decide  /  SPACE" if s.phase == "observe" else "Show feedback  /  SPACE"
        return [Button(pygame.Rect(814, 732, 410, 58), label, "skip")]

    def activate(self, action: str) -> None:
        if action.startswith("stage:"):
            self.session = Session(int(action.split(":")[1]), self.seed)
            self.seed += 1
            self.history = {}
        elif action == "menu":
            self.session = None
        elif self.session is not None:
            self._session_action(action)

    def _session_action(self, action: str) -> None:
        s = self.session
        assert s is not None
        if action.startswith("choice:"):
            index = int(action.split(":")[1])
            if s.choose(index):
                self.history.setdefault(s.scene.id, []).append(s.scene.choices[index].label)
        elif action == "retry":
            s.retry()
        elif action == "next":
            s.advance()
        elif action == "skip":
            s.tick(ANIMATION_SECONDS)

    def logical_point(self, pos: tuple[int, int]) -> tuple[int, int]:
        width, height = self.window.get_size()
        return (round(pos[0] * WIDTH / width), round(pos[1] * HEIGHT / height))

    def handle_event(self, event: pygame.event.Event) -> None:
        if event.type == pygame.QUIT:
            self.running = False
        elif event.type == pygame.MOUSEMOTION:
            self.hover = self.logical_point(event.pos)
        elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            pos = self.logical_point(event.pos)
            if self.session is not None and pygame.Rect(1120, 35, 125, 40).collidepoint(pos):
                self.activate("menu")
            else:
                for button in self.buttons():
                    if button.rect.collidepoint(pos):
                        self.activate(button.action)
                        break
        elif event.type == pygame.KEYDOWN:
            self._key(event.key)

    def _key(self, key: int) -> None:
        if key == pygame.K_ESCAPE:
            self.session = None
        elif key in (pygame.K_1, pygame.K_2, pygame.K_3, pygame.K_4, pygame.K_5, pygame.K_6, pygame.K_7):
            number = key - pygame.K_1
            if self.session is None:
                self.activate(f"stage:{number + 1}")
            elif self.session.phase == "decide" and number < 3:
                self.activate(f"choice:{number}")
        elif key == pygame.K_SPACE and self.session is not None:
            self.activate("skip")
        elif key == pygame.K_r:
            self.activate("retry")
        elif key == pygame.K_n:
            self.activate("next")

    def draw(self) -> None:
        p = self.painter
        p.errors.clear()
        self.canvas.fill(NAVY)
        p.text("LEFT BACK LAB", pygame.Rect(30, 27, 650, 48), 49)
        p.text("Look. Decide. Learn. Take it to the pitch.", pygame.Rect(32, 83, 700, 30), 27, MUTED)
        session = self.session
        show_build_out_line = (session is not None and session.scene.keeper_distribution
                               and session.phase == "observe" and session.fraction < .45)
        draw_pitch(p, show_build_out_line)
        p.panel(SIDE)
        if self.session is None:
            self._menu()
        else:
            p.text("MENU / ESC", pygame.Rect(1120, 43, 128, 35), 23, GREEN)
            self._scene()
        for button in self.buttons():
            p.button(button, button.rect.collidepoint(self.hover))
        p.text("JOHN = you / M, LW, CM, RW, BACK = teammates / A, R = opponents\nBlue = your team / Coral = opponents / Gold = keeper",
               pygame.Rect(32, 829, 740, 45), 21, MUTED)
        p.text("No countdown. Think it through.", pygame.Rect(850, 835, 390, 28), 23, MUTED)
        scaled = pygame.transform.smoothscale(self.canvas, self.window.get_size())
        self.window.blit(scaled, (0, 0))
        pygame.display.flip()

    def _menu(self) -> None:
        p = self.painter
        for point, label, team in (((25, 69), "JOHN", "home"), ((24, 58), "A", "away"),
                                   ((51, 77), "M", "home"), ((50, 93), "GK", "keeper")):
            draw_player(p, point, label, team)
        draw_ball(p, (24, 60))
        p.text("Choose a skill to practise.", pygame.Rect(814, 165, 410, 55), 35)
        p.text("6 practice plays + 2 new layouts.\nStart with 1v1 basics, or pick a skill.",
               pygame.Rect(814, 227, 410, 62), 25, MUTED)
        p.text(f"{len(LESSONS)} topics / {3 * len(LESSONS)} situations / one player: you.",
               pygame.Rect(814, 785, 410, 27), 23, GREEN)

    def _scene(self) -> None:
        s = self.session
        assert s is not None
        if s.phase == "summary":
            self._summary()
            return
        scene = s.scene
        actors, ball = positions(scene, s.phase, s.fraction, s.selected)
        if scene.assigned_zone is not None:
            pygame.draw.circle(self.canvas, BLUE, pitch_point(scene.assigned_zone), 34, 2)
        if s.phase == "feedback" and scene.shot_target is not None:
            draw_shot_line(self.canvas, pitch_point(scene.ball), pitch_point(scene.shot_target))
        for actor in scene.actors:
            heading = actor.heading
            if s.phase == "observe" and not (scene.keeper_distribution and s.fraction < .45):
                heading = (actor.position[0] - actor.approach[0],
                           actor.position[1] - actor.approach[1])
            elif s.phase == "outcome" and s.selected is not None and actor.key == "john":
                heading = (scene.choices[s.selected].target[0] - actors[actor.key][0],
                           scene.choices[s.selected].target[1] - actors[actor.key][1])
            if heading == (0, 0):
                heading = actor.heading
            sliding = (actor.key == "john" and s.feedback is not None and s.feedback.key == "slide"
                       and s.phase in ("outcome", "feedback"))
            draw_player(self.painter, actors[actor.key], actor.label, actor.team, heading, sliding)
        height = 0.
        if s.feedback is not None and s.feedback.key == "long" and s.phase == "outcome":
            height = 36 * sin(pi * outgoing_fraction(s.fraction))
        draw_ball(self.painter, ball, height)
        if s.phase == "decide":
            for i, button in enumerate(self.buttons()):
                if button.rect.collidepoint(self.hover):
                    arrow(self.canvas, pitch_point(scene.john.position),
                          pitch_point(route_destination(scene.choices[i])), GOLD)
        elif s.phase == "feedback":
            self._feedback_overlay()
        if scene.keeper_distribution and s.phase == "observe":
            note = "Keeper throws: scan while it travels." if s.fraction < .45 else "Later: first touch taken; pressure closes."
            self.painter.text(note, pygame.Rect(80, 236, 620, 48), 28, GOLD)
        self._instructions()

    def _instructions(self) -> None:
        s = self.session
        assert s is not None
        p = self.painter
        mode = "NEW LAYOUT" if s.scene.transfer else "PRACTICE"
        p.text(f"{mode}  {s.index + 1}/8  /  TOPIC {s.scene.topic:02d}",
               pygame.Rect(814, 162, 410, 28), 24, GREEN)
        p.text(s.scene.title, pygame.Rect(814, 200, 410, 76), 35)
        p.text(s.scene.focus, pygame.Rect(814, 277, 410, 44), 24, GOLD)
        if s.phase == "feedback":
            self._feedback_text()
        else:
            p.text(s.scene.cue, pygame.Rect(814, 325, 410, 87), 25)
            if s.phase in ("observe", "outcome"):
                label = "Watch the movement..." if s.phase == "observe" else "Watch your intended action..."
                p.text(label, pygame.Rect(814, 450, 410, 70), 29, GOLD)
            if s.phase == "decide":
                p.text("Hover to see John's move or pass; the ring marks its destination.",
                       pygame.Rect(814, 661, 410, 50), 23, GOLD)
            p.text(s.scene.rules, pygame.Rect(814, 714 if s.phase == "decide" else 610, 410, 72),
                   22, MUTED)

    def _feedback_text(self) -> None:
        s = self.session
        assert s is not None and s.feedback is not None
        c = s.feedback
        color = (CORAL, GOLD, GREEN)[c.rating]
        label = ("Notice the risk", "A reasonable option", "Good fit for this picture")[c.rating]
        p = self.painter
        p.text(label, pygame.Rect(814, 325, 410, 40), 32, color)
        p.text(c.outcome, pygame.Rect(814, 372, 410, 64), 25)
        p.text(c.explanation, pygame.Rect(814, 449, 410, 136), 25, MUTED)
        prior = self.history.get(s.scene.id, [])
        note = "First-try result is saved. Retry to compare."
        if len(prior) > 1:
            note = "Compared with: " + prior[-2]
        p.text(note, pygame.Rect(814, 594, 410, 58), 23, GOLD)

    def _feedback_overlay(self) -> None:
        s = self.session
        assert s is not None and s.feedback is not None
        arrow(self.canvas, pitch_point(s.scene.john.position),
              pitch_point(route_destination(s.feedback)), GOLD)
        best = next(c for c in s.scene.choices if c.rating == 2)
        distinct = route_destination(s.feedback) != route_destination(best)
        if s.feedback.rating != 2 and distinct:
            arrow(self.canvas, pitch_point(s.scene.john.position), pitch_point(route_destination(best)), GREEN)
        legend = ("Gold: your route   /   Green: suggested route" if distinct
                  else "Your route ends at the suggested spot")
        legend_y = 565 if s.scene.ball[1] < 30 else 187
        self.painter.text(legend,
                          pygame.Rect(64, legend_y, 650, 28), 23)
        note_y = legend_y + 29
        if s.scene.shot_target is not None:
            block = next(c for c in s.scene.choices if c.key == "block")
            draw_block_point(self.canvas, pitch_point(block.target))
            self.painter.text("Coral dashes: shot line / Blue ring: block point",
                              pygame.Rect(64, note_y, 650, 28), 23)
            note_y += 29
        self.painter.text("Illustrated routes, not guaranteed outcomes.",
                          pygame.Rect(64, note_y, 650, 28), 21)

    def _summary(self) -> None:
        s = self.session
        assert s is not None
        p = self.painter
        practice, total, transfer, checks = s.summary()
        p.text("Session complete!", pygame.Rect(814, 172, 410, 55), 43, GREEN)
        p.text("Good choices on your first try", pygame.Rect(814, 243, 410, 35), 27)
        p.text(f"Practice: {practice} / {total}\nNew layouts: {transfer} / {checks}",
               pygame.Rect(814, 301, 410, 100), 38, GOLD)
        p.text("Remember your three questions:\nWhere is the danger?\nWhere should I stand?\nShould I wait or step in?",
               pygame.Rect(814, 429, 410, 150), 27)
        weak = [scene.title for scene in s.scenes if s.results.get(scene.id, 0) == 0]
        message = "Try again: " + "; ".join(dict.fromkeys(weak))[:120] if weak else "Great thinking! Try a different stage next."
        p.text(message, pygame.Rect(814, 602, 410, 115), 25, MUTED)
        p.text("LOOK\nDECIDE\nLEARN", pygame.Rect(160, 330, 500, 260), 86, GREEN)

    def run(self) -> None:
        clock = pygame.time.Clock()
        try:
            while self.running:
                seconds = min(clock.tick(60) / 1000.0, .1)
                for event in pygame.event.get():
                    self.handle_event(event)
                if self.session is not None:
                    self.session.tick(seconds)
                self.draw()
        finally:
            pygame.quit()
