"""Tests for Python BattleshipMatch engine parity and headless Pygame GameGUI."""

import os
from pathlib import Path
import sys
import tempfile
import unittest

os.environ.setdefault("SDL_VIDEODRIVER", "dummy")
os.environ.setdefault("SDL_AUDIODRIVER", "dummy")
os.environ.setdefault("PYGAME_HIDE_SUPPORT_PROMPT", "1")

BATTLESHIP_DIR = Path(__file__).resolve().parent
if str(BATTLESHIP_DIR) not in sys.path:
    sys.path.insert(0, str(BATTLESHIP_DIR))

import pygame  # noqa: E402

from fleet import Fleet  # noqa: E402
from game import BattleshipMatch, ProfileStore, rank_for_stars  # noqa: E402
from game_gui import ENEMY_PANEL, GameGUI, PLAYER_PANEL  # noqa: E402


class TestBattleshipMatchAndPygameGUI(unittest.TestCase):
    def test_ai_tiers_placement_skills_and_rules(self) -> None:
        for diff in ("easy", "normal", "hard"):
            match = BattleshipMatch(board_size=7, seed=101, difficulty=diff)
            cap = match.captain_info()
            self.assertIsNotNone(cap)
            assert cap is not None
            self.assertEqual(cap["difficulty"], diff)
            r, c = match.computer.choose_next_shot(match.player, match.rng)
            self.assertTrue(0 <= r < 7 and 0 <= c < 7)

        # Manual placement validation
        m = BattleshipMatch(board_size=7, seed=12)
        m.player.fleet_group.fleets = [
            Fleet(0, 0, 5, "horizontal", "carrier"),
            Fleet(2, 0, 4, "horizontal", "battleship"),
            Fleet(3, 0, 3, "horizontal", "cruiser"),
            Fleet(4, 0, 3, "horizontal", "submarine"),
            Fleet(5, 0, 3, "horizontal", "destroyer"),
        ]
        self.assertTrue(m.place_ship(0, "carrier", 1, 0, "horizontal"))
        self.assertFalse(m.place_ship(0, "battleship", 1, 0, "horizontal"))

        # Sonar and Cross Bomb
        m.computer.fleet_group.fleets = [
            Fleet(1, 1, 3, "horizontal", "cruiser"),
            Fleet(6, 0, 2, "horizontal", "destroyer"),
        ]
        s_res = m.use_sonar(1, 2)
        self.assertTrue(s_res["accepted"])
        self.assertEqual(s_res["count"], 3)
        self.assertEqual(m.sonar_left[0], 1)
        self.assertFalse(m.use_sonar(0, 0)["accepted"])

        b_res = m.use_cross_bomb(1, 2)
        self.assertTrue(b_res["accepted"])
        self.assertEqual(m.bomb_left[0], 0)
        self.assertTrue(m.bomb_blast_earned[0])

        # Streak rule mode
        st = BattleshipMatch(board_size=7, seed=3, rule_mode="streak")
        st.computer.fleet_group.fleets = [Fleet(0, 0, 3, "horizontal", "cruiser")]
        r1 = st.fire(0, 0)
        self.assertTrue(r1["accepted"])
        self.assertTrue(r1.get("bonus_turn"))
        self.assertEqual(len(st.computer.hit_history), 0)

        # Salvo rule mode
        sv = BattleshipMatch(board_size=7, seed=4, rule_mode="salvo")
        r2 = sv.fire(0, 0)
        self.assertTrue(r2["accepted"])
        self.assertTrue(r2.get("bonus_turn"))
        self.assertEqual(r2.get("salvo_remaining"), 4)

    def test_2p_handoff_helper_and_profile_persistence(self) -> None:
        m2 = BattleshipMatch(board_size=7, seed=25, play_mode="2p")
        res = m2.fire(0, 0)
        self.assertTrue(res["accepted"])
        self.assertTrue(res.get("handoff_required"))
        self.assertTrue(m2.waiting_handoff)
        m2.confirm_handoff()
        self.assertFalse(m2.waiting_handoff)
        self.assertEqual(m2.active_player_index, 1)

        hm = BattleshipMatch(board_size=7, seed=40, helper_mode=True)
        hm.computer.fleet_group.fleets = [Fleet(6, 4, 3, "horizontal", "cruiser")]
        for col in range(4):
            hm.fire(0, col)
        self.assertIsNotNone(hm.helper_hint())

        with tempfile.TemporaryDirectory(prefix="bs-profile-") as tmp:
            p_path = Path(tmp) / "profile.json"
            store = ProfileStore(path=p_path, persist=True)
            unlocked = store.record_match(True, 3, ["first_win", "admiral_slayer"])
            self.assertEqual(unlocked, ["first_win", "admiral_slayer"])
            self.assertEqual(store.rank_name(), rank_for_stars(3))

            reloaded = ProfileStore(path=p_path, persist=True)
            self.assertEqual(reloaded.data["stars"], 3)
            self.assertIn("admiral_slayer", reloaded.data["badges"])

    def test_headless_pygame_gui_full_flows(self) -> None:
        with tempfile.TemporaryDirectory(prefix="bs-gui-") as tmp:
            gui = GameGUI(seed=77, persist_profile=True, profile_path=Path(tmp) / "p.json")
            gui.draw()

            # Placement mode + rotate + click
            gui.activate("toggle_place")
            self.assertEqual(gui.phase(), "place")
            gui.draw()
            gui.handle_key(pygame.K_t)
            self.assertEqual(gui.place_direction, "vertical")
            gui.activate("finish_place")
            self.assertEqual(gui.phase(), "battle")

            # Sonar + fire + animations + duplicate protection
            gui.activate("select_sonar")
            gui.draw()
            cx, cy = gui.cell_center(ENEMY_PANEL, 2, 2)
            gui.handle_click((int(cx), int(cy)))
            self.assertEqual(gui.match.sonar_left[0], 1)

            gui.handle_click((int(cx), int(cy)))
            self.assertEqual(gui.match.shots_fired, 1)
            gui.tick(1.0)
            gui.draw()
            gui.handle_click((int(cx), int(cy)))
            self.assertEqual(gui.match.shots_fired, 1)

            # Explicit enemy hit triggers short hit burst animation & subtle shake
            gui.match.computer.fleet_group.fleets = [
                Fleet(0, 0, 2, "horizontal", "destroyer"),
                Fleet(5, 0, 3, "horizontal", "cruiser"),
            ]
            hx, hy = gui.cell_center(ENEMY_PANEL, 0, 0)
            gui.handle_click((int(hx), int(hy)))
            gui.tick(0.25)
            self.assertGreater(len(gui.hit_bursts), 0)
            self.assertGreater(gui.shake_time, 0.0)
            self.assertTrue(any(p.get("kind") == "debris" for p in gui.particles))
            gui.draw()
            gui.tick(1.2)
            self.assertEqual(len(gui.hit_bursts), 0)

            # Sinking enemy ship triggers enormous explosion, breakup animation & Battle Cam
            hx2, hy2 = gui.cell_center(ENEMY_PANEL, 0, 1)
            gui.handle_click((int(hx2), int(hy2)))
            gui.tick(0.25)
            self.assertIn("e:destroyer", gui.sink_anims)
            self.assertIsNotNone(gui.battle_cam)
            self.assertTrue(any(b.get("enormous") for b in gui.hit_bursts))
            gui.draw()
            gui.tick(0.5)
            gui.draw()
            gui.handle_key(pygame.K_ESCAPE)
            self.assertIsNone(gui.battle_cam)
            gui.tick(1.0)
            self.assertNotIn("e:destroyer", gui.sink_anims)

            # Winning triggers Grand Finale multi-boat explosion barrage & Victory Battle Cam
            for c in (0, 1, 2):
                gui.fire_at(5, c)
                gui.tick(0.25 if c == 2 else 0.8)
            self.assertTrue(gui.match.game_over)
            self.assertIsNotNone(gui.battle_cam)
            assert gui.battle_cam is not None
            self.assertTrue(gui.battle_cam.get("victory"))
            self.assertGreater(len(gui.pending_events), 0)
            gui.tick(0.4)
            gui.draw()
            gui.tick(2.2)
            gui.activate("new_game")

            # Cross bomb
            gui.activate("select_bomb")
            bx, by = gui.cell_center(ENEMY_PANEL, 4, 4)
            gui.handle_click((int(bx), int(by)))
            gui.tick(1.2)
            gui.draw()
            self.assertEqual(gui.match.bomb_left[0], 0)

            # 2P handoff flow
            gui.activate("toggle_mode")
            self.assertEqual(gui.play_mode, "2p")
            self.assertEqual(gui.phase(), "place")
            gui.draw()
            gui.activate("finish_place")
            self.assertEqual(gui.phase(), "handoff")
            gui.draw()
            gui.handle_key(pygame.K_SPACE)
            self.assertEqual(gui.phase(), "place")
            self.assertEqual(gui.placing_side, 1)
            gui.activate("finish_place")
            gui.handle_key(pygame.K_SPACE)
            self.assertEqual(gui.phase(), "battle")

            # Helper toggle & 10x10 board draw
            gui.activate("toggle_helper")
            gui.activate("toggle_size")
            self.assertEqual(gui.board_size, 10)
            px, py = gui.cell_center(PLAYER_PANEL, 0, 0)
            gui.handle_motion((int(px), int(py)))
            gui.draw()

            # Resizable window scaling and mouse coordinate mapping
            gui.handle_resize(1920, 1200)
            vp = gui.viewport_rect()
            self.assertGreater(vp.width, 1280)
            self.assertGreater(vp.height, 880)
            lx, ly = gui.window_to_logical(vp.center)
            self.assertAlmostEqual(lx, 640, delta=2)
            self.assertAlmostEqual(ly, 440, delta=2)
            self.assertEqual(gui.window_to_logical((0, 0)), (-1, -1))
            gui.draw()


if __name__ == "__main__":
    unittest.main()
