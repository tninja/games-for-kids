# Approved acceptance specification

Approved in conversation on 2026-10-26 before implementation.

## Named acceptance tests

1. `scenario_catalog`: 24 topics, three distinct situations per topic, 72 unique
   IDs, three actions per situation, contextual explanations and valid geometry.
2. `context_changes_decision`: observable changes in distance, possession or
   support change which action is preferred within every topic. More than one
   action may be reasonable. Choice order must not reveal the answer.
3. `training_flow`: observe animation, unlimited decision time, choose, outcome
   animation, feedback, retry and next; invalid transitions do not change state.
4. `visual_consistency`: scenes and animations use the same actor/ball geometry
   as the choices; answer overlays appear only in feedback. Text fits its panels.
5. `session_progress`: three stages, a short session with held-out transfer
   situations and a summary; retries never increase first-attempt results.
6. `input_and_exit`: mouse controls work, invalid clicks do nothing, quit closes
   cleanly, and returning to the menu allows another session.
7. `catalog_invariants`: coordinates, references, grades, animation endpoints and
   actor identities remain valid across the full catalog and generated layouts.
8. `headless_smoke`: run real Pygame with SDL's dummy video driver, exercise a
   choice and retry, save a screenshot and quit successfully.

## Scope and constraints

- Only add files below `soccer_strategy/` and append the Coding result in the
  task Org file. Preserve that headline and the existing games.
- English source, UI, comments and documentation. Offline, local single player;
  no account, network, telemetry, subprocess or persistent player data at runtime.
- Draw assets in Pygame. John controls one player; relevant teammates and
  opponents have scripted movement. No full match or realtime player control.
- Restart exercises explicitly state assigned roles. Do not adjudicate offside,
  heading, wall distances or league-specific rules that have not been supplied.
- A session has six practice situations and two held-out transfer layouts;
  five to ten minutes is a suggested pace, not a forced timer or proven duration.
- Educational choices are authored examples, not a physics engine or a claim
  of improved real-match performance. Coach review remains useful.

## Setup and verification plan

- Separate immutable scenario models/content, session state, animation and UI.
- Add tests first, observe failure, implement, rerun and review modularity.
- Use an isolated environment at `/tmp/soccer-strategy-venv`.
- Runtime dependency: `pygame-ce==2.5.8` (Pygame API with Python 3.14 wheels).
- Development tools: pytest (tests), coverage (line/branch measurement), Ruff
  (lint/format), mypy (types); record versions actually available.
- Persist one verification entry point with tests, static checks, coverage,
  3-5 real scripted mutants, catalog properties, dependency/complexity checks,
  real Pygame execution and repeatability checks. Check negative controls for
  custom gates. Record unavailable layers; a missing required layer must fail.
- Record diagnostics before edits and inspect every touched file against that
  baseline after edits. Record source hashes and a final evidence report.
- Do not install globally, create commits or change other working trees.

## Environment finding (not a change to the accepted behavior)

The initial environment has Python 3.14.4 and no Pygame or development tools.
The approved dependency installation failed because PyPI DNS is unavailable.
Use locally cached tools where possible. Missing execution, coverage or static
tools must be reported honestly rather than silently skipped or counted as green.

## Environment update during implementation

The user installed Ubuntu's `python3-pygame` package. Python 3.14.4 now imports
Pygame 2.6.1 / SDL 2.32.10, so real rendering and SDL execution are available.
This follows the user's explicit environment change and does not change the
accepted gameplay or acceptance criteria. The pip community-edition dependency
remains an optional installation route, not a locally tested runtime.

Locally cached Pyright 1.1.399 substitutes for unavailable mypy. Standard-library
statement/opcode-edge sensors and source-hygiene checks substitute for unavailable
coverage.py and Ruff. Their negative controls must fail as expected, their limits
must be reported, and coverage requirements are not reduced to obtain a pass.

