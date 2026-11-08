# Evidence Report -- 2016 Public-index Coverage Expansion (Tier 2)

Current report: 2026-11-08. Earlier implementation evidence below is historical.
The public index was compared with the actual previous 36-scene / seven-card
game, not merely with its 23 grouped curriculum tags. The new manifest has
57 leaf entries: 56 original adaptations and one explicit physical-heading
deferral. Added 29 tactical scenes and 24 activity/information cards; current
combined totals are 65 unique scenes / 195 choices and 31 unique cards.
Zero chapter bodies were obtained or verified. This establishes indexed-topic
adaptations, not coverage of every case, drill or detail inside the book.

- Spec approval: not separately obtained for the expansion test list; autonomous
  execution under the user's instruction, with correspondingly weaker confidence.
  The earlier implementation approval does not imply approval of this revision.
- Contract: `SPEC.md`, coverage expansion and subsequent ordinary-pass clarification.
- Source SHA256, excluding this report, bytecode and `.verification`:
  `f97af2f72f1c1f25b45baaccc82baa15df1f033a8b7a9aa8925311b676425572`.
- Toolchain: Python 3.14.4, Pygame 2.6.1, cached Pyright 1.1.399.
- No packages installed, dependencies added, commits created or runtime network
  capabilities introduced. Runtime activity remains offline and unpersisted.

