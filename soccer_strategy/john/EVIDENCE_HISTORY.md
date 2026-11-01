# Archived verification reports

The reports below predate the six-section reorganization. Their source hashes
and numeric results are historical; current results are in EVIDENCE.md.

# Current evidence - coaching review and requested extensions

The current catalog has **29 topics, 87 pictures and 261 choices**. All original
variants were reviewed for the stated football conditions. Keeper throws,
teammate miscontrol, permitted sliding and short-pass/long-kick decisions were
added following the parent's instructions. Detailed observations and primary
sources are in [COACHING_REVIEW.md](COACHING_REVIEW.md).

This is a source-backed authored review, not a guarantee that every preferred
response is optimal in a real match or a certification by John's coach.

## Fresh verification of the final reviewed source

Command actually run from the repository root:

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.verify
```

Exit status: **0**. The persisted report records eight subprocess argument lists,
working directories and exit codes; in-process tests are recorded by gate.

| Gate | Fresh result |
|---|---|
| Full soccer suite | 54 passed, zero failures/errors |
| Runtime statements | 636/636 covered |
| Runtime conditional edges | 488/488 covered |
| Static types | Eight runtime modules, zero errors/warnings |
| Lint, boundaries, complexity | 18 Python files, zero violations |
| Scripted mutation | 5/5 applied, executed and killed by assertion failures |
| Shuffled repeat | 54 passed, seed 734 |
| Real SDL execution | Exit 0; choose, feedback, retry, screenshot, main-loop quit |
| UI coverage | All 87 pictures and all three actions rendered; no text overflow |

Source SHA256:
`39ad6214c111466160df2415d15784a336f1be11474aa350fcda9dd50a875804`.
The hash method and exclusions are described in the retained implementation
report below. EVIDENCE.md and generated artifacts are excluded so recording this
report does not change the verified runtime/source tree.

## Football-specific evidence

The new regressions demonstrate that:

- Preferred-answer metadata cannot reposition the opponents or change the
  observed incoming ball.
- Reasonable alternatives count positively. A clearance stays wide even when
  retaining possession would have been preferable.
- Loose-ball distance advantages and receiver/interception ordering match the
  pictured positions.
- Claimed blocked exits have visible opponents; preferred passes are short and
  to a receiver who is looking and ready.
- A pass does not promise a reception; support after passing and teammate
  miscontrol have explicit practice pictures.
- Pressure arrows approach the named A; mark/pass options name R, M or GK;
  assigned zones are drawn and held.
- Keeper observation starts opponents beyond the build-out line, then moves to
  the later first-touch/pressure picture without teaching a universal trigger.
- Slide recommendations depend on the picture. The preferred sliding clearance
  has A clear of its route; allowed sliding does not excuse dangerous contact.
- A long kick travels upfield toward the flank and does not promise teammate
  possession. It is separate from a short ground pass and carrying.
- The no-pressure rebound has a collection option. Sliding/clearance/long-kick
  animation reaches the contact point before the outgoing ball leaves.

Each identified defect had a failing regression before correction. The fifth
mutant reverses a clearance toward the own goal and must be killed by the new
coaching tests. Manual inspection covered 27 decision screenshots across the
most affected topics and distribution/slide/long-kick motion frames; subsequent
contact-timing and collection corrections were inspected again.

## Remaining verification limits

- **UNAVAILABLE:** the editor diagnostics baseline could not be refreshed because
  app.py has no active checker. Per-file requests likewise remain unavailable
  for new Python buffers. Task Org and SPEC document diagnostics are clean.
  Zero Pyright errors is independent evidence, not an editor-MCP clean result.
- **SUBSTITUTED:** standard-library coverage/source-hygiene sensors and cached
  Pyright replace unavailable coverage.py, Ruff and mypy. Known-bad controls and
  exact limitations are retained below.
- Existing repository-game failures/interactive tests remain outside this
  focused fix. Existing tracked Python files still match HEAD.
- No physical contact, actual receiver skill, running speed, kick success rate
  or real-match improvement is measured. The pictures show intended routes and
  explicit decision conditions, not guaranteed outcomes.
- 7v7, a build-out line and permitted slides were supplied by the parent.
  Competition-specific release timing still belongs to the actual league.

## Initial implementation evidence (historical)

Everything below is the original implementation snapshot. Its smaller catalog,
counts and source hash are historical; the current results are those above.

### Original report - Left Back Lab (Tier 2)

The implementation is runnable and the local computational gates pass. Full
completion of the requested harness is still limited by unavailable editor
diagnostic coverage and the repository-wide legacy test limitations below.
These are not counted as successful checks.

## Contract and source state

- Specification: `SPEC.md`, explicitly approved in conversation before coding.
- Base repository commit: `9aa27e600cdba6b22281cf046cece55d6052bd61`.
- Soccer source-tree SHA256:
  `418793af99ae072a7afa22f1846b2df4ce438d59d8d86f0e0d1f865766375d5f`.
- Hash algorithm: `verify.source_hash()`, sorted relative paths plus file bytes;
  excludes `EVIDENCE.md`, generated `.verification/` and Python bytecode caches.
- Only `soccer_strategy/` and the task's Coding summary were changed. Existing
  tracked Python files still match HEAD (`git diff --exit-code HEAD -- '*.py'`).
- Runtime: Python 3.14.4, Ubuntu Pygame 2.6.1, SDL 2.32.10.
- Type checker: locally cached Pyright 1.1.399, basic checking / Python 3.13 mode;
  interpreter import paths and typeshed location supplied explicitly.

## Reproduce

Run from the repository root:

```sh
python3 -m soccer_strategy.verify
```

The command deletes stale artifacts, runs every declared local gate and writes
`.verification/report.json`, `coverage.json`, `types.json`, `mutations.json` and
`feedback.png`. The report records actual subprocess argument lists, working
directories, exit codes, source hash and numeric results. Missing tools, empty
type-check input, crashes and surviving mutants fail the command.

Additional commands actually used:

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m unittest discover -s soccer_strategy -t . -q
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy --smoke --screenshot /tmp/soccer-smoke.png
git diff --exit-code HEAD -- '*.py'
```

