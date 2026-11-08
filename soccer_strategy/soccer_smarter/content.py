"""Original A/B advanced episodes mapped only to publicly confirmed book themes."""

from dataclasses import replace

from .model import Actor, Choice, Episode, Motion, Node, Point, State, Track

TITLES = (
    "Turn and escape",
    "Shape the delivery",
    "Restart director",
    "Prediction lab",
    "Speed dribble and adapt",
    "Penalty-box finish",
    "Break the press",
)


def snapshot(ball: Point, people: tuple[tuple[str, str, str, Point], ...],
             control: str = "john") -> State:
    return State(tuple(Actor(*person) for person in people), ball, control)


def action(state: State, key: str, label: str, rating: int, feedback: str,
           ball: Point | None = None, moves: tuple[tuple[str, Point], ...] = (),
           route: tuple[Point, ...] | None = None, kind: str = "linear",
           next_node: str | None = None, contact: float = .25,
           intent: Track | None = None) -> Choice:
    points = route if route is not None else (state.ball, state.ball if ball is None else ball)
    tracks = tuple((key, Track("linear", (state.positions()[key], target),
                               contact if key == state.control and state.ball == state.positions()[key] else 0))
                   for key, target in moves)
    return Choice(key, label, rating, feedback,
                  Motion(Track(kind, points, contact), tracks), next_node, intent)


def after(state: State, choice: Choice, control: str | None = None) -> State:
    actors, ball = choice.motion.frame(state, 1)
    return State(tuple(replace(a, position=actors[a.key]) for a in state.actors),
                 ball, state.control if control is None else control)


def turn(variant: str) -> Episode:
    blocked = variant == "B"
    state = snapshot((26., 54.), (
        ("john", "JOHN", "home", (26., 54.)), ("back", "BACK", "home", (43., 65.)),
        ("block", "A", "away", (26., 47.)),
        ("second", "A2", "away", (35., 58.) if blocked else (45., 50.))))
    corner = action(state, "turn", "Pull back, then take the side exit", 0 if blocked else 2,
                    "The exit is occupied. Check the side space before choosing the turn." if blocked else
                    "Turning away from A uses the open exit. Look again as A2 moves.",
                    route=((26., 54.), (26., 58.), (35., 58.)), kind="corner", contact=0,
                    moves=(("john", (35., 58.)), ("second", (35., 54.))) if not blocked else
                    (("john", (35., 58.)),), next_node=None if blocked else "adapt")
    # The player and ball share the same two-touch turn, including its corner.
    corner = replace(corner, motion=replace(corner.motion, actors=(
        ("john", Track("corner", ((26., 54.), (26., 58.), (35., 58.)))),
        *corner.motion.actors[1:])))
    back = action(state, "back", "Pass back to BACK", 2,
                  "The side exit is blocked. Your teammate gives you a clear outlet." if blocked else
                  "An open pass also escapes pressure. You do not have to use a trick.",
                  ball=(43., 65.), moves=(("second", (43., 60.)), ("john", (30., 60.))) if blocked else (),
                  next_node="adapt" if blocked else None)
    forward = action(state, "forward", "Carry straight toward goal", 0,
                     "The defender already covers that lane. Find an exit before touching forward.",
                     ball=(26., 47.), moves=(("john", (26., 49.)),), contact=0,
                     intent=Track("linear", (state.ball, (26., 40.))))
    root = Node("root", "Check the exit", "winger", "A is ahead. A2 occupies the side exit; BACK offers support." if blocked else
                "A is ahead. BACK is free and the right-side exit is open.",
                state, (corner, back, forward))
    end = after(state, back if blocked else corner, "back" if blocked else "john")
    safe = action(end, "outlet", "Pass to John" if blocked else "Pass to BACK", 2,
                  "The forward route is closed. A clear support lane keeps possession.",
                  ball=end.positions()["john" if blocked else "back"])
    hold = action(end, "hold", "Pause on the ball and scan", 1,
                  "A2 remains in front. The clear pass is available now.")
    force = action(end, "force", "Carry straight toward goal", 0,
                   "The new defender closes this route. Your first escape does not make every lane safe.",
                   ball=end.positions()["second"], contact=0,
                   moves=((end.control, (end.ball[0], end.ball[1] - 3)),),
                   intent=Track("linear", (end.ball, (end.ball[0], end.ball[1] - 14))))
    adapt = Node("adapt", "Look again after escaping", "midfielder" if blocked else "winger",
                 "Now play BACK. A2 is ahead; John is open diagonally left." if blocked else
                 "A2 has moved directly ahead of John. BACK remains open behind and right.",
                 end, (safe, hold, force))
    return Episode(f"M01.{variant}", TITLES[0], (root, adapt))


