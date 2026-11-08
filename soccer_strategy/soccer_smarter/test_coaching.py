"""Case-level checks: route geometry supports the lesson and the rating."""

from dataclasses import replace
from math import hypot
import unittest

from soccer_strategy.soccer_smarter.content import episodes
from soccer_strategy.soccer_smarter.model import Track
from soccer_strategy.soccer_smarter.session import Session


def distance(a, b):
    return hypot(a[0] - b[0], a[1] - b[1])


def lane_distance(start, end, point):
    return min(distance(Track("linear", (start, end)).sample(i / 200), point) for i in range(201))


def choice(node, key):
    return next(c for c in node.choices if c.key == key)


class CoachingTests(unittest.TestCase):
    def test_safe_pass_is_also_good_and_turn_really_meets_new_forward_pressure(self):
        a, b = episodes()[:2]
        self.assertEqual(choice(a.nodes[0], "back").rating, 2)
        self.assertEqual(choice(a.nodes[0], "turn").rating, 2)
        for episode in (a, b):
            node = episode.node("adapt")
            ahead = (node.state.ball[0], node.state.ball[1] - 14)
            self.assertLess(lane_distance(node.state.ball, ahead, node.state.positions()["second"]), .1)
            safe = choice(node, "outlet")
            self.assertEqual(safe.rating, 2)
        self.assertIn("BACK", b.node("adapt").cue)

    def test_restart_return_lane_is_blocked_and_a_new_angle_really_opens_it(self):
        episode = episodes()[4]
        root, node = episode.nodes
        self.assertLess(root.state.ball[1], 23)
        self.assertEqual(root.shot_window, (44., 0.))
        positions = node.state.positions()
        self.assertLess(lane_distance(node.state.ball, positions["john"], positions["block"]), .1)
        self.assertEqual(choice(node, "stay").rating, 0)
        improved = choice(node, "angle").motion.frame(node.state, 1)[0]["john"]
        self.assertGreater(lane_distance(node.state.ball, improved, positions["block"]), 3)

    def test_rebuilding_changes_the_wide_passing_lane(self):
        episode = episodes()[5]
        root, node = episode.nodes
        blocker = root.state.positions()["block"]
        receiver = root.state.positions()["rw"]
        self.assertLess(lane_distance(root.state.ball, receiver, blocker), .1)
        self.assertGreater(lane_distance(node.state.ball, receiver, blocker), 3)
        self.assertEqual(choice(node, "wide").rating, 2)
        self.assertEqual(choice(node, "carry").rating, 2)

    def test_close_layoff_is_workable_rather_than_automatically_wrong(self):
        node = episodes()[4].node("adapt")
        close = choice(node, "crowd")
        endpoint = close.motion.frame(node.state, 1)[0]["john"]
        self.assertGreater(lane_distance(node.state.ball, endpoint, node.state.positions()["block"]), 3)
        self.assertGreater(distance(endpoint, node.state.ball), 4, "Layoff support should leave distinct diagram positions")
        self.assertEqual(close.rating, 1)

    def test_coach_respects_an_already_good_safe_pass(self):
        session = Session("M01")
        self.assertEqual(session.coach_choice.rating, 2)
        session.skip()
        session.choose(1)
        session.skip()
        session.compare_coach()
        self.assertEqual(session.active_choice.key, "back")

    def test_prediction_allows_wide_carry_when_defender_stays_central(self):
        a, b = episodes()[6:8]
        for episode, good in ((a, False), (b, True)):
            node = episode.node("adapt")
            carry = choice(node, "carry")
            self.assertEqual(carry.rating, 2 if good else 0)
            route = carry.preview(node.state)
            defender = node.state.positions()["block"]
            clearance = min(distance(route.sample(i / 200), defender) for i in range(201))
            self.assertGreater(clearance, 3) if good else self.assertLess(clearance, .1)

    def test_speed_dribble_penalty_box_finish_and_defender_press_break_contrasts(self):
        speed_a, speed_b, box_a, box_b, press_a, press_b = episodes()[8:14]
        self.assertEqual(choice(speed_a.nodes[0], "surge").rating, 2)
        self.assertEqual(choice(speed_a.node("adapt"), "feed").rating, 2)
        self.assertEqual(choice(speed_b.nodes[0], "surge").rating, 0)
        self.assertEqual(choice(speed_b.nodes[0], "pass_m").rating, 2)
        self.assertEqual(choice(speed_b.node("adapt"), "overlap").rating, 2)
        for ep in (box_a, box_b):
            self.assertEqual(ep.nodes[0].role, "forward")
            self.assertLessEqual(ep.node("adapt").state.ball[1], 18)
            self.assertEqual(ep.node("adapt").shot_window, (44., 0.))
        self.assertEqual(choice(box_a.nodes[0], "spot").rating, 2)
        self.assertEqual(choice(box_a.node("adapt"), "shoot").rating, 2)
        self.assertEqual(choice(box_b.nodes[0], "pocket").rating, 2)
        self.assertEqual(choice(box_b.node("adapt"), "shoot").rating, 0)
        self.assertEqual(choice(box_b.node("adapt"), "square").rating, 2)
        self.assertEqual(press_a.nodes[0].role, "defender")
        self.assertEqual(choice(press_a.nodes[0], "split").rating, 2)
        self.assertEqual(choice(press_a.node("adapt"), "combine").rating, 2)
        self.assertEqual(choice(press_a.node("adapt"), "bounce").rating, 2)
        self.assertEqual(choice(press_b.nodes[0], "wide").rating, 2)
        self.assertEqual(choice(press_b.node("adapt"), "drive").rating, 2)

    def test_intended_passes_end_at_receivers_not_at_interception_points(self):
        for index, key, receiver in ((2, "straight", "cm"), (3, "curve", "cm"), (5, "short", "rw")):
            root = episodes()[index].nodes[0]
            action = choice(root, key)
            self.assertEqual(action.preview(root.state).sample(1), root.state.positions()[receiver])
            self.assertNotEqual(action.motion.ball.sample(1), action.preview(root.state).sample(1))
        root = episodes()[4].nodes[0]
        self.assertEqual(choice(root, "shot").preview(root.state).sample(1), root.shot_window)

    def test_every_positive_ball_route_has_clearance_and_a_real_destination(self):
        for episode in episodes():
            for node in episode.nodes:
                for action in node.choices:
                    if action.rating == 0:
                        continue
                    actors, end = action.motion.frame(node.state, 1)
                    targets = [actors[a.key] for a in node.state.actors if a.team == "home"]
                    if node.shot_window is not None:
                        targets.append(node.shot_window)
                    self.assertLess(min(distance(end, target) for target in targets), .01, (episode.id, node.id, action.key))
                    for i in range(101):
                        positions, ball = action.motion.frame(node.state, i / 100)
                        for actor in node.state.actors:
                            if actor.team in ("away", "keeper"):
                                self.assertGreater(distance(ball, positions[actor.key]), 2., (episode.id, node.id, action.key, i))

    def test_interceptions_follow_prefixes_of_the_intended_route(self):
        for episode in episodes():
            for node in episode.nodes:
                for action in node.choices:
                    if action.intent is None:
                        continue
                    intended = replace(action.intent, contact=0)
                    actual = replace(action.motion.route(node.state), contact=0)
                    stop = min(range(1001), key=lambda i: distance(intended.sample(i / 1000), actual.sample(1))) / 1000
                    for i in range(21):
                        self.assertLess(distance(actual.sample(i / 20), intended.sample(i / 20 * stop)), .02,
                                        (episode.id, node.id, action.key))

    def test_passer_releases_the_ball_before_running_to_support(self):
        root = episodes()[1].nodes[0]
        back = choice(root, "back")
        for t in (0, .1, .25):
            self.assertEqual(back.motion.frame(root.state, t)[0]["john"], root.state.positions()["john"])
        self.assertNotEqual(back.motion.frame(root.state, .5)[0]["john"], root.state.positions()["john"])

    def test_off_ball_previews_belong_to_the_controlled_player(self):
        for episode, node_id, key in ((episodes()[6], "root", "wide"),
                                      (episodes()[4], "adapt", "stay")):
            node = episode.node(node_id)
            action = choice(node, key)
            route = action.preview(node.state)
            self.assertEqual(route.sample(0), node.state.positions()[node.state.control])
            self.assertEqual(route.sample(1), action.motion.frame(node.state, 1)[0][node.state.control])

    def test_unavailable_off_ball_options_are_actually_screened(self):
        for episode, node_id, key in ((episodes()[4], "adapt", "stay"),
                                      (episodes()[6], "root", "hide"), (episodes()[7], "root", "hide"),
                                      (episodes()[10], "root", "pocket"), (episodes()[11], "root", "spot")):
            node = episode.node(node_id)
            action = choice(node, key)
            people, ball = action.motion.frame(node.state, 1)
            self.assertLess(lane_distance(ball, people[node.state.control], people["block"]), 2)
            self.assertEqual(action.rating, 0)

    def test_risky_ball_routes_end_at_real_blockers_and_safe_dribbles_stay_close(self):
        for episode in episodes():
            for node in episode.nodes:
                for action in node.choices:
                    actors, ball = action.motion.frame(node.state, 1)
                    if action.rating == 0 and ball != node.state.ball:
                        opponents = [actors[a.key] for a in node.state.actors if a.team != "home"]
                        self.assertLess(min(distance(ball, p) for p in opponents), .01, (episode.id, node.id, action.key))
                    dribble = (action.rating > 0 and node.state.ball == node.state.positions()[node.state.control]
                               and node.state.control in dict(action.motion.actors)
                               and ball == actors[node.state.control])
                    if dribble:
                        for i in range(21):
                            positions, ball = action.motion.frame(node.state, i / 20)
                            self.assertLess(distance(positions[node.state.control], ball), 1.5,
                                            (episode.id, node.id, action.key))


if __name__ == "__main__":
    unittest.main()
