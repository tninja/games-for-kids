# Current evidence - Defend shooting

The user authorized more dangerous-zone shooting cases and a section named
`Defend shooting`. SPEC.md records this follow-up scope before implementation.
There are now six sections, 32 topics, 96 pictures and 288 choices. Section 2
contains topics 4, 11, 12, 18, 28, 31 and 32: seven topics / 21 base pictures.
No separate spec-approval round was requested for this authorized follow-up.

## Fresh verification

Command from the repository root:

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.verify
```

Exit **0**. One fresh final run reported:

| Gate | Result |
|---|---|
| Tests | 76 passed, zero failures/errors |
| Measured statement coverage | 687/687 |
| Measured conditional-edge coverage | 538/538 |
| Hygiene, boundaries, complexity | 20 Python files, zero violations |
| Types | Nine runtime modules, zero errors/warnings; bad-type control rejected |
| Scripted mutation | 5/5 applied and executed mutants killed |
| Shuffled repeat | 76 tests, zero failures |
| Real SDL execution | Menu, choice, feedback, retry and quit passed; exit 0 |

Toolchain: Python 3.14.4, Pygame 2.6.1, SDL 2.32.10, Pyright 1.1.399.
Source SHA256: `29f9dcc38b9f33002678018463e8cccebc0e7822c3b4e7a3205cf58721599086`.
Catalog SHA256: `3e9402522638316cab403a3ba14accdcb2cce6b5d0b0181c7c341e00ca97bb79`.
Previous catalog SHA256: `d54652c85edd4903636166311adf8c8f128679346f008fa53491a62eee5df31b`.
The verifier report and screenshot are in `.verification/`.

## Specification and evidence mapping

| Requirement | Executable evidence |
|---|---|
| Setup touch, shooting preparation and reachable loose touch require different decisions | `test_shooting_choices_change_with_setup_swing_and_exposed_touch` |
| Preferred blocks lie on the ball-to-goal line and are closer than the ball | `test_new_shot_blocks_are_reachable_on_the_ball_to_goal_line` |
| M's actual cover determines whether John faces A or watches R | `test_shooting_help_uses_actual_cover_and_keeps_the_runner_visible` |
| Shooting topics share a named menu section | `test_direct_shooting_threats_share_a_named_section`, menu rendering test |
| Six practice cases, two held-out layouts, all topics reachable | Existing session invariants across all sections and 20 seeds |
| Every case/choice fits and renders | Existing complete-catalog rendering and text-bound tests |

RED: the new tests first failed because no added pictures or named section
existed. A second visual regression failed at a four-unit pressure gap. New
pictures now use six units to keep preferred pressure sprites distinct; these
are illustration coordinates, not distances to teach on a real pitch. All
pre-existing routes keep their previous gap. The focused coaching/catalog/session
run then passed 48 tests, and curriculum/UI checks passed 21 tests.

An independent before/after comparison confirmed that all 90 previous records
keep their facts, ratings, feedback and routes when section membership is
excluded. Document checks matched all 96 review rows and 288 options to runtime,
verified 32 Org topic rows and local links, and retained the Design/Coding
headlines. All six added decisions and preferred feedback, plus the reorganized
menu, were rendered and visually inspected after the final pressure-gap fix.
Manual images: `/tmp/soccer-shooting-review/`.

## Final sensors, modularity and limits

- Computational gates above are clean against the final source. `git diff
  --check` also passed. Editor MCP baseline and per-file diagnostics returned
  HTTP 401 and are **UNAVAILABLE**, not clean. Python types and execution are
  independent checks and do not replace editor-service coverage.
- **SUBSTITUTED:** the existing stdlib coverage/source-hygiene gates substitute
  for coverage.py/Ruff, deterministic layout/seed invariants for Hypothesis,
  and five scripted mutants for a general mutation framework. Their existing
  negative controls execute; their coverage is narrower than those full tools.
- Content remains authored facts in content.py; curriculum.py owns membership;
  catalog.py resolves the contextual block label, runner visibility and pressure
  gap. No UI-specific topic list or second scoring path was introduced. The
  small pressure-gap field belongs with scene geometry and defaults to the old
  value, preserving old routes. Tests hard-code the requested shooting membership
  as an independent acceptance condition. No dependency or capability change.
- The ordinary motion drawing and all-choice rendering are tested; an image
  cannot certify a real child's tackling technique or time to reach a ball.
  Short passes remain attempts, M's cover remains fallible, and shots/blocks are
  illustrative outcomes. The existing Pygame AVX2 performance warning is
  unchanged. No unrelated repository game tests were rerun.

---

# Archived evidence - complete case and answer audit

The user requested careful review of all cases and choices, with correction of
errors. The append-only [SPEC.md](SPEC.md) records this authorized scope and the
final visual finding. No separate approval was requested for these scoped fixes.
There are still six sections, 29 topics, 87 pictures and 261 choices.

## Football findings

All 87 preferred action keys are retained. Only two grades changed:
09.1/cover and 10.3/cover, both from reasonable (1) to risk (0). Their actual
routes abandoned the free far-side runner or went toward an already beaten M.
The final catalog contains 87 preferred, 71 reasonable and 103 risk options.

Corrections include the body/ball order during shielding, the pressure
demonstration, visible support in 07.2, the loose-ball state in 18.3 and M's
miscontrol origins in 27.1-27.3. All 174 non-preferred options now explain their
own picture, replacing generic warnings plus the preferred answer. A short pass
still requires a ready receiver and support afterward; a long kick promises no
reception. Slides remain conditional on a reachable ball and a safe route.

[COACHING_REVIEW.md](COACHING_REVIEW.md) publishes all 87 observations and all
261 graded choices with their explanations, the exact findings, and primary
FA/FIFA/IFAB references. These sources support the principles, not individual
coordinates or a guarantee that a preferred action is optimal in every real match.
The complete table is generated from the reviewed data, not independent proof.

## Fresh final verification

Command actually run from the repository root:

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.verify
```