def delivery(variant: str) -> Episode:
    curved_block = variant == "B"
    state = snapshot((30., 55.), (
        ("john", "JOHN", "home", (30., 55.)), ("cm", "CM", "home", (65., 30.)),
        ("back", "BACK", "home", (28., 68.)), ("support", "M", "home", (56., 38.)),
        ("block", "A", "away", (44.75, 36.75) if curved_block else (47.5, 42.5)),
        ("second", "A2", "away", (75., 20.))))
    curve = action(state, "curve", "Play the curved route to CM", 0 if curved_block else 2,
                   "The curved route crosses the defender. The straight lane is now clear." if curved_block else
                   "The curved route avoids the blocker and reaches your teammate.",
                   route=(state.ball, (36., 43.), (44.75, 36.75)) if curved_block else
                   (state.ball, (42., 31.), (65., 30.)), kind="curve",
                   moves=(("second", (69., 25.)),), next_node=None if curved_block else "adapt",
                   intent=Track("curve", (state.ball, (42., 31.), (65., 30.))))
    straight = action(state, "straight", "Play the straight route to CM", 2 if curved_block else 0,
                      "The straight lane is clear. Use the simple route." if curved_block else
                      "The straight route crosses the defender. Compare both routes before passing.",
                      ball=(65., 30.) if curved_block else (47.5, 42.5),
                      moves=(("second", (69., 25.)),), next_node="adapt" if curved_block else None,
                      intent=Track("linear", (state.ball, (65., 30.))))
    back = action(state, "back", "Pass back to BACK", 1,
                  "You keep possession, but a clear route reaches the forward teammate.", ball=(28., 68.))
    root = Node("root", "Choose the route shape", "midfielder",
                "CM offers a forward option; BACK offers a reset. Compare both ground-pass routes.", state, (curve, straight, back))
    end = after(state, straight if curved_block else curve, "cm")
    choices = (
        action(end, "touch", "Touch back toward M", 2,
               "A2 is goal-side. Your next touch moves away from pressure and toward M.",
               ball=(60., 34.), moves=(("cm", (60., 34.)),), contact=0),
        action(end, "shield", "Pause and scan for help", 1,
               "A2 is still nearby. A touch toward M would create more room."),
        action(end, "pressure", "Take a touch forward toward goal", 0,
               "Your next touch moves toward the arriving pressure.",
               ball=(69., 25.), moves=(("cm", (68., 26.)),), contact=0))
    adapt = Node("adapt", "CM's next touch", "receiving midfielder",
                 "CM has received; you now play CM. A2 closes from goal-side; M supports behind-left.", end, choices)
    return Episode(f"M02.{variant}", TITLES[1], (root, adapt))


