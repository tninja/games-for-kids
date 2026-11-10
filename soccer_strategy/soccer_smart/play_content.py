"""Original basic match sequences, distinct from the advanced Smarter missions."""

from dataclasses import replace
from math import hypot

from .model import Actor, Choice, Point, Scenario, bounded, lerp
from .play_model import Play, PlayNode
from .presentation import positions

FAMILIES = (
    "Keeper outlet", "Receive in midfield", "Escape back-field pressure", "Combine on the wing",
    "Support a throw-in", "Create a chance", "Defend a cross", "Regain and transition",
)
STARTS = ((38.,80.), (48.,57.), (51.,75.), (23.,47.), (18.,56.), (50.,34.), (46.,81.), (47.,62.))
SPACING = (((-16.,-12.),(25.,-34.),(0.,-12.)), ((-16.,7.),(15.,-9.),(-5.,-14.)),
           ((-17.,8.),(22.,-12.),(2.,-12.)), ((20.,-5.),(3.,-20.),(-5.,-12.)),
           ((-18.,6.),(20.,-4.),(7.,-12.)), ((-14.,-6.),(16.,4.),(-3.,-12.)))
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
               "shoot": "Your shot follows the selected route."}[kind]
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


def opening(family: int, variant: str) -> Scenario:
    if family >= 7:
        return defensive_opening(family, variant)
    x, y = STARTS[family-1]
    john = (x,y)
    left, right, forward = tuple((x+dx,y+dy) for dx,dy in SPACING[family-1])
    blocked = {"A": "right", "B": "carry", "C": "left"}[variant]
    block = lerp(john, {"carry": forward, "left": left, "right": right}[blocked], .65)
    people = (actor("john","home",john), actor("m","home",left), actor("n","home",right),
              actor("a","away",block), actor("a2","away",(x+12,y-21) if family == 4 else (x+5,y-22)),
              actor("gk","keeper",(50.,94.) if family == 1 else (50.,5.)))
    choices = tuple(opening_choice(key, john, point, people, blocked, family)
                    for key, point in (("carry",forward),("left",left),("right",right)))
    cue = {"A":"A tracks N. Your carrying route is free; M also supports.",
           "B":"A blocks your carrying route. M has a clear passing lane; N also supports.",
           "C":"A tracks M. N has a clear passing lane; A2 waits beyond your carrying route."}[variant]
    intro = {1:"Keeper's rollout received. ", 2:"Midfield pass received. ", 3:"You are deep in your half. ",
             4:"You have the ball on the wing. ", 5:"Throw-in received at your feet. ", 6:"You approach the box. "}[family]
    incoming = (50.,94.) if family == 1 else (0.,y+6) if family == 5 else john
    return picture(f"P{family:02d}.{variant}.root", family, variant, FAMILIES[family-1], intro+cue,
                   people, john, choices, incoming)


def opening_choice(key: str, john: Point, point: Point, people: tuple[Actor, ...],
                   blocked: str, family: int) -> Choice:
    bad = key == blocked
    rating = 0 if bad else 2
    ball = actor_point(people,"a") if bad else point
    carry = key == "carry"
    target = lerp(john, ball, .55) if bad and carry else point if carry else (john[0],john[1]-3)
    response = bounded((ball[0]+6,ball[1]+5)) if not carry else bounded((target[0],target[1]-7))
    if carry and family == 6:
        response = bounded((target[0]-7,target[1]-4))
    label = "Carry down the wing" if carry and family == 4 else "Carry into the grass" if carry else "Pass to M" if key == "left" else "Pass to N"
    reason = ("A already covers this route and reaches the ball. Recover instead of assuming possession continues." if bad else
              "Use the available grass, then check A2's response." if carry else
              f"{'M' if key == 'left' else 'N'} has an open passing lane. This is a good option too; support the receiver afterward.")
    return option(key,label,rating,target,ball,"dribble" if carry else "pass",reason,(("a2",response),),aim=point)


