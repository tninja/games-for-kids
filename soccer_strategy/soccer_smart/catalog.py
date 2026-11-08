"""Build and validate the canonical scenario and practice-card catalogs."""

from .content import ActorSpec, CARD_SPECS, CardSpec, TOPICS, TopicSpec, VariantSpec
from .curriculum import section_for_topic
from .model import Actor, Choice, Point, PracticeCard, Scenario

DEFAULT_RULES = "Full field: attack upward toward (50, 0); defend (50, 100)."


def _heading_toward(source: Point, target: Point, fallback: Point = (0.0, -1.0)) -> Point:
    dx, dy = target[0] - source[0], target[1] - source[1]
    if dx == 0.0 and dy == 0.0:
        return fallback
    return (dx, dy)


def _make_actor(spec: ActorSpec, ball: Point) -> Actor:
    approach = spec.approach if spec.approach is not None else spec.position
    run_to = spec.run_to if spec.run_to is not None else spec.position
    fallback = (0.0, 1.0) if spec.team in ("away", "keeper") else (0.0, -1.0)
    heading = _heading_toward(spec.position, ball, fallback)
    return Actor(spec.key, spec.label, spec.team, spec.position, approach, run_to, heading)


def _make_scene(topic: TopicSpec, variant: VariantSpec) -> Scenario:
    stage = section_for_topic(topic.topic)
    actors = tuple(_make_actor(a, variant.ball) for a in variant.actors)
    choices = tuple(
        Choice(c.key, c.label, c.target, c.rating, c.explanation,
               c.outcome, c.ball_end, c.action_kind)
        for c in variant.choices
    )
    scene = Scenario(
        id=f"T{topic.topic:02d}.{variant.variant}",
        topic=topic.topic,
        variant=variant.variant,
        title=topic.title,
        stage=stage,
        role=topic.role,
        groups=topic.groups,
        focus=topic.focus,
        cue=variant.cue,
        actors=actors,
        ball=variant.ball,
        ball_from=variant.ball_from,
        choices=choices,
        rules=DEFAULT_RULES,
        coach_note=variant.coach_note,
        ball_state=variant.ball_state,
        shot_window=variant.shot_window,
    )
    scene.validate()
    return scene


def _make_card(spec: CardSpec) -> PracticeCard:
    actors = tuple(_make_actor(a, spec.ball_end) for a in spec.actors)
    card = PracticeCard(
        id=spec.id,
        title=spec.title,
        groups=spec.groups,
        summary=spec.summary,
        adult_prompt=spec.adult_prompt,
        actors=actors,
        ball_start=spec.ball_start,
        ball_end=spec.ball_end,
    )
    card.validate()
    return card


def build_catalog() -> tuple[Scenario, ...]:
    return tuple(_make_scene(topic, variant) for topic in TOPICS for variant in topic.variants)


def build_practice_cards() -> tuple[PracticeCard, ...]:
    return tuple(_make_card(spec) for spec in CARD_SPECS)
