"""Full-field Pygame interface for branching missions and optional reflection."""

import pygame

from ..soccer_smart.drawing import (
    Button, CORAL, GOLD, GREEN, HEIGHT, MUTED, NAVY, Painter, SIDE, WIDTH, draw_pitch,
)
from .content import TITLES
from .notebook import Notebook
from .rendering import draw_world
from .session import ANIMATED, Session

MENU = tuple((title, f"mission:M0{i+1}") for i, title in enumerate(TITLES)) + (
    ("My growth notebook", "notebook"), ("Review the basics", "basics"))


def button(label: str, action: str, y: int, number: str = "", height: int = 62) -> Button:
    return Button(pygame.Rect(814, y, 410, height), label, action, number)


class App:
    def __init__(self) -> None:
        pygame.display.init()
        pygame.font.init()
        self.window = pygame.display.set_mode((WIDTH, HEIGHT), pygame.RESIZABLE)
        pygame.display.set_caption("Soccer Smarter Lab - notice, choose, adapt")
        self.canvas = pygame.Surface((WIDTH, HEIGHT))
        self.painter = Painter(self.canvas)
        self.page = "menu"
        self.session: Session | None = None
        self.notebook = Notebook()
        self.observations: list[str] = []
        self.run_id = 0
        self.hover = (-1, -1)
        self.running = True

    @property
    def layout_errors(self) -> list[str]:
        return self.painter.errors

    def buttons(self) -> list[Button]:
        if self.page == "menu":
            return [button(label, action, 238 + 63*i, str(i+1), 55)
                    for i, (label, action) in enumerate(MENU)]
        top = [Button(pygame.Rect(1120, 27, 128, 58), "Menu", "menu")]
        if self.page == "game":
            return top + [Button(pygame.Rect(928, 27, 170, 58), "Notebook", "notebook")] + self._game_buttons()
        if self.page == "notebook":
            resume = [] if self.session is None else [Button(pygame.Rect(928, 27, 170, 58), "Resume play", "resume")]
            return top + resume + self._note_buttons()
        return top + [button("Back to advanced practice", "menu", 720)]

    def _game_buttons(self) -> list[Button]:
        s = self.session
        assert s is not None
        if s.phase == "decide":
            return [button(c.label, f"choice:{i}", 424 + 78*i, str(i+1)) for i, c in enumerate(s.node.choices)]
        if s.phase == "predict":
            return [button(label, f"predict:{i}", 448 + 84*i, str(i+1))
                    for i, label in enumerate(("Follow the pass", "Hold the central lane"))]
        if s.phase == "feedback":
            return [button("Compare coach / C", "coach", 566), button("Try another choice / R", "retry", 638),
                    button("Continue / N", "next", 710)]
        if s.phase == "summary":
            return [button("Replay this contrast / R", "restart", 566),
                    button("My growth notebook", "notebook", 638), button("Choose another mission", "menu", 710)]
        return [button("Finish animation / SPACE", "skip", 638),
                Button(pygame.Rect(814, 710, 194, 62), "Resume / P" if s.paused else "Pause / P", "pause"),
                Button(pygame.Rect(1024, 710, 200, 62), "Step / .", "step")]

    def _note_buttons(self) -> list[Button]:
        book = self.notebook
        if book.activity is None:
            return [button("My playing principle", "journal:X01", 340, "1"),
                    button("My practice team", "journal:X02", 424, "2"),
                    button("Pro watch and Try It", "journal:X03", 508, "3")]
        step = book.step
        options = [] if step is None else [
            button(label if len(label) < 78 else label[:74] + "...", f"note:{i}", 350 + 74*i, str(i+1))
            for i, label in enumerate(step.options)]
        return options + [button("Skip step / N" if step else "Growth activities", "note_skip" if step else "growth_home", 666),
                          button("Edit previous step / R", "note_back", 738)]

    def activate(self, action: str) -> None:
        if action == "menu":
            self.page = "menu"
        elif action.startswith("mission:"):
            self.run_id += 1
            self.session = Session(action.split(":")[1], self.run_id)
            self.page = "game"
        elif action == "notebook":
            self.page = "notebook"
            self.notebook.activity = None
        elif action == "basics":
            self.page = "basics"
        elif action == "resume" and self.session is not None:
            self.page = "game"
        elif self.page == "game":
            self._game_action(action)
        elif self.page == "notebook":
            self._note_action(action)

    def _game_action(self, action: str) -> None:
        s = self.session
        assert s is not None
        if action.startswith("choice:"):
            index = int(action.split(":")[1])
            if s.choose(index):
                self.observations.insert(0, f"{s.episode.id}/{s.node.id}: {s.node.choices[index].label}")
                self.observations = self.observations[:3]
        elif action.startswith("predict:"):
            s.predict(int(action.split(":")[1]))
        else:
            actions = {"coach": s.compare_coach, "retry": s.retry, "next": s.advance,
                       "skip": s.skip, "pause": s.toggle_pause, "step": s.step, "restart": s.restart}
            if action in actions:
                actions[action]()

    def _note_action(self, action: str) -> None:
        if action.startswith("journal:"):
            self.notebook.start(action.split(":")[1], tuple(self.observations))
        elif action.startswith("note:"):
            self.notebook.choose(int(action.split(":")[1]))
        elif action == "note_skip":
            self.notebook.skip()
        elif action == "note_back":
            self.notebook.back()
        elif action == "growth_home":
            self.notebook.activity = None

    def logical_point(self, pos: tuple[int, int]) -> tuple[int, int]:
        width, height = self.window.get_size()
        return (round(pos[0] * WIDTH / width), round(pos[1] * HEIGHT / height))

    def handle_event(self, event: pygame.event.Event) -> None:
        if event.type == pygame.QUIT:
            self.running = False
        elif event.type == pygame.MOUSEMOTION:
            self.hover = self.logical_point(event.pos)
        elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            point = self.logical_point(event.pos)
            for item in self.buttons():
                if item.rect.collidepoint(point):
                    self.activate(item.action)
                    break
        elif event.type == pygame.KEYDOWN:
            self._key(event.key)

    def _key(self, key: int) -> None:
        if key == pygame.K_ESCAPE:
            self.activate("menu")
        elif pygame.K_1 <= key <= pygame.K_9:
            number = key - pygame.K_1
            if self.page == "menu":
                self.activate(MENU[number][1])
            elif self.page == "notebook":
                self.activate(f"journal:X0{number+1}" if self.notebook.activity is None and number < 3 else f"note:{number}")
            elif self.page == "game" and self.session is not None:
                self.activate(f"predict:{number}" if self.session.phase == "predict" else f"choice:{number}")
        elif self.page == "game" and self.session is not None:
            replay = "restart" if self.session.phase == "summary" else "retry"
            actions = {pygame.K_SPACE: "skip", pygame.K_p: "pause", pygame.K_PERIOD: "step",
                       pygame.K_c: "coach", pygame.K_r: replay, pygame.K_n: "next"}
            if key in actions:
                self.activate(actions[key])
        elif self.page == "notebook":
            if key == pygame.K_n:
                self.activate("note_skip")
            elif key == pygame.K_r:
                self.activate("note_back")

    def update(self, seconds: float) -> None:
        if self.page == "game" and self.session is not None:
            self.session.tick(seconds)

    def draw(self) -> None:
        p = self.painter
        p.errors.clear()
        self.canvas.fill(NAVY)
        p.text("SOCCER SMARTER LAB", pygame.Rect(30, 27, 870, 54), 48)
        p.text("Notice a cue. Choose. Watch what changes. Adapt.", pygame.Rect(32, 87, 850, 34), 27, MUTED)
        role = self.session.node.role if self.page == "game" and self.session is not None else ""
        draw_pitch(p, role)
        p.panel(SIDE)
        if self.page == "game":
            self._game()
        elif self.page == "notebook":
            self._notebook()
        elif self.page == "basics":
            self._basics()
        else:
            p.text("Advanced practice", pygame.Rect(814, 150, 410, 42), 35, GREEN)
            p.text("7 missions / A and B contrasts\nOptional growth and pro study", pygame.Rect(814, 188, 410, 50), 22)
            p.text("LOOK\nCHOOSE\nADAPT", pygame.Rect(130, 330, 540, 300), 80, GREEN)
        for item in self.buttons():
            p.button(item, item.rect.collidepoint(self.hover))
        p.text("Blue: teammates / Coral: opponents / Gold: keeper\nGreen ring: the player you control", pygame.Rect(32, 827, 740, 50), 22, MUTED)
        p.text("Untimed choices. Practice is welcome.", pygame.Rect(814, 837, 430, 30), 22, MUTED)
        self.window.blit(pygame.transform.smoothscale(self.canvas, self.window.get_size()), (0, 0))
        pygame.display.flip()

    def _game(self) -> None:
        s = self.session
        assert s is not None
        p = self.painter
        hovered = next((int(b.action.split(":")[1]) for b in self.buttons()
                        if b.action.startswith("choice:") and b.rect.collidepoint(self.hover)), None)
        draw_world(p, s, hovered)
        p.text(s.episode.title, pygame.Rect(814, 162, 410, 50), 36, GREEN)
        p.text(s.episode.id + " / " + s.node.title, pygame.Rect(814, 220, 410, 62), 24)
        if s.phase == "summary":
            good, total, practice = s.summary()
            p.text(f"Round complete!\nFirst tries: {good} / {total} fit or workable\nPractice choices: {practice}",
                   pygame.Rect(814, 306, 410, 146), 28, GOLD)
            p.text("Only decisions on your initial path enter the total. New retry branches are practice.",
                   pygame.Rect(814, 458, 410, 94), 23, MUTED)
        elif s.phase == "feedback":
            self._feedback()
        elif s.phase == "predict":
            p.text("Your unscored prediction", pygame.Rect(814, 294, 410, 42), 29, GOLD)
            p.text("After the pass, will the defender follow it or hold the central lane?", pygame.Rect(814, 346, 410, 94), 25)
            p.text("Either prediction advances. Watch for evidence before your second decision.", pygame.Rect(814, 636, 410, 110), 23, MUTED)
        else:
            p.text(s.node.cue, pygame.Rect(814, 294, 410, 118), 24)
            if s.phase in ANIMATED:
                status = "Paused" if s.paused else "Watch the coach" if s.phase == "coach" else "Watch what changes"
                p.text(status, pygame.Rect(814, 446, 410, 50), 31, GOLD)
                pygame.draw.rect(self.canvas, GREEN, pygame.Rect(814, 522, round(410*s.fraction), 10))
            if s.phase == "decide":
                p.text("Hover for the intended route. Choose 1, 2, 3 or click.", pygame.Rect(814, 672, 410, 82), 23, GOLD)
        if s.episode.prediction and s.node.id == "adapt":
            prediction = ("Follow the pass", "Hold the central lane")[s.prediction or 0]
            p.text("You predicted: " + prediction + "\nObserved: " + s.episode.reveal,
                   pygame.Rect(68, 242, 640, 84), 23, GOLD)

    def _feedback(self) -> None:
        s = self.session
        assert s is not None and s.feedback is not None
        choice = s.feedback
        p = self.painter
        p.text(("Notice the risk", "A workable option", "Fits this picture")[choice.rating],
               pygame.Rect(814, 296, 410, 48), 31, (CORAL, GOLD, GREEN)[choice.rating])
        p.text(choice.feedback, pygame.Rect(814, 352, 410, 110), 25)
        note = "Practice choice. First attempts stay saved." if s.practice_only else "First attempt saved for this decision."
        p.text(note, pygame.Rect(814, 470, 410, 66), 22, GOLD)
        destination = "Next: a new cue in this play." if choice.next_node else "This branch ends here. Continue for the next contrast or summary."
        p.text(destination, pygame.Rect(814, 522, 410, 40), 20, MUTED)

    def _notebook(self) -> None:
        p, book = self.painter, self.notebook
        p.text("My growth notebook", pygame.Rect(814, 162, 410, 52), 35, GREEN)
        if book.activity is None:
            p.text("Optional. Unscored. Saved only while this app stays open.", pygame.Rect(814, 228, 410, 100), 25)
            p.text("NOTICE\nREFLECT\nTRY AGAIN", pygame.Rect(110, 330, 570, 290), 64, GREEN)
            return
        step = book.step
        if step is not None:
            p.text(step.title, pygame.Rect(814, 228, 410, 54), 27, GOLD)
            p.text(step.prompt, pygame.Rect(814, 286, 410, 62), 22)
        else:
            p.text("Your next step is yours to choose.\nNo stars added or removed.", pygame.Rect(814, 242, 410, 132), 28, GOLD)
        p.text(book.activity + " / My current notes", pygame.Rect(78, 236, 630, 48), 30, GREEN)
        notes = "\n\n".join(key.title() + ": " + value for key, value in book.entries[book.activity].items())
        p.text(notes or "No entries yet. You may skip any step.", pygame.Rect(78, 304, 630, 390), 25)

    def _basics(self) -> None:
        self.painter.text("The basics are already here", pygame.Rect(814, 166, 410, 100), 34, GREEN)
        self.painter.text("Soccer Smart Lab covers receiving, passing, space, support and defending.\n\nStart it from the repository root:\n\npython3 -m\nsoccer_strategy.soccer_smart",
                          pygame.Rect(814, 296, 410, 390), 25)

    def run(self) -> None:
        clock = pygame.time.Clock()
        try:
            while self.running:
                for event in pygame.event.get():
                    self.handle_event(event)
                self.update(min(clock.tick(60) / 1000., .1))
                self.draw()
        finally:
            pygame.quit()
