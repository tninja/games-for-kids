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
