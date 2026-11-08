# Book-coverage expansion and GitHub Pages web verification evidence

Current delivery: migrated Soccer Smarter Lab to a zero-backend GitHub Pages
static HTML5 `<canvas>` web version (`docs/soccer_smarter/index.html`,
`docs/soccer_smarter/app.js`, `docs/soccer_smarter/data.json`,
`docs/soccer_smarter/data.js`, linked from `docs/index.html`), exported
deterministically via `web_export.py` and personalized with `"You"` / `"YOU"`
so any child can play (while preserving desktop Python files). Also includes
the expanded 7-mission catalog (M01-M07: 14 episodes, 28 decision nodes, 84
graded choices) and 3 growth activities (X01-X03) documented in
[DESIGN.md](DESIGN.md), [SCENARIOS.md](SCENARIOS.md) and
[COACHING_REVIEW.md](COACHING_REVIEW.md). Earlier reports below are historical.

## Reproduce this verification

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smarter.verify
git diff --check
```

- Spec approval: obtained during grilling for web architecture and `"You"` personalization; detailed Gherkin assertions in [SPEC.md](SPEC.md) authored under user instruction ("go ahead and convert soccer_smarter as well").
- Final package SHA256 (excluding `EVIDENCE.md`, bytecode and `.verification`):
  `38545f698598b953a8e1c02c6b308f6a5f11085a36f21658d9e99feee841b5e5`.
- Design SHA256 (excluding `EVIDENCE.md`):
  `319491d2832105c09b7d8a25396ed6af7b8bfacbb48c55a3f02b968ba868ff68`.
- Toolchain: Python 3.14.4, Pygame 2.6.1 / SDL 2.32.10, Node.js v24.21.0, cached Pyright 1.1.399.

## Fresh gauntlet results

| Layer | Command | Numeric result |
| --- | --- | --- |
| Full new-game + web suite | `PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smarter.verify` | 56 tests passed; 0 failures, 0 errors |
| Runtime statement coverage | `verify.py` (`tests_and_coverage`) | 729/729 statements (100%) across 8 runtime modules; 0 missing |
| Runtime conditional edges | `verify.py` (`tests_and_coverage`) | 746/746 branch edges (100%); 0 missing |
| Static types | `verify.py` (`types`, Pyright 1.1.399) | 8 runtime modules; 0 errors, 0 warnings; 1/1 bad control rejected |
| Lint / boundaries / complexity | `verify.py` (`static_checks`) | 18 Python files, 0 violations; <= 60 lines / <= 15 decisions; 2/2 bad controls rejected |
| Document, coaching, and web bundle | `verify.py` (`static_checks`) | 7 docs, 39 local links, 10 mission mappings, 28 nodes / 84 choices, 5 web files (7 missions, 14 episodes, 3 notebook activities) in sync; 4/4 bad controls rejected |
| Mutation testing | `verify.py` (`mutations`) | 8/8 scripted mutants (including 2 web export/personalization mutants) uniquely applied, executed and killed |
| Suite health | `verify.py` (`suite_health`) | 56 tests repeated in seeded shuffled order; 0 failures |
| Real SDL + Node web execution | `verify.py` (`real_execution`) | All 4 games (`soccer_smarter`, `soccer_smart`, `john`, `luke`) `--smoke` plus `web_smarter` Node smoke and local HTTP server test exited 0 |
| Preservation / whitespace | `verify.py` + `git diff --check` | 56 preserved `john`/`luke`/shared-primitive files and Org prefix intact; `git diff --check` exit 0 |

## Failures encountered and resolved

1. Expected RED phase (`test_web.py`): against the stub `web_export.py` before
   creating `docs/soccer_smarter/`, `python3 -m unittest soccer_strategy.soccer_smarter.test_web`
   failed with 5 errors (`Missing web file: soccer_smarter/index.html`, HTTP 404).
2. `TITLES` iteration in `web_export.py`: initial `TITLES.items()` raised
   `AttributeError` because `TITLES` is a 7-tuple of title strings; fixed to
   `[{"id": f"M0{i + 1}", "title": title} for i, title in enumerate(TITLES)]`.
3. Trailing blank line in `SPEC.md`: `git diff --check` inside `SPEC.md`'s
   embedded gate rejected line 308 (`new blank line at EOF`); removed the extra
   blank line so `git diff --check` exited 0.

## Sensor status, maintainability review and remaining risks

- Computational sensors (`tests_and_coverage`, `coverage_control`,
  `static_checks`, `types`, `mutations`, `suite_health`, `real_execution`,
  `git diff --check`): PASS (`clean`).
- Editor diagnostics (`diagnostics_baseline` / `get_diagnostics`): UNAVAILABLE
  (MCP editor diagnostic tools are not exposed in this session environment after server restart).
- Maintainability review: `web_export.py` is a pure exporter checked under
  `model.py` boundaries; `docs/soccer_smarter/app.js` mirrors `model.py`,
  `session.py`, `notebook.py`, `rendering.py` and `app.py` without modifying
  any existing desktop runtime module or shared drawing primitive.
- Remaining risk: full chapter bodies for the 2026 book's "more than 50
  techniques" remain unavailable (`FULL_TEXT_PENDING` / `BOOK_BODY_PENDING`).
  All scenarios are `ORIGINAL` teaching schematics informed by publicly
  verified publisher and *School Library Journal* evidence, not verbatim drills
  or coach/child-tested certifications.

## Historical case-review verification evidence

Current correction: all eight episodes, sixteen decisions and forty-eight
choices reviewed against the pictured facts. The full rationale and source
principles are in [COACHING_REVIEW.md](COACHING_REVIEW.md). The earlier reports
below are historical, not the final numbers for this correction.

## Reproduce this review

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smarter.verify
git diff --check
```

