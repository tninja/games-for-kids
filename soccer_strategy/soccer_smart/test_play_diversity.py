"""Diversity means different decisions and continuations, not translated layouts."""

import unittest

from soccer_strategy.soccer_smart.play_content import build_plays


class PlayDiversityTests(unittest.TestCase):
    def test_each_family_has_its_own_opening_decisions(self):
        plays = build_plays()
        recipes = {tuple(c.key for c in p.nodes[0].scene.choices) for p in plays if p.id.endswith('A')}
        self.assertEqual(len(recipes),8)

    def test_good_followups_have_at_least_eight_different_decision_recipes(self):
        recipes = set()
        for play in build_plays():
            root = play.nodes[0]
            for choice in root.scene.choices:
                if choice.rating == 2:
                    target = dict(root.exits)[choice.key]
                    node = play.node(target)
                    recipes.add(tuple(c.key for c in node.scene.choices))
        self.assertGreaterEqual(len(recipes),8)

    def test_repertoire_contains_actual_keeper_throw_cross_combination_and_clearance(self):
        scenes = [n.scene for p in build_plays() for n in p.nodes]
        keys = {c.key for s in scenes for c in s.choices}
        self.assertTrue({'recycle','switch','layoff','shield','overlap','cross','cutback',
                         'throw_m','throw_n','combine','counter','track'} <= keys)
        self.assertTrue(any(c.action_kind=='clear' and c.loft>0 for s in scenes for c in s.choices))
        self.assertTrue(any(c.ball_via is not None for s in scenes for c in s.choices))
        throw = next(p for p in build_plays() if p.id=='P05.A').nodes[0].scene
        self.assertEqual(throw.john.position[0],0)
        self.assertTrue(all(c.loft>0 for c in throw.choices if c.key.startswith('throw_')))

    def test_good_second_step_alternatives_have_their_own_continuations(self):
        play = next(p for p in build_plays() if p.id=='P01.C')
        root = play.nodes[0]
        recycled = play.node(dict(root.exits)['recycle'])
        exits = [dict(recycled.exits)[c.key] for c in recycled.scene.choices if c.rating==2]
        self.assertGreaterEqual(len(exits),2)
        self.assertNotIn(None,exits)
        self.assertEqual(len(set(exits)),len(exits))

    def test_transition_variants_start_from_different_possession_situations(self):
        from soccer_strategy.soccer_smart.play_content import owner
        scenes = {p.id:p.nodes[0].scene for p in build_plays() if p.family==8}
        self.assertIsNone(owner(scenes['P08.A'].actors,scenes['P08.A'].ball))
        self.assertEqual(owner(scenes['P08.B'].actors,scenes['P08.B'].ball).key,'john')
        self.assertEqual(owner(scenes['P08.C'].actors,scenes['P08.C'].ball).key,'m')

    def test_releasing_actions_are_made_by_the_controlled_player(self):
        from soccer_strategy.soccer_smart.play_content import owner
        for play in build_plays():
            for node in play.nodes:
                for choice in node.scene.choices:
                    if choice.rating==2 and choice.action_kind in ('pass','clear','shoot','dribble','shield'):
                        holder = owner(node.scene.actors,node.scene.ball)
                        self.assertIsNotNone(holder,node.scene.id)
                        self.assertEqual(holder.key,'john',(node.scene.id,choice.key))

    def test_waiting_is_good_when_both_wide_delivery_zones_are_covered(self):
        from soccer_strategy.soccer_smart.play_patterns import team,wing_runs
        people = team((20.,45.),(40.,34.),(12.,28.),(38.,20.),(24.,38.))
        _,_,choices = wing_runs(people,(12.,28.))
        self.assertEqual([c.rating for c in choices],[0,0,2])
        self.assertTrue(all(c.ball_end==(12.,28.) for c in choices))

    def test_one_two_run_goes_around_the_defender(self):
        from math import dist
        from soccer_strategy.soccer_smart.presentation import positions
        count = 0
        for play in build_plays():
            scene = play.nodes[0].scene
            for index,choice in enumerate(scene.choices):
                if choice.key=='combine' and choice.rating==2:
                    count += 1
                    for t in (.25,.4,.6,.8,1):
                        people,_ = positions(scene,'outcome',t,index)
                        self.assertGreaterEqual(min(dist(people['john'],people[a.key]) for a in scene.actors if a.team=='away'),2)
        self.assertGreater(count,0)

    def test_followup_cues_name_the_actual_receiver(self):
        from soccer_strategy.soccer_smart.play_content import owner
        plays = {p.id:p for p in build_plays()}
        counter = plays['P08.B']
        next_node = counter.node(dict(counter.nodes[0].exits)['counter'])
        self.assertEqual(owner(next_node.scene.actors,next_node.scene.ball).key,'n')
        self.assertIn('N has',next_node.scene.cue)
        crossing = plays['P07.A']
        secured = crossing.node(dict(crossing.nodes[0].exits)['step'])
        support = crossing.node(dict(secured.exits)['clear'])
        self.assertEqual(owner(support.scene.actors,support.scene.ball).key,'n')
        self.assertIn('N has',support.scene.cue)

    def test_named_switches_and_cutbacks_match_their_directions(self):
        for play in build_plays():
            for node in play.nodes:
                for choice in node.scene.choices:
                    if choice.rating!=2:
                        continue
                    if choice.key=='switch':
                        self.assertLessEqual((node.scene.ball[0]-50)*(choice.ball_end[0]-50),0,node.scene.id)
                    if choice.label.startswith('Cut back'):
                        self.assertGreater(choice.ball_end[1],node.scene.ball[1],node.scene.id)


if __name__ == '__main__':
    unittest.main()