The final verifier also invokes the real smoke command with its generated
`.verification/feedback.png` destination. Exact arguments are in `report.json`.

## Final local gate results

| Gate | Result |
|---|---|
| Complete soccer test suite | 34 passed, 0 failures, 0 errors |
| Runtime statement coverage | 553 / 553 measured statements |
| Runtime conditional-edge coverage | 404 / 404 measured edges |
| Types | 8 runtime modules analyzed; 0 errors, 0 warnings |
| Type gate negative control | Rejected a known bad integer assignment |
| Source hygiene / complexity | 17 Python files; 0 violations; functions at most 60 lines and 15 decisions |
| Dependency boundaries | Core models, content, session and animation independent of Pygame; no runtime network or subprocess imports |
| Manual mutation | 4 / 4 applied, executed and killed by assertion failures |
| Shuffled repeat | Same 34 tests passed, seed 734 |
| Real execution | Actual SDL dummy display; choose, feedback, retry, screenshot and main-loop quit; exit 0 |
| UI layouts | Every base scene, all three choices, observation/decision/outcome/feedback rendered; no measured text overflow |

Coverage gates exit nonzero on any missed measured statement or conditional
edge. Compiler-generated annotation functions and identity guards for optimized
builtins are excluded, rather than falsely reporting branches that require
shadowing `tuple`, `any` or `all` to reach. Explicit source conditions, loops and
comprehensions remain included. A control program must fail with one unvisited
branch and pass only after both branches execute. Text overflow, unused imports,
whitespace and forbidden-import controls also reject known-bad inputs.

## Acceptance mapping

