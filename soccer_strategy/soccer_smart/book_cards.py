"""Original unscored activities; physical technique and biographies are not graded."""

from .model import Actor, Point, PracticeCard


def card(page: int, title: str, groups: tuple[str, ...], summary: str, adult: str,
         start: Point = (38., 60.), end: Point = (58., 46.),
         control: Point | None = None, via: tuple[Point, ...] = (),
         loft: float = 0, demo: str = "ground", john_at: Point | None = None,
         partner: bool = True) -> PracticeCard:
    position = start if john_at is None else john_at
    john = Actor("john", "JOHN", "home", position, position, position)
    people = (john, Actor("m", "M", "home", end, end, end)) if partner else (john,)
    return PracticeCard(f"bk{page:03d}", title, groups, summary, adult,
                        people, start, end, ball_control=control,
                        waypoints=via, loft=loft, demo=demo)


def technique_cards() -> tuple[PracticeCard, ...]:
    return (
        card(24, "Thigh and chest control", ("G01",),
             "Schematic: a high arrival settles near the feet. This screen does not assess body contact.",
             "Ask a coach to demonstrate a gentle thigh or chest cushion. Notice where the next touch can go; do not score contact technique.",
             (44., 38.), (44., 58.), loft=54, demo="drop", john_at=(44., 58.), partner=False),
        card(26, "A short delivery", ("G02",),
             "Compare a nearby receiver with a long kick. Use enough weight to reach the ready partner.",
             "Stand a few comfortable steps apart. Signal readiness before passing and discuss the receiver's next touch.", (38., 60.), (48., 56.)),
        card(29, "A medium delivery", ("G02",),
             "A farther receiver needs a clear lane and suitable weight. Distance alone does not make a pass better.",
             "With a coach, vary a comfortable passing distance. Ask whether the ball reaches the partner without forcing a difficult first touch.",
             (30., 64.), (58., 46.)),
        card(34, "A longer delivery", ("G02",),
             "The lifted route illustrates travel to distant space. Check the receiver and landing area before choosing it.",
             "Ask a coach to choose an appropriate distance and demonstrate delivery. Compare the landing space with the safer short outlet.",
             (24., 70.), (72., 30.), loft=54, demo="arc"),
        card(36, "An inside bend", ("G03",),
             "A curved ground route reaches the partner from one side. It is a path diagram, not a foot-placement lesson.",
             "Set route gates with a coach and discuss when a curve helps. Learn physical inside-foot contact from the demonstration, not a mouse click.",
             (30., 60.), (70., 40.), control=(42., 32.)),
        card(39, "A lifted chip", ("G03",),
             "Compare a lifted arc with a ground delivery. The partner needs usable space where the ball lands.",
             "Let a coach set a short suitable activity. Discuss the landing space and an available ground pass before practicing a lifted touch.",
             (30., 60.), (58., 42.), loft=48, demo="arc"),
        card(42, "Meet a volley", ("G04",),
             "The incoming path reaches a contact point before the outgoing route. The ball stays above ground at illustrated contact.",
             "Ask a coach to demonstrate controlled contact with an appropriate soft feed. Discuss when settling the ball would be preferable.",
             (44., 38.), (44., 0.), via=((44., 20.),), loft=32, demo="volley", john_at=(44., 20.), partner=False),
        card(44, "A penalty routine", ("G04",),
             "Rehearse a calm routine and an intended target. This unscored diagram does not measure accuracy or power.",
             "With a coach, choose an appropriate practice spot and target. Discuss preparation and repeatability without promising a goal.",
             (50., 12.), (44., 0.), partner=False),
        card(48, "Get familiar with the ball", ("G05",),
             "Repeated rises and settles represent ball familiarity, not a required juggling count.",
             "Try a few comfortable touches, allow a bounce, and restart cheerfully. No software score claims the child has mastered juggling.",
             (44., 58.), (46., 58.), loft=30, demo="bounce", partner=False),
        card(58, "An outside bend", ("G03",),
             "Compare the curve from the other side with a straight path to the same partner.",
             "Ask a coach to show appropriate outside-foot contact, then compare which route is useful. The diagram illustrates path shape only.",
             (30., 60.), (70., 40.), control=(58., 68.)),
        card(61, "Heading: overview only", ("G07",),
             "Heading drills are not enabled in John's profile. This entry records the chapter without claiming to teach its technique.",
             "Use a ground-ball alternative. Review the child's age, local rules and coaching guidance before any separate heading instruction.",
             (44., 58.), (44., 58.), partner=False),
    )


def observation_cards() -> tuple[PracticeCard, ...]:
    prompts = (
        (32, "David Beckham", "Find the receiver before the delivery."),
        (56, "Christine Sinclair", "Watch the player's position before the ball arrives."),
        (84, "Mia Hamm", "Notice an off-ball run that helps a teammate."),
        (96, "Lionel Messi", "Compare a carrying lane with a passing option."),
        (116, "Alex Morgan", "Pause before a scoring run and find the available space."),
        (142, "Cristiano Ronaldo", "Watch how the player prepares for the next action."),
    )
    return tuple(card(page, "Watch " + name, ("G20", "G08"),
                      question + " This is an original observation prompt, not a biographical quiz.",
                      "Use an adult-selected clip if available, or the schematic. Ask what the player can see; no particular match or book anecdote is asserted.")
                 for page, name, question in prompts)


def adult_cards() -> tuple[PracticeCard, ...]:
    prompts = (
        (160, "Notice progress", "Success can include a better observation, useful choice or enjoyable practice.",
         "Invite the child to name one thing they noticed. Discuss effort and learning without turning this card into another score."),
        (162, "Make practice inviting", "Keep the next optional activity small and enjoyable.",
         "Offer a choice of two short activities. Let the child pause or stop, and agree on one thing to notice rather than a compulsory target."),
        (163, "An adult's role", "Ask useful questions and let the child make the decision.",
         "Before revealing a coach route, ask which space the child sees. Listen to their reason instead of calling every answer for them."),
        (164, "Support on match day", "Encouragement and room to decide help keep play enjoyable.",
         "Choose one supportive phrase before the match. Discuss local coach guidance for sideline behavior rather than giving competing instructions."),
        (165, "Listen after play", "Let the child describe a memorable moment before offering advice.",
         "Ask whether they want to talk about play. If so, start with what they enjoyed and one next step they choose themselves."),
    )
    return tuple(card(page, title, ("G21",), summary, adult) for page, title, summary, adult in prompts)


def build_book_cards() -> tuple[PracticeCard, ...]:
    start = (
        card(8, "Start with a picture", ("G22",),
             "John is the player with the green ring. Blue players are teammates; coral players are opponents.",
             "Point to the attacking goal at the top and the defending goal below. Choose without a countdown, then compare the feedback."),
        card(11, "Read the playbook", ("G22",),
             "Watch pressure, space and ready teammates. An arrow shows a route, not a guaranteed result.",
             "Ask the child to explain one option. Use coach comparison or retry; first attempts remain separate from later practice."),
    )
    result = start + technique_cards() + observation_cards() + adult_cards()
    for item in result:
        item.validate()
    return result
