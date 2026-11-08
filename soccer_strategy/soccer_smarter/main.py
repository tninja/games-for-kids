"""CLI and real headless SDL exercise of the advanced game."""

import argparse
import os


def smoke(screenshot: str | None = None) -> None:
    os.environ["SDL_VIDEODRIVER"] = "dummy"
    os.environ["SDL_AUDIODRIVER"] = "dummy"
    import pygame

    from .app import App

    app = App()
    actions = ("mission:M02", "skip", "choice:0", "skip", "coach", "skip", "retry", "skip",
               "choice:1", "skip", "next", "skip", "choice:1", "skip", "next", "skip",
               "choice:0", "skip", "next", "notebook", "journal:X01", "note:0", "note:0",
               "note:1", "resume", "mission:M04", "predict:1", "skip", "choice:0", "skip",
               "next", "pause", "step", "skip", "choice:0", "skip")
    try:
        app.draw()
        if app.layout_errors:
            raise RuntimeError(f"Text overflow: {app.layout_errors}")
        for index, action in enumerate(actions):
            app.activate(action)
            app.draw()
            if app.layout_errors:
                raise RuntimeError(f"Text overflow: {app.layout_errors}")
            if screenshot and index == 3:
                pygame.image.save(app.canvas, screenshot)
        pygame.event.post(pygame.event.Event(pygame.QUIT))
        app.run()
    finally:
        pygame.quit()
    print("SDL smoke: curved route, branches, coach, retry, notebook, prediction, pause and quit passed")


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Soccer Smarter Lab - advanced soccer decisions")
    parser.add_argument("--smoke", action="store_true", help="Run a real headless SDL smoke test")
    parser.add_argument("--screenshot", help="Save smoke feedback as a PNG")
    args = parser.parse_args(argv)
    if args.screenshot and not args.smoke:
        parser.error("--screenshot requires --smoke")
    if args.smoke:
        smoke(args.screenshot)
    else:
        from .app import App
        App().run()
