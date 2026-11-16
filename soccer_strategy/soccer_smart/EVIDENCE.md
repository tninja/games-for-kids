# Evidence Report -- Continuous-case diversity (Tier 2, 2026-11-11)

This is the current report. All reports below it are historical. The user asked
for less repetitive continuous cases. The game retains 24 episodes, now with
197 decision nodes / 591 choices, eight opening action recipes (previously two)
and 13 good follow-up recipes (previously four). These are action-set counts,
not claims of 197 unrelated tactical situations.

- Authorization: explicit user request, with the previously approved eight
  families / three openings / two-to-three decisions preserved. The detailed
  diversity amendment in [SPEC.md](SPEC.md) was authored autonomously and was
  not separately approved; this limits the approval claim.
- Source SHA256, using `verify.source_hash()` and excluding this report,
  bytecode and `.verification`:
  `ebc59c99422701b5642dcacc92477da9d6ce48ebfc7c11aa002e715015819b6a`
- Toolchain: Python 3.14.4, Pygame 2.6.1, Node v24.21.0, Pyright 1.1.399.
- Reproducible entry point:
  `PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smart.verify`
- Final run log: `/tmp/smart-variety-final-complete.log`. Machine reports:
  `.verification/report.json`, `coverage.json`, `types.json`, `mutations.json`.
  The entry point correctly exits 1; the full gate is **not green**.

## Specification to executable checks

| Behavior | Tests / gate | Result |
| --- | --- | --- |
| Different tasks and useful follow-up recipes | `PlayDiversityTests.test_each_family_has_its_own_opening_decisions`, `test_good_followups_have_at_least_eight_different_decision_recipes` | 8 opening / 13 follow-up recipes |
| Thrower at touchline, lofted clearance, two-leg combination, action ownership | `test_repertoire_contains_actual_keeper_throw_cross_combination_and_clearance`, `test_releasing_actions_are_made_by_the_controlled_player` | pass |
| Each good changed second alternative has its own third state | `test_good_second_step_alternatives_have_their_own_continuations`, graph/selected-branch tests in `test_play.py` | pass |
| Different transition possession, correct holder cues and directional labels | `test_transition_variants_start_from_different_possession_situations`, `test_followup_cues_name_the_actual_receiver`, `test_named_switches_and_cutbacks_match_their_directions` | pass |
| Covered wide lanes allow waiting; one-two run clears the defender | `test_waiting_is_good_when_both_wide_delivery_zones_are_covered`, `test_one_two_run_goes_around_the_defender` | pass |
| Exact endpoint continuity, bounded paths, score/retry behavior | `test_play.py`, `test_play_web.js` | pass |
| Multiple valid choices, held opponent possession, actual motion, keeper-aware finishing | `test_play_coaching.py` and existing standalone coaching checks | pass |
| Desktop and web render every continuous node/choice/phase | `test_play_ui.py`, `test_play_web.py` | 197 nodes / 591 choices, zero layout errors |
| Original lessons, sibling games, export sync and coaching ledger | `verify.static_checks`, existing web export checks | pass |

RED evidence: the new structural tests initially rejected two opening recipes
and four good follow-up recipes. The independent second-alternative test caught
an uncontinued valid keeper outlet. The animated one-two regression caught a
run through the marker, fixed by routing the return around him. Later regressions
caught incorrect M/N ownership wording and a same-side pass labeled as a switch.
Switch targets now select the opposite flank; a pass to a winger ahead is no
longer described as a cutback. These tests failed on behavior before their fixes.

The append-only specification explicitly permits replacing superseded catalog
key/position assertions. Their safety constraints remain: good stationary
receiving is allowed, both legs of a combination are checked, airborne routes
are checked at ground proximity/landing, and original support, scanning and
keeper examples remain as independent fixtures. The shared `quality.py`
checker was not edited.

## Fresh final verification results

