"""Launch Luke's practice game and its real SDL smoke exercise."""


import argparse
import os
from pathlib import Path


def smoke(screenshot: str | None = None, seed: int = 0, muted: bool = False) -> None:
    os.environ["SDL_VIDEODRIVER"] = "dummy"
    os.environ["SDL_AUDIODRIVER"] = "dummy"
    import pygame
    from .app import App

    app = App(seed, muted)
    try:
        _checked_draw(app)
        app.activate("bounce")
        app.tick(.25)
        _checked_draw(app)
        for action in ("play:all", "skip", "choice:0"):
            app.activate(action)
            _checked_draw(app)
        _finish_demo(app)
        app.activate("highfive")
        app.tick(.25)
        _checked_draw(app)
        for action in ("replay", "retry", "skip", "choice:1"):
            app.activate(action)
            _checked_draw(app)
            if action in ("replay", "choice:1"):
                _finish_demo(app)
        if screenshot:
            pygame.image.save(app.canvas, str(Path(screenshot)))
        for _ in range(5):
            for action in ("next", "skip", "choice:0"):
                app.activate(action)
                _checked_draw(app)
            _finish_demo(app)
        app.activate("next")
        _checked_draw(app)
        app.activate("bounce")
        app.tick(.25)
        _checked_draw(app)
        pygame.event.post(pygame.event.Event(pygame.QUIT))
        app.run()
    finally:
        pygame.quit()
    print("Luke SDL smoke: menu, choice, attempt, coach, replay, retry, summary and quit passed")


def _finish_demo(app) -> None:
    while app.session.phase in ("attempt", "show"):
        app.activate("skip")
        _checked_draw(app)


def _checked_draw(app) -> None:
    app.draw()
    if app.layout_errors:
        raise RuntimeError(f"Text overflow: {app.layout_errors}")


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Luke's Keeper Club: gentle goalkeeper practice")
    parser.add_argument("--smoke", action="store_true", help="Run the real headless SDL exercise")
    parser.add_argument("--screenshot", help="Save a smoke feedback PNG")
    parser.add_argument("--seed", type=int, help="Choose a repeatable practice order; default is fresh")
    parser.add_argument("--mute", action="store_true", help="Start with sound muted")
    args = parser.parse_args(argv)
    if args.screenshot and not args.smoke:
        parser.error("--screenshot requires --smoke")
    if args.smoke:
        smoke(args.screenshot, 0 if args.seed is None else args.seed, args.mute)
    else:
        from .app import App
        App(args.seed, args.mute).run()
