"""Football geometry and coaching invariants across all 36 scenes."""

import unittest
from math import dist

from soccer_strategy.soccer_smart.catalog import build_catalog


class CoachingTests(unittest.TestCase):
    def test_twelve_worked_a_examples_match_scenarios_specification(self) -> None:
        by_id = {scene.id: scene for scene in build_catalog()}
        self.assertEqual(by_id["T01.A"].john.position, (40.0, 58.0))
        self.assertEqual(by_id["T01.A"].ball, (40.0, 57.0))
        self.assertEqual(by_id["T02.A"].john.position, (48.0, 53.0))
        self.assertEqual(by_id["T03.A"].john.position, (50.0, 57.0))
        self.assertEqual(by_id["T04.A"].john.position, (28.0, 74.0))
        self.assertEqual(by_id["T05.A"].john.position, (48.0, 54.0))
        self.assertEqual(by_id["T06.A"].john.position, (28.0, 56.0))
        self.assertEqual(by_id["T07.A"].john.position, (18.0, 44.0))
        self.assertEqual(by_id["T08.A"].john.position, (43.0, 57.0))
        self.assertEqual(by_id["T09.A"].john.position, (43.0, 17.0))
        self.assertEqual(by_id["T09.A"].shot_window, (42.0, 0.0))
        self.assertEqual(by_id["T10.A"].john.position, (35.0, 72.0))
        self.assertEqual(by_id["T11.A"].john.position, (42.0, 74.0))
        self.assertEqual(by_id["T12.A"].john.position, (40.0, 72.0))

    def test_multiple_outfield_roles_and_independent_choice_reasons(self) -> None:
        catalog = build_catalog()
        roles = {scene.role for scene in catalog}
        self.assertTrue({"left defender", "central midfielder", "midfielder",
                         "supporting midfielder", "left winger", "forward",
                         "defender", "covering defender"} <= roles)
        for scene in catalog:
            explanations = [c.explanation for c in scene.choices]
            self.assertEqual(len(set(explanations)), 3, scene.id)
            labels = [c.label for c in scene.choices]
            self.assertEqual(len(set(labels)), 3, scene.id)

    def test_loose_ball_and_interception_distances_support_grades(self) -> None:
        by_id = {scene.id: scene for scene in build_catalog()}
        t10b = by_id["T10.B"]
        attacker_10b = next(a for a in t10b.actors if a.key == "a")
        self.assertLess(dist(t10b.john.position, t10b.ball), dist(attacker_10b.position, t10b.ball))
        t12a = by_id["T12.A"]
        attacker_12a = next(a for a in t12a.actors if a.key == "a")
        self.assertLess(dist(t12a.john.position, t12a.ball), dist(attacker_12a.position, t12a.ball))


if __name__ == "__main__":
    unittest.main()
