"""Model geometry, validation, and transfer-layout invariants."""

import unittest
from dataclasses import replace

from soccer_strategy.soccer_smart.model import (
    Actor,
    Choice,
    PracticeCard,
    Scenario,
    bounded,
    lerp,
    transfer_scene,
)


def sample_scene(shot_window: tuple[float, float] | None = None) -> Scenario:
    actors = (
        Actor("john", "JOHN", "home", (40.0, 58.0), (40.0, 60.0), (40.0, 58.0)),
        Actor("back", "BACK", "home", (45.0, 72.0), (45.0, 72.0), (45.0, 72.0)),
        Actor("a", "A", "away", (50.0, 55.0), (53.0, 56.0), (50.0, 55.0)),
    )
    choices = (
        Choice("A", "Touch left, away from A.", (34.0, 54.0), 2,
               "Use the open left space. Keep the touch close and look up again.",
               "John and ball move to open left space.", (34.0, 54.0), "dribble"),
        Choice("B", "Touch right toward A.", (48.0, 55.0), 0,
               "That touch moves the ball toward A. The first touch can make the next action harder.",
               "Ball goes toward A.", (48.0, 55.0), "dribble"),
        Choice("C", "Pass back to BACK's feet.", (39.0, 60.0), 1,
               "A return is available too. Check BACK's next touch and stay ready to help.",
               "Ball returns to BACK.", (45.0, 72.0), "pass"),
    )
    return Scenario(
        id="T01.A",
        topic=1,
        variant="A",
        title="First touch away from pressure",
        stage=1,
        role="left defender",
        groups=("G01", "G08", "G09"),
        focus="Scan pressure before your first touch.",
        cue="A closes from your right. BACK stays behind you.",
        actors=actors,
        ball=(40.0, 57.0),
        ball_from=(45.0, 72.0),
        choices=choices,
        rules="Open play: attack upward toward (50, 0).",
        coach_note="A controlled left touch keeps space away from A.",
        shot_window=shot_window,
    )


class ModelTests(unittest.TestCase):
    def test_bounded_and_lerp_clamp_coordinates(self) -> None:
        self.assertEqual(bounded((-5.0, 120.0)), (4.0, 97.0))
        self.assertEqual(bounded((120.0, -5.0)), (96.0, 3.0))
        self.assertEqual(lerp((10.0, 20.0), (30.0, 60.0), 0.5), (20.0, 40.0))
        self.assertEqual(lerp((10.0, 20.0), (30.0, 60.0), -2.0), (10.0, 20.0))
        self.assertEqual(lerp((10.0, 20.0), (30.0, 60.0), 5.0), (30.0, 60.0))

    def test_valid_scenario_and_transfer_preserve_base_id_and_angles(self) -> None:
        scene = sample_scene()
        scene.validate()
        self.assertEqual(scene.base_id, "T01.A")
        self.assertEqual(scene.john.key, "john")
        reordered = replace(scene, actors=tuple(reversed(scene.actors)))
        self.assertEqual(reordered.john, scene.john)
        with self.assertRaises(StopIteration):
            _ = replace(scene, actors=()).john
        shifted = transfer_scene(scene, 0.92)
        shifted.validate()
        self.assertTrue(shifted.transfer)
        self.assertEqual(shifted.base_id, "T01.A")
        self.assertNotEqual(shifted.id, scene.id)
        self.assertAlmostEqual(shifted.ball[0] - 50.0, (scene.ball[0] - 50.0) * 0.92)
        shot_scene = sample_scene(shot_window=(42.0, 0.0))
        shot_scene.validate()
        shifted_shot = transfer_scene(shot_scene, 0.95)
        shifted_shot.validate()
        assert shifted_shot.shot_window is not None
        self.assertEqual(shifted_shot.shot_window[1], 0.0)

    def test_invalid_scenarios_and_transfer_scales_raise_value_error(self) -> None:
        scene = sample_scene()
        long_label = replace(scene.choices[1], label=" ".join(["word"] * 13))
        long_reason = replace(scene.choices[1], explanation=" ".join(["word"] * 25))
        bad_cases = [
            replace(scene, id=""),
            replace(scene, topic=0),
            replace(scene, topic=13),
            replace(scene, variant="D"),
            replace(scene, stage=5),
            replace(scene, role=""),
            replace(scene, groups=()),
            replace(scene, groups=("G99",)),
            replace(scene, provenance="COPIED"),
            replace(scene, cue=""),
            replace(scene, cue=" ".join(["word"] * 25)),
            replace(scene, actors=()),
            replace(scene, actors=scene.actors * 2),
            replace(scene, actors=(replace(scene.john, team="alien"),)),
            replace(scene, choices=scene.choices[:2]),
            replace(scene, choices=(scene.choices[0], scene.choices[0], scene.choices[1])),
            replace(scene, choices=tuple(replace(c, rating=1) for c in scene.choices)),
            replace(scene, choices=(scene.choices[0], long_label, scene.choices[2])),
            replace(scene, choices=(scene.choices[0], long_reason, scene.choices[2])),
            replace(scene, choices=(scene.choices[0], replace(scene.choices[1], label=""), scene.choices[2])),
            replace(scene, choices=(scene.choices[0], replace(scene.choices[1], explanation=""), scene.choices[2])),
            replace(scene, choices=(scene.choices[0], replace(scene.choices[1], rating=3), scene.choices[2])),
            replace(scene, choices=(scene.choices[0], replace(scene.choices[1], outcome=""), scene.choices[2])),
            replace(scene, choices=(scene.choices[0], replace(scene.choices[1], action_kind="fly"), scene.choices[2])),
            replace(scene, shot_window=(20.0, 0.0)),
            replace(scene, shot_window=(80.0, 0.0)),
            replace(scene, shot_window=(45.0, 10.0)),
            replace(scene, ball=(-1.0, 50.0)),
            replace(scene, ball=(101.0, 50.0)),
            replace(scene, ball=(50.0, -1.0)),
            replace(scene, ball=(50.0, 101.0)),
            replace(scene, ball=(float("nan"), 50.0)),
            replace(scene, ball=(50.0, float("nan"))),
        ]
        for bad in bad_cases:
            with self.subTest(bad=bad), self.assertRaises(ValueError):
                bad.validate()
        for scale in (0.5, 1.5, float("nan")):
            with self.assertRaises(ValueError):
                transfer_scene(scene, scale)

    def test_practice_card_validation(self) -> None:
        scene = sample_scene()
        card = PracticeCard(
            id="card-1",
            title="Touch and look",
            groups=("G01",),
            summary="Take a small touch away from the cone and look up.",
            adult_prompt="Roll the ball gently to either foot and ask what is ahead.",
            actors=(scene.john,),
            ball_start=(45.0, 62.0),
            ball_end=(38.0, 56.0),
        )
        card.validate()
        for bad in (
            replace(card, id=""),
            replace(card, groups=()),
            replace(card, groups=("G99",)),
            replace(card, provenance="BOOK"),
            replace(card, actors=()),
            replace(card, ball_start=(-5.0, 50.0)),
        ):
            with self.assertRaises(ValueError):
                bad.validate()


if __name__ == "__main__":
    unittest.main()
