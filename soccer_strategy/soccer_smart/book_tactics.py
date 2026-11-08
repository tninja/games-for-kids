"""Original contrasts for missing public-index strategies; no book text copied."""

from .curriculum import BOOK_STAGE
from .model import Actor, Choice, Point, Scenario
from math import hypot

RULES = "Training picture: attack up. Offside is enabled only in the timing lessons."
OFFSIDE = "Offside practice: judge at the pass using ball and second-last opponent. Level is onside."


def actor(key: str, point: Point, team: str = "home", start: Point | None = None) -> Actor:
    return Actor(key, key.upper(), team, point, point if start is None else start, point)


def option(key: str, label: str, rating: int, target: Point, ball: Point,
           kind: str, reason: str, others: tuple[tuple[str, Point], ...] = (),
           loft: float = 0, aim: Point | None = None, via: Point | None = None) -> Choice:
    result = {"pass": "The ball follows the illustrated delivery.",
              "dribble": "John takes the ball along this route.",
              "move": "John moves into the selected space.",
              "receive": "John follows the selected receiving run.",
              "intercept": "John steps toward the passing lane."}[kind]
    return Choice(key, label, target, rating, reason, result, ball, kind, others, loft, aim, via)


def picture(page: int, variant: str, title: str, cue: str, ball: Point,
            people: tuple[Actor, ...], choices: tuple[Choice, ...], groups: tuple[str, ...],
            role: str = "midfielder", rules: str = RULES, line: float | None = None,
            ball_from: Point | None = None) -> Scenario:
    owner = next((p for p in people if hypot(p.position[0]-ball[0],p.position[1]-ball[1]) <= 1.5), None)
    state = ("loose" if owner is None else "controlled" if owner.key == "john" else
             "teammate" if owner.team == "home" else "opponent")
    return Scenario(f"B{page:03d}.{variant}", page, variant, title, BOOK_STAGE, role, groups,
                    title, cue, people, ball, ball if ball_from is None else ball_from,
                    choices, rules, "Read the available space before your next action.",
                    reference_line=line, ball_state=state)


def anticipate(variant: str) -> Scenario:
    released = variant == "A"
    ball = (51., 53.) if released else (45., 50.)
    john = (55., 58.)
    people = (actor("john", john), actor("p", (45., 50.), "away"),
              actor("r", (65., 60.), "away"), actor("m", (67., 70.)))
    return picture(67, variant, "Read the next pass",
                   "P used P-R-P twice. Now a slow pass crosses toward R; John can meet the nearby lane." if released else
                   "P repeated P-R-P earlier, but now only feints and keeps control. M covers R.", ball, people, (
        option("step", "Step into the crossing lane", 2 if released else 0, (55., 55.),
               (55., 55.) if released else ball, "intercept",
               "The slow pass crosses within one step. Meet it before R." if released else
               "No pass has been released. Stepping into an imagined lane exposes your position."),
        option("cover", "Hold central cover with M", 1 if released else 2, (53., 62.),
               (65., 60.) if released else ball, "move",
               "You preserve cover, but a reachable pass could be intercepted." if released else
               "Watch P while maintaining cover; react to a real release, not just a feint."),
        option("chase", "Run toward the original passer" if released else "Close P under control", 0 if released else 1,
               (45., 51.) if released else (50., 56.),
               (65., 60.) if released else ball, "move",
               "Chasing P abandons the central passing lane." if released else
               "Closing P can apply pressure, but keep watching R instead of committing to an imagined pass.")), ("G08", "G18"), "defender")


def offside(variant: str) -> Scenario:
    before = variant == "A"
    behind_ball = variant == "C"
    ball = (40., 20.) if behind_ball else (40., 40.)
    john = (60., 24.) if before or behind_ball else (60., 30.)
    people = (actor("john", john), actor("m", ball), actor("a", (35., 30.), "away"),
              actor("a2", (75., 43.), "away"), actor("gk", (50., 5.), "keeper"))
    return picture(75, variant, "Time an onside run",
                   "M waits before passing to you. Get level with A, the second-last opponent." if before else
                   "M releases now. John was level with A at release; the run can continue." if not behind_ball else
                   "M releases now. John starts behind the ball, although beyond the second-last opponent.",
                   ball, people, (
        option("run", "Run forward to meet the pass", 0 if before else 2, (60., 16.),
               (60., 16.), "receive",
               "Receiving after starting beyond both ball and A at release creates an offside offence." if before else
               "Your position was onside at release. Running beyond the line afterward is allowed."),
        option("reset", "Move back behind the reference line", 2 if before else 1,
               (60., 32.), ball if before else (60., 32.), "move" if before else "receive",
               "Get onside before M releases the pass; merely standing offside was not itself an offence." if before else
               "This remains onside, but you need not retreat after a legal release."),
        option("wait", "Stay and receive the pass", 0 if before else 1, john, john, "receive",
               "If M passes now and you receive, your position at release is beyond both ball and A." if before else
               "Receiving here is legal. The space beyond the line also permits a forward run.")),
                   ("G10",), "forward", OFFSIDE, 20. if behind_ball else 30.)


