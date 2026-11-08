# Original worked scenarios

Twelve worked A examples for the [curriculum](CURRICULUM.md). All facts,
coordinates, choices, grades and feedback below are ORIGINAL proposals. Each
book connection is INDEX_ONLY / FULL_TEXT_PENDING, as defined in
[SOURCES.md](SOURCES.md). These are not examples taken from the chapter bodies.

## Reading the scene records

Coordinates use the full field in DESIGN.md: attack upward toward (50,0),
defend downward toward (50,100). Blue IDs are named teammates; A/R IDs are
opponents. Only relevant players are listed. Add goalkeeper/context actors
when authoring the final pictures, without hiding a threat used for grading.

The snapshot facts are authored before grades. The labels and quoted cues are
intended child-facing text. Each feedback cell addresses that particular
choice. Grade 2 is strong, 1 reasonable, 0 risky. A safe alternative can remain
reasonable even if another action makes more progress.

Tables show authoring keys, not on-screen button positions; runtime must
shuffle the options. Route endpoints are intended teaching illustrations,
not speed/accuracy guarantees. Passes wait for contact and aim at feet; passes
and shots can fail. A coach continuation is explicitly an illustration.

The B/C lines below summarize the contrast for each topic; all 36 scenes
(`T01.A` through `T12.C`) and 7 practice cards are fully authored with explicit
coordinates, three choices, grades, and feedback in [content.py](content.py)
and validated in [catalog.py](catalog.py).

## T01.A - First touch away from pressure

- Role / groups: left defender; G01, G08, G09.
- Observe: BACK at (45,72) rolls toward John at (40,58). A at (50,55)
  approaches from screen right. Freeze with the ball at (40,57).
- Cue: "A closes from your right. BACK stays behind you."
- Facts: the small left touch toward (34,54) is clear; a right touch toward
  (48,55) approaches A. BACK is facing John in an unobstructed return lane.

| Key | Action | Grade | Intent / illustrated consequence | Feedback |
|---|---|---|---|---|
| A | Touch left, away from A. | 2 | John and ball move to (34,54); the ball stays within a small step | Use the open left space. Keep the touch close and look up again. |
| B | Touch right toward A. | 0 | Ball goes to (48,55); A can challenge the next touch | That touch moves the ball toward A. The first touch can make the next action harder. |
| C | Pass back to BACK's feet. | 1 | Ball travels from John to (45,72); John offers support at (39,60) | A return is available too. Check BACK's next touch and stay ready to help. |

Contrast briefs: B moves A to the left and opens the right touch; C closes
both turns and makes the ready return the strongest available option.

## T02.A - Protect before turning

- Role / groups: central midfielder; G01, G05, G09.
- Observe: BACK at (48,75) passes to John at (48,53). A settles at (48,48),
  on the forward side. John receives facing BACK. Freeze with the ball at (48,54).
- Cue: "A is close behind you. BACK offers support."
- Facts: John is between A and the ball; the forward turn goes toward A.
  The ball remains within playing distance; John is still finding balance
  after the touch. BACK is visible and ready.

| Key | Action | Grade | Intent / illustrated consequence | Feedback |
|---|---|---|---|---|
| A | Protect the ball and look up. | 2 | John stays between (48,54) and A; only a small adjusting step is shown | Keep your body between A and the ball. Look for support without pushing or letting the ball run away. |
| B | Turn forward into A. | 0 | John turns toward (48,48); A is beside the intended next touch | A is close on that side. Turning without checking can expose the ball. |
| C | Pass back to BACK. | 1 | Ball returns to (48,75); John stays available behind the next pass | BACK offers a clear return. Use a controlled pass once you are balanced. |

Contrast briefs: B has A step away so a turn becomes available; C has A
close the holding space while a visible short one-touch return opens.

## T03.A - Turn when there is room

- Role / groups: central midfielder; G09, G13, G14.
- Observe: BACK at (50,72) passes to John at (50,57). A is at (69,44),
  away from the turning route. Freeze with the ball at (50,56).
