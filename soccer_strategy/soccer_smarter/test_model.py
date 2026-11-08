"""Geometry properties and graph invariants, independent of Pygame."""

from dataclasses import replace
from math import hypot
import unittest

from soccer_strategy.soccer_smarter.content import episodes
from soccer_strategy.soccer_smarter.model import Actor, Motion, State, Track


class ModelTests(unittest.TestCase):
    def test_tracks_clamp_hold_contact_and_preserve_endpoints(self):
        tracks = (Track("linear", ((10., 20.), (70., 80.)), .25),
                  Track("corner", ((10., 20.), (10., 40.), (70., 40.))),
                  Track("curve", ((30., 55.), (30., 22.), (65., 30.))))
        for track in tracks:
            track.validate()
            self.assertEqual(track.sample(-1), track.points[0])
            self.assertEqual(track.sample(2), track.points[-1])
            for i in range(101):
                x, y = track.sample(i / 100)
                self.assertTrue(0 <= x <= 100 and 0 <= y <= 100)
        self.assertEqual(tracks[0].sample(.25), (10., 20.))
        self.assertEqual(tracks[1].sample(.5), (10., 40.))
        self.assertEqual(tracks[2].sample(.5), (38.75, 32.25))

    def test_invalid_tracks_and_snapshots_fail_closed(self):
        for track in (Track("bad", ((1., 1.), (2., 2.))),
                      Track("linear", ((1., 1.),)),
                      Track("curve", ((1., 1.), (2., 2.))),
                      Track("linear", ((-1., 1.), (2., 2.))),
                      Track("linear", ((float('nan'), 1.), (2., 2.))),
                      Track("linear", ((1., 1.), (2., 2.)), 1)):
            with self.assertRaises(ValueError):
                track.validate()
        with self.assertRaises(ValueError):
            Track("linear", ((1., 1.), (2., 2.))).sample(float('nan'))
        for state in (State((), (1., 1.), "john"),
                      State((Actor("john", "JOHN", "bad", (1., 1.)),), (1., 1.), "john")):
            with self.assertRaises(ValueError):
                state.validate()

    def test_catalog_has_eight_original_contrasts_with_continuous_graphs(self):
        catalog = episodes()
        self.assertEqual([e.id for e in catalog], [f'M0{i}.{c}' for i in range(1, 8) for c in 'AB'])
        roles = {node.role for episode in catalog for node in episode.nodes}
        self.assertTrue({"defender", "midfielder", "winger", "forward"}.issubset(roles))
        for episode in catalog:
            episode.validate()
            self.assertEqual(episode.provenance, "ORIGINAL")
            self.assertEqual(episode.review_status, "BOOK_BODY_PENDING")
            for node in episode.nodes:
                self.assertEqual(len(node.choices), 3)
                for choice in node.choices:
                    actors, ball = choice.motion.frame(node.state, 1)
                    if choice.next_node:
                        successor = episode.node(choice.next_node)
                        self.assertEqual(ball, successor.state.ball)
                        self.assertEqual(actors, successor.state.positions())
                    for t in (0, .2, .5, .9, 1):
                        self.assertIn(choice.motion.route(node.state).sample(t),
                                      [ball, choice.motion.ball.sample(t),
                                       *choice.motion.frame(node.state, t)[0].values()])

    def test_contrast_changes_best_action_and_blocker_really_blocks_route(self):
        catalog = episodes()
        for i in (0, 2, 4, 8, 10, 12):
            best = [max(e.nodes[0].choices, key=lambda c: c.rating).key for e in catalog[i:i+2]]
            self.assertNotEqual(best[0], best[1])
        a, b = catalog[2:4]
        for episode, key in ((a, "straight"), (b, "curve")):
            root = episode.nodes[0]
            track = next(c.motion.ball for c in root.choices if c.key == key)
            blocker = root.state.positions()["block"]
            distance = min(hypot(track.sample(i / 100)[0] - blocker[0],
                                 track.sample(i / 100)[1] - blocker[1]) for i in range(101))
            self.assertLess(distance, 1)

    def test_graph_rejects_unknown_destination_and_teleportation(self):
        episode = episodes()[0]
        root = episode.nodes[0]
        for choice in (replace(root.choices[0], next_node="missing"),
                       replace(root.choices[0], motion=root.choices[1].motion)):
            corrupt = replace(episode, nodes=(replace(root, choices=(choice, *root.choices[1:])),
                                              *episode.nodes[1:]))
            with self.assertRaises(ValueError):
                corrupt.validate()

    def test_blocked_curve_stops_at_blocker_and_turn_outlet_reaches_teammate(self):
        catalog = episodes()
        root = catalog[3].nodes[0]
        curve = next(c for c in root.choices if c.key == "curve")
        self.assertEqual(curve.motion.frame(root.state, 1)[1], root.state.positions()["block"])
        for episode in catalog[:2]:
            node = episode.node("adapt")
            safe = node.choices[0]
            receiver = "john" if episode.id.endswith("B") else "back"
            self.assertEqual(safe.motion.ball.sample(1), node.state.positions()[receiver])

    def test_snapshot_and_track_reject_bad_identity_geometry_and_timing(self):
        actor = Actor("john", "JOHN", "home", (10., 10.))
        states = (State((actor, actor), (1., 1.), "john"),
                  State((actor,), (101., 1.), "john"),
                  State((replace(actor, key=""),), (1., 1.), ""),
                  State((replace(actor, label=""),), (1., 1.), "john"),
                  State((replace(actor, position=(-1., 1.)),), (1., 1.), "john"))
        for state in states:
            with self.subTest(state=state), self.assertRaises(ValueError):
                state.validate()
        for track in (Track("linear", ((1., 1.), (2., 2.), (3., 3.))),
                      Track("corner", ((1., 1.), (2., 2.))),
                      Track("linear", ((1., 1.), (2., 2.)), -.1),
                      Track("linear", ((1., 1.), (2., 2.)), float('nan'))):
            with self.subTest(track=track), self.assertRaises(ValueError):
                track.validate()

    def test_point_must_have_exactly_two_coordinates(self):
        actor = Actor("john", "JOHN", "home", (10., 10.))
        for point in ((), (1., 2., 3.)):
            with self.assertRaises(ValueError):
                State((actor,), point, "john").validate()

    def test_choice_and_node_reject_ambiguous_ids_and_unreadable_copy(self):
        root = episodes()[0].nodes[0]
        choice = root.choices[0]
        for changes in ({"key": ""}, {"rating": 9}, {"label": ""}, {"label": "word " * 13},
                        {"feedback": ""}, {"feedback": "word " * 25}):
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                replace(choice, **changes).validate(root.state)
        for changes in ({"id": ""}, {"title": ""}, {"role": ""}, {"cue": ""}, {"cue": "word " * 25},
                        {"choices": root.choices[:2]}, {"choices": (choice, choice, root.choices[2])},
                        {"choices": tuple(replace(c, rating=0) for c in root.choices)}):
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                replace(root, **changes).validate()

    def test_motion_rejects_duplicates_bad_origins_and_nonpositive_duration(self):
        root = episodes()[0].nodes[0]
        motion = root.choices[0].motion
        track = motion.actors[0]
        wrong = Track("linear", ((0., 0.), (1., 1.)))
        cases = (replace(motion, duration=float('inf')), replace(motion, duration=0),
                 replace(motion, ball=wrong), replace(motion, actors=(track, track)),
                 replace(motion, actors=(("missing", wrong),)),
                 replace(motion, actors=(("john", wrong),)))
        for bad in cases:
            with self.subTest(motion=bad), self.assertRaises(ValueError):
                bad.validate(root.state)

    def test_episode_rejects_missing_provenance_cycles_and_unreachable_nodes(self):
        episode = episodes()[0]
        root = episode.nodes[0]
        for changes in ({"id": ""}, {"title": ""}, {"nodes": ()}, {"nodes": (root, root)},
                        {"provenance": "COPIED"}, {"source_status": "BODY_CHECKED"},
                        {"review_status": "BODY_CHECKED"}, {"prediction": True}):
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                replace(episode, **changes).validate()
        orphan = replace(episode.nodes[1], id="orphan")
        with self.assertRaisesRegex(ValueError, "Unreachable"):
            replace(episode, nodes=(*episode.nodes, orphan)).validate()
        still = Motion(Track("linear", (root.state.ball, root.state.ball)))
        cycle = replace(root.choices[0], motion=still, next_node="root")
        with self.assertRaisesRegex(ValueError, "cycle"):
            replace(episode, nodes=(replace(root, choices=(cycle, *root.choices[1:])),)).validate()
        duplicate_route = replace(root.choices[0], key="same_route", rating=1)
        diamond = replace(root, choices=(root.choices[0], duplicate_route, root.choices[2]))
        replace(episode, nodes=(diamond, *episode.nodes[1:])).validate()

    def test_intended_origin_and_goal_marker_must_match_the_picture(self):
        root = episodes()[4].nodes[0]
        shot = root.choices[2]
        with self.assertRaisesRegex(ValueError, "action origin"):
            replace(shot, intent=Track("linear", ((0., 0.), (44., 0.)))).validate(root.state)
        for point in ((float('nan'), 0.), (44., 1.), (40., 0.), (60., 0.)):
            with self.subTest(point=point), self.assertRaisesRegex(ValueError, "displayed attacking goal"):
                replace(root, shot_window=point).validate()


if __name__ == "__main__":
    unittest.main()
