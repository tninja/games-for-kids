# Left Back Lab

An offline soccer decision trainer for John, with **six training sections,
34 topics and 102 base situations**. Watch a play, choose a response and learn why
it fits the picture. The interface and coaching text are in English.

## Play

From the repository root, using the installed Ubuntu Pygame package:

```sh
python3 -m soccer_strategy
```

## Choose a skill

Click a card or press **1-6** on the menu. Topic IDs stay the same across the game,
the Org design and the [case-by-case coaching review](COACHING_REVIEW.md).

| Section | Focus | Topics |
|---|---|---|
| 1 / 1v1 basics | Patience, approach and tackling timing | 01 dribbler; 02 inside cut; 03 heavy touch; 05 touchline run; 06 back-to-goal receiver; 28 stand or slide |
| 2 / Defend shooting | Protect goal against a controlled-ball shooter | 04 shot in the box; 31 shooting space and angles; 32 cover a shot behind M; 33 cut inside and shoot; 34 distance to the shooter |
| 3 / Recover and cover | Get back, watch runners and help teammates | 07 recovery; 08 pass behind; 09 far-side runner; 10 cover a pressing teammate; 11 cover a beaten teammate; 30 pass is intercepted |
| 4 / Read passes and runs | Understand combinations, switches and crosses | 12 two against one; 13 give-and-go; 14 switch of play; 15 stop a cross; 16 cut-back; 17 far post |
| 5 / Use the ball | Rebounds, receiving, passing and long kicks | 18 rebound; 19 losing possession; 20 regaining possession; 21 receive under pressure; 25 keeper throw; 26 loose first touch from keeper; 27 teammate miscontrol; 29 short pass or long kick |
| 6 / Defend restarts | Keep the assigned marking or zone responsibility | 22 sideline restart; 23 corner; 24 free kick |

Start with section 1 or choose the skill John wants to practise. Every topic has
three variants. Topic membership is defined once in `curriculum.py`; content,
menu and session validation use the same definition.

Choose **2 / Defend shooting** for five topics and 15 pictures. Every
picture assumes A still controls the ball and is preparing a shot. Practise
closing shooting space, stepping into a central or near-post shot line,
recovering inside, and protecting an angle while M presses. Several pictures
correctly prefer blocking; the lesson does not depend on A losing control.
Left/right near-post buttons identify the post, and their routes follow that
shot angle. Loose balls, rebounds, tackles and interceptions are in other
sections. The pictures show a stated shot threat, not a guarantee of its result.

Topics 33-34 add left/right cut-ins and a matched distance comparison: close
from a deep position when there is time, hold a useful blocking position as
A starts the kick, or move sideways into the shot line when nearby but off-line.
A stays beside the ball throughout the cut. This teaches balance and position,
not a fixed distance or a rule that closer is always better.

On shooting feedback, **coral dashes** show the stated shot direction and a
**blue ring** marks a point where John can block that line. Gold/green arrows
still show the selected/suggested movement. The blue ring is a block option,
not a claim that blocking is always preferable to closing or recovering.
Guides appear after the choice only and move with transfer layouts.

## A training round

1. Watch the short demonstration, then think for as long as needed.
2. Choose one of three concrete actions. Hover to preview John's intended route.
3. Watch the illustration and read a short explanation.
4. Retry to compare, or continue to the next situation.

Each round has **six distinct practice situations and two held-out new layouts**.
Sections with fewer than six topics use different variants to fill the six
practice slots. Sections with more than six rotate which six topics appear.
Transfer layouts come from variants not used in that round's practice. Section 1
introduces each basic topic in order; other sections mix topics.

Reasonable and preferred actions both count positively. Only the first attempt
counts; retrying does not inflate the result. A five-to-ten-minute round is a
suggested pace, not a timer or experimentally verified duration.

## Controls and picture key

- **Menu:** mouse or keys **1-6**.
- **Decision:** mouse or keys **1-3**. Keys 4-6 do not choose an action.
- **Space:** skip the rest of the observation or outcome animation.
- **R:** retry on feedback. **N:** next situation.
- **Escape** or **Menu:** return to the section chooser. Close the window to quit.
- **JOHN** is you, **M** is a teammate, and **A/R** are opponents. Blue is your
  team, coral is the opposition, and gold is the keeper.
- On feedback, gold shows your route and green shows the suggested route. A
  marked assignment zone can be shown before choosing; answer overlays are not.

The window can be resized. Player and pitch graphics are drawn in Pygame and do
not require external images.

## John's match context and coaching limits

