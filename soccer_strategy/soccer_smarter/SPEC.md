# Soccer Smarter design specification

## Scope and authorization

Deliver an English design package for John, ages 8-12, in multiple outfield
roles. Research the 2026 book, compare the implemented John, Luke and Soccer
Smart games, and design an advanced continuation without duplicating their
curricula. Include optional, unscored growth activities. Preserve the existing
games and append a result under the existing Org headline.

The user accepted the recommendations and explicitly said, "I don't have the
book. take suggestion for rest question". Proceed using those defaults without
another interview. The user has not reviewed this exact executable document;
this is autonomous authorization, not approval of its detailed assertions.

This delivery is design only. No runtime, dependencies, installation, shared
engine refactor, asset downloads, commits, or changes to the other games.
Use the Python standard library and existing editor diagnostics. Public book
descriptions establish themes; unavailable chapter bodies remain unverified.

## Acceptance scenarios

| ID | Given / when | Required result | Verification |
| --- | --- | --- | --- |
| A1 | Public descriptions are accessible but book bodies are not | Edition, source confidence, conflicts and unavailable content are explicit | Sources review; document gate |
| A2 | Existing games already cover basic tactics and practice cards | Each proposed mission has an explicit overlap decision and observable new behavior | Gap analysis review; mission cross-check |
| A3 | John enters the advanced continuation | Four tactical mission briefs have contrasts, graded feedback and a second decision; two optional growth tasks stay unscored | Scenario and state-machine review |
| A4 | This design is added | All 83 existing game files and the original Org prefix retain their hashes | Preservation gate |
| A5 | A document or local link is missing | Verification exits nonzero | Three in-memory negative controls |
| A6 | The delivery is complete | Seven English documents, valid local links, result within the target Org section, no whitespace errors | Document gate; git diff check |

Book fidelity, football coaching quality and child engagement cannot be proved
by document structure checks. They require later source and playtest review.
Runtime tests, types, coverage, gameplay mutation and SDL execution are N/A for
this documentation-only delivery. The checker must reject known-bad documents.

## Reproducible verification

Run from the repository root with Python 3.14.4 (standard library only):

```sh
python3 -c 'from pathlib import Path; s=Path("soccer_strategy/soccer_smarter/SPEC.md").read_text(); marker="\n<!-- design-check -->\n```python\n"; assert s.count(marker)==1; ns={}; exec(s.split(marker,1)[1].split("\n```",1)[0],ns); assert ns.get("verification_complete") is True'
```

The original source snapshots below are fixed acceptance inputs. Changes to
the specification must be recorded explicitly rather than refreshing hashes
to accept unrelated modifications. The evidence report is excluded from the
reported design hash to avoid a self-referential digest.

Checker amendment during verification: ignore fenced code when collecting
rendered Markdown links. The initial checker incorrectly treated its own
intentional bad-link fixture as a real link. Actual document links and the
outside-code negative control remain enforced; no content criterion changed.

