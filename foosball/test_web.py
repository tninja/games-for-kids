"""Tests for the Three.js 3D Foosball web game, bundle hygiene, and HTTP serving."""

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
FOOSBALL_DOCS = DOCS / "foosball"

REQUIRED_FILES = (
    "index.html",
    "foosball/index.html",
    "foosball/app.js",
)

TEXT_FILES = (
    "index.html",
    "foosball/index.html",
    "foosball/app.js",
)


class FoosballWebTests(unittest.TestCase):
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
        self.assertIn("foosball/index.html", landing)

        game_html = (FOOSBALL_DOCS / "index.html").read_text(encoding="utf-8")
        self.assertNotIn("user-scalable=no", game_html)
        self.assertIn("viewport-fit=cover", game_html)
        self.assertIn("safe-area-inset", game_html)
        self.assertIn('id="game-canvas"', game_html)
        self.assertIn("app.js", game_html)

    def test_ts_bundle_is_in_sync(self) -> None:
        node = shutil.which("node")
        self.assertIsNotNone(node, "node is required")
        tsc = ROOT / "node_modules" / ".bin" / "tsc"
        self.assertTrue(tsc.is_file(), "tsc missing in node_modules")
        res_tsc = subprocess.run([str(tsc), "--noEmit"], cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(res_tsc.returncode, 0, f"tsc failed:\n{res_tsc.stdout}\n{res_tsc.stderr}")
        res_sync = subprocess.run(
            [node, str(ROOT / "foosball" / "ts" / "build.mjs"), "--check"],
            cwd=ROOT,
            capture_output=True,
            text=True,
        )
        self.assertEqual(res_sync.returncode, 0, f"bundle out of sync:\n{res_sync.stdout}\n{res_sync.stderr}")

    def test_node_unit_tests_pass(self) -> None:
        node = shutil.which("node")
        self.assertIsNotNone(node, "node is required")
        res = subprocess.run(
            [node, "--test", str(ROOT / "foosball" / "test_foosball.mjs")],
            cwd=ROOT,
            capture_output=True,
            text=True,
        )
        self.assertEqual(res.returncode, 0, f"node tests failed:\n{res.stdout}\n{res.stderr}")

    def test_http_server_serves_foosball_assets(self) -> None:
        handler = partial(SimpleHTTPRequestHandler, directory=str(DOCS))
        server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        port = server.server_address[1]
        thread = Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            for rel in ("foosball/index.html", "foosball/app.js"):
                with urlopen(f"http://127.0.0.1:{port}/{rel}", timeout=5) as resp:
                    self.assertEqual(resp.status, 200)
                    body = resp.read()
                    self.assertGreater(len(body), 100)
        finally:
            server.shutdown()
            server.server_close()


if __name__ == "__main__":
    unittest.main()