def throwing(variant: str) -> Scenario:
    forward_open = variant == "B"
    ball = (1., 60.)
    block = (16., 65.) if forward_open else (12., 49.)
    people = (actor("john", (0., 60.)), actor("m", (19., 66.)),
              actor("f", (14., 47.)), actor("a", block, "away"))
    return picture(86, variant, "Choose a throw-in",
                   "A tracks M; F offers an unmarked forward receiving space." if forward_open else
                   "A tracks F; M offers an unmarked supporting option.", ball, people, (
        option("support", "Throw to M", 0 if forward_open else 2, (0., 60.),
               block if forward_open else (19., 66.), "pass",
               "A is close enough to contest that delivery to M." if forward_open else
               "M is ready and unmarked. The short supporting throw retains possession.", loft=32, aim=(19., 66.)),
        option("forward", "Throw into F's receiving space", 2 if forward_open else 0, (0., 60.),
               (14., 47.) if forward_open else block, "pass",
               "F is ready without a nearby marker; use the available forward space." if forward_open else
               "A tracks F and can contest the delivery before F controls it.", loft=32, aim=(14., 47.)),
        option("look", "Scan briefly for another option", 1, (0., 60.), ball, "move",
               "A brief scan is useful, but one teammate already offers a clear option.")), ("G12",),
                   "thrower", "Throw-in practice: a legal two-handed overhead delivery is assumed. Choose the receiver.")


def receive_throw(variant: str) -> Scenario:
    direct = variant == "A"
    ball = (1., 40.)
    people = (actor("john", (20., 35.)), actor("m", (0., 40.)),
              actor("a", (45., 45.), "away"), actor("a2", (65., 60.), "away"),
              actor("gk", (50., 5.), "keeper"))
    return picture(88, variant, "Receive a throw-in",
                   "M throws directly to your free space. Receive with feet; no heading." if direct else
                   "Now M has an ordinary pass and waits. Get behind the ball before receiving.", ball, people, (
        option("meet", "Meet the direct delivery ahead", 2 if direct else 0, (14., 38.), (14., 38.), "receive",
               "There is no offside offence directly from a throw-in. Meet the ball in available space." if direct else
               "This is an ordinary pass. You would receive from an offside starting position.", loft=28 if direct else 0),
        option("back", "Move behind the ball to receive", 1 if direct else 2, (20., 42.),
               (20., 42.) if direct else ball, "receive" if direct else "move",
               "This is also available, though the direct throw does not require retreating for offside." if direct else
               "Move behind the ball before the ordinary pass is released.", loft=28 if direct else 0),
        option("deep", "Offer a deeper supporting option", 1, (25., 50.),
               (25., 50.) if direct else ball, "receive" if direct else "move",
               "You offer a safe deeper option, but a nearer legal receiving space is available." if direct else
               "M keeps the ball while you get onside. The deeper support works, but a nearer reset is available.",
               loft=28 if direct else 0)),
                   ("G12", "G10"), "receiver",
                   "Direct throw-in: no offside offence from this delivery." if direct else OFFSIDE,
                   None if direct else 40.)