Exit status: **0**. All six declared local computational gates passed.

| Gate | Final result |
|---|---|
| Full soccer suite | 64 passed, zero failures/errors |
| Runtime statements | 656/656 measured statements covered |
| Runtime conditional edges | 506/506 measured edges covered |
| Types | Nine modules; zero errors/warnings; bad assignment rejected |
| Source hygiene, architecture, complexity | 20 Python files; zero violations |
| Scripted mutation | 5/5 applied, executed and killed by assertion failures |
| Shuffled repeat | 64 passed, seed 734 |
| Real SDL execution | Exit 0; menu, choose, feedback, retry, screenshot and quit |
| UI regression | All 87 pictures and three choices render without overflow |

Toolchain: Python 3.14.4, Pygame 2.6.1, SDL 2.32.10 and cached Pyright 1.1.399.
Pyright uses explicit interpreter paths/typeshed and Python 3.13 type mode;
actual execution uses Python 3.14. The generated .verification/report.json
records eight subprocess argument lists, working directories, exit codes and
all in-process gates. Deliberate type errors and five mutants must exit nonzero.

Final source SHA256:
`10ac05996b0c705bc3e9299929fb5b452002f395b91331d94c68f6a1d753a3d5`.

The hash uses sorted package-relative paths plus bytes, excluding EVIDENCE.md,
generated .verification files and bytecode caches. The archived evidence is
included. Runtime, tests, spec and other docs were finalized before this run.

Reviewed case-content SHA256, excluding only section membership:
`1bcb7399799f74e6eaf725d894d5dbf666441d8cffd635c78e8e6aef421b14ae`.
The new baseline intentionally includes the requested coaching corrections.
SPEC.md retains the old hash and the exact authorized changes. Updating this
snapshot does not establish the correctness of the judgments inside it.

## Specification to regression mapping

