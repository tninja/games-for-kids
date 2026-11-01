"""Fact-driven match motion and selected-action teaching consequences."""

from dataclasses import replace
from math import dist

from .model import Frame, Friend, Picture, Point, mix


def opponents(p: Picture, progress: float) -> tuple[Point, ...]:
    points = p.opponents
    if p.opponent_to is not None:
        points = (mix(points[0], p.opponent_to, progress), *points[1:])
    return points


def watch(p: Picture, t: float) -> Frame:
    actors = opponents(p, t)
    if p.play == "distribute":
        return Frame(p.keeper, p.keeper, 35, "hug", opponents=actors)
    if p.play == "close":
        ball = (actors[0][0], actors[0][1] + 4)
    elif p.play == "shot":
        if p.serve_from is not None and t < .6:
            ball = mix(p.source, p.serve_from, t / .6)
        else:
            progress = (t - .6) / .4 if p.serve_from is not None else t
            ball = mix(p.incoming_source, p.spot, .1 * progress)
    else:
        ball = mix(p.ball_start or p.source, p.source, t)
    return Frame(p.keeper, ball, p.height, "ready", opponents=actors)


def _receive(p: Picture, t: float) -> Frame:
    keeper = mix(p.keeper, p.spot, t / .35)
    start = watch(p, 1).ball
    progress = (t - .2) / .6 if p.play == "recover" else t / .8
    ball = mix(start, p.spot, progress)
    pose = "ready" if t < .35 else "low"
    height = p.height
    if t >= .8:
        pose = "hug"
        height = p.height + (35 - p.height) * (t - .8) / .2
    return Frame(keeper, ball, height, pose, t * 8 if t < .35 else 0)


def _feet(p: Picture, t: float) -> Frame:
    keeper = mix(p.keeper, p.spot, t / .45)
    ball = mix(p.source, p.ball_target, (t - .55) / .45)
    pose = "kick" if .45 <= t <= .68 else "ready"
    return Frame(keeper, ball, 0, pose, t * 8 if t < .45 else 0)


def _interceptor(p: Picture, target: Point) -> Point | None:
    start = p.source
    dx, dy = target[0] - start[0], target[1] - start[1]
    for actor in opponents(p, 1):
        along = ((actor[0] - start[0]) * dx + (actor[1] - start[1]) * dy) / max(1., dx * dx + dy * dy)
        if 0 < along < 1 and dist(actor, mix(start, target, along)) < 4:
            return actor
    return None


def _distribution(p: Picture, selected: str | None, t: float) -> Frame:
    if t < .35:
        return Frame(p.keeper, p.source, 35 * (1 - t / .35), "roll")
    target = p.ball_target
    if selected is not None:
        friend = _recipient(p, selected)
        target = _interceptor(p, friend.position) or friend.position
        if not friend.ready:
            target = (friend.position[0] + 6, friend.position[1] - 8)
    return Frame(p.keeper, mix(p.source, target, (t - .35) / .65), 0, "ready")


def _support(p: Picture, selected: str | None, t: float) -> Frame:
    target = p.spot if selected is None else p.keeper if selected == "ready" else (44, 74)
    keeper = mix(p.keeper, target, t / .35)
    end = target if selected is None else _interceptor(p, target) or target
    return Frame(keeper, mix(p.source, end, (t - .4) / .4), 0, "ready")


def _correct(p: Picture, t: float) -> Frame:
    if p.play == "close":
        return Frame(mix(p.keeper, p.spot, t / .6), watch(p, 1).ball, 0, "ready", t * 8)
    if p.play == "feet":
        return _feet(p, t)
    if p.play == "distribute":
        return _distribution(p, None, t)
    if p.play == "support":
        return _support(p, None, t)
    return _receive(p, t)


def match_frame(p: Picture, phase: str, t: float) -> Frame:
    if phase in ("watch", "choose"):
        return watch(p, 1. if phase == "choose" else t)
    if phase not in ("show", "feedback"):
        raise ValueError("Unknown animation phase")
    t = 1. if phase == "feedback" else t
    return replace(_correct(p, t), opponents=_shot_actors(p, t))


def _shot_actors(p: Picture, t: float) -> tuple[Point, ...]:
    actors = opponents(p, 1)
    if p.play == "recover":
        actors = (mix(actors[0], (p.source[0], p.source[1] - 4), t / .2), *actors[1:])
    return actors


def _miss(p: Picture, selected: str, t: float) -> Frame:
    targets = {"rush": (p.incoming_source[0], p.incoming_source[1] + 10),
               "collect": (p.source[0], watch(p, 1).ball[1] + 12),
               "cover_left": (25, 83), "cover_right": (75, 83),
               "support": (22, 73), "back": (50, 95)}
    keeper = mix(p.keeper, targets.get(selected, p.keeper), t / .35)
    pose = {"jump": "jump", "celebrate": "cheer"}.get(selected, "ready")
    start = watch(p, 1).ball
    origin = p.incoming_source
    end = start
    if p.play in ("shot", "recover"):
        ratio = (100 - origin[1]) / (p.spot[1] - origin[1])
        end = (origin[0] + (p.spot[0] - origin[0]) * ratio, 100)
    progress = (t - .2) / .8 if p.play == "recover" else t
    ball = mix(start, end, progress)
    return Frame(keeper, ball, 0, pose, t)


def match_attempt(p: Picture, selected: str, t: float) -> Frame:
    if p.play == "distribute":
        view = _distribution(p, selected, t)
    elif p.play == "support":
        view = _support(p, selected, t)
    elif p.play == "feet" and selected == "collect":
        view = _receive(p, t)
    else:
        view = _miss(p, selected, t)
    return replace(view, opponents=_shot_actors(p, t))


def match_failure(p: Picture, selected: str | None) -> str:
    if p.play == "distribute":
        if selected is None:
            return "Look for a ready friend and a clear lane."
        friend = _recipient(p, selected)
        return "A player reached that roll." if friend.ready else "The friend was not ready."
    return {"shot": "Get balanced on the shot line.",
            "close": "Keep space to react. Do not grab a controlled ball.",
            "collect": "The ball is still loose.",
            "recover": "Recover before the next shot.",
            "feet": "Use feet outside your area.",
            "support": "The passing lane stayed blocked."}[p.play]


def _recipient(p: Picture, selected: str) -> Friend:
    label = {"roll_left": "L", "roll_middle": "C", "roll_right": "R"}[selected]
    return {friend.label: friend for friend in p.friends}[label]
