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
        'font: "16px sans-serif",'
        'measureText: (s) => ({ width: String(s).length * 7.2 }),'
        'fillText() {}, fillRect() {}, strokeRect() {}, beginPath() {},'
        'roundRect() {}, rect() {}, fill() {}, stroke() {}, arc() {},'
        'moveTo() {}, lineTo() {}, closePath() {}, setLineDash() {}'
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
            'const rerollBtn = btns[0].rect;'
            'const beforeClickReroll = JSON.stringify(app.game.player.fleetGroup.fleets.map(f => f.coordinates));'
            'app.handlePointerDown([rerollBtn.x + 10, rerollBtn.y + 10]);'
            'const afterClickReroll = JSON.stringify(app.game.player.fleetGroup.fleets.map(f => f.coordinates));'
            'assert.notStrictEqual(beforeClickReroll, afterClickReroll);'
            'const sizeBtn = app.buttons()[1].rect;'
            'app.handlePointerDown([sizeBtn.x + 10, sizeBtn.y + 10]);'
            'assert.strictEqual(app.game.boardSize, 7);'
            'for (let r = 0; r < 7 && !app.game.gameOver; r++) {'
            '  for (let c = 0; c < 7 && !app.game.gameOver; c++) {'
            '    const cr = app.enemyCellRect(r, c);'
            '    app.handlePointerDown([cr.x + 5, cr.y + 5]);'
            '  }'
            '}'
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
            'const newBtn = app.buttons()[2].rect;'
            'app.handlePointerDown([newBtn.x + 10, newBtn.y + 10]);'
            'assert.strictEqual(app.game.gameOver, false);'
            'assert.strictEqual(app.game.shotsFired, 0);'
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


if __name__ == "__main__":
    unittest.main()
