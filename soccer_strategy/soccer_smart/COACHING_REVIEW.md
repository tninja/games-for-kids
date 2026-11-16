# Coaching correctness review

This review corrects the recommendations in all 24 continuous episodes / 197
nodes / 591 choices. The ledger below records every node, not just the opening.
It is checked against the live authored data by the verifier; matching a ledger
alone is not proof of football correctness. Independent regression fixtures and
sampled animated routes enforce the concrete claims discussed here.

## Coaching references and interpretation

- [FIFA: John Peacock, passing and receiving](https://www.fifatrainingcentre.com/en/practice/elite-sessions/in-possession/john-peacock-passing-and-receiving.php): scan for available space, use passing options and avoid congested receiving lanes. Our interpretation allows more than one suitable route in an uncluttered picture.
- [FIFA: progressive zonal defending](https://www.fifatrainingcentre.com/en/practice/talent-coach-programme/zonal-defending/from-principles-to-practice-using-a-progressive-methodology.php): distinguish pressure, cover and balance; protecting central space and delaying can be successful defending without an immediate regain.
- [The FA: intercepting](https://www.thefa.com/bootroom/resources/coaching/the-big-six-intercepting): interception depends on scanning, timing, position and movement. Our scenes require an actual released pass before recommending an interception, rather than guaranteeing a predicted pass.

These are coaching principles, not citations establishing an exact optimal
answer to a synthetic diagram. Distances (2 units sampled clearance, 3.5 for
a shooting corridor, 4 for support, 6 for immediate pressure) are conservative
diagram criteria, not official rules, physical measurements or match guarantees.

## Findings and corrections

| Problem found | Corrected behavior |
| --- | --- |
| A/B/C mechanically preferred carrying, M or N even with another clear option | All unobstructed opening alternatives receive full credit. Layouts change the blocked route, not a mandatory answer order. |
| Held-ball recovery awarded a certain interception | Recovery protects space with the ball still at the opponent's feet. Only already-released, nearby opening passes can be intercepted. |
| Defensive B/C had identical positions despite different coaching cues | C places M close enough to pressure A. Goal-side cover and cover behind M are both valid while A holds possession. |
| Useful stationary support or an unpressured scan always lost credit | Both can receive full credit when the visible lane or space supports them. |
| An off-ball crowding run forced the teammate to pass to an opponent | The poor alternative explicitly hides behind A2's cover shadow. The teammate retains possession; the mistake is unavailable support. |
| Fixed right-corner shots ignored goalkeeper coverage | Compare both goal corners against defenders and goalkeeper; retain a pass if both corridors are blocked. |
| Coaching replaced one fully credited option with a different route | Continuous coach comparison replays the selected good action; risky or partial-credit actions can be compared with a good alternative. |
| Some explanations were identical for different actions | Each choice has an action-specific reason, including M/N identity and the distinction between held and released balls. |

Grades: 0 is the specific illustrated risk, 1 is workable with a visible
limitation, 2 is a supported good choice. Multiple 2s are intentional. A straight
touch into a marker is a poor option here; this does not teach that taking on
a defender or using a feint is universally wrong. Similarly, a screened support
position is poor here; a short give-and-go is not automatically crowding.

Recovery runs move toward goal-side cover by at most eight diagram units per
segment. M closes without being moved onto the ball holder, and runners may
adjust their width. None of this awards possession. New snapshots still match
the previous selected action exactly; ball and actors do not teleport.

## Verification scope

`test_play_coaching.py` supplies concrete counterexamples for alternative credit,
held possession, actual teammate pressure, useful stationary support, scanning,
keeper-dependent corners, blocked shots, animated route clearance and coach
consistency. Existing graph, score/retry, SDL and web tests remain active.

The 65 standalone pictures were additionally screened for straight, fully
credited ground deliveries crossing an opponent or keeper within 1.5 diagram
units; none were flagged. Their existing football/coaching and book-rule tests
are rerun. Their authored data remains unchanged. Lofted and multi-leg routes
are handled by the existing dedicated checks, not misrepresented as straight
ground passes. These checks cannot prove a unique best decision in every match.

## Diversity update - 2026-11-11

Task-specific openings and follow-ups now replace the common carry/M/N recipe.
The catalog has eight opening action sets and 13 good follow-up action sets.
Every changed good second-step action has a distinct third-state exit, while
unchanged waiting can finish a segment. Lofted deliveries are judged by flight
and landing space, and two-leg combinations by both legs and the player's run.
The receiving-player movement assertion was corrected: receiving at an already
useful position is valid; the required invariant is ball contact at the player's
receiving position. The original independent support/scanning/keeper fixtures
remain, with catalog-specific key assertions updated for the new authoring.

See [CONTINUOUS_PLAY.md](CONTINUOUS_PLAY.md) for the task/variant contrasts.

## Every continuous decision node

Possession names the actor at the ball at the decision instant; loose means an
already-released ball. Node identity and choice-key order are stable authoring
identifiers, independent of the shuffled order shown to the child.

| Node | Possession | Grades |
| --- | --- | --- |
| P01.A.root | john | carry=2; left=2; right=0 |
| P01.A.root.carry.next | john | recycle=2; switch=2; scan=2 |
| P01.A.root.carry.next.last.recycle | gk | show=2; drop=2; hide=0 |
| P01.A.root.carry.next.last.switch | n | wide_support=2; back_support=0; holdoutlet=1 |
| P01.A.root.left.next | m | wide_support=2; back_support=0; holdoutlet=1 |
| P01.A.root.left.next.last.wide_support | john | recycle=0; switch=2; scan=2 |
| P01.A.root.right.next | a | recover=2; hold=1; chase=0 |
| P01.A.root.right.next.last.recover | a | recover=2; hold=1; chase=0 |
| P01.B.root | gk | show=2; drop=2; hide=0 |
| P01.B.root.show.next | john | recycle=2; switch=2; scan=2 |
| P01.B.root.show.next.last.recycle | gk | show=2; drop=2; hide=0 |
| P01.B.root.show.next.last.switch | n | wide_support=2; back_support=0; holdoutlet=1 |
| P01.B.root.drop.next | john | recycle=2; switch=2; scan=2 |
| P01.B.root.drop.next.last.recycle | gk | show=2; drop=2; hide=0 |
| P01.B.root.drop.next.last.switch | n | wide_support=2; back_support=2; holdoutlet=1 |
| P01.B.root.hide.next | gk | show=2; drop=2; hide=0 |
| P01.B.root.hide.next.last.show | john | recycle=2; switch=2; scan=2 |
| P01.B.root.hide.next.last.drop | john | recycle=2; switch=2; scan=2 |
| P01.C.root | john | recycle=2; switch=2; rush=0 |
| P01.C.root.recycle.next | gk | show=2; drop=2; hide=0 |
| P01.C.root.recycle.next.last.show | john | recycle=2; switch=2; scan=2 |
| P01.C.root.recycle.next.last.drop | john | recycle=2; switch=2; scan=2 |
| P01.C.root.switch.next | n | wide_support=0; back_support=2; holdoutlet=1 |
| P01.C.root.switch.next.last.back_support | john | recycle=2; switch=2; scan=2 |
| P01.C.root.rush.next | a | recover=2; hold=2; chase=0 |
| P01.C.root.rush.next.last.recover | a | recover=2; hold=2; chase=0 |
| P02.A.root | john | turn=2; layoff=2; shield=2 |
| P02.A.root.turn.next | john | diagonal=0; layoff=2; shield=2 |
| P02.A.root.turn.next.last.layoff | m | bounce=2; decoy=2; crowd=0 |
| P02.A.root.layoff.next | m | bounce=2; decoy=2; crowd=0 |
| P02.A.root.layoff.next.last.bounce | john | diagonal=0; layoff=2; shield=2 |
| P02.A.root.layoff.next.last.decoy | m | bounce=2; decoy=2; crowd=0 |
| P02.A.root.shield.next | john | diagonal=0; layoff=2; shield=2 |
| P02.A.root.shield.next.last.layoff | m | bounce=2; decoy=2; crowd=0 |
| P02.B.root | john | turn=0; layoff=2; shield=2 |
| P02.B.root.turn.next | a | recover=2; hold=2; chase=0 |
| P02.B.root.turn.next.last.recover | a | recover=2; hold=2; chase=0 |
| P02.B.root.layoff.next | m | bounce=2; decoy=2; crowd=0 |
| P02.B.root.layoff.next.last.bounce | john | diagonal=0; layoff=2; shield=2 |
| P02.B.root.layoff.next.last.decoy | m | bounce=2; decoy=2; crowd=0 |
| P02.B.root.shield.next | john | diagonal=2; layoff=2; shield=2 |
| P02.B.root.shield.next.last.diagonal | n | bounce=0; decoy=2; crowd=0 |
| P02.B.root.shield.next.last.layoff | m | bounce=2; decoy=2; crowd=0 |
| P02.C.root | john | turn=2; layoff=2; shield=2 |
| P02.C.root.turn.next | john | diagonal=0; layoff=2; shield=2 |
| P02.C.root.turn.next.last.layoff | m | bounce=2; decoy=2; crowd=0 |
| P02.C.root.layoff.next | m | bounce=2; decoy=2; crowd=0 |
| P02.C.root.layoff.next.last.bounce | john | diagonal=0; layoff=2; shield=2 |
| P02.C.root.layoff.next.last.decoy | m | bounce=2; decoy=2; crowd=0 |
| P02.C.root.shield.next | john | diagonal=0; layoff=2; shield=2 |
| P02.C.root.shield.next.last.layoff | m | bounce=2; decoy=2; crowd=0 |
| P03.A.root | john | recycle=2; clear=2; rush=0 |
| P03.A.root.recycle.next | gk | show=2; drop=2; hide=0 |
| P03.A.root.recycle.next.last.show | john | recycle=2; switch=2; scan=2 |
| P03.A.root.recycle.next.last.drop | john | recycle=2; switch=2; scan=2 |
| P03.A.root.clear.next | n | wide_support=2; back_support=2; holdoutlet=1 |
| P03.A.root.clear.next.last.wide_support | john | recycle=0; switch=2; scan=2 |
| P03.A.root.clear.next.last.back_support | john | recycle=2; switch=2; scan=2 |
| P03.A.root.rush.next | a | recover=2; hold=2; chase=0 |
| P03.A.root.rush.next.last.recover | a | recover=2; hold=2; chase=0 |
| P03.B.root | john | recycle=0; clear=2; rush=0 |
| P03.B.root.recycle.next | a2 | recover=2; hold=1; chase=0 |
| P03.B.root.recycle.next.last.recover | a2 | recover=2; hold=1; chase=0 |
| P03.B.root.clear.next | n | wide_support=2; back_support=2; holdoutlet=1 |
| P03.B.root.clear.next.last.wide_support | john | recycle=0; switch=2; scan=2 |
| P03.B.root.clear.next.last.back_support | john | recycle=0; switch=2; scan=2 |
| P03.B.root.rush.next | a | recover=2; hold=2; chase=0 |
| P03.B.root.rush.next.last.recover | a | recover=2; hold=2; chase=0 |
| P03.C.root | john | recycle=2; clear=2; rush=0 |
| P03.C.root.recycle.next | m | wide_support=0; back_support=2; holdoutlet=1 |
| P03.C.root.recycle.next.last.back_support | john | recycle=2; switch=2; scan=2 |
| P03.C.root.clear.next | n | wide_support=2; back_support=2; holdoutlet=1 |
| P03.C.root.clear.next.last.wide_support | john | recycle=0; switch=2; scan=2 |
| P03.C.root.clear.next.last.back_support | john | recycle=2; switch=2; scan=2 |
| P03.C.root.rush.next | a | recover=2; hold=2; chase=0 |
| P03.C.root.rush.next.last.recover | a | recover=2; hold=2; chase=0 |
| P04.A.root | john | overlap=2; inside=0; widecarry=2 |
| P04.A.root.overlap.next | n | nearpost=0; cutback=2; holdwide=1 |
| P04.A.root.overlap.next.last.cutback | john | cross=0; cutback=2; waitwide=2 |
| P04.A.root.inside.next | a | recover=2; hold=1; chase=0 |
| P04.A.root.inside.next.last.recover | a | recover=2; hold=1; chase=0 |
| P04.A.root.widecarry.next | john | cross=0; cutback=2; waitwide=2 |
| P04.A.root.widecarry.next.last.cutback | n | nearpost=2; cutback=2; holdwide=1 |
| P04.B.root | john | overlap=0; inside=2; widecarry=2 |
| P04.B.root.overlap.next | a2 | recover=2; hold=2; chase=0 |
| P04.B.root.overlap.next.last.recover | a2 | recover=2; hold=2; chase=0 |
| P04.B.root.inside.next | m | nearpost=2; cutback=2; holdwide=1 |
| P04.B.root.inside.next.last.nearpost | john | cross=2; cutback=2; waitwide=2 |
| P04.B.root.inside.next.last.cutback | john | cross=2; cutback=2; waitwide=2 |
| P04.B.root.widecarry.next | john | cross=2; cutback=2; waitwide=2 |
| P04.B.root.widecarry.next.last.cross | m | nearpost=2; cutback=2; holdwide=1 |
| P04.B.root.widecarry.next.last.cutback | n | nearpost=2; cutback=2; holdwide=1 |
| P04.C.root | n | nearpost=0; cutback=2; holdwide=1 |
| P04.C.root.nearpost.next | n | nearpost=0; cutback=2; holdwide=1 |
| P04.C.root.nearpost.next.last.cutback | john | cross=0; cutback=2; waitwide=2 |
| P04.C.root.cutback.next | john | cross=0; cutback=2; waitwide=2 |
| P04.C.root.cutback.next.last.cutback | n | nearpost=0; cutback=2; holdwide=1 |
| P04.C.root.holdwide.next | n | nearpost=0; cutback=2; holdwide=1 |
| P04.C.root.holdwide.next.last.cutback | john | cross=0; cutback=2; waitwide=2 |
| P05.A.root | john | throw_m=2; throw_n=0; wait=1 |
| P05.A.root.throw_m.next | m | return=2; line_run=2; watch=1 |
| P05.A.root.throw_m.next.last.return | john | restart_m=2; restart_n=0; restart_hold=2 |
| P05.A.root.throw_m.next.last.line_run | john | restart_m=2; restart_n=0; restart_hold=2 |
| P05.A.root.throw_n.next | a | recover=2; hold=1; chase=0 |
| P05.A.root.throw_n.next.last.recover | a | recover=2; hold=1; chase=0 |
| P05.A.root.wait.next | john | throw_m=2; throw_n=2; wait=1 |
| P05.A.root.wait.next.last.throw_m | m | return=2; line_run=0; watch=1 |
| P05.A.root.wait.next.last.throw_n | n | return=0; line_run=2; watch=1 |
| P05.B.root | john | throw_m=0; throw_n=2; wait=1 |
| P05.B.root.throw_m.next | a | recover=2; hold=1; chase=0 |
| P05.B.root.throw_m.next.last.recover | a | recover=2; hold=1; chase=0 |
| P05.B.root.throw_n.next | n | return=2; line_run=2; watch=1 |
| P05.B.root.throw_n.next.last.return | john | restart_m=0; restart_n=2; restart_hold=2 |
| P05.B.root.throw_n.next.last.line_run | john | restart_m=0; restart_n=2; restart_hold=2 |
| P05.B.root.wait.next | john | throw_m=2; throw_n=2; wait=1 |
| P05.B.root.wait.next.last.throw_m | m | return=2; line_run=2; watch=1 |
| P05.B.root.wait.next.last.throw_n | n | return=2; line_run=2; watch=1 |
| P05.C.root | john | throw_m=2; throw_n=2; wait=1 |
| P05.C.root.throw_m.next | m | return=2; line_run=2; watch=1 |
| P05.C.root.throw_m.next.last.return | john | restart_m=2; restart_n=0; restart_hold=2 |
| P05.C.root.throw_m.next.last.line_run | john | restart_m=2; restart_n=2; restart_hold=2 |
| P05.C.root.throw_n.next | n | return=0; line_run=2; watch=1 |
| P05.C.root.throw_n.next.last.line_run | john | restart_m=2; restart_n=2; restart_hold=2 |
| P05.C.root.wait.next | john | throw_m=2; throw_n=2; wait=1 |
| P05.C.root.wait.next.last.throw_m | m | return=2; line_run=0; watch=1 |
| P05.C.root.wait.next.last.throw_n | n | return=0; line_run=2; watch=1 |
| P06.A.root | john | set=2; combine=0; square=2 |
| P06.A.root.set.next | john | finish=2; pause=2; force=0 |
| P06.A.root.combine.next | a2 | recover=2; hold=1; chase=0 |
| P06.A.root.combine.next.last.recover | a2 | recover=2; hold=2; chase=0 |
| P06.A.root.square.next | n | nearpost=0; cutback=2; holdwide=1 |
| P06.A.root.square.next.last.cutback | john | outlet=2; pause=2; force=0 |
| P06.B.root | john | set=0; combine=2; square=2 |
| P06.B.root.set.next | a | recover=2; hold=2; chase=0 |
| P06.B.root.set.next.last.recover | a | recover=2; hold=2; chase=0 |
| P06.B.root.combine.next | john | finish=2; pause=1; force=0 |
| P06.B.root.square.next | n | nearpost=2; cutback=2; holdwide=1 |
| P06.B.root.square.next.last.nearpost | john | outlet=2; pause=2; force=0 |
| P06.B.root.square.next.last.cutback | john | outlet=2; pause=2; force=0 |
| P06.C.root | john | set=2; combine=0; square=0 |
| P06.C.root.set.next | john | finish=2; pause=2; force=0 |
| P06.C.root.combine.next | a2 | recover=2; hold=2; chase=0 |
| P06.C.root.combine.next.last.recover | a2 | recover=2; hold=2; chase=0 |
| P06.C.root.square.next | a | recover=2; hold=1; chase=0 |
| P06.C.root.square.next.last.recover | a | recover=2; hold=2; chase=0 |
| P07.A.root | loose | step=2; delay=1; recover=1 |
| P07.A.root.step.next | john | clear=2; short=2; protect=2 |
| P07.A.root.step.next.last.clear | n | leave_box=2; support_clear=2; keep_cover=1 |
| P07.A.root.step.next.last.short | m | leave_box=2; support_clear=2; keep_cover=1 |
| P07.A.root.delay.next | a2 | recover=2; hold=1; chase=0 |
| P07.A.root.delay.next.last.recover | a2 | recover=2; hold=1; chase=0 |
| P07.A.root.recover.next | a2 | recover=2; hold=1; chase=0 |
| P07.A.root.recover.next.last.recover | a2 | recover=2; hold=1; chase=0 |
| P07.B.root | a | step=0; delay=2; recover=2 |
| P07.B.root.step.next | a | track=2; cutback=2; doublepress=0 |
| P07.B.root.step.next.last.track | a | track=2; cutback=2; doublepress=0 |
| P07.B.root.step.next.last.cutback | a | track=2; cutback=2; doublepress=0 |
| P07.B.root.delay.next | a | track=2; cutback=2; doublepress=0 |
| P07.B.root.delay.next.last.track | a | track=2; cutback=2; doublepress=0 |
| P07.B.root.delay.next.last.cutback | a | track=2; cutback=2; doublepress=0 |
| P07.B.root.recover.next | a | track=2; cutback=2; doublepress=0 |
| P07.B.root.recover.next.last.track | a | track=2; cutback=2; doublepress=0 |
| P07.B.root.recover.next.last.cutback | a | track=2; cutback=2; doublepress=0 |
| P07.C.root | a | step=0; delay=2; recover=2 |
| P07.C.root.step.next | a | track=2; cutback=2; doublepress=0 |
| P07.C.root.step.next.last.track | a | track=2; cutback=2; doublepress=0 |
| P07.C.root.step.next.last.cutback | a | track=2; cutback=2; doublepress=0 |
| P07.C.root.delay.next | a | track=2; cutback=2; doublepress=0 |
| P07.C.root.delay.next.last.track | a | track=2; cutback=2; doublepress=0 |
| P07.C.root.delay.next.last.cutback | a | track=2; cutback=2; doublepress=0 |
| P07.C.root.recover.next | a | track=2; cutback=2; doublepress=0 |
| P07.C.root.recover.next.last.track | a | track=2; cutback=2; doublepress=0 |
| P07.C.root.recover.next.last.cutback | a | track=2; cutback=2; doublepress=0 |
| P08.A.root | loose | intercept=2; drop=1; screen=1 |
| P08.A.root.intercept.next | john | counter=2; settle=2; secure=2 |
| P08.A.root.intercept.next.last.counter | n | counter_run=2; third_man=2; holdcounter=1 |
| P08.A.root.intercept.next.last.settle | m | counter_run=2; third_man=2; holdcounter=1 |
| P08.A.root.drop.next | a2 | recover=2; hold=1; chase=0 |
| P08.A.root.drop.next.last.recover | a2 | recover=2; hold=1; chase=0 |
| P08.A.root.screen.next | a2 | recover=2; hold=1; chase=0 |
| P08.A.root.screen.next.last.recover | a2 | recover=2; hold=1; chase=0 |
| P08.B.root | john | counter=2; settle=2; burst=0 |
| P08.B.root.counter.next | n | counter_run=2; third_man=0; holdcounter=1 |
| P08.B.root.counter.next.last.counter_run | john | counter=2; settle=0; secure=2 |
| P08.B.root.settle.next | m | counter_run=0; third_man=2; holdcounter=1 |
| P08.B.root.settle.next.last.third_man | john | counter=0; settle=2; secure=2 |
| P08.B.root.burst.next | a | recover=2; hold=2; chase=0 |
| P08.B.root.burst.next.last.recover | a | recover=2; hold=2; chase=0 |
| P08.C.root | m | counter_run=2; third_man=2; holdcounter=1 |
| P08.C.root.counter_run.next | john | counter=2; settle=2; secure=2 |
| P08.C.root.counter_run.next.last.counter | n | counter_run=2; third_man=0; holdcounter=1 |
| P08.C.root.counter_run.next.last.settle | m | counter_run=2; third_man=2; holdcounter=1 |
| P08.C.root.third_man.next | john | counter=0; settle=2; secure=2 |
| P08.C.root.third_man.next.last.settle | m | counter_run=2; third_man=2; holdcounter=1 |
| P08.C.root.holdcounter.next | m | counter_run=2; third_man=2; holdcounter=1 |
| P08.C.root.holdcounter.next.last.counter_run | john | counter=2; settle=2; secure=2 |
| P08.C.root.holdcounter.next.last.third_man | john | counter=0; settle=2; secure=2 |
