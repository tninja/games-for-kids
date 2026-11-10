"""Command-line entry point and headless SDL smoke execution."""

import argparse
import os
from pathlib import Path


def smoke(screenshot: str | None = None) -> None:
    """Exercise menu, tactical round, coach comparison, retry, practice cards, and quit."""
    os.environ["SDL_VIDEODRIVER"] = "dummy"
    os.environ["SDL_AUDIODRIVER"] = "dummy"
    import pygame

    from .app import App

    app = App()
    app.draw()
    for action in ("cards:0", "card_next", "stage:1", "skip", "choice:0", "skip",
                   "coach", "skip", "retry", "skip", "choice:1", "skip", "book",
                   "book_category:skills", "book_entry:36", "card_replay", "card_next",
                   "book_category:tactics", "book_entry:75", "skip", "choice:1", "skip",
                   "coach", "skip", "retry", "skip", "choice:0", "skip", "book_back",
                   "book_entry:90", "skip", "choice:0", "skip", "continuous",
                   "play_next", "play_family:7", "skip", "choice:0", "skip",
                   "coach", "skip", "retry", "skip", "choice:1", "skip", "next",
                   "skip", "choice:0", "skip"):
        app.activate(action)
        app.draw()
        if app.layout_errors:
            raise RuntimeError(f"Text overflow: {app.layout_errors}")
    if screenshot:
        pygame.image.save(app.canvas, str(Path(screenshot)))
    pygame.event.post(pygame.event.Event(pygame.QUIT))
    app.run()
    print("SDL smoke: menu, choices, coach, retry, cards, book topics, offside, patterns, continuous branches and quit passed")


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Soccer Smart Lab: tactical decision trainer")
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
