"""Behavioral tests for original traversal, branches and practice attempts."""

import unittest
from math import nan

from soccer_strategy.soccer_smarter.session import Session


class SessionTests(unittest.TestCase):
    def test_new_round_observes_before_allowing_a_decision(self):
        session = Session("M01", 7)
        self.assertEqual(session.phase, "observe")

    def finish_choice(self, session, index):
        session.skip()
        self.assertTrue(session.choose(index))
        session.skip()
        self.assertEqual(session.phase, "feedback")

    def test_successor_is_exact_and_first_attempt_survives_retry(self):
        session = Session()
        self.finish_choice(session, 0)
        saved = dict(session.results)
        self.assertTrue(session.compare_coach())
        session.skip()
        self.assertEqual(session.results, saved)
        session.retry()
        self.finish_choice(session, 1)
        self.assertEqual(session.results, saved)
        session.retry()
        self.finish_choice(session, 0)
        end = session.feedback.motion.frame(session.node.state, 1)
        session.advance()
        self.assertEqual((session.node.state.positions(), session.node.state.ball), end)
        self.finish_choice(session, 0)
        self.assertEqual(session.results, saved)
        self.assertEqual(session.summary()[1], 1)
        self.assertGreater(len(session.practice), 1)

    def test_terminal_does_not_jump_to_successor_and_new_contrast_is_initial(self):
        session = Session()
        self.finish_choice(session, 2)
        session.advance()
        self.assertEqual(session.episode.id, "M01.B")
        self.assertEqual(session.node.id, "root")
        self.finish_choice(session, 1)
        self.assertEqual(len(session.results), 2)
        self.assertEqual(Session().results, {})

    def test_predictions_are_unscored_and_reveal_is_not_shown_early(self):
        session = Session("M04")
        self.assertEqual(session.phase, "predict")
        self.assertFalse(session.predict(2))
        self.assertTrue(session.predict(0))
        self.assertEqual(session.results, {})
        self.assertFalse(session.predict(1))
        self.finish_choice(session, 0)
        session.advance()
        self.assertEqual(session.node.id, "adapt")
        self.assertTrue(session.episode.reveal)

    def test_pause_step_skip_and_invalid_input(self):
        with self.assertRaises(ValueError):
            Session("missing")
        session = Session()
        self.assertFalse(session.choose(0))
        self.assertFalse(session.advance())
        self.assertFalse(session.retry())
        self.assertFalse(session.compare_coach())
        for seconds in (-1, nan, float('inf')):
            with self.assertRaises(ValueError):
                session.tick(seconds)
        session.toggle_pause()
        session.tick(10)
        self.assertEqual(session.elapsed, 0)
        session.step()
        self.assertGreater(session.elapsed, 0)
        self.assertTrue(session.paused)
        session.skip()
        self.assertFalse(session.paused)
        self.assertEqual(session.phase, "decide")
        self.assertFalse(session.choose(-1))
        self.assertFalse(session.choose(3))
        self.assertFalse(session.toggle_pause())
        session.tick(10)
        self.assertEqual(session.phase, "decide")

    def test_every_path_finishes_and_replay_is_practice_only(self):
        for mission in tuple(f"M0{i}" for i in range(1, 8)):
            for first in range(3):
                for second in range(3):
                    session = Session(mission)
                    while session.phase != "summary":
                        if session.phase == "predict":
                            session.predict(1)
                        self.finish_choice(session, first if session.node.id == "root" else second)
                        session.advance()
                    saved = dict(session.results)
                    self.assertTrue(saved)
                    session.restart()
                    if session.phase == "predict":
                        session.predict(0)
                    self.finish_choice(session, 0)
                    self.assertEqual(session.results, saved)

    def test_unseen_nodes_have_no_score_and_inactive_animation_controls_do_nothing(self):
        session = Session()
        self.assertIsNone(session.feedback)
        session.tick(.1)
        self.assertGreater(session.fraction, 0)
        self.finish_choice(session, 2)
        self.assertEqual(session.summary(), (0, 1, 0))
        self.assertEqual(session.results[(0, "M01.A", "root")], 0)
        session.step()
        session.skip()
        self.assertEqual(session.phase, "feedback")
        session.advance()
        self.finish_choice(session, 1)
        session.advance()
        self.finish_choice(session, 0)
        session.advance()
        self.assertEqual(session.summary(), (2, 3, 0))
        self.assertEqual(session.phase, "summary")
        session.step()
        session.skip()
        self.assertEqual(session.phase, "summary")

    def test_corrupted_feedback_phase_fails_closed(self):
        session = Session()
        session.phase = "feedback"
        with self.assertRaises(AssertionError):
            session.advance()


if __name__ == "__main__":
    unittest.main()