- Cue: "You have looked ahead. A is far to your right."
- Facts: no opponent is in the next few steps toward (49,48). BACK remains
  ready. There is no teammate waiting at the proposed long-kick destination.

| Key | Action | Grade | Intent / illustrated consequence | Feedback |
|---|---|---|---|---|
| A | Turn and carry into the space ahead. | 2 | John and close ball move toward (49,48) | You have time and space to turn. Take small touches and scan again as the picture changes. |
| B | Return the ball to BACK. | 1 | Ball goes to (50,72); John offers a new angle | Keeping the ball with BACK is reasonable. You also have room to turn and help your team move forward. |
| C | Kick long toward the corner. | 0 | Ball goes toward (8,15), with no guaranteed receiver | A long kick gives either team the next chance. Here you can keep control in the clear space. |

Contrast briefs: B places A in the forward route before the decision;
C closes both side turns but leaves a ready supporting teammate behind.

## T04.A - Carry or pass from the back

- Role / groups: left defender; G02, G13.
- Observe: John has controlled the ball at (28,74); ball at (28,73).
  A is at (45,68), CM at (47,58), A2 at (53,58), BACK at (45,84).
- Cue: "A stays inside. A2 watches CM. BACK faces you."
- Facts: the wide route toward (18,65) is clear. A2 is close enough to
  pressure CM's reception. The backward lane to BACK is open.

| Key | Action | Grade | Intent / illustrated consequence | Feedback |
|---|---|---|---|---|
| A | Carry into the open wide space. | 2 | John and ball move toward (18,65) | Carry away from the inside pressure. Keep checking for a teammate before the next opponent closes. |
| B | Pass inside to CM. | 0 | Ball aims at (47,58), where CM faces pressure from A2 | CM has an opponent nearby. Do not assume an inside pass is safer than the clear dribble. |
| C | Pass back to BACK. | 1 | Ball goes to (45,84); John stays available wide | A clear return can keep possession. Stay available so BACK has another option. |

Contrast briefs: B makes LW visible and ready beyond the wide pressure;
C closes the dribble and forward receivers while BACK remains available.

## T05.A - Find the available receiver

- Role / groups: midfielder; G02, G13.
- Observe: John holds at (48,54), ball at (48,53). LW is at (28,40), CM at
  (49,33), A at (49,43), A2 at (54,33), and BACK at (48,72).
- Cue: "A stands ahead. A2 is beside CM. LW faces you."
- Facts: the diagonal lane to LW is clear. A screens the direct forward
  lane. BACK is ready in a clear lane; the left pass offers progress.

| Key | Action | Grade | Intent / illustrated consequence | Feedback |
|---|---|---|---|---|
| A | Pass left to LW's feet. | 2 | Ball goes to (28,40); John supports from (44,55) | LW is ready through the clear lane. Pass to feet, then help with the next touch. |
| B | Force the straight pass to CM. | 0 | Intended ball path passes close to A before a pressured receiver | A is in that lane and CM is pressured. Look at the route as well as the teammate. |
| C | Return to BACK's feet. | 1 | Ball goes to (48,72) | The return is clear too. Use it if you cannot make the forward pass under control. |

Contrast briefs: B closes the left lane and introduces a ready right receiver;
C closes both front options, making the backward support pass preferable.

## T06.A - Help without the ball

- Role / groups: supporting midfielder; G14, G17.
- Observe: M controls at (45,51), ball at (45,50). John is at (28,56).
  A at (38,54) screens M's current route to John.
- Cue: "M has the ball. A stands between M and you."
- Facts: John can move diagonally to (44,62) without a collision. This
  opens a new receiving angle. A deeper route at (30,70) also offers cover.

