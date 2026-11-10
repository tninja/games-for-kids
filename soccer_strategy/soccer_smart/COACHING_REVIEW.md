# Coaching correctness review

This review corrects the recommendations in all 24 continuous episodes / 166
nodes / 498 choices. The ledger below records every node, not just the opening.
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

## Every continuous decision node

Possession names the actor at the ball at the decision instant; loose means an
already-released ball. Node identity and choice-key order are stable authoring
identifiers, independent of the shuffled order shown to the child.

| Node | Possession | Grades |
| --- | --- | --- |
| P01.A.root | john | carry=2; left=2; right=0 |
| P01.A.root.carry.next | john | outlet=2; pause=2; force=0 |
| P01.A.root.carry.next.last | m | angle=2; hold=2; screened=0 |
| P01.A.root.left.next | m | angle=2; hold=1; screened=0 |
| P01.A.root.left.next.last | john | outlet=2; pause=1; force=0 |
| P01.A.root.right.next | a | recover=2; hold=1; chase=0 |
| P01.A.root.right.next.last | a | recover=2; hold=1; chase=0 |
| P01.B.root | john | carry=0; left=2; right=2 |
| P01.B.root.carry.next | a | recover=2; hold=2; chase=0 |
| P01.B.root.carry.next.last | a | recover=2; hold=2; chase=0 |
| P01.B.root.left.next | m | angle=2; hold=1; screened=0 |
| P01.B.root.left.next.last | john | outlet=2; pause=1; force=0 |
| P01.B.root.right.next | n | angle=2; hold=1; screened=0 |
| P01.B.root.right.next.last | john | outlet=2; pause=2; force=0 |
| P01.C.root | john | carry=2; left=0; right=2 |
| P01.C.root.carry.next | john | outlet=2; pause=2; force=0 |
| P01.C.root.carry.next.last | n | angle=2; hold=2; screened=0 |
| P01.C.root.left.next | a | recover=2; hold=1; chase=0 |
| P01.C.root.left.next.last | a | recover=2; hold=2; chase=0 |
| P01.C.root.right.next | n | angle=2; hold=2; screened=0 |
| P01.C.root.right.next.last | john | outlet=2; pause=2; force=0 |
| P02.A.root | john | carry=2; left=2; right=0 |
| P02.A.root.carry.next | john | outlet=2; pause=2; force=0 |
| P02.A.root.carry.next.last | m | angle=2; hold=2; screened=0 |
| P02.A.root.left.next | m | angle=2; hold=2; screened=0 |
| P02.A.root.left.next.last | john | outlet=2; pause=2; force=0 |
| P02.A.root.right.next | a | recover=2; hold=1; chase=0 |
| P02.A.root.right.next.last | a | recover=2; hold=2; chase=0 |
| P02.B.root | john | carry=0; left=2; right=2 |
| P02.B.root.carry.next | a | recover=2; hold=2; chase=0 |
| P02.B.root.carry.next.last | a | recover=2; hold=2; chase=0 |
| P02.B.root.left.next | m | angle=2; hold=2; screened=0 |
| P02.B.root.left.next.last | john | outlet=2; pause=1; force=0 |
| P02.B.root.right.next | n | angle=2; hold=2; screened=0 |
| P02.B.root.right.next.last | john | outlet=2; pause=2; force=0 |
| P02.C.root | john | carry=2; left=0; right=2 |
| P02.C.root.carry.next | john | outlet=2; pause=2; force=0 |
| P02.C.root.carry.next.last | n | angle=2; hold=2; screened=0 |
| P02.C.root.left.next | a | recover=2; hold=1; chase=0 |
| P02.C.root.left.next.last | a | recover=2; hold=1; chase=0 |
| P02.C.root.right.next | n | angle=2; hold=2; screened=0 |
| P02.C.root.right.next.last | john | outlet=2; pause=2; force=0 |
| P03.A.root | john | carry=2; left=2; right=0 |
| P03.A.root.carry.next | john | outlet=2; pause=2; force=0 |
| P03.A.root.carry.next.last | m | angle=2; hold=2; screened=0 |
| P03.A.root.left.next | m | angle=2; hold=2; screened=0 |
| P03.A.root.left.next.last | john | outlet=2; pause=2; force=0 |
| P03.A.root.right.next | a | recover=2; hold=1; chase=0 |
| P03.A.root.right.next.last | a | recover=2; hold=2; chase=0 |
| P03.B.root | john | carry=0; left=2; right=2 |
| P03.B.root.carry.next | a | recover=2; hold=2; chase=0 |
| P03.B.root.carry.next.last | a | recover=2; hold=2; chase=0 |
| P03.B.root.left.next | m | angle=2; hold=2; screened=0 |
| P03.B.root.left.next.last | john | outlet=2; pause=2; force=0 |
| P03.B.root.right.next | n | angle=2; hold=1; screened=0 |
| P03.B.root.right.next.last | john | outlet=2; pause=2; force=0 |
| P03.C.root | john | carry=2; left=0; right=2 |
| P03.C.root.carry.next | john | outlet=2; pause=2; force=0 |
| P03.C.root.carry.next.last | n | angle=2; hold=2; screened=0 |
| P03.C.root.left.next | a | recover=2; hold=1; chase=0 |
| P03.C.root.left.next.last | a | recover=2; hold=1; chase=0 |
| P03.C.root.right.next | n | angle=2; hold=2; screened=0 |
| P03.C.root.right.next.last | john | outlet=2; pause=2; force=0 |
| P04.A.root | john | carry=2; left=2; right=0 |
| P04.A.root.carry.next | john | outlet=2; pause=2; force=0 |
| P04.A.root.carry.next.last | n | angle=2; hold=2; screened=0 |
| P04.A.root.left.next | m | angle=2; hold=2; screened=0 |
| P04.A.root.left.next.last | john | outlet=2; pause=2; force=0 |
| P04.A.root.right.next | a | recover=2; hold=1; chase=0 |
| P04.A.root.right.next.last | a | recover=2; hold=2; chase=0 |
| P04.B.root | john | carry=0; left=2; right=2 |
| P04.B.root.carry.next | a | recover=2; hold=2; chase=0 |
| P04.B.root.carry.next.last | a | recover=2; hold=2; chase=0 |
| P04.B.root.left.next | m | angle=2; hold=2; screened=0 |
| P04.B.root.left.next.last | john | outlet=2; pause=2; force=0 |
| P04.B.root.right.next | n | angle=2; hold=2; screened=0 |
| P04.B.root.right.next.last | john | outlet=2; pause=2; force=0 |
| P04.C.root | john | carry=2; left=0; right=2 |
| P04.C.root.carry.next | john | outlet=2; pause=2; force=0 |
| P04.C.root.carry.next.last | n | angle=2; hold=2; screened=0 |
| P04.C.root.left.next | a | recover=2; hold=1; chase=0 |
| P04.C.root.left.next.last | a | recover=2; hold=1; chase=0 |
| P04.C.root.right.next | n | angle=2; hold=2; screened=0 |
| P04.C.root.right.next.last | john | outlet=2; pause=2; force=0 |
| P05.A.root | john | carry=2; left=2; right=0 |
| P05.A.root.carry.next | john | outlet=2; pause=2; force=0 |
| P05.A.root.carry.next.last | m | angle=2; hold=2; screened=0 |
| P05.A.root.left.next | m | angle=2; hold=2; screened=0 |
| P05.A.root.left.next.last | john | outlet=2; pause=2; force=0 |
| P05.A.root.right.next | a | recover=2; hold=1; chase=0 |
| P05.A.root.right.next.last | a | recover=2; hold=1; chase=0 |
| P05.B.root | john | carry=0; left=2; right=2 |
| P05.B.root.carry.next | a | recover=2; hold=1; chase=0 |
| P05.B.root.carry.next.last | a | recover=2; hold=2; chase=0 |
| P05.B.root.left.next | m | angle=2; hold=2; screened=0 |
| P05.B.root.left.next.last | john | outlet=2; pause=2; force=0 |
| P05.B.root.right.next | n | angle=2; hold=2; screened=0 |
| P05.B.root.right.next.last | john | outlet=2; pause=1; force=0 |
| P05.C.root | john | carry=2; left=0; right=2 |
| P05.C.root.carry.next | john | outlet=2; pause=2; force=0 |
| P05.C.root.carry.next.last | n | angle=2; hold=2; screened=0 |
| P05.C.root.left.next | a | recover=2; hold=1; chase=0 |
| P05.C.root.left.next.last | a | recover=2; hold=1; chase=0 |
| P05.C.root.right.next | n | angle=2; hold=2; screened=0 |
| P05.C.root.right.next.last | john | outlet=2; pause=2; force=0 |
| P06.A.root | john | carry=2; left=2; right=0 |
| P06.A.root.carry.next | john | finish=2; pause=2; force=0 |
| P06.A.root.left.next | m | angle=2; hold=1; screened=0 |
| P06.A.root.left.next.last | john | finish=2; pause=2; force=0 |
| P06.A.root.right.next | a | recover=2; hold=1; chase=0 |
| P06.A.root.right.next.last | a | recover=2; hold=1; chase=0 |
| P06.B.root | john | carry=0; left=2; right=2 |
| P06.B.root.carry.next | a | recover=2; hold=2; chase=0 |
| P06.B.root.carry.next.last | a | recover=2; hold=2; chase=0 |
| P06.B.root.left.next | m | angle=2; hold=1; screened=0 |
| P06.B.root.left.next.last | john | finish=2; pause=2; force=0 |
| P06.B.root.right.next | n | angle=2; hold=2; screened=0 |
| P06.B.root.right.next.last | john | finish=2; pause=2; force=0 |
| P06.C.root | john | carry=2; left=0; right=2 |
| P06.C.root.carry.next | john | finish=2; pause=2; force=0 |
| P06.C.root.left.next | a | recover=2; hold=1; chase=0 |
| P06.C.root.left.next.last | a | recover=2; hold=2; chase=0 |
| P06.C.root.right.next | n | angle=2; hold=2; screened=0 |
| P06.C.root.right.next.last | john | finish=2; pause=2; force=0 |
| P07.A.root | loose | step=2; delay=1; recover=1 |
| P07.A.root.step.next | john | outlet=2; pause=2; force=0 |
| P07.A.root.step.next.last | m | angle=2; hold=2; screened=0 |
| P07.A.root.delay.next | a2 | recover=2; hold=1; chase=0 |
| P07.A.root.delay.next.last | a2 | recover=2; hold=1; chase=0 |
| P07.A.root.recover.next | a2 | recover=2; hold=1; chase=0 |
| P07.A.root.recover.next.last | a2 | recover=2; hold=1; chase=0 |
| P07.B.root | a | step=0; delay=2; recover=2 |
| P07.B.root.step.next | a | recover=2; hold=1; chase=0 |
| P07.B.root.step.next.last | a | recover=2; hold=1; chase=0 |
| P07.B.root.delay.next | a | recover=2; hold=1; chase=0 |
| P07.B.root.delay.next.last | a | recover=2; hold=2; chase=0 |
| P07.B.root.recover.next | a | recover=2; hold=1; chase=0 |
| P07.B.root.recover.next.last | a | recover=2; hold=2; chase=0 |
| P07.C.root | a | step=0; delay=2; recover=2 |
| P07.C.root.step.next | a | recover=2; hold=1; chase=0 |
| P07.C.root.step.next.last | a | recover=2; hold=1; chase=0 |
| P07.C.root.delay.next | a | recover=2; hold=1; chase=0 |
| P07.C.root.delay.next.last | a | recover=2; hold=2; chase=0 |
| P07.C.root.recover.next | a | recover=2; hold=1; chase=0 |
| P07.C.root.recover.next.last | a | recover=2; hold=2; chase=0 |
| P08.A.root | loose | step=2; delay=1; recover=1 |
| P08.A.root.step.next | john | outlet=2; pause=2; force=0 |
| P08.A.root.step.next.last | n | angle=2; hold=2; screened=0 |
| P08.A.root.delay.next | a2 | recover=2; hold=1; chase=0 |
| P08.A.root.delay.next.last | a2 | recover=2; hold=1; chase=0 |
| P08.A.root.recover.next | a2 | recover=2; hold=1; chase=0 |
| P08.A.root.recover.next.last | a2 | recover=2; hold=1; chase=0 |
| P08.B.root | a | step=0; delay=2; recover=2 |
| P08.B.root.step.next | a | recover=2; hold=1; chase=0 |
| P08.B.root.step.next.last | a | recover=2; hold=2; chase=0 |
| P08.B.root.delay.next | a | recover=2; hold=2; chase=0 |
| P08.B.root.delay.next.last | a | recover=2; hold=2; chase=0 |
| P08.B.root.recover.next | a | recover=2; hold=2; chase=0 |
| P08.B.root.recover.next.last | a | recover=2; hold=2; chase=0 |
| P08.C.root | a | step=0; delay=2; recover=2 |
| P08.C.root.step.next | a | recover=2; hold=1; chase=0 |
| P08.C.root.step.next.last | a | recover=2; hold=2; chase=0 |
| P08.C.root.delay.next | a | recover=2; hold=2; chase=0 |
| P08.C.root.delay.next.last | a | recover=2; hold=2; chase=0 |
| P08.C.root.recover.next | a | recover=2; hold=2; chase=0 |
| P08.C.root.recover.next.last | a | recover=2; hold=2; chase=0 |