| Layer | Command or entry-point gate | Actual result |
| --- | --- | --- |
| Full suite | Entry point, `tests_and_coverage` | 95 tests in 117.907s; 94 pass, 0 assertion failures, 1 environment error |
| Shuffled-order repeat | Entry point, `suite_health` | 95 tests in 13.911s; same single HTTP error, no assertion failure |
| Static / architecture / complexity | Entry point, `lint_boundaries_complexity` | 40 Python files, 0 violations; <=60 lines/function, <=15 decisions; 10 docs, 54 links; 5 web assets synchronized |
| Type checker and bad-type control | Entry point, `types` | 20 files, 0 errors, 0 warnings; bad control rejected |
| Coverage snapshot | `coverage.json` from the final traced suite; independently asserted complete | 1600/1600 statements, 1576/1576 conditional edges, 20/20 modules; no missing lines/edges |
| Mutation checks | Entry point, `mutation` | 28/28 uniquely applied, executed and assertion-killed; original 24 retained plus 4 diversity/branch/flight/outlet mutants |
| Real execution | Entry point, `real_execution` | Smart SDL, John SDL and Node web smoke all exit 0 |
| Focused behavior suite | `PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m unittest soccer_strategy.soccer_smart.test_play soccer_strategy.soccer_smart.test_play_coaching soccer_strategy.soccer_smart.test_play_diversity` | 32 tests pass |
| JavaScript syntax | `node --check docs/soccer_smart/app.js` and `node --check docs/soccer_smart/data.js` | both exit 0 |
| Whitespace | `git diff --check` | exit 0 |

The integrated test/coverage gate stops before `Coverage.require_complete()`
because the HTTP test errors. Coverage numbers above describe the actual saved
trace, independently checked for the exact 20 expected module names and empty
missing-line/edge lists; they do not turn that failed gate into a pass. The
existing `test_quality.py` control rejects an unexecuted branch and accepts
both branches. Static ledger, type and export controls also reject bad inputs.
The final report source hash was checked against the current source, and all
28 mutation records were checked for applied/executed/killed flags and actual
assertion failures.

After this report-only edit, `verify.static_checks()` was rerun: 40 files,
0 violations, 10 docs, 55 links, all preservation/export/ledger checks pass.
`git diff --check` and both JavaScript syntax checks also exit 0. The source
hash is unchanged because the evidence file is excluded by definition.

An additional actual App/ContinuousSession walkthrough produced 31 SDL images
in `/tmp/smart-variety-screens`, with zero layout errors, including throw and
clearance flights, keeper recycling, overlap/cutback, one-two and counters.
Representative throw, wing third-step and one-two images were visually inspected.
Node tests exercise the real JavaScript runtime with a canvas/DOM boundary;
this substitutes for native browser/device testing, not for content logic.

## Final sensors, preservation and modularity

- Tests/suite health: **failed, unchanged environment restriction**.
  `test_local_http_serving_delivers_all_static_assets` raises exactly
  `PermissionError: [Errno 1] Operation not permitted` in `socket.socket` before
  a local server can start. The test remains enabled. Real local HTTP serving
  needs verification outside this sandbox.
- Editor diagnostics: **UNAVAILABLE**. `diagnostics_baseline` and per-file
  `get_diagnostics(since="baseline")` return HTTP 401, including final changes.
  No claim of editor diagnostic cleanliness is made; types/static checks pass.
- Native browser/device: **UNAVAILABLE / SUBSTITUTED** by Node geometry, UI,
  touch and mobile-state checks plus real SDL rendering. Firefox Snap cannot
  run here and Playwright is absent. Real child/device playtesting remains useful.
- Types, static boundaries, complexity, web sync, mutation and real execution:
  **clean** on the final implementation. No dependency, asset, network service,
  installation or new capability was introduced.
- Preservation: all 80 hashed source/doc files outside Smart/web scope match
  the pre-edit snapshot. The native gate also preserves 54 John/Luke files.
  Existing web starter/book scenes, cards, lessons, categories, groups,
  sections and version compare equal to HEAD. Org and Smarter are unchanged.
- Responsibility/dependencies: reusable pure geometry lives in
  `play_geometry.py`; task-specific content in `play_patterns.py`; graph
  construction/policies in `play_content.py`. Existing graph/session/scoring
  contracts are unchanged. The UI only shows phase-specific titles and task
  labels. Domain modules remain independent of Pygame, network and subprocess.
