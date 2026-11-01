"""Entry point, screenshots and fail-closed smoke execution."""

import contextlib
import io
import os
from pathlib import Path
import tempfile
import unittest

os.environ["SDL_VIDEODRIVER"] = "dummy"
os.environ["SDL_AUDIODRIVER"] = "dummy"
os.environ["PYGAME_HIDE_SUPPORT_PROMPT"] = "1"

import pygame

from soccer_strategy.luke.main import main, smoke
from soccer_strategy.luke.model import ACTIONS


class MainTests(unittest.TestCase):
    def tearDown(self):
        pygame.quit()

    def test_cli_smoke_saves_a_real_feedback_picture(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "feedback.png"
            main(["--smoke", "--seed", "2", "--screenshot", str(path)])
            self.assertTrue(path.exists())
            self.assertTrue(path.read_bytes().startswith(b"\x89PNG"))

    def test_smoke_without_screenshot_and_the_normal_loop(self):
        smoke()
        pygame.display.init()
        pygame.event.post(pygame.event.Event(pygame.QUIT))
        main([])
        self.assertFalse(pygame.display.get_init())

    def test_screenshot_requires_smoke_mode(self):
        with contextlib.redirect_stderr(io.StringIO()), self.assertRaises(SystemExit) as error:
            main(["--screenshot", "/tmp/not-a-game-save.png"])
        self.assertEqual(error.exception.code, 2)

    def test_cli_accepts_a_muted_smoke(self):
        main(["--smoke", "--mute"])

    def test_smoke_rejects_real_text_overflow(self):
        original = dict(ACTIONS)
        try:
            for key in ACTIONS:
                ACTIONS[key] = "Too much text " * 30
            with self.assertRaises(RuntimeError):
                smoke()
        finally:
            ACTIONS.clear()
            ACTIONS.update(original)