def restart(variant: str) -> Episode:
    open_goal = variant == "B"
    state = snapshot((48., 20.), (
        ("john", "JOHN", "home", (48., 20.)), ("rw", "RW", "home", (64., 23.)),
        ("back", "BACK", "home", (40., 36.)),
        ("block", "A", "away", (58., 21.875) if open_goal else (46.5, 12.5)),
        ("keeper", "GK", "keeper", (57., 5.))))
    short = action(state, "short", "Pass along the ground to RW", 0 if open_goal else 2,
                   "A screens the pass to RW. The marked shooting window is open." if open_goal else
                   "The shooting lane is blocked. Your teammate has room to receive.",
                   ball=state.positions()["block"] if open_goal else (64., 23.),
                   moves=(("block", (56., 21.5)),) if not open_goal else (),
                   next_node=None if open_goal else "adapt",
                   intent=Track("linear", (state.ball, (64., 23.))))
    back = action(state, "back", "Restart backward and rebuild", 1,
                  "You keep possession, but another visible route offers a better attacking chance.",
                  ball=(40., 36.), next_node="adapt" if open_goal else None)
    shot = action(state, "shot", "Shoot low at the marked goal target", 2 if open_goal else 0,
                  "The marked target is within your practice range, away from A and the keeper." if open_goal else
                  "The blocker covers that route. Power cannot remove the obstacle.",
                  ball=(44., 0.) if open_goal else state.positions()["block"],
                  intent=Track("linear", (state.ball, (44., 0.))))
    root = Node("root", "Direct an attacking restart", "restart taker",
                "Practice restart within your range. Receivers eligible; routes stay on the ground. Compare the marked goal target and RW.",
                state, (short, back, shot), shot_window=(44., 0.))
    end = after(state, back if open_goal else short, "back" if open_goal else "john")
    if open_goal:
        choices = (
            action(end, "carry", "Carry into the open midfield space", 2,
                   "Your backward restart kept possession. The central carrying lane is now open.",
                   ball=(40., 28.), moves=(("back", (40., 28.)),), contact=0),
            action(end, "hold", "Hold possession and look", 1, "You keep the ball but leave the clear carrying lane unused."),
            action(end, "wide", "Pass from the new angle to RW", 2,
                   "The backward pass changed your angle. A no longer screens the route to RW.", ball=(64., 23.)))
    else:
        choices = (
            action(end, "angle", "Move into a clear return angle", 2,
                   "A screens the original return lane. Moving deeper opens a different passing angle.", moves=(("john", (52., 30.)),)),
            action(end, "stay", "Stay at the original restart position", 0, "A stands in the return lane. Being nearby does not make you available."),
            action(end, "crowd", "Offer a close layoff beside RW", 1,
                   "A short layoff is possible here, but moving deeper would give RW more space.", moves=(("john", (60., 27.)),)))
    adapt = Node("adapt", "Help after the restart", "midfielder",
                 "Now play BACK. The new angle opens RW; the central carrying lane is also clear." if open_goal else
                 "RW has the ball. You still play John; A screens the original return lane.", end, choices)
    return Episode(f"M03.{variant}", TITLES[2], (root, adapt))


def prediction(variant: str) -> Episode:
    holds = variant == "B"
    state = snapshot((40., 50.), (
        ("john", "JOHN", "home", (55., 55.)), ("m", "M", "home", (40., 50.)),
        ("forward", "F", "home", (60., 28.)), ("block", "A", "away", (52., 44.))))
    wide = action(state, "wide", "Show wide at a clear support angle", 2,
                  "Your wider position gives M a clear pass and helps the next attack.", ball=(66., 47.),
                  moves=(("john", (66., 47.)), ("block", (63., 37.5) if holds else (69., 44.))), next_node="adapt")
    back = action(state, "back", "Drop into a deeper support position", 1,
                  "You offer a safe outlet, but the wider angle also gains space.",
                  ball=(50., 62.), moves=(("john", (50., 62.)),))
    hide = action(state, "hide", "Move into the central pocket", 0,
                  "The defender stands between you and the ball. Move where the passer can see you.", moves=(("john", (58., 39.)),))
    root = Node("root", "Offer a visible option", "off-ball midfielder",
                "Create a forward support angle for M. Watch A react to the pass.", state, (wide, back, hide))
    end = after(state, wide)
    choices = (
        action(end, "forward", "Pass into the forward lane", 0 if holds else 2,
               "The defender held the central lane. The forward route is still blocked." if holds else
               "The defender follows you. The forward lane is now open.", ball=(63., 37.5) if holds else (60., 28.),
               intent=Track("linear", (end.ball, (60., 28.)))),
        action(end, "return", "Return the ball to the original passer", 2 if holds else 1,
               "The defender held centrally. Your original passer gives you a clear return route." if holds else
               "You keep possession but can use the newly open forward lane.", ball=(40., 50.)),
        action(end, "carry", "Carry up the right channel", 2 if holds else 0,
               "A stays central. The right channel gives you room to carry forward." if holds else
               "A has followed wide and closes this channel. The forward passing lane is open.",
               ball=(76., 37.) if holds else end.positions()["block"],
               moves=(("john", (76., 37.) if holds else (68., 45.)),), contact=0,
               intent=Track("linear", (end.ball, (76., 37.)))))
    reveal = "The defender held the central lane." if holds else "The defender followed the pass toward you."
    adapt = Node("adapt", "Update your decision", "midfielder", reveal + " Look again before your next action.", end, choices)
    return Episode(f"M04.{variant}", TITLES[3], (root, adapt), True, reveal)


