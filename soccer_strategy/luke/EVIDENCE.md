# Luke's Keeper Club - playful interaction evidence

User-requested Tier 2 work, 2026-11-01: make Luke's keeper trainer less boring.
The [append-only specification](SPEC.md) records the executable criteria,
preservation constraints and visual refinement before their implementation.
No separate human specification approval was obtained in this authorized
autonomous run; confidence is lower than a human-approved contract.

The game adds an optional tappable warmup ball on menu/summary, a feedback glove
bump, generated boing/high-five sounds, practice badges, header confetti, varied
encouragement and action-based joke captions. The 48 case records, answers,
coaching geometry/notes, six-play rounds, untimed decisions and first-try stars
are unchanged. All 29 recorded John files are byte-identical to the baseline.

## Fresh final verification

Persisted entry point, executed after the last code/test/README/SPEC edit:

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.luke.verify
```

Exit **0**. The verifier removes stale artifacts and fails if any declared gate
is missing or unsuccessful. Fresh `.verification/report.json` records:

| Gate | Command or persisted layer | Result |
|---|---|---|
| Full Luke suite and coverage | `luke.verify:unit_and_coverage` / unittest discovery | 77 passed, zero failures/errors |
| Statement coverage | Same run, stdlib sensor | 1068/1068 |
| Conditional-edge coverage | Same run, stdlib sensor | 762/762 |
| Hygiene, boundaries and complexity | `luke.verify:static_checks` | 21 Python files; zero violations; two bad controls rejected; limits 60 function lines / 15 decisions |
| Types | `luke.verify:types` / Pyright | 11 runtime modules; zero errors/warnings; bad assignment rejected |
| Mutation | `luke.verify:mutations` | 9/9 applied, executed and killed by assertions |
| Suite health | `luke.verify:suite_health` | 77 tests passed in shuffled order, seed 734 |
| Real SDL execution | `python3 -m soccer_strategy.luke --smoke --screenshot <package>/.verification/feedback.png` | Menu bounce, teaching flow, glove bump, replay, retry, summary bounce and quit; exit 0 |

The report retains the exact argv, working directory and exit code for all
12 subprocesses (two type checks, nine mutants and the SDL smoke). Coverage,
types and mutant assertion output are in `.verification/coverage.json`,
`types.json` and `mutations.json`. All five established mutants remain; four
new mutants disable warmup input, award stars for high fives, play sound during
drawing, or enable the warmup ball during lessons. Every mutant was verified as
actually applied. None survived and no equivalent-mutant exemption was used.

Toolchain: Python 3.14.4, Pygame 2.6.1, SDL 2.32.10, Pyright 1.1.399.
Source SHA256: `5f004e30257ecb9e3006ac5929101e00396059359469da2ca130b23ed83a1227`.
The source hash includes Luke source/tests/docs plus the unchanged John quality
sensor, and excludes generated artifacts, bytecode and EVIDENCE.md. It was
checked against current files immediately before writing this report.
Original case SHA256: `6710770b751af79ef83e05d00605e5c7acdb5cc1f09d69634aa13f5ecf3a70d5`.

Additional commands actually executed:

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m unittest discover -s soccer_strategy/luke -t . -q
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.john --smoke
git diff --check
```

Results: 77 tests passed; John's real SDL smoke exited 0; diff check exited 0.
Baseline was freshly executed before runtime edits: 70 tests passed. No baseline
failures were found. Independent pre/post comparisons confirmed 48/48 Luke
records and 29/29 John files identical. No root deletions were restored or changed.

## Specification to tests

| Requirement | Executable evidence | Result |
|---|---|---|
| Click/B pops a visible toy, counts taps and emits one cue | `test_warmup_ball_responds_to_click_and_b_without_scoring` | pass |
| B ignored during a decision; training state and stars preserved | Same test plus existing session regressions | pass |
| Bounce is continuous at a tap, bounded to 100 pixels, with a cooldown | `test_fun_clock_bounds_motion_and_rejects_invalid_time` | 30 repeated pops / 120 time steps pass |
| Negative/NaN/infinite time fails before mutation | Same test | pass |
| Scaled mouse coordinates, mute and lost mixer keep toys playable | `test_fun_controls_work_after_resizing_muting_or_losing_audio` | pass |
| Feedback H/click animates glove bump and plays once; no star farming | `test_feedback_high_five_is_optional_and_never_changes_stars` | pixel, sound, cooldown, replay/retry and score checks pass |
| Action names/icons preserved; captions depend on action, not correctness | `test_playful_captions_keep_the_action_clear_and_do_not_hint_answers` | all 48 pictures pass |
| Confetti changes outside the frozen lesson; six practice badges on summary | `test_party_and_badges_render_without_covering_the_lesson` and real renders | pass |
| All original teaching records retained | `test_all_48_original_training_pictures_are_unchanged` | original hash matches |
| Every old case/choice/pose still fits and works | Extended existing UI, audio, animation, session and CLI tests | pass |

