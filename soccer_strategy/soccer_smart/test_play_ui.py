"""Continuous Play desktop navigation and actual selected-branch rendering."""

import os
import unittest

os.environ['SDL_VIDEODRIVER'] = 'dummy'
os.environ['SDL_AUDIODRIVER'] = 'dummy'
import pygame

from soccer_strategy.soccer_smart.app import App
from soccer_strategy.soccer_smart.play_session import ContinuousSession
from soccer_strategy.soccer_smart.play_view import PlayBrowser


class ContinuousUITests(unittest.TestCase):
    def setUp(self):
        self.app = App()

    def tearDown(self):
        pygame.quit()

    def fits(self):
        self.app.draw()
        self.assertFalse(self.app.layout_errors,self.app.layout_errors)

    def test_eighth_menu_entry_and_all_family_controls(self):
        self.assertEqual(len(self.app.buttons()),8)
        self.app.handle_event(pygame.event.Event(pygame.KEYDOWN,key=pygame.K_8))
        self.fits()
        self.app.activate('play_next')
        self.fits()
        self.app.activate('play_prev')
        for family in range(9):
            self.app.activate(f'play_family:{family}')
            self.assertIsInstance(self.app.session,ContinuousSession)
            self.fits()
            self.app.activate('skip')
            self.app.activate('choice:0')
            self.app.activate('skip')
            self.fits()
            self.app.activate('play_back')
            self.fits()
        self.app.activate('menu')
        self.assertIsNone(self.app.play_browser)
        self.app.activate('cards:0')
        self.assertEqual(len(self.app.cards),7)

    def test_every_continuous_node_choice_and_phase_renders(self):
        self.app.activate('continuous')
        self.app.handle_event(pygame.event.Event(pygame.KEYDOWN,key=pygame.K_SPACE))
        for family in range(1,9):
            self.app.activate(f'play_family:{family}')
            s = self.app.session
            self.assertIsInstance(s,ContinuousSession)
            for index,play in enumerate(s.plays):
                s.index = index
                for node in play.nodes:
                    s.node_id = node.scene.id
                    for phase in ('observe','decide'):
                        s.phase,s.selected = phase,None
                        self.fits()
                    for selected in range(3):
                        s.selected = selected
                        for phase in ('outcome','feedback','coach'):
                            s.phase,s.elapsed = phase,1.2
                            self.fits()
            s.phase = 'summary'
            self.fits()

    def test_task_browser_keys_bounds_practice_feedback_and_top_menu(self):
        b = PlayBrowser()
        self.assertIsNone(b.number_action(-1))
        self.assertIsNone(b.number_action(99))
        self.app.activate('continuous')
        for key in (pygame.K_LEFT,pygame.K_RIGHT,pygame.K_RIGHT,pygame.K_6,pygame.K_q):
            self.app.handle_event(pygame.event.Event(pygame.KEYDOWN,key=key))
        self.assertEqual(self.app.play_browser.page,1)
        self.assertIsNone(self.app.session)
        self.app.activate('play_ignored')
        self.app.handle_event(pygame.event.Event(pygame.KEYDOWN,key=pygame.K_1))
        self.app.handle_event(pygame.event.Event(pygame.KEYDOWN,key=pygame.K_SPACE))
        for action in ('skip','choice:0','skip','retry','skip','choice:1','skip'):
            self.app.activate(action)
        self.assertTrue(self.app.session.practice_only)
        self.fits()
        self.app.handle_event(pygame.event.Event(pygame.KEYDOWN,key=pygame.K_b))
        self.assertIsNone(self.app.session)
        self.app.handle_event(pygame.event.Event(pygame.MOUSEBUTTONDOWN,button=1,pos=(1150,45)))
        self.assertIsNone(self.app.play_browser)
        self.app.activate('play_ignored')
        with self.assertRaises(AssertionError):
            self.app._play_action('play_next')
