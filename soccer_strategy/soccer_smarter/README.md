# Soccer Smarter Lab

An English, offline Pygame soccer decision game for John, informed by the
publicly verified themes of Andrew Latham's 2026 *Soccer Smarter for Kids:
Learn to Play Like the Pros*.

The existing [Soccer Smart Lab](../soccer_smart/README.md) already implements
36 basic tactical situations and seven practice cards. This continuation adds
seven mission families with consecutive decisions across defender, midfielder,
winger and forward roles, plus three optional growth and pro-study activities.
Basic receiving, passing, shielding, defending and goalkeeper
training stay in the existing games. The game reuses its full-field drawing
primitives, with an independent episode model rather than a copied app.

## Run

From the repository root, with Python and Pygame installed:

```sh
python3 -m soccer_strategy.soccer_smarter
```

Headless smoke execution and full verification:

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smarter --smoke
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smarter.verify
```

The verifier uses Python's unittest, existing quality sensors and cached or
installed Pyright. It installs nothing and fails if a required check cannot
run. Runtime requires no network, external videos or downloaded assets.

## Web Version (GitHub Pages & Local Testing)

A zero-backend static HTML5 `<canvas>` web build is committed under
[docs/soccer_smarter/index.html](../../docs/soccer_smarter/index.html) (and
linked from the [docs/index.html](../../docs/index.html) hub) for direct
GitHub Pages hosting (`main` branch, `/docs` folder). In the web version, the
controlled player is personalized as `"You"` / `"YOU"` so any child can play.

To regenerate `docs/soccer_smarter/data.json` and `docs/soccer_smarter/data.js`
after editing Python episodes or notebook steps:

```sh
python3 -c "from soccer_strategy.soccer_smarter.web_export import export_web; print(export_web())"
```

To test the web page locally in your browser:

```sh
python3 -m http.server 8000 --directory docs
# Open http://localhost:8000/soccer_smarter/
```

## Missions and controls

Menu keys 1-7 open Turn and escape (M01), Shape the delivery (M02), Restart
director (M03), Prediction lab (M04), Speed dribble and adapt (M05),
Penalty-box finish (M06) and Break the press (M07). Each contains original A/B
contrasts: fourteen episodes, twenty-eight decision nodes and 84 graded choices
in total. Outcomes follow the actual selected branch. Some branches end after
one decision; others lead to a new cue and second decision. The B layout
changes which action fits the picture.

- 1/2/3 or click: choose; hover to preview the intended ball or player route.
  Interceptions stop along that route. Off-ball choices preview your player's
  movement, even when a teammate also passes during the animation.
- Space: finish the animation. P: pause/resume. Period (.): advance one step.
- C: animate a coach comparison from feedback. R: retry that decision; from
  summary, replay the current contrast. N: continue after feedback.
  An already good choice remains the coach's demonstration.
- Esc or Menu: return to the menu. Starting a mission creates a fresh round.
- Menu 8 or Notebook: optional X01 playing-principle, X02 support-plan and X03
  pro-watch / Try It activities. Choose a goal or pro role, evidence/helper,
  observation and next step. N skips a step; R edits the previous step. Resume
  play returns to the same round.
- Menu 9: instructions for opening the existing Soccer Smart basics game.

Choices are untimed. Feedback distinguishes good fit (2), workable (1) and
visible risk (0). Several options can fit the same picture. The
[case review](COACHING_REVIEW.md) records all 84 choices and their reasons.
The summary counts only decisions visited on the initial
traversal, including a new initial traversal for contrast B. Retry-only nodes
and episode replays are practice; they never replace first attempts. Unvisited
branches are not penalized. Predictions and growth choices add no tactical
points. Notebook entries and real-play evidence remain only until the app closes.

## Design and provenance

Read in this order:

1. [Sources and content verification](SOURCES.md): confirmed book themes,
   edition differences and the unavailable book-body evidence.
2. [Overlap and reuse audit](GAP_ANALYSIS.md): what to link, extend or add.
3. [Game design and development slices](DESIGN.md): the advanced loop,
   architecture, scoring and implementation acceptance criteria.
4. [Original worked mission briefs](SCENARIOS.md): decisions, contrasts,
   feedback and optional growth tasks.
5. [Executable specification](SPEC.md) and [verification evidence](EVIDENCE.md),
   including the implementation contract and current verification results.

Every mission is ORIGINAL, mapped with source_status=OVERVIEW_ONLY and
review_status=BOOK_BODY_PENDING. Public descriptions establish themes, not
chapter-level coverage or verification of the author's technique instructions.
The curved paths are authored schematics, not ball-flight predictions. Restart
scenes use an explicit coach-led setup rather than teach competition rules.
The notebook prescribes no numerical health targets. Coach review and child
playtesting remain pending; book-body access was unavailable.
