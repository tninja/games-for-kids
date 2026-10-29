"""Reviewed match pictures. Percent coordinates, own goal at (50, 100).

Facts are authored independently of grades. A rating of 2 is preferred for the
stated picture, 1 is reasonable, and 0 identifies a risk, not a certain outcome.
"""

from dataclasses import dataclass

from .model import Point
from .curriculum import section_for_topic


@dataclass(frozen=True)
class Situation:
    john: Point
    ball: Point
    mate: Point
    runner: Point
    best: int
    cue: str
    reason: str
    alternative: int = -1
    ratings: tuple[int, int, int] = (0, 0, 0)
    state: str = "controlled"
    attacker: Point | None = None
    origin: Point | None = None
    runner_end: Point | None = None
    zone: Point | None = None
    keeper: Point = (50, 93)
    extras: tuple[Point, ...] = ()
    facing: Point | None = None
    interception_target: Point | None = None
    receiver_ready: bool = True
    notes: tuple[str, str, str] = ("", "", "")
    actions: tuple[str, str, str] | None = None
    press_gap: float = 4.
    shot_target: Point = (50, 100)
    attacker_start: Point | None = None


@dataclass(frozen=True)
class Lesson:
    topic: int
    title: str
    focus: str
    actions: tuple[str, str, str]
    situations: tuple[Situation, Situation, Situation]

    @property
    def stage(self) -> int:
        return section_for_topic(self.topic)