## User-authorized coaching review and goalkeeper extension

The user requested a careful correctness/usefulness review of every case, then
requested goalkeeper throws to John under pressure and confirmed 7v7 with a
build-out line. These refine the already approved contextual-correctness and
visual-consistency criteria. No new runtime dependency or external action.

- Review every original variant against primary FA/FIFA coaching principles.
- Scene facts must not depend on which action was marked preferred.
- Explicitly distinguish preferred, reasonable and risky actions; a reasonable
  alternative must not be presented as a guaranteed defensive failure.
- The chosen action must keep its meaning in the animation, including a wide
  clearance when keeping possession would have been preferable.
- Loose-ball distance advantages, passing pressure and assigned zones must be
  visible in the geometry and not merely asserted in text.
- Add topics 25 and 26, three variants each: keeper throw under pressure and
  reacting when the first touch from a keeper distribution becomes contested.
- Goalkeeper observation shows opponents starting beyond the build-out line;
  the decision starts after John's first touch, when pressure is live under the
  common release and first-touch variants. Do not assume one league's trigger
  is universal. A deliberate pass back is to the keeper's feet, not hands.
- Record a per-variant review, its evidence, corrections and remaining limits.

## Further user steering in the same review

- John plays 7v7 with a build-out line. The parent confirmed slide tackling is
  allowed in his competition. Local release timing must not be invented.
- Teammates may not receive a pass reliably. Show receiver readiness, use short
  controllable passes where appropriate, and teach support after passing.
  Topic 27 adds three pictures after a teammate's loose first touch.
- Replace vague action names with concrete instructions naming A, R, M, goal or
  touchline. Verify the preview follows the named action and show role labels.
- Topic 28 adds three standing-versus-sliding decisions. Controlled ball contact
  does not excuse a dangerous challenge; no physical-technique certification.
- Topic 29 compares short ground pass, a long outfield kick and carrying into
  nearby space. A long kick has a deliberate wide destination and may be won by
  either team. Neither a short pass nor long kick promises teammate control.
- Current catalog: 29 topics, three variants each, 87 pictures / 261 options.

## User-approved section reorganization

The user accepted reorganizing both game sections and the Org document after
the keeper, teammate, sliding and long-kick additions.

- Six sections: 1v1 basics (01,02,03,05,06); protect the goal
  (04,15,16,17,18,28); recover and cover (07-11); read passes and runs
  (12-14); use the ball (19-21,25-27,29); defend restarts (22-24).
- Preserve all 29 topic IDs / 87 pictures and their observations, geometry,
  action descriptions, ratings and explanations. Only membership changes.
- Use one canonical section definition for lesson membership, menu and validation.
- Every section supports six distinct practice situations plus two held-out
  transfer layouts, including sections with only three or five topics.
- Expose all six menu cards with mouse and keys 1-6; choices remain keys 1-3.
  The six cards must fit without overlap or text overflow.
- Consolidate current Design and Coding information in the Org file, integrate
  new cases into the curriculum and remove obsolete totals and duplicate updates.
  Keep the existing top-level headlines. Design remains Chinese; code is English.

## User-requested complete answer audit

The user explicitly requested careful review of every case and choice for
correctness. This authorizes corrections within the existing catalog; it is
not permission to expand the game or install tools. No new dependencies.

- Inspect all 87 observations, 261 options, grades, explanations and routes
  against independently authored positions and primary football sources.
- Shielding places John's body between A and the ball, within playing distance;
  it must not move the ball toward A or imply pushing/holding is allowed.
- Do not accept a support route that sends John behind the live attack to a
  teammate who has already been beaten. Account for an unmarked far-side runner.
- Explain each non-preferred option using its own picture, instead of appending
  the preferred answer to a generic warning. Keep text short for a nine-year-old.
- Keep observations of teammate help conditional on visible position and
  communication; never promise a successful reception or guaranteed tackle.
