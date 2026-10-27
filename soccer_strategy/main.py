"""Command-line entry point and real SDL smoke execution."""

import argparse
import os
from pathlib import Path


def smoke(screenshot: str | None = None) -> None:
    """Exercise real event handling, drawing, retry and the application's loop."""
    os.environ["SDL_VIDEODRIVER"] = "dummy"
    os.environ["SDL_AUDIODRIVER"] = "dummy"
    import pygame

    from .app import App

    app = App()
    app.draw()
    for action in ("stage:1", "skip", "choice:0", "skip", "retry", "skip",
                   "choice:1", "skip"):
        app.activate(action)
        app.draw()
        if app.layout_errors:
            raise RuntimeError(f"Text overflow: {app.layout_errors}")
    if screenshot:
        pygame.image.save(app.canvas, str(Path(screenshot)))
    pygame.event.post(pygame.event.Event(pygame.QUIT))
    app.run()
    print("SDL smoke: menu, choice, feedback, retry and quit passed")


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Left Back Lab: soccer decision training")
    parser.add_argument("--smoke", action="store_true", help="Run a headless SDL smoke test")
    parser.add_argument("--screenshot", help="Save the smoke test feedback screen as a PNG")
    args = parser.parse_args(argv)
    if args.screenshot and not args.smoke:
        parser.error("--screenshot requires --smoke")
    if args.smoke:
        smoke(args.screenshot)
    else:
        from .app import App
        App().run()