def combination(variant: str) -> Scenario:
    marked = variant == "B"
    john = (40., 55.)
    blocker = (42., 47.5) if marked else (47., 52.)
    people = (actor("john", john), actor("m", (44., 40.)), actor("back", (35., 70.)),
              actor("a", blocker, "away"), actor("a2", (64., 48.), "away"))
    return picture(90, variant, "Use a give-and-go",
                   "A screens the pass to M; the left carrying channel is clear." if marked else
                   "M is clear of A. A follows the first pass, leaving room for John's return run.", john, people, (
        option("combine", "Pass to M and run for a return", 0 if marked else 2, (53., 44.),
               blocker if marked else (53., 44.), "pass",
               "A screens the first pass. The combination cannot start through an occupied lane." if marked else
               "M receives the first pass, then returns into John's run beyond A.",
               others=() if marked else (("a", (46., 43.)),),
               aim=(44., 40.) if marked else None, via=None if marked else (44., 40.)),
        option("carry", "Carry into the open left channel", 2 if marked else 1, (30., 47.), (30., 47.), "dribble",
               "The left channel is available when the first combination pass closes." if marked else
               "Carrying is possible, but M also offers a combination beyond A."),
        option("reset", "Pass back to BACK", 1, (39., 57.), (35., 70.), "pass",
               "The reset retains possession while giving up the immediate forward opportunity.")), ("G08", "G13", "G17"))


def feint(variant: str) -> Scenario:
    left_marked = variant == "B"
    john, ball = (38., 48.), (28., 65.)
    blocked = (29.84, 42.) if left_marked else (43., 50.)
    people = (actor("john", john, start=(35., 49.)), actor("m", ball),
              actor("a", blocked, "away", (38., 46.)))
    return picture(103, variant, "Feint without the ball",
                   "A anticipates the left exit after your first step; change into the right space." if left_marked else
                   "A follows your first step right; change direction into the open left space.", ball, people, (
        option("left", "Change direction into the left space", 0 if left_marked else 2, (30., 40.),
               blocked if left_marked else (30., 40.), "receive",
               "A already covers this exit. A feint does not make an occupied route open." if left_marked else
               "Changing direction separates John from A and opens the receiving route.",
               others=() if left_marked else (("a", (45., 53.)),)),
        option("right", "Change direction into the right space", 2 if left_marked else 0, (48., 45.),
               (48., 45.) if left_marked else blocked, "receive",
               "The right side is free after A commits left." if left_marked else
               "A follows you on that side. You have not lost the marker.",
               others=(("a", (29., 40.)),) if left_marked else ()),
        option("hold", "Stay and ask M to wait", 1, john, ball, "move",
               "M can retain possession, but changing the receiving angle would separate you from A.")), ("G13",))


def back_line(variant: str) -> Scenario:
    beaten = variant == "B"
    ball = (48., 80.) if beaten else (50., 62.)
    level = 84. if beaten else 75.
    john = (35., 75.)
    people = (actor("john", john), actor("m", (60., level)), actor("gk", (50., 94.), "keeper"),
              actor("a", ball, "away"), actor("r", (70., 78. if beaten else 68.), "away"))
    return picture(118, variant, "Hold the back line",
                   "A has carried behind John's old line. M drops with R; reconnect goal-side." if beaten else
                   "A is still ahead. M holds the defensive line and R remains in front.", ball, people, (
        option("connect", "Reconnect level with M", 2, (40., level), ball, "move",
               "Recover goal-side and restore the line with M." if beaten else
               "Staying connected avoids opening a large gap between defenders."),
        option("step", "Close A while checking M's cover", 1, (45., 78.) if beaten else (50., 63.), ball, "move",
               "Closing from behind can pressure A, but recovering inside first restores a goal-side position." if beaten else
               "You can close A, but leaving M's level increases the gap between defenders."),
        option("deep", "Drop close to the goalkeeper", 1, (35., 90.), ball, "move",
               "You protect depth, but the larger gap from M gives attackers space between defenders.")), ("G15", "G11"), "defender")


def crossing(variant: str) -> Scenario:
    marked = variant == "B"
    ball, john = (21., 20.), (22., 20.)
    blocker = (46., 19.) if marked else (48., 32.)
    people = (actor("john", john), actor("f", (48., 18.)), actor("m", (42., 32.)),
              actor("a", blocker, "away"), actor("gk", (55., 6.), "keeper"))
    return picture(123, variant, "Choose a low cross",
                   "A tracks F; M is available behind the ball for a cutback." if marked else
                   "F is ready centrally with a clear ground-cross lane.", ball, people, (
        option("cross", "Play a low cross toward F", 0 if marked else 2, (22., 21.),
               blocker if marked else (48., 18.), "pass",
               "A can reach this delivery before F. Use the open cutback instead." if marked else
               "The lane and receiver are available. A low cross reaches the central opportunity.", aim=(48., 18.)),
        option("cutback", "Cut the ball back to M", 2 if marked else 1, (22., 21.), (42., 32.), "pass",
               "M is clear of A and can receive the backward diagonal." if marked else
               "The cutback is safe, though F offers a nearer goal opportunity."),
        option("carry", "Carry farther down the wing", 1, (22., 8.), (22., 8.), "dribble",
               "There is room to carry, but an available teammate can use an earlier delivery.")), ("G16",), "winger")


