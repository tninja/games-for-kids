"""Practice flow, independent choices and useful encouragement."""

import unittest

from soccer_strategy.luke.content import SKILLS
from soccer_strategy.luke.session import Session


def finish_demo(session):
    while session.phase in ("attempt", "show"):
        session.tick(20)


class SessionTests(unittest.TestCase):
    def test_wrong_attempt_is_followed_automatically_by_the_coach(self):
        session = Session("hands")
        session.tick(20)
        wrong = next(i for i, key in enumerate(session.picture.choices) if key != session.picture.answer)
        session.choose(wrong)
        self.assertEqual(session.phase, "attempt")
        saved = dict(session.results)
        session.tick(20)
        self.assertEqual(session.phase, "show")
        self.assertEqual(session.fraction, 0)
        session.tick(20)
        self.assertEqual(session.phase, "feedback")
        self.assertEqual(session.results, saved)
        self.assertTrue(session.replay())
        self.assertEqual(session.phase, "show")

    def test_rounds_have_six_unique_pictures_and_balanced_mixed_skills(self):
        seen_orders = set()
        for skill in ("all", "line", "hands", "roll", "loose", "match"):
            for seed in range(12):
                session = Session(skill, seed)
                self.assertEqual(len(session.pictures), 6)
                self.assertEqual(len({p.id for p in session.pictures}), 6)
                self.assertEqual(session.pictures, Session(skill, seed).pictures)
                for item in SKILLS:
                    count = sum(p.skill == item.id for p in session.pictures)
                    if skill == "all":
                        self.assertIn(count, (1, 2))
                    else:
                        self.assertEqual(count, 6 if skill == item.id else 0)
                seen_orders.add(session.pictures[0].choices)
        self.assertGreater(len(seen_orders), 3)

    def test_no_timeout_and_only_a_visible_choice_can_be_selected(self):
        session = Session("hands")
        self.assertFalse(session.choose(0))
        session.tick(20)
        self.assertEqual(session.phase, "choose")
        session.tick(1000)
        self.assertEqual(session.phase, "choose")
        for bad in (-1, 2, 20, .5):
            self.assertFalse(session.choose(bad))
        self.assertFalse(session.results)
        self.assertTrue(session.choose(0))
        self.assertEqual(session.phase, "show" if session.chosen_good else "attempt")
        self.assertFalse(session.choose(1))
        self.assertFalse(session.advance())
        finish_demo(session)
        self.assertEqual(session.phase, "feedback")

    def test_replay_and_retry_do_not_rewrite_first_attempt(self):
        session = Session("line")
        session.tick(20)
        wrong = next(i for i, key in enumerate(session.picture.choices) if key != session.picture.answer)
        session.choose(wrong)
        finish_demo(session)
        saved = dict(session.results)
        self.assertEqual(session.stars, 0)
        self.assertTrue(session.replay())
        self.assertEqual(session.phase, "show")
        session.tick(20)
        self.assertTrue(session.retry())
        session.tick(20)
        correct = session.picture.choices.index(session.picture.answer)
        session.choose(correct)
        session.tick(20)
        self.assertEqual(session.results, saved)
        self.assertTrue(session.chosen_good)
        self.assertTrue(session.advance())
        self.assertIsNone(session.selected)

    def test_summary_recommends_an_attempted_skill_that_needs_practice(self):
        session = Session("all", 3)
        for _ in range(6):
            session.tick(20)
            desired = session.picture.skill != "hands"
            choice = next(i for i, key in enumerate(session.picture.choices)
                          if (key == session.picture.answer) == desired)
            session.choose(choice)
            finish_demo(session)
            self.assertTrue(session.advance())
        self.assertEqual(session.phase, "summary")
        hand_count = sum(p.skill == "hands" for p in session.pictures)
        self.assertEqual(session.stars, 6 - hand_count)
        self.assertEqual(session.practice_skill.id, "hands")
        self.assertEqual({p.skill.id: (p.correct, p.total) for p in session.progress()},
                         {skill.id: (0 if skill.id == "hands" else sum(p.skill == skill.id for p in session.pictures),
                                     sum(p.skill == skill.id for p in session.pictures)) for skill in SKILLS})
        self.assertFalse(session.advance())
        self.assertFalse(session.retry())
        self.assertFalse(session.replay())

    def test_perfect_and_empty_practice_have_no_weak_skill(self):
        session = Session("roll")
        self.assertIsNone(session.practice_skill)
        self.assertFalse(session.chosen_good)
        self.assertIsNone(session.selected_key)
        self.assertEqual(session.progress(), ())
        self.assertFalse(session.retry())
        self.assertFalse(session.replay())
        for _ in range(6):
            session.tick(.1)
            self.assertGreater(session.fraction, 0)
            session.tick(20)
            session.choose(session.picture.choices.index(session.picture.answer))
            session.tick(20)
            session.advance()
        self.assertEqual(session.stars, 6)
        self.assertIsNone(session.practice_skill)

    def test_invalid_skill_and_clock_values_fail(self):
        with self.assertRaises(ValueError):
            Session("unknown")
        session = Session()
        for value in (-1., float("nan"), float("inf")):
            with self.assertRaises(ValueError):
                session.tick(value)
