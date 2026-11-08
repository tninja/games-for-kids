"""Exercise the real CLI and headless smoke, including failure boundaries."""

import contextlib
import io
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

os.environ["SDL_VIDEODRIVER"] = "dummy"
os.environ["SDL_AUDIODRIVER"] = "dummy"
os.environ["PYGAME_HIDE_SUPPORT_PROMPT"] = "1"

import pygame

from soccer_strategy.soccer_smarter.main import main, smoke


class MainTests(unittest.TestCase):
    def test_smoke_with_and_without_screenshot(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "feedback.png"
            main(["--smoke", "--screenshot", str(target)])
            self.assertGreater(target.stat().st_size, 1000)
            self.assertEqual(pygame.image.load(str(target)).get_size(), (1280, 880))
        main(["--smoke"])

    def test_cli_normal_quit_and_invalid_screenshot_flag(self):
        with contextlib.redirect_stderr(io.StringIO()), self.assertRaises(SystemExit) as error:
            main(["--screenshot", "unused.png"])
        self.assertEqual(error.exception.code, 2)
        pygame.display.init()
        pygame.display.set_mode((640, 440))
        pygame.event.post(pygame.event.Event(pygame.QUIT))
        main([])
        self.assertFalse(pygame.display.get_init())

    def test_smoke_detects_real_font_overflow(self):
        original = pygame.font.Font
        for target in (None, 25):
            with patch("pygame.font.Font", side_effect=lambda path, size: original(
                    path, size * 4 if target is None or size == target else size)):
                with self.assertRaisesRegex(RuntimeError, "Text overflow"):
                    smoke()
        pygame.quit()


if __name__ == "__main__":
    unittest.main()
