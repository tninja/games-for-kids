"""Football-specific regressions, beyond software flow and catalog counts."""

import unittest
from dataclasses import replace
from math import dist

from soccer_strategy.john.catalog import build_catalog, make_scene
from soccer_strategy.john.content import LESSONS
from soccer_strategy.john.presentation import keeper_observation, positions


class CoachingTests(unittest.TestCase):
    def test_shooting_practice_keeps_control_and_protects_goal(self):
        scenes = [s for s in build_catalog() if s.stage == 2]
        self.assertEqual(len(scenes), 15)
        self.assertEqual({s.topic for s in scenes}, {4, 31, 32, 33, 34})
        for scene in scenes:
            self.assertEqual(scene.ball_state, "controlled", scene.id)
            self.assertIsNotNone(scene.shot_target, scene.id)
            self.assertEqual(len(scene.choices), 3)
            self.assertTrue({c.key for c in scene.choices} <=
                            {"block", "press", "recover", "cover"}, scene.id)
            attacker = next(a for a in scene.actors if a.key == "carrier")
            self.assertLess(dist(attacker.position, scene.ball),
                            dist(scene.john.position, scene.ball), scene.id)
            self.assertIn("block", {c.key for c in scene.choices})

    def test_shooting_choices_distinguish_setup_from_ready_shots(self):
        scenes = [s for s in build_catalog() if s.topic == 31]
        self.assertEqual(len(scenes), 3)
        self.assertEqual([next(c.key for c in s.choices if c.rating == 2) for s in scenes],
                         ["press", "block", "block"])
        for scene in (scenes[0], next(s for s in build_catalog() if s.id == "32.3")):
            attacker = next(a for a in scene.actors if a.key == "carrier")
            press = next(c for c in scene.choices if c.key == "press")
            self.assertGreater(dist(press.target, attacker.position), 5.5)
            self.assertLess(dist(press.target, attacker.position),
                            dist(scene.john.position, attacker.position))

    def test_shot_blocks_follow_the_stated_middle_or_near_post_line(self):
        scenes = [s for s in build_catalog() if s.stage == 2]
        self.assertEqual(len(scenes), 15)
        near_posts = {"04.2": (40, 100), "31.3": (60, 100), "32.2": (40, 100),
                      "33.2": (60, 100), "33.3": (40, 100)}
        for scene in scenes:
            goal = near_posts.get(scene.id, (50, 100))
            block = next(c for c in scene.choices if c.key == "block")
            dx, dy = goal[0] - scene.ball[0], goal[1] - scene.ball[1]
            bx, by = block.target[0] - scene.ball[0], block.target[1] - scene.ball[1]
            self.assertAlmostEqual(dx * by - dy * bx, 0, msg=scene.id)
            self.assertGreater(block.target[1], scene.ball[1])
            self.assertLess(block.target[1], 100)
            self.assertEqual(block.ball_end, block.target)
            if block.rating == 2:
                self.assertLess(dist(scene.john.position, block.target),
                                dist(scene.john.position, scene.ball), scene.id)
            if scene.id in near_posts:
                side = "left" if goal[0] == 40 else "right"
                self.assertIn(side, block.label)

    def test_shooting_support_covers_an_angle_instead_of_chasing_a_runner(self):
        scenes = [s for s in build_catalog() if s.topic == 32]
        self.assertEqual(len(scenes), 3)
        self.assertEqual([next(c.key for c in s.choices if c.rating == 2) for s in scenes],
                         ["block", "block", "press"])
        for scene in scenes:
            mate = next(a for a in scene.actors if a.key == "mate")
            attacker = next(a for a in scene.actors if a.key == "carrier")
            self.assertNotIn("runner", {a.key for a in scene.actors})
            if scene.id == "32.2":
                self.assertLess(dist(mate.position, scene.ball), dist(scene.john.position, scene.ball))
                block = next(c for c in scene.choices if c.key == "block")
                self.assertGreater(dist(mate.position, block.target), 6)
                cover = next(c for c in scene.choices if c.key == "cover")
                self.assertEqual(cover.target[0], 40)
                self.assertGreater(cover.target[1], scene.ball[1])
                self.assertEqual(cover.rating, 1)
            else:
                self.assertLess(mate.position[1], attacker.position[1])
                self.assertGreater(scene.john.position[1], scene.ball[1])

    def test_cut_ins_keep_the_ball_close_and_show_a_real_inward_run(self):
        scenes = [s for s in build_catalog() if s.topic == 33]
        self.assertEqual(len(scenes), 3)
        self.assertEqual([next(c.key for c in s.choices if c.rating == 2) for s in scenes],
                         ["press", "block", "block"])
        for scene in scenes:
            attacker = next(a for a in scene.actors if a.key == "carrier")
            for fraction in (0., .1, .25, .5, .75, .9, 1.):
                actors, ball = positions(scene, "observe", fraction, None)
                self.assertLess(dist(actors["carrier"], ball), 4, (scene.id, fraction))
            if scene.id == "33.3":
                self.assertGreater(attacker.approach[0], attacker.position[0] + 10)
            else:
                self.assertLess(attacker.approach[0], attacker.position[0] - 10)
            self.assertLess(abs(attacker.position[0] - 50), abs(attacker.approach[0] - 50))
            self.assertEqual(scene.ball_state, "controlled")

    def test_shooter_distance_cases_compare_closing_holding_and_sideways_cover(self):
        scenes = [s for s in build_catalog() if s.topic == 34]
        self.assertEqual(len(scenes), 3)
        self.assertEqual([next(c.key for c in s.choices if c.rating == 2) for s in scenes],
                         ["press", "block", "block"])
        far, set_position, side = scenes
        attacker = next(a for a in far.actors if a.key == "carrier")
        for scene in scenes:
            self.assertEqual(scene.ball, far.ball)
            self.assertEqual(scene.shot_target, far.shot_target)
            self.assertEqual(next(a.position for a in scene.actors if a.key == "carrier"), attacker.position)
        self.assertGreater(dist(far.john.position, attacker.position),
                           dist(set_position.john.position, attacker.position))
        press = next(c for c in far.choices if c.key == "press")
        self.assertLess(dist(press.target, attacker.position), dist(far.john.position, attacker.position))
        block = next(c for c in set_position.choices if c.key == "block")
        self.assertEqual(block.target, set_position.john.position)
        self.assertIn("Stay", block.label)
        sx, sy = side.john.position[0] - side.ball[0], side.john.position[1] - side.ball[1]
        gx, gy = side.shot_target[0] - side.ball[0], side.shot_target[1] - side.ball[1]
        self.assertGreater(abs(gx * sy - gy * sx), 20)
        block = next(c for c in side.choices if c.key == "block")
        self.assertLess(block.target[0], side.john.position[0])
        self.assertGreater(block.target[1], side.john.position[1])

    def test_scene_text_stays_short_for_a_nine_year_old_reader(self):
        for scene in build_catalog():
            self.assertLessEqual(len(scene.cue.split()), 24, scene.id)
            for choice in scene.choices:
                self.assertLessEqual(len(choice.label.split()), 12,
                                     (scene.id, choice.key, choice.label))
                self.assertLessEqual(len(choice.explanation.split()), 24,
                                     (scene.id, choice.key, choice.explanation))

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
                actions = situation.actions or lesson.actions
                for index, rating in enumerate(situation.ratings):
                    if rating != 2:
                        self.assertTrue(notes[index], f"{lesson.topic:02d}.{variant + 1}:{actions[index]}")
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
        for scene_id in ("01.3", "02.3", "03.1", "05.3", "07.3", "15.3", "18.1"):
            scene = next(s for s in build_catalog() if s.id == scene_id)
            opponent = next(a for a in scene.actors if a.key == "carrier")
            self.assertLess(dist(scene.john.position, scene.ball), dist(opponent.position, scene.ball), scene_id)

    def test_goalkeeper_distribution_cases_exist_and_start_legally(self):
        scenes = [s for s in build_catalog() if s.topic in (25, 26)]
        self.assertEqual(len(scenes), 6)
        for scene in scenes:
            players, ball = positions(scene, "observe", .1, None)
            for actor in scene.actors:
                if actor.team == "away":
                    self.assertLessEqual(players[actor.key][1], 36)
            self.assertGreater(ball[1], 60)
        keeper_throw = next(s for s in scenes if s.id == "25.1")
        self.assertIn("first touch", keeper_throw.rules)
        self.assertIn("Local line rules vary", keeper_throw.rules)

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
                    self.assertTrue("support" in choice.explanation or "help" in choice.label)

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