- Correct unsupported proximity or possession claims in the actual scene data.
- Preserve 29 topics, six sections, 87 pictures, first-attempt scoring, control
  keys and six-plus-two session structure. Update the content checksum visibly
  for these intentional coaching corrections, with the old hash retained here:
  4c032dcf86cf7e99117818329c8089cc2ec67d1cb570b7940f0d1650ce6d1b31.
- Named regressions: shield geometry, beaten-teammate support grade, far-side
  marking grade, specific feedback for every option, observed support distance,
  and first-touch/rebound picture consistency. Run the full existing verifier,
  render every changed picture and record remaining diagnostic limitations.
- Update the complete per-picture review including risky choices, preserve past
  evidence separately, and append an English result to the Org Coding section.
- Final visual-audit finding: the pressure demonstration must not run A and
  the controlled ball through John's stopping point. Hold A's decision pose and
  the ball during a press preview, so John's route illustrates closing under
  control rather than predicting that A is stopped or that A beats him.
- Final reviewed content baseline (section excluded):
  1bcb7399799f74e6eaf725d894d5dbf666441d8cffd635c78e8e6aef421b14ae.
  Only 09.1/cover and 10.3/cover changed grade (reasonable to risk). The 87
  preferred action keys are unchanged. Five new regressions first failed on the
  old source, then passed after correction; the snapshot was refreshed for
  the intentional corrections, retaining the prior hash above.

## User-requested movement and arrow audit

- John’s action preview moves him along the arrow to the selected destination.
  The arrow is drawn above player and ball sprites, has a visible endpoint, and
  is identified as John's route. Feedback distinguishes the selected route
  from a different suggested route; coincident routes are not drawn twice.
- A response is a teaching illustration, not a simulation of both teams' future
  movements. Other actors hold their pictured positions while John acts.
- The ball stays still for movement/marking actions. It moves only for explicit
  ball interactions or a shot being blocked. A pass, clearance, slide or long
  kick starts after John reaches the ball; a carry keeps the ball by his feet.
- Regressions cover pass contact timing, ball stability during positioning,
  players staying in the pictured scene, arrow endpoints/colors, and existing
  contact-before-release behavior. Verify the complete suite and render examples.
- The authored-case snapshot includes animation endpoints. Refresh it only for
  the intentional correction that stationary positioning actions keep the ball
  at its pictured location; retain the preceding snapshot hash in the evidence.
- Movement-audit snapshot: `50bef7abc8cec9b0cf2c4f3122a052e72deef23a227d05188b2b018940c564ae`.
  Previous reviewed snapshot: `1bcb7399799f74e6eaf725d894d5dbf666441d8cffd635c78e8e6aef421b14ae`.

## User-requested age, team-format and passing-error review

The user requested a careful review for a nine-year-old playing 7v7/9v9, with
teammate passing and receiving treated as variable, and asked for additional
realistic cases where useful.

- Keep observations short, concrete and about one visible decision at a time;
  use familiar words and the existing A/M/R key. No heading action is required.
- Make field guidance usable in both 7v7 and 9v9 without assuming a formation,
  number of nearby teammates, offside interpretation, restart procedure or
  build-out release trigger beyond what the pictured situation states.
- Preserve the prior 29 topics and add one topic (30) with three distinct
  examples following a teammate pass that is deflected or intercepted: John can
  reach a loose ball; an opponent controls and attacks while John is behind;
  an opponent sends a forward pass through John's lane. Preferred actions differ
  to teach collection, goal-side recovery and interception.
- Describe a pass as an attempt, not a guaranteed reception; never label a
  teammate as bad. Keep John responsible for his next safe decision after a
  turnover, without guaranteeing that pressure or a tackle wins the ball.
- Avoid repeated feedback phrases: keep every cue at 24 words or fewer, each
  choice label at 12 words or fewer, and each feedback explanation at 24 words
  or fewer. Show the retreat line only during the initial 7v7 keeper-distribution
  picture; do not draw it during open play or after the release.
