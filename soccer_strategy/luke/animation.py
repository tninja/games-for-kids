"""Selected-action consequences and separate correct-coach demonstrations."""

from math import dist, pi, sin

from .model import Frame, Picture, Point, mix
from .match_motion import match_attempt, match_failure, match_frame


def attempt_frame(picture: Picture, selected: str | None, fraction: float) -> Frame:
    if selected is None or selected not in picture.choices or selected == picture.answer:
        raise ValueError("An attempt needs a selected wrong choice")
    t = max(0., min(1., fraction))
    if picture.skill == "match":
        return match_attempt(picture, selected, t)
    if picture.skill == "roll":
        return _attempt_roll(picture, selected, t)
    if picture.skill == "loose":
        return _attempt_loose(picture, selected, t)
    keeper = picture.keeper
    pose = selected if picture.skill == "hands" else "ready"
    if picture.skill == "line":
        direction = {"left": -1, "right": 1, "ready": 0}[selected]
        travel = max(10., abs(picture.spot[0] - keeper[0]))
        target = (max(8., min(92., keeper[0] + direction * travel)), keeper[1])
        keeper = mix(keeper, target, min(1., t / .35))
    ball = mix(frame(picture, "choose", 0).ball, picture.spot, min(1., t / .65))
    height = picture.height
    if t > .65:
        u = (t - .65) / .35
        end = (50., 100.) if picture.skill == "line" else (picture.spot[0] + 12, picture.spot[1] - 14)
        ball = mix(picture.spot, end, u)
        height = 0. if picture.skill == "line" else (height + 8 * sin(pi * u)) * (1 - u)
    return Frame(keeper, ball, height, pose)


def _attempt_roll(picture: Picture, selected: str, t: float) -> Frame:
    if t < .35:
        return _lower_for_roll(picture, t)
    target = picture.friends[0 if selected == "roll_left" else 1].position
    blocker = _blocking_point(picture, target)
    if blocker is None:
        return Frame(picture.keeper, mix(picture.source, target, (t - .35) / .65), 0, "ready")
    ball = mix(picture.source, blocker, (t - .35) / .4)
    if t > .75:
        ball = mix(blocker, mix(blocker, picture.source, .16), (t - .75) / .25)
    return Frame(picture.keeper, ball, 0, "ready")


def _blocking_point(picture: Picture, target: Point) -> Point | None:
    dx, dy = target[0] - picture.source[0], target[1] - picture.source[1]
    for blocker in picture.opponents:
        along = ((blocker[0] - picture.source[0]) * dx + (blocker[1] - picture.source[1]) * dy) / max(1., dx * dx + dy * dy)
        if dist(blocker, mix(picture.source, target, along)) <= 4:
            return blocker
    return None


def _attempt_loose(picture: Picture, selected: str, t: float) -> Frame:
    if selected == "ready":
        return Frame(picture.keeper, picture.source, 0, "ready")
    stop = (picture.source[0], picture.source[1] + 6)
    keeper = mix(picture.keeper, stop, min(1., t / .4))
    return Frame(keeper, mix(picture.source, picture.ball_target, min(1., t / .65)), 0, "ready")


def failure_note(picture: Picture, selected: str | None = None) -> str:
    if picture.skill == "match":
        return match_failure(picture, selected)
    if picture.skill == "loose":
        return "The ball is still loose." if picture.spot == picture.ball_target else "The other player arrived first."
    return {"line": "The ball went past.", "hands": "The ball bounced away.",
            "roll": "That path was blocked."}[picture.skill]


def frame(picture: Picture, phase: str, fraction: float) -> Frame:
    t = max(0., min(1., fraction))
    if picture.skill == "match":
        return match_frame(picture, phase, t)
    if phase in ("watch", "choose"):
        if picture.skill == "roll":
            return Frame(picture.keeper, picture.keeper, 35, "hug")
        progress = 1. if phase == "choose" else t
        return Frame(picture.keeper, _watch_ball(picture, progress),
                     picture.height, "ready")
    if phase in ("show", "feedback"):
        t = 1. if phase == "feedback" else t
        if picture.skill == "loose" and picture.ball_target != picture.spot:
            return Frame(picture.keeper, mix(picture.source, picture.ball_target, t), 0, "ready")
        return _roll(picture, t) if picture.skill == "roll" else _catch(picture, t)
    raise ValueError("Unknown animation phase")


def _watch_ball(picture: Picture, t: float) -> Point:
    if picture.skill == "loose":
        return picture.source
    if picture.serve_from is None:
        return mix(picture.source, picture.ball_target, .45 * t)
    if t <= .55:
        return mix(picture.source, picture.serve_from, t / .55)
    return mix(picture.serve_from, picture.ball_target, t - .55)


def _catch(picture: Picture, t: float) -> Frame:
    keeper = mix(picture.keeper, picture.spot, min(1., t / .35))
    start = frame(picture, "choose", 0).ball
    ball = mix(start, picture.ball_target, min(1., t / .7))
    pose = "chest" if picture.height > 0 else "low"
    height = picture.height
    if t < .35:
        pose = "ready"
    if t >= .7:
        pose = "hug"
        height += (35 - height) * (t - .7) / .3
    step = t * 12 if t < .35 and picture.keeper != picture.spot else 0.
    return Frame(keeper, ball, height, pose, step)


def _roll(picture: Picture, t: float) -> Frame:
    if picture.ball_target == picture.source:
        return Frame(picture.keeper, picture.keeper, 35, "hug")
    if t < .35:
        return _lower_for_roll(picture, t)
    ball = mix(picture.source, picture.ball_target, (t - .35) / .65)
    return Frame(picture.keeper, ball, 0, "ready")


def _lower_for_roll(picture: Picture, t: float) -> Frame:
    return Frame(picture.keeper, picture.source, 35 * (1 - t / .35), "roll")
