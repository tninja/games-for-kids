# Luke's Keeper Club - implementation specification

The user explicitly authorized a Pygame goalkeeper decision game for Luke, age
six and a beginner, similar in spirit to John's trainer. The user has already
moved John's game to `soccer_strategy/john/`. Implementation proceeds within
this authorized scope; a separate review of this written spec was not obtained.

## Acceptance criteria

- Launch independently with `python3 -m soccer_strategy.luke`. Keep John's moved
  files unchanged and record their source hashes before/after. Use installed
  Python/Pygame; introduce no dependency, network or persistent player data.
- Three simple skills, six authored pictures each: line up between the ball and
  goal; low/two-hand chest catches from gentle serves; ground roll toward the
  open, ready friend. Facts and layout are independent of the selected answer.
- Two large icon buttons per picture, English labels of at most four words,
  cues of at most ten words and coaching notes of at most twelve words.
  Mouse and keys 1/2 select; show the same short controls consistently.
- Menu offers each skill and a mixed round. Every round contains six distinct
  pictures; mixed rounds contain two from each skill. Shuffle choice positions
  deterministically by seed. No decision timeout or reading-speed score.
- Flow: watch a gentle serve, choose, watch the correct coach demonstration,
  receive positive feedback, then retry/replay/continue. Demonstrate the correct
  action after either choice, and explicitly say so. A retry never changes the
  first-attempt result. Correct choices earn stars; mistakes invite practice.
- Animate small positioning steps, ready hands/bent knees, two-hand low/chest
  catches brought toward the body, and a gentle underarm ground roll. The ball
  stays with the hands until roll release; catches meet the ball before hugging
  it. No dives, heading, contested high balls or long kicks in this beginner set.
- Positioning uses the ball-to-goal line. Catch pictures already put Luke behind
  the gentle ball; height cues distinguish a low roll from a chest-height serve.
  Rolling pictures visibly block one lane; open teammates look ready. An intended
  roll is not a promise that the receiver will control it.
- End-of-round feedback reports first-attempt stars per attempted skill and
  suggests a concrete practice tip for a skill that needs more practice; a full
  score suggests trying another skill. No claim of measured physical ability.
- Bright drawn pitch, goal/net, friendly keeper with visible gloves and hands,
  direction/height icons, smooth animations and bounded text at a resizable
  1280x880 canvas. Keep answer overlays out of the choice phase.

## Executable test plan

1. Catalog count, unique IDs, short text, valid coordinates and independent
   geometry checks for line direction, catch height and the blocked roll lane.
2. Six-case/mixed-skill round invariants across seeds; choices accepted only
   while choosing; replay/retry/summary transitions; immutable first results;
   weak-skill recommendations and invalid input handling.
3. Animation endpoints and intermediate properties: keeper arrives before a
   catch, ball remains beside the body after a catch, roll waits for release,
   score/choice changes never alter the demonstration geometry.
4. Real SDL rendering of every picture and phase, both choices, mouse/keyboard,
   replay/retry/next, resizing, summary and quit; text overflow rejects a bad
   control. CLI smoke saves a screenshot and validates its arguments.
5. A persisted `python3 -m soccer_strategy.luke.verify` command: full tests,
   complete measured runtime statement/conditional-edge coverage, cached Pyright
   with a rejected bad-type control, source hygiene/boundaries/complexity with
   negative controls, applied/executed scripted mutants, shuffled repeat and
   actual SDL launch. Reuse John's unchanged stdlib quality sensors only in the
   development verifier; Luke runtime does not depend on John's game.

## Setup, evidence and constraints

- All implementation, tests, instructions and evidence live in this directory;
  append the final concise result under the existing Org Luke headline.
- Use English in source and game text; respond to the user in Simplified Chinese.
- No package installation, checkpoint commit or worktree is required. Python
  3.14.4 / Pygame 2.6.1 / SDL 2.32.10 are already installed.
- Editor diagnostics baseline returned HTTP 401. Record this as unavailable,
  attempt final per-file checks and do not label independent sensors as editor
  diagnostics. Document substitutes and their limits in EVIDENCE.md.
- Coaching references: FIFA's grassroots catching exercise and learning-to-catch
  progression, plus The FA's 5-8 foundation guidance. These support the basic
  concepts; this game does not assess real catching technique or contact.

## User follow-up: wrong-choice animation and sound

The user requested a visible consequence after a wrong choice and sound. This
explicitly supersedes the original immediate correct-coach-only flow.

- A wrong choice enters a short `attempt` phase: the selected movement lets a
  gentle ball pass, the wrong hand height produces an unsecured/bobbled ball,
  or a roll on the blocked lane meets the orange player. Show the selected
  action and a short, gentle explanation, then automatically play the correct
  coach demonstration before feedback. Do not turn every mistake into a goal.
- Correct choices go straight to the correct demonstration. Replay always shows
  the coach; retry and first-attempt stars keep their existing meaning. Space
  skips only the current animation, so it cannot silently skip both stages.
- Failure motion follows the selected action and existing independent picture
  facts. Keep the serve's trajectory and height until contact; ground rolls
  wait for release and meet a blocker before stopping/rebounding. The original
  correct demonstration remains independent of the score key.
