"""Real SDL dummy-driver UI tests, without mocking Pygame."""

import os
import unittest

os.environ["SDL_VIDEODRIVER"] = "dummy"
os.environ["SDL_AUDIODRIVER"] = "dummy"
os.environ["PYGAME_HIDE_SUPPORT_PROMPT"] = "1"

import pygame

from soccer_strategy.john.app import App


class UITests(unittest.TestCase):
    def setUp(self):
        self.app = App()

    def tearDown(self):
        pygame.quit()

    def test_menu_offers_seven_training_sections(self):
        self.assertEqual(len(self.app.buttons()), 7)
        self.assertIn("Defend shooting", self.app.buttons()[1].label)
        self.assertIn("Receive and decide", self.app.buttons()[6].label)
        self.assertLessEqual(self.app.buttons()[6].rect.bottom, 780)
        self.app.draw()
        self.assertFalse(self.app.layout_errors)

    def test_every_section_can_be_opened_and_menu_keys_do_not_choose_actions(self):
        for index in range(7):
            self.key(pygame.K_ESCAPE)
            self.app.draw()
            self.click(self.app.buttons()[index].rect.center)
            self.assertEqual(self.app.session.stage, index + 1)
            self.assertEqual(len(self.app.session.scenes), 8)
        for key in (pygame.K_4, pygame.K_5, pygame.K_6, pygame.K_7):
            self.key(pygame.K_ESCAPE)
            self.key(key)
            self.assertEqual(self.app.session.stage, key - pygame.K_1 + 1)
            self.app.session.tick(3)
            self.key(key)
            self.assertEqual(self.app.session.phase, "decide")
            self.assertFalse(self.app.session.results)

    def test_keeper_throw_and_later_pressure_both_render_clearly(self):
        from soccer_strategy.john.catalog import build_catalog
        self.app.activate("stage:2")
        session = self.app.session
        session.scenes = (next(s for s in build_catalog() if s.id == "25.1"),)
        session.elapsed = .1
        self.app.draw()
        self.assertFalse(self.app.layout_errors)
        early = pygame.image.tobytes(self.app.canvas, "RGB")
        session.elapsed = 1.7
        self.app.draw()
        self.assertFalse(self.app.layout_errors)
        self.assertNotEqual(early, pygame.image.tobytes(self.app.canvas, "RGB"))

    def test_build_out_line_only_appears_before_pressure_in_the_7v7_throw_picture(self):
        from soccer_strategy.john.catalog import build_catalog
        from soccer_strategy.john.drawing import PITCH, pitch_point
        self.app.activate("stage:5")
        scene = next(s for s in build_catalog() if s.id == "25.1")
        session = self.app.session
        session.scenes = (scene,)
        session.phase = "observe"
        session.elapsed = .1 * 2.4
        self.app.draw()
        x, y = PITCH.left + 2, pitch_point((0, 36))[1]
        visible_line = self.app.canvas.get_at((x, y))[:3]
        self.assertEqual(visible_line, (170, 206, 181))
        session.elapsed = .5 * 2.4
        self.app.draw()
        self.assertNotEqual(self.app.canvas.get_at((x, y))[:3], visible_line)
        self.assertFalse(self.app.layout_errors)

    def test_mouse_decision_retry_and_next(self):
        self.app.draw()
        self.click(self.app.buttons()[0].rect.center)
        self.assertEqual(self.app.session.phase, "observe")
        self.click((2, 2))
        self.assertEqual(self.app.session.phase, "observe")
        self.app.session.tick(3)
        self.app.draw()
        self.click(self.app.buttons()[0].rect.center)
        self.assertEqual(self.app.session.phase, "outcome")
        self.app.session.tick(3)
        self.app.draw()
        self.click(self.app.buttons()[0].rect.center)
        self.assertEqual(self.app.session.phase, "observe")
        self.app.session.tick(3)
        self.click(self.app.buttons()[1].rect.center)
        self.app.session.tick(3)
        self.click(self.app.buttons()[1].rect.center)
        self.assertEqual(self.app.session.index, 1)

    def test_real_render_for_every_scene_and_choice(self):
        from soccer_strategy.john.catalog import build_catalog
        from soccer_strategy.john.session import Session
        self.app.session = Session()
        for scene in build_catalog():
            self.app.session.scenes = (scene,)
            self.app.session.index = 0
            for phase in ("observe", "decide"):
                self.app.session.phase = phase
                self.app.draw()
                self.assertFalse(self.app.layout_errors, (scene.id, phase, self.app.layout_errors))
            for index in range(3):
                self.app.session.selected = index
                for phase in ("outcome", "feedback"):
                    self.app.session.phase = phase
                    self.app.session.elapsed = 1.2
                    self.app.draw()
                    self.assertFalse(self.app.layout_errors, (scene.id, phase, index, self.app.layout_errors))

    def test_keyboard_summary_resize_and_exit(self):
        self.key(pygame.K_3)
        self.assertEqual(self.app.session.stage, 3)
        for _ in range(8):
            self.key(pygame.K_SPACE)
            self.key(pygame.K_1)
            self.key(pygame.K_SPACE)
            self.key(pygame.K_n)
        self.assertEqual(self.app.session.phase, "summary")
        self.app.draw()
        self.assertFalse(self.app.layout_errors)
        self.key(pygame.K_ESCAPE)
        self.assertIsNone(self.app.session)
        self.app.draw()
        self.app.handle_event(pygame.event.Event(pygame.QUIT))
        self.assertFalse(self.app.running)

    def test_resized_window_mouse_coordinates_and_main_loop(self):
        self.app.window = pygame.display.set_mode((640, 440), pygame.RESIZABLE)
        point = self.app.buttons()[0].rect.center
        self.click((point[0] // 2, point[1] // 2))
        self.assertEqual(self.app.session.stage, 1)
        self.app.draw()
        self.app.handle_event(pygame.event.Event(pygame.MOUSEMOTION, pos=(20, 40)))
        self.assertEqual(self.app.hover, (40, 80))
        self.click((1180 // 2, 55 // 2))
        self.assertIsNone(self.app.session)
        pygame.event.post(pygame.event.Event(pygame.QUIT))
        self.app.run()
        self.assertFalse(pygame.display.get_init())

    def test_no_answer_overlay_before_feedback(self):
        self.app.activate("stage:1")
        self.app.session.tick(3)
        self.app.draw()
        before = pygame.image.tobytes(self.app.canvas, "RGB")
        self.app.session.selected = 0
        self.app.draw()
        self.assertEqual(before, pygame.image.tobytes(self.app.canvas, "RGB"))
        self.app.session.phase = "feedback"
        self.app.draw()
        self.assertNotEqual(before, pygame.image.tobytes(self.app.canvas, "RGB"))

    def test_shot_direction_and_block_ring_appear_only_in_feedback(self):
        from soccer_strategy.john.catalog import build_catalog
        from soccer_strategy.john.drawing import BLUE, CORAL, pitch_point
        from soccer_strategy.john.model import transfer_scene
        self.app.activate("stage:2")
        base = next(s for s in build_catalog() if s.id == "33.2")
        for scene in (base, transfer_scene(base, .92)):
            self.app.session.scenes = (scene,)
            self.app.session.selected = 2
            aim = pitch_point(scene.shot_target)
            block = pitch_point(next(c.target for c in scene.choices if c.key == "block"))
            for phase in ("observe", "decide", "outcome"):
                self.app.session.phase = phase
                self.app.draw()
                self.assertNotEqual(self.app.canvas.get_at(aim)[:3], CORAL, phase)
                self.assertNotEqual(self.app.canvas.get_at((block[0], block[1] - 30))[:3], BLUE, phase)
            self.app.session.phase = "feedback"
            self.app.draw()
            self.assertEqual(self.app.canvas.get_at(aim)[:3], CORAL)
            self.assertEqual(self.app.canvas.get_at((block[0], block[1] - 30))[:3], BLUE)
            self.assertFalse(self.app.layout_errors)

    def test_shot_line_dashes_and_block_marker_render_on_a_blank_surface(self):
        from soccer_strategy.john.drawing import BLUE, CORAL, NAVY, draw_block_point, draw_shot_line
        surface = pygame.Surface((240, 120))
        surface.fill(NAVY)
        draw_shot_line(surface, (20, 60), (220, 60))
        self.assertEqual(surface.get_at((26, 60))[:3], CORAL)
        self.assertEqual(surface.get_at((39, 60))[:3], NAVY)
        self.assertEqual(surface.get_at((220, 60))[:3], CORAL)
        before = pygame.image.tobytes(surface, "RGB")
        draw_shot_line(surface, (20, 60), (20, 60))
        self.assertEqual(before, pygame.image.tobytes(surface, "RGB"))
        draw_block_point(surface, (110, 60))
        self.assertEqual(surface.get_at((110, 30))[:3], BLUE)

    def test_outcome_without_a_selected_action_keeps_the_scene_static(self):
        from soccer_strategy.john.presentation import positions
        self.app.activate("stage:1")
        self.app.session.phase = "outcome"
        self.app.session.selected = None
        scene = self.app.session.scene
        actors, ball = positions(scene, "outcome", .5, None)
        self.assertEqual(ball, scene.ball)
        for actor in scene.actors:
            self.assertEqual(actors[actor.key], actor.position)
        self.app.draw()
        self.assertFalse(self.app.layout_errors)

    def test_hover_preview_and_comparison_feedback(self):
        self.app.activate("stage:2")
        self.key(pygame.K_SPACE)
        self.app.hover = self.app.buttons()[0].rect.center
        self.app.draw()
        self.key(pygame.K_1)
        self.key(pygame.K_SPACE)
        self.key(pygame.K_r)
        self.key(pygame.K_SPACE)
        self.key(pygame.K_2)
        self.key(pygame.K_SPACE)
        self.app.draw()
        self.assertFalse(self.app.layout_errors)

    def test_hover_arrow_marks_the_exact_destination_above_the_players(self):
        from soccer_strategy.john.catalog import build_catalog
        from soccer_strategy.john.drawing import GOLD, pitch_point
        self.app.activate("stage:1")
        scene = next(s for s in build_catalog() if s.id == "01.1")
        self.app.session.scenes = (scene,)
        self.app.session.phase = "decide"
        self.app.hover = self.app.buttons()[0].rect.center
        self.app.draw()
        x, y = pitch_point(scene.choices[0].target)
        self.assertEqual(self.app.canvas.get_at((x, y - 8))[:3], GOLD)
        self.assertFalse(self.app.layout_errors)

    def test_directional_pass_preview_and_wrong_pass_comparison(self):
        from soccer_strategy.john.catalog import build_catalog
        from soccer_strategy.john.drawing import GOLD, GREEN, pitch_point
        scene = next(s for s in build_catalog() if s.id == "35.2")
        self.app.activate("stage:5")
        self.app.session.scenes = (scene,)
        self.app.session.phase = "decide"
        for index in (1, 2):
            self.app.hover = self.app.buttons()[index].rect.center
            self.app.draw()
            x, y = pitch_point(scene.choices[index].ball_end)
            self.assertEqual(self.app.canvas.get_at((x, y - 8))[:3], GOLD)
        self.app.session.selected = 2
        self.app.session.phase = "feedback"
        self.app.draw()
        for index, color in ((2, GOLD), (1, GREEN)):
            x, y = pitch_point(scene.choices[index].ball_end)
            self.assertEqual(self.app.canvas.get_at((x, y - 8))[:3], color)
        self.assertFalse(self.app.layout_errors)

    def test_midfield_feedback_does_not_paint_over_the_opponent(self):
        from soccer_strategy.john.catalog import build_catalog
        from soccer_strategy.john.drawing import pitch_point
        scene = next(s for s in build_catalog() if s.id == "38.3")
        self.app.activate("stage:7")
        self.app.session.scenes = (scene,)
        self.app.session.phase = "decide"
        self.app.draw()
        opponent = next(a for a in scene.actors if a.key == "carrier")
        x, y = pitch_point(opponent.position)
        area = pygame.Rect(x - 22, y - 42, 44, 66)
        expected = pygame.image.tobytes(self.app.canvas.subsurface(area), "RGB")
        self.app.session.phase = "feedback"
        self.app.session.selected = 2
        self.app.draw()
        self.assertEqual(pygame.image.tobytes(self.app.canvas.subsurface(area), "RGB"), expected)
        self.assertFalse(self.app.layout_errors)

    def test_text_overflow_sensor_rejects_known_bad_content(self):
        from soccer_strategy.john.drawing import Painter
        p = Painter(self.app.canvas)
        p.text("A sentence that cannot fit", pygame.Rect(0, 0, 10, 10))
        self.assertTrue(p.errors)
        p.errors.clear()
        p.text("TooWide", pygame.Rect(0, 0, 1, 1000))
        self.assertTrue(p.errors)

    def test_empty_events_and_frames_without_a_session(self):
        self.key(pygame.K_r)
        self.key(pygame.K_n)
        self.key(pygame.K_SPACE)
        self.app.activate("ignored")
        self.app.handle_event(pygame.event.Event(pygame.USEREVENT))
        self.app.handle_event(pygame.event.Event(pygame.MOUSEBUTTONDOWN, button=3, pos=(0, 0)))
        self.app.draw()
        for method in (self.app._scene, self.app._instructions, self.app._feedback_text,
                       self.app._feedback_overlay, self.app._summary, self.app._session_action):
            with self.assertRaises(AssertionError):
                method("ignored") if method == self.app._session_action else method()
        self.assertIsNone(self.app.session)

    def test_transfer_label_and_invalid_phase_actions(self):
        self.app.activate("stage:1")
        self.key(pygame.K_1)
        self.app.activate("choice:0")
        self.app.activate("ignored")
        self.assertEqual(self.app.session.phase, "observe")
        for method in (self.app._feedback_text, self.app._feedback_overlay):
            with self.assertRaises(AssertionError):
                method()
        self.app.session.index = 6
        self.app.session.tick(3)
        self.app.draw()
        self.assertFalse(self.app.layout_errors)

    def test_all_successful_summary_and_corrupt_feedback_fail_fast(self):
        from dataclasses import replace
        self.app.activate("stage:1")
        session = self.app.session
        for _ in range(8):
            session.tick(3)
            best = next(i for i, c in enumerate(session.scene.choices) if c.rating == 2)
            session.choose(best)
            session.tick(3)
            session.advance()
        self.app.draw()
        self.assertFalse(self.app.layout_errors)
        scene = session.scene
        session.scenes = (replace(scene, choices=tuple(replace(c, rating=0) for c in scene.choices)),)
        session.index = 0
        session.selected = 0
        with self.assertRaises(StopIteration):
            self.app._feedback_overlay()

    def click(self, point):
        self.app.handle_event(pygame.event.Event(pygame.MOUSEBUTTONDOWN, button=1, pos=point))

    def key(self, key):
        self.app.handle_event(pygame.event.Event(pygame.KEYDOWN, key=key))


if __name__ == "__main__":
    unittest.main()
