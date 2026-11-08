"""Real SDL dummy-driver UI tests for Soccer Smart Lab."""

import os
import unittest
from dataclasses import replace

os.environ["SDL_VIDEODRIVER"] = "dummy"
os.environ["SDL_AUDIODRIVER"] = "dummy"
os.environ["PYGAME_HIDE_SUPPORT_PROMPT"] = "1"

import pygame

from soccer_strategy.soccer_smart.app import App
from soccer_strategy.soccer_smart.catalog import build_catalog, build_practice_cards
from soccer_strategy.soccer_smart.drawing import (
    BLUE,
    GOLD,
    GREEN,
    NAVY,
    Painter,
    arrow,
    dashed_arrow,
    draw_window_marker,
    pitch_point,
)
from soccer_strategy.soccer_smart.presentation import route_destination
from soccer_strategy.soccer_smart.session import ANIMATION_SECONDS, Session


class UITests(unittest.TestCase):
    def setUp(self) -> None:
        self.app = App()

    def tearDown(self) -> None:
        pygame.quit()

    def click(self, point: tuple[int, int]) -> None:
        self.app.handle_event(pygame.event.Event(pygame.MOUSEBUTTONDOWN, button=1, pos=point))

    def key(self, key: int) -> None:
        self.app.handle_event(pygame.event.Event(pygame.KEYDOWN, key=key))

    def test_menu_offers_seven_cards_and_preserves_stages_and_practice_cards(self) -> None:
        self.assertEqual(len(self.app.buttons()), 7)
        self.assertIn("Read and receive", self.app.buttons()[0].label)
        self.assertIn("Mixed round", self.app.buttons()[4].label)
        self.assertIn("Practice cards", self.app.buttons()[5].label)
        self.app.draw()
        self.assertFalse(self.app.layout_errors)
        for index in range(5):
            self.key(pygame.K_ESCAPE)
            self.app.draw()
            self.click(self.app.buttons()[index].rect.center)
            assert self.app.session is not None
            self.assertEqual(self.app.session.stage, index + 1)
            self.assertEqual(len(self.app.session.scenes), 8)
        self.key(pygame.K_ESCAPE)
        self.key(pygame.K_6)
        self.assertEqual(self.app.card_index, 0)
        self.assertIsNone(self.app.session)

    def test_practice_cards_browse_replay_and_render_without_overflow(self) -> None:
        self.app.activate("cards:0")
        cards = build_practice_cards()
        for expected in range(len(cards)):
            self.assertEqual(self.app.card_index, expected)
            self.app.card_elapsed = 1.0
            self.app.draw()
            self.assertFalse(self.app.layout_errors)
            self.key(pygame.K_r)
            self.assertEqual(self.app.card_elapsed, 0.0)
            self.click(self.app.buttons()[1].rect.center)
        self.assertEqual(self.app.card_index, 0)
        self.key(pygame.K_n)
        self.assertEqual(self.app.card_index, 1)
        self.click(self.app.buttons()[0].rect.center)
        self.assertEqual(self.app.card_elapsed, 0.0)
        self.click(self.app.buttons()[2].rect.center)
        self.assertIsNone(self.app.card_index)

    def test_decision_has_no_answer_leak_and_hover_shows_chosen_route(self) -> None:
        self.app.activate("stage:3")
        assert self.app.session is not None
        scene = next(s for s in build_catalog() if s.id == "T09.A")
        self.app.session.scenes = (scene,)
        self.app.session.phase = "decide"
        self.app.hover = (-1, -1)
        self.app.draw()
        base_pixels = pygame.image.tobytes(self.app.canvas, "RGB")
        assert scene.shot_window is not None
        wx, wy = pitch_point(scene.shot_window)
        self.assertNotEqual(self.app.canvas.get_at((wx, wy + 20))[:3], BLUE)
        self.app.hover = self.app.buttons()[0].rect.center
        self.app.draw()
        self.assertNotEqual(pygame.image.tobytes(self.app.canvas, "RGB"), base_pixels)
        dest = pitch_point(route_destination(scene.choices[0]))
        self.assertEqual(self.app.canvas.get_at((dest[0], dest[1] - 8))[:3], GOLD)
        self.assertFalse(self.app.layout_errors)

    def test_feedback_shows_routes_window_coach_demo_and_comparison(self) -> None:
        self.app.activate("stage:3")
        assert self.app.session is not None
        scene = next(s for s in build_catalog() if s.id == "T09.A")
        self.app.session.scenes = (scene,)
        self.app.session.phase = "decide"
        self.key(pygame.K_2)
        self.key(pygame.K_SPACE)
        self.assertEqual(self.app.session.phase, "feedback")
        self.app.draw()
        self.assertFalse(self.app.layout_errors)
        chosen_dest = pitch_point(route_destination(scene.choices[1]))
        best_dest = pitch_point(route_destination(scene.choices[0]))
        self.assertEqual(self.app.canvas.get_at((chosen_dest[0], chosen_dest[1] - 8))[:3], GOLD)
        self.assertEqual(self.app.canvas.get_at((best_dest[0], best_dest[1] - 8))[:3], GREEN)
        assert scene.shot_window is not None
        wx, wy = pitch_point(scene.shot_window)
        self.assertEqual(self.app.canvas.get_at((wx, wy + 20))[:3], BLUE)
        self.key(pygame.K_c)
        self.assertEqual(self.app.session.phase, "coach")
        self.app.draw()
        self.assertFalse(self.app.layout_errors)
        self.key(pygame.K_SPACE)
        self.assertEqual(self.app.session.phase, "feedback")
        self.key(pygame.K_r)
        self.key(pygame.K_SPACE)
        self.key(pygame.K_1)
        self.key(pygame.K_SPACE)
        self.app.draw()
        self.assertFalse(self.app.layout_errors)

    def test_every_authored_scene_and_choice_renders_without_overflow(self) -> None:
        self.app.session = Session(1, 0)
        for scene in build_catalog():
            self.app.session.scenes = (scene,)
            self.app.session.index = 0
            for phase in ("observe", "decide"):
                self.app.session.phase = phase
                self.app.draw()
                self.assertFalse(self.app.layout_errors, (scene.id, phase, self.app.layout_errors))
            for idx in range(3):
                self.app.session.selected = idx
                for phase in ("outcome", "feedback", "coach"):
                    self.app.session.phase = phase
                    self.app.session.elapsed = 1.2
                    self.app.draw()
                    self.assertFalse(self.app.layout_errors, (scene.id, phase, idx, self.app.layout_errors))

    def test_keyboard_round_summary_resize_and_quit(self) -> None:
        self.key(pygame.K_2)
        assert self.app.session is not None
        for _ in range(8):
            self.key(pygame.K_SPACE)
            self.key(pygame.K_1)
            self.key(pygame.K_SPACE)
            self.key(pygame.K_n)
        self.assertEqual(self.app.session.phase, "summary")
        self.app.draw()
        self.assertFalse(self.app.layout_errors)
        self.click(self.app.buttons()[0].rect.center)
        self.assertIsNone(self.app.session)
        self.app.window = pygame.display.set_mode((640, 440), pygame.RESIZABLE)
        btn = self.app.buttons()[0].rect.center
        self.click((btn[0] // 2, btn[1] // 2))
        self.assertIsNotNone(self.app.session)
        self.app.handle_event(pygame.event.Event(pygame.MOUSEMOTION, pos=(20, 40)))
        self.assertEqual(self.app.hover, (40, 80))
        self.click((1180 // 2, 55 // 2))
        self.assertIsNone(self.app.session)
        self.app.activate("cards:0")
        pygame.event.post(pygame.event.Event(pygame.QUIT))
        self.app.run()
        self.assertFalse(pygame.display.get_init())

    def test_drawing_primitives_and_overflow_sensor(self) -> None:
        surface = pygame.Surface((240, 120))
        surface.fill(NAVY)
        arrow(surface, (20, 60), (28, 60), GOLD)
        arrow(surface, (20, 60), (200, 60), GOLD)
        dashed_arrow(surface, (20, 90), (28, 90), GREEN)
        dashed_arrow(surface, (20, 90), (200, 90), GREEN)
        draw_window_marker(surface, (120, 40))
        self.assertEqual(surface.get_at((120, 60))[:3], BLUE)
        painter = Painter(self.app.canvas)
        painter.text("Sentence that overflows tiny box", pygame.Rect(0, 0, 10, 10))
        self.assertTrue(painter.errors)
        painter.errors.clear()
        painter.text("OversizedWord", pygame.Rect(0, 0, 2, 500))
        self.assertTrue(painter.errors)

    def test_ignore_inactive_inputs_and_all_perfect_summary(self) -> None:
        self.key(pygame.K_r)
        self.key(pygame.K_n)
        self.key(pygame.K_c)
        self.key(pygame.K_SPACE)
        self.key(pygame.K_z)
        self.app.activate("unknown")
        self.app.handle_event(pygame.event.Event(pygame.USEREVENT))
        self.app.handle_event(pygame.event.Event(pygame.MOUSEBUTTONDOWN, button=3, pos=(0, 0)))
        for method in (self.app._draw_card, self.app._scene, self.app._instructions,
                       self.app._feedback_text, self.app._feedback_overlay, self.app._summary):
            with self.assertRaises(AssertionError):
                method()
        for action_method in (self.app._card_action, self.app._session_action):
            with self.assertRaises(AssertionError):
                action_method("ignored")
        self.app.activate("cards:0")
        self.app.activate("ignored")
        self.key(pygame.K_1)
        self.app.activate("stage:1")
        assert self.app.session is not None
        for feedback_method in (self.app._feedback_text, self.app._feedback_overlay):
            with self.assertRaises(AssertionError):
                feedback_method()
        self.click((2, 2))
        self.key(pygame.K_5)
        self.assertEqual(self.app.session.phase, "observe")
        self.app.session.tick(ANIMATION_SECONDS)
        self.key(pygame.K_5)
        self.app.activate("choice:9")
        self.app.activate("ignored")
        self.assertEqual(self.app.session.phase, "decide")
        best_first = next(i for i, c in enumerate(self.app.session.scene.choices) if c.rating == 2)
        self.app.session.choose(best_first)
        self.app.session.tick(ANIMATION_SECONDS)
        self.app.session.advance()
        for _ in range(7):
            self.app.session.tick(ANIMATION_SECONDS)
            best = next(i for i, c in enumerate(self.app.session.scene.choices) if c.rating == 2)
            self.app.session.choose(best)
            self.app.session.tick(ANIMATION_SECONDS)
            self.app.session.advance()
        self.app.draw()
        self.assertFalse(self.app.layout_errors)
        scene = self.app.session.scene
        self.app.session.scenes = (replace(scene, ball=(40.0, 15.0)),)
        self.app.session.index = 0
        self.app.session.selected = 0
        self.app.session.phase = "feedback"
        self.app.draw()
        self.assertFalse(self.app.layout_errors)
        corrupt = replace(scene, choices=tuple(replace(c, rating=0) for c in scene.choices))
        self.app.session.scenes = (corrupt,)
        with self.assertRaises(StopIteration):
            self.app._feedback_overlay()


if __name__ == "__main__":
    unittest.main()