| Requirement | Test |
|---|---|
| Body between A and ball; no touch toward A | test_shield_places_body_between_a_and_ball |
| Do not reward the two abandoned-threat routes | test_support_choices_do_not_abandon_the_live_threat |
| Specific explanation for every non-preferred option | test_all_nonpreferred_choices_have_picture_specific_feedback |
| Claimed support, loose rebound, miscontrol origin visible | test_named_support_and_loose_touch_are_visible |
| Pressure pose does not run A through John's stop point | test_pressure_demonstration_keeps_the_carrier_at_the_pictured_ball |
| Unintended future catalog drift detected | test_reviewed_content_matches_persisted_baseline |
| Six-plus-two, distinct and deterministic sessions | test_stages_and_seed_are_deterministic |
| All scenes/actions and feedback fit the window | test_real_render_for_every_scene_and_choice |
| Passes, slides, keeper throws, interceptions and clearances | Existing catalog/coaching/session suites |

All five new regressions first failed on the original behavior, then passed
after correction. The old snapshot failed when content intentionally changed;
it was refreshed visibly and the test renamed to describe the reviewed baseline.
No assertion was removed, no coverage threshold was lowered, and no mutant was
removed. First-attempt scoring, retries and the section scheduler are unchanged.

The property sweep still constructs 240 sessions (six sections, 20 seeds, two
repetitions), checks uniqueness, transfer/practice separation, section membership,
determinism and reachability of all topics.

Additional commands actually run:

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m unittest soccer_strategy.test_coaching -q
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m unittest discover -s soccer_strategy -t . -q
git diff --exit-code HEAD -- '*.py'
```

The coaching suite finished with 24 passing tests; the final ordinary full suite
had 64 passing tests. Existing tracked Python files match HEAD. Five focused
RED runs are described above; the exact unified final results supersede all
intermediate counts. Earlier evidence is in EVIDENCE_HISTORY.md.

## Visual and document checks

All 87 decision pictures were rendered in six section sheets and visually
inspected. Full-size support, rebound, keeper shielding, teammate miscontrol,
sliding and long-kick examples were checked. After the final pressure fix,
the pressure and risk-feedback screens were rendered and inspected again.
Artifacts are under /tmp/soccer-answer-audit/. The final SDL smoke screenshot
is generated separately at .verification/feedback.png.

Independent document checks verified the original Org headlines, all 29 topic
IDs exactly once, local file links and exact agreement of all 261 published
choice labels and explanations with the game. The before/after inventory
confirmed that no other grades or preferred action keys changed.

## Sensors, modularity and limits

- **Clean:** tests, coverage, cached types, source hygiene, boundaries,
  complexity, mutation, repeat and real execution in the final run.
  Statement coverage is complete for the measured runtime; conditional-edge
  coverage excludes compiler-generated annotation/builtin-identity machinery.
- **UNAVAILABLE:** editor MCP baseline coverage remains incomplete because app.py
  lacks an active checker. Per-file Python/new-document requests remain unavailable
  when buffers are not open or lack a checker. Org and SPEC are clean. This does
  not meet the editor harness's complete-clean done-condition.
- **SUBSTITUTED:** stdlib coverage/source hygiene replace unavailable coverage.py
  and Ruff; deterministic generated cases replace Hypothesis. Known-bad controls
  verify declared failure paths, not every possible style defect or input.
  Pyright provides independent types, not a substitute claim of editor-MCP clean.
- Repository-wide unrelated game tests were not rerun; earlier baseline failures
  and interactive limitations remain in the archived evidence. No existing
  tracked game source changed.
- Semantic review: notes live beside each Situation's independently authored facts
  and ratings. The catalog selects the chosen option's note; it does not derive
  facts from the grade. Shielding geometry belongs in action targeting. The
  pressure teaching pose belongs in presentation and is independent of grades.
  No new module boundary or duplicated membership table was introduced.
- The larger content file is intentional authored teaching data, not new control
  flow. No dependencies, installations, secrets, network/subprocess capabilities
  or persistent user data were introduced.
- The existing AVX2 Pygame build warning remains; real execution exits normally.
  Fixed route durations do not simulate movement speed, kick success or contact.
  The audit does not measure real-match improvement or certify physical tackling
  technique. Actual league release timing and team roles still require local
  knowledge. Reasonable options count positively; risky is not synonymous with
  illegal or certain failure.

## User-requested movement and arrow review

The movement contract is recorded in SPEC.md. Positioning actions now keep the
ball at the pictured location; this changes derived ball endpoints captured by
the catalog snapshot. Previous snapshot: `1bcb7399799f74e6eaf725d894d5dbf666441d8cffd635c78e8e6aef421b14ae`.
Current snapshot: `50bef7abc8cec9b0cf2c4f3122a052e72deef23a227d05188b2b018940c564ae`.

Regressions cover pass contact timing, ball stability during positioning,
fixed positions for non-selected actors, and the exact hovered arrow destination.
Existing tests cover clearance, slide and long-kick contact-before-release plus
all scenes' choice and feedback rendering. The arrow has a dark outline, distinct
route color and endpoint marker, and is drawn above the sprites. Outcome pictures
illustrate John's intent while other players hold their pictured poses; they do
not predict live play.

The editor diagnostics MCP did not provide a baseline for new Python files. Its
status is unavailable, not clean.

Final fresh command, run from the repository root:

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.verify
```