def defensive_opening(family: int, variant: str) -> Scenario:
    x, y = STARTS[family-1]
    john, passer, receiver = (x,y), (18.,y-8) if family == 7 else (x-6,y-10), (x+14,y+8)
    released = variant == "A"
    ball = lerp(passer, receiver, .55 if family == 7 else .15) if released else passer
    support_at = lerp(passer,john,.22) if variant == "C" else (x-12,y+4)
    people = (actor("john","home",john), actor("m","home",support_at), actor("n","home",(x+16,y-12)),
              actor("a","away",passer), actor("a2","away",receiver))
    targets = {"step":lerp(passer,receiver,.68 if family == 7 else .4),
               "delay":(x-2,y+4) if family == 7 else (passer[0],passer[1]+6), "recover":(x-7,y+3)}
    choices = defensive_choices(ball,receiver,targets,released)
    cue = {"A":"A's slow diagonal pass is already released and crosses beside you.",
           "B":"A keeps the ball and feints. Stay goal-side; no pass has been released.",
           "C":"M is close enough to pressure A. Protect the central route behind M."}[variant]
    return picture(f"P{family:02d}.{variant}.root",family,variant,FAMILIES[family-1],cue,people,ball,choices,
                   passer if released else ball)


def defensive_choices(ball: Point, receiver: Point, targets: dict[str,Point], released: bool) -> tuple[Choice, ...]:
    end = receiver if released else ball
    step = option("step","Meet the released pass" if released else "Step into a guessed passing lane",
                  2 if released else 0,targets["step"],targets["step"] if released else ball,
                  "intercept" if released else "move",
                  "The released ball crosses within one step. Meet the actual lane." if released else
                  "A still has the ball. Committing to a guessed pass can expose the central route.")
    delay = option("delay","Stay goal-side of A",1 if released else 2,targets["delay"],end,"move",
                   "You retain goal-side cover, although the nearby released pass could be intercepted." if released else
                   "A keeps possession. Goal-side cover is a good choice while you watch for a real release.")
    cover = option("recover","Cover behind M",1 if released else 2,targets["recover"],end,"move",
                   "You stay connected with M, but leave the reachable pass available to the receiver." if released else
                   "Covering behind M protects central space. This is also a good defensive option; possession remains with A.")
    return step,delay,cover


def support(people: tuple[Actor, ...], ball: Point, holder: Actor) -> tuple[str, tuple[Choice, ...]]:
    john = actor_point(people,"john")
    options = (bounded((john[0]-8,john[1]-9)), bounded((john[0]+8,john[1]-9)))
    target = max(options, key=lambda p: clearance(ball,p,people))
    rival = actor_point(people,"a2")
    gap = max(.1,hypot(rival[0]-ball[0],rival[1]-ball[1]))
    shadow = (rival[0]+5*(rival[0]-ball[0])/gap,rival[1]+5*(rival[1]-ball[1])/gap)
    usable = clearance(ball,john,people) >= 4
    return f"{holder.label} has the ball. Stay visible for a return pass; check A2's cover shadow.", (
        option("angle","Offer a clear return angle",2,target,target,"receive",
               "Your angled run gives the teammate a clear return pass. You receive and must look again."),
        option("hold","Stay available where you are",2 if usable else 1,john,ball,"move",
               "Your current position already offers a clear return lane. Staying available is a good choice too." if usable else
               "You preserve your spacing, but a defender screens this return lane. Move to offer a clearer angle."),
        option("screened","Hide behind A2's cover shadow",0,shadow,ball,"move",
               "A2 is between the carrier and you, screening the return lane. Your teammate keeps the ball; make yourself visible."))