- Duplication/change radius: delivery grading and geometry are shared, while
  different tactical choices are authored per family. Existing support and
  pressure policies remain available and independently checked. Python is the
  only authored data source; the larger generated web diff is regenerated data.
  Shared drawing/quality code and other games are untouched.
- Limits: synthetic diagram clearances and authored outcomes are coaching
  approximations. The new small-sided, no-offside exercises are ORIGINAL;
  this change adds no claim of verified unseen book-body coverage.

Web artifact SHA256:

- `app.js`: `d3bfddd8396f15c11c98e4669b8cb50c4b1a3ca5b16df7ba7b0306a2939f39ea`
- `data.json`: `b2d0ffff7efbc3f347dd81cb827a430bfe9f9f4db2c1b5530a733302425d0e53`
- `data.js`: `d5d6a88db92a61ea9c8c330a36c8ce7509b0293a2739febd5b000c2af9568017`

---

# Evidence Report -- GitHub Pages Web Migration (Tier 2)

Current report: 2026-11-08. Historical coverage expansion and initial
implementation reports are preserved below.

- Spec approval: obtained for Q1-Q6 architecture/scope decisions in conversation;
  detailed scenario test list in [SPEC.md](SPEC.md) authored under the user's
  "yes. go ahead! also make sure we can locally test the page" and "use Uncle
  Bob's harness+" instructions.
- Source SHA256 (excluding `EVIDENCE.md`, bytecode, and `.verification`):
  `ad1d43f1c3619e6ce1722533bac9dbdb1e27fae49f9a7def5c2bce28dbafd8e3`
- Toolchain: Python `3.14.4`, Pygame `2.6.1`, Node.js `v24.21.0`, Pyright `1.1.399`
- Entry point: `PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smart.verify`
- Local web server: `python3 -m http.server 8000 -d docs` (or open
  [docs/soccer_smart/index.html](../../docs/soccer_smart/index.html) directly)

## Web migration contract to executable checks

| Scenario or invariant | Test or gate | Status |
| --- | --- | --- |
| `web_bundle_sync` (5 web files, ASCII/whitespace check, byte-exact `data.json` & `data.js` sync, negative controls) | `WebExportTests.test_committed_docs_bundle_is_complete_and_in_sync`, `WebExportTests.test_export_and_negative_controls_for_missing_whitespace_and_drift`, `verify.static_checks` | pass |
| `web_player_named_you` (controlled player labeled `YOU` with second-person grammar and zero occurrences of `John` in `docs/`) | `WebExportTests.test_committed_docs_bundle_is_complete_and_in_sync` and mutant `web export skips You personalization` | pass |
| `web_geometry_parity` (JS `positions`, `ballHeight`, `cardPositions`, `cardHeight`, `routeDestination`, `transferScene` match Python) | `WebExportTests.test_web_geometry_and_presentation_match_python` | pass |
| `web_ui_and_touch_controls` (all 7 modules, 65 scenes, 31 cards, 57 book entries render without overflow; touch two-tap preview/confirm; retry preserves first-try score; `localStorage`) | `WebExportTests.test_web_ui_touch_two_tap_book_and_local_storage`, `verify.real_execution` (`web_smoke_exit: 0`) | pass |
| `mobile_portrait_readability` (iPhone/mobile portrait mode crops `<canvas>` to `740x660` pitch region with HiDPI `devicePixelRatio` and renders native HTML text/buttons in `#mobile-panel` without `user-scalable=no`) | `WebExportTests.test_mobile_portrait_state_and_iphone_readability` | pass |
| `local_http_serving` (`ThreadingHTTPServer` serves all 5 static web assets with HTTP 200) | `WebExportTests.test_local_http_serving_delivers_all_static_assets` | pass |
| `preserve_existing_games` (54 John/Luke files, `content.py`, `drawing.py`, `quality.py`, and 33741-byte Org prefix preserved) | `verify.static_checks` (`_check_docs_and_preservation`) | pass |

## Fresh gauntlet results (2026-11-08 Web Migration)