<!-- design-check -->
```python
import hashlib
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path("soccer_strategy/soccer_smarter")
NAMES = ("README.md", "SOURCES.md", "GAP_ANALYSIS.md", "DESIGN.md",
         "SCENARIOS.md", "SPEC.md", "EVIDENCE.md")
MISSIONS = ("M01", "M02", "M03", "M04", "M05", "M06", "M07", "X01", "X02", "X03")
BASELINES = {
    "soccer_strategy/john": (29, "66bb813b7973fb959e1e2d0f83064975a835dcb896255eb7bdb34aaaed9dfffc"),
    "soccer_strategy/luke": (25, "2be6ec8cb60fe9c12f3c5d94b81ddaa1e049a4fe72138f2d47767b084760641a"),
}
SHARED_PRIMITIVES = {
    "soccer_strategy/soccer_smart/drawing.py": "d4d6a1c16ecb9fba749a44493ff347a91c0cef458b6ff3d31768122c86ad38fc",
    "soccer_strategy/soccer_smart/quality.py": "49274f080eb19c44d1d120969ea348bd7d0586e25710138431512ab277ca8f09",
}

def digest(rows):
    return hashlib.sha256("\n".join(rows).encode()).hexdigest()

def document_checks(docs):
    assert set(docs) == set(NAMES), "missing or unexpected document"
    links = 0
    for name, body in docs.items():
        assert body.startswith("# ") and body.endswith("\n"), name
        assert body.isascii(), "non-English character: " + name
        assert all(line == line.rstrip() for line in body.splitlines()), name
        fence = chr(96) * 3
        prose = re.sub(r"(?ms)^" + fence + r"[^\n]*\n.*?^" + fence + r"\s*$", "", body)
        for link in re.findall(r"\[[^\]\n]+\]\(([^)\n]+)\)", prose):
            if link.startswith("https://"):
                continue
            assert (ROOT / link.split("#", 1)[0]).is_file(), "broken local link: " + link
            links += 1
    ids = re.findall(r"^## ([MX]\d{2}) - ", docs["SCENARIOS.md"], re.M)
    assert ids == list(MISSIONS), "mission identity mismatch"
    for mission in MISSIONS:
        assert docs["GAP_ANALYSIS.md"].count("| " + mission + " |") == 1, "missing gap row"
    assert docs["SCENARIOS.md"].count("Source status: OVERVIEW_ONLY / BOOK_BODY_PENDING; content: ORIGINAL.") == len(MISSIONS)
    assert "FULL_TEXT_PENDING" in docs["SOURCES.md"]
    return links

docs = {name: (ROOT / name).read_text() for name in NAMES if (ROOT / name).is_file()}
link_count = document_checks(docs)
for label in ("missing-document", "broken-link", "missing-mission"):
    bad = dict(docs)
    if label == "missing-document":
        del bad["README.md"]
    elif label == "broken-link":
        bad["README.md"] += "\n[Bad](missing-negative-control.md)\n"
    else:
        bad["SCENARIOS.md"] = bad["SCENARIOS.md"].replace("## M01 - ", "## REMOVED - ", 1)
    try:
        document_checks(bad)
    except AssertionError as error:
        expected = {"missing-document": "missing or unexpected document",
                    "broken-link": "broken local link",
                    "missing-mission": "mission identity mismatch"}[label]
        assert expected in str(error), (label, str(error))
    else:
        raise AssertionError("false green: " + label)

preserved = 0
for root, expected in BASELINES.items():
    files = sorted(p for p in Path(root).rglob("*") if p.is_file()
                   and not {"__pycache__", ".verification"}.intersection(p.parts)
                   and p.suffix != ".pyc")
    rows = [str(p) + ":" + hashlib.sha256(p.read_bytes()).hexdigest() for p in files]
    assert (len(files), digest(rows)) == expected, "existing game changed: " + root
    preserved += len(files)
for rel_path, expected_sha in SHARED_PRIMITIVES.items():
    assert hashlib.sha256(Path(rel_path).read_bytes()).hexdigest() == expected_sha, "shared primitive changed: " + rel_path
    preserved += 1
org = Path(".ai.code.files/task_20261026_soccer_strategy_game.org").read_bytes()
assert hashlib.sha256(org[:36858]).hexdigest() == "ef8da7192e155a417625257e443b95b792a2d33f0ac5634658439a00ef912b10", "original Org changed"
suffix = org[36858:].decode()
assert suffix.startswith("\n** Design and research result\n"), "result outside target section"
assert not re.search(r"^\* ", suffix, re.M), "unexpected top-level Org section"
subprocess.run(["git", "diff", "--check"], check=True)
source_hash = digest([name + ":" + hashlib.sha256(docs[name].encode()).hexdigest()
                      for name in sorted(docs) if name != "EVIDENCE.md"])
print(f"PASS: {len(docs)} documents; {link_count} local links; {len(MISSIONS)} mission mappings; 3/3 negative controls; {preserved} game files preserved; Org prefix preserved; whitespace clean")
print("Python:", sys.version.split()[0])
print("Design SHA256 (excluding EVIDENCE.md):", source_hash)
verification_complete = True
```

## Implementation contract - 2026-11-07