| Approved criterion | Executable evidence |
|---|---|
| `scenario_catalog` | Catalog count, unique IDs, all 24 topics, three variants and validated geometry |
| `context_changes_decision` | Different preferred action in every topic's three variants; reasonable alternatives retained |
| `training_flow` | Observation, unlimited decision time, selection, outcome, feedback, retry and next tests |
| `visual_consistency` | Animation endpoints, no answer overlay before feedback, correct switch/cross/rebound direction, all-scene SDL renders |
| `session_progress` | Six practice plus two unseen layouts, original four topics first, first-attempt scoring, partial/final summaries |
| `input_and_exit` | Mouse, keyboard, invalid clicks and phases, resized coordinates, menu and actual quit event |
| `catalog_invariants` | Generated geometry/interpolation/transfer cases; malformed IDs, actors, choices, scores, coordinates and feedback rejected |
| `headless_smoke` | Actual Pygame execution with and without screenshot; invalid CLI and I/O failure tests |

Initial RED evidence was observed before implementation: catalog `0 != 72`,
playlist `0 != 8` and menu `0 != 3`. Additional regressions first failed for the
stage-1 topic order and cross-field ball direction, then passed after correction.

The four mutants were: a constant preferred action, retry overwriting results,
accepting a choice during observation, and a ball ignoring the chosen outcome.
Each was applied to a temporary package copy, checked for successful application,
and executed against actual catalog/session tests. Import failures do not count
as kills. Original source files were never replaced by mutants.

## Sensor status and unavailable layers

| Sensor | Final status | Baseline / limitations |
|---|---|---|
| Tests, types, geometry, UI, mutation, source hygiene | Clean | Fresh numeric results above |
| Editor MCP diagnostics | UNAVAILABLE for new Python files | Baseline recorded 0 diagnostics; requested file checks report `buffer_not_open` or `no_active_backend`, not `clean` |
| Task Org diagnostics | Clean | No new diagnostics versus baseline after appending Coding summary |
| Ruff formatting and lint | SUBSTITUTED | Standard-library syntax, unused-import, ASCII and whitespace gates; not Ruff's full rule set or canonical formatting |
| coverage.py | SUBSTITUTED | Standard-library statement/opcode-edge tracing with negative controls; not an independent coverage.py measurement |
| mypy | SUBSTITUTED | Pyright with explicit search paths and an analyzed-file-count gate |
| Property tests | SUBSTITUTED | Deterministic generated cases over all catalog scenes, transfer scales, coordinates and seeded sessions; no Hypothesis shrinking |
| Repository-wide full test run | UNAVAILABLE as a clean noninteractive gate | Existing failures, duplicate standalone module names and interactive GUI tests; isolated results below |
| Performance stress / race / rollback | N/A | Single-process local trainer; no stated quantitative performance budget, transactions or concurrent state |

The unavailable editor checker prevents a claim that the full harness's final
diagnostic condition has been met. A risk-acceptance question was sent while
other work continued; absent an answer, no acceptance is assumed.

## Existing-game regression observations

Cached pytest 9.1.1 and its dependencies were copied into `/tmp/soccer-devtools`
because PyPI DNS failed. They were not installed globally or added as a runtime
dependency. Existing tracked game sources are unchanged from HEAD.

The isolated commands used the prefix
`PYTHONPATH=/tmp/soccer-devtools SDL_VIDEODRIVER=dummy SDL_AUDIODRIVER=dummy`:

| Command after that prefix | Observed result |
|---|---|
| `python3 -m pytest -q connect4` | 4 passed, 8 failed: diagonal assertion and missing `Player.name` constructor arguments |
| `python3 -m pytest -q -p no:cacheprovider battleship` | 3 passed |
| `python3 -m pytest -q -p no:cacheprovider gameOfLife` | 10 passed, 2 failed: `Surface.fill(None)` |
| `python3 -m pytest -q -p no:cacheprovider tests` from `monopoly/` | 35 passed |
| `python3 -m pytest -q -p no:cacheprovider denver_train/test_game.py::test_game_engine denver_train/test_gui.py` | 3 passed, with existing return-value/dependency warnings; these functions return booleans, so pytest's green result is weaker than asserted behavior |
| `python3 -m pytest -q denver_train` | Entered an interactive GUI and was interrupted, exit 130; not counted as a passing suite |
| `python3 -m pytest -q -p no:cacheprovider starWolf` | 1 failed: relative image path `./galaxy.wiki.jpg` unavailable from repository root |
| `python3 -m pytest -q -p no:cacheprovider yellowSubmarine` | No collected tests, exit 5; `spike*` interactive methods are not acceptance tests |