| Key | Action | Grade | Intent / illustrated consequence | Feedback |
|---|---|---|---|---|
| A | Move diagonally behind M for a pass. | 2 | John moves to (44,62); the ball stays with M | Give M a clear angle. Face the ball and be ready, even if M chooses another pass. |
| B | Stay directly behind A. | 0 | John stays at (28,56); M's existing lane remains screened | A can still block the route to you. Standing nearby is not always useful support. |
| C | Drop deeper to offer support and cover. | 1 | John moves to (30,70); the ball stays with M | A deeper option can help too. Keep the passing lane open and avoid leaving M without nearby support. |

Contrast briefs: B has another blue player occupy the intended diagonal lane;
C shows A gain possession before the freeze, so recovery replaces support.

## T07.A - Use width with a purpose

- Role / groups: left winger; G09, G13.
- Observe: John controls at (18,44), ball at (18,43). A is at (28,41),
  CM at (45,35), and BACK at (22,63).
- Cue: "A guards the inside route. BACK stays available behind you."
- Facts: the forward wing route toward (18,33) is clear. A screens the
  inside pass. BACK faces John through an unobstructed backward lane.

| Key | Action | Grade | Intent / illustrated consequence | Feedback |
|---|---|---|---|---|
| A | Carry forward down the wing. | 2 | John and close ball move toward (18,33) | Use the free wide space. Look inside again when A changes position. |
| B | Force the inside pass past A. | 0 | Ball aims at CM but crosses A's current screening route | A guards that route. A teammate inside does not mean the pass can reach them. |
| C | Return to BACK and offer a new angle. | 1 | Ball goes to (22,63); John stays available wide | Keeping the ball with support is reasonable. Your next movement can help create another route forward. |

Contrast briefs: B has A move wide and expose the inside pass; C removes
both forward lanes and keeps only the supporting return clear.

## T08.A - Use a triangle to go around pressure

- Role / groups: central midfielder; G08, G17.
- Observe: John controls at (43,57), ball at (43,56). N is at (43,25),
  A at (43,43), and CM at (62,47).
- Cue: "A guards the straight pass. CM faces you on your right."
- Facts: the diagonal to CM is clear. CM and N give a potential second
  passing angle, but their next action is not guaranteed. Space also exists left.

| Key | Action | Grade | Intent / illustrated consequence | Feedback |
|---|---|---|---|---|
| A | Pass to CM and offer a new angle. | 2 | Ball goes to (62,47); John moves toward (48,51) after release | Use the open side of the triangle. Move after passing so your teammate has another option. |
| B | Force the straight pass to N. | 0 | The intended path to (43,25) crosses A | A blocks that direct route. Look for another angle instead of passing through the opponent. |
| C | Carry a few steps left. | 1 | John and ball move toward (34,52) | Moving left can change the angle too. Keep the ball close and look for the next pressure. |

Coach comparison may show CM finding N as one possible continuation, clearly
separate from the selected first pass. Contrast briefs: B has A close the
diagonal; C has a moving teammate create a new return angle during observation.

## T09.A - Use the shooting window

- Role / groups: forward; G06, G19.
- Observe: John controls at (43,17), ball at (43,16). Opposing GK is at
  (53,8), A at (36,22), A2 at (58,24), and RW at (66,18).
- Cue: "The ball is settled. GK covers the right side of goal."
- Facts: the illustrated lane to the left goal window (42,0) is open.
  RW is ready for a square pass. A large touch toward GK invites pressure.

| Key | Action | Grade | Intent / illustrated consequence | Feedback |
|---|---|---|---|---|
| A | Shoot through the left-side space. | 2 | Ball aims at (42,0); the keeper may still react | You have a settled ball and a shooting window. A good choice still does not guarantee a goal. |
| B | Pass across to RW's feet. | 1 | Ball aims at (66,18); John stays available for a return | RW is available too. A controlled pass can create another chance if the shooting window closes. |
| C | Push the ball far toward GK. | 0 | The next touch runs toward (50,9), close to GK | That big touch gives GK a chance to reach the ball. Keep control or use the chance already available. |

Contrast briefs: B has GK cover the window while a ready receiver is free;
C starts with an unsettled ball and makes controlling it the immediate decision.