The new resize/mute/device-loss test passed on the already implemented device
handling. Its isolated negative control copied the package to a temporary folder,
uniquely replaced `if self.fun.pop():` with `if False:`, confirmed the mutation
on disk, and ran only that named test. The test failed on `0 != 1`, exit 1.
This proves the test can reject a missing interaction; it does not prove every
possible device failure is covered. The same bug is a persisted gauntlet mutant.

## Final sensors and modularity review

- **Clean:** fresh tests, complete measured runtime coverage, types, hygiene,
  boundaries, complexity, mutants, randomized repeat and real SDL execution.
  Thresholds and prior assertions were not weakened. Known-bad sensor controls
  run in the normal verifier and reject missing branches, unused imports,
  rendering imports in the model and a deliberately invalid type assignment.
- **UNAVAILABLE:** editor MCP baseline again returned `baseline_unavailable`:
  the old `soccer_strategy/app.py` buffer has no active backend. Every touched
  file was queried with `since="baseline"`, returning `no_baseline`; moved Luke
  buffers are not open. This does not satisfy the harness's complete-clean
  editor condition; executable verification is independent evidence.
- **SUBSTITUTED:** the established stdlib hygiene/coverage sensors stand in for
  Ruff/coverage.py; deterministic bounded-time and existing round/layout sweeps
  stand in for Hypothesis; applied manual mutants stand in for a general
  mutation framework. These enforce the declared rules, not those tools' full
  rule/input spaces. Known-bad controls validate specific failure paths.
- **N/A:** new dependencies/licenses, network/storage/security capabilities,
  concurrency, migrations and performance budgets. No package installation,
  external service, downloaded media, persistent badge storage or new data
  collection was introduced. No commits or worktrees were created.
- Responsibility placement: pure `club.py` owns cosmetic time, cooldowns and
  playful strings without importing training, scoring or Pygame. `drawing.py`
  owns the toy, gloves, badges and header particles. App handles scaled events
  and uses the existing phase transition hook, renamed to `_sync_events`, for
  one-time party/sound events. Audio stays in the existing generated SoundBank.
- Consistency and dependency direction: the feature reuses Button/Painter,
  existing sound mute/device behavior and CLI smoke. The verifier includes the
  new pure module in coverage/types and enforces the presentation dependency
  boundary. Session, cases, match motion and John's source are unchanged.
- Semantic duplication/change radius: the badge names, captions and cheers are
  centralized. Mouse hit testing and rendering use toy height from
  the same state. Menu/summary share one toy renderer. Celebration draws only
  in the header or its feedback control, rather than adding a second game or
  changing training-ball animation. No conflicting module responsibility or
  architecture exception was found. Optional counters are cosmetic, not scores.

## Visual review, failures and remaining limits

Real renders were inspected under `/tmp/luke-fun-review/`: menu, airborne ball,
answer cards, wrong-choice feedback, glove bump, summary and summary bounce.
All original cases/poses/visible options still render without text overflow.
A separate geometry check confirms the new control avoids every feedback actor.

New interaction/caption tests first failed on missing `fun` and `caption`
behavior. The visual review then required a visible glove bump in its control;
its pixel regression failed before that animation was added. The toy instruction
was moved onto a solid purple background because white text over the pale goal
net lacked contrast. All fresh tests and the final gauntlet passed after these
fixes. No failing gate was suppressed or removed.

All effects were exercised with real Pygame and SDL dummy audio/video. Physical
speaker loudness and hands-on child usability were not verified. The existing
Pygame AVX2 build warning remains. Whether Luke finds this more enjoyable needs
his playtest; passing tests do not establish engagement or real-match improvement.
Unrelated repository game suites were not run; John's unchanged game received a
separate SDL smoke. Badges celebrate practice after mistakes as well as success;
first-try stars continue to represent the original decision only.

---

# Archived evidence - match challenges

