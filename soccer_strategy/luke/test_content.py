"""Independent checks for the beginner coaching pictures."""

import unittest
from dataclasses import asdict, replace
from hashlib import sha256
import json
from math import dist

from soccer_strategy.luke.content import CASES, SKILLS
from soccer_strategy.luke.model import ACTIONS, aligned_spot, mix


def lane_distance(point, start, end):
    dx, dy = end[0] - start[0], end[1] - start[1]
    return abs(dx * (point[1] - start[1]) - dy * (point[0] - start[0])) / dist(start, end)


class ContentTests(unittest.TestCase):
    def test_all_48_original_training_pictures_are_unchanged(self):
        encoded = json.dumps([asdict(p) for p in CASES], sort_keys=True, separators=(",", ":")).encode()
        self.assertEqual(sha256(encoded).hexdigest(),
                         "6710770b751af79ef83e05d00605e5c7acdb5cc1f09d69634aa13f5ecf3a70d5")

    def test_forty_eight_pictures_cover_basics_and_match_challenges(self):
        self.assertEqual(len(SKILLS), 5)
        self.assertEqual(len(CASES), 48)
        self.assertEqual(len({p.id for p in CASES}), 48)
        for skill in SKILLS:
            self.assertEqual(sum(p.skill == skill.id for p in CASES),
                             {"line": 9, "hands": 6, "roll": 9, "loose": 6, "match": 18}[skill.id])

    def test_all_pictures_validate_and_keep_reading_short(self):
        for picture in CASES:
            picture.validate()
            self.assertLessEqual(len(picture.cue.split()), 10)
            self.assertLessEqual(len(picture.note.split()), 12)
        self.assertTrue(all(len(label.split()) <= 4 for label in ACTIONS.values()))

    def test_positions_put_luke_on_the_ball_to_goal_line(self):
        for picture in (p for p in CASES if p.skill == "line"):
            self.assertAlmostEqual(lane_distance(picture.spot, picture.incoming_source, (50, 100)), 0)
            difference = picture.spot[0] - picture.keeper[0]
            expected = "right" if difference > .1 else "left" if difference < -.1 else "ready"
            self.assertEqual(picture.answer, expected)
            self.assertEqual(picture.ball_target, picture.spot)

    def test_catch_height_matches_the_hands_and_body_position(self):
        for picture in (p for p in CASES if p.skill == "hands"):
            self.assertEqual(picture.keeper, picture.spot)
            self.assertEqual(picture.spot, picture.ball_target)
            self.assertEqual(picture.answer, "low" if picture.height == 0 else "chest")

    def test_rolling_choices_have_one_visibly_blocked_lane(self):
        for picture in (p for p in CASES if p.skill == "roll"):
            left, right = picture.friends
            self.assertLess(left.position[0], picture.keeper[0])
            self.assertGreater(right.position[0], picture.keeper[0])
            if picture.answer == "hold":
                self.assertEqual(picture.ball_target, picture.source)
                for friend in picture.friends:
                    self.assertTrue(not friend.ready or any(lane_distance(b, picture.keeper, friend.position) < .1
                                                           for b in picture.opponents))
                continue
            distances = [lane_distance(picture.blocker, picture.keeper, f.position) for f in picture.friends]
            open_index = 0 if distances[0] > distances[1] else 1
            self.assertLess(min(distances), .1)
            self.assertGreater(max(distances), 10)
            self.assertEqual(picture.ball_target, picture.friends[open_index].position)
            self.assertEqual(picture.answer, ("roll_left", "roll_right")[open_index])

    def test_loose_ball_decisions_follow_who_is_closer(self):
        pictures = [p for p in CASES if p.skill == "loose"]
        self.assertEqual(len(pictures), 6)
        for picture in pictures:
            closer = dist(picture.keeper, picture.source) < dist(picture.blocker, picture.source)
            self.assertEqual(picture.answer, "collect" if closer else "ready")
            self.assertGreaterEqual(picture.source[1], 70)
            self.assertEqual(picture.spot, picture.source if closer else picture.keeper)

    def test_loose_balls_have_a_clear_arrival_advantage_for_beginners(self):
        for picture in (p for p in CASES if p.skill == "loose"):
            advantage = abs(dist(picture.keeper, picture.source) - dist(picture.blocker, picture.source))
            self.assertGreaterEqual(advantage, 5, picture.id)

    def test_invalid_picture_facts_are_rejected(self):
        picture = CASES[0]
        changes = ({"id": ""}, {"skill": "unknown"}, {"choices": ("left",)}, {"choices": ("left", "left")},
                   {"choices": ("left", "unknown")}, {"answer": "chest"},
                   {"keeper": (-1, 83)}, {"keeper": (101, 83)}, {"keeper": (20, -1)},
                   {"keeper": (20, 101)}, {"source": (float("nan"), 30)},
                   {"source": (20, float("nan"))}, {"height": -1},
                   {"serve_from": (101, 20)}, {"extra_blockers": ((20, -1),)},
                   {"opponent_to": (20, -1)}, {"ball_start": (101, 40)},
                   {"skill": "match", "choices": ("ready", "left", "right")},
                   {"height": 100}, {"height": float("nan")}, {"cue": ""},
                   {"note": "too long " * 20})
        for fields in changes:
            with self.subTest(fields=fields), self.assertRaises(ValueError):
                replace(picture, **fields).validate()
        for source in ((20, -1), (50, 100)):
            with self.assertRaises(ValueError):
                aligned_spot(source)

    def test_interpolation_stays_on_the_segment_and_clamps(self):
        for fraction in (-2., 0., .2, .5, 1., 3.):
            point = mix((10, 20), (70, 80), fraction)
            self.assertTrue(10 <= point[0] <= 70 and 20 <= point[1] <= 80)
            self.assertAlmostEqual(point[1] - point[0], 10)