The user now explicitly requests implementation of this design. The earlier
design-only exclusions and document-only evidence above are historical. The
following acceptance contract governs the runnable game. Its exact test list
was authored autonomously under that instruction, without separate review.

Setup: add model, original content, session, notebook, presentation adapter,
Pygame app, CLI, tests and a verification entry point in this directory. Reuse
Soccer Smart drawing primitives and quality sensors; keep all 83 sibling-game
files unchanged. Use installed Pygame and the Python standard library, and the
cached Pyright installation for verification. Install nothing and create no
commits. Update README/evidence and append an Org implementation result.

| Test group | Executable acceptance criteria |
| --- | --- |
| Model / content | Four families, eight A/B episodes, three choices per node; valid acyclic reachable graphs; stable IDs and explicit original/overview-only provenance |
| Geometry | Linear, corner and quadratic tracks have finite bounded points, exact endpoints and valid timing; preview/outcome use the same track; branch endpoints equal successor snapshots |
| Decisions | Observation -> untimed choice -> animated result -> feedback -> actual successor or terminal; invalid/inactive input leaves state unchanged |
| Scores / retry | First initial-traversal ratings survive retry/coach/replay; nodes discovered on retry count only as practice; unseen branches do not enter totals; a new run resets scores |
| Contrasts / prediction | M01 exit, M02 route and M03 restart best choices change with visible cues; M04 commits an unscored prediction before reveal and changes the second-node choice |
| Animation controls | Pause, incremental step and skip work without changing decision results; invalid elapsed time is rejected |
| Notebook | X01 principle/evidence/revision and X02 goal/helper/action/observation/revision support skip and editing; evidence comes from actual play; totals unchanged |
| SDL UI / CLI | Mouse/keyboard, resize, menu, all branches, coach, retry, summary, notebook and quit work; all authored text fits; --smoke produces an optional screenshot |
| Regression / tools | Sibling hashes and Org prefix preserved; full local suite, complete runtime statement/branch coverage, static types, quality/boundaries, 3-5 applied/killed mutants, shuffled repeat and real SDL smoke pass |

Entry point: `PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smarter.verify`.
Unavailable editor diagnostics and full book bodies must remain explicitly
reported; no claim of author-verified technique instruction is added.

## Coaching review correction - 2026-11-07

The user reports cases that do not make sense and requests a careful review.
Review all 16 nodes / 48 choices, not only graph validity. The prior green
software suite did not establish tactical correctness. Work stays in this
package and an appended Org result; preserve all sibling files and previous
Org content. No dependencies or external assets are added. The user authorizes
the correction; these detailed assertions are authored autonomously.

New regression criteria:

- Accept an open safe pass when no visible cue makes it wrong; allow multiple
  rating-2 options. Reassess lanes after a change of passer or defender position.
- M01: safe pass also fits A; the second defender actually closes the shown
  forward lane; the B handoff identifies BACK and John offers a clear outlet.
- M02: use a gentler schematic bend, true blocked prefixes and a next touch
  consistent with a ball already received by CM. No static picture claims to
  demonstrate shielding technique.
- M03: make the shooting target visible and use a closer practice restart.
  The original return lane really is screened; moving creates a clear angle.
  Rebuilding changes the pass angle, so a newly open wide pass is accepted.
- M04: following wide and staying central block different routes. The open
  wide carry in B is accepted, not described as running into pressure.
- Choice labels describe neutral intended actions. Hover previews the full
  intention; an intercepted outcome follows a prefix of that same route. This
  clarifies the old preview/outcome contract, rather than showing a truncated
  interception as the player's intended pass.
- Every positive ball route clears the illustrated opponents and ends at a
  teammate, a controlled dribble endpoint or the marked goal window. Risky
  ball routes stop at the actual illustrated blocker. Tests use schematic
  clearance, not a real-time interception or football physics model.
- Include named regression tests, a 48-choice coaching ledger and source
  principles. Re-run the existing full verifier and visually inspect changed
  layouts. Keep book-body fidelity and real coach/child review unverified.

## Book coverage audit and missing-case expansion - 2026-11-07

The user asks to carefully check the design and game against the 2026 book and
add missing cases. A source and design audit found four concrete gaps between
publicly verified book evidence / stated design roles and the implementation:

