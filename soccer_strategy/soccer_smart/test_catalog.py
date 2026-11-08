"""Catalog completeness, variant contrast, and animation timing tests."""

import unittest
from dataclasses import replace

from soccer_strategy.soccer_smart.catalog import build_catalog, build_practice_cards
from soccer_strategy.soccer_smart.curriculum import SECTIONS, section_for_topic
from soccer_strategy.soccer_smart.presentation import (
    CONTACT_FRACTION,
    card_positions,
    outgoing_fraction,
    positions,
    route_destination,
)


class CatalogTests(unittest.TestCase):
    def test_catalog_contains_thirty_six_valid_scenes_and_seven_cards(self) -> None:
        catalog = build_catalog()
        self.assertEqual(len(catalog), 36)
        expected_ids = [f"T{topic:02d}.{variant}" for topic in range(1, 13) for variant in ("A", "B", "C")]
        self.assertEqual([s.id for s in catalog], expected_ids)
        for scene in catalog:
            scene.validate()
            self.assertEqual(scene.stage, section_for_topic(scene.topic))
        for section in SECTIONS:
            self.assertEqual({s.topic for s in catalog if s.stage == section.id}, set(section.topics))
        cards = build_practice_cards()
        self.assertEqual(len(cards), 7)
        for card in cards:
            card.validate()

    def test_context_changes_decision_across_topic_variants(self) -> None:
        catalog = build_catalog()
        for topic in range(1, 13):
            variants = [s for s in catalog if s.topic == topic]
            self.assertEqual(len(variants), 3)
            self.assertEqual(len({s.cue for s in variants}), 3)
            best_routes = {
                route_destination(next(c for c in s.choices if c.rating == 2))
                for s in variants
            }
            self.assertGreaterEqual(len(best_routes), 2, f"Topic {topic} did not vary best routes")

    def test_paths_match_intent_and_contact_timing(self) -> None:
        self.assertEqual(outgoing_fraction(0.1), 0.0)
        self.assertEqual(outgoing_fraction(1.0), 1.0)
        for scene in build_catalog():
            obs_start, ball_start = positions(scene, "observe", 0.0, None)
            self.assertEqual(obs_start["john"], scene.john.approach)
            self.assertEqual(ball_start, scene.ball_from)
            obs_end, ball_end = positions(scene, "observe", 1.0, None)
            self.assertEqual(obs_end["john"], scene.john.position)
            self.assertEqual(ball_end, scene.ball)
            decide_actors, decide_ball = positions(scene, "decide", 0.5, None)
            self.assertEqual(decide_actors["john"], scene.john.position)
            self.assertEqual(decide_ball, scene.ball)
            for idx, choice in enumerate(scene.choices):
                if choice.action_kind in ("pass", "shoot", "clear"):
                    self.assertEqual(route_destination(choice), choice.ball_end)
                    _, early_ball = positions(scene, "outcome", CONTACT_FRACTION * 0.5, idx)
                    self.assertEqual(early_ball, scene.ball)
                else:
                    self.assertEqual(route_destination(choice), choice.target)
                for phase in ("outcome", "feedback"):
                    end_actors, final_ball = positions(scene, phase, 1.0, idx)
                    self.assertEqual(end_actors["john"], choice.target)
                    self.assertEqual(final_ball, choice.ball_end)
                    for actor in scene.actors:
                        if actor.key != "john":
                            self.assertEqual(end_actors[actor.key], actor.position)
            best = next(c for c in scene.choices if c.rating == 2)
            coach_actors, coach_ball = positions(scene, "coach", 1.0, 0)
            self.assertEqual(coach_actors["john"], best.target)
            self.assertEqual(coach_ball, best.ball_end)
            unselected_actors, unselected_ball = positions(scene, "outcome", 0.5, None)
            self.assertEqual(unselected_actors["john"], scene.john.position)
            self.assertEqual(unselected_ball, scene.ball)
        first = build_catalog()[0]
        corrupt = replace(first, choices=tuple(replace(c, rating=0) for c in first.choices))
        with self.assertRaises(StopIteration):
            positions(corrupt, "coach", 0.5, None)

    def test_practice_card_animation_endpoints(self) -> None:
        for card in build_practice_cards():
            start_actors, start_ball = card_positions(card, 0.0)
            end_actors, end_ball = card_positions(card, 1.0)
            self.assertEqual(start_ball, card.ball_start)
            self.assertEqual(end_ball, card.ball_end)
            self.assertEqual(start_actors["john"], card.actors[0].approach)
            self.assertEqual(end_actors["john"], card.actors[0].run_to)


if __name__ == "__main__":
    unittest.main()
