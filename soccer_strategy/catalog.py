"""Resolve independently authored facts, action routes and contextual feedback."""

from dataclasses import replace
from math import hypot

from .content import LESSONS, Lesson, Situation
from .model import Actor, Choice, Point, Scenario, bounded, lerp

GOAL: Point = (50, 100)
LABELS = {
    "contain": "Stay between A and goal; match A's run.",
    "press": "Run toward A; slow down before reaching A.",
    "tackle": "Step to the ball before A's next touch.",
    "inside": "Move toward the middle to stop A cutting in.",
    "block": "Move between the ball and your goal.",
    "recover": "Run back into the space in front of goal.",
    "mark": "Follow R; stay between R and your goal.",
    "cover": "Stay behind M to help if A gets past.",
    "lane": "Stand in the passing route from A to R.",
    "intercept": "Step into the pass before R reaches it.",
    "pass": "Pass to M's feet; stay behind to help.",
    "carry": "Touch the ball toward the left touchline.",
    "clear": "Kick the ball wide, away from your goal.",
    "shield": "Put your body between A and the ball.",
    "collect": "Get to the loose ball before A does.",
    "slide": "Slide to knock the ball wide.",
    "long": "Kick high upfield, toward the left touchline.",
}
EFFECTS = {
    "contain": "You show a goal-side delaying route.",
    "press": "Close under control. A may still pass or dribble.",
    "tackle": "You step toward the ball. Timing decides whether it is safe.",
    "inside": "You move across the inside route toward goal.",
    "block": "You move into the shooting line and keep your balance.",
    "recover": "You take a route back into goal-side space.",
    "mark": "You track the runner from a goal-side position.",
    "cover": "You protect the support space shown in this play.",
    "lane": "You move into the route toward the receiver.",
    "intercept": "You step into the pass. Check you can arrive first.",
    "pass": "Intended pass, not a guaranteed reception. Stay ready to help.",
    "carry": "You take the ball wide. Check the next pressure.",
    "clear": "Clearing wide can ease pressure but may give up possession.",
    "shield": "You keep your body between the opponent and the ball.",
    "collect": "You move to the loose ball. Check who arrives first.",
    "slide": "You try a sliding challenge. Check the timing and the risk to A.",
    "long": "The ball goes upfield; either team may get the next touch.",
}


def goal_side(point: Point, gap: float) -> Point:
    dx, dy = GOAL[0] - point[0], GOAL[1] - point[1]
    length = max(hypot(dx, dy), 1.0)
    return bounded((point[0] + gap * dx / length, point[1] + gap * dy / length))


def opponent_position(s: Situation) -> Point:
    if s.attacker is not None:
        return s.attacker
    if s.state in ("owned", "receiving", "keeper", "teammate"):
        return s.runner
    if s.state == "loose":
        return bounded((s.ball[0] - 1, s.ball[1] - 8))
    return bounded((s.ball[0], s.ball[1] - 2))


def runner_finish(s: Situation) -> Point:
    return s.runner_end if s.runner_end is not None else goal_side(s.runner, 6)


def targets(s: Situation) -> dict[str, Point]:
    b, j = s.ball, s.john
    enemy = opponent_position(s)
    dx, dy = b[0] - enemy[0], b[1] - enemy[1]
    length = max(hypot(dx, dy), 1.0)
    shield = bounded((b[0] - 2 * dx / length, b[1] - 2 * dy / length))
    return {
        "contain": goal_side(b, 8), "press": goal_side(enemy, min(s.press_gap, hypot(j[0] - enemy[0], j[1] - enemy[1]) * .7)),
        "tackle": b, "collect": b,
        "intercept": s.interception_target if s.interception_target is not None else b,
        "inside": goal_side(b, 7), "block": lerp(b, s.shot_target, .30),
        "recover": goal_side(b, 13), "mark": goal_side(runner_finish(s), 4),
        "cover": s.zone if s.zone is not None else goal_side(s.mate, 7),
        "lane": lerp(b, s.runner, .62), "pass": goal_side(j, 2),
        "carry": bounded((j[0] - 10, j[1] - 7)), "clear": b, "shield": shield,
        "slide": b, "long": b,
    }


def make_choice(key: str, index: int, s: Situation) -> Choice:
    rating = s.ratings[index]
    target = targets(s)[key]
    explanation = s.reason if rating == 2 else s.notes[index]
    if rating == 1:
        explanation = "Reasonable too. " + explanation
    ball_end = s.ball
    if key in ("press", "tackle", "intercept", "collect", "block", "clear", "pass", "carry", "shield", "slide", "long"):
        ball_end = {
            "press": s.ball, "tackle": target, "intercept": target, "collect": target,
            "block": target if s.state not in ("loose", "pass", "restart") else s.ball,
            "clear": (4., max(8., s.ball[1] - 20)), "pass": s.mate, "carry": target,
            "slide": (4., max(8., s.ball[1] - 12)), "long": (8., 20.),
            "shield": s.ball,
        }[key]
    return Choice(key, LABELS[key], target, rating, explanation, EFFECTS[key], ball_end)