def speed(variant: str) -> Episode:
    closed = variant == "B"
    state = snapshot((74., 56.), (
        ("john", "JOHN", "home", (74., 56.)), ("m", "M", "home", (54., 44.)),
        ("forward", "F", "home", (38., 28.)), ("back", "BACK", "home", (64., 68.)),
        ("block", "A", "away", (60., 56.)),
        ("second", "A2", "away", (74., 42.) if closed else (60., 26.))))
    surge = action(state, "surge", "Push a speed dribble down the wing", 0 if closed else 2,
                   "A2 already closes the wing runway. Pass early instead of sprinting into pressure." if closed else
                   "Open grass ahead lets you push a longer touch and accelerate down the wing.",
                   ball=(74., 42.) if closed else (74., 34.),
                   moves=(("john", (74., 45.)),) if closed else (("john", (74., 34.)), ("second", (74., 24.))),
                   next_node=None if closed else "adapt", contact=0,
                   intent=Track("linear", (state.ball, (74., 34.))))
    pass_m = action(state, "pass_m", "Pass early inside to M", 2 if closed else 1,
                    "A2 blocks the wing sprint. Passing early to M beats the press." if closed else
                    "M is open, but the clear wing runway lets you gain ground fast.",
                    ball=(54., 44.),
                    moves=(("john", (70., 32.)), ("second", (54., 32.))) if closed else (),
                    next_node="adapt" if closed else None)
    inside = action(state, "inside", "Cut flat across into the middle", 0,
                    "A covers the flat inside lane. Check where defenders stand before cutting in.",
                    ball=(60., 56.), moves=(("john", (63., 56.)),), contact=0,
                    intent=Track("linear", (state.ball, (46., 56.))))
    root = Node("root", "Read the wing runway", "winger",
                "A2 closes the wing runway; M is open inside." if closed else
                "The right wing runway is open ahead; F attacks the box.",
                state, (surge, pass_m, inside))
    if closed:
        end = after(state, pass_m, "m")
        role, cue = "midfielder", "Now play M. A2 closes ahead; John overlapped wide right."
        choices = (
            action(end, "overlap", "Pass wide to overlapping John", 2,
                   "John ran past A2 into open wing space after releasing the pass.", ball=(70., 32.)),
            action(end, "hold", "Hold the ball in midfield", 1,
                   "You keep possession, but John and F are open ahead."),
            action(end, "force", "Carry straight forward into A2", 0,
                   "A2 stepped into the central lane. Use the wide overlap instead.",
                   ball=(54., 32.), moves=(("m", (54., 35.)),), contact=0,
                   intent=Track("linear", (end.ball, (54., 22.)))))
    else:
        end = after(state, surge, "john")
        role, cue = "winger", "A2 slid over to stop your wing run. F is open inside."
        choices = (
            action(end, "feed", "Pass across to open F", 2,
                   "A2 stepped wide to stop your speed dribble, leaving F open inside.", ball=(38., 28.)),
            action(end, "hold", "Slow down and hold the ball", 1,
                   "You keep control, but F is open now before defenders recover."),
            action(end, "force", "Sprint straight into A2", 0,
                   "A2 now closes the wing runway. Slow down and release the ball.",
                   ball=(74., 24.), moves=(("john", (74., 27.)),), contact=0,
                   intent=Track("linear", (end.ball, (74., 16.)))))
    adapt = Node("adapt", "Adapt at the end of the run", role, cue, end, choices)
    return Episode(f"M05.{variant}", TITLES[4], (root, adapt))


