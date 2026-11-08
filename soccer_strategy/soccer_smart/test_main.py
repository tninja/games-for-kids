"""Exercise the CLI and headless SDL smoke boundary."""

import contextlib
import io
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

os.environ["SDL_VIDEODRIVER"] = "dummy"
os.environ["SDL_AUDIODRIVER"] = "dummy"
os.environ["PYGAME_HIDE_SUPPORT_PROMPT"] = "1"

import pygame

from soccer_strategy.soccer_smart.main import main, smoke


class MainTests(unittest.TestCase):
    def test_real_smoke_with_and_without_screenshot(self) -> None:
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "smoke.png"
            main(["--smoke", "--screenshot", str(path)])
            self.assertGreater(path.stat().st_size, 1000)
            image = pygame.image.load(str(path))
            self.assertEqual(image.get_size(), (1280, 880))
        main(["--smoke"])

    def test_screenshot_flag_requires_smoke(self) -> None:
        with contextlib.redirect_stderr(io.StringIO()), self.assertRaises(SystemExit) as error:
            main(["--screenshot", "unused.png"])
        self.assertEqual(error.exception.code, 2)

    def test_normal_entrypoint_exits_on_actual_quit_event(self) -> None:
        pygame.display.init()
        pygame.display.set_mode((640, 440))
        pygame.event.post(pygame.event.Event(pygame.QUIT))
        main([])
        self.assertFalse(pygame.display.get_init())

    def test_smoke_rejects_font_boundary_that_makes_text_overflow(self) -> None:
        original = pygame.font.Font
        with patch("pygame.font.Font", side_effect=lambda path, size: original(path, size * 4)):
            with self.assertRaisesRegex(RuntimeError, "Text overflow"):
                smoke()
        pygame.quit()


if __name__ == "__main__":
    unittest.main()