The current profile is 7v7 with a build-out line. Topic 30 adds turnovers after
a teammate pass is cut out; the rest of the open-play pictures focus on decisions
that also occur in 9v9 without assuming a formation or how many nearby players
are available. The parent confirmed sliding is allowed in John's league, and
teammates may not always control a pass cleanly.

- Look for a teammate who is ready and use a controllable short pass. Stay
  available afterward. Topic 27 practises helping after a loose first touch.
  John's decision grade is not changed by a teammate's later mistake.
- Long kicks have a deliberate wide/upfield destination; either team may win
  the next touch. John is an outfield player; these are not goalkeeper punts.
- Keeper clips start opponents beyond the build-out line, then explicitly jump
  to a later first-touch picture with pressure live. They do not declare first
  touch a universal rule for crossing the line; local release triggers vary.
  The line appears only during the opening 7v7 goalkeeper-distribution picture.
- Return passes are to the keeper's feet. Sliding decisions distinguish staying
  up, a standing challenge and a controlled slide into a clear ball route.
  Touching the ball first does not excuse dangerous contact.
- Restart pictures supply John's assignment. The game does not adjudicate a
  universal marking system, offside or wall distances. No choice asks John to
  head the ball. Restart and offside rules still depend on the local competition.

These are scripted teaching pictures and intended routes, not football physics
or guaranteed outcomes. They do not assess physical technique, receiver skill or
real-match improvement. Use John's coach and competition rules when adapting the
examples. See [COACHING_REVIEW.md](COACHING_REVIEW.md) for all pictures and sources.

## Installation alternatives

Python 3.10 or later and a working `import pygame` are required. On Ubuntu:

```sh
sudo apt install python3-pygame
```

Alternatively, use an isolated environment with the community edition:

```sh
python3 -m venv /tmp/soccer-strategy-play
/tmp/soccer-strategy-play/bin/python -m pip install -r soccer_strategy/requirements.txt
/tmp/soccer-strategy-play/bin/python -m soccer_strategy
```

The installed Ubuntu package is sufficient; pip is not needed in that case.
Tested with Python 3.14.4, Pygame 2.6.1 and SDL 2.32.10. The optional community
edition has not been executed here. Ordinary gameplay does not use a network or
save player data.

## Verify and inspect evidence

```sh
python3 -m unittest discover -s soccer_strategy -t . -v
python3 -m soccer_strategy --smoke --screenshot /tmp/left-back-lab.png
python3 -m soccer_strategy.verify
```

The last command removes stale artifacts and runs the soccer suite with statement
and conditional-edge coverage, a shuffled repeat, static types, source hygiene,
dependency and complexity checks, five applied-and-executed mutants and real SDL
execution. It writes fresh results to `.verification/` and fails on a missing or
failed declared gate. Coverage tracing is slower than normal play or plain tests.

The full verifier targets the recorded Python 3.14 toolchain. Pyright is listed
in `requirements-dev.txt`; a local cached installation is also recognized. Its
analyzed-file count and a known-bad assignment are checked. Pyright 1.1.399 uses
Python 3.13 mode while execution uses the actual Python 3.14 interpreter.

Standard-library sensors substitute for unavailable Ruff and coverage.py. They
check syntax, unused imports, ASCII source, whitespace, boundaries, function
budgets, executed statements and conditional opcode edges, with negative controls.
They do not implement Ruff's full rules or canonical formatting. Compiler
annotation machinery and builtin-identity optimization guards are excluded.

The catalog snapshot check uses `case_content.sha256`. It protects all case
facts and feedback except section membership. The baseline was refreshed for
the user's requested answer audit; SPEC.md retains the prior hash and scope.
Update it only for an intentional, authorized coaching-content change.

[EVIDENCE.md](EVIDENCE.md) records current results, source hash and unavailable
editor diagnostics. [EVIDENCE_HISTORY.md](EVIDENCE_HISTORY.md) retains prior runs.
The verifier does not impersonate the editor's MCP service.

## Code layout

- `curriculum.py`: the six canonical sections and topic membership.
- `content.py`: authored pictures, observed facts and coaching explanations.
- `model.py`, `catalog.py`: immutable geometry, validation and action routes.
- `session.py`: playlists, phases, first-attempt scoring and retry behavior.
- `presentation.py`: deterministic animation geometry without Pygame.
- `drawing.py`, `app.py`: measured text, graphics, screens and input.
- `main.py`: launch and headless smoke execution.
- `test_*.py`, `quality.py`, `verify.py`: acceptance tests and evidence gates.
