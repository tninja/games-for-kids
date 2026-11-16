"""Task-specific match decisions; generic recovery is reserved for lost possession."""

from dataclasses import replace
from math import hypot

from .model import Actor, Choice, Point, Scenario, bounded, lerp
from .play_geometry import actor, actor_point, clearance, option, owner, picture

People = tuple[Actor, ...]
Decision = tuple[str, str, tuple[Choice, ...]]


def team(john: Point, m: Point, n: Point, a: Point, a2: Point, own_keeper: bool = False) -> People:
    return (actor("john","home",john),actor("m","home",m),actor("n","home",n),
            actor("a","away",a),actor("a2","away",a2),
            actor("gk","home" if own_keeper else "keeper",(50.,94.) if own_keeper else (50.,5.)))


def delivery(people: People, ball: Point, key: str, label: str, target: Point,
             kind: str = "pass", loft: float = 0) -> Choice:
    rivals = [a for a in people if a.team == "away"]
    rival = min(rivals,key=lambda a:clearance(ball,target,(a,)))
    gap = min(hypot(a.position[0]-target[0],a.position[1]-target[1]) for a in rivals) if loft else clearance(ball,target,people)
    safe = gap >= 3.5
    john = actor_point(people,"john")
    end = target if safe else rival.position
    run = target if kind in ("dribble","receive") else john
    if not safe and kind == "dribble":
        run = lerp(john,rival.position,.6)
    # A screened off-ball run does not force the teammate to attempt a bad pass.
    if not safe and kind == "receive":
        end, kind = ball,"move"
    choice = option(key,label,2 if safe else 0,run,end,kind,
                    label+": the route and landing space are available. Read the next response." if safe else
                    label+": a defender covers the lane or receiving space. Use another option.",aim=target)
    return replace(choice,loft=loft)


def hold(people: People, ball: Point, key: str, label: str, rating: int = 2) -> Choice:
    return option(key,label,rating,actor_point(people,"john"),ball,"shield",
                  "You protect possession while checking the next opening. A safe release is also available.")


def root(family: int, variant: str, title: str, people: People, ball: Point,
         cue: str, choices: tuple[Choice, ...], incoming: Point | None = None) -> Scenario:
    return picture(f"P{family:02d}.{variant}.root",family,variant,title,cue,people,ball,choices,incoming)


def keeper_root(family: int, variant: str, title: str) -> Scenario:
    people = team((38.,80.),(22.,68.),(63.,46.),(30.,73.),(44.,74.),True)
    john = actor_point(people,"john")
    if variant == "B":
        ball = actor_point(people,"gk")
        choices = (delivery(people,ball,"show","Show diagonally for the keeper",(30.,78.),"receive"),
                   delivery(people,ball,"drop","Offer a deeper return angle",(40.,86.),"receive"),
                   option("hide","Stand behind the pressing player",0,(30.,68.),ball,"move",
                          "The marker screens that outlet. Stay visible to the keeper."))
        return root(family,variant,title,people,ball,"The keeper has held the ball. Make a useful receiving angle before asking for the pass.",choices)
    choices = (delivery(people,john,"recycle","Recycle to the keeper",actor_point(people,"gk")),
               delivery(people,john,"switch","Lift the ball toward N",actor_point(people,"n"),"clear",45),
               delivery(people,john,"rush","Push straight into the press",actor_point(people,"a"),"dribble"))
    return root(family,variant,title,people,john,"Two opponents narrow your short outlets. Compare recycling with the distant landing space.",choices,(50.,94.))


def midfield_root(family: int, variant: str, title: str) -> Scenario:
    front = (48.,46.) if variant == "B" else (60.,46.)
    people = team((48.,56.),(32.,65.),(67.,44.),front,(52.,64.) if variant != "C" else (57.,53.))
    ball = actor_point(people,"john")
    exit_at = (43.,43.) if variant != "B" else front
    choices = (delivery(people,ball,"turn","Turn with the first touch",exit_at,"dribble"),
               delivery(people,ball,"layoff","Lay off to supporting M",actor_point(people,"m")),
               replace(hold(people,ball,"shield","Shield while M changes angle"),actor_targets=(("m",(32.,58.)),)))
    cue = {"A":"Pressure approaches from behind. Read the turning exit and M's supporting position.",
           "B":"A blocks the turn. M supports behind you; shield or lay off before forcing a forward touch.",
           "C":"The side marker closes your right shoulder. Compare the left turning exit with support behind."}[variant]
    return root(family,variant,title,people,ball,cue,choices,(40.,64.))