| Layer | Command or gate | Numeric result |
| --- | --- | --- |
| Full test suite | `PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smart.verify` (`tests_and_coverage`) | 58 passed, 0 failed, 0 errors |
| Runtime & web-export coverage | `tests_and_coverage` | 1112/1112 statements (100%), 1090/1090 branch edges (100%) across 14 modules |
| Lint, boundaries, docs, web sync, preservation | `lint_boundaries_complexity` | 29 Python files (0 violations, <=60 lines/fn, <=15 decisions/fn), 8 docs, 47 local links, 5 web files in sync (65 scenes, 31 cards, 57 lessons), 54/54 sibling files preserved |
| Static types | `types` (Pyright 1.1.399) | 14 files analyzed, 0 errors, 0 warnings; bad-type negative control rejected |
| Mutation testing | `mutation` | 13/13 mutants applied, executed, and killed (including `web export drops book scenes` and `web export skips You personalization`) |
| Suite health | `suite_health` | 58/58 repeated tests in shuffled order, 0 failures |
| Real execution (SDL + Node web smoke) | `real_execution` | `soccer_smart` SDL smoke exit 0, `john` SDL smoke exit 0, Node `app.js` web smoke exit 0 |
| Whitespace check | `git diff --check` | exit 0 |

## Maintainability review (Web Migration)

- **Semantic duplication**: Python remains the single source of truth for all
  65 scenes, 31 cards, 57 book lessons, sections, and theme groups;
  [web_export.py](web_export.py) serializes them deterministically into
  `docs/soccer_smart/data.json` and `docs/soccer_smart/data.js`, verified on
  every `verify.py` run.
- **Responsibility placement**: [web_export.py](web_export.py) has zero Pygame
  or network imports (enforced by `boundaries()`), and the browser runtime lives
  cleanly under `docs/soccer_smart/` without altering any desktop Pygame module.
- **Dependency direction & change radius**: `drawing.py`, `quality.py`,
  `content.py`, `app.py`, and all 54 `john`/`luke` files are 100% untouched.
- **Failures encountered and resolved**:
  1. Initial `json.loads()` vs `asdict()` comparison in `test_web.py` differed
     on Python `tuple` vs JSON `list` types; resolved by comparing against the
     canonical JSON bundle `json.loads(format_bundle(build_web_payload())[0])`.
  2. Top-level import of `verify_web_export` in `verify.py` loaded domain
     modules before `sys.settrace(sensor.trace)` started in
     `unit_and_coverage()`; moved the import inside `static_checks()` so all
     1109 statements and 1090 branch edges are traced from module load.
- **Sensor status & limits**: All computational sensors are `clean` except Emacs
  MCP `diagnostics_baseline` (`baseline_unavailable` because stale buffers
  `soccer_strategy/soccer_smart/content.py` and `soccer_strategy/app.py` have
  `no_active_backend`; `get_diagnostics(since="baseline")` was run after every
  edit and returned `no_baseline`, with open buffer `README.md` reporting
  `flycheck` state `ready`).

# Evidence Report -- Coaching Correctness Review (Tier 2, 2026-11-09)

The user requested checking and correcting the actual choices, particularly
continuous cases. The review covers all 24 episodes / 166 nodes / 498 choices,
with concrete counterexamples and a complete grade/possession ledger in
`COACHING_REVIEW.md`. The 65 standalone scenes were screened and their existing
coaching/book checks rerun; their authored data is unchanged. Earlier reports
below are historical.

Scope authorization: the user explicitly requested this correction. Detailed
policy and test amendments were authored autonomously, without separate approval
of each grade. `SPEC.md` visibly records the amendment allowing multiple valid
answers rather than enforcing the old first-preferred-choice uniqueness rule.

## Corrected behavior

- Unblocked opening alternatives receive full credit. Useful stationary support
  and unpressured scanning can also be good decisions.
- Held-ball recovery preserves opponent possession. It no longer assumes an
  unreleased pass will happen or grants a guaranteed interception. Defensive C
  shows M actually close enough to pressure A; central cover is also credited.
- The poor off-ball alternative has a demonstrably screened return lane. The
  teammate keeps the ball, rather than being forced to pass to an opponent.
- Both shooting corners are checked against defenders and goalkeeper. A pass
  remains available if neither shooting corridor is clear.
