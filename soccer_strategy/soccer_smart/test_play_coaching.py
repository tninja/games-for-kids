"""Independent tactical counterexamples, beyond catalog size and graph validity."""

from dataclasses import replace
from math import dist
import unittest

from soccer_strategy.soccer_smart.play_content import actor, build_plays, clearance, owner, pressure
from soccer_strategy.soccer_smart.presentation import positions


class PlayCoachingTests(unittest.TestCase):
    def scenes(self):
        return [n.scene for p in build_plays() for n in p.nodes]

    def test_both_clear_opening_outlets_are_fully_credited(self):
        plays = {p.id:p for p in build_plays()}
        for ident,keys in (('P01.A',('carry','left')),('P01.B',('left','right')),
                           ('P01.C',('carry','right'))):
            scene = plays[ident].nodes[0].scene
            for key in keys:
                choice = next(c for c in scene.choices if c.key == key)
                self.assertEqual(choice.rating,2,(ident,key))

    def test_cover_does_not_invent_a_release_or_award_possession(self):
        count = 0
        for scene in self.scenes():
            holder = owner(scene.actors,scene.ball)
            if holder is not None and holder.team == 'away':
                for choice in scene.choices:
                    if choice.rating == 2:
                        self.assertNotEqual(choice.action_kind,'intercept',scene.id)
                        self.assertEqual(choice.ball_end,scene.ball,scene.id)
                        count += 1
        self.assertGreater(count,10)

    def test_held_ball_variants_show_actual_teammate_pressure_and_allow_cover(self):
        plays = {p.id:p for p in build_plays()}
        for family in (7,8):
            b,c = (plays[f'P{family:02d}.{v}'].nodes[0].scene for v in 'BC')
            self.assertNotEqual(next(a.position for a in b.actors if a.key=='m'),
                                next(a.position for a in c.actors if a.key=='m'))
            for scene in (b,c):
                for key in ('delay','recover'):
                    self.assertEqual(next(ch.rating for ch in scene.choices if ch.key==key),2)

    def test_existing_clear_support_need_not_move_and_bad_run_does_not_force_a_pass(self):
        kept = 0
        for scene in self.scenes():
            if any(c.key=='angle' for c in scene.choices):
                hold = next(c for c in scene.choices if c.key=='hold')
                if clearance(scene.ball,scene.john.position,scene.actors) >= 4:
                    self.assertEqual(hold.rating,2,scene.id)
                    kept += 1
                poor = next(c for c in scene.choices if c.rating==0)
                self.assertEqual(poor.ball_end,scene.ball,scene.id)
        self.assertGreater(kept,0)

    def test_time_to_scan_is_not_penalized_without_close_pressure(self):
        count = 0
        for scene in self.scenes():
            pause = next((c for c in scene.choices if c.key=='pause'),None)
            if pause is not None:
                nearest = min(dist(a.position,scene.ball) for a in scene.actors if a.team=='away')
                if nearest > 6:
                    self.assertEqual(pause.rating,2,scene.id)
                    count += 1
        self.assertGreater(count,0)

    def test_shooting_reads_keeper_and_keeps_a_pass_when_both_corners_are_blocked(self):
        base = next(p for p in build_plays() if p.family==6).nodes[0].scene
        people = (actor('john','home',(50.,20.)),actor('m','home',(30.,25.)),
                  actor('n','home',(70.,25.)),actor('a','away',(10.,5.)),
                  actor('a2','away',(90.,5.)),actor('gk','keeper',(56.,0.)))
        for keeper,goal in (((56.,0.),(44.,0.)),((44.,0.),(56.,0.))):
            roster = (*people[:-1],replace(people[-1],position=keeper))
            _, choices = pressure(base,roster,(50.,20.))
            self.assertEqual(choices[0].action_kind,'shoot')
            self.assertEqual(choices[0].ball_end,goal)
        roster = (*people[:3],replace(people[3],position=(50.,10.)),*people[4:])
        _, choices = pressure(base,roster,(50.,20.))
        self.assertFalse(any(c.action_kind=='shoot' and c.rating==2 for c in choices))
        distant = (replace(people[0],position=(50.,40.)),*people[1:])
        _, choices = pressure(base,distant,(50.,40.))
        self.assertEqual(choices[0].action_kind,'pass')

    def test_clearance_controls_include_the_keeper_and_reject_blocked_routes(self):
        self.assertEqual(clearance((0.,0.),(10.,0.),(actor('a','away',(5.,0.)),)),0)
        self.assertEqual(clearance((0.,0.),(10.,0.),(actor('a','away',(5.,3.)),)),3)
        keeper = (actor('gk','keeper',(5.,0.)),)
        self.assertEqual(clearance((0.,0.),(10.,0.),keeper,keepers=True),0)
        self.assertEqual(clearance((0.,0.),(10.,0.),keeper),100)

    def test_credited_routes_clear_the_actual_moving_defenders(self):
        for scene in self.scenes():
            for index,choice in enumerate(scene.choices):
                if choice.rating==2 and choice.action_kind in ('pass','receive','shoot','dribble'):
                    for t in (.25,.4,.6,.8,1):
                        people,ball = positions(scene,'outcome',t,index)
                        gap = min(dist(people[a.key],ball) for a in scene.actors if a.team=='away')
                        self.assertGreaterEqual(gap,2,(scene.id,choice.key,t))

    def test_each_explanation_addresses_its_own_action(self):
        for scene in self.scenes():
            self.assertEqual(len({c.explanation for c in scene.choices}),3,scene.id)

    def test_coach_keeps_a_fully_credited_selected_route(self):
        scene = build_plays()[0].nodes[0].scene
        index = 1
        choices = tuple(replace(c,rating=2) for c in scene.choices)
        scene = replace(scene,choices=choices)
        self.assertEqual(positions(scene,'coach',1,index),positions(scene,'outcome',1,index))
        self.assertNotEqual(positions(scene,'coach',1,None),positions(scene,'outcome',1,index))


if __name__ == '__main__':
    unittest.main()