Both commands exited 0 after the final edits. The verifier also runs the new
game's real --smoke CLI and the Soccer Smart, John and Luke smoke CLIs. Exact
subprocess commands/results are in .verification/report.json. It removes stale
artifacts and fails closed on missing tools, coverage gaps or failed controls.

Final package SHA256, excluding this evidence file, bytecode and .verification:
`6a19fa580529f3bba439c7eeecde6a1fa220c515750c9d470c6818ff71bb162c`.
Before-review Org prefix: 39,668 bytes, SHA256
`8fe3115e64086a340b7d91bec8db618c004bee30dcf4793f898b076135af4d3a`.
All 83 sibling-game files and this original Org prefix were preserved. The
runtime toolchain remains Python 3.14.4, Pygame 2.6.1 / SDL 2.32.10 and cached
Pyright 1.1.399. No package installation or dependency change was made.

## Final review gates

| Layer | Actual result |
| --- | --- |
| Full new-game suite | 48 tests; 0 failures / 0 errors |
| Runtime statements | 634/634; missing lines fail the gate |
| Runtime conditional edges | 634/634; missing edges fail the gate |
| Types | 7 modules; 0 errors / 0 warnings; deliberate type error rejected |
| Quality / boundaries / complexity | 16 Python files; 0 violations; 60-line / 15-decision function budgets preserved |
| Coaching ledger | All 16 nodes / 48 keyed scores match the review; deliberately wrong grade rejected |
| Mutation | 5/5 uniquely applied, executed and killed by assertion failures in isolated copies |
| Suite health | 48 tests repeated in seeded shuffled order; 0 failures |
| Real SDL execution | All four games' smoke commands exited 0; feedback screenshot saved |
| Other controls | Uncovered branch, unused import, forbidden import, three broken-document controls and type error all rejected |
| Preservation / whitespace | 83 sibling files and original Org prefix unchanged; git diff --check exit 0 |

The additional mutant restores the old incorrect grade for the newly opened
wide pass. It is killed by the case-level regression suite, not by an import
failure. The ledger check detects stale documentation, not tactical quality.

## Acceptance mapping and observed failures

- Thirteen CoachingTests cover safe passing, actual forward pressure, screened
  return lanes, newly opened wide passing, short layoff support, alternative
  good choices, coach consistency, receiving endpoints, moving-opponent
  clearance, route prefixes, kick-before-support movement, dribbling and
  off-ball previews. Test methods loop across the catalog where appropriate;
  there is not a claimed one-test-per-choice correspondence.
- ModelTests reject mismatched intent origins and goal markers outside the
  displayed goal. UITests check that hover reaches the intended receiver,
  interception stops earlier and the goal target is visible before answering.
- Named regressions failed before fixes: the safe pass scored 1, a newly open
  wide pass scored 0, the coach overrode a good pass, off-ball preview started
  at M rather than John, and the passer ran away before kicking.