def pressure_root(family: int, variant: str, title: str) -> Scenario:
    second = (50.,88.) if variant == "B" else (40.,74.)
    people = team((50.,78.),(30.,84.),(75.,48.),(50.,68.),second,True)
    ball = actor_point(people,"john")
    outlet = actor_point(people,"m" if variant == "C" else "gk")
    choices = (delivery(people,ball,"recycle","Use the supporting outlet",outlet),
               delivery(people,ball,"clear","Lift clear toward N's landing space",actor_point(people,"n"),"clear",48),
               delivery(people,ball,"rush","Touch through the nearest presser",actor_point(people,"a"),"dribble"))
    cue = {"A":"A presses from ahead. Your keeper is free behind; N offers a distant landing space.",
           "B":"The keeper's return lane is screened. Read the forward landing space instead of forcing the back pass.",
           "C":"M has checked back on the left. Compare the short release with the lifted forward delivery."}[variant]
    return root(family,variant,title,people,ball,cue,choices)


def wing_root(family: int, variant: str, title: str) -> Scenario:
    people = team((20.,45.),(40.,34.),(10.,50.),(31.,38.) if variant != "B" else (30.,48.),
                  (12.,30.) if variant == "B" else (32.,22.))
    ball = actor_point(people,"n" if variant == "C" else "john")
    if variant == "C":
        people = tuple(replace(a,position=(12.,28.),approach=(12.,28.),run_to=(12.,28.)) if a.key=="n" else a for a in people)
        ball = actor_point(people,"n")
        heading,cue,choices = wing_runs(people,ball)
        return root(family,variant,heading,people,ball,cue,choices)
    overlap = delivery(people,ball,"overlap","Release N's overlap",(12.,28.))
    if overlap.rating == 2:
        overlap = replace(overlap,actor_targets=(("n",(12.,28.)),))
    choices = (overlap,delivery(people,ball,"inside","Combine inside with M",actor_point(people,"m")),
               delivery(people,ball,"widecarry","Carry down the outside",(16.,31.),"dribble"))
    cue = "A closes the inside combination. Compare N's overlap with carrying outside." if variant == "A" else "A2 covers the overlap's landing space. M offers an inside combination."
    return root(family,variant,title,people,ball,cue,choices)


def throw_choices(people: People, ball: Point) -> tuple[Choice, ...]:
    return (delivery(people,ball,"throw_m","Throw short to M",actor_point(people,"m"),loft=32),
            delivery(people,ball,"throw_n","Throw down the line to N",actor_point(people,"n"),loft=36),
            replace(option("wait","Wait for a changing receiving angle",1,actor_point(people,"john"),ball,"move",
                           "A brief scan gives teammates time to offer new angles. An available legal throw can also be taken."),
                    actor_targets=(("m",(22.,62.)),("n",(10.,40.)))))


def throw_root(family: int, variant: str, title: str) -> Scenario:
    marked = (12.,43.) if variant == "A" else (15.,64.) if variant == "B" else (10.,48.)
    people = team((0.,58.),(17.,65.),(14.,42.),marked,(28.,53.))
    if variant == "C":
        people = tuple(replace(a,position=(25.,55.),approach=(25.,55.),run_to=(25.,55.)) if a.key=="m" else a for a in people)
    ball = actor_point(people,"john")
    cue = {"A":"A tracks N's landing space. Compare the supporting short throw with the marked forward delivery.",
           "B":"A tracks M's landing space. N offers a forward target down the touchline.",
           "C":"M has moved inside to a new angle. Compare that short delivery with N's run up the line."}[variant]
    return root(family,variant,title,people,ball,cue+" Legal overhead delivery assumed.",throw_choices(people,ball))


