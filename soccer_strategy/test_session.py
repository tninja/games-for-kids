"""Session behavior and invalid-transition acceptance criteria."""

import unittest

from soccer_strategy.session import Session


class SessionTests(unittest.TestCase):
    def test_basics_start_with_the_one_on_one_topics(self):
        for seed in range(10):
            session = Session(1, seed)
            self.assertEqual([s.topic for s in session.scenes[:5]], [1, 2, 3, 5, 6])
            self.assertEqual(session.scenes[5].topic, 28)

    def test_session_progress_has_six_practice_and_two_transfer_scenes(self):
        session = Session(stage=1, seed=4)
        self.assertEqual(len(session.scenes), 8)
        self.assertEqual(sum(s.transfer for s in session.scenes), 2)
        self.assertEqual(len({s.id for s in session.scenes}), 8)

    def test_training_flow_and_unlimited_decision_time(self):
        session = Session()
        self.assertFalse(session.choose(0))
        session.tick(3)
        self.assertEqual(session.phase, "decide")
        session.tick(10000)
        self.assertEqual(session.phase, "decide")
        self.assertTrue(session.choose(0))
        self.assertEqual(session.phase, "outcome")
        self.assertFalse(session.choose(1))
        self.assertFalse(session.advance())
        session.tick(3)
        self.assertEqual(session.phase, "feedback")
        self.assertTrue(session.advance())
        self.assertEqual(session.index, 1)
        self.assertEqual(session.phase, "observe")

    def test_retries_do_not_change_first_attempt_results(self):
        session = Session()
        session.tick(3)
        bad = next(i for i, c in enumerate(session.scene.choices) if c.rating == 0)
        session.choose(bad)
        session.tick(3)
        before = dict(session.results)
        self.assertTrue(session.retry())
        self.assertEqual(session.phase, "observe")
        session.tick(3)
        good = next(i for i, c in enumerate(session.scene.choices) if c.rating == 2)
        session.choose(good)
        session.tick(3)
        self.assertEqual(session.results, before)
        self.assertEqual(session.feedback.rating, 2)

    def test_invalid_choices_and_stages_do_not_change_state(self):
        for stage in (0, 7):
            with self.assertRaises(ValueError):
                Session(stage)
        session = Session()
        self.assertFalse(session.retry())
        session.tick(3)
        for index in (-1, 3, 99):
            self.assertFalse(session.choose(index))
        self.assertEqual(session.phase, "decide")
        self.assertFalse(session.results)
        with self.assertRaises(ValueError):
            session.tick(-1)

    def test_summary_and_completion(self):
        session = Session()
        for index in range(8):
            session.tick(3)
            best = next(i for i, c in enumerate(session.scene.choices) if c.rating == 2)
            session.choose(best)
            session.tick(3)
            self.assertTrue(session.advance())
            self.assertEqual(len(session.results), index + 1)
        self.assertEqual(session.phase, "summary")
        self.assertEqual(session.summary(), (6, 6, 2, 2))
        self.assertFalse(session.advance())
        self.assertFalse(session.retry())
        self.assertIsNone(session.feedback)

    def test_stages_and_seed_are_deterministic(self):
        seen = set()
        for stage in range(1, 7):
            for seed in range(20):
                a, b = Session(stage, seed), Session(stage, seed)
                self.assertEqual(a.scenes, b.scenes)
                self.assertTrue(all(s.stage == stage for s in a.scenes))
                self.assertEqual(len(a.scenes), 8)
                self.assertEqual(len({s.id for s in a.scenes}), 8)
                self.assertEqual(sum(s.transfer for s in a.scenes), 2)
                seen.update(s.topic for s in a.scenes)
                practice = {s.id for s in a.scenes if not s.transfer}
                self.assertTrue(all(s.id.split(":")[0] not in practice
                                    for s in a.scenes if s.transfer))
        self.assertEqual(seen, set(range(1, 35)))

    def test_partial_summary_and_small_animation_steps(self):
        session = Session()
        self.assertEqual(session.summary(), (0, 0, 0, 0))
        session.tick(.1)
        self.assertEqual(session.phase, "observe")
        self.assertGreater(session.fraction, 0)
        session.tick(3)
        session.choose(0)
        self.assertEqual(session.summary()[1:], (1, 0, 0))
        for seconds in (float("nan"), float("inf")):
            with self.assertRaises(ValueError):
                session.tick(seconds)


if __name__ == "__main__":
    unittest.main()
