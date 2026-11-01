"""Authored beginner pictures, independent of the player's choice."""

from .model import Friend, Picture, Point, Skill, aligned_spot
from .match_content import MATCHES

SKILLS = (
    Skill("line", "Line up", "Try small steps behind a gentle rolling ball."),
    Skill("hands", "Catch and hug", "Try two soft catches with a grown-up."),
    Skill("roll", "Roll to a friend", "Look first. Roll gently toward a ready friend."),
    Skill("loose", "Loose balls", "Try collecting slow balls with a grown-up."),
    Skill("match", "Match challenges", "Watch a match with a grown-up. What happens next?"),
)


def _line(identifier: str, cue: str, source: Point, start: float,
          choices: tuple[str, str], answer: str) -> Picture:
    spot = aligned_spot(source)
    return Picture(identifier, "line", cue, source, (start, 83), spot, spot, 0,
                   choices, answer, "Small steps. Face the ball. Hands ready.")


def _hands(identifier: str, source: Point, height: float, answer: str) -> Picture:
    spot = aligned_spot(source)
    cue = "Low ball coming." if height == 0 else "Soft chest ball coming."
    note = ("Get behind it. Low hands. Bring it close." if height == 0
            else "Two hands. Catch softly. Bring it to your body.")
    return Picture(identifier, "hands", cue, source, spot, spot, spot, height,
                   ("low", "chest"), answer, note)


def _roll(identifier: str, left: Point, right: Point, blocker: Point,
          target: Point, answer: str) -> Picture:
    return Picture(identifier, "roll", "Who has a clear path?", (50, 83), (50, 83),
                   (50, 83), target, 0, ("roll_left", "roll_right"), answer,
                   "Roll gently toward the friend with a clear path.",
                   (Friend("L", left), Friend("R", right)), blocker)


CASES = (
    _line("line.1", "Ball comes from the left.", (20, 30), 55, ("left", "right"), "left"),
    _line("line.2", "Ball comes from the right.", (80, 30), 45, ("left", "right"), "right"),
    _line("line.3", "Ball comes down the middle.", (50, 30), 38, ("left", "right"), "right"),
    _line("line.4", "Ball comes down the middle.", (50, 30), 62, ("left", "right"), "left"),
    _line("line.5", "You are lined up. Stay ready!", (25, 35), aligned_spot((25, 35))[0],
          ("ready", "right"), "ready"),
    _line("line.6", "You are lined up. Stay ready!", (75, 35), aligned_spot((75, 35))[0],
          ("left", "ready"), "ready"),
    _hands("hands.1", (25, 30), 0, "low"),
    _hands("hands.2", (50, 30), 0, "low"),
    _hands("hands.3", (75, 30), 0, "low"),
    _hands("hands.4", (25, 30), 42, "chest"),
    _hands("hands.5", (50, 30), 42, "chest"),
    _hands("hands.6", (75, 30), 42, "chest"),
    _roll("roll.1", (22, 35), (76, 35), (64.3, 56.6), (22, 35), "roll_left"),
    _roll("roll.2", (24, 38), (72, 40), (35.7, 58.25), (72, 40), "roll_right"),
    _roll("roll.3", (28, 42), (78, 33), (66.8, 53), (28, 42), "roll_left"),
    _roll("roll.4", (20, 44), (68, 34), (32, 59.6), (68, 34), "roll_right"),
    _roll("roll.5", (26, 32), (80, 44), (66.5, 61.55), (26, 32), "roll_left"),
    _roll("roll.6", (30, 38), (74, 36), (38, 56), (74, 36), "roll_right"),
    Picture("line.7", "line", "Ball switched to the right.", (20, 30), (42, 83),
            aligned_spot((80, 32)), aligned_spot((80, 32)), 0, ("left", "right"), "right",
            "Follow the new ball position. Small steps, then get ready.", serve_from=(80, 32)),
    Picture("line.8", "line", "Ball switched to the left.", (80, 30), (58, 83),
            aligned_spot((20, 32)), aligned_spot((20, 32)), 0, ("left", "right"), "left",
            "Follow the new ball position. Small steps, then get ready.", serve_from=(20, 32)),
    Picture("line.9", "line", "The pass goes to the middle.", (20, 30), (40, 83),
            aligned_spot((50, 36)), aligned_spot((50, 36)), 0, ("left", "right"), "right",
            "Move behind the new ball line. Keep your hands ready.", serve_from=(50, 36)),
    Picture("roll.7", "roll", "Both paths are blocked.", (50, 83), (50, 83), (50, 83),
            (50, 83), 0, ("hold", "roll_left"), "hold", "Hold it briefly. Look for a clear path.",
            (Friend("L", (22, 35)), Friend("R", (76, 35))), (34.6, 56.6),
            extra_blockers=((64.3, 56.6),)),
    Picture("roll.8", "roll", "Both paths are blocked.", (50, 83), (50, 83), (50, 83),
            (50, 83), 0, ("roll_right", "hold"), "hold", "Hold it briefly. Look for a clear path.",
            (Friend("L", (24, 38)), Friend("R", (72, 40))), (62.1, 59.35),
            extra_blockers=((35.7, 58.25),)),
    Picture("roll.9", "roll", "One friend is not looking.", (50, 83), (50, 83), (50, 83),
            (50, 83), 0, ("roll_right", "hold"), "hold", "Wait for a ready friend and a clear path.",
            (Friend("L", (22, 35), False), Friend("R", (76, 35))), (64.3, 56.6)),
    Picture("loose.1", "loose", "You can reach this free ball first.", (46, 74), (50, 83),
            (46, 74), (46, 74), 0, ("collect", "ready"), "collect",
            "Walk to the ball. Low hands, then bring it close.", blocker=(70, 42)),
    Picture("loose.2", "loose", "You are closer to the free ball.", (54, 73), (50, 83),
            (54, 73), (54, 73), 0, ("ready", "collect"), "collect",
            "Walk to the ball. Low hands, then bring it close.", blocker=(29, 43)),
    Picture("loose.3", "loose", "The ball is near you. Player is far.", (50, 75), (50, 83),
            (50, 75), (50, 75), 0, ("collect", "ready"), "collect",
            "Get behind the ball and collect it with both hands.", blocker=(72, 50)),
    Picture("loose.4", "loose", "The other player is closer.", (44, 70), (50, 83),
            (50, 83), (37, 67), 0, ("collect", "ready"), "ready",
            "Stay goal-side. Hands ready. Watch the ball.", blocker=(37, 67)),
    Picture("loose.5", "loose", "The other player reaches it first.", (56, 70), (50, 83),
            (50, 83), (63, 67), 0, ("ready", "collect"), "ready",
            "Stay goal-side. Hands ready. Watch the ball.", blocker=(63, 67)),
    Picture("loose.6", "loose", "The player is nearer the free ball.", (50, 70), (50, 83),
            (50, 83), (57, 68), 0, ("collect", "ready"), "ready",
            "Stay goal-side. Hands ready. Watch the ball.", blocker=(57, 68)),
) + MATCHES
