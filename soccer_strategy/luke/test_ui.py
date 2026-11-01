"""Real Pygame screens and controls, with no mocked rendering."""

import os
import unittest
from dataclasses import replace

os.environ["SDL_VIDEODRIVER"] = "dummy"
os.environ["SDL_AUDIODRIVER"] = "dummy"
os.environ["PYGAME_HIDE_SUPPORT_PROMPT"] = "1"

import pygame

from soccer_strategy.luke.app import App
from soccer_strategy.luke.content import CASES


class UITests(unittest.TestCase):
    def setUp(self):
        self.app = App(seed=0)

    def tearDown(self):
        pygame.quit()

    def key(self, key):
        self.app.handle_event(pygame.event.Event(pygame.KEYDOWN, key=key))

    def click(self, point):
        self.app.handle_event(pygame.event.Event(pygame.MOUSEBUTTONDOWN, button=1, pos=point))

    def finish_demo(self):
        while self.app.session.phase in ("attempt", "show"):
            self.key(pygame.K_SPACE)

    def test_warmup_ball_responds_to_click_and_b_without_scoring(self):
        self.assertIsNotNone(getattr(self.app, "fun", None))
        self.app.draw()
        before = pygame.image.tobytes(self.app.canvas, "RGB")
        self.key(pygame.K_b)
        self.assertEqual(self.app.fun.pops, 1)
        self.assertEqual(self.app.audio.played.get("boing"), 1)
        self.key(pygame.K_b)
        self.assertEqual(self.app.fun.pops, 1)
        self.app.tick(.3)
        self.app.draw()
        self.assertNotEqual(before, pygame.image.tobytes(self.app.canvas, "RGB"))
        self.assertFalse(self.app.layout_errors)
        self.click((500, round(650 - self.app.fun.ball_height)))
        self.assertEqual(self.app.fun.pops, 2)
        self.assertIsNone(self.app.session)
        self.app.activate("play:hands")
        self.app.tick(20)
        session = self.app.session
        saved = (session.phase, session.pictures, dict(session.results))
        pops = self.app.fun.pops
        self.key(pygame.K_b)
        self.click((500, 650))
        self.assertEqual((session.phase, session.pictures, session.results), saved)
        self.assertEqual(self.app.fun.pops, pops)

    def test_fun_clock_bounds_motion_and_rejects_invalid_time(self):
        self.assertIsNotNone(getattr(self.app, "fun", None))
        fun = self.app.fun
        for bad in (-1., float("nan"), float("inf")):
            before = vars(fun).copy()
            with self.assertRaises(ValueError):
                self.app.tick(bad)
            self.assertEqual(vars(fun), before)
        for _ in range(30):
            previous_height = fun.ball_height
            self.assertTrue(fun.pop())
            self.assertAlmostEqual(fun.ball_height, previous_height)
            self.assertFalse(fun.pop())
            for step in (.03, .05, .1, .2):
                self.app.tick(step)
                self.assertTrue(0 <= fun.ball_height <= 100)
        self.app.tick(1000)
        self.assertAlmostEqual(fun.ball_height, 0)
        self.assertTrue(0 <= fun.clock < 3)

    def test_fun_controls_work_after_resizing_muting_or_losing_audio(self):
        self.app = App(seed=0, muted=True)
        self.app.window = pygame.display.set_mode((640, 440), pygame.RESIZABLE)
        self.click((250, 325))
        self.assertEqual(self.app.fun.pops, 1)
        self.assertEqual(self.app.audio.played, {})
        self.key(pygame.K_m)
        pygame.mixer.quit()
        self.app.tick(.3)
        self.key(pygame.K_b)
        self.assertEqual(self.app.fun.pops, 2)
        self.assertFalse(self.app.audio.available)
        self.app.activate("play:line")
        self.key(pygame.K_h)
        self.assertEqual(self.app.fun.high_fives, 0)
        self.key(pygame.K_SPACE)
        self.key(pygame.K_1)
        self.finish_demo()
        self.key(pygame.K_h)
        self.assertEqual(self.app.fun.high_fives, 1)
        self.app.draw()
        self.assertFalse(self.app.layout_errors)

    def test_feedback_high_five_is_optional_and_never_changes_stars(self):
        self.assertIsNotNone(getattr(self.app, "fun", None))
        self.key(pygame.K_h)
        self.assertEqual(self.app.fun.high_fives, 0)
        self.app.activate("play:hands")
        self.app.tick(20)
        session = self.app.session
        wrong = next(i for i, key in enumerate(session.picture.choices) if key != session.picture.answer)
        self.app.activate(f"choice:{wrong}")
        self.finish_demo()
        saved = dict(session.results)
        button = next(b for b in self.app.buttons() if b.action == "highfive")
        self.assertIn("badge", button.caption)
        self.assertGreaterEqual(button.rect.height, 70)
        self.app.draw()
        before = pygame.image.tobytes(self.app.canvas.subsurface(button.rect), "RGB")
        pygame.mixer.stop()
        self.click(button.rect.center)
        self.app.draw()
        self.assertNotEqual(before, pygame.image.tobytes(self.app.canvas.subsurface(button.rect), "RGB"))
        self.assertEqual(self.app.audio.played.get("highfive"), 1)
        self.assertEqual(self.app.fun.high_fives, 1)
        self.key(pygame.K_h)
        self.assertEqual(self.app.fun.high_fives, 1)
        counts = dict(self.app.audio.played)
        for _ in range(3):
            self.app.draw()
        self.assertEqual(self.app.audio.played, counts)
        self.app.tick(.3)
        self.key(pygame.K_m)
        self.key(pygame.K_h)
        self.assertEqual(self.app.fun.high_fives, 2)
        self.assertEqual(self.app.audio.played, counts)
        self.key(pygame.K_p)
        self.finish_demo()
        self.key(pygame.K_r)
        self.app.tick(20)
        self.assertEqual(session.results, saved)
        self.assertEqual(session.stars, 0)

    def test_playful_captions_keep_the_action_clear_and_do_not_hint_answers(self):
        from soccer_strategy.luke.model import ACTIONS
        self.app.activate("play:all")
        captions = {}
        for picture in CASES:
            session = self.app.session
            session.pictures = (picture,)
            session.phase = "choose"
            for button, key in zip(self.app.buttons(), picture.choices):
                self.assertEqual(button.label, ACTIONS[key])
                self.assertTrue(hasattr(button, "caption"))
                self.assertLessEqual(len(button.caption.split()), 5)
                if key in captions:
                    self.assertEqual(button.caption, captions[key])
                captions[key] = button.caption
            original = [b.caption for b in self.app.buttons()]
            session.pictures = (replace(picture, answer=next(k for k in picture.choices if k != picture.answer)),)
            self.assertEqual([b.caption for b in self.app.buttons()], original)
        self.assertGreaterEqual(sum(bool(text) for text in captions.values()), 8)

    def test_party_and_badges_render_without_covering_the_lesson(self):
        self.assertIsNotNone(getattr(self.app, "fun", None))
        self.app.activate("play:all")
        session = self.app.session
        for _ in range(6):
            self.app.tick(20)
            self.app.activate(f"choice:{session.picture.choices.index(session.picture.answer)}")
            self.finish_demo()
            self.app.draw()
            before = pygame.image.tobytes(self.app.canvas, "RGB")
            field = pygame.Rect(330, 180, 418, 585)
            lesson = pygame.image.tobytes(self.app.canvas.subsurface(field), "RGB")
            self.app.tick(.3)
            self.app.draw()
            self.assertNotEqual(before, pygame.image.tobytes(self.app.canvas, "RGB"))
            self.assertEqual(lesson, pygame.image.tobytes(self.app.canvas.subsurface(field), "RGB"))
            self.assertFalse(self.app.layout_errors)
            self.app.activate("next")
        self.assertEqual(session.phase, "summary")
        self.app.draw()
        self.assertFalse(self.app.layout_errors)
        self.key(pygame.K_b)
        self.assertGreater(self.app.fun.pops, 0)
        self.assertEqual(session.stars, 6)
        self.app.tick(3)
        self.app.draw()
        self.assertFalse(self.app.layout_errors)

    def test_wrong_choices_render_their_consequences_then_the_coach(self):
        self.assertIsNotNone(getattr(self.app, "audio", None))
        for skill in ("line", "hands", "roll"):
            self.app.activate(f"play:{skill}")
            self.key(pygame.K_SPACE)
            session = self.app.session
            wrong = next(i for i, key in enumerate(session.picture.choices) if key != session.picture.answer)
            self.click(self.app.buttons()[wrong].rect.center)
            self.assertEqual(session.phase, "attempt")
            session.elapsed = 2.3
            self.app.draw()
            before = pygame.image.tobytes(self.app.canvas, "RGB")
            self.assertFalse(self.app.layout_errors)
            self.app.tick(.2)
            self.assertEqual(session.phase, "show")
            session.elapsed = 2.7
            self.app.draw()
            self.assertNotEqual(before, pygame.image.tobytes(self.app.canvas, "RGB"))
            self.assertFalse(self.app.layout_errors)
            self.app.tick(.2)
            self.assertEqual(session.phase, "feedback")
            self.assertEqual(session.stars, 0)

    def test_sound_toggle_and_contact_events_are_not_replayed_by_draw(self):
        self.assertIsNotNone(getattr(self.app, "audio", None))
        self.app.activate("play:hands")
        self.app.tick(20)
        session = self.app.session
        wrong = next(i for i, key in enumerate(session.picture.choices) if key != session.picture.answer)
        pygame.mixer.stop()
        self.app.activate(f"choice:{wrong}")
        self.assertEqual(self.app.audio.played.get("try"), 1)
        for _ in range(4):
            self.app.draw()
        self.assertEqual(self.app.audio.played.get("try"), 1)
        self.app.tick(2.4)
        pygame.mixer.stop()
        self.app.tick(2.)
        self.assertEqual(self.app.audio.played.get("catch"), 1)
        self.app.tick(.1)
        self.app.draw()
        self.assertEqual(self.app.audio.played.get("catch"), 1)
        self.key(pygame.K_m)
        self.assertFalse(self.app.audio.enabled)
        counts = dict(self.app.audio.played)
        self.app.tick(20)
        self.app.activate("retry")
        self.assertEqual(self.app.audio.played, counts)
        self.click((960, 55))
        self.assertTrue(self.app.audio.enabled)
        self.app.draw()
        self.assertFalse(self.app.layout_errors)

    def test_roll_success_and_round_completion_emit_their_own_cues(self):
        self.app.activate("play:roll")
        session = self.app.session
        session.pictures = tuple(p for p in CASES if p.skill == "roll" and p.ball_target != p.source)
        self.app.tick(20)
        self.app.activate(f"choice:{session.picture.choices.index(session.picture.answer)}")
        pygame.mixer.stop()
        self.app.tick(1.1)
        self.assertEqual(self.app.audio.played.get("roll"), 1)
        self.app.tick(.1)
        self.assertEqual(self.app.audio.played.get("roll"), 1)
        self.app.tick(20)
        for _ in range(5):
            pygame.mixer.stop()
            self.app.activate("next")
            self.app.tick(20)
            self.app.activate(f"choice:{session.picture.choices.index(session.picture.answer)}")
            self.app.tick(20)
        pygame.mixer.stop()
        self.app.activate("next")
        self.assertEqual(session.phase, "summary")
        self.assertEqual(self.app.audio.played.get("success"), 6)
        self.assertEqual(self.app.audio.played.get("complete"), 1)

    def test_initial_mute_and_missing_audio_leave_the_game_playable(self):
        self.app = App(muted=True)
        self.assertFalse(self.app.audio.enabled)
        self.assertEqual(self.app.audio.played, {})
        self.app.draw()
        pygame.mixer.quit()
        os.environ["SDL_AUDIODRIVER"] = "no-such-audio-driver"
        try:
            self.app = App()
            self.assertFalse(self.app.audio.available)
            self.app.activate("play:line")
            self.key(pygame.K_SPACE)
            self.app.draw()
            self.assertFalse(self.app.layout_errors)
            self.key(pygame.K_m)
            self.assertFalse(self.app.audio.enabled)
        finally:
            os.environ["SDL_AUDIODRIVER"] = "dummy"

    def test_hold_and_guard_demonstrations_do_not_play_false_contact_sounds(self):
        for identifier in ("roll.7", "loose.4"):
            self.app.activate("play:all")
            session = self.app.session
            session.pictures = (next(p for p in CASES if p.id == identifier),)
            self.app.tick(20)
            self.app.activate(f"choice:{session.picture.choices.index(session.picture.answer)}")
            before = dict(self.app.audio.played)
            self.app.tick(2.)
            self.app.draw()
            self.assertEqual(self.app.audio.played, before)
            self.assertFalse(self.app.layout_errors)

    def test_menu_has_five_skills_and_a_mixed_round(self):
        self.assertEqual(len(self.app.buttons()), 6)
        self.app.draw()
        self.assertFalse(self.app.layout_errors)
        for index in range(6):
            self.key(pygame.K_ESCAPE)
            self.click(self.app.buttons()[index].rect.center)
            self.assertEqual(len(self.app.session.pictures), 6)

    def test_other_people_have_visible_eyes_and_a_smile(self):
        from soccer_strategy.luke.drawing import BLUE, INK, ORANGE, draw_person, pitch_point
        point = (50, 50)
        x, y = pitch_point(point)
        for color in (BLUE, ORANGE):
            for ready in (True, False):
                self.app.canvas.fill((255, 255, 255))
                draw_person(self.app.painter, point, "PLAYER", color, ready)
                for eye_x in (x - 4, x + 4):
                    self.assertEqual(self.app.canvas.get_at((eye_x, y - 42))[:3], INK)
                mouth = pygame.Rect(x - 6, y - 38, 13, 8)
                self.assertGreater(sum(self.app.canvas.get_at((px, py))[:3] == INK
                                       for px in range(mouth.left, mouth.right)
                                       for py in range(mouth.top, mouth.bottom)), 5)

    def test_every_picture_and_pose_renders_with_all_visible_choices(self):
        self.app.activate("play:all")
        for picture in CASES:
            self.app.session.pictures = (picture,)
            self.app.session.index = 0
            for phase in ("watch", "choose", "show", "feedback"):
                self.app.session.phase = phase
                for t in (0., .4, .55, .8, 1.):
                    self.app.session.elapsed = t * (1.8 if phase == "watch" else 2.8)
                    self.app.draw()
                    self.assertFalse(self.app.layout_errors, (picture.id, phase, t, self.app.layout_errors))
            self.app.session.phase = "choose"
            count = 3 if picture.skill == "match" else 2
            self.assertEqual(len(self.app.buttons()), count)
            self.assertTrue(all(button.rect.height >= (110 if count == 3 else 130)
                                for button in self.app.buttons()))
            for index in range(count):
                self.app.session.phase = "choose"
                self.click(self.app.buttons()[index].rect.center)
                self.finish_demo()
                self.app.draw()
                self.assertFalse(self.app.layout_errors)

    def test_mouse_keyboard_retry_replay_and_results(self):
        self.key(pygame.K_6)
        self.key(pygame.K_SPACE)
        self.key(pygame.K_4)
        self.assertEqual(self.app.session.phase, "choose")
        self.click(self.app.buttons()[0].rect.center)
        self.finish_demo()
        saved = dict(self.app.session.results)
        self.key(pygame.K_p)
        self.assertEqual(self.app.session.phase, "show")
        self.key(pygame.K_SPACE)
        self.key(pygame.K_r)
        self.key(pygame.K_SPACE)
        self.key(pygame.K_2)
        self.finish_demo()
        self.assertEqual(self.app.session.results, saved)
        self.key(pygame.K_n)
        self.assertEqual(self.app.session.index, 1)
        self.click((1180, 55))
        self.assertIsNone(self.app.session)

    def test_match_keys_three_and_six_and_unseeded_launches(self):
        self.key(pygame.K_5)
        self.assertEqual(self.app.session.picture.skill, "match")
        self.key(pygame.K_SPACE)
        self.key(pygame.K_3)
        self.assertIn(self.app.session.phase, ("attempt", "show"))
        self.finish_demo()
        self.app.draw()
        self.assertFalse(self.app.layout_errors)
        seeds = set()
        for _ in range(4):
            seeds.add(App().seed)
        self.assertGreater(len(seeds), 1)
        self.assertEqual(App(seed=123).seed, 123)

    def test_match_decision_ball_does_not_cover_lukes_face(self):
        from math import dist
        from soccer_strategy.luke.animation import frame
        from soccer_strategy.luke.drawing import pitch_point
        for picture in (p for p in CASES if p.skill == "match"):
            view = frame(picture, "choose", 0)
            keeper = pitch_point(view.keeper)
            ball = pitch_point(view.ball)
            self.assertGreaterEqual(dist((keeper[0], keeper[1] - 71),
                                         (ball[0], ball[1] - view.height)), 30, picture.id)

    def test_an_early_jump_keeps_its_shadow_on_the_ground(self):
        from soccer_strategy.luke.drawing import WHITE, draw_keeper
        self.app.canvas.fill(WHITE)
        draw_keeper(self.app.canvas, (200, 200), "jump", step=.5)
        self.assertEqual(self.app.canvas.get_at((200, 208))[:3], (57, 137, 81))

    def test_all_match_actions_show_motion_and_contact_sounds_at_the_right_time(self):
        for picture in (p for p in CASES if p.skill == "match"):
            for index in range(3):
                self.app.activate("play:match")
                s = self.app.session
                s.pictures = (picture,)
                self.app.tick(20)
                self.app.activate(f"choice:{index}")
                if s.phase == "attempt":
                    self.app.tick(.7)
                    self.app.draw()
                    self.assertFalse(self.app.layout_errors)
                    self.app.tick(20)
                pygame.mixer.stop()
                contact_count = sum(self.app.audio.played.get(k, 0) for k in ("catch", "roll"))
                self.app.tick(.1)
                self.app.draw()
                self.app.tick(2.3)
                self.app.draw()
                expected = 0 if picture.play == "close" else 1
                self.assertEqual(sum(self.app.audio.played.get(k, 0) for k in ("catch", "roll")),
                                 contact_count + expected, (picture.id, index))
                self.assertFalse(self.app.layout_errors)
                self.app.tick(.1)
                self.assertEqual(sum(self.app.audio.played.get(k, 0) for k in ("catch", "roll")),
                                 contact_count + expected)

    def test_summary_shows_real_skill_progress_and_practice_tip(self):
        self.app.activate("play:all")
        session = self.app.session
        for _ in range(6):
            session.tick(20)
            key = session.picture.answer if session.picture.skill != "hands" else next(
                k for k in session.picture.choices if k != session.picture.answer)
            session.choose(session.picture.choices.index(key))
            self.finish_demo()
            session.advance()
        self.app.draw()
        self.assertEqual(session.practice_skill.id, "hands")
        self.assertFalse(self.app.layout_errors)
        self.click(self.app.buttons()[-1].rect.center)
        self.assertIsNone(self.app.session)
        self.app.activate("play:line")
        session = self.app.session
        for _ in range(6):
            session.tick(20)
            session.choose(session.picture.choices.index(session.picture.answer))
            session.tick(20)
            session.advance()
        self.app.draw()
        self.assertFalse(self.app.layout_errors)
        self.click(self.app.buttons()[0].rect.center)
        self.assertEqual(self.app.session.phase, "watch")

    def test_resizing_hover_ignored_actions_and_quit(self):
        self.app.window = pygame.display.set_mode((640, 440), pygame.RESIZABLE)
        point = self.app.buttons()[0].rect.center
        self.click((point[0] // 2, point[1] // 2))
        self.assertIsNotNone(self.app.session)
        self.app.handle_event(pygame.event.Event(pygame.MOUSEMOTION, pos=(100, 150)))
        self.assertEqual(self.app.hover, (200, 300))
        self.app.draw()
        self.app.activate("ignored")
        self.click((1, 1))
        self.app.handle_event(pygame.event.Event(pygame.MOUSEBUTTONDOWN, button=3, pos=(1, 1)))
        self.app.handle_event(pygame.event.Event(pygame.USEREVENT))
        self.key(pygame.K_ESCAPE)
        for key in (pygame.K_r, pygame.K_n, pygame.K_p, pygame.K_SPACE):
            self.key(key)
        self.app.draw()
        pygame.event.post(pygame.event.Event(pygame.QUIT))
        self.app.run()
        self.assertFalse(pygame.display.get_init())

    def test_hover_is_visible_and_unknown_keys_do_not_choose(self):
        self.app.draw()
        before = pygame.image.tobytes(self.app.canvas, "RGB")
        point = self.app.buttons()[0].rect.center
        self.app.handle_event(pygame.event.Event(pygame.MOUSEMOTION, pos=point))
        self.app.draw()
        self.assertNotEqual(before, pygame.image.tobytes(self.app.canvas, "RGB"))
        self.key(pygame.K_z)
        self.assertIsNone(self.app.session)
        self.key(pygame.K_1)
        self.key(pygame.K_2)
        self.assertEqual(self.app.session.phase, "watch")
        self.assertFalse(self.app.session.results)

    def test_optional_blocker_and_corrupt_skill_are_handled_explicitly(self):
        self.app.activate("play:roll")
        session = self.app.session
        session.pictures = (replace(session.picture, blocker=None),)
        self.app.draw()
        self.assertFalse(self.app.layout_errors)
        session.pictures = (replace(session.picture, skill="unknown"),)
        with self.assertRaises(StopIteration):
            self.app.draw()

    def test_text_sensor_rejects_height_and_unbreakable_width(self):
        painter = self.app.painter
        painter.text("Too many words to fit", pygame.Rect(0, 0, 10, 10))
        self.assertTrue(painter.errors)
        painter.errors.clear()
        painter.text("Unbreakable", pygame.Rect(0, 0, 1, 100))
        self.assertTrue(painter.errors)

    def test_choice_screen_does_not_reveal_the_coaching_halo(self):
        from soccer_strategy.luke.drawing import GOLD, pitch_point
        self.app.activate("play:line")
        session = self.app.session
        session.tick(20)
        self.app.draw()
        before = pygame.image.tobytes(self.app.canvas, "RGB")
        point = pitch_point(session.picture.spot)
        self.assertNotEqual(self.app.canvas.get_at((point[0] + 35, point[1]))[:3], GOLD)
        session.selected = 0
        self.app.draw()
        self.assertEqual(before, pygame.image.tobytes(self.app.canvas, "RGB"))
        session.phase = "feedback"
        self.app.draw()
        self.assertEqual(self.app.canvas.get_at((point[0] + 35, point[1]))[:3], GOLD)