def box_finish(variant: str) -> Episode:
    spot_blocked = variant == "B"
    state = snapshot((68., 18.), (
        ("john", "JOHN", "home", (50., 18.)), ("w", "W", "home", (68., 18.)),
        ("lw", "LW", "home", (42., 10.)),
        ("block", "A", "away", (56., 16.) if spot_blocked else (64., 14.)),
        ("keeper", "GK", "keeper", (56., 4.))))
    spot = action(state, "spot", "Check to the central penalty spot", 0 if spot_blocked else 2,
                  "A stands in that cutback lane. Check into the open near pocket instead." if spot_blocked else
                  "The central penalty spot is open. Checking there gives W a clear cutback.",
                  ball=None if spot_blocked else (44., 14.),
                  moves=(("john", (44., 14.)),) if spot_blocked else (("john", (44., 14.)), ("block", (54., 11.))),
                  next_node=None if spot_blocked else "adapt")
    pocket = action(state, "pocket", "Check into the near-right box pocket", 2 if spot_blocked else 0,
                    "A screens the middle, leaving the near pocket open for the pass." if spot_blocked else
                    "A stands between W and the near pocket. Find the open central spot.",
                    ball=(60., 10.) if spot_blocked else None,
                    moves=(("john", (60., 10.)), ("block", (52., 5.))) if spot_blocked else (("john", (60., 10.)),),
                    next_node="adapt" if spot_blocked else None)
    edge = action(state, "edge", "Drop back outside the penalty box", 1,
                  "You offer a safe reset, but an open scoring position is inside the box.",
                  ball=(50., 24.), moves=(("john", (50., 24.)),))
    root = Node("root", "Get into a scoring position", "forward",
                "W has the ball inside the box. Find an unscreened scoring position.",
                state, (spot, pocket, edge), shot_window=(44., 0.))
    end = after(state, pocket if spot_blocked else spot)
    if spot_blocked:
        choices = (
            action(end, "shoot", "Shoot low at the marked target", 0,
                   "A recovered onto the shooting line. Square the ball to open LW.",
                   ball=(52., 5.), intent=Track("linear", (end.ball, (44., 0.)))),
            action(end, "square", "Square across the box to LW", 2,
                   "A and the keeper cover your shot, leaving LW an open finish.", ball=(42., 10.)),
            action(end, "reset", "Pass back to W", 1,
                   "You keep possession, though LW is unmarked in front of goal.", ball=(68., 18.)))
    else:
        choices = (
            action(end, "shoot", "Shoot low into the marked target", 2,
                   "The near-left target is clear of A and the goalkeeper.",
                   ball=(44., 0.), intent=Track("linear", (end.ball, (44., 0.)))),
            action(end, "square", "Pass left to LW", 1,
                   "LW is open, though your own penalty-box target is already clear.", ball=(42., 10.)),
            action(end, "force", "Dribble right toward A", 0,
                   "A closes from the right. Finish into the open target instead.",
                   ball=(54., 11.), moves=(("john", (51., 12.)),), contact=0,
                   intent=Track("linear", (end.ball, (64., 8.)))))
    adapt = Node("adapt", "Finish inside the penalty box", "forward",
                 "A blocks the goal target; LW is unmarked across the box." if spot_blocked else
                 "You received at the penalty spot. The marked left target is open.",
                 end, choices, shot_window=(44., 0.))
    return Episode(f"M06.{variant}", TITLES[5], (root, adapt))