- Preserve three choices per case, six sections, six-plus-two session behavior,
  scoring and all existing case ratings. Include authored-geometry regressions,
  update the content snapshot for the addition, review rendered examples, run
  the complete verifier and document source/evidence limitations.
- Age/format review snapshot: `d54652c85edd4903636166311adf8c8f128679346f008fa53491a62eee5df31b`.
  Previous follow-up snapshot: `81ad3e50fb3e97d3a9e7c5016773c6bf4909021e5a1f3b732980354676d3276a`.
  Prior movement-audit snapshot: `50bef7abc8cec9b0cf2c4f3122a052e72deef23a227d05188b2b018940c564ae`.

## User-requested Defend shooting section and dangerous-zone cases

The user explicitly requested more situations in which a carrier enters a
dangerous area and prepares to shoot, and a section named `Defend shooting`
containing the related topics. This is authorized follow-up implementation;
no separate approval round or new dependencies are required.

- Rename section 2 to `Defend shooting` and group topics 4, 11, 12, 18, 28,
  31 and 32 there. Move crossing topics 15-17 to `Read passes and runs`.
  Keep six menu sections, existing topic IDs and all 90 existing case records
  except their section memberships. Preserve first-attempt scoring and 6+2 rounds.
- Add topic 31 with three dangerous-zone pictures: close a carrier who still
  needs a setup touch; block a shot already being prepared; win a genuinely
  exposed last touch with a standing challenge. Preferred actions must change
  with the facts; entering the box alone does not justify a tackle or slide.
- Add topic 32 with three pictures involving a teammate: block when M is beaten
  and A is about to shoot; stay with R when M actually covers the shooting line;
  take over pressure when M is beaten and A still has to set up the shot.
  M's cover is not a guarantee: John must keep watching A and reassess.
- Every new case has three concrete English choices and picture-specific
  explanations within the existing 24/12/24-word limits. No heading actions, assumed
  successful reception, or dangerous contact as a recommended action.
- Test the timing distinction, clean-ball distance advantage, shot-line geometry,
  visible runner and teammate roles, membership and session reachability.
  Render all six new decisions and feedback. Refresh the catalog snapshot only
  for these six additions, and retain the prior hash above.
- Use the installed Pygame and existing verifier. Record the diagnostics
  baseline failure (HTTP 401) as unavailable; independent verification is not
  reported as editor diagnostics. Append the implementation result to the Org
  Coding section and record fresh verifier evidence.
- Visual follow-up: give the six new pictures a larger authored pressure gap
  so the preferred closing pose does not merge John's sprite into A's sprite.
  This distance illustrates a balanced stop; it is not a prescribed real-world
  measurement. Prior pictures retain their original routes.
- Defend-shooting catalog snapshot: `3e9402522638316cab403a3ba14accdcb2cce6b5d0b0181c7c341e00ca97bb79`.

## User correction: keep shooting practice focused on protecting goal

The user clarified that `Defend shooting` should assume the opponent keeps
control and prepares to shoot. Loose touches, collection and pass interception
do not belong in this practice. This supersedes the previous section membership
and the exposed-touch example in topic 31.

- Section 2 contains topics 4, 31 and 32 only: nine controlled-ball shooting
  pictures. Move 28 to 1v1 basics, 11 to Recover and cover, 12 to Read passes
  and runs, and 18 to Use the ball. Keep all 32 topic IDs and 96 case IDs.
- Rewrite the nine shooting pictures around closing the shooting space,
  standing in the shot line, recovering inside, and covering an angle while
  M presses. No choice in these pictures collects a loose ball, tackles,
  intercepts a pass or follows a separate runner.
- Distinguish a central shot and left/right near-post threats with explicit
  authored aim points on the goal line. Block routes and the blocked ball must
  lie on the corresponding shot line; near-post buttons identify the side.