- A test fixture initially classified receiving an off-ball pass as dribbling.
  It was corrected to require possession at the start as well as the end;
  the close-control assertion remains enforced for every actual scored dribble.
- All sixteen decision layouts were inspected together, plus changed restart
  feedback and short-layoff screens. The short layoff was spaced apart so the
  two players are easier to distinguish. Existing all-node/all-choice SDL
  layout tests still pass. The seven original runtime modules remain covered.

## Final sensor status and scope

Tests, coverage, types, static quality, dependency boundaries, complexity,
mutation, shuffled repeat, document checks and real SDL execution: PASS. The
before-edit suite was 33 tests / 616 statements / 604 conditional edges, all
green; that baseline did not exercise the newly identified coaching mistakes.

Editor diagnostics remain UNAVAILABLE: the before-edit baseline checked 7/9
open buffers and could not be recorded because two unrelated buffers lacked
backends. Per-touched-file get_diagnostics(since="baseline") returned no_baseline.
No clean editor comparison is claimed; type and quality gates ran separately.

Semantic review kept geometry in model.py, case-specific facts/ratings in
content.py, good-choice coach selection in session.py, and graphics in
rendering.py/app.py. No new tactical scoring engine, ball physics model,
duplicated basic curriculum or changes to other games were introduced.

N/A: dependency installation, migrations, new performance budgets or network
features. Geometry uses deterministic sampled invariants; scripted isolated
mutation substitutes for installing another tool. Full sibling suites were
not rerun; their exact source hashes and real smoke executions were checked.

This review establishes consistency with the authored schematic situations,
not universal optimal decisions, real interception probabilities, or verified
book instructions. Coach review, child playtesting and book-body alignment
remain unverified. Pygame's existing AVX2 build warning remains non-fatal.

## Historical initial implementation report

The following section predates the case corrections above.

Current delivery: runnable Soccer Smarter Lab, verified on 2026-11-07,
America/Los_Angeles. The design-phase report below is historical. The user
explicitly requested implementation of the design; the detailed executable
assertions were authored autonomously without an additional approval round.
See the implementation contract appended to [SPEC.md](SPEC.md).

## Reproduce the current verification

From the repository root:

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smarter.verify
```

The entry point removes stale verification artifacts and fails on any missing
tool, failed test, missed runtime statement/conditional edge, surviving mutant,
or broken required gate. Detailed results, subprocess commands and exit codes
are written to soccer_strategy/soccer_smarter/.verification/report.json.

Separate smoke command (also executed by the verifier):

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smarter --smoke
git diff --check
```

Toolchain: Python 3.14.4, Pygame 2.6.1, SDL 2.32.10, Pyright 1.1.399
(cached installation; Python 3.13 syntax target). No installation or dependency
change. Tested interpreter: Python 3.14.4; no other interpreter is claimed.

Package SHA256, excluding EVIDENCE.md, bytecode and .verification artifacts:
`ff92729d88467322ebb2fbe7f3b9661193380184b916f04ad9c65b758b2bb6a2`.
The verifier records the deterministic sorted-path/content hash on every run.
Original Org prefix: 38,214 bytes, SHA256
`434e6e8da456a56fcc65820dbcefcd8341be5a07b1b21e98b3a23b8e0f4e475b`.

## Fresh implementation results

| Gate | Numeric result / status |
| --- | --- |
| Full new-game suite | 33 tests passed; 0 failures, 0 errors |
| Runtime statement coverage | 616/616 statements across 7 behavior-bearing modules |
| Runtime conditional coverage | 604/604 conditional branch edges; missed edges fail the gate |
| Coverage negative control | 1 executed example with an unvisited branch rejected |
| Static quality / boundaries | 15 Python files; 0 violations; runtime functions within 60 lines / 15 decisions |
| Lint and boundary controls | 2/2 known-bad sources rejected |
| Document checks | 7 documents; 6 mission mappings; 3/3 bad-document controls rejected |
| Preservation | All 83 John/Luke/Soccer Smart files and the entire original Org prefix unchanged |
| Static types | 7 runtime modules; 0 errors / 0 warnings; 1/1 deliberate type error rejected |
| Manual mutation | 4/4 applied, executed and killed by assertion failures in isolated temporary copies |
| Suite health | 33 tests repeated in deterministic shuffled order; 0 failures |
| Real SDL execution | Soccer Smarter, Soccer Smart, John and Luke smoke commands all exited 0 |
| Whitespace | git diff --check exited 0; new Python and Markdown files checked directly as well |

