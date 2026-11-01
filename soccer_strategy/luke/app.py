"""Colorful two-choice practice screens for Luke."""

from secrets import randbelow

import pygame

from .animation import attempt_frame, failure_note, frame
from .audio import SoundBank
from .content import SKILLS
from .club import BADGES, CAPTIONS, CHEERS, PRACTICE_CHEERS, ClubEffects
from .drawing import (BLUE, GOLD, GREEN, HEIGHT, MUTED, ORANGE, PITCH, PURPLE, SIDE,
                      SKY, WHITE, WIDTH, Button, Painter, draw_ball, draw_icon,
                      draw_keeper, draw_person, draw_pitch, draw_star, pitch_point)
from .drawing import draw_club_badge, draw_club_party, draw_club_toy, draw_high_five, toy_ball_center
from .model import ACTIONS
from .session import Session


class App:
    def __init__(self, seed: int | None = None, muted: bool = False):
        pygame.display.init()
        pygame.font.init()
        self.window = pygame.display.set_mode((WIDTH, HEIGHT), pygame.RESIZABLE)
        pygame.display.set_caption("Luke's Keeper Club")
        self.canvas = pygame.Surface((WIDTH, HEIGHT))
        self.painter = Painter(self.canvas)
        self.session: Session | None = None
        self.mode = "all"
        self.seed = randbelow(2**31) if seed is None else seed
        self.hover = (-1, -1)
        self.running = True
        self.audio = SoundBank(muted)
        self.fun = ClubEffects()
        self._event_state: tuple[int, int, str] | None = None
        self._contact_sound = False
        self.audio.play("click")

    @property
    def layout_errors(self) -> list[str]:
        return self.painter.errors

    def buttons(self) -> list[Button]:
        s = self.session
        if s is None:
            result = [Button(pygame.Rect(814, 280 + i * 86, 410, 76), skill.title,
                             f"play:{skill.id}", number=str(i + 1)) for i, skill in enumerate(SKILLS)]
            return result + [Button(pygame.Rect(814, 718, 410, 76), "Mix my skills", "play:all", number="6")]
        if s.phase == "choose":
            gap, height = (125, 116) if len(s.picture.choices) == 3 else (157, 140)
            return [Button(pygame.Rect(814, 355 + i * gap, 410, height), ACTIONS[key],
                           f"choice:{i}", key, str(i + 1), CAPTIONS.get(key, ""))
                    for i, key in enumerate(s.picture.choices)]
        if s.phase == "feedback":
            return [Button(pygame.Rect(814, y, 410, 65), label, action)
                    for y, label, action in ((550, "Watch again  /  P", "replay"),
                                             (630, "Try again  /  R", "retry"),
                                             (710, "Next play  /  N", "next"))] + [
                Button(pygame.Rect(65, 704, 250, 100), "High five! / H", "highfive",
                       caption=BADGES[s.picture.skill] + " badge")]
        if s.phase == "summary":
            return [Button(pygame.Rect(814, 650, 410, 70), "Play again", "again"),
                    Button(pygame.Rect(814, 738, 410, 70), "Choose a skill", "menu")]
        label = {"watch": "Choose now  /  SPACE", "attempt": "Watch coach  /  SPACE"}.get(
            s.phase, "Show feedback  /  SPACE")
        return [Button(pygame.Rect(814, 710, 410, 70), label, "skip")]

    def activate(self, action: str) -> None:
        if action == "sound":
            self.audio.toggle()
        elif action == "bounce" and self._toy_available():
            if self.fun.pop():
                self.audio.play("boing")
        elif action == "highfive" and self.session is not None and self.session.phase == "feedback":
            if self.fun.high_five():
                self.audio.play("highfive")
        elif action.startswith("play:"):
            self.mode = action.split(":")[1]
            self.session = Session(self.mode, self.seed)
            self.seed += 1
        elif action == "menu":
            self.session = None
        elif action == "again":
            self.activate(f"play:{self.mode}")
        elif self.session is not None:
            self._practice_action(action, self.session)
        self._sync_events()

    def _toy_available(self) -> bool:
        return self.session is None or self.session.phase == "summary"

    def _practice_action(self, action: str, session: Session) -> None:
        if action.startswith("choice:"):
            session.choose(int(action.split(":")[1]))
        elif action == "skip":
            self.tick(20)
        elif action == "retry":
            session.retry()
        elif action == "replay":
            session.replay()
        elif action == "next":
            session.advance()

    def tick(self, seconds: float) -> None:
        self.fun.tick(seconds)
        if self.session is not None:
            self.session.tick(seconds)
        self._sync_events()

    def _sync_events(self) -> None:
        s = self.session
        state = (id(s), s.index, s.phase) if s is not None else None
        if state != self._event_state:
            self._event_state = state
            self._contact_sound = False
            if s is None:
                self.audio.play("click")
            elif s.phase == "attempt":
                self.audio.play("try")
            elif s.phase == "summary":
                self.fun.celebrate()
                self.audio.play("complete")
            elif s.phase == "feedback":
                self.fun.celebrate()
                if s.chosen_good:
                    self.audio.play("success")
            elif s.phase in ("watch", "show"):
                self.audio.play("click")
        if s is not None and s.phase == "show" and not self._contact_sound:
            self._play_contact(s)

    def _play_contact(self, s: Session) -> None:
        picture = s.picture
        if picture.skill == "match":
            effect, threshold = {"shot": ("catch", .8), "collect": ("catch", .8),
                                 "recover": ("catch", .8), "feet": ("roll", .55),
                                 "distribute": ("roll", .35), "support": ("roll", .8),
                                 "close": ("", 0.)}[picture.play]
            if s.fraction >= threshold:
                if effect:
                    self.audio.play(effect)
                self._contact_sound = True
            return
        holding = picture.skill == "roll" and picture.ball_target == picture.source
        guarding = picture.skill == "loose" and picture.ball_target != picture.spot
        if holding or guarding:
            self._contact_sound = True
            return
        threshold = .35 if picture.skill == "roll" else .7
        if s.fraction >= threshold:
            self.audio.play("roll" if picture.skill == "roll" else "catch")
            self._contact_sound = True

    def logical_point(self, point: tuple[int, int]) -> tuple[int, int]:
        w, h = self.window.get_size()
        return (round(point[0] * WIDTH / w), round(point[1] * HEIGHT / h))

    def handle_event(self, event: pygame.event.Event) -> None:
        if event.type == pygame.QUIT:
            self.running = False
        elif event.type == pygame.MOUSEMOTION:
            self.hover = self.logical_point(event.pos)
        elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            point = self.logical_point(event.pos)
            if pygame.Rect(840, 35, 255, 45).collidepoint(point):
                self.activate("sound")
            elif self.session is not None and pygame.Rect(1120, 35, 140, 45).collidepoint(point):
                self.activate("menu")
            elif self._toy_available() and pygame.Vector2(point).distance_to(toy_ball_center(self.fun)) <= 52:
                self.activate("bounce")
            else:
                for button in self.buttons():
                    if button.rect.collidepoint(point):
                        self.activate(button.action)
                        break
        elif event.type == pygame.KEYDOWN:
            self._key(event.key)

    def _key(self, key: int) -> None:
        if key == pygame.K_ESCAPE:
            self.activate("menu")
        elif key == pygame.K_m:
            self.activate("sound")
        elif key in (pygame.K_b, pygame.K_h):
            self.activate("bounce" if key == pygame.K_b else "highfive")
        elif key in (pygame.K_1, pygame.K_2, pygame.K_3, pygame.K_4, pygame.K_5, pygame.K_6):
            index = key - pygame.K_1
            if self.session is None:
                modes = tuple(skill.id for skill in SKILLS) + ("all",)
                self.activate("play:" + modes[index])
            elif self.session.phase == "choose" and index < len(self.session.picture.choices):
                self.activate(f"choice:{index}")
        elif key in (pygame.K_SPACE, pygame.K_r, pygame.K_p, pygame.K_n):
            action = {pygame.K_SPACE: "skip", pygame.K_r: "retry", pygame.K_p: "replay", pygame.K_n: "next"}[key]
            self.activate(action)

    def draw(self) -> None:
        p = self.painter
        p.errors.clear()
        self.canvas.fill(SKY)
        p.text("LUKE'S KEEPER CLUB", pygame.Rect(30, 25, 1000, 68), 60, PURPLE)
        p.text("Look. Choose. Try.", pygame.Rect(33, 99, 700, 35), 31)
        sound_label = "Sound: ON / M" if self.audio.enabled else "Sound: OFF / M"
        if not self.audio.available:
            sound_label = "Sound unavailable"
        pygame.draw.rect(self.canvas, WHITE, pygame.Rect(840, 35, 255, 45), border_radius=14)
        p.text(sound_label, pygame.Rect(850, 45, 255, 35), 25, PURPLE)
        draw_pitch(p)
        pygame.draw.rect(self.canvas, WHITE, SIDE, border_radius=28)
        s = self.session
        if s is None:
            self._menu()
        else:
            p.text("MENU / ESC", pygame.Rect(1120, 45, 145, 35), 25, PURPLE)
            p.text(f"First-try stars: {s.stars} / 6", pygame.Rect(848, 101, 390, 35), 29)
            if s.phase == "summary":
                self._summary(s)
            else:
                self._lesson(s)
        for button in self.buttons():
            p.button(button, button.rect.collidepoint(self.hover))
            if button.action == "highfive":
                draw_high_five(self.canvas, (button.rect.centerx, button.rect.y + 58), self.fun)
        if s is None or s.phase in ("feedback", "summary"):
            draw_club_party(self.canvas, self.fun)
        p.text("Blue = friend / Orange = other player", pygame.Rect(35, 834, 740, 32), 24)
        controls = "Mouse or keys 1-6" if s is None else "Mouse or keys 1 / 2"
        if s is not None and len(s.picture.choices) == 3:
            controls = "Mouse or keys 1 / 2 / 3"
        p.text(controls, pygame.Rect(850, 834, 390, 32), 26)
        scaled = pygame.transform.smoothscale(self.canvas, self.window.get_size())
        self.window.blit(scaled, (0, 0))
        pygame.display.flip()

    def _menu(self) -> None:
        p = self.painter
        p.text("Hello, Luke!", pygame.Rect(115, 265, 610, 90), 77, WHITE)
        p.text("Small steps. Soft hands.", pygame.Rect(103, 363, 620, 55), 42, WHITE)
        for x, icon in ((200, "left"), (400, "chest"), (600, "roll_right")):
            draw_icon(self.canvas, (x, 470), icon)
        draw_club_toy(p, self.fun)
        p.text("Pick a skill", pygame.Rect(814, 184, 410, 60), 49)
        p.text("Try 5 for match challenges!", pygame.Rect(814, 244, 410, 34), 27, MUTED)

    def _field(self, s: Session) -> None:
        p = self.painter
        picture = s.picture
        view = (attempt_frame(picture, s.selected_key, s.fraction) if s.phase == "attempt"
                else frame(picture, s.phase, s.fraction))
        if picture.skill in ("loose", "match"):
            area = pygame.Rect(pitch_point((12, 55)), (PITCH.width * .76, PITCH.height * .45))
            pygame.draw.rect(self.canvas, WHITE, area, 2)
            label = pygame.Rect(area.right - 140, area.bottom - 30, 130, 24)
            pygame.draw.rect(self.canvas, GREEN, label.inflate(8, 4), border_radius=5)
            p.text("YOUR AREA", label, 23, WHITE)
        if picture.skill in ("roll", "match"):
            for friend in picture.friends:
                label = friend.label + (" READY" if friend.ready else " WAIT")
                draw_person(p, friend.position, label, BLUE, friend.ready)
        elif picture.skill != "loose":
            draw_person(p, (picture.source[0], picture.source[1] - 6), "COACH", ORANGE)
            if picture.serve_from is not None:
                draw_person(p, (picture.serve_from[0], picture.serve_from[1] - 6), "COACH 2", ORANGE)
        actors = view.opponents if picture.skill == "match" else picture.opponents
        for opponent in actors:
            draw_person(p, opponent, "PLAYER", ORANGE)
        point = pitch_point(view.keeper)
        draw_keeper(self.canvas, point, view.pose, view.height, view.step)
        if picture.skill in ("loose", "match"):
            label = pygame.Rect(point[0] - 28, point[1] + 17, 67, 27)
            pygame.draw.rect(self.canvas, PURPLE, label, border_radius=7)
            p.text("LUKE", label.move(9, 2), 24, WHITE)
        else:
            p.text("LUKE", pygame.Rect(point[0] - 25, point[1] - 105, 90, 30), 26, WHITE)
        draw_ball(self.canvas, pitch_point(view.ball), view.height)
        if s.phase == "feedback":
            target = picture.ball_target if picture.skill == "roll" else picture.spot
            pygame.draw.circle(self.canvas, GOLD, pitch_point(target), 37, 4)
            if s.chosen_good:
                for offset in (-55, 0, 55):
                    draw_star(self.canvas, (point[0] + offset, point[1] - 135), 13, True)

    def _lesson(self, s: Session) -> None:
        self._field(s)
        p = self.painter
        skill = next(item for item in SKILLS if item.id == s.picture.skill)
        p.text(f"PLAY {s.index + 1} OF 6", pygame.Rect(814, 167, 410, 32), 26, GREEN)
        p.text(s.picture.title or skill.title, pygame.Rect(814, 212, 410, 62), 46)
        if s.phase == "feedback":
            self._feedback(s)
        else:
            p.text(s.picture.cue, pygame.Rect(814, 279, 410, 72), 31)
            if s.phase in ("attempt", "show"):
                key = s.picture.choices[s.selected or 0] if s.phase == "attempt" else s.picture.answer
                draw_icon(self.canvas, (1018, 444), key)
                caption = "Your choice: " + ACTIONS[key] if s.phase == "attempt" else "Watch the coach's choice."
                note = failure_note(s.picture, s.selected_key) if s.phase == "attempt" else s.picture.note
                p.text(caption, pygame.Rect(814, 535, 410, 82), 35, PURPLE)
                p.text(note, pygame.Rect(814, 610, 410, 92), 29, MUTED)
            elif s.phase == "watch":
                p.text("Watch the ball...", pygame.Rect(814, 450, 410, 70), 42, PURPLE)
            else:
                p.text("Take your time.", pygame.Rect(814, 746, 410, 40), 30, MUTED)

    def _feedback(self, s: Session) -> None:
        p = self.painter
        title = (CHEERS if s.chosen_good else PRACTICE_CHEERS)[s.index % 3]
        p.text(title, pygame.Rect(814, 287, 410, 57), 45, GREEN if s.chosen_good else PURPLE)
        p.text("Try: " + ACTIONS[s.picture.answer], pygame.Rect(814, 350, 410, 58), 38)
        p.text(s.picture.note, pygame.Rect(814, 417, 410, 112), 32, MUTED)

    def _summary(self, s: Session) -> None:
        p = self.painter
        p.text("You practised 6 plays!", pygame.Rect(95, 263, 640, 70), 49, WHITE)
        for index in range(6):
            draw_star(self.canvas, (140 + index * 100, 395), 33, index < s.stars)
        p.text("6 keeper badges earned!", pygame.Rect(95, 435, 640, 40), 32, WHITE)
        for index in range(6):
            draw_club_badge(self.canvas, (140 + index * 100, 490))
        draw_club_toy(p, self.fun)
        p.text("Great practice!", pygame.Rect(814, 187, 410, 66), 49)
        p.text(f"{s.stars} first-try stars", pygame.Rect(814, 258, 410, 40), 35, PURPLE)
        for index, progress in enumerate(s.progress()):
            p.text(f"{progress.skill.title}: {progress.correct} / {progress.total}",
                   pygame.Rect(814, 316 + index * 44, 410, 40), 30)
        skill = s.practice_skill
        title = "Try another skill!" if skill is None else "Next: " + skill.title
        tip = "Keep enjoying the game!" if skill is None else skill.tip
        p.text(title, pygame.Rect(814, 548, 410, 44), 32, PURPLE)
        p.text(tip, pygame.Rect(814, 595, 410, 48), 25, MUTED)

    def run(self) -> None:
        clock = pygame.time.Clock()
        try:
            while self.running:
                seconds = min(clock.tick(60) / 1000., .1)
                for event in pygame.event.get():
                    self.handle_event(event)
                self.tick(seconds)
                self.draw()
        finally:
            pygame.quit()