- Coach comparison respects a fully credited selected option, consistently in
  animation and route overlays on desktop and web.

These judgments are original small-sided teaching interpretations, informed by
the FIFA/FA references in the review document. They do not establish a unique
optimal action for every real match or assess physical execution.

## Reproduce

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smart.verify
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m unittest discover -s soccer_strategy/soccer_smart -t . -q
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m unittest soccer_strategy.soccer_smart.test_play_coaching -q
node --check docs/soccer_smart/app.js
node --check soccer_strategy/soccer_smart/test_play_web.js
git diff --check
```

The complete verifier recorded all six gate results. Tests and shuffled-repeat
gates fail only on the pre-existing localhost socket restriction:
`test_local_http_serving_delivers_all_static_assets` raises
`PermissionError: [Errno 1] Operation not permitted`. That test remains active.
The long-running tool session returned 143 after producing the complete report;
no normal or green overall exit is claimed. A separate full unittest run is
recorded as an independent check of the same sole environment error.

## Final source fingerprints

- Package, excluding this report, bytecode and `.verification`:
  `6598b991b4cc3988591f70c4ba5885d3abcf7fd96c0ae8453762460c0c56ccdd`.
- `docs/soccer_smart/app.js`:
  `9bf2b098e5977d02c46d4a5c6d66504430db32373eb8870a5d53a709e72c6290`.
- `docs/soccer_smart/index.html` (unchanged in this review):
  `8fb9aa66bdac3067fb0e0f10f3208a02c9202079fe0dc882e6ef69c800caf371`.
- `docs/soccer_smart/data.js`:
  `b4007a4d18b84e46ce72d238be054df5802fd5d529998dfcd6f20120f5966d74`.
- `docs/soccer_smart/data.json`:
  `6834ebe63f6fef446e0a9497c2d585d3bb329b66bdafa4cecd81f37ad544ed7e`.

Package fingerprint matches the final `.verification/report.json`. Toolchain:
Python 3.14.4, existing Pygame 2.6.1, cached Pyright 1.1.399 and existing Node.
No dependency, service, installation, runtime capability or commit was added.

## Final verification results

| Gate or sensor | Actual result | Status |
| --- | --- | --- |
| Complete tests | 85 run / 84 passed / zero assertion failures / one pre-existing HTTP socket error | environment failure |
| Coaching regressions | 10/10 passed; eight of the initial nine examples failed before the fixes | clean |
| Related targeted suite | 44/44 passed: coaching, continuous graph/UI/web, existing coaching and book tests | clean |
| Runtime coverage snapshot | 1434/1434 statements, 1452/1452 conditional edges across 18 modules; independent completeness check and corrupted-edge negative control executed | complete |
| Lint, boundaries, complexity | 37 Python files, zero violations; <=60 lines / <=15 decisions per function | clean |
| Docs, export and coaching ledger | 10 docs / 52 local links; five web files synchronized; 166 nodes / 498 grades match; corrupted grade and book-row controls rejected | clean |
| Static types | 18 files / zero errors / zero warnings; bad-type control rejected | clean |
| Scripted mutation | 24/24 applied, executed and assertion-killed | clean |
| Shuffled repeat | 85 run / zero assertion failures / same one HTTP socket error | environment failure |
| Real execution | Smart SDL, John SDL and Node web smoke all exit 0 | clean |
| JavaScript syntax and whitespace | Both Node syntax commands and `git diff --check` exit 0 | clean |
| Editor diagnostics | Baseline and per-edit MCP calls return HTTP 401 | UNAVAILABLE |

The full-test gate stops before its final coverage enforcement because of the
HTTP error. Fresh `coverage.json` was separately asserted complete against all
`CHECKED_MODULES`; deliberately reducing a recorded covered-edge count was
rejected. This does not turn the complete-test gate green. The reproducible
snapshot-check code is retained in the historical Continuous Play report below.

Every new coaching mutant has a behavioral assertion witness, beyond export
drift: alternative credit, held-ball possession, keeper-dependent corner choice,
Python coach route and the real Node UI/route test. The alternative-credit mutant
changes only a safe M pass to partial credit, preserving valid scenes so the
assertion tests the recommendation instead of failing during construction.

## Review method and maintainability

`test_play_coaching.py` uses explicit counterexamples for the reported defects,
including keeper-left/keeper-right and blocked-corner fixtures. It also samples
the actual moving-defender geometry for every fully credited carry, pass,
receive and shot. Static state alone is not counted as animation evidence.
The full ledger is checked with a known-bad grade control; it is a consistency
check, not independent proof of tactical quality.

The corrected content retains all episode/node identities and choice-keyed
transitions. Existing graph/session validation, first-run scoring and retry
behavior are unchanged. A single pure coach-selection helper is reused by
desktop animation and overlays; the browser mirrors that helper and checks all
fully credited choices against their selected outcome geometry. No new engine
or UI mode was introduced. Pure modules keep their existing dependency direction.

The earlier assertion demanding three different first-best keys was explicitly
superseded by the correctness contract. Contrasts still require different usable
route sets, and the new independent tests require full credit for clear
alternatives. No failing assertion was simply deleted to force a green result.

Nine actual SDL review screens in `/tmp/smart-coaching-review-screens` were
rendered and inspected: alternative credit, matching coach route, held-ball
recovery/continuation, real teammate pressure, useful existing support, screened
support without a forced turnover, and keeper-aware finishing.

Preservation: 80 sibling files match the review-start snapshot. Original
standalone scene/card/index data, graph/session rules and shared drawing/quality
primitives are unchanged. Org was not edited. John/Luke preservation gates pass.

Remaining limits: the locality socket test and editor diagnostics are unavailable
in this managed environment. Native browser/device testing remains unavailable;
Node runs the real web application at a canvas boundary, supplemented by SDL
visual review. Existing AST checks, deterministic path/seed invariants and
scripted mutants substitute for Ruff/Hypothesis/mutmut with their documented
blind spots. No dependency or concurrency gate applies. Soccer decisions remain
contextual; the credited routes are supported by the visible practice picture,
not guaranteed outcomes or a universal match optimum.

## Historical Continuous Play implementation evidence

The user approved the concrete eight-task / three-opening / two-to-three-decision
plan for desktop and web, then explicitly said "yes, go ahead". The approved
contract is appended in `SPEC.md`; task contrasts and boundaries are documented
in `CONTINUOUS_PLAY.md`. Earlier evidence below is historical.

Delivered: a separate eighth menu entry, 24 original episodes, 166 linked decision
nodes and 498 choices. Chosen actions determine successors; passing leads to
support, losses to recovery and regains to using possession. Actor/ball endpoints
are continuous. Existing 65 standalone scenes, 31 cards, 57 indexed topics and
the first seven modes remain available. The child keeps controlling John/YOU.

## Reproduce

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smart.verify
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m unittest soccer_strategy.soccer_smart.test_play soccer_strategy.soccer_smart.test_play_ui soccer_strategy.soccer_smart.test_play_web -q
node --check docs/soccer_smart/app.js
node --check soccer_strategy/soccer_smart/test_play_web.js
git diff --check
```