def pressure(scene: Scenario, people: tuple[Actor, ...], ball: Point) -> tuple[str, tuple[Choice, ...]]:
    mates = [a for a in people if a.key in ("m","n")]
    mate = max(mates, key=lambda a: clearance(ball,a.position,people))
    rival = min((a for a in people if a.team == "away"), key=lambda a: hypot(a.position[0]-ball[0],a.position[1]-ball[1]))
    good = option("outlet",f"Pass to {mate.label}",2,ball,mate.position,"pass",
                  "The open teammate offers a clear route. Release before the nearby pressure grows.")
    cue = "You have received. Find the open outlet before carrying into nearby pressure."
    corner = max(((44.,0.),(56.,0.)),key=lambda p:clearance(ball,p,people,keepers=True))
    if scene.topic == 6 and ball[1] < 27 and clearance(ball,corner,people,keepers=True) >= 3.5:
        cue = "You have received near the box. Read the keeper and remaining defenders before choosing a finish."
        good = option("finish","Aim inside the open goal corner",2,ball,corner,"shoot",
                      "You have a clear shooting lane outside the keeper's central coverage. Place the shot inside the goal.")
    time_to_scan = hypot(rival.position[0]-ball[0],rival.position[1]-ball[1]) > 6
    return cue, (
        good, option("pause","Protect the ball and look",2 if time_to_scan else 1,ball,ball,"move",
                     "No opponent is close enough for immediate pressure. Keeping control and scanning is a good choice too." if time_to_scan else
                     "You protect possession, but the marker is close. Use the available outlet before pressure grows."),
        option("force","Push the ball straight into the marker",0,lerp(ball,rival.position,.7),rival.position,"dribble",
               "This straight touch enters the marker's reach. A feint or a different exit would be a separate option.",aim=rival.position))


def recovery(people: tuple[Actor, ...], ball: Point, holder: Actor) -> tuple[str, tuple[Choice, ...]]:
    john = actor_point(people,"john")
    runner = [a for a in people if a.team == "away" and a.key != holder.key][0]
    y = min(97.,max(ball[1]+6,john[1]))
    desired = (ball[0]+(50-ball[0])*(y-ball[1])/max(1.,100-ball[1]),y)
    distance = hypot(desired[0]-john[0],desired[1]-john[1])
    target = lerp(john,desired,min(1.,8/max(.1,distance)))
    mate = actor_point(people,"m")
    mate_gap = hypot(mate[0]-ball[0],mate[1]-ball[1])
    moves = ((runner.key,bounded((runner.position[0]+4,runner.position[1]))),
             ("m",lerp(mate,ball,max(0.,min(4.,mate_gap-3.5))/max(.1,mate_gap))))
    return f"{holder.label} still controls the ball. Recover central cover; do not assume a pass or a regain.", (
        option("recover","Recover toward goal-side cover",2,target,ball,"move",
               "Your recovery protects space while M closes the carrier. The opponent still has the ball; watch for the next action.",moves),
        option("hold","Hold your current defensive shape",2 if distance <= 4 else 1,john,ball,"move",
               "You already provide central cover. Holding shape while watching the carrier is a good choice too." if distance <= 4 else
               "You stay connected with play, but central cover is still open. Recover toward your goal."),
        option("chase","Run beyond the ball carrier",0,bounded((ball[0],ball[1]-8)),ball,"move",
               "The opponent still controls the ball. Running beyond the carrier leaves the route toward your goal uncovered."))


def continuation(source: Scenario, chosen: Choice, key: str) -> Scenario:
    people, ball = after(source,chosen)
    holder = owner(people,ball)
    if holder is None:
        raise ValueError("Continuation needs a known ball holder")
    if holder.key == "john":
        cue, choices = pressure(source,people,ball)
    elif holder.team == "home":
        cue, choices = support(people,ball,holder)
    else:
        cue, choices = recovery(people,ball,holder)
    return picture(key,source.topic,source.variant,"Look again" if key.endswith("next") else "Finish this play",cue,people,ball,choices)


def episode(family: int, variant: str) -> Play:
    root = opening(family,variant)
    nodes: list[PlayNode] = []
    root_exits = tuple((c.key,root.id+"."+c.key+".next") for c in root.choices)
    nodes.append(PlayNode(root,root_exits))
    for choice in root.choices:
        second = continuation(root,choice,dict(root_exits)[choice.key])
        good = max(second.choices,key=lambda c:c.rating)
        terminal = good.action_kind == "shoot"
        third_id = None if terminal else second.id+".last"
        nodes.append(PlayNode(second,tuple((c.key,third_id if c.key == good.key else None) for c in second.choices)))
        if third_id is not None:
            third = continuation(second,good,third_id)
            nodes.append(PlayNode(third,tuple((c.key,None) for c in third.choices)))
    return Play(f"P{family:02d}.{variant}",family,FAMILIES[family-1],tuple(nodes))


def build_plays() -> tuple[Play, ...]:
    plays = tuple(episode(family,v) for family in range(1,9) for v in "ABC")
    for play in plays:
        play.validate()
    return plays