def defend_cross(variant: str) -> Scenario:
    cutback = variant == "B"
    ball = (33., 73.) if cutback else (35., 80.)
    people = (actor("john", (42., 76.) if cutback else (48., 83.)), actor("m", (25., 77.)),
              actor("p", (18., 74.), "away"), actor("r", (55., 87.), "away"),
              actor("s", (48., 72.), "away"))
    target = (42., 72.4) if cutback else (48., 84.5)
    return picture(127, variant, "Defend a cutback",
                   "A slow cutback rolls toward S at the edge. M already covers P." if cutback else
                   "A low cross travels toward R. John is one step from its lane; M covers P.", ball, people, (
        option("meet", "Step into the shown delivery lane", 2, target, target, "intercept",
               "Meet the reachable ball before the intended receiver."),
        option("runner", "Follow R toward the goal", 0 if cutback else 1, (53., 89.),
               (48., 72.) if cutback else (55., 87.), "move",
               "The ball is a cutback, not a far-post delivery. Following R leaves S's lane open." if cutback else
               "You stay goal-side of R, but could meet the cross before it arrives."),
        option("chase", "Run back toward P and M", 0, (25., 76.),
               (48., 72.) if cutback else (55., 87.), "move",
               "M already covers the crosser. Chasing duplicates that job and leaves the delivery lane.")),
                   ("G16", "G15"), "defender", ball_from=(18., 74.))


def create_space(variant: str) -> Scenario:
    follows = variant == "A"
    john, ball = (45., 45.), (35., 60.)
    people = (actor("john", john, start=(49., 41.)), actor("m", ball), actor("f", (60., 35.)),
              actor("a", (49., 46.), "away", (53., 42.) if follows else (49., 46.)))
    return picture(130, variant, "Pull a marker away",
                   "A follows John. Pull away from F's lane without crowding M." if follows else
                   "A holds F's passing lane instead of following John. Offer M a nearer outlet.", ball, people, (
        option("wide", "Move wide away from F's lane", 2 if follows else 1, (30., 40.),
               (60., 35.) if follows else ball, "move",
               "A follows your run wide; M can now pass into F's lane." if follows else
               "The run adds width, but A still screens F. M needs a different receiving option.",
               others=(("a", (33., 40.)),) if follows else ()),
        option("short", "Offer M a short diagonal", 1 if follows else 2, (40., 54.), (40., 54.), "receive",
               "You help retention; pulling A wider could open the forward lane." if follows else
               "A stays central. A shorter receiving angle lets M keep the ball moving.",
               others=(("a", (44., 51.)),) if follows else ()),
        option("crowd", "Run toward F's receiving lane", 0, (57., 37.),
               (57., 38.) if follows else (49., 46.), "move",
               "Your marker stays in F's delivery lane rather than opening it.",
               others=(("a", (57., 38.)),) if follows else ())), ("G17", "G14"))


def break_lines(variant: str) -> Scenario:
    blocked = variant == "B"
    ball, john = (50., 64.), (50., 65.)
    people = (actor("john", john), actor("m", (50., 38.)), actor("lw", (25., 48.)),
              actor("back", (50., 80.)), actor("a", (50., 50.) if blocked else (40., 50.), "away"),
              actor("a2", (65., 50.) if blocked else (60., 50.), "away"))
    return picture(133, variant, "Pass through a line",
                   "A closes the central gap; LW is available outside the line." if blocked else
                   "M offers beyond the defenders, with a clear gap between A and A2.", ball, people, (
        option("split", "Pass through the line to M", 0 if blocked else 2, (49., 66.),
               (50., 50.) if blocked else (50., 38.), "pass",
               "A occupies the central delivery lane. The gap is not open." if blocked else
               "The pass reaches M beyond the first defensive line.", aim=(50., 38.)),
        option("outside", "Pass outside to LW", 2 if blocked else 1, (49., 66.), (25., 48.), "pass",
               "The outside route progresses around the blocked centre." if blocked else
               "Width is available too, though M offers direct progression through the line."),
        option("back", "Reset through BACK", 1, (50., 66.), (50., 80.), "pass",
               "The reset retains possession without using the open forward option.")), ("G17", "G13"))