class PossessionTests(unittest.TestCase):
    def test_keeper_distribution_changes_with_space_and_receivers(self):
        scenes = [s for s in build_catalog() if s.topic in (35, 36)]
        self.assertEqual(len(scenes), 6)
        self.assertEqual([next(c.key for c in s.choices if c.rating == 2) for s in scenes],
                         ["carry", "pass_left", "pass_center", "carry", "pass_center", "long"])
        for scene in scenes:
            self.assertEqual(scene.stage, 7)
            self.assertTrue(scene.keeper_distribution)
            keeper = next(a for a in scene.actors if a.key == "keeper")
            self.assertEqual(scene.ball_from, keeper.position)
            actors, ball = positions(scene, "observe", 0, None)
            self.assertEqual(ball, keeper.position)
            self.assertTrue(all(actors[a.key][1] <= 32 for a in scene.actors if a.team == "away"))
            actors, ball = positions(scene, "observe", 1, None)
            self.assertEqual(ball, scene.ball)
            self.assertLess(dist(ball, actors["john"]), 2)
            self.assertIn("Local line rules vary", scene.rules)

    def test_backfield_and_midfield_offer_directional_receivers(self):
        scenes = [s for s in build_catalog() if s.topic in (37, 38)]
        self.assertEqual(len(scenes), 6)
        self.assertEqual([next(c.key for c in s.choices if c.rating == 2) for s in scenes],
                         ["carry", "pass_left", "pass_center", "carry", "pass_right", "pass_back"])
        for scene in scenes:
            self.assertEqual(scene.stage, 7)
            self.assertFalse(scene.keeper_distribution)
            self.assertIn(scene.ball_state, ("owned", "receiving"))
            self.assertLess(dist(scene.john.position, scene.ball), 2)
            self.assertTrue(60 <= scene.ball[1] <= 80 if scene.topic == 37
                            else 10 <= scene.ball[1] <= 25)
            ends = [c.ball_end for c in scene.choices if c.key.startswith("pass_")]
            self.assertEqual(len(set(ends)), 2)

    def test_directional_passes_reach_visible_teammates_after_contact(self):
        scenes = [s for s in build_catalog() if s.topic >= 35]
        self.assertEqual(len(scenes), 12)
        labels = {"pass_left": "LW", "pass_center": "CM", "pass_right": "RW", "pass_back": "BACK"}
        for scene in scenes:
            for index, choice in enumerate(scene.choices):
                if choice.key not in labels:
                    continue
                receiver = next(a for a in scene.actors if a.key == choice.key)
                self.assertEqual(receiver.team, "home")
                self.assertEqual(receiver.label, labels[choice.key])
                self.assertIn(receiver.label, choice.label)
                self.assertEqual(choice.ball_end, receiver.position)
                self.assertLess(dist(choice.target, scene.ball), 3)
                self.assertIn("not a guaranteed reception", choice.outcome)
                actors, ball = positions(scene, "outcome", .1, index)
                self.assertEqual(ball, scene.ball)
                actors, ball = positions(scene, "outcome", .6, index)
                self.assertLess(dist(ball, choice.ball_end), dist(scene.ball, choice.ball_end))
                self.assertEqual(actors[receiver.key], receiver.position)
                from soccer_strategy.john.model import transfer_scene
                for scale in (.8, .96, 1.05):
                    shifted = transfer_scene(scene, scale)
                    end = positions(shifted, "feedback", 1, index)[1]
                    self.assertEqual(end, next(a.position for a in shifted.actors if a.key == choice.key))

    def test_new_possession_feedback_explains_each_decision(self):
        scenes = [s for s in build_catalog() if s.topic >= 35]
        self.assertEqual(len(scenes), 12)
        for scene in scenes:
            explanations = [c.explanation for c in scene.choices]
            self.assertEqual(len(set(explanations)), 3)
            self.assertTrue(all(len(text) > 35 for text in explanations))
            self.assertTrue(scene.cue.isascii())
            self.assertTrue(all(a.label in scene.cue for a in scene.actors if a.key.startswith("pass_")))
            for choice in scene.choices:
                if choice.key == "long":
                    self.assertLess(choice.ball_end[1], 30)
                    self.assertIn("either team", choice.outcome)
        blocked = next(s for s in scenes if s.id == "36.3")
        center = next(c for c in blocked.choices if c.key == "pass_center")
        self.assertEqual(center.rating, 0)
        self.assertTrue(any(dist(a.position, center.ball_end) <= 8
                            for a in blocked.actors if a.team == "away"))

    def test_new_possession_players_have_readable_spacing(self):
        from itertools import combinations
        from soccer_strategy.john.drawing import pitch_point
        scenes = [s for s in build_catalog() if s.topic >= 35]
        self.assertEqual(len(scenes), 12)
        for scene in scenes:
            for first, second in combinations(scene.actors, 2):
                self.assertGreaterEqual(dist(pitch_point(first.position), pitch_point(second.position)),
                                        36, (scene.id, first.key, second.key))


if __name__ == "__main__":
    unittest.main()