Exit status: **0**. All gates passed: 69 tests; 679/679 measured statements;
522/522 conditional edges; 20 Python files with zero hygiene, boundary or
complexity violations; nine runtime modules type checked with zero errors or
warnings and a rejected bad-type control; 5/5 applied-and-executed mutants
killed; 69 shuffled-repeat tests; and real SDL menu/choice/feedback/retry/quit.
The smoke screenshot is `soccer_strategy/.verification/feedback.png`.
Toolchain: Python 3.14.4, Pygame 2.6.1, SDL 2.32.10, Pyright 1.1.399.

Final source SHA256: `9d1adf243ceebc4ec79c25db5cc18146857094f1ddf2246a33d78f8ad556d516`.
Manually rendered examples (decision arrow, pass before/after contact, static
positioning ball, and long kick before/after contact) are under
`/tmp/soccer-movement-review/`; every example rendered without layout errors.

## User-requested age, format and teammate-error review

The current review includes 30 topics, 90 pictures and 270 choices. Topic 30
adds a distinct reaction to each turnover state: intercept a reachable pass,
recover goal-side when an opponent has controlled the ball and John is behind,
and press a nearby carrier when a teammate covers inside. Corrected the preferred
rating for 30.2, spaced the 30.1 attacker away from John, clarified the 30.3
rushed-tackle explanation, and added regression assertions for action order,
preferred rating and explanation. Existing teammate-miscontrol and unreliable
reception guidance remains in place. Seven-a-side build-out-line practice stays
explicit; open-play choices avoid assuming 9v9 formations or local rule details.

Full command:

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.verify
```

Exit status: **0**. Results: 72 tests; 684/684 measured statements and 534/534
conditional edges; 20 files with zero hygiene, boundary or complexity violations;
nine runtime modules type checked with zero errors or warnings; 5/5 mutants
killed; 72 shuffled-repeat tests; real SDL menu, choice, feedback, retry and quit
passed. Python 3.14.4, Pygame 2.6.1, SDL 2.32.10, Pyright 1.1.399. The existing
AVX2 Pygame build warning remains and did not prevent execution.

Current source SHA256: `d09e03f5b988b9a7d5c0d6de51468f23baf6596e7265599043b21cbc73f0a3bf`.
The authored-case snapshot is
`d54652c85edd4903636166311adf8c8f128679346f008fa53491a62eee5df31b`;
previous snapshot: `81ad3e50fb3e97d3a9e7c5016773c6bf4909021e5a1f3b732980354676d3276a`.
Editor diagnostics MCP is still unavailable for Python buffers without an active
checker; it is not reported as clean. This is a scripted teaching review, not
an independent coach certification or a measure of real-match improvement.