## T10.A - Delay a controlled dribbler

- Role / groups: defender; G11, G18.
- Observe: A at (30,61) dribbles with the ball at (31,62). John is at
  (35,72), goal-side, with no exposed touch between them.
- Cue: "A runs with the ball close. You are between A and goal."
- Facts: a delaying route toward (32,71) protects the direct lane. A small
  balanced close to (34,69) remains possible. A lunge reaches into control.

| Key | Action | Grade | Intent / illustrated consequence | Feedback |
|---|---|---|---|---|
| A | Stay goal-side and match A's run. | 2 | John tracks toward (32,71), leaving room to turn | Slow the attack and stay balanced. Wait for a touch you can actually reach. |
| B | Close a little and get set. | 1 | John takes a controlled step toward (34,69) | A small controlled approach can help. Keep enough room to react instead of diving in. |
| C | Lunge at the controlled ball. | 0 | John reaches toward (31,62); A may touch around him | A still controls it. A hopeful reach can leave you off balance and open the route to goal. |

Contrast briefs: B gives A an exposed touch that John can reach first;
C shows A release the ball beyond John, requiring recovery toward the new threat.

## T11.A - Cover a pressing teammate

- Role / groups: covering defender; G11, G15.
- Observe: A at (27,52) controls at (27,53). M presses from (30,60).
  John is at (42,74). Runner R at (54,64) is watched by N at (60,76).
- Cue: "M closes A. N watches R. You can help behind M."
- Facts: R's marking is shown rather than assumed. The central support
  route behind M is open. John chasing A would duplicate M and vacate cover.

| Key | Action | Grade | Intent / illustrated consequence | Feedback |
|---|---|---|---|---|
| A | Stay behind M and protect the inside gap. | 2 | John moves to (38,72); A's ball remains under A's control | M presses while you cover. Keep seeing A and R; N's marking may still change. |
| B | Run past M toward A. | 0 | John runs toward (29,57), leaving the central space | Both defenders chasing A leaves the gap behind. Help M without doing the same job. |
| C | Keep a deeper central position. | 1 | John moves toward (47,83) | Deeper cover can protect goal too. Stay connected so the gap behind M does not grow too large. |

Contrast briefs: B shows M beaten with John still able to recover inside;
C has N leave R, making the now-visible unmarked run the priority.

## T12.A - React to a reachable loose pass

- Role / groups: defender; G08, G18.
- Observe: A at (25,61) releases a slow pass. John is at (40,72); freeze
  with the loose ball at (40,68). CM at (60,65) is a possible later outlet.
- Cue: "The loose pass crosses your path. A is farther away."
- Facts: John is four illustration units from the ball and A is much
  farther. No opposing player is already controlling the interception point.

| Key | Action | Grade | Intent / illustrated consequence | Feedback |
|---|---|---|---|---|
| A | Step into the pass and take control. | 2 | John meets the ball at (40,68); a next pass waits for control | Reach the loose pass first. Get control, then look for a teammate. |
| B | Recover closer to goal. | 1 | John moves to (42,82), protecting depth | Recovering is reasonable if you cannot arrive. Here the slow loose pass is within your reach. |
| C | Chase the player who passed. | 0 | John runs toward A while the pass continues beyond him | A has already passed. Chasing the passer lets the live ball travel into space behind you. |

Contrast briefs: B gives the opponent control before the freeze, so the ball
cannot be intercepted; C gives CM possession and asks John to offer support.

## Authoring completion checklist

Before implementing any A example, add explicit paths for every moving actor,
contact/release timing, the selected consequence and coach continuation, then
check their geometry. Before implementing B/C, also write all three choices
and their individual feedback; contrast prose alone is not sufficient content.

Review text length, labels, orientation, visible readiness, line blockers,
grade rationale, frame consistency and the appropriate rule profile. Preserve
base IDs through transfer transforms. These checks are future runtime release
requirements, not claims that this documentation has already tested animation.
