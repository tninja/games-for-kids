# Continuous Play: design and coaching review

Approved scope: eight tasks, three openings per task, two or three decisions
per traversal, desktop and web. These are 24 ORIGINAL practice episodes with
166 decision nodes and 498 choices, in addition to the existing standalone
catalog. A node count describes authored branch pictures, not 166 unrelated
soccer problems or verified examples from the book.

## Task contrasts

| Task / IDs | Visible situation | Opening contrasts and follow-up |
| --- | --- | --- |
| Keeper outlet / P01.A-C | Receive the keeper's rollout deep in your half; a short outlet and a distant outlet offer different distances | A: N's route is blocked; B: the carrying route is blocked; C: M's route is blocked. All available safe alternatives receive full credit. |
| Midfield receiving / P02.A-C | Receive centrally with a supporting player behind and a forward option | A: turn into the exit; B: use supporting M; C: find N. A2's response demands another scan. |
| Back-field pressure / P03.A-C | A forward touch, a backward outlet and a wider forward pass have different risks | Carry when clear, recycle when blocked, or use the available wide outlet; a lost ball leads to recovery. |
| Wing combination / P04.A-C | M offers an inside angle, N a higher wide option, with a carrying route along the wing | Choose the available route, then support the actual carrier or react to pressure after carrying. |
| Throw-in support / P05.A-C | The throw has reached your feet; M is the thrower on the touchline and N is inside | Decide between carrying infield, returning to M and using N. This starts after receiving; it does not grade throw technique. |
| Chance creation / P06.A-C | The ball is outside the box with a nearer forward outlet and a supporting outlet | Release or drive according to pressure, then find an angle. A clear shooting route can end the sequence after two steps. |
| Defend a cross / P07.A-C | A is wide; a released diagonal ball, a held ball and visible teammate pressure require different responses | A: meet the nearby released cross; B/C: goal-side cover or cover behind M are good options. Recovery alone does not win the ball. |
| Regain and transition / P08.A-C | The same read-the-release principle is applied higher up the field | Read a real pass, avoid committing to a feint, or connect with M. After an interception, select the next outlet instead of stopping at the regain. |

The six on-ball families use different relative teammate and carrying geometry,
not only different titles or translations. In each family, A/B/C changes the
covered route and the available good choices; a unique best answer is not forced. Defensive contrasts change
release/possession and cover responsibilities. Each choice gives a specific
reason; a reasonable alternative receives partial credit rather than being
called universally wrong.

## What links a play

Each node has a normal validated Scenario plus three explicit exits keyed by
choice identity. Shuffling the answer order cannot change an exit. Each
successor's decision state and observation start exactly equal the chosen
outcome's final actor/ball positions. Missing exits, dangling references,
duplicate identities, unreachable nodes, cycles, one-step plays, paths longer
than three decisions, and teleporting transitions fail validation.

All three opening actions continue. Later branches may end at a shot,
turnover or a completed coaching segment. A completed segment does not mean
the match or possession has necessarily ended. Coaching is an illustration
of that selected route, not a guarantee that an opponent will cooperate.
All episodes state their small-sided, no-offside training profile.

Passing to a teammate changes the next task to off-ball support. Losing the
ball changes it to a defensive recovery decision; the opponent retains the ball
while you recover cover. Meeting an already-released pass changes the task
back to using possession. The controlled player stays John/YOU throughout.
Defenders' response positions are part of the preceding action animation.

## Scores and replay

Mixed rounds choose four distinct task families and one of their openings.
Family practice shuffles all three openings; answer order is also shuffled.
Desktop and web share the authored catalog and branch/motion data; their
existing random-number implementations need not produce the same order.

Each visited first-run decision is recorded once. Retry changes the remaining
current episode to practice, including newly visited alternative branches.
It neither replaces an earlier score nor adds a new first-run score. The next
episode starts a new first traversal. The summary denominator counts recorded
decisions only, so unvisited branches carry no penalty. Coach comparison replays
a fully credited selected action or illustrates a good alternative to a risky
one; it never changes the selected successor or scores.

## Verification and limits

- `test_play.py`: 24 openings, contrast/spacing invariants, every reachable
  path, exact transition endpoints, clear recommended deliveries, reachable
  cross interception, selected-action routing, scoring and invalid graphs.
- `test_play_ui.py`: all 166 node layouts and 498 choices in observation,
  decision, outcome, feedback and coach phases; task pages, controls and retry.
- `test_play_web.py` plus `test_play_web.js`: shared data, all branch transitions,
  Node canvas-boundary rendering, mobile text, touch confirmation, practice
  scoring and existing-mode navigation.
- `verify.py`: existing gauntlet extended to 18 runtime/export modules and
  24 scripted mutants, including wrong exits, incorrect coaching and practice-score inflation in
  both runtimes. Known-bad graph/route inputs are rejected by the real code.

See [COACHING_REVIEW.md](COACHING_REVIEW.md) for the subsequent tactical review,
its independent counterexamples, source references and all 166 node grades.

No dependency, remote service, audio asset or new storage format is introduced.
Existing web progress storage is retained. Runtime checks cannot establish
physical skill mastery, universal optimal soccer choices or faithfulness to
unavailable book bodies. Real child playtesting and browser/device testing
remain useful beyond SDL and Node checks.