## Reproduce the current verification

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smart.verify
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smarter.verify
git diff --check
```

The first command is the persisted entry point for all applicable package
layers; the second verifies the adjacent game's use of shared primitives.
Machine-readable results, actual subprocess commands and coverage are in
`.verification/report.json` and `.verification/coverage.json` after each run.

## Expansion contract to executable checks

| Behavior or invariant | Test or gate | Result |
| --- | --- | --- |
| Exactly 57 leaves, page locators, honest provenance and a deferred heading entry | `test_every_index_entry_has_a_visible_destination_or_explicit_deferral`, `test_exact_public_locators_and_no_dangling_destinations` | pass |
| Every indexed topic reaches real content through the seventh menu; original six entries retained | `test_all_fifty_seven_entries_reach_real_play_or_unscored_information`, `test_separate_seventh_menu_entry_preserves_original_six_actions` | pass |
| 29 added scenes in 14 context-sensitive tactic families | `test_added_strategy_pairs_have_real_changed_context` | pass |
| Release-time offside, level and behind-ball positions, direct-throw exception | `test_offside_at_release_and_direct_throw_exception` | pass |
| M waits while an offside receiver resets before an ordinary pass | `test_ordinary_pass_waits_while_offside_receiver_resets` | pass |
| Interceptions lie on the actual cross/cutback, two-leg returns and actor endpoints agree | `test_cross_and_cutback_interceptions_are_on_the_actual_delivery`, `test_added_scene_motion_and_two_leg_return` | pass |
| Distinct curved/aerial/bouncing/volley card motion; physical contact unscored | `test_physical_cards_have_correct_contact_points_and_distinct_motion` and card/source review | pass |
| Custom rounds retain first-attempt scoring, shuffle actions and reject empty playlists | `test_custom_round_retains_scoring_and_rejects_empty_inputs`, `test_book_rounds_shuffle_actions_without_changing_their_ratings` | pass |
| Authored rule and touchline geometry cannot be scaled into invalid transfer layouts | `test_book_pictures_keep_their_authored_rule_and_touchline_geometry` | pass |
| Pagination, resizing, card fallback and every new choice/phase fit | five `BookUITests`, including `test_all_added_scenes_render_all_choices_and_phases` | pass |
| Coverage ledger matches the live manifest; incorrect destinations are rejected | `verify.check_book_ledger` and deliberately corrupted row control | pass |
| Original 36 scenes / seven cards stay byte-identical | `content.py` SHA256 gate | pass |
| Original scheduling, retry, feedback, coach and six original menu actions remain usable | original 33 tests, with the menu count explicitly extended from six to seven | pass |

## Fresh gauntlet results

All package numbers below come from the final entry-point run, after the
ordinary-pass timing correction and specification clarification.

| Layer | Command or entry-point gate | Actual result |
| --- | --- | --- |
| Full suite | Smart verifier: `tests_and_coverage` | 52 passed, zero failures/errors; pre-change baseline 33 passed |
| Runtime coverage | Smart verifier: `tests_and_coverage` | 1062/1062 statements and 1054/1054 conditional edges across 13 modules |
| Lint, boundaries and complexity | Smart verifier: `lint_boundaries_complexity` | 27 Python files, zero violations; <=60 function lines / <=15 decisions |
| Documentation and topic ledger | Same static gate | eight docs, 40 local links, 57 entries / 56 adapted / one deferred / zero chapter bodies verified; bad-row control rejected |
| Static types | Smart verifier: `types` | Pyright 1.1.399, 13 files, zero errors/warnings; bad-type control rejected |
| Mutation | Smart verifier: `mutation` | 11/11 applied, executed and killed, including missing topic, incorrect offside line and broken pagination |
| Suite health | Smart verifier: `suite_health` | 52 repeated tests in shuffled order, zero failures |
| SDL real execution | Smart verifier: `real_execution` | Smart and John smoke exit 0; feedback screenshot generated |
| Adjacent game compatibility | `PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smarter.verify` | 50 tests; 683 statements / 716 edges, zero missing; seven typed files, zero errors/warnings; 6/6 mutants; all gates pass, exit 0 |
| Adjacent real execution | Smarter verifier: `real_execution` | Smarter, Smart, John and Luke smoke exit 0 |
| Whitespace | `git diff --check` | exit 0 |

## Final sensors, substitutions and limits

- CLEAN: statement/conditional-edge coverage, AST lint, import boundaries,
  complexity, cached static types, mutation, shuffled suite, documentation
  links, runtime destination ledger and `Painter.errors` layout checks. Existing
  known-bad controls remain active; the added ledger control fails on a missing
  card reference. Full coverage is of modeled behavior, not proof of soccer judgment.
- CLEAN: 54 John/Luke files and the original Org prefix pass exact preservation
  gates. This task makes no Org edit. Original Smart content SHA256 remains
  `8c797af7fefc30bc1befb7bed4c340e8f40f2ce84e76daf05e63a7a8e3494f60`.
- UNAVAILABLE: editor diagnostics baseline. Repeated MCP attempts returned
  `baseline_unavailable` (seven of nine buffers checked; Smart `content.py` and
  `soccer_strategy/app.py` have no active backend). Per-file post-edit queries
  returned `no_baseline`; this is not reported as a clean editor sensor.
- SUBSTITUTED: repository-standard AST checks for standalone Ruff formatting,
  deterministic invariant loops for Hypothesis, and scripted mutants for
  mutmut. Each executes real source; these do not cover every formatter rule,
  generated input or possible mutation.
- N/A: dependency installation/license delta, network/database/concurrency and
  benchmark gates: no new dependencies, capabilities or performance contract.
- Manual visual review: nine actual SDL screens in `/tmp/soccer-smart-review/`
  (menu, categories, last skill page, inside bend, heading information, behind-ball
  offside decision/feedback, give-and-go and volley) were rendered and inspected.
  Automated UI checks cover all 57 destinations and every added choice/phase.
  Headless review does not replace child playtesting or observation of technique.

## Maintainability and failures resolved

The manifest owns topic-to-runtime mappings; book tactics/cards own original
content; the book browser owns navigation. Existing sessions, scoring,
presentation helpers and painting are reused. Model additions are optional;
pure content/domain layers retain enforced independence from Pygame. The
cross-file change is justified by entry-level navigation, extra trajectory
types and authored rule lines; original lesson data is not duplicated.

Observed RED checks included the missing leaf manifest and seventh menu,
cutback/interception geometry, missing custom-round choice shuffle, inconsistent
coach clearance height, and an accepted ordinary-pass reset that released too
early. Each was corrected with a focused regression. A Python 3.14 conditional
inside a generator was computed before iteration so coverage reflects one
explicit choice; the coverage sensor was not weakened.

The adjacent Smarter verifier initially rejected its frozen shared `quality.py`
fingerprint, despite passing gameplay tests. Only its `SPEC.md` checkpoint and
explanation were changed by this task. The shared delta adds four coverage
modules and three pure-module boundary entries; enforcement algorithms are
unchanged. The old digest is retained in that amendment, and the new exact
fingerprint passes the complete Smarter gauntlet. Other concurrent Smarter work
is outside this task; its initial snapshot cannot prove it remained unchanged.

The source notes and `BOOK_COVERAGE.md` preserve the central evidence limit:
all new adaptations are ORIGINAL / INDEX_ONLY / FULL_TEXT_PENDING. Public index
coverage cannot establish full fidelity to unseen chapter text. Heading remains
an information-only deferral. Other physical and profile cards illustrate
original activities rather than assess biomechanics or reproduce biographies.

## Historical first implementation evidence

- Spec approval: obtained (user explicitly approved the Q1-Q3 recommendations and executable SPEC in [SPEC.md](SPEC.md) on 2026-11-07)
- Source state: package SHA256 `75f1db92c5af42f806cee4f907d013e3a3dff8fd567eac8cba39c52ca9429379` (all tracked files in `soccer_strategy/soccer_smart/` excluding `EVIDENCE.md`, `.verification/`, and `__pycache__/`)
- Toolchain: Python `3.14.4`, Pygame `2.6.1`, Pyright `1.1.399`
- Entry point: `PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smart.verify`

## Spec to test mapping

| Scenario or invariant | Test or layer | Status |
|---|---|---|
| `context_changes_decision` (36 scenes, 12 topics, 4 sections, reading budgets, variant contrasts) | `CatalogTests.test_catalog_contains_thirty_six_valid_scenes_and_seven_cards`, `CatalogTests.test_context_changes_decision_across_topic_variants`, `CoachingTests.test_twelve_worked_a_examples_match_scenarios_specification`, `CoachingTests.test_multiple_outfield_roles_and_independent_choice_reasons`, `CoachingTests.test_loose_ball_and_interception_distances_support_grades` | pass |
| `paths_match_intent` (interpolation, contact-timed release, static non-moving actors, coach path) | `CatalogTests.test_paths_match_intent_and_contact_timing` | pass |
| `decision_has_no_answer_leak` (hover shows chosen gold route only; no coach or shot-window leak) | `UITests.test_decision_has_no_answer_leak_and_hover_shows_chosen_route` | pass |
| `round_has_held_out_variants` (6 practice + 2 held-out transfer layouts in section and mixed modes) | `SessionTests.test_section_rounds_schedule_six_practice_and_two_held_out_transfers`, `SessionTests.test_mixed_rounds_cover_all_four_sections_with_held_out_transfers`, `ModelTests.test_valid_scenario_and_transfer_preserve_base_id_and_angles` | pass |
| `retry_preserves_first_attempt` (first-try score kept across retry and coach comparison; invalid input rejected) | `SessionTests.test_flow_coach_comparison_and_retry_preserve_first_attempt`, `SessionTests.test_complete_round_reaches_summary_and_rejects_bad_ticks`, `SessionTests.test_deterministic_seed_and_invalid_stage_rejection` | pass |
| `practice_cards_unscored` (7 technique/adult cards browse, replay, and animate without overflow) | `UITests.test_practice_cards_browse_replay_and_render_without_overflow`, `CatalogTests.test_practice_card_animation_endpoints` | pass |
| `provenance_is_honest` (23 theme groups with `INDEX_ONLY`/`OVERVIEW_ONLY` + `FULL_TEXT_PENDING`; `ORIGINAL` scenes) | `CurriculumTests.test_twenty_three_theme_groups_have_honest_provenance`, `ModelTests.test_invalid_scenarios_and_transfer_scales_raise_value_error` | pass |
| `real_controls_and_layout` (all 36 scenes, 108 choices, 7 cards render without overflow; headless SDL smoke) | `UITests.test_every_authored_scene_and_choice_renders_without_overflow`, `UITests.test_feedback_shows_routes_window_coach_demo_and_comparison`, `UITests.test_keyboard_round_summary_resize_and_quit`, `MainTests.test_real_smoke_with_and_without_screenshot` | pass |
| `preserve_existing_games` (54 John/Luke files and 33741-byte Org prefix preserved) | `verify.static_checks` (`_check_docs_and_preservation`) and `verify.real_execution` (`python3 -m soccer_strategy.john --smoke`) | pass |

## Fresh gauntlet results

| Layer | Command | Numeric result |
|---|---|---|
| Tests | `PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smart.verify` (`tests_and_coverage`) | 33 passed, 0 failed, 0 errors |
| Changed-line and branch coverage | `PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smart.verify` (`tests_and_coverage`) | 721/721 statements (100%), 530/530 branch edges (100%) across 9 runtime modules |
| Static types | `pyright --project soccer_strategy/soccer_smart/.verification/pyrightconfig.json --outputjson` | 9 files analyzed, 0 errors, 0 warnings; negative control rejected (exit 1, 1 error) |
| Lint, boundaries, docs, preservation | `PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smart.verify` (`lint_boundaries_complexity`) | 21 Python files (0 violations, <= 60 lines/fn, <= 15 decisions/fn), 7 docs, 31 local links resolved, 54/54 John/Luke files unchanged |
| Mutation testing | `PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smart.verify` (`mutation`) | 8/8 mutants applied, executed, and killed |
| Suite health (shuffled repeat) | `PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smart.verify` (`suite_health`) | 33/33 repeated tests passed in randomized order, 0 failures |
| Real execution | `python3 -m soccer_strategy.soccer_smart --smoke --screenshot .verification/feedback.png` and `python3 -m soccer_strategy.john --smoke` | Exit 0 for both; `feedback.png` (1280x880) generated and visually inspected |
| Git whitespace check | `git diff --check` | Exit 0 (0 whitespace issues) |

## Sensor status

| Sensor | Final status | Baseline or trend | Notes |
|---|---|---|---|
| `Coverage` (statement + bytecode branch edges) | clean | 721/721 statements, 530/530 edges | Negative control verified in `QualityTests.test_coverage_rejects_unexecuted_branch_and_accepts_both` |
| `lint` and `boundaries` (AST quality + module imports) | clean | 0 violations across 21 `.py` files | Negative controls verified in `QualityTests.test_lint_and_boundaries_negative_controls` |
| `pyright` static type gate | clean | 0 errors, 0 warnings across 9 runtime modules | Known-bad type assignment control rejected with exit 1 |
| `Painter.errors` text-overflow sensor | clean | 0 overflows across all 36 scenes, 108 choices, 7 cards | Negative control verified in `UITests.test_drawing_primitives_and_overflow_sensor` and `MainTests.test_smoke_rejects_font_boundary_that_makes_text_overflow` |
| Existing-game and Org prefix SHA256 sensor | clean | 54/54 files and 33741-byte prefix exact match | Verified on every `verify.py` run |
| Editor MCP diagnostics (`diagnostics_baseline` / `get_diagnostics`) | unavailable | `baseline_unavailable` / `no_baseline` | `diagnostics_baseline` returned `baseline_unavailable` because stale buffer `soccer_strategy/app.py` has `no_active_backend`; touched files in `soccer_smart/` are not open in Emacs (`buffer_not_open`), while open buffers (`README.md`, `task_20261026_soccer_strategy_game.org`) report `flycheck` state `ready` with 0 diagnostics |

## Maintainability review

- **Semantic duplication**: None found. Curriculum metadata (`curriculum.py`), immutable geometry/validation (`model.py`), authored scene/card data (`content.py`), catalog construction (`catalog.py`), session state (`session.py`), animation interpolation (`presentation.py`), and Pygame rendering (`drawing.py`, `app.py`) each have a single authoritative module.
- **Responsibility placement**: Domain and session modules (`curriculum.py`, `model.py`, `content.py`, `catalog.py`, `session.py`, `presentation.py`) have zero Pygame dependencies, enforced by `boundaries()`.
- **Dependency direction**: Strictly layered (`curriculum` -> `model` -> `content` -> `catalog` -> `session`/`presentation` -> `drawing`/`app` -> `main`), with no circular imports or cross-imports into `soccer_strategy/john` or `soccer_strategy/luke`.
- **Change radius and consistency**: All changes are scoped to `soccer_strategy/soccer_smart/` and the requested result sub-heading at the end of `.ai.code.files/task_20261026_soccer_strategy_game.org`.
- **Sensor trade-offs or justified exceptions**: None.

## Layers not run as specified

- **UNAVAILABLE**: Editor MCP `diagnostics_baseline` returned `baseline_unavailable` (6 of 7 open project buffers had active Flycheck backends; stale buffer `soccer_strategy/app.py` had `no_active_backend`). Subsequent `get_diagnostics(since="baseline")` calls on touched files were executed as required and returned `no_baseline`. Independent static analysis (`pyright`, AST `lint`, `boundaries`, and `git diff --check`) ran cleanly, but editor diagnostics are honestly recorded as unavailable rather than clean.
- **N/A**: Network, database, concurrency, and external dependency supply-chain gates (offline standard-library + existing Pygame package with zero new dependencies).

## Honest notes

- **Failures encountered and resolved during verification**:
  1. Python 3.14 colorized `unittest` output in subprocesses when `NO_COLOR`/`PYTHON_COLORS` were unset, inserting ANSI codes into `FAIL:`; fixed in `verify.execute()` by setting `NO_COLOR="1"` and `PYTHON_COLORS="0"`.
  2. One invalid-choice test in `test_model.py` initially replaced `choices[0]` (the only `rating=2` choice), triggering the scene-level `any(c.rating == 2)` check before `Choice.validate()`; fixed by mutating `choices[1]` so `Choice.validate()` branch edges are 100% exercised.
  3. Visual inspection of `.verification/feedback.png` showed the `ATTACK GOAL` label touching the top goal crossbar and `A`/`A2` close to `JOHN`'s label in `T02.C`; adjusted `ATTACK GOAL` label placement in `drawing.py` and `T02.C` actor spacing in `content.py`, then re-verified `feedback.png`.
- **Remaining risks**:
  - Book connections (`G01`..`G23`) remain mapped to the public catalog index (`INDEX_ONLY` / `OVERVIEW_ONLY` + `FULL_TEXT_PENDING`); chapter bodies have not been verified against a physical copy of Andrew Latham's 2016 book.
  - All 36 tactical scenes and 7 practice cards are authored teaching illustrations (`ORIGINAL`), not a physical ball-contact simulation or a substitute for on-field coaching and child playtesting with John.
