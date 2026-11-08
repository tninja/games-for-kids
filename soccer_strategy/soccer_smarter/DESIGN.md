# Advanced continuation design

## Product boundary

John is the primary player, with defender, midfielder, winger and forward
perspectives. Build on [Soccer Smart Lab](../soccer_smart/README.md); link back to
its basics rather than repeat them. The new learning target is: notice a cue,
choose, observe what changes, and adapt. The [gap audit](GAP_ANALYSIS.md) owns
the scope boundary; [sources](SOURCES.md) owns book evidence.

Proposed standalone menu: Turn and escape (M01), Shape the delivery (M02),
Restart director (M03), Prediction lab (M04), Speed dribble and adapt (M05),
Penalty-box finish (M06), Break the press (M07), and My growth notebook
(X01/X02/X03). Show "Advanced practice" and an optional link to the basics; no
prerequisite lock or compulsory quiz.

## Play loop and feedback

Each tactical mission has a successful path with two decision nodes. Observe an animation, choose one
of three actions without a timer, see the consequence and its explanation,
then continue into a visibly changed state and choose again. The second node
must react to the actual first choice. A turnover or dead end ends that branch
with its explanation and permits retry; it must not teleport into a successful
second-node setup.

Feedback highlights one visible cue and its consequence. Use the existing
0/1/2 meaning: 2 fits this cue, 1 is workable but gives up an advantage, 0
ignores a visible risk. Multiple 2 choices are allowed if defensible. Score
decision quality rather than whether an authored ball happens to score.
Coach comparison and retry remain available. Show first attempts and later
practice separately; prediction correctness does not add tactical points.

Preserve 1/2/3 or click, route hover, Space to finish an animation, C to compare,
R to retry, N to continue and Esc for menu. Reuse familiar full-field art.
Add Pause/step for the new before/after reveal; no reaction-speed reward.
Hover previews show the controlled player's intended route; interceptions can
stop partway along that geometry. Automatic teammate passes do not replace
the player's off-ball movement preview. Text explains good /
workable / rethink in addition to color. Target choice labels at 12 words and
feedback at 24 words, then check actual rendered layout during implementation.

## Episode and scoring contract

Proposed data responsibilities:

| Record | Required information |
| --- | --- |
| Mission | Stable ID, role, provenance, prerequisite links, A/B contrast briefs |
| Node | Stable node ID, visible actor/ball positions, cue, three choices |
| Choice | Stable key, rating, explanation, actor/ball tracks, next node or terminal |
| Track | Linear, piecewise-linear or quadratic curve; control points, duration, contact time |
| Attempt | Run ID, mission/contrast/node IDs, first-choice rating; practice attempts separate |
| Growth entry | Chosen goal, optional helper role, observed evidence, revision; no rating |

Validate unique IDs, finite in-bounds points, positive duration, reachable
nodes, no cycles and valid choice destinations. All outgoing tracks must end
exactly at the next node's initial state. Do not let the animation and state
machine encode different outcomes.

State sequence: menu -> observe -> decide -> outcome -> feedback -> next
node's observe, or episode summary. Coach comparison returns to the same
feedback state. Retry restores the exact selected node and branch snapshot.
An episode replay starts from its root. First ratings are keyed by
(run, mission, contrast, node), recorded once and never overwritten. A node
reached only on retry is marked practice-only. Summary counts only nodes
visited on the initial traversal; unused branches have no penalty or reward.
Leaving the menu starts a fresh run. No disk save is needed in the first slice.

## Motion and realism

M01 needs two visible touch segments and a pause to show the exit cue.
M02 needs an authored quadratic ball route with the same preview and outcome;
straight routes remain straight. Defenders move on authored tracks so John can
observe the second cue in M03/M04. These are deterministic teaching animations,
not physical ball-flight predictions. Do not label schematic curvature as a
verified technical instruction from the book. Close-up footwork instruction
waits for appropriate source and coach review.

Restart scenes explicitly show an authored training setup. They do not teach
competition-specific distances, offside or other regulations. Actual rule
lessons would require a separately sourced rule profile.

## Growth notebook

X01, X02 and X03 are optional and unscored. Store choices only in the current
session; supporters use role labels such as coach or trusted adult, without
names or contact details. Skip and edit remain available. Invite a small
practice goal, a book-featured pro role to watch, an observation and a solo
"Try It" or six-week goal step (keeping aerial heading explicitly coach-led).
Do not give numerical nutrition/sleep targets, grade the child's home
circumstances, or attach tactical stars to participation.

Professional observation can later link an independently verified public clip,
with exact match/time and clear attribution. First implementation uses original
schematics and no network or video dependency. A named player's presence in the
book does not establish which match illustrates which technique.

## Development slices and review gates

1. **One M01 episode:** implement an independent episode model/session and adapt
   existing drawing primitives. Two successful-path nodes plus a terminal risky
   branch prove state continuity, first-attempt scoring, retry and menu exit.
   Acceptance: all branches replay deterministically; old games still pass.
2. **Trajectories and M02:** add piecewise and curved tracks. Test endpoint and
   continuity invariants, invalid coordinates and preview/outcome parity. Show
   both contrast briefs; visually inspect the blocker clearance.
3. **M03/M04:** add authored opponent reactions and prediction reveal. Test
   terminal branches, second-node identities, branch-specific geometry and
   skip/pause; never award for unseen nodes or overwrite initial scores.
4. **X01/X02:** add the session-only notebook. Test skip/edit flows and prove
   that tactical totals remain identical with or without these activities.
5. **Content review:** a coach checks cues/ratings; John playtests readability,
   enjoyment and transfer to a new arrangement. Verify any future book-body
   claims individually. Basic original missions can proceed with overview-only
   provenance, while book-faithful drill claims remain pending.

At implementation time use the existing Pygame/Python stack, meaningful unit
and invariant tests, project-native static/quality checks, SDL smoke and manual
screen inspection. Review shared import boundaries and run the affected existing
game's verification if its code changes. Do not copy its full verifier/app.
This document specifies future tests; [EVIDENCE.md](EVIDENCE.md) reports only
checks actually run for the current design delivery.
