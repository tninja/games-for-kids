# Existing-game audit and reuse decisions

This audit inspected implemented source, not just earlier design documents.
The [Soccer Smart README](../soccer_smart/README.md) and code describe the current
playable game; some historical design text still describes its pre-build state.
No existing game file is changed by this delivery.

## Existing coverage

| Area | Inspected implementation | Coverage to preserve / link |
| --- | --- | --- |
| John | [content.py](../john/content.py), [curriculum.py](../john/curriculum.py) | 38 topic families / 114 variants; defensive positioning, transitions, restarts and goalkeeper-to-John / middle-back possession already exist |
| Luke | [content.py](../luke/content.py), [match_content.py](../luke/match_content.py), [club.py](../luke/club.py) | Five keeper skills, 18 match situations, distribution and sweeping; playful rewards and toys already exist |
| Soccer Smart tactics | [content.py](../soccer_smart/content.py), [catalog.py](../soccer_smart/catalog.py) | 12 topics / 36 situations / 108 choices; first touch, shielding, turning, carrying, receiver selection, support, width, triangles, shooting, delay, cover, interception |
| Soccer Smart practice | [CARD_SPECS](../soccer_smart/content.py) | Seven existing cards, including friendly-delivery, watch-a-player and one-good-question |
| Animation and session | [presentation.py](../soccer_smart/presentation.py), [session.py](../soccer_smart/session.py) | Straight interpolated ball paths; one choice per scene; replay and coach comparison; first-attempt score preservation |

The shaped-delivery G03 label already exists in Soccer Smart, but its current
friendly-delivery card animates a straight ground pass. A theme label alone is
not implementation of a curved trajectory. Similarly, watch-a-player already
asks the child to pause a match and identify space: simply adding pro names
would duplicate it.

## Mission-level decisions

LINK means refer to existing lessons without copying them. EXTEND means add a
specific observable capability on top of existing presentation/concepts. NEW
means a distinct activity/state contract, not a claim of wholly new football.
Every row uses OVERVIEW_ONLY book evidence and ORIGINAL authored content.

| ID | Decision | Existing overlap | Observable addition / reason to keep |
| --- | --- | --- | --- |
| M01 | EXTEND | Soccer Smart T02 shielding / T03 turning; John inside-cut topic 2 | Two-touch corner path, visible exit gate and a new cue after the turn; choose again instead of replaying a frozen turn |
| M02 | EXTEND | friendly-delivery card, G03 shaped delivery, T05 receiver selection | A visible curved route clears a blocker while the straight route fails; reverse the blocker to make the straight option best |
| M03 | EXTEND | John topic 24 defends a free kick; Soccer Smart T09 shooting windows | John directs an attacking restart, then responds to the defender's movement after a short pass |
| M04 | EXTEND | watch-a-player card; Soccer Smart T06 support / T08 triangles | Commit a prediction, reveal an authored defender reaction, then score a fresh second decision with visible evidence |
| M05 | EXTEND | Soccer Smart T04 / T07 single-step carries | Compare an open wing speed-dribble runway with a closed runway requiring an early pass, then adapt to the recovery defender |
| M06 | EXTEND | Soccer Smart T09 basic shooting windows | Forward checks into an unscreened penalty-box scoring spot, then either finishes into the target or squares when blocked |
| M07 | EXTEND | John topic 25/29 build-out; Soccer Smart T05 passing | Defender breaks the first press line from the back, then adapts as the midfielder or winger faces the second defender |
| X01 | NEW | one-good-question reflection card | Choose a playing principle, attach evidence from a mission, revise it against a contrasting situation; no tactical-score reward |
| X02 | NEW | one-good-question and off-field G23 overview | Concrete plan, helper role, completion observation and revision cycle; optional, unscored and session-local |
| X03 | NEW | watch-a-player and Touch-and-look cards | Connect book-named pro roles (Girma, Bonmati, Pulisic, Mbappe), real-play evidence, match-watch focus and Try It / safe-heading notes |

## Content not to rebuild

- LINK basic receiving/passing to Soccer Smart T01-T08; basic finishing to T09.
- LINK delay/cover/interception to Soccer Smart T10-T12 and John's defense.
- LINK goalkeeper training and goalkeeper distribution to Luke; John's own
  keeper-throw and middle/back-field possession cases already cover that role.
- LINK basic observation and reflection to the existing cards. X01/X02 need the
  plan/evidence/revision cycle to justify their additional interface.
- DEFER a new beginner curriculum, another 12-topic/36-variant catalog, a copy of
  either app, duplicated celebration systems, unverified pro match references,
  and claims to cover all of the book's techniques.

## Reuse boundary

Use [drawing.py](../soccer_smart/drawing.py) primitives (Painter, Button,
pitch_point, draw_pitch, draw_player) through a narrow presentation adapter in
the first implementation slice. Preserve the full-field coordinate convention
and familiar choice controls. Keep advanced episode state, provenance and
trajectory data owned by soccer_smarter.

Do not subclass the current Session or append new topics to its catalog:
Scenario.validate hardcodes topics 1-12, A/B/C variants and 2016 theme groups;
Session stores one result per scene ID. Those constraints do not express the
new episode model. Reuse visual primitives, not the fixed curriculum or whole
app. A later shared renderer extraction requires evidence of a real boundary
problem and regression checks for the existing game; it is not part of this
design delivery.
