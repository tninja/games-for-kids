# Football IQ — Play, Think, Improve

A separate real-time football game, not another Soccer Smart Lab quiz. Play a
short 5v5 match with a fixed blue outfield player; teammates and opponents use
rule-based AI. Blue attacks right. The coach can intervene during the same
match, without changing the simulation rules.

## Play
- Choose defender, midfielder or forward and a 1-, 3- or 5-minute match.
- Phone/tablet: move with the left joystick; use Pass/Call, Shoot/Tackle and
  Sprint with the other hand. Portrait and landscape are supported by layout.
- Keyboard: arrows or WASD, Z to pass/request, X to shoot/tackle, C or Shift to
  sprint, Space to pause. Action buttons display Z, X and C keycaps.
- Coach Off: uninterrupted football. Light: short text feedback. Balanced:
  text, target arrows, up to three automatic teaching pauses, and one optional
  retry per match after an intercepted user pass or conceded goal.
- Retry restores a snapshot from roughly three seconds earlier, including
  score and match clock. It is a retry, not a video replay.

## Development
```sh
npm ci
npm run typecheck:football_iq
npm run build:football_iq
npm run test:football_iq
python3 -m http.server 8000 --directory docs
```
Open http://localhost:8000/football_iq/ . Commit both TypeScript sources and
rebuilt browser modules so GitHub Pages does not need a build server.

The pure engine uses 60 Hz steps and copyable state, with no random generator,
DOM, dependencies or network. The app owns input, snapshots and coaching policy; visual.ts owns rendering. The engine test covers all three positions, deterministic
matches, bounds, snapshot isolation, scoring, passing, tackling and a cover
tip. The visual tests exercise both renderer contracts, atlas bounds, failure
fallback, and read-only rendering with DOM/Phaser mocks.

## Presentation
Phaser 3.90.0 (pinned, loaded from jsDelivr) is the preferred renderer. It
uses a cached original stadium texture, a 720-frame atlas (ten players, eight
directions, idle, four running frames, windup, kick, tackle and receiving poses), depth-sorted sprites, graphics
for coaching hints, possession rings, shadows, dust, ball trails and goal
confetti. Foreground tactical arrows remain readable over sprites. The sprint
animation is faster and kick/tackle poses follow engine state. Quick taps are
latched until the next simulation step, with a joystick dead zone and
possession-aware action labels. The same
art and effects are available in the Canvas 2D fallback if Phaser fails to
load or boot. The header identifies the actual renderer. The CDN is the only
new network request; no game data is sent to it. Sound effects are synthesized
locally via Web Audio and can be muted. No third-party game art is used.
The Phaser API is kept behind a small typed presentation boundary; no engine
or coaching state is owned by Phaser.

## Action timing (60 Hz simulation)
Player and AI share the same action state. Contact is delayed rather than
releasing the ball on button press. During windup the player cannot move
under their own control; recovery allows 20% of normal movement, receiving
allows 30%. A new action cannot start until the current action completes.

| Action | Contact | Recovery | Total |
| --- | --- | --- | --- |
| Pass | 9 ticks (150 ms) | 13 ticks (217 ms) | 22 ticks (367 ms) |
| Shot | 15 ticks (250 ms) | 22 ticks (367 ms) | 37 ticks (617 ms) |
| Tackle | 6 ticks (100 ms) | 27 ticks (450 ms) | 33 ticks (550 ms) |
| Receive | Trap on arrival | 9–25 ticks (150–417 ms) | 9–25 ticks (150–417 ms) |

A pass or shot will not release if possession was lost before contact.
Receiving is vulnerable to tackles; a player in recovery cannot collect a
loose ball to bypass the lock. The recovery bar and poses follow simulation
state, so pause and rewind preserve timing. These are arcade tuning values,
not measured real-world biomechanics. Deliberate one-touch passes are not
implemented yet. Held actions may repeat when recovery is complete.

## Movement and first touch
Both user and AI use the same fixed-step movement integrator. Acceleration
is 380 and braking 540 field units/s²; heading changes by at most 540°/s
(9° per tick). A full 180° turn takes at least a third of a second; inertia
means players may initially keep moving in the old direction. Normal running
accelerates rather than jumping to full speed, and carries reduce target
speed to 76% of the same player's off-ball speed. The ball follows body
heading rather than only horizontal facing. Action locks remain higher
priority than inertia.

First touch depends deterministically on incoming ball speed and whether
the player was already facing the source: soft/front-facing receptions
recover quickly; fast or awkward receptions take longer (9–25 ticks). Hard
touches are indicated in the HUD. Passing or shooting before the body has
turned toward the intended target reduces ball release speed to 65–100%
of normal. These are arcade tuning parameters, not measured human reaction
times. There is no random error, and a difficult touch does not yet spill
the ball loose. Deliberate one-touch passes remain future work.

## Tackling and repeated duels
A successful tackle requires the ball to be within 18 field units and the
carrier within 25 units at contact, not just overlapping player bodies.
The dispossessed player cannot immediately tackle the same carrier again
until they separate by 34 units or the ball leaves that carrier. This is
pair-specific: a different opponent may tackle normally. AI defenders
contain at a 27-unit standoff after losing a challenge, while AI carriers
look for lateral space when their forward route is blocked. These distances
are arcade tuning parameters. Replays preserve the pair-specific state.
Regression tests reproduce the face-to-face loop in both AI/AI and human/AI
matches and check that a fresh challenge and a third-party tackle remain
possible.

## Optional browser verification
```sh
npm install --no-save --package-lock=false playwright@1.56.1 phaser@3.90.0
npx playwright install chromium
node football_iq/browser.test.mjs
```
The test serves the committed page locally and routes the pinned CDN URL to
the installed real Phaser package; it also tests a blocked CDN and touch
input. CI uses Ubuntu 24.04 for the pinned Playwright version and uploads portrait,
landscape and fallback screenshots. It does not
verify the live CDN or replace real iPhone/Safari playtesting.

## Scope and limitations
This is an arcade prototype: the boundary rebounds the ball outside goal
mouths; no throw-ins, corners, offside, fouls, substitutions, or 7v7 yet.
Coaching is heuristic and should be checked against a youth coach before
treating it as authoritative. Gameplay speed, tactical AI and mobile layout
need real-device playtesting. No accounts, backend or runtime LLM. The optional pinned Phaser CDN is a
new presentation dependency; the game does not require it to play. Future work may add 7v7, richer team shape, and animated replay.
