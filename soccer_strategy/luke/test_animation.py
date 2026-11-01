"""The ball meets the hands before it is held or released."""

from dataclasses import replace
import unittest

from soccer_strategy.luke.animation import attempt_frame, failure_note, frame
from soccer_strategy.luke.content import CASES


class AnimationTests(unittest.TestCase):
    def test_wrong_choices_show_the_selected_mistake_before_coaching(self):
        for picture in (p for p in CASES if p.skill != "match"):
            selected = next(key for key in picture.choices if key != picture.answer)
            start = attempt_frame(picture, selected, 0)
            self.assertEqual(start.ball, frame(picture, "choose", 0).ball)
            end = attempt_frame(picture, selected, 1)
            self.assertNotEqual(end.pose, "hug", picture.id)
            if picture.skill != "loose":
                self.assertNotEqual(end.ball, picture.ball_target, picture.id)
            if picture.skill == "line":
                direction = -1 if selected == "left" else 1
                self.assertGreater((end.keeper[0] - picture.keeper[0]) * direction, 0)
                self.assertEqual(end.ball, (50, 100))
            elif picture.skill == "hands":
                self.assertEqual(end.pose, selected)
                self.assertEqual(end.height, 0)
            elif picture.skill == "roll":
                self.assertEqual(attempt_frame(picture, selected, .2).ball, picture.keeper)
                self.assertGreater(attempt_frame(picture, selected, .2).height, 0)
                self.assertEqual(attempt_frame(picture, selected, .75).ball, picture.blocker)

    def test_failure_frame_rejects_a_missing_or_correct_selection(self):
        picture = CASES[0]
        for selected in (None, "unknown", picture.answer):
            with self.assertRaises(ValueError):
                attempt_frame(picture, selected, .5)

    def test_loose_ball_failure_explains_which_consequence_happened(self):
        collect = next(p for p in CASES if p.id == "loose.1")
        guard = next(p for p in CASES if p.id == "loose.4")
        self.assertEqual(failure_note(collect), "The ball is still loose.")
        self.assertEqual(failure_note(guard), "The other player arrived first.")

    def test_roll_consequence_does_not_invent_a_collision_off_the_lane(self):
        picture = next(p for p in CASES if p.skill == "roll")
        wrong = next(key for key in picture.choices if key != picture.answer)
        friend = picture.friends[0 if wrong == "roll_left" else 1]
        for blocker in (None, (95, 10)):
            changed = replace(picture, blocker=blocker)
            self.assertEqual(attempt_frame(changed, wrong, 1).ball, friend.position)

    def test_wrong_roll_lowers_the_ball_even_when_holding_was_correct(self):
        for picture in (p for p in CASES if p.skill == "roll" and p.answer == "hold"):
            wrong = next(key for key in picture.choices if key != picture.answer)
            lowering = attempt_frame(picture, wrong, .3)
            self.assertEqual(lowering.ball, picture.source)
            self.assertAlmostEqual(lowering.height, 5)
            self.assertEqual(lowering.pose, "roll")
            release = attempt_frame(picture, wrong, .35)
            self.assertEqual(release.ball, picture.source)
            self.assertEqual(release.height, 0)

    def test_switch_pass_changes_sides_before_the_serve(self):
        picture = next(p for p in CASES if p.id == "line.7")
        self.assertEqual(frame(picture, "watch", 0).ball, picture.source)
        self.assertEqual(frame(picture, "watch", .55).ball, picture.serve_from)
        decision = frame(picture, "choose", 0)
        self.assertGreater(decision.ball[0], picture.spot[0])
        self.assertEqual(frame(picture, "show", 0).ball, decision.ball)

    def test_holding_and_guarding_do_not_pretend_to_make_a_catch(self):
        hold = next(p for p in CASES if p.id == "roll.7")
        for t in (0., .3, .7, 1.):
            view = frame(hold, "show", t)
            self.assertEqual(view.pose, "hug")
            self.assertEqual(view.height, 35)
            self.assertEqual(view.ball, hold.keeper)
        guarded = next(p for p in CASES if p.id == "loose.4")
        view = frame(guarded, "show", 1)
        self.assertEqual(view.pose, "ready")
        self.assertEqual(view.keeper, guarded.keeper)
        self.assertEqual(view.ball, guarded.blocker)
        wrong = attempt_frame(guarded, "collect", 1)
        self.assertEqual(wrong.ball, guarded.blocker)
        self.assertGreater(wrong.keeper[1], guarded.blocker[1] + 5)
        collect = next(p for p in CASES if p.id == "loose.1")
        waiting = attempt_frame(collect, "ready", 1)
        self.assertEqual(waiting.ball, collect.source)
        self.assertEqual(waiting.height, 0)
        self.assertEqual(waiting.keeper, collect.keeper)

    def test_catch_reaches_the_keeper_then_hugs_the_ball(self):
        for picture in (p for p in CASES if p.skill in ("line", "hands") or (p.skill == "loose" and p.answer == "collect")):
            self.assertEqual(frame(picture, "watch", 0).ball, picture.source)
            decision = frame(picture, "choose", 0)
            self.assertEqual(frame(picture, "show", 0).ball, decision.ball)
            middle = frame(picture, "show", .4)
            self.assertEqual(middle.keeper, picture.spot)
            if picture.skill == "loose":
                self.assertEqual(middle.ball, picture.source)
            else:
                self.assertNotEqual(middle.ball, picture.spot)
            self.assertEqual(middle.height, picture.height)
            contact = frame(picture, "show", .7)
            self.assertEqual(contact.ball, picture.spot)
            self.assertAlmostEqual(contact.height, picture.height)
            end = frame(picture, "feedback", 0)
            self.assertEqual(end.keeper, end.ball)
            self.assertEqual(end.pose, "hug")
            self.assertAlmostEqual(end.height, 35)

    def test_roll_stays_in_the_hands_until_release(self):
        for picture in (p for p in CASES if p.skill == "roll" and p.ball_target != p.source):
            watch = frame(picture, "watch", .5)
            self.assertEqual(watch.ball, picture.keeper)
            self.assertEqual(watch.height, 35)
            for t in (0., .1, .34):
                self.assertEqual(frame(picture, "show", t).ball, picture.keeper)
            release = frame(picture, "show", .35)
            self.assertEqual(release.ball, picture.source)
            self.assertEqual(release.height, 0)
            rolling = frame(picture, "show", .6)
            self.assertNotEqual(rolling.ball, picture.source)
            self.assertEqual(rolling.height, 0)
            self.assertEqual(frame(picture, "feedback", 0).ball, picture.ball_target)

    def test_demonstration_uses_picture_facts_not_the_score_key(self):
        for picture in CASES:
            wrong = next(key for key in picture.choices if key != picture.answer)
            changed = replace(picture, answer=wrong)
            for phase in ("watch", "choose", "show", "feedback"):
                for t in (0., .3, .8, 1.):
                    self.assertEqual(frame(picture, phase, t), frame(changed, phase, t))

    def test_phase_and_fraction_boundaries(self):
        picture = CASES[0]
        self.assertEqual(frame(picture, "show", -1), frame(picture, "show", 0))
        self.assertEqual(frame(picture, "show", 2), frame(picture, "show", 1))
        with self.assertRaises(ValueError):
            frame(picture, "unknown", .5)