The four mutants break retry-only scoring, discard the actual successor,
replace curved interpolation with a corner route, and release the ball before
contact. None failed merely from collection/import errors. Original source is
never mutated; temporary copies include the required existing drawing package.

## Acceptance to test mapping

| Design behavior | Tests |
| --- | --- |
| Graph identity, provenance, continuity and finite geometry | ModelTests catalog, invalid-data, graph, trajectory and contrast tests (11) |
| Branch traversal, first attempts, practice-only nodes, prediction and pause/step | SessionTests (8) |
| Optional principle/evidence/revision and plan/helper/observation; skip/edit; unchanged scores | NotebookTests (3), notebook UI tests |
| All authored scenes and choices, long evidence, keyboard/mouse, resize, coach/retry, resume and summary | UITests (8) |
| Real CLI, screenshot, normal quit and actual font-overflow rejection | MainTests (3) |

Unit and invariant tests exercise geometry endpoints, contact timing, bounded
samples, actual blocker intersections, successor snapshots, cycles, unreachable
nodes, invalid reading budgets and every authored branch. SDL layout tests
render every node, choice and phase and both growth activities. Menu, corner
motion, curved feedback, prediction/reveal and notebook screenshots were also
visually inspected. The verifier saves a real feedback.png screenshot.

## Final sensors, review and limits

Computational tests, coverage, types, quality/boundaries, complexity, mutation,
document validation, preservation and SDL smoke: PASS. No prior runnable
soccer_smarter baseline existed. Initial behavior tests failed against the
stub before implementation; targeted regressions also failed before fixing
intercepted-route endpoints and invalid point dimensions.

Editor diagnostics: UNAVAILABLE. Before edits, diagnostics_baseline reported
baseline_unavailable (7/9 open files checked; unrelated soccer_smart/content.py
and soccer_strategy/app.py lacked active backends). After edits, per-file
get_diagnostics(since="baseline") calls returned no_baseline. This status is
not reported as clean or substituted by the runtime gates.

Semantic review: presentation reuses only existing drawing primitives; advanced
graphs, animation tracks, scoring and notebook state belong to this package.
The UI adapter is named rendering.py, while model/content/session/notebook stay
independent of Pygame. Shared quality helpers are reused without copying a full
app/verifier or modifying sibling files. Basic curricula are linked rather
than duplicated; no network, external media or disk-save features were added.

Verification fixes included relative Pyright include paths (an incomplete
analysis correctly failed), explicit rendering-layer placement, and a UI test
fixture that needed fresh canvases rather than drawing antialiased text twice.
Validation tests were expanded without lowering coverage requirements. All
final executable gates pass against the final implementation source.

- N/A: new dependencies, migrations, performance budgets and disk persistence.
- SUBSTITUTED: deterministic generated geometry samples instead of installing
  a property-test dependency; isolated scripted mutation instead of a new tool.
- Existing games: source preservation and real smoke exercised; their complete
  separate suites were not rerun because their source did not change.
- UNAVAILABLE: editor baseline comparison and full book-body verification.
- Remaining review: author-specific technique fidelity, coach review and child
  engagement playtesting. All eight episodes remain ORIGINAL / OVERVIEW_ONLY /
  BOOK_BODY_PENDING, and the notebook is preset-based with optional skip/edit.
- Pygame emitted its existing AVX2 build warning; no functional check failed.

## Historical design-only verification

The following report predates the implementation and applies only to the
original documentation delivery, including its older hashes and N/A layers.

Documentation-only delivery, verified on 2026-11-07 (America/Los_Angeles).
See the [specification](SPEC.md), [overlap audit](GAP_ANALYSIS.md) and
[source ledger](SOURCES.md). This report does not claim a runnable new game.

## Authorization and source state

- The user authorized the recommended design direction and delegated the
  remaining choices without owning the book. Approval of the exact executable
  specification was not obtained; its detailed assertions were authored
  autonomously. Confidence is limited accordingly.
- Design SHA256, excluding this evidence report:
  `37a55c867fab94a1b8d0d88ba5a759bbb83d763f0e42b1f0426362afb1e80244`.
  The specification defines the sorted filename/content hash algorithm.
