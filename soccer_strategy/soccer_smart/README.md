# Soccer Smart Lab

An English, offline Pygame soccer decision trainer for John, inspired by the
publicly verifiable themes of Andrew Latham's 2016 book *Soccer Smarts for
Kids: 60 Skills, Strategies, and Secrets*.

Start with [DESIGN.md](DESIGN.md), [CURRICULUM.md](CURRICULUM.md), and
[SCENARIOS.md](SCENARIOS.md). [SOURCES.md](SOURCES.md) records the book,
access limitations, and evidence labels. [SPEC.md](SPEC.md) records the
approved executable specification; [EVIDENCE.md](EVIDENCE.md) reports the
reproducible verification gauntlet results.

## New: Continuous Play

Choose **8 / Continuous Play** for match sequences where your choice determines
the next picture. Eight task families have three different openings each:
**24 episodes with 166 decision nodes**, and two or three decisions per path.
Pass and offer a return angle, carry and react to closing pressure, or recover
after losing the ball. You keep controlling John (YOU on the web).

Pick a task to practice its three shuffled openings, or a mixed round with four
different tasks. `N` continues the selected branch; `B` returns to the task list.
Left/Right pages through tasks. Coach comparison and `R` retry remain available.
Retries and their follow-up branches are practice; only visited first-run
decisions count in the round summary. Unvisited branches are never penalized.

The original 65 single-decision scenes, 31 cards and 57 book entries remain in
their existing modes. New episodes are original small-sided no-offside training
pictures, separate from claims about unseen book text. See
[Continuous Play design and review](CONTINUOUS_PLAY.md).

The [coaching audit](COACHING_REVIEW.md) records every linked node. Multiple
good routes can earn full credit. Recovery does not invent a regain, and useful
stationary support or time to scan is recognized. Shot routes consider the
keeper; coach comparison respects the child's selected good option.

## Does it cover the whole book?

The original 36-scene release did not. The new Book companion adapts the public
index entry by entry: 57 topics, of which 56 lead to original decisions or
unscored activities. The heading entry explains why physical heading practice
remains deferred for John's profile. See the full [coverage audit](BOOK_COVERAGE.md).

The expansion adds 29 tactical situations and 24 activity/information cards:
65 unique tactical scenes and 31 unique cards across both modes. It covers
previously absent indexed themes such as offside timing, throw-ins, combinations,
off-ball feints, back-line coordination, crosses, line breaks and scoring runs.
Skills have schematic demonstrations and optional coach/adult activities;
profiles have observation prompts rather than invented biography quizzes.

This is public-index topic coverage, not verified coverage of all cases inside
the book. Chapter bodies, exact drills and profile text remain unreviewed.
All adaptations are ORIGINAL / INDEX_ONLY / FULL_TEXT_PENDING. The subtitle's
number 60 is not treated as a list of 60 verified game cases.

## Run and verify

From the repository root:

```sh
python3 -m soccer_strategy.soccer_smart
```

Run the headless SDL smoke check:

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smart --smoke
```

Run the full verification gauntlet (tests, 100% statement and branch coverage,
AST lint/boundaries, Pyright static types, 24/24 mutants, shuffled repeat,
existing-game preservation, SDL smoke, and GitHub Pages web bundle sync/smoke):

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smart.verify
```

### Web version (GitHub Pages and local testing)

A zero-backend HTML5 `<canvas>` web port is generated in
[docs/soccer_smart/index.html](../../docs/soccer_smart/index.html) (with landing
page [docs/index.html](../../docs/index.html) and exported catalog bundle in
[web_export.py](web_export.py)):

```sh
python3 -m http.server 8000 -d docs
```

Then open `http://127.0.0.1:8000/soccer_smart/` (or open
`docs/soccer_smart/index.html` directly in a browser). In the web build, the
controlled player is labeled `YOU` with second-person prompts so any child can
play. Touch devices preview a choice route on the first tap and confirm on the
second tap.

## Controls and game structure

- **Menu (`1`-`8` or mouse click)**:
  - `1` Read and receive (topics `T01`-`T03`)
  - `2` Pass, carry, support (topics `T04`-`T06`)
  - `3` Find attacking space (topics `T07`-`T09`)
  - `4` Defend and recover (topics `T10`-`T12`)
  - `5` Mixed round (6 practice scenes across all 4 sections + 2 held-out transfer layouts)
  - `6` Practice cards (7 unscored technique demonstrations and adult-led activities)
  - `7` Book companion (57 indexed topics across Skills, Tactics, Watch a player,
    For adults and Getting started)
  - `8` Continuous Play (8 match tasks, 24 openings, selected-action branches)
- **Book companion**:
  - Choose a category, then `1`-`6` or click a topic. Left/Right changes pages.
  - `B` or Book topics returns to the same topic page. Esc opens the main menu.
  - Each tactical topic has its own round with shuffled choices, feedback,
    coach comparison and first-attempt-preserving retries.
  - Cards remain unscored; `R` replays and `N` returns to the topic list.
  - Offside/throw-in lessons state their rules; other added tactics use
    no-offside training pictures. Rule-line pictures keep their authored geometry.
- **During a round**:
  - `SPACE`: skip current animation phase to decision or feedback
  - `1`, `2`, `3` or click: choose one of the three shuffled actions (hover to preview route)
  - `C`: compare with the animated coach demonstration in feedback
  - `R`: retry the current situation from observation (first-try score is preserved)
  - `N`: advance to the next situation or practice card
  - `ESC`: return to the main menu

## Attribution and boundaries

The original 36 tactical scenes (`T01.A`..`T12.C`), 108 action choices, and 7 practice
cards in [content.py](content.py) are `ORIGINAL` teaching designs mapped to the
23 public-index theme groups (`G01`..`G23`) in [curriculum.py](curriculum.py).
`INDEX_ONLY` and `OVERVIEW_ONLY` entries remain `FULL_TEXT_PENDING` until
checked against the physical book. The current [John game](../john/README.md)
and [Luke game](../luke/README.md) remain untouched.
The added `B...` scenes and `bk...` cards follow the same original-content
boundary; the coverage audit distinguishes activities and deferred topics.
