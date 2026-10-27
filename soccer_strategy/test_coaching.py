"""Football-specific regressions, beyond software flow and catalog counts."""

import unittest
from dataclasses import replace
from math import dist

from soccer_strategy.catalog import build_catalog, make_scene
from soccer_strategy.content import LESSONS
from soccer_strategy.presentation import keeper_observation, positions


class CoachingTests(unittest.TestCase):
    def test_pass_waits_at_johns_foot_for_contact(self):
        scene = next(s for s in build_catalog() if s.id == "20.1")
        index = next(i for i, c in enumerate(scene.choices) if c.key == "pass")
        for fraction in (0., .1, .14):
            _, ball = positions(scene, "outcome", fraction, index)
            self.assertEqual(ball, scene.ball)
        _, ball = positions(scene, "outcome", .3, index)
        self.assertNotEqual(ball, scene.ball)
        _, ball = positions(scene, "feedback", 1., index)
        self.assertEqual(ball, scene.choices[index].ball_end)

    def test_positioning_actions_do_not_make_the_ball_roll_by_default(self):
        for scene in build_catalog():
            for index, choice in enumerate(scene.choices):
                if choice.key in ("contain", "press", "inside", "recover", "mark",
                                  "cover", "lane", "shield"):
                    _, ball = positions(scene, "outcome", .8, index)
                    if scene.topic not in (16, 17, 23):
                        self.assertEqual(ball, scene.ball, (scene.id, choice.key))

    def test_unselected_actors_hold_their_pictured_positions_during_a_choice(self):
        for scene in build_catalog():
            for index in range(3):
                for fraction in (.25, .75, 1.):
                    actors, _ = positions(scene, "outcome", fraction, index)
                    for actor in scene.actors:
                        if actor.key != "john":
                            self.assertEqual(actors[actor.key], actor.position,
                                             (scene.id, index, fraction, actor.key))

    def test_pressure_demonstration_keeps_the_carrier_at_the_pictured_ball(self):
        for scene in build_catalog():
            for index, choice in enumerate(scene.choices):
                if choice.key == "press":
                    a = next(p for p in scene.actors if p.key == "carrier")
                    for fraction in (.25, .75, 1.):
                        actors, ball = positions(scene, "outcome", fraction, index)
                        self.assertEqual(actors["carrier"], a.position, scene.id)
                        self.assertEqual(ball, scene.ball, scene.id)
                    self.assertEqual(actors["john"], choice.target)

    def test_shield_places_body_between_a_and_ball(self):
        for scene in build_catalog():
            for choice in scene.choices:
                if choice.key == "shield":
                    a = next(p for p in scene.actors if p.key == "carrier")
                    self.assertLess(dist(choice.target, a.position), dist(scene.ball, a.position))
                    self.assertLessEqual(dist(choice.target, choice.ball_end), 2.01)
                    self.assertGreaterEqual(dist(choice.ball_end, a.position), dist(scene.ball, a.position))
                    self.assertAlmostEqual(dist(choice.target, a.position) + dist(choice.target, scene.ball),
                                           dist(scene.ball, a.position))

    def test_support_choices_do_not_abandon_the_live_threat(self):
        for identifier in ("09.1", "10.3"):
            scene = next(s for s in build_catalog() if s.id == identifier)
            cover = next(c for c in scene.choices if c.key == "cover")
            self.assertEqual(cover.rating, 0, identifier)

    def test_all_nonpreferred_choices_have_picture_specific_feedback(self):
        for lesson in LESSONS:
            for variant, situation in enumerate(lesson.situations):
                notes = getattr(situation, "notes", ("", "", ""))
                for index, rating in enumerate(situation.ratings):
                    if rating != 2:
                        self.assertTrue(notes[index], f"{lesson.topic:02d}.{variant + 1}:{lesson.actions[index]}")
                        scene = make_scene(lesson, variant, situation)
                        self.assertIn(notes[index], scene.choices[index].explanation)
                        self.assertNotIn(" Here: ", scene.choices[index].explanation)

    def test_named_support_and_loose_touch_are_visible(self):
        catalog = {s.id: s for s in build_catalog()}
        scene = catalog["07.2"]
        mate = next(a for a in scene.actors if a.key == "mate")
        carrier = next(a for a in scene.actors if a.key == "carrier")
        self.assertLess(dist(mate.position, carrier.position), 7)
        self.assertLess(dist(mate.position, scene.ball), dist(scene.john.position, scene.ball))
        self.assertEqual(catalog["18.3"].ball_state, "loose")
        for identifier in ("27.1", "27.2", "27.3"):
            scene = catalog[identifier]
            mate = next(a for a in scene.actors if a.key == "mate")
            self.assertEqual(scene.ball_from, mate.position)

    def test_picture_does_not_change_when_preferred_answer_changes(self):
        lesson = LESSONS[0]
        situation = lesson.situations[0]
        original = make_scene(lesson, 0, situation)
        changed = make_scene(lesson, 0, replace(situation, best=2))
        self.assertEqual(original.actors, changed.actors)
        self.assertEqual(original.ball_from, changed.ball_from)

    def test_clearance_stays_wide_even_when_possession_was_better(self):
        scene = next(s for s in build_catalog() if s.id == "20.1")
        clear = next(c for c in scene.choices if c.key == "clear")
        self.assertEqual(clear.rating, 0)
        self.assertLess(clear.ball_end[0], 10)
        self.assertNotIn("opponent finds space", clear.outcome.lower())

    def test_credible_safe_alternatives_are_not_taught_as_wrong(self):
        scene = next(s for s in build_catalog() if s.id == "03.1")
        contain = next(c for c in scene.choices if c.key == "contain")
        self.assertEqual(contain.rating, 1)

    def test_loose_ball_claim_has_visible_distance_advantage(self):
        for scene_id in ("01.3", "02.3", "03.1", "04.2", "05.3", "07.3", "15.3", "18.1"):
            scene = next(s for s in build_catalog() if s.id == scene_id)
            opponent = next(a for a in scene.actors if a.key == "carrier")
            self.assertLess(dist(scene.john.position, scene.ball), dist(opponent.position, scene.ball), scene_id)

    def test_goalkeeper_distribution_cases_exist_and_start_legally(self):
        scenes = [s for s in build_catalog() if s.topic in (25, 26)]
        self.assertEqual(len(scenes), 6)
        for scene in scenes:
            self.assertIn("first touch", scene.rules)
            players, ball = positions(scene, "observe", .1, None)
            for actor in scene.actors:
                if actor.team == "away":
                    self.assertLessEqual(players[actor.key][1], 36)
            self.assertGreater(ball[1], 60)

    def test_distribution_without_a_keeper_fails_instead_of_faking_a_throw(self):
        scene = next(s for s in build_catalog() if s.topic == 25)
        with self.assertRaises(StopIteration):
            keeper_observation(replace(scene, actors=(scene.john,)), .1)

    def test_blocked_pass_and_wide_exit_have_visible_opponents(self):
        for scene_id in ("20.3", "21.3"):
            scene = next(s for s in build_catalog() if s.id == scene_id)
            opponents = [a for a in scene.actors if a.team == "away"]
            self.assertGreaterEqual(len(opponents), 3)

    def test_zone_assignment_keeps_john_in_his_assigned_area(self):
        for scene_id in ("23.2", "24.2"):
            scene = next(s for s in build_catalog() if s.id == scene_id)
            cover = next(c for c in scene.choices if c.key == "cover")
            self.assertLess(dist(cover.target, scene.john.position), 1)

    def test_shot_block_is_goal_side_of_ball(self):
        for scene in build_catalog():
            for choice in scene.choices:
                if choice.key == "block":
                    self.assertGreater(choice.target[1], scene.ball[1])

    def test_teammate_miscontrol_has_three_recovery_pictures(self):
        scenes = [s for s in build_catalog() if s.topic == 27]
        self.assertEqual(len(scenes), 3)
        self.assertEqual({next(c.key for c in s.choices if c.rating == 2) for s in scenes},
                         {"collect", "cover", "mark"})

    def test_pass_feedback_does_not_promise_a_successful_reception(self):
        for scene in build_catalog():
            for choice in scene.choices:
                if choice.key == "pass":
                    self.assertIn("not a guaranteed reception", choice.outcome)
                    self.assertIn("support", choice.explanation)

    def test_preferred_passes_are_short_and_to_a_ready_receiver(self):
        for lesson in LESSONS:
            for situation in lesson.situations:
                for index, key in enumerate(lesson.actions):
                    if key == "pass" and situation.ratings[index] == 2:
                        self.assertLessEqual(dist(situation.ball, situation.mate), 15)
                        self.assertTrue(situation.receiver_ready)

    def test_receiver_is_beyond_the_interception_point(self):
        scene = next(s for s in build_catalog() if s.id == "06.3")
        receiver = next(a for a in scene.actors if a.key == "carrier")
        self.assertGreater(dist(scene.ball_from, receiver.position),
                           dist(scene.ball_from, scene.ball))

    def test_choices_identify_a_player_or_visible_destination(self):
        vague = {"Protect the support space", "Protect the receiving lane", "Recover toward goal"}
        for scene in build_catalog():
            for choice in scene.choices:
                self.assertNotIn(choice.label, vague)
                if choice.key == "pass":
                    self.assertIn("feet", choice.label)
                if choice.key == "mark":
                    self.assertIn("R", choice.label)

    def test_press_preview_really_moves_toward_a(self):
        for scene in build_catalog():
            a = next(p for p in scene.actors if p.key == "carrier")
            for choice in scene.choices:
                if choice.key == "press":
                    self.assertLessEqual(dist(choice.target, a.position),
                                         dist(scene.john.position, a.position))

    def test_sliding_is_situational_not_a_default_reward(self):
        scenes = [s for s in build_catalog() if s.topic == 28]
        self.assertEqual(len(scenes), 3)
        self.assertEqual([next(c for c in s.choices if c.key == "slide").rating for s in scenes],
                         [0, 1, 2])
        last = scenes[2]
        a = next(p for p in last.actors if p.key == "carrier")
        self.assertGreater(dist(a.position, last.ball), 10)
        self.assertIn("allowed", last.rules)

    def test_short_pass_and_long_kick_have_different_routes(self):
        scenes = [s for s in build_catalog() if s.topic == 29]
        self.assertEqual(len(scenes), 3)
        for scene in scenes:
            short = next(c for c in scene.choices if c.key == "pass")
            long = next(c for c in scene.choices if c.key == "long")
            self.assertLess(short.ball_end[1] - scene.ball[1], 15)
            self.assertLess(long.ball_end[1], 30)
            self.assertLess(long.ball_end[0], 15)
            self.assertIn("either team", long.outcome)

    def test_unpressured_rebound_can_be_collected_instead_of_booted(self):
        scene = next(s for s in build_catalog() if s.id == "18.1")
        self.assertEqual(next(c.key for c in scene.choices if c.rating == 2), "collect")

    def test_slide_and_long_kick_reach_the_ball_before_it_leaves(self):
        for identifier, key in (("28.3", "slide"), ("29.2", "long")):
            scene = next(s for s in build_catalog() if s.id == identifier)
            index = next(i for i, c in enumerate(scene.choices) if c.key == key)
            actors, ball = positions(scene, "outcome", .2, index)
            self.assertEqual(ball, scene.ball)
            self.assertNotEqual(actors["john"], scene.choices[index].target)
            actors, ball = positions(scene, "outcome", .45, index)
            self.assertEqual(actors["john"], scene.choices[index].target)
            self.assertEqual(ball, scene.ball)


if __name__ == "__main__":
    unittest.main()
