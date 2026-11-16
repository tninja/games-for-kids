"""Shared pure geometry and construction for authored continuous-play pictures."""

from dataclasses import replace
from math import hypot

from .model import Actor, Choice, Point, Scenario, lerp
from .presentation import positions

RULES = "Small-sided practice: attack up; no offside. Outcomes illustrate this play."


def actor(key: str, team: str, point: Point) -> Actor:
    return Actor(key, key.upper(), team, point, point, point)


def clearance(start: Point, end: Point, people: tuple[Actor, ...], keepers: bool = False) -> float:
    dx, dy = end[0]-start[0], end[1]-start[1]
    def distance(point: Point) -> float:
        t = max(0., min(1., ((point[0]-start[0])*dx+(point[1]-start[1])*dy)/max(.01, dx*dx+dy*dy)))
        near = lerp(start, end, t)
        return hypot(point[0]-near[0], point[1]-near[1])
    return min((distance(a.position) for a in people if a.team == "away" or keepers and a.team == "keeper"),default=100.)


def owner(people: tuple[Actor, ...], ball: Point) -> Actor | None:
    return next((a for a in people if hypot(a.position[0]-ball[0], a.position[1]-ball[1]) < .1), None)


def actor_point(people: tuple[Actor, ...], key: str) -> Point:
    return {a.key:a.position for a in people}[key]


def option(key: str, label: str, rating: int, target: Point, ball: Point, kind: str,
           reason: str, moves: tuple[tuple[str, Point], ...] = (), aim: Point | None = None) -> Choice:
    outcome = {"pass": "The delivery reaches the illustrated endpoint.",
               "dribble": "You carry into the selected space.", "receive": "The pass follows your receiving run.",
               "move": "You hold or adjust your position.", "intercept": "You meet the illustrated passing lane.",
               "shoot": "Your shot follows the selected route.", "shield": "You keep the ball protected while support adjusts.",
               "clear": "The lifted delivery travels toward the landing space."}[kind]
    return Choice(key, label, target, rating, reason, outcome, ball, kind, moves, aim=aim)


def picture(ident: str, family: int, variant: str, title: str, cue: str,
            people: tuple[Actor, ...], ball: Point, choices: tuple[Choice, ...],
            ball_from: Point | None = None) -> Scenario:
    holder = owner(people, ball)
    state = "loose" if holder is None else "controlled" if holder.key == "john" else "teammate" if holder.team == "home" else "opponent"
    return Scenario(ident, family, variant, title, 8, "defender" if family >= 7 else "midfielder",
                    ("G13", "G14", "G18"), title, cue, people, ball, ball if ball_from is None else ball_from,
                    choices, RULES, "Several actions can work. Read the visible pressure and space.", ball_state=state)


def after(scene: Scenario, choice: Choice) -> tuple[tuple[Actor, ...], Point]:
    actors, ball = positions(scene, "outcome", 1, scene.choices.index(choice))
    people = tuple(replace(a, position=actors[a.key], approach=actors[a.key], run_to=actors[a.key]) for a in scene.actors)
    return people, ball