- Every shooting picture keeps A closer to the ball than John. Vary position,
  shooting preparation and M's actual pressure; do not manufacture an error by
  A to create a different preferred answer. Multiple pictures may correctly
  prefer blocking. Replace the old three-distinct-preferred-actions requirement
  only for these explicitly changed topics, while retaining it elsewhere.
- Update affected semantic tests to this corrected contract; test all nine
  cases for controlled ball state, legal goal aim and goal-protection choices.
  Retain the general geometry, rendering, text, scoring and session invariants.
- Preserve the 87 cases outside topics 4, 31 and 32 except section membership.
  Keep six menu sections and 6+2 rounds; topic-rich sections rotate six topics.
  Render the revised pictures, run the existing full verifier, record the new
  snapshot/evidence and append the result to the current Org Coding section.
- No dependencies or installations. Editor diagnostics baseline returned HTTP
  401 again; record it as unavailable rather than claiming it passed.
- Controlled-shooter correction snapshot: `da811188a9d946367e0bed46a97ee5cf797ea47be20b3237e4d42ac7a1a9bf99`; prior snapshot is retained above.

## User-selected shot guides and controlled cut-ins

The user selected both proposed follow-ups: feedback-only shot lines and block
points, plus controlled cut-in shooting cases. This authorizes implementation.

- Add topic 33 to Defend shooting: three controlled-ball cut-ins. From the left,
  John can close before the kick or cover a prepared far-corner shot; from the
  right, John covers the opposite far-corner shot. A stays beside the ball during
  every observation frame. Author the starting carrier position and ball origin
  so the animation genuinely moves inward from the side.
- Keep the prior 96 cases' facts, actions, routes, ratings and explanations.
  Add optional shot-aim metadata for the shooting pictures, sourced from their
  existing aim points. The resulting catalog has 33 topics / 99 cases, with
  four shooting topics / 12 cases. Preserve six sections and 6+2 rounds.
- Only on feedback, show a coral dashed shot direction from the decision ball
  position to the stated goal aim, plus a blue ring at the block choice's target.
  The guide is independent of which choice was selected or preferred; a pressure
  action can still be the strong decision before a shot is set. Keep gold/green
  route arrows, add a short English color key, and do not display the guide
  during observation, decision or outcome animation.
- Draw the shot line behind players and the block ring above routes. The stated
  shot is an illustration, not a prediction. Transfer layouts must move the
  aim, line and block point consistently; validate aims stay in the goal mouth
  and require a block choice when a shot guide is present.
- Test controlled carrier/ball movement throughout the cut, left/right approach,
  choice changes with shot readiness, guide geometry, transfer, invalid metadata,
  phase visibility, color/endpoint rendering and empty-segment drawing.
  Render the changed feedback and all new cases, run the existing full verifier,
  update the snapshot/docs/evidence and append the Org result.
- No dependencies or installation. Diagnostics baseline again returned HTTP
  401 and will be recorded as unavailable, not clean.

## Additional user steering: distance to the shooter

The user asked whether blocking should be closer to or farther from the shooter,
and explicitly requested cases teaching this decision. Add topic 34 with three
matched controlled-ball pictures: John too deep with time to close, John already
set on the shot line as the kick starts, and John near A's side but outside the
shot line. Prefer closing, holding the block, and moving across into the line,
respectively. Do not teach that closer always means better or prescribe a fixed
real-world distance from percentage coordinates. Preserve the previous selected
shot-guide/cut-in scope. Final totals become 34 topics / 102 cases; shooting has
five topics / 15 cases. Test the matched distances, the stationary block and the
off-line lateral correction. Include the final counts in docs and evidence.
- Final shot-guide/cut-in/distance snapshot: `d90a4ad034f1237645d3c003e97756a83f6d0b8cbfa9448b89008cb753dd6113`; previous snapshot is retained above.