- Existing-game fingerprints and the original 36,858-byte Org prefix hash are
  fixed in the specification. All 29 John, 25 Luke and 29 Soccer Smart files
  match the before-edit snapshots (83 total). Generated bytecode and
  .verification artifacts are excluded from those snapshots.
- Seven new English documents; one result subheading appended to the existing
  Org section. Existing untracked .agents and soccer_smart work was preserved.
- Python 3.14.4; standard library only; no dependency or capability changes.

## Exact verification commands

Run this single persisted entry point from the repository root. It executes
the embedded gate, all three negative controls, preservation checks and
`git diff --check`; a missing block or completion sentinel fails the command.

```sh
python3 -c 'from pathlib import Path; s=Path("soccer_strategy/soccer_smarter/SPEC.md").read_text(); marker="\n<!-- design-check -->\n```python\n"; assert s.count(marker)==1; ns={}; exec(s.split(marker,1)[1].split("\n```",1)[0],ns); assert ns.get("verification_complete") is True'
```

`git diff --check` was also run independently and exited 0. It covers tracked
diffs; the embedded checks additionally inspect all new documents directly.

## Final results and acceptance mapping

| Criterion / layer | Actual result | Limits |
| --- | --- | --- |
| A1 sources | Manual review completed: publisher, regional publisher, ebook and library records checked | No complete contents or chapter bodies obtained |
| A2 overlap | All six missions mapped to existing code or cards; manual review completed | Labels do not prove football novelty or teaching quality |
| A3 scenarios | Four tactical families with worked A paths / B contrast briefs; two unscored growth tasks | Alternate geometry and executable game data are future work |
| A4 preservation | 83/83 game files unchanged; original Org prefix unchanged | Generated artifacts excluded as declared |
| A5 negative controls | 3/3 rejected for expected assertions: missing document, broken local link, missing mission | Tests these known failure paths, not all possible document errors |
| A6 document gate | Exit 0: 7 documents, 26 local links, 6 mission mappings, ASCII and whitespace checks passed | ASCII is a character constraint, not a proof of English prose quality |
| Whitespace sensor | git diff --check exit 0; document whitespace checks passed | No application lint/type claims |
| Entry-point execution | Exit 0; completion sentinel reached; design digest matches above | Documentation verification, not gameplay execution |

## Diagnostics and layers not run

Before edits, diagnostics_baseline returned baseline_unavailable: 6/8 open
project files checked. Two unrelated buffers lacked an active backend
(soccer_smart/content.py and soccer_strategy/app.py). No baseline was recorded.
After edits, get_diagnostics(since="baseline") was requested for all eight
touched files: seven documents and the Org file. Final status was no_baseline;
new document buffers were not open. The Org buffer had current coverage but
could not produce a baseline comparison. Editor diagnostics are UNAVAILABLE,
not clean. No editor configuration was changed to hide this limitation.

- SUBSTITUTED: document presence, link, structure and whitespace gates plus
  manual content review serve as documentation validation. They do not check
  book fidelity or future UI layout.
- N/A: application test suites, runtime static types, changed-code coverage,
  gameplay mutation/property tests, SDL execution, dependency-boundary tools
  and performance checks. No application source, imports or dependencies changed.
- N/A: randomized suite runs; the document checks have no random input.
- UNAVAILABLE: book-body validation and editor diagnostic comparison. Neither
  is counted as passed or bypassed by the document gate.

## Failures, review and remaining risk

The first gate run exited 1 with "missing or unexpected document", before the
design files existed (expected RED). The first complete-document run exposed
a checker defect: its bad-link fixture inside a code fence was mistaken for a
rendered link. The specification records the amendment. The checker now skips
fenced examples while still rejecting a bad prose link; three negative controls
run on every verification. Later document checks exited 0.

Semantic review found basic tactics, shaped-delivery labels, observation and
reflection already implemented in Soccer Smart. Those are linked or extended
with observable additions instead of duplicated catalogs. Drawing primitives
are the proposed reuse boundary; curriculum, linear animation and one-choice
session constraints are not copied into the proposed episode model. No shared
engine refactor or whole-app copy is part of this delivery.

Book access remains the main content limit. This design can support original
advanced missions now, but detailed author-specific drills, complete-book
coverage, chapter locators and professional-match pairings remain unverified.
Coach review, child playtesting and future implementation checks are pending.
