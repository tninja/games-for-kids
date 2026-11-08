"""Public-index completeness and real lesson destinations, not whole-body claims."""

import unittest
from dataclasses import replace
from math import hypot

from soccer_strategy.soccer_smart.book import lessons
from soccer_strategy.soccer_smart.book_view import BookBrowser
from soccer_strategy.soccer_smart.book_tactics import build_book_scenes
from soccer_strategy.soccer_smart.book_cards import build_book_cards
from soccer_strategy.soccer_smart.presentation import ball_height, card_height, card_positions, positions, route_destination
from soccer_strategy.soccer_smart.session import Session
from soccer_strategy.soccer_smart.model import transfer_scene


class BookCoverageTests(unittest.TestCase):
    def test_every_index_entry_has_a_visible_destination_or_explicit_deferral(self):
        entries = lessons()
        self.assertEqual(len(entries), 57)
        self.assertEqual(len({e.page for e in entries}), 57)
        self.assertEqual(sum(e.category == "skills" for e in entries), 17)
        self.assertEqual(sum(e.category == "tactics" for e in entries), 27)
        self.assertEqual(sum(e.category == "players" for e in entries), 6)
        self.assertEqual(sum(e.category == "adults" for e in entries), 5)
        self.assertEqual(sum(e.category == "start" for e in entries), 2)
        for entry in entries:
            self.assertEqual(entry.review_status, "FULL_TEXT_PENDING")
            self.assertNotEqual(entry.status, "FULLY_VERIFIED")
        self.assertEqual([e.page for e in entries if e.status == "DEFERRED"], [61])

    def test_exact_public_locators_and_no_dangling_destinations(self):
        expected = (8,11,20,22,24,26,29,32,34,36,39,42,44,46,48,50,52,54,56,58,61,64,67,70,73,75,
                    78,81,84,86,88,90,93,96,98,103,105,109,113,116,118,123,127,130,133,138,142,144,
                    147,150,153,156,160,162,163,164,165)
        browser = BookBrowser()
        self.assertEqual(tuple(e.page for e in browser.entries), expected)
        for entry in browser.entries:
            self.assertNotEqual(bool(entry.scene_ids), bool(entry.card_id))
            for key in entry.scene_ids:
                browser.scenes[key].validate()
            if entry.card_id:
                browser.cards[entry.card_id].validate()
        heading = browser.cards["bk061"]
        self.assertIn("not enabled", heading.summary)
        self.assertEqual(heading.loft, 0)

    def test_added_strategy_pairs_have_real_changed_context(self):
        scenes = build_book_scenes()
        self.assertEqual(len(scenes), 29)
        self.assertEqual(len({s.topic for s in scenes}), 14)
        for page in {s.topic for s in scenes}:
            variants = [s for s in scenes if s.topic == page]
            self.assertGreaterEqual(len(variants), 2)
            self.assertEqual(len({(s.cue,s.ball,s.rules) for s in variants}), len(variants))
            destinations = {route_destination(next(c for c in s.choices if c.rating==2)) for s in variants}
            self.assertGreaterEqual(len(destinations), 2, page)

    def test_offside_at_release_and_direct_throw_exception(self):
        scenes = {s.id:s for s in build_book_scenes()}
        before, level, behind = (scenes[f"B075.{v}"] for v in "ABC")
        self.assertEqual([s.choices[0].rating for s in (before,level,behind)], [0,2,2])
        self.assertLess(before.john.position[1], before.reference_line)
        self.assertEqual(level.john.position[1], level.reference_line)
        self.assertGreater(behind.john.position[1], behind.reference_line)
        direct, ordinary = scenes['B088.A'],scenes['B088.B']
        self.assertEqual(direct.choices[0].rating,2)
        self.assertEqual(ordinary.choices[0].rating,0)
        self.assertIn("no offside offence",direct.rules)
        _, early = positions(level,'outcome',.1,0)
        self.assertNotEqual(early,level.ball)

    def test_ordinary_pass_waits_while_offside_receiver_resets(self):
        scene = next(s for s in build_book_scenes() if s.id == 'B088.B')
        for index, choice in enumerate(scene.choices):
            if choice.rating > 0:
                self.assertEqual(choice.action_kind, 'move')
                self.assertGreaterEqual(choice.target[1], scene.reference_line)
                self.assertEqual(positions(scene, 'outcome', .5, index)[1], scene.ball)

    def test_cross_and_cutback_interceptions_are_on_the_actual_delivery(self):
        scenes = {s.id:s for s in build_book_scenes()}
        for ident, receiver in (("B127.A","r"),("B127.B","s")):
            scene = scenes[ident]
            end = next(a.position for a in scene.actors if a.key==receiver)
            a,b,c = scene.ball_from,scene.ball,end
            cross = abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))
            self.assertLess(cross/max(.1,hypot(c[0]-a[0],c[1]-a[1])), .1, ident)
            target = scene.choices[0].ball_end
            cross = abs((target[0]-a[0])*(c[1]-a[1])-(target[1]-a[1])*(c[0]-a[0]))
            self.assertLess(cross/max(.1,hypot(c[0]-a[0],c[1]-a[1])), .1, ident)

    def test_added_scene_motion_and_two_leg_return(self):
        for scene in build_book_scenes():
            for index,choice in enumerate(scene.choices):
                actors,ball = positions(scene,'outcome',1,index)
                self.assertEqual(ball,choice.ball_end)
                self.assertEqual(actors['john'],choice.target)
                for key,target in choice.actor_targets:
                    self.assertEqual(actors[key],target)
        scene = next(s for s in build_book_scenes() if s.id=='B090.A')
        _, midpoint = positions(scene,'outcome',.625,0)
        self.assertEqual(midpoint,scene.choices[0].ball_via)
        for t in (.05,.2):
            actors,ball=positions(scene,'outcome',t,0)
            self.assertEqual(actors['john'],scene.john.position)
            self.assertEqual(ball,scene.ball)

    def test_physical_cards_have_correct_contact_points_and_distinct_motion(self):
        cards = {c.id:c for c in build_book_cards()}
        self.assertEqual(len(cards),24)
        aerial,volley=cards['bk024'],cards['bk042']
        self.assertEqual(card_positions(aerial,1)[1],aerial.actors[0].position)
        self.assertEqual(card_positions(volley,.5)[1],volley.actors[0].position)
        self.assertGreater(card_height(volley,.5),0)
        self.assertGreater(card_height(cards['bk039'],.5),0)
        self.assertEqual(card_height(cards['bk039'],0),0)
        self.assertAlmostEqual(card_height(cards['bk039'],1),0)
        self.assertGreater(card_height(cards['bk048'],.2),0)
        for card in cards.values():
            self.assertEqual(card_positions(card,0)[1],card.ball_start)
            self.assertEqual(card_positions(card,1)[1],card.ball_end)
            for fraction in (0,.25,.5,.75,1):
                self.assertGreaterEqual(card_height(card,fraction),0)
        self.assertNotEqual(card_positions(cards['bk036'],.5)[1],card_positions(cards['bk058'],.5)[1])

    def test_custom_round_retains_scoring_and_rejects_empty_inputs(self):
        scenes=build_book_scenes()[:2]
        session=Session(7,scenes=scenes)
        session.tick(2.4)
        session.choose(0)
        session.tick(2.4)
        first=dict(session.results)
        session.retry()
        session.tick(2.4)
        session.choose(1)
        self.assertEqual(session.results,first)
        with self.assertRaises(ValueError):
            Session(7,scenes=())

    def test_new_geometry_validation_rejects_inconsistent_tracks(self):
        scene=build_book_scenes()[0]
        for changes in ({'loft':-1},{'loft':float('nan')},{'actor_targets':(('m',(0.,0.)),('m',(1.,1.)))},
                        {'actor_targets':(('missing',(1.,1.)),)},{'actor_targets':(('john',(1.,1.)),)},
                        {'aim':(-1.,1.)},{'ball_via':(float('nan'),1.)}):
            with self.subTest(changes=changes),self.assertRaises(ValueError):
                replace(scene,choices=(replace(scene.choices[0],**changes),*scene.choices[1:])).validate()
        for line in (-1,float('inf'),101):
            with self.assertRaises(ValueError):
                replace(scene,reference_line=line).validate()
        card=build_book_cards()[0]
        for changes in ({'demo':'unknown'},{'loft':-1},{'loft':float('nan')},{'ball_control':(-1.,1.)},
                        {'waypoints':((1.,float('nan')),) }):
            with self.subTest(changes=changes),self.assertRaises(ValueError):
                replace(card,**changes).validate()

    def test_browser_rejects_unknown_categories_and_out_of_range_selection(self):
        browser=BookBrowser()
        with self.assertRaises(ValueError):
            browser.choose_category('unknown')
        with self.assertRaises(StopIteration):
            browser.select(999)
        self.assertIsNone(browser.number_action(-1))
        self.assertIsNone(browser.number_action(99))
        browser.change_page(-1)
        self.assertEqual(browser.page,0)

    def test_coach_and_outcome_share_the_same_clearance_height(self):
        scene=build_book_scenes()[0]
        best=replace(scene.choices[0],action_kind='clear',rating=2)
        scene=replace(scene,choices=(best,*scene.choices[1:]))
        scene.validate()
        self.assertEqual(ball_height(scene,'coach',.625,0),ball_height(scene,'outcome',.625,0))
        self.assertGreater(ball_height(scene,'coach',.625,0),0)

    def test_book_pictures_keep_their_authored_rule_and_touchline_geometry(self):
        for scene in build_book_scenes():
            with self.assertRaisesRegex(ValueError,'Book pictures'):
                transfer_scene(scene,.92)

    def test_book_rounds_shuffle_actions_without_changing_their_ratings(self):
        scenes=build_book_scenes()[:2]
        orders=set()
        expected={c.key:c.rating for c in scenes[0].choices}
        for seed in range(10):
            session=Session(7,seed,scenes=scenes)
            orders.add(tuple(c.key for c in session.scene.choices))
            self.assertEqual({c.key:c.rating for c in session.scene.choices},expected)
        self.assertGreater(len(orders),1)


if __name__ == "__main__":
    unittest.main()
