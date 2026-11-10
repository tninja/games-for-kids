"""Executable Continuous Play contract and graph continuity invariants."""

import unittest
from dataclasses import replace

from soccer_strategy.soccer_smart.play_content import build_plays, clearance, continuation
from soccer_strategy.soccer_smart.presentation import positions
from soccer_strategy.soccer_smart.play_session import make_play_round
from soccer_strategy.soccer_smart.play_session import ContinuousSession


class PlayTests(unittest.TestCase):
    def test_catalog_and_contrasts(self):
        plays = build_plays()
        self.assertEqual(len(plays), 24)
        self.assertEqual(len({p.family for p in plays}), 8)
        for family in range(1, 9):
            group = [p for p in plays if p.family == family]
            self.assertEqual(len(group), 3)
            self.assertEqual(len({p.nodes[0].scene.cue for p in group}), 3)
            # Layouts change usable routes; they need not have a unique best answer.
            self.assertGreaterEqual(len({tuple(sorted(c.key for c in p.nodes[0].scene.choices if c.rating == 2))
                                         for p in group}), 2)
            for play in group:
                play.validate()

    def test_continuous_graph_all_paths_have_two_or_three_decisions(self):
        reached_lengths = set()
        for play in build_plays():
            pending = [(play.nodes[0], 1)]
            reached = set()
            while pending:
                node, depth = pending.pop()
                reached.add(node.scene.id)
                for index, choice in enumerate(node.scene.choices):
                    target = dict(node.exits)[choice.key]
                    if target is None:
                        self.assertIn(depth, (2,3))
                        reached_lengths.add(depth)
                    else:
                        following = play.node(target)
                        self.assertEqual(positions(node.scene,'outcome',1,index),
                                         positions(following.scene,'observe',0,None))
                        pending.append((following,depth+1))
            self.assertEqual(reached,{n.scene.id for n in play.nodes})
        self.assertEqual(reached_lengths,{2,3})

    def test_strong_deliveries_have_clear_lanes(self):
        for play in build_plays():
            for node in play.nodes:
                for choice in node.scene.choices:
                    if choice.rating == 2 and choice.action_kind in ('pass','receive','shoot'):
                        self.assertGreaterEqual(clearance(node.scene.ball,choice.ball_end,node.scene.actors),
                                                2.5,(node.scene.id,choice.key))
                        if choice.action_kind == 'receive':
                            self.assertNotEqual(choice.target,node.scene.john.position,node.scene.id)

    def test_cross_starts_wide_and_released_interception_is_reachable(self):
        play = next(p for p in build_plays() if p.id == 'P07.A')
        scene = play.nodes[0].scene
        passer = next(a for a in scene.actors if a.key == 'a')
        self.assertLessEqual(passer.position[0],20)
        good = next(c for c in scene.choices if c.rating == 2)
        from math import hypot
        self.assertLess(hypot(good.target[0]-scene.john.position[0],good.target[1]-scene.john.position[1]),5)

    def test_task_families_have_different_relative_spacing_not_just_new_titles(self):
        shapes = set()
        for p in build_plays():
            if p.family <= 6 and p.id.endswith('A'):
                s = p.nodes[0].scene
                x,y = s.john.position
                shapes.add(tuple((a.position[0]-x,a.position[1]-y) for a in s.actors if a.key in ('m','n')))
        self.assertEqual(len(shapes),6)

    def test_varied_rounds_choose_distinct_families_and_all_family_openings(self):
        seen = set()
        for seed in range(12):
            mixed = make_play_round(0,seed)
            self.assertEqual(len(mixed),4)
            self.assertEqual(len({p.family for p in mixed}),4)
            self.assertEqual(mixed,make_play_round(0,seed))
            for family in range(1,9):
                practice = make_play_round(family,seed)
                self.assertEqual(len(practice),3)
                self.assertEqual({p.id[-1] for p in practice},set('ABC'))
                seen.add(tuple(c.key for c in practice[0].nodes[0].scene.choices))
        self.assertGreater(len(seen),1)
        for bad in (-1,9):
            with self.assertRaises(ValueError):
                make_play_round(bad)

    def test_selected_branch_and_first_run_practice(self):
        s = ContinuousSession(1,0)
        self.assertFalse(s.retry())
        self.assertFalse(s.advance())
        s.phase = 'feedback'
        self.assertFalse(s.advance())
        s.phase = 'observe'
        self.assertIn('Next play',s.next_label)
        s.tick(2.4)
        index = next(i for i,c in enumerate(s.scene.choices) if c.rating == 0)
        choice = s.scene.choices[index]
        target = dict(s.play.node(s.node_id).exits)[choice.key]
        s.choose(index)
        s.tick(2.4)
        saved = dict(s.results)
        self.assertIn('Continue',s.next_label)
        s.compare_coach()
        s.tick(2.4)
        self.assertEqual(s.results,saved)
        s.retry()
        s.tick(2.4)
        index = next(i for i,c in enumerate(s.scene.choices) if c.rating == 2)
        target = dict(s.play.node(s.node_id).exits)[s.scene.choices[index].key]
        end = positions(s.scene,'outcome',1,index)
        s.choose(index)
        s.tick(2.4)
        s.advance()
        self.assertEqual(s.node_id,target)
        self.assertEqual(positions(s.scene,'observe',0,None),end)
        self.assertEqual(s.depth,2)
        s.tick(2.4)
        s.choose(0)
        self.assertEqual(s.results,saved)
        self.assertEqual(s.summary()[1],1)
        self.assertTrue(s.practice_only)

    def test_all_branches_follow_choice_keys_despite_shuffle(self):
        for family in range(1,9):
            s = ContinuousSession(family,8)
            for play in s.plays:
                s.index = s.plays.index(play)
                for node in play.nodes:
                    for index, choice in enumerate(node.scene.choices):
                        s.node_id,s.phase,s.depth = node.scene.id,'decide',1
                        self.assertTrue(s.choose(index))
                        s.tick(2.4)
                        target = dict(node.exits)[choice.key]
                        s.advance()
                        if target is not None:
                            self.assertEqual(s.node_id,target)
                        elif s.phase != 'summary':
                            self.assertEqual(s.depth,1)
                            self.assertFalse(s.practice_only)
                        s.index = s.plays.index(play)

    def test_complete_continuous_round_and_retry_do_not_score_unvisited_nodes(self):
        s = ContinuousSession(0,2)
        visited = []
        while s.phase != 'summary':
            s.tick(2.4)
            visited.append(s.scene.id)
            s.choose(next(i for i,c in enumerate(s.scene.choices) if c.rating == 2))
            s.tick(2.4)
            if s.index == len(s.plays)-1 and dict(s.play.node(s.node_id).exits)[s.feedback.key] is None:
                self.assertIn('summary',s.next_label)
            s.advance()
        self.assertEqual(set(s.results),set(visited))
        self.assertEqual(s.summary(),(len(visited),len(visited),0,0))
        self.assertLess(len(visited),len(s.scenes))
        self.assertFalse(s.choose(0))
        self.assertFalse(s.retry())
        self.assertFalse(s.advance())

    def test_graph_validation_rejects_missing_edges_destinations_and_teleports(self):
        p = build_plays()[0]
        root = p.nodes[0]
        for changes in ({'id':''},{'title':''},{'family':0},{'family':9},{'nodes':()}, {'nodes':(*p.nodes,root)}):
            with self.assertRaises(ValueError):
                replace(p,**changes).validate()
        for exits in (root.exits[:2], (*root.exits,root.exits[0]),
                      (('unknown',root.exits[0][1]),*root.exits[1:]),
                      ((root.exits[0][0],'missing'),*root.exits[1:])):
            with self.assertRaises(ValueError):
                replace(p,nodes=(replace(root,exits=exits),*p.nodes[1:])).validate()
        destination = p.nodes[1]
        bad = replace(destination,scene=replace(destination.scene,ball=(1.,1.)))
        with self.assertRaisesRegex(ValueError,'teleports'):
            replace(p,nodes=(root,bad,*p.nodes[2:])).validate()
        changed = replace(destination.scene.actors[0],approach=(1.,1.))
        bad = replace(destination,scene=replace(destination.scene,actors=(changed,*destination.scene.actors[1:])))
        with self.assertRaisesRegex(ValueError,'teleports'):
            replace(p,nodes=(root,bad,*p.nodes[2:])).validate()
        unknown = replace(p.nodes[-1],scene=replace(p.nodes[-1].scene,id='unused'))
        with self.assertRaisesRegex(ValueError,'Unreachable'):
            replace(p,nodes=(*p.nodes,unknown)).validate()

    def test_continuation_rejects_unknown_holder_instead_of_inventing_possession(self):
        s = build_plays()[0].nodes[0].scene
        choice = replace(s.choices[0],ball_end=(1.,1.))
        s = replace(s,choices=(choice,*s.choices[1:]))
        with self.assertRaisesRegex(ValueError,'known ball holder'):
            continuation(s,choice,'invalid')

    def test_graph_validation_rejects_cycles_overlong_and_one_step_plays(self):
        p = build_plays()[3]
        root = p.nodes[0]
        still = replace(root.scene,choices=tuple(replace(c,target=root.scene.john.position,
                        ball_end=root.scene.ball,actor_targets=()) for c in root.scene.choices))
        cycle = replace(root,scene=still,exits=tuple((c.key,still.id) for c in still.choices))
        with self.assertRaisesRegex(ValueError,'cycle'):
            replace(p,nodes=(cycle,)).validate()
        early = replace(root,exits=tuple((c.key,None) for c in root.scene.choices))
        with self.assertRaisesRegex(ValueError,'second decision'):
            replace(p,nodes=(early,)).validate()
        nodes = []
        for i in range(4):
            scene = replace(still,id=str(i))
            nodes.append(replace(root,scene=scene,exits=tuple((c.key,str(i+1) if i<3 else None) for c in scene.choices)))
        with self.assertRaisesRegex(ValueError,'three decisions'):
            replace(p,nodes=tuple(nodes)).validate()


if __name__ == "__main__":
    unittest.main()
