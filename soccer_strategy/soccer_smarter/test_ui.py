"""Real SDL inputs and rendering for every authored node and growth step."""

import os
import unittest

os.environ["SDL_VIDEODRIVER"] = "dummy"
os.environ["SDL_AUDIODRIVER"] = "dummy"
os.environ["PYGAME_HIDE_SUPPORT_PROMPT"] = "1"

import pygame

from soccer_strategy.soccer_smarter.app import App
from soccer_strategy.soccer_smarter.session import Session
from soccer_strategy.soccer_smarter.rendering import draw_world
from soccer_strategy.soccer_smart.drawing import BLUE, GOLD, pitch_point


class UITests(unittest.TestCase):
    def setUp(self):
        self.app = App()

    def tearDown(self):
        pygame.quit()

    def key(self, key):
        self.app.handle_event(pygame.event.Event(pygame.KEYDOWN, key=key))

    def click(self, action):
        button = next(b for b in self.app.buttons() if b.action == action)
        width, height = self.app.window.get_size()
        point = (round(button.rect.centerx * width / 1280), round(button.rect.centery * height / 880))
        self.app.handle_event(pygame.event.Event(pygame.MOUSEBUTTONDOWN, button=1, pos=point))

    def assert_fits(self):
        self.app.draw()
        self.assertFalse(self.app.layout_errors)

    def test_menu_separate_missions_basics_and_notebook(self):
        self.assertEqual(len(self.app.buttons()), 9)
        self.assert_fits()
        for number in range(7):
            self.key(pygame.K_1 + number)
            self.assertEqual(self.app.session.episode.id[:3], f"M0{number + 1}")
            self.key(pygame.K_ESCAPE)
        self.key(pygame.K_9)
        self.assertEqual(self.app.page, "basics")
        self.assert_fits()
        self.click("menu")
        self.key(pygame.K_8)
        self.assertEqual(self.app.page, "notebook")
        self.assert_fits()

    def test_controls_pause_hover_coach_retry_continuity_and_summary(self):
        self.click("mission:M01")
        self.key(pygame.K_p)
        self.app.update(.5)
        self.assertEqual(self.app.session.elapsed, 0)
        self.key(pygame.K_PERIOD)
        self.assertGreater(self.app.session.elapsed, 0)
        self.assert_fits()
        self.key(pygame.K_SPACE)
        self.assert_fits()
        pixels = pygame.image.tobytes(self.app.canvas, "RGB")
        button = next(b for b in self.app.buttons() if b.action == "choice:0")
        self.app.handle_event(pygame.event.Event(pygame.MOUSEMOTION, pos=button.rect.center))
        self.app.draw()
        self.assertNotEqual(pixels, pygame.image.tobytes(self.app.canvas, "RGB"))
        self.key(pygame.K_1)
        self.key(pygame.K_SPACE)
        self.assert_fits()
        saved = dict(self.app.session.results)
        self.key(pygame.K_c)
        self.assertEqual(self.app.session.phase, "coach")
        self.assert_fits()
        self.key(pygame.K_SPACE)
        self.key(pygame.K_r)
        self.key(pygame.K_SPACE)
        self.key(pygame.K_1)
        self.key(pygame.K_SPACE)
        self.key(pygame.K_n)
        self.assertEqual(self.app.session.node.id, "adapt")
        self.assertEqual(self.app.session.results, saved)
        self.assert_fits()
        self.click("menu")

    def test_every_scene_choice_phase_and_notebook_text_fits(self):
        self.app.page = "game"
        for mission in tuple(f"M0{i}" for i in range(1, 8)):
            self.app.session = Session(mission)
            session = self.app.session
            for index, episode in enumerate(session.episodes):
                session.index = index
                for node in episode.nodes:
                    session.node_id = node.id
                    for phase in ("observe", "decide", "predict", "summary"):
                        session.phase = phase
                        session.selected = None
                        self.assert_fits()
                    for choice in range(3):
                        session.selected = choice
                        for phase in ("outcome", "feedback", "coach"):
                            session.phase = phase
                            session.elapsed = 1.2
                            self.assert_fits()
        self.app.activate("notebook")
        for activity in ("X01", "X02", "X03"):
            self.app.activate("journal:" + activity)
            while self.app.notebook.step is not None:
                self.assert_fits()
                self.app.activate("note:0" if self.app.notebook.step.options else "note_skip")
            self.assert_fits()

    def test_notebook_keeps_scores_and_real_evidence_when_edited_or_skipped(self):
        self.app.activate("mission:M02")
        self.key(pygame.K_SPACE)
        self.key(pygame.K_1)
        before = dict(self.app.session.results)
        self.app.activate("notebook")
        self.click("journal:X01")
        self.key(pygame.K_1)
        self.assertTrue(self.app.notebook.step.options)
        self.key(pygame.K_1)
        self.click("note_back")
        self.click("note_skip")
        self.key(pygame.K_2)
        self.assert_fits()
        self.assertEqual(self.app.session.results, before)
        self.assertIn("M02.A", self.app.notebook.entries["X01"]["evidence"])
        self.click("resume")
        self.assertEqual(self.app.page, "game")
        self.assertEqual(self.app.session.results, before)

    def test_resize_inactive_inputs_and_quit(self):
        for key in (pygame.K_0, pygame.K_c, pygame.K_r, pygame.K_n, pygame.K_SPACE, pygame.K_p, pygame.K_PERIOD):
            self.key(key)
        self.app.activate("ignored")
        self.app.window = pygame.display.set_mode((640, 440), pygame.RESIZABLE)
        self.click("mission:M04")
        self.key(pygame.K_2)
        self.assertEqual(self.app.session.prediction, 1)
        self.assert_fits()
        self.app.handle_event(pygame.event.Event(pygame.MOUSEBUTTONDOWN, button=3, pos=(0, 0)))
        self.app.handle_event(pygame.event.Event(pygame.MOUSEBUTTONDOWN, button=1, pos=(0, 0)))
        self.app.handle_event(pygame.event.Event(pygame.USEREVENT))
        self.app.handle_event(pygame.event.Event(pygame.MOUSEMOTION, pos=(10, 20)))
        self.assertEqual(self.app.hover, (20, 40))
        pygame.event.post(pygame.event.Event(pygame.QUIT))
        self.app.run()
        self.assertFalse(pygame.display.get_init())

    def test_keyboard_growth_edit_skip_home_and_summary_replay(self):
        self.app.activate("notebook")
        self.assert_fits()
        self.key(pygame.K_6)
        self.key(pygame.K_1)
        self.key(pygame.K_n)
        self.key(pygame.K_r)
        self.key(pygame.K_z)
        self.key(pygame.K_1)
        self.key(pygame.K_n)
        self.key(pygame.K_1)
        self.click("growth_home")
        self.key(pygame.K_2)
        self.app.activate("ignored")
        self.app.activate("menu")
        self.app.activate("mission:M01")
        self.key(pygame.K_1)
        self.app.activate("ignored")
        self.key(pygame.K_z)
        self.app.session.phase = "summary"
        self.key(pygame.K_r)
        self.assertTrue(self.app.session.practice_only)
        self.assertEqual(self.app.session.phase, "observe")
        self.app.activate("basics")
        self.key(pygame.K_1)
        self.key(pygame.K_z)

    def test_long_evidence_and_corrupt_controller_fail_closed(self):
        self.app.activate("resume")
        self.assertEqual(self.app.page, "menu")
        self.app.activate("notebook")
        self.app.notebook.start("X01", ("M02.A/root: " + "route " * 25,))
        self.app.notebook.choose(0)
        self.assert_fits()
        self.app.page = "game"
        for method in (self.app._game_buttons, self.app._game, self.app._feedback):
            with self.assertRaises(AssertionError):
                method()
        with self.assertRaises(AssertionError):
            self.app._game_action("skip")
        self.app.update(.1)
        self.key(pygame.K_1)
        self.key(pygame.K_c)
        with self.assertRaises(AssertionError):
            self.app.draw()
        self.app.session = Session()
        with self.assertRaises(AssertionError):
            self.app._feedback()

    def test_preview_ignored_outside_decision_and_no_unused_input_effect(self):
        self.app.activate("mission:M02")
        self.app.canvas.fill((14, 29, 40))
        draw_world(self.app.painter, self.app.session)
        pixels = pygame.image.tobytes(self.app.canvas, "RGB")
        self.app.canvas.fill((14, 29, 40))
        draw_world(self.app.painter, self.app.session, 0)
        self.assertEqual(pixels, pygame.image.tobytes(self.app.canvas, "RGB"))
        self.key(pygame.K_SPACE)
        self.key(pygame.K_6)
        self.assertEqual(self.app.session.phase, "decide")

    def test_hover_shows_intention_before_interception_and_target_is_visible(self):
        self.app.activate("mission:M02")
        self.key(pygame.K_SPACE)
        action = self.app.session.node.choices[1]
        self.app.hover = next(b.rect.center for b in self.app.buttons() if b.action == "choice:1")
        self.assert_fits()
        beyond_blocker = pitch_point(action.preview(self.app.session.node.state).sample(.65))
        self.assertEqual(self.app.canvas.get_at(beyond_blocker)[:3], GOLD)
        self.key(pygame.K_2)
        self.key(pygame.K_SPACE)
        self.assert_fits()
        self.assertNotEqual(self.app.canvas.get_at(beyond_blocker)[:3], GOLD)
        self.app.activate("mission:M03")
        self.assert_fits()
        x, y = pitch_point(self.app.session.node.shot_window)
        self.assertEqual(self.app.canvas.get_at((x, y + 20))[:3], BLUE)


if __name__ == "__main__":
    unittest.main()