1. The June 2026 *School Library Journal* review (Bob Hassett) confirms
   **speed dribbling** and **shooting inside the penalty box** alongside
   team strategies (creating space, getting into scoring positions) and
   coach-led **safe heading** boundaries, "Try It" solo drills and "Coach's
   Corner" six-week goal reviews.
2. [DESIGN.md](DESIGN.md) promised `defender`, `midfielder`, `winger` and
   `forward` perspectives, but the catalog contained no `defender` or `forward`
   role.
3. [SOURCES.md](SOURCES.md) left the book's named professional player spotlights
   (**Naomi Girma**, **Christian Pulisic**, **Aitana Bonmati**, **Kylian
   Mbappe**) as backlog only instead of providing an honest role-mapped study
   activity.
4. Full chapter bodies for all "more than 50 techniques" remain unavailable
   (`FULL_TEXT_PENDING` / `BOOK_BODY_PENDING`); we must not fabricate unverified
   chapters, page numbers or match quotes.

New executable acceptance criteria (authored autonomously under user instruction):

- **M05 (`Speed dribble and adapt`, winger / midfielder):** In A, an open wing
  runway rewards a speed-dribble surge (`surge=2`), followed by an inside pass
  to `F` (`feed=2`) when `A2` slides over to close the wing. In B, `A2` already
  occupies the wing runway (`surge=0`), so an early inside pass to `M`
  (`pass_m=2`) and subsequent pass to overlapping John (`overlap=2`) fit.
- **M06 (`Penalty-box finish`, forward):** John plays as `forward` inside the
  penalty box (`y <= 18`). In A, John checks into the open penalty spot
  (`spot=2` while `pocket=0` is screened), then finishes low into the marked
  goal target `(44, 0)` (`shoot=2`). In B, `A` screens the penalty spot
  (`spot=0`), so John checks into the open right pocket (`pocket=2`); when `A`
  recovers onto the shot line `(52, 5)` (`shoot=0`), John squares across the
  box to open `LW` (`square=2`).
- **M07 (`Break the press`, defender / midfielder / winger):** John plays as
  `defender` building out from the back (`y = 70`), matching Naomi Girma's role.
  In A, `A` blocks the wide pass (`wide=0`), so breaking the line to `CM`
  (`split=2`) and then combining wide (`combine=2`) or bouncing to supporting
  John (`bounce=2`) fit. In B, `A` blocks the central pass (`split=0`), so
  passing wide to `LW` (`wide=2`) and driving down the open wing (`drive=2`)
  while `A2` screens the inside pass (`inside=0`) fit.
- **X03 (`Pro watch and Try It`, unscored notebook):** Choose one of the four
  book-named pros (`Girma`, `Bonmati`, `Pulisic`, `Mbappe`), link real-play
  session evidence, pick a match-watch cue, and select a solo "Try It" /
  six-week goal step (with explicit coach-led aerial heading safety boundary).
- **Complete ledger & invariants:** All 7 missions / 14 episodes / 28 decision
  nodes / 84 choices pass route-clearance, endpoint, prefix, reading-budget,
  UI layout, 84-choice coaching ledger and mutation checks.
- **Preservation amendment for concurrent sibling work:** Because a separate user
  session is concurrently expanding `soccer_strategy/soccer_smart` curriculum
  files, the preservation gate checks all 54 `john` and `luke` files plus the
  exact SHA256 digests of the two reused `soccer_smart` boundary modules
  (`drawing.py` and `quality.py`), and leaves the Org file untouched.

Shared verifier checkpoint (2026-11-08): the authorized 2016 Book companion
expansion adds four runtime modules to the coverage list and three pure book
modules to dependency-boundary checks in `soccer_smart/quality.py`. Coverage,
lint and boundary enforcement algorithms remain unchanged. Its previous SHA256
was `e040526e2b4cf3052b896922fa7731ef28691e1e8d19c1e5f11759c42360d5ac`;
the exact new checkpoint above retains the fail-closed shared-module gate.
No Soccer Smarter gameplay, test or verifier code is changed by this refresh.