Flappy Bird's interactive application-loop tests were not run. None of these
legacy limitations was changed or counted as a new soccer test pass.

## Modularity and capability review

- Scenario facts and reasons live in `content.py`; action geometry and common
  labels/risks live in `catalog.py`. New scenarios do not require UI changes.
- Frozen models and session state do not import Pygame. Rendering consumes the
  same geometry that animation endpoint tests validate.
- John remains the only controlled player. Scripted teammates are scene data,
  not a second game engine. The session owns phase transitions and scoring.
- Shared colors, text measurement and drawing primitives avoid duplicate screen
  logic. Small phase strings are a deliberate trade-off for this bounded UI.
- No existing game APIs or source files were modified. No network, account,
  telemetry, shell execution or player-data persistence was added to gameplay.
- Filesystem output is limited to an explicitly requested smoke screenshot and
  development verification artifacts. The verifier uses subprocesses and
  temporary copies for tests; the ordinary game does not.
- Ubuntu's Pygame copyright record identifies the library as LGPL-2+; the game
  imports the installed library and vendors no library code or external art.
  Optional pip dependencies are pinned and no transitive package code is vendored.
- No credentials or secret material were introduced. A network vulnerability
  database audit was unavailable; no claim of an independent supply-chain audit.

## Remaining limits

The trajectories and outcomes are illustrative, not football physics. All 72
base layouts are exercised, but the pedagogical quality still benefits from
John's coach reviewing the examples. League-specific rules are deliberately not
adjudicated. A real desktop session with John and real-match improvement have
not been measured. Pygame's Ubuntu build emits an existing AVX2 performance
warning; this did not prevent tests or execution.


# Six-section reorganization evidence (historical)

# Current evidence - six training sections

The user approved reorganizing both the game menu and the Org document.
The catalog remains **29 topics, 87 base situations and 261 choices**. The six
sections have 5, 6, 5, 3, 7 and 3 topics. Earlier reports are preserved in
[EVIDENCE_HISTORY.md](EVIDENCE_HISTORY.md); their counts and hashes are historical.

## Final verification