def chance_root(family: int, variant: str, title: str) -> Scenario:
    front = {"A":(40.,28.),"B":(48.,25.),"C":(60.,30.)}[variant]
    people = team((50.,31.),(35.,22.),(66.,35.),front,
                  (56.,18.) if variant == "C" else (59.,20.))
    ball,return_at = actor_point(people,"john"),(56.,18.)
    first = delivery(people,ball,"combine","Play a one-two through M",actor_point(people,"m"))
    safe = first.rating == 2 and clearance(actor_point(people,"m"),return_at,people) >= 3.5
    combination = replace(first,target=return_at if safe else lerp(ball,return_at,.6),ball_end=return_at if safe else actor_point(people,"a2"),
                          ball_via=actor_point(people,"m"),rating=2 if safe else 0,
                          explanation="The two passing lanes and return space are clear. Move to meet M's return." if safe else
                          "The defender covers a leg of the combination. Do not assume every one-two will get through.")
    choices = (delivery(people,ball,"set","Set the ball into a shooting angle",(48.,23.),"dribble"),combination,
               delivery(people,ball,"square","Square to N's supporting position",actor_point(people,"n")))
    cue = {"A":"A is near M's first passing lane. Compare the setting touch with the square outlet.",
           "B":"A closes your setting touch. M can combine around that pressure; N offers a square outlet.",
           "C":"A2 occupies the one-two return space. Read the setting touch and N's supporting position."}[variant]
    return root(family,variant,title,people,ball,cue,choices)


def transition_root(family: int, variant: str, title: str) -> Scenario:
    people = team((47.,62.),(32.,70.) if variant != "C" else (32.,60.),(68.,43.),
                  (41.,52.) if variant == "A" else (47.,56.),(61.,70.) if variant == "A" else (55.,65.))
    if variant == "A":
        ball = (44.,54.7)
        choices = (option("intercept","Meet the already-released pass",2,(49.,59.2),(49.,59.2),"intercept",
                          "The actual pass crosses nearby. Meet it, then decide whether the counter is available."),
                   option("drop","Drop to protect the central route",1,(47.,70.),(61.,70.),"move",
                          "You retain cover but allow the released pass to reach its receiver."),
                   option("screen","Stay connected with M",1,(39.,67.),(61.,70.),"move",
                          "You keep a connection with M, although the reachable pass could be intercepted."))
        return root(family,variant,title,people,ball,"A's pass is already travelling beside you. Read the regain, then the space for a counter.",choices,(41.,52.))
    ball = actor_point(people,"m" if variant == "C" else "john")
    if variant == "C":
        heading,cue,choices = counter_runs(people,ball)
        return root(family,variant,heading,people,ball,cue,choices,(41.,52.))
    choices = (delivery(people,ball,"counter","Release N before the defense recovers",actor_point(people,"n")),
               delivery(people,ball,"settle","Settle possession through M",actor_point(people,"m")),
               delivery(people,ball,"burst","Carry through the closing opponent",actor_point(people,"a"),"dribble"))
    return root(family,variant,title,people,ball,"You have secured the regain. A closes ahead; compare the early forward pass with retaining possession.",choices)


def keeper_follow(people: People, ball: Point, holder: Actor) -> Decision:
    if holder.key == "gk":
        return ("Reposition for the keeper","The keeper has the ball. Reposition for the next outlet rather than following your original pass.",
                (delivery(people,ball,"show","Show a different receiving angle",(36.,84.),"receive"),
                 delivery(people,ball,"drop","Offer a closer keeper outlet",(42.,88.),"receive"),
                 option("hide","Stay in A's cover shadow",0,actor_point(people,"a"),ball,"move",
                        "The opponent screens this receiving position. Offer a visible angle to the keeper.")))
    if holder.key in ("m","n"):
        john = actor_point(people,"john")
        return ("Support after the switch","The outlet has received. Offer width for the next pass or remain available behind the ball.",
                (delivery(people,ball,"wide_support","Show a wide return angle",bounded((john[0]-10,john[1]-8)),"receive"),
                 delivery(people,ball,"back_support","Offer a supporting return",bounded((john[0]+6,john[1]+5)),"receive"),
                 option("holdoutlet","Stay available behind the ball",1,john,ball,"move",
                        "You preserve a supporting position while the outlet keeps possession.")))
    far = max((a for a in people if a.key in ("m","n")),key=lambda a:(a.position[0]-50)*(50-ball[0]))
    return ("Recycle or switch",f"You control the ball. The keeper remains available behind; {far.label} offers a change of side.",
            (delivery(people,ball,"recycle","Return through the keeper",actor_point(people,"gk")),
             delivery(people,ball,"switch",f"Switch toward {far.label}",far.position,"clear",42),
             hold(people,ball,"scan","Keep control and scan")))


