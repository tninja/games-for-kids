"""Tests for the static GitHub Pages Flappy Bird web game, TypeScript build, and controls."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import shutil
import subprocess
from threading import Thread
import unittest
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
FLAPPY_DOCS = DOCS / "flappybird"
TS_DIR = ROOT / "flappybird/ts"

REQUIRED_FILES = (
    "index.html",
    "flappybird/index.html",
    "flappybird/app.js",
    "flappybird/resources/images/background-day.png",
    "flappybird/resources/images/base.png",
    "flappybird/resources/images/pipe-green.png",
    "flappybird/resources/images/yellowbird-midflap.png",
    "flappybird/resources/audios/wing.wav",
    "flappybird/resources/audios/point.wav",
)

TEXT_FILES = (
    "index.html",
    "flappybird/index.html",
    "flappybird/app.js",
)


def _mock_ctx_js() -> str:
    return (
        'const ctx = {'
        'font: "16px sans-serif", imageSmoothingEnabled: true, globalAlpha: 1,'
        'measureText: (s) => ({ width: String(s).length * 7.2 }),'
        'fillText() {}, fillRect() {}, strokeRect() {}, beginPath() {},'
        'roundRect() {}, rect() {}, fill() {}, stroke() {}, arc() {},'
        'moveTo() {}, lineTo() {}, closePath() {}, drawImage() {},'
        'save() {}, restore() {}, translate() {}, rotate() {}'
        '};'
    )


def _run_node(script: str) -> str:
    node = shutil.which("node")
    if not node:
        raise AssertionError("node is required to run Flappy Bird web tests")
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


class FlappyBirdWebTests(unittest.TestCase):
    def test_static_bundle_files_exist_ascii_and_linked(self) -> None:
        for rel in REQUIRED_FILES:
            path = DOCS / rel
            self.assertTrue(path.is_file(), f"Missing web file: {rel}")
        for rel in TEXT_FILES:
            text = (DOCS / rel).read_text(encoding="utf-8")
            self.assertTrue(text.isascii(), f"Non-ASCII content in {rel}")
            for idx, line in enumerate(text.splitlines(), 1):
                self.assertNotIn("\t", line, f"Tab character in {rel}:{idx}")
                self.assertEqual(line, line.rstrip(), f"Trailing whitespace in {rel}:{idx}")

        landing = (DOCS / "index.html").read_text(encoding="utf-8")
        self.assertIn("flappybird/index.html", landing)

        game_html = (FLAPPY_DOCS / "index.html").read_text(encoding="utf-8")
        self.assertNotIn("user-scalable=no", game_html)
        self.assertIn("viewport-fit=cover", game_html)
        self.assertIn("safe-area-inset", game_html)
        self.assertIn('id="game-canvas"', game_html)
        self.assertIn("app.js", game_html)

    def test_game_start_1p_2p_physics_and_scoring(self) -> None:
        script = (
            'const assert = require("assert");'
            'const fb = require("./docs/flappybird/app.js");'
            'assert.strictEqual(fb.SCREEN_WIDTH, 288);'
            'assert.strictEqual(fb.SCREEN_HEIGHT, 512);'
            'assert.strictEqual(fb.PIPE_GAP_SIZE, 150);'
            'assert.strictEqual(fb.DROPPING_SPEED, 12);'
            'assert.strictEqual(fb.FLAPPING_SPEED, 3);'
            'assert.strictEqual(fb.FLYING_SPEED, 4);'
            'const g1 = new fb.FlappyGame({ seed: 11 });'
            'assert.strictEqual(g1.phase, "start");'
            'g1.startGame("1p");'
            'assert.strictEqual(g1.phase, "playing");'
            'assert.ok(g1.bird1 !== null);'
            'assert.strictEqual(g1.bird2, null);'
            'const y0 = g1.bird1.y;'
            'for (let i = 0; i < 10; i++) g1.step(1 / 60);'
            'assert.ok(g1.bird1.y > y0, "Bird should fall under gravity");'
            'g1.soundsPlayed = [];'
            'g1.flap(1);'
            'assert.strictEqual(g1.bird1.speed, fb.FLAPPING_SPEED);'
            'assert.ok(g1.soundsPlayed.includes("wing"));'
            'const g2 = new fb.FlappyGame({ seed: 22 });'
            'g2.startGame("2p");'
            'assert.strictEqual(g2.mode, "2p");'
            'assert.ok(g2.bird1 !== null && g2.bird2 !== null);'
            'assert.notStrictEqual(g2.bird1.x, g2.bird2.x);'
            'assert.notStrictEqual(g2.bird1.color, g2.bird2.color);'
            'const scoreGame = new fb.FlappyGame({ seed: 33 });'
            'scoreGame.startGame("1p");'
            'scoreGame.bird1.autoFlap = true;'
            'scoreGame.pipes = ['
            '  new fb.Pipe(scoreGame.bird1.x + 12, -260, fb.FLYING_SPEED, "top"),'
            '  new fb.Pipe(scoreGame.bird1.x + 12, 340, fb.FLYING_SPEED, "bottom")'
            '];'
            'scoreGame.bird1.y = 180;'
            'scoreGame.soundsPlayed = [];'
            'for (let i = 0; i < 20; i++) scoreGame.step(1 / 60);'
            'assert.strictEqual(scoreGame.score, 1, "Expected score 1 after passing 1 pipe pair");'
            'assert.ok(scoreGame.soundsPlayed.includes("point"));'
            'console.log("ok");'
        )
        self.assertEqual(_run_node(script).strip(), "ok")

    def test_collisions_gameover_and_restart(self) -> None:
        script = (
            'const assert = require("assert");'
            'const fb = require("./docs/flappybird/app.js");'
            'const st = {};'
            'const storage = { getItem: (k) => st[k] || null, setItem: (k, v) => { st[k] = v; } };'
            'const g = new fb.FlappyGame({ seed: 44, storage });'
            'g.startGame("1p");'
            'g.score = 4;'
            'g.pipes = [];'
            'g.bird1.y = -2;'
            'g.step(1 / 60);'
            'assert.strictEqual(g.phase, "gameover");'
            'assert.ok(g.soundsPlayed.includes("hit"));'
            'assert.ok(g.soundsPlayed.includes("die"));'
            'assert.strictEqual(g.bestScore, 4);'
            'assert.strictEqual(st.flappybird_best_v1, "4");'
            'g.startGame("1p");'
            'assert.strictEqual(g.phase, "playing");'
            'assert.strictEqual(g.score, 0);'
            'assert.strictEqual(g.bestScore, 4);'
            'const p = g.pipes[0];'
            'g.bird1.x = p.x + 10;'
            'g.bird1.y = p.top ? p.y + p.height - 10 : p.y + 10;'
            'g.step(1 / 60);'
            'assert.strictEqual(g.phase, "gameover", "Pipe collision must end game");'
            'console.log("ok");'
        )
        self.assertEqual(_run_node(script).strip(), "ok")

    def test_ai_auto_flap_keeps_bird_alive(self) -> None:
        script = (
            'const assert = require("assert");'
            'const fb = require("./docs/flappybird/app.js");'
            'for (const seed of [1, 7, 42]) {'
            '  const g = new fb.FlappyGame({ seed });'
            '  g.startGame("1p");'
            '  g.toggleAutoFlap(1);'
            '  assert.strictEqual(g.bird1.autoFlap, true);'
            '  for (let frame = 0; frame < 300; frame++) {'
            '    g.step(1 / 60);'
            '  }'
            '  assert.strictEqual(g.phase, "playing", "AI died early on seed " + seed + " at score " + g.score);'
            '  assert.ok(g.score >= 2, "Expected AI to score >= 2, got " + g.score);'
            '}'
            'console.log("ok");'
        )
        self.assertEqual(_run_node(script).strip(), "ok")

    def test_web_app_controls_2p_split_mute_and_rendering(self) -> None:
        script = (
            'const assert = require("assert");'
            'const fb = require("./docs/flappybird/app.js");'
            + _mock_ctx_js() +
            'const app = new fb.FlappyWebApp({ getContext: () => ctx }, { seed: 9 });'
            'app.draw();'
            'assert.strictEqual(app.game.phase, "start");'
            'app.handleKeyDown(" ");'
            'assert.strictEqual(app.game.phase, "playing");'
            'assert.strictEqual(app.game.mode, "1p");'
            'app.handleKeyDown("1");'
            'assert.strictEqual(app.game.bird1.autoFlap, true);'
            'app.handleKeyDown("m");'
            'assert.strictEqual(app.sound.muted, true);'
            'const emittedBeforeMute = app.sound.emittedCount;'
            'app.handleKeyDown(" ");'
            'assert.strictEqual(app.sound.emittedCount, emittedBeforeMute, "Muted app must not emit audio");'
            'app.handleKeyDown("m");'
            'assert.strictEqual(app.sound.muted, false);'
            'app.handleKeyDown("Shift");'
            'app.tick(0.05);'
            'app.draw();'
            'app.game.startGame("2p");'
            'assert.strictEqual(app.game.mode, "2p");'
            'app.handleKeyDown("2");'
            'assert.strictEqual(app.game.bird2.autoFlap, true);'
            'app.game.bird1.speed = 0;'
            'app.game.bird2.speed = 0;'
            'app.handlePointerDown([50, 200]);'
            'assert.strictEqual(app.game.bird1.speed, fb.FLAPPING_SPEED);'
            'assert.strictEqual(app.game.bird2.speed, 0);'
            'app.handlePointerDown([240, 200]);'
            'assert.strictEqual(app.game.bird2.speed, fb.FLAPPING_SPEED);'
            'app.game.phase = "gameover";'
            'app.tick(0.1);'
            'app.draw();'
            'app.handleKeyDown(" ");'
            'assert.strictEqual(app.game.phase, "playing");'
            'console.log("ok");'
        )
        self.assertEqual(_run_node(script).strip(), "ok")

    def test_typescript_sources_typecheck_and_build_sync(self) -> None:
        expected_ts = ("types.ts", "sprites.ts", "game.ts", "assets.ts", "app.ts", "build.mjs")
        for name in expected_ts:
            path = TS_DIR / name
            self.assertTrue(path.is_file(), f"Missing TypeScript file: flappybird/ts/{name}")
            text = path.read_text(encoding="utf-8")
            self.assertTrue(text.isascii(), f"Non-ASCII content in flappybird/ts/{name}")
            for idx, line in enumerate(text.splitlines(), 1):
                self.assertNotIn("\t", line, f"Tab character in flappybird/ts/{name}:{idx}")
                self.assertEqual(line, line.rstrip(), f"Trailing whitespace in flappybird/ts/{name}:{idx}")

        tsc = ROOT / "node_modules/.bin/tsc"
        self.assertTrue(tsc.is_file(), "tsc binary not found")
        tc = subprocess.run([str(tsc), "--noEmit"], cwd=ROOT, capture_output=True, text=True, check=False)
        self.assertEqual(tc.returncode, 0, f"tsc --noEmit failed:\n{tc.stdout}\n{tc.stderr}")

        build_sh = ROOT / "flappybird/build_web.sh"
        self.assertTrue(build_sh.is_file(), "Missing shell script: flappybird/build_web.sh")
        sh_chk = subprocess.run([str(build_sh), "--check"], cwd=ROOT, capture_output=True, text=True, check=False)
        self.assertEqual(sh_chk.returncode, 0, f"build_web.sh --check failed:\n{sh_chk.stdout}\n{sh_chk.stderr}")

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
                    body = resp.read()
                    self.assertGreater(len(body), 20)
        finally:
            server.shutdown()
            server.server_close()


if __name__ == "__main__":
    unittest.main()