Command actually run from the repository root:

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.verify
```

Exit status: **0**. Generated `.verification/report.json` records every gate
and eight subprocess argument lists, working directories and exit codes.
Nonzero exits for the deliberate type error and five mutants are expected.

| Gate | Final result |
|---|---|
| Full soccer suite | 59 passed, zero failures/errors |
| Runtime statements | 654/654 measured statements covered |
| Runtime conditional edges | 502/502 measured edges covered |
| Types | Nine runtime modules; zero errors/warnings; bad assignment rejected |
| Source hygiene, boundaries, complexity | 20 Python files; zero violations |
| Scripted mutation | 5/5 applied, executed and killed by assertions |
| Shuffled repeat | 59 passed, seed 734 |
| Real SDL execution | Exit 0; menu, choice, feedback, retry, screenshot and quit |
| UI regression | All 87 base scenes and three actions render without text overflow |

Source SHA256:
`52639a1f4c151842d494ff1791991bf02fdf470d8beaa502b191ad587cb60afe`.

`verify.source_hash()` hashes sorted package-relative paths and file bytes,
excluding EVIDENCE.md, generated .verification files and bytecode caches.
The historical evidence archive is included. Toolchain: Python 3.14.4,
Pygame 2.6.1, SDL 2.32.10, cached Pyright 1.1.399 with Python 3.13 type mode
and explicit interpreter import/typeshed paths.

## Specification and checks

The append-only [SPEC.md](SPEC.md) records the approved contract.

| Invariant | Test |
|---|---|
| Exactly one section per topic | test_all_topics_belong_to_exactly_one_section |
| Canonical membership | test_catalog_uses_the_canonical_membership |
| Football content preserved | test_regrouping_preserves_all_existing_case_content |
| Unknown topics rejected | test_unassigned_topics_are_rejected |
| Six practice plus two held-out transfer layouts | test_session_progress_has_six_practice_and_two_transfer_scenes |
| Determinism, uniqueness, membership and all topics reachable | test_stages_and_seed_are_deterministic |
| Opening 1v1 sequence | test_basics_start_with_the_one_on_one_topics |
| Six visible cards | test_menu_offers_six_training_sections |
| Six sections open; decision keys still 1-3 | test_every_section_can_be_opened_and_menu_keys_do_not_choose_actions |

The deterministic property sweep creates two sessions for each of six sections
and 20 seeds (240 sessions), checking eight distinct scene IDs, two transfer
layouts, no transfer source in practice and reachability of all 29 topics.
Small groups fill six practice slots with distinct variants.

All 87 scene records were captured before editing. After excluding only section
membership, JSON-normalized records match. Their persisted canonical SHA256 is
`4c032dcf86cf7e99117818329c8089cc2ec67d1cb570b7940f0d1650ce6d1b31`.
The checksum regression preserves observations, positions, action labels,
ratings, explanations and routes. Update case_content.sha256 only when approved
football content intentionally changes.

Additional commands actually run:

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m unittest discover -s soccer_strategy -t . -q
git diff --exit-code HEAD -- '*.py'
```

Existing tracked Python files match HEAD. Org checks confirmed the original
three top-level headlines, 29 topic entries exactly once and valid local links.
The coaching review retains all 87 rows under the six groups. The rendered menu
at /tmp/soccer-six-sections.png was inspected: all six cards fit without overlap
or text overflow.

## Sensors and semantic review

- Computational sensors: clean in the final unified run. Coverage and source
  hygiene known-bad controls remain executable in the suite.
- Editor MCP: **UNAVAILABLE** for Python buffers without an active checker or
  open buffer. The baseline could not establish complete coverage. Org and SPEC
  diagnostics are clean. Independent Pyright evidence does not establish the
  editor harness clean done-condition.
- **SUBSTITUTED:** standard-library coverage/source hygiene and deterministic
  generated cases replace unavailable coverage.py, Ruff and Hypothesis.
  They enforce declared constraints, not every style rule or possible input.
  Tool limitations and original repository baselines remain in the archive.
- Repository-wide legacy game tests were not rerun for this regrouping.
  Earlier failures and interactive-test limits are preserved in the archive.
- No dependencies, installations, runtime network/subprocess capabilities or
  secret-bearing configuration changes were introduced.
- curriculum.py owns membership. Lessons derive their section; menu and
  validation use the same definition. Session scheduling handles small groups
  without leaking transfer pictures. Numeric stage fields/API remain compatible.
  Core curriculum/content/session layers stay independent of Pygame.
  No duplicated runtime membership table or unexpected dependency was found.
- Documentation has one current report, a historical archive and the same
  six-group curriculum. Design/Coding updates are consolidated.

## Failures and limits

The new menu and opening-order tests first failed against the old three-stage
implementation. Invalid section 4 tests now reject section 7 as specified.
Reachability assertions were merged into the existing 20-seed determinism sweep
with all assertions retained; suites passed before and after, followed by the
final mutation run. Initial tuple/list snapshot comparison needed JSON
normalization; normalized content and its checksum match.

The existing Pygame AVX2 build warning remains; execution exits successfully.
Editor diagnostics remain unavailable, so the complete editor-harness
done-condition is not claimed. This regrouping does not independently certify
football advice, simulate contact or measure real-match improvement. The earlier
case review and its limits remain in [COACHING_REVIEW.md](COACHING_REVIEW.md).
