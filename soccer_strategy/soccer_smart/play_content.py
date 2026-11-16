"""Original basic match sequences, distinct from the advanced Smarter missions."""

from math import hypot

from .model import Actor, Choice, Point, Scenario, bounded, lerp
from .play_model import Play, PlayNode
from .play_geometry import actor, actor_point, after, clearance, option, owner, picture
from .play_patterns import bespoke_followup, bespoke_opening

FAMILIES = (
    "Keeper outlet", "Receive in midfield", "Escape back-field pressure", "Combine on the wing",
    "Support a throw-in", "Create a chance", "Defend a cross", "Regain and transition",
)


def opening(family: int, variant: str) -> Scenario:
    authored = bespoke_opening(family,variant,FAMILIES[family-1])
    if authored is not None:
        return authored
    if family >= 7:
        return defensive_opening(family, variant)
    john,left,right,forward = (38.,80.),(22.,68.),(63.,46.),(38.,68.)
    blocked = "right"
    block = lerp(john, {"carry": forward, "left": left, "right": right}[blocked], .65)
    people = (actor("john","home",john), actor("m","home",left), actor("n","home",right),
              actor("a","away",block), actor("a2","away",(43.,58.)),actor("gk","home",(50.,94.)))
    choices = tuple(opening_choice(key, john, point, people, blocked, family)
                    for key, point in (("carry",forward),("left",left),("right",right)))
    return picture(f"P{family:02d}.{variant}.root",family,variant,FAMILIES[family-1],
                   "Keeper's rollout received. A tracks N. Your carrying route is free; M also supports.",people,john,choices,(50.,94.))


def opening_choice(key: str, john: Point, point: Point, people: tuple[Actor, ...],
                   blocked: str, family: int) -> Choice:
    bad = key == blocked
    rating = 0 if bad else 2
    ball = actor_point(people,"a") if bad else point
    carry = key == "carry"
    target = lerp(john, ball, .55) if bad and carry else point if carry else (john[0],john[1]-3)
    response = bounded((ball[0]+6,ball[1]+5)) if not carry else bounded((target[0],target[1]-7))
    label = "Carry into the grass" if carry else "Pass to M" if key == "left" else "Pass to N"
    reason = ("A already covers this route and reaches the ball. Recover instead of assuming possession continues." if bad else
              "Use the available grass, then check A2's response." if carry else
              f"{'M' if key == 'left' else 'N'} has an open passing lane. This is a good option too; support the receiver afterward.")
    return option(key,label,rating,target,ball,"dribble" if carry else "pass",reason,(("a2",response),),aim=point)


def defensive_opening(family: int, variant: str) -> Scenario:
    x,y = 46.,81.
    john,passer,receiver = (x,y),(18.,73.),(60.,89.)
    released = variant == "A"
    ball = lerp(passer,receiver,.55) if released else passer
    support_at = lerp(passer,john,.22) if variant == "C" else (x-12,y+4)
    people = (actor("john","home",john), actor("m","home",support_at), actor("n","home",(x+16,y-12)),
              actor("a","away",passer), actor("a2","away",receiver))
    targets = {"step":lerp(passer,receiver,.68),"delay":(x-2,y+4),"recover":(x-7,y+3)}
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
    authored = bespoke_followup(source,people,ball,key)
    if authored is not None:
        return authored
    holder = owner(people,ball)
    if holder is None:
        raise ValueError("Continuation needs a known ball holder")
    if holder.key == "john":
        cue, choices = pressure(source,people,ball)
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
        exits: list[tuple[str,str | None]] = []
        following: list[PlayNode] = []
        for action in second.choices:
            changed = action.ball_end != second.ball or action.target != second.john.position or bool(action.actor_targets)
            third_id = second.id+".last."+action.key if action.rating == 2 and action.action_kind != "shoot" and changed else None
            exits.append((action.key,third_id))
            if third_id is not None:
                third = continuation(second,action,third_id)
                following.append(PlayNode(third,tuple((c.key,None) for c in third.choices)))
        nodes.append(PlayNode(second,tuple(exits)))
        nodes.extend(following)
    return Play(f"P{family:02d}.{variant}",family,FAMILIES[family-1],tuple(nodes))


def build_plays() -> tuple[Play, ...]:
    plays = tuple(episode(family,v) for family in range(1,9) for v in "ABC")
    for play in plays:
        play.validate()
    return plays
