"""Optional toy motion and playful copy, independent of training and scoring."""

from math import isfinite, pi, sin

BADGES = {
    "line": "Crab Feet", "hands": "Super Gloves", "roll": "Pass Pal",
    "loose": "Ball Detective", "match": "Match Explorer",
}
CAPTIONS = {
    "left": "Crab shuffle!", "right": "Crab shuffle!", "ready": "Goalie statue!",
    "low": "Scoop the potato!", "chest": "Give it a hug!",
    "roll_left": "Bowling ball delivery!", "roll_right": "Bowling ball delivery!",
    "hold": "No potato panic!", "collect": "Ball rescue mission!",
    "set": "Ready, steady, goalie!", "jump": "Popcorn jump!",
    "feet": "Shoo, ball!", "celebrate": "Victory wiggle already?",
}
CHEERS = ("Glove power!", "High five, keeper!", "Super thinking!")
PRACTICE_CHEERS = ("Oops-a-daisy!", "Practice power-up!", "Let's try together!")
PARTY_SECONDS = 1.6


class ClubEffects:
    def __init__(self):
        self.clock = 0.
        self.bounce_age = 1.
        self.launch_height = 0.
        self.party_age = PARTY_SECONDS
        self.tap_age = 1.
        self.pops = 0
        self.high_fives = 0

    @property
    def ball_height(self) -> float:
        t = self.bounce_age
        return max(0., min(100., (1 - t) * self.launch_height + 90 * sin(pi * t)))

    @property
    def party_fraction(self) -> float:
        return self.party_age / PARTY_SECONDS

    def tick(self, seconds: float) -> None:
        if not isfinite(seconds) or seconds < 0:
            raise ValueError("Time must be finite and nonnegative")
        self.clock = (self.clock + seconds) % 3
        self.bounce_age = min(1., self.bounce_age + seconds)
        self.party_age = min(PARTY_SECONDS, self.party_age + seconds)
        self.tap_age = min(1., self.tap_age + seconds)

    def pop(self) -> bool:
        if self.bounce_age < .18:
            return False
        self.launch_height = self.ball_height
        self.bounce_age = 0.
        self.pops += 1
        return True

    def celebrate(self) -> None:
        self.party_age = 0.

    def high_five(self) -> bool:
        if self.tap_age < .2:
            return False
        self.tap_age = 0.
        self.high_fives += 1
        self.celebrate()
        return True