The persisted verifier runs every applicable gate and correctly exits **1** in
this sandbox. The pre-existing test
`WebExportTests.test_local_http_serving_delivers_all_static_assets` cannot bind
`127.0.0.1`: `PermissionError: [Errno 1] Operation not permitted`. This is the
only error in both the pre-change 58-test run and final 75-test run. It also
causes the shuffled-repeat gate to fail. The test is retained, not skipped;
the full gauntlet is not represented as green.

## Final source state

- Python package SHA256: `d9b7e54b1afc4d9910ff7d7f6262715bd19eb5cbb4ac7ba50c9f9d6f66dfb5b3`.
  Reproduce with `verify.source_hash()`: sorted package-relative paths and bytes,
  excluding this report, bytecode and `.verification` artifacts.
- Web runtime `docs/soccer_smart/app.js`:
  `edd4b490ff1b5eb5a92feff04d8abdaa42250ef8d1afcb2f0898bb0a962215c9`.
- Web page `docs/soccer_smart/index.html`:
  `8fb9aa66bdac3067fb0e0f10f3208a02c9202079fe0dc882e6ef69c800caf371`.
- Generated `docs/soccer_smart/data.js`:
  `ae958890880982d91fcd7b452463518f9abefbfa501709b926bc91513702b535`.