The user requested harder and more diverse situations, then explicitly added
1v1s and proactive goalkeeping in front of danger. SPEC.md records the append-only
criteria and the refinement to six distinct themes per round. A separate approval
of that written spec was not obtained; implementation proceeded under the direct
user requests. Coaching examples are authored and not independently certified by
Luke's coach. The previous evidence recorded 53 passing tests; that historical
baseline was read, not freshly rerun before this turn's edits.

## Final fresh verification

From the repository root:

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.luke.verify
```

Exit **0**, after the final code, tests, README and SPEC edits:

| Executable gate | Result |
|---|---|
| Full suite | 70 passed; zero failures/errors |
| Measured runtime statements | 949/949 covered |
| Measured conditional edges | 704/704 covered |
| Hygiene / dependency boundaries / complexity | 20 Python files, zero violations; two bad controls rejected |
| Pyright 1.1.399 | Ten runtime modules; zero errors/warnings; bad-type control rejected |
| Applied/executed mutations | 5/5 killed by assertion failures |
| Shuffled suite repeat | 70 passed; zero failures/errors |
| Real SDL smoke | Menu, choices, wrong attempt, coach, replay, retry, summary, quit; exit 0 |

The persisted verifier removes stale artifacts and fails closed. Detailed local
artifacts: `.verification/report.json`, `coverage.json`, `types.json`,
`mutations.json`, `feedback.png`. Source hash (Luke source/tests/docs plus the
unchanged John quality sensor; excludes artifacts, bytecode and EVIDENCE.md):

`0505ec6082ea52f1b534ddcbdc1188d418220fdcec27d8af4505863246dff7c7`

Toolchain: Python 3.14.4, Pygame 2.6.1, SDL 2.32.10, Pyright 1.1.399. Pyright
uses its recorded Python 3.13 basic configuration; executable tests use Python
3.14. No packages, image assets or sound assets were installed/downloaded.

Additional command:

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.john --smoke
```

Exit **0**. SHA-256 comparisons confirmed **29/29 John source files unchanged**.
Normalized JSON comparisons confirmed **30/30 original Luke case records
preserved**, excluding the four newly added metadata fields. Existing root
removals and the user's John relocation remain untouched. `git diff --check`
also exited 0 (the verifier separately checks all untracked Luke Python files).

## Accepted behavior and test mapping

The final game has 48 cases: 30 two-choice basics and 18 three-choice match
challenges. Menu 5 enters challenges; 6 enters the mixed skill round. Each
challenge round contains one 1v1, angle, rebound, sweeping, distribution and
possession-change case. Prompts describe facts instead of naming the answer.
Normal launches use fresh entropy; explicit --seed and default smoke remain
reproducible. Original audio, faces, retries and first-attempt stars remain.

| Scenario / invariant | Executable evidence |
|---|---|
| 18 distinct challenges, valid three-choice pictures | `test_eighteen_match_situations_have_three_choices_and_different_decisions` |
| Six different match themes per round | `test_every_match_round_covers_six_distinct_match_themes` across 60 seeds |
| Every authored case and answer position reachable | `test_shuffling_reaches_all_challenges_and_every_answer_position` |
| Differentiate dribbling, a free touch and a shot | `test_controlled_dribble_keeps_the_ball_and_avoids_player_overlap`; authored catalog review |
| Proactive sweep only when clearly first; area determines hands/feet | `test_proactive_sweeps_have_a_clear_head_start_and_use_legal_tools` |
| Ground clearance waits for the kicking action, travels wide | `test_outside_clearance_uses_feet_and_goes_wide` |
| Attacker reaches rebound before kicking the second shot | `test_rebound_shot_waits_until_the_opponent_reaches_the_ball` |
| Moving player closes a lane; interception stays on the segment | `test_moving_player_closes_one_lane_before_the_choice`; `test_interceptions_only_happen_between_the_ball_and_recipient` |
| Cues do not state the preferred action | `test_challenge_cues_do_not_name_the_preferred_action` |
| Every wrong action differs from the independent correct demo | `test_correct_and_wrong_match_actions_render_separately` |
| All three actions, contact sounds, no duplicate events | `test_all_match_actions_show_motion_and_contact_sounds_at_the_right_time` |
| Third-choice key, six menu keys, fresh seeds | `test_match_keys_three_and_six_and_unseeded_launches` |
| Every catalog screen/action stays within text bounds | `test_every_picture_and_pose_renders_with_all_visible_choices` |
| Ball does not obscure Luke's face; jumping shadow stays grounded | `test_match_decision_ball_does_not_cover_lukes_face`; `test_an_early_jump_keeps_its_shadow_on_the_ground` |
| Original scoring/replay/retry/mute/faces/CLI | Existing session, animation, audio, UI and main suites retained |