LESSONS = (
    Lesson(
        1, "Meet the dribbler",
        "Distance and patience",
        ('contain', 'press', 'tackle'),
        (
            Situation(
                (25, 69), (24, 58), (52, 77), (45, 65),
                0,
                "The attacker runs fast with the ball close to their feet.",
                "Match the run and slow the attack before trying to win the ball.",
                ratings=(2, 1, 0),
                notes=(
                    '',
                    'You can close a little if you stay balanced. A is moving fast, so leave room to turn.',
                    'A has the ball close. Reaching now lets A touch it past your foot.',
                ),
            ),
            Situation(
                (25, 70), (25, 66), (43, 76), (45, 65),
                1,
                (
                    "The attacker slows. You can approach under control; a teammate stays "
                    "behind you."
                ),
                "Close under control before the attacker builds speed.",
                ratings=(1, 2, 0),
                notes=(
                    (
                        'You can delay from here, but A has slowed and M is behind you. You have time to close '
                        'the gap.'
                    ),
                    '',
                    'A still controls the ball. Getting closer does not mean there is a clean tackle yet.',
                ),
            ),
            Situation(
                (25, 70), (25, 67), (52, 77), (45, 65),
                2,
                "A heavy touch rolls the ball away. You can reach it first.",
                "The exposed touch is your chance to win the ball cleanly.",
                ratings=(1, 1, 2),
                state="loose",
                notes=(
                    'Staying in front is safe, but you can reach this loose touch before A.',
                    'Closing under control is possible. Watch the ball so A does not recover the loose touch.',
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        2, "Stop the inside cut",
        "Protect the dangerous route",
        ('inside', 'contain', 'tackle'),
        (
            Situation(
                (20, 72), (24, 64), (53, 80), (44, 73),
                0,
                "The attacker turns toward the middle. The inside lane is open.",
                "Move into the inside route before it becomes a path to goal.",
                ratings=(2, 1, 0),
                notes=(
                    '',
                    'Delaying can work if you also move across the open route into the middle.',
                    'A still controls the ball while turning. A reach could leave the inside route open.',
                ),
            ),
            Situation(
                (29, 73), (25, 64), (38, 73), (44, 73),
                1,
                (
                    "Your teammate protects the inside lane. The attacker still controls "
                    "the ball."
                ),
                "Stay goal-side and delay rather than crowding the same lane.",
                ratings=(1, 2, 0),
                notes=(
                    'Protecting the middle can help, but do not crowd M and leave A an easy run outside.',
                    '',
                    "M guarding the inside does not make A's controlled ball reachable.",
                ),
            ),
            Situation(
                (29, 73), (29, 69), (53, 80), (44, 73),
                2,
                "The inside touch runs loose toward your feet.",
                "Reach the loose ball before the attacker takes another touch.",
                ratings=(1, 1, 2),
                state="loose",
                notes=(
                    'Closing the inside is safe, but the loose ball gives you a chance to win it now.',
                    'You can delay if unsure of your balance. You are closer to this loose touch than A.',
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        3, "Read the heavy touch",
        "Who reaches the ball first?",
        ('tackle', 'contain', 'recover'),
        (
            Situation(
                (24, 72), (24, 69), (48, 78), (42, 73),
                0,
                (
                    "The loose ball is closer to you than to the attacker. There is room to"
                    " reach it cleanly."
                ),
                "Compare distances: you can reach this ball first.",
                ratings=(2, 1, 1),
                state="loose",
                notes=(
                    '',
                    (
                        'Waiting stays safe if your timing is uncertain. Here you have a clear lead to the loose '
                        'ball.'
                    ),
                    (
                        'Recovering protects goal if you cannot challenge safely, but it gives up a reachable '
                        'ball.'
                    ),
                ),
            ),
            Situation(
                (24, 76), (24, 64), (48, 78), (42, 73),
                1,
                "The touch is long, but the attacker is still much closer than you.",
                "Contain instead of racing for a ball the attacker will reach first.",
                ratings=(0, 2, 1),
                notes=(
                    'A is much closer to the ball. Sprinting straight at it risks A touching it past you.',
                    '',
                    (
                        'Dropping toward goal is possible. Keep watching A so you do not give away too much '
                        'space.'
                    ),
                ),
            ),
            Situation(
                (23, 60), (24, 70), (48, 82), (42, 73),
                2,
                "The ball and attacker have already gone past you toward goal.",
                "Recover a defensive position before challenging from behind.",
                ratings=(0, 1, 2),
                notes=(
                    'The ball is beyond you. Reaching from behind risks a foul and delays your recovery.',
                    'Try to get in front again, but you must first run back because A is already past you.',
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        4, "Shot inside the box",
        "Get between the ball and goal",
        ("block", "press", "recover"),
        (
            Situation(
                (38, 84), (35, 79), (65, 86), (58, 81), 0,
                "A controls the ball inside the box and draws a foot back. You are already between A and goal.",
                "Stand between the ball and goal, keep your arms close and watch A's kick. Stay balanced as the shot comes.",
                ratings=(2, 1, 1), press_gap=6.,
                notes=(
                    "",
                    "A balanced close can also reduce the shot space. Keep your body in the shooting line as A kicks.",
                    "Moving deeper can protect goal if needed, but keep covering the shot line. Do not retreat all the way to GK.",
                ),
            ),
            Situation(
                (37, 91), (30, 87), (65, 86), (58, 81), 0,
                "A controls the ball inside the left side of the box and prepares a near-post shot. You can step across the lane.",
                "Step between the ball and the left post. Stay balanced and keep your arms close to help block the shot.",
                ratings=(2, 0, 0), attacker=(29, 84), press_gap=6., shot_target=(40, 100),
                notes=(
                    "",
                    "A is already starting the shot. Running at A can miss the near-post lane; step across that lane first.",
                    "A is aiming near the left post. Dropping toward the middle of goal leaves that route open.",
                ),
            ),
            Situation(
                (28, 70), (40, 80), (65, 86), (58, 81), 2,
                "A controls the ball in the box but has not started the shot. You are behind A and outside the shooting lane.",
                "Run inside to get between A and goal. Keep watching the ball; avoid chasing A from behind.",
                ratings=(1, 0, 2), attacker=(39, 77), press_gap=6.,
                notes=(
                    "Moving toward the shot line also helps. You are behind A, so first get into a position that protects goal.",
                    "A is facing goal ahead of you. Chasing A from behind leaves the shooting lane open.",
                    "",
                ),
            ),
        ),
    ),
    Lesson(
        5, "Race down the line",
        "Recover the right angle",
        ('contain', 'recover', 'tackle'),
        (
            Situation(
                (18, 72), (12, 65), (45, 81), (45, 74),
                0,
                (
                    "You are inside and goal-side of the winger, who still controls the "
                    "ball."
                ),
                "Keep the inside position while matching the run.",
                ratings=(2, 1, 0),
                notes=(
                    '',
                    (
                        "You can drop inside to protect depth. Keep close enough to make A's next action "
                        'difficult.'
                    ),
                    'A still controls the ball. A missed reach gives the winger room down the line.',
                ),
            ),
            Situation(
                (15, 59), (12, 72), (45, 84), (45, 78),
                1,
                "The winger is already past you and heads toward the box.",
                "Recover inside toward danger instead of chasing directly behind.",
                ratings=(1, 2, 0),
                notes=(
                    (
                        'Staying in front is the aim, but A is already past you. You need an inside recovery run '
                        'first.'
                    ),
                    '',
                    'You are behind the winger. Chasing a tackle now may leave the route to the box open.',
                ),
            ),
            Situation(
                (16, 73), (14, 71), (45, 81), (45, 74),
                2,
                "The winger's touch slows beside the line. You can reach it first.",
                "Use the clear opening rather than allowing another run.",
                ratings=(1, 1, 2),
                state="loose",
                notes=(
                    'Holding the inside route is safe if you cannot reach cleanly. This touch is exposed.',
                    'Recovering inside is possible, but A has left a loose ball you can reach first.',
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        6, "Receiver facing away",
        "Pressure without diving in",
        ('press', 'contain', 'intercept'),
        (
            Situation(
                (25, 73), (25, 66), (47, 80), (21, 50),
                0,
                "The receiver faces away from goal and has not turned yet.",
                "Approach under control so the receiver cannot turn freely.",
                ratings=(2, 1, 0),
                attacker=(25, 64),
                facing=(0, -1),
                notes=(
                    '',
                    'Holding goal-side is possible, but A has not turned. You can close under control.',
                    'A already has the ball. There is no travelling pass here to intercept.',
                ),
            ),
            Situation(
                (25, 73), (27, 68), (47, 80), (21, 50),
                1,
                "The receiver has turned toward you and controls the ball.",
                "Reset your distance now that the receiver can attack forward.",
                ratings=(1, 2, 0),
                attacker=(27, 66),
                facing=(0, 1),
                notes=(
                    'Closing a little can work if you stay balanced. A has turned and can now dribble at you.',
                    '',
                    'A controls the ball. Stepping at an imagined pass could let A run past.',
                ),
            ),
            Situation(
                (25, 71), (25, 68), (47, 80), (21, 50),
                2,
                "A slow pass crosses your path before reaching the receiver.",
                "Read the pass and step across its route before the receiver gets it.",
                ratings=(1, 1, 2),
                state="pass",
                attacker=(25, 76),
                origin=(21, 50),
                runner_end=(21, 50),
                notes=(
                    (
                        'Approaching A under control can help if you cannot reach the pass. Do not let this slow '
                        'ball roll by.'
                    ),
                    'Holding goal-side is safe if unsure. Here the pass is in reach before A receives it.',
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        7, "Recover after being beaten",
        "Find a useful recovery route",
        ('recover', 'mark', 'tackle'),
        (
            Situation(
                (20, 58), (23, 70), (62, 78), (58, 67),
                0,
                "The carrier has beaten you. No teammate protects the route to goal.",
                "Use an inside recovery route to protect the direct danger.",
                ratings=(2, 0, 0),
                notes=(
                    '',
                    (
                        'R is a threat, but following R now leaves the unprotected carrier a direct route to '
                        'goal.'
                    ),
                    'A has gone past you. Reaching from behind risks a foul instead of protecting goal.',
                ),
            ),
            Situation(
                (20, 58), (23, 70), (25, 74), (45, 76),
                1,
                (
                    "M is closer to A and goal-side, moving to slow A. R runs toward goal."
                ),
                (
                    "Keep the free runner covered and call to M. Recheck the ball; support "
                    "can fail."
                ),
                ratings=(1, 2, 0),
                notes=(
                    'An inside recovery run adds protection if M is beaten, but keep the free R in view.',
                    '',
                    'You are behind A. Do not chase a tackle while M approaches and R runs free.',
                ),
            ),
            Situation(
                (23, 69), (24, 71), (62, 78), (58, 67),
                2,
                "The attacker slows and leaves the ball beside you during recovery.",
                "The ball is now reachable without a tackle through the attacker.",
                ratings=(1, 0, 2),
                state="loose",
                notes=(
                    (
                        'Recovering inside stays safe if you cannot reach cleanly. A has now left the ball beside '
                        'you.'
                    ),
                    'Following the distant R leaves A with a loose ball near your goal.',
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        8, "Pass into the space behind",
        "Read ball and runner",
        ('intercept', 'recover', 'mark'),
        (
            Situation(
                (27, 72), (25, 69), (53, 80), (19, 64),
                0,
                "A slow pass crosses directly in front of you.",
                "Reach the pass before the runner instead of letting it go behind.",
                ratings=(2, 1, 1),
                state="pass",
                attacker=(25, 50),
                origin=(25, 50),
                notes=(
                    '',
                    (
                        'Dropping protects depth if the pass is too fast. This slow ball crosses within your '
                        'reach.'
                    ),
                    'Tracking R can help if you cannot reach the pass. Here you can stop the ball first.',
                ),
            ),
            Situation(
                (24, 65), (20, 75), (57, 81), (17, 69),
                1,
                "A fast pass has gone beyond your reach into the open channel.",
                "Protect the depth instead of chasing the old passing point.",
                ratings=(0, 2, 1),
                state="pass",
                attacker=(25, 50),
                origin=(25, 50),
                notes=(
                    (
                        'The fast pass has already gone beyond you. Stepping at its old position will not stop '
                        'it.'
                    ),
                    '',
                    (
                        'Track R while recovering if you can stay goal-side. Do not ignore the ball in the open '
                        'channel.'
                    ),
                ),
            ),
            Situation(
                (31, 73), (25, 72), (25, 74), (39, 76),
                2,
                "M is closer to the ball and moving to it. A second attacker runs free.",
                (
                    "Cover the runner while watching M. Be ready to help again if the first"
                    " touch runs loose."
                ),
                ratings=(0, 1, 2),
                state="pass",
                attacker=(25, 50),
                origin=(25, 50),
                notes=(
                    'M is closer to the ball. Joining M leaves R free near goal.',
                    'You can protect depth behind M if control fails, but watch R rather than only the ball.',
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        9, "Ball far away, runner nearby",
        "Keep seeing ball and player",
        ('mark', 'cover', 'press'),
        (
            Situation(
                (28, 81), (78, 66), (51, 82), (24, 76),
                0,
                (
                    "The ball is on the other wing. A runner approaches behind your "
                    "shoulder."
                ),
                "Check your shoulder and stay with the far-side runner.",
                ratings=(2, 0, 0),
                notes=(
                    '',
                    'M already protects the middle. Moving over to M leaves R free on your side.',
                    'The ball is on the far wing. Running across to A abandons R near your goal.',
                ),
            ),
            Situation(
                (19, 78), (78, 62), (65, 78), (72, 58),
                1,
                "No runner threatens your side, but a large central gap has opened.",
                "Move in to protect the gap while keeping the far side in view.",
                ratings=(0, 2, 0),
                zone=(40, 84),
                notes=(
                    'R is far from your side. Following R across the pitch leaves the central gap open.',
                    '',
                    'A is far away. A long chase leaves the middle unprotected.',
                ),
            ),
            Situation(
                (28, 78), (23, 72), (51, 82), (65, 65),
                2,
                "The switch has arrived on your side. No runner threatens behind.",
                "The threat has changed: close this receiver under control.",
                ratings=(0, 1, 2),
                notes=(
                    'There is no runner behind you to follow. The new receiver can advance if nobody closes.',
                    'Keeping some depth is possible, but do not leave the new receiver unlimited space.',
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        10, "Help a teammate who is pressing",
        "One presses, one protects",
        ('cover', 'mark', 'press'),
        (
            Situation(
                (31, 79), (25, 65), (26, 70), (59, 61),
                0,
                "Your teammate is close to the ball. No receiver threatens behind.",
                (
                    "Keep a second defensive layer. A teammate applying pressure is not a "
                    "promise of winning the ball."
                ),
                ratings=(2, 0, 0),
                notes=(
                    '',
                    'R is not threatening behind. Leaving your support position makes it harder to help M.',
                    'M is already applying pressure. Both of you chasing A leaves no second defender.',
                ),
            ),
            Situation(
                (31, 79), (25, 65), (26, 70), (43, 76),
                1,
                (
                    "M is goal-side and pressing the carrier. Another receiver runs into "
                    "the inside gap."
                ),
                "Track the receiver while the teammate keeps pressure on the ball.",
                ratings=(1, 2, 0),
                notes=(
                    'You can stay ready to help M, but you must also see R entering the inside gap.',
                    '',
                    'M is already pressing A. Joining M leaves the inside receiver free.',
                ),
            ),
            Situation(
                (29, 75), (25, 69), (18, 58), (59, 61),
                2,
                "The pressing teammate is beaten and now behind the play.",
                "You are the nearest goal-side defender; take over the pressure.",
                ratings=(0, 0, 2),
                notes=(
                    (
                        'M is already behind the attack. Running back toward M takes you away from A and the '
                        'route to goal.'
                    ),
                    'R is far from goal. Following R leaves A free to carry forward.',
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        11, "Cover a beaten teammate",
        "Assign each threat",
        ('block', 'mark', 'intercept'),
        (
            Situation(
                (30, 83), (43, 77), (50, 65), (24, 76),
                0,
                "The central carrier can shoot. No other defender can block.",
                (
                    "Protect the immediate shooting route and call for help with your "
                    "runner."
                ),
                ratings=(2, 0, 0),
                notes=(
                    '',
                    'R needs watching, but A can shoot now and no teammate is in the shooting line.',
                    'A still controls the ball. Guessing at a pass leaves the immediate shot open.',
                ),
            ),
            Situation(
                (30, 83), (43, 77), (46, 82), (24, 79),
                1,
                "Another teammate can block the carrier. Your runner remains free.",
                "Stay with R while M faces A. Call to M and react again if A gets past.",
                ratings=(0, 2, 0),
                notes=(
                    'M is already in place to confront A. Joining M leaves your R unmarked.',
                    '',
                    'A has not released a pass. Gambling on one leaves R free behind you.',
                ),
            ),
            Situation(
                (33, 81), (34, 78), (50, 65), (24, 76),
                2,
                "The carrier releases a slow square pass across your path.",
                "Cut out the reachable pass before the free attacker receives it.",
                ratings=(1, 1, 2),
                state="pass",
                attacker=(43, 77),
                origin=(43, 77),
                notes=(
                    (
                        'Protecting the shot is possible if you cannot reach the pass. Here the ball is already '
                        'released.'
                    ),
                    'Following R can help if the pass is out of reach. This slow ball crosses your path.',
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        12, "Two attackers, one defender",
        "Delay and read both threats",
        ('contain', 'press', 'intercept'),
        (
            Situation(
                (29, 70), (25, 59), (56, 56), (12, 62),
                0,
                "Two attackers approach outside the box. Your teammate runs back.",
                "Slow their advance and guard the inside route while help arrives.",
                ratings=(2, 0, 0),
                notes=(
                    '',
                    'A has a passing partner and M is still recovering. Rushing A opens the pass behind you.',
                    "A has not passed. Guessing at the ball's route can let either attacker get beyond you.",
                ),
            ),
            Situation(
                (34, 83), (34, 79), (55, 65), (15, 76),
                1,
                "The carrier can shoot now; the overlapping attacker remains wide.",
                (
                    "Reduce the immediate shooting chance instead of guarding only the wide"
                    " pass."
                ),
                ratings=(1, 2, 0),
                notes=(
                    (
                        'Delaying can work if you also close the shooting line. Do not back away from a shot in '
                        'range.'
                    ),
                    '',
                    'A can shoot now and has not passed. Guarding only the wide pass leaves the shot open.',
                ),
            ),
            Situation(
                (20, 74), (20, 71), (56, 56), (12, 73),
                2,
                "The carrier releases a slow pass across your path to the overlap.",
                "Now the ball is released, cut it out before the runner gets it.",
                ratings=(1, 1, 2),
                state="pass",
                attacker=(25, 67),
                origin=(25, 67),
                notes=(
                    (
                        'Holding goal-side is possible if you cannot reach it. Here the released ball is '
                        'reachable.'
                    ),
                    "Closing the passer can help later, but the ball has already left A's foot.",
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        13, "Defend the give-and-go",
        "The passer keeps moving",
        ('mark', 'intercept', 'press'),
        (
            Situation(
                (29, 72), (42, 65), (56, 78), (25, 69),
                0,
                (
                    "The original passer runs behind you. The receiver prepares a return "
                    "pass."
                ),
                "Turn with the runner instead of chasing the new ball carrier.",
                ratings=(2, 1, 0),
                origin=(25, 64),
                interception_target=(31, 71),
                notes=(
                    '',
                    (
                        'Guarding the return route can help if you keep seeing R. Do not gamble past the running '
                        'player.'
                    ),
                    'Chasing the receiver leaves the original passer running behind you for the return.',
                ),
            ),
            Situation(
                (31, 75), (31, 72), (56, 78), (25, 76),
                1,
                "A slow return pass crosses directly in front of you.",
                (
                    "Reach the return pass before the runner instead of only following "
                    "them."
                ),
                ratings=(1, 2, 0),
                state="pass",
                attacker=(42, 65),
                origin=(42, 65),
                notes=(
                    'Tracking R is safe if the pass is too quick. This slow return crosses within your reach.',
                    '',
                    'The receiver has already passed. Chasing A lets the return ball reach R.',
                ),
            ),
            Situation(
                (35, 72), (36, 66), (25, 75), (25, 69),
                2,
                (
                    "M is goal-side and watching the runner. The receiver keeps the ball "
                    "and turns forward."
                ),
                (
                    "Close the receiver, communicate with M and keep checking the runner; "
                    "the handover is not a guarantee."
                ),
                ratings=(0, 0, 2),
                notes=(
                    'M is goal-side of R. Both of you following R lets A turn and advance with the ball.',
                    'A keeps the ball, so there is no return pass to intercept. Stay balanced and close A.',
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        14, "React to a switch of play",
        "Travel time changes the answer",
        ('press', 'recover', 'intercept'),
        (
            Situation(
                (26, 72), (22, 66), (48, 81), (15, 57),
                0,
                "A slow switch arrives. You can meet the receiver as they control it.",
                "Use the travel time to close down without diving in.",
                ratings=(2, 1, 0),
                origin=(83, 64),
                extras=((83, 64),),
                notes=(
                    '',
                    (
                        'Protecting depth is safe if you cannot arrive. This slow switch gives you time to close '
                        'A.'
                    ),
                    (
                        "A is first to this switch. Diving into the ball's path risks missing it and being "
                        'beaten.'
                    ),
                ),
            ),
            Situation(
                (43, 71), (15, 68), (56, 81), (14, 78),
                1,
                "A fast switch reaches a distant receiver. A runner threatens behind.",
                (
                    "Protect the space behind; you cannot arrive in time to pressure the "
                    "first touch."
                ),
                ratings=(0, 2, 0),
                origin=(83, 64),
                extras=((83, 64),),
                notes=(
                    'A is too far away to reach before the first touch. A long rush exposes the space behind.',
                    '',
                    'The switch is beyond reach. Guessing at it leaves the runner and the open space behind.',
                ),
            ),
            Situation(
                (27, 72), (26, 69), (48, 81), (15, 57),
                2,
                "An underhit switch rolls into your path before reaching the receiver.",
                "Step into the ball's path and regain possession.",
                ratings=(1, 1, 2),
                state="pass",
                attacker=(16, 69),
                origin=(83, 64),
                extras=((83, 64),),
                notes=(
                    (
                        'Closing A under control can help if you cannot reach it, but this underhit pass is in '
                        'your path.'
                    ),
                    'Recovering protects depth if uncertain. Here you can stop the underhit switch before A.',
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        15, "Stop the cross at source",
        "Pressure or protect?",
        ('press', 'cover', 'tackle'),
        (
            Situation(
                (18, 80), (14, 77), (48, 86), (41, 82),
                0,
                "You can reach the winger before the crossing foot swings.",
                "Close under control to make the cross harder.",
                ratings=(2, 1, 0),
                zone=(26, 84),
                notes=(
                    '',
                    (
                        "Guarding the inside can help if you cannot close. Here you can make A's cross harder at "
                        'source.'
                    ),
                    'A still controls the ball. A late reach risks a foul or lets A cross around you.',
                ),
            ),
            Situation(
                (31, 79), (12, 78), (49, 86), (39, 82),
                1,
                (
                    "You cannot reach the winger before the cross. The inside route is "
                    "open."
                ),
                "Protect dangerous inside space instead of making a late rush.",
                ratings=(0, 2, 0),
                zone=(32, 85),
                notes=(
                    'You cannot reach A before the cross. Chasing the winger leaves the inside space open.',
                    '',
                    'A is too far away and the ball is controlled. You cannot tackle before the cross.',
                ),
            ),
            Situation(
                (17, 81), (16, 79), (48, 86), (41, 82),
                2,
                "The winger's preparation touch rolls loose beside you.",
                "Win the exposed ball before the cross can happen.",
                ratings=(1, 1, 2),
                state="loose",
                zone=(25, 85),
                notes=(
                    (
                        'Closing under control is possible if timing is uncertain. A has left a reachable loose '
                        'touch.'
                    ),
                    (
                        'Protecting inside is safe if you cannot challenge. Here you can win the loose ball '
                        'first.'
                    ),
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        16, "Watch the cut-back",
        "Look behind the ball",
        ('press', 'lane', 'intercept'),
        (
            Situation(
                (20, 87), (15, 89), (41, 84), (38, 80),
                0,
                (
                    "You are nearest to the byline carrier. Your teammate marks the "
                    "receiver."
                ),
                (
                    "Pressure the carrier while M is goal-side of the receiver. Keep "
                    "checking that support remains in place."
                ),
                ratings=(2, 1, 0),
                notes=(
                    '',
                    (
                        'Guarding the cut-back route can help if you keep A in view. M already watches the '
                        'receiver.'
                    ),
                    'A still controls the ball at the byline. There is no released cut-back to intercept yet.',
                ),
            ),
            Situation(
                (32, 84), (15, 89), (19, 88), (38, 80),
                1,
                "Your teammate pressures the byline. A runner waits near the middle.",
                "Protect the route to the receiver instead of joining the same ball.",
                ratings=(0, 2, 0),
                notes=(
                    'M already pressures A. Joining M leaves R waiting alone for the cut-back.',
                    '',
                    'A has not released the ball. Gambling at it can open the pass to R.',
                ),
            ),
            Situation(
                (31, 83), (30, 85), (19, 88), (38, 80),
                2,
                "The cut-back is played slowly through your path.",
                "Intercept the released ball before it reaches the shooter.",
                ratings=(0, 1, 2),
                state="pass",
                attacker=(15, 88),
                origin=(15, 89),
                notes=(
                    (
                        'A has already released the cut-back. Chasing the passer does not stop the ball reaching '
                        'R.'
                    ),
                    (
                        'Guarding the lane helps if you cannot reach the ball. This slow pass is close enough to '
                        'cut out.'
                    ),
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        17, "Protect the far post",
        "See the cross and your player",
        ('mark', 'intercept', 'cover'),
        (
            Situation(
                (32, 87), (81, 76), (53, 86), (29, 81),
                0,
                (
                    "The ball comes from the other wing. An attacker runs behind your "
                    "shoulder."
                ),
                "Keep the runner in view while staying between them and goal.",
                ratings=(2, 0, 1),
                attacker=(83, 74),
                origin=(83, 76),
                zone=(31, 90),
                notes=(
                    '',
                    'The ball is on the far wing. You cannot reach it before the cross and would lose R.',
                    'Protecting the far-post area can help, but keep R in view as R runs toward that space.',
                ),
            ),
            Situation(
                (32, 87), (33, 84), (53, 86), (29, 76),
                1,
                "The low cross reaches your feet before the far-post runner.",
                "Deal with the reachable ball instead of letting it roll across goal.",
                ratings=(1, 2, 1),
                state="pass",
                attacker=(83, 74),
                origin=(83, 76),
                zone=(31, 90),
                notes=(
                    'Stay with R if you cannot play the cross safely. Here the low ball reaches you first.',
                    '',
                    'Guarding the far post can help if the ball escapes you. Do not ignore a reachable cross.',
                ),
            ),
            Situation(
                (25, 81), (81, 76), (59, 86), (71, 65),
                2,
                (
                    "No runner is at the far post, but the central defenders have moved "
                    "toward the ball."
                ),
                "Protect the uncovered far-post area and check for a late run.",
                ratings=(0, 0, 2),
                attacker=(83, 74),
                origin=(83, 76),
                zone=(30, 90),
                notes=(
                    'R is far from the far post. Following R away leaves the empty far-post space uncovered.',
                    'The ball is still on the far wing. A chase to intercept leaves the far-post space open.',
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        18, "React to the rebound",
        "The danger is not over",
        ('collect', 'block', 'mark'),
        (
            Situation(
                (36, 85), (36, 83), (56, 85), (60, 76),
                0,
                "The rebound is beside you. A and R are farther away; you have time to control.",
                "Collect with your feet and look for a short pass. Do not clear automatically when you have time.",
                ratings=(2, 1, 0),
                state="loose",
                attacker=(44, 75),
                origin=(50, 92),
                notes=(
                    '',
                    (
                        'Holding the shooting line is cautious if unsure. Here you have time to control the '
                        'rebound.'
                    ),
                    'R is farther from the rebound. Following R now gives up a ball you can collect.',
                ),
            ),
            Situation(
                (36, 87), (41, 82), (61, 85), (58, 76),
                1,
                "The attacker reaches the rebound first and sets up another shot.",
                "Get into the shooting line instead of lunging at the controlled ball.",
                ratings=(0, 2, 0),
                attacker=(41, 80),
                origin=(50, 92),
                notes=(
                    'A gets there first. Lunging for the rebound risks missing the ball or fouling A.',
                    '',
                    'R is not the immediate danger. A is ready for another shot and needs confronting.',
                ),
            ),
            Situation(
                (35, 86), (54, 81), (53, 85), (32, 80),
                2,
                "M is closer to the loose ball. A second attacker runs free near you.",
                (
                    "Track the free attacker and watch M. React again if M cannot control "
                    "or clear the ball."
                ),
                ratings=(0, 1, 2),
                attacker=(60, 76),
                state="loose",
                origin=(50, 92),
                notes=(
                    'M is closer to the rebound. Both of you chasing it leaves the nearby R free.',
                    'Protecting the shooting line can help if M loses it, but keep watching the free R.',
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        19, "We lost the ball",
        "Press nearby or recover?",
        ('press', 'recover', 'intercept'),
        (
            Situation(
                (24, 48), (24, 44), (48, 73), (41, 59),
                0,
                (
                    "You are close to the new carrier. Your teammate protects the space "
                    "behind."
                ),
                "Slow the counter-attack immediately while cover is in place.",
                ratings=(2, 1, 0),
                notes=(
                    '',
                    (
                        'Recovering protects depth if you cannot close safely. Here you are close and M is '
                        'behind.'
                    ),
                    'The new carrier controls the ball. There is no released pass to intercept.',
                ),
            ),
            Situation(
                (18, 39), (39, 55), (62, 70), (28, 67),
                1,
                "The carrier is far away and your defensive channel is empty.",
                (
                    "Recover into the open defensive space instead of chasing a distant "
                    "ball."
                ),
                ratings=(0, 2, 0),
                notes=(
                    'A is far away. A long chase leaves your defensive channel empty.',
                    '',
                    'A has not passed and is far from you. Guessing at a pass delays your recovery.',
                ),
            ),
            Situation(
                (28, 62), (28, 59), (48, 73), (24, 69),
                2,
                "The first forward pass rolls slowly across your route.",
                "Intercept the reachable pass to stop the break.",
                ratings=(1, 1, 2),
                state="pass",
                attacker=(32, 49),
                origin=(32, 49),
                notes=(
                    'Pressure on A can help if the pass escapes you, but A has already released this ball.',
                    'Protecting depth is safe if you cannot arrive. This slow pass crosses within your reach.',
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        20, "Win it, then keep it",
        "Choose a safe next action",
        ('pass', 'carry', 'clear'),
        (
            Situation(
                (24, 76), (24, 75), (34, 74), (27, 69),
                0,
                (
                    "A nearby teammate is facing you and calling. The short ground-pass "
                    "lane is clear."
                ),
                (
                    "Use a gentle pass to feet, then offer support. An open receiver still "
                    "needs time to control."
                ),
                ratings=(2, 1, 0),
                state="owned",
                notes=(
                    '',
                    'The wide space is open too. Use a close touch and look again before A approaches.',
                    'There is no urgent need to clear. M is ready for a short pass and you have a wide exit.',
                ),
            ),
            Situation(
                (24, 72), (24, 71), (48, 70), (44, 68),
                1,
                (
                    "The inside teammate is marked and looking away. Wide space beside you "
                    "is clear."
                ),
                "Carry wide instead of forcing a pass through the opponent.",
                ratings=(0, 2, 0),
                state="owned",
                extras=((46, 68),),
                receiver_ready=False,
                notes=(
                    'M is marked and looking away. Do not force the inside pass when the wide route is open.',
                    '',
                    'You have clear space beside you. Clearing now gives up a chance to keep the ball.',
                ),
            ),
            Situation(
                (29, 88), (29, 87), (45, 84), (31, 83),
                2,
                (
                    "Near goal, you face immediate pressure with no safe short passing or "
                    "dribbling exit."
                ),
                "Remove urgent danger with a wide clearance.",
                ratings=(0, 0, 2),
                state="owned",
                attacker=(31, 85),
                extras=((43, 83), (19, 82)),
                notes=(
                    (
                        "M's short lane is blocked under immediate pressure. A rushed pass could leave danger "
                        'near goal.'
                    ),
                    (
                        'An opponent blocks the short wide route. A touch that way can run straight into '
                        'pressure.'
                    ),
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        21, "Receive under pressure",
        "Scan before the pass arrives",
        ('pass', 'carry', 'clear'),
        (
            Situation(
                (24, 78), (24, 77), (34, 75), (24, 70),
                0,
                (
                    "You looked before the pass arrived. A nearby teammate is facing you "
                    "and ready."
                ),
                (
                    "A gentle ground pass to the ready teammate is a good option. Stay "
                    "available for a return."
                ),
                ratings=(2, 1, 0),
                state="receiving",
                origin=(34, 75),
                notes=(
                    '',
                    (
                        'The wide first touch is possible if it stays away from A. Look again before your next '
                        'action.'
                    ),
                    (
                        'You have a ready short receiver and room wide. There is no need for an emergency '
                        'clearance.'
                    ),
                ),
            ),
            Situation(
                (24, 78), (24, 77), (43, 72), (37, 73),
                1,
                (
                    "The inside teammate is marked and looking away. Space toward the "
                    "touchline is clear."
                ),
                "Direct the first touch away from pressure into the wide space.",
                ratings=(0, 2, 0),
                state="receiving",
                origin=(43, 72),
                extras=((41, 70),),
                receiver_ready=False,
                notes=(
                    'M is marked and not looking. Forcing the return pass risks a loose ball in the middle.',
                    '',
                    'The wide space is clear. You can keep the ball rather than clearing without need.',
                ),
            ),
            Situation(
                (25, 90), (25, 89), (40, 88), (27, 85),
                2,
                (
                    "Pressure arrives with the ball near your goal. Every short exit is "
                    "blocked."
                ),
                "Clear wide promptly when there is no safe short exit.",
                ratings=(0, 0, 2),
                state="receiving",
                attacker=(27, 87),
                origin=(40, 88),
                extras=((38, 87), (16, 84)),
                notes=(
                    'The short receiver is blocked. A rushed return pass can give A a chance near your goal.',
                    'The short wide exit is blocked too. Do not dribble into the waiting opponent.',
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        22, "Defend a sideline restart",
        "Watch receivers as well as the ball",
        ('mark', 'lane', 'intercept'),
        (
            Situation(
                (23, 76), (5, 66), (19, 66), (19, 72),
                0,
                (
                    "Your teammate covers the short option. Your assigned player runs "
                    "behind you."
                ),
                "Track your assignment instead of watching only the restart taker.",
                ratings=(2, 0, 0),
                state="restart",
                extras=((15, 64),),
                notes=(
                    '',
                    'M handles the short option. Guarding it again leaves your assigned R free behind you.',
                    'The restart has not been taken. A guess at the ball leaves your runner unmarked.',
                ),
            ),
            Situation(
                (23, 76), (5, 66), (35, 79), (14, 70),
                1,
                (
                    "Your job is the short receiving lane. Your teammate covers the deeper "
                    "run."
                ),
                "Protect the short route while keeping the restart in view.",
                ratings=(0, 2, 0),
                state="restart",
                extras=((34, 75),),
                notes=(
                    'M handles the deeper run. Following R abandons your assigned short receiving lane.',
                    '',
                    (
                        'The ball has not been released. Hold your lane rather than jumping at a guessed '
                        'delivery.'
                    ),
                ),
            ),
            Situation(
                (20, 74), (19, 71), (35, 79), (27, 74),
                2,
                "The restart is taken and a slow ball crosses your path.",
                "Intercept the released ball before it reaches the receiver.",
                ratings=(1, 1, 2),
                state="pass",
                attacker=(5, 66),
                origin=(5, 66),
                notes=(
                    (
                        'Tracking R can help if you cannot reach the delivery. Here the slow ball crosses your '
                        'path.'
                    ),
                    'Staying in the lane helps if the ball is beyond reach. Here you can cut it out first.',
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        23, "Defend a corner",
        "Keep your assigned responsibility",
        ('mark', 'cover', 'press'),
        (
            Situation(
                (32, 87), (5, 94), (16, 89), (29, 82),
                0,
                (
                    "Your job is to mark the nearby runner. A teammate handles the short "
                    "corner."
                ),
                (
                    "Keep your assigned player covered while someone else pressures the "
                    "short option."
                ),
                ratings=(2, 0, 0),
                state="restart",
                attacker=(5, 94),
                origin=(5, 94),
                extras=((12, 89),),
                notes=(
                    '',
                    'Your job is R, not a zone. Letting R run free risks an unmarked finish at goal.',
                    'M handles the short corner. Rushing toward A leaves your own runner free.',
                ),
            ),
            Situation(
                (34, 86), (5, 94), (60, 87), (62, 83),
                1,
                "Your job is the central zone. The runner is assigned to a teammate.",
                "Hold the assigned zone instead of following an already covered player.",
                ratings=(0, 2, 0),
                state="restart",
                attacker=(5, 94),
                origin=(5, 94),
                zone=(34, 86),
                notes=(
                    'M already has R. Following R as well leaves your assigned central zone empty.',
                    '',
                    'Leaving your zone to chase the corner taker opens space in front of goal.',
                ),
            ),
            Situation(
                (18, 87), (12, 89), (54, 85), (55, 81),
                2,
                "Your job is the short corner. The short receiver controls the ball.",
                (
                    "Close the short receiver while teammates keep their central "
                    "assignments."
                ),
                ratings=(0, 0, 2),
                origin=(5, 94),
                notes=(
                    'M handles the central R. Leaving the short receiver alone gives A time to cross.',
                    'Your job is the short receiver. Staying behind M gives A time to carry or cross.',
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        24, "Stay ready at a free kick",
        "Read the restart and your role",
        ('mark', 'cover', 'press'),
        (
            Situation(
                (30, 84), (25, 67), (49, 84), (27, 77),
                0,
                (
                    "You are assigned the nearby receiver, who starts a run as the kicker "
                    "looks up."
                ),
                "Track the receiver instead of watching only the kicker.",
                ratings=(2, 0, 0),
                state="restart",
                notes=(
                    '',
                    'Your job is the nearby R. Dropping into a different area lets R run free.',
                    (
                        'The kick has not been taken. Do not abandon R or move inside the required restart '
                        'distance.'
                    ),
                ),
            ),
            Situation(
                (35, 84), (25, 67), (23, 80), (22, 76),
                1,
                "Your job is the central zone. Teammates already mark the runners.",
                "Protect the zone instead of duplicating a teammate's assignment.",
                ratings=(0, 2, 0),
                state="restart",
                zone=(35, 84),
                notes=(
                    'M already marks the runner. Following R as well leaves your central zone empty.',
                    '',
                    'The ball is not yet in play. Keep the required distance and hold your assigned zone.',
                ),
            ),
            Situation(
                (29, 81), (26, 76), (49, 84), (53, 75),
                2,
                "A quick short restart has been taken. You are nearest and have cover.",
                (
                    "React to the ball now in play and pressure the short receiver under "
                    "control."
                ),
                ratings=(1, 1, 2),
                origin=(25, 67),
                notes=(
                    'Tracking R can help if another teammate closes A. Here you are nearest to the live ball.',
                    (
                        'Keeping depth can help if a teammate takes A. Do not leave the short receiver '
                        'unchallenged.'
                    ),
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        25, "Receive the keeper's throw",
        "Scan first: where is the pressure?",
        ('pass', 'carry', 'shield'),
        (
            Situation(
                (24, 76), (24, 75), (34, 73), (24, 62),
                0,
                (
                    "After your first touch, pressure approaches. Nearby M faces you and "
                    "calls for the ball."
                ),
                (
                    "Use the short clear lane with a gentle pass to feet, then support. Do "
                    "not assume the touch will stick."
                ),
                ratings=(2, 1, 1),
                state="keeper",
                attacker=(24, 62),
                origin=(50, 93),
                notes=(
                    '',
                    'A touch into clear wide space is possible. Keep it close and check the next pressure.',
                    (
                        'You can protect the ball while looking up. A is still far enough away for a ready short '
                        'pass.'
                    ),
                ),
            ),
            Situation(
                (24, 76), (24, 75), (45, 70), (39, 69),
                1,
                (
                    "After your first touch, the inside receiver is marked. Wide space is "
                    "clear."
                ),
                (
                    "Take the next touch away from inside pressure into the clear wide "
                    "area."
                ),
                ratings=(0, 2, 1),
                state="keeper",
                attacker=(39, 69),
                origin=(50, 93),
                extras=((45, 68),),
                receiver_ready=False,
                notes=(
                    "M is marked and not looking. Do not force the inside pass after the keeper's throw.",
                    '',
                    (
                        'Protecting the ball while looking up is possible. You also have open space away from '
                        'inside pressure.'
                    ),
                ),
            ),
            Situation(
                (24, 80), (24, 79), (38, 89), (16, 76),
                2,
                (
                    "After your first touch, the ball is still settling. A closes from the "
                    "touchline; GK offers a return."
                ),
                (
                    "Keep the ball within playing distance and shield without pushing. Then"
                    " look to the keeper's feet."
                ),
                ratings=(1, 0, 2),
                state="keeper",
                attacker=(16, 76),
                origin=(38, 89),
                keeper=(38, 89),
                extras=((13, 69),),
                notes=(
                    (
                        "A return to GK's feet is possible once the ball is settled. Check the lane and support "
                        'the keeper.'
                    ),
                    (
                        'A approaches from the touchline side. Taking the ball that way moves it into the '
                        'pressure.'
                    ),
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        26, "A loose first touch from the keeper",
        "Who can reach the ball safely?",
        ('collect', 'contain', 'clear'),
        (
            Situation(
                (24, 76), (24, 73), (45, 76), (24, 64),
                0,
                (
                    "Your first touch from the throw runs a little loose. You are clearly "
                    "closer than the attacker."
                ),
                (
                    "Collect with your feet before the attacker reaches it, then look for a"
                    " safe pass."
                ),
                ratings=(2, 1, 0),
                state="keeper",
                attacker=(24, 64),
                origin=(50, 93),
                notes=(
                    '',
                    (
                        'Staying goal-side is safe if you cannot reach cleanly. Here you have a clear lead to the '
                        'loose touch.'
                    ),
                    (
                        'A is farther away and you have time to collect. Clearing automatically gives up '
                        'possession.'
                    ),
                ),
            ),
            Situation(
                (24, 72), (24, 66), (48, 80), (24, 64),
                1,
                (
                    "Your first touch runs toward the attacker, who will reach the ball "
                    "before you."
                ),
                (
                    "Stay goal-side and delay. Do not lunge for a ball the opponent reaches"
                    " first."
                ),
                ratings=(0, 2, 0),
                state="keeper",
                attacker=(24, 64),
                origin=(50, 93),
                notes=(
                    'A reaches this loose touch first. A lunge can miss and let A get beyond you.',
                    '',
                    (
                        'You cannot reach the ball before A to make a clearance. Get goal-side rather than '
                        'lunging.'
                    ),
                ),
            ),
            Situation(
                (28, 88), (28, 86), (44, 85), (28, 81),
                2,
                (
                    "Your first touch runs loose near goal. You reach it first, but short "
                    "exits are blocked."
                ),
                (
                    "A controlled wide clearance is the lower-risk choice under this "
                    "immediate pressure."
                ),
                ratings=(1, 0, 2),
                state="keeper",
                attacker=(28, 81),
                origin=(50, 93),
                extras=((42, 85), (20, 82)),
                notes=(
                    (
                        'You can reach it first, but pressure and blocked exits leave little time for another '
                        'touch.'
                    ),
                    'The loose ball is near goal. Backing away lets A take it into a dangerous area.',
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        27, "A teammate's first touch runs loose",
        "Pass, then stay ready to help",
        ('collect', 'cover', 'mark'),
        (
            Situation(
                (30, 77), (30, 73), (34, 69), (54, 63),
                0,
                (
                    "Your pass reaches M, but the first touch runs loose toward you. You "
                    "are closest."
                ),
                (
                    "Help collect the loose ball, then look for a short ground pass. "
                    "Work together to reset the play."
                ),
                ratings=(2, 1, 0),
                state="teammate",
                attacker=(43, 63),
                origin=(34, 69),
                notes=(
                    '',
                    'Protecting behind the ball can help if you cannot collect cleanly. Here you are closest.',
                    'R is farther away. Following R now leaves the loose ball that you can help M recover.',
                ),
            ),
            Situation(
                (30, 78), (30, 69), (33, 67), (55, 64),
                1,
                (
                    "M's first touch runs loose. The opponent is now closer to it than "
                    "either of you."
                ),
                (
                    "Protect the route to goal and call for support. Do not both chase a "
                    "ball the opponent reaches first."
                ),
                ratings=(0, 2, 0),
                state="teammate",
                attacker=(30, 66),
                origin=(33, 67),
                zone=(36, 80),
                notes=(
                    (
                        'A is closer than both you and M. Both chasing the loose ball can let A beat two '
                        'defenders.'
                    ),
                    '',
                    "R is farther from goal. Following R leaves A's route to goal unprotected.",
                ),
            ),
            Situation(
                (35, 81), (28, 72), (28, 74), (40, 78),
                2,
                (
                    "M is closest and moving to the loose ball. Another attacker runs "
                    "behind your shoulder."
                ),
                (
                    "Keep the free runner covered while M deals with the ball. Recheck "
                    "before assuming M has control."
                ),
                ratings=(0, 1, 2),
                state="teammate",
                attacker=(23, 64),
                origin=(28, 74),
                notes=(
                    'M is closest and moving to the ball. Joining M leaves R free behind you.',
                    'Keeping depth can help if M loses the ball. You must also keep R in view.',
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        28, "Stay up, stand tackle, or slide?",
        "Can you reach the ball without hurting A?",
        ("contain", "tackle", "slide"),
        (
            Situation(
                (25, 74), (25, 65), (48, 81), (54, 65), 0,
                "A controls the ball close to both feet. You have room to stay in front.",
                "Stay on your feet and match A. A can change direction if you commit to the ground now.",
                ratings=(2, 0, 0), attacker=(25, 63),
                notes=(
                    '',
                    (
                        'A keeps the ball close and is beyond your reach. Stay balanced rather than reaching at '
                        "A's feet."
                    ),
                    (
                        'A can change direction while you are on the ground. There is no exposed ball to slide '
                        'for.'
                    ),
                ),
            ),
            Situation(
                (25, 73), (25, 71), (48, 81), (54, 65), 1,
                "The ball rolls loose beside your foot. A is farther away; you can reach it standing.",
                "Use the standing tackle here. You can reach the ball while staying balanced and ready to move again.",
                ratings=(1, 2, 1), state="loose", attacker=(25, 63),
                notes=(
                    (
                        'Holding goal-side stays safe if you cannot challenge cleanly. Here the loose ball is '
                        'beside your foot.'
                    ),
                    '',
                    (
                        'A is clear of the ball, so a controlled slide is possible. Standing keeps you ready for '
                        'the next play.'
                    ),
                ),
            ),
            Situation(
                (31, 87), (36, 88), (65, 83), (61, 75), 2,
                "A shot rolls toward goal. Only a slide reaches its path in time; A is well away from your route.",
                "In this picture a controlled slide can knock the ball wide. Do not slide through A or follow through into A.",
                ratings=(0, 0, 2), state="shot", attacker=(24, 78), origin=(24, 78),
                notes=(
                    (
                        'A has already shot. Containing the distant A will not stop the ball travelling toward '
                        'goal.'
                    ),
                    (
                        "The shot is beyond a standing step in the stated picture. Do not arrive late at A's "
                        'legs.'
                    ),
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        29, "Short pass or long kick?",
        "Who can use the next ball?",
        ("pass", "long", "carry"),
        (
            Situation(
                (24, 76), (24, 75), (34, 72), (24, 62), 0,
                "Nearby M is looking and calling. An opponent waits farther up the left side.",
                "Use a short ground pass to ready M, then support the first touch. A long kick toward the waiting opponent may lose the ball.",
                ratings=(2, 0, 1), state="owned", attacker=(24, 62), extras=((12, 24),),
                notes=(
                    '',
                    (
                        "An opponent waits near the long kick's landing area. You have a ready teammate for a "
                        'short pass.'
                    ),
                    'The nearby wide space is open too. Keep the touch close and look again before passing.',
                ),
            ),
            Situation(
                (25, 86), (25, 85), (40, 82), (25, 82), 1,
                "A closes near your goal. M is marked, the short wide exit is blocked, and space is open farther up the flank.",
                "Aim a long kick up the side, away from your goal. It can buy time, but either team may get the next ball.",
                ratings=(0, 2, 0), state="owned", attacker=(25, 82),
                extras=((38, 81), (18, 79)), receiver_ready=False,
                notes=(
                    (
                        'M is marked. A forced short pass near your goal could give the opponent a shooting '
                        'chance.'
                    ),
                    '',
                    'The short wide route is blocked. Do not dribble into that opponent while A closes.',
                ),
            ),
            Situation(
                (24, 70), (24, 69), (40, 65), (38, 64), 2,
                "M is marked and another opponent waits upfield. The space toward the left touchline is clear.",
                "Carry into the nearby clear space and look again. There is no need to force a pass or launch the ball now.",
                ratings=(0, 0, 2), state="owned", attacker=(38, 64),
                extras=((40, 63), (9, 23)), receiver_ready=False,
                notes=(
                    'M is marked and looking away. Do not force the pass when you have open space beside you.',
                    'An opponent waits near the landing area. There is no urgent need to launch the ball.',
                    '',
                ),
            ),
        ),
    ),
    Lesson(
        30, "When a pass is intercepted",
        "React to the next danger",
        ("press", "recover", "intercept"),
        (
            Situation(
                (31, 65), (32, 65), (18, 76), (55, 48), 0,
                "M's pass rolls short across your path. You can reach it before A.",
                "Step into the slow pass before A reaches it. Then look up again.",
                ratings=(2, 1, 0), state="pass", attacker=(41, 57), origin=(24, 71),
                interception_target=(32, 65), actions=("intercept", "recover", "press"),
                notes=(
                    "",
                    "Stay goal-side if you are unsure you can arrive first. Here the ball crosses your path.",
                    "A is still several steps away. Do not run toward A and leave the pass.",
                ),
            ),
            Situation(
                (36, 56), (34, 63), (26, 54), (55, 46), 0,
                "A intercepts M's pass and drives forward. You are behind the play.",
                "Run back goal-side first. A has the ball and is moving toward your goal.",
                ratings=(2, 1, 0), state="owned", attacker=(34, 63), origin=(26, 54),
                actions=("recover", "contain", "tackle"),
                notes=(
                    "",
                    "Contain goal-side if you cannot get in front safely. Keep watching A.",
                    "A controls the ball several steps ahead. A reach from behind may miss or foul.",
                ),
            ),
            Situation(
                (24, 73), (18, 67), (38, 76), (55, 62), 0,
                "A controls M's loose pass near the line. You are goal-side; M covers inside.",
                "Close A under control while M protects the route into the middle.",
                ratings=(2, 1, 0), state="owned", attacker=(22, 67), origin=(38, 75),
                actions=("press", "cover", "tackle"),
                notes=(
                    "",
                    "Keeping your goal-side spot is reasonable if A might pass or turn away.",
                    "A keeps the ball close. A rushed tackle can miss; close under control first.",
                ),
            ),
        ),
    ),
    Lesson(
        31, "A enters shooting range",
        "Close the space and cover the shot line",
        ("press", "block", "recover"),
        (
            Situation(
                (40, 79), (37, 70), (64, 85), (70, 52), 0,
                "A reaches the box with the ball close. You have time to close before A sets to shoot.",
                "Close quickly, then slow down between A and goal. Give A less space to set up a shot.",
                ratings=(2, 1, 0), attacker=(37, 67), press_gap=6.,
                notes=(
                    "",
                    "Protecting the shot line also helps. Keep moving closer while balanced; do not wait deep by your goal.",
                    "Backing away gives A more time to set the shot. Close the space while staying between A and goal.",
                ),
            ),
            Situation(
                (47, 87), (40, 81), (66, 88), (70, 54), 1,
                "A cuts inside the box and draws a foot back. The ball stays close; you can step into the shooting line.",
                "Step into the shot line, stay balanced and keep your arms close. Watch the ball; do not turn away.",
                ratings=(1, 2, 0), attacker=(39, 78), press_gap=6.,
                notes=(
                    "A is already preparing to shoot. A short, balanced close can help if you stay in the shot line.",
                    "",
                    "Dropping toward GK gives A more of the goal to aim at. Step across the shooting line now.",
                ),
            ),
            Situation(
                (53, 88), (63, 81), (38, 88), (70, 54), 1,
                "A keeps the ball close on the right inside the box and prepares a near-post shot. You are nearer the middle.",
                "Move across between the ball and the right post. Stay on your feet and keep your arms close.",
                ratings=(0, 2, 0), attacker=(64, 78), press_gap=6., shot_target=(60, 100),
                notes=(
                    "You may not reach A before the shot. Protect the near-post line first.",
                    "",
                    "Dropping deeper through the middle leaves the right-post shooting lane open.",
                ),
            ),
        ),
    ),
    Lesson(
        32, "Help stop the next shot",
        "Protect the shot line behind a teammate",
        ("block", "press", "cover"),
        (
            Situation(
                (51, 86), (44, 81), (33, 70), (68, 85), 0,
                "A beats M inside the box and draws a foot back. You are now the nearest defender between A and goal.",
                "Step across the shot line and stay balanced. M is behind the play; you must help protect goal now.",
                ratings=(2, 1, 0), attacker=(43, 78), press_gap=6.,
                notes=(
                    "",
                    "A short, balanced close can help if you stay in the shot line. Do not sprint past the ball.",
                    "M is already beaten. Moving back toward M leaves A's shooting route to goal open.",
                ),
            ),
            Situation(
                (42, 89), (40, 78), (44, 78), (65, 82), 0,
                "M presses A from the inside, but A still controls the ball and can shoot at the near post. You are behind M.",
                "Cover the near-post shot line behind M. Stay balanced; M's pressure does not guarantee the shot is stopped.",
                ratings=(2, 0, 1), attacker=(39, 75), press_gap=6.,
                shot_target=(40, 100), zone=(40, 89),
                notes=(
                    "",
                    "M is already closing A. Joining M leaves the near-post shooting lane open.",
                    "Staying behind M on this shot line also protects goal. Keep watching A instead of assuming M will stop the shot.",
                ),
            ),
            Situation(
                (48, 84), (45, 77), (33, 68), (75, 59), 1,
                "M is beaten inside the box. A keeps the ball close and looks up to shoot. You can close before A kicks.",
                "Close between A and goal, then slow down. Keep the shot line covered; M has not recovered.",
                ratings=(1, 2, 0), attacker=(44, 74), press_gap=6.,
                notes=(
                    "Moving into the shot line helps too. Keep closing under control because A still has time for another touch.",
                    "",
                    "M is already behind A. Moving toward M leaves the shot unchallenged.",
                ),
            ),
        ),
    ),
    Lesson(
        33, "Cut inside and shoot",
        "Stay between the ball and goal",
        ("block", "press", "recover"),
        (
            Situation(
                (43, 83), (37, 73), (66, 85), (70, 55), 1,
                "A cuts in from the left with the ball close. You can close before A plants a foot to shoot.",
                "Move toward A from the goal side, then slow down. Take away shooting space without running past A.",
                ratings=(1, 2, 0), attacker=(36, 70), origin=(19, 64),
                attacker_start=(18, 61), press_gap=6.,
                notes=(
                    "Covering the shot line helps too. Keep closing while A is still setting up, rather than waiting beside GK.",
                    "",
                    "Dropping deeper lets A finish the cut and set the shot. Close the space while protecting the middle.",
                ),
            ),
            Situation(
                (48, 87), (37, 80), (66, 85), (70, 55), 0,
                "A keeps control after cutting in from the left and prepares a shot toward the far corner.",
                "Step between the ball and the right side of goal. Stay balanced and watch the kick instead of chasing A.",
                ratings=(2, 0, 0), attacker=(36, 77), origin=(19, 68),
                attacker_start=(18, 65), shot_target=(60, 100), press_gap=6.,
                notes=(
                    "",
                    "A is ready to kick now. Chasing the dribbler can leave the far-corner shooting lane open.",
                    "Backing toward GK gives A more goal to aim at. Move across the shooting lane while staying on your feet.",
                ),
            ),
            Situation(
                (52, 88), (62, 80), (34, 87), (30, 55), 0,
                "A keeps control after cutting in from the right and draws a foot back toward the far corner. You are goal-side.",
                "Step across the shot line toward the left side of goal. Keep your balance and your arms close.",
                ratings=(2, 0, 0), attacker=(63, 77), origin=(82, 68),
                attacker_start=(83, 65), shot_target=(40, 100), press_gap=6.,
                notes=(
                    "",
                    "A has already set the shot. Running at A can miss the cross-goal shooting line.",
                    "Retreating straight toward GK leaves the angled shot open. Move into the ball's route toward the left side.",
                ),
            ),
        ),
    ),
    Lesson(
        34, "How close to the shooter?",
        "Distance, balance and the shot line",
        ("block", "press", "recover"),
        (
            Situation(
                (42, 91.2), (30, 78), (65, 83), (70, 55), 1,
                "You are deep near goal. A controls the ball and still needs to set up the shot; you can close safely.",
                "Close along the shooting line, then slow down before A. Do not keep backing toward your goal.",
                ratings=(1, 2, 0), attacker=(29, 75), press_gap=6.,
                notes=(
                    "Moving up the shot line also helps. Finish balanced in front of A rather than waiting beside GK.",
                    "",
                    "You are already too deep. Backing away gives A more time and room to shoot.",
                ),
            ),
            Situation(
                (36, 84.6), (30, 78), (65, 83), (70, 55), 0,
                "You already cover A's shot line at a useful distance. A keeps the ball close and starts the kicking swing.",
                "Stay set on the shot line, watch the ball and keep your balance. Do not rush into A or back away.",
                ratings=(2, 0, 0), attacker=(29, 75), press_gap=6.,
                notes=(
                    "",
                    "A is already swinging. Moving at A now may upset your balance or carry you past the shot.",
                    "Retreating away from the shooter opens more shooting space. Hold your balanced blocking position instead.",
                ),
            ),
            Situation(
                (40, 81), (30, 78), (65, 83), (70, 55), 0,
                "You are close to A's side, but the shot line is open. A keeps control and draws a foot back.",
                "Move across into the shot line first. Being near A does not protect goal if the ball can pass beside you.",
                ratings=(2, 0, 1), attacker=(29, 75), press_gap=6.,
                notes=(
                    "",
                    "Going straight at A from the side can leave the shot line open. Get between the ball and goal first.",
                    "Dropping inside onto the shot line can help too. Avoid running straight back to GK and leaving A unopposed.",
                ),
            ),
        ),
    ),
)
