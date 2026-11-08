"""Optional session-only plans and reflection; no tactical scoring dependency."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Step:
    key: str
    title: str
    prompt: str
    options: tuple[str, ...]


PRINCIPLES = (
    Step("principle", "My playing principle", "Choose an idea to try. All ideas are unscored.",
         ("Look before my next touch", "Help the teammate with the ball", "Use the open route")),
    Step("revision", "Keep or revise my idea", "Would your idea help when the picture changes?",
         ("Keep this idea", "Check both routes each time", "Look again when pressure changes")),
)
PLAN = (
    Step("goal", "One small practice goal", "Choose something you can notice next time.",
         ("Notice the exit before turning", "Compare curved and straight routes", "Offer a clear return angle")),
    Step("helper", "My practice team", "Choose a helper role, or ask later. No names needed.",
         ("Coach", "Teammate", "Trusted adult", "Ask later")),
    Step("action", "Ask for useful help", "Make your next practice step concrete.",
         ("Let me explain the exit first", "Help me compare both routes", "Ask what changed after the pass")),
    Step("observation", "What did I notice?", "After a replay or practice, choose an honest observation.",
         ("I looked before choosing", "I want another try", "I have not practiced this yet")),
    Step("revision", "My next step", "Change the plan when it helps. Skipping is always OK.",
         ("Keep my plan", "Change my goal next time", "Ask later and rest for now")),
)
PRO_WATCH = (
    Step("pro", "Pro role spotlight", "Choose a book-featured pro role to study.",
         ("Naomi Girma: calm defender build-out",
          "Aitana Bonmati: midfield scan and turn",
          "Christian Pulisic: wing speed and change of pace",
          "Kylian Mbappe: forward box runs and finish")),
    Step("watch", "Match-watch focus", "When watching a game with an adult, notice one cue.",
         ("When the player scans before receiving",
          "When they accelerate or play simple",
          "How they move into open scoring space")),
    Step("try_it", "Try It solo practice and safety", "Pick a small solo step. Keep heading coach-led.",
         ("Pull back and exit through a cone gate",
          "Push a laces touch into space, then pass",
          "Set a six-week goal; keep heading coach-led")),
)


class Notebook:
    def __init__(self) -> None:
        self.entries: dict[str, dict[str, str]] = {"X01": {}, "X02": {}, "X03": {}}
        self.activity: str | None = None
        self.index = 0
        self.evidence: tuple[str, ...] = ()

    @property
    def steps(self) -> tuple[Step, ...]:
        evidence = Step("evidence", "Use a real play as evidence",
                        "Choose something you actually tried, or skip. Play a mission first if this list is empty.",
                        self.evidence)
        if self.activity == "X01":
            return (PRINCIPLES[0], evidence, PRINCIPLES[1])
        if self.activity == "X03":
            return (PRO_WATCH[0], evidence, PRO_WATCH[1], PRO_WATCH[2])
        return PLAN if self.activity == "X02" else ()

    @property
    def step(self) -> Step | None:
        return self.steps[self.index] if self.index < len(self.steps) else None

    def start(self, activity: str, evidence: tuple[str, ...] = ()) -> None:
        if activity not in self.entries:
            raise ValueError("Unknown growth activity")
        self.activity = activity
        self.index = 0
        self.evidence = evidence[:3]

    def choose(self, index: int) -> bool:
        step = self.step
        if self.activity is None or step is None or not 0 <= index < len(step.options):
            return False
        self.entries[self.activity][step.key] = step.options[index]
        self.index += 1
        return True

    def skip(self) -> bool:
        if self.step is None:
            return False
        self.index += 1
        return True

    def back(self) -> bool:
        if self.index == 0:
            return False
        self.index -= 1
        return True
