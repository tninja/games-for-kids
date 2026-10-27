"""Executable catalog acceptance criteria."""

import unittest
from dataclasses import replace

from soccer_strategy.catalog import build_catalog
from soccer_strategy.model import bounded, lerp, transfer_scene
from soccer_strategy.presentation import positions


class CatalogTests(unittest.TestCase):
    def test_scenario_catalog_has_87_unique_situations(self):
        catalog = build_catalog()
        self.assertEqual(len(catalog), 87)
        self.assertEqual(len({scene.id for scene in catalog}), 87)
        self.assertEqual({scene.topic for scene in catalog}, set(range(1, 30)))

    def test_context_changes_preferred_action_in_every_topic(self):
        catalog = build_catalog()
        for topic in range(1, 30):
            scenes = [s for s in catalog if s.topic == topic]
            self.assertEqual(len(scenes), 3)
            self.assertEqual(len({s.cue for s in scenes}), 3)
            preferred = {next(c.key for c in s.choices if c.rating == 2) for s in scenes}
            self.assertEqual(len(preferred), 3)
        self.assertTrue(any(c.rating == 1 for s in catalog for c in s.choices))

    def test_switches_crosses_and_rebounds_show_the_correct_ball_direction(self):
        for scene in build_catalog():
            if scene.topic == 14:
                self.assertGreater(scene.ball_from[0], 65)
                self.assertLess(scene.ball[0], 30)
            if scene.topic == 17:
                best = next(c for c in scene.choices if c.rating == 2)
                self.assertGreater(scene.ball_from[0], 65)
                self.assertLess(best.ball_end[0], 45)
            if scene.topic == 18:
                self.assertGreater(scene.ball_from[1], scene.ball[1])

    def test_catalog_geometry_and_animation_endpoints(self):
        for scene in build_catalog():
            scene.validate()
            start, ball = positions(scene, "observe", 0, None)
            self.assertEqual(ball, scene.ball_from)
            self.assertEqual(start["john"], scene.john.approach)
            for i, choice in enumerate(scene.choices):
                for phase in ("outcome", "feedback"):
                    actors, ball = positions(scene, phase, 1, i)
                    self.assertEqual(actors["john"], choice.target)
                    self.assertEqual(ball, choice.ball_end)
                actors, ball = positions(scene, "decide", 0, None)
                self.assertEqual(actors["john"], scene.john.position)
                self.assertEqual(ball, scene.ball)
                self.assertIn(choice.rating, (0, 1, 2))

    def test_transfer_layouts_preserve_angles_to_our_goal(self):
        for scene in build_catalog():
            for scale in (.8, .92, .96, 1.02, 1.05):
                shifted = transfer_scene(scene, scale)
                shifted.validate()
                self.assertTrue(shifted.transfer)
                self.assertNotEqual(shifted.id, scene.id)
                self.assertAlmostEqual(shifted.ball[0] - 50, (scene.ball[0] - 50) * scale)
                self.assertEqual([c.rating for c in shifted.choices], [c.rating for c in scene.choices])
        for scale in (.2, 2, float("nan")):
            with self.assertRaises(ValueError):
                transfer_scene(build_catalog()[0], scale)

    def test_invalid_scenarios_fail_closed(self):
        scene = build_catalog()[0]
        invalid = [replace(scene, id=""), replace(scene, topic=30), replace(scene, stage=7),
                   replace(scene, actors=()), replace(scene, actors=scene.actors * 2),
                   replace(scene, choices=()), replace(scene, choices=(scene.choices[0],) * 3),
                   replace(scene, ball=(float("nan"), 5)), replace(scene, ball=(-1, 10)),
                   replace(scene, topic=0), replace(scene, ball=(5, float("nan"))),
                   replace(scene, ball=(5, 101)), replace(scene, ball=(101, 5)),
                   replace(scene, ball=(5, -1)),
                   replace(scene, actors=(replace(scene.john, team="unknown"),)),
                   replace(scene, choices=tuple(replace(c, rating=0) for c in scene.choices))]
        for field in ({"rating": 3}, {"explanation": ""}, {"outcome": ""}):
            choices = list(scene.choices)
            choices[1] = replace(choices[1], **field)
            invalid.append(replace(scene, choices=tuple(choices)))
        for item in invalid:
            with self.subTest(scene=item), self.assertRaises(ValueError):
                item.validate()

    def test_john_lookup_handles_actor_order_and_rejects_missing_player(self):
        scene = build_catalog()[0]
        reordered = replace(scene, actors=tuple(reversed(scene.actors)))
        self.assertEqual(reordered.john, scene.john)
        with self.assertRaises(StopIteration):
            _ = replace(scene, actors=()).john
        actors, ball = positions(scene, "outcome", .5, None)
        self.assertEqual(actors["john"], scene.john.position)
        self.assertEqual(ball, scene.ball)

    def test_interpolation_and_clamping_invariants(self):
        for x in range(-10, 111, 10):
            for y in range(-10, 111, 10):
                point = bounded((x, y))
                self.assertTrue(4 <= point[0] <= 96 and 5 <= point[1] <= 94)
                self.assertEqual(lerp(point, (50, 96), -1), point)
                self.assertEqual(lerp(point, (50, 96), 2), (50, 96))


if __name__ == "__main__":
    unittest.main()
