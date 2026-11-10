"""Book navigation, real SDL content reachability and all added layouts."""

import os
import unittest

os.environ["SDL_VIDEODRIVER"] = "dummy"
os.environ["SDL_AUDIODRIVER"] = "dummy"
os.environ["PYGAME_HIDE_SUPPORT_PROMPT"] = "1"

import pygame

from soccer_strategy.soccer_smart.app import App


class BookUITests(unittest.TestCase):
    def setUp(self):
        self.app = App()

    def tearDown(self):
        pygame.quit()

    def fits(self):
        self.app.draw()
        self.assertFalse(self.app.layout_errors, self.app.layout_errors)

    def key(self, key):
        self.app.handle_event(pygame.event.Event(pygame.KEYDOWN, key=key))

    def click(self, action):
        button = next(b for b in self.app.buttons() if b.action == action)
        w, h = self.app.window.get_size()
        point = (round(button.rect.centerx*w/1280), round(button.rect.centery*h/880))
        self.app.handle_event(pygame.event.Event(pygame.MOUSEBUTTONDOWN, button=1, pos=point))

    def test_separate_seventh_menu_entry_preserves_original_six_actions(self):
        self.assertEqual(len(self.app.buttons()), 8)
        self.key(pygame.K_7)
        self.assertIsNotNone(self.app.book)
        self.fits()
        self.click("book_category:skills")
        self.fits()
        self.key(pygame.K_RIGHT)
        self.assertEqual(self.app.book.page, 1)
        self.key(pygame.K_LEFT)
        self.assertEqual(self.app.book.page, 0)
        self.key(pygame.K_1)
        self.assertIsNotNone(self.app.card_index)
        self.key(pygame.K_r)
        self.key(pygame.K_n)
        self.assertIsNone(self.app.card_index)
        self.click("book_categories")
        self.key(pygame.K_2)
        self.assertEqual(self.app.book.category, "tactics")
        self.key(pygame.K_ESCAPE)
        self.key(pygame.K_6)
        self.assertEqual(len(self.app.cards), 7)

    def test_all_fifty_seven_entries_reach_real_play_or_unscored_information(self):
        self.app.activate("book")
        browser = self.app.book
        for category in ("skills", "tactics", "players", "adults", "start"):
            self.app.activate("book_category:" + category)
            for page in range((len(browser.items)+5)//6):
                browser.page = page
                self.fits()
                for entry in browser.visible:
                    self.click(f"book_entry:{entry.page}")
                    if entry.scene_ids:
                        self.assertEqual(tuple(s.id for s in self.app.session.scenes), entry.scene_ids)
                        self.key(pygame.K_SPACE)
                        self.key(pygame.K_1)
                        self.key(pygame.K_SPACE)
                        self.fits()
                    else:
                        self.assertEqual(self.app.cards[0].id, entry.card_id)
                        self.app.card_elapsed = 1.2
                        self.fits()
                    self.key(pygame.K_b)
                    self.assertEqual(browser.page, page)

    def test_all_added_scenes_render_all_choices_and_phases(self):
        self.app.activate("book")
        self.app.activate("book_entry:75")
        session = self.app.session
        for scene in self.app.book.scenes.values():
            if not scene.id.startswith("B"):
                continue
            session.scenes = (scene,)
            session.index = 0
            for phase in ("observe", "decide", "summary"):
                session.phase = phase
                session.selected = None
                self.fits()
            for index in range(3):
                session.selected = index
                for phase in ("outcome", "feedback", "coach"):
                    session.phase = phase
                    session.elapsed = 1.2
                    self.fits()

    def test_book_controls_resize_and_boundary_pages(self):
        self.app.activate("book_next")
        with self.assertRaises(AssertionError):
            self.app._book_action("book_next")
        self.app.activate("book")
        self.key(pygame.K_z)
        self.key(pygame.K_6)
        self.app.activate("book_category:players")
        self.click("book_prev")
        self.click("book_next")
        self.assertEqual(self.app.book.page, 0)
        self.app.window = pygame.display.set_mode((640,440), pygame.RESIZABLE)
        self.click("book_entry:32")
        self.click("book_back")
        self.app.activate("book_ignored")
        self.key(pygame.K_b)
        self.key(pygame.K_ESCAPE)
        self.assertIsNone(self.app.book)

    def test_card_renderer_has_a_safe_unselected_topic_fallback(self):
        self.app.activate("book")
        self.app.card_index=0
        self.assertIsNone(self.app.book.selected)
        self.fits()


if __name__ == "__main__":
    unittest.main()
