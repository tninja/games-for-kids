"""Tests for the Three.js Flappy Bird 3D web game, camera views, and TypeScript build."""

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
FLAPPY3D_DOCS = DOCS / "flappybird3d"
TS_DIR = ROOT / "flappybird/ts"

REQUIRED_FILES = (
    "index.html",
    "flappybird3d/index.html",
    "flappybird3d/app.js",
    "flappybird/resources/audios/wing.wav",
)

TEXT_FILES = (
    "index.html",
    "flappybird3d/index.html",
    "flappybird3d/app.js",
)


def _run_node(script: str) -> str:
    node = shutil.which("node")
    if not node:
        raise AssertionError("node is required to run Flappy Bird 3D tests")
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


class FlappyBird3DTests(unittest.TestCase):
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
        self.assertIn("flappybird3d/index.html", landing)

        game_html = (FLAPPY3D_DOCS / "index.html").read_text(encoding="utf-8")
        self.assertNotIn("user-scalable=no", game_html)
        self.assertIn("viewport-fit=cover", game_html)
        self.assertIn("safe-area-inset", game_html)
        self.assertIn('id="game-canvas"', game_html)
        self.assertIn("app.js", game_html)

    def test_3d_coordinate_mapping_and_camera_toggle(self) -> None:
        script = (
            'const assert = require("assert");'
            'const fb3d = require("./docs/flappybird3d/app.js");'
            'const yHigh = fb3d.worldY(100);'
            'const yLow = fb3d.worldY(350);'
            'assert.ok(yHigh > yLow, "Higher screen position must map to higher 3D Y");'
            'assert.ok(Math.abs(fb3d.worldY(fb3d.BASE_Y)) < 1e-6, "Ground BASE_Y must map to Y=0");'
            'const canvas = { clientWidth: 360, clientHeight: 640 };'
            'const app = new fb3d.Flappy3DApp(canvas, { seed: 11, headless: true });'
            'assert.strictEqual(app.cameraMode, "chase");'
            'const chasePose = app.computeCameraPose();'
            'assert.ok(chasePose.position[0] < chasePose.target[0], "Chase camera must sit behind bird looking +X");'
            'app.handleKeyDown("v");'
            'assert.strictEqual(app.cameraMode, "side");'
            'const sidePose = app.computeCameraPose();'
            'assert.ok(sidePose.position[2] > sidePose.target[2], "Side camera must sit on +Z looking at playfield");'
            'app.handleKeyDown("V");'
            'assert.strictEqual(app.cameraMode, "chase");'
            'console.log("ok");'
        )
        self.assertEqual(_run_node(script).strip(), "ok")

    def test_3d_gameplay_1p_2p_ai_mute_touch_and_scene_sync(self) -> None:
        script = (
            'const assert = require("assert");'
            'const fb3d = require("./docs/flappybird3d/app.js");'
            'const st = {};'
            'const storage = { getItem: (k) => st[k] || null, setItem: (k, v) => { st[k] = v; } };'
            'const canvas = { clientWidth: 360, clientHeight: 640 };'
            'const app = new fb3d.Flappy3DApp(canvas, { seed: 7, storage, headless: true });'
            'app.render();'
            'assert.strictEqual(app.game.phase, "start");'
            'app.handleKeyDown(" ");'
            'assert.strictEqual(app.game.phase, "playing");'
            'app.handleKeyDown("1");'
            'assert.strictEqual(app.game.bird1.autoFlap, true);'
            'for (let i = 0; i < 180; i++) { app.tick(1 / 60); }'
            'app.render();'
            'assert.strictEqual(app.game.phase, "playing");'
            'assert.ok(app.uiState().score >= 1);'
            'assert.ok(app.sceneStats().pipeMeshes >= 2);'
            'assert.strictEqual(app.sceneStats().hasBird2, false);'
            'app.handleKeyDown("m");'
            'assert.strictEqual(app.sound.muted, true);'
            'const emittedBefore = app.sound.emittedCount;'
            'app.handleKeyDown(" ");'
            'assert.strictEqual(app.sound.emittedCount, emittedBefore);'
            'app.handleKeyDown("m");'
            'app.activate("start_2p");'
            'app.render();'
            'assert.strictEqual(app.game.mode, "2p");'
            'assert.strictEqual(app.sceneStats().hasBird2, true);'
            'app.game.bird1.speed = 0;'
            'app.game.bird2.speed = 0;'
            'app.handlePointerDown(60, 360);'
            'assert.strictEqual(app.game.bird1.speed, fb3d.FLAPPING_SPEED);'
            'assert.strictEqual(app.game.bird2.speed, 0);'
            'app.handlePointerDown(300, 360);'
            'assert.strictEqual(app.game.bird2.speed, fb3d.FLAPPING_SPEED);'
            'app.game.score = 6;'
            'app.game.bird1.y = -5;'
            'app.tick(1 / 60);'
            'assert.strictEqual(app.game.phase, "gameover");'
            'assert.strictEqual(app.uiState().bestScore, 6);'
            'app.handleKeyDown(" ");'
            'assert.strictEqual(app.game.phase, "playing");'
            'console.log("ok");'
        )
        self.assertEqual(_run_node(script).strip(), "ok")

    def test_typescript_sources_typecheck_and_3d_build_sync(self) -> None:
        for name in ("scene3d.ts", "app3d.ts", "build3d.mjs"):
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

        build_sh = ROOT / "flappybird/build_3d.sh"
        self.assertTrue(build_sh.is_file(), "Missing shell script: flappybird/build_3d.sh")
        sh_chk = subprocess.run([str(build_sh), "--check"], cwd=ROOT, capture_output=True, text=True, check=False)
        self.assertEqual(sh_chk.returncode, 0, f"build_3d.sh --check failed:\n{sh_chk.stdout}\n{sh_chk.stderr}")

    def test_local_http_serving_delivers_all_3d_assets(self) -> None:
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
