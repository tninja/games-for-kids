"""Pygame screens and event handling for Soccer Smart Lab."""

from pathlib import Path
import pygame

from .audio import SoundBank
from .book_view import BookBrowser
from .catalog import build_practice_cards
from .content import TOPICS
from .curriculum import MIXED_STAGE, SECTIONS, group_for_id
from .drawing import (
    Button,
    CORAL,
    GOLD,
    GREEN,
    HEIGHT,
    MUTED,
    NAVY,
    Painter,
    SIDE,
    WIDTH,
    arrow,
    dashed_arrow,
    draw_ball,
    draw_pitch,
    draw_player,
    draw_window_marker,
    pitch_point,
)
from .match_session import MatchSession
from .match_view import MatchBrowser, draw_match_screen, match_buttons, screen_to_pitch
from .model import Choice, Scenario
from .play_session import ContinuousSession
from .play_view import PlayBrowser
from .presentation import ball_height, card_height, card_positions, coach_choice, positions, route_destination
from .session import ANIMATION_SECONDS, Session
from .sim_kernel import guided_anchors
from .storage import ProgressStore

MENU_CARDS = tuple(
    (f"{section.id:02d} / {section.title}", f"3 topics: {section.description}", f"stage:{section.id}")
    for section in SECTIONS
) + (
    ("05 / Mixed round", "All 4 sections: 6 practice + 2 transfer", f"stage:{MIXED_STAGE}"),
    ("06 / Practice cards", "7 technique demos & adult activities", "cards:0"),
    ("07 / Book companion", "57 topics / original practice", "book"),
    ("08 / Continuous Play", "24 openings / linked decisions", "continuous"),
    ("09 / Match Day Cup", "7v7 & 9v9 live 2D tactics / pitch play", "match_cup"),
)


def choice_route(painter: Painter, scene: Scenario, choice: Choice,
                 color: tuple[int, int, int], dashed: bool = False) -> None:
    draw = dashed_arrow if dashed else arrow
    if choice.ball_via is not None:
        draw(painter.surface, pitch_point(scene.ball), pitch_point(choice.ball_via), color)
        draw(painter.surface, pitch_point(choice.ball_via), pitch_point(choice.ball_end), color)
    else:
        draw(painter.surface, pitch_point(scene.john.position), pitch_point(route_destination(choice)), color)


def _star_count(results: dict[str, int]) -> int:
    if not results:
        return 1
    strong = sum(1 for r in results.values() if r == 2)
    ok = sum(1 for r in results.values() if r > 0)
    total = len(results)
    if strong * 4 >= total * 3:
        return 3
    return 2 if ok * 2 >= total else 1


