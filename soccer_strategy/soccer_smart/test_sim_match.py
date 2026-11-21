"""Tests for Match Day Cup 2D micro-sim, AI, rules, audio, storage, UI, and JS parity."""

from dataclasses import asdict
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

os.environ["SDL_VIDEODRIVER"] = "dummy"
os.environ["SDL_AUDIODRIVER"] = "dummy"
os.environ["PYGAME_HIDE_SUPPORT_PROMPT"] = "1"

import pygame

from soccer_strategy.soccer_smart.app import App
from soccer_strategy.soccer_smart.audio import SoundBank, make_tone
from soccer_strategy.soccer_smart.campaign import all_matches, build_cups, match_by_id
from soccer_strategy.soccer_smart.catalog import build_catalog
from soccer_strategy.soccer_smart.match_session import MatchSession
from soccer_strategy.soccer_smart.match_view import screen_to_pitch
from soccer_strategy.soccer_smart.play_content import build_plays
from soccer_strategy.soccer_smart.sim_kernel import guided_anchors, simulate_beat, snap_action
from soccer_strategy.soccer_smart.sim_model import (
    SimAction,
    SimBall,
    SimPlayer,
    SimState,
    cover_shadow_triangle,
    gk_coverage_fan,
    offside_line_y,
    open_pockets,
)
from soccer_strategy.soccer_smart.storage import ProgressStore

ROOT = Path(__file__).resolve().parent.parent.parent


