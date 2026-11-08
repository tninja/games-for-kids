# Approved specification -- Soccer Smart Lab

## GitHub Pages Web Migration Contract - 2026-11-08

The user approved all Q1-Q6 architecture and scope recommendations (Q1=A Python
exports static JSON + native HTML5 `<canvas>` / JS frontend; Q2=A zero-backend
pure static architecture with `localStorage`; Q3=A host in `games-for-kids`
GitHub Pages; Q4=A commit `docs/soccer_smart/` and verify synchronization in
`verify.py`; Q5=A mouse hover preview + click confirm and touch first-tap
preview + second-tap confirm; Q6=A full 7-module migration plus `docs/index.html`
landing page) and asked to implement it with local testing and Uncle Bob's
Coding Agent Harness+. The high-level specification was approved by the user;
the detailed test list below is authored under that instruction.

```gherkin
Feature: Zero-backend GitHub Pages web version of Soccer Smart Lab

  Scenario: Deterministic Python-to-web bundle export and sync gate (web_bundle_sync)
    Given the canonical Python catalogs (36 starter scenes, 29 book scenes, 7 starter cards, 24 book cards, 57 book lessons)
    When build_web_payload() and export_web() generate docs/soccer_smart/data.json and docs/soccer_smart/data.js
    Then verify_web_export() confirms all 5 required web files exist, are clean ASCII without trailing whitespace, and match the live Python catalog byte-for-byte
    And missing files, non-ASCII/trailing-whitespace characters, or out-of-sync JSON/JS bundles raise ValueError

  Scenario: Web geometry and presentation match Python across scenes and cards (web_geometry_parity)
    Given docs/soccer_smart/app.js loaded in Node.js alongside Python presentation.py
    When comparing positions(), ballHeight(), cardPositions(), cardHeight(), routeDestination(), and transferScene() across authored scenes and cards
    Then JavaScript and Python coordinates and heights agree within 1e-9 across observe, decide, outcome, feedback, and coach phases

  Scenario: All 7 modules, 65 scenes, 31 cards, and 57 book topics render without overflow (web_ui_and_touch_controls)
    Given SoccerSmartWebApp initialized with docs/soccer_smart/data.json and a 1280x880 2D canvas context
    When exercising all 7 menu entries, 65 tactical scenes across all phases/choices, 31 practice cards, and 57 book companion topics
    Then layoutErrors remains empty on every screen
    And on touch input in the decide phase, the first tap on a choice previews its gold route without leaving decide, and the second tap on the same choice commits the action
    And retry preserves first-attempt scores while localStorage records practiced scenes

  Scenario: Local static file and HTTP server testing (local_http_serving)
    Given the static site in docs/
    When served over a local Python HTTP server on 127.0.0.1 or opened via data.js bundle
    Then /index.html, /soccer_smart/index.html, /soccer_smart/app.js, /soccer_smart/data.json, and /soccer_smart/data.js return HTTP 200 with valid contents

  Scenario: Web version personalizes player identity from John to You (web_player_named_you)
    Given the exported web bundle and HTML/JS files in docs/
    When inspecting all actor keys/labels, cues, outcomes, explanations, card summaries, and UI legends in the web build
    Then the controlled player is labeled "YOU" (key "you") with second-person grammar ("You ...", "your ...") and zero occurrences of "John" remain in docs/
    And the desktop Python game files retain "John" / "JOHN" unchanged
```

Negative constraints:
- All 54 `john` and `luke` files, `content.py`, `drawing.py`, `quality.py`, and
  the original Org prefix retain their exact SHA256 hashes.
- Existing Pygame runtime and tests remain untouched and green.
- Zero external npm packages or backend services introduced.

## Coverage expansion contract - 2026-11-07

The user requests checking design and play against the 2016 book and adding
missing material. This supersedes the original first-release size restriction,
not the historical evidence below. Detailed assertions are authored autonomously
under that instruction; no separate approval of this test list was obtained.

Public contents expose 17 skills, 27 strategies, six profile entries, five adult
entries and two introductory entries (57 total). Add a leaf-level manifest and
Book companion menu, linking existing lessons where their actual behavior fits.
Add original tactical contrasts and unscored technique/observation/adult cards
for the remaining index topics. Preserve the original 36 scenes, seven cards,
four sections and Mixed scheduling. No body text was obtained: index-topic
adaptation must never be reported as full chapter/exercise coverage. Heading
practice stays deferred for John's existing profile; its entry explains this.

Setup: use existing Pygame, unittest, quality sensors and cached Pyright. Add
book manifest/content/browser modules and regression tests in this package;
extend existing models/rendering/session only with backward-compatible fields
and optional playlists. No package installation, assets, network at runtime or
commits. Update README, curriculum coverage, source notes and evidence.

Acceptance gates:

- Exactly 57 indexed entries with unique locators and explicit playable-scene,
  activity or deferred destinations; no grouped-tag-only coverage claims.
- Every non-deferred destination exists and is reachable through the new menu;
  heading is visibly deferred rather than silently claimed as a skill drill.
- Distinct original contrasts cover missing offside, throw-ins, patterns,
  off-ball feints, back-line work, crosses, spacing, line breaks and scoring runs.
- Offside is judged at release; level and behind-ball cases differ from a
  premature run. Direct throw-ins do not introduce an offside offence.
- New trajectories, moving teammates/opponents, diagram lines and card motion
  modes validate and render consistently. Physical technique is never scored.
- Original catalog and round scheduling stay unchanged; new lesson rounds
  retain first-attempt scoring, coach comparison and retry behavior.