def press_break(variant: str) -> Episode:
    vertical_blocked = variant == "B"
    state = snapshot((36., 70.), (
        ("john", "JOHN", "home", (36., 70.)), ("lw", "LW", "home", (18., 56.)),
        ("cm", "CM", "home", (46., 52.)), ("back", "BACK", "home", (54., 74.)),
        ("block", "A", "away", (41., 61.) if vertical_blocked else (27., 63.)),
        ("second", "A2", "away", (28., 44.) if vertical_blocked else (46., 40.))))
    split = action(state, "split", "Pass forward through the line to CM", 0 if vertical_blocked else 2,
                   "A screens the central lane to CM. Use the open wide pass to LW." if vertical_blocked else
                   "A jumped toward the wing, leaving the line-breaking pass to CM open.",
                   ball=(41., 61.) if vertical_blocked else (46., 52.),
                   moves=() if vertical_blocked else (("second", (46., 44.)), ("john", (38., 62.))),
                   next_node=None if vertical_blocked else "adapt",
                   intent=Track("linear", (state.ball, (46., 52.))))
    wide = action(state, "wide", "Pass wide to LW", 2 if vertical_blocked else 0,
                  "A blocks the middle. LW has clear space on the left flank." if vertical_blocked else
                  "A covers the wide lane to LW. Scan the central lane first.",
                  ball=(18., 56.) if vertical_blocked else (27., 63.),
                  moves=(("second", (32., 54.)),) if vertical_blocked else (),
                  next_node="adapt" if vertical_blocked else None,
                  intent=Track("linear", (state.ball, (18., 56.))))
    switch = action(state, "switch", "Switch safely back to BACK", 1,
                    "BACK is a safe reset, though a clear forward pass breaks the press.",
                    ball=(54., 74.))
    root = Node("root", "Break the first press line", "defender",
                "A screens CM; LW is open wide." if vertical_blocked else
                "A covers LW; the central lane to CM is open.",
                state, (split, wide, switch))
    if vertical_blocked:
        end = after(state, wide, "lw")
        role, cue = "winger", "Now play LW. A2 screens CM; the left wing ahead is open."
        choices = (
            action(end, "drive", "Carry forward down the open left wing", 2,
                   "A2 shifted inside to screen CM, leaving the wing channel open.",
                   ball=(18., 40.), moves=(("lw", (18., 40.)),), contact=0),
            action(end, "return_pass", "Pass back to John", 1,
                   "You keep possession safely, though the left wing ahead is wide open.", ball=(36., 70.)),
            action(end, "inside", "Pass inside toward CM", 0,
                   "A2 slid across to screen the pass to CM. Take the open wing space.",
                   ball=(32., 54.), intent=Track("linear", (end.ball, (46., 52.)))))
    else:
        end = after(state, split, "cm")
        role, cue = "midfielder", "Now play CM. A2 closes ahead; LW is wide open and John supports behind."
        choices = (
            action(end, "combine", "Combine wide to open LW", 2,
                   "Breaking the first line changed the angle. LW is now wide open.", ball=(18., 56.)),
            action(end, "bounce", "Bounce the ball back to John", 2,
                   "John stepped up in support and has a clear return lane.", ball=(38., 62.)),
            action(end, "force", "Carry straight forward into A2", 0,
                   "A2 closes the central lane ahead. Move the ball to an open teammate.",
                   ball=(46., 44.), moves=(("cm", (46., 47.)),), contact=0,
                   intent=Track("linear", (end.ball, (46., 36.)))))
    adapt = Node("adapt", "Progress after breaking the press", role, cue, end, choices)
    return Episode(f"M07.{variant}", TITLES[6], (root, adapt))


def episodes() -> tuple[Episode, ...]:
    builders = (turn, delivery, restart, prediction, speed, box_finish, press_break)
    result = tuple(build(variant) for build in builders for variant in "AB")
    for episode in result:
        episode.validate()
    return result
