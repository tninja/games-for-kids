# Football IQ — Play, Think, Improve

A separate real-time football game, not another Soccer Smart Lab quiz. Play a
short 5v5 match with a fixed blue outfield player; teammates and opponents use
rule-based AI. Blue attacks right. The coach can intervene during the same
match, without changing the simulation rules.

## Play
- Choose defender, midfielder or forward and a 1-, 3- or 5-minute match.
- Phone/tablet: move with the left joystick; use Pass/Call, Shoot/Tackle and
  Sprint with the other hand. Portrait and landscape are supported by layout.
- Keyboard: arrows or WASD, Z to pass/request, X to shoot/tackle, Shift to
  sprint, Space to pause.
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
uses a cached original stadium texture, a 400-frame atlas (ten players, eight
directions, idle plus four running frames), depth-sorted sprites, graphics
for coaching hints, shadows, dust, ball trails and goal confetti. The same
art and effects are available in the Canvas 2D fallback if Phaser fails to
load or boot. The header identifies the actual renderer. The CDN is the only
new network request; no game data is sent to it. Sound effects are synthesized
locally via Web Audio and can be muted. No third-party game art is used.
The Phaser API is kept behind a small typed presentation boundary; no engine
or coaching state is owned by Phaser.

## Scope and limitations
This is an arcade prototype: the boundary rebounds the ball outside goal
mouths; no throw-ins, corners, offside, fouls, substitutions, or 7v7 yet.
Coaching is heuristic and should be checked against a youth coach before
treating it as authoritative. Gameplay speed, tactical AI and mobile layout
need real-device playtesting. No accounts, backend or runtime LLM. The optional pinned Phaser CDN is a
new presentation dependency; the game does not require it to play. Future work may add 7v7, richer team shape, and animated replay.