def midfield_follow(people: People, ball: Point, holder: Actor) -> Decision:
    if holder.key != "john":
        return ("Move after your pass",f"{holder.label} has received your pass. Choose a new receiving angle or leave space for the other teammate.",
                (delivery(people,ball,"bounce","Meet M's return outside pressure",(40.,52.),"receive"),
                 option("decoy","Move away to leave N space",2,(24.,54.),ball,"move",
                        "Your movement leaves the inside route available. M keeps the ball while the shape changes."),
                 option("crowd","Follow the pass into M's feet",0,actor_point(people,"m"),ball,"move",
                        "That run occupies the carrier's space instead of creating a return angle.")))
    return ("Read the second defender","You control the ball from a new angle. Compare the diagonal lane with the supporting layoff.",
            (delivery(people,ball,"diagonal","Find N on the diagonal",actor_point(people,"n")),
             delivery(people,ball,"layoff","Bounce the ball back to M",actor_point(people,"m")),
             hold(people,ball,"shield","Keep protecting the ball")))


def wing_runs(people: People, ball: Point) -> Decision:
    forward = delivery(people,ball,"nearpost","Arrive for the forward delivery",(38.,max(12.,ball[1]-8)),"receive")
    back = delivery(people,ball,"cutback","Offer space behind the ball",(24.,min(90.,ball[1]+10)),"receive")
    blocked = forward.rating == 0 and back.rating == 0
    return ("Choose the next receiving zone","Your teammate has the ball. Compare a forward receiving run with supporting space behind the ball.",
            (forward,back,
             option("holdwide","Keep width while support adjusts",2 if blocked else 1,actor_point(people,"john"),ball,"move",
                    "Both immediate delivery lanes are covered. Keep width while your teammate retains the ball." if blocked else
                    "You remain available, although moving into a delivery zone gives the wide player another option.")))


def wing_follow(people: People, ball: Point, holder: Actor) -> Decision:
    if holder.key != "john":
        return wing_runs(people,ball)
    m = actor_point(people,"m")
    forward = (m[0],max(6.,min(m[1],ball[1]-8)))
    cross = replace(delivery(people,ball,"cross","Deliver the low cross to M",forward),actor_targets=(("m",forward),))
    n = actor_point(people,"n")
    label = "Cut back to N's support" if n[1] > ball[1] else "Return the ball out wide to N"
    return ("Choose the next delivery","You control the ball. Read M's forward run and N's support before choosing the next delivery.",
            (cross,
             delivery(people,ball,"cutback",label,n),
             hold(people,ball,"waitwide","Keep the ball while support arrives")))


def throw_follow(people: People, ball: Point, holder: Actor) -> Decision:
    if holder.key == "john" and actor_point(people,"john")[0] == 0:
        return "Now choose the throw","Your teammates have changed their receiving angles. Read the landing spaces again.",throw_choices(people,ball)
    if holder.key == "john":
        return ("Build from the restart","You have received the return inside the pitch. Find the next teammate or protect possession.",
                (delivery(people,ball,"restart_m","Combine again with M",actor_point(people,"m")),
                 delivery(people,ball,"restart_n","Progress the restart through N",actor_point(people,"n")),
                 hold(people,ball,"restart_hold","Keep control while teammates adjust")))
    return ("Rejoin after the throw","The throw has reached a teammate. Re-enter the pitch and offer a return angle or move up the line.",
            (delivery(people,ball,"return","Step inside for the return",(8.,54.),"receive"),
             delivery(people,ball,"line_run","Run further up the touchline",(5.,38.),"receive"),
             option("watch","Remain outside watching the throw",1,actor_point(people,"john"),ball,"move",
                    "The delivery is complete. Staying outside keeps you out of the next combination.")))


