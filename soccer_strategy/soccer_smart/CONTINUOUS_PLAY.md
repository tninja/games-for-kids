# Continuous Play: varied match sequences

Current version: 2026-11-11. Eight task families retain three openings each and
two or three decisions per path. The catalog now has 24 original episodes,
197 decision nodes and 591 choices, alongside the existing standalone modes.

The previous content reused two opening recipes and four good follow-up recipes.
The new version has eight different opening recipes (one per family) and 13
useful follow-up recipes. These counts describe different action sets, not just
renamed tasks or mirrored positions. The UI shows the current decision title,
with the task name separately underneath it.

## What changes between tasks

| Task | Different starting situations and linked decisions |
| --- | --- |
| Keeper outlet | Receive a rollout, offer a pass to a keeper still holding the ball, or escape a narrowed short outlet. Recycle, show on the other side or switch toward a distant receiver. |
| Receive in midfield | Pressure comes from behind, blocks the turning exit or closes a shoulder. Turn, lay off or shield; after a layoff, move for the return or open space with a decoy run. |
| Escape back-field pressure | The free outlet may be the keeper, a checking midfielder or a distant forward target. Compare a short release with an actual lofted clearance, then support the receiver. |
| Combine on the wing | The inside lane or overlap may be covered, or N may already have advanced with the ball. Release a moving overlap, carry outside, cross, cut back or time a receiving run. |
| Support a throw-in | You are the thrower on the touchline. Choose the short or forward landing space, or let receiving angles change; then re-enter play and combine inside. Legal overhead delivery is assumed, not physically graded. |
| Create a chance | Compare a setting touch, a two-leg one-two and a square pass. The return run goes around the defender. Read the keeper for the finish or time the return behind the ball. |
| Defend a cross | Meet an already-released cross, retain goal-side cover or cover behind a visibly pressing M. Once secured, choose clearance versus a short outlet; otherwise track the receiver or protect the cutback zone. |
| Regain and transition | Start with a real released pass, a ball already secured by you, or M's completed regain. Decide whether to intercept, release an early counter, settle possession or offer a third-player run. |

Within a task, variants change possession, marker position, receiver movement
or the direction of pressure. They do not all apply the old A=carry, B=left,
C=right pattern. Generic goal-side recovery remains an appropriate fallback
after losing the ball; it is not used for every good continuation.

## Real branches, not the same next question

All opening actions continue. Each fully credited second action that changes
the ball or player positions has its own third-step snapshot. Choosing a
keeper's closer outlet and choosing a wider outlet no longer collapse into the
same next state. Shots and unchanged waiting/holding actions can close a
coaching segment after two decisions instead of repeating an identical question.
Every path remains bounded to two or three decisions.

Exits use choice keys, so shuffled answer order does not change the branch.
Every successor starts at the preceding chosen action's exact actor and ball
endpoints. Cycles, missing exits, unknown nodes and teleports fail validation.
The child continues controlling John (YOU on web), including off-ball runs.

## Coaching constraints retained

Multiple reasonable routes may receive full credit. Useful existing support
and unpressured scanning are recognized. Recovering cover cannot assume a
future pass or invent a regain. An unsuccessful off-ball run does not force the
teammate to lose the ball. Keeper-aware shooting and coach comparison of the
selected good route remain active.

High throws and clearances use real flight height. Landing space is checked,
and animated ground proximity is enforced when the ball is low. One-twos use
two passing legs; both ball lanes and the controlled player's run are checked.
A stationary receiving option can be useful and need not contain a fake run.
The complete [coaching ledger](COACHING_REVIEW.md) is synchronized with all 197
nodes and 591 choices; matching that ledger is not proof of football judgment.

## Rounds and scoring

Family practice shuffles all three openings; mixed rounds select four distinct
tasks. Choices are shuffled. Desktop and web share authored data; their seeded
random-number implementations need not produce the same order.

Only visited first-run decisions count. Retry switches the remaining episode
to practice, including alternative branches, without overwriting or inflating
scores. The next episode starts a new first traversal. Unvisited branches are
not penalized. Existing browser practice history is retained; round scores are
fresh. Press B to return to task selection, Left/Right to page, C to compare,
R to retry and N to continue the selected action.

## Verification and scope

`test_play_diversity.py` rejects repeated family recipes and generic-only
follow-ups, checks distinct transition ownership, legal throw pictures, lofted
clearances, actual two-leg combinations, independent good second-step branches,
controlled-player action ownership, waiting under covered lanes and a one-two
run around the defender. Graph, coaching, SDL and Node tests exercise every
node and choice. The verifier includes 20 runtime/export modules and 28 mutants.

The original 65 single-decision pictures, 31 cards, 57 book-index entries,
existing menus, John/Luke/Smarter games and shared drawing/quality code are
preserved. New episodes are ORIGINAL small-sided no-offside practice, not
verified reproductions of the unseen book. No dependency, service or asset is
added. Real child and browser/device playtesting remains useful beyond the
automated checks. Verification details and limitations are in
[EVIDENCE.md](EVIDENCE.md).