def delivery_choice(choice: Choice, topic: int) -> Choice:
    if topic == 16 and choice.key == "lane":
        return replace(choice, ball_end=choice.target)
    if topic == 17:
        end = choice.target if choice.key in ("mark", "intercept") else (30., 90.)
        return replace(choice, ball_end=end)
    if topic == 23 and choice.key in ("mark", "cover"):
        return replace(choice, ball_end=(35., 87.))
    return choice


def describe_choice(choice: Choice, topic: int, s: Situation) -> Choice:
    label = choice.label
    if topic in (4, 31, 32, 33, 34) and choice.key == "block":
        label = "Step into A's shot line; stay on your feet."
        if s.shot_target[0] != 50:
            side = "left" if s.shot_target[0] < 50 else "right"
            label = f"Step between the ball and {side} post; stay balanced."
        if topic == 34 and choice.target == s.john:
            label = "Stay on the shot line; keep your balance."
    if topic == 30 and choice.key == "intercept":
        label = "Step across M's pass before A reaches it."
    if choice.key == "cover":
        label = {
            9: "Move toward the middle to protect the gap.",
            15: "Stay inside; guard the pass into the box.",
            17: "Move to the far post; watch for R.",
            27: "Get behind the loose ball to protect goal.",
        }.get(topic, label)
        if topic in (23, 24) and s.zone is not None:
            label = "Stay in your marked zone in front of goal."
    if choice.key == "intercept" and topic in (6, 14):
        label = "Step into the pass before A can reach it."
    if choice.key == "intercept" and topic == 13:
        label = "Move into A's return-pass route to R."
    if choice.key == "pass" and s.mate == s.keeper:
        label = "Pass to GK's feet, not GK's hands."
    return replace(choice, label=label)


def scene_actors(lesson: Lesson, s: Situation) -> tuple[Actor, ...]:
    enemy = opponent_position(s)
    enemy_end = goal_side(enemy, 6)
    if s.state in ("owned", "receiving", "keeper", "teammate"):
        enemy_end = lerp(enemy, s.john, .5)
    if s.state == "pass":
        enemy_end = enemy
    if s.state == "loose":
        enemy_end = lerp(enemy, s.ball, .65)
    heading = s.facing if s.facing is not None else (s.ball[0] - enemy[0], s.ball[1] - enemy[1])
    if heading == (0, 0):
        heading = (s.runner[0] - enemy[0], s.runner[1] - enemy[1])
    actors = [
        Actor("john", "JOHN", "home", s.john,
              s.john if s.state == "keeper" else bounded((s.john[0], s.john[1] - 3)),
              s.john, (s.ball[0] - s.john[0], s.ball[1] - s.john[1])),
        Actor("carrier", "A", "away", enemy,
              s.attacker_start if s.attacker_start is not None else bounded((enemy[0] - 2, enemy[1] - 7)),
              enemy_end, heading),
        Actor("keeper", "GK", "keeper", s.keeper, s.keeper, s.keeper, (0, -1)),
    ]
    if s.mate != s.keeper:
        mate_heading = (s.ball[0] - s.mate[0], s.ball[1] - s.mate[1]) if s.receiver_ready else (0, -1)
        actors.append(Actor("mate", "M", "home", s.mate, s.mate, s.mate, mate_heading))
    if ((6 <= lesson.topic <= 24 and lesson.topic not in (20, 21))
            or lesson.topic == 27):
        actors.append(Actor("runner", "R", "away", s.runner,
                            bounded((s.runner[0] - 3, s.runner[1] - 7)), runner_finish(s), (0, 1)))
    for i, point in enumerate(s.extras):
        actors.append(Actor(f"extra{i}", f"A{i + 2}", "away", point, point, point, (0, 1)))
    return tuple(actors)


def make_scene(lesson: Lesson, variant: int, s: Situation) -> Scenario:
    ball_from = s.origin if s.origin is not None else bounded((s.ball[0] - 2, s.ball[1] - 8))
    actions = s.actions if s.actions is not None else lesson.actions
    choices = tuple(describe_choice(delivery_choice(make_choice(key, i, s), lesson.topic), lesson.topic, s)
                    for i, key in enumerate(actions))
    rules = "7v7/9v9: nearby players shown. Check the ball and your teammates."
    if lesson.topic in (22, 23, 24):
        rules = "Follow the assigned role and communicate. Local restart rules still apply."
    if s.state == "keeper":
        rules = "7v7 throw practice: pressure starts after first touch here. Local line rules vary. Return to GK's feet."
    if lesson.topic == 28:
        rules = "Slides are allowed in John's league. Dangerous contact is still a foul, even with ball first."
    scene = Scenario(f"{lesson.topic:02d}.{variant + 1}", lesson.topic, lesson.title,
                     lesson.stage, lesson.focus, s.cue, scene_actors(lesson, s),
                     s.ball, ball_from, choices, rules, ball_state=s.state,
                     keeper_distribution=s.state == "keeper",
                     assigned_zone=s.zone if lesson.topic in (23, 24) else None,
                     shot_target=s.shot_target if lesson.stage == 2 else None)
    scene.validate()
    return scene


def build_catalog() -> tuple[Scenario, ...]:
    return tuple(make_scene(lesson, v, s) for lesson in LESSONS
                 for v, s in enumerate(lesson.situations))