def counter_runs(people: People, ball: Point, carrier: str = "M") -> Decision:
    return ("Support the counterattack",carrier+" has secured possession. Offer an early forward run or a supporting third-player angle.",
            (delivery(people,ball,"counter_run","Run into the early forward lane",(56.,43.),"receive"),
             delivery(people,ball,"third_man","Offer a supporting third-player angle",(40.,66.),"receive"),
             option("holdcounter","Stay available for a slower build",1,actor_point(people,"john"),ball,"move",
                    "You keep an outlet, although the early counter window may close while you wait.")))


def counter_follow(people: People, ball: Point, holder: Actor) -> Decision:
    if holder.key != "john":
        return counter_runs(people,ball,holder.label)
    return ("Counter or keep possession","The ball is secured. Read the forward lane before the defense recovers; settling is also a valid option.",
            (delivery(people,ball,"counter","Play N into the counterattack",actor_point(people,"n")),
             delivery(people,ball,"settle","Keep possession through M",actor_point(people,"m")),
             hold(people,ball,"secure","Protect the regain and scan")))


def cross_follow(people: People, ball: Point, holder: Actor) -> Decision:
    if holder.key == "john":
        return ("Clear danger or keep it","You have met the cross. Compare the safe clearance with M's short outlet.",
                (delivery(people,ball,"clear","Lift clear toward N",actor_point(people,"n"),"clear",46),
                 delivery(people,ball,"short","Keep possession through M",actor_point(people,"m")),
                 hold(people,ball,"protect","Protect the ball before releasing")))
    if holder.team == "home":
        return ("Support after meeting the cross",holder.label+" has secured the outlet. Offer a receiving angle to help the team leave its own box.",
                (delivery(people,ball,"leave_box","Show outside the box",(40.,70.),"receive"),
                 delivery(people,ball,"support_clear","Offer the other exit",(50.,72.),"receive"),
                 option("keep_cover","Keep defensive cover for now",1,actor_point(people,"john"),ball,"move",
                        "You retain cover while the teammate controls the outlet. Moving can offer a clearer next pass.")))
    runner = actor_point(people,"a2")
    return ("Runner or cutback zone","A still has the ball wide. Track the receiver without leaving the central cutback route open.",
            (option("track","Stay goal-side of the receiver",2,bounded((runner[0],runner[1]+5)),ball,"move",
                    "You protect the receiver's route toward goal. This is cover, not an automatic interception."),
             option("cutback","Protect the central cutback zone",2,(45.,82.),ball,"move",
                    "Your central position protects the cutback while M can pressure the wide carrier."),
             option("doublepress","Join M beside the wide carrier",0,actor_point(people,"a"),ball,"move",
                    "Both defenders would chase the same wide player, leaving the central receiver uncovered.")))


def bespoke_opening(family: int, variant: str, title: str) -> Scenario | None:
    builders = {1:keeper_root,2:midfield_root,3:pressure_root,4:wing_root,5:throw_root,6:chance_root,8:transition_root}
    if family == 7 or family == 1 and variant == "A":
        return None
    return builders[family](family,variant,title)


def bespoke_followup(source: Scenario, people: People, ball: Point, key: str) -> Scenario | None:
    holder = owner(people,ball)
    if holder is None:
        return None
    if holder.team == "away" and not (source.topic == 7 and holder.key == "a"):
        return None
    builders = {1:keeper_follow,2:midfield_follow,3:keeper_follow,4:wing_follow,5:throw_follow,7:cross_follow,8:counter_follow}
    if source.topic == 6:
        if holder.key == "john":
            return None
        _,_,choices = wing_runs(people,ball)
        title = "Time the return for a finish"
        cue = "Your teammate has the square pass. Choose a forward receiving lane or arrive behind the ball for a cutback."
    else:
        title,cue,choices = builders[source.topic](people,ball,holder)
    return picture(key,source.topic,source.variant,title,cue,people,ball,choices)