- Mouse/keyboard, pagination, returning to topics, every new scene/card and
  real SDL smoke work without text overflow. Coverage/quality/types/mutations
  and preserved-game checks run via the existing verification entry point.
- Record unavailable book bodies and diagnostics honestly. A catalog index
  comparison cannot establish that every example inside the book is covered.

Review clarification (2026-11-08): in the ordinary-pass contrast, every accepted
reset keeps M in possession while John moves behind the release reference line.
The direct-throw contrast can release immediately. Regression:
`test_ordinary_pass_waits_while_offside_receiver_resets`.

Approved in conversation on 2026-11-07:
1. Initial design scope approved and delivered on 2026-11-07.
2. Playable implementation scope approved on 2026-11-07 (Q1=A full 36 scenes +
   Mixed Round + 7 Practice Cards; Q2=A John-style streamlined UI/animation on a
   full-field pitch with coach comparison; Q3=A runnable package and full
   verification gauntlet in `soccer_strategy/soccer_smart/`, preserving existing
   John and Luke games unchanged).

## Executable scenarios (Gherkin)

```gherkin
Feature: Soccer Smart Lab tactical decision trainer and practice cards

  Scenario: Context changes decision across 36 authored variants (context_changes_decision)
    Given the 4 sections, 12 topics (T01..T12), and 36 variants (A, B, C) in build_catalog()
    When inspecting each topic's three variants and their visible actor/ball facts
    Then each scene has valid full-field coordinates in [0, 100], unique actor keys including "john", and 3 distinct choices
    And every choice has a specific explanation (<= 24 words) and label (<= 12 words), with at least one rating-2 choice per scene
    And each topic's B and C variants change visible pressure, space, or possession so preferred choices or routes adapt to facts

  Scenario: Actor and ball paths match action intent and contact timing (paths_match_intent)
    Given any authored scene in observe, outcome, coach, or feedback phase
    When positions() is evaluated across animation fractions 0.0 to 1.0
    Then during observe, actors and ball interpolate from approach/ball_from to decision positions
    And during pass or shot outcomes, the ball remains at the decision spot until contact fraction and then moves to ball_end
    And non-moving actors stay at their decision positions without teleporting

  Scenario: Decision screen leaks no answer before selection (decision_has_no_answer_leak)
    Given a running App in the "decide" phase
    When the player hovers over any choice button or views the decision screen
    Then only the hovered choice's gold route preview is drawn and no green coach route, rating label, or shot window guide is shown

  Scenario: Section and mixed rounds schedule 6 practice + 2 held-out transfer scenes (round_has_held_out_variants)
    Given any section (1..4) or mixed mode (5) and any integer seed
    When make_playlist(stage, seed) builds an 8-scene round
    Then the first 6 scenes are distinct non-transfer practice scenes covering the section's topics (or all 4 sections in mixed mode)
    And the last 2 scenes are transformed transfer layouts built from held-out base variants not used in the 6 practice scenes

  Scenario: First attempt is preserved across retries and coach comparisons (retry_preserves_first_attempt)
    Given a Session in the "decide" phase
    When the player selects a risky choice (rating 0), views feedback, triggers coach demo or retry, and then selects a strong choice (rating 2)
    Then session.summary() still counts the first attempt (rating 0) while allowing unlimited retries and coach comparisons
    And invalid inputs (choosing during observe, out-of-range choice index, negative tick time) are rejected cleanly

  Scenario: Practice cards browse and animate unscored demonstrations (practice_cards_unscored)
    Given the App on the main menu
    When the player opens Practice Cards (stage 6) and steps through the 7 technique/adult cards
    Then each card renders its animated demonstration, group locators, and adult practice prompt without overflow or affecting session scores

  Scenario: Full-field UI, keyboard/mouse controls, and headless SDL smoke (real_controls_and_layout)
    Given the Pygame App running with SDL dummy video/audio drivers
    When exercising menu navigation, all 36 scenes, hover previews, feedback overlays, coach demo, retry, summary, practice cards, window scaling, and "--smoke"
    Then Painter records zero text overflow errors across all scenes and cards, and the smoke command exits 0
```

## Negative constraints and preservation

1. `preserve_existing_games`: all 54 tracked source/doc files in
   `soccer_strategy/john/` and `soccer_strategy/luke/` remain byte-identical to
   their baseline hash `5727d1586f543e159fb6f3abb23a1221465f978cd03aaa9968f15ab640d79e70`.
2. `preserve_org_prefix`: the first 33741 bytes of
   `.ai.code.files/task_20261026_soccer_strategy_game.org` remain byte-identical
   to `5422f615b9b12c01d1e53e6310a51cbe5badcc471dbdfd78c440bc576ed862bb`, with
   only the concise implementation result sub-heading appended after line 312.
3. `provenance_is_honest`: all 23 book theme groups (`G01`..`G23`) retain honest
   evidence labels (`INDEX_ONLY` or `OVERVIEW_ONLY`, plus `FULL_TEXT_PENDING`),
   and every authored scene/practice card is labeled `ORIGINAL`.
4. `architecture_boundaries`: domain and session modules (`curriculum.py`,
   `model.py`, `content.py`, `catalog.py`, `session.py`, `presentation.py`) must
   not import `pygame` or network/subprocess modules.
5. `quality_budgets`: English ASCII only, <= 60 lines per function, <= 15
   decisions per function, 100% statement and conditional branch-edge coverage
   across all runtime modules, zero Pyright errors/warnings, and 100% killed
   mutants.

## Setup and reproducible entry point

- Runtime entry point: `python3 -m soccer_strategy.soccer_smart`
- Headless smoke: `PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smart --smoke`
- Full verification gauntlet:
  `PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.soccer_smart.verify`
- No new dependencies or package installations are required.