- Generated `docs/soccer_smart/data.json`:
  `d0bcf428d5fa6cf9bb1cab70f08a6c3a469abc8eae92c19d28896ee0112f8d16`.
- Toolchain: Python 3.14.4, Pygame 2.6.1, cached Pyright 1.1.399, existing Node.
  No package installation, dependency, service, asset download or commit added.

## Contract to tests

| Approved behavior | Executable evidence | Result |
| --- | --- | --- |
| Eight families / three contrasting openings; genuinely different spacing | `test_catalog_and_contrasts`, `test_task_families_have_different_relative_spacing_not_just_new_titles` | pass |
| Every path has two or three decisions and exact actor/ball continuity | `test_continuous_graph_all_paths_have_two_or_three_decisions` | pass |
| Real selected branch despite shuffled choices | `test_all_branches_follow_choice_keys_despite_shuffle`, Node equivalent | pass |
| No missing exits, unknown destinations, duplicate identities, teleports, cycles, unreachable or overlong plays | three graph-validation tests; continuation rejects unknown holders | pass |
| Recommended delivery lanes are clear; a cross starts wide and is reachable | `test_strong_deliveries_have_clear_lanes`, `test_cross_starts_wide_and_released_interception_is_reachable` | pass |
| Mixed rounds have four distinct tasks; family practice has all A/B/C openings | `test_varied_rounds_choose_distinct_families_and_all_family_openings` over 12 seeds | pass |
| Retry branches never inflate first-run scores; unvisited steps not penalized | `test_selected_branch_and_first_run_practice`, `test_complete_continuous_round_and_retry_do_not_score_unvisited_nodes` | pass |
| All 166 nodes / 498 choices render; keyboard, task pages, top menu and practice labels work | three `ContinuousUITests`, actual SDL | pass |
| Same graph exported to web; every exit, touch confirmation, mobile text and progress behavior work | two `ContinuousWebTests` and `test_play_web.js`, actual web runtime with canvas boundary | pass |
| Existing content and games preserved | original tests, content/John/Luke fingerprints and independent before/after snapshot | pass |

## Fresh gauntlet and sensor results

Numbers are from one complete final-source verifier run, with detailed commands
and outcomes in `.verification/report.json`, `coverage.json` and `mutations.json`.
The package fingerprint was independently checked against the report afterward.

| Layer / sensor | Actual result | Status |
| --- | --- | --- |
| Full suite | 75 run; 74 passed, zero assertion failures, one pre-existing HTTP socket error. Baseline: 58 run / 57 passed / same one error | FAIL: environment |
| New feature suite | 17/17 passed via the exact unittest command above | clean |
| Coverage snapshot | 1416/1416 statements, 1426/1426 conditional edges, 18 modules; zero missing lines or edges | complete, independently checked |
| Lint / formatting / complexity / boundaries | 36 Python files, zero violations; <=60 function lines / <=15 decisions; pure play modules checked without Pygame/network imports | clean |
| Docs / exports / book ledger | Nine docs, 50 local links; five web files synchronized; 24 plays / 166 nodes; original 65 scenes / 31 cards / 57 indexed entries; bad-row control rejected | clean |
| Pyright | 18 files; zero errors and warnings; known-bad assignment rejected | clean |
| Mutation | 19/19 applied, executed and assertion-killed; includes wrong branches, score inflation, teleporting links, missing openings and both web defects | clean |
| Shuffled repeat | 75 run / 74 passed / zero assertion failures / same one HTTP socket error | FAIL: environment |
| Real execution | Smart SDL, John SDL and Node web smoke exit 0 | clean |
| JavaScript syntax | Both `node --check` commands exit 0 | clean |
| Whitespace | `git diff --check` exit 0 | clean |
| Editor MCP baseline / per-file diagnostics | HTTP 401 transport failure before editing and after each touched file; no baseline or diagnostic regression result obtainable | UNAVAILABLE |