class SimAndMatchTests(unittest.TestCase):
    def test_classic_and_continuous_labels_have_no_giveaway_spoilers(self) -> None:
        banned = ("into the press", "cover shadow", "guessed passing", "straight into a",
                  "straight into the marker", "behind the pressing", "into m's feet", "leave r free")
        for scene in build_catalog():
            for c in scene.choices:
                low = c.label.lower()
                for phrase in banned:
                    self.assertNotIn(phrase, low, (scene.id, c.label))
        for play in build_plays():
            for node in play.nodes:
                for c in node.scene.choices:
                    low = c.label.lower()
                    for phrase in banned:
                        self.assertNotIn(phrase, low, (node.scene.id, c.label))

    def test_campaign_has_three_cups_six_matches_and_valid_coach_lines(self) -> None:
        cups = build_cups()
        self.assertEqual(len(cups), 3)
        self.assertEqual(len(all_matches()), 6)
        with self.assertRaises(ValueError):
            match_by_id("NO_SUCH_MATCH")
        for match in all_matches():
            for mom in match.moments:
                st = mom.initial_state
                for act in mom.coach_actions:
                    res = simulate_beat(st, act)
                    self.assertGreater(len(res.frames), 1)
                    self.assertTrue(res.feedback)
                    st = res.end_state

    def test_offside_goal_loft_build_out_and_defend_mechanics(self) -> None:
        fin = match_by_id("C1M2").moments[2]
        goal_res = simulate_beat(fin.initial_state, SimAction("shoot", 41.5, 0.0))
        self.assertEqual(goal_res.outcome, "goal")
        self.assertIn("Clutch Finisher", goal_res.badges)
        save_res = simulate_beat(fin.initial_state, SimAction("shoot", 50.0, 0.0))
        self.assertEqual(save_res.outcome, "saved")
        parry_res = simulate_beat(fin.initial_state, SimAction("shoot", 55.5, 0.0))
        self.assertEqual(parry_res.metrics.get("rebound"), 1.0)
        off_state = SimState(
            (
                SimPlayer("you", "YOU", 8, "home", "fwd", "balanced", 66.0, 20.0),
                SimPlayer("leo", "Leo", 10, "home", "mid", "playmaker", 48.0, 40.0),
                SimPlayer("d1", "#2", 2, "away", "def", "cover", 32.0, 32.0, max_speed=13.5),
                SimPlayer("d2", "#3", 3, "away", "def", "cover", 40.0, 32.0, max_speed=13.5),
                SimPlayer("opp_gk", "GK", 1, "away", "gk", "sweeper", 50.0, 4.0, max_speed=10.5),
            ),
            SimBall(48.0, 40.0, 0.0, 0.0, 0.0, 0.0, "leo", "home"),
            "9v9", False, True, "balanced", 20, 0, 0,
        )
        self.assertIsNotNone(offside_line_y(off_state))
        off_res = simulate_beat(off_state, SimAction("run_call", 66.0, 20.0))
        self.assertEqual(off_res.outcome, "offside")
        self.assertEqual(len(cover_shadow_triangle(50.0, 60.0, 50.0, 45.0)), 3)
        self.assertIsNotNone(gk_coverage_fan(fin.initial_state))
        self.assertGreaterEqual(len(open_pockets(fin.initial_state)), 1)

    def test_snap_action_and_guided_anchors_cover_all_roles(self) -> None:
        m1 = match_by_id("C1M1")
        st_ball = m1.moments[0].initial_state
        self.assertEqual(snap_action(st_ball, 50.0, 2.0).kind, "shoot")
        self.assertEqual(snap_action(st_ball, 36.0, 78.0).kind, "shield")
        self.assertEqual(snap_action(st_ball, 16.0, 58.0).kind, "pass")
        self.assertEqual(snap_action(st_ball, 20.0, 46.0).kind, "pass")
        self.assertEqual(snap_action(st_ball, 86.0, 86.0).kind, "dribble")
        self.assertGreaterEqual(len(guided_anchors(st_ball)), 3)
        st_off = match_by_id("C2M1").moments[1].initial_state
        self.assertEqual(snap_action(st_off, 26.0, 16.0, False, "call").kind, "run_call")
        self.assertEqual(snap_action(st_off, 26.0, 16.0, False, "decoy").kind, "run_decoy")
        self.assertEqual(len(guided_anchors(st_off)), 3)
        st_def = m1.moments[2].initial_state
        self.assertEqual(snap_action(st_def, 18.0, 64.0).kind, "defend")
        self.assertEqual(len(guided_anchors(st_def)), 3)

    def test_match_session_rewind_coach_and_full_match_summary(self) -> None:
        ms = MatchSession("C1M1")
        self.assertEqual(ms.phase, "intro")
        ms.tick(1.0)
        self.assertEqual(ms.phase, "freeze")
        self.assertIsNotNone(ms.preview_point(16.0, 52.0))
        self.assertIsNotNone(ms.commit_point(16.0, 52.0))
        self.assertEqual(ms.phase, "resolve")
        ms.tick(2.0)
        self.assertTrue(ms.rewind_beat())
        self.assertEqual(ms.phase, "freeze")
        self.assertTrue(ms.start_coach_demo())
        ms.tick(2.0)
        self.assertEqual(ms.phase, "review")
        for _ in range(3):
            if ms.phase == "intro":
                ms.skip_phase()
            if ms.phase == "freeze":
                ms.commit_action(ms.moment.coach_actions[0])
                ms.skip_phase()
            ms.phase = "review"
            ms.next_moment()
        self.assertEqual(ms.phase, "match_summary")
        stars, _, _, _ = ms.summary()
        self.assertIn(stars, (1, 2, 3))

    def test_python_and_js_sim_kernel_match_identically(self) -> None:
        node = shutil.which("node")
        self.assertIsNotNone(node)
        assert node is not None
        cases = []
        for match in all_matches():
            for mom in match.moments:
                st = mom.initial_state
                for act in mom.coach_actions:
                    res = simulate_beat(st, act)
                    cases.append({
                        "id": mom.id, "state": asdict(st), "action": asdict(act),
                        "outcome": res.outcome, "stars": res.stars, "badges": list(res.badges),
                        "feedback": res.feedback, "ball_end": list(res.frames[-1].ball),
                        "frame_len": len(res.frames),
                    })
                    st = res.end_state
        script = (
            'const sim=require("./docs/soccer_smart/sim_kernel.js");'
            'const cases=JSON.parse(require("fs").readFileSync(0,"utf8"));'
            'for(const c of cases){const r=sim.simulateBeat(c.state,c.action);'
            'if(r.outcome!==c.outcome||r.stars!==c.stars||JSON.stringify(r.badges)!==JSON.stringify(c.badges)'
            '||r.feedback!==c.feedback||r.frames.length!==c.frame_len)process.exit(2);'
            'const b=r.frames[r.frames.length-1].ball;'
            'if(Math.hypot(b[0]-c.ball_end[0],b[1]-c.ball_end[1])>0.01)process.exit(3);}'
            'console.log("ok:"+cases.length);'
        )
        run = subprocess.run([node, "-e", script], cwd=ROOT, input=json.dumps(cases),
                             text=True, capture_output=True, check=True)
        self.assertIn("ok:", run.stdout)

    def test_audio_and_progress_storage(self) -> None:
        raw = make_tone((440, 523), 0.03, 22050, 1)
        self.assertGreater(len(raw), 10)
        with self.assertRaises(ValueError):
            make_tone((), 0.03, 22050, 1)
        bank = SoundBank()
        bank.play("click")
        bank.toggle()
        bank.toggle()
        with self.assertRaises(ValueError):
            bank.play("unknown")
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "progress.json"
            store = ProgressStore(path)
            store.record_classic("T01.A", 2)
            store.record_match("C1M1", 3, True, 2, 0, ["Line Breaker"], {"vision": 5})
            store.set_tier("9v9")
            reloaded = ProgressStore(path)
            self.assertEqual(reloaded.data["classic_best"]["T01.A"], 2)
            self.assertEqual(reloaded.data["rules_tier"], "9v9")
            self.assertIn("Line Breaker", reloaded.data["badges"])

    def test_desktop_and_web_match_day_ui_and_pitch_clicks(self) -> None:
        self.assertIsNone(screen_to_pitch((10, 10)))
        self.assertIsNotNone(screen_to_pitch((400, 400)))
        app = App()
        try:
            app.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_9))
            app.draw()
            self.assertFalse(app.layout_errors, app.layout_errors)
            app.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_t))
            app.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_1))
            app.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_SPACE))
            app.handle_event(pygame.event.Event(pygame.MOUSEMOTION, pos=(200, 480)))
            app.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_v))
            app.draw()
            self.assertFalse(app.layout_errors, app.layout_errors)
            app.handle_event(pygame.event.Event(pygame.MOUSEBUTTONDOWN, button=1, pos=(200, 480)))
            app.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_SPACE))
            app.draw()
            self.assertFalse(app.layout_errors, app.layout_errors)
            app.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_z))
            app.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_c))
            app.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_SPACE))
            app.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_n))
            app.draw()
            self.assertFalse(app.layout_errors, app.layout_errors)
            app.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_i))
            app.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_m))
        finally:
            pygame.quit()
        node = shutil.which("node")
        assert node is not None
        script = (
            'const fs=require("fs"),d=JSON.parse(fs.readFileSync("docs/soccer_smart/data.json","utf8")),'
            'w=require("./docs/soccer_smart/app.js"),st={},'
            'ctx={font:"16px sans-serif",measureText:(s)=>({width:s.length*7.2}),fillText(){},fillRect(){},'
            'strokeRect(){},beginPath(){},roundRect(){},rect(){},fill(){},stroke(){},arc(){},ellipse(){},'
            'moveTo(){},lineTo(){},closePath(){},save(){},restore(){},translate(){},scale(){}},'
            'app=new w.SoccerSmartWebApp(d,{getContext:()=>ctx},{getItem:(k)=>st[k]||null,setItem:(k,v)=>{st[k]=v;}});'
            'app.handleKeyDown("9");app.draw();if(app.layoutErrors.length)process.exit(2);'
            'app.handleKeyDown("1");app.handleKeyDown(" ");app.handleKeyDown("v");app.handlePointerMove([200,480],"mouse");'
            'app.draw();if(app.layoutErrors.length)process.exit(3);'
            'app.handlePointerDown([200,480],"touch");app.handleKeyDown(" ");app.draw();'
            'if(app.layoutErrors.length)process.exit(4);'
            'app.setMobileMode(true);app.draw();const ms=app.mobileState();'
            'if(!ms.badge.includes("MATCH DAY"))process.exit(5);'
            'console.log("web match ok");'
        )
        run = subprocess.run([node, "-e", script], cwd=ROOT, text=True, capture_output=True, check=True)
        self.assertIn("web match ok", run.stdout)


if __name__ == "__main__":
    unittest.main()
