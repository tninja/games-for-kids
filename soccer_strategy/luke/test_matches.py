"""Match situations require reading facts, not an answer in the prompt."""

from dataclasses import replace
from math import dist
import unittest

from soccer_strategy.luke.content import CASES
from soccer_strategy.luke.animation import attempt_frame, frame
from soccer_strategy.luke.session import Session


class MatchTests(unittest.TestCase):
    def matches(self):
        return [p for p in CASES if p.skill == "match"]

    def test_eighteen_match_situations_have_three_choices_and_different_decisions(self):
        pictures = self.matches()
        self.assertEqual(len(pictures), 18)
        self.assertEqual(len({p.title for p in pictures}), 18)
        self.assertGreaterEqual(len({p.answer for p in pictures}), 8)
        for p in pictures:
            p.validate()
            self.assertEqual(len(p.choices), 3)
            self.assertTrue(p.play)

    def test_match_rounds_include_defending_and_playing_the_ball(self):
        self.assertEqual(len(self.matches()), 18)
        for seed in range(24):
            session = Session("match", seed)
            self.assertEqual(len({p.id for p in session.pictures}), 6)
            kinds = {p.play for p in session.pictures}
            self.assertTrue(kinds & {"shot", "close", "recover"})
            self.assertTrue(kinds & {"collect", "feet", "distribute", "support"})
            session.tick(20)
            self.assertTrue(session.choose(2))
            self.assertFalse(session.choose(3))

    def test_correct_and_wrong_match_actions_render_separately(self):
        self.assertEqual(len(self.matches()), 18)
        for p in self.matches():
            for wrong in (key for key in p.choices if key != p.answer):
                self.assertEqual(attempt_frame(p, wrong, 0).ball, frame(p, "choose", 0).ball)
                self.assertNotEqual(attempt_frame(p, wrong, 1), frame(p, "show", 1), (p.id, wrong))
            changed = replace(p, answer=next(k for k in p.choices if k != p.answer))
            for phase in ("watch", "choose", "show", "feedback"):
                for t in (0., .3, .6, 1.):
                    self.assertEqual(frame(p, phase, t), frame(changed, phase, t))

    def test_outside_clearance_uses_feet_and_goes_wide(self):
        self.assertEqual(len(self.matches()), 18)
        p = next(p for p in self.matches() if p.play == "feet")
        self.assertLess(p.source[1], 55)
        self.assertEqual(p.answer, "feet")
        self.assertLess(dist(p.keeper, p.source), dist(p.blocker, p.source))
        for t in (0., .3, .55, .8, 1.):
            view = frame(p, "show", t)
            self.assertEqual(view.height, 0)
            self.assertNotEqual(view.pose, "hug")
        self.assertGreater(frame(p, "show", 1).ball[0], 88)
        self.assertEqual(frame(p, "show", .5).ball, p.source)
        self.assertEqual(frame(p, "show", .55).pose, "kick")
        self.assertEqual(frame(p, "show", .55).ball, p.source)
        self.assertNotEqual(frame(p, "show", .6).ball, p.source)

    def test_moving_player_closes_one_lane_before_the_choice(self):
        self.assertEqual(len(self.matches()), 18)
        p = next(p for p in self.matches() if p.opponent_to is not None and p.play == "distribute")
        first = frame(p, "watch", 0)
        last = frame(p, "choose", 0)
        self.assertNotEqual(first.opponents, last.opponents)
        self.assertEqual(last.opponents[0], p.opponent_to)
        self.assertEqual(first.ball, last.ball)

    def test_controlled_dribble_keeps_the_ball_and_avoids_player_overlap(self):
        p = next(p for p in self.matches() if p.play == "close")
        decision = frame(p, "choose", 0)
        for t in (0., .2, .5, 1.):
            view = attempt_frame(p, "collect", t)
            self.assertEqual(view.ball, decision.ball)
            self.assertGreaterEqual(dist(view.keeper, view.opponents[0]), 12)

    def test_rebound_shot_waits_until_the_opponent_reaches_the_ball(self):
        p = next(p for p in self.matches() if p.id == "match.7")
        self.assertEqual(frame(p, "show", .1).ball, p.source)
        contact = frame(p, "show", .2)
        self.assertEqual(contact.opponents[0], (p.source[0], p.source[1] - 4))
        self.assertEqual(contact.ball, p.source)
        self.assertEqual(frame(p, "show", .8).ball, p.spot)

    def test_proactive_sweeps_have_a_clear_head_start_and_use_legal_tools(self):
        self.assertEqual(len(self.matches()), 18)
        for p in (p for p in self.matches() if p.play in ("feet", "collect")):
            self.assertGreaterEqual(dist(p.blocker, p.source) - dist(p.keeper, p.source), 5, p.id)
            self.assertEqual(p.answer, "collect" if p.source[1] >= 55 else "feet")
        titles = " ".join(p.title for p in self.matches()).lower()
        self.assertIn("1v1", titles)
        self.assertIn("through ball", titles)
        self.assertIn("behind defense", titles)

    def test_match_failure_notes_and_invalid_data_do_not_hide_errors(self):
        from soccer_strategy.luke.animation import failure_note
        p = self.matches()[0]
        for changed in (replace(p, title=""), replace(p, play="unknown")):
            with self.assertRaises(ValueError):
                changed.validate()
        with self.assertRaises(ValueError):
            frame(p, "bad", .5)
        for p in self.matches():
            for wrong in (k for k in p.choices if k != p.answer):
                self.assertTrue(failure_note(p, wrong))
        p = next(p for p in self.matches() if p.play == "distribute")
        self.assertIn("ready friend", failure_note(p))

    def test_interceptions_only_happen_between_the_ball_and_recipient(self):
        p = next(p for p in self.matches() if p.play == "distribute")
        target = next(f.position for f in p.friends if f.label == "C")
        for blocker in (None, (50, 95), (95, 50), (50, 10)):
            changed = replace(p, blocker=blocker, extra_blockers=())
            self.assertEqual(attempt_frame(changed, "roll_middle", 1).ball, target)
        support = next(p for p in self.matches() if p.play == "support")
        changed = replace(support, blocker=None, extra_blockers=())
        self.assertEqual(attempt_frame(changed, "ready", 1).ball, support.keeper)

    def test_challenge_cues_do_not_name_the_preferred_action(self):
        from soccer_strategy.luke.model import ACTIONS
        for p in self.matches():
            self.assertNotIn(ACTIONS[p.answer].lower(), p.cue.lower())

    def test_shuffling_reaches_all_challenges_and_every_answer_position(self):
        seen, positions = set(), set()
        for seed in range(60):
            for p in Session("match", seed).pictures:
                seen.add(p.id)
                positions.add(p.choices.index(p.answer))
        self.assertEqual(seen, {p.id for p in self.matches()})
        self.assertEqual(positions, {0, 1, 2})

    def test_every_match_round_covers_six_distinct_match_themes(self):
        groups = ({1, 2, 3, 13, 18}, {4, 5}, {6, 7}, {8, 14, 15, 16, 17}, {9, 10}, {11, 12})
        for seed in range(60):
            identifiers = {int(p.id.split(".")[1]) for p in Session("match", seed).pictures}
            for group in groups:
                self.assertEqual(len(identifiers & group), 1, (seed, identifiers, group))