- Add default-on, gentle generated effects for a choice, a try-again cue,
  catch/roll contact, a good choice and a completed round. Use Pygame's mixer
  and generated signed-16-bit PCM; add no audio files, packages or network use.
  Respect the existing mixer's sample rate/channel count where supported.
- Add a visible Sound toggle and M key, plus CLI `--mute`. Muting immediately
  stops this game's effects. If no audio device can initialize, gameplay still
  works and the UI reports that sound is unavailable. Play cues on events and
  contact thresholds once, not on every rendered frame.
- Test every wrong choice's intermediate and final motion, automatic coach
  transition, skip/replay/retry/scoring, real mixer output and mute/device-failure
  behavior, event counts, UI text/controls and CLI. Keep the full measured
  runtime coverage/type/quality/mutation/SDL verifier and John source boundary.
- Append the final result to the current Org Luke section and update README /
  EVIDENCE. No separate spec-approval round is needed for this authorized fix.
  Editor diagnostics baseline remains unavailable (HTTP 401).
- The five-mutant portfolio now covers skipped wrong-choice playback, default
  sound being muted, overwritten retry stars, broken roll release and premature
  answer halos. Existing choice-validity and scoring tests remain unchanged in
  purpose; two prior mutant examples are replaced to target the requested work.

## User steering: more varied beginner situations

The user found the initial pictures repetitive and requested more variety.
Keep the wrong-choice/audio work above and add distinct decisions rather than
only mirrored layouts. Maintain two choices, short cues and six-picture rounds.

- Add three lineup pictures with a visible pass across the field before the
  gentle serve; Luke must follow the new ball position.
- Add three distribution pictures where holding briefly and looking is better
  than rolling into blocked lanes or toward a friend who is not ready. Draw
  both blockers or the friend's lowered arms and WAIT label explicitly.
- Add six Loose balls pictures in Luke's marked goalkeeping area: collect a
  nearby free ball when Luke is clearly first, or stay ready when another player
  is closer. Demonstrate safe standing collection; do not animate a collision
  or a dive at another child's feet. Failures show an uncollected ball or the
  other player getting there first, then the correct coach demonstration.
- Final curriculum: four skills, 30 pictures. Keep the 18 original pictures'
  facts/answers and add readiness/setup/blocker metadata with compatible defaults.
  Menu keys become 1-4 for skills and 5 for a mixed round. Mixed rounds include
  all four skills, with two skills receiving one extra case (six total).
- Teach a brief hold-and-look rather than indefinite possession; no competition-
  specific restart/retention rule is inferred. Suppress catch/roll contact sounds
  for demonstrations that just hold the ball or stay ready.
- Test setup trajectories, readiness/blocked routes, who can arrive first,
  correct/error animations, four-skill reachability, menu/summary layouts and
  existing failure/audio/retry invariants. Preserve the John source boundary.

## User steering: faces for everyone

- Give coaches, teammates and opponents two visible eyes and a friendly smile,
  matching Luke's face at their smaller head size. Keep readiness gestures,
  labels, team colors and scenario facts unchanged.
- Verify actual rendered eyes and mouth for both team colors and both readiness
  poses, then inspect full scenes with multiple people. Reuse one face renderer
  for Luke and other people so future facial changes stay consistent.

## User follow-up: meaningful match challenges

The user still finds practice too easy and repetitive. Proceed under the
authorized implementation scope without another approval round. No new package
or asset is needed; preserve all 30 existing case facts and John's source.

- Add menu 5, Match challenges, with 12 situations and three concrete choices.
  Keep two choices in the four basic skills. Key 6 selects a six-turn mixed
  round covering all five skills. Every challenge round contains six distinct
  situations, including both defending and playing the ball.
- Challenge cues describe observed facts without stating the preferred action.
  Differentiate a controlled dribble, a heavy touch and a shot starting; cover
  a near-post shot and a square pass; react to a reachable rebound versus an
  attacker getting there first; clear a free ball outside the marked area with
  feet; choose among three friends using readiness and a moving interception
  threat; support a teammate then recover after a turnover.
- Draw attackers and friends as players, show the penalty-area boundary and
  movement relevant to the decision. Demonstrate each selected wrong action
  and a separate correct action. Keep no-contact spacing; do not model every
  error as a goal, teach diving, or promise successful passing/catching.
- Keep shot/ball/other-player trajectories independent of the answer key.
  Preserve release/contact timing, visible faces, audio/mute, first-attempt
  stars, replay/retry and no decision timeout. No optional timers or speed score.
- New launches use a fresh seed; explicit --seed retains reproducibility.
  Old reproducible unit/CLI smoke behavior may use an explicit fixed seed.
- Test all three choices, fact-based geometry, independent correct animation,
  pre-choice concealment, moving actor timing, menu/summary layout, new-session
  diversity and the full source/type/coverage/mutation/SDL gauntlet. Include
  both new runtime modules in the verifier. Record unavailable editor diagnostics
  honestly; append final Org results and update README/EVIDENCE.
