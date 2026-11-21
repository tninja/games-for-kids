"""Tests for the static GitHub Pages Battleship web game, JS parity, and input controls."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import shutil
import subprocess
from threading import Thread
import unittest
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
REQUIRED_FILES = (
    "index.html",
    "battleship/index.html",
    "battleship/app.js",
)


def _mock_ctx_js() -> str:
    return (
        'const ctx = {'
        'font: "16px sans-serif", globalAlpha: 1,'
        'measureText: (s) => ({ width: String(s).length * 7.2 }),'
        'fillText() {}, fillRect() {}, strokeRect() {}, beginPath() {},'
        'roundRect() {}, rect() {}, fill() {}, stroke() {}, arc() {},'
        'moveTo() {}, lineTo() {}, closePath() {}, setLineDash() {},'
        'save() {}, restore() {}, translate() {}'
        '};'
    )


def _run_node(script: str) -> str:
    node = shutil.which("node")
    if not node:
        raise AssertionError("node is required to run Battleship web tests")
    result = subprocess.run(
        [node, "-e", script],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        raise AssertionError(
            f"Node script failed with code {result.returncode}:\nSTDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
        )
    return result.stdout


class BattleshipWebTests(unittest.TestCase):
    def test_static_bundle_files_exist_ascii_and_linked(self) -> None:
        for rel in REQUIRED_FILES:
            path = DOCS / rel
            self.assertTrue(path.is_file(), f"Missing web file: {rel}")
            text = path.read_text(encoding="utf-8")
            self.assertTrue(text.isascii(), f"Non-ASCII content in {rel}")
            for idx, line in enumerate(text.splitlines(), 1):
                self.assertNotIn("\t", line, f"Tab character in {rel}:{idx}")
                self.assertEqual(line, line.rstrip(), f"Trailing whitespace in {rel}:{idx}")

        landing = (DOCS / "index.html").read_text(encoding="utf-8")
        self.assertIn("battleship/index.html", landing)
        self.assertIn("GAMES FOR KIDS", landing)

        game_html = (DOCS / "battleship/index.html").read_text(encoding="utf-8")
        self.assertNotIn("user-scalable=no", game_html)
        self.assertIn("app.js", game_html)
        self.assertIn('id="game-canvas"', game_html)

    def test_fleet_and_game_model_invariants(self) -> None:
        script = (
            'const assert = require("assert");'
            'const bs = require("./docs/battleship/app.js");'
            'assert.strictEqual(typeof bs.BattleshipGame, "function");'
            'for (const size of [7, 10]) {'
            '  for (let seed = 1; seed <= 5; seed++) {'
            '    const game = new bs.BattleshipGame({ boardSize: size, seed });'
            '    assert.strictEqual(game.boardSize, size);'
            '    assert.strictEqual(game.player.fleetGroup.fleets.length, 5);'
            '    assert.strictEqual(game.computer.fleetGroup.fleets.length, 5);'
            '    const expectedSizes = [5, 4, 3, 3, 3];'
            '    assert.deepStrictEqual(game.player.fleetGroup.fleets.map(f => f.size), expectedSizes);'
            '    for (const side of [game.player, game.computer]) {'
            '      const seen = new Set();'
            '      for (const fleet of side.fleetGroup.fleets) {'
            '        assert.strictEqual(fleet.coordinates.length, fleet.size);'
            '        for (const [r, c] of fleet.coordinates) {'
            '          assert.ok(r >= 0 && r < size && c >= 0 && c < size);'
            '          const key = r + "," + c;'
            '          assert.ok(!seen.has(key), "Overlap at " + key);'
            '          seen.add(key);'
            '        }'
            '      }'
            '    }'
            '  }'
            '}'
            'const g = new bs.BattleshipGame({ boardSize: 7, seed: 42 });'
            'const before = JSON.stringify(g.player.fleetGroup.fleets.map(f => f.coordinates));'
            'assert.strictEqual(g.rerollPlayerFleet(), true);'
            'const after = JSON.stringify(g.player.fleetGroup.fleets.map(f => f.coordinates));'
            'assert.notStrictEqual(before, after);'
            'const shotRes = g.playerFire(0, 0);'
            'assert.strictEqual(shotRes.accepted, true);'
            'assert.strictEqual(g.shotsFired, 1);'
            'assert.strictEqual(g.rerollPlayerFleet(), false);'
            'const dupRes = g.playerFire(0, 0);'
            'assert.strictEqual(dupRes.accepted, false);'
            'assert.strictEqual(dupRes.reason, "already_fired");'
            'assert.strictEqual(g.shotsFired, 1);'
            'console.log("ok");'
        )
        self.assertEqual(_run_node(script).strip(), "ok")

    def test_computer_ai_hunt_target_and_full_game(self) -> None:
        script = (
            'const assert = require("assert");'
            'const bs = require("./docs/battleship/app.js");'
            'const g = new bs.BattleshipGame({ boardSize: 7, seed: 7 });'
            'g.player.fleetGroup.fleets = [new bs.Fleet(3, 2, 4, "horizontal", "battleship")];'
            'g.player.hitHistory = [];'
            'g.player.wasHitHistory = [];'
            'g.computer.hitHistory = [[3, 3, true]];'
            'g.player.fleetGroup.hit(3, 3);'
            'g.player.wasHitHistory.push([3, 3]);'
            'const s1 = g.computer.chooseNextShot(g.player, g.rng);'
            'const dist1 = Math.abs(s1[0] - 3) + Math.abs(s1[1] - 3);'
            'assert.strictEqual(dist1, 1, "Expected orthogonal neighbor after 1 hit");'
            'g.computer.hitHistory = [[3, 3, true], [3, 4, true]];'
            'g.player.fleetGroup.hit(3, 4);'
            'g.player.wasHitHistory.push([3, 4]);'
            'const s2 = g.computer.chooseNextShot(g.player, g.rng);'
            'assert.strictEqual(s2[0], 3, "Expected horizontal line extension");'
            'assert.ok(s2[1] === 2 || s2[1] === 5, "Expected endpoint 2 or 5, got " + s2[1]);'
            'const full = new bs.BattleshipGame({ boardSize: 7, seed: 99 });'
            'const seenPlayerShots = new Set();'
            'for (let r = 0; r < 7 && !full.gameOver; r++) {'
            '  for (let c = 0; c < 7 && !full.gameOver; c++) {'
            '    const key = r + "," + c;'
            '    assert.ok(!seenPlayerShots.has(key));'
            '    seenPlayerShots.add(key);'
            '    full.playerFire(r, c);'
            '  }'
            '}'
            'assert.strictEqual(full.gameOver, true);'
            'assert.ok(full.winner === "You" || full.winner === "Computer");'
            'const compShots = full.computer.hitHistory.map(h => h[0] + "," + h[1]);'
            'assert.strictEqual(new Set(compShots).size, compShots.length, "Computer fired duplicate shot");'
            'let modelUntried = null;'
            'for (let r = 0; r < 7 && !modelUntried; r++) {'
            '  for (let c = 0; c < 7 && !modelUntried; c++) {'
            '    if (!full.player.hasTried(r, c)) modelUntried = [r, c];'
            '  }'
            '}'
            'if (modelUntried) {'
            '  const afterEnd = full.playerFire(modelUntried[0], modelUntried[1]);'
            '  assert.strictEqual(afterEnd.accepted, false);'
            '  assert.strictEqual(afterEnd.reason, "game_over");'
            '}'
            'console.log("ok");'
        )
        self.assertEqual(_run_node(script).strip(), "ok")

    def test_gui_mouse_and_keyboard_controls(self) -> None:
        script = (
            'const assert = require("assert");'
            'const bs = require("./docs/battleship/app.js");'
            + _mock_ctx_js() +
            'const app = new bs.BattleshipWebApp({ getContext: () => ctx }, { seed: 12 });'
            'app.draw();'
            'assert.strictEqual(app.layoutErrors.length, 0, "Initial 7x7 layout errors: " + app.layoutErrors);'
            'assert.strictEqual(app.game.boardSize, 7);'
            'assert.deepStrictEqual(app.cursor, [0, 0]);'
            'app.handleKeyDown("ArrowRight");'
            'app.handleKeyDown("ArrowDown");'
            'assert.deepStrictEqual(app.cursor, [1, 1]);'
            'app.handleKeyDown("d");'
            'app.handleKeyDown("s");'
            'assert.deepStrictEqual(app.cursor, [2, 2]);'
            'app.handleKeyDown("a");'
            'app.handleKeyDown("w");'
            'assert.deepStrictEqual(app.cursor, [1, 1]);'
            'for (let i = 0; i < 10; i++) app.handleKeyDown("ArrowLeft");'
            'assert.strictEqual(app.cursor[1], 0);'
            'const fleetBefore = JSON.stringify(app.game.player.fleetGroup.fleets.map(f => f.coordinates));'
            'app.handleKeyDown("f");'
            'const fleetAfter = JSON.stringify(app.game.player.fleetGroup.fleets.map(f => f.coordinates));'
            'assert.notStrictEqual(fleetBefore, fleetAfter);'
            'app.handleKeyDown("Enter");'
            'assert.strictEqual(app.game.shotsFired, 1);'
            'assert.strictEqual(app.game.computer.hitHistory.length, 1);'
            'app.handleKeyDown(" ");'
            'assert.strictEqual(app.game.shotsFired, 1, "Duplicate shot via Space must be ignored");'
            'assert.ok(app.statusMessage.toLowerCase().includes("already"));'
            'const cellRect = app.enemyCellRect(3, 4);'
            'app.handlePointerMove([cellRect.x + 5, cellRect.y + 5]);'
            'assert.deepStrictEqual(app.hoverCell, [3, 4]);'
            'app.handlePointerDown([cellRect.x + 5, cellRect.y + 5]);'
            'assert.strictEqual(app.game.shotsFired, 2);'
            'assert.deepStrictEqual(app.cursor, [3, 4]);'
            'app.handleKeyDown("g");'
            'app.draw();'
            'assert.strictEqual(app.game.boardSize, 10);'
            'assert.strictEqual(app.layoutErrors.length, 0, "10x10 layout errors: " + app.layoutErrors);'
            'app.handleKeyDown("r");'
            'assert.strictEqual(app.game.shotsFired, 0);'
            'const btns = app.buttons();'
            'const rerollBtn = btns.find(b => b.action === "reroll").rect;'
            'const beforeClickReroll = JSON.stringify(app.game.player.fleetGroup.fleets.map(f => f.coordinates));'
            'app.handlePointerDown([rerollBtn.x + 10, rerollBtn.y + 10]);'
            'const afterClickReroll = JSON.stringify(app.game.player.fleetGroup.fleets.map(f => f.coordinates));'
            'assert.notStrictEqual(beforeClickReroll, afterClickReroll);'
            'const sizeBtn = app.buttons().find(b => b.action === "toggle_size").rect;'
            'app.handlePointerDown([sizeBtn.x + 10, sizeBtn.y + 10]);'
            'assert.strictEqual(app.game.boardSize, 7);'
            'for (let r = 0; r < 7 && !app.game.gameOver; r++) {'
            '  for (let c = 0; c < 7 && !app.game.gameOver; c++) {'
            '    const cr = app.enemyCellRect(r, c);'
            '    app.handlePointerDown([cr.x + 5, cr.y + 5]);'
            '  }'
            '}'
            'app.tick(2.0);'
            'app.draw();'
            'assert.strictEqual(app.game.gameOver, true);'
            'assert.strictEqual(app.layoutErrors.length, 0, "Game-over layout errors: " + app.layoutErrors);'
            'const shotsAtEnd = app.game.shotsFired;'
            'let untried = null;'
            'for (let r = 0; r < 7 && !untried; r++) {'
            '  for (let c = 0; c < 7 && !untried; c++) {'
            '    if (!app.game.player.hasTried(r, c)) untried = [r, c];'
            '  }'
            '}'
            'assert.ok(untried, "Expected at least one untried cell when game ended");'
            'app.cursor = untried;'
            'app.handleKeyDown("Enter");'
            'assert.strictEqual(app.game.shotsFired, shotsAtEnd, "Firing untried cell after gameOver must be ignored");'
            'const newBtn = app.buttons().find(b => b.action === "new_game").rect;'
            'app.handlePointerDown([newBtn.x + 10, newBtn.y + 10]);'
            'assert.strictEqual(app.game.gameOver, false);'
            'assert.strictEqual(app.game.shotsFired, 0);'
            'console.log("ok");'
        )
        self.assertEqual(_run_node(script).strip(), "ok")

    def test_sound_effects_and_mute_toggle(self) -> None:
        script = (
            'const assert = require("assert");'
            'const bs = require("./docs/battleship/app.js");'
            + _mock_ctx_js() +
            'const app = new bs.BattleshipWebApp({ getContext: () => ctx }, { seed: 21 });'
            'assert.strictEqual(app.sound.muted, false);'
            'const soundBtn = app.buttons().find(b => b.action === "toggle_sound");'
            'assert.ok(soundBtn && soundBtn.label.includes("On"));'
            'app.handleKeyDown("m");'
            'assert.strictEqual(app.sound.muted, true);'
            'assert.ok(app.buttons().find(b => b.action === "toggle_sound").label.includes("Off"));'
            'app.handleKeyDown("Enter");'
            'app.tick(1.0);'
            'assert.strictEqual(app.sound.played.length, 0, "Muted sound should not record playback");'
            'const rect = app.buttons().find(b => b.action === "toggle_sound").rect;'
            'app.handlePointerDown([rect.x + 10, rect.y + 10]);'
            'assert.strictEqual(app.sound.muted, false);'
            'app.sound.played = [];'
            'app.handleKeyDown("ArrowRight");'
            'app.handleKeyDown("Enter");'
            'assert.ok(app.sound.played.includes("launch"), "Expected launch sound");'
            'app.tick(1.0);'
            'assert.ok(app.sound.played.some(s => s === "hit" || s === "miss" || s === "sunk"));'
            'console.log("ok");'
        )
        self.assertEqual(_run_node(script).strip(), "ok")

    def test_animations_staging_shake_and_fast_forward(self) -> None:
        script = (
            'const assert = require("assert");'
            'const bs = require("./docs/battleship/app.js");'
            + _mock_ctx_js() +
            'const app = new bs.BattleshipWebApp({ getContext: () => ctx }, { seed: 33 });'
            'app.game.computer.fleetGroup.fleets = ['
            '  new bs.Fleet(0, 0, 2, "horizontal", "destroyer"),'
            '  new bs.Fleet(2, 0, 3, "horizontal", "cruiser")'
            '];'
            'app.handleKeyDown("Enter");'
            'assert.ok(app.projectiles.length >= 1, "Expected player projectile in flight");'
            'assert.strictEqual(app.isEnemyCellRevealed(0, 0), false, "Should wait for impact");'
            'app.tick(0.1);'
            'app.draw();'
            'assert.strictEqual(app.layoutErrors.length, 0);'
            'assert.strictEqual(app.isEnemyCellRevealed(0, 0), false);'
            'app.tick(0.2);'
            'app.draw();'
            'assert.strictEqual(app.isEnemyCellRevealed(0, 0), true, "Enemy cell should reveal on impact");'
            'assert.ok(app.particles.length > 0 || app.ripples.length > 0, "Expected impact particles or ripples");'
            'app.tick(1.5);'
            'app.draw();'
            'assert.strictEqual(app.projectiles.length, 0);'
            'assert.strictEqual(app.particles.length, 0);'
            'assert.strictEqual(app.ripples.length, 0);'
            'assert.strictEqual(app.shakeTime, 0);'
            'app.sound.played = [];'
            'app.handleKeyDown("ArrowRight");'
            'app.handleKeyDown("Enter");'
            'assert.strictEqual(app.isEnemyCellRevealed(0, 1), false);'
            'app.tick(0.25);'
            'assert.strictEqual(app.isEnemyCellRevealed(0, 1), true);'
            'assert.ok(app.shakeTime > 0, "Sinking a ship must trigger screen shake");'
            'assert.ok(app.sound.played.includes("sunk"), "Sinking a ship must trigger sunk sound");'
            'app.tick(1.5);'
            'app.handleKeyDown("ArrowDown");'
            'app.handleKeyDown("Enter");'
            'assert.strictEqual(app.isEnemyCellRevealed(1, 1), false);'
            'app.handleKeyDown("ArrowDown");'
            'app.handleKeyDown("Enter");'
            'assert.strictEqual(app.isEnemyCellRevealed(1, 1), true, "New shot should flush prior visual reveal");'
            'console.log("ok");'
        )
        self.assertEqual(_run_node(script).strip(), "ok")

    def test_mobile_portrait_iphone_layout_and_touch(self) -> None:
        html = (DOCS / "battleship/index.html").read_text(encoding="utf-8")
        self.assertNotIn("user-scalable=no", html)
        self.assertIn('id="mobile-status-bar"', html)
        self.assertIn('id="mobile-panel"', html)
        self.assertIn("safe-area-inset", html)
        script = (
            'const assert = require("assert");'
            'const bs = require("./docs/battleship/app.js");'
            + _mock_ctx_js() +
            'const app = new bs.BattleshipWebApp({ getContext: () => ctx }, { seed: 55 });'
            'app.setMobileMode(true);'
            'assert.strictEqual(app.mobileMode, true);'
            'app.draw();'
            'assert.strictEqual(app.layoutErrors.length, 0, "Mobile 7x7 layout errors: " + app.layoutErrors);'
            'const ep7 = app.enemyPanelRect();'
            'const pp7 = app.playerPanelRect();'
            'assert.ok(ep7.y < pp7.y, "Enemy panel should be stacked above Player panel on mobile");'
            'assert.strictEqual(app.gridMetrics(ep7).cellSize, 66);'
            'const c23 = app.enemyCellRect(2, 3);'
            'app.handlePointerDown([c23.x + 15, c23.y + 15]);'
            'assert.strictEqual(app.game.shotsFired, 1);'
            'assert.strictEqual(app.isEnemyCellRevealed(2, 3), false);'
            'app.tick(1.0);'
            'assert.strictEqual(app.isEnemyCellRevealed(2, 3), true);'
            'const ms = app.mobileState();'
            'assert.strictEqual(ms.buttons.length, 4);'
            'assert.strictEqual(ms.playerFleets.length, 5);'
            'assert.strictEqual(ms.enemyFleets.length, 5);'
            'assert.ok(ms.logs.length >= 1);'
            'assert.strictEqual(ms.buttons.find(b => b.action === "reroll").disabled, true);'
            'app.activate("toggle_size");'
            'app.draw();'
            'assert.strictEqual(app.game.boardSize, 10);'
            'assert.strictEqual(app.gridMetrics(app.enemyPanelRect()).cellSize, 46);'
            'assert.strictEqual(app.layoutErrors.length, 0, "Mobile 10x10 layout errors: " + app.layoutErrors);'
            'app.setMobileMode(false);'
            'app.draw();'
            'assert.strictEqual(app.layoutErrors.length, 0);'
            'console.log("ok");'
        )
        self.assertEqual(_run_node(script).strip(), "ok")

    def test_local_http_serving_delivers_all_static_assets(self) -> None:
        handler = partial(SimpleHTTPRequestHandler, directory=str(DOCS))
        server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        thread = Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            port = server.server_port
            for rel in REQUIRED_FILES:
                with urlopen(f"http://127.0.0.1:{port}/{rel}", timeout=5) as resp:
                    self.assertEqual(resp.status, 200)
                    body = resp.read().decode("utf-8")
                    self.assertGreater(len(body), 20)
        finally:
            server.shutdown()
            server.server_close()

    def test_typescript_sources_typecheck_and_build_sync(self) -> None:
        ts_dir = ROOT / "battleship/ts"
        expected_ts = (
            "types.ts",
            "fleet.ts",
            "game.ts",
            "sound.ts",
            "painter.ts",
            "profile.ts",
            "ships.ts",
            "app.ts",
            "build.mjs",
        )
        for name in expected_ts:
            path = ts_dir / name
            self.assertTrue(path.is_file(), f"Missing TypeScript file: battleship/ts/{name}")
            text = path.read_text(encoding="utf-8")
            self.assertTrue(text.isascii(), f"Non-ASCII content in battleship/ts/{name}")
            for idx, line in enumerate(text.splitlines(), 1):
                self.assertNotIn("\t", line, f"Tab character in battleship/ts/{name}:{idx}")
                self.assertEqual(line, line.rstrip(), f"Trailing whitespace in battleship/ts/{name}:{idx}")

        tsc = ROOT / "node_modules/.bin/tsc"
        self.assertTrue(tsc.is_file(), "tsc binary not found in node_modules/.bin/tsc")
        tc = subprocess.run([str(tsc), "--noEmit"], cwd=ROOT, capture_output=True, text=True, check=False)
        self.assertEqual(tc.returncode, 0, f"tsc --noEmit failed:\n{tc.stdout}\n{tc.stderr}")

        node = shutil.which("node")
        self.assertIsNotNone(node)
        assert node is not None
        chk = subprocess.run([node, "battleship/ts/build.mjs", "--check"], cwd=ROOT, capture_output=True, text=True, check=False)
        self.assertEqual(chk.returncode, 0, f"build.mjs --check failed:\n{chk.stdout}\n{chk.stderr}")

        build_sh = ROOT / "battleship/build_web.sh"
        self.assertTrue(build_sh.is_file(), "Missing shell script: battleship/build_web.sh")
        sh_text = build_sh.read_text(encoding="utf-8")
        self.assertTrue(sh_text.isascii(), "Non-ASCII content in battleship/build_web.sh")
        for idx, line in enumerate(sh_text.splitlines(), 1):
            self.assertNotIn("\t", line, f"Tab character in battleship/build_web.sh:{idx}")
            self.assertEqual(line, line.rstrip(), f"Trailing whitespace in battleship/build_web.sh:{idx}")
        sh_chk = subprocess.run([str(build_sh), "--check"], cwd=ROOT, capture_output=True, text=True, check=False)
        self.assertEqual(sh_chk.returncode, 0, f"build_web.sh --check failed:\n{sh_chk.stdout}\n{sh_chk.stderr}")

    def test_kids_ai_tiers_placement_skills_and_rules(self) -> None:
        script = (
            'const assert = require("assert");'
            'const bs = require("./docs/battleship/app.js");'
            + _mock_ctx_js() +
            'for (const diff of ["easy", "normal", "hard"]) {'
            '  const g = new bs.BattleshipGame({ boardSize: 7, seed: 71, difficulty: diff });'
            '  assert.strictEqual(g.captainInfo().difficulty, diff);'
            '  const shot = g.computer.chooseNextShot(g.player, g.rng);'
            '  assert.ok(shot[0] >= 0 && shot[0] < 7 && shot[1] >= 0 && shot[1] < 7);'
            '}'
            'const app = new bs.BattleshipWebApp({ getContext: () => ctx }, { seed: 88, persistProfile: false });'
            'app.activate("toggle_place");'
            'assert.strictEqual(app.phase(), "place");'
            'app.draw();'
            'assert.strictEqual(app.layoutErrors.length, 0, "Placement layout errors: " + app.layoutErrors);'
            'app.handleKeyDown("t");'
            'assert.strictEqual(app.placeDirection, "vertical");'
            'app.selectedShipName = "carrier";'
            'app.placeDirection = "horizontal";'
            'app.game.player.fleetGroup.fleets = ['
            '  new bs.Fleet(0, 0, 5, "horizontal", "carrier"),'
            '  new bs.Fleet(2, 0, 4, "horizontal", "battleship"),'
            '  new bs.Fleet(3, 0, 3, "horizontal", "cruiser"),'
            '  new bs.Fleet(4, 0, 3, "horizontal", "submarine"),'
            '  new bs.Fleet(5, 0, 3, "horizontal", "destroyer")'
            '];'
            'assert.strictEqual(app.placeSelectedShipAt(1, 0), true);'
            'assert.strictEqual(app.placeSelectedShipAt(1, 0), false, "Overlap must fail");'
            'app.activate("finish_place");'
            'assert.strictEqual(app.phase(), "battle");'
            'app.game.computer.fleetGroup.fleets = ['
            '  new bs.Fleet(1, 1, 3, "horizontal", "cruiser"),'
            '  new bs.Fleet(5, 0, 2, "horizontal", "destroyer")'
            '];'
            'app.activate("select_sonar");'
            'assert.strictEqual(app.weapon, "sonar");'
            'app.draw();'
            'assert.strictEqual(app.layoutErrors.length, 0);'
            'const sRes = app.useSonarAt(1, 2);'
            'assert.strictEqual(sRes.accepted, true);'
            'assert.strictEqual(sRes.count, 3);'
            'assert.strictEqual(app.game.sonarLeft[0], 1);'
            'assert.ok(app.sound.played.includes("sonar"));'
            'const sAgain = app.useSonarAt(0, 0);'
            'assert.strictEqual(sAgain.accepted, false);'
            'app.activate("select_bomb");'
            'assert.strictEqual(app.weapon, "bomb");'
            'app.draw();'
            'assert.strictEqual(app.layoutErrors.length, 0);'
            'const bRes = app.fireAt(1, 2);'
            'assert.strictEqual(bRes.accepted, true);'
            'assert.strictEqual(app.game.bombLeft[0], 0);'
            'app.tick(1.0);'
            'assert.ok(app.sound.played.includes("bomb"));'
            'const stGame = new bs.BattleshipGame({ boardSize: 7, seed: 5, ruleMode: "streak" });'
            'stGame.computer.fleetGroup.fleets = [new bs.Fleet(0, 0, 3, "horizontal", "cruiser")];'
            'const h1 = stGame.playerFire(0, 0);'
            'assert.strictEqual(h1.bonusTurn, true);'
            'assert.strictEqual(stGame.computer.hitHistory.length, 0, "Streak hit keeps turn");'
            'const slGame = new bs.BattleshipGame({ boardSize: 7, seed: 6, ruleMode: "salvo" });'
            'const sShot1 = slGame.playerFire(0, 0);'
            'assert.strictEqual(sShot1.bonusTurn, true);'
            'assert.strictEqual(sShot1.salvoRemaining, 4);'
            'console.log("ok");'
        )
        self.assertEqual(_run_node(script).strip(), "ok")

    def test_2p_handoff_helper_mode_and_progression(self) -> None:
        script = (
            'const assert = require("assert");'
            'const bs = require("./docs/battleship/app.js");'
            + _mock_ctx_js() +
            'const app = new bs.BattleshipWebApp({ getContext: () => ctx }, { seed: 91, playMode: "2p", persistProfile: false });'
            'assert.strictEqual(app.phase(), "place");'
            'app.draw();'
            'assert.strictEqual(app.layoutErrors.length, 0);'
            'app.activate("finish_place");'
            'assert.strictEqual(app.phase(), "handoff");'
            'app.draw();'
            'assert.strictEqual(app.layoutErrors.length, 0);'
            'app.handleKeyDown(" ");'
            'assert.strictEqual(app.phase(), "place");'
            'assert.strictEqual(app.placingSide, 1);'
            'app.activate("finish_place");'
            'assert.strictEqual(app.phase(), "handoff");'
            'app.activate("confirm_handoff");'
            'assert.strictEqual(app.phase(), "battle");'
            'assert.strictEqual(app.game.activePlayerIndex, 0);'
            'const f1 = app.fireAt(0, 0);'
            'assert.strictEqual(f1.accepted, true);'
            'assert.strictEqual(app.phase(), "handoff");'
            'app.activate("confirm_handoff");'
            'assert.strictEqual(app.game.activePlayerIndex, 1);'
            'const hApp = new bs.BattleshipWebApp({ getContext: () => ctx }, { seed: 44, helperMode: true, difficulty: "hard", persistProfile: false });'
            'hApp.game.computer.fleetGroup.fleets = [new bs.Fleet(6, 4, 3, "horizontal", "cruiser")];'
            'for (let c = 0; c < 4; c++) { hApp.fireAt(0, c); hApp.tick(1.0); }'
            'assert.ok(hApp.game.helperHint() !== null, "Expected helper hint after 4 misses");'
            'hApp.fireAt(6, 4); hApp.tick(1.0);'
            'hApp.fireAt(6, 5); hApp.tick(1.0);'
            'hApp.fireAt(6, 6); hApp.tick(1.0);'
            'assert.strictEqual(hApp.game.gameOver, true);'
            'assert.ok(hApp.summary !== null);'
            'assert.ok(hApp.summary.stars >= 1);'
            'assert.ok(hApp.profile.data.badges.includes("first_win"));'
            'assert.ok(hApp.profile.data.badges.includes("admiral_slayer"));'
            'hApp.draw();'
            'assert.strictEqual(hApp.layoutErrors.length, 0);'
            'hApp.setMobileMode(true);'
            'hApp.draw();'
            'assert.strictEqual(hApp.layoutErrors.length, 0);'
            'console.log("ok");'
        )
        self.assertEqual(_run_node(script).strip(), "ok")


if __name__ == "__main__":
    unittest.main()
