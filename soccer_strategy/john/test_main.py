"""Exercise the actual CLI and rendering boundary."""

import contextlib
import io
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

os.environ["SDL_VIDEODRIVER"] = "dummy"
os.environ["SDL_AUDIODRIVER"] = "dummy"

import pygame

from soccer_strategy.john.main import main, smoke


class MainTests(unittest.TestCase):
    def test_real_smoke_with_and_without_screenshot(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "smoke.png"
            main(["--smoke", "--screenshot", str(path)])
            self.assertGreater(path.stat().st_size, 1000)
            image = pygame.image.load(str(path))
            self.assertEqual(image.get_size(), (1280, 880))
        main(["--smoke"])

    def test_screenshot_flag_requires_smoke(self):
        with contextlib.redirect_stderr(io.StringIO()), self.assertRaises(SystemExit) as error:
            main(["--screenshot", "unused.png"])
        self.assertEqual(error.exception.code, 2)

    def test_normal_entrypoint_exits_on_actual_quit_event(self):
        pygame.display.init()
        pygame.display.set_mode((640, 440))
        pygame.event.post(pygame.event.Event(pygame.QUIT))
        main([])
        self.assertFalse(pygame.display.get_init())

    def test_smoke_failure_propagates_io_error(self):
        with self.assertRaises(pygame.error):
            smoke("/nonexistent-soccer-directory/capture.png")
        pygame.quit()

    def test_smoke_rejects_font_boundary_that_makes_text_overflow(self):
        original = pygame.font.Font
        with patch("pygame.font.Font", side_effect=lambda path, size: original(path, size * 4)):
            with self.assertRaisesRegex(RuntimeError, "Text overflow"):
                smoke()
        pygame.quit()


if __name__ == "__main__":
    unittest.main()