- Coaching support: FIFA's read/close/set framework and defensive transitions
  support balanced positioning and recovery; IFAB Law 12 supports using feet
  outside the penalty area. These sources do not prescribe this age-six game
  format; scenes are simplified authored decisions, not full-match guarantees.

### Additional steering: 1v1 and proactive sweeping

- Expand the challenge set to 18 cases (48 total) with explicit 1v1 shot,
  heavy-touch and wide-angle cases; collect a through ball inside the area,
  sweep behind defenders with feet outside it, and recover if the attacker
  wins the race. Make the first-arrival advantage visible and independent of
  the answer. Show balanced stops and space, without a collision or slide.
- Existing modes, six-turn rounds and three-choice challenges remain as above.
  Verify controlled-ball ownership, safe closing distance, area/feet decisions,
  and travel/contact timing for every new case. These simplified 1v1/sweep
  decisions do not prescribe an adult 1v1 technique for a six-year-old.
- Mutation portfolio: replace the default-muted and roll-jump examples with
  rejecting a third match choice and handling an outside-area sweep. Retain
  skipped wrong-choice playback, overwritten first-attempt stars and premature
  halo mutants. All sound and release timing assertions remain in the suite.
- Round refinement supersedes the earlier three-defending/three-playing sampler:
  select one case from each of six themes (1v1, angles, rebounds, sweeping,
  distribution, possession changes). Inspection of seed 0 showed three similar
  1v1 decisions in the same round. The new invariant guarantees six distinct
  contexts, including 1v1 and sweeping, while covering all 18 authored cases
  across seeds and preserving six turns and shuffled answer positions.

## Keeper Club playfulness (2026-11-01)

Tier 2 user-authorized autonomous implementation. No separate human specification
approval was obtained; this reduces confidence relative to an approved contract.
Keep all 48 authored pictures, answers, choices, geometry, coaching notes, six-play
rounds, untimed decisions and first-attempt stars unchanged. John's files and
unrelated root deletions are outside scope. No packages, installations, network,
storage, commits or worktrees are needed.

Named executable acceptance criteria:

- `test_warmup_ball_responds_to_click_and_b_without_scoring`: menu and summary
  offer a large tappable ball and key B. A pop animates from its current height,
  emits one gentle boing and counts only warmup taps. Gameplay ignores B and
  clicking the training ball must not select an answer or alter it.
- `test_fun_clock_bounds_motion_and_rejects_invalid_time`: deterministic bounded
  idle/bounce/party geometry; negative/non-finite time fails without mutation;
  repeated taps have a short cooldown, do not teleport the ball or grow height
  beyond the toy's allotted area, and do not change lesson timing.
- `test_feedback_high_five_is_optional_and_never_changes_stars`: feedback offers
  a large High five control/key H with a practice badge (also after a mistake).
  An accepted high five animates confetti and plays one cue; cooldown, replay,
  retry, repeated drawing and disabled audio cannot farm stars or flood sounds.
- `test_playful_captions_keep_the_action_clear_and_do_not_hint_answers`: a short
  humorous secondary line on some action cards; primary ACTIONS labels, action
  icons, randomized positions and answer keys stay unchanged. Captions depend
  only on the action, not correctness. No jokes ridicule a child's mistake.
- `test_party_and_badges_render_without_covering_the_lesson`: feedback/summary
  celebrate practice with animated header confetti and glove badges. Party
  graphics stay outside the football action; choices remain frozen and reveal
  no answer. Summary retains skill progress/tips and separate first-try stars.
- Preserve every original case via an independent pre-change SHA256 regression.
  Extend real all-case/choice UI rendering, real event/mixer tests, muting/device
  failure tests and CLI smoke to the new controls and their failure paths.

Setup: add a pure `club.py` for cosmetic timing and presentation text, extend
existing code-drawn graphics, App event handling and generated audio. Add focused
tests before runtime changes and observe behavioral RED. Include club.py in the
existing full-coverage/types/boundary gate and retain all established mutants;
add focused interaction mutants. Run `python3 -m soccer_strategy.luke.verify`
after the final edit, inspect real menu/feedback/summary renders, and report
unavailable diagnostics honestly. No training-ball physics changes are planned.

### First visual review refinement

A high five must visibly bump two gloves inside its own control, not merely
restart the confetti already running on feedback. Extend the high-five test to
compare the actual control pixels before/after a tap; it must fail without the
glove animation. Keep that graphic inside the control and outside the lesson.
The toy prompt must use a solid contrasting background over the pale goal net.
Also assert that B does not increment warmup taps while a lesson is choosing.


### Final verification plan refinements

Retain the original five mutants and add four: ignore warmup input, award a
first-try star for high fives, replay a sound from drawing, and enable the toy
during lessons. All nine must apply, execute and fail assertions. The new
resize/mute/device-loss test covers pre-existing audio handling together with
the toy; the ignored-input mutant must also kill this test in isolation.
Include club.py in all eleven runtime modules' complete coverage, types and
pure-presentation dependency boundary checks. The CLI smoke must exercise the
menu bounce, feedback high five, summary bounce and existing teaching flow.