## RED findings and resolved failures

- New feature tests first failed because no match cases existed. The added
  cases then exposed missing third-choice input, menu and per-case rendering.
- A controlled-dribble error initially detached the ball from the attacker and
  moved Luke onto their position. Regression failures led to shared, independent
  opponent/ball facts and a visible stopping gap.
- A rebound initially started its second shot before the attacker arrived.
  Regression now keeps the ball still until the kicking player reaches it.
- Sweeping initially moved the ball without a kicking pose; a regression now
  requires grounded contact and delayed release. The new frames are sampled
  at the kicking time in the all-catalog rendering test.
- Visual review found a close shot obscuring Luke's face, area labels crossing
  actor labels, and an early-jump shadow floating with the body. Corrected
  decision timing, placed the area label in a stable corner with a background,
  and kept the shadow on the ground. Face-clearance and shadow tests first failed.
- Seed 0 originally drew three similar 1v1 pictures in one round. A failing
  six-theme regression replaced the three-defending/three-playing sampler with
  one case from each theme. All 18 cases still appear across seeds.
- An optional selected-action key caused a Pyright error in failure notes;
  missing selection now gives a generic explanation. Complete coverage caught
  unexercised invalid-data, interception and drawing paths; meaningful edge-case
  and real rendering/contact checks closed those gaps without weakening gates.

The five applied and killed mutants skip wrong-choice playback, overwrite stars
on retry, ignore choice three, use hands for an outside-area sweep, or reveal
the coaching halo before selection. They execute in isolated temporary copies;
the live sources are never mutated. All original sound/release assertions remain.

## Visual review, sensors and modularity

Inspected real SDL renders in `/tmp/luke-match-review/`: all original 12 challenge
choices, the six added 1v1/sweeping choices, error/correct poses, six-card menu,
five-skill summary and the final `final-scenes.png` showing shot-ready, wide 1v1,
foot clearance and recovery. The final collage confirms the ball and labels
stay clear of Luke's face/name. These are local review artifacts, not runtime
assets; full-catalog controls/layout tests exercise both basic choices and all
three match choices.

- **Clean executable sensors:** tests, measured coverage, types, source hygiene,
  boundaries, complexity budgets (60 function lines / 15 decisions), five
  mutations, shuffled repeat and actual SDL execution.
- **UNAVAILABLE:** editor diagnostics baseline and final per-file calls all
  returned HTTP 401. Independent tests/types are substitutes for some feedback,
  not proof that the editor service is clean.
- **SUBSTITUTED:** unchanged John stdlib sensors for coverage.py/Ruff; deterministic
  geometry/seed invariants for Hypothesis; five scripted mutations for a general
  mutation framework. Their rules/inputs are narrower. Complete coverage means
  measured statements/conditional edges, excluding documented annotation and
  identity guards. Known-bad hygiene/boundary/type/layout controls reject errors.
- Semantic review: match facts/groups live in match_content.py; match_motion.py
  owns pure actor/ball motion, while animation.py dispatches existing versus
  match flows. Frame moved into model.py and remains imported by animation.py.
  Session owns selection/scoring; UI owns controls and audio event thresholds;
  drawing reuses people/faces. Correct trajectories use scene facts independently
  of the answer key. There is no runtime dependency on John's game. New pure
  modules are included in type/coverage/boundary checks.
- No new dependency, installation, network capability, secret access or saved
  player data. Fresh seeds use standard-library entropy. Generated images/tones
  stay local; optional CLI screenshot output is unchanged. New-dependency audit
  is N/A because no dependency was added. No physical performance/version-matrix
  guarantee was introduced.

## Practical limits

The six-year-old format adapts only simple reading, positioning and balance
principles from the primary FIFA/IFAB references in README.md. The elite FIFA
examples are not presented as an age-six lesson plan. Standing collection,
shots and safe gaps are simplified teaching illustrations, not collision or
catching physics, a promised completed pass, or a full real-match assessment.
Actual fun/difficulty still needs Luke's play feedback; case counts and tests
do not prove engagement.

Audio was tested through the real Pygame mixer with SDL dummy audio; physical
speakers were not auditioned. The editor service remains unavailable (401).
The existing AVX2 Pygame build warning persists; execution succeeds.