class App:
    def __init__(self, seed: int = 0, progress_path: Path | None = None):
        pygame.display.init()
        pygame.font.init()
        self.window = pygame.display.set_mode((WIDTH, HEIGHT), pygame.RESIZABLE)
        pygame.display.set_caption("Soccer Smart Lab - John's tactical decisions")
        self.canvas = pygame.Surface((WIDTH, HEIGHT))
        self.painter = Painter(self.canvas)
        self.sound = SoundBank()
        self.store = ProgressStore(progress_path)
        self.cards = build_practice_cards()
        self.session: Session | None = None
        self.card_index: int | None = None
        self.card_elapsed: float = 0.0
        self.running = True
        self.seed = seed
        self.hover: tuple[int, int] = (-1, -1)
        self.history: dict[str, list[str]] = {}
        self.book: BookBrowser | None = None
        self.play_browser: PlayBrowser | None = None
        self.match_browser: MatchBrowser | None = None
        self.match_session: MatchSession | None = None
        self.coach_info = False

    @property
    def layout_errors(self) -> list[str]:
        return self.painter.errors

    def buttons(self) -> list[Button]:
        if self.match_session is not None:
            return match_buttons(self.match_session)
        if self.match_browser is not None:
            return self.match_browser.buttons()
        if self.play_browser is not None and self.session is None:
            return self.play_browser.buttons()
        if self.book is not None and self.session is None and self.card_index is None:
            return self.book.buttons()
        result = self._content_buttons()
        if self.book is not None:
            result.append(Button(pygame.Rect(910, 30, 190, 50), "Book topics / B", "book_back"))
        if self.play_browser is not None:
            result.append(Button(pygame.Rect(910, 30, 190, 50), "Play tasks / B", "play_back"))
        return result

    def _content_buttons(self) -> list[Button]:
        if self.card_index is not None:
            return [
                Button(pygame.Rect(814, 608, 410, 56), "Replay demo  /  R", "card_replay"),
                Button(pygame.Rect(814, 672, 410, 56), "Book topics / N" if self.book else "Next card  /  N", "card_next"),
                Button(pygame.Rect(814, 736, 410, 56), "Back to menu  /  ESC", "menu"),
            ]
        s = self.session
        if s is None:
            return [Button(pygame.Rect(814, 240 + i * 59, 410, 55),
                           title + "\n" + subtitle, action)
                    for i, (title, subtitle, action) in enumerate(MENU_CARDS)]
        if s.phase == "decide":
            return [Button(pygame.Rect(814, 420 + i * 76, 410, 66), c.label,
                           f"choice:{i}", str(i + 1)) for i, c in enumerate(s.scene.choices)]
        if s.phase == "feedback":
            return [
                Button(pygame.Rect(814, 612, 410, 54), "Compare coach demo  /  C", "coach"),
                Button(pygame.Rect(814, 674, 410, 54), "Try another choice  /  R", "retry"),
                Button(pygame.Rect(814, 736, 410, 54), s.next_label if isinstance(s, ContinuousSession) else "Next situation  /  N", "next"),
            ]
        if s.phase == "summary":
            return [Button(pygame.Rect(814, 732, 410, 58), "Choose another section", "menu")]
        label = "Pause and decide  /  SPACE" if s.phase == "observe" else "Show feedback  /  SPACE"
        return [Button(pygame.Rect(814, 732, 410, 58), label, "skip")]

    def _clear_modes(self) -> None:
        self.play_browser = None
        self.book = None
        self.match_browser = None
        self.match_session = None
        self.session = None
        self.card_index = None

    def activate(self, action: str) -> None:
        if action == "match_cup":
            self._clear_modes()
            self.match_browser = MatchBrowser(self.store)
            self.sound.play("click")
        elif action.startswith("match_"):
            self._match_action(action)
        elif action == "continuous":
            self._clear_modes()
            self.play_browser = PlayBrowser()
        elif action.startswith("play_") and self.play_browser is not None:
            self._play_action(action)
        elif action == "book":
            self._clear_modes()
            self.book = BookBrowser()
        elif action.startswith("book_") and self.book is not None:
            self._book_action(action)
        elif action.startswith("stage:"):
            self._clear_modes()
            self.session = Session(int(action.split(":")[1]), self.seed)
            self.seed += 1
            self.history = {}
        elif action.startswith("cards:"):
            self._clear_modes()
            self.cards = build_practice_cards()
            self.card_index = int(action.split(":")[1]) % len(self.cards)
            self.card_elapsed = 0.0
        elif action == "menu":
            self._clear_modes()
        elif action == "toggle_info":
            self.coach_info = not self.coach_info
        elif action == "toggle_sound":
            self.sound.toggle()
        elif self.card_index is not None:
            self._card_action(action)
        elif self.session is not None:
            self._session_action(action)

    def _match_action(self, action: str) -> None:
        if action == "match_tier":
            nxt = "9v9" if self.store.data.get("rules_tier") == "7v7" else "7v7"
            self.store.set_tier(nxt)
            self.sound.play("click")
        elif action.startswith("match_start:"):
            match_id = action.split(":")[1]
            self.match_session = MatchSession(match_id)
            self.sound.play("whistle")
        elif action == "match_back":
            self.match_session = None
            self.match_browser = MatchBrowser(self.store)
        elif self.match_session is not None:
            self._match_session_action(action)

    def _match_anchor_action(self, ms: MatchSession, idx: int) -> None:
        anchors = guided_anchors(ms.state)
        if 0 <= idx < len(anchors):
            act = anchors[idx][1]
            if ms.loft and act.kind in ("pass", "shoot"):
                act = type(act)(act.kind, act.tx, act.ty, True, act.target_key)
            if ms.commit_action(act) is not None:
                self.sound.play("loft" if act.loft else "kick")

    def _match_session_action(self, action: str) -> None:
        ms = self.match_session
        assert ms is not None
        if action == "match_loft":
            ms.loft = not ms.loft
            self.sound.play("click")
        elif action == "match_intent":
            ms.offball_intent = "decoy" if ms.offball_intent == "call" else "call"
            self.sound.play("click")
        elif action == "match_vision":
            ms.pro_vision = not ms.pro_vision
            self.sound.play("click")
        elif action == "match_rewind":
            if ms.rewind_beat():
                self.sound.play("rewind")
        elif action == "match_coach":
            if ms.start_coach_demo():
                self.sound.play("whistle")
        elif action == "match_skip":
            ms.skip_phase()
        elif action == "match_replay":
            self.match_session = MatchSession(ms.match.id)
            self.sound.play("whistle")
        elif action == "match_next":
            if ms.next_moment() and ms.phase == "match_summary":
                stars, won, hg, ag = ms.summary()
                self.store.record_match(ms.match.id, stars, won, hg, ag, ms.earned_badges, ms.radar_delta)
                self.sound.play("complete")
        elif action.startswith("match_anchor:"):
            self._match_anchor_action(ms, int(action.split(":")[1]))

    def _play_action(self, action: str) -> None:
        assert self.play_browser is not None
        if action == "play_back":
            self.session = None
        elif action in ("play_next", "play_prev"):
            self.play_browser.change_page(1 if action == "play_next" else -1)
        elif action.startswith("play_family:"):
            self.session = ContinuousSession(int(action.split(":")[1]), self.seed)
            self.seed += 1
            self.history = {}

    def _book_action(self, action: str) -> None:
        book = self.book
        assert book is not None
        if action == "book_back":
            self.session, self.card_index = None, None
        elif action == "book_categories":
            book.category, book.page = None, 0
        elif action == "book_prev":
            book.change_page(-1)
        elif action == "book_next":
            book.change_page(1)
        elif action.startswith("book_category:"):
            book.choose_category(action.split(":")[1])
        elif action.startswith("book_entry:"):
            entry = book.select(int(action.split(":")[1]))
            self.history = {}
            if entry.scene_ids:
                scenes = tuple(book.scenes[key] for key in entry.scene_ids)
                self.session = Session(7, self.seed, scenes=scenes)
                self.card_index = None
            else:
                self.cards = (book.cards[entry.card_id],)
                self.card_index, self.card_elapsed, self.session = 0, 0.0, None

    def _card_action(self, action: str) -> None:
        assert self.card_index is not None
        if action == "card_replay":
            self.card_elapsed = 0.0
        elif action == "card_next":
            if self.book is not None:
                self.activate("book_back")
            else:
                self.card_index = (self.card_index + 1) % len(self.cards)
                self.card_elapsed = 0.0

    def _session_action(self, action: str) -> None:
        s = self.session
        assert s is not None
        if action.startswith("choice:"):
            index = int(action.split(":")[1])
            if s.choose(index):
                choice = s.scene.choices[index]
                self.history.setdefault(s.scene.id, []).append(choice.label)
                self.store.record_classic(s.scene.id, choice.rating)
                self.sound.play("good" if choice.rating == 2 else "click" if choice.rating == 1 else "risk")
        elif action == "coach":
            s.compare_coach()
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
            if self.match_session is not None and self.match_session.phase == "freeze":
                pt = screen_to_pitch(self.hover)
                if pt is not None:
                    self.match_session.preview_point(pt[0], pt[1])
        elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            self._handle_click(self.logical_point(event.pos))
        elif event.type == pygame.KEYDOWN:
            self._key(event.key)

    def _handle_click(self, pos: tuple[int, int]) -> None:
        in_sub = any(x is not None for x in (self.session, self.card_index, self.book, self.play_browser,
                                             self.match_browser, self.match_session))
        if in_sub and pygame.Rect(1120, 35, 125, 40).collidepoint(pos):
            self.activate("menu")
            return
        if self.match_session is not None and self.match_session.phase == "freeze":
            pt = screen_to_pitch(pos)
            if pt is not None:
                res = self.match_session.commit_point(pt[0], pt[1])
                if res is not None:
                    self.sound.play("loft" if self.match_session.loft else "kick")
                return
        for button in self.buttons():
            if button.rect.collidepoint(pos):
                self.activate(button.action)
                return

    def _key(self, key: int) -> None:
        if self._match_key(key):
            return
        if self._play_key(key):
            return
        if self._book_key(key):
            return
        if key == pygame.K_ESCAPE:
            self.activate("menu")
        elif key == pygame.K_i:
            self.activate("toggle_info")
        elif key == pygame.K_m:
            self.activate("toggle_sound")
        elif pygame.K_1 <= key <= pygame.K_9:
            number = key - pygame.K_1
            if self.session is None and self.card_index is None and number < len(MENU_CARDS):
                self.activate(MENU_CARDS[number][2])
            elif self.session is not None and self.session.phase == "decide" and number < 3:
                self.activate(f"choice:{number}")
        elif key == pygame.K_SPACE and self.session is not None:
            self.activate("skip")
        elif key == pygame.K_c:
            self.activate("coach")
        elif key == pygame.K_r:
            self.activate("card_replay" if self.card_index is not None else "retry")
        elif key == pygame.K_n:
            self.activate("card_next" if self.card_index is not None else "next")

    def _match_key(self, key: int) -> bool:
        if self.match_session is not None:
            mapping = {
                pygame.K_l: "match_loft", pygame.K_d: "match_intent", pygame.K_v: "match_vision",
                pygame.K_z: "match_rewind", pygame.K_c: "match_coach", pygame.K_n: "match_next",
                pygame.K_b: "match_back", pygame.K_r: "match_replay", pygame.K_SPACE: "match_skip",
                pygame.K_ESCAPE: "menu",
            }
            if key in mapping:
                self.activate(mapping[key])
                return True
            if pygame.K_1 <= key <= pygame.K_4 and self.match_session.phase == "freeze":
                self.activate(f"match_anchor:{key - pygame.K_1}")
                return True
            return False
        if self.match_browser is None:
            return False
        if key == pygame.K_t:
            self.activate("match_tier")
            return True
        if key == pygame.K_ESCAPE:
            self.activate("menu")
            return True
        if pygame.K_1 <= key <= pygame.K_6:
            action = self.match_browser.number_action(key - pygame.K_1)
            if action is not None:
                self.activate(action)
            return True
        return False

    def _play_key(self, key: int) -> bool:
        if self.play_browser is None:
            return False
        if key == pygame.K_b:
            self.activate("play_back")
            return True
        if self.session is None and pygame.K_1 <= key <= pygame.K_8:
            action = self.play_browser.number_action(key - pygame.K_1)
            if action is not None:
                self.activate(action)
            return True
        if self.session is None and key in (pygame.K_LEFT, pygame.K_RIGHT):
            self.activate("play_prev" if key == pygame.K_LEFT else "play_next")
            return True
        return False

    def _book_key(self, key: int) -> bool:
        if self.book is None:
            return False
        if key == pygame.K_b:
            self.activate("book_back")
            return True
        browsing = self.session is None and self.card_index is None
        if browsing and pygame.K_1 <= key <= pygame.K_7:
            action = self.book.number_action(key - pygame.K_1)
            if action is not None:
                self.activate(action)
            return True
        if browsing and key in (pygame.K_LEFT, pygame.K_RIGHT):
            self.activate("book_prev" if key == pygame.K_LEFT else "book_next")
            return True
        return False

    def draw(self) -> None:
        p = self.painter
        p.errors.clear()
        self.canvas.fill(NAVY)
        p.text("SOCCER SMART LAB", pygame.Rect(30, 27, 680, 48), 49)
        p.text("Scan space, pressure, and teammates before you act.",
               pygame.Rect(32, 83, 720, 30), 26, MUTED)
        role = self.session.scene.role if (self.session is not None and self.session.phase != "summary") else ""
        if self.match_session is not None and self.match_session.phase != "match_summary":
            role = f"{self.match_session.state.rules_mode} captain"
        draw_pitch(p, role)
        p.panel(SIDE)
        self._draw_active_mode(p)
        for button in self.buttons():
            p.button(button, button.rect.collidepoint(self.hover))
        p.text("JOHN = you / Blue = teammates / Coral = opponents / Gold = keeper\nPress M = Sound / I = Coach Info",
               pygame.Rect(32, 829, 740, 45), 21, MUTED)
        snd = "Sound: ON" if self.sound.enabled else "Sound: OFF"
        p.text(f"No countdown. Think it through.  |  {snd}", pygame.Rect(800, 835, 450, 28), 22, MUTED)
        scaled = pygame.transform.smoothscale(self.canvas, self.window.get_size())
        self.window.blit(scaled, (0, 0))
        pygame.display.flip()

    def _draw_active_mode(self, p: Painter) -> None:
        if self.match_session is not None:
            p.text("MENU / ESC", pygame.Rect(1120, 43, 128, 35), 23, GREEN)
            draw_match_screen(p, self.match_session)
        elif self.match_browser is not None:
            p.text("MENU / ESC", pygame.Rect(1120, 43, 128, 35), 23, GREEN)
            self.match_browser.draw(p)
        elif self.play_browser is not None and self.session is None:
            p.text("MENU / ESC", pygame.Rect(1120, 43, 128, 35), 23, GREEN)
            self.play_browser.draw(p)
        elif self.card_index is not None:
            p.text("MENU / ESC", pygame.Rect(1120, 43, 128, 35), 23, GREEN)
            self._draw_card()
        elif self.book is not None and self.session is None:
            p.text("MENU / ESC", pygame.Rect(1120, 43, 128, 35), 23, GREEN)
            self.book.draw(p)
        elif self.session is None:
            self._menu()
        else:
            p.text("MENU / ESC", pygame.Rect(1120, 43, 128, 35), 23, GREEN)
            self._scene()

    def _menu(self) -> None:
        p = self.painter
        for point, label, team in (((44.0, 56.0), "JOHN", "home"), ((52.0, 46.0), "A", "away"),
                                   ((28.0, 40.0), "Maya", "home"), ((50.0, 93.0), "GK", "keeper")):
            draw_player(p, point, label, team)
        draw_ball(p, (44.0, 55.0))
        p.text("Choose a mode or Match Day Cup.", pygame.Rect(814, 152, 410, 42), 31)
        p.text("Try 09 Match Day Cup for live 7v7 & 9v9 pitch play!",
               pygame.Rect(814, 198, 410, 36), 22, GOLD)
        p.text(f"Starter: {len(TOPICS)} topics / 36 scenes / 7 cards / 6 Cup matches.",
               pygame.Rect(814, 780, 410, 28), 21, GREEN)

    def _draw_card(self) -> None:
        assert self.card_index is not None
        card = self.cards[self.card_index]
        p = self.painter
        fraction = min(1.0, (self.card_elapsed % ANIMATION_SECONDS) / ANIMATION_SECONDS)
        actors, ball = card_positions(card, fraction)
        for actor in card.actors:
            draw_player(p, actors[actor.key], actor.label, actor.team, actor.heading)
        draw_ball(p, ball, card_height(card, fraction))
        if card.ball_control is not None or card.waypoints:
            points = [pitch_point(card_positions(card, i / 40)[1]) for i in range(41)]
            pygame.draw.lines(self.canvas, GOLD, False, points, 3)
        else:
            arrow(self.canvas, pitch_point(card.ball_start), pitch_point(card.ball_end), GOLD)
        p.text(f"PRACTICE CARD  {self.card_index + 1}/{len(self.cards)}  /  UNSCORED",
               pygame.Rect(814, 162, 410, 28), 23, GREEN)
        p.text(card.title, pygame.Rect(814, 198, 410, 52), 34)
        if self.coach_info:
            locators = ", ".join(
                f"{gid} (p. {'/'.join(str(pg) for pg in group_for_id(gid).locators) or 'overview'})"
                for gid in card.groups
            )
            if self.book is not None and self.book.selected is not None:
                locators = f"index p. {self.book.selected.page} / original activity"
            p.text(f"Coach info: {locators}", pygame.Rect(814, 254, 410, 48), 21, GOLD)
        else:
            p.text("Press I to view parent/coach notes & index.", pygame.Rect(814, 254, 410, 40), 21, MUTED)
        p.text(card.summary, pygame.Rect(814, 312, 410, 120), 25)
        p.text("Practice idea:\n" + card.adult_prompt, pygame.Rect(814, 442, 410, 150), 23, MUTED)

    def _scene(self) -> None:
        s = self.session
        assert s is not None
        if s.phase == "summary":
            self._summary()
            return
        scene = s.scene
        if scene.reference_line is not None:
            y = pitch_point((0.0, scene.reference_line))[1]
            pygame.draw.line(self.canvas, GOLD, (52, y), (746, y), 2)
        actors, ball = positions(scene, s.phase, s.fraction, s.selected)
        for actor in scene.actors:
            draw_player(self.painter, actors[actor.key], actor.label, actor.team, actor.heading)
        draw_ball(self.painter, ball, ball_height(scene, s.phase, s.fraction, s.selected))
        if s.phase == "decide":
            for i, button in enumerate(self.buttons()):
                if button.action.startswith("choice:") and button.rect.collidepoint(self.hover):
                    choice_route(self.painter, scene, scene.choices[i], GOLD)
        elif s.phase in ("feedback", "coach"):
            self._feedback_overlay()
        self._instructions()

    def _instructions(self) -> None:
        s = self.session
        assert s is not None
        p = self.painter
        mode = "NEW LAYOUT" if s.scene.transfer else "PRACTICE"
        progress = (f"PLAY {s.index + 1}/{len(s.plays)} / STEP {s.depth}" if isinstance(s, ContinuousSession) else
                    f"{mode}  {s.index + 1}/{len(s.scenes)}" + (f"  /  {s.scene.base_id}" if self.coach_info else ""))
        p.text(progress, pygame.Rect(814, 158, 410, 26), 23, GREEN)
        p.text(s.scene.title, pygame.Rect(814, 190, 410, 72), 33)
        groups = f"  ({', '.join(s.scene.groups)})" if self.coach_info else ""
        label = "Task: " + s.play.title if isinstance(s, ContinuousSession) else f"Role: {s.scene.role}{groups}"
        p.text(label, pygame.Rect(814, 266, 410, 34), 23, GOLD)
        if s.phase == "feedback":
            self._feedback_text()
        else:
            p.text(s.scene.cue, pygame.Rect(814, 310, 410, 96), 25)
            if s.phase in ("observe", "outcome", "coach"):
                labels = {
                    "observe": "Watch the build-up...",
                    "outcome": "Watch your chosen action...",
                    "coach": "Watch the coach demonstration...",
                }
                p.text(labels[s.phase], pygame.Rect(814, 440, 410, 64), 28, GOLD)
            if s.phase == "decide":
                p.text("Hover to preview your move or pass destination.",
                       pygame.Rect(814, 658, 410, 48), 22, GOLD)
            if self.coach_info or "Offside" in s.scene.rules or "Throw-in" in s.scene.rules:
                p.text(s.scene.rules, pygame.Rect(814, 712 if s.phase == "decide" else 610, 410, 68),
                       22, MUTED)

    def _feedback_text(self) -> None:
        s = self.session
        assert s is not None and s.feedback is not None
        c = s.feedback
        color = (CORAL, GOLD, GREEN)[c.rating]
        label = ("Tough spot - check the risk", "Solid safe choice", "Great read!")[c.rating]
        p = self.painter
        p.text(label, pygame.Rect(814, 306, 410, 36), 30, color)
        p.text(c.outcome, pygame.Rect(814, 346, 410, 58), 23)
        p.text(c.explanation, pygame.Rect(814, 408, 410, 108), 23, MUTED)
        p.text(s.scene.coach_note, pygame.Rect(814, 520, 410, 52), 21, GREEN)
        prior = self.history.get(s.scene.id, [])
        note = "First-try result saved. Press C for coach or R to retry."
        if len(prior) > 1:
            note = "Compared with: " + prior[-2]
        if isinstance(s, ContinuousSession) and s.practice_only:
            note = "Practice branch: first-run scores stay saved."
        p.text(note, pygame.Rect(814, 574, 410, 34), 20, GOLD)

    def _feedback_overlay(self) -> None:
        s = self.session
        assert s is not None and s.feedback is not None
        choice_route(self.painter, s.scene, s.feedback, GOLD)
        best = coach_choice(s.scene, s.selected)
        distinct = route_destination(s.feedback) != route_destination(best)
        if distinct or s.phase == "coach":
            choice_route(self.painter, s.scene, best, GREEN, True)
        if s.scene.shot_window is not None:
            draw_window_marker(self.canvas, pitch_point(s.scene.shot_window))
        legend = ("Gold solid: your choice / Green dashed: coach route"
                  if distinct else "Your choice matches the coach destination")
        legend_y = 700 if s.scene.ball[1] < 35.0 else 184
        self.painter.text(legend, pygame.Rect(64, legend_y, 650, 26), 22)
        self.painter.text("Illustrated routes, not guaranteed outcomes.",
                          pygame.Rect(64, legend_y + 26, 650, 26), 20, MUTED)

    def _summary(self) -> None:
        s = self.session
        assert s is not None
        p = self.painter
        practice, total, transfer, checks = s.summary()
        stars = _star_count(s.results)
        p.text(f"Session complete!  {'*' * stars}", pygame.Rect(814, 172, 410, 55), 38, GREEN)
        p.text("Strong or reasonable first tries", pygame.Rect(814, 240, 410, 34), 26)
        progress = (f"Practice: {practice} / {total}\nBook topic round" if self.book else
                    f"Practice: {practice} / {total}\nNew layouts: {transfer} / {checks}")
        if isinstance(s, ContinuousSession):
            progress = f"Decisions: {practice} / {total}\nFirst run / visited steps only"
        p.text(progress, pygame.Rect(814, 294, 410, 96), 36, GOLD)
        p.text("Soccer Smarts checklist:\nWhere is the pressure?\nWhere is the open space?\nWho has a clear passing lane?",
               pygame.Rect(814, 414, 410, 150), 25)
        weak = [scene.title for scene in s.scenes if scene.id in s.results and s.results[scene.id] == 0]
        message = ("Review next: " + "; ".join(dict.fromkeys(weak))[:110]
                   if weak else "Great scanning across roles! Try Match Day Cup next.")
        p.text(message, pygame.Rect(814, 588, 410, 120), 24, MUTED)
        p.text("SCAN\nDECIDE\nSUPPORT", pygame.Rect(150, 330, 520, 260), 78, GREEN)

    def run(self) -> None:
        clock = pygame.time.Clock()
        try:
            while self.running:
                seconds = min(clock.tick(60) / 1000.0, 0.1)
                for event in pygame.event.get():
                    self.handle_event(event)
                if self.match_session is not None:
                    ev = self.match_session.tick(seconds)
                    if ev == "goal":
                        self.sound.play("goal")
                    elif ev in ("saved", "rebound", "corner"):
                        self.sound.play("save")
                    elif ev in ("intercepted", "offside", "conceded"):
                        self.sound.play("intercept")
                if self.session is not None:
                    self.session.tick(seconds)
                if self.card_index is not None:
                    self.card_elapsed += seconds
                self.draw()
        finally:
            pygame.quit()