The test gate stops before `Coverage.require_complete()` because of the HTTP
error. To avoid counting an unenforced report as a coverage pass, this separate
fail-closed check was executed against the fresh snapshot, including a known-bad
negative control. It does not change the full-suite failure:

```sh
python3 - <<'PY'
import copy, json
from pathlib import Path
from soccer_strategy.soccer_smart.verify import CHECKED_MODULES, source_hash
base = Path('soccer_strategy/soccer_smart/.verification')
assert json.loads((base / 'report.json').read_text())['source_sha256'] == source_hash()
def require_complete(rows):
    assert set(rows) == set(CHECKED_MODULES)
    assert all(r['covered'] == r['statements'] and r['covered_edges'] == r['branch_edges']
               and not r['missing_lines'] and not r['missing_edges'] for r in rows.values())
rows = json.loads((base / 'coverage.json').read_text())
require_complete(rows)
bad = copy.deepcopy(rows)
bad['play_model.py']['covered_edges'] -= 1
try:
    require_complete(bad)
except AssertionError:
    print('Coverage negative control rejected')
else:
    raise AssertionError('False green coverage control')
PY
```

All mutation artifacts were also checked for applied/executed/killed flags and
an actual `FAIL:` assertion. The baseline has zero assertion failures, so its
unrelated HTTP error cannot count as a kill. Geometry control examples returned
clearance 0 for a blocked segment, 3 for a parallel offset and 5 for a stationary
point; the blocked route correctly fails the 2.5-space threshold.

## Maintainability, preservation and limitations

- Play graphs own links and continuity; content owns authored pictures;
  ContinuousSession reuses existing Session timing, feedback and coach phases.
  The only base-session change is a score-recording hook. Navigation uses the
  established painter, controls and resizing. No second animation engine added.
- Domain/content/session remain independent of Pygame. Play validation calls
  the pure presentation geometry already used to animate actions, avoiding
  duplicate endpoint calculations. Possession is computed once per continuation
  and passed to the appropriate support/recovery builder.
- Python authors the graph once. Web export personalizes John to YOU; the browser
  reuses its existing rendering/session primitives. Mirrored traversal code is
  necessary for the existing offline JavaScript port; every authored exit is
  exercised in Node to guard against divergence.
- The eight-family limit and small three-choice nodes are intentional. Reused
  continuation patterns teach support/pressure/recovery without pretending that
  each of the 166 branch pictures is an unrelated soccer problem.
- Independent snapshot: 81 existing other-game/Org files unchanged. Original
  Smart lesson/card/index data, shared `drawing.py` and `quality.py` unchanged.
  No sibling-game checkpoint or Org section edited. The 54-file John/Luke
  preservation gate also passes in the verifier.
- RED evidence included absent episodes/menu/export, blocked recommended shot
  routes, title-only spacing, non-wide crosses, stationary receiving runs,
  duplicate exits and the task browser's nonfunctional top-menu click. These
  were corrected while retaining assertions and the full existing suite.
- SUBSTITUTED: existing AST lint for standalone Ruff, deterministic seed/path
  invariants for Hypothesis and scripted mutants for mutmut. Their known-bad
  controls ran; they do not prove all formatting rules, inputs or possible bugs.
- Real visual review: 12 actual SDL screens in `/tmp/smart-continuous-screens`
  cover both task pages, keeper delivery/support, loss recovery, cross interception,
  the next decision, combined-play shooting and a visited-step summary. All 166
  nodes and 498 choices pass automated layout checks in SDL and Node.
- UNAVAILABLE: local HTTP serving because socket creation is sandbox-blocked;
  editor diagnostics because MCP returns HTTP 401; native browser/device testing
  because the installed Firefox wrapper refuses to start under its Snap confinement.
  Node executes the real web application with a canvas boundary, not a real browser.
- N/A: new-dependency/license changes, remote services, database, concurrency,
  benchmark and heading-safety behavior changes. No such capability was added.
- Soccer feedback describes authored small-sided practice, not guaranteed match
  outcomes or a universal optimum. Real child playtesting is still needed.
  The book's unseen chapter bodies remain unverified; this expansion is original
  match practice and does not alter the existing source-evidence boundary.

## Historical public-index coverage expansion evidence

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
