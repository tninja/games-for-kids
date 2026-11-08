"""Session state machine, held-out transfer scheduling, and first-try scoring tests."""

import unittest

from soccer_strategy.soccer_smart.curriculum import MIXED_STAGE, PLAYABLE_STAGES, SECTION_IDS
from soccer_strategy.soccer_smart.session import ANIMATION_SECONDS, Session, make_playlist


class SessionTests(unittest.TestCase):
    def test_section_rounds_schedule_six_practice_and_two_held_out_transfers(self) -> None:
        seen_base_ids: set[str] = set()
        for stage in SECTION_IDS:
            for seed in range(15):
                playlist = make_playlist(stage, seed)
                self.assertEqual(len(playlist), 8)
                practice = playlist[:6]
                transfer = playlist[6:]
                self.assertTrue(all(not s.transfer for s in practice))
                self.assertTrue(all(s.transfer for s in transfer))
                self.assertTrue(all(s.stage == stage for s in playlist))
                base_ids = [s.base_id for s in playlist]
                self.assertEqual(len(set(base_ids)), 8)
                self.assertEqual(len({s.topic for s in transfer}), 2)
                for topic in {s.topic for s in practice}:
                    self.assertEqual(sum(s.topic == topic for s in practice), 2)
                seen_base_ids.update(base_ids)
        self.assertEqual(len(seen_base_ids), 36)

    def test_mixed_rounds_cover_all_four_sections_with_held_out_transfers(self) -> None:
        for seed in range(15):
            playlist = make_playlist(MIXED_STAGE, seed)
            self.assertEqual(len(playlist), 8)
            practice = playlist[:6]
            transfer = playlist[6:]
            self.assertEqual({s.stage for s in practice}, set(SECTION_IDS))
            self.assertEqual(len({s.topic for s in practice}), 6)
            self.assertEqual(len({s.base_id for s in playlist}), 8)
            practice_topics = {s.topic for s in practice}
            self.assertTrue(all(s.topic in practice_topics for s in transfer))

    def test_deterministic_seed_and_invalid_stage_rejection(self) -> None:
        for stage in PLAYABLE_STAGES:
            self.assertEqual(make_playlist(stage, 7), make_playlist(stage, 7))
        for bad_stage in (0, 6, 99):
            with self.assertRaises(ValueError):
                Session(bad_stage)

    def test_flow_coach_comparison_and_retry_preserve_first_attempt(self) -> None:
        session = Session(stage=1, seed=2)
        self.assertIsNone(session.feedback)
        self.assertFalse(session.choose(0))
        self.assertFalse(session.compare_coach())
        self.assertFalse(session.retry())
        self.assertFalse(session.advance())
        session.tick(0.6)
        self.assertAlmostEqual(session.fraction, 0.25)
        session.tick(ANIMATION_SECONDS)
        self.assertEqual(session.phase, "decide")
        session.tick(500.0)
        self.assertEqual(session.phase, "decide")
        for invalid in (-1, 3, 10):
            self.assertFalse(session.choose(invalid))
        risky = next(i for i, c in enumerate(session.scene.choices) if c.rating == 0)
        self.assertTrue(session.choose(risky))
        self.assertEqual(session.phase, "outcome")
        self.assertFalse(session.choose(0))
        session.tick(ANIMATION_SECONDS)
        self.assertEqual(session.phase, "feedback")
        assert session.feedback is not None
        self.assertEqual(session.feedback.rating, 0)
        saved = dict(session.results)
        self.assertTrue(session.compare_coach())
        self.assertEqual(session.phase, "coach")
        session.tick(ANIMATION_SECONDS)
        self.assertEqual(session.phase, "feedback")
        self.assertEqual(session.results, saved)
        self.assertTrue(session.retry())
        self.assertEqual(session.phase, "observe")
        session.tick(ANIMATION_SECONDS)
        best = next(i for i, c in enumerate(session.scene.choices) if c.rating == 2)
        self.assertTrue(session.choose(best))
        session.tick(ANIMATION_SECONDS)
        self.assertEqual(session.results, saved)
        self.assertEqual(session.summary(), (0, 1, 0, 0))

    def test_complete_round_reaches_summary_and_rejects_bad_ticks(self) -> None:
        session = Session(stage=2, seed=3)
        for _ in range(8):
            session.tick(ANIMATION_SECONDS)
            best = next(i for i, c in enumerate(session.scene.choices) if c.rating == 2)
            session.choose(best)
            session.tick(ANIMATION_SECONDS)
            self.assertTrue(session.advance())
        self.assertEqual(session.phase, "summary")
        self.assertEqual(session.summary(), (6, 6, 2, 2))
        self.assertFalse(session.advance())
        self.assertFalse(session.retry())
        self.assertFalse(session.compare_coach())
        for bad_time in (-0.1, float("nan"), float("inf")):
            with self.assertRaises(ValueError):
                session.tick(bad_time)


if __name__ == "__main__":
    unittest.main()