def coordinated_line(variant: str) -> Scenario:
    recover = variant == "B"
    line = 72. if recover else 78.
    ball = (50., 75.) if recover else (50., 55.)
    people = (actor("john", (35., line)), actor("m", (65., line)),
              actor("a", ball, "away"), actor("r", (50., 88. if recover else 69.), "away"))
    return picture(150, variant, "Move the line together",
                   "A has broken behind the old line. M calls a recovery toward goal." if recover else
                   "The ball comes backward to A. M calls the line forward; keep your spacing.", ball, people, (
        option("up", "Step forward together with M", 0 if recover else 2, (35., 70.), ball, "move",
               "A is already behind this line. Stepping higher cannot remove that danger." if recover else
               "Both defenders advance together as the ball moves away.", others=(("m", (65., 70.)),)),
        option("down", "Recover together toward goal", 2 if recover else 1, (35., 84.), ball, "move",
               "Both defenders recover goal-side and protect depth together." if recover else
               "Both keep a connected line, but retreating gives up space unnecessarily.", others=(("m", (65., 84.)),)),
        option("hold", "Stay while M follows the call", 0 if recover else 1, (35., line), ball, "move",
               "Staying leaves you disconnected while M protects the space behind." if recover else
               "Your deeper position is cautious, but the line is no longer connected.",
               others=(("m", (65., 84. if recover else 70.)),))), ("G15",), "defender",
                   ball_from=(50., 65.))


def arriving_triangle(variant: str) -> Scenario:
    left_blocked = variant == "B"
    ball = (35., 50.)
    blocker = (48., 58.) if left_blocked else (60., 58.)
    people = (actor("john", (50., 65.)), actor("m", ball), actor("n", (65., 30.)),
              actor("a", (50., 40.), "away"), actor("a2", blocker, "away"))
    return picture(153, variant, "Join the next triangle",
                   "M now has the ball and N has gone forward. A2 covers the left supporting angle." if left_blocked else
                   "M now has the ball and N has gone forward. A2 covers the right supporting angle.", ball, people, (
        option("left", "Arrive at the left diagonal point", 0 if left_blocked else 2, (48., 58.),
               blocker if left_blocked else (48., 58.), "receive",
               "A2 covers that point. A triangle needs an available receiver." if left_blocked else
               "Your diagonal arrival gives M a clear third point."),
        option("right", "Arrive at the right diagonal point", 2 if left_blocked else 0, (60., 58.),
               (60., 58.) if left_blocked else blocker, "receive",
               "The other side stays clear, restoring the triangle around pressure." if left_blocked else
               "A2 occupies that supporting angle. Choose the other side."),
        option("hold", "Remain as a deeper outlet", 1, (50., 65.), (50., 65.), "receive",
               "You offer a safe reset, but the nearer diagonal helps M connect forward.")), ("G17", "G14"))


def scoring_run(variant: str) -> Scenario:
    blocked = variant == "B"
    ball = (25., 20.)
    people = (actor("john", (55., 28.)), actor("lw", ball),
              actor("a", (50., 16.) if blocked else (65., 23.), "away"), actor("gk", (50., 6.), "keeper"))
    return picture(156, variant, "Arrive to finish",
                   "A occupies the forward delivery zone. LW can cut back behind the ball." if blocked else
                   "LW has released toward the free forward zone. Arrive after the pass.", ball, people, (
        option("forward", "Arrive in the forward receiving zone", 0 if blocked else 2, (50., 16.), (50., 16.), "receive",
               "A occupies that delivery point. Running there does not make the cross available." if blocked else
               "You arrive into an available scoring area rather than waiting behind the play."),
        option("cutback", "Drop to meet a cutback", 2 if blocked else 1, (50., 30.), (50., 30.), "receive",
               "The cutback route is clear behind A's forward coverage." if blocked else
               "This remains a safe option, although the forward receiving space is free."),
        option("hold", "Wait outside for a pass to feet", 1, (55., 28.), (55., 28.), "receive",
               "You stay available, but moving into the open delivery zone gives LW a clearer plan.")), ("G19",), "forward")


def build_book_scenes() -> tuple[Scenario, ...]:
    builders = (anticipate, offside, throwing, receive_throw, combination, feint, back_line,
                crossing, defend_cross, create_space, break_lines, coordinated_line, arriving_triangle, scoring_run)
    scenes = tuple(build(v) for build in builders for v in ("A", "B", "C") if v != "C" or build is offside)
    for scene in scenes:
        scene.validate()
    return scenes
